import { useState, useEffect,useRef  } from "react";
import ConnectionSettings from "../components/ConnectionSettings";
import CommandEditor from "../components/CommandEditor";
import SavedCommands from "../components/SavedCommands";
import SendCommandPanel from "../components/SendCommandPanel";
import LogsPanel from "../components/LogsPanel";


export default function SerialControlPage() {
  const [ports, setPorts] = useState([]);
  const [baudrates] = useState(["9600", "115200"]);
  const [selectedPort, setSelectedPort] = useState("");
  const [selectedBaudrate, setSelectedBaudrate] = useState("9600");
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const [commands, setCommands] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editHex, setEditHex] = useState("");
  const [editorWarning, setEditorWarning] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [fields, setFields] = useState([{ id: Date.now(), bit: "", value: "" }]);
  const logEndRef = useRef(null);
  const appendLog = (msg) => setLogs((prev) => [...prev, msg]);

  // ดึง COM ports
  useEffect(() => {
    async function fetchPorts() {
      try {
        const res = await fetch("http://127.0.0.1:5000/ports");
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

  // scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div style={{ padding: "20px", width: "100vh", height: "100vh", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>Serial Web Control</h2>

      <ConnectionSettings
        ports={ports}
        baudrates={baudrates}
        selectedPort={selectedPort}
        setSelectedPort={setSelectedPort}
        selectedBaudrate={selectedBaudrate}
        setSelectedBaudrate={setSelectedBaudrate}
      />

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: "100%" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <CommandEditor
            commands={commands}
            setCommands={setCommands}
            editName={editName}
            setEditName={setEditName}
            editHex={editHex}
            setEditHex={setEditHex}
            editIndex={editIndex}
            setEditIndex={setEditIndex}
            transactionCode={transactionCode}
            setTransactionCode={setTransactionCode}
            fields={fields}
            setFields={setFields}
            appendLog={appendLog}
            editorWarning={editorWarning}
            setEditorWarning={setEditorWarning}
            setCommand={setCommand}
          />

          <SavedCommands
            commands={commands}
            setEditName={setEditName}
            setEditHex={setEditHex}
            setEditIndex={setEditIndex}
            setCommand={setCommand}
          />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          <SendCommandPanel
            command={command}
            setCommand={setCommand}
            selectedPort={selectedPort}
            selectedBaudrate={selectedBaudrate}
            appendLog={appendLog}
          />

          <LogsPanel logs={logs} logEndRef={logEndRef} />
        </div>
      </div>
    </div>
  );
}


