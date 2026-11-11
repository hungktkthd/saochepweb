import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { environment } from './auth-runtime-harness.mjs';

// Execute checked-in content helpers, complete API router, persistence adapter,
// and native pinyin renderer. Dictionaries and sample papers come from the repo.
const source = await fs.readFile(new URL('../xiehanzi-runtime.js', import.meta.url), 'utf8');
const annotate = source.slice(source.indexOf('  async function annotateLocalPinyin'), source.indexOf('  // BEGIN GENERATED PERSISTENCE SUPPORT'));
const persistence = source.slice(source.indexOf('  function studyRecordTime'), source.indexOf('  // END GENERATED PERSISTENCE SUPPORT'));
const router = source.slice(source.indexOf('  async function handleApiRequest'), source.indexOf('  const ORIG_FETCH'));
const paperLoader = source.slice(source.indexOf('  function normalizeTestPaper'), source.indexOf('  function buildCompanionCharactersResponse'));
assert.ok(annotate.includes('function annotateLocalPinyin')); assert.ok(router.includes('ANSWER_KEY_UNAVAILABLE')); assert.ok(paperLoader.includes('async function loadTestPaperById'));
const nativeSource = await fs.readFile(new URL('../_next/static/chunks/app/(primary-layout)/them-pinyin/page-8d8227852bd32044.js', import.meta.url), 'utf8');
const consumerStart = nativeSource.indexOf('function g(e){let t=[],n=0;for');
const consumerEnd = nativeSource.indexOf('function v(e)', consumerStart);
assert.ok(consumerStart >= 0 && consumerEnd > consumerStart, 'Locate the actual native ruby and text consumers');
const native = {}; vm.createContext(native); vm.runInContext(nativeSource.slice(consumerStart, consumerEnd), native);
const clock = Date.parse('2026-11-11T05:00:00Z');
class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [clock])); } static now() { return clock; } }
const jsonCache = new Map();
async function loadLocalJson(path) {
  if (!jsonCache.has(path)) jsonCache.set(path, fs.readFile(new URL(`..${path}`, import.meta.url), 'utf8').then(JSON.parse).catch(() => null));
  const value = await jsonCache.get(path); return value ? JSON.parse(JSON.stringify(value)) : null;
}
function contentEnvironment() {
  const e = environment({ cloud: true });
  Object.assign(e.context, { loadLocalJson, rewriteMediaUrl: value => value, Date: FixedDate });
  vm.runInContext(annotate + '\n' + paperLoader + '\n' + persistence + '\n' + router, e.context);
  return e;
}
let checks = 0;
async function test(name, callback) { await callback(); checks++; console.log(`PASS ${name}`); }

