from flask import Flask, render_template, request, jsonify
import serial
import serial.tools.list_ports
import binascii
import time
from datetime import datetime

app = Flask(__name__) # create a Flask app
ser = None  # create a global variable to store the serial port instance

def timestamp(): # define a function to generate a timestamp
    return datetime.now().strftime("%H:%M:%S") 


@app.route("/") # define a route for the root URL
def index():
    return render_template("index.html")


@app.route("/ports", methods=["GET"])
def list_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()] # list all ports in the system
    return jsonify({"ports": ports}) # send back the list of ports as JSON {"ports": [...]}


@app.route("/connect", methods=["POST"])
def connect():
    global ser # use the global variable ser
    data = request.json # get the JSON data sent by the user
    port = data.get("port") # get the port name from the JSON data
    baudrate = int(data.get("baudrate", 9600)) # get the baudrate from the JSON data

    try:
        
        if ser and ser.is_open:
            ser.close() # close the serial port if it's open

        ser = serial.Serial(port, baudrate, timeout=1) # create a new serial port instance
        return jsonify({"status": f"Connected to {port} at {baudrate} bps"})
    except Exception as e: 
        return jsonify({"error": str(e)}), 400 # return an error message if there's an exception


@app.route("/sendCommand", methods=["POST"])
def sendCommand(): 
    global ser # use the global variable ser
    if not ser or not ser.is_open: # check if the serial port is connected
        return jsonify({"error": "Not connected"}), 400 # return an error message if the serial port is not connected

    data = request.json
    hex_command = data.get("command", "").replace(" ", "") # get the hex command from the JSON data and remove spaces

    log_messages = [] # create an empty list to store the log messages
    log_messages.append(f"{timestamp()} - Sent: {hex_command}") # add the sent message to the log messages list with a timestamp

    try:
        command_bytes = bytes.fromhex(hex_command) # convert the hex command to bytes
        ser.write(command_bytes) # write the bytes to the serial port

        ack = ser.read(1) # read 1 byte from the serial port
        if ack:
            hex_ack = binascii.hexlify(ack).decode().upper() # convert the ACK byte to hex and uppercase
            log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack}") # add the ACK message to the log messages list with a timestamp
        else:
            log_messages.append(f"{timestamp()} - Response(ACK): !no data") # complete the ACK message with "no data" if there's no data

        ser.timeout = 0.1 # set the timeout to 0.1 seconds for the response
        response_bytes = bytearray() # create an buffer to store the response bytes
        while True: # loop until the response is received
            chunk = ser.read(1024) # read 1024 bytes from the serial port
            if chunk:
                response_bytes.extend(chunk)
                if b'\x03' in chunk: 
                    break # if the ETX (0x03) byte is found in the chunk, break the loop
            if len(response_bytes) == 0 and ser.timeout > 61:
                break # if the timeout is greater than 61 seconds, break the loop

        if response_bytes:
            hex_response = binascii.hexlify(response_bytes).decode().upper() # convert the response bytes to hex and uppercase
            log_messages.append(f"{timestamp()} - Response : {hex_response}") # add the response message to the log messages list with a timestamp
        else:
            log_messages.append(f"{timestamp()} - Response : !no data") # complete the response message with "no data" if there's no data

        # reset timeout
        ser.timeout = 1

        return jsonify({"logs": log_messages}) # return the log messages as JSON

    except Exception as e: 
        log_messages.append(f"{timestamp()} - Error: {str(e)}") # add the error message to the log messages list with a timestamp
        return jsonify({"logs": log_messages}), 400 # return the log messages as JSON with a HTTP status code of 400

if __name__ == "__main__": # if the script is run directly
    app.run(debug=True) # run the Flask app in debug mode
