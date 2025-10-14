export default function LogsPanel({ logs, logEndRef }) {
  return (
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
  );
}
