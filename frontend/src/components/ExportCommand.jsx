import React from "react";

export default function ExportCommands({ commands }) {
    const exportToTxt = () => {
        if (!commands || commands.length === 0) return;

        let txtContent = `VERSION\n8\n\nCOMMSETTINGS\n0\nCOM9\nCOM9\n9600\n2\n63\n4\n0\n0\n\nCOMMDISPLAY\n0\n\nVERSATAP\n0\n\nCHANNELALIAS\n\n`;

        commands.forEach((cmd, idx) => {
            txtContent += `SEND\n${idx}\n${cmd.name}\n${cmd.hex}\n0\n5\n\n`;
        });

        const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Exported Commands Hypercom.txt";
        link.click();
    };

    return (
        <button
            onClick={exportToTxt}
            style={{
                marginTop: "5px",
                width: "90px",
                padding: "1px",
                fontSize: "14px",
                fontWeight: "400",
                cursor: "pointer",
                borderRadius: "3px",
                border: "2px solid #000000ff",
                backgroundColor: "#ffe343ff",
            }}
        >
            Export .txt
        </button>
    );
}
