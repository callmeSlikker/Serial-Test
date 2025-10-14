import { useState, useEffect} from "react";
import { HypercomMessageHelper } from "./utils/HypercomMessageHelper.js";

function App2() {
  const [ports, setPorts] = useState([]);
  const [baudrates] = useState(["9600", "115200"]);
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedBaudrate, setSelectedBaudrate] = useState("9600");
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const [commands, setCommands] = useState([]);
  const [newCommandName, setNewCommandName] = useState("");
  const [newCommandHex, setNewCommandHex] = useState("");
  const currentController = useRef(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("");
  const [editorWarning, setEditorWarning] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [fields, setFields] = useState([{ id: Date.now(), bit: "", value: "" }]);
  // const logEndRef = useRef(null);



  const appendLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };
  useEffect(() => {
    async function fetchPorts() {
      try {
        const res = await fetch("http://127.0.0.1:5000/ports");
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

  const handleFieldChange = (i, key, val) => {
    const updated = [...fields];
    updated[i] = { ...updated[i], [key]: val };
    setFields(updated);
  };

  // add field
  const handleAddField = () => {
    setFields([...fields, { id: Date.now(), bit: "", value: "" }]);
  };

  // remove field
  const handleRemoveField = (i) => {
    const updated = fields.filter((_, idx) => idx !== i);
    setFields(
      updated.length > 0
        ? updated
        : [{ id: Date.now(), bit: "", value: "" }]
    );
  };

  const handleBuild = () => {
    const msgFields = {};
    fields.forEach((f) => {
      if (f.bit.trim() && f.value.trim()) msgFields[f.bit] = f.value;
    });

    if (Object.keys(msgFields).length === 0) {
      setEditorWarning("! Please enter at least one Bit/Value to build.");
      return;
    }

    const msg = {
      header: "600000000310",
      transactionCode: transactionCode || "00",
      responseCode: "00",
      moreIndicator: "0",
      fields: msgFields,
    };

    const buf = HypercomMessageHelper.build(msg);
    const hexStr =
      buf.toString("hex").toUpperCase().match(/.{1,2}/g)?.join(" ") || "";
    setEditHex(hexStr);
    setCommand(hexStr); // sync ไปช่อง Send
    setEditorWarning("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);

      let importedCommands = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "SEND") {
          const order = lines[i + 1]?.trim(); // ไม่ใช้
          const name = lines[i + 2]?.trim();  // ชื่อ command
          const hex = lines[i + 3]?.trim();   // HEX
          if (name && hex) {
            importedCommands.push({ name, hex });
          }
          i += 5; // ข้าม block SEND
        }
      }
      setCommands((prev) => [...prev, ...importedCommands]);
    };

    reader.readAsText(file);
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

      if (data.responseBytes) {
        // ถ้า backend ส่ง ArrayBuffer / Uint8Array กลับมา
        const hexString = MsgUtils.bytesToHexString(data.responseBytes).toUpperCase();
        appendLog("Response (HEX): " + hexString);
      }

      if (data.log && Array.isArray(data.log)) {
        data.log.forEach((line) => appendLog(line));
      } else {
        appendLog(data.errormsg || "No log returned");
      }
    } catch (err) {
      appendLog("Send command error: " + err.message);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

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

  // const saveCommand = () => {
  //   if (!newCommandName || !newCommandHex) return;
  //   setCommands((prev) => [...prev, { name: newCommandName, hex: newCommandHex }]);
  //   setNewCommandName("");
  //   setNewCommandHex("");
  //   setShowAddModal(false);
  // };

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
        <div style={{ display: "flex", width: "100%", gap: "20px" }}>
          {/* ฝั่งซ้าย */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", width: "50%" }}>
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


            <input type="file" accept=".ptp,.txt" onChange={handleFileUpload} style={{ marginTop: "10px" }} />

            {/* Editor ใช้ร่วมกัน */}
            <div style={{ padding: "10px", border: "none" }}>
              <div>
                <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Edit Commands :</p>
              </div>

              {/* ชื่อ command */}
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>Name :</p>
                <input
                  type="text"
                  placeholder="Sale 56 1.00 Bth"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
                />
              </div>
              {/* เลข command (HEX)*/}
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>HEX Command :</p>
                <input
                  type="text"
                  placeholder="02 00 35 36 30 30 30 ... 15"
                  value={editHex}
                  onChange={(e) => setEditHex(e.target.value)}
                  style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
                />
              </div>
              {/* ✅ Transaction Code Input */}
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>Transaction Code :</p>
                <input
                  type="text"
                  placeholder="20"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
                />
              </div>

              {/* ✅ Dynamic Bit/Value */}
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500" }}>Bit and Value :</p>
                {fields.map((f, i) => (
                  <div key={f.id} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                    <input
                      type="text"
                      placeholder="Bit"
                      value={f.bit}
                      onChange={(e) => handleFieldChange(i, "bit", e.target.value)}
                      style={{ flex: 1, padding: "6px" }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={f.value}
                      onChange={(e) => handleFieldChange(i, "value", e.target.value)}
                      style={{ flex: 3, padding: "6px" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(i)}
                      style={{
                        color: "black",
                        background: "none",
                        border: "none",
                        paddingLeft: "10px",
                        paddingRight: "10px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50px",
                        cursor: "pointer",
                      }}
                    >
                      ⌫
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddField}
                  style={{ marginTop: "5px", padding: "6px 12px", background: "#d4e4f7", borderRadius: "5px", border: "none" }}
                >
                  + Add Field
                </button>
              </div>


              {/* แสดง warning ถ้ามี */}
              {editorWarning && (
                <p style={{ color: "red", margin: "4px 0" }}>{editorWarning}</p>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>

                <button
                  onClick={handleBuild}
                  style={{ flex: 1, padding: "6px", background: "#d4e4f7", border: "none", borderRadius: "5px" }}
                >
                  Build
                </button>
                <button
                  onClick={() => {
                    if (!editName.trim() || !editHex.trim()) {
                      // ถ้ามี warning อยู่แล้ว ไม่ต้อง set ใหม่
                      if (!editorWarning) {
                        setEditorWarning("! Please enter name and HEX command before saving.");
                      }
                      return;
                    }

                    const updated = [...commands];
                    if (editIndex !== null) {
                      // แก้ไข command เดิม
                      updated[editIndex] = { name: editName, hex: editHex };
                    } else {
                      // เพิ่ม command ใหม่
                      updated.push({ name: editName, hex: editHex });
                    }

                    setCommands(updated);// reset editor
                    setEditIndex(null);
                    setEditName("");
                    setEditHex("");
                    setEditorWarning(""); // clear warning
                  }}
                  style={{ flex: 1, padding: "6px", background: "#d4f7d4", border: "none", borderRadius: "5px" }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditIndex(null);
                    setEditName("");
                    setEditHex("");
                    setEditorWarning("");// clear warning
                    setTransactionCode("");
                    handleFieldChange(0, "bit", "");
                    handleFieldChange(0, "value", "");
                  }}
                  style={{ flex: 1, padding: "6px", background: "#f7d4d4", border: "none", borderRadius: "5px" }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", width: "50%" }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Saved Commands:</p>
            </div>
            {/* Saved Commands */}
            {commands.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {commands.map((cmd, idx) => (
                    <button
                      key={idx}
                      style={{
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
                      onClick={() => {
                        setCommand(cmd.hex);
                        setEditIndex(idx);
                        setEditName(cmd.name);
                        setEditHex(cmd.hex);
                      }}
                    >
                      {cmd.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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

            <div style={{ display: "flex", gap: "15px" }}>
              <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>HEX Command:</p>
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="02 00 35 36 30 30 30 30 30 30 30 30 30 31 30 35 36 30 30 30 1C 34 30 00 12 30 30 30 30 30 30 30 30 30 31 30 30 1C 03 15"
                style={{
                  flex: 1,
                  height: "200px",
                  width: "500px",
                  backgroundColor: "#fff",
                  color: "rgba(0, 0, 0, 1)",
                  padding: "8px",
                  overflowY: "scroll",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflowX: "hidden",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Logs:</p>
            <pre
              style={{
                flex: 1,
                height: "200px",
                width: "500px",
                backgroundColor: "#fff",
                color: "rgba(0, 0, 0, 1)",
                padding: "8px",
                overflowY: "scroll",
                borderRadius: "5px",
                border: "1px solid #ccc",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowX: "hidden",
              }}
            >
              {logs.join("\n")}
              <div ref={logEndRef} />
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App2;
