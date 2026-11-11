import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// Offline audit: the runtime's fetch can read only workspace JSON. External calls
// are blocked and localStorage is an in-memory Map. No browser/account is used.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'assets', 'pages', 'node_modules']);
const slash = value => value.replaceAll('\\', '/');
async function walk(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignored.has(entry.name) && !(dir === root && entry.name === 'media')) result.push(...await walk(path.join(dir, entry.name)));
    else if (entry.isFile()) result.push(path.join(dir, entry.name));
  }
  return result;
}
const files = await walk(root);
const relativeFiles = new Set(files.map(file => slash(path.relative(root, file))));
const htmlFiles = files.filter(file => file.endsWith('.html'));
const runtime = await fs.readFile(path.join(root, 'xiehanzi-runtime.js'), 'utf8');
const vercel = JSON.parse(await fs.readFile(path.join(root, 'vercel.json'), 'utf8'));
function htmlRoute(file) {
  let route = '/' + slash(path.relative(root, file)).replace(/\.html$/, '').replace(/\/index$/, '');
  return route === '/index' ? '/' : route;
}
const routeMap = new Map();
for (const file of htmlFiles) {
  const route = htmlRoute(file);
  if (!routeMap.has(route) || !file.endsWith(`${path.sep}index.html`)) routeMap.set(route, file);
}
function compileRewrite(source) {
  return new RegExp('^' + source.replace(/\./g, '\\.').replace(/\/:([\w]+)([+*]?)/g, (_, key, quantifier) => {
    if (quantifier === '*') return `(?:/(?<${key}>.*))?`;
    if (quantifier === '+') return `/(?<${key}>.+)`;
    return `/(?<${key}>[^/]+)`;
  }) + '$');
}
const rewrites = vercel.rewrites.map(item => ({ ...item, pattern: compileRewrite(item.source) }));
function fileForUrl(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { decoded = urlPath; }
  const bare = decoded.replace(/^\//, '').replace(/\/$/, '');
  return [bare, `${bare}.html`, `${bare}/index.html`, bare === '' ? 'index.html' : ''].find(item => item && relativeFiles.has(item));
}
function resolveRoute(urlPath) {
  const direct = fileForUrl(urlPath);
  if (direct) return { type: 'file', destination: direct };
  for (const rewrite of rewrites) {
    const match = urlPath.match(rewrite.pattern);
    if (!match) continue;
    const destination = rewrite.destination.replace(/:([\w]+)[+*]?/g, (_, key) => match.groups?.[key] || '');
    return { type: 'rewrite', source: rewrite.source, destination, exists: Boolean(fileForUrl(destination) || relativeFiles.has(destination.replace(/^\//, '') + '.js')) };
  }
  return null;
}
const missing = new Map();
const dynamicLiterals = new Map();
function recordMissing(urlPath, source, kind) {
  const key = `${kind} ${urlPath}`;
  if (!missing.has(key)) missing.set(key, { path: urlPath, kind, sources: new Set() });
  missing.get(key).sources.add(source);
}
const routes = [];
for (const [route, file] of [...routeMap].sort(([a], [b]) => a.localeCompare(b))) {
  const source = slash(path.relative(root, file));
  const html = await fs.readFile(file, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '';
  routes.push({ route, file: source, title, runtime: html.includes('/xiehanzi-runtime.js') });
  for (const match of html.matchAll(/\b(href|src)=["']([^"']+)["']/g)) {
    const raw = match[2].replaceAll('&amp;', '&');
    if (!raw.startsWith('/') || raw.startsWith('//')) continue;
    const urlPath = raw.split(/[?#]/)[0];
    if (!urlPath || urlPath === '/_next/image') continue;
    const resolution = resolveRoute(urlPath);
    if (!resolution || resolution.exists === false) recordMissing(urlPath, source, match[1]);
  }
}
for (const match of runtime.matchAll(/href=["'](\/[^"'\s]*)["']/g)) {
  const raw = match[1].split(/[?#]/)[0];
  if (raw.includes('${')) continue;
  const line = runtime.slice(0, match.index).split('\n').length;
  if (!resolveRoute(raw)) {
    if (!dynamicLiterals.has(raw)) dynamicLiterals.set(raw, []);
    dynamicLiterals.get(raw).push(line);
  }
}
const missingJsonLiterals = [...runtime.matchAll(/["'`](\/data\/[^"'`\r\n$]+\.json)["'`]/g)]
  .filter(match => !fileForUrl(match[1]))
  .map(match => ({ path: match[1], line: runtime.slice(0, match.index).split('\n').length }));

const apiLiterals = new Map();
for (const file of files.filter(file => file.endsWith('.js') && slash(path.relative(root, file)).startsWith('_next/'))) {
  const js = await fs.readFile(file, 'utf8');
  for (const match of js.matchAll(/["'`](\/v[12]\/[^"'`\s\\<>]{1,180})["'`]/g)) {
    const endpoint = match[1];
    if (endpoint.includes('${')) continue;
    if (!apiLiterals.has(endpoint)) apiLiterals.set(endpoint, new Set());
    apiLiterals.get(endpoint).add(slash(path.relative(root, file)));
  }
}
const storage = new Map();
const blockedFetches = [];
const localFetch = async (input, init) => {
  const url = new URL(String(input), 'https://offline.invalid');
  if (url.origin !== 'https://offline.invalid' || !url.pathname.startsWith('/data/') || (init?.method && init.method !== 'GET')) {
    blockedFetches.push({ path: url.pathname, method: init?.method || 'GET' });
    return new Response('{}', { status: 503 });
  }
  try {
    const localPath = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!localPath.startsWith(root + path.sep)) return new Response('{}', { status: 403 });
    return new Response(await fs.readFile(localPath), { headers: { 'Content-Type': 'application/json' } });
  } catch { return new Response('{}', { status: 404 }); }
};
class FakeElement { setAttribute() {} }
class FakeXHR { open() {} send() {} }
function FakeAudio() { this.play = () => Promise.resolve(); }
const document = { readyState: 'loading', addEventListener() {}, querySelectorAll: () => [] };
const sandbox = {
  URL, URLSearchParams, Response, Request, Headers, FormData, Blob, TextEncoder, TextDecoder,
  console, Map, Set, Date, Math, JSON, Element: FakeElement,
  HTMLImageElement: FakeElement, HTMLScriptElement: FakeElement,
  XMLHttpRequest: FakeXHR, document, navigator: {},
  history: { pushState() {}, replaceState() {} },
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
};
sandbox.window = { fetch: localFetch, Audio: FakeAudio, location: { origin: 'https://offline.invalid', pathname: '/', search: '' }, addEventListener() {} };
vm.createContext(sandbox);
const instrumented = runtime.replace(/\}\)\(\);\s*$/, 'window.__auditApi = handleApiRequest; window.__auditLookupPaper = loadTestPaperById; })();');
vm.runInContext(instrumented, sandbox, { timeout: 5000, filename: 'xiehanzi-runtime.js' });
const genericFallbacks = [];
const apiErrors = [];
const candidateKind = endpoint => /\/$|[?=]$/.test(endpoint) ? 'prefix_or_partial_literal' : 'literal';
for (const [endpoint, sources] of [...apiLiterals].sort(([a], [b]) => a.localeCompare(b))) {
  let deadline;
  try {
    const probe = async () => {
      const response = await sandbox.window.__auditApi(endpoint, { method: 'GET' });
      if (!response.headers.get('content-type')?.includes('application/json')) {
        await response.body?.cancel();
        return null;
      }
      return response.json();
    };
    const body = await Promise.race([probe(), new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Offline probe timed out after 1500ms')), 1500); })]);
    if (body?.ok === true && body?.data === null && Array.isArray(body.items) && body.items.length === 0) {
      genericFallbacks.push({ endpoint, candidateKind: candidateKind(endpoint), probeMethod: 'GET', sources: [...sources] });
    }
  } catch (error) { apiErrors.push({ endpoint, candidateKind: candidateKind(endpoint), probeMethod: 'GET', message: error.message, sources: [...sources] }); }
  finally { clearTimeout(deadline); }
}
const readJson = async name => JSON.parse(await fs.readFile(path.join(root, name), 'utf8'));
const characterIndex = await readJson('data/characters/index.json');
const vocabularyIndex = await readJson('data/vocabulary/index.json');
const hanVietIndex = await readJson('data/han-viet/index.json');
const dictationVideos = await readJson('data/dictation/videos-all.json');
const dataSummary = {
  characters: characterIndex.length, vocabulary: vocabularyIndex.length, hanViet: hanVietIndex.length,
  dictationVideos: dictationVideos.length,
  examPapers: files.filter(file => /\/data\/tests\/papers\/[^/]+\.json$/.test(slash(file))).length,
  curriculums: [...new Set(files.map(file => slash(path.relative(root, file)).match(/^data\/curriculums\/([^/]+)\//)?.[1]).filter(Boolean))].sort(),
  curriculumJsonFiles: files.filter(file => /\/data\/curriculums\/.*\.json$/.test(slash(file))).length,
};
const output = {
  method: 'Offline static route/link inventory and isolated runtime GET probes; no network access or real account state.',
  limitations: 'Endpoint literals can be concatenated prefixes and the GET probe may differ from the client method. A generic fallback here is a candidate for contract inspection, not proof of a broken user flow. Browser behavior and live origin parity require separate validation.',
  htmlFileCount: htmlFiles.length,
  canonicalRouteCount: routes.length,
  routes,
  dataSummary,
  missingStaticReferences: [...missing.values()].map(item => ({ ...item, sources: [...item.sources] })),
  missingRuntimeLinks: [...dynamicLiterals].map(([route, lines]) => ({ route, lines })),
  missingJsonLiterals,
  literalEndpointCount: apiLiterals.size,
  genericFallbacks,
  apiErrors,
  blockedFetches,
};
if (process.argv[2]) {
  const outputPath = path.resolve(process.argv[2]);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2) + '\n');
}
console.log(JSON.stringify({ ...output, routes: undefined, genericFallbacks: genericFallbacks.map(item => item.endpoint), missingStaticReferences: output.missingStaticReferences.map(item => ({ ...item, sources: item.sources.slice(0, 3), sourceCount: item.sources.length })) }, null, 2));
