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
  const port = document.getElementById("portSelect").value;
  const baudrate = document.getElementById("baudrateSelect").value;
  const command = document.getElementById("commandInput").value;

  const res = await fetch("/sendCommand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ port, baudrate, command })
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

let currentController = null;

async function cancelAll() {
  // ยกเลิก fetch ฝั่ง frontend
  if (currentController) {
    currentController.abort();
    currentController = null;
    appendLog("Fetch canceled (frontend).");
  }

  // ส่งคำสั่งยกเลิกไป backend
  try {
    await fetch("/cancel", { method: "POST" });
    appendLog("Backend operation canceled.");
  } catch (err) {
    appendLog("Cancel request failed: " + err.message);
  }
}


window.onload = loadPorts;
