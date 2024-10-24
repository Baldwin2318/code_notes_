import bodyParser from "body-parser";
import cors from "cors";
import express from 'express';
import http from 'http';
import baldwin_web_router1 from './routes/baldwin_web_router1.js';

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(cors());
let port = 3002;

baldwin_web_router1(app);

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

