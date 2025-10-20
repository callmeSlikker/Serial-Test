import { useState } from "react";
import { MsgUtils } from "../utils/MsgUtils";
import { HypercomMessageHelper } from "../utils/HypercomMessageHelper";
import { Buffer } from "buffer";

export default function LogsPanel({ logs, setLogs, logEndRef }) {
  const [viewMode, setViewMode] = useState("hex");

  const parseMessage = (hexLine) => {
    try {
      const cleanHex = hexLine.replace(/\s+/g, "");
      const buff = Buffer.from(cleanHex, "hex");

      const STX = cleanHex.slice(0, 2);
      const msgLen = buff.length - 5;

      // Transport Header
      const headerTypeHex = cleanHex.slice(6, 10);
      const destinationHex = cleanHex.slice(10, 18);
      const sourceHex = cleanHex.slice(18, 26);
      const headerTypeText = Buffer.from(headerTypeHex, "hex").toString();
      const destinationText = Buffer.from(destinationHex, "hex").toString();
      const sourceText = Buffer.from(sourceHex, "hex").toString();

      // Presentation Header
      const formatVersionHex = cleanHex.slice(26, 28);
      const requestRspHex = cleanHex.slice(28, 30);
      const transCodeHex = cleanHex.slice(30, 34);
      const responseCodeHex = cleanHex.slice(34, 38);
      const moreIndicatorHex = cleanHex.slice(38, 40);

      // Field data starts after presentation header
      const fieldHex = cleanHex.slice(40);
      const fieldParts = fieldHex.split("1C").slice(1);

      const decodeHexToStr = (h) => {
        if (!h) return "";
        try {
          return Buffer.from(h, "hex").toString();
        } catch {
          return "";
        }
      };

      let result = `<\n`;
      // result += `${cleanHex}\n`;
      result += `STX=[${STX}]  Message Length=[${msgLen}]\n`;
      result += `Transport Header  \n`;
      result += `\tHeader Type    = [${headerTypeText}]\n`;
      result += `\tDestination    = [${destinationText}]\n`;
      result += `\tSource         = [${sourceText}]\n`;
      result += `Presentation Header  \n`;
      result += `\tFormat Version = [${decodeHexToStr(formatVersionHex)}]\n`;
      result += `\tRequest Rsp    = [${decodeHexToStr(requestRspHex)}]\n`;
      result += `\tTrans. Code    = [${decodeHexToStr(transCodeHex)}]\n`;
      result += `\tResponse Code  = [${decodeHexToStr(responseCodeHex)}]\n`;
      result += `\tMore Indicator = [${decodeHexToStr(moreIndicatorHex)}]\n`;

      if (fieldParts.length > 0) {
        result += `<<<<<< Field Data  >>>>>>\n`;
        fieldParts.forEach((f) => {
          const tag = f.slice(0, 4);     // 2 bytes tag
          const lenHex = f.slice(4, 8);  // 2 bytes length
          const len = parseInt(lenHex, 16) || 0;

          if (len > 0) { // ✅ แสดงเฉพาะ field ที่มีข้อมูล
            const valueHex = f.slice(8, 8 + len * 2);
            const value = decodeHexToStr(valueHex);
            result += `\tField [${decodeHexToStr(tag)}] Len=${lenHex.toUpperCase()}  [${value}]\n`;
          }
        });
      }

      // ETX + CRC
      const etx = cleanHex.slice(-4, -2);
      const crc = cleanHex.slice(-2);
      result += `ETX=[${etx}] CRC=[${crc}]\n`;
      result += `>`;
      return result;
    } catch (err) {
      return `(Error parsing message: ${err.message})`;
    }
  };

  const renderLogs = () => {
    if (!logs?.length) return null;

    const MAX_WIDTH = 100;
    const BORDER_STAR = '*'.repeat(MAX_WIDTH);
    const BORDER_DASH = '-'.repeat(MAX_WIDTH);

    // Helper: convert hex → text
    const parseHexLine = (hexLine) => {
      try {
        return hexLine ? parseMessage(hexLine) : "";
      } catch {
        return hexLine;
      }
    };

    // Helper: build top border with ****${commandName}**** centered
    const commandLine = (commandName) => {
      if (commandName.length >= MAX_WIDTH) return commandName;
      const left = commandName ? Math.floor((MAX_WIDTH - commandName.length) / 2) : Math.floor(MAX_WIDTH / 2);
      const right = commandName ? MAX_WIDTH - left - commandName.length : Math.floor(MAX_WIDTH / 2);
      return '*'.repeat(left) + commandName + '*'.repeat(right);
    };

    // Helper: wrap log block with borders (top includes command name)
    const wrapBlock = (responseDetails, commandName) => [
      commandLine(commandName),
      BORDER_DASH,
      responseDetails,
      BORDER_DASH,
      BORDER_STAR,
    ].join('\n');

    const hexContentCompnent = (
      <pre style={preStyle}>
        {logs
          .map((log) => wrapBlock(log.text, log.commandName))
          .join('\n')}
        <div ref={logEndRef} />
      </pre>
    )

    // --- Mode: HEX ---
    if (viewMode === "hex") {
      return hexContentCompnent;
    }

    const textContentComponent = (
      <pre style={preStyle}>
        {logs
          .map((log) => {
            const lines = log.text.split("\n").map((line) => {
              if (line.includes("Sent:")) {
                const [prefix, hex] = line.split("Sent:");
                return `${prefix}${log.commandName} Sent:\n\n${parseHexLine(hex.trim())}\n`;
              } else if (line.includes("Response:")) {
                const [prefix, hex] = line.split("Response:");
                return `${prefix}${log.commandName} Response:\n\n${parseHexLine(hex.trim())}\n`;
              }
              return line;
            });
            return wrapBlock(lines.join("\n"), log.commandName);
          })
          .join('\n')}
        <div ref={logEndRef} />
      </pre>
    )

    // --- Mode: TEXT ---
    if (viewMode === "text") {
      return textContentComponent;
    }

    return (
      <div style={{ display: "flex", gap: "10px" }}>
        <pre style={{ ...preStyle, width: "50%" }}>
          {hexContentCompnent}
          <div ref={logEndRef} />
        </pre>
        <pre style={{ ...preStyle, width: "50%" }}>{textContentComponent}</pre>
      </div>
    );
  };

  const preStyle = {
    height: "500px",
    backgroundColor: "#fff",
    color: "#000",
    padding: "8px",
    overflowY: "scroll",
    borderRadius: "5px",
    border: "1px solid #ccc",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };


  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Logs:</p>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          style={{
            padding: "4px 8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <option value="both">ALL</option>
          <option value="hex">HEX</option>
          <option value="text">TEXT</option>
        </select>
      </div>
      <div>
        <button
          onClick={() => setLogs([])}
          style={{
            flex: 1,
            padding: "1px",
            background: "#575757ff",
            border: "solid 1px #000000ff",
            borderRadius: "2px",
            width: "70px",
            height: "20px",
            fontSize: "12px",
            fontWeight: "400",
            color: "white",
          }}
        >
          Delete Logs
        </button>
        {renderLogs()}
      </div>
    </div>
  );
}
