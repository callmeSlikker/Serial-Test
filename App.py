from flask import Flask, render_template, request, jsonify
import serial
import serial.tools.list_ports
import binascii
import time
from datetime import datetime

app = Flask(__name__)
ser = None

def timestamp():
    return datetime.now().strftime("%H:%M:%S") 


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/ports", methods=["GET"])
def list_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return jsonify({"ports": ports})


@app.route("/connect", methods=["POST"])
def connect():
    global ser
    data = request.json
    port = data.get("port")
    baudrate = int(data.get("baudrate", 9600))

    try:
        
        if ser and ser.is_open:
            ser.close()

        ser = serial.Serial(port, baudrate, timeout=1)
        return jsonify({"status": f"Connected to {port} at {baudrate} bps"})
    except Exception as e: 
        return jsonify({"error": str(e)}), 400


@app.route("/sendCommand", methods=["POST"])
def sendCommand(): 
    global ser
    if not ser or not ser.is_open:
        return jsonify({"error": "Not connected"}), 400

    data = request.json
    hex_command = data.get("command", "").replace(" ", "")

    log_messages = []
    log_messages.append(f"{timestamp()} - Sent: {hex_command}")

    try:
        command_bytes = bytes.fromhex(hex_command)
        ser.write(command_bytes)

        ack = ser.read(1)
        if ack:
            hex_ack = binascii.hexlify(ack).decode().upper()
            log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack}")
        else:
            log_messages.append(f"{timestamp()} - Response(ACK): !no data")

        ser.timeout = 0.1

        response_bytes = bytearray()
        last_data_time = time.time()
        quiet_time = 0.5 
        max_wait = 60

        while True:
            chunk = ser.read(ser.in_waiting or 1)  # read all data in the buffer
            if chunk:
                response_bytes.extend(chunk)
                last_data_time = time.time()
            else:
                now = time.time()
                if response_bytes.endswith(b'\x03') and (now - last_data_time > quiet_time):
                    break
                if now - last_data_time > max_wait:
                    break

        if response_bytes:
            hex_response = binascii.hexlify(response_bytes).decode().upper()
            log_messages.append(f"{timestamp()} - Response : {hex_response}")
        else:
            log_messages.append(f"{timestamp()} - Response : !no data")

        ser.timeout = 1

        return jsonify({"logs": log_messages})

    except Exception as e: 
        log_messages.append(f"{timestamp()} - Error: {str(e)}")
        return jsonify({"logs": log_messages}), 400



if __name__ == "__main__":
    app.run(debug=True)