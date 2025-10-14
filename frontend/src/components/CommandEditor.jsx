import { HypercomMessageHelper } from "../utils/HypercomMessageHelper";

export default function CommandEditor({
  commands,
  setCommands,
  editName,
  setEditName,
  editHex,
  setEditHex,
  editIndex,
  setEditIndex,
  header,
  setHeader,
  transactionCode,
  setTransactionCode,
  responseCode,
  setResponseCode,
  moreIndicator,
  setMoreIndicator,
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
    setFields(
      updated.length > 0 ? updated : [{ id: Date.now(), bit: "", value: "" }]
    );
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
      header: header || "600000000010", // ใช้จาก state
      transactionCode: transactionCode || "00", // ใช้จาก state
      responseCode: responseCode || "00", // ใช้จาก state
      moreIndicator: moreIndicator || "0", // ใช้จาก state
      fields: msgFields,
    };

    try {
      const buf = HypercomMessageHelper.build(msg);
      const hexStr =
        buf
          .toString("hex")
          .toUpperCase()
          .match(/.{1,2}/g)
          ?.join(" ") || "";
      setEditHex(hexStr);
      setCommand(hexStr);
      setEditorWarning("");
    } catch (err) {
      setEditorWarning(`Error building message: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "10px", border: "none" }}>
      <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>
        Edit Commands :
      </p>

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
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          HEX Command :
        </p>
        <input
          type="text"
          placeholder="02 00 35 36 ..."
          value={editHex}
          onChange={(e) => setEditHex(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          Header :
        </p>
        <input
          type="text"
          placeholder="600000000010"
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          Transaction Code :
        </p>
        <input
          type="text"
          placeholder="20"
          value={transactionCode}
          onChange={(e) => setTransactionCode(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          Response Code :
        </p>
        <input
          type="text"
          placeholder="00"
          value={responseCode}
          onChange={(e) => setResponseCode(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          More Indicator :
        </p>
        <input
          type="text"
          placeholder="0"
          value={moreIndicator}
          onChange={(e) => setMoreIndicator(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "0px" }}>
          Bit and Value :
        </p>
        <button
          onClick={handleAddField}
          style={{
            alignSelf: "end",
            marginBottom: "10px",
            padding: "6px 12px",
            background: "#ffffffff",
            borderRadius: "5px",
            border: "none",
            border: "1px solid #000000ff",
            maxHeight: "200px", // 👈 limit height (adjust as needed)
            overflowY: "auto", // 👈 enables vertical scrolling
            border: "1px solid #ccc", // optional: for clarity
            padding: "8px",
            borderRadius: "6px",
            boxSizing: "border-box",
            marginBottom: "10px",
          }}
        >
          + Add Field
        </button>
        {fields.map((f, i) => (
          <div
            key={f.id}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "6px",
              width: "100%",
            }}
          >
            <input
              type="text"
              placeholder="Bit"
              value={f.bit}
              onChange={(e) => handleFieldChange(i, "bit", e.target.value)}
              style={{ padding: "6px", width: "20%" }}
            />
            <input
              type="text"
              placeholder="Value"
              value={f.value}
              onChange={(e) => handleFieldChange(i, "value", e.target.value)}
              style={{ padding: "6px", width: "80%" }}
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
      </div>

      {editorWarning && (
        <p style={{ color: "red", margin: "4px 0" }}>{editorWarning}</p>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button
          onClick={handleBuild}
          style={{
            flex: 1,
            padding: "6px",
            background: "#d4e4f7",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Build
        </button>

        <button
          onClick={() => {
            if (!editName.trim() || !editHex.trim()) {
              if (!editorWarning)
                setEditorWarning(
                  "! Please enter name and HEX command before saving."
                );
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
          style={{
            flex: 1,
            padding: "6px",
            background: "#d4f7d4",
            border: "none",
            borderRadius: "5px",
          }}
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
          style={{
            flex: 1,
            padding: "6px",
            background: "#f7d4d4",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
