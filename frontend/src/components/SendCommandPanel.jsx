import { MsgUtils } from "../utils/MsgUtils";

export default function SendCommandPanel({
  command,
  setCommand,
  selectedPort,
  selectedBaudrate,
  appendLog,
  selectedCommands,
  setSelectedCommands,
}) {

  const sendCommand = async (hexCommand, commandName) => {
    if (!hexCommand) {
      appendLog({ text: "Please enter a command before sending.", commandName: commandName });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/sendCommand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          port: selectedPort,
          baudrate: parseInt(selectedBaudrate),
          command: hexCommand,
          name: commandName,
        }),
      });

      const data = await res.json();

      if (data.log) {
        data.log.split("\n").forEach(line => {
          if (line.trim()) {
            appendLog({ text: line, commandName: commandName });
          }
        });
      } else {
        appendLog({ text: "No log returned", commandName: commandName });
      }

    } catch (err) {
      appendLog({ text: "Send command error: " + err.message, commandName: commandName });
    }
  };

  const sendMultipleCommands = async () => {
    if (selectedCommands.length === 0) {
      appendLog({ text: "Please select commands before sending.", commandName: "Multiple Commands" });
      return;
    }

    appendLog({ text: `Sending ${selectedCommands.length} command(s)...`, commandName: "Multiple Commands" });

    for (const selectedCmd of selectedCommands) {
      await sendCommand(selectedCmd.hex, selectedCmd.name);
      // Add a small delay between commands to prevent overwhelming the serial port
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clear selected commands after sending
    setSelectedCommands([]);
  };

  return (
    <div>
      <button
        onClick={() => selectedCommands.length > 0 ? sendMultipleCommands() : null}
        disabled={selectedCommands.length === 0}
        style={{
          padding: "6px 12px",
          fontSize: "14px",
          fontWeight: "800",
          borderRadius: "5px",
          cursor: selectedCommands.length > 0 ? "pointer" : "not-allowed",
          marginBottom: "10px",
          backgroundColor: selectedCommands.length > 0 ? "#4CAF50" : "#cccccc",
          border: "none",
          opacity: selectedCommands.length > 0 ? 1 : 0.6,
        }}
      >
        Send Command{selectedCommands.length > 0 ? ` (${selectedCommands.length})` : " - Select commands first"}
      </button>

      <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>HEX Command:</p>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="02 00 35 36 30 30 30 30 30 30 30 30 30 31 30 35 36 30 30 30 1C 34 30 00 12 30 30 30 30 30 30 30 30 30 31 30 30 1C 03 15"
          style={{
            height: "100%",
            width: "100%",
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
  );
}
