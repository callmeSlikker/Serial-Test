import {HypercomMessageHelper} from "../utils/HypercomMessageHelper";

export default function CommandEditor({
  commands,
  setCommands,
  editName,
  setEditName,
  editHex,
  setEditHex,
  editIndex,
  setEditIndex,
  transactionCode,
  setTransactionCode,
  fields,
  setFields,
  appendLog,
  editorWarning,
  setEditorWarning,
  setCommand,
}) {
  const handleFieldChange = (i, key, val) => {
    const updated = [...fields];
    updated[i] = { ...updated[i], [key]: val };
    setFields(updated);
  };

  const handleAddField = () => {
    setFields([...fields, { id: Date.now(), bit: "", value: "" }]);
  };

  const handleRemoveField = (i) => {
    const updated = fields.filter((_, idx) => idx !== i);
    setFields(updated.length > 0 ? updated : [{ id: Date.now(), bit: "", value: "" }]);
  };

  const handleBuild = () => {
    const msgFields = {};
    fields.forEach((f) => {
      if (f.bit.trim() && f.value.trim()) msgFields[f.bit] = f.value;
    });

    if (Object.keys(msgFields).length === 0) {
      setEditorWarning("! Please enter at least one Bit/Value to build.");
      return;
    }

    const msg = {
      header: "600000000310",
      transactionCode: transactionCode || "00",
      responseCode: "00",
      moreIndicator: "0",
      fields: msgFields,
    };

    const buf = HypercomMessageHelper.build(msg);
    const hexStr = buf.toString("hex").toUpperCase().match(/.{1,2}/g)?.join(" ") || "";
    setEditHex(hexStr);
    setCommand(hexStr);
    setEditorWarning("");
  };

  return (
    <div style={{ padding: "10px", border: "none" }}>
      <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Edit Commands :</p>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>Name :</p>
        <input
          type="text"
          placeholder="Sale 56 1.00 Bth"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>HEX Command :</p>
        <input
          type="text"
          placeholder="02 00 35 36 ..."
          value={editHex}
          onChange={(e) => setEditHex(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>Transaction Code :</p>
        <input
          type="text"
          placeholder="20"
          value={transactionCode}
          onChange={(e) => setTransactionCode(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500" }}>Bit and Value :</p>
        {fields.map((f, i) => (
          <div key={f.id} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
            <input
              type="text"
              placeholder="Bit"
              value={f.bit}
              onChange={(e) => handleFieldChange(i, "bit", e.target.value)}
              style={{ flex: 1, padding: "6px" }}
            />
            <input
              type="text"
              placeholder="Value"
              value={f.value}
              onChange={(e) => handleFieldChange(i, "value", e.target.value)}
              style={{ flex: 3, padding: "6px" }}
            />
            <button
              type="button"
              onClick={() => handleRemoveField(i)}
              style={{
                color: "black",
                background: "none",
                border: "none",
                padding: "0 10px",
                borderRadius: "50px",
                cursor: "pointer",
              }}
            >
              ⌫
            </button>
          </div>
        ))}
        <button
          onClick={handleAddField}
          style={{ marginTop: "5px", padding: "6px 12px", background: "#d4e4f7", borderRadius: "5px", border: "none" }}
        >
          + Add Field
        </button>
      </div>

      {editorWarning && <p style={{ color: "red", margin: "4px 0" }}>{editorWarning}</p>}

      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button onClick={handleBuild} style={{ flex: 1, padding: "6px", background: "#d4e4f7", border: "none", borderRadius: "5px" }}>Build</button>

        <button
          onClick={() => {
            if (!editName.trim() || !editHex.trim()) {
              if (!editorWarning) setEditorWarning("! Please enter name and HEX command before saving.");
              return;
            }

            const updated = [...commands];
            if (editIndex !== null) {
              updated[editIndex] = { name: editName, hex: editHex };
            } else {
              updated.push({ name: editName, hex: editHex });
            }

            setCommands(updated);
            setEditIndex(null);
            setEditName("");
            setEditHex("");
            setEditorWarning("");
          }}
          style={{ flex: 1, padding: "6px", background: "#d4f7d4", border: "none", borderRadius: "5px" }}
        >
          Save
        </button>

        <button
          onClick={() => {
            setEditIndex(null);
            setEditName("");
            setEditHex("");
            setEditorWarning("");
            setTransactionCode("");
            setFields([{ id: Date.now(), bit: "", value: "" }]);
          }}
          style={{ flex: 1, padding: "6px", background: "#f7d4d4", border: "none", borderRadius: "5px" }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
