import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import cors from "cors";
import express from 'express';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadLocalEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const [{ default: baldwin_web_router1 }, { default: ios_project_router }] = await Promise.all([
  import('./routes/baldwin_web_router1.js'),
  import('./routes/ios_project_router.js')
]);

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(cors());
let port = 3002;

baldwin_web_router1(app);
ios_project_router(app);

app.get('/api/ping', (req, res) => {
  res.send('Pong');
});

process.argv.forEach((val, index, arr) => {
  if (val === `-p` || val === `--port`) {
    port = arr[index + 1];
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

