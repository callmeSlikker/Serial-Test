from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import serial
import serial.tools.list_ports
import binascii
import time
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)
ser = None  # global serial object
resString = '{ "errormsg":" ", "Request":" ", "Response":" ", "log":" "}'
resJson = json.loads(resString)

def timestamp():
    return datetime.now().strftime("%H:%M:%S") 

def serialError(ser, Message ,errormsg):
    ser.reset_input_buffer()
    ser.reset_output_buffer()
    ser.close()
    resJson["errormsg"] = errormsg
    resJson["log"] = "".join(Message)
    print(f"serialError: {json.dumps(resJson, indent=2)}")  # ✅ แก้ตรงนี้
    return jsonify(resJson), 400

def current_time():
    return datetime.now().strftime("%H:%M:%S")

# def send_command(port, baudrate, command, timeout=30):
#     log = {}

#     try:
#         ser = serial.Serial(port, baudrate, timeout=timeout)
#         if not ser.is_open:
#             log[current_time()] = {"error": "Connect Error: Cannot open port"}
#             return log
        
#         resJson["Reuqest"] = command
#         # === ส่ง command ===
#         ser.write(command)
#         log[current_time()] = {"command": command.hex().upper()}

#         # === รอ ACK (06h) ภายใน 1 วินาที ===
#         ack = None
#         # start_time = time.time()
#         # while time.time() - start_time < 1:
#         ack_byte = ser.read(1)
#         ack = ack_byte.hex().upper()
#         log[current_time()] = {"ack_recv": ack}
#         if ack_byte == b'\x06':
#             print(ack)  # ถูกต้อง
#         else:  # ไม่ใช่ 06h
#             ser.close()
#             return log

#         if ack is None:
#             log[current_time()] = {"ack_recv": None}
#             ser.close()
#             return log

#         # === รอ response ===
#         ser.timeout = 1
#         response_bytes = bytearray()
#         last_data_time = time.time()
#         max_wait = 60
#         while True:
#             chunk = ser.read(1)
#             if chunk:
#                 response_bytes.extend(chunk)
#                 last_data_time = time.time()

#                 # ถ้าเจอ ...1C03 → หยุด
#                 if response_bytes.endswith(b'\x1C\x03'):
#                     break
#             else:
#                 if time.time() - last_data_time > max_wait:
#                     break

#         if response_bytes:
#             full_response = response_bytes.hex().upper()
#             log[current_time()] = {"response_full": full_response}
#         else:
#             log[current_time()] = {"response_full": None}
        
#         # === ส่ง ACK (06h) กลับ ===
#         ser.write(b'\x06')
#         resJson["Response"] = full_response
#         resJson["log"] = log
#         return jsonify(resJson)
#         # log[current_time()] = {"ack_sent": "06"}

#         # ser.close()
#         # return log

#     except Exception as e:
#         log[current_time()] = {"error": str(e)}
#         return log

@app.route("/sendCommand", methods=["POST"])
def sendCommand():
    global ser
    data = request.json
    port = data.get("port")
    baudrate = int(data.get("baudrate", 9600))
    hex_command = data.get("command", "").replace(" ", "")
    command_name = data.get("name", "UnknownCommand")

    log_messages = []
    resJson["errormsg"] = ""
    resJson["Request"] = ""
    resJson["Response"] = ""
    resJson["log"] = []

    try:
        # --- เปิด serial ---
        ser = serial.Serial(port, baudrate, timeout=3)
        log_messages.append(f"{timestamp()} - Connected to {port} at {baudrate} bps")

        resJson["errormsg"] = "success"
        resJson["Request"] = hex_command
        command_bytes = bytes.fromhex(hex_command)
        ser.write(command_bytes)
        log_messages.append(f"{timestamp()} - Sent: {hex_command}")

        # --- อ่าน ACK หรือ NACK ---
        ack = ser.read(1)
        if not ack:
            return serialError(ser, log_messages, "No ACK/NACK received")

        hex_ack = binascii.hexlify(ack).decode().upper()
        is_nck = False

        if ack == b'\x06':  # ✅ ACK
            log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack} (acknowledgment)")
        elif ack == b'\x15':  # ✅ NACK
            is_nck = True
            log_messages.append(f"{timestamp()} - Response(NACK): {hex_ack} (Negative acknowledgment)")
        else:
            return serialError(ser, log_messages, f"Invalid ACK/NACK: {hex_ack}")

        # --- อ่าน response เต็มจนเจอ 1C03 ---
        response_bytes = bytearray()
        last_data_time = time.time()
        max_wait = 60

        while True:
            chunk = ser.read(1)
            if chunk:
                response_bytes.extend(chunk)
                last_data_time = time.time()
                # EDC มักจบด้วย 1C03
                if response_bytes.endswith(b'\x1C\x03'):
                    break
            elif time.time() - last_data_time > max_wait:
                log_messages.append(f"{timestamp()} - Response timeout")
                break

        if response_bytes:
            hex_response = binascii.hexlify(response_bytes).decode().upper()
            log_messages.append(f"{timestamp()} - Response: {hex_response}")
        else:
            hex_response = ""
            log_messages.append(f"{timestamp()} - Response: (no data)")

        # --- ส่ง ACK กลับไป ---
        # ser.write(b'\x06')
        # log_messages.append(f"{timestamp()} - ACK sent")

        ser.close()

        # ✅ รวมผลลัพธ์ทั้งหมด.
        full_log = f"=== {command_name} ===\n" + "\n".join(log_messages)
        resJson["Response"] = hex_response if not is_nck else f"NACK + {hex_response}"
        resJson["log"] = full_log

        return jsonify(resJson)

    except Exception as e:
        resJson["errormsg"] = str(e)
        resJson["log"] = "\n".join(log_messages)
        return jsonify(resJson)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ports", methods=["GET"])
def list_ports():
    print("fdafasdfsd")
    ports = [port.device for port in serial.tools.list_ports.comports()]
    return jsonify({"ports": ports})


@app.route("/cancel", methods=["POST"])
def cancel_operation():
    global cancel_flag, ser
    cancel_flag = True
    try:
        if ser and ser.is_open:
            ser.close()
        return jsonify({"status": "Canceled"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
