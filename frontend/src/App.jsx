import { useState, useEffect, useRef } from "react";

function App() {
  const [ports, setPorts] = useState([]);
  const [baudrates] = useState(["9600", "115200"]);
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedBaudrate, setSelectedBaudrate] = useState("9600");
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const [commands, setCommands] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCommandName, setNewCommandName] = useState("");
  const [newCommandHex, setNewCommandHex] = useState("");
  const currentController = useRef(null);

  const appendLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    async function fetchPorts() {
      try {
        const res = await fetch("http://localhost:4000/ports");
        console.log("resadsfasdf", res)
        const data = await res.json();
        if (data.ports && data.ports.length > 0) {
          setPorts(data.ports);
          setSelectedPort(data.ports[0]);
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

  const sendCommand = async (hexCommand) => {
    const cmdToSend = hexCommand;
    if (!cmdToSend) {
      appendLog("Please enter a command before sending.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/sendCommand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          port: selectedPort,
          baudrate: parseInt(selectedBaudrate),
          command: cmdToSend
        }),
      });

      const data = await res.json();
      if (data.log && Array.isArray(data.log)) {
        data.log.forEach((line) => appendLog(line));
      } else {
        appendLog(data.errormsg || "No log returned");
      }
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

  const saveCommand = () => {
    if (!newCommandName || !newCommandHex) return;
    setCommands((prev) => [...prev, { name: newCommandName, hex: newCommandHex }]);
    setNewCommandName("");
    setNewCommandHex("");
    setShowAddModal(false);
  };

  console.log("commandsasdf", commands)

  return (
    <div style={{ padding: "20px", width: "100vh", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>
        <p>Serial Web Control</p>
      </div>

      {/* COM Port & Baudrate */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>COM Port :</p>
          <select
            style={{ width: "120px", height: "32px", borderRadius: "5px", fontSize: "14px" }}
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
          >
            {ports.map((port) => (
              <option key={port} value={port}>{port}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Baudrate:</p>
          <select
            style={{ width: "120px", height: "32px", borderRadius: "5px", fontSize: "14px" }}
            value={selectedBaudrate}
            onChange={(e) => setSelectedBaudrate(e.target.value)}
          >
            {baudrates.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: "100%" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "40%" }}>
          <button onClick={cancelAll}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              fontWeight: "800",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: "#bcddff",
              border: "none",
            }}>Cancel</button>

          <button onClick={() => setShowAddModal(true)}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              fontWeight: "800",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: "#bcddff",
              border: "none",
            }}
          >Add Command</button>

          {showAddModal && (
            <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
              <input
                type="text"
                placeholder="Command Name"
                value={newCommandName}
                onChange={(e) => setNewCommandName(e.target.value)}
                style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
              />
              <input
                type="text"
                placeholder="HEX Command"
                value={newCommandHex}
                onChange={(e) => setNewCommandHex(e.target.value)}
                style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={saveCommand} style={{ flex: 1, padding: "6px", background: "#d4f7d4", border: "none", borderRadius: "5px" }}>Save</button>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "6px", background: "#f7d4d4", border: "none", borderRadius: "5px" }}>Cancel</button>
              </div>
            </div>
          )}

          {commands.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <p>Saved Commands:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {commands.map((cmd, idx) => (
                  <button style={{
                    padding: "10px 12px",
                    fontSize: "16px",
                    fontWeight: "400",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "#ffe869",
                    border: "1px solid #000",
                    width: "100%",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                    key={idx} onClick={() => sendCommand(cmd.hex)}>
                    {cmd.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: "0 0 60%", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <button
              onClick={() => sendCommand(command)}
              style={{
                padding: "6px 12px",
                fontSize: "14px",
                fontWeight: "800",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "10px",
                backgroundColor: "#bcddff",
                border: "none",
              }}
            >
              Send Command
            </button>

            <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
              <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>HEX Command:</p>
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g. 02030A"
                style={{ flex: 1, height: "80px", padding: "8px", fontSize: "14px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
            <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Logs:</p>
            <pre
              style={{
                flex: 1,
                height: "200px",
                backgroundColor: "#fff",
                color: "rgba(0, 0, 0, 1)",
                padding: "8px",
                overflowY: "scroll",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              {logs.join("\n")}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
