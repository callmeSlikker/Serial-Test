const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { setTimeout } = require("timers/promises");

const app = express();
app.use(cors());
app.use(express.json());

let ser = null; // global serial object

// --- Serial Ports ---
app.get("/ports", async (req, res) => {
  try {
    const portList = await SerialPort.list();
    console.log("portListasdf", portList)
    const ports = portList.map(p => p.path);
    res.json({ ports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Connect Port ---
app.post("/connect", async (req, res) => {
  const { port, baudrate } = req.body;
  try {
    ser = new SerialPort({ path: port, baudRate: baudrate });
    res.json({ status: `Connected to ${port} at ${baudrate}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Send Command (Python style) ---
app.post("/sendCommand", async (req, res) => {
  const { port, baudrate, command } = req.body;
  let logs = [];
  let hex_response = "";

  try {
    // เปิด serial port
    ser = new SerialPort({ path: port, baudRate: baudrate, autoOpen: false });
    await new Promise((resolve, reject) => ser.open(err => err ? reject(err) : resolve()));
    logs.push(`${new Date().toLocaleTimeString()} - Connected to ${port} at ${baudrate} bps`);

    logs.push(`${new Date().toLocaleTimeString()} - Sending: ${command}`);
    const command_bytes = Buffer.from(command.replace(/ /g,''), "hex");
    await new Promise((resolve, reject) => ser.write(command_bytes, err => err ? reject(err) : resolve()));

    // อ่าน ACK
    const ack = await new Promise((resolve) => {
      ser.read(1, (err, data) => resolve(data));
      setTimeout(1000).then(() => resolve(null)); // timeout 1s
    });

    if (ack) {
      const hex_ack = ack.toString("hex").toUpperCase();
      if (ack[0] === 0x06) logs.push(`${new Date().toLocaleTimeString()} - Response(ACK): ${hex_ack}`);
      else {
        logs.push(`${new Date().toLocaleTimeString()} - Response(ACK): ${hex_ack} invalid`);
        ser.close();
        return res.status(400).json({ errormsg: "invalid Message", log: logs });
      }
    } else {
      logs.push(`${new Date().toLocaleTimeString()} - Response(ACK): no ACK (timeout)`);
      ser.close();
      return res.status(400).json({ errormsg: "no ACK (timeout)", log: logs });
    }

    // อ่าน response จนเจอ 1C03
    const response_bytes = [];
    let lastDataTime = Date.now();
    const maxWait = 60000; // 60s
    while (true) {
      const chunk = await new Promise(resolve => ser.read(1, (err, data) => resolve(data)));
      if (chunk) {
        response_bytes.push(chunk);
        lastDataTime = Date.now();
        const buf = Buffer.concat(response_bytes);
        if (buf.slice(-2).equals(Buffer.from([0x1C,0x03]))) break;
      }
      if (Date.now() - lastDataTime > maxWait) {
        logs.push(`${new Date().toLocaleTimeString()} - Response timeout`);
        break;
      }
      await setTimeout(10); // ป้องกัน loop ตัน
    }

    if (response_bytes.length > 0) {
      hex_response = Buffer.concat(response_bytes).toString("hex").toUpperCase();
      logs.push(`${new Date().toLocaleTimeString()} - Response: ${hex_response}`);
    } else {
      logs.push(`${new Date().toLocaleTimeString()} - Response: !no data`);
    }

    // ส่ง ACK กลับ
    await new Promise((resolve, reject) => ser.write(Buffer.from([0x06]), err => err ? reject(err) : resolve()));
    logs.push(`${new Date().toLocaleTimeString()} - ACK sent`);

    ser.close();
    res.json({ errormsg: "success", Request: command, Response: hex_response, log: logs });

  } catch (err) {
    if (ser && ser.isOpen) ser.close();
    logs.push(`${new Date().toLocaleTimeString()} - Error: ${err.message}`);
    res.status(500).json({ errormsg: err.message, log: logs });
  }
});

// --- Cancel Operation ---
app.post("/cancel", async (req, res) => {
  try {
    if (ser && ser.isOpen) ser.close();
    res.json({ status: "Canceled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
