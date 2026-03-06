import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import SERVER_PORT from './common_critical_data.js';

const SERVER_CRITICAL_DATA = {
  SERVER_PORT,
  BUILD_PATH: `${__dirname}/build/`,
  // Neon postgres connection string:
  // postgres://<user>:<password>@<host>/<db>?sslmode=require
  NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
  DEBUG_STATE: false
};

export default SERVER_CRITICAL_DATA;
