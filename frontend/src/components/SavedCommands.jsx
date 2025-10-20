export default function SavedCommands({
  commands,
  setEditName,
  setEditHex,
  setEditIndex,
  setCommand,
}) {
  console.log("commands", commands)
  return (
    <div style={{ marginTop: "20px" , overflowY: "scroll", height: "700px" }}>
      <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Saved Commands:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
        {commands.map((cmd, idx) => (
          <button
            key={idx}
            style={{
              padding: "6px 12px",
              fontSize: "16px",
              fontWeight: "400",
              borderRadius: "3px",
              cursor: "pointer",
              backgroundColor: "#fff6bfff",
              border: "1px solid #000000ff",
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
