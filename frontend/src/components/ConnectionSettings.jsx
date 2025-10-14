export default function ConnectionSettings({
  ports,
  baudrates,
  selectedPort,
  setSelectedPort,
  selectedBaudrate,
  setSelectedBaudrate,
}) {
  return (
    <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>COM Port :</p>
        <select
          style={{ width: "120px", height: "32px", borderRadius: "5px", fontSize: "14px" }}
          value={selectedPort}
          onChange={(e) => setSelectedPort(e.target.value)}
        >
          {ports.map((port) => (
            <option key={port} value={port}>{port}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        <p style={{ fontSize: "16px", fontWeight: "500", margin: 0 }}>Baudrate:</p>
        <select
          style={{ width: "120px", height: "32px", borderRadius: "5px", fontSize: "14px" }}
          value={selectedBaudrate}
          onChange={(e) => setSelectedBaudrate(e.target.value)}
        >
          {baudrates.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
    </div>
  );
}
