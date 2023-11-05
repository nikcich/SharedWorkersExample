
/** 
 *   Types of messages supported
 */

const MESSAGE_TYPES = {
    FOCUS: "focus",
    MESSAGE: "message",
    CLOSE: "close",
    LOG: "log",
    TOGGLE_THEME: "theme",
};

// Global theme variable with default set to LIGHT
var THEME = "LIGHT";

/**
 * Port mapping maintains a mapping of IDs to their port objects
 */

let portMapping = {};

/**
 * This function is used to create a "unique" ID for each port connection of the SharedWorker instance
 */

const generateUniqueID = () => {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 1000); // Replace 1000 with a suitable range.

    let id = `${timestamp}-${randomPart}`;
    if (id in Object.keys(portMapping)) {
        return generateUniqueID();
    } else {
        return id;
    }
}

/**
 * When a connection is established between a SharedWorker and a client instance
 * The follow function is executed setting up the messaging capabilities
 */

self.onconnect = function (e) {
    const port = e.ports[0];                    // Get the port
    const connectionId = generateUniqueID();    // Generate ID
    portMapping[connectionId] = port;           // Store connection port in portMapping

    // Send the current selected theme immediately upon client connection
    port.postMessage({ type: MESSAGE_TYPES.TOGGLE_THEME, theme: THEME });

    /**
     * 
     * @param {*} message 
     * Send the log message to each connected client for logging purposes
     */
    const logToMainConsole = (message) => {
        for (let port of Object.values(portMapping)) {
            port.postMessage({ type: MESSAGE_TYPES.LOG, message: message });
        }
    };

    /**
     * 
     * @param {*} message 
     * Handle incoming messages from clients, sending it to all OTHER clients.
     */
    const handleMessage = (message) => {
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
    }

    /**
     * Close the connection and log that a connection is closing on all connection clients
     */
    const handleClose = () => {
        delete portMapping[connectionId];
        logToMainConsole('CLOSING ' + connectionId);
    }

    /**
     * Toggle the active theme and send messages to connected clients with the new theme
     */
    const handleToggleTheme = () => {
        THEME = THEME === 'LIGHT' ? 'DARK' : 'LIGHT';

        for (let port of Object.values(portMapping)) {
            port.postMessage({ type: MESSAGE_TYPES.TOGGLE_THEME, theme: THEME });
        }
    }

    /**
     * 
     * @param {*} event 
     * 
     * Route the incoming message based on the type property expected to be in the message
     */
    port.onmessage = function (event) {
        const message = event.data;

        if (message?.type == MESSAGE_TYPES.MESSAGE) {
            handleMessage(message);
        } else if (message?.type == MESSAGE_TYPES.CLOSE) {
            handleClose();
        } else if (message?.type == MESSAGE_TYPES.TOGGLE_THEME) {
            handleToggleTheme();
        }

    };

    /**
     * @param {*} event 
     * 
     * If there is an error with messaging, close the connection.
     */
    port.onmessageerror = function (event) {
        handleClose();
    };
};
