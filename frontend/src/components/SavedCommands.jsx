import { useRef, useEffect } from "react";

export default function SavedCommands({
  commands = [], // ✅ ป้องกัน undefined (เช่นตอนเริ่มต้น)
  setCommands,   // ✅ ใช้จาก parent เพื่อให้ upload เพิ่มข้อมูลได้
  setEditName,
  setEditHex,
  setEditIndex,
  setCommand,
  selectedCommands = [],
  setSelectedCommands,
}) {
  const handleCheckboxChange = (cmd, idx, isChecked) => {
    if (isChecked) {
      setSelectedCommands([...selectedCommands, { ...cmd, index: idx }]);
    } else {
      setSelectedCommands(selectedCommands.filter(item => item.index !== idx));
    }
  };

  const handleCommandClick = (cmd, idx) => {
    setCommand(cmd.hex);
    setEditIndex(idx);
    setEditName(cmd.name);
    setEditHex(cmd.hex);
  };

  const selectAllRef = useRef(null);

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allSelected = commands.map((cmd, idx) => ({ ...cmd, index: idx }));
      setSelectedCommands(allSelected);
    } else {
      setSelectedCommands([]);
    }
  };

  const allSelected = commands.length > 0 && selectedCommands.length === commands.length;
  const someSelected = selectedCommands.length > 0 && selectedCommands.length < commands.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div style={{ marginTop: "20px", overflowY: "scroll", height: "700px" }}>
      {/* 🔹 เพิ่มส่วน Upload ด้านบนสุด */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            ref={selectAllRef}
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{ cursor: "pointer" }}
            title="Select all commands"
          />
          <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Saved Commands:</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {Array.isArray(commands) && commands.length > 0 ? (
          commands.map((cmd, idx) => {
            const isSelected = selectedCommands.some(item => item.index === idx);
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: isSelected ? "#e8f4fd" : "#fff",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(cmd, idx, e.target.checked);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    fontWeight: "400",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={cmd.name}
                >
                  {cmd.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCommandClick(cmd, idx);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    color: "#666",
                    fontSize: "14px",
                  }}
                  title="Edit command"
                >
                  ✏️
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#888", fontSize: "14px" }}>No commands yet. Try uploading a file.</p>
        )}
      </div>
    </div>
  );
}
