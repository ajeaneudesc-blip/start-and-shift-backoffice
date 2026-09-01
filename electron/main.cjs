const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

// Le bundle n'est PAS chargé en file:// mais servi sur http://localhost:5173
// par ce petit serveur statique. Deux raisons, toutes deux bloquantes :
//   - en file://, le navigateur envoie « Origin: null », que le CORS de l'API
//     refuse (ALLOWED_ORIGINS ne liste que des origines http) ;
//   - localStorage est cloisonné par origine et se comporte mal en file://,
//     la session ne survivrait pas à un redémarrage.
// Le port est le même que le serveur de développement Vite, donc déjà présent
// dans ALLOWED_ORIGINS : rien à changer côté backend.
const PORT = 5173;
const ROOT = path.join(__dirname, '..', 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function serve(req, res) {
  const pathname = decodeURIComponent(url.parse(req.url).pathname || '/');
  // path.normalize + préfixe imposé : sans ça, « /../../ » sortirait de dist.
  const target = path.normalize(path.join(ROOT, pathname));
  const inside = target === ROOT || target.startsWith(ROOT + path.sep);

  // SPA : toute route inconnue retombe sur index.html (react-router).
  const file = inside && fs.existsSync(target) && fs.statSync(target).isFile()
    ? target
    : path.join(ROOT, 'index.html');

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Bundle introuvable. Relancez « npm run build ».');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    backgroundColor: '#0B0B0D',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });

  // Les liens externes partent dans le navigateur du système, pas dans une
  // fenêtre Electron sans barre d'adresse ni indicateur de sécurité.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:/.test(target)) shell.openExternal(target);
    return { action: 'deny' };
  });

  win.loadURL(`http://localhost:${PORT}/`);
}

const server = http.createServer(serve);

app.whenReady().then(() => {
  server.on('error', (err) => {
    // Port déjà pris (serveur Vite en cours, ou seconde instance) : on charge
    // quand même, l'autre processus sert le même contenu sur le même port.
    console.error(`Serveur local sur ${PORT} indisponible :`, err.message);
    createWindow();
  });
  server.listen(PORT, '127.0.0.1', () => createWindow());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  server.close();
  if (process.platform !== 'darwin') app.quit();
});
