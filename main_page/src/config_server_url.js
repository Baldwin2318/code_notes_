const currentOrigin = window.location.origin;
const serverPort = process.env.REACT_APP_SERVER_PORT || '3002';

let serverUrl = currentOrigin;
const portIndex = currentOrigin.lastIndexOf(':');

if (portIndex > -1) {
  serverUrl = currentOrigin.substring(0, portIndex);
}

serverUrl = `${serverUrl}:${serverPort}`;

export default serverUrl;
