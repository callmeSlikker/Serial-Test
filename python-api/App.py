from flask import Flask, render_template, request, jsonify
import serial
import serial.tools.list_ports
import binascii
import time
import json
from datetime import datetime

app = Flask(__name__)
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
    print("serialError"+resJson)
    return jsonify(resJson), 400

app = Flask(__name__)

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
    log_messages = []
    #init Response Message
    resJson["errormsg"] = ""
    resJson["Request"] = ""
    resJson["Response"] = ""
    resJson["log"] = []


    try:
        # เปิด serial port
        ser = serial.Serial(port, baudrate, timeout=1)
        log_messages.append(f"{timestamp()} - Connected to {port} at {baudrate} bps")

        resJson["errormsg"] = "succuss"
        # --- ส่ง command ---
        resJson["Request"] = hex_command
        command_bytes = bytes.fromhex(hex_command)
        ser.write(command_bytes)
        log_messages.append(f"{timestamp()} - Sent: {hex_command}")

        # --- อ่าน ACK ---
        ack = ser.read(1)
        if ack:
            hex_ack = binascii.hexlify(ack).decode().upper()
            if ack == b'\x06':
                log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack}")
            else:
                log_messages.append(f"{timestamp()} - Response(ACK): {hex_ack} invalid")
                # print(log_messages)
                return serialError (ser,log_messages,"invalid Message")
                # ser.close()
                # # return jsonify({"logs": log_messages}), 400
        else:
            log_messages.append(f"{timestamp()} - Response(ACK): no ACK (timeout)")
            # print(log_messages)
            return serialError (ser,log_messages,"no ACK (timeout)")
            # ser.close()
            # # return jsonify({"logs": log_messages}), 400

        # --- อ่าน response เต็มจนเจอ 1C03 ---
        response_bytes = bytearray()
        last_data_time = time.time()
        max_wait = 60  # วินาที

        while True:
            chunk = ser.read(1)
            if chunk:
                response_bytes.extend(chunk)
                last_data_time = time.time()
                # หยุดเมื่อเจอ 1C03
                if response_bytes.endswith(b'\x1C\x03'):
                    break
            else:
                if time.time() - last_data_time > max_wait:
                    log_messages.append(f"{timestamp()} - Response timeout")
                    break

        if response_bytes:
            hex_response = binascii.hexlify(response_bytes).decode().upper()
            log_messages.append(f"{timestamp()} - Response: {hex_response}")
        else:
            log_messages.append(f"{timestamp()} - Response: !no data")

        # --- ส่ง ACK กลับไป ---
        ser.write(b'\x06')
        log_messages.append(f"{timestamp()} - ACK sent")

        ser.reset_input_buffer()
        ser.reset_output_buffer()
        ser.close()
        resJson["Response"] = hex_response
        resJson["log"] = log_messages
        print(resJson)
        return jsonify(resJson)
        # return jsonify({"logs": log_messages})

    except Exception as e:
        log_messages.append(f"{timestamp()} - Error: {str(e)}")
        print("error"+str(e))
        resJson["log"] = "".join(log_messages)
        resJson["errormsg"] = str(e)
        # return jsonify({"logs": log_messages}), 400
        return jsonify(resJson)
    

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ports", methods=["GET"])
def list_ports():
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
