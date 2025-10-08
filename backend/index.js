const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { SerialPort } = require("serialport");

const app = express();
app.use(cors());
app.use(express.json());

// --- Python API ---
app.post("/process", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5000/predict", req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Serial Ports ---
app.get("/ports", async (req, res) => {
  try {
    const portList = await SerialPort.list(); // คืน array ของ port
    // portList ตัวอย่าง: [{ path: 'COM3', manufacturer: 'Arduino' }, ...]
    const ports = portList.map(p => p.path);  // เอา path เช่น COM1, COM3
    res.json({ ports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- Connect Port ---
app.post("/connect", async (req, res) => {
  const { port, baudrate } = req.body;
  // TODO: เปิด serial port จริงถ้าต้องการ
  res.json({ status: `Connecting to ${port} at ${baudrate}` });
});

// --- Send Command ---
app.post("/sendCommand", async (req, res) => {
  const { port, baudrate, command } = req.body;
  try {
    // TODO: ส่ง command จริงไปยัง serial port
    const logs = [
      `Sent command "${command}" to ${port} at ${baudrate}`,
      "Response: OK"
    ];
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Cancel Operation ---
app.post("/cancel", async (req, res) => {
  try {
    // TODO: implement cancellation logic
    res.json({ status: "Operation canceled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start Server ---
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
