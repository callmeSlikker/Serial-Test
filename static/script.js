async function connect() {
  const port = document.getElementById("portSelect").value;
  const baudrate = document.getElementById("baudrateSelect").value;

  const res = await fetch("/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ port, baudrate }),
  });
  const data = await res.json();
  alert(JSON.stringify(data));
}

async function sendCommand() {
  const command = document.getElementById("commandInput").value;

  const res = await fetch("/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });
  const data = await res.json();

  document.getElementById("responseBox").innerText =
    data.response || data.error;
}
