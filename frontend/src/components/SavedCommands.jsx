export default function SavedCommands({
  commands,
  setEditName,
  setEditHex,
  setEditIndex,
  setCommand,
}) {
  if (!commands.length) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Saved Commands:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
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
  );
}
