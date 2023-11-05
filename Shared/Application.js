import { MESSAGE_TYPES } from '../Shared/SharedWorkerMessageTypes.js';
import { AppURLs } from '../Shared/AppURLs.js';

const sharedWorker = new SharedWorker('../Shared/sharedWorker.js');
const port = sharedWorker.port;
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const launchP = document.getElementById('launchButtonPrimary');
const launchS = document.getElementById('launchButtonSecondary');
const toggleTheme = document.getElementById('toggleTheme');
const INSTANCE = window.INSTANCE;

const draggableElement = document.getElementById('.draggableElement');
const dropTarget = document;

// Prevent the default behavior of the drop event
dropTarget.addEventListener('dragover', (event) => {
    event.preventDefault();
});

// Handle the drop event
dropTarget.addEventListener('drop', (event) => {
    event.preventDefault();

    const data = event.dataTransfer.getData('application/json');
    console.log('Dropped data: ' + data);

    const draggableElement = document.createElement('div');
    draggableElement.className = 'draggableElement';
    draggableElement.draggable = true;
    draggableElement.textContent = data;

    draggableElement.ondragstart = function (event) {
        event.dataTransfer.setData('application/json', data);
    };

    const targetDiv = document.getElementById('dragDropContent');

    targetDiv.appendChild(draggableElement);
});

const includeCSS = (cssFile) => {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = cssFile;
    document.head.appendChild(link);
}

const removeCSS = (cssFile) => {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute("href") === cssFile) {
            links[i].parentNode.removeChild(links[i]);
            break; // Remove only the first occurrence
        }
    }
}

port.onmessage = function (event) {
    const data = event.data;

    if (data.type == MESSAGE_TYPES.TOGGLE_THEME) {

        if (data.theme == "DARK") {
            includeCSS("../Shared/dark.css");
        } else {
            removeCSS("../Shared/dark.css");
        }

        return;
    }

    if (data.type === MESSAGE_TYPES.LOG) {
        console.log(data.message);
        return;
    }

    if (data.message) {
        // Handle chat messages
        const message = data.message;
        chatBox.innerHTML += `<p>${message}</p>`;
    }

    if (data.connections) {
        // Log the list of connected ports (windows/tabs) to the console
        console.log('Connected ports:', data.connections);
    }
};

sendMessageButton.addEventListener('click', function () {
    const message = INSTANCE + ": " + messageInput.value;
    if (message.trim() !== '') {
        // Send the message to the SharedWorker
        port.postMessage({ type: MESSAGE_TYPES.MESSAGE, message: message });
        // Display sent messages in the chatBox
        chatBox.innerHTML += `<p>${message}</p>`;
        // Clear the input field
        messageInput.value = '';
    }
});

launchP.addEventListener('click', function () {
    const url = AppURLs["PRIMARY"];
    const windowName = 'MyPopupWindow'; // Unique name for the popup window.
    const windowFeatures = 'scrollbars=yes,modal=yes,width=400,height=400'; // Customize window features.

    const newWindow = window.open(url, windowName, windowFeatures);
});

launchS.addEventListener('click', function () {
    const url = AppURLs["SECONDARY"];
    const windowFeatures = 'scrollbars=yes,modal=yes,width=400,height=400'; // Customize window features.
    const timestamp = new Date().getTime();
    const newWindow = window.open(url, `${timestamp}`, windowFeatures);
});

toggleTheme.addEventListener('click', function () {
    port.postMessage({
        type: MESSAGE_TYPES.TOGGLE_THEME
    });
});

window.addEventListener('beforeunload', function () {
    port.postMessage({ type: MESSAGE_TYPES.CLOSE, command: 'closing' });
});