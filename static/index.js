const windowElement = document.getElementById("windowElement");
const titleBar = document.getElementById("title-bar");
const commandInput = document.getElementById("command-input");
const outputContainer = document.getElementById("output-container");
const footer = document.getElementById("footer");
const footerText = document.getElementById("footer-text");
const reopenBtn = document.getElementById("reopen-btn");
const redLight = document.getElementById("red-light");
const yellowLight = document.getElementById("yellow-light");
const greenLight = document.getElementById("green-light");

async function fetchNpmDownloads(packageName) {
  const currentDate = new Date().toISOString().split('T')[0];
  const response = await fetch(`https://api.npmjs.org/downloads/point/2020-01-01:${currentDate}/${packageName}`);
  const data = await response.json();
  return data.downloads || 0;
}

async function getTotalDownloads(username) {
  const packageNames = await fetchUserPackages(username);
  const downloadPromises = packageNames.map(fetchNpmDownloads);
  const downloadsArray = await Promise.all(downloadPromises);
  const totalDownloads = downloadsArray.reduce((sum, downloads) => sum + downloads, 0);
  return totalDownloads.toLocaleString();
}



const username = 'phantom8015';

let isClosed = false;
let isMinimized = false;
let isMaximized = false;

redLight.addEventListener("click", () => {
  if (!isClosed) {
    closeWindow();
  } else {
    reopenWindow();
  }
});

yellowLight.addEventListener("click", () => {
  if (!isMinimized) {
    minimizeWindow();
  } else {
    reopenWindow();
  }
});

greenLight.addEventListener("click", () => {
  maximizeWindow();
});

footerText.addEventListener("click", () => {
  reopenWindow();
});

document.addEventListener("click", (e) => {
  if (isClosed || isMinimized) {
    if (
      !windowElement.contains(e.target) &&
      e.target !== footer &&
      e.target !== footerText
    ) {
      reopenWindow();
    }
  }
});
document.getElementById("windowElement").addEventListener("click", function () {
  document.getElementById("command-input").focus();
});
function maximizeWindow() {
  if (isMinimized || isClosed) {
    return;
  }
  windowElement.style.transition = "left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease";

  if (isMaximized) {
    windowElement.style.left = `${initialLeft}px`;
    windowElement.style.top = `${initialTop}px`;
    windowElement.style.width = `${initialWidth}px`;
    windowElement.style.height = `${initialHeight}px`;
    windowElement.style.transform = "none";
    isMaximized = false;
    updateTerminalTitle();
    return;
  }
  windowElement.style.left = "0";
  windowElement.style.top = "0";
  windowElement.style.width = "100%";
  windowElement.style.height = "100%";
  windowElement.style.transform = "none";
  isMaximized = true;
  updateTerminalTitle();
}

function closeWindow() {
  if (!isClosed) {
    outputContainer.innerHTML = `
            <div id="last-login">Last Login:</div>
            <div class="command-output">Window is closed. Click to reopen.</div>
        `;
    windowElement.style.transition = "left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease";
    outputContainer.style.display = "block";
    outputContainer.style.flexDirection = "column";
    outputContainer.style.gap = "20px";
    outputContainer.style.height = "auto";
    outputContainer.style.width = "auto";

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const rect = windowElement.getBoundingClientRect();

    const centerX = (windowWidth - rect.width) / 2;
    const centerY = (windowHeight - rect.height) / 2;

    windowElement.style.left = `${centerX}px`;
    windowElement.style.top = `${centerY}px`;

    windowElement.style.transform = "scale(0.1, 0.1) translate(5px, calc(100% - 10px))";
    windowElement.style.transition = "transform 0.3s ease";

    setTimeout(() => {
      windowElement.style.display = "none";
    }, 300);

    footer.style.display = "block";
    footerText.textContent =
      "Window is closed. Click or tap anywhere to reopen.";
    isClosed = true;
  }
}

