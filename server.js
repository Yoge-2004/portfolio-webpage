import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // CORS & Security headers compatible with preview iframe
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  // Intentional error routes
  if (pathname === '/400') {
    serveFile(path.join(__dirname, '400.html'), 400, res);
    return;
  }
  if (pathname === '/401') {
    serveFile(path.join(__dirname, '401.html'), 401, res);
    return;
  }
  if (pathname === '/403') {
    serveFile(path.join(__dirname, '403.html'), 403, res);
    return;
  }
  if (pathname === '/404') {
    serveFile(path.join(__dirname, '404.html'), 404, res);
    return;
  }
  if (pathname === '/500') {
    serveFile(path.join(__dirname, '500.html'), 500, res);
    return;
  }
  if (pathname === '/503') {
    serveFile(path.join(__dirname, '503.html'), 503, res);
    return;
  }

  // Root mapping
  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = path.join(__dirname, pathname);

  // Guard against directory traversal
  if (!filePath.startsWith(__dirname)) {
    serveFile(path.join(__dirname, '400.html'), 400, res);
    return;
  }

  // Check file existence
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If path doesn't exist, try appending .html
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath)) {
        serveFile(htmlPath, 200, res);
        return;
      }
      serveFile(path.join(__dirname, '404.html'), 404, res);
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    serveFile(filePath, 200, res);
  });
});

function serveFile(filePath, statusCode, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (statusCode !== 404 && fs.existsSync(path.join(__dirname, '404.html'))) {
        serveFile(path.join(__dirname, '404.html'), 404, res);
        return;
      }
      res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Error ${statusCode}: Unable to load resource.`);
      return;
    }

    res.writeHead(statusCode, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
}

server.listen(PORT, HOST, () => {
  console.log(`[Portfolio Server] Listening on http://${HOST}:${PORT}`);
});