await test('pinyin annotations preserve Chinese word groups consumed by the native renderer', async () => {
  const e = contentEnvironment(); const result = await e.request('/v1/pinyin-lookup', { text: '你好，中国！' });
  assert.equal(result.status, 200); const annotations = result.data.annotations;
  assert.equal(annotations.map(item => item.char).join(''), '你好，中国！');
  const first = annotations[0]; assert.equal(first.char, '你'); assert.equal(first.isHanzi, true); assert.equal(first.pinyin, 'nǐ');
  assert.equal(first.isWordStart, true); assert.equal(first.wordHanzi, '你好'); assert.equal(first.wordPinyin, 'nǐ hǎo');
  assert.equal(annotations[1].isWordStart, false); assert.equal(annotations[1].pinyin, 'hǎo');
  assert.equal(annotations[3].wordHanzi, '中国'); assert.equal(annotations[3].isWordStart, true);
  const html = native.g(annotations);
  assert.ok(html.includes('<ruby>你<rt>nǐ</rt>好<rt>hǎo</rt></ruby>'));
  assert.equal((html.match(/<ruby>/g) || []).length, 2); assert.ok(html.includes('，<ruby>')); assert.ok(html.endsWith('！'));
  assert.ok(native.b(annotations).includes('nǐ hǎo(你好)'));
});
await test('punctuation, newline, emoji, Latin text, and unknown Han characters are preserved', async () => {
  const e = contentEnvironment(); const text = 'A&B <tag>，你好！\n中文🙂𠮷 123';
  const annotations = await e.context.annotateLocalPinyin(text);
  assert.equal(annotations.length, Array.from(text).length); assert.equal(annotations.map(item => item.char).join(''), text);
  for (const item of annotations.filter(item => !/\p{Script=Han}/u.test(item.char))) { assert.equal(item.isHanzi, false); assert.equal(item.pinyin, ''); }
  const unknown = annotations.find(item => item.char === '𠮷'); assert.equal(unknown.isHanzi, true); assert.equal(unknown.pinyin, '');
  const html = native.g(annotations); assert.ok(html.includes('A&amp;B &lt;tag&gt;')); assert.ok(html.includes('\n'));
  assert.ok(html.includes('🙂')); assert.ok(html.includes('𠮷')); assert.ok(!html.includes('<tag>'));
});
await test('empty pinyin text produces an empty native annotation collection', async () => {
  const e = contentEnvironment(); const result = await e.request('/v1/pinyin-lookup', { text: '' });
  assert.equal(result.status, 200); assert.deepEqual(result.data.annotations, []); assert.equal(native.g(result.data.annotations), '');
});
await test('bundled HSK papers without an answer key return 409 without invented answers or history', async () => {
  const e = contentEnvironment(); const paper = await e.context.loadTestPaperById('hsk30-1');
  assert.ok(paper.questions.length > 0); assert.ok(paper.questions.some(question => question.correctAnswer === undefined && question.answer === undefined && question.correctOption === undefined));
  const before = JSON.stringify(e.context.getLocalState());
  const result = await e.request('/v1/exams/hsk30-1/submit', { paperId: 'hsk30-1', answers: Object.fromEntries(paper.questions.map((question, index) => [question.id || question.number || index + 1, 'A'])) });
  assert.equal(result.status, 409); assert.equal(result.data.error, 'ANSWER_KEY_UNAVAILABLE');
  assert.equal(result.data.score, undefined); assert.equal(result.data.results, undefined);
  assert.equal(JSON.stringify(e.context.getLocalState()), before); assert.equal(e.context.getLocalState().history.length, 0); assert.equal(e.calls.length, 0);
});
await test('partial answer keys cannot create a score or append an exam attempt', async () => {
  const e = contentEnvironment(); const result = await e.request('/v1/exams/regression/grade', { paperId: 'regression-fixture-missing', questions: [{ id: 'q1', correctAnswer: 'B' }, { id: 'q2' }], answers: { q1: 'B', q2: 'A' } });
  assert.equal(result.status, 409); assert.equal(result.data.error, 'ANSWER_KEY_UNAVAILABLE');
  assert.equal(e.context.getLocalState().examCount, 0); assert.deepEqual(Array.from(e.context.getLocalState().history), []);
});
await test('real answer keys grade exact provided answers and save only an actual attempt', async () => {
  const e = contentEnvironment(); const result = await e.request('/v1/exams/regression/grade', { paperId: 'regression-fixture-valid', questions: [{ id: 'q1', correctAnswer: 'B' }, { id: 'q2', answer: 'C' }], answers: { q1: 'B', q2: 'A' } });
  assert.equal(result.status, 200); assert.equal(result.data.score, 50); assert.equal(result.data.correctCount, 1);
  assert.deepEqual(result.data.results.map(item => item.correctAnswer), ['B', 'C']);
  assert.equal(e.context.getLocalState().examCount, 1); assert.equal(e.context.getLocalState().history.length, 1); assert.equal(e.calls.length, 0);
});
await test('fresh progress has no invented cards, due reviews, or mistakes', () => {
  const e = contentEnvironment(); const summary = e.context.getRealProgressSummary();
  assert.equal(summary.totalCards, 0); assert.equal(summary.dueTotal, 0); assert.equal(summary.mistakesCount, 0); assert.equal(summary.wordsLearning, 0);
});
await test('actual learned words enroll exactly once even across repeated dashboard summaries', () => {
  const e = contentEnvironment(); e.localStorage.setItem('httq_progress_v2', JSON.stringify({ learnedWords: ['你', '好', '你'] }));
  let summary = e.context.getRealProgressSummary(); assert.equal(summary.totalCards, 2); assert.equal(summary.dueTotal, 2);
  summary = e.context.getRealProgressSummary(); assert.equal(summary.totalCards, 2);
  assert.deepEqual(Array.from(e.context.getLocalState().collections.reviewCards, card => card.itemKey).sort(), ['w:你', 'w:好']);
});
await test('a good review moves the real card to tomorrow and removes it from due now', async () => {
  const e = contentEnvironment(); e.localStorage.setItem('httq_progress_v2', JSON.stringify({ learnedWords: ['你'] }));
  assert.equal(e.context.getRealProgressSummary().dueTotal, 1);
  const signal = { signalId: 'content-review-1', itemKey: 'w:你', skill: 'meaning', outcome: 'correct', ts: new FixedDate().toISOString(), source: 'content-regression', detail: { grade: 'good' } };
  assert.equal((await e.request('/v2/review/signals', { signals: [signal] })).data.accepted, 1);
  assert.equal((await e.request('/v2/review/signals', { signals: [signal] })).data.duplicates, 1);
  const local = e.context.getRealProgressSummary(); assert.equal(local.totalCards, 1); assert.equal(local.dueTotal, 0); assert.equal(local.mistakesCount, 0);
  const review = await e.request('/v2/review/summary', {}, 'GET'); assert.equal(review.data.dueNow.meaning, 0);
  assert.equal(review.data.forecast.find(day => day.day === '2026-11-12').due, 1);
  assert.equal(e.context.getLocalState().collections.reviewCards[0].attempts, 1);
});
await test('mistake counts come from unresolved real cards rather than lesson-count estimates', () => {
  const e = contentEnvironment(); e.localStorage.setItem('httq_progress_v2', JSON.stringify({ doneActivities: { stage: ['a', 'b', 'c', 'd'] } }));
  assert.equal(e.context.getRealProgressSummary().mistakesCount, 0);
  e.context.saveLocalState({ collections: { reviewCards: [
    { itemKey: 'w:一', skill: 'meaning', wrongCount: 2, correctStreak: 0, dueAt: '2026-11-11T05:00:00Z' },
    { itemKey: 'w:二', skill: 'meaning', wrongCount: 5, correctStreak: 2, dueAt: '2026-11-12T05:00:00Z' },
    { itemKey: 'w:三', skill: 'meaning', wrongCount: 1, correctStreak: 0, dismissed: true, dueAt: '2026-11-12T05:00:00Z' },
    { itemKey: 'w:四', skill: 'meaning', wrongCount: 1, correctStreak: 0, deletedAt: '2026-11-10', dueAt: '2026-11-10T05:00:00Z' }
  ] } });
  const summary = e.context.getRealProgressSummary(); assert.equal(summary.mistakesCount, 1); assert.equal(summary.totalCards, 3); assert.equal(summary.dueTotal, 1);
});
console.log(`${checks} actual-runtime content checks passed. Native rendering, local dictionaries, HSK grading guards, and real review scheduling were exercised without remote requests.`);
