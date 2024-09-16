import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import SERVER_PORT from './common_critical_data.js';
const SERVER_CRITICAL_DATA = {
  SERVER_PORT: SERVER_PORT,
  BUILD_PATH: `${__dirname}/build/`,
  DATABASE_HOST: 'localhost',
  DATABASE_USER: 'postgres',
  DATABASE_PW: 'aiieaaaa',
  CODE_NOTES_DATABASE: 'baldwin_web_db',
  SPLICE_LOG_DATABASE: 'postgres',
  DEBUG_STATE: false
};

export default SERVER_CRITICAL_DATA;
