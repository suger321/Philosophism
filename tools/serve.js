/* 极简静态服务器，只在没有 Python 时兜底用 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.argv[2]) || 8787;
const root = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  const raw = (req.url || '/').split('?')[0];
  let rel = decodeURIComponent(raw);
  if (rel === '/' || rel === '') rel = 'index.html';
  const file = path.resolve(root, rel.replace(/^\/+/, ''));

  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('not found: ' + rel);
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log('  listening http://127.0.0.1:' + port);
});
