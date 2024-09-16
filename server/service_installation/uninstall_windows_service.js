import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import nw from 'node-windows';
var Service = nw.Service;

// Create a new service object
var svc = new Service({
  name:'BM Code Notes',
  description: 'Code Notes',
  script: `${__dirname}\\..\\index.js`
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();
