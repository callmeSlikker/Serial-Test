from flask import Flask, render_template, request, jsonify
import serial
import serial.tools.list_ports
import binascii
from datetime import datetime

app = Flask(__name__)
ser = None  # serial port instance

def timestamp():
    return datetime.now().strftime("%H:%M:%S")

@app.route("/")
def index():
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return render_template("index.html", ports=ports)

@app.route("/connect", methods=["POST"])
def connect():
    global ser
    data = request.json
    port = data.get("port")
    baudrate = int(data.get("baudrate", 9600))
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        return jsonify({"status": f"Connected to {port} at {baudrate} bps"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/send", methods=["POST"])
def send():
    global ser
    if not ser or not ser.is_open:
        return jsonify({"error": "Not connected"}), 400

    data = request.json
    hex_command = data.get("command", "").replace(" ", "")

    log_messages = []

    # 1. เวลาส่งคำสั่ง
    log_messages.append(f"{timestamp()} - Sent: {hex_command}")

    try:
        command_bytes = bytes.fromhex(hex_command)
        ser.write(command_bytes)

        # 2. เวลารับ response (ครั้งแรก)
        response = ser.read(1024)
        if response:
            hex_response = binascii.hexlify(response).decode().upper()
            log_messages.append(f"{timestamp()} - Response: {hex_response}")
        else:
            log_messages.append(f"{timestamp()} - Response: <no data>")

        # 3. ส่งกลับทั้งหมด
        return jsonify({"logs": log_messages})
    except Exception as e:
        log_messages.append(f"{timestamp()} - Error: {str(e)}")
        return jsonify({"logs": log_messages}), 400

if __name__ == "__main__":
    app.run(debug=True)
