import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// Serve this static export locally with the same route shells as Vercel.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm' };
const rewrites = config.rewrites.map(rule => ({
  ...rule,
  regex: new RegExp('^' + rule.source.replace(/\./g, '\\.').replace(/\/:([A-Za-z][\w]*)([+*]?)/g, (_, name, modifier) =>
    modifier === '*' ? `(?:/(?<${name}>.*))?` : modifier === '+' ? `/(?<${name}>.+)` : `/(?<${name}>[^/]+)`) + '$')
}));
const require = createRequire(import.meta.url);

async function resolveFile(urlPath) {
  const resolved = path.resolve(root, '.' + urlPath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  for (const candidate of [resolved, resolved + '.html', path.join(resolved, 'index.html')]) {
    if ((await fs.stat(candidate).catch(() => null))?.isFile()) return candidate;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
    if (pathname.startsWith('/.git') || pathname.startsWith('/.env')) { res.writeHead(404).end(); return; }
    if (pathname === '/api/ai') {
      let body = '';
      for await (const chunk of req) body += chunk;
      req.body = body;
      req.query = Object.fromEntries(url.searchParams);
      res.status = code => { res.statusCode = code; return res; };
      res.json = value => { res.setHeader('Content-Type', types['.json']); res.end(JSON.stringify(value)); };
      await require('../api/ai.js')(req, res);
      return;
    }
    let file = await resolveFile(pathname);
    if (!file) {
      const rule = rewrites.find(rule => rule.regex.test(pathname));
      if (rule) {
        const match = pathname.match(rule.regex);
        const destination = rule.destination.replace(/:([A-Za-z][\w]*)[+*]?/g, (_, name) => match.groups?.[name] || '');
        file = await resolveFile(destination);
      }
    }
    if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await fs.readFile(file));
  } catch (error) {
    console.error(error.message);
    res.writeHead(500).end('Local server error');
  }
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('Local app: http://127.0.0.1:' + server.address().port));
