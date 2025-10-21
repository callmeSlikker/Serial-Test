import { HypercomMessageHelper } from "../utils/HypercomMessageHelper";

export default function CommandEditor({
  formCommandEditorValue,
  setFormCommandEditorValue,
  onDeleteCommand,
}) {
  const {
    commands,
    editIndex,
    editName,
    editHex,
    editorWarning,
    transactionCode,
    header,
    responseCode,
    moreIndicator,
    fields,
  } = formCommandEditorValue;

  // --- State Update Helper ---
  const updateForm = (key, value) => {
    setFormCommandEditorValue((prev) => ({ ...prev, [key]: value }));
  };

  // --- Handlers ---
  const handleFieldChange = (i, key, val) => {
    const updated = [...fields];
    updated[i] = { ...updated[i], [key]: val };
    updateForm("fields", updated);
  };

  const handleAddField = () => {
    updateForm("fields", [...fields, { id: Date.now(), bit: "", value: "" }]);
  };

  const handleRemoveField = (i) => {
    const updated = fields.filter((_, idx) => idx !== i);
    updateForm(
      "fields",
      updated.length > 0 ? updated : [{ id: Date.now(), bit: "", value: "" }]
    );
  };

  const handleBuild = () => {
    const msgFields = {};
    fields.forEach((f) => {
      if (f.bit.trim() && f.value.trim()) msgFields[f.bit] = f.value;
    });

    if (Object.keys(msgFields).length === 0) {
      updateForm(
        "editorWarning",
        "! Please enter at least one Bit/Value to build."
      );
      return;
    }

    const msg = {
      header: header || "600000000010",
      transactionCode: transactionCode || "00",
      responseCode: responseCode || "00",
      moreIndicator: moreIndicator || "0",
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
      updateForm("editHex", hexStr);
      updateForm("command", hexStr);
      updateForm("editorWarning", "");
    } catch (err) {
      updateForm("editorWarning", `Error building message: ${err.message}`);
    }
  };

  const handleSave = () => {
    // ✅ Step 1: สร้าง fields จากฟอร์ม
    const msgFields = {};
    fields.forEach((f) => {
      if (f.bit.trim() && f.value.trim()) msgFields[f.bit] = f.value;
    });

    if (Object.keys(msgFields).length === 0) {
      updateForm("editorWarning", "! Please enter at least one Bit/Value to build.");
      return;
    }

    // ✅ Step 2: สร้าง message object
    const msg = {
      header: header || "600000000010",
      transactionCode: transactionCode || "00",
      responseCode: responseCode || "00",
      moreIndicator: moreIndicator || "0",
      fields: msgFields,
    };

    // ✅ Step 3: build message (เหมือน handleBuild)
    let hexStr = "";
    try {
      const buf = HypercomMessageHelper.build(msg);
      hexStr =
        buf
          .toString("hex")
          .toUpperCase()
          .match(/.{1,2}/g)
          ?.join(" ") || "";
      updateForm("editHex", hexStr);
      updateForm("command", hexStr);
      updateForm("editorWarning", "");
    } catch (err) {
      updateForm("editorWarning", `Error building message: ${err.message}`);
      return; // ❗ ถ้า build fail ไม่ต้อง save ต่อ
    }

    // ✅ Step 4: ตรวจเช็คชื่อและ hex ก่อน save
    const nameToSave = editName.trim();
    const hexToSave = hexStr.trim() || editHex.trim();

    if (!nameToSave || !hexToSave) {
      updateForm("editorWarning", "! Please enter name and HEX command before saving.");
      return;
    }

    // ✅ Step 5: บันทึก command
    const updated = [...commands];
    if (editIndex !== null) {
      updated[editIndex] = { name: nameToSave, hex: hexToSave };
    } else {
      updated.push({ name: nameToSave, hex: hexToSave });
    }

    // ✅ Step 6: เคลียร์ฟอร์ม
    updateForm("commands", updated);
    updateForm("editIndex", null);
    updateForm("editName", "Sale 56 1.00 THB");
    updateForm(
      "editHex",
      "02 00 35 36 30 30 30 30 30 30 30 30 30 31 30 35 36 30 30 30 1C 34 30 00 12 30 30 30 30 30 30 30 30 30 31 30 30 1C 03 15"
    );
    updateForm("editorWarning", "");
  };


  const handleClear = () => {
    setFormCommandEditorValue((prev) => ({
      ...prev,
      editIndex: null,
      editName: "Sale 56 1.00 THB",
      editHex:
        "02 00 35 36 30 30 30 30 30 30 30 30 30 31 30 35 36 30 30 30 1C 34 30 00 12 30 30 30 30 30 30 30 30 30 31 30 30 1C 03 15",
      editorWarning: "",
      transactionCode: "56",
      fields: [{ id: Date.now(), bit: "40", value: "000000000100" }],
    }));
  };

  // Delete Command
  const handleDelete = () => {
    if (editIndex === null) {
      updateForm("editorWarning", "! Please select a command to delete.");
      return;
    }

    if (window.confirm(`Delete "${editName}" ?`)) {
      onDeleteCommand(editIndex); // 💥 ลบออกจาก Saved Commands + UI ทันที
    }
  };

  // --- UI ---
  return (
    <div style={{ padding: "10px", border: "none" }}>
      <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>
        Edit Commands :
      </p>

      {/* Name */}
      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>Name :</p>
        <input
          type="text"
          placeholder="Sale 56 1.00 THB"
          value={editName}
          onChange={(e) => updateForm("editName", e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      {/* HEX Command */}
      <div
        style={{
          display: "none",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          HEX Command :
        </p>
        <input
          type="text"
          placeholder="02 00 35 36 ..."
          value={editHex}
          onChange={(e) => updateForm("editHex", e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: "none",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          Header :
        </p>
        <input
          type="text"
          placeholder="600000000010"
          value={header}
          onChange={(e) => updateForm("header", e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      {/* Transaction Code */}
      <div>
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          Transaction Code :
        </p>
        <input
          type="text"
          placeholder="20"
          value={transactionCode}
          onChange={(e) => updateForm("transactionCode", e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      {/* Response Code */}
      <div
        style={{
          display: "none",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          Response Code :
        </p>
        <input
          type="text"
          placeholder="00"
          value={responseCode}
          onChange={(e) => updateForm("responseCode", e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      {/* More Indicator */}
      <div
        style={{
          display: "none",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
          More Indicator :
        </p>
        <input
          type="text"
          placeholder="0"
          value={moreIndicator}
          onChange={(e) => updateForm("moreIndicator", e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      </div>

      {/* Bit / Value fields */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: "14px", fontWeight: "500", marginBottom: "0px" }}>
          Bit and Value :
        </p>

        <button
          onClick={handleAddField}
          style={{
            alignSelf: "end",
            marginBottom: "10px",
            padding: "6px 12px",
            background: "#fff",
            borderRadius: "5px",
            border: "1px solid #000",
            cursor: "pointer",
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

      {/* Warning */}
      {editorWarning && (
        <p style={{ color: "red", margin: "4px 0" }}>{editorWarning}</p>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        {/* <button
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
        </button> */}

        <button
          onClick={handleSave}
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
          onClick={handleClear}
          style={{
            flex: 1,
            padding: "6px",
            background: "#f7efd4ff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Clear
        </button>

        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: "6px",
            background: "#f7d4d4",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
