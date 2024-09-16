
var url = window.location.origin;

import SERVER_PORT from './common_critical_data.js';

const port_index = url.lastIndexOf(':');

url = url.substring(0, port_index);

url += `:${SERVER_PORT}`;

const SERVER_URL = url;

export default SERVER_URL;