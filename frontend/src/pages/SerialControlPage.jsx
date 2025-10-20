import { useState, useEffect, useRef } from "react";
import ConnectionSettings from "../components/ConnectionSettings";
import CommandEditor from "../components/CommandEditor";
import SavedCommands from "../components/SavedCommands";
import SendCommandPanel from "../components/SendCommandPanel";
import LogsPanel from "../components/LogsPanel";
import FilesUpload from "../components/FilesUpload";
import ExportCommands from "../components/ExportCommand";

export default function SerialControlPage() {
  const [logs, setLogs] = useState([]);

  const [formCommandEditorValue, setFormCommandEditorValue] = useState({
    ports: [],
    baudrates: [9600, 19200, 38400, 57600, 115200],
    selectedPort: "",
    selectedBaudrate: "9600",
    command:
      "02 00 35 36 30 30 30 30 30 30 30 30 30 31 30 35 36 30 30 30 1C 34 30 00 12 30 30 30 30 30 30 30 30 30 31 30 30 1C 03 15",
    commands: [],
    editIndex: null,
    editName: "Sale 56 1.00 THB",
    editHex:
      "02 00 35 36 30 30 30 30 30 30 30 30 30 31 30 35 36 30 30 30 1C 34 30 00 12 30 30 30 30 30 30 30 30 30 31 30 30 1C 03 15",
    editorWarning: "",
    transactionCode: "56",
    header: "600000000010",
    responseCode: "00",
    moreIndicator: "0",
    fields: [{ id: Date.now(), bit: "40", value: "000000000100" }],
  });

  const logEndRef = useRef(null);

  const appendLog = (msg) => setLogs((prev) => {
    const findIndex = prev.findIndex((l) => l.commandName === msg.commandName);

    if (findIndex !== -1) {
      // Update the existing log by appending new text
      const updated = [...prev];
      updated[findIndex] = {
        ...updated[findIndex],
        text: `${updated[findIndex].text}\n\n${msg.text}` // append new text
      };
      return updated;
    }

    // If not found, just add the new log
    return [...prev, msg];
  });

  // helper to update formCommandEditorValue easily
  const updateForm = (key, value) => {
    setFormCommandEditorValue((prev) => ({ ...prev, [key]: value }));
  };

  console.log("logs", logs)

  // fetch COM ports
  useEffect(() => {
    async function fetchPorts() {
      try {
        const res = await fetch("http://127.0.0.1:5000/ports");
        const data = await res.json();
        if (data.ports && data.ports.length > 0) {
          updateForm("ports", data.ports);
          updateForm("selectedPort", data.ports[0]);
        }
      } catch (err) {
        appendLog({ text: "Error loading ports: " + err.message });
      }
    }
    fetchPorts();
  }, []);

  console.log('logs', logs)

  // auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const {
    ports,
    baudrates,
    selectedPort,
    selectedBaudrate,
    commands,
    command,
    editIndex,
    editName,
  } = formCommandEditorValue;

  // delete command by index
  const handleDeleteCommand = (index) => {
    setFormCommandEditorValue((prev) => ({
      ...prev,
      commands: prev.commands.filter((_, i) => i !== index),
      editIndex: null,
      editName: "",
      editHex: "",
      editorWarning: "",
      fields: [{ id: Date.now(), bit: "", value: "" }], onDeleteCommand,
    }));
  };

  console.log("editIndex", editIndex, commands)

  return (
    <div>
      <div
        style={{
          padding: "20px",
          width: "100vw",
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}
        >
          Serial Web Control
        </h2>

        {/* Connection Settings */}
        <ConnectionSettings
          ports={ports}
          baudrates={baudrates}
          selectedPort={selectedPort}
          setSelectedPort={(val) => updateForm("selectedPort", val)}
          selectedBaudrate={selectedBaudrate}
          setSelectedBaudrate={(val) => updateForm("selectedBaudrate", val)}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            width: "100%",
          }}
        >
          {/* Left side: Command Editor + Saved Commands */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              width: "30%",
            }}
          >
            {/* Command Editor */}
            <div style={{ width: "65%" }}>
              <CommandEditor
                formCommandEditorValue={formCommandEditorValue}
                setFormCommandEditorValue={setFormCommandEditorValue}
                onDeleteCommand={handleDeleteCommand}
              />
            </div>

            {/* File Upload + Saved Commands */}
            <div style={{ width: "35%" }}>
              <FilesUpload
                setCommands={(cmds) => updateForm("commands", cmds)}
              />
              <ExportCommands commands={commands} />
              <SavedCommands
                commands={commands}
                setEditName={(val) => updateForm("editName", val)}
                setEditHex={(val) => updateForm("editHex", val)}
                setEditIndex={(val) => updateForm("editIndex", val)}
                setCommand={(val) => updateForm("command", val)}
              />
            </div>
          </div>

          {/* Right side: Send Command + Logs */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: "70%",
            }}
          >
            {/* Send Command Panel */}
            <div style={{ height: "15%" }}>
              <SendCommandPanel
                command={command}
                setCommand={(val) => updateForm("command", val)}
                selectedPort={selectedPort}
                selectedBaudrate={selectedBaudrate}
                appendLog={appendLog}
                selectedCommandName={editIndex ? commands[editIndex]?.name || "" : editName}
              />
            </div>
            <div style={{ height: "85%" }}>
              <LogsPanel logs={logs} setLogs={setLogs} logEndRef={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
