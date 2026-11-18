import assert from 'node:assert/strict';
import { environment, user, jwt, session, reply, deferred, authUrl } from './auth-runtime-harness.mjs';

// The harness evaluates getStudyStateStorageKey/getLocalState/saveLocalState,
// supabaseUpsert/Pull, and mergeStudyState directly from xiehanzi-runtime.js.
const fixtureState = () => ({ masteredChars: { '你': { character: '你', learnedAt: '2026-11-10' } }, savedWords: { '你好': { word: '你好' } },
  examCount: 2, history: [{ id: 'local-exam', at: '2026-11-10T10:00:00Z', score: 80 }],
  v10Learning: { activeRun: 'hsk30.L1.P1.learn.1', mode: 'practice' },
  collections: { library: [{ _id: 'local-note', text: '你', createdAt: '2026-11-10T10:00:00Z' }], worksheets: [{ _id: 'local-sheet', text: '你好' }],
    reviewCards: [{ itemKey: 'w:你好', skill: 'meaning', dueAt: '2026-11-12T10:00:00Z', attempts: 1 }], speaking: { nihao: { best: 90, attempts: 2 } } } });
const ownerKey = id => `httq_state:user:${id}`;
const tick = () => new Promise(resolve => setImmediate(resolve));
let checks = 0;
async function test(name, callback) { await callback(); checks++; console.log(`PASS ${name}`); }

