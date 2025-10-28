import { useState } from "react";
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
  const [loopCount, setLoopCount] = useState(1);
  const sendCommand = async (hexCommand, commandName, loopIteration = null) => {
    if (!hexCommand) {
      appendLog({
        text: "Please enter a command before sending.",
        commandName: commandName,
      });
      return;
    }

    try {
      const displayName =
        loopIteration !== null
          ? `${commandName} (Loop ${loopIteration})`
          : commandName;
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
        data.log.split("\n").forEach((line) => {
          if (line.trim()) {
            appendLog({ text: line, commandName: displayName });
          }
        });
      } else {
        appendLog({ text: "No log returned", commandName: displayName });
      }
    } catch (err) {
      if (err.message.includes("PUT ERROR message here")) {
        appendLog({
          text: "Read port error: " + err.message,
          commandName: displayName,
        });
      } else {
        appendLog({
          text: "Send command error: " + err.message,
          commandName: displayName,
        });
      }
    }
  };

  const sendSingleCommand = async () => {
    if (!command.trim()) {
      appendLog({
        text: "Please enter a command before sending.",
        commandName: "Single Command",
      });
      return;
    }

    const count = parseInt(loopCount) || 1;

    // Loop through the specified number of iterations
    for (let loop = 1; loop <= count; loop++) {

      await sendCommand(command, command, loop);

      // Add a delay between loops if not the last loop
      if (loop < count) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  const sendMultipleCommands = async () => {
    if (selectedCommands.length === 0) {
      appendLog({
        text: "Please select commands before sending.",
        commandName: "Multiple Commands",
      });
      return;
    }

    const count = parseInt(loopCount) || 1;

    // Loop through the specified number of iterations
    for (let loop = 1; loop <= count; loop++) {

      // Send all commands in this loop iteration
      for (const selectedCmd of selectedCommands) {
        await sendCommand(selectedCmd.hex, selectedCmd.name, loop);
        // Add a small delay between commands to prevent overwhelming the serial port
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Add a delay between loops if not the last loop
      if (loop < count) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Clear selected commands after sending
    setSelectedCommands([]);
  };

  return (
    <div>
      <button
        onClick={() =>
          selectedCommands.length > 0
            ? sendMultipleCommands()
            : sendSingleCommand()
        }
        disabled={selectedCommands.length === 0 && !command.trim()}
        style={{
          padding: "6px 12px",
          fontSize: "14px",
          fontWeight: "800",
          borderRadius: "5px",
          cursor:
            selectedCommands.length > 0 || command.trim()
              ? "pointer"
              : "not-allowed",
          marginBottom: "10px",
          backgroundColor:
            selectedCommands.length > 0 || command.trim()
              ? "#4CAF50"
              : "#cccccc",
          border: "none",
          opacity: selectedCommands.length > 0 || command.trim() ? 1 : 0.6,
        }}
      >
        Send Command
        {selectedCommands.length > 0
          ? ` (${selectedCommands.length})`
          : command.trim()
          ? " - Send HEX Command"
          : " - Enter HEX command or Select saved command"}
      </button>

      {/* Loop Count Input */}
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          Loop Count:
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={loopCount}
          onChange={(e) =>
            setLoopCount(Math.max(1, parseInt(e.target.value) || 1))
          }
          style={{
            width: "80px",
            padding: "4px 8px",
            borderRadius: "3px",
            border: "1px solid #ccc",
            textAlign: "center",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>
          HEX Command:
        </p>
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
