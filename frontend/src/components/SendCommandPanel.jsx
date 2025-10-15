import { MsgUtils } from "../utils/MsgUtils";


export default function SendCommandPanel({
  command,
  setCommand,
  selectedPort,
  selectedBaudrate,
  appendLog,
}) {

  const sendCommand = async (hexCommand) => {
    if (!hexCommand) {
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
          command: hexCommand
        }),
      });

      const data = await res.json();

      if (data.responseBytes) {
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

      <div style={{display:"flex", flexDirection:"column", marginBottom:"20px"}}>
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>HEX Command:</p>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="02 00 35 36 30 30 30 ..."
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