await test('expired real sessions retain owner scope and use refreshed JWT for cloud writes', async () => {
  const e = environment({ cloud: true, initial: { sb_access_token: jwt('user-a', 1), sb_refresh_token: 'expired-refresh', httq_real_auth: '1', httq_user: JSON.stringify({ id: 'user-a', email: 'user-a@example.invalid' }) } });
  assert.equal(e.context.getStudyStateStorageKey(), ownerKey('user-a'));
  e.queue.push(reply(session()), reply({}, 201), reply({}));
  const state = fixtureState(); assert.equal(await e.context.supabaseUpsert(state), true);
  const write = e.calls.find(call => call.url.includes('/rest/v1/study_profiles'));
  assert.equal(write.headers.Authorization, `Bearer ${jwt()}`); assert.notEqual(write.headers.Authorization, `Bearer ${e.localStorage.getItem('xiehanzi_access_token')}`);
  assert.equal(write.body.user_id, 'user-a'); assert.equal(write.body.workspace, 'hoctiengtrungquoc'); assert.deepEqual(write.body.state.v10Learning, state.v10Learning);
  assert.equal(e.calls[0].url, `${authUrl}/token?grant_type=refresh_token`);
  assert.deepEqual(JSON.parse(e.localStorage.getItem(ownerKey('user-a'))), state); assert.equal(e.localStorage.getItem('httq_state:guest'), null);
});
await test('cloud pull merges real table rows without dropping local v10 learning metadata', async () => {
  const e = environment({ cloud: true }); e.seed(); const local = fixtureState(); e.context.saveLocalState(local);
  const remote = { savedWords: { '谢谢': { word: '谢谢' } }, masteredChars: { '好': { character: '好' } }, examCount: 5,
    history: [{ id: 'remote-exam', at: '2026-11-11T10:00:00Z', score: 95 }], remoteOnly: 'keep',
    collections: { library: [{ _id: 'remote-note', text: '谢谢' }], lists: [], reviewCards: [{ itemKey: 'w:谢谢', skill: 'meaning', dueAt: '2026-11-13T10:00:00Z' }] } };
  e.queue.push(reply(user('user-a', { xhz_progress: { learnedWords: ['你好'], updatedAt: Date.now() + 10000 } })), reply([{ state: remote }]));
  assert.equal(await e.context.supabasePull(), true); const merged = JSON.parse(JSON.stringify(e.context.getLocalState()));
  assert.deepEqual(merged.v10Learning, local.v10Learning); assert.equal(merged.remoteOnly, 'keep'); assert.equal(merged.examCount, 5);
  assert.deepEqual(Object.keys(merged.savedWords).sort(), ['你好', '谢谢']); assert.deepEqual(Object.keys(merged.masteredChars).sort(), ['你', '好']);
  assert.deepEqual(merged.history.map(item => item.id), ['remote-exam', 'local-exam']);
  assert.equal(merged.collections.library.length, 2); assert.equal(merged.collections.worksheets[0]._id, 'local-sheet');
  assert.equal(merged.collections.reviewCards.length, 2); assert.equal(merged.collections.speaking.nihao.best, 90);
  assert.equal(e.calls[1].headers.Authorization, `Bearer ${jwt()}`); assert.ok(e.calls[1].url.includes('user_id=eq.user-a'));
});
await test('account switch during pending cloud POST returns false without syncing the new account', async () => {
  const e = environment({ cloud: true }); e.seed(); const pending = deferred(); e.queue.push(() => pending.promise);
  const state = fixtureState(), saving = e.context.supabaseUpsert(state); await tick();
  assert.equal(e.calls.length, 1); e.context.clearAuthSession(false); e.seed('user-b'); pending.resolve(reply({}, 201));
  assert.equal(await saving, false); assert.equal(e.calls.length, 1); assert.equal(e.context.getStudyStateStorageKey(), ownerKey('user-b'));
  assert.deepEqual(JSON.parse(e.localStorage.getItem(ownerKey('user-a'))), state); assert.equal(e.localStorage.getItem(ownerKey('user-b')), null);
});
await test('account switch during pending cloud GET never merges old account data into new owner', async () => {
  const e = environment({ cloud: true }); e.seed(); e.context.saveLocalState(fixtureState()); const pending = deferred();
  e.queue.push(reply(user('user-a', { xhz_progress: { updatedAt: Date.now() + 10000 } })), () => pending.promise);
  const pulling = e.context.supabasePull(); await tick(); assert.equal(e.calls.length, 2);
  e.context.clearAuthSession(false); e.seed('user-b'); e.context.saveLocalState({ savedWords: { '乙': { word: '乙' } }, collections: { library: [{ _id: 'b-only' }] } });
  pending.resolve(reply([{ state: { savedWords: { '甲': { word: '甲' } }, collections: { library: [{ _id: 'a-remote' }] } } }])); assert.equal(await pulling, false);
  const current = e.context.getLocalState(); assert.deepEqual(Object.keys(current.savedWords), ['乙']); assert.equal(current.collections.library[0]._id, 'b-only');
});
await test('offline cloud failures return false while the full local state remains durable', async () => {
  const e = environment({ cloud: true }); e.seed(); e.queue.push(() => { throw new Error('Mocked offline transport'); });
  const state = fixtureState(); assert.equal(await e.context.supabaseUpsert(state), false);
  assert.deepEqual(JSON.parse(e.localStorage.getItem(ownerKey('user-a'))), state); assert.equal(e.calls.length, 1);
});
await test('rejected table writes return false and do not report metadata synchronization', async () => {
  const e = environment({ cloud: true }); e.seed(); e.queue.push(reply({ message: 'Mocked policy rejection' }, 403));
  assert.equal(await e.context.supabaseUpsert(fixtureState()), false); assert.equal(e.calls.length, 1);
  assert.equal(e.calls[0].method, 'POST'); assert.ok(e.localStorage.getItem(ownerKey('user-a')));
});
await test('a successful table write still returns false when the metadata update is rejected', async () => {
  const e = environment({ cloud: true }); e.seed(); const state = fixtureState();
  e.queue.push(reply({}, 201), reply({ message: 'Mocked metadata rejection' }, 403));
  assert.equal(await e.context.supabaseUpsert(state), false); assert.equal(e.calls.length, 2);
  assert.ok(e.calls[0].url.includes('/rest/v1/study_profiles')); assert.equal(e.calls[1].url, `${authUrl}/user`);
  assert.equal(e.calls[1].method, 'PUT'); assert.ok(e.calls[1].body.data.xhz_progress);
  assert.deepEqual(JSON.parse(e.localStorage.getItem(ownerKey('user-a'))), state);
});
await test('stale owner writes and failed local storage never send cloud requests', async () => {
  const e = environment({ cloud: true }); e.seed('user-b');
  assert.equal(await e.context.supabaseUpsert(fixtureState(), { storageKey: ownerKey('user-a') }), false); assert.equal(e.calls.length, 0);
  const nativeSet = e.localStorage.setItem.bind(e.localStorage);
  e.localStorage.setItem = (key, value) => { if (key === ownerKey('user-b')) throw new Error('QuotaExceededError'); nativeSet(key, value); };
  assert.equal(await e.context.supabaseUpsert(fixtureState()), false); assert.equal(e.calls.length, 0);
});
await test('legacy guest state stays guest and is never imported into a registered account', () => {
  const e = environment({ cloud: true, initial: { httq_state: JSON.stringify(fixtureState()) } }); e.seed();
  assert.deepEqual(Object.keys(e.context.getLocalState().savedWords), []); assert.equal(e.localStorage.getItem(ownerKey('user-a')), null);
  e.context.clearAuthSession(false); assert.ok(e.context.getLocalState().savedWords['你好']); assert.ok(e.localStorage.getItem('httq_state:guest'));
});
console.log(`${checks} actual-runtime cloud checks passed. All HTTP transport was mocked; no accounts or remote rows were created or changed.`);
