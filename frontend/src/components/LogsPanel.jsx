import { useState } from "react";
import { MsgUtils } from "../utils/MsgUtils";

export default function LogsPanel({ logs, logEndRef }) {
  const [viewMode, setViewMode] = useState("hex"); // ค่าเริ่มต้นเป็น HEX

  const renderLogs = () => {
    if (viewMode === "hex") {
      return (
        <pre style={preStyle}>
          {logs.join("\n")}
          <div ref={logEndRef} />
        </pre>
      );
    }

    if (viewMode === "text") {
      return (
        <pre style={preStyle}>
          {logs
            .map((line) => {
              try {
                const bytes = MsgUtils.hexStringToBytes(
                  line.replace(/\s+/g, "")
                );
                return new TextDecoder().decode(bytes);
              } catch {
                return line;
              }
            })
            .join("\n")}
          <div ref={logEndRef} />
        </pre>
      );
    }

    // All (แสดง 2 ช่องซ้ายขวา)
    return (
      <div style={{ display: "flex", gap: "10px" }}>
        <pre style={{ ...preStyle, width: "50%" }}>
          {logs.join("\n")}
          <div ref={logEndRef} />
        </pre>
        <pre style={{ ...preStyle, width: "50%" }}>
          {logs
            .map((line) => {
              try {
                const bytes = MsgUtils.hexStringToBytes(
                  line.replace(/\s+/g, "")
                );
                return new TextDecoder().decode(bytes);
              } catch {
                return line;
              }
            })
            .join("\n")}
        </pre>
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
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Logs:</p>

        {/* Dropdown สำหรับเลือกโหมดแสดงผล */}
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
            backgroundColor: "#e8daffff",
            border: "none",
          }}
        >
          <option value="both">All</option>
          <option value="hex">HEX</option>
          <option value="text">Text</option>
        </select>
      </div>

      {/* แสดง logs ตามโหมด */}
      {renderLogs()}
    </div>
  );
}
