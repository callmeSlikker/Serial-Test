import { useState, useEffect, useRef } from "react";

function App() {
  const [ports, setPorts] = useState([]);
  const [baudrates] = useState(["9600", "115200"]);
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedBaudrate, setSelectedBaudrate] = useState("9600");
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const currentController = useRef(null);

  const appendLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  // โหลด port list จาก backend
useEffect(() => {
  async function fetchPorts() {
    try {
      const res = await fetch("http://localhost:4000/ports"); // ต้องเรียกเต็ม URL
      const data = await res.json();
      if (data.ports && data.ports.length > 0) {
        setPorts(data.ports);
        setSelectedPort(data.ports[0]);
      } else {
        setPorts([]);
      }
    } catch (err) {
      appendLog("Error loading ports: " + err.message);
    }
  }

  fetchPorts();
}, []);

  const connect = async () => {
    try {
      const res = await fetch("http://localhost:4000/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: selectedPort, baudrate: selectedBaudrate }),
      });
      const data = await res.json();
      appendLog(data.status || data.error);
    } catch (err) {
      appendLog("Connect error: " + err.message);
    }
  };

  const sendCommand = async () => {
    try {
      const res = await fetch("http://localhost:4000/sendCommand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: selectedPort, baudrate: selectedBaudrate, command }),
      });
      const data = await res.json();
      if (data.logs) data.logs.forEach((line) => appendLog(line));
      else appendLog(data.error);
    } catch (err) {
      appendLog("Send command error: " + err.message);
    }
  };

  const cancelAll = async () => {
    if (currentController.current) {
      currentController.current.abort();
      currentController.current = null;
      appendLog("Fetch canceled (frontend).");
    }
    try {
      await fetch("http://localhost:4000/cancel", { method: "POST" });
      appendLog("Backend operation canceled.");
    } catch (err) {
      appendLog("Cancel request failed: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h1>Serial Web Control</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div>
          <label>COM Port:</label>
          <select value={selectedPort} onChange={(e) => setSelectedPort(e.target.value)}>
            {ports.map((port) => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Baudrate:</label>
          <select value={selectedBaudrate} onChange={(e) => setSelectedBaudrate(e.target.value)}>
            {baudrates.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <p>HEX Command:</p>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. 02030A"
          style={{ width: "100%", height: "80px", padding: "8px", fontSize: "14px" }}
        />
        <div style={{ marginTop: "10px" }}>
          <button onClick={connect}>Connect</button>
          <button onClick={sendCommand} style={{ marginLeft: "10px" }}>Send</button>
          <button onClick={cancelAll} style={{ marginLeft: "10px" }}>Cancel</button>
        </div>
      </div>

      <div>
        <p>Logs:</p>
        <pre
          style={{ width: "100%", height: "200px", backgroundColor: "#f0f0f0", padding: "8px", overflowY: "scroll" }}
        >
          {logs.join("\n")}
        </pre>
      </div>
    </div>
  );
}

export default App;
