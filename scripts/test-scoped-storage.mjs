import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('./storage-runtime-fragment.js', import.meta.url), 'utf8');
function environment(initialOwner = 'httq_state:guest') {
  let owner = initialOwner, rejectStorage = false;
  class FakeStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.get(String(key)) ?? null; }
    setItem(key, value) { if (rejectStorage) throw new Error('QuotaExceededError'); this.values.set(String(key), String(value)); }
    removeItem(key) { this.values.delete(String(key)); }
  }
  class FakeStorageEvent {
    constructor(type, init) { this.type = type; Object.assign(this, init); this.stopped = false; }
    stopImmediatePropagation() { this.stopped = true; }
  }
  const localStorage = new FakeStorage(), sessionStorage = new FakeStorage(), listeners = [];
  const window = { localStorage, addEventListener: (type, callback, capture) => listeners.push({ type, callback, capture }),
    dispatchEvent: event => { for (const listener of [...listeners].sort((a, b) => Number(b.capture || 0) - Number(a.capture || 0))) { if (listener.type === event.type) listener.callback(event); if (event.stopped) break; } return true; } };
  const context = { Storage: FakeStorage, StorageEvent: FakeStorageEvent, window, localStorage, sessionStorage,
    getStudyStateStorageKey: () => { localStorage.getItem('httq_supabase_session'); return owner; } };
  vm.createContext(context); vm.runInContext(source, context);
  return { context, localStorage, sessionStorage, window, FakeStorageEvent,
    owner: value => { owner = value; }, failStorage: () => { rejectStorage = true; } };
}
let count = 0;
async function test(name, callback) { await callback(); count++; console.log(`PASS ${name}`); }
await test('legacy device progress migrates only to guest and keeps the original data', () => {
  const env = environment('httq_state:user:a');
  env.localStorage.setItem('xhz-practice-v1', JSON.stringify({ items: { '旧': {} } }));
  assert.equal(env.context.initializeScopedStorage(), true);
  assert.equal(env.localStorage.getItem('xhz-practice-v1'), null);
  env.owner('httq_state:guest');
  assert.ok(JSON.parse(env.localStorage.getItem('xhz-practice-v1')).items['旧']);
  assert.equal(env.localStorage.values.has('xhz-practice-v1'), false);
  assert.ok(env.localStorage.values.has('xhz-practice-v1:httq_state:guest'));
  env.owner('httq_state:user:a'); assert.equal(env.localStorage.getItem('xhz-practice-v1'), null);
});
await test('A/B/guest cannot read each other chat history or overwrite each other progress', () => {
  const env = environment(); env.context.initializeScopedStorage();
  const keys = ['httq_companion_chat_turns', 'xhz-study-time-v1', 'xhz-intake-v1', 'httq_account_profile'];
  for (const owner of ['guest', 'user:a', 'user:b']) {
    env.owner(`httq_state:${owner}`);
    for (const key of keys) { assert.equal(env.localStorage.getItem(key), null); env.localStorage.setItem(key, `${owner}-data`); }
  }
  for (const owner of ['guest', 'user:a', 'user:b']) { env.owner(`httq_state:${owner}`); for (const key of keys) assert.equal(env.localStorage.getItem(key), `${owner}-data`); }
});
await test('removeItem clears only the active owner and does not resurrect legacy guest data', () => {
  const env = environment(); env.localStorage.setItem('httq_learning_profile', 'old-guest'); env.context.initializeScopedStorage();
  env.owner('httq_state:user:a'); env.localStorage.setItem('httq_learning_profile', 'A'); env.localStorage.removeItem('httq_learning_profile');
  env.owner('httq_state:guest'); assert.equal(env.localStorage.getItem('httq_learning_profile'), 'old-guest');
  env.localStorage.removeItem('httq_learning_profile'); assert.equal(env.localStorage.getItem('httq_learning_profile'), null);
});
await test('auth credentials and arbitrary non-whitelist keys remain unmodified without recursion', () => {
  const env = environment(); env.context.initializeScopedStorage();
  for (const key of ['httq_supabase_session', 'xiehanzi_access_token', 'httq_user_id', 'theme', 'httq_state:user:a']) env.localStorage.setItem(key, `value-${key}`);
  env.owner('httq_state:user:a');
  for (const key of ['httq_supabase_session', 'xiehanzi_access_token', 'httq_user_id', 'theme', 'httq_state:user:a']) assert.equal(env.localStorage.getItem(key), `value-${key}`);
});
await test('sessionStorage uses the original key space even for whitelisted names', () => {
  const env = environment(); env.context.initializeScopedStorage();
  env.sessionStorage.setItem('httq_companion_chat_turns', 'session-specific'); env.owner('httq_state:user:b');
  assert.equal(env.sessionStorage.getItem('httq_companion_chat_turns'), 'session-specific');
  assert.equal(env.sessionStorage.values.has('httq_companion_chat_turns'), true);
  env.sessionStorage.removeItem('httq_companion_chat_turns'); assert.equal(env.sessionStorage.values.size, 0);
});
await test('initialization is idempotent and never appends the owner suffix twice', () => {
  const env = environment(); env.context.initializeScopedStorage(); env.context.initializeScopedStorage();
  env.localStorage.setItem('httq_current_lesson_id', 'bai-1');
  assert.deepEqual([...env.localStorage.values.keys()], ['httq_current_lesson_id:httq_state:guest']);
});
await test('active-owner storage events reach original bundle listeners with their original key', () => {
  const env = environment('httq_state:user:a'); env.context.initializeScopedStorage();
  const received = []; env.window.addEventListener('storage', event => received.push(event.key));
  env.window.dispatchEvent(new env.FakeStorageEvent('storage', { storageArea: env.localStorage, key: 'xhz-practice-v1:httq_state:user:a', newValue: '{}' }));
  assert.deepEqual(received, ['xhz-practice-v1']);
  env.window.dispatchEvent(new env.FakeStorageEvent('storage', { storageArea: env.localStorage, key: 'xhz-practice-v1:httq_state:user:b', newValue: 'private-other-user' }));
  assert.deepEqual(received, ['xhz-practice-v1']);
});
await test('native storage failures still propagate and never silently discard writes', () => {
  const env = environment(); env.context.initializeScopedStorage(); env.failStorage();
  assert.throws(() => env.localStorage.setItem('httq_habit_settings', '{}'), /QuotaExceededError/);
  assert.equal(env.localStorage.getItem('httq_habit_settings'), null);
});
await test('dictation, pinyin history, and offline review signals are isolated across A/B/guest', () => {
  const env = environment(); env.context.initializeScopedStorage();
  const keys = ['xiehanzi:dictation:video-regression', 'them-pinyin-history', 'xhz-review-signals-v1'];
  for (const owner of ['guest', 'user:a', 'user:b']) {
    env.owner(`httq_state:${owner}`);
    for (const key of keys) { assert.equal(env.localStorage.getItem(key), null); env.localStorage.setItem(key, JSON.stringify({ owner })); }
  }
  for (const owner of ['guest', 'user:a', 'user:b']) {
    env.owner(`httq_state:${owner}`);
    for (const key of keys) assert.equal(JSON.parse(env.localStorage.getItem(key)).owner, owner);
  }
  env.owner('httq_state:user:a'); keys.forEach(key => env.localStorage.removeItem(key));
  env.owner('httq_state:user:b'); for (const key of keys) assert.equal(JSON.parse(env.localStorage.getItem(key)).owner, 'user:b');
});
await test('new scoped content keys translate active-owner events and suppress other owners', () => {
  const env = environment('httq_state:user:a'); env.context.initializeScopedStorage();
  const keys = ['xiehanzi:dictation:video-regression', 'them-pinyin-history', 'xhz-review-signals-v1'];
  const received = []; env.window.addEventListener('storage', event => received.push({ key: event.key, value: event.newValue }));
  for (const key of keys) {
    env.window.dispatchEvent(new env.FakeStorageEvent('storage', { storageArea: env.localStorage, key: `${key}:httq_state:user:a`, newValue: 'own-data' }));
    env.window.dispatchEvent(new env.FakeStorageEvent('storage', { storageArea: env.localStorage, key: `${key}:httq_state:user:b`, newValue: 'other-private-data' }));
  }
  assert.deepEqual(received, keys.map(key => ({ key, value: 'own-data' })));
  env.owner('httq_state:user:b'); env.window.dispatchEvent(new env.FakeStorageEvent('storage', { storageArea: env.localStorage, key: `${keys[0]}:httq_state:user:b`, newValue: 'b-data' }));
  assert.deepEqual(received.at(-1), { key: keys[0], value: 'b-data' });
});
console.log(`${count} scoped native Storage checks passed. No real browser profile or account data was accessed.`);