function reopenWindow() {
  if (isMinimized) {
    windowElement.style.display = "block";
    footer.style.display = "none";
    setTimeout(() => {
      windowElement.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      windowElement.style.transform = "none";
      windowElement.style.opacity = "1";
    }, 10);
    isClosed = false;
    isMinimized = false;
    updateTerminalTitle();
  } else if (isClosed) {
    windowElement.style.display = "block";
    setTimeout(() => {
      windowElement.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      windowElement.style.left = `${initialLeft}px`;
      windowElement.style.top = `${initialTop}px`;
      windowElement.style.width = `${initialWidth}px`;
      windowElement.style.height = `${initialHeight}px`;
      windowElement.style.transform = "none";
      windowElement.style.opacity = "1";
    }, 10);

    const lastLoginText = `Last Login: ${new Date().toString().split(" ").slice(0, 5).join(" ")}`;
    outputContainer.innerHTML = `
            <div id="last-login">${lastLoginText}</div>
            <div class="command-output">Type 'help' to get started.</div>
        `;
    updateTerminalTitle();
    footer.style.display = "none";
    isClosed = false;
  }
}


function minimizeWindow() {
  if (!isMinimized) {
    windowElement.style.transform = "scale(0.1, 0.1) translate(5px, calc(100% - 10px))";
    windowElement.style.transition = "transform 0.5s ease";
    footer.style.display = "block";
    footerText.textContent =
      "Window is minimized. Click or tap anywhere to reopen.";
    isMinimized = true;

    setTimeout(() => {
      windowElement.style.display = "none";
    }, 500); 
  }
}

document.addEventListener("click", (e) => {
  if (
    (isClosed || isMinimized) &&
    !windowElement.contains(e.target) &&
    e.target !== footer &&
    e.target !== footerText
  ) {
    reopenWindow();
  }
});

let initialLeft, initialTop;
let initialWidth, initialHeight;
let iframemode = false;

window.addEventListener("load", () => {
  updateTerminalTitle();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const rect = windowElement.getBoundingClientRect();
  const centerX = (windowWidth - rect.width) / 2;
  const centerY = (windowHeight - rect.height) / 2;

  initialLeft = centerX;
  initialTop = centerY;
  initialWidth = rect.width;
  initialHeight = rect.height;
  const lastlogin = document.getElementById("last-login");
  lastlogin.textContent =
    "Last Login: " + new Date().toString().split(" ").slice(0, 5).join(" ");
});

function updateTerminalTitle() {
  const rect = windowElement.getBoundingClientRect();
  const titleElement = document.getElementById("title");
  titleElement.textContent = `Phantom8015 -- -zsh -- ${Math.round(rect.width)}x${Math.round(rect.height)}`;
}

const birthday = new Date(2011, 5, 12);
const ageDifMs = Date.now() - birthday.getTime();
const ageDate = new Date(ageDifMs);
const age = Math.abs(ageDate.getUTCFullYear() - 1970);

const commands = {
  help: "Available commands:\n\n- help: Show this message\n\n- whoami: About me\n\n- learning: What I'm learning\n\n- skills: My skills\n\n- gitHub: Visit my GitHub\n\n- discord: Add me on Discord\n\n- achievements: What are my achievments?\n\n- clear: Clear the terminal",
  learning: "I am currently learning C# in Unity.",
  skills:
    "I code in Python, Lua, Godot, Java/TypeScript, HTML, CSS, Java, Batch & SH, and Swift. \n\nSome of my projects are available on my GitHub, this website in of itself is a project.",
  github: "Visit my GitHub at https://github.com/Phantom8015 You can also check out my NPM Profile at: https://www.npmjs.com/~phantom8015",
  whoami: `Hi there! My name is Evaan Chowdhry. I'm a ${age}-year-old developer from India. I'm a passionate programmer who's been coding since I was nine years old. Feel free to reach out to me at evaanchowdhry@gmail.com!`,
  discord: "Add me on discord: phantom8015. (Don't forget the .)",
  achievements: async function () {
    totalDownloads = await getTotalDownloads(username);
    showOutput(`I have got 2nd place in the STRIPE Senior Python Competition and 2nd place in the Stack Hacks hackathon. I also have ${totalDownloads}+ npm downloads across all of my packages.`, "success");
  },

  clear: function () {
    outputContainer.innerHTML = "";
    outputContainer.style.display = "block";
    outputContainer.style.flexDirection = "column";
    outputContainer.style.gap = "20px";
    outputContainer.style.height = "auto";
    outputContainer.style.width = "auto";
  },
};

commandInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const command = commandInput.value.trim().toLowerCase();
    if (command) {
      showCommandOutput(command);
    }
    commandInput.value = "";
  }
  if (event.key === "Tab") {
    event.preventDefault();
    const command = commandInput.value.trim().toLowerCase();
    if (command) {
      const matchingCommand = Object.keys(commands).find((c) =>
        c.startsWith(command),
      );
      if (matchingCommand) {
        commandInput.value = matchingCommand;
      }
    }
  }
});

function showCommandOutput(command) {
  if (iframemode) {
    iframemode = false;
    outputContainer.innerHTML = "";
    outputContainer.style.display = "block";
    outputContainer.style.flexDirection = "column";
    outputContainer.style.gap = "20px";
    outputContainer.style.height = "auto";
    outputContainer.style.width = "auto";
  }
  let response = `zsh: command not found: ${command}`;
  let responseClass = "error";
  if (commands[command]) {
    response = commands[command];
    if (typeof response === "function") {
      response();
      outputContainer.scrollTop = outputContainer.scrollHeight;
      return;
    }
    responseClass = "success";
  }

  const commandOutput = document.createElement("div");
  commandOutput.classList.add("command-output", responseClass);
  commandOutput.textContent = `(base) Phantom8015@MacBook-Air ~ % ${command}\n${response}`;

  outputContainer.appendChild(commandOutput);
  container.scrollTop = container.scrollHeight;
}

function showOutput(text, type = "info") {
  const commandOutput = document.createElement("div");
  commandOutput.classList.add("command-output", type);
  commandOutput.textContent = text;
  outputContainer.appendChild(commandOutput);
  outputContainer.scrollTop = outputContainer.scrollHeight;
}

function showOutput(text) {
  const commandOutput = document.createElement("div");
  commandOutput.classList.add("command-output");
  commandOutput.textContent = text;
  outputContainer.appendChild(commandOutput);
  outputContainer.scrollTop = outputContainer.scrollHeight;
}

let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let startX,
  startY,
  startWidth,
  startHeight,
  startLeft,
  startTop,
  resizeDirection;

window.addEventListener("load", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const rect = windowElement.getBoundingClientRect();

  const centerX = (windowWidth - rect.width) / 2;
  const centerY = (windowHeight - rect.height) / 2;

  initialLeft = centerX;
  initialTop = centerY;
});

titleBar.addEventListener("dblclick", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const rect = windowElement.getBoundingClientRect();
  
  const centerX = (windowWidth - rect.width) / 2;
  const centerY = (windowHeight - rect.height) / 2;
  windowElement.style.transition = "left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease";
  
  windowElement.style.left = `${centerX}px`;
  windowElement.style.top = `${centerY}px`;
  windowElement.style.transform = "none";
});

titleBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  const rect = windowElement.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  document.body.style.userSelect = "none";
  document.body.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    windowElement.style.transition = "none";

    const rect = windowElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    newLeft = Math.max(0, Math.min(newLeft, windowWidth - rect.width));
    newTop = Math.max(0, Math.min(newTop, windowHeight - rect.height));

    windowElement.style.left = `${newLeft}px`;
    windowElement.style.top = `${newTop}px`;
    windowElement.style.transform = "none";
  }
});

["top-left", "top-right", "bottom-left", "bottom-right"].forEach((handle) => {
  const resizeHandle = document.createElement("div");
  resizeHandle.className = `resize-handle ${handle}`;
  resizeHandle.dataset.handle = handle;
  windowElement.appendChild(resizeHandle);
});

windowElement.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("resize-handle")) {
    windowElement.style.transition = "none";

    isResizing = true;
    const rect = windowElement.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;
    resizeDirection = e.target.dataset.handle;
    e.preventDefault();
  }
});

document.addEventListener("mousemove", (e) => {
  if (isResizing) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = Math.max(200, startWidth + dx);
    let newHeight = Math.max(150, startHeight + dy);

    if (resizeDirection.includes("left")) {
      newWidth = Math.max(200, startWidth - dx);
      windowElement.style.left = `${startLeft + dx}px`;
    }

    if (resizeDirection.includes("top")) {
      newHeight = Math.max(150, startHeight - dy);
      windowElement.style.top = `${startTop + dy}px`;
    }

    windowElement.style.width = `${newWidth}px`;
    windowElement.style.height = `${newHeight}px`;
  }
});
async function fetchUserPackages(username) {
  const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=maintainer:${username}`);
  const data = await response.json();
  return data.objects.map(pkg => pkg.package.name);
}



document.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  updateTerminalTitle();
});
