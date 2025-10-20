import { useState } from "react";

export default function ExpectedMode({ onCheck }) {
    const defaultTable = [
        { D2: "VISA-CARD", D4: "04" },
        { D2: "MASTERCARD", D4: "06" },
        { D2: "JCB-CARD", D4: "02" },
        { D2: "UNIONPAY", D4: "10" },
        { D2: "DCI", D4: "12" },
        { D2: "AMEX-CARD", D4: "08" },
        { D2: "TBA", D4: "11" },
    ];

    const [tableData, setTableData] = useState(defaultTable);
    const [formData, setFormData] = useState({
        MID: "000002200869253",
        TID_BBL: "50119671",
        TID_UNIONPAY: "25296696",
        TransCode: "56",
    });
    const [expanded, setExpanded] = useState(false);

    const handleTableChange = (index, field, value) => {
        setTableData((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheck = () => {
        if (onCheck) onCheck({ ...formData, tableData });
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "10px" }}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        marginTop: "5px",
                        width: "150px",
                        padding: "1px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        borderRadius: "3px",
                        color: "#000000ff",
                        border: "1px solid #000000ff",
                        backgroundColor: "#ffb74cff",
                        marginBottom: "10px",
                    }}
                >
                    Expected Mode {expanded ? "▲" : "▼"}
                </button>
            </div>

            {expanded && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                    {/* ✅ Input Zone */}
                    <div style={{ display: "flex", flexDirection: "row", gap: "10px", justifyContent: "center" }}>
                        <label style={{ fontWeight: "bold" }}>
                            MID [D1] :
                            <input
                                type="text"
                                name="MID"
                                value={formData.MID}
                                onChange={handleChange}
                                style={{ padding: "5px", width: "200px", marginLeft: "5px" }}
                            />
                        </label>
                        <label style={{ fontWeight: "bold" }}>
                            TID BBL [16] :
                            <input
                                type="text"
                                name="TID_BBL"
                                value={formData.TID_BBL}
                                onChange={handleChange}
                                style={{ padding: "5px", width: "200px", marginLeft: "5px" }}
                            />
                        </label>
                        <label style={{ fontWeight: "bold" }}>
                            TID UNIONPAY [16] :
                            <input
                                type="text"
                                name="TID_UNIONPAY"
                                value={formData.TID_UNIONPAY}
                                onChange={handleChange}
                                style={{ padding: "5px", width: "200px", marginLeft: "5px" }}
                            />
                        </label>
                        <label style={{ fontWeight: "bold" }}>
                            Trans. Code :
                            <input
                                type="text"
                                name="TransCode"
                                value={formData.TransCode}
                                onChange={handleChange}
                                style={{ padding: "5px", width: "200px", marginLeft: "5px" }}
                            />
                        </label>
                    </div>

                    {/* ✅ Editable Table */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <table style={{ borderCollapse: "collapse", width: "1000px" }}>
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            border: "2px solid #020202ff",
                                            background: "#a3c0fdff",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                        }}
                                    >
                                        D2
                                    </th>
                                    {tableData.map((row, idx) => (
                                        <th
                                            key={idx}
                                            style={{
                                                border: "1px solid #000000ff",
                                                textAlign: "center",
                                                width: `${100 / (tableData.length + 1)}%`,
                                                padding: "5px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {/* ❌ ช่องหัว D2 ห้ามแก้ */}
                                            {row.D2}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td
                                        style={{
                                            border: "2px solid #020202ff",
                                            background: "#a3c0fdff",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                        }}
                                    >
                                        D4
                                    </td>
                                    {tableData.map((row, idx) => (
                                        <td
                                            key={idx}
                                            style={{
                                                border: "1px solid #020202ff",
                                                padding: "5px",
                                                textAlign: "center",
                                            }}
                                        >
                                            {/* ✅ ช่อง D4 แก้ไขได้ */}
                                            <input
                                                type="text"
                                                value={row.D4}
                                                onChange={(e) => handleTableChange(idx, "D4", e.target.value)}
                                                style={{
                                                    width: "80%",
                                                    textAlign: "center",
                                                    border: "none",
                                                    background: "transparent",
                                                    fontWeight: "500",
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Check Button */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <button
                            onClick={handleCheck}
                            style={{
                                marginTop: "10px",
                                backgroundColor: "#fca31eff",
                                color: "white",
                                border: "none",
                                padding: "5px 15px",
                                cursor: "pointer",
                                borderRadius: "3px",
                                alignSelf: "flex-start",
                            }}
                        >
                            Check
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
