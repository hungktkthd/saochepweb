import assert from 'node:assert/strict';
import { environment, user, jwt, session, reply, deferred, authUrl } from './auth-runtime-harness.mjs';

let checks = 0;
async function test(name, callback) { await callback(); checks++; console.log(`PASS ${name}`); }

await test('email login uses the Auth password endpoint and saves only the server user', async () => {
  const e = environment(); e.queue.push(reply(session()));
  const result = await e.request('/v1/auth/login', { email: 'user-a@example.invalid', password: 'correct-password' });
  assert.equal(result.status, 200); assert.equal(result.data.isAuthenticated, true);
  assert.equal(e.calls[0].url, `${authUrl}/token?grant_type=password`);
  assert.equal(e.calls[0].body.password, 'correct-password');
  assert.equal(e.context.getSavedUser().id, 'user-a'); assert.equal(e.localStorage.getItem('sb_access_token'), jwt());
});
await test('wrong credentials never create a fabricated account', async () => {
  const e = environment(); e.queue.push(reply({ error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400));
  const result = await e.request('/v1/auth/login', { email: 'user-a@example.invalid', password: 'incorrect-password' });
  assert.equal(result.status, 400); assert.equal(result.data.code, 'invalid_credentials');
  assert.equal(e.context.getSavedUser(), null); assert.equal(e.localStorage.getItem('sb_access_token'), null);
});
await test('registration without a session waits for email confirmation', async () => {
  const e = environment(); e.queue.push(reply({ user: user() }));
  const result = await e.request('/v1/auth/register', { email: 'user-a@example.invalid', password: 'correct-password', displayName: 'Learner' });
  assert.equal(result.status, 202); assert.equal(result.data.requiresEmailConfirmation, true); assert.equal(result.data.isAuthenticated, false);
  assert.equal(e.context.getSavedUser(), null); assert.equal(e.localStorage.getItem('sb_access_token'), null);
  assert.ok(e.calls[0].url.startsWith(`${authUrl}/signup?redirect_to=`)); assert.equal(e.calls[0].body.data.full_name, 'Learner');
});
await test('a stored or decoded token is not trusted until Auth validates it', async () => {
  const e = environment({ initial: { sb_access_token: jwt(), sb_refresh_token: 'refresh-a', httq_real_auth: '1', httq_user: JSON.stringify({ id: 'user-a', email: 'user-a@example.invalid' }) } });
  e.queue.push(reply({ error_code: 'bad_jwt' }, 401));
  assert.equal(await e.context.getSupabaseSession(), null); assert.equal(e.context.getSavedUser(), null);
  assert.equal(e.calls[0].url, `${authUrl}/user`);
  assert.equal(e.context.saveAuthSession('not-a-real-token', '', user()), null);
});
await test('old fabricated user leftovers never display or become a real session', async () => {
  const e = environment({ initial: { httq_real_auth: '1', httq_user: JSON.stringify({ id: 'fake-old-account', email: 'cached@example.invalid', displayName: 'K' }), httq_state: '{"savedWords":{"你":{}}}' } });
  assert.equal(e.context.getSavedUser(), null); assert.equal(await e.context.getSupabaseSession(), null);
  assert.equal(e.localStorage.getItem('httq_user'), null); assert.equal(e.calls.length, 0); assert.ok(e.localStorage.getItem('httq_state'));
});
await test('expired sessions refresh once for concurrent callers and rotate both tokens', async () => {
  const e = environment({ initial: { sb_access_token: jwt('user-a', 1), sb_refresh_token: 'old-refresh', httq_real_auth: '1', httq_user: JSON.stringify({ id: 'user-a', email: 'user-a@example.invalid' }) } });
  const pending = deferred(); e.queue.push(() => pending.promise);
  const first = e.context.getSupabaseSession(), second = e.context.getSupabaseSession();
  pending.resolve(reply(session()));
  const [a, b] = await Promise.all([first, second]);
  assert.equal(a.access_token, jwt()); assert.equal(b.user.id, 'user-a'); assert.equal(e.calls.length, 1);
  assert.equal(e.calls[0].url, `${authUrl}/token?grant_type=refresh_token`); assert.equal(e.calls[0].body.refresh_token, 'old-refresh');
  assert.equal(e.localStorage.getItem('sb_refresh_token'), 'refresh-user-a');
});
await test('invalid refresh clears authentication while preserving study data', async () => {
  const e = environment({ initial: { sb_access_token: jwt('user-a', 1), sb_refresh_token: 'revoked', httq_state: '{"savedWords":{"你":{}}}', httq_progress_v2: '{"learnedWords":["你"]}' } });
  e.queue.push(reply({ error_code: 'refresh_token_not_found' }, 400));
  assert.equal(await e.context.getSupabaseSession(), null); assert.equal(e.localStorage.getItem('sb_access_token'), null);
  assert.ok(e.localStorage.getItem('httq_state')); assert.ok(e.localStorage.getItem('httq_progress_v2'));
});
await test('a late refresh response cannot restore a logged-out session', async () => {
  const e = environment({ initial: { sb_access_token: jwt('user-a', 1), sb_refresh_token: 'old-refresh' } });
  const pending = deferred(); e.queue.push(() => pending.promise);
  const request = e.context.getSupabaseSession(); e.context.clearAuthSession(false); pending.resolve(reply(session()));
  assert.equal(await request, null); assert.equal(e.context.getSavedUser(), null); assert.equal(e.localStorage.getItem('sb_access_token'), null);
});
await test('OAuth callback remains unauthenticated until the server validates it', async () => {
  const pending = deferred();
  const e = environment({ hash: `#access_token=${jwt()}&refresh_token=callback-refresh`, transport: () => pending.promise });
  assert.equal(e.context.getSavedUser(), null);
  const current = e.context.getSupabaseSession(); pending.resolve(reply(user()));
  assert.equal((await current).user.id, 'user-a'); assert.equal(e.localStorage.getItem('sb_refresh_token'), 'callback-refresh');
  assert.deepEqual(e.redirects, ['/tai-khoan']);
});
await test('OAuth callback cannot redirect to a foreign stored destination', async () => {
  const pending = deferred(); const e = environment({ hash: `#access_token=${jwt()}&refresh_token=callback-refresh`, initial: { httq_oauth_return_to: 'https://untrusted.invalid/redirect' }, transport: () => pending.promise });
  const current = e.context.getSupabaseSession(); pending.resolve(reply(user())); await current;
  assert.deepEqual(e.redirects, ['/tai-khoan']);
});
await test('logout preserves progress and other Supabase projects', async () => {
  const e = environment(); e.seed();
  for (const key of ['httq_state', 'httq_progress_v2', 'httq_done_stages', 'httq_companion_chat_turns', 'sb-other-project-auth-token']) e.localStorage.setItem(key, 'keep');
  e.localStorage.setItem('sb-skxgzzdunqloxxombtuc-auth-token', 'remove'); e.queue.push(reply({}));
  e.context.clearAuthSession();
  for (const key of ['httq_state', 'httq_progress_v2', 'httq_done_stages', 'httq_companion_chat_turns', 'sb-other-project-auth-token']) assert.equal(e.localStorage.getItem(key), 'keep');
  assert.equal(e.context.getSavedUser(), null); assert.equal(e.localStorage.getItem('sb-skxgzzdunqloxxombtuc-auth-token'), null);
  assert.ok(e.calls[0].url.endsWith('/logout?scope=local'));
});
await test('profile and preferences persist through server metadata updates', async () => {
  const e = environment(); e.seed(); e.queue.push(reply(user('user-a', { full_name: 'Updated', displayName: 'Updated' })));
  assert.equal((await e.request('/v1/users/me/profile', { displayName: 'Updated' }, 'PATCH')).data.displayName, 'Updated');
  assert.equal(e.calls[0].body.data.full_name, 'Updated');
  e.queue.push(reply(user('user-a', { xhz_preferences: { showPinyinByDefault: false, showOnPublicFeed: true } })));
  const result = await e.request('/v1/users/me/preferences', { showPinyinByDefault: false }, 'PATCH');
  assert.equal(result.data.showPinyinByDefault, false); assert.equal(e.calls[1].body.data.xhz_preferences.showOnPublicFeed, true);
});
await test('failed profile updates do not claim success or alter the saved user', async () => {
  const e = environment(); e.seed(); e.queue.push(reply({ msg: 'Server unavailable' }, 503));
  const result = await e.request('/v1/users/me/profile', { displayName: 'Unsaved name' }, 'PATCH');
  assert.equal(result.status, 503); assert.equal(e.context.getSavedUser().displayName, 'Name user-a');
});
await test('avatar deletion clears provider fallback and persists via Auth', async () => {
  const e = environment(); e.seed('user-a', { avatar_url: 'https://example.invalid/old.png', picture: 'https://example.invalid/provider.png' });
  e.queue.push(reply(user('user-a', { avatar_url: '', picture: '' })));
  const result = await e.request('/v1/users/me/avatar', {}, 'DELETE');
  assert.equal(result.data.avatar, ''); assert.equal(e.calls[0].body.data.avatar_url, ''); assert.equal(e.calls[0].body.data.picture, '');
});
await test('password change requires current password and verifies it before update', async () => {
  const e = environment(); e.seed();
  assert.equal((await e.request('/v1/users/me/password', { newPassword: 'new-password' }, 'PATCH')).data.code, 'current_password_required');
  assert.equal(e.calls.length, 0);
  e.queue.push(reply({ error_code: 'invalid_credentials', msg: 'Invalid credentials' }, 400));
  assert.equal((await e.request('/v1/users/me/password', { currentPassword: 'wrong-password', newPassword: 'new-password' }, 'PATCH')).status, 400);
  assert.equal(e.calls.length, 1); assert.ok(e.calls[0].url.endsWith('token?grant_type=password'));
});
await test('verified password changes call the server and keep the rotated session', async () => {
  const e = environment(); e.seed(); e.queue.push(reply(session()), reply(user('user-a', { xhz_has_password: true })));
  assert.equal((await e.request('/v1/users/me/password', { currentPassword: 'current-password', newPassword: 'new-password' }, 'PATCH')).status, 200);
  assert.equal(e.calls[1].method, 'PUT'); assert.equal(e.calls[1].body.password, 'new-password');
  assert.equal(e.calls[1].headers.Authorization, `Bearer ${jwt()}`);
});
await test('a late profile response cannot overwrite a different signed-in account', async () => {
  const e = environment(); e.seed(); const pending = deferred(); e.queue.push(() => pending.promise);
  const updating = e.request('/v1/users/me/profile', { displayName: 'Old request' }, 'PATCH');
  await new Promise(resolve => setImmediate(resolve));
  e.context.clearAuthSession(false); e.seed('user-b'); pending.resolve(reply(user('user-a', { full_name: 'Old request' })));
  assert.equal((await updating).status, 409); assert.equal(e.context.getSavedUser().id, 'user-b');
});
await test('a late cloud progress pull cannot merge data into another account', async () => {
  const e = environment(); e.seed(); const pending = deferred(); e.queue.push(() => pending.promise);
  const pulling = e.context.syncProgressFromSupabaseAuth(); await new Promise(resolve => setImmediate(resolve));
  e.context.clearAuthSession(false); e.seed('user-b'); e.localStorage.setItem('httq_progress_v2', '{"learnedWords":["乙"]}');
  pending.resolve(reply(user('user-a', { xhz_progress: { learnedWords: ['甲'] } })));
  assert.equal(await pulling, null); assert.deepEqual(JSON.parse(e.localStorage.getItem('httq_progress_v2')).learnedWords, ['乙']);
});
await test('progress reads mastered and saved words from the scoped study state', () => {
  const e = environment({ initial: { httq_state: '{"savedWords":{"wrong-owner":{}}}', 'scoped-study-state': '{"savedWords":{"你":{}},"masteredChars":{"好":{}}}' } });
  const progress = e.context.getRealProgress(); assert.ok(progress.learnedWords.includes('你')); assert.ok(progress.learnedWords.includes('好')); assert.ok(!progress.learnedWords.includes('wrong-owner'));
});
console.log(`${checks} mocked Auth checks passed. No real accounts, credentials, or remote data were accessed.`);
