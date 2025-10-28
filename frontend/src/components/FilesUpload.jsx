export default function FilesUpload({ setCommands, existingCommands = [] }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);

      let importedCommands = [];
      const existingNames = existingCommands.map(cmd => cmd.name);

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "SEND") {
          const order = lines[i + 1]?.trim(); // ไม่ใช้
          let name = lines[i + 2]?.trim();  // ชื่อ command
          const hex = lines[i + 3]?.trim();   // HEX
          if (name && hex) {
            // Handle duplicate names during import
            const baseName = name;
            if (existingNames.includes(name) || importedCommands.some(cmd => cmd.name === name)) {
              // Find the next available number
              let counter = 1;
              while (
                existingNames.includes(`${baseName} (${counter})`) ||
                importedCommands.some(cmd => cmd.name === `${baseName} (${counter})`)
              ) {
                counter++;
              }
              name = `${baseName} (${counter})`;
            }

            importedCommands.push({ name, hex });
          }
          i += 5; // ข้าม block SEND
        }
      }

      setCommands(importedCommands);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".ptp,.txt" onChange={handleFileUpload} />
    </div>
  );
}
