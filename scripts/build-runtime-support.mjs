import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeFile = path.join(root, 'xiehanzi-runtime.js');
let code = fs.readFileSync(runtimeFile, 'utf8').replace(/\r\n/g, '\n');
for (const name of ['storage', 'persistence']) {
  const start = `  // BEGIN GENERATED ${name.toUpperCase()} SUPPORT\n`;
  const end = `  // END GENERATED ${name.toUpperCase()} SUPPORT\n`;
  const first = code.indexOf(start);
  if (first >= 0) {
    const last = code.indexOf(end, first);
    if (last < first) throw new Error(`Missing end marker: ${name}`);
    code = code.slice(0, first).trimEnd() + '\n\n' + code.slice(last + end.length).replace(/^\n+/, '');
  }
  const fragment = fs.readFileSync(path.join(root, 'scripts', `${name}-runtime-fragment.js`), 'utf8').replace(/\r\n/g, '\n');
  const initialization = name === 'storage' ? '\n  initializeScopedStorage();\n' : '';
  const block = start + fragment.trimEnd() + initialization + '\n' + end + '\n';
  const marker = name === 'storage' ? '  function getStudyStateStorageKey() {' : '  async function handleApiRequest(urlOrObj, init) {';
  if (!code.includes(marker)) throw new Error(`Missing insertion point: ${name}`);
  code = code.replace(marker, block + marker);
}
const methodMarker = "    const method = (init && init.method ? init.method : 'GET').toUpperCase();";
if (!code.includes('await handlePersistentApi(p, urlObj, init, method)')) {
  if (!code.includes(methodMarker)) throw new Error('Missing API dispatch marker');
  code = code.replace(methodMarker, methodMarker + '\n\n    const persisted = await handlePersistentApi(p, urlObj, init, method);\n    if (persisted) return persisted;');
}
const reviewStart = code.indexOf('  async function renderReviewSessionPage(slug) {');
const examStart = code.indexOf('  async function renderHskTestPaperPage(pathname) {');
const examLabel = code.lastIndexOf('  // 6.8b.', reviewStart);
const examEnd = code.lastIndexOf('\n  // ', examLabel);
if (examStart < 0 || examEnd < examStart) throw new Error('Missing HSK paper renderer boundary');
code = code.slice(0, examStart) + fs.readFileSync(path.join(root, 'scripts/hsk-paper-runtime-fragment.js'), 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n\n' + code.slice(examEnd);
const updatedReviewStart = code.indexOf('  async function renderReviewSessionPage(slug) {');
const reviewEnd = code.indexOf('  async function renderProgressOrHabitPage(', updatedReviewStart);
const reviewLabel = reviewEnd < 0 ? -1 : code.lastIndexOf('  // 6.8c.', reviewEnd);
const reviewSection = reviewLabel < 0 ? -1 : code.lastIndexOf('\n  // ', reviewLabel);
if (updatedReviewStart < 0 || reviewSection < updatedReviewStart) throw new Error('Missing review renderer boundary');
code = code.slice(0, updatedReviewStart) + fs.readFileSync(path.join(root, 'scripts/review-session-runtime-fragment.js'), 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n\n' + code.slice(reviewSection);
const browseStart = code.indexOf('  async function renderCharacterBrowseSubPage(pathname) {');
const browseEnd = code.indexOf('  function ensureLessonRunnerAssets()', browseStart);
const browseLabel = code.lastIndexOf('  // 6.9.', browseEnd);
const browseSection = browseLabel < 0 ? -1 : code.lastIndexOf('\n  // ', browseLabel);
if (browseStart < 0 || browseSection < browseStart) throw new Error('Missing character browse boundary');
code = code.slice(0, browseStart) + fs.readFileSync(path.join(root, 'scripts/character-browse-runtime-fragment.js'), 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n\n' + code.slice(browseSection);
new vm.Script(code, { filename: runtimeFile });
if (!process.argv.includes('--check')) fs.writeFileSync(runtimeFile, code);
console.log(process.argv.includes('--check') ? 'Runtime support validated.' : 'Runtime support generated.');
