from flask import Flask, render_template, request, jsonify
import serial
import serial.tools.list_ports
import binascii
import time
from datetime import datetime

app = Flask(__name__)
ser = None  # global serial object

def timestamp():
    return datetime.now().strftime("%H:%M:%S") 

def serialError(ser, Message):
    ser.reset_input_buffer()
    ser.reset_output_buffer()
    ser.close()
    return jsonify({"logs": [Message]}), 400


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/ports", methods=["GET"])
def list_ports():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return jsonify({"ports": ports})


@app.route("/sendCommand", methods=["POST"])
def sendCommand(): 
    global ser
    data = request.json
    port = data.get("port")
    baudrate = int(data.get("baudrate", 9600))
    hex_command = data.get("command", "").replace(" ", "")
    log_messages = []

    if ser:
        if ser.is_open:
            ser = serial.Serial(port, baudrate, timeout=1)
            log_messages.append(f"{timestamp()} - Connected to {port} at {baudrate} bps")
        else:
            log_messages.append(f"{timestamp()} - Already connected to {ser.port} at {ser.baudrate} bps")
            return jsonify({"logs": log_messages}), 400

    # --- ส่ง command ---
    log_messages.append(f"{timestamp()} - Sent: {hex_command}")

    try:
        command_bytes = bytes.fromhex(hex_command)
        ser.write(command_bytes)

        # อ่าน ACK ตัวแรก
        ack = ser.read(1)
        print(ack)
        if ack :  #check ack not null
            if ack == b'\x06':  #if get ack 06 continue to wait for response
                hex_ack = binascii.hexlify(ack).decode().upper()
                log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack}")
            else: #invalid ack
                hex_ack = binascii.hexlify(ack).decode().upper()
                log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack} {"hex_invalid meaage"}")
                return serialError (ser,{"logs": log_messages})
#return jsonify({"logs": log_messages})
        else: #no ack
            log_messages.append(f"{timestamp()} - Response(ACK): no ACK time out")
            return serialError (ser, log_messages)

        # --- อ่าน response แบบ raw HEX ---
        ser.timeout = 1
        response_bytes = bytearray()
        last_data_time = time.time()
        max_wait = 60

        while True:
            chunk = ser.read(1)
            if chunk:
                response_bytes.extend(chunk)
                last_data_time = time.time()

                # ถ้าเจอ ...1C03 → หยุด
                if response_bytes.endswith(b'\x1C\x03'):
                    break
            else:
                if time.time() - last_data_time > max_wait:
                    break

    #    if response_bytes:
    #         hex_response = binascii.hexlify(response_bytes).decode().upper()

    #         # --- ตรวจสอบว่าเป็น Hypercom หรือไม่ ---
    #         if hex_response.startswith("02") and hex_response.endswith("C103"):
    #             log_messages.insert(0, f"{timestamp()} - Hypercom message detected")
    #         else:
    #             log_messages.insert(0, f"{timestamp()} - This message is not Hypercom")

    #         log_messages.append(f"{timestamp()} - Response : {hex_response}")
    #     else:
    #         log_messages.append(f"{timestamp()} - Response : !no data")

    #     return jsonify({"logs": log_messages})

    except Exception as e: 
        print(e)
        log_messages.insert(0, f"{timestamp()} - This message is not Hypercom")
        log_messages.append(f"{timestamp()} - Error: {str(e)}")
        return jsonify({"logs": log_messages}), 400




if __name__ == "__main__":
    app.run(debug=True)
