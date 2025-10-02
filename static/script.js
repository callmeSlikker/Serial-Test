async function loadPorts() {
  const res = await fetch("/ports");
  const data = await res.json();

  const portSelect = document.getElementById("portSelect");
  portSelect.innerHTML = "";

  data.ports.forEach(port => {
    const option = document.createElement("option");
    option.value = port;
    option.textContent = port;
    portSelect.appendChild(option);
  });
}

async function connect() {
  const port = document.getElementById("portSelect").value;
  const baudrate = document.getElementById("baudrateSelect").value;

  const res = await fetch("/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ port, baudrate })
  });

  const data = await res.json();
  appendLog(data.status || data.error);
}

async function sendCommand() {
  const command = document.getElementById("commandInput").value;

  const res = await fetch("/sendCommand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });

  const data = await res.json();

  if (data.logs) {
    data.logs.forEach(line => appendLog(line));
  } else {
    appendLog(data.error);
  }
}

function appendLog(message) {
  const responseBox = document.getElementById("responseBox");
  responseBox.textContent += message + "\n";
  responseBox.scrollTop = responseBox.scrollHeight;
}

window.onload = loadPorts;
