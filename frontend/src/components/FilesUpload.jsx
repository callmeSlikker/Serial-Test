export default function FilesUpload({ setCommands }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);

      let importedCommands = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "SEND") {
          const order = lines[i + 1]?.trim(); // ไม่ใช้
          const name = lines[i + 2]?.trim();  // ชื่อ command
          const hex = lines[i + 3]?.trim();   // HEX
          if (name && hex) {
            importedCommands.push({ name, hex });
          }
          i += 5; // ข้าม block SEND
        }
      }
      setCommands((prev) => [...prev, ...importedCommands]);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".ptp,.txt" onChange={handleFileUpload} />
    </div>
  );
}
