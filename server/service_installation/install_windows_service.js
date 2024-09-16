import path from 'path';
import { fileURLToPath } from 'url';
import { Service } from 'node-mac';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new service object
const svc = new Service({
  name: 'BM Code Notes',
  description: 'Code Notes Service on macOS',
  script: `${__dirname}/../index.js`, // Adjust path to your script
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
  console.log('Installation completed!');
  svc.start();
});

// Install the service
svc.install();
