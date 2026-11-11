import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fragment = await fs.readFile(path.join(root, 'scripts/persistence-runtime-fragment.js'), 'utf8');
const sharedStorage = new Map();
let rejectStorage = false;
let cloudWrites = 0;
function createHarness(options = {}) {
  const storageKey = () => options.getStorageKey ? options.getStorageKey() : 'httq_state';
  const sandbox = {
    URL, Date, Math, JSON, Response, Map, Set, Promise,
    getStudyStateStorageKey: storageKey,
    getRealProgress: options.getRealProgress,
    getLocalState: () => JSON.parse(sharedStorage.get(storageKey()) || '{"masteredChars":{},"savedWords":{},"history":[]}'),
    localStorage: { setItem: (key, value) => { if (rejectStorage) throw new Error('QuotaExceededError'); sharedStorage.set(key, value); } },
    parseRequestBody: options.parseRequestBody || (async init => JSON.parse(init.body || '{}')),
    jsonResponse: (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
    supabaseUpsert: async (state, context) => { cloudWrites++; if (options.cloudWrite) return options.cloudWrite(state, context); },
    lookupWord: async hanzi => ({ word: hanzi, pinyin: 'nǐ hǎo', meaningVi: 'xin chào' }),
    lookupCharacter: async hanzi => ({ character: hanzi, pinyin: 'nǐ', meaningVi: 'bạn' }),
    loadTestPaperById: async testId => {
      const level = Number(testId.match(/(?:hsk30-|xh30-)(\d)/)?.[1]) || 1;
      const file = path.join(root, `data/tests/papers/level-${level}-${testId}.json`);
      try { return JSON.parse(await fs.readFile(file, 'utf8')); }
      catch { return JSON.parse(await fs.readFile(path.join(root, 'data/tests/papers/level-1-hsk30-1.json'), 'utf8')); }
    },
  };
  vm.createContext(sandbox); vm.runInContext(fragment, sandbox);
  const request = async function request(endpoint, method = 'GET', payload) {
    const url = new URL(endpoint, 'https://offline.invalid');
    const response = await sandbox.handlePersistentApi(url.pathname, url, { method, body: payload === undefined ? undefined : JSON.stringify(payload) }, method);
    return response ? { status: response.status, data: await response.json() } : null;
  };
  request.merge = (remote, local) => JSON.parse(JSON.stringify(sandbox.mergeStudyState(remote, local)));
  return request;
}
let request = createHarness();
let checks = 0;
async function test(name, fn) { await fn(); checks++; console.log(`PASS ${name}`); }

await test('unknown endpoints fall through without persistence', async () => {
  assert.equal(await request('/v1/unrelated'), null); assert.equal(sharedStorage.size, 0);
});
await test('empty SRS state has no sample learner statistics', async () => {
  const result = await request('/v2/review/summary');
  assert.equal(result.data.totalCards, 0); assert.equal(result.data.errorsQueue, 0);
  assert.equal(result.data.forecast.reduce((sum, day) => sum + day.due, 0), 0);
});
let annotationId;
await test('saved pinyin retains annotations across a fresh runtime', async () => {
  const annotations = [{ hanzi: '你好', pinyin: 'nǐ hǎo', start: 0, end: 2 }];
  const created = await request('/v1/library', 'POST', { title: 'Xin chào', text: '你好', annotations });
  annotationId = created.data.id; assert.ok(annotationId);
  request = createHarness();
  const restored = await request(`/v1/library/${annotationId}`);
  assert.deepEqual(restored.data.annotations, annotations);
  const list = await request('/v1/library?limit=1&skip=0');
  assert.equal(list.data.annotations.length, 1); assert.equal(list.data.total, 1);
  assert.equal((await request('/v1/library?skip=1')).data.annotations.length, 0);
});
await test('concurrent worksheet writes survive without lost updates', async () => {
  const results = await Promise.all(Array.from({ length: 8 }, (_, index) => request('/v1/user-worksheets', 'POST', { text: `你好${index}`, settings: { grid: 'tian' } })));
  assert.equal(new Set(results.map(result => result.data._id)).size, 8);
  assert.equal((await request('/v1/user-worksheets')).data.worksheets.length, 8);
  const worksheetId = results[0].data._id;
  await request(`/v1/user-worksheets/${worksheetId}`, 'PATCH', { name: 'Tên mới' });
  assert.equal((await request(`/v1/user-worksheets/${worksheetId}`)).data.name, 'Tên mới');
  await request(`/v1/user-worksheets/${worksheetId}`, 'DELETE');
  assert.equal((await request(`/v1/user-worksheets/${worksheetId}`)).status, 404);
});
await test('guest worksheet retries do not import the same localId twice', async () => {
  const payload = { items: [{ localId: 'guest-1', name: 'Vở khách', text: '学习', settings: {} }] };
  assert.equal((await request('/v1/user-worksheets/sync-guest', 'POST', payload)).data.imported, 1);
  assert.equal((await request('/v1/user-worksheets/sync-guest', 'POST', payload)).data.imported, 0);
});
await test('collection quick-save, duplicate detection, sections, moves and mastery', async () => {
  const input = { type: 'word', refId: 'word-nihao', hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào' };
  const saved = await request('/v1/user-lists/quick-save', 'POST', input);
  assert.equal(saved.data.isDuplicate, false);
  assert.equal((await request('/v1/user-lists/quick-save', 'POST', input)).data.isDuplicate, true);
  const lists = (await request('/v1/user-lists')).data.lists;
  assert.equal(lists[0].itemCount, 1);
  const listId = lists[0].id; const itemId = saved.data.item._id;
  const section = (await request(`/v1/user-lists/${listId}/sections`, 'POST', { name: 'HSK 1' })).data;
  await request(`/v1/user-lists/${listId}/items/${itemId}`, 'PATCH', { moveToSectionId: section._id, mastered: true });
  const detail = (await request(`/v1/user-lists/${listId}`)).data;
  const item = detail.sections.find(item => item._id === section._id).items[0];
  assert.ok(item.masteredAt); assert.equal(item.sectionId, section._id);
  await request(`/v1/user-lists/${listId}/items/${itemId}`, 'DELETE');
  assert.equal((await request('/v1/user-lists')).data.lists[0].itemCount, 0);
  assert.equal(JSON.parse(sharedStorage.get('httq_state')).savedWords['你好'], undefined);
});
await test('HSK notes enrich valid questions and reject nonexistent test/question IDs', async () => {
  const saved = await request('/v1/hsk-note-sets', 'POST', { testId: 'hsk30-1', notes: [{ questionId: 'hsk30-1-q001', text: 'Nhớ nghe trước', selectedAnswer: 'B' }] });
  assert.equal(saved.status, 200); assert.equal(saved.data.notes[0].questionNumber, 1); assert.equal(saved.data.testAvailable, true);
  const updated = await request(`/v1/hsk-note-sets/${saved.data.id}`, 'PATCH', { notes: [{ questionId: 'hsk30-1-q001', text: 'Ghi chú mới' }] });
  assert.equal(updated.data.notes[0].text, 'Ghi chú mới');
  assert.equal((await request('/v1/hsk-note-sets?testId=hsk30-1')).data.total, 1);
  assert.equal((await request('/v1/hsk-note-sets', 'POST', { testId: 'missing', notes: [{ questionId: 'q1', text: 'Nội dung' }] })).status, 404);
  assert.equal((await request('/v1/hsk-note-sets', 'POST', { testId: 'hsk30-1', notes: [{ questionId: 'missing-q', text: 'Nội dung' }] })).status, 404);
});
await test('study-time sync merges block IDs with timestamp and seconds tie-breaks', async () => {
  const block = { id: 'block-1', seconds: 30, updatedAt: '2026-11-10T01:00:00.000Z' };
  await request('/v1/study-time/sync', 'POST', { blocks: [block] });
  await request('/v1/study-time/sync', 'POST', { blocks: [{ ...block, seconds: 15 }] });
  assert.equal((await request('/v1/study-time/sync')).data.totalSeconds, 30);
  await request('/v1/study-time/sync', 'POST', { blocks: [{ ...block, seconds: 45 }] });
  assert.equal((await request('/v1/study-time/sync')).data.totalSeconds, 45);
});
await test('speaking sync keeps maxima while lastScore follows most recent attempt', async () => {
  await request('/v1/speaking-progress/sync', 'POST', { items: [{ key: 'new-hsk-1:hello', best: 95, attempts: 3, lastScore: 95, updatedAt: '2026-11-10T01:00:00.000Z' }] });
  const result = await request('/v1/speaking-progress/sync', 'POST', { items: [{ key: 'new-hsk-1:hello', best: 80, attempts: 4, lastScore: 80, updatedAt: '2026-11-10T02:00:00.000Z' }] });
  assert.deepEqual(result.data.items['new-hsk-1:hello'], { best: 95, attempts: 4, lastScore: 80, updatedAt: '2026-11-10T02:00:00.000Z' });
});
await test('review signals are durable, idempotent and update real mistake/SRS state', async () => {
  const signal = { signalId: 'signal-1', itemKey: 'w:你好', skill: 'meaning', source: 'legacy_practice', outcome: 'wrong', ts: new Date().toISOString() };
  assert.equal((await request('/v2/review/signals', 'POST', { signals: [signal] })).data.accepted, 1);
  assert.equal((await request('/v2/review/signals', 'POST', { signals: [signal] })).data.accepted, 0);
  request = createHarness();
  let state = JSON.parse(sharedStorage.get('httq_state'));
  assert.equal(state.collections.reviewCards[0].attempts, 1);
  assert.equal((await request('/v2/review/summary')).data.totalCards, 1);
  assert.equal((await request('/v2/review/mistakes')).data.items.length, 1);
  assert.equal((await request('/v2/review/words')).data.items[0].hanzi, '你好');
  await request('/v2/review/signals', 'POST', { signals: [{ ...signal, signalId: 'signal-2', outcome: 'correct' }, { ...signal, signalId: 'signal-3', outcome: 'correct' }] });
  assert.equal((await request('/v2/review/mistakes')).data.items.length, 0);
  assert.equal((await request('/v2/review/words?status=known')).data.totals.known, 1);
});
await test('failed storage returns 507 and never acknowledges or syncs queued data', async () => {
  const before = sharedStorage.get('httq_state'); const writesBefore = cloudWrites;
  rejectStorage = true;
  const payload = { signals: [{ signalId: 'retry-me', itemKey: 'w:学习', skill: 'listening', outcome: 'correct' }] };
  const failed = await request('/v2/review/signals', 'POST', payload);
  assert.equal(failed.status, 507); assert.equal(sharedStorage.get('httq_state'), before); assert.equal(cloudWrites, writesBefore);
  rejectStorage = false;
  assert.equal((await request('/v2/review/signals', 'POST', payload)).data.accepted, 1);
});
await test('flashcard grades schedule their displayed intervals and preserve card content', async () => {
  const timestamp = new Date().toISOString();
  const intervals = { again: 60000, hard: 600000, good: 86400000, easy: 4 * 86400000 };
  for (const [grade, interval] of Object.entries(intervals)) {
    const signal = { signalId: `grade-${grade}`, itemKey: `w:测试-${grade}`, skill: 'meaning',
      outcome: grade === 'again' ? 'wrong' : grade === 'hard' ? 'partial' : 'correct', ts: timestamp,
      detail: { grade, hanzi: '测试', pinyin: 'cè shì', meaningVi: 'kiểm tra' } };
    assert.equal((await request('/v2/review/signals', 'POST', { signals: [signal] })).status, 200);
    const card = JSON.parse(sharedStorage.get('httq_state')).collections.reviewCards.find(card => card.itemKey === signal.itemKey);
    assert.equal(Date.parse(card.dueAt) - Date.parse(timestamp), interval);
    assert.equal(card.content.meaningVi, 'kiểm tra');
  }
});
await test('cloud-only collections survive login merge with empty local collections', async () => {
  const remote = { collections: { library: [{ id: 'cloud-pinyin', text: '云', updatedAt: '2026-11-10T01:00:00Z' }], worksheets: [{ _id: 'cloud-sheet', text: '你好' }] } };
  const merged = request.merge(remote, { collections: { library: [], worksheets: [] }, savedWords: {} });
  assert.equal(merged.collections.library[0].id, 'cloud-pinyin');
  assert.equal(merged.collections.worksheets[0]._id, 'cloud-sheet');
});
await test('merge keeps independent edits, newer metadata and a single moved/deduplicated list item', async () => {
  const word = { _id: 'same-word', type: 'word', hanzi: '你好', sectionId: 'section-a', updatedAt: '2026-11-10T01:00:00Z' };
  const remote = { collections: { lists: [{ _id: 'list-one', name: 'Tên mới từ cloud', updatedAt: '2026-11-10T03:00:00Z', sections: [
    { _id: 'section-a', name: 'A', items: [word] }, { _id: 'section-b', name: 'B', items: [] }
  ] }], library: [{ id: 'cloud-only', text: '云' }] } };
  const local = { collections: { lists: [{ _id: 'list-one', name: 'Tên cũ local', updatedAt: '2026-11-10T02:00:00Z', sections: [
    { _id: 'section-a', name: 'A', items: [] }, { _id: 'section-b', name: 'B', items: [{ ...word, sectionId: 'section-b', updatedAt: '2026-11-10T02:00:00Z' }] }
  ] }], library: [{ id: 'local-only', text: '本地' }] } };
  const merged = request.merge(remote, local);
  assert.equal(merged.collections.library.length, 2);
  const list = merged.collections.lists[0]; assert.equal(list.name, 'Tên mới từ cloud');
  assert.equal(list.sections[0].items.length, 0); assert.equal(list.sections[1].items.length, 1);
  assert.equal(merged.savedWords['你好'].sectionId, 'section-b');
});
await test('delete tombstones prevent stale cloud data from resurrecting saved work', async () => {
  const created = await request('/v1/library', 'POST', { text: '删除', annotations: [] });
  const cloudSnapshot = JSON.parse(sharedStorage.get('httq_state'));
  await request(`/v1/library/${created.data.id}`, 'DELETE');
  const local = JSON.parse(sharedStorage.get('httq_state'));
  assert.ok(local.collections.tombstones.some(item => item.id === created.data.id));
  const merged = request.merge(cloudSnapshot, local);
  assert.equal(merged.collections.library.some(item => item.id === created.data.id), false);
});
await test('merge replays the union of offline review signals once in event order', async () => {
  const signal = (signalId, outcome, hour) => ({ signalId, itemKey: 'w:合并', skill: 'meaning', outcome, ts: `2026-11-10T0${hour}:00:00.000Z` });
  const wrong = signal('offline-wrong', 'wrong', 1), correct1 = signal('device-one-correct', 'correct', 2), correct2 = signal('device-two-correct', 'correct', 3);
  const merged = request.merge({ collections: { reviewSignals: [wrong, correct1] } }, { collections: { reviewSignals: [wrong, correct2] } });
  assert.equal(merged.collections.reviewSignals.length, 3);
  const card = merged.collections.reviewCards[0];
  assert.equal(card.attempts, 3); assert.equal(card.wrongCount, 1); assert.equal(card.correctStreak, 2);
  assert.equal(card.dueAt, '2026-11-13T03:00:00.000Z');
  const repeated = request.merge(merged, merged);
  assert.deepEqual(repeated.collections.reviewCards, merged.collections.reviewCards);
});
await test('late offline delivery cannot roll the SRS scheduler back to an older failure', async () => {
  const base = { itemKey: 'w:离线', skill: 'meaning', source: 'test' };
  await request('/v2/review/signals', 'POST', { signals: [{ ...base, signalId: 'offline-newer', outcome: 'correct', ts: '2026-11-10T02:00:00Z' }] });
  await request('/v2/review/signals', 'POST', { signals: [{ ...base, signalId: 'offline-older', outcome: 'wrong', ts: '2026-11-10T01:00:00Z' }] });
  const card = JSON.parse(sharedStorage.get('httq_state')).collections.reviewCards.find(card => card.itemKey === base.itemKey);
  assert.equal(card.lastOutcome, 'correct'); assert.equal(card.correctStreak, 1);
  assert.equal(card.dueAt, '2026-11-11T02:00:00.000Z');
});
await test('account changes before queued work executes return 409 and preserve both scopes', async () => {
  let owner = 'httq_state:user-a';
  const scoped = createHarness({ getStorageKey: () => owner });
  const queued = scoped('/v1/library', 'POST', { text: 'User A private content' });
  owner = 'httq_state:user-b';
  assert.equal((await queued).status, 409);
  assert.equal(sharedStorage.has('httq_state:user-a'), false); assert.equal(sharedStorage.has('httq_state:user-b'), false);
  const saved = await scoped('/v1/library', 'POST', { text: 'User B content' });
  assert.equal(saved.status, 200);
  assert.equal(JSON.parse(sharedStorage.get(owner)).collections.library[0].text, 'User B content');
});
await test('cloud failures preserve durable local success and pass the expected owner scope', async () => {
  const expectedKey = 'httq_state:offline-owner'; let scope;
  const offline = createHarness({ getStorageKey: () => expectedKey, cloudWrite: async (_, context) => { scope = context.storageKey; throw new Error('Network disconnected'); } });
  const result = await offline('/v1/library', 'POST', { text: '离线保存' });
  assert.equal(result.status, 200); assert.equal(scope, expectedKey);
  assert.equal(JSON.parse(sharedStorage.get(expectedKey)).collections.library[0].text, '离线保存');
});
await test('account changes while the request body is parsing are rejected before commit', async () => {
  let owner = 'httq_state:parse-owner-a'; let finishParsing;
  const parsed = new Promise(resolve => { finishParsing = resolve; });
  const scoped = createHarness({ getStorageKey: () => owner, parseRequestBody: () => parsed });
  const queued = scoped('/v1/library', 'POST', { text: 'Must stay private' });
  await Promise.resolve(); owner = 'httq_state:parse-owner-b'; finishParsing({ text: 'Must stay private' });
  assert.equal((await queued).status, 409);
  assert.equal(sharedStorage.has('httq_state:parse-owner-a'), false); assert.equal(sharedStorage.has('httq_state:parse-owner-b'), false);
});
await test('native intake answers persist with normalized levels and valid optional fields', async () => {
  const saved = await request('/v1/users/me/intake', 'PATCH', { level: 'hsk1-2', goal: 'hsk-cert', time: '15p', targetLevel: 'hsk3', examDate: '2027-04-18', topicSlugs: ['du-lich', 'unknown', 'du-lich'], source: 'self-select' });
  assert.equal(saved.status, 200); assert.equal(saved.data.intake.level, 'hsk1'); assert.deepEqual(saved.data.intake.topicSlugs, ['du-lich']);
  request = createHarness();
  assert.equal((await request('/v1/users/me/intake')).data.intake.targetLevel, 'hsk3');
  assert.equal((await request('/v1/users/me/intake', 'PATCH', { goal: 'unsupported' })).status, 400);
  assert.equal((await request('/v1/users/me/intake', 'PATCH', { examDate: '2027-02-30' })).status, 400);
  assert.equal((await request('/v1/users/me/intake')).data.intake.examDate, '2027-04-18');
});
await test('intake merge follows the newer profile instead of overwriting cloud with stale preferences', async () => {
  const merged = request.merge({ collections: { intake: { goal: 'hsk-cert', level: 'hsk2', time: '30p+', updatedAt: '2026-11-11T05:00:00Z' } } },
    { collections: { intake: { goal: 'giao-tiep', level: 'hsk1', time: '5p', updatedAt: '2026-11-10T05:00:00Z' } } });
  assert.equal(merged.collections.intake.goal, 'hsk-cert');
});
await test('existing v10 learned words enroll once and remain available to direct review pages', async () => {
  const key = 'httq_state:legacy-v10';
  const migrated = createHarness({ getStorageKey: () => key, getRealProgress: () => ({ learnedWords: ['你好', '你好'] }) });
  assert.equal((await migrated('/v2/review/summary')).data.totalCards, 1);
  const restored = createHarness({ getStorageKey: () => key });
  assert.equal((await restored('/v2/review/summary')).data.totalCards, 1);
  assert.equal(JSON.parse(sharedStorage.get(key)).collections.reviewCards[0].itemKey, 'w:你好');
});
console.log(`${checks} persistence contract checks passed. No network requests were made.`);
