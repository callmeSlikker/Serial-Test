import { MsgUtils } from "../utils/MsgUtils";

export default function SendCommandPanel({
  command,
  setCommand,
  selectedPort,
  selectedBaudrate,
  appendLog,
  selectedCommandName,
}) {

  const sendCommand = async (hexCommand) => {
    if (!hexCommand) {
      appendLog({ text: "Please enter a command before sending.", commandName: selectedCommandName });
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
          name: selectedCommandName,
        }),
      });

      const data = await res.json();

      console.log('data', data);

      if (data.log) {
        data.log.split("\n").forEach(line => {
          if (line.trim()) {
            appendLog({ text: line, commandName: selectedCommandName });
          }
        });
      } else {
        appendLog({ text: "No log returned", commandName: selectedCommandName });
      }

    } catch (err) {
      appendLog({ text: "Send command error: " + err.message, commandName: selectedCommandName });
    }
  };

  return (
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
