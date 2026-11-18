import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../xiehanzi-runtime.js', import.meta.url), 'utf8');
const dictation = source.slice(source.indexOf('  async function renderDictationDetailPage'), source.indexOf('  async function renderHskTestPaperPage'));
const helpers = dictation.slice(dictation.indexOf('    function normalizePinyinCompare'), dictation.indexOf('    const hskColors'));
const context = {}; vm.createContext(context); vm.runInContext(helpers, context);
const targets = segment => JSON.parse(JSON.stringify(context.getDictationBlankTargets(segment)));
const correct = context.isDictationBlankCorrect;
const fixture = { hanzi: '去买瓶水喝吧', pinyin: 'qù mǎi píng shuǐ hē ba', blankCharIdx: [2, 3] };
let checks = 0;
function test(name, callback) { callback(); checks++; console.log(`PASS ${name}`); }
test('array blank positions select each requested character and its own pinyin', () => {
  assert.deepEqual(targets(fixture), [{ index: 2, hanzi: '瓶', pinyin: 'píng' }, { index: 3, hanzi: '水', pinyin: 'shuǐ' }]);
});
test('legacy numeric positions remain supported and invalid positions are bounded', () => {
  assert.deepEqual(targets({ ...fixture, blankCharIdx: 4 }), [{ index: 4, hanzi: '喝', pinyin: 'hē' }]);
  assert.deepEqual(targets({ ...fixture, blankCharIdx: [3, 2, 3, -1, 99, 1.5, '1'] }).map(target => target.index), [2, 3]);
  assert.deepEqual(targets({ ...fixture, blankCharIdx: null }).map(target => target.index), [0]);
  assert.deepEqual(targets({ hanzi: '', blankCharIdx: [0] }), []);
});
test('only the exact missing Hanzi is accepted', () => {
  const target = targets(fixture)[0]; assert.equal(correct(target, '瓶', false), true);
  for (const value of ['去', '水', '瓶水', '去买瓶水喝吧', '', 'píng']) assert.equal(correct(target, value, false), false, value);
});
test('pinyin accepts the matching complete syllable with tones or tone numbers', () => {
  const target = targets(fixture)[0];
  for (const value of ['píng', 'ping', 'ping2', ' PING ']) assert.equal(correct(target, value, true), true, value);
  for (const value of ['pi', 'ing', 'qù', 'pingshui', '瓶ping', 'ping22', 'ping0', '水']) assert.equal(correct(target, value, true), false, value);
});
test('punctuation and Latin words do not shift the target pinyin', () => {
  assert.deepEqual(targets({ hanzi: '你好，mark很胖！', pinyin: 'nǐ hǎo ， mark hěn pàng ！', blankCharIdx: [2, 3] }), [{ index: 2, hanzi: '很', pinyin: 'hěn' }, { index: 3, hanzi: '胖', pinyin: 'pàng' }]);
});
test('unreliable pinyin alignment cannot accept a different character syllable', () => {
  const target = targets({ hanzi: '你好', pinyin: 'nǐhǎo', blankCharIdx: 1 })[0];
  assert.equal(target.pinyin, ''); assert.equal(correct(target, 'hao', true), false); assert.equal(correct(target, '好', true), true);
});
test('pinyin keeps the distinction between u and ü', () => {
  const target = { hanzi: '女', pinyin: 'nǚ' };
  for (const value of ['nǚ', 'nü', 'nv3', 'nu:3']) assert.equal(correct(target, value, true), true, value);
  for (const value of ['nu', 'nǔ', 'nu3']) assert.equal(correct(target, value, true), false, value);
});
test('multi-blank grading needs every blank rather than any sentence substring', () => {
  const expected = targets(fixture);
  const grade = input => expected.every(target => correct(target, input[target.index], true));
  assert.equal(grade({ 2: '瓶', 3: 'shui3' }), true);
  assert.equal(grade({ 2: '瓶', 3: '' }), false); assert.equal(grade({ 2: '去', 3: '水' }), false);
  assert.ok(dictation.includes('targets.every(target => isDictationBlankCorrect'));
  assert.ok(dictation.includes('data-blank-index=')); assert.ok(dictation.includes('blankInputs: values'));
});
const files = (await fs.readdir(new URL('../data/dictation/videos/', import.meta.url))).filter(name => name.endsWith('-segments.json'));
let segmentCount = 0, alignedCount = 0;
for (const file of files) {
  const data = JSON.parse(await fs.readFile(new URL(`../data/dictation/videos/${file}`, import.meta.url), 'utf8'));
  for (const segment of data.items || data.segments || []) {
    const blanks = targets(segment); segmentCount++;
    if (blanks.every(target => target.pinyin)) alignedCount++;
    for (const target of blanks) { assert.equal(correct(target, target.hanzi, false), true); if (target.pinyin) assert.equal(correct(target, target.pinyin, true), true); }
  }
}
console.log(`${checks} dictation checks passed; ${alignedCount}/${segmentCount} bundled segments have aligned blank pinyin. No remote data was changed.`);
