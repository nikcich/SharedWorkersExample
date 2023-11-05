// Importing necessary modules and dependencies
import { MESSAGE_TYPES } from '../Shared/SharedWorkerMessageTypes.js';
import { AppURLs } from '../Shared/AppURLs.js';

// Creating a Shared Worker and obtaining its port
const sharedWorker = new SharedWorker('../Shared/sharedWorker.js');
const port = sharedWorker.port;

// Getting references to various DOM elements
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const launchP = document.getElementById('launchButtonPrimary');
const launchS = document.getElementById('launchButtonSecondary');
const toggleTheme = document.getElementById('toggleTheme');
const INSTANCE = window.INSTANCE; // Storing a reference to the current window instance
const dropTarget = document; // Setting the drop target to the entire document

// Adding a 'dragover' event listener to allow for drag-and-drop
dropTarget.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevent the default behavior to enable dropping
});

// Adding a 'drop' event listener to handle the drop operation
dropTarget.addEventListener('drop', (event) => {
    event.preventDefault(); // Prevent the default behavior

    // Retrieve the dropped JSON data
    const data = event.dataTransfer.getData('application/json');
    console.log('Dropped data: ' + data);

    // Creating a draggable element and configuring it
    const draggableElement = document.createElement('div');
    draggableElement.className = 'draggableElement';
    draggableElement.draggable = true;
    draggableElement.textContent = data;

    // Configuring the 'ondragstart' event for the draggable element
    draggableElement.ondragstart = function (event) {
        event.dataTransfer.setData('application/json', data);
    };

    // Appending the draggable element to a target div
    const targetDiv = document.getElementById('dragDropContent'); // Replace with the actual target element
    targetDiv.appendChild(draggableElement);
});

// Function to include a CSS file dynamically
const includeCSS = (cssFile) => {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = cssFile;
    document.head.appendChild(link);
}

// Function to remove a CSS file dynamically
const removeCSS = (cssFile) => {
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute("href") === cssFile) {
            links[i].parentNode.removeChild(links[i]);
            break;
        }
    }
}

// Handling messages received from the Shared Worker
port.onmessage = function (event) {
    const data = event.data;

    if (data.type == MESSAGE_TYPES.TOGGLE_THEME) {
        // Toggle the theme by including or removing a CSS file
        if (data.theme == "DARK") {
            includeCSS("../Shared/dark.css");
        } else {
            removeCSS("../Shared/dark.css");
        }

        return;
    }

    if (data.type === MESSAGE_TYPES.LOG) {
        // Log a message to the console
        console.log(data.message);
        return;
    }

    if (data.message) {
        // Handle chat messages and display them in the chat box
        const message = data.message;
        chatBox.innerHTML += `<p>${message}</p>`;
    }

    if (data.connections) {
        // Log the list of connected ports (windows/tabs) to the console
        console.log('Connected ports:', data.connections);
    }
};

// Handling the 'click' event for sending a chat message
sendMessageButton.addEventListener('click', function () {
    const message = INSTANCE + ": " + messageInput.value;
    if (message.trim() !== '') {
        // Send the message to the Shared Worker
        port.postMessage({ type: MESSAGE_TYPES.MESSAGE, message: message });
        chatBox.innerHTML += `<p>${message}</p>`;
        messageInput.value = '';
    }
});

// Handling the 'click' event for launching the primary window
launchP.addEventListener('click', function () {
    const url = AppURLs["PRIMARY"];
    const windowName = 'MyPopupWindow';
    const windowFeatures = 'scrollbars=yes,modal=yes,width=400,height=400';
    const newWindow = window.open(url, windowName, windowFeatures);
});

// Handling the 'click' event for launching the secondary window
launchS.addEventListener('click', function () {
    const url = AppURLs["SECONDARY"];
    const windowFeatures = 'scrollbars=yes,modal=yes,width=400,height=400';
    const timestamp = new Date().getTime();
    const newWindow = window.open(url, `${timestamp}`, windowFeatures);
});

// Handling the 'click' event for toggling the theme
toggleTheme.addEventListener('click', function () {
    // Send a message to the Shared Worker to toggle the theme
    port.postMessage({
        type: MESSAGE_TYPES.TOGGLE_THEME
    });
});

// Handling the 'beforeunload' event to notify the Shared Worker before closing the window
window.addEventListener('beforeunload', function () {
    port.postMessage({ type: MESSAGE_TYPES.CLOSE, command: 'closing' });
});
