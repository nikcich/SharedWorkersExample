// sharedWorker.js
const connectedPorts = [];

const MESSAGE_TYPES = {
    FOCUS: "focus",
    MESSAGE: "message",
    CLOSE: "close",
    LOG: "log"
};

let portMapping = {};

function generateUniqueID() {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 1000); // Replace 1000 with a suitable range.

    let id = `${timestamp}-${randomPart}`;
    if (id in Object.keys(portMapping)) {
        return generateUniqueID();
    } else {
        return id;
    }
}

self.onconnect = function (e) {
    const port = e.ports[0];

    let connectionId = generateUniqueID();

    portMapping[connectionId] = port;

    port.onmessage = function (event) {
        const message = event.data;

        if (message.type == MESSAGE_TYPES.MESSAGE) {

            // Send the message to all connected applications, excluding the sender
            for (const connectedPort of Object.values(portMapping)) {
                if (connectedPort !== port) {
                    connectedPort.postMessage(message);
                }
            }

            // Send the list of connected ports (windows/tabs) to all applications
            const connections = Object.values(portMapping).map((connectedPort) => {
                return connectedPort.toString();
            });

            for (const connectedPort of Object.values(portMapping)) {
                connectedPort.postMessage({ connections: connections });
            }

        } else if (message.type == MESSAGE_TYPES.CLOSE) {

            delete portMapping[connectionId];

            logToMainConsole('CLOSING ' + connectionId);
        }

    };

    const logToMainConsole = (message) => {
        for (let port of Object.values(portMapping)) {
            port.postMessage({ type: MESSAGE_TYPES.LOG, message: message });
        }
    };


    port.onmessageerror = function (event) {
        // Handle message errors (e.g., when a window/tab gets closed)
        const closedPort = event.target;

        delete portMapping[connectionId];
    };
};
