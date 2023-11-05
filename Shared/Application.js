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

const dropTarget = document;

// Constants for CSS files
const DARK_CSS_FILE = '../Shared/dark.css';

// Constants for the message types
const MESSAGE_TYPE = {
    TOGGLE_THEME: MESSAGE_TYPES.TOGGLE_THEME,
    LOG: MESSAGE_TYPES.LOG,
    MESSAGE: MESSAGE_TYPES.MESSAGE,
    CLOSE: MESSAGE_TYPES.CLOSE,
};

/**
 * Dynamically include a CSS file in the document's head.
 * @param {string} cssFile - The URL of the CSS file to include.
 */
function includeCSS(cssFile) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = cssFile;
    document.head.appendChild(link);
}

/**
 * Remove a dynamically included CSS file from the document's head.
 * @param {string} cssFile - The URL of the CSS file to remove.
 */
function removeCSS(cssFile) {
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.getAttribute('href') === cssFile) {
            link.parentNode.removeChild(link);
            break;
        }
    }
}

/**
 * Create a draggable element with the given data.
 * @param {string} data - The data to set as the element's text content.
 * @returns {HTMLDivElement} - The created draggable element.
 */
function createDraggableElement(data) {
    const draggableElement = document.createElement('div');
    draggableElement.className = 'draggableElement';
    draggableElement.draggable = true;
    draggableElement.textContent = data;

    draggableElement.ondragstart = function (event) {
        event.dataTransfer.setData('application/json', data);
    };

    return draggableElement;
}

/**
 * Handle messages received from the Shared Worker.
 * @param {object} data - The data received from the Shared Worker.
 */
function handleReceivedMessage(data) {
    if (data.type == MESSAGE_TYPE.TOGGLE_THEME) {
        if (data.theme == 'DARK') {
            includeCSS(DARK_CSS_FILE);
        } else {
            removeCSS(DARK_CSS_FILE);
        }
    } else if (data.type === MESSAGE_TYPE.LOG) {
        console.log(data.message);
    } else if (data.message) {
        const message = data.message;
        chatBox.innerHTML += `<p>${message}</p>`;
    } else if (data.connections) {
        console.log('Connected ports:', data.connections);
    }
}

sendMessageButton.addEventListener('click', function () {
    const message = `${INSTANCE}: ${messageInput.value}`;
    if (message.trim() !== '') {
        port.postMessage({ type: MESSAGE_TYPE.MESSAGE, message });
        chatBox.innerHTML += `<p>${message}</p>`;
        messageInput.value = '';
    }
});

launchP.addEventListener('click', function () {
    const url = AppURLs.PRIMARY;
    const windowName = 'MyPopupWindow';
    const windowFeatures = 'scrollbars=yes,modal=yes,width=400,height=400';
    window.open(url, windowName, windowFeatures);
});

launchS.addEventListener('click', function () {
    const url = AppURLs.SECONDARY;
    const windowFeatures = 'scrollbars=yes,modal=yes,width=400,height=400';
    const timestamp = new Date().getTime();
    window.open(url, `${timestamp}`, windowFeatures);
});

toggleTheme.addEventListener('click', function () {
    port.postMessage({ type: MESSAGE_TYPE.TOGGLE_THEME });
});

dropTarget.addEventListener('dragover', (event) => {
    event.preventDefault();
});

dropTarget.addEventListener('drop', (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('application/json');
    console.log('Dropped data: ' + data);
    const draggableElement = createDraggableElement(data);
    const targetDiv = document.getElementById('dragDropContent');
    targetDiv.appendChild(draggableElement);
});

window.addEventListener('beforeunload', function () {
    port.postMessage({ type: MESSAGE_TYPE.CLOSE, command: 'closing' });
});

// Set up a listener for messages from the Shared Worker
port.onmessage = function (event) {
    const data = event.data;
    handleReceivedMessage(data);
};
