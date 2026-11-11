import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// Execute the checked-in Auth implementation with an isolated Storage and mocked fetch.
// No request in this test can reach Supabase or an existing browser profile.
const source = await fs.readFile(new URL('../xiehanzi-runtime.js', import.meta.url), 'utf8');
const head = source.slice(source.indexOf('  const SUPABASE_URL'), source.indexOf('  async function loadLocalJson'));
const helpers = source.slice(source.indexOf('  function jsonResponse'), source.indexOf('  async function callAiEndpoint'));
const progress = source.slice(source.indexOf('  function getIsoWeekKey'), source.indexOf('  function recordStudyProgress'));
const authHandler = source.slice(source.indexOf('  async function handleApiRequest'), source.indexOf("    if (p === '/v2/meta')")) + '\nreturn null;\n}';
const authUrl = 'https://skxgzzdunqloxxombtuc.supabase.co/auth/v1';
const user = (id = 'user-a', data = {}) => ({ id, email: `${id}@example.invalid`, user_metadata: { full_name: `Name ${id}`, ...data }, app_metadata: { provider: 'email', providers: ['email'] } });
const jwt = (id = 'user-a', expires = Math.floor(Date.now() / 1000) + 3600) => `mock.${Buffer.from(JSON.stringify({ sub: id, iss: authUrl, role: 'authenticated', exp: expires })).toString('base64url')}.signature`;
const session = (id = 'user-a', data = {}) => ({ access_token: jwt(id), refresh_token: `refresh-${id}`, user: user(id, data) });
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status });
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
function environment({ initial = {}, hash = '', transport, cloud = false } = {}) {
  class Storage {
    constructor() { this.values = new Map(Object.entries(initial)); }
    getItem(key) { return this.values.get(String(key)) ?? null; }
    setItem(key, value) { this.values.set(String(key), String(value)); }
    removeItem(key) { this.values.delete(String(key)); }
    key(index) { return [...this.values.keys()][index] ?? null; }
    get length() { return this.values.size; }
  }
  const localStorage = new Storage();
  const calls = [];
  const queue = [];
  const redirects = [];
  const location = { hash, pathname: '/tai-khoan', search: '', origin: 'https://offline.invalid', replace: target => redirects.push(target), reload() {} };
  const window = { location, history: { replaceState() {} }, fetch: async (url, init = {}) => {
    const call = { url: String(url), method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null, headers: init.headers || {} };
    calls.push(call);
    if (transport) return transport(call);
    assert.ok(queue.length, `Unexpected mocked request: ${call.method} ${call.url}`);
    const next = queue.shift();
    return typeof next === 'function' ? next(call) : next;
  } };
  const context = { navigator: {}, window, localStorage, Storage, URL, URLSearchParams, Response, FormData, TextDecoder, Uint8Array, atob, setTimeout,
    getLocalState: () => JSON.parse(localStorage.getItem('scoped-study-state') || '{}'),
    handlePersistentApi: async () => null };
  vm.createContext(context);
  vm.runInContext(head + '\n' + helpers + '\n' + progress + '\n' + authHandler, context);
  if (cloud) {
    const merge = source.slice(source.indexOf('  function studyRecordTime'), source.indexOf('  function persistentStudyStorageKey'));
    const functions = source.slice(source.indexOf('  function getStudyStateStorageKey'), source.indexOf('  supabasePull();'));
    assert.ok(merge.includes('function mergeStudyState')); assert.ok(functions.includes('async function supabasePull'));
    vm.runInContext(merge + '\n' + functions, context);
  }
  return { context, localStorage, calls, queue, window, redirects,
    seed(id = 'user-a', data = {}) { const s = session(id, data); assert.ok(context.saveAuthSession(s.access_token, s.refresh_token, s.user)); return s; },
    async request(path, body, method = 'POST') {
      const response = await context.handleApiRequest(`https://offline.invalid${path}`, { method, body: JSON.stringify(body || {}) });
      return { status: response.status, data: await response.json() };
    } };
}

export { environment, user, jwt, session, reply, deferred, authUrl };
