/**
 * ============================================================================
 * XIEHANZI 1:1 CLONE RUNTIME ENGINE (v7.0 — FULL SUBPAGES + GAMES + HYDRATION)
 * ============================================================================
 * Phục vụ toàn bộ 280+ trang HTML tĩnh và mọi đường dẫn động (slug routes)
 * của https://hoctiengtrungquoc.vercel.app
 * Kết nối trực tiếp tới:
 *   1) Kho dữ liệu JSON cục bộ (/data/*)
 *   2) Kho 94,655 file Media trên GitHub hungktkthd/saochepweb
 *   3) Cơ sở dữ liệu đám mây Supabase (skxgzzdunqloxxombtuc)
 *   4) Serverless AI Endpoint (/api/ai)
 * ============================================================================
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://skxgzzdunqloxxombtuc.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18';
  const RAW_GITHUB_REPO = 'https://raw.githubusercontent.com/hungktkthd/saochepweb';
  const DEFAULT_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXhoei0xIiwidHlwIjoiYWNjZXNzIiwiZyI6MCwiZXhwIjo0MTAyNDQ0ODAwfQ.xhzsignature';

  const originalFetch = window.fetch.bind(window);
  const jsonCache = new Map();

  function decodeJwtPayload(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      const part = token.split('.')[1];
      if (!part) return null;
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (_e) {
      return null;
    }
  }

  function getSavedUser() {
    try {
      if (localStorage.getItem('httq_real_auth') !== '1') return null;
      const raw = localStorage.getItem('httq_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const token = localStorage.getItem('sb_access_token');
      const payload = decodeJwtPayload(token);
      return parsed && parsed.email && token !== DEFAULT_JWT && payload && payload.sub === parsed.id &&
        payload.iss === `${SUPABASE_URL}/auth/v1` && payload.role === 'authenticated' ? parsed : null;
    } catch (_e) {
      return null;
    }
  }

  let authSessionRequest = null;
  let authCallbackRequest = null;
  let authSessionRevision = 0;
  let validatedAuthToken = '';

  // Only call this with a user returned by Supabase Auth, never decoded JWT metadata.
  function saveAuthSession(accessToken, refreshToken, verifiedUser) {
    try {
      const payload = decodeJwtPayload(accessToken);
      if (!payload || accessToken === DEFAULT_JWT || !verifiedUser || !verifiedUser.id || !verifiedUser.email ||
          payload.sub !== verifiedUser.id || payload.iss !== `${SUPABASE_URL}/auth/v1` ||
          payload.role !== 'authenticated' || !Number.isFinite(Number(payload.exp)) || Number(payload.exp) <= Date.now() / 1000) return null;
      const meta = verifiedUser.user_metadata || {};
      const preferences = meta.xhz_preferences || {};
      const email = verifiedUser.email;
      const displayName =
        meta.displayName || meta.display_name ||
        meta.full_name ||
        meta.name ||
        email.split('@')[0];
      const avatar = Object.prototype.hasOwnProperty.call(meta, 'avatar_url') ? meta.avatar_url : meta.picture || '';
      const uid = verifiedUser.id;
      const providers = (verifiedUser.app_metadata || {}).providers || [];
      const userObj = {
        id: uid,
        _id: uid,
        email: email,
        username: email.split('@')[0] || 'hocvien',
        name: displayName,
        displayName: displayName,
        avatar: avatar,
        role: 'user',
        isGuest: false,
        hasPassword: providers.includes('email') || (verifiedUser.app_metadata || {}).provider === 'email' || meta.xhz_has_password === true,
        showPinyinByDefault: preferences.showPinyinByDefault !== undefined ? preferences.showPinyinByDefault : true,
        showOnPublicFeed: preferences.showOnPublicFeed !== undefined ? preferences.showOnPublicFeed : true,
        streak: 0
      };
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
      if (accessToken) localStorage.setItem('sb_access_token', accessToken);
      if (refreshToken) localStorage.setItem('sb_refresh_token', refreshToken);
      localStorage.setItem('httq_user', JSON.stringify(userObj));
      localStorage.setItem('httq_user_id', uid);
      localStorage.setItem('httq_real_auth', '1');
      validatedAuthToken = accessToken;
      return userObj;
    } catch (_e) {
      return null;
    }
  }

  function clearAuthSession(notifyServer = true) {
    try {
      authSessionRevision++;
      validatedAuthToken = '';
      const sbToken = localStorage.getItem('sb_access_token');
      if (notifyServer && sbToken && sbToken !== DEFAULT_JWT) {
        originalFetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${sbToken}`
          }
        }).catch(() => {});
      }
      localStorage.removeItem('httq_user');
      localStorage.removeItem('httq_user_id');
      localStorage.removeItem('httq_real_auth');
      localStorage.removeItem('httq_oauth_return_to');
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_refresh_token');
      localStorage.removeItem('sb-skxgzzdunqloxxombtuc-auth-token');
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
    } catch (_e) {}
  }

  async function requestSupabaseAuth(path, options = {}) {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      ...options,
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const error = new Error(data.msg || data.message || data.error_description || 'Không thể kết nối dịch vụ tài khoản.');
      error.status = response.status;
      error.code = data.error_code || data.code || data.error || 'auth_request_failed';
      throw error;
    }
    return data;
  }

  async function getSupabaseSession() {
    if (authCallbackRequest) await authCallbackRequest;
    if (authSessionRequest) return authSessionRequest;
    const token = localStorage.getItem('sb_access_token');
    const refresh = localStorage.getItem('sb_refresh_token') || '';
    if (!token || token === DEFAULT_JWT) {
      if (token === DEFAULT_JWT || localStorage.getItem('httq_real_auth') === '1' || localStorage.getItem('httq_user')) clearAuthSession(false);
      return null;
    }
    const revision = authSessionRevision;
    const owner = getSavedUser();
    const stillCurrent = () => revision === authSessionRevision && localStorage.getItem('sb_access_token') === token;
    const operation = (async () => {
      try {
        let accessToken = token;
        let refreshToken = refresh;
        let payload = decodeJwtPayload(token);
        let user;
        if (!payload || Number(payload.exp) <= Date.now() / 1000 + 60) {
          if (!refresh) { if (stillCurrent()) clearAuthSession(false); return null; }
          const next = await requestSupabaseAuth('token?grant_type=refresh_token', {
            method: 'POST', body: JSON.stringify({ refresh_token: refresh })
          });
          if (!stillCurrent()) return null;
          accessToken = next.access_token;
          refreshToken = next.refresh_token;
          user = next.user;
          payload = decodeJwtPayload(accessToken);
        }
        if (!user && (validatedAuthToken !== accessToken || !owner)) {
          user = await requestSupabaseAuth('user', { headers: { Authorization: `Bearer ${accessToken}` } });
        }
        if (!stillCurrent()) return null;
        if (user) {
          if (owner && user.id !== owner.id) { clearAuthSession(false); return null; }
          if (!saveAuthSession(accessToken, refreshToken, user)) { clearAuthSession(false); return null; }
        }
        const currentUser = getSavedUser();
        if (!currentUser || !payload || payload.sub !== currentUser.id || validatedAuthToken !== accessToken) return null;
        return { access_token: accessToken, refresh_token: refreshToken, user: currentUser, expires_at: Number(payload.exp) };
      } catch (error) {
        if (stillCurrent() && (error.status === 400 || error.status === 401 || error.status === 403)) clearAuthSession(false);
        return null;
      }
    })();
    authSessionRequest = operation;
    try { return await operation; } finally { if (authSessionRequest === operation) authSessionRequest = null; }
  }
  window.getSupabaseSession = getSupabaseSession;

  function authErrorResponse(error) {
    const code = error.code || 'auth_request_failed';
    const messages = {
      invalid_credentials: 'Email hoặc mật khẩu không đúng.',
      email_not_confirmed: 'Vui lòng xác nhận email trước khi đăng nhập.',
      over_email_send_rate_limit: 'Đã gửi quá nhiều email. Vui lòng chờ rồi thử lại.',
      over_request_rate_limit: 'Bạn thao tác quá nhanh. Vui lòng chờ rồi thử lại.',
      signup_disabled: 'Đăng ký email hiện chưa được bật. Bạn có thể đăng nhập bằng Google.'
    };
    const message = messages[code] || error.message || 'Không thể kết nối dịch vụ tài khoản.';
    return jsonResponse({ ok: false, code, message, error: { code, message } }, error.status || 503);
  }

  async function updateSupabaseProfile(body, kind, method) {
    const revision = authSessionRevision;
    const session = await getSupabaseSession();
    if (!session) return authErrorResponse({ status: 401, code: 'unauthorized', message: 'Vui lòng đăng nhập để cập nhật tài khoản.' });
    const stillCurrent = () => revision === authSessionRevision && (getSavedUser() || {}).id === session.user.id;
    if (!stillCurrent()) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
    if (method === 'GET') return jsonResponse({ ok: true, ...session.user, user: session.user });
    try {
      const data = {};
      if (kind === 'profile') {
        const name = String(body.displayName || body.name || '').trim();
        if (name.length < 2 || name.length > 40) return authErrorResponse({ status: 400, code: 'invalid_name', message: 'Tên hiển thị phải từ 2 đến 40 ký tự.' });
        data.displayName = name;
        data.full_name = name;
        data.name = name;
      } else if (kind === 'preferences') {
        data.xhz_preferences = {
          showPinyinByDefault: session.user.showPinyinByDefault,
          showOnPublicFeed: session.user.showOnPublicFeed
        };
        for (const key of ['showPinyinByDefault', 'showOnPublicFeed']) {
          if (body[key] !== undefined) {
            if (typeof body[key] !== 'boolean') return authErrorResponse({ status: 400, code: 'invalid_preference', message: 'Tùy chọn tài khoản không hợp lệ.' });
            data.xhz_preferences[key] = body[key];
          }
        }
      } else {
        const avatar = method === 'DELETE' ? '' : body.image || body.avatar;
        if (typeof avatar !== 'string' || avatar.length > 512000 || (avatar && !/^https:\/\/[^\s"'<>]+$/.test(avatar) && !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar))) {
          return authErrorResponse({ status: 400, code: 'invalid_avatar', message: 'Vui lòng chọn ảnh JPG, PNG hoặc WebP có dung lượng nhỏ hơn 500KB.' });
        }
        data.avatar_url = avatar;
        data.picture = avatar;
      }
      const user = await requestSupabaseAuth('user', {
        method: 'PUT', headers: { Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ data })
      });
      if (!stillCurrent() || user.id !== session.user.id) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
      const updated = saveAuthSession(session.access_token, session.refresh_token, user);
      if (!updated) return authErrorResponse({ status: 401, code: 'invalid_session', message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      return jsonResponse({ ok: true, ...updated, user: updated });
    } catch (error) { return authErrorResponse(error); }
  }

  // Xử lý OAuth callback từ Supabase Google Login (#access_token=... hoặc token lưu bởi @supabase/supabase-js)
  try {
    const hash = window.location.hash ? window.location.hash.substring(1) : '';
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken) {
        const callbackRevision = ++authSessionRevision;
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (_e) {}
        let returnTo = '/tai-khoan';
        try {
          const target = new URL(localStorage.getItem('httq_oauth_return_to') || returnTo, window.location.origin);
          if (target.origin === window.location.origin) returnTo = target.pathname + target.search;
        } catch (_) {}
        localStorage.removeItem('httq_oauth_return_to');
        let callbackValidated = false;
        authCallbackRequest = requestSupabaseAuth('user', { headers: { Authorization: `Bearer ${accessToken}` } })
          .then(u => {
            if (callbackRevision === authSessionRevision && u && u.email) {
              if (!saveAuthSession(accessToken, refreshToken, u)) throw new Error('invalid_session');
              callbackValidated = true;
            }
          })
          .catch(() => { if (callbackRevision === authSessionRevision) clearAuthSession(false); })
          .finally(() => {
            authCallbackRequest = null;
            if (callbackValidated && callbackRevision === authSessionRevision) {
              window.location.replace(returnTo);
            }
          });
      }
    } else {
      // Kiểm tra nếu người dùng đã đăng nhập qua tai-khoan-moi.html (sb-skxgzzdunqloxxombtuc-auth-token)
      const sbRaw = localStorage.getItem('sb-skxgzzdunqloxxombtuc-auth-token');
      if (sbRaw && localStorage.getItem('httq_real_auth') !== '1') {
        const sbSession = JSON.parse(sbRaw);
        if (sbSession && sbSession.access_token) {
          localStorage.setItem('sb_access_token', sbSession.access_token);
          if (sbSession.refresh_token) localStorage.setItem('sb_refresh_token', sbSession.refresh_token);
          getSupabaseSession();
        }
      }
    }
    localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
  } catch (_e) {}

  // Đồng bộ khi Next.js gọi localStorage.removeItem('xiehanzi_access_token') lúc Đăng xuất
  try {
    const origRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      origRemoveItem.apply(this, arguments);
      if (this === localStorage && key === 'xiehanzi_access_token') {
        clearAuthSession();
      }
    };
  } catch (_e) {}

  window.loginWithGoogle = function (returnUrl) {
    let dest = returnUrl;
    if (!dest || typeof dest !== 'string') {
      const sp = new URLSearchParams(window.location.search);
      dest = sp.get('returnUrl') || '/tai-khoan';
    }
    let cleanDest = '/tai-khoan';
    try { const target = new URL(dest, window.location.origin); if (target.origin === window.location.origin) cleanDest = target.pathname + target.search; } catch (_) {}
    try {
      localStorage.setItem('httq_oauth_return_to', cleanDest || '/tai-khoan');
    } catch (_e) {}
    const fullRedirect = window.location.origin + cleanDest;
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(fullRedirect)}`;
  };

  window.logoutXieHanzi = function () {
    clearAuthSession();
    window.location.href = '/tai-khoan';
  };

  async function loadLocalJson(path) {
    if (jsonCache.has(path)) return jsonCache.get(path);
    const p = originalFetch(path)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
    jsonCache.set(path, p);
    return p;
  }

  // Tích hợp Google Identity Services với Supabase Google OAuth trên /dang-nhap, /dang-ky, /tai-khoan
  try {
    const googleSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:18px;height:18px;flex-shrink:0;"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>';
    window.google = window.google || {
      accounts: {
        id: {
          initialize: function () {},
          renderButton: function (el) {
            if (el) {
              el.innerHTML =
                '<button type="button" data-google-oauth="1" style="width:100%;padding:10px 16px;border-radius:999px;border:1px solid #d6d3d1;background:#ffffff;color:#1c1917;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 1px 2px rgba(0,0,0,0.04);">' +
                googleSvg +
                '<span>Tiếp tục với Google</span></button>';
              const btn = el.querySelector('button');
              if (btn) {
                btn.addEventListener('click', function (e) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.loginWithGoogle();
                });
              }
            }
          },
          prompt: function () {},
          cancel: function () {},
          disableAutoSelect: function () {}
        },
        oauth2: {
          initTokenClient: function () { return { requestAccessToken: function () { window.loginWithGoogle(); } }; },
          initCodeClient: function () { return { requestCode: function () { window.loginWithGoogle(); } }; }
        }
      }
    };
    if (navigator && navigator.sendBeacon) {
      const origBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function (url, data) {
        const s = String(url || '');
        if (s.includes('/monitoring') || s.includes('xiehanzi.com') || s.includes('/v1/') || s.includes('/v2/')) {
          return true;
        }
        return origBeacon(url, data);
      };
    }
    const createSyntheticAudioStream = () => {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      const stream = dest.stream;
      stream.getTracks().forEach(t => {
        const origStop = t.stop.bind(t);
        t.stop = function () {
          try { osc.stop(); ctx.close(); } catch (_) {}
          return origStop();
        };
      });
      return stream;
    };
    if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async function (constraints) {
        try {
          return await origGetUserMedia(constraints);
        } catch (_err) {
          if (constraints && constraints.audio) {
            return createSyntheticAudioStream();
          }
          throw _err;
        }
      };
    } else if (navigator) {
      try {
        navigator.mediaDevices = navigator.mediaDevices || {};
        navigator.mediaDevices.getUserMedia = async function () {
          return createSyntheticAudioStream();
        };
      } catch (_) {}
    }
  } catch (_e) {}

  // ==========================================================================
  // 1. BỘ ĐỊNH TUYẾN MEDIA (CHUYỂN static.xiehanzi.com & /_next/image)
  // ==========================================================================
  function rewriteMediaUrl(url) {
    if (!url || typeof url !== 'string') return url;

    if (url.includes('accounts.google.com/gsi')) {
      return url.includes('/button') || url.includes('/iframe') ? 'about:blank' : 'data:text/javascript,//';
    }

    if (url.includes('/_next/image')) {
      try {
        const u = new URL(url, window.location.origin);
        const inner = u.searchParams.get('url');
        if (inner) return rewriteMediaUrl(decodeURIComponent(inner));
      } catch (_e) {}
    }

    if (url.startsWith('https://static.xiehanzi.com/web/prod/_next/static/')) {
      return '/_next/static/' + url.slice('https://static.xiehanzi.com/web/prod/_next/static/'.length);
    }

    if (url.startsWith('assets/')) {
      const m = window.location.pathname.match(/\/(?:test|lam-bai)\/([^/?#]+)/);
      const tid = m ? decodeURIComponent(m[1]) : 'hsk30-1';
      return `${RAW_GITHUB_REPO}/media-visuals/hsk-tests/${encodeURIComponent(tid)}/${url}`;
    }

    if (url.startsWith('https://api.xiehanzi.com/media-signed/')) {
      const relSigned = url.slice('https://api.xiehanzi.com/media-signed/'.length).split('?')[0];
      if (
        relSigned.startsWith('word_audios/') ||
        relSigned.startsWith('audios/') ||
        relSigned.startsWith('hsk-audio/') ||
        relSigned.startsWith('sentence-audio/')
      ) {
        return rewriteMediaUrl('https://static.xiehanzi.com/' + relSigned);
      }
    }

    if (url.startsWith('https://static.xiehanzi.com/')) {
      let rel = url.slice('https://static.xiehanzi.com/'.length).split('?')[0].split('&')[0];
      try {
        rel = decodeURIComponent(rel);
      } catch (_e) {}
      const encRel = rel.split('/').map(s => encodeURIComponent(s)).join('/');

      if (rel.startsWith('level_images/')) {
        return '/' + encRel;
      }
      if (
        rel.startsWith('gif/') ||
        rel.startsWith('hsk-tests/') ||
        rel.startsWith('word-illustration/')
      ) {
        return `${RAW_GITHUB_REPO}/media-visuals/${encRel}`;
      }
      if (rel.startsWith('etymology/')) {
        return `${RAW_GITHUB_REPO}/media-etymology/${encRel}`;
      }
      if (rel.startsWith('audios/') || rel.startsWith('word_audios/')) {
        return `${RAW_GITHUB_REPO}/media-audios/${encRel}`;
      }
      if (rel.startsWith('hsk-audio/')) {
        return `${RAW_GITHUB_REPO}/media-hsk-audio/${encRel}`;
      }
      if (rel.startsWith('sentence-audio/')) {
        const fname = rel.slice('sentence-audio/'.length);
        const firstHex = fname.charAt(0).toLowerCase();
        const branchNum = firstHex >= '0' && firstHex <= '7' ? '1' : '2';
        return `${RAW_GITHUB_REPO}/media-sentences-${branchNum}/${encRel}`;
      }
      return `${RAW_GITHUB_REPO}/media-visuals/${encRel}`;
    }
    return url;
  }

  function rewriteSrcset(srcset) {
    if (!srcset || typeof srcset !== 'string') return srcset;
    const parts = srcset
      .split(',')
      .map(part => {
        const trimmed = part.trim();
        if (!trimmed) return null;
        const spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx === -1) {
          const u = rewriteMediaUrl(trimmed);
          return { u, desc: '' };
        }
        const u = rewriteMediaUrl(trimmed.slice(0, spaceIdx));
        const desc = trimmed.slice(spaceIdx + 1).trim();
        return { u, desc };
      })
      .filter(Boolean);

    if (parts.length === 0) return '';
    const uniqueUrls = new Set(parts.map(p => p.u));
    if (uniqueUrls.size === 1) {
      return `${parts[0].u} 1x`;
    }
    return parts.map(p => (p.desc ? `${p.u} ${p.desc}` : p.u)).join(', ');
  }

  try {
    const origSetAttr = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      if (typeof name === 'string') {
        const lower = name.toLowerCase();
        if (lower === 'src' || lower === 'href') {
          value = rewriteMediaUrl(String(value));
        } else if (lower === 'srcset' || lower === 'imagesrcset') {
          value = rewriteSrcset(String(value));
        }
      }
      return origSetAttr.call(this, name, value);
    };

    const imgSrcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (imgSrcDesc && imgSrcDesc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        get: imgSrcDesc.get,
        set: function (val) {
          imgSrcDesc.set.call(this, rewriteMediaUrl(String(val)));
        },
        configurable: true,
        enumerable: true
      });
    }
    const imgSrcsetDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'srcset');
    if (imgSrcsetDesc && imgSrcsetDesc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'srcset', {
        get: imgSrcsetDesc.get,
        set: function (val) {
          imgSrcsetDesc.set.call(this, rewriteSrcset(String(val)));
        },
        configurable: true,
        enumerable: true
      });
    }
    const scriptSrcDesc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
    if (scriptSrcDesc && scriptSrcDesc.set) {
      Object.defineProperty(HTMLScriptElement.prototype, 'src', {
        get: scriptSrcDesc.get,
        set: function (val) {
          scriptSrcDesc.set.call(this, rewriteMediaUrl(String(val)));
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch (_e) {}

  window.Audio = new Proxy(window.Audio, {
    construct(Target, args) {
      if (args[0]) args[0] = rewriteMediaUrl(args[0]);
      return new Target(...args);
    }
  });

  // ==========================================================================
  // 2. ĐỒNG BỘ SUPABASE AUTH (user_metadata.xhz_progress) & LOCAL STORAGE
  // ==========================================================================
  function getIsoWeekKey(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function getRealProgress() {
    let prog = {
      doneStages: [],
      doneActivities: {},
      learnedWords: [],
      activeDates: [],
      minutesByDate: {},
      sessionsByDate: {},
      gradingUsed: 0,
      voiceUsed: 0,
      longestStreak: 0,
      currentStageKey: 'hsk30.L1.P1',
      currentLessonId: 'hsk30.L1.P1.learn.1',
      updatedAt: 0
    };
    try {
      const raw = localStorage.getItem('httq_progress_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          prog = { ...prog, ...parsed };
        }
      }
      // Đồng bộ ngược các khóa localStorage hiện có vào prog
      const ds = JSON.parse(localStorage.getItem('httq_done_stages') || '[]');
      if (Array.isArray(ds)) {
        prog.doneStages = [...new Set([...(prog.doneStages || []), ...ds])];
      }
      const da = JSON.parse(localStorage.getItem('httq_done_activities') || '{}');
      if (da && typeof da === 'object') {
        prog.doneActivities = prog.doneActivities || {};
        for (const k of Object.keys(da)) {
          const merged = new Set([...(prog.doneActivities[k] || []), ...(Array.isArray(da[k]) ? da[k] : [])]);
          prog.doneActivities[k] = [...merged];
        }
      }
      const st = getLocalState();
      const savedWordKeys = [
        ...Object.keys((st && st.masteredChars) || {}),
        ...Object.keys((st && st.savedWords) || {})
      ];
      const currWords = JSON.parse(localStorage.getItem('httq_curr_learned_words') || '[]');
      prog.learnedWords = [
        ...new Set([
          ...(Array.isArray(prog.learnedWords) ? prog.learnedWords : []),
          ...savedWordKeys,
          ...(Array.isArray(currWords) ? currWords : [])
        ])
      ].filter(Boolean);
      const savedStg = localStorage.getItem('httq_current_stage_key');
      if (savedStg) prog.currentStageKey = savedStg;
      const savedLes = localStorage.getItem('httq_current_lesson_id');
      if (savedLes) prog.currentLessonId = savedLes;
    } catch (_e) {}
    return prog;
  }

  function saveRealProgress(prog) {
    try {
      prog.updatedAt = Date.now();
      localStorage.setItem('httq_progress_v2', JSON.stringify(prog));
      localStorage.setItem('httq_done_stages', JSON.stringify(prog.doneStages || []));
      localStorage.setItem('httq_done_activities', JSON.stringify(prog.doneActivities || {}));
      localStorage.setItem('httq_curr_learned_words', JSON.stringify(prog.learnedWords || []));
      if (prog.currentStageKey) localStorage.setItem('httq_current_stage_key', prog.currentStageKey);
      if (prog.currentLessonId) localStorage.setItem('httq_current_lesson_id', prog.currentLessonId);
    } catch (_e) {}
  }

  function mergeProgressObjects(localP, remoteP) {
    if (!remoteP || typeof remoteP !== 'object') return localP;
    const mergedActs = { ...(remoteP.doneActivities || {}) };
    for (const [k, arr] of Object.entries(localP.doneActivities || {})) {
      mergedActs[k] = [...new Set([...(mergedActs[k] || []), ...(Array.isArray(arr) ? arr : [])])];
    }
    const mergedMins = { ...(remoteP.minutesByDate || {}) };
    for (const [d, m] of Object.entries(localP.minutesByDate || {})) {
      mergedMins[d] = Math.max(Number(mergedMins[d]) || 0, Number(m) || 0);
    }
    const mergedSess = { ...(remoteP.sessionsByDate || {}) };
    for (const [d, s] of Object.entries(localP.sessionsByDate || {})) {
      mergedSess[d] = Math.max(Number(mergedSess[d]) || 0, Number(s) || 0);
    }
    const activeDates = [
      ...new Set([
        ...(Array.isArray(remoteP.activeDates) ? remoteP.activeDates : []),
        ...(Array.isArray(localP.activeDates) ? localP.activeDates : []),
        ...Object.keys(mergedMins).filter(d => mergedMins[d] > 0)
      ])
    ].sort();
    const newer = (Number(remoteP.updatedAt) || 0) > (Number(localP.updatedAt) || 0) ? remoteP : localP;
    return {
      doneStages: [...new Set([...(remoteP.doneStages || []), ...(localP.doneStages || [])])],
      doneActivities: mergedActs,
      learnedWords: [...new Set([...(remoteP.learnedWords || []), ...(localP.learnedWords || [])])].filter(Boolean),
      activeDates,
      minutesByDate: mergedMins,
      sessionsByDate: mergedSess,
      gradingUsed: Math.max(Number(remoteP.gradingUsed) || 0, Number(localP.gradingUsed) || 0),
      voiceUsed: Math.max(Number(remoteP.voiceUsed) || 0, Number(localP.voiceUsed) || 0),
      longestStreak: Math.max(Number(remoteP.longestStreak) || 0, Number(localP.longestStreak) || 0),
      currentStageKey: newer.currentStageKey || localP.currentStageKey || 'hsk30.L1.P1',
      currentLessonId: newer.currentLessonId || localP.currentLessonId || 'hsk30.L1.P1.learn.1',
      updatedAt: Math.max(Number(remoteP.updatedAt) || 0, Number(localP.updatedAt) || 0, Date.now())
    };
  }

  function getRealProgressSummary() {
    const prog = getRealProgress();
    // Enrol existing v10 learning progress before the native dashboard requests
    // its first review summary. Every card corresponds to an actually learned word.
    const studyState = getLocalState();
    studyState.collections = studyState.collections || {};
    const existingCards = studyState.collections.reviewCards || [];
    const enrolledKeys = new Set(existingCards.filter(card => card.skill === 'meaning').map(card => card.itemKey));
    let enrolled = false;
    for (const word of prog.learnedWords || []) {
      const hanzi = String(word || '').trim();
      if (!hanzi || enrolledKeys.has(`w:${hanzi}`)) continue;
      enrolledKeys.add(`w:${hanzi}`); enrolled = true;
      existingCards.push({ itemKey: `w:${hanzi}`, skill: 'meaning', state: 'learning', dueAt: new Date().toISOString(), wrongCount: 0, correctStreak: 0, attempts: 0, createdAt: new Date().toISOString(), content: { hanzi } });
    }
    if (enrolled) { studyState.collections.reviewCards = existingCards; saveLocalState(studyState); }
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeSet = new Set(Array.isArray(prog.activeDates) ? prog.activeDates : []);
    // Tính chuỗi ngày học liên tiếp (streak)
    let streakDays = 0;
    const cursor = new Date();
    const todayIso = cursor.toISOString().slice(0, 10);
    const yesterday = new Date(cursor.getTime() - 86400000).toISOString().slice(0, 10);
    if (activeSet.has(todayIso) || activeSet.has(yesterday)) {
      let checkDate = activeSet.has(todayIso) ? new Date(cursor) : new Date(cursor.getTime() - 86400000);
      while (true) {
        const iso = checkDate.toISOString().slice(0, 10);
        if (activeSet.has(iso)) {
          streakDays++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }
    const longestStreak = Math.max(Number(prog.longestStreak) || 0, streakDays);
    const todayDone = activeSet.has(todayStr);

    // Tính số buổi học & ngày học trong tuần hiện tại
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Thứ Hai .. 6 = Chủ Nhật
    const monday = new Date(now.getTime() - dayOfWeek * 86400000);
    const weekDays = [];
    let weeklySessionsDone = 0;
    for (let i = 0; i <= dayOfWeek; i++) {
      const dStr = new Date(monday.getTime() + i * 86400000).toISOString().slice(0, 10);
      const sess = Number((prog.sessionsByDate && prog.sessionsByDate[dStr]) || (activeSet.has(dStr) ? 1 : 0));
      if (sess > 0) {
        weeklySessionsDone += sess;
        weekDays.push({ day: dStr, done: true, sessions: sess });
      }
    }

    // Tính lịch sử 12 tuần gần nhất
    const activity12Weeks = [];
    for (let w = 11; w >= 0; w--) {
      const wStart = new Date(monday.getTime() - w * 7 * 86400000);
      const isoWeek = getIsoWeekKey(wStart);
      let mins = 0;
      let actDays = 0;
      for (let d = 0; d < 7; d++) {
        const dStr = new Date(wStart.getTime() + d * 86400000).toISOString().slice(0, 10);
        const m = Number((prog.minutesByDate && prog.minutesByDate[dStr]) || 0);
        if (m > 0 || activeSet.has(dStr)) {
          actDays++;
          mins += m || 6;
        }
      }
      activity12Weeks.push({ isoWeek, minutes: mins, activeDays: actDays });
    }

    const totalMinutes = Object.values(prog.minutesByDate || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const lessonsDone = Object.values(prog.doneActivities || {}).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    const wordsMastered = (prog.learnedWords || []).length;
    const reviewCards = getLocalState().collections?.reviewCards || [];
    const dueCards = reviewCards.filter(card => !card.deletedAt && (!card.dueAt || new Date(card.dueAt).getTime() <= Date.now()));
    const dueTotal = dueCards.length;
    const dueMeaning = dueCards.filter(card => card.skill !== 'pinyin').length;
    const duePinyin = dueCards.filter(card => card.skill === 'pinyin').length;

    prog.wordsLearned = prog.learnedWords || [];
    const todayMinutes = Number((prog.minutesByDate && prog.minutesByDate[todayStr]) || 0);
    const mistakesCount = reviewCards.filter(card => !card.deletedAt && card.wrongCount > 0 && card.correctStreak < 2 && !card.dismissed).length;

    return {
      prog,
      streakDays,
      longestStreak,
      todayDone,
      activeDates: prog.activeDates || [],
      weeklySessionsDone,
      sessionsThisWeek: weeklySessionsDone,
      goalSessions: 5,
      weekDays,
      activity12Weeks,
      activity: activity12Weeks,
      totalMinutes,
      todayMinutes,
      lessonsDone,
      stagesDone: (prog.doneStages || []).length,
      wordsMastered,
      wordsLearning: new Set(reviewCards.filter(card => !card.deletedAt && (Number(card.correctStreak) || 0) < 3).map(card => card.itemKey)).size,
      wordsSeen: wordsMastered,
      dueTotal,
      dueMeaning,
      duePinyin,
      totalCards: reviewCards.filter(card => !card.deletedAt).length,
      mistakesCount,
      gradingUsed: Number(prog.gradingUsed) || 0,
      voiceUsed: Number(prog.voiceUsed) || 0
    };
  }

  async function syncProgressToSupabaseAuth(progOverride) {
    const owner = getSavedUser();
    const revision = authSessionRevision;
    const prog = progOverride || getRealProgress();
    saveRealProgress(prog);
    try {
      const session = await getSupabaseSession();
      if (!session || !owner || owner.id !== session.user.id || revision !== authSessionRevision || (getSavedUser() || {}).id !== owner.id) return false;
      const res = await originalFetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            xhz_progress: prog,
            xhz_synced_at: new Date().toISOString()
          }
        })
      });
      return res.ok && revision === authSessionRevision && (getSavedUser() || {}).id === owner.id;
    } catch (_e) {
      return false;
    }
  }

  async function syncProgressFromSupabaseAuth(forceReloadUi = false) {
    try {
      const revision = authSessionRevision;
      const session = await getSupabaseSession();
      if (!session || revision !== authSessionRevision) return null;
      const ownerId = session.user.id;
      const stillCurrent = () => revision === authSessionRevision && (getSavedUser() || {}).id === ownerId;
      const res = await originalFetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok || !stillCurrent()) return null;
      const u = await res.json();
      if (!u || u.id !== ownerId || !stillCurrent()) return null;
      const meta = u.user_metadata || {};
      saveAuthSession(session.access_token, session.refresh_token, u);
      const localP = getRealProgress();
      const remoteP = meta.xhz_progress || null;
      const merged = mergeProgressObjects(localP, remoteP);
      saveRealProgress(merged);
      if (!remoteP || (Number(localP.updatedAt) || 0) > (Number(remoteP.updatedAt) || 0)) {
        await syncProgressToSupabaseAuth(merged);
      }
      if (forceReloadUi && stillCurrent()) {
        window.location.reload();
      }
      return merged;
    } catch (_e) {
      return null;
    }
  }

  function recordStudyProgress(delta = {}) {
    const prog = getRealProgress();
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(prog.activeDates)) prog.activeDates = [];
    if (!prog.activeDates.includes(todayStr)) prog.activeDates.push(todayStr);

    if (delta.minutes && delta.minutes > 0) {
      prog.minutesByDate = prog.minutesByDate || {};
      prog.minutesByDate[todayStr] = (Number(prog.minutesByDate[todayStr]) || 0) + Number(delta.minutes);
    }
    if (delta.sessionInc) {
      prog.sessionsByDate = prog.sessionsByDate || {};
      prog.sessionsByDate[todayStr] = (Number(prog.sessionsByDate[todayStr]) || 0) + Number(delta.sessionInc);
    }
    if (delta.stageKey && delta.activityKey) {
      prog.doneActivities = prog.doneActivities || {};
      const list = Array.isArray(prog.doneActivities[delta.stageKey]) ? prog.doneActivities[delta.stageKey] : [];
      if (!list.includes(delta.activityKey)) list.push(delta.activityKey);
      prog.doneActivities[delta.stageKey] = list;
      if (list.length >= 4 && !prog.doneStages.includes(delta.stageKey)) {
        prog.doneStages.push(delta.stageKey);
      }
    }
    if (Array.isArray(delta.words) && delta.words.length > 0) {
      const cleanWords = delta.words
        .map(w => String(w || '').replace(/^w:|^c:/, '').replace(/\{|\}/g, '').trim())
        .filter(Boolean);
      prog.learnedWords = [...new Set([...(prog.learnedWords || []), ...cleanWords])];
    }
    if (delta.removeWord) {
      const rw = String(delta.removeWord).trim();
      prog.learnedWords = (prog.learnedWords || []).filter(w => w !== rw);
    }
    if (delta.gradingInc) {
      prog.gradingUsed = (Number(prog.gradingUsed) || 0) + Number(delta.gradingInc);
    }
    if (delta.voiceInc) {
      prog.voiceUsed = (Number(prog.voiceUsed) || 0) + Number(delta.voiceInc);
    }
    saveRealProgress(prog);
    const summary = getRealProgressSummary();
    if (summary.streakDays > (prog.longestStreak || 0)) {
      prog.longestStreak = summary.streakDays;
      saveRealProgress(prog);
    }
    syncProgressToSupabaseAuth(prog);
    return prog;
  }

  window.__xhzSyncCloudProgress = async () => {
    if (!await supabasePull()) return false;
    return supabaseUpsert(getLocalState());
  };
  window.__xhzRecordProgress = recordStudyProgress;

  // BEGIN GENERATED STORAGE SUPPORT
  // Scope the original client's fixed localStorage keys without changing auth
  // credentials or sessionStorage. Call once before the copied client starts.
  function initializeScopedStorage() {
    if (typeof Storage === 'undefined' || typeof window === 'undefined') return false;
    const prototype = Storage.prototype;
    const marker = Symbol.for('httq.scopedStorage.v1');
    if (prototype[marker]) return true;
    let local;
    try { local = window.localStorage; } catch (_) { return false; }
    if (!local) return false;
    const keys = new Set(['xhz-practice-v1', 'xhz-study-time-v1', 'xhz-intake-v1',
      'httq_companion_chat_turns', 'httq_learning_profile', 'httq_current_lesson_id',
      'httq_habit_settings', 'httq_account_profile', 'httq_companion_id',
      'httq_learned_grammar', 'httq_dismissed_mistakes', 'httq_progress_v2',
      'httq_done_stages', 'httq_done_activities', 'httq_curr_learned_words',
      'httq_current_stage_key', 'httq_last_review_mode', 'them-pinyin-history',
      'xhz-curriculum-place-v1', 'xhz-daily-session-opened-v1', 'xhz-grammar-study-v1',
      'xhz-lesson-prefs-v1', 'xhz-listening-v1', 'xhz-path-last-current',
      'xhz-practice-sound-v1', 'xhz-recent-lessons-v1', 'xhz-review-import-v1',
      'xhz-review-signals-v1', 'xhz-review-source', 'xhz-seen-words-sync-v1',
      'xhz-seen-words-v1', 'xhz-speaking-progress-v1', 'xhz-speaking-v1',
      'xhz-track-onboarding-v1', 'xhz_intake', 'xhz-collection-import-v1',
      'templateHistory', 'thay-do-world-guide-done']);
    const isScoped = key => keys.has(key) || key.startsWith('httq_daily_steps_') || key.startsWith('xiehanzi:dictation:');
    const nativeGet = prototype.getItem, nativeSet = prototype.setItem, nativeRemove = prototype.removeItem;
    const descriptors = Object.fromEntries(['getItem', 'setItem', 'removeItem'].map(name => [name, Object.getOwnPropertyDescriptor(prototype, name)]));
    const scope = () => typeof getStudyStateStorageKey === 'function' ? getStudyStateStorageKey() : 'httq_state:guest';
    const scopedKey = (key, owner) => `${key}:${owner}`;
    function getItem(input) {
      if (!arguments.length) return nativeGet.call(this);
      const key = String(input);
      if (this !== local || !isScoped(key)) return nativeGet.call(this, key);
      const owner = scope(), target = scopedKey(key, owner);
      let value = nativeGet.call(this, target);
      // Previously unscoped data belongs to this device's guest workspace. Never
      // import it into whichever registered account happens to sign in first.
      if (value === null && owner === 'httq_state:guest') {
        const legacy = nativeGet.call(this, key);
        if (legacy !== null) {
          nativeSet.call(this, target, legacy);
          nativeRemove.call(this, key);
          value = legacy;
        }
      }
      return value;
    }
    function setItem(input, value) {
      if (arguments.length < 2) return nativeSet.apply(this, arguments);
      const key = String(input);
      return nativeSet.call(this, this === local && isScoped(key) ? scopedKey(key, scope()) : key, value);
    }
    function removeItem(input) {
      if (!arguments.length) return nativeRemove.call(this);
      const key = String(input);
      if (this !== local || !isScoped(key)) return nativeRemove.call(this, key);
      const owner = scope();
      nativeRemove.call(this, scopedKey(key, owner));
      if (owner === 'httq_state:guest') nativeRemove.call(this, key);
    }
    try {
      Object.defineProperties(prototype, {
        getItem: { ...descriptors.getItem, value: getItem },
        setItem: { ...descriptors.setItem, value: setItem },
        removeItem: { ...descriptors.removeItem, value: removeItem }
      });
      Object.defineProperty(prototype, marker, { value: true, configurable: true });
    } catch (_) {
      for (const [name, descriptor] of Object.entries(descriptors)) {
        try { if (descriptor) Object.defineProperty(prototype, name, descriptor); } catch (_) {}
      }
      return false;
    }
    if (typeof window.addEventListener === 'function' && typeof StorageEvent !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.storageArea !== local || typeof event.key !== 'string') return;
        const markerIndex = event.key.lastIndexOf(':httq_state:');
        const key = markerIndex < 0 ? '' : event.key.slice(0, markerIndex);
        if (!key || !isScoped(key)) return;
        // Existing bundle listeners compare event.key with the original fixed
        // name. Translate only the active owner's event; ignore other owners.
        event.stopImmediatePropagation();
        if (event.key !== scopedKey(key, scope())) return;
        window.dispatchEvent(new StorageEvent('storage', { key, oldValue: event.oldValue, newValue: event.newValue,
          url: event.url, storageArea: local }));
      }, true);
    }
    return true;
  }
  initializeScopedStorage();

  // END GENERATED STORAGE SUPPORT

  function getStudyStateStorageKey() {
    const user = getSavedUser();
    return user && user.id ? `httq_state:user:${user.id}` : 'httq_state:guest';
  }

  function getLocalState() {
    const empty = { masteredChars: {}, savedWords: {}, examCount: 0, history: [] };
    try {
      const key = getStudyStateStorageKey();
      let raw = localStorage.getItem(key);
      if (!raw) {
        const legacy = localStorage.getItem('httq_state');
        const legacyOwner = localStorage.getItem('httq_state_owner');
        if (legacy && (key === 'httq_state:guest' || legacyOwner === key)) {
          localStorage.setItem(key, legacy);
          raw = legacy;
        }
      }
      const state = JSON.parse(raw || '{}');
      return state && typeof state === 'object' && !Array.isArray(state) ? { ...empty, ...state } : empty;
    } catch (_) { return empty; }
  }

  function saveLocalState(state, key = getStudyStateStorageKey()) {
    if (key !== getStudyStateStorageKey()) return false;
    try { localStorage.setItem(key, JSON.stringify(state)); return true; }
    catch (_) { return false; }
  }

  let studyCloudQueue = Promise.resolve();
  function supabaseUpsert(state, options = {}) {
    const key = options.storageKey || getStudyStateStorageKey();
    if (!saveLocalState(state, key)) return Promise.resolve(false);
    const write = async () => {
      try {
        const session = await getSupabaseSession();
        if (!session || key !== getStudyStateStorageKey() || key !== `httq_state:user:${session.user.id}`) return false;
        const res = await originalFetch(`${SUPABASE_URL}/rest/v1/study_profiles?on_conflict=user_id,workspace`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({ user_id: session.user.id, workspace: 'hoctiengtrungquoc', state: getLocalState(), updated_at: new Date().toISOString() })
        });
        const metadataSynced = res.ok && key === getStudyStateStorageKey() && await syncProgressToSupabaseAuth();
        return Boolean(metadataSynced && key === getStudyStateStorageKey() && (getSavedUser() || {}).id === session.user.id);
      } catch (_) { return false; }
    };
    const run = () => navigator.locks && navigator.locks.request ? navigator.locks.request(`httq-study-cloud:${key}`, write) : write();
    const operation = studyCloudQueue.then(run, run);
    studyCloudQueue = operation.catch(() => false);
    return operation;
  }

  async function supabasePull() {
    const key = getStudyStateStorageKey();
    const metadata = await syncProgressFromSupabaseAuth(false);
    try {
      const session = await getSupabaseSession();
      if (!session || key !== getStudyStateStorageKey() || key !== `httq_state:user:${session.user.id}`) return false;
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/study_profiles?select=state&user_id=eq.${encodeURIComponent(session.user.id)}&workspace=eq.hoctiengtrungquoc`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) return false;
      const rows = await res.json();
      if (key !== getStudyStateStorageKey() || (getSavedUser() || {}).id !== session.user.id || !Array.isArray(rows)) return false;
      if (rows[0] && rows[0].state && !saveLocalState(mergeStudyState(rows[0].state, getLocalState()), key)) return false;
      return Boolean(metadata);
    } catch (_) { return false; }
  }
  supabasePull();

  // ==========================================================================
  // 3. TRA CỨU DỮ LIỆU ĐỘNG TỪ KHO /data/*
  // ==========================================================================
  function extractHanziChar(slug) {
    if (!slug) return '';
    const decoded = decodeURIComponent(slug).trim();
    const hanziMatch = decoded.match(/[\u4e00-\u9fff]/g);
    if (hanziMatch && hanziMatch.length > 0) {
      return hanziMatch[hanziMatch.length - 1];
    }
    return decoded;
  }

  function extractHanziWord(slug) {
    if (!slug) return '';
    const decoded = decodeURIComponent(slug).trim();
    const hanziMatch = decoded.match(/[\u4e00-\u9fff]+/g);
    if (hanziMatch && hanziMatch.length > 0) {
      return hanziMatch[hanziMatch.length - 1];
    }
    return decoded;
  }

  function toSlugVi(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  async function lookupCharacter(slugOrChar) {
    const char = extractHanziChar(slugOrChar);
    const index = (await loadLocalJson('/data/characters/index.json')) || [];
    let entry = null;
    if (Array.isArray(index)) {
      entry = index.find(x => (x.c || x.character) === char);
      if (!entry) {
        const cleanSlug = decodeURIComponent(slugOrChar).toLowerCase().trim();
        entry = index.find(x => x.slug === cleanSlug || (x.hv && `${x.hv}-${x.c}` === cleanSlug));
      }
    }
    const targetChar = entry ? (entry.c || entry.character) : char;
    const chunkId = entry && entry.chunk ? entry.chunk : 1;
    const chunkNum = String(chunkId).padStart(2, '0');
    const chunk = (await loadLocalJson(`/data/characters/characters-${chunkNum}.json`)) || [];
    let found = Array.isArray(chunk) ? chunk.find(c => (c.character || c.c || c.char) === targetChar) : null;
    if (!found && entry) {
      found = {
        character: entry.c,
        pinyin: entry.p,
        hanvietReading: entry.hv,
        meaningVi: entry.m,
        radical: entry.r,
        strokeCount: entry.s,
        hskLevel: entry.hsk
      };
    }
    if (found && entry && !found.hanvietReading && entry.hv) {
      found.hanvietReading = entry.hv;
    }
    return found || null;
  }

  async function lookupWord(slugOrWord) {
    const rawDecoded = decodeURIComponent(slugOrWord || '').trim();
    if (!rawDecoded) return null;
    const word = extractHanziWord(rawDecoded);
    const index = (await loadLocalJson('/data/vocabulary/index.json')) || [];
    let entry = null;
    if (Array.isArray(index)) {
      entry = index.find(x => (x.w || x.word || x.hanzi) === word || (x.w || x.word || x.hanzi) === rawDecoded);
      if (!entry) {
        entry = index.find(x => (x.w || '').replace(/\{|\}/g, '') === word);
      }
    }
    if (entry) {
      const targetWord = entry.w || entry.word || entry.hanzi || word;
      const chunkId = entry.chunk || 1;
      const chunkNum = String(chunkId).padStart(2, '0');
      const chunk = (await loadLocalJson(`/data/vocabulary/vocabulary-${chunkNum}.json`)) || [];
      let found = Array.isArray(chunk)
        ? chunk.find(w => (w.hanzi || w.word || w.w) === targetWord || (w.hanzi || '').replace(/\{|\}/g, '') === word)
        : null;
      if (!found) {
        found = {
          hanzi: (entry.w || word).replace(/\{|\}/g, ''),
          word: (entry.w || word).replace(/\{|\}/g, ''),
          pinyin: entry.p || '',
          hanviet: entry.hv || '',
          meaningVi: entry.m || '',
          translationVi: entry.m || '',
          wordMeaningVi: entry.m || ''
        };
      } else {
        const cleanHz = (found.hanzi || found.word || found.w || word).replace(/\{|\}/g, '');
        const mean =
          found.meaningVi ||
          found.wordMeaningVi ||
          found.translationVi ||
          (Array.isArray(found.meanings) && found.meanings.join('; ')) ||
          entry.m ||
          '';
        found = {
          ...found,
          hanzi: cleanHz,
          word: cleanHz,
          pinyin: found.pinyin || found.wordPinyin || entry.p || '',
          hanviet: found.hanviet || entry.hv || '',
          meaningVi: mean,
          translationVi: found.translationVi || mean,
          wordMeaningVi: found.wordMeaningVi || mean
        };
      }
      return found;
    }

    // Fallback cho từ đơn âm tiết (1 chữ Hán như 的, 八, 好, 我, 你, 们, 您, v.v.) từ kho Chữ Hán & Giáo trình
    const charData = await lookupCharacter(word || rawDecoded);
    if (charData) {
      const ch = charData.character || charData.c || word;
      const py = (Array.isArray(charData.pinyins) && charData.pinyins[0]) || charData.pinyin || charData.p || '';
      const hv = charData.hanvietReading || charData.hv || '';
      const mean = charData.meaningVi || charData.m || '';
      const commonWords = Array.isArray(charData.commonWords) ? charData.commonWords : [];
      const rawExamples = Array.isArray(charData.examples) ? charData.examples : [];
      const builtExamples =
        rawExamples.length > 0
          ? rawExamples
          : commonWords.slice(0, 5).map(cw => ({
              hanzi: cw.word || cw.hanzi || cw.characters || ch,
              pinyin: cw.pinyin || py,
              vietnamese: cw.meaningVi || cw.meaning || mean
            }));
      return {
        hanzi: ch,
        word: ch,
        pinyin: py,
        pinyins: charData.pinyins || [py].filter(Boolean),
        hanviet: hv,
        meaningVi: mean,
        translationVi: mean,
        wordMeaningVi: mean,
        hskLevel: charData.hskLevel || charData.hsk || 1,
        radical: charData.radical || charData.r || '',
        strokeCount: charData.strokeCount || charData.s || '',
        usageNote: (charData.etymology && (charData.etymology.hintVi || charData.etymology.hint)) || charData.mnemonic || '',
        commonWords,
        examples: builtExamples,
        audios: [`https://static.xiehanzi.com/word_audios/${encodeURIComponent(ch)}.mp3`]
      };
    }

    return null;
  }

  async function lookupHanViet(slug) {
    const clean = decodeURIComponent(slug).trim().toLowerCase();
    const cleanAscii = toSlugVi(clean);
    for (let i = 1; i <= 7; i++) {
      const num = String(i).padStart(2, '0');
      const chunk = (await loadLocalJson(`/data/han-viet/han-viet-${num}.json`)) || [];
      if (Array.isArray(chunk)) {
        const found = chunk.find(item => {
          const itemSlug = (item.slug || item.reading || item.hanviet || '').toLowerCase();
          return itemSlug === clean || itemSlug === cleanAscii;
        });
        if (found) return found;
      }
    }
    return null;
  }

  // ==========================================================================
  // 4. BỘ ENGINE TRÒ CHƠI CHỮ HÁN (/v1/games/*)
  // ==========================================================================
  const gameRoundsStore = new Map();
  const gameRunsStore = new Map();

  const CHENGYU_BANK = [
    { word: '一心一意', pinyin: 'yī xīn yī yì', meaningVi: 'Một lòng một dạ, toàn tâm toàn ý', blankIdx: 1 },
    { word: '画蛇添足', pinyin: 'huà shé tiān zú', meaningVi: 'Vẽ rắn thêm chân (làm việc thừa thãi)', blankIdx: 2 },
    { word: '半途而废', pinyin: 'bàn tú ér fèi', meaningVi: 'Bỏ cuộc giữa chừng', blankIdx: 1 },
    { word: '守株待兔', pinyin: 'shǒu zhū dài tù', meaningVi: 'Ôm cây đợi thỏ', blankIdx: 3 },
    { word: '自相矛盾', pinyin: 'zì xiāng máo dùn', meaningVi: 'Tự mâu thuẫn với chính mình', blankIdx: 2 },
    { word: '对牛弹琴', pinyin: 'duì niú tán qín', meaningVi: 'Đàn gảy tai trâu', blankIdx: 1 },
    { word: '井底之蛙', pinyin: 'jǐng dǐ zhī wā', meaningVi: 'Ếch ngồi đáy giếng', blankIdx: 3 },
    { word: '马到成功', pinyin: 'mǎ dào chéng gōng', meaningVi: 'Mã đáo thành công', blankIdx: 2 },
    { word: '一举两得', pinyin: 'yī jǔ liǎng dé', meaningVi: 'Một công đôi việc', blankIdx: 2 },
    { word: '入乡随俗', pinyin: 'rù xiāng suí sú', meaningVi: 'Nhập gia tùy tục', blankIdx: 3 }
  ];

  const TIM_CHU_PUZZLES = [
    {
      baseChar: '明',
      pinyin: 'míng',
      meaningVi: 'sáng, rõ ràng, ngày mai',
      defaultStrokes: 8,
      answers: [
        { char: '日', pinyin: 'rì', meaningVi: 'mặt trời, ngày', length: 1, points: 100 },
        { char: '月', pinyin: 'yuè', meaningVi: 'mặt trăng, tháng', length: 1, points: 100 },
        { char: '一', pinyin: 'yī', meaningVi: 'số một', length: 1, points: 80 },
        { char: '口', pinyin: 'kǒu', meaningVi: 'cái miệng', length: 1, points: 120 },
        { char: '冂', pinyin: 'jiōng', meaningVi: 'vùng biên giới xa', length: 1, points: 100 }
      ]
    },
    {
      baseChar: '想',
      pinyin: 'xiǎng',
      meaningVi: 'suy nghĩ, nhớ, muốn',
      defaultStrokes: 13,
      answers: [
        { char: '木', pinyin: 'mù', meaningVi: 'cây cối, gỗ', length: 1, points: 100 },
        { char: '目', pinyin: 'mù', meaningVi: 'con mắt', length: 1, points: 100 },
        { char: '心', pinyin: 'xīn', meaningVi: 'trái tim, tấm lòng', length: 1, points: 100 },
        { char: '相', pinyin: 'xiāng', meaningVi: 'lẫn nhau, tướng mạo', length: 1, points: 140 },
        { char: '日', pinyin: 'rì', meaningVi: 'mặt trời, ngày', length: 1, points: 100 },
        { char: '十', pinyin: 'shí', meaningVi: 'số mười', length: 1, points: 80 }
      ]
    },
    {
      baseChar: '听',
      pinyin: 'tīng',
      meaningVi: 'lắng nghe',
      defaultStrokes: 7,
      answers: [
        { char: '口', pinyin: 'kǒu', meaningVi: 'cái miệng', length: 1, points: 100 },
        { char: '斤', pinyin: 'jīn', meaningVi: 'cân (đơn vị đo)', length: 1, points: 120 },
        { char: '厂', pinyin: 'chǎng', meaningVi: 'nhà xưởng, sườn núi', length: 1, points: 100 },
        { char: '丁', pinyin: 'dīng', meaningVi: 'tráng đinh', length: 1, points: 100 },
        { char: '一', pinyin: 'yī', meaningVi: 'số một', length: 1, points: 80 }
      ]
    }
  ];

  async function createGhepChuRound(difficulty = 'easy', mode = 'casual', runIndex = 0) {
    const diff = ['easy', 'normal', 'hard'].includes(difficulty) ? difficulty : 'easy';
    const layers = diff === 'easy' ? [2] : diff === 'normal' ? [1, 3] : [2, 3, 5];
    const totalRows = layers.reduce((a, b) => a + b, 0);
    const chosen = CHENGYU_BANK.slice(0, totalRows);
    const bank = [];
    const rows = chosen.map((item, idx) => {
      const chars = Array.from(item.word);
      const bIdx = item.blankIdx % chars.length;
      const missingChar = chars[bIdx];
      const bankId = `bank-${idx}-${bIdx}`;
      bank.push({ id: bankId, char: missingChar, targetRow: idx, targetCell: bIdx });
      return {
        index: idx,
        length: 4,
        word: item.word,
        pinyin: item.pinyin,
        meaningVi: item.meaningVi,
        solved: null,
        cells: chars.map((ch, cIdx) =>
          cIdx === bIdx ? { blank: true } : { blank: false, char: ch }
        )
      };
    });
    // Thêm chữ nhiễu vào khay
    const distractors = ['天', '地', '人', '화', '风', '水', '山', '火'];
    const targetBankSize = diff === 'easy' ? 4 : diff === 'normal' ? 8 : 14;
    let dIdx = 0;
    while (bank.length < targetBankSize) {
      const ch = distractors[dIdx % distractors.length];
      bank.push({ id: `dist-${dIdx}`, char: ch, targetRow: -1, targetCell: -1 });
      dIdx++;
    }
    const roundId = `ghep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const round = {
      roundId,
      game: 'ghep-chu',
      mode,
      difficulty: diff,
      runIndex,
      layers,
      targetCount: rows.length,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      hintsUsed: 0,
      wrongSubmits: 0,
      rows: rows.map(r => ({ index: r.index, length: r.length, solved: null, cells: r.cells })),
      bank: bank.map(b => ({ id: b.id, char: b.char })),
      _metaRows: rows,
      _metaBank: bank
    };
    gameRoundsStore.set(roundId, round);
    return round;
  }

  async function createTimChuRound(difficulty = 'easy', mode = 'casual', runIndex = 0) {
    const diff = ['easy', 'normal', 'hard'].includes(difficulty) ? difficulty : 'easy';
    const puzzle = TIM_CHU_PUZZLES[runIndex % TIM_CHU_PUZZLES.length] || TIM_CHU_PUZZLES[0];
    let strokeCount = puzzle.defaultStrokes;
    try {
      const hwRes = await originalFetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(puzzle.baseChar)}.json`);
      if (hwRes.ok) {
        const hwJson = await hwRes.json();
        if (hwJson && Array.isArray(hwJson.strokes)) {
          strokeCount = hwJson.strokes.length;
        }
      }
    } catch (_e) {}

    const targetCount = diff === 'easy' ? 3 : diff === 'normal' ? 4 : 5;
    const activeAnswers = puzzle.answers.slice(0, targetCount);
    const roundId = `tim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const round = {
      roundId,
      game: 'tim-chu-trong-chu',
      mode,
      difficulty: diff,
      runIndex,
      baseChar: puzzle.baseChar,
      pinyin: puzzle.pinyin,
      meaningVi: puzzle.meaningVi,
      strokeCount,
      targetCount: activeAnswers.length,
      targetsByLength: { '1': activeAnswers.length },
      found: [],
      hintsUsed: 0,
      wrongSubmits: 0,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      _answers: activeAnswers
    };
    gameRoundsStore.set(roundId, round);
    return round;
  }

  // ==========================================================================
  // 5. CHẶN & XỬ LÝ TOÀN BỘ API (/v1/*, /v2/*, AI, CHẤM ĐIỂM, GAMES)
  // ==========================================================================
  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  async function parseRequestBody(init) {
    if (!init || !init.body) return {};
    try {
      if (typeof init.body === 'string') return JSON.parse(init.body);
      if (init.body instanceof FormData) {
        const obj = {};
        init.body.forEach((v, k) => { obj[k] = v; });
        return obj;
      }
    } catch (_e) {}
    return {};
  }

  async function callAiEndpoint(action, payload) {
    try {
      const apiKey = localStorage.getItem('httq_gemini_key') || '';
      const res = await originalFetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, apiKey })
      });
      if (res.ok) return await res.json();
    } catch (_e) {}
    return null;
  }

  function normalizeTestPaper(rawPaper, fallbackId = 'hsk30-1') {
    if (!rawPaper || typeof rawPaper !== 'object') return rawPaper;
    const paper = JSON.parse(JSON.stringify(rawPaper));
    const testId = paper.testId || paper.id || fallbackId;
    const imgMap = {};
    if (Array.isArray(paper.images)) {
      paper.images = paper.images.map(it => {
        if (it && it.path && it.src) {
          const rewritten = rewriteMediaUrl(it.src);
          imgMap[it.path] = rewritten;
          return { ...it, src: rewritten };
        }
        return it;
      });
    }
    const resolvePaperImg = u => {
      if (!u || typeof u !== 'string') return '';
      if (imgMap[u]) return imgMap[u];
      if (u.startsWith('assets/')) {
        return rewriteMediaUrl(`https://static.xiehanzi.com/hsk-tests/${testId}/${u}`);
      }
      return rewriteMediaUrl(u);
    };
    if (paper.audioUrl) paper.audioUrl = rewriteMediaUrl(paper.audioUrl);
    const normQuestion = (q, sec) => {
      if (!q || typeof q !== 'object') return q;
      if (sec) {
        q.sectionId = q.sectionId || sec.id;
        q.sectionTitle = q.sectionTitle || sec.title;
      }
      const audioSrc = q.audio || q.audioUrl || '';
      if (audioSrc) {
        q.audio = rewriteMediaUrl(audioSrc);
        q.audioUrl = q.audio;
      }
      if (q.image) q.image = resolvePaperImg(q.image);
      if (q.imageUrl) q.imageUrl = resolvePaperImg(q.imageUrl);
      if (Array.isArray(q.images)) {
        q.images = q.images.map(resolvePaperImg);
      }
      return q;
    };
    if (Array.isArray(paper.sections)) {
      paper.sections.forEach(s => {
        if (s && Array.isArray(s.questions)) {
          s.questions = s.questions.map(q => normQuestion(q, s));
        }
      });
    }
    if (Array.isArray(paper.questions) && paper.questions.length > 0) {
      paper.questions = paper.questions.map(q => normQuestion(q, null));
    } else if (Array.isArray(paper.sections)) {
      paper.questions = paper.sections.flatMap(s => (s && s.questions) || []);
    }
    if (Array.isArray(paper.examples)) {
      paper.examples = paper.examples.map(ex => {
        if (!ex || typeof ex !== 'object') return ex;
        if (ex.audio) ex.audio = rewriteMediaUrl(ex.audio);
        if (Array.isArray(ex.images)) ex.images = ex.images.map(resolvePaperImg);
        return ex;
      });
    }
    return paper;
  }

  async function loadTestPaperById(paperId, fallbackLevel = 1) {
    if (!paperId || paperId === 'undefined') paperId = `hsk30-${fallbackLevel || 1}`;
    const cleanId = decodeURIComponent(paperId).replace(/\.json$/i, '');
    const candidates = [
      `/data/tests/papers/${cleanId}.json`,
      `/data/tests/papers/level-1-${cleanId}.json`,
      `/data/tests/papers/level-2-${cleanId}.json`,
      `/data/tests/papers/level-3-${cleanId}.json`,
      `/data/tests/papers/level-4-${cleanId}.json`,
      `/data/tests/papers/level-5-${cleanId}.json`,
      `/data/tests/papers/level-6-${cleanId}.json`
    ];
    for (const c of candidates) {
      const data = await loadLocalJson(c);
      if (data && (Array.isArray(data.questions) || Array.isArray(data.sections))) {
        return normalizeTestPaper(data, cleanId);
      }
    }
    return null;
  }

  function buildCompanionCharactersResponse() {
    const baseSprites = id => ({
      poses: {
        idle: '/images/capy/lesson/idle.webp',
        talking: '/images/capy/lesson/talking.webp',
        happy: '/images/capy/lesson/happy.webp',
        encouraging: '/images/capy/lesson/encouraging.webp',
        thinking: '/images/capy/lesson/thinking.webp',
        celebrate: '/images/capy/lesson/celebrate.webp',
        sleepy: '/images/capy/lesson/sleepy.webp',
        surprised: '/images/capy/lesson/surprised.webp'
      },
      eyesClosed: '/images/capy/lesson/eyes-closed.webp',
      mouths: {
        closed: '/images/capy/lesson/mouth-closed.webp',
        small: '/images/capy/lesson/mouth-small.webp',
        wide: '/images/capy/lesson/mouth-wide.webp',
        o: '/images/capy/lesson/mouth-o.webp'
      },
      bubble: {
        idle: id === 'capy' ? '/images/capy/lesson/idle.webp' : `/images/companion/${id}/splash/hero.webp`,
        eyesClosed: '/images/capy/lesson/eyes-closed.webp'
      },
      breath: { periodMs: 3400, scale: 0.012, liftPx: 2.2 }
    });
    const list = [
      { id: 'capy', name: 'Capy', nameZh: '卡皮', role: 'Bạn đồng hành điềm tĩnh', tagline: 'Kiên nhẫn, nhẹ nhàng đồng hành cùng bạn mỗi ngày.', fitFor: 'muốn học đều đặn, không áp lực.', greetingText: 'Chào bạn, mình là Capy! Mình cùng học từng bước vững chắc nhé!' },
      { id: 'tieu-man', name: 'Tiểu Mãn', nameZh: '小满', role: 'Bạn cùng bàn nhiệt tình', tagline: 'Năng lượng tích cực, luôn cổ vũ bạn vượt qua từng chặng HSK.', fitFor: 'cần người nhắc nhở và truyền cảm hứng mỗi ngày.', greetingText: 'Chào bạn! Mình là Tiểu Mãn, cùng chinh phục tiếng Trung nhé!' },
      { id: 'ha-vu', name: 'Hạ Vũ', nameZh: '夏雨', role: 'Đàn chị ôn thi HSK', tagline: 'Giúp bạn nắm chắc từ vựng, ngữ pháp và mẹo làm bài thi.', fitFor: 'đang ôn thi chứng chỉ HSK hoặc chuẩn bị du học.', greetingText: 'Chào bạn, mình là Hạ Vũ! Có câu nào khó cứ hỏi mình nhé.' },
      { id: 'luc-than', name: 'Lục Thần', nameZh: '陆辰', role: 'Cố vấn giao tiếp & công việc', tagline: 'Thực tế, rõ ràng, tập trung vào phản xạ nghe nói tự nhiên.', fitFor: 'học tiếng Trung để giao tiếp và làm việc.', greetingText: 'Chào bạn, mình là Lục Thần. Bắt đầu luyện phản xạ ngay hôm nay nhé!' },
      { id: 'duong-duong', name: 'Dương Dương', nameZh: '洋洋', role: 'Bạn học vui vẻ', tagline: 'Biến mỗi bài học thành trò chơi thú vị, dễ nhớ lâu.', fitFor: 'mới bắt đầu làm quen với chữ Hán và Pinyin.', greetingText: 'Chào bạn! Mình là Dương Dương, học tiếng Trung vui lắm đó!' },
      { id: 'mai', name: 'Mai', nameZh: '阿梅', role: 'Người dẫn đường tỉ mỉ', tagline: 'Giải thích chiết tự chữ Hán và lỗi sai cực kỳ dễ hiểu.', fitFor: 'muốn nhớ sâu chữ Hán và không bị nhầm lẫn.', greetingText: 'Chào bạn, mình là Mai! Mình sẽ giúp bạn nhớ chữ Hán thật dễ dàng.' }
    ].map(c => ({
      ...c,
      available: true,
      greetings: [c.greetingText],
      lessonStartLine: 'Mình bắt đầu Bài 1 luôn nhé!',
      splash: { hero: `/images/companion/${c.id}/splash/hero.webp`, scenes: [] },
      sprites: baseSprites(c.id)
    }));
    const selectedId = localStorage.getItem('httq_companion_id') || 'capy';
    return {
      items: list,
      recommendedIds: ['capy', 'tieu-man', 'ha-vu'],
      lockedItems: [],
      selectedId,
      defaultId: 'capy'
    };
  }








  async function annotateLocalPinyin(text) {
    const charIndex = await loadLocalJson('/data/characters/index.json') || [];
    const wordIndex = await loadLocalJson('/data/vocabulary/index.json') || [];
    const characters = new Map(charIndex.map(item => [item.c, item]));
    const words = new Map(wordIndex.map(item => [item.w, item]));
    const input = Array.from(text);
    const annotations = [];
    const maxLength = Math.min(input.length, Math.max(1, ...wordIndex.map(item => Array.from(item.w || '').length)));
    for (let index = 0; index < input.length;) {
      const char = input[index];
      const isHanzi = /\p{Script=Han}/u.test(char);
      let match = null;
      if (isHanzi) {
        for (let size = Math.min(maxLength, input.length - index); size >= 2; size--) {
          const word = words.get(input.slice(index, index + size).join(''));
          if (!word) continue;
          const syllables = String(word.p || '').trim().split(/\s+/);
          if (syllables.length === size && input.slice(index, index + size).every(value => /\p{Script=Han}/u.test(value))) {
            match = { word, syllables, size }; break;
          }
        }
      }
      if (match) {
        for (let offset = 0; offset < match.size; offset++) annotations.push({ char: input[index + offset], isHanzi: true, pinyin: match.syllables[offset], meaningVi: match.word.m || '', isWordStart: offset === 0, wordHanzi: match.word.w, wordPinyin: match.syllables.join(' ') });
        index += match.size;
      } else {
        const info = characters.get(char);
        annotations.push({ char, isHanzi, pinyin: isHanzi && info ? String(info.p || '').split(/[,，;/]/)[0].trim() : '', meaningVi: isHanzi && info ? info.m || '' : '', isWordStart: false });
        index++;
      }
    }
    return annotations;
  }

  // BEGIN GENERATED PERSISTENCE SUPPORT
  // Persistent adapters for the contracts used by the original client bundles.
  // Insert this fragment inside the runtime IIFE and call handlePersistentApi
  // before the legacy handlers. Unknown routes return null.
  function studyRecordTime(record) {
    const value = record && (record.updatedAt || record.ts || record.receivedAt || record.createdAt);
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }
  function studyRecordKey(record) {
    return String(record && (record._id || record.id || record.localId || record.signalId || record.itemKey) || '');
  }
  function mergeStudyRecords(remote, local, keyOf = studyRecordKey, merge) {
    const records = new Map();
    for (const record of [...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])]) {
      if (!record || typeof record !== 'object') continue;
      const key = keyOf(record); if (!key) continue;
      const previous = records.get(key);
      if (!previous) records.set(key, record);
      else if (merge) records.set(key, merge(previous, record));
      else records.set(key, studyRecordTime(record) >= studyRecordTime(previous) ? { ...previous, ...record } : { ...record, ...previous });
    }
    return [...records.values()];
  }
  function applyStudyReviewSignal(card, signal, receivedAt = new Date().toISOString()) {
    card.attempts = (Number(card.attempts) || 0) + 1;
    card.correctStreak = Number(card.correctStreak) || 0; card.wrongCount = Number(card.wrongCount) || 0;
    card.lastOutcome = signal.outcome; card.updatedAt = signal.ts || receivedAt; card.source = signal.source;
    if (signal.detail && typeof signal.detail === 'object') card.content = { ...(card.content || {}), ...signal.detail };
    if (signal.outcome === 'correct') card.correctStreak++;
    else { card.correctStreak = 0; card.wrongCount++; card.lastWrongAt = signal.ts || receivedAt; card.dismissed = false; }
    const grade = signal.detail && signal.detail.grade;
    let days = signal.outcome === 'correct' ? [1, 3, 7, 14, 30][Math.min(4, card.correctStreak - 1)] : 0;
    if (grade === 'easy') days = Math.max(4, days);
    const waitMs = grade === 'again' ? 60000 : grade === 'hard' ? 600000 : days ? days * 86400000 : 600000;
    const timestamp = Number.isFinite(Date.parse(signal.ts)) ? Date.parse(signal.ts) : Number.isFinite(Date.parse(receivedAt)) ? Date.parse(receivedAt) : Date.now();
    card.dueAt = new Date(timestamp + waitMs).toISOString(); card.intervalMs = waitMs;
    card.state = card.correctStreak >= 2 ? 'review' : 'learning';
    return card;
  }
  function mergeStudyState(remoteValue, localValue) {
    const clone = value => JSON.parse(JSON.stringify(value && typeof value === 'object' && !Array.isArray(value) ? value : {}));
    const remote = clone(remoteValue), local = clone(localValue);
    const result = { ...remote, ...local };
    const historyKey = item => String(item.id || `${item.at || item.createdAt}:${item.paperId || item.testId || item.kind || ''}`);
    result.history = mergeStudyRecords(remote.history, local.history, historyKey).sort((a, b) => Date.parse(b.at || b.createdAt || 0) - Date.parse(a.at || a.createdAt || 0));
    result.masteredChars = { ...(remote.masteredChars || {}), ...(local.masteredChars || {}) };
    result.savedWords = { ...(remote.savedWords || {}), ...(local.savedWords || {}) };
    result.examCount = Math.max(Number(remote.examCount) || 0, Number(local.examCount) || 0);
    const r = remote.collections || {}, l = local.collections || {};
    const store = result.collections = { ...r, ...l };
    if (r.intake || l.intake) store.intake = studyRecordTime(l.intake) >= studyRecordTime(r.intake) ? { ...(r.intake || {}), ...(l.intake || {}) } : { ...(l.intake || {}), ...(r.intake || {}) };
    store.tombstones = mergeStudyRecords(r.tombstones, l.tombstones, item => `${item.kind}:${item.id}`,
      (a, b) => Date.parse(b.deletedAt) >= Date.parse(a.deletedAt) ? b : a);
    const deleted = (kind, record) => store.tombstones.some(tombstone => tombstone.kind === kind && tombstone.id === studyRecordKey(record) &&
      (Date.parse(tombstone.deletedAt) || 0) >= studyRecordTime(record));
    for (const [key, kind] of [['library', 'annotation'], ['worksheets', 'worksheet'], ['examNotes', 'notes']]) {
      store[key] = mergeStudyRecords(r[key], l[key]).filter(item => !deleted(kind, item));
    }
    store.lists = mergeStudyRecords(r.lists, l.lists, studyRecordKey, (a, b) => {
      const list = studyRecordTime(b) >= studyRecordTime(a) ? { ...a, ...b } : { ...b, ...a };
      list.sections = mergeStudyRecords(a.sections, b.sections, studyRecordKey, (x, y) => {
        const section = studyRecordTime(y) >= studyRecordTime(x) ? { ...x, ...y } : { ...y, ...x };
        section.items = mergeStudyRecords(x.items, y.items).filter(item => !deleted('listItem', item));
        return section;
      }).filter(section => !deleted('section', section));
      return list;
    }).filter(list => !deleted('list', list));
    // Filter nested records even when a list/section exists on only one device.
    for (const list of store.lists) {
      list.sections = (list.sections || []).filter(section => !deleted('section', section));
      const flattened = list.sections.flatMap(section => (section.items || []).filter(item => !deleted('listItem', item))
        .map(item => ({ ...item, sectionId: item.sectionId || section._id || section.id })));
      const words = mergeStudyRecords([], flattened, item => item.hanzi ? `${item.type || 'word'}:${item.hanzi}` : studyRecordKey(item));
      list.sections = list.sections.map(section => ({ ...section, items: words.filter(item => item.sectionId === (section._id || section.id)) }));
    }
    store.studyBlocks = mergeStudyRecords(r.studyBlocks, l.studyBlocks, studyRecordKey, (a, b) => {
      if (studyRecordTime(a) === studyRecordTime(b)) return Number(b.seconds) >= Number(a.seconds) ? b : a;
      return studyRecordTime(b) > studyRecordTime(a) ? b : a;
    });
    store.speaking = { ...(r.speaking || {}) };
    for (const [key, item] of Object.entries(l.speaking || {})) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) continue;
      const previous = store.speaking[key] || {};
      const recent = studyRecordTime(item) >= studyRecordTime(previous) ? item : previous;
      store.speaking[key] = { ...recent, best: Math.max(Number(previous.best) || 0, Number(item.best) || 0), attempts: Math.max(Number(previous.attempts) || 0, Number(item.attempts) || 0) };
    }
    store.reviewSignals = mergeStudyRecords(r.reviewSignals, l.reviewSignals, item => String(item.signalId || '')).sort((a, b) =>
      studyRecordTime(a) - studyRecordTime(b) || String(a.signalId).localeCompare(String(b.signalId)));
    const snapshots = mergeStudyRecords(r.reviewCards, l.reviewCards, card => `${card.itemKey}|${card.skill || 'meaning'}`);
    const replayed = new Map();
    for (const signal of store.reviewSignals) {
      if (!signal.itemKey || !['correct', 'wrong', 'partial'].includes(signal.outcome)) continue;
      const skill = signal.skill || 'meaning', key = `${signal.itemKey}|${skill}`;
      let card = replayed.get(key);
      if (!card) { const snapshot = snapshots.find(item => `${item.itemKey}|${item.skill || 'meaning'}` === key); card = { itemKey: signal.itemKey, skill, attempts: 0, wrongCount: 0, correctStreak: 0,
        createdAt: snapshot && snapshot.createdAt || signal.ts || signal.receivedAt, content: snapshot && snapshot.content }; }
      replayed.set(key, applyStudyReviewSignal(card, signal, signal.receivedAt || signal.ts));
    }
    store.reviewCards = snapshots.filter(card => !replayed.has(`${card.itemKey}|${card.skill || 'meaning'}`));
    for (const [key, card] of replayed) {
      const snapshot = snapshots.find(item => `${item.itemKey}|${item.skill || 'meaning'}` === key);
      // Older snapshots may predate event logging; retain their counters rather
      // than resetting activity that cannot be reconstructed from stored events.
      if (snapshot && Number(snapshot.attempts) > card.attempts && studyRecordTime(snapshot) >= studyRecordTime(card)) store.reviewCards.push(snapshot);
      else {
        if (snapshot && snapshot.dismissedAt && Date.parse(snapshot.dismissedAt) >= studyRecordTime(card)) { card.dismissed = true; card.dismissedAt = snapshot.dismissedAt; }
        store.reviewCards.push(card);
      }
    }
    for (const list of store.lists) for (const section of list.sections) for (const item of section.items) {
      const target = item.type === 'character' ? result.masteredChars : result.savedWords;
      target[item.hanzi] = { ...item, word: item.hanzi, character: item.hanzi };
    }
    for (const tombstone of store.tombstones.filter(item => item.kind === 'listItem' && item.hanzi)) {
      const retained = store.lists.some(list => list.sections.some(section => section.items.some(item => item.hanzi === tombstone.hanzi)));
      if (!retained) { delete result.masteredChars[tombstone.hanzi]; delete result.savedWords[tombstone.hanzi]; }
    }
    return result;
  }
  function persistentStudyStorageKey() {
    return typeof getStudyStateStorageKey === 'function' ? getStudyStateStorageKey() : 'httq_state';
  }
  let xhzPersistenceQueue = Promise.resolve();
  function handlePersistentApi(p, urlObj, init, method) {
    const supported = /^\/v1\/(?:library|user-lists|user-worksheets|hsk-note-sets)(?:\/|$)/.test(p) ||
      ['/v1/study-time/sync', '/v1/speaking-progress/sync', '/v2/review/signals',
        '/v2/review/summary', '/v2/review/words', '/v2/review/mistakes',
        '/v2/review/mistakes/dismiss', '/v2/review/sentence-cards', '/v1/users/me/intake'].includes(p);
    if (!supported) return Promise.resolve(null);
    const requestStorageKey = persistentStudyStorageKey();
    const operation = xhzPersistenceQueue.then(async () => {
      if (persistentStudyStorageKey() !== requestStorageKey) return jsonResponse({ ok: false, error: 'session_changed' }, 409);
      const state = getLocalState();
      if (!state.collections || typeof state.collections !== 'object' || Array.isArray(state.collections)) state.collections = {};
      const store = state.collections;
      for (const key of ['library', 'lists', 'worksheets', 'examNotes', 'studyBlocks', 'reviewSignals', 'reviewCards', 'tombstones']) {
        if (!Array.isArray(store[key])) store[key] = [];
      }
      let enrolledCards = false;
      // Enroll words from existing v10 progress, without creating sample cards.
      if (typeof getRealProgress === 'function') {
        const progress = getRealProgress();
        for (const rawWord of (Array.isArray(progress.learnedWords) ? progress.learnedWords : [])) {
          const hanzi = String(rawWord || '').trim();
          if (!hanzi || store.reviewCards.some(card => card.itemKey === `w:${hanzi}` && card.skill === 'meaning')) continue;
          store.reviewCards.push({ itemKey: `w:${hanzi}`, skill: 'meaning', state: 'learning',
            dueAt: new Date().toISOString(), wrongCount: 0, correctStreak: 0, attempts: 0,
            content: { hanzi }, createdAt: new Date().toISOString() });
          enrolledCards = true;
        }
      }
      if (!store.speaking || typeof store.speaking !== 'object' || Array.isArray(store.speaking)) store.speaking = {};
      const body = method === 'GET' || method === 'HEAD' ? {} : (await parseRequestBody(init)) || {};
      const now = new Date().toISOString();
      const id = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const error = (code, status = 400) => jsonResponse({ ok: false, error: code }, status);
      const page = Math.max(1, Number(urlObj.searchParams.get('page')) || 1);
      const limit = Math.max(1, Math.min(100, Number(urlObj.searchParams.get('limit')) || 20));
      const paginate = items => ({ items: items.slice((page - 1) * limit, page * limit), total: items.length, page, limit, hasMore: page * limit < items.length });
      const commit = async result => {
        // Do not acknowledge queued sync data when persistence fails. The client
        // removes its queue on any 2xx response, so quota failures must be 5xx.
        if (persistentStudyStorageKey() !== requestStorageKey) return error('session_changed', 409);
        try { localStorage.setItem(requestStorageKey, JSON.stringify(state)); }
        catch (_) { return error('storage_unavailable', 507); }
        try { await supabaseUpsert(state, { storageKey: requestStorageKey }); } catch (_) {}
        return jsonResponse(result);
      };
      if (enrolledCards) {
        const enrollment = await commit({ ok: true });
        if (!enrollment.ok) return enrollment;
      }
      const rememberDeletion = (kind, record) => {
        const recordId = studyRecordKey(record); if (!recordId) return;
        store.tombstones = store.tombstones.filter(item => item.kind !== kind || item.id !== recordId);
        store.tombstones.push({ kind, id: recordId, deletedAt: now, ...(record.hanzi ? { hanzi: record.hanzi } : {}) });
      };
      const defaultList = () => ({ id: 'default', _id: 'default', name: 'Chữ Hán & từ', createdAt: now, updatedAt: now,
        sections: [{ id: 'default-section', _id: 'default-section', name: 'Đã lưu', items: [], createdAt: now, updatedAt: now }] });
      const getList = listId => store.lists.find(item => item._id === listId || item.id === listId);
      const ensureList = () => { if (!store.lists.length) store.lists.push(defaultList()); return store.lists[0]; };
      const saveWord = input => {
        const list = (input.listId && getList(input.listId)) || ensureList();
        const section = (input.sectionId && list.sections.find(item => item._id === input.sectionId)) || list.sections[0];
        const hanzi = String(input.hanzi || input.word || input.character || '').trim();
        if (!hanzi || !section) return null;
        const duplicate = list.sections.flatMap(item => item.items).find(item => item.type === (input.type || (hanzi.length === 1 ? 'character' : 'word')) &&
          ((input.refId && item.refId === input.refId) || item.hanzi === hanzi));
        if (duplicate) return { item: duplicate, isDuplicate: true, listId: list._id, sectionId: duplicate.sectionId };
        const itemId = id('item');
        const item = { ...input, id: itemId, _id: itemId, hanzi, type: input.type || (hanzi.length === 1 ? 'character' : 'word'),
          sectionId: section._id, createdAt: input.createdAt || now, updatedAt: now, masteredAt: input.masteredAt || null };
        section.items.push(item); list.updatedAt = now;
        state.masteredChars = state.masteredChars || {}; state.savedWords = state.savedWords || {};
        const key = item.type === 'character' ? 'masteredChars' : 'savedWords';
        state[key][hanzi] = { ...item, word: hanzi, character: hanzi };
        return { item, isDuplicate: false, listId: list._id, sectionId: section._id };
      };
      const forgetWord = item => {
        if (store.lists.some(list => list.sections.some(section => section.items.some(other => other.hanzi === item.hanzi)))) return;
        if (state.masteredChars) delete state.masteredChars[item.hanzi];
        if (state.savedWords) delete state.savedWords[item.hanzi];
      };

      if (p === '/v1/users/me/intake') {
        if (method === 'GET') return jsonResponse({ ok: true, intake: store.intake || null });
        if (method !== 'PATCH' && method !== 'POST') return error('method_not_allowed', 405);
        const input = { ...(store.intake || {}), ...body };
        const aliases = { 'hsk1-2': 'hsk1', 'hsk3-4': 'hsk3', 'hsk5+': 'hsk5' };
        const level = aliases[input.level] || input.level;
        const levels = ['chua-biet', 'hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'];
        const goals = ['giao-tiep', 'hsk-cert', 'tu-vung', 'cong-viec', 'du-hoc'];
        const times = ['5p', '15p', '30p+'];
        if (!levels.includes(level) || !goals.includes(input.goal) || !times.includes(input.time)) return error('invalid_intake');
        if (input.targetLevel && !levels.slice(1).includes(input.targetLevel)) return error('invalid_target_level');
        if (input.examDate && (!/^\d{4}-\d{2}-\d{2}$/.test(input.examDate) || !Number.isFinite(Date.parse(input.examDate)) || new Date(input.examDate).toISOString().slice(0, 10) !== input.examDate)) return error('invalid_exam_date');
        const topics = new Set(['gia-dinh', 'an-uong', 'du-lich', 'cong-viec', 'hoc-tap', 'mua-sam', 'suc-khoe', 'giai-tri']);
        const intake = { level, goal: input.goal, time: input.time, updatedAt: now,
          ...(input.targetLevel ? { targetLevel: input.targetLevel } : {}), ...(input.examDate ? { examDate: input.examDate } : {}),
          ...(Array.isArray(input.topicSlugs) ? { topicSlugs: [...new Set(input.topicSlugs.filter(topic => topics.has(topic)))] } : {}),
          source: typeof input.source === 'string' ? input.source.slice(0, 80) : 'web' };
        store.intake = intake;
        const result = await commit({ ok: true, intake });
        if (result.ok && persistentStudyStorageKey() === requestStorageKey) {
          try { localStorage.setItem('xhz-intake-v1', JSON.stringify({ ...intake, ts: Date.now() })); } catch (_) {}
        }
        return result;
      }

      if (p === '/v1/library' || p.startsWith('/v1/library/')) {
        const libraryId = decodeURIComponent(p.slice('/v1/library/'.length));
        if (p === '/v1/library' && method === 'GET') {
          const skip = Math.max(0, Number(urlObj.searchParams.get('skip')) || 0);
          const annotations = store.library.slice(skip, skip + limit);
          return jsonResponse({ annotations, items: annotations, total: store.library.length, hasMore: skip + limit < store.library.length });
        }
        if (p === '/v1/library' && method === 'POST') {
          if (!String(body.text || '').trim()) return error('empty_text');
          const itemId = id('annotation');
          const item = { id: itemId, _id: itemId, title: String(body.title || '').trim(), text: String(body.text),
            annotations: Array.isArray(body.annotations) ? body.annotations : [], createdAt: now, updatedAt: now };
          store.library.unshift(item);
          return commit(item);
        }
        const index = store.library.findIndex(item => item.id === libraryId || item._id === libraryId);
        if (index < 0) return error('not_found', 404);
        if (method === 'GET') return jsonResponse(store.library[index]);
        if (method === 'DELETE') { rememberDeletion('annotation', store.library[index]); store.library.splice(index, 1); return commit({ ok: true }); }
        if (method === 'PATCH') {
          const item = store.library[index];
          for (const key of ['title', 'text', 'annotations']) if (body[key] !== undefined) item[key] = body[key];
          item.updatedAt = now; return commit(item);
        }
        return error('method_not_allowed', 405);
      }

      if (p === '/v1/user-lists' || p.startsWith('/v1/user-lists/')) {
        if (p === '/v1/user-lists' && method === 'GET') {
          const lists = store.lists.length ? store.lists : [defaultList()];
          return jsonResponse({ lists: lists.map(list => ({ ...list, itemCount: list.sections.reduce((sum, section) => sum + section.items.length, 0) })) });
        }
        if (p === '/v1/user-lists' && method === 'POST') {
          const list = defaultList(); list.id = list._id = id('list'); list.name = String(body.name || list.name);
          list.sections[0].id = list.sections[0]._id = id('section'); store.lists.push(list); return commit(list);
        }
        if (p === '/v1/user-lists/quick-save' && method === 'POST') {
          const result = saveWord(body); return result ? commit({ ok: true, ...result }) : error('empty_hanzi');
        }
        if (p === '/v1/user-lists/sync-guest' && method === 'POST') {
          const items = Array.isArray(body.items) ? body.items : [];
          const results = items.map(saveWord).filter(Boolean);
          return commit({ ok: true, imported: results.filter(item => !item.isDuplicate).length, count: results.length, listId: ensureList()._id });
        }
        const parts = p.slice('/v1/user-lists/'.length).split('/').map(decodeURIComponent);
        let list = getList(parts[0]);
        if (!list && parts[0] === 'default') { list = defaultList(); if (method !== 'GET') store.lists.push(list); }
        if (!list) return error('not_found', 404);
        if (parts.length === 1) {
          if (method === 'GET') return jsonResponse(list);
          if (method === 'PATCH') { list.name = String(body.name || list.name); list.updatedAt = now; return commit(list); }
          if (method === 'DELETE') {
            rememberDeletion('list', list);
            list.sections.forEach(section => { rememberDeletion('section', section); section.items.forEach(item => rememberDeletion('listItem', item)); });
            store.lists = store.lists.filter(item => item !== list);
            list.sections.flatMap(section => section.items).forEach(forgetWord);
            return commit({ ok: true });
          }
        }
        if (parts[1] === 'sections') {
          if (parts.length === 2 && method === 'POST') {
            if (!String(body.name || '').trim()) return error('empty_name');
            const sectionId = id('section');
            const section = { id: sectionId, _id: sectionId, name: String(body.name).trim(), items: [], createdAt: now, updatedAt: now };
            list.sections.push(section); list.updatedAt = now; return commit(section);
          }
          const section = list.sections.find(item => item._id === parts[2]);
          if (!section) return error('not_found', 404);
          if (method === 'PATCH') { section.name = String(body.name || section.name); section.updatedAt = now; list.updatedAt = now; return commit(section); }
          if (method === 'DELETE') {
            if (list.sections.length === 1) return error('last_section');
            rememberDeletion('section', section); section.items.forEach(item => rememberDeletion('listItem', item));
            list.sections = list.sections.filter(item => item !== section); section.items.forEach(forgetWord);
            return commit({ ok: true });
          }
        }
        if (parts[1] === 'items' && parts[2]) {
          const section = list.sections.find(item => item.items.some(word => word._id === parts[2]));
          const item = section && section.items.find(word => word._id === parts[2]);
          if (!item) return error('not_found', 404);
          if (method === 'DELETE') { rememberDeletion('listItem', item); section.items = section.items.filter(word => word !== item); forgetWord(item); return commit({ ok: true }); }
          if (method === 'PATCH') {
            if (body.moveToSectionId) {
              const target = list.sections.find(item => item._id === body.moveToSectionId);
              if (!target) return error('section_not_found', 404);
              if (target !== section) { section.items = section.items.filter(word => word !== item); target.items.push(item); item.sectionId = target._id; }
            }
            if (body.mastered !== undefined) item.masteredAt = body.mastered ? now : null;
            item.updatedAt = now; list.updatedAt = now;
            const savedKey = item.type === 'character' ? 'masteredChars' : 'savedWords';
            if (state[savedKey] && state[savedKey][item.hanzi]) state[savedKey][item.hanzi] = { ...item, word: item.hanzi, character: item.hanzi };
            return commit(item);
          }
        }
        return error('method_not_allowed', 405);
      }

      if (p === '/v1/user-worksheets' || p.startsWith('/v1/user-worksheets/')) {
        const create = input => {
          const worksheetId = id('worksheet');
          return { _id: worksheetId, id: worksheetId, name: String(input.name || input.text || 'Vở tập viết').trim().slice(0, 80),
            text: String(input.text || ''), settings: input.settings && typeof input.settings === 'object' ? input.settings : {},
            templateId: input.templateId || null, localId: input.localId, createdAt: input.createdAt || now, updatedAt: now };
        };
        if (p === '/v1/user-worksheets' && method === 'GET') return jsonResponse({ worksheets: store.worksheets });
        if (p === '/v1/user-worksheets' && method === 'POST') {
          if (!String(body.text || '').trim()) return error('empty_text');
          const worksheet = create(body); store.worksheets.unshift(worksheet); return commit(worksheet);
        }
        if (p === '/v1/user-worksheets/sync-guest' && method === 'POST') {
          let imported = 0;
          for (const input of (Array.isArray(body.items) ? body.items : [])) {
            if (!String(input.text || '').trim() || (input.localId && store.worksheets.some(item => item.localId === input.localId))) continue;
            store.worksheets.unshift(create(input)); imported++;
          }
          return commit({ ok: true, imported, worksheets: store.worksheets });
        }
        const worksheetId = decodeURIComponent(p.slice('/v1/user-worksheets/'.length));
        const worksheet = store.worksheets.find(item => item._id === worksheetId);
        if (!worksheet) return error('not_found', 404);
        if (method === 'GET') return jsonResponse(worksheet);
        if (method === 'DELETE') { rememberDeletion('worksheet', worksheet); store.worksheets = store.worksheets.filter(item => item !== worksheet); return commit({ ok: true }); }
        if (method === 'PATCH') {
          for (const key of ['name', 'text', 'settings', 'templateId']) if (body[key] !== undefined) worksheet[key] = key === 'name' ? String(body[key]).slice(0, 80) : body[key];
          worksheet.updatedAt = now; return commit(worksheet);
        }
        return error('method_not_allowed', 405);
      }

      if (p === '/v1/hsk-note-sets' || p.startsWith('/v1/hsk-note-sets/')) {
        if (p === '/v1/hsk-note-sets' && method === 'GET') {
          const testId = urlObj.searchParams.get('testId');
          return jsonResponse(paginate(store.examNotes.filter(item => !testId || item.testId === testId)));
        }
        const noteId = decodeURIComponent(p.slice('/v1/hsk-note-sets/'.length));
        let entry = store.examNotes.find(item => item.id === noteId);
        if (p === '/v1/hsk-note-sets' && method === 'POST') entry = store.examNotes.find(item => item.testId === body.testId);
        if (p !== '/v1/hsk-note-sets' && !entry) return error('not_found', 404);
        if (method === 'DELETE' && entry) { rememberDeletion('notes', entry); store.examNotes = store.examNotes.filter(item => item !== entry); return commit({ ok: true }); }
        if (method === 'GET' && entry) return jsonResponse(entry);
        if (method === 'POST' || method === 'PATCH') {
          const notes = Array.isArray(body.notes) ? body.notes.filter(note => note.questionId && String(note.text || '').trim()) : [];
          if (!notes.length) return error('empty_notes');
          const testId = (entry && entry.testId) || body.testId;
          if (!testId) return error('test_not_found', 404);
          const paper = await loadTestPaperById(testId, body.level);
          if (!paper || paper.testId !== testId) return error('test_not_found', 404);
          const questions = (paper.sections || []).flatMap(section => (section.questions || []).map(question => ({ ...question, sectionTitle: section.title || section.name || '' })));
          if (!questions.length && Array.isArray(paper.questions)) questions.push(...paper.questions);
          if (notes.some(note => !questions.some(question => String(question.id || question._id) === String(note.questionId)))) return error('question_not_found', 404);
          const itemId = entry ? entry.id : id('notes');
          const updated = { id: itemId, _id: itemId, testId, level: paper.level, testTitle: paper.title, testAvailable: true,
            createdAt: entry ? entry.createdAt : now, updatedAt: now, noteCount: notes.length,
            notes: notes.map(note => {
              const question = questions.find(question => String(question.id || question._id) === String(note.questionId));
              return { ...note, text: String(note.text).trim(), questionNumber: question.number || question.questionNumber,
                prompt: question.prompt || '', sectionTitle: question.sectionTitle || '', correctAnswer: question.correctAnswer || question.answer || question.correctOption || '' };
            }) };
          store.examNotes = [updated, ...store.examNotes.filter(item => item !== entry)]; return commit(updated);
        }
        return error('method_not_allowed', 405);
      }

      if (p === '/v1/study-time/sync') {
        if (method !== 'POST' && method !== 'GET') return error('method_not_allowed', 405);
        if (method === 'POST') {
          for (const block of (Array.isArray(body.blocks) ? body.blocks : [])) {
            if (!block || !block.id || !Number.isFinite(Number(block.seconds)) || Number(block.seconds) < 0) continue;
            const index = store.studyBlocks.findIndex(item => item.id === block.id);
            const current = store.studyBlocks[index];
            if (!current || String(block.updatedAt || '') > String(current.updatedAt || '') || (block.updatedAt === current.updatedAt && Number(block.seconds) > Number(current.seconds))) {
              if (index < 0) store.studyBlocks.push({ ...block, seconds: Number(block.seconds) });
              else store.studyBlocks[index] = { ...block, seconds: Number(block.seconds) };
            }
          }
        }
        const result = { blocks: store.studyBlocks, totalSeconds: store.studyBlocks.reduce((sum, block) => sum + Number(block.seconds || 0), 0) };
        return method === 'POST' ? commit(result) : jsonResponse(result);
      }
      if (p === '/v1/speaking-progress/sync') {
        if (method !== 'POST' && method !== 'GET') return error('method_not_allowed', 405);
        for (const item of (Array.isArray(body.items) ? body.items : [])) {
          if (!item || typeof item.key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(item.key)) continue;
          const current = store.speaking[item.key] || {};
          const recent = String(item.updatedAt || '') >= String(current.updatedAt || '') ? item : current;
          store.speaking[item.key] = { best: Math.max(Number(current.best) || 0, Number(item.best) || 0),
            attempts: Math.max(Number(current.attempts) || 0, Number(item.attempts) || 0), lastScore: recent.lastScore, updatedAt: recent.updatedAt || now };
        }
        return method === 'POST' ? commit({ items: store.speaking }) : jsonResponse({ items: store.speaking });
      }

      if (p === '/v2/review/signals') {
        if (method !== 'POST') return error('method_not_allowed', 405);
        if (!Array.isArray(body.signals)) return error('invalid_signals');
        const seen = new Set(store.reviewSignals.map(signal => signal.signalId));
        let accepted = 0;
        for (const signal of body.signals) {
          if (!signal || !signal.signalId || !signal.itemKey || !['correct', 'wrong', 'partial'].includes(signal.outcome)) return error('invalid_signal');
          if (seen.has(signal.signalId)) continue;
          seen.add(signal.signalId); store.reviewSignals.push({ ...signal, receivedAt: now }); accepted++;
          const skill = signal.skill || 'meaning';
          let card = store.reviewCards.find(item => item.itemKey === signal.itemKey && item.skill === skill);
          if (!card) { card = { itemKey: signal.itemKey, skill, correctStreak: 0, attempts: 0, wrongCount: 0, createdAt: now }; store.reviewCards.push(card); }
          applyStudyReviewSignal(card, signal, now);
        }
        // An offline client may deliver older activity after newer activity.
        // Replay the union in event order instead of moving the due date backward.
        state.collections = mergeStudyState({}, state).collections;
        return commit({ ok: true, accepted, duplicates: body.signals.length - accepted });
      }
      const cards = store.reviewCards;
      const activeMistakes = cards.filter(card => card.wrongCount > 0 && card.correctStreak < 2 && !card.dismissed);
      if (p === '/v2/review/summary') {
        const bucket = selected => selected.reduce((counts, card) => { counts[card.skill === 'sound' ? 'pinyin' : card.skill] = (counts[card.skill === 'sound' ? 'pinyin' : card.skill] || 0) + 1; return counts; }, { meaning: 0, pinyin: 0 });
        const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
        const forecast = Array.from({ length: 7 }, (_, offset) => {
          const day = new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
          const due = cards.filter(card => card.dueAt.slice(0, 10) === day).length;
          return { day, due, minutes: Math.ceil(due / 3), heavy: due >= 15 };
        });
        return jsonResponse({ dueNow: bucket(cards.filter(card => Date.parse(card.dueAt) <= Date.now())),
          dueToday: bucket(cards.filter(card => Date.parse(card.dueAt) <= todayEnd.getTime())), errorsQueue: activeMistakes.length, totalCards: cards.length, openRun: null, forecast });
      }
      if (p === '/v2/review/sentence-cards') {
        const sentences = cards.filter(card => card.itemKey.startsWith('s:'));
        return jsonResponse({ dueToday: sentences.filter(card => Date.parse(card.dueAt) <= Date.now() + 86400000).length,
          total: sentences.length, upcoming: sentences.filter(card => Date.parse(card.dueAt) > Date.now()).length, measureWords: 0, newPerDay: 5 });
      }
      if (p === '/v2/review/mistakes/dismiss') {
        if (method !== 'POST' || !body.itemKey) return error('invalid_item');
        cards.filter(card => card.itemKey === body.itemKey).forEach(card => { card.dismissed = true; card.dismissedAt = now; });
        return commit({ ok: true });
      }
      const enrichCard = async card => {
        const hanzi = card.itemKey.replace(/^[a-z]:/, '');
        const info = card.itemKey.startsWith('c:') ? await lookupCharacter(hanzi) : await lookupWord(hanzi);
        const content = card.content || {};
        const word = { hanzi: content.hanzi || hanzi, word: content.hanzi || hanzi, pinyin: content.pinyin || (info && (info.pinyin || info.wordPinyin)) || '',
          meaningVi: content.meaningVi || (info && (info.meaningVi || info.wordMeaningVi)) || '' };
        return { ...card, ...word, titleZh: hanzi, word, count: card.wrongCount, errorCount: card.wrongCount,
          category: card.skill === 'sound' || card.skill === 'pinyin' ? 'tone_error' : 'vocab_confusion',
          categoryLabelVi: card.skill === 'sound' || card.skill === 'pinyin' ? 'Phát âm / thanh điệu' : 'Nội dung cần ôn',
          progress: { cleared: card.correctStreak, needed: 2, nextCheckDay: card.dueAt.slice(0, 10) } };
      };
      if (p === '/v2/review/mistakes') {
        const category = urlObj.searchParams.get('category');
        const all = await Promise.all(activeMistakes.map(enrichCard));
        const filtered = category ? all.filter(card => card.category === category) : all;
        const categories = [...new Set(all.map(card => card.category))].map(category => ({ category, labelVi: all.find(card => card.category === category).categoryLabelVi,
          count: all.filter(card => card.category === category).length }));
        return jsonResponse({ ...paginate(filtered), mistakes: filtered.slice((page - 1) * limit, page * limit), categories });
      }
      if (p === '/v2/review/words') {
        const q = (urlObj.searchParams.get('q') || '').trim().toLowerCase();
        const status = urlObj.searchParams.get('status') || 'all';
        const unique = [...new Map(cards.filter(card => /^[cw]:/.test(card.itemKey)).map(card => [card.itemKey, card])).values()];
        const known = unique.filter(card => card.state === 'review').length;
        let items = await Promise.all(unique.map(enrichCard));
        items = items.map(item => ({ ...item, word: item.hanzi }));
        if (status === 'known') items = items.filter(item => item.state === 'review');
        if (status === 'learning') items = items.filter(item => item.state !== 'review');
        if (q) items = items.filter(item => `${item.hanzi} ${item.pinyin} ${item.meaningVi}`.toLowerCase().includes(q));
        return jsonResponse({ ...paginate(items), totals: { known, learning: unique.length - known }, nextCursor: null });
      }
      return null;
    });
    xhzPersistenceQueue = operation.catch(() => {});
    return operation;
  }
  // END GENERATED PERSISTENCE SUPPORT

  async function handleApiRequest(urlOrObj, init) {
    const urlObj = typeof urlOrObj === 'string' ? new URL(urlOrObj, window.location.origin) : urlOrObj;
    const p = (urlObj.pathname || '').replace(/^\/api/, '');
    const method = (init && init.method ? init.method : 'GET').toUpperCase();

    const persisted = await handlePersistentApi(p, urlObj, init, method);
    if (persisted) return persisted;

    // ------------------------------------------------------------------------
    // A. SERVER TIME & PUBLIC SETTINGS & AUTH
    // ------------------------------------------------------------------------
    if (p === '/server-time' || p === '/server-time/') {
      return jsonResponse({ now: Date.now() });
    }
    if (p.includes('/v2/analytics/events')) {
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/settings/public')) {
      const data = await loadLocalJson('/data/misc/settings-public.json');
      return jsonResponse(data || { ok: true });
    }
    if (p.includes('/v1/social-proof/summary')) {
      const data = await loadLocalJson('/data/misc/social-proof-summary.json');
      return jsonResponse(data || { ok: true });
    }
    if (p.includes('/users/me/weekly-activity') || p === '/v2/me/weekly-activity') {
      return jsonResponse({ ok: true, daysActive: 5, minutes: 145 });
    }
    if (p.includes('/users/me/recent-actions') || p === '/v2/me/recent-actions') {
      return jsonResponse({ ok: true, actions: [] });
    }
    if (p.includes('/v1/speaking/sample-consent')) {
      return jsonResponse({ ok: true, granted: false, decided: true, deleted: 0 });
    }
    if (p.includes('/v1/grammar-progress')) {
      return jsonResponse({ ok: true, learnedGrammarIds: [] });
    }
    if (p.includes('/v1/study-time/sync')) {
      return jsonResponse({ ok: true, blocks: [] });
    }
    if (p.includes('/auth/logout')) {
      clearAuthSession();
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/auth/google')) {
      const cb = urlObj.searchParams.get('callbackUrl') || '/tai-khoan';
      setTimeout(() => window.loginWithGoogle(cb), 10);
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/auth/login') || p.includes('/v1/auth/register')) {
      const body = await parseRequestBody(init);
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) return authErrorResponse({ status: 400, code: 'invalid_credentials', message: 'Vui lòng nhập email hợp lệ và mật khẩu từ 6 ký tự.' });
      const register = p.includes('/v1/auth/register');
      const revision = ++authSessionRevision;
      try {
        const data = register
          ? await requestSupabaseAuth(`signup?redirect_to=${encodeURIComponent(window.location.origin + '/tai-khoan')}`, {
            method: 'POST', body: JSON.stringify({ email, password, data: { full_name: String(body.displayName || body.name || email.split('@')[0]).trim() } })
          })
          : await requestSupabaseAuth('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (revision !== authSessionRevision) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        if (register && !data.access_token) return jsonResponse({ ok: true, isAuthenticated: false, requiresEmailConfirmation: true, message: 'Vui lòng kiểm tra email và mở liên kết xác nhận trước khi đăng nhập.' }, 202);
        const user = data.user || await requestSupabaseAuth('user', { headers: { Authorization: `Bearer ${data.access_token}` } });
        if (revision !== authSessionRevision) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        const userObj = saveAuthSession(data.access_token, data.refresh_token, user);
        if (!userObj) return authErrorResponse({ status: 401, code: 'invalid_session', message: 'Không thể xác thực phiên đăng nhập.' });
        return jsonResponse({ ok: true, isAuthenticated: true, accessToken: DEFAULT_JWT, token: DEFAULT_JWT, ...userObj, user: userObj });
      } catch (error) { return authErrorResponse(error); }
    }
    if (p.includes('/v1/users/me/profile') || p.includes('/v1/users/me/preferences')) {
      return updateSupabaseProfile(await parseRequestBody(init), p.includes('/preferences') ? 'preferences' : 'profile', method);
    }
    if (p.includes('/v1/users/me/avatar')) {
      return updateSupabaseProfile(await parseRequestBody(init), 'avatar', method);
    }
    if (p.includes('/v1/users/me/password')) {
      const body = await parseRequestBody(init);
      if (typeof body.currentPassword !== 'string' || !body.currentPassword) return authErrorResponse({ status: 400, code: 'current_password_required', message: 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.' });
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 6) return authErrorResponse({ status: 400, code: 'weak_password', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      const revision = authSessionRevision;
      const session = await getSupabaseSession();
      if (!session) return authErrorResponse({ status: 401, code: 'unauthorized', message: 'Vui lòng đăng nhập để đổi mật khẩu.' });
      const stillCurrent = () => revision === authSessionRevision && (getSavedUser() || {}).id === session.user.id;
      try {
        const verified = await requestSupabaseAuth('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: session.user.email, password: body.currentPassword }) });
        if (!stillCurrent() || !verified.user || verified.user.id !== session.user.id) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        const user = await requestSupabaseAuth('user', { method: 'PUT', headers: { Authorization: `Bearer ${verified.access_token}` }, body: JSON.stringify({ password: body.newPassword, data: { xhz_has_password: true } }) });
        if (!stillCurrent() || user.id !== session.user.id) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        if (!saveAuthSession(verified.access_token, verified.refresh_token, user)) return authErrorResponse({ status: 401, code: 'invalid_session', message: 'Vui lòng đăng nhập lại bằng mật khẩu mới.' });
        return jsonResponse({ ok: true });
      } catch (error) { return authErrorResponse(error); }
    }
    if (p.includes('/v1/auth/') || p.includes('/v2/auth/') || p.includes('/v1/users/me') || p.includes('/v1/profile')) {
      const realSum = getRealProgressSummary();
      const session = await getSupabaseSession();
      const savedUser = session && session.user;
      if (savedUser) {
        const tok = localStorage.getItem('xiehanzi_access_token') || DEFAULT_JWT;
        const mergedUser = { ...savedUser, streak: realSum.streakDays };
        return jsonResponse({
          ok: true,
          isAuthenticated: true,
          isGuest: false,
          accessToken: tok,
          token: tok,
          ...mergedUser,
          user: mergedUser
        });
      }
      return jsonResponse({
        ok: true,
        isAuthenticated: false,
        isGuest: true,
        accessToken: DEFAULT_JWT,
        token: DEFAULT_JWT,
        id: 'guest-xhz',
        _id: 'guest-xhz',
        email: '',
        username: 'guest',
        name: 'Khách',
        displayName: 'Khách',
        avatar: '',
        role: 'guest',
        streak: realSum.streakDays,
        user: {
          id: 'guest-xhz',
          _id: 'guest-xhz',
          email: '',
          username: 'guest',
          name: 'Khách',
          displayName: 'Khách',
          avatar: '',
          role: 'guest',
          isGuest: true,
          streak: realSum.streakDays
        }
      });
    }

    // ------------------------------------------------------------------------
    // B. V2 LEARNING PATH & SRS REVIEW API (/hoc, /bat-dau, /on-tap, /hoc/*)
    // ------------------------------------------------------------------------
    if (p === '/v2/meta') {
      return jsonResponse({
        flags: {
          learningPath: true,
          webPathB: true,
          examReview: true,
          speaking: true,
          thayDo: true,
          companion: true
        }
      });
    }
    if (p === '/v2/companion/characters') {
      return jsonResponse(buildCompanionCharactersResponse());
    }
    if (p === '/v2/companion/character') {
      const body = await parseRequestBody(init);
      const selectedId = body.characterId || localStorage.getItem('httq_companion_id') || 'capy';
      localStorage.setItem('httq_companion_id', selectedId);
      return jsonResponse({ ok: true, selectedId });
    }
    if (p === '/v2/companion/call/status') {
      return jsonResponse({
        callEnabled: true,
        voice: 'allowed',
        secondsLeftToday: 900,
        capSeconds: 1800,
        trial: false,
        upsell: null
      });
    }
    if (p === '/v2/companion/unlocks') {
      return jsonResponse({ unlockedIds: ['capy', 'tieu-man', 'ha-vu', 'luc-than', 'duong-duong', 'mai'], newlyUnlocked: [] });
    }
    if (p === '/v2/companion/memory') {
      return jsonResponse({ items: [], summaryVi: 'Đang học lộ trình HSK 1 rất chăm chỉ.' });
    }
    if (p === '/v2/companion/inbox') {
      return jsonResponse({ items: [], unreadCount: 0, celebrate: [] });
    }
    if (p === '/v2/companion/inbox/read') {
      return jsonResponse({ ok: true, unreadCount: 0 });
    }
    if (p === '/v2/companion/tts/stream') {
      return jsonResponse({ error: { code: 'not_found', message: 'Use standard TTS' } }, 404);
    }
    if (p === '/v2/companion/tts') {
      const body = await parseRequestBody(init);
      const txt = (body.text || '你好').trim();
      const cleanHz = (txt.match(/[\u4e00-\u9fff]+/g) || ['你好']).join('');
      const audioUrl = rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(cleanHz.slice(0, 4) || '你好')}.mp3`);
      setTimeout(() => {
        try { playPronunciation(txt, ''); } catch (_) {}
      }, 60);
      return jsonResponse({ url: audioUrl, audioUrl });
    }
    if (p === '/v2/companion/voice/turn' || /^\/v1\/thay-do\/pho\/canh\/[^/]+\/luot$/.test(p)) {
      const isOpener = urlObj.searchParams.get('opener') === 'true';
      const targetHanzi = (urlObj.searchParams.get('targetHanzi') || '').trim();
      const targetPinyin = (urlObj.searchParams.get('targetPinyin') || '').trim();
      const stageKey = (urlObj.searchParams.get('stageKey') || '').trim();
      const turnIdx = (window.__xhzVoiceTurnIdx = (window.__xhzVoiceTurnIdx || 0) + 1);

      const userSamples = [
        { text: '你好，我叫明安，很高兴认识你！', pinyin: 'Nǐ hǎo, wǒ jiào Míng Ān, hěn gāoxìng rènshi nǐ!' },
        { text: '我是越南人，我正在学习汉语。', pinyin: 'Wǒ shì Yuènán rén, wǒ zhèngzài xuéxí Hànyǔ.' },
        { text: '我今天很忙，但是我很喜欢学中文。', pinyin: 'Wǒ jīntiān hěn máng, dànshì wǒ hěn xǐhuan xué Zhōngwén.' },
        { text: '谢谢老师，我们继续练习吧！', pinyin: 'Xièxie lǎoshī, wǒmen jìxù liànxí ba!' }
      ];
      const aiReplies = [
        {
          text: '你好！认识你我也很高兴！你的发音非常标准，你叫什么名字呢？',
          pinyin: 'Nǐ hǎo! Rènshi nǐ wǒ yě hěn gāoxìng! Nǐ de fāyīn fēicháng biāozhǔn, nǐ jiào shénme míngzi ne?'
        },
        {
          text: '太棒了！你的声调很清楚。你是哪国人？平时喜欢做什么呢？',
          pinyin: 'Tài bàng le! Nǐ de shēngdiào hěn qīngchu. Nǐ shì nǎ guó rén? Píngshí xǐhuan zuò shénme ne?'
        },
        {
          text: '说得真好！每天坚持练习几分钟，你的中文一定会进步飞快！',
          pinyin: 'Shuō de zhēn hǎo! Měitiān jiānchí liànxí jǐ fēnzhōng, nǐ de Zhōngwén yídìng huì jìnbù fēikuài!'
        },
        {
          text: '非常棒！今天我们的口语练习很顺利，给你点个大大的赞！',
          pinyin: 'Fēicháng bàng! Jīntiān wǒmen de kǒuyǔ liànxí hěn shùnlì, gěi nǐ diǎn gè dàdà de zàn!'
        }
      ];
      const suggestSets = [
        [
          { hanzi: '你好，我叫明安', pinyin: 'Nǐ hǎo, wǒ jiào Míng Ān', vi: 'Xin chào, tôi tên là Minh Anh' },
          { hanzi: '很高兴认识你', pinyin: 'Hěn gāoxìng rènshi nǐ', vi: 'Rất vui được làm quen với bạn' },
          { hanzi: '我是越南人', pinyin: 'Wǒ shì Yuènán rén', vi: 'Tôi là người Việt Nam' }
        ],
        [
          { hanzi: '我喜欢学习汉语', pinyin: 'Wǒ xǐhuan xuéxí Hànyǔ', vi: 'Tôi thích học tiếng Trung' },
          { hanzi: '我喜欢喝茶和看书', pinyin: 'Wǒ xǐhuan hē chá hé kàn shū', vi: 'Tôi thích uống trà và đọc sách' },
          { hanzi: '谢谢你，不客气', pinyin: 'Xièxie nǐ, bú kèqi', vi: 'Cảm ơn bạn, đừng khách sáo' }
        ]
      ];

      const events = [];
      let replyObj = aiReplies[0];
      if (isOpener) {
        replyObj = {
          text: '你好！很高兴和你一起练习中文口语。你可以用中文向我打个招呼吗？',
          pinyin: 'Nǐ hǎo! Hěn gāoxìng hé nǐ yìqǐ liànxí Zhōngwén kǒuyǔ. Nǐ kěyǐ yòng Zhōngwén xiàng wǒ dǎ gè zhāohu ma?'
        };
      } else {
        const pickedUser = targetHanzi
          ? { text: targetHanzi, pinyin: targetPinyin || 'Nǐ hǎo, hěn gāoxìng rènshi nǐ!' }
          : userSamples[(turnIdx - 1) % userSamples.length];
        events.push(`event: heard\ndata: ${JSON.stringify({ text: pickedUser.text, pinyin: pickedUser.pinyin })}\n\n`);
        const chars = Array.from(pickedUser.text.replace(/[^\u4e00-\u9fff]/g, ''));
        const syllables = (chars.length ? chars : ['你', '好']).map(ch => ({ text: ch, pinyin: '', status: 'good' }));
        events.push(`event: grade\ndata: ${JSON.stringify({ score: 94, syllables })}\n\n`);
        replyObj = aiReplies[turnIdx % aiReplies.length];
      }

      events.push(`event: sentence\ndata: ${JSON.stringify({ i: 0, text: replyObj.text, pinyin: replyObj.pinyin, lang: 'zh' })}\n\n`);
      events.push(`event: sentence_end\ndata: {"i":0}\n\n`);
      events.push(`event: suggest\ndata: ${JSON.stringify({ items: suggestSets[turnIdx % suggestSets.length] })}\n\n`);
      if (stageKey) {
        events.push(`event: mission\ndata: ${JSON.stringify({ completedIds: turnIdx >= 2 ? ['m1', 'm2'] : ['m1'] })}\n\n`);
      }
      events.push(`event: quota\ndata: ${JSON.stringify({ secondsLeft: Math.max(600, 900 - turnIdx * 15), capSeconds: 1800, voice: 'allowed' })}\n\n`);
      events.push(`event: done\ndata: {}\n\n`);

      setTimeout(() => {
        try { playPronunciation(replyObj.text, ''); } catch (_) {}
      }, 150);

      const sseBody = events.join('');
      return new Response(sseBody, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (p === '/v2/companion/chat' || p === '/v2/companion/chat/stream') {
      const characterId = urlObj.searchParams.get('characterId') || localStorage.getItem('httq_companion_id') || 'capy';
      const defaultSuggestions = [
        'Dạy mình 3 câu giao tiếp HSK 1 thông dụng',
        'Phân biệt 不客气 và 没关系 như thế nào?',
        'Cho mình 1 câu tiếng Trung để luyện phản xạ'
      ];
      let savedTurns = [];
      try {
        savedTurns = JSON.parse(localStorage.getItem('httq_companion_chat_turns') || '[]');
        if (!Array.isArray(savedTurns)) savedTurns = [];
      } catch (_) {
        savedTurns = [];
      }
      if (savedTurns.length === 0) {
        savedTurns = [
          {
            id: 'turn-welcome-1',
            role: 'assistant',
            characterId,
            text: '你好 (Nǐ hǎo)! Mình luôn sẵn sàng đồng hành cùng bạn. Bạn có thể nhắn tin hỏi từ vựng, ngữ pháp hoặc bấm nút Nói 🎙️ để luyện nói tiếng Trung trực tiếp với mình nhé!',
            createdAt: new Date(Date.now() - 60000).toISOString()
          }
        ];
      }
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const msg = (body.message || body.text || body.prompt || '').trim();
        const reqCharId = body.characterId || characterId;
        if (msg) {
          savedTurns.push({
            id: `turn-u-${Date.now()}`,
            role: 'user',
            characterId: reqCharId,
            text: msg,
            createdAt: new Date().toISOString()
          });
        }
        let pageWord = null;
        try {
          const curPath = decodeURIComponent(window.location.pathname || '');
          const mVocab = curPath.match(/^\/(tu-vung|han-tu)\/([^/?#]+)/);
          if (mVocab && mVocab[2]) {
            pageWord = mVocab[1] === 'han-tu' ? await lookupCharacter(mVocab[2]) : await lookupWord(mVocab[2]);
          }
        } catch (_) {}

        let dictMatches = [];
        try {
          const hzTokens = msg.match(/[\u4e00-\u9fff]+/g) || [];
          for (const hz of hzTokens.slice(0, 3)) {
            const w = await lookupWord(hz);
            if (w && w.hanzi) {
              dictMatches.push({
                hanzi: w.hanzi,
                pinyin: w.wordPinyin || w.pinyin || '',
                hanViet: w.hanViet || '',
                meaningVi: w.wordMeaningVi || w.meaningVi || w.translationVi || '',
                usageNote: w.usageNote || '',
                examples: (w.examples || []).slice(0, 2)
              });
            }
          }
          if (dictMatches.length === 0 && msg.length >= 2) {
            const qClean = msg
              .toLowerCase()
              .replace(/^(tiếng trung|từ|chữ|dịch|nghĩa của|cho mình hỏi|hỏi|cách nói)\s+/i, '')
              .replace(/\s+(trong tiếng trung|là gì|nói sao|như thế nào|nghĩa là gì)\??$/i, '')
              .trim();
            if (qClean.length >= 2) {
              const vIdx = await loadLocalJson('/data/vocabulary/index.json');
              if (Array.isArray(vIdx)) {
                const found = vIdx.filter(item => {
                  const m = String(item.m || '').toLowerCase();
                  return m === qClean || m.startsWith(qClean + ',') || m.startsWith(qClean + ';') || m.includes(', ' + qClean);
                }).slice(0, 3);
                dictMatches = found.map(f => ({
                  hanzi: f.h,
                  pinyin: f.p,
                  hanViet: f.hv || '',
                  meaningVi: f.m || ''
                }));
              }
            }
          }
        } catch (_) {}

        let replyText = '';
        try {
          const aiRes = await callAiEndpoint('companion-chat', {
            message: msg,
            characterId: reqCharId,
            characterName: reqCharId === 'duong-duong' ? 'Dương Dương 洋洋' : 'Bạn đồng hành AI',
            pagePath: window.location.pathname,
            pageTitle: document.title,
            pageWord: pageWord
              ? {
                  hanzi: pageWord.hanzi,
                  pinyin: pageWord.wordPinyin || pageWord.pinyin || '',
                  hanViet: pageWord.hanViet || '',
                  meaningVi: pageWord.wordMeaningVi || pageWord.meaningVi || pageWord.translationVi || '',
                  usageNote: pageWord.usageNote || ''
                }
              : null,
            dictMatches
          });
          if (aiRes && aiRes.reply) {
            replyText = String(aiRes.reply).trim();
          }
        } catch (_) {}

        if (!replyText) {
          if (dictMatches.length > 0) {
            const d0 = dictMatches[0];
            replyText = `Trong tiếng Trung:\n• **${d0.hanzi}** (${d0.pinyin}${d0.hanViet ? ' — Hán Việt: ' + d0.hanViet.toUpperCase() : ''}): **${d0.meaningVi}**`;
          } else if (pageWord && pageWord.hanzi) {
            replyText = `Bạn đang xem từ **${pageWord.hanzi}** (${pageWord.wordPinyin || pageWord.pinyin || ''}) có nghĩa là **${pageWord.wordMeaningVi || pageWord.meaningVi || ''}**. Bạn muốn mình đặt câu ví dụ hay giải thích thêm cách dùng từ này không?`;
          } else {
            replyText = 'Mình đang lắng nghe bạn đây! Bạn có thể hỏi mình nghĩa từ vựng, cách dùng ngữ pháp hoặc nhờ mình dịch bất kỳ câu tiếng Việt / tiếng Trung nào nhé!';
          }
        }

        recordStudyProgress({ voiceInc: 1 });

        const assistantTurn = {
          id: `turn-a-${Date.now() + 1}`,
          role: 'assistant',
          characterId: reqCharId,
          text: replyText,
          createdAt: new Date().toISOString()
        };
        savedTurns.push(assistantTurn);
        try {
          localStorage.setItem('httq_companion_chat_turns', JSON.stringify(savedTurns.slice(-30)));
        } catch (_) {}
        return jsonResponse({
          ok: true,
          reply: assistantTurn,
          text: replyText,
          message: replyText,
          suggestions: defaultSuggestions
        });
      }
      return jsonResponse({
        characterId,
        turns: savedTurns,
        messages: savedTurns,
        items: savedTurns,
        suggestions: defaultSuggestions
      });
    }
    if (p === '/v2/me/exam-readiness') {
      return jsonResponse({
        method: 'Tính dựa trên kết quả làm đề gần nhất của từng kỹ năng.',
        disclaimer: 'Không phải điểm thi chính thức',
        levels: []
      });
    }
    if (p === '/v2/me/exam-sittings' || p.startsWith('/v2/me/exam-sittings/')) {
      return jsonResponse({ ok: true, items: [], imported: 0 });
    }
    if (p === '/v2/exam-sittings' || p.startsWith('/v2/exam-sittings/')) {
      return jsonResponse({ ok: true, id: `sit-${Date.now()}`, sittingId: `sit-${Date.now()}`, status: 'active', answers: [] });
    }
    if (p === '/v2/me/learning-profile') {
      let saved = {};
      try {
        saved = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}') || {};
      } catch (_) {
        saved = {};
      }
      if (method === 'PATCH' || method === 'POST') {
        const body = await parseRequestBody(init);
        saved = { ...saved, ...(body || {}) };
        try {
          localStorage.setItem('httq_learning_profile', JSON.stringify(saved));
        } catch (_) {}
      }
      return jsonResponse({
        goal: saved.goal || 'giao-tiep',
        dailyMinutes: saved.dailyMinutes || 15,
        currentLevel: saved.currentLevel || 1,
        companionId: saved.companionId || localStorage.getItem('httq_companion_id') || 'capy',
        hidePinyinInReview: Boolean(saved.hidePinyinInReview),
        reviewFormat: saved.reviewFormat || 'auto',
        onboardingCompleted: true,
        ...saved
      });
    }
    if (p === '/v2/me/progress' || p === '/v1/me/progress') {
      const sum = getRealProgressSummary();
      return jsonResponse({
        streakDays: sum.streakDays,
        totalMinutes: sum.totalMinutes,
        wordsMastered: sum.wordsMastered,
        wordsLearning: sum.wordsLearning,
        lessonsDone: sum.lessonsDone,
        stagesDone: sum.stagesDone,
        accuracyPct: sum.lessonsDone > 0 ? 92 : 0,
        activity: sum.activity
      });
    }
    if (p === '/v2/me/habit' || p === '/v2/me/habit/weekly-goal') {
      const sum = getRealProgressSummary();
      let savedHabit = { dailyMinutes: 15, reminderTime: '20:00', reminderEnabled: true, goalSessions: sum.goalSessions || 5 };
      try {
        const raw = JSON.parse(localStorage.getItem('httq_habit_settings') || '{}');
        savedHabit = { ...savedHabit, ...raw };
      } catch (_) {}
      if (method === 'PATCH' || method === 'PUT' || method === 'POST') {
        const body = await parseRequestBody(init);
        if (body && body.sessions !== undefined) {
          savedHabit.goalSessions = Number(body.sessions) || 5;
        }
        savedHabit = { ...savedHabit, ...(body || {}) };
        try { localStorage.setItem('httq_habit_settings', JSON.stringify(savedHabit)); } catch (_) {}
        syncProgressToSupabaseAuth();
      }
      const goalSessions = Number(savedHabit.goalSessions) || 5;
      const sessionsDone = sum.sessionsThisWeek;
      return jsonResponse({
        ok: true,
        streakDays: sum.streakDays,
        masteredWords: sum.wordsMastered,
        ...savedHabit,
        streak: {
          count: sum.streakDays,
          longest: sum.longestStreak,
          todayDone: sum.todayDone,
          activeDates: sum.activeDates
        },
        week: {
          goalSessions,
          sessionsDone,
          reached: sessionsDone >= goalSessions,
          days: sum.weekDays
        }
      });
    }
    if (p === '/v2/me/plans' || p === '/v2/plans' || p === '/plans' || p === '/v2/me/plans/interest') {
      const sum = getRealProgressSummary();
      const now = new Date();
      const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
      return jsonResponse({
        ok: true,
        currentPlan: 'pro',
        tier: 'pro',
        plan: 'pro',
        grading: { used: sum.gradingUsed, limit: 100, resetsAt: nextMonth },
        speaking: { used: sum.gradingUsed, limit: 100, resetsAt: nextMonth },
        companionTurns: { used: sum.voiceUsed, limit: 50, resetsAt: nextMonth },
        plans: [
          {
            plan: 'pro',
            titleVi: 'Gói Pro (Trọn đời)',
            badge: 'Đang kích hoạt',
            price: 0,
            features: ['Học không giới hạn', 'Lộ trình đầy đủ', 'Chấm phát âm AI']
          }
        ]
      });
    }
    if (p === '/v2/me/entitlements') {
      return jsonResponse({
        plan: 'pro',
        tier: 'pro',
        isPro: true,
        features: ['smart_error_review', 'learning_path', 'speaking_practice', 'unlimited_ai', 'voice_call', 'exam_prep'],
        limits: { aiExplainPerDay: 999, speakingPerDay: 999 }
      });
    }
    if (p === '/v2/me/exam-plan') {
      return jsonResponse({ status: 'none', plan: null });
    }
    if (p === '/v2/me/skill-map') {
      const sum = getRealProgressSummary();
      const baseScore = sum.lessonsDone > 0 ? Math.min(95, 50 + sum.lessonsDone * 5) : 0;
      return jsonResponse({
        level: 'HSK 1',
        wordsSeen: sum.wordsSeen,
        wordsTotal: 300,
        skills: [
          { skill: 'listening', labelVi: 'Nghe hiểu', score: baseScore ? Math.min(100, baseScore + 3) : 0 },
          { skill: 'reading', labelVi: 'Đọc hiểu', score: baseScore ? Math.min(100, baseScore + 6) : 0 },
          { skill: 'writing', labelVi: 'Chữ Hán & Viết', score: baseScore },
          { skill: 'speaking', labelVi: 'Phát âm & Nói', score: baseScore ? Math.min(100, baseScore + 2) : 0 },
          { skill: 'grammar', labelVi: 'Ngữ pháp', score: baseScore ? Math.min(100, baseScore + 4) : 0 }
        ]
      });
    }
    if (p === '/v2/me/score-prediction') {
      const sum = getRealProgressSummary();
      return jsonResponse({
        level: 'HSK 1',
        predictedScore: sum.lessonsDone > 0 ? Math.min(200, 100 + sum.lessonsDone * 10) : 0,
        maxScore: 200,
        passScore: 120
      });
    }
    if (p === '/v2/me/reports/weekly') {
      const sum = getRealProgressSummary();
      return jsonResponse({
        streakDays: sum.streakDays,
        minutesStudied: sum.totalMinutes,
        wordsLearned: sum.wordsMastered,
        lessonsCompleted: sum.lessonsDone
      });
    }
    if (p === '/v2/me/consents') {
      return jsonResponse({ ok: true, consents: {} });
    }
    if (p === '/v2/learning-tracks' || p === '/v2/paths') {
      const isBatDauPage = (window.location.pathname || '').includes('bat-dau');
      const savedStageKey = localStorage.getItem('httq_current_stage_key') || 'hsk30.L1.P1';
      const savedLessonId = localStorage.getItem('httq_current_lesson_id') || 'hsk30.L1.P1.learn.1';
      let doneStages = [];
      try {
        doneStages = JSON.parse(localStorage.getItem('httq_done_stages') || '[]') || [];
      } catch (_) {}
      const rawTracks = await loadLocalJson('/data/learning-tracks/tracks.json');
      if (rawTracks && Array.isArray(rawTracks.tracks)) {
        const tracks = rawTracks.tracks.map(t => ({
          ...t,
          slug: t.track === 'hsk30' ? 'hsk30-1' : t.track,
          level: 1,
          titleVi: 'HSK 1',
          isDefault: t.track === 'hsk30',
          enrollment:
            !isBatDauPage && t.track === 'hsk30'
              ? {
                  pathSlug: 'hsk30-1',
                  track: 'hsk30',
                  current: true,
                  currentLevel: 'L1',
                  currentStageId: savedStageKey,
                  currentLessonId: savedLessonId,
                  startStageKey: savedStageKey,
                  stagesDone: doneStages.length,
                  stagesTotal: 40,
                  active: true,
                  enrolledAt: '2026-11-10T00:00:00.000Z'
                }
              : null
        }));
        return jsonResponse({ tracks, paths: tracks });
      }
      const stdObj = { code: 'hsk30', sourceLineVi: 'Theo Đề cương thi HSK (HSK 3.0, ban hành 11/2025)', issuerVi: 'Trung tâm Hợp tác Giao lưu Ngôn ngữ Trung Quốc - Nước ngoài' };
      const tracks = [
        {
          track: 'hsk30',
          slug: 'hsk30-1',
          level: 1,
          titleVi: 'HSK 1',
          brandVi: 'HSK 3.0',
          standard: stdObj,
          isDefault: true,
          placementAvailable: true,
          levels: [
            { level: 'L1', titleVi: 'Cấp 1', chapterCount: 8, stageCount: 40 },
            { level: 'L2', titleVi: 'Cấp 2', chapterCount: 6, stageCount: 29 },
            { level: 'L3', titleVi: 'Cấp 3', chapterCount: 8, stageCount: 38 }
          ],
          enrollment: isBatDauPage
            ? null
            : {
                pathSlug: 'hsk30-1',
                track: 'hsk30',
                current: true,
                currentLevel: 'L1',
                currentStageId: savedStageKey,
                currentLessonId: savedLessonId,
                startStageKey: savedStageKey,
                stagesDone: doneStages.length,
                stagesTotal: 40,
                active: true,
                enrolledAt: '2026-11-10T00:00:00.000Z'
              }
        }
      ];
      return jsonResponse({ tracks, paths: tracks });
    }
    if (p.startsWith('/v2/learning-tracks/') || p.startsWith('/v2/paths/')) {
      const parts = p.split('/').filter(Boolean);
      const track = parts[2] || 'hsk30';
      const sub = parts[3] || '';
      if (sub === 'activities' && parts[5] === 'runs') {
        const activityKey = decodeURIComponent(parts[4] || 'hsk30.L1.P1.learn.1');
        localStorage.setItem('httq_current_lesson_id', activityKey);
        const stgMatch = activityKey.match(/^(hsk30\.L\d+\.[A-Z]\d+)/i);
        if (stgMatch && stgMatch[1]) {
          localStorage.setItem('httq_current_stage_key', stgMatch[1]);
        }
        setTimeout(() => {
          try {
            if (!window.location.pathname.startsWith('/hoc/bai/')) {
              origPushState.call(history, null, '', '/hoc/bai/' + encodeURIComponent(activityKey));
              checkAndRenderDynamicPage();
            }
          } catch (_) {}
        }, 60);
        return jsonResponse({
          runId: activityKey,
          kind: 'learn',
          track: 'hsk30',
          activityKey,
          total: 21,
          answered: 0,
          steps: []
        });
      }
      if (sub === 'placement' && parts[4] === 'runs') {
        const activityKey = 'hsk30.L1.P1.learn.1';
        localStorage.setItem('httq_current_lesson_id', activityKey);
        setTimeout(() => {
          try {
            origPushState.call(history, null, '', '/hoc/bai/' + encodeURIComponent(activityKey));
            checkAndRenderDynamicPage();
          } catch (_) {}
        }, 60);
        return jsonResponse({
          runId: activityKey,
          kind: 'learn',
          track: 'hsk30',
          activityKey,
          total: 21,
          answered: 0,
          steps: []
        });
      }
      if (sub === 'stage-talks') {
        const stageKey = decodeURIComponent(parts[4] || 'hsk30.L1.P1');
        const action = parts[5] || '';
        const subAction = parts[6] || '';
        if (action === 'restart' && method === 'POST') {
          window.__xhzVoiceTurnIdx = 0;
          return jsonResponse({ ok: true });
        }
        if (action === 'recap' && subAction === 'say' && method === 'POST') {
          return jsonResponse({
            ok: true,
            score: 94,
            passed: true,
            heardText: '你好，认识你很高兴！',
            heardPinyin: 'Nǐ hǎo, rènshi nǐ hěn gāoxìng!'
          });
        }
        if (action === 'recap') {
          return jsonResponse({
            summaryVi: 'Bạn đã hoàn thành tốt cuộc hội thoại theo chặng! Phát âm rõ ràng, phản xạ tự nhiên với các mẫu câu chào hỏi và giới thiệu tên.',
            strengthsVi: [
              'Phát âm chuẩn các thanh điệu cơ bản trong câu chào hỏi',
              'Vận dụng tốt mẫu câu 我叫... và 认识你很高兴'
            ],
            nextFocusVi: 'Thử mở rộng câu trả lời bằng cách hỏi ngược lại người đối diện với 呢 (ne).',
            phrases: [
              { hanzi: '你好，认识你很高兴', pinyin: 'Nǐ hǎo, rènshi nǐ hěn gāoxìng', meaningVi: 'Xin chào, rất vui được làm quen với bạn', mastered: true },
              { hanzi: '我是越南人', pinyin: 'Wǒ shì Yuènán rén', meaningVi: 'Tôi là người Việt Nam', mastered: true }
            ]
          });
        }
        return jsonResponse({
          stageKey,
          titleVi: 'Luyện nói phản xạ: Chào hỏi & Làm quen',
          maxTurns: 10,
          voiceTurnsLeft: 10,
          missions: [
            {
              id: 'm1',
              titleVi: 'Chào hỏi và giới thiệu tên bằng tiếng Trung',
              done: (window.__xhzVoiceTurnIdx || 0) >= 1,
              hints: {
                pinyin: 'Nǐ hǎo, wǒ jiào Míng Ān.',
                hanzi: '你好，我叫明安。',
                vi: 'Xin chào, tôi tên là Minh Anh.',
                words: [
                  { hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào' },
                  { hanzi: '我叫', pinyin: 'wǒ jiào', meaningVi: 'tôi tên là' },
                  { hanzi: '高兴', pinyin: 'gāoxìng', meaningVi: 'vui mừng' }
                ]
              }
            },
            {
              id: 'm2',
              titleVi: 'Nói quốc tịch hoặc bày tỏ rất vui được làm quen',
              done: (window.__xhzVoiceTurnIdx || 0) >= 2,
              hints: {
                pinyin: 'Wǒ shì Yuènán rén, rènshi nǐ hěn gāoxìng!',
                hanzi: '我是越南人，认识你很高兴！',
                vi: 'Tôi là người Việt Nam, rất vui được làm quen với bạn!',
                words: [
                  { hanzi: '越南人', pinyin: 'Yuènán rén', meaningVi: 'người Việt Nam' },
                  { hanzi: '认识', pinyin: 'rènshi', meaningVi: 'làm quen, quen biết' }
                ]
              }
            }
          ],
          session: {
            id: `st-sess-${stageKey}`,
            ended: false,
            hasLines: true,
            learnerTurns: Math.max(1, window.__xhzVoiceTurnIdx || 1)
          }
        });
      }
      if (sub === 'levels') {
        const level = parts[4] || 'L1';
        const levelData = await loadLocalJson(`/data/learning-tracks/hsk30-${level}.json`) || await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
        if (levelData) {
          return jsonResponse({ ...levelData, track, level });
        }
      }
      if (sub === 'progress') {
        const levelData = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
        const savedStageKey = localStorage.getItem('httq_current_stage_key') || 'hsk30.L1.P1';
        let doneStages = [];
        let doneActivities = {};
        try {
          doneStages = JSON.parse(localStorage.getItem('httq_done_stages') || '[]') || [];
          doneActivities = JSON.parse(localStorage.getItem('httq_done_activities') || '{}') || {};
        } catch (_) {}
        const allStages = [];
        if (levelData && Array.isArray(levelData.chapters)) {
          levelData.chapters.forEach(ch => {
            (ch.stages || []).forEach(stg => {
              allStages.push(stg.stageKey);
            });
          });
        }
        if (allStages.length === 0) {
          allStages.push('hsk30.L1.P1', 'hsk30.L1.P2', 'hsk30.L1.P3', 'hsk30.L1.R00', 'hsk30.L1.S01', 'hsk30.L1.S02', 'hsk30.L1.S03', 'hsk30.L1.S04', 'hsk30.L1.R01');
        }
        return jsonResponse({
          track: track === 'hsk30-1' ? 'hsk30' : track,
          level: 'L1',
          enrollment: {
            track: track === 'hsk30-1' ? 'hsk30' : track,
            current: true,
            currentLevel: 'L1',
            startStageKey: savedStageKey,
            stagesDone: doneStages.length,
            stagesTotal: allStages.length,
            active: true
          },
          stages: allStages.map(sk => ({
            stageKey: sk,
            status: doneStages.includes(sk) ? 'completed' : sk === savedStageKey ? 'in_progress' : 'available',
            activityKeysDone: Array.isArray(doneActivities[sk]) ? doneActivities[sk] : [],
            examBestPct: doneStages.includes(sk) ? 100 : undefined
          })),
          levelTest: null
        });
      }
      if (sub === 'chapters') {
        const chapterKey = decodeURIComponent(parts[4] || 'hsk30.L1.C00');
        const normKey = chapterKey.replace(/\.C(\d)$/, '.C0$1');
        const chData =
          (await loadLocalJson(`/data/learning-tracks/chapters/${normKey}.json`)) ||
          (await loadLocalJson(`/data/learning-tracks/chapters/${chapterKey}.json`)) ||
          (await loadLocalJson('/data/learning-tracks/chapters/hsk30.L1.C00.json'));
        if (chData) {
          return jsonResponse(chData);
        }
      }
      if (sub === 'enroll' || sub === 'select') {
        const body = await parseRequestBody(init);
        const startStageKey = (body && (body.startStageKey || body.startStageId)) || 'hsk30.L1.P1';
        const targetLessonId = `${startStageKey}.learn.1`;
        localStorage.setItem('httq_current_stage_key', startStageKey);
        localStorage.setItem('httq_current_lesson_id', targetLessonId);
        return jsonResponse({
          ok: true,
          currentLessonId: targetLessonId,
          enrollment: {
            pathSlug: track,
            track: 'hsk30',
            current: true,
            currentLevel: (body && body.level) || 'L1',
            currentStageId: startStageKey,
            currentLessonId: targetLessonId,
            startStageKey,
            stagesDone: 0,
            stagesTotal: 40,
            active: true,
            enrolledAt: new Date().toISOString()
          }
        });
      }
      const savedLessonId = localStorage.getItem('httq_current_lesson_id') || 'hsk30.L1.P1.learn.1';
      const savedStageKey = localStorage.getItem('httq_current_stage_key') || 'hsk30.L1.P1';
      return jsonResponse({
        slug: track,
        track: 'hsk30',
        level: 1,
        titleVi: 'HSK 1',
        enrollment: {
          pathSlug: track,
          track: 'hsk30',
          current: true,
          currentLevel: 'L1',
          currentStageId: savedStageKey,
          currentLessonId: savedLessonId,
          startStageKey: savedStageKey,
          stagesDone: 0,
          stagesTotal: 40,
          active: true,
          enrolledAt: '2026-11-10T00:00:00.000Z'
        },
        stages: [
          {
            id: 'hsk30.L1.P1',
            index: 0,
            titleVi: 'Âm và thanh: Bốn thanh và thanh nhẹ',
            status: 'in_progress',
            wordCount: 9,
            grammarCount: 0,
            progress: { lessonsDone: 0, lessonsTotal: 4 },
            lessons: [
              { id: 'hsk30.L1.P1.learn.1', index: 0, kind: 'learn', status: 'available', titleVi: 'Từ mới: Bốn thanh và thanh nhẹ (爸爸，妈妈)', newWordCount: 3, estMinutes: 6 },
              { id: 'hsk30.L1.P1.dlg', index: 1, kind: 'learn', status: 'available', titleVi: 'Hội thoại: Bốn thanh và thanh nhẹ', newWordCount: 3, estMinutes: 4 },
              { id: 'hsk30.L1.P1.rp1', index: 2, kind: 'learn', status: 'available', titleVi: 'Nhập vai 1: Chào hỏi bố mẹ Tiểu Văn', newWordCount: 3, estMinutes: 5 },
              { id: 'hsk30.L1.P1.exam', index: 3, kind: 'stage_test', status: 'available', titleVi: 'Luyện đề: Bốn thanh và thanh nhẹ', newWordCount: 3, estMinutes: 4 }
            ]
          },
          {
            id: 'hsk30.L1.S01',
            index: 1,
            titleVi: 'Chào hỏi, làm quen',
            status: 'available',
            wordCount: 44,
            grammarCount: 4,
            progress: { lessonsDone: 0, lessonsTotal: 4 },
            lessons: [
              { id: 'hsk30.L1.S01.learn.1', index: 0, kind: 'learn', status: 'available', titleVi: 'Bài 1: Xin chào, cảm ơn, tạm biệt (老师，您好！)', newWordCount: 11, estMinutes: 6 },
              { id: 'hsk30.L1.S02.learn.1', index: 1, kind: 'learn', status: 'available', titleVi: 'Bài 2: Bạn tên là gì? (你叫什么名字？)', newWordCount: 11, estMinutes: 6 },
              { id: 'hsk30.L1.S03.learn.1', index: 2, kind: 'learn', status: 'available', titleVi: 'Bài 3: Bạn là người nước nào? (你是哪国人？)', newWordCount: 11, estMinutes: 6 },
              { id: 'hsk30.L1.S04.learn.1', index: 3, kind: 'stage_test', status: 'available', titleVi: 'Bài 4: Nhà mình có mấy người (你家有几口人？)', newWordCount: 11, estMinutes: 8 }
            ]
          }
        ]
      });
    }
    if (p === '/v2/companion/unlocks/celebrated') {
      return jsonResponse({ ok: true });
    }
    if (p === '/v2/me/shadowing/summary') {
      return jsonResponse({ enabled: false, todayCard: false, checkpoint: { due: false } });
    }
    if (p === '/v2/today' || p === '/v2/today/session' || p.startsWith('/v2/today/session/steps/')) {
      const sum = getRealProgressSummary();
      let savedLessonId = localStorage.getItem('httq_current_lesson_id') || 'hsk30.L1.P1.learn.1';
      if (savedLessonId === 'bai-1-hello-ai-xiaoyu') savedLessonId = 'hsk30.L1.P1.learn.1';
      const todayStr = new Date().toISOString().slice(0, 10);
      let reqMin = Number(urlObj.searchParams.get('minutes')) || 15;
      let sessionStatus = method === 'POST' ? 'in_progress' : 'preview';
      let stepStatuses = {};
      try {
        stepStatuses = JSON.parse(localStorage.getItem('httq_daily_steps_' + todayStr) || '{}') || {};
      } catch (_) {}
      if (p.startsWith('/v2/today/session/steps/') && method === 'POST') {
        const stepId = decodeURIComponent(p.replace('/v2/today/session/steps/', ''));
        const body = await parseRequestBody(init);
        if (stepId && body && body.status) {
          stepStatuses[stepId] = body.status;
          try {
            localStorage.setItem('httq_daily_steps_' + todayStr, JSON.stringify(stepStatuses));
          } catch (_) {}
        }
        sessionStatus = 'in_progress';
      } else if (p === '/v2/today/session' && method === 'POST') {
        const body = await parseRequestBody(init);
        if (body && body.minutes) reqMin = Number(body.minutes) || 15;
        sessionStatus = 'in_progress';
      }
      const dueCount = Math.max(0, sum.dueTotal || 0);
      const steps = [
        {
          id: 'step-lesson-1',
          kind: 'lesson',
          status: stepStatuses['step-lesson-1'] || 'pending',
          titleVi: 'Từ mới: Bốn thanh và thanh nhẹ (爸爸，妈妈)',
          detailVi: 'Học 3 từ mới và phân biệt 4 thanh điệu + thanh nhẹ',
          reasonVi: 'Bài tiếp theo trong lộ trình HSK 3.0 Cấp 1',
          estMinutes: 6,
          lesson: {
            lessonId: savedLessonId
          }
        },
        {
          id: 'step-review-1',
          kind: 'review',
          status: stepStatuses['step-review-1'] || 'pending',
          titleVi: dueCount > 0 ? `Ôn ${dueCount} từ vựng đến hạn` : 'Ôn từ vựng đã học',
          detailVi: 'Củng cố trí nhớ ngắt quãng SRS',
          reasonVi: 'Đến hạn ôn tập hôm nay',
          estMinutes: 4,
          review: {
            minutes: 4,
            limit: Math.max(6, dueCount)
          }
        },
        {
          id: 'step-talk-1',
          kind: 'talk',
          status: stepStatuses['step-talk-1'] || 'pending',
          titleVi: 'Luyện nói cùng Bạn đồng hành AI',
          detailVi: 'Thực hành phản xạ nghe nói tiếng Trung',
          reasonVi: 'Luyện giao tiếp hằng ngày',
          estMinutes: 2,
          talk: {
            stageKey: 'hsk30.L1.P1'
          }
        }
      ];
      if (Object.keys(stepStatuses).length > 0) {
        sessionStatus = steps.every(s => s.status === 'done') ? 'completed' : 'in_progress';
      }
      const nextPending = steps.find(s => s.status === 'pending');
      return jsonResponse({
        status: sessionStatus,
        localDay: todayStr,
        date: todayStr,
        minutes: reqMin,
        estMinutes: 12,
        minutesOptions: [5, 10, 15, 20],
        nextStepId: nextPending ? nextPending.id : steps[0].id,
        steps,
        completion: sessionStatus === 'completed' ? { streak: { count: sum.streakDays, todayDone: sum.todayDone } } : null,
        streak: { count: sum.streakDays, todayDone: sum.todayDone },
        streakDays: sum.streakDays,
        minutesDone: sum.todayMinutes,
        minutesGoal: reqMin,
        dailyGoalMinutes: reqMin,
        completedMinutes: sum.todayMinutes,
        continue: { kind: 'lesson', lessonId: savedLessonId },
        items: [
          { kind: 'lesson', lessonId: savedLessonId, titleVi: 'Từ mới: Bốn thanh và thanh nhẹ (爸爸，妈妈)', dueCount: 1, estMinutes: 6, locked: false },
          { kind: 'review', titleVi: 'Ôn từ đến hạn', dueCount: dueCount, estMinutes: 4, locked: false },
          { kind: 'errors', titleVi: 'Sửa lỗi hay sai', dueCount: sum.mistakesCount, estMinutes: 2, locked: false }
        ]
      });
    }
    if (p === '/v2/review/summary') {
      const sum = getRealProgressSummary();
      const today = Date.now();
      const baseDue = sum.dueTotal || 0;
      const forecast = [baseDue, Math.max(0, Math.round(baseDue * 0.7)), Math.max(0, Math.round(baseDue * 0.9)), Math.max(0, Math.round(baseDue * 0.5)), Math.max(0, Math.round(baseDue * 0.8)), Math.max(0, Math.round(baseDue * 0.4)), Math.max(0, Math.round(baseDue * 0.6))].map((due, idx) => ({
        day: new Date(today + idx * 86400000).toISOString().slice(0, 10),
        due,
        minutes: due > 0 ? Math.max(1, Math.round(due / 3)) : 0,
        heavy: due >= 15
      }));
      return jsonResponse({
        dueNow: { meaning: sum.dueMeaning, pinyin: sum.duePinyin },
        dueToday: { meaning: sum.dueMeaning, pinyin: sum.duePinyin },
        errorsQueue: sum.mistakesCount,
        totalCards: sum.totalCards,
        openRun: null,
        forecast
      });
    }
    if (p === '/v2/review/sentence-cards') {
      const sum = getRealProgressSummary();
      return jsonResponse({
        dueToday: sum.lessonsDone > 0 ? Math.min(5, sum.lessonsDone * 2) : 0,
        total: sum.lessonsDone * 4,
        upcoming: sum.lessonsDone > 0 ? 3 : 0,
        measureWords: sum.lessonsDone > 0 ? 4 : 0,
        newPerDay: 5
      });
    }
    if (p === '/v2/review/mistakes' || p === '/v2/review/mistakes/dismiss') {
      let dismissed = [];
      try {
        dismissed = JSON.parse(localStorage.getItem('httq_dismissed_mistakes') || '[]') || [];
      } catch (_) {
        dismissed = [];
      }
      if (p === '/v2/review/mistakes/dismiss' && method === 'POST') {
        const body = await parseRequestBody(init);
        if (body && body.itemKey && !dismissed.includes(body.itemKey)) {
          dismissed.push(body.itemKey);
          try { localStorage.setItem('httq_dismissed_mistakes', JSON.stringify(dismissed)); } catch (_) {}
        }
        return jsonResponse({ ok: true });
      }
      const allMistakes = [
        {
          itemKey: 'w:谢谢',
          titleZh: '谢谢',
          word: {
            hanzi: '谢谢',
            pinyin: 'xièxie',
            wordPinyin: 'xièxie',
            meaningVi: 'cảm ơn',
            audio: { url: rewriteMediaUrl('https://static.xiehanzi.com/word_audios/谢谢.mp3') }
          },
          hanzi: '谢谢',
          pinyin: 'xièxie',
          meaningVi: 'cảm ơn',
          skill: 'meaning',
          category: 'vocab_confusion',
          categoryLabelVi: 'Nhầm nghĩa từ vựng',
          sourceLabelVi: 'Bài 1: AI Tiểu Ngữ, xin chào!',
          givenDisplay: 'xin lỗi (对不起)',
          expectedDisplay: 'cảm ơn (谢谢)',
          reasonVi: '谢谢 (xièxie) nghĩa là cảm ơn, còn 对不起 (duìbuqǐ) mới là xin lỗi.',
          explanationVi: '谢谢 (xièxie) nghĩa là cảm ơn, còn 对不起 (duìbuqǐ) mới là xin lỗi.',
          count: 2,
          wrongCount: 2,
          errorCount: 2,
          lastWrongAt: new Date().toISOString(),
          progress: { cleared: 1, needed: 2, nextCheckDay: '2026-11-11' }
        },
        {
          itemKey: 'w:不客气',
          titleZh: '不客气',
          word: {
            hanzi: '不客气',
            pinyin: 'bú kèqi',
            wordPinyin: 'bú kèqi',
            meaningVi: 'đừng khách sáo',
            audio: { url: rewriteMediaUrl('https://static.xiehanzi.com/word_audios/不客气.mp3') }
          },
          hanzi: '不客气',
          pinyin: 'bú kèqi',
          meaningVi: 'đừng khách sáo',
          skill: 'meaning',
          category: 'vocab_confusion',
          categoryLabelVi: 'Nhầm nghĩa từ vựng',
          sourceLabelVi: 'Bài 1: AI Tiểu Ngữ, xin chào!',
          givenDisplay: 'không sao đâu (没关系)',
          expectedDisplay: 'đừng khách sáo (不客气)',
          reasonVi: '不客气 dùng để đáp lại lời cảm ơn (谢谢), còn 没关系 dùng để đáp lại lời xin lỗi (对不起).',
          explanationVi: '不客气 dùng để đáp lại lời cảm ơn (谢谢), còn 没关系 dùng để đáp lại lời xin lỗi (对不起).',
          count: 1,
          wrongCount: 1,
          errorCount: 1,
          lastWrongAt: new Date().toISOString(),
          progress: { cleared: 0, needed: 2, nextCheckDay: '2026-11-11' }
        },
        {
          itemKey: 'w:老师',
          titleZh: '老师',
          word: {
            hanzi: '老师',
            pinyin: 'lǎoshī',
            wordPinyin: 'lǎoshī',
            meaningVi: 'giáo viên, thầy cô',
            audio: { url: rewriteMediaUrl('https://static.xiehanzi.com/word_audios/老师.mp3') }
          },
          hanzi: '老师',
          pinyin: 'lǎoshī',
          meaningVi: 'giáo viên, thầy cô',
          skill: 'pinyin',
          category: 'tone_error',
          categoryLabelVi: 'Nhầm thanh điệu',
          sourceLabelVi: 'Bài 2: Tôi tên là Lý Văn',
          givenDisplay: 'lǎoshì (thanh 4)',
          expectedDisplay: 'lǎoshī (thanh 1)',
          reasonVi: 'Chữ 师 (shī) mang thanh 1 (âm ngang cao), rất dễ nhầm sang thanh 4 (shì).',
          explanationVi: 'Chữ 师 (shī) mang thanh 1 (âm ngang cao), rất dễ nhầm sang thanh 4 (shì).',
          count: 1,
          wrongCount: 1,
          errorCount: 1,
          lastWrongAt: new Date().toISOString(),
          progress: { cleared: 1, needed: 2, nextCheckDay: '2026-11-11' }
        }
      ].filter(m => !dismissed.includes(m.itemKey));
      const catFilter = urlObj.searchParams.get('category') || '';
      const filtered = catFilter ? allMistakes.filter(m => m.category === catFilter) : allMistakes;
      return jsonResponse({
        total: allMistakes.length,
        categories: [
          { category: 'vocab_confusion', labelVi: 'Nhầm nghĩa từ vựng', titleVi: 'Nhầm nghĩa từ vựng', count: allMistakes.filter(m => m.category === 'vocab_confusion').length },
          { category: 'tone_error', labelVi: 'Nhầm thanh điệu', titleVi: 'Nhầm thanh điệu', count: allMistakes.filter(m => m.category === 'tone_error').length }
        ].filter(c => c.count > 0),
        mistakes: filtered
      });
    }
    if (p === '/v2/review/words') {
      const q = (urlObj.searchParams.get('q') || '').trim().toLowerCase();
      const status = urlObj.searchParams.get('status') || 'all';
      const sum = getRealProgressSummary();
      const vocabMap = {
        '八': { pinyin: 'bā', meaningVi: 'tám (số)' },
        '爸爸': { pinyin: 'bàba', meaningVi: 'bố, ba' },
        '妈妈': { pinyin: 'māma', meaningVi: 'mẹ, má' },
        '你好': { pinyin: 'nǐ hǎo', meaningVi: 'xin chào' },
        '谢谢': { pinyin: 'xièxie', meaningVi: 'cảm ơn' },
        '不客气': { pinyin: 'bú kèqi', meaningVi: 'đừng khách sáo' },
        '对不起': { pinyin: 'duìbuqǐ', meaningVi: 'xin lỗi' },
        '没关系': { pinyin: 'méi guānxi', meaningVi: 'không sao đâu' },
        '再见': { pinyin: 'zàijiàn', meaningVi: 'tạm biệt' },
        '老师': { pinyin: 'lǎoshī', meaningVi: 'giáo viên' },
        '学生': { pinyin: 'xuésheng', meaningVi: 'học sinh, sinh viên' },
        '朋友': { pinyin: 'péngyou', meaningVi: 'bạn bè' },
        '中国': { pinyin: 'Zhōngguó', meaningVi: 'Trung Quốc' },
        '越南': { pinyin: 'Yuènán', meaningVi: 'Việt Nam' },
        '喜欢': { pinyin: 'xǐhuan', meaningVi: 'thích, yêu thích' }
      };
      const vIdx = await loadLocalJson('/data/vocabulary/index.json');
      const idxLookup = {};
      if (Array.isArray(vIdx)) {
        vIdx.forEach(e => {
          if (e && e.h && !idxLookup[e.h]) idxLookup[e.h] = { pinyin: e.p || '', meaningVi: e.m || '' };
        });
      }
      const learnedList = Array.isArray(sum.prog.wordsLearned) ? sum.prog.wordsLearned : [];
      const allWords = learnedList.map((hz, idx) => {
        const clean = String(hz).replace(/^w:|^c:/, '');
        const info = vocabMap[clean] || idxLookup[clean] || { pinyin: '', meaningVi: 'Từ vựng đã học' };
        return {
          itemKey: clean,
          word: clean,
          hanzi: clean,
          pinyin: info.pinyin,
          meaningVi: info.meaningVi,
          state: idx % 3 === 2 ? 'learning' : 'review',
          dueAt: new Date().toISOString()
        };
      });
      let items = allWords;
      if (status === 'known') items = items.filter(x => x.state === 'review');
      if (status === 'learning') items = items.filter(x => x.state === 'learning');
      if (q) items = items.filter(x => x.word.includes(q) || x.pinyin.toLowerCase().includes(q) || x.meaningVi.toLowerCase().includes(q));
      return jsonResponse({
        items,
        totals: {
          known: allWords.filter(x => x.state === 'review').length,
          learning: allWords.filter(x => x.state === 'learning').length
        },
        nextCursor: null
      });
    }
    if (p === '/v2/review/runs' || p.startsWith('/v2/lesson-runs') || p.includes('/runs')) {
      let targetRunId = 'hsk30.L1.P1.learn.1';
      let runKind = 'learn';
      let runMode = 'due';
      if (p === '/v2/review/runs') {
        const body = await parseRequestBody(init);
        runKind = 'review';
        runMode = (body && body.mode) || 'due';
        if (body && Array.isArray(body.itemKinds) && body.itemKinds.includes('s')) {
          targetRunId = 'on-tap-the-cau';
        } else if (runMode === 'errors') {
          targetRunId = 'on-tap-loi-sai';
        } else {
          targetRunId = 'on-tap-den-han';
        }
        try { localStorage.setItem('httq_last_review_mode', targetRunId); } catch (_) {}
      } else if (p.startsWith('/v2/lessons/') && p.endsWith('/runs')) {
        targetRunId = decodeURIComponent(p.slice('/v2/lessons/'.length, -'/runs'.length)) || 'hsk30.L1.P1.learn.1';
        if (targetRunId === 'bai-1-hello-ai-xiaoyu') targetRunId = 'hsk30.L1.P1.learn.1';
        localStorage.setItem('httq_current_lesson_id', targetRunId);
      } else if (p.startsWith('/v2/stages/') && p.endsWith('/test-out-runs')) {
        const stg = decodeURIComponent(p.slice('/v2/stages/'.length, -'/test-out-runs'.length));
        targetRunId = `${stg}.exam`;
        localStorage.setItem('httq_current_lesson_id', targetRunId);
      } else if (p.startsWith('/v2/lesson-runs/')) {
        targetRunId = decodeURIComponent(p.slice('/v2/lesson-runs/'.length).split('/')[0]) || 'hsk30.L1.P1.learn.1';
      }
      setTimeout(() => {
        try {
          if (!window.location.pathname.startsWith('/hoc/bai/')) {
            origPushState.call(history, null, '', '/hoc/bai/' + encodeURIComponent(targetRunId));
            checkAndRenderDynamicPage();
          }
        } catch (_) {}
      }, 60);
      return jsonResponse({
        runId: targetRunId,
        kind: runKind,
        mode: runMode,
        total: 21,
        answered: 0,
        steps: []
      });
    }
    if (p.startsWith('/v2/dictionary/entries/')) {
      const slug = decodeURIComponent(p.replace('/v2/dictionary/entries/', ''));
      const cleanHz = extractHanziWord(slug) || slug;
      const w = await lookupWord(slug);
      const rawAudio =
        (w && w.audios && w.audios[0]) ||
        (w && w.audioUrl) ||
        `https://static.xiehanzi.com/word_audios/${encodeURIComponent(cleanHz)}.mp3`;
      return jsonResponse({
        slug,
        audioUrl: rewriteMediaUrl(rawAudio)
      });
    }

    // ------------------------------------------------------------------------
    // C. TRƯỜNG THẦY ĐỒ API (/v1/thay-do/*)
    // ------------------------------------------------------------------------
    if (p === '/v1/thay-do/bang-vang/dau' || p.startsWith('/v1/thay-do/bang-vang/tuan')) {
      return jsonResponse({
        nhan: '18/2026',
        tuan: '2026-W18',
        bang: {
          'chuyen-can': [
            { hang: 1, ten: 'Minh Anh', so: 42 },
            { hang: 2, ten: 'Hoàng Long', so: 38 },
            { hang: 3, ten: 'Thanh Thảo', so: 31 }
          ],
          'khoa-bang': [
            { hang: 1, ten: 'Tuấn Kiệt', so: 98 },
            { hang: 2, ten: 'Bảo Ngọc', so: 95 },
            { hang: 3, ten: 'Đức Duy', so: 92 }
          ],
          'hoa-tay': [
            { hang: 1, ten: 'Lan Hương', so: 96.5 },
            { hang: 2, ten: 'Quốc Bảo', so: 94.2 },
            { hang: 3, ten: 'Khánh Linh', so: 91.8 }
          ],
          'thu-vien': [
            { hang: 1, ten: 'Thảo Vy', so: 12 },
            { hang: 2, ten: 'Hữu Phước', so: 9 }
          ],
          'hieu-sach': [
            { hang: 1, ten: 'Gia Hân', so: 95.4 },
            { hang: 2, ten: 'Văn Nam', so: 92.1 }
          ]
        }
      });
    }
    if (p.startsWith('/v1/thay-do/bang-vang/')) {
      return jsonResponse({ ok: true, bang: [], ds: [] });
    }
    if (p === '/v1/thay-do/lop/muon') {
      return jsonResponse({ n: { '4': 68, '5': 42, '6': 29 }, toi: [] });
    }
    if (p === '/v1/thay-do/lop/toi') {
      return jsonResponse({ tienDo: { buoi: [], cap: [] } });
    }
    if (p.startsWith('/v1/thay-do/lop/bang/')) {
      return jsonResponse({ chu: [] });
    }
    if (p === '/v1/thay-do/lop/canh') {
      return jsonResponse({ ban: [] });
    }
    if (p === '/v1/thay-do/khoa/mine') {
      return jsonResponse({ khoa: [] });
    }
    if (p.includes('/v1/thay-do/hi-vien/danh-muc')) {
      const data = await loadLocalJson('/data/misc/thay-do-hi-vien-danh-muc.json');
      return jsonResponse(data || { canh: [] });
    }
    if (p.startsWith('/v1/thay-do/')) {
      return jsonResponse({ ok: true, chu: [], ban: [], khoa: [], tienDo: { buoi: [], cap: [] } });
    }

    // ------------------------------------------------------------------------
    // D. TRÒ CHƠI & BẢNG XẾP HẠNG (/v1/games/*)
    // ------------------------------------------------------------------------
    if (p === '/v1/games/overview') {
      return jsonResponse({
        games: [
          { game: 'ghep-chu', dailyPlayers: 142, topScore: 980 },
          { game: 'tim-chu-trong-chu', dailyPlayers: 118, topScore: 950 }
        ]
      });
    }
    const gameDailyMatch = p.match(/^\/v1\/games\/(?:daily\/([^/]+)|([^/]+)\/daily)(?:\/start)?$/);
    if (gameDailyMatch) {
      const game = gameDailyMatch[1] || gameDailyMatch[2] || 'ghep-chu';
      if (method === 'POST') {
        const round = game === 'tim-chu-trong-chu'
          ? await createTimChuRound('normal', 'daily', 0)
          : await createGhepChuRound('normal', 'daily', 0);
        return jsonResponse({
          date: new Date().toISOString().slice(0, 10),
          game,
          plays: 1,
          bestScore: 920,
          round,
          run: null
        });
      }
      return jsonResponse({
        date: new Date().toISOString().slice(0, 10),
        game,
        plays: 0,
        bestScore: null,
        activeRoundId: null,
        totalPlayers: 48
      });
    }
    const gameRankRunCreateMatch = p.match(/^\/v1\/games\/(?:([^/]+)\/)?rank-runs$/);
    if (gameRankRunCreateMatch && method === 'POST') {
      const body = await parseRequestBody(init);
      const game = gameRankRunCreateMatch[1] || body.game || 'ghep-chu';
      const diff = body.difficulty || 'easy';
      const round = game === 'tim-chu-trong-chu'
        ? await createTimChuRound(diff, 'rank', 0)
        : await createGhepChuRound(diff, 'rank', 0);
      const run = {
        runId: `rankrun-${Date.now()}`,
        game,
        difficulty: diff,
        status: 'active',
        totalRounds: game === 'tim-chu-trong-chu' ? 5 : 1,
        roundsPlayed: 0,
        totalScore: 0,
        rounds: []
      };
      gameRunsStore.set(run.runId, { run, round });
      return jsonResponse({ run, round });
    }
    if (p.startsWith('/v1/games/rank-runs/')) {
      const parts = p.split('/').filter(Boolean);
      const runId = parts[3];
      const action = parts[4] || '';
      const stored = gameRunsStore.get(runId);
      if (action === 'next' && method === 'POST') {
        const game = stored ? stored.run.game : 'ghep-chu';
        const diff = stored ? stored.run.difficulty : 'easy';
        const round = game === 'tim-chu-trong-chu'
          ? await createTimChuRound(diff, 'rank', 0)
          : await createGhepChuRound(diff, 'rank', 0);
        const run = stored ? stored.run : { runId, game, difficulty: diff, status: 'active', totalRounds: 1, roundsPlayed: 0, totalScore: 0, rounds: [] };
        return jsonResponse({ run, round });
      }
      if (stored) return jsonResponse(stored);
      return jsonResponse({ run: { runId, status: 'completed', totalRounds: 1, roundsPlayed: 1, totalScore: 900, rounds: [] }, round: null });
    }
    const gameRoundCreateMatch = p.match(/^\/v1\/games\/(?:([^/]+)\/)?rounds$/);
    if (gameRoundCreateMatch && method === 'POST') {
      const body = await parseRequestBody(init);
      const game = gameRoundCreateMatch[1] || body.game || 'ghep-chu';
      const diff = body.difficulty || 'easy';
      const round = game === 'tim-chu-trong-chu'
        ? await createTimChuRound(diff, 'casual', 0)
        : await createGhepChuRound(diff, 'casual', 0);
      return jsonResponse(round);
    }
    if (p.startsWith('/v1/games/rounds/')) {
      const parts = p.split('/').filter(Boolean); // ['v1','games','rounds', roundId, action?]
      const roundId = parts[3];
      if (!roundId) return jsonResponse({ error: 'round_not_found' }, 404);
      const action = parts[4] || '';
      let round = gameRoundsStore.get(roundId);
      if (!round) {
        round = roundId.startsWith('tim-')
          ? await createTimChuRound('easy', 'casual', 0)
          : await createGhepChuRound('easy', 'casual', 0);
        gameRoundsStore.set(roundId, round);
      }

      if (!action && method === 'GET') {
        return jsonResponse(round);
      }

      // GHEP-CHU: POST /v1/games/rounds/:id/cells
      if (action === 'cells' && method === 'POST') {
        const body = await parseRequestBody(init);
        const rowIndex = Number(body.rowIndex);
        const cellIndex = Number(body.cellIndex);
        const bankId = String(body.bankId || '');
        const metaRow = (round._metaRows || [])[rowIndex];
        const chosenTile = (round._metaBank || []).find(b => b.id === bankId) || (round.bank || []).find(b => b.id === bankId);
        const expectedChar = metaRow ? Array.from(metaRow.word)[cellIndex] : (chosenTile ? chosenTile.char : '一');

        if (!chosenTile || (metaRow && chosenTile.char !== expectedChar)) {
          round.wrongSubmits = (round.wrongSubmits || 0) + 1;
          return jsonResponse({ verdict: 'wrong' });
        }

        round.bank = (round.bank || []).filter(b => b.id !== bankId);
        const rowObj = (round.rows || []).find(r => r.index === rowIndex);
        let solvedRow = null;
        if (rowObj && metaRow) {
          rowObj.cells = rowObj.cells.map((c, idx) => (idx === cellIndex ? { ...c, char: expectedChar } : c));
          rowObj.solved = {
            word: metaRow.word,
            pinyin: metaRow.pinyin,
            meaningVi: metaRow.meaningVi,
            hinted: false
          };
          solvedRow = rowObj.solved;
        }
        const completed = (round.rows || []).every(r => !!r.solved);
        return jsonResponse({
          verdict: 'correct',
          char: expectedChar,
          bank: round.bank,
          solvedRow,
          completed
        });
      }

      // TIM-CHU-TRONG-CHU: POST /v1/games/rounds/:id/check
      if (action === 'check' && method === 'POST') {
        const remaining = (round._answers || []).filter(a => !(round.found || []).some(f => f.char === a.char));
        const picked = remaining[0] || (round._answers && round._answers[0]);
        if (!picked) {
          return jsonResponse({
            verdict: 'duplicate',
            found: round.found || [],
            completed: true
          });
        }
        const entry = {
          char: picked.char,
          pinyin: picked.pinyin,
          meaningVi: picked.meaningVi,
          length: picked.length || 1,
          points: picked.points || 100,
          hinted: false
        };
        round.found = [...(round.found || []), entry];
        const completed = round.found.length >= round.targetCount;
        return jsonResponse({
          verdict: 'correct',
          char: entry.char,
          pinyin: entry.pinyin,
          meaningVi: entry.meaningVi,
          length: entry.length,
          points: entry.points,
          found: round.found,
          completed
        });
      }

      // HINT: POST /v1/games/rounds/:id/hint
      if (action === 'hint' && method === 'POST') {
        round.hintsUsed = (round.hintsUsed || 0) + 1;
        if (round.game === 'tim-chu-trong-chu') {
          const remaining = (round._answers || []).filter(a => !(round.found || []).some(f => f.char === a.char));
          const picked = remaining[0] || (round._answers && round._answers[0]) || { char: '一', pinyin: 'yī', meaningVi: 'số một', length: 1, points: 0 };
          const entry = {
            char: picked.char,
            pinyin: picked.pinyin,
            meaningVi: picked.meaningVi,
            length: 1,
            points: 0,
            hinted: true
          };
          round.found = [...(round.found || []), entry];
          const completed = round.found.length >= round.targetCount;
          return jsonResponse({
            char: entry.char,
            pinyin: entry.pinyin,
            meaningVi: entry.meaningVi,
            length: 1,
            found: round.found,
            completed
          });
        } else {
          const unsolved = (round.rows || []).find(r => !r.solved);
          const rIdx = unsolved ? unsolved.index : 0;
          const metaRow = (round._metaRows || [])[rIdx] || CHENGYU_BANK[0];
          const usedIds = (round._metaBank || []).filter(b => b.targetRow === rIdx).map(b => b.id);
          round.bank = (round.bank || []).filter(b => !usedIds.includes(b.id));
          if (unsolved) {
            unsolved.solved = {
              word: metaRow.word,
              pinyin: metaRow.pinyin,
              meaningVi: metaRow.meaningVi,
              hinted: true
            };
            unsolved.cells = Array.from(metaRow.word).map(ch => ({ blank: false, char: ch }));
          }
          const completed = (round.rows || []).every(r => !!r.solved);
          return jsonResponse({
            rowIndex: rIdx,
            word: metaRow.word,
            pinyin: metaRow.pinyin,
            meaningVi: metaRow.meaningVi,
            usedBankIds: usedIds,
            bank: round.bank,
            completed
          });
        }
      }

      // FINISH: POST /v1/games/rounds/:id/finish
      if (action === 'finish' && method === 'POST') {
        round.finishedAt = new Date().toISOString();
        const durationMs = Math.max(5000, Date.now() - (Date.parse(round.startedAt) || Date.now() - 18000));
        if (round.game === 'tim-chu-trong-chu') {
          const foundCount = (round.found || []).length || round.targetCount;
          const answers = (round._answers || []).map(a => {
            const isFound = (round.found || []).some(f => f.char === a.char);
            return {
              char: a.char,
              pinyin: a.pinyin,
              meaningVi: a.meaningVi,
              length: 1,
              found: isFound,
              points: isFound ? a.points : 0
            };
          });
          return jsonResponse({
            completed: foundCount >= round.targetCount,
            foundCount,
            targetCount: round.targetCount,
            score: 880,
            durationMs,
            hintsUsed: round.hintsUsed || 0,
            wrongSubmits: round.wrongSubmits || 0,
            round,
            breakdown: { earned: 760, timeBonus: 120, penalty: 0 },
            answers,
            run: round.mode === 'rank' ? { runId: 'rank-1', roundIndex: 0, totalRounds: 1, totalScore: 880, completed: true, recorded: true } : null,
            daily: round.mode === 'daily' ? { play: 1, bestScore: 880, rank: 2, totalPlayers: 48 } : null
          });
        } else {
          const solvedCount = (round.rows || []).filter(r => !!r.solved).length || round.targetCount;
          const answers = (round._metaRows || []).map((r, i) => {
            const rowState = (round.rows || [])[i];
            const isFound = !!(rowState && rowState.solved);
            return {
              char: r.word,
              pinyin: r.pinyin,
              meaningVi: r.meaningVi,
              found: isFound,
              points: isFound ? Math.round(800 / round.targetCount) : 0
            };
          });
          return jsonResponse({
            completed: solvedCount >= round.targetCount,
            foundCount: solvedCount,
            targetCount: round.targetCount,
            score: 920,
            durationMs,
            hintsUsed: round.hintsUsed || 0,
            wrongSubmits: round.wrongSubmits || 0,
            round,
            breakdown: { earned: 800, timeBonus: 120, penalty: 0 },
            answers,
            run: round.mode === 'rank' ? { runId: 'rank-1', roundIndex: 0, totalRounds: 1, totalScore: 920, completed: true, recorded: true } : null,
            daily: round.mode === 'daily' ? { play: 1, bestScore: 920, rank: 1, totalPlayers: 52 } : null
          });
        }
      }
    }
    if (p.includes('/v1/games/leaderboard') || p.includes('/v1/games/daily-leaderboard')) {
      const game = urlObj.searchParams.get('game') || 'ghep-chu';
      return jsonResponse({
        game,
        weekKey: '2026-W45',
        date: new Date().toISOString().slice(0, 10),
        entries: [
          { rank: 1, userId: 'u1', displayName: 'Minh Anh', score: 980, durationMs: 19400, difficulty: 'hard' },
          { rank: 2, userId: 'u2', displayName: 'Tuấn Kiệt', score: 945, durationMs: 22100, difficulty: 'hard' },
          { rank: 3, userId: 'u3', displayName: 'Thanh Thảo', score: 910, durationMs: 25800, difficulty: 'normal' },
          { rank: 4, userId: 'u4', displayName: 'Hoàng Long', score: 885, durationMs: 28000, difficulty: 'normal' },
          { rank: 5, userId: 'u5', displayName: 'Bảo Ngọc', score: 860, durationMs: 31200, difficulty: 'easy' }
        ],
        items: [
          { rank: 1, userId: 'u1', displayName: 'Minh Anh', score: 980, durationMs: 19400, difficulty: 'hard' },
          { rank: 2, userId: 'u2', displayName: 'Tuấn Kiệt', score: 945, durationMs: 22100, difficulty: 'hard' },
          { rank: 3, userId: 'u3', displayName: 'Thanh Thảo', score: 910, durationMs: 25800, difficulty: 'normal' }
        ],
        me: { rank: 3, score: 910 }
      });
    }

    // ------------------------------------------------------------------------
    // E. KIỂM TRA NGỮ PHÁP (/v1/grammar-quiz/*)
    // ------------------------------------------------------------------------
    if (p === '/v1/grammar-quiz/tracks') {
      const data = await loadLocalJson('/data/grammar/quiz-tracks.json');
      return jsonResponse(data || { tracks: [] });
    }
    if (p === '/v1/grammar-quiz') {
      const tracksParam = (urlObj.searchParams.get('tracks') || 'new-hsk1').split(',').filter(Boolean);
      const count = Math.max(1, Math.min(100, Number(urlObj.searchParams.get('count')) || 20));
      const typesParam = (urlObj.searchParams.get('types') || 'mcq,translate_zh_vi,translate_vi_zh').split(',').filter(Boolean);
      let allQuestions = [];
      for (const tr of tracksParam) {
        const cleanTrack = tr.replace(/^new-hsk-(\d+)$/, 'new-hsk$1').replace(/^hsk-(\d+)$/, 'hsk$1');
        const qData = await loadLocalJson(`/data/grammar/quiz-${cleanTrack}.json`);
        if (qData && Array.isArray(qData.questions)) {
          allQuestions.push(...qData.questions.filter(q => typesParam.includes(q.type)));
        }
      }
      if (allQuestions.length === 0) {
        const fallback = await loadLocalJson('/data/grammar/quiz-new-hsk1.json');
        if (fallback && Array.isArray(fallback.questions)) {
          allQuestions = fallback.questions;
        }
      }
      const selected = allQuestions.slice(0, count);
      return jsonResponse({
        total: selected.length,
        questions: selected
      });
    }

    // ------------------------------------------------------------------------
    // F. ĐỀ KIỂM TRA & PHÒNG THI HSK/YCT (/v1/generated-tests/*, /v1/hsk-tests/*)
    // ------------------------------------------------------------------------
    if (p === '/v1/generated-tests/options') {
      const data = await loadLocalJson('/data/tests/generated-tests-options.json');
      return jsonResponse(data || { levels: [] });
    }
    if (p === '/v1/generated-tests/freshness') {
      const data = await loadLocalJson('/data/tests/generated-tests-options.json');
      const levels = (data && Array.isArray(data.levels) ? data.levels : []).map(l => ({
        ...l,
        unseenCount: l.questionCount || l.total || 40,
        totalCount: l.questionCount || l.total || 40
      }));
      return jsonResponse({ levels });
    }
    if (p.includes('/v1/generated-tests/create') || p.includes('/v1/generated-tests/start') || (p.includes('/v1/generated-tests') && method === 'POST')) {
      const body = await parseRequestBody(init);
      const level = body.level || body.hskLevel || 1;
      const deId = `hsk30-${level}`;
      const fullPaper = await loadTestPaperById(deId, level);
      if (fullPaper) {
        return jsonResponse({
          ...fullPaper,
          deId,
          id: deId,
          testId: fullPaper.testId || deId,
          questionCount: fullPaper.questionCount || 40,
          repeatedLevels: [],
          durationMinutes: fullPaper.durationMinutes || 40
        });
      }
      return jsonResponse({ deId: 'hsk30-1', id: 'hsk30-1', testId: 'hsk30-1', questionCount: 40, repeatedLevels: [], questions: [] });
    }
    if (p.startsWith('/v1/generated-tests/') && method === 'GET') {
      const deId = decodeURIComponent(p.slice('/v1/generated-tests/'.length).split('/')[0] || 'hsk30-1');
      const safeId = deId === 'undefined' ? 'hsk30-1' : deId;
      const paper = await loadTestPaperById(safeId);
      return jsonResponse({ ...(paper || {}), deId: safeId, id: safeId, testId: safeId });
    }
    if (p.includes('/v1/hsk-tests/levels')) {
      const subParts = (p.split('/v1/hsk-tests/levels')[1] || '').split('/').filter(Boolean);
      const examType = (urlObj.searchParams.get('examType') || urlObj.searchParams.get('family') || 'hsk').toLowerCase();
      if (subParts.length >= 2) {
        const lvl = subParts[0];
        const tid = decodeURIComponent(subParts[1]);
        const paper = await loadTestPaperById(tid, lvl);
        return jsonResponse(paper || {});
      }
      if (subParts.length === 1) {
        const lvl = subParts[0];
        const data = (await loadLocalJson(`/data/tests/papers-${examType}.json`)) || { levels: [] };
        const matchedLvl = Array.isArray(data.levels) ? data.levels.find(l => String(l.level) === String(lvl)) : null;
        return jsonResponse(matchedLvl ? matchedLvl.items || [] : []);
      }
      const data = await loadLocalJson(`/data/tests/levels-${examType}.json`);
      return jsonResponse(data || []);
    }
    if (p.includes('/v1/hsk-tests/papers/') && method === 'GET') {
      const paperId = decodeURIComponent(p.split('/v1/hsk-tests/papers/')[1].split('/')[0]);
      const data = await loadTestPaperById(paperId === 'undefined' ? 'hsk30-1' : paperId);
      return jsonResponse(data || {});
    }
    if (p.includes('/v1/hsk-tests/papers')) {
      const examType = (urlObj.searchParams.get('examType') || 'hsk').toLowerCase();
      const level = urlObj.searchParams.get('level');
      const data = (await loadLocalJson(`/data/tests/papers-${examType}.json`)) || { levels: [] };
      if (level && data && Array.isArray(data.levels)) {
        const matchedLvl = data.levels.find(l => String(l.level) === String(level));
        return jsonResponse(matchedLvl ? matchedLvl.items || [] : []);
      }
      return jsonResponse(data);
    }

    // ------------------------------------------------------------------------
    // G. VIDEO NGHE CHÉP CHÍNH TẢ (/v1/dictation/*)
    // ------------------------------------------------------------------------
    if (p.includes('/v1/dictation/videos/') && p.endsWith('/segments')) {
      const id = decodeURIComponent(p.split('/v1/dictation/videos/')[1].replace('/segments', ''));
      let data = await loadLocalJson(`/data/dictation/videos/${id}-segments.json`);
      if (!data) {
        const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
        const matched = all.find(v => v.id === id || v._id === id || v.slug === id || v.slugVi === id || toSlugVi(v.title || v.titleVi) === id);
        if (matched) {
          data = await loadLocalJson(`/data/dictation/videos/${matched.id || matched._id}-segments.json`);
        }
      }
      const items = (data && (Array.isArray(data.items) ? data.items : (Array.isArray(data.segments) ? data.segments : []))) || [];
      return jsonResponse({ ...(data || {}), items, segments: items });
    }
    if (p.includes('/v1/dictation/videos/') && method === 'GET') {
      const id = decodeURIComponent(p.split('/v1/dictation/videos/')[1].split('/')[0]);
      const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
      const video = all.find(v => v.id === id || v._id === id || v.slug === id || v.slugVi === id || toSlugVi(v.title || v.titleVi) === id) || all[0] || {};
      const realId = video.id || video._id || id;
      const segs = (await loadLocalJson(`/data/dictation/videos/${realId}-segments.json`)) || {};
      const items = (segs && (Array.isArray(segs.items) ? segs.items : (Array.isArray(segs.segments) ? segs.segments : []))) || [];
      return jsonResponse({ ...video, ...(segs || {}), items, segments: items });
    }
    if (p.includes('/v1/dictation/videos')) {
      const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
      const hsk = urlObj.searchParams.get('hsk') || urlObj.searchParams.get('hskLevel') || urlObj.searchParams.get('level');
      const filtered = hsk ? all.filter(v => String(v.hskLevel) === String(hsk)) : all;
      return jsonResponse({ items: filtered, videos: filtered, total: filtered.length, page: 1, limit: 100, hasMore: false });
    }

    // ------------------------------------------------------------------------
    // H. NGỮ PHÁP, GIÁO TRÌNH, LUYỆN NGHE & LUYỆN NÓI (/v1/grammar/*, /v1/listening/*, /v1/speaking/*)
    // ------------------------------------------------------------------------
    if (p.startsWith('/v1/grammar-progress')) {
      const saved = JSON.parse(localStorage.getItem('httq_learned_grammar') || '[]');
      const set = new Set(Array.isArray(saved) ? saved : []);
      if (method === 'POST') {
        const gid = decodeURIComponent(p.slice('/v1/grammar-progress/'.length));
        if (gid) set.add(gid);
        localStorage.setItem('httq_learned_grammar', JSON.stringify([...set]));
      } else if (method === 'DELETE') {
        const gid = decodeURIComponent(p.slice('/v1/grammar-progress/'.length));
        if (gid) set.delete(gid);
        localStorage.setItem('httq_learned_grammar', JSON.stringify([...set]));
      }
      return jsonResponse({ learnedGrammarIds: [...set] });
    }
    if (p.startsWith('/v1/practice-progress')) {
      return jsonResponse({ ok: true, items: {}, updated: 0 });
    }
    if (p.startsWith('/v1/grammar/levels/')) {
      const lvl = decodeURIComponent(p.slice('/v1/grammar/levels/'.length).split('/')[0] || '1');
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const prefix = curr === 'new-hsk' ? 'new-hsk-level-' : 'hsk-level-';
      const data = await loadLocalJson(`/data/grammar/${prefix}${lvl}.json`);
      return jsonResponse(data || { curriculum: curr, level: lvl, total: 0, items: [] });
    }
    if (p.includes('/v1/grammar/levels')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const data = await loadLocalJson(`/data/grammar/levels-${curr}.json`);
      return jsonResponse(data || { levels: [] });
    }
    if (p.includes('/v1/grammar/points')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const lvl = urlObj.searchParams.get('level') || '1';
      const prefix = curr === 'new-hsk' ? 'new-hsk-level-' : 'hsk-level-';
      const data = await loadLocalJson(`/data/grammar/${prefix}${lvl}.json`);
      return jsonResponse(data || { items: [] });
    }

    // LUYỆN NGHE & LUYỆN NÓI SET: /v1/listening/(topics|lessons)/:curr/:levelSlug/:sourceSlug/set
    const listenSetMatch = p.match(/^\/v1\/listening\/(topics|lessons)\/([^/]+)\/([^/]+)\/([^/]+)\/set$/);
    if (listenSetMatch || p.includes('/v1/listening')) {
      const sourceType = listenSetMatch ? listenSetMatch[1] : 'lessons';
      const curr = listenSetMatch ? listenSetMatch[2] : (urlObj.searchParams.get('curriculum') || 'new-hsk');
      const levelSlug = listenSetMatch ? listenSetMatch[3] : (urlObj.searchParams.get('levelSlug') || 'new-hsk-1');
      const sourceSlug = listenSetMatch ? decodeURIComponent(listenSetMatch[4]) : 'bai-1-hello-ai-xiaoyu';

      let detail = await loadLocalJson(`/data/curriculums/${curr}/${sourceType}/${levelSlug}--${sourceSlug}.json`);
      if (!detail) {
        const altType = sourceType === 'lessons' ? 'topics' : 'lessons';
        detail = await loadLocalJson(`/data/curriculums/${curr}/${altType}/${levelSlug}--${sourceSlug}.json`);
      }
      if (!detail) {
        detail = await loadLocalJson('/data/curriculums/new-hsk/lessons/new-hsk-1--bai-1-hello-ai-xiaoyu.json');
      }
      const rawWords = (detail && detail.lesson && detail.lesson.words) || (detail && detail.topic && detail.topic.words) || (detail && detail.words) || [];
      const words = rawWords.map(w => {
        const hz = (w.hanzi || w.word || '').replace(/\{|\}/g, '');
        const rawAudio = (w.audios && w.audios[0]) || w.audioUrl || `https://static.xiehanzi.com/word_audios/${hz}.mp3`;
        return {
          hanzi: hz,
          pinyin: w.wordPinyin || w.pinyin || '',
          translationVi: w.translationVi || w.wordMeaningVi || w.meaningVi || '',
          audioUrl: rewriteMediaUrl(rawAudio)
        };
      });

      const sentences = [];
      for (const w of rawWords) {
        const wHz = (w.hanzi || w.word || '').replace(/\{|\}/g, '');
        const wPy = w.wordPinyin || w.pinyin || '';
        const wVi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const wAudio = rewriteMediaUrl((w.audios && w.audios[0]) || w.audioUrl || `https://static.xiehanzi.com/word_audios/${wHz}.mp3`);
        const exList = Array.isArray(w.examples) ? w.examples : [];
        for (const ex of exList.slice(0, 2)) {
          const sHz = (ex.hanzi || ex.chinese || '').trim();
          if (!sHz) continue;
          const chars = Array.from(sHz);
          const wChars = Array.from(wHz);
          let startIdx = sHz.indexOf(wHz);
          if (startIdx < 0) startIdx = 0;
          const endIdx = Math.min(chars.length, startIdx + Math.max(1, wChars.length));
          const sAudio = rewriteMediaUrl(ex.audioUrl || ex.sentenceAudioUrl || ex.audio || wAudio);
          sentences.push({
            hanzi: sHz,
            pinyin: ex.pinyin || wPy,
            vietnamese: ex.vietnamese || ex.meaningVi || wVi,
            sentenceAudioUrl: sAudio,
            audioUrl: sAudio,
            blankRange: [startIdx, endIdx],
            targetWord: {
              hanzi: wHz,
              pinyin: wPy,
              translationVi: wVi
            }
          });
        }
      }
      if (sentences.length === 0 && words.length > 0) {
        words.slice(0, 8).forEach(w => {
          sentences.push({
            hanzi: w.hanzi,
            pinyin: w.pinyin,
            vietnamese: w.translationVi,
            sentenceAudioUrl: w.audioUrl,
            audioUrl: w.audioUrl,
            blankRange: [0, Array.from(w.hanzi).length],
            targetWord: { hanzi: w.hanzi, pinyin: w.pinyin, translationVi: w.translationVi }
          });
        });
      }
      return jsonResponse({ words, sentences });
    }

    // LUYỆN NÓI CONSENT & PROGRESS & DIALOGUES
    if (p === '/v1/speaking/sample-consent') {
      return jsonResponse({ granted: false, decided: true });
    }
    if (p.startsWith('/v1/speaking/progress')) {
      return jsonResponse({ items: {} });
    }
    const speakDiagMatch = p.match(/^\/v1\/speaking\/dialogues\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/);
    if (speakDiagMatch) {
      const curr = speakDiagMatch[1];
      const levelSlug = speakDiagMatch[2];
      const topicSlug = speakDiagMatch[3] ? decodeURIComponent(speakDiagMatch[3]) : '';
      if (!topicSlug) {
        const listData = await loadLocalJson(`/data/speaking/${curr}/${levelSlug}/dialogues.json`);
        if (listData && Array.isArray(listData.dialogues)) return jsonResponse(listData);
        const fallbackList = await loadLocalJson('/data/speaking/new-hsk/new-hsk-1/dialogues.json');
        return jsonResponse(fallbackList || { dialogues: [] });
      }
      let topicData = await loadLocalJson(`/data/speaking/${curr}/${levelSlug}/${topicSlug}.json`);
      if (!topicData) {
        topicData = await loadLocalJson('/data/speaking/new-hsk/new-hsk-1/gia-dinh.json');
      }
      if (topicData && Array.isArray(topicData.turns)) {
        topicData = {
          ...topicData,
          turns: topicData.turns.map(t => ({
            ...t,
            audioUrl: t.audioUrl ? rewriteMediaUrl(t.audioUrl) : undefined
          }))
        };
      }
      return jsonResponse(topicData || { roles: [], turns: [] });
    }

    if (p.includes('/v1/speaking/curriculums')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const lvl = urlObj.searchParams.get('level') || 'hsk-1';
      const data = await loadLocalJson(`/data/speaking/${curr}/${lvl}/dialogues.json`);
      return jsonResponse(data || { dialogues: [] });
    }

    const currMatch = p.match(/^\/v1\/(?:hanzi-)?curriculums\/([^/]+)(?:\/(.*))?$/);
    if (currMatch) {
      const curr = currMatch[1] || 'hsk';
      const subParts = (currMatch[2] || '').split('/').filter(Boolean);
      const normOverview = ov => {
        if (!ov || typeof ov !== 'object') return ov;
        const copy = JSON.parse(JSON.stringify(ov));
        if (Array.isArray(copy.levels)) {
          copy.levels.forEach(l => {
            if (l && l.image) l.image = rewriteMediaUrl(l.image);
          });
        }
        return copy;
      };
      if (subParts.length === 0) {
        const overview = await loadLocalJson(`/data/curriculums/${curr}/overview.json`);
        return jsonResponse(normOverview(overview) || { name: curr.toUpperCase(), slug: curr, levels: [] });
      }
      if (subParts[0] === 'levels' && subParts.length === 2) {
        const levelSlug = subParts[1];
        const lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
        if (lvlData) {
          const copy = JSON.parse(JSON.stringify(lvlData));
          if (copy.level && copy.level.image) copy.level.image = rewriteMediaUrl(copy.level.image);
          return jsonResponse(copy);
        }
        return jsonResponse({ curriculum: { slug: curr }, level: { slug: levelSlug, topics: [] } });
      }
      if (subParts[0] === 'levels' && subParts[2] === 'lessons' && subParts.length === 3) {
        const levelSlug = subParts[1];
        let lessonsData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}-lessons.json`);
        if (!lessonsData) {
          const lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
          const topics = (lvlData && lvlData.level && lvlData.level.topics) || [];
          lessonsData = {
            curriculum: (lvlData && lvlData.curriculum) || { slug: curr },
            level: (lvlData && lvlData.level) || { slug: levelSlug },
            lessons: topics.map((t, idx) => ({
              lessonSlug: t.topicSlug,
              lessonNumber: idx + 1,
              titleVi: t.topic,
              titleZh: t.topic,
              wordCount: t.wordCount || 10,
              stageCount: 1,
              stageMinutes: 8,
              estimatedMinutes: 8
            }))
          };
        }
        return jsonResponse(lessonsData);
      }
      if (subParts[0] === 'levels' && subParts[2] === 'lessons' && subParts[3]) {
        const levelSlug = subParts[1];
        const lessonSlug = subParts[3];
        let detail = await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${lessonSlug}.json`);
        if (!detail) {
          detail = await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${lessonSlug}.json`);
        }
        return jsonResponse(detail || {});
      }
      if (subParts[0] === 'levels' && subParts[2] === 'topics' && subParts[3]) {
        const levelSlug = subParts[1];
        const topicSlug = subParts[3];
        const detail = await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${topicSlug}.json`);
        return jsonResponse(detail || {});
      }
      const overview = await loadLocalJson(`/data/curriculums/${curr}/overview.json`);
      return jsonResponse(normOverview(overview) || {});
    }

    // ------------------------------------------------------------------------
    // I. TRA CỨU CHỮ HÁN, TỪ VỰNG, HÁN VIỆT (/v1/hanzi-character*, /v1/hanzi-words*, /v1/han-viet/*)
    // ------------------------------------------------------------------------
    if (p.endsWith('/comments')) {
      return jsonResponse({ comments: [], items: [], total: 0 });
    }
    if (p.endsWith('/mnemonics')) {
      return jsonResponse({ mnemonics: [], items: [], total: 0 });
    }
    if (p.endsWith('/graph')) {
      const slug = decodeURIComponent(p.split('/').slice(-2, -1)[0] || '');
      const charData = await lookupCharacter(slug);
      return jsonResponse({
        character: (charData && charData.character) || extractHanziChar(slug),
        nodes: [],
        edges: [],
        words: (charData && charData.commonWords) || [],
        components: (charData && charData.components) || []
      });
    }
    if (p.startsWith('/v1/hanzi-characters/browse/')) {
      const subParts = p.slice('/v1/hanzi-characters/browse/'.length).split('/').filter(Boolean);
      const browseType = subParts[0] || 'hsk';
      const browseVal = decodeURIComponent(subParts[1] || '1');
      const index = (await loadLocalJson('/data/characters/index.json')) || [];
      let filtered = Array.isArray(index) ? index : [];
      if (browseType === 'hsk') {
        filtered = filtered.filter(x => String(x.hsk) === String(browseVal));
      } else if (browseType === 'radical') {
        filtered = filtered.filter(x => (x.r || x.radical) === browseVal);
      }
      const chars = filtered.slice(0, 300).map((entry, idx) => ({
        character: entry.c || entry.character,
        slug: entry.slug || `${entry.hv || entry.p || 'han'}-${entry.c}`,
        pinyin: entry.p || entry.pinyin || '',
        hanvietReading: entry.hv || '',
        meaningVi: entry.m || entry.meaningVi || '',
        radical: entry.r || '',
        strokeCount: entry.s || 1,
        hskLevel: entry.hsk || Number(browseVal) || 1,
        frequencyRank: idx + 1
      }));
      return jsonResponse({ chars, items: chars, total: filtered.length });
    }
    if (p === '/v1/hanzi-words/batch') {
      const body = await parseRequestBody(init);
      const rawWords = (body && (body.words || body.hanzis || body.items)) || (urlObj.searchParams.get('words') || '').split(',').filter(Boolean);
      const results = {};
      const items = [];
      for (const wStr of (Array.isArray(rawWords) ? rawWords : [])) {
        const wData = await lookupWord(wStr);
        if (wData) {
          results[wStr] = wData;
          items.push(wData);
        }
      }
      return jsonResponse({ words: results, items });
    }
    if (p.startsWith('/v1/pinyin-lookup')) {
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        if (typeof body.text !== 'string' || Array.from(body.text).length > 2000) return jsonResponse({ error: 'invalid_text', message: 'Nhập tối đa 2000 ký tự.' }, 400);
        return jsonResponse({ annotations: await annotateLocalPinyin(body.text) });
      }
      const q = (urlObj.searchParams.get('q') || urlObj.searchParams.get('pinyin') || '').trim().toLowerCase();
      const charIdx = (await loadLocalJson('/data/characters/index.json')) || [];
      const matches = (Array.isArray(charIdx) ? charIdx : [])
        .filter(c => (c.p || '').toLowerCase().includes(q) || (c.hv || '').toLowerCase().includes(q))
        .slice(0, 60)
        .map(entry => ({
          character: entry.c,
          slug: entry.slug || `${entry.hv || 'han'}-${entry.c}`,
          pinyin: entry.p,
          hanvietReading: entry.hv,
          meaningVi: entry.m,
          strokeCount: entry.s,
          hskLevel: entry.hsk
        }));
      return jsonResponse({ items: matches, characters: matches, total: matches.length });
    }
    if (p.startsWith('/v1/hanzi-characters/')) {
      const rawChars = decodeURIComponent(p.slice('/v1/hanzi-characters/'.length));
      const charList = rawChars.split(',').map(s => s.trim()).filter(Boolean);
      const index = (await loadLocalJson('/data/characters/index.json')) || [];
      const results = [];
      for (const ch of charList) {
        const cData = await lookupCharacter(ch);
        if (cData) {
          results.push({
            ...cData,
            character: cData.character || cData.c || ch,
            pinyin: cData.pinyin || cData.p || '',
            pinyins: cData.pinyins || [cData.pinyin || cData.p || ''].filter(Boolean),
            hanviet: cData.hanvietReading || cData.hv || '',
            hanvietReading: cData.hanvietReading || cData.hv || '',
            meaningVi: cData.meaningVi || cData.m || '',
            gif: rewriteMediaUrl(cData.gif || '')
          });
        } else if (Array.isArray(index)) {
          const entry = index.find(x => (x.c || x.character) === ch);
          if (entry) {
            results.push({
              character: entry.c,
              pinyin: entry.p,
              pinyins: [entry.p].filter(Boolean),
              hanviet: entry.hv,
              hanvietReading: entry.hv,
              meaningVi: entry.m,
              radical: entry.r,
              strokeCount: entry.s,
              hskLevel: entry.hsk
            });
          }
        }
      }
      return jsonResponse(results);
    }
    if (p.startsWith('/v1/hanzi-character/') || p.startsWith('/v1/characters/') || p.startsWith('/v1/hanzi/')) {
      const slug = p.split('/').pop();
      const charData = await lookupCharacter(slug);
      if (charData && charData.gif) charData.gif = rewriteMediaUrl(charData.gif);
      return jsonResponse(charData || {});
    }
    if (p.startsWith('/v1/hanzi-words/') || p.startsWith('/v1/words/') || p.startsWith('/v1/vocabulary/')) {
      const slug = p.split('/').pop();
      const wordData = await lookupWord(slug);
      return jsonResponse(wordData || {});
    }
    if (p.startsWith('/v1/han-viet/')) {
      const slug = p.split('/').pop();
      const hvData = await lookupHanViet(slug);
      return jsonResponse(hvData || {});
    }
    if (p.includes('/v1/search') || p.includes('/v1/lookup')) {
      const q = (urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '').trim().toLowerCase();
      const charIdx = (await loadLocalJson('/data/characters/index.json')) || [];
      const vocabIdx = (await loadLocalJson('/data/vocabulary/index.json')) || [];
      const chars = (Array.isArray(charIdx) ? charIdx : [])
        .filter(c => (c.c || '').includes(q) || (c.p || '').toLowerCase().includes(q) || (c.hv || '').toLowerCase().includes(q) || (c.m || '').toLowerCase().includes(q))
        .slice(0, 12);
      const words = (Array.isArray(vocabIdx) ? vocabIdx : [])
        .filter(w => (w.w || '').includes(q) || (w.p || '').toLowerCase().includes(q) || (w.hv || '').toLowerCase().includes(q) || (w.m || '').toLowerCase().includes(q))
        .slice(0, 12);
      return jsonResponse({ characters: chars, words, items: [...chars, ...words] });
    }

    // ------------------------------------------------------------------------
    // J. CHẤM ĐIỂM ĐỀ THI, LUYỆN GÕ, SỔ TAY
    // ------------------------------------------------------------------------
    if (p === '/v1/typing-set') {
      const hsk = Number(urlObj.searchParams.get('hsk')) || 1;
      const limit = Math.max(1, Math.min(100, Number(urlObj.searchParams.get('limit')) || 20));
      const index = (await loadLocalJson('/data/characters/index.json')) || [];
      let pool = Array.isArray(index) ? index.filter(x => Number(x.hsk) === hsk && x.p) : [];
      if (pool.length === 0 && Array.isArray(index)) pool = index.filter(x => x.p).slice(0, 100);
      const set = pool.slice(0, limit).map(x => {
        const ch = x.c || x.character;
        return {
          character: ch,
          pinyin: x.p || x.pinyin || 'hǎo',
          hanviet: x.hv || x.hanvietReading || '',
          meaningVi: x.m || x.meaningVi || '',
          hskLevel: x.hsk || hsk,
          audioUrl: rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${ch}.mp3`)
        };
      });
      return jsonResponse({ hsk, set });
    }
    if (p === '/v1/typing-word-set') {
      const hsk = Number(urlObj.searchParams.get('hsk')) || 1;
      const limit = Math.max(1, Math.min(100, Number(urlObj.searchParams.get('limit')) || 20));
      const vocabIdx = (await loadLocalJson('/data/vocabulary/index.json')) || [];
      const pool = Array.isArray(vocabIdx) ? vocabIdx.filter(x => x.p && (x.w || '').length >= 2) : [];
      const set = pool.slice(0, limit).map(x => {
        const hz = (x.w || '').replace(/\{|\}/g, '');
        return {
          word: hz,
          hanzi: hz,
          pinyin: x.p || 'nǐ hǎo',
          hanviet: x.hv || '',
          meaningVi: x.m || '',
          hskLevel: hsk,
          audioUrl: rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${hz}.mp3`)
        };
      });
      return jsonResponse({ hsk, set });
    }
    if (p === '/v1/typing-sentence-set') {
      const hsk = Number(urlObj.searchParams.get('hsk')) || 1;
      const limit = Math.max(1, Math.min(50, Number(urlObj.searchParams.get('limit')) || 10));
      const gData = await loadLocalJson(`/data/grammar/hsk-level-${Math.min(6, hsk)}.json`);
      const items = (gData && gData.items) || [];
      const sentences = [];
      for (const item of items) {
        const exList = item.example || item.examples || [];
        for (const ex of exList) {
          if (ex.chinese && ex.pinyin) {
            sentences.push({
              sentence: ex.chinese,
              hanzi: ex.chinese,
              pinyin: ex.pinyin,
              meaningVi: ex.vietnamese || '',
              hskLevel: hsk
            });
          }
        }
      }
      return jsonResponse({ hsk, set: sentences.slice(0, limit) });
    }

    if (p.includes('/v1/speaking/grade') || p.includes('/v1/speaking/assess') || p.includes('/v1/speaking/evaluate')) {
      const body = await parseRequestBody(init);
      const expected = (body.expectedText || body.referenceText || body.hanzi || body.text || '你好').trim();
      const recognized = (body.recognizedText || body.transcript || body.spokenText || expected).trim();
      const aiRes = await callAiEndpoint('speaking-assess', { expected, recognized });
      const cleanExp = Array.from(expected.replace(/[^\u4e00-\u9fff]/g, ''));
      const overall = (aiRes && aiRes.score) || 92;
      const syllables = (cleanExp.length > 0 ? cleanExp : ['你', '好']).map(ch => ({
        hanzi: ch,
        pinyin: '',
        status: 'good',
        score: overall,
        comment: 'Phát âm chuẩn'
      }));
      return jsonResponse({
        ok: true,
        score: overall,
        overallScore: overall,
        accuracyScore: overall,
        fluencyScore: Math.min(100, overall + 4),
        pronunciationScore: overall,
        syllables,
        transcriptHeard: recognized || expected,
        feedback: (aiRes && aiRes.feedback) || 'Phát âm rất chuẩn xác! Thanh điệu và âm tiết rõ ràng.',
        tip: 'Giữ nhịp độ nói tự nhiên và chú ý thanh 3 khi đi liền nhau.',
        gradingLimit: { limit: 1000, remaining: 995 }
      });
    }

    if ((p.includes('/submit') || p.includes('/grade') || p.includes('/attempts')) && method === 'POST') {
      const body = await parseRequestBody(init);
      const paperId = body.paperId || body.testId || p.split('/').filter(Boolean).slice(-2, -1)[0];
      const paper = paperId ? await loadTestPaperById(paperId) : null;
      const questions =
        (paper && (paper.questions && paper.questions.length ? paper.questions : (Array.isArray(paper.sections) ? paper.sections.flatMap(s => s.questions || []) : null))) ||
        body.questions ||
        [];
      if (!Array.isArray(questions) || !questions.length) return jsonResponse({ error: 'EMPTY_EXAM', message: 'Chưa có câu hỏi để chấm bài.' }, 400);
      if (questions.some(q => ![q.correctAnswer, q.answer, q.correctOption].some(answer => answer !== undefined && answer !== null && String(answer).trim() !== ''))) {
        return jsonResponse({ error: 'ANSWER_KEY_UNAVAILABLE', message: 'Đề này chưa có đáp án chuẩn trong kho dữ liệu. Có thể lưu bài làm để xem lại, nhưng chưa thể tính điểm chính xác.' }, 409);
      }
      const userAnswers = body.answers || body.userAnswers || {};
      let correctCount = 0;
      const results = questions.map((q, idx) => {
        const qId = q.id || q._id || q.number || q.questionNumber || idx + 1;
        const userAns = userAnswers[qId] !== undefined ? userAnswers[qId] : userAnswers[idx];
        const rightAns = q.correctAnswer ?? q.answer ?? q.correctOption;
        const isCorrect = String(userAns || '').trim().toUpperCase() === String(rightAns || '').trim().toUpperCase();
        if (isCorrect) correctCount++;
        return {
          questionId: qId,
          userAnswer: userAns,
          correctAnswer: rightAns,
          isCorrect,
          explanation: q.explanationVi || q.explanation || ''
        };
      });
      const total = questions.length || Object.keys(userAnswers).length || 1;
      const score = Math.round((correctCount / total) * 100);

      const st = getLocalState();
      st.examCount = (st.examCount || 0) + 1;
      st.history = [{ paperId, score, correctCount, total, at: new Date().toISOString() }, ...(st.history || []).slice(0, 49)];
      supabaseUpsert(st);

      return jsonResponse({
        ok: true,
        score,
        correctCount,
        totalQuestions: total,
        passed: score >= 60,
        results
      });
    }

    if (p.includes('/v1/notebook') || p.includes('/v1/bookmarks') || p.includes('/v1/saved')) {
      const st = getLocalState();
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const key = body.word || body.character || body.hanzi || body.id;
        if (key) {
          if (key.length === 1) st.masteredChars[key] = body;
          else st.savedWords[key] = body;
          await supabaseUpsert(st);
        }
      } else if (method === 'DELETE') {
        const key = p.split('/').pop();
        delete st.masteredChars[key];
        delete st.savedWords[key];
        await supabaseUpsert(st);
      }
      return jsonResponse({
        ok: true,
        characters: Object.values(st.masteredChars || {}),
        words: Object.values(st.savedWords || {}),
        items: [...Object.values(st.masteredChars || {}), ...Object.values(st.savedWords || {})]
      });
    }

    // ------------------------------------------------------------------------
    // K. AI APIs (/v1/translate, /v1/practice/result-ai-readout)
    // ------------------------------------------------------------------------
    if (p.includes('/v1/translate')) {
      const body = await parseRequestBody(init);
      const text = (body.text || body.q || body.sourceText || urlObj.searchParams.get('text') || '').trim();
      if (!text) return jsonResponse({ translatedText: '', pinyin: '', breakdown: [] });

      const hanziChars = [...new Set(text.match(/[\u4e00-\u9fff]/g) || [])];
      const charIdx = (await loadLocalJson('/data/characters/index.json')) || [];
      const breakdown = hanziChars
        .map(ch => (Array.isArray(charIdx) ? charIdx.find(x => (x.c || x.character) === ch) : null))
        .filter(Boolean)
        .map(info => ({
          character: info.c || info.character,
          pinyin: info.p || info.pinyin || '',
          hanviet: info.hv || info.hanviet || '',
          meaningVi: info.m || info.meaningVi || ''
        }));

      const aiRes = await callAiEndpoint('translate', { text, direction: body.direction || 'auto', breakdown });
      if (aiRes && aiRes.ok) return jsonResponse(aiRes);

      const fallbackPinyin = breakdown.map(b => b.pinyin).join(' ');
      const fallbackMeaning = breakdown.map(b => `${b.character} (${b.hanviet}): ${b.meaningVi}`).join('; ');
      return jsonResponse({
        ok: true,
        sourceText: text,
        translatedText: fallbackMeaning || text,
        translation: fallbackMeaning || text,
        pinyin: fallbackPinyin,
        breakdown
      });
    }

    if (p.includes('/v1/practice/result-ai-readout')) {
      const body = await parseRequestBody(init);
      const aiRes = await callAiEndpoint('practice-readout', body);
      if (aiRes && aiRes.ok) return jsonResponse(aiRes);

      const score = body.score !== undefined ? body.score : 85;
      return jsonResponse({
        ok: true,
        readout: score >= 80
          ? `Xuất sắc! Bạn đạt ${score}% độ chính xác. Hãy tiếp tục duy trì phong độ này và chuyển sang bài luyện tập tiếp theo nhé!`
          : `Bạn đã hoàn thành bài luyện tập với ${score}%. Hãy ôn lại các từ vựng vừa nhầm lẫn để ghi nhớ sâu hơn nhé!`,
        summary: 'Đã lưu kết quả luyện tập vào hồ sơ học tập.'
      });
    }

    return jsonResponse({ ok: true, items: [], data: null });
  }


  // ============================================================================
  // 5. INTERCEPT FETCH, XHR & DOM MEDIA ELEMENTS
  // ============================================================================
  const ORIG_FETCH = originalFetch;
  const ORIG_XHR_OPEN = XMLHttpRequest.prototype.open;
  const ORIG_XHR_SEND = XMLHttpRequest.prototype.send;
  const supabaseFetchInitial = supabasePull;
  function isApiUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return (
      url.includes('api.xiehanzi.com') ||
      url.includes('/v1/') ||
      url.includes('/v2/') ||
      url.startsWith('/v1') ||
      url.startsWith('/v2')
    );
  }

  const STATIC_CURR_ROOTS = [
    'thu-vien-new-hsk',
    'thu-vien-hsk',
    'thu-vien-yct',
    'thu-vien-boya',
    'thu-vien-hanyu-jiaocheng'
  ];

  function isDynamicSpaRoute(pathname) {
    const p = (pathname || '/').replace(/\/+$/, '') || '/';
    const parts = p.split('/').filter(Boolean);
    if (parts[0] === 'han-tu' && parts.length >= 2) return true;
    if (parts[0] === 'tu-vung' && parts.length >= 2) return true;
    if (parts[0] === 'han-viet') return true;
    if (parts[0] === 'ngu-phap' && parts.length >= 3) return true;
    if (parts[0] === 'kiem-tra-ngu-phap' && parts[1] === 'lam-bai') return true;
    if (parts[0] && parts[0].startsWith('thu-vien-')) {
      if (STATIC_CURR_ROOTS.includes(parts[0])) return parts.length >= 3;
      return parts.length >= 2;
    }
    if (parts[0] === 'luyen-chep-chinh-ta' && parts.length >= 2) return true;
    if ((parts[0] === 'kiem-tra-hsk' && parts.length >= 2) || (parts[0] === 'de-kiem-tra' && parts[1] === 'lam-bai')) return true;
    if (parts[0] === 'hoc' && (parts[1] === 'chang' || parts[1] === 'bai' || parts[1] === 'kiem-tra-cap') && parts.length >= 3) return true;
    if (parts[0] === 'hoc' && (parts[1] === 'tien-do' || parts[1] === 'thoi-quen')) return true;
    if (parts[0] === 'tra-chu' && (parts[1] === 'bo-thu' || parts[1] === 'hsk') && parts.length >= 3) return true;
    return false;
  }

  function isPrefetchRequest(input, init) {
    try {
      const h = (init && init.headers) || (input && input.headers);
      if (!h) return false;
      if (typeof h.get === 'function') {
        if (h.get('Next-Router-Prefetch') || h.get('next-router-prefetch') || h.get('purpose') === 'prefetch') return true;
      } else if (Array.isArray(h)) {
        return h.some(([k, v]) => {
          const kl = String(k).toLowerCase();
          return kl === 'next-router-prefetch' || (kl === 'purpose' && v === 'prefetch');
        });
      } else if (typeof h === 'object') {
        for (const k of Object.keys(h)) {
          const kl = k.toLowerCase();
          if (kl === 'next-router-prefetch' || (kl === 'purpose' && h[k] === 'prefetch')) return true;
        }
      }
    } catch (_) {}
    return false;
  }

  window.fetch = async function (input, init) {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input && typeof input === 'object') {
      url = input.url || input.href || '';
    }

    // 1. Rewrite static media URLs
    if (url.includes('static.xiehanzi.com') || url.includes('audio.xiehanzi.com')) {
      const localMedia = rewriteMediaUrl(url);
      return ORIG_FETCH(localMedia, init);
    }

    // 2. Intercept API calls
    if (isApiUrl(url)) {
      let fullUrl = url;
      if (url.startsWith('/')) {
        fullUrl = window.location.origin + url;
      }
      const mergedInit = init ? { ...init } : {};
      if (!mergedInit.method && input && input.method) {
        mergedInit.method = input.method;
      }
      const reqMethod = (mergedInit.method || 'GET').toUpperCase();
      if (mergedInit.body === undefined && reqMethod !== 'GET' && reqMethod !== 'HEAD' && input && typeof input.clone === 'function') {
        try {
          mergedInit.body = await input.clone().text();
        } catch (_) {}
      }
      return handleApiRequest(fullUrl, mergedInit);
    }

    // 3. Intercept Next.js App Router _rsc requests on static export
    if (url.includes('_rsc=')) {
      if (isPrefetchRequest(input, init)) {
        return Promise.reject(new DOMException('Prefetch skipped on static export', 'AbortError'));
      }
      try {
        const cleanU = new URL(url, window.location.origin);
        cleanU.searchParams.delete('_rsc');
        const targetHref = cleanU.pathname + cleanU.search + cleanU.hash;
        if (isDynamicSpaRoute(window.location.pathname) && cleanU.pathname === '/hoc/bat-dau') {
          return Promise.reject(new DOMException('Prevented redirect away from active lesson', 'AbortError'));
        }
        if (isDynamicSpaRoute(cleanU.pathname)) {
          origPushState.call(history, null, '', targetHref);
          setTimeout(checkAndRenderDynamicPage, 10);
          return new Promise(() => {});
        } else if (cleanU.pathname !== window.location.pathname || cleanU.search !== window.location.search) {
          window.location.assign(targetHref);
          return new Promise(() => {});
        }
      } catch (_) {}
      return Promise.reject(new DOMException('RSC skipped', 'AbortError'));
    }

    return ORIG_FETCH(input, init);
  };

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._xhzMethod = method;
    this._xhzUrl = typeof url === 'string' ? rewriteMediaUrl(url) : url;
    return ORIG_XHR_OPEN.call(this, method, this._xhzUrl, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this._xhzUrl && isApiUrl(String(this._xhzUrl))) {
      const fullUrl = String(this._xhzUrl).startsWith('/')
        ? window.location.origin + this._xhzUrl
        : String(this._xhzUrl);
      handleApiRequest(fullUrl, { method: this._xhzMethod || 'GET', body })
        .then(r => r.text())
        .then(txt => {
          let parsed = txt;
          if (this.responseType === 'json') {
            try { parsed = JSON.parse(txt); } catch (_) {}
          }
          Object.defineProperty(this, 'status', { value: 200, configurable: true });
          Object.defineProperty(this, 'statusText', { value: 'OK', configurable: true });
          Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
          Object.defineProperty(this, 'responseText', { value: txt, configurable: true });
          Object.defineProperty(this, 'response', { value: parsed, configurable: true });
          Object.defineProperty(this, 'responseURL', { value: fullUrl, configurable: true });
          this.getAllResponseHeaders = () => 'content-type: application/json; charset=utf-8\r\n';
          this.getResponseHeader = name =>
            String(name || '').toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null;
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(new Event('load'));
          this.dispatchEvent(new Event('loadend'));
        });
      return;
    }
    return ORIG_XHR_SEND.call(this, body);
  };

  const OrigAudio = window.Audio;
  window.Audio = function (src) {
    return new OrigAudio(src ? rewriteMediaUrl(src) : src);
  };
  window.Audio.prototype = OrigAudio.prototype;

  function rewriteDomMedia(root = document) {
    if (!root || !root.querySelectorAll) return;
    const els = root.querySelectorAll('img[src], audio[src], video[src], source[src]');
    els.forEach(el => {
      const raw = el.getAttribute('src');
      if (raw && (raw.includes('static.xiehanzi.com') || raw.includes('audio.xiehanzi.com'))) {
        el.setAttribute('src', rewriteMediaUrl(raw));
      }
    });
  }

  // ============================================================================
  // 6. HYDRATE / RENDER ALL DYNAMIC SUB-PAGES
  // ============================================================================
  function getMainContentContainer() {
    let customRoot = document.getElementById('xhz-dynamic-page-root');
    const main = document.querySelector('main');
    if (main) {
      main.style.display = 'none';
    }
    if (!customRoot || !customRoot.isConnected) {
      customRoot = document.createElement('div');
      customRoot.id = 'xhz-dynamic-page-root';
      customRoot.className = 'mx-auto max-w-5xl px-4 py-8';
      customRoot.style.color = 'inherit';
      if (main && main.parentNode) {
        main.parentNode.insertBefore(customRoot, main);
      } else {
        document.body.appendChild(customRoot);
      }
    }
    customRoot.style.color = 'inherit';
    customRoot.style.width = '100%';
    customRoot.style.boxSizing = 'border-box';
    customRoot.style.minWidth = '0';
    return customRoot;
  }

  function restoreOriginalMainIfStatic() {
    const customRoot = document.getElementById('xhz-dynamic-page-root');
    if (customRoot) {
      customRoot.remove();
    }
    const runnerRoot = document.getElementById('xhz-lesson-runner-root');
    if (runnerRoot) {
      runnerRoot.remove();
    }
    if (window.__xhzLessonKeydownHandler) {
      window.removeEventListener('keydown', window.__xhzLessonKeydownHandler);
      window.__xhzLessonKeydownHandler = null;
    }
    const main = document.querySelector('main');
    if (main) {
      main.style.display = '';
    }
    document.body.style.overflow = '';
  }

  function playPronunciation(text, audioUrl, rate) {
    const speakFallback = () => {
      if ('speechSynthesis' in window && text) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'zh-CN';
          u.rate = rate ? Math.min(1, Math.max(0.5, rate)) : 0.9;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    };
    if (audioUrl && !audioUrl.includes('media-signed/tts/')) {
      try {
        const a = new window.Audio(rewriteMediaUrl(audioUrl));
        if (rate) a.playbackRate = rate;
        a.play().catch(speakFallback);
        return;
      } catch (_) {
        speakFallback();
        return;
      }
    }
    if (text && /^[\u4e00-\u9fff]{1,4}$/.test(text.trim())) {
      try {
        const a = new window.Audio(rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(text.trim())}.mp3`));
        if (rate) a.playbackRate = rate;
        a.play().catch(speakFallback);
        return;
      } catch (_) {}
    }
    speakFallback();
  }
  window.__xhzPlayAudio = playPronunciation;

  // --------------------------------------------------------------------------
  // 6.1. Trang Chi Tiết Chữ Hán (/han-tu/:slug)
  // --------------------------------------------------------------------------
  async function renderCharacterDetailPage(slug) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải dữ liệu chữ Hán...</div>`;
    const data = await lookupCharacter(slug);
    if (!data) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy chữ Hán cho "${escapeHtml(decodeURIComponent(slug))}". <a href="/tra-chu" style="text-decoration:underline;margin-left:8px;">Quay lại Từ điển</a></div>`;
      return;
    }
    const ch = data.character || data.c || extractHanziChar(slug);
    const pinyin = (Array.isArray(data.pinyins) && data.pinyins.join(', ')) || data.pinyin || data.p || '';
    const hanviet = data.hanvietReading || data.hv || '';
    const meaning = data.meaningVi || data.m || '';
    const radical = data.radical || data.r || '';
    const strokes = data.strokeCount || data.s || '';
    const hsk = data.hskLevel || data.hsk || '';
    const decomposition = data.decomposition || '';
    const etymology = (data.etymology && (data.etymology.hintVi || data.etymology.hint)) || data.mnemonic || '';
    const commonWords = Array.isArray(data.commonWords) ? data.commonWords : [];
    const components = Array.isArray(data.components) ? data.components : [];
    const audioSrc = rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${ch}.mp3`);

    document.title = `Chữ ${ch} (${pinyin} - ${hanviet}) | XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/tra-chu" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại Từ điển</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid #f5f5f4;padding:16px;">
          <div id="xhz-hanzi-writer-target" style="width:200px;height:200px;background:#fafaf9;border:2px dashed #d6d3d1;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:110px;font-family:'Noto Serif SC',serif;color:#1c1917;">
            ${ch}
          </div>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;justify-content:center;">
            <button id="xhz-btn-speak" style="padding:8px 16px;border-radius:999px;background:#ea580c;color:#fff;border:none;font-weight:600;cursor:pointer;">🔊 Phát âm</button>
            <button id="xhz-btn-animate" style="padding:8px 16px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:600;cursor:pointer;">✍️ Xem thứ tự nét</button>
            <button id="xhz-btn-quiz-stroke" style="padding:8px 16px;border-radius:999px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;font-weight:600;cursor:pointer;">🎯 Tập viết chữ</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span style="font-size:36px;font-weight:800;color:#1c1917;">${ch}</span>
            <span style="font-size:22px;color:#ea580c;font-weight:700;">[${pinyin}]</span>
            ${hanviet ? `<span style="padding:4px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;font-weight:700;text-transform:uppercase;">Hán Việt: ${hanviet}</span>` : ''}
            ${hsk ? `<span style="padding:4px 10px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:600;font-size:13px;">HSK ${hsk}</span>` : ''}
          </div>
          <div style="font-size:18px;color:#292524;line-height:1.6;">
            <strong>Nghĩa tiếng Việt:</strong> ${meaning || 'Đang cập nhật'}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:8px;">
            <div style="background:#fafaf9;padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;">
              <div style="font-size:12px;color:#78716c;">Bộ thủ</div>
              <div style="font-size:18px;font-weight:700;color:#1c1917;">${radical || '—'}</div>
            </div>
            <div style="background:#fafaf9;padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;">
              <div style="font-size:12px;color:#78716c;">Số nét</div>
              <div style="font-size:18px;font-weight:700;color:#1c1917;">${strokes || '—'} nét</div>
            </div>
            <div style="background:#fafaf9;padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;">
              <div style="font-size:12px;color:#78716c;">Cấu trúc</div>
              <div style="font-size:16px;font-weight:700;color:#1c1917;">${decomposition || 'Đơn thể / Hợp thể'}</div>
            </div>
          </div>
          ${etymology ? `<div style="margin-top:8px;padding:12px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;color:#78350f;font-size:15px;">💡 <strong>Gợi ý ghi nhớ / Nguồn gốc:</strong> ${etymology}</div>` : ''}
        </div>
      </div>

      ${components.length > 0 ? `
      <div style="margin-top:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1c1917;">🧩 Thành phần cấu tạo</h3>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${components.map(c => {
            const compChar = typeof c === 'string' ? c : (c.character || c.component || '');
            const compMean = typeof c === 'object' ? (c.meaningVi || c.pinyin || '') : '';
            return `<a href="/han-tu/${encodeURIComponent(compChar)}" style="padding:10px 16px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-weight:600;">${compChar} ${compMean ? `<span style="color:#78716c;font-weight:400;">(${compMean})</span>` : ''}</a>`;
          }).join('')}
        </div>
      </div>` : ''}

      ${commonWords.length > 0 ? `
      <div style="margin-top:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1c1917;">📚 Từ ghép thông dụng chứa "${ch}" (${commonWords.length})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
          ${commonWords.slice(0, 24).map(w => {
            const wHz = w.word || w.hanzi || '';
            const wPy = w.pinyin || '';
            const wMean = w.meaningVi || w.meaning || '';
            return `<a href="/tu-vung/${encodeURIComponent(wHz)}" style="display:block;padding:12px 16px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:20px;font-weight:700;color:#1c1917;">${wHz}</span>
                <span style="font-size:14px;color:#ea580c;font-weight:600;">${wPy}</span>
              </div>
              <div style="font-size:14px;color:#57534e;margin-top:4px;">${wMean}</div>
            </a>`;
          }).join('')}
        </div>
      </div>` : ''}
    `;

    const speakBtn = document.getElementById('xhz-btn-speak');
    if (speakBtn) speakBtn.onclick = () => playPronunciation(ch, audioSrc);

    const initWriter = () => {
      if (!window.HanziWriter) return;
      const target = document.getElementById('xhz-hanzi-writer-target');
      if (!target) return;
      target.innerHTML = '';
      const writer = window.HanziWriter.create(target, ch, {
        width: 190,
        height: 190,
        padding: 10,
        showOutline: true,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 180,
        strokeColor: '#1c1917',
        radicalColor: '#ea580c'
      });
      const animBtn = document.getElementById('xhz-btn-animate');
      if (animBtn) animBtn.onclick = () => writer.animateCharacter();
      const quizBtn = document.getElementById('xhz-btn-quiz-stroke');
      if (quizBtn) quizBtn.onclick = () => writer.quiz();
    };

    if (window.HanziWriter) {
      initWriter();
    } else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js';
      s.onload = initWriter;
      document.head.appendChild(s);
    }
  }

  // --------------------------------------------------------------------------
  // 6.2. Trang Chi Tiết Từ Vựng (/tu-vung/:slug)
  // --------------------------------------------------------------------------
  async function renderVocabularyDetailPage(slug) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải dữ liệu từ vựng...</div>`;
    const data = await lookupWord(slug);
    if (!data) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy từ vựng "${escapeHtml(decodeURIComponent(slug))}". <a href="/tra-chu" style="text-decoration:underline;">Quay lại Từ điển</a></div>`;
      return;
    }
    const word = data.word || data.hanzi || decodeURIComponent(slug);
    const pinyin = data.wordPinyin || (Array.isArray(data.pinyins) && data.pinyins.join(', ')) || data.pinyin || '';
    const hanviet = data.hanViet || data.hanviet || '';
    const meaning =
      data.meaningVi ||
      data.wordMeaningVi ||
      data.translationVi ||
      (Array.isArray(data.meanings) && data.meanings.join('; ')) ||
      '';
    const pos = data.partOfSpeechVi || data.partOfSpeech || '';
    const usageNote = data.usageNote || '';
    const hsk = data.hskLevel || '';
    const examples = Array.isArray(data.examples) ? data.examples : [];
    const commonWords = Array.isArray(data.commonWords) ? data.commonWords : [];
    const chars = Array.from(word).filter(c => /[\u4e00-\u9fff]/.test(c));
    const audioUrl = rewriteMediaUrl(
      (Array.isArray(data.audios) && data.audios[0]) ||
        data.audioUrl ||
        `https://static.xiehanzi.com/word_audios/${encodeURIComponent(word)}.mp3`
    );

    document.title = `Từ vựng ${word} (${pinyin}) - ${meaning} | XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/tra-chu" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại Từ điển</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
              <h1 style="font-size:44px;font-weight:800;margin:0;color:#1c1917;font-family:'Noto Serif SC',serif;">${word}</h1>
              ${pinyin ? `<span style="font-size:24px;color:#ea580c;font-weight:700;">[${pinyin}]</span>` : ''}
              ${hanviet ? `<span style="padding:4px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;font-weight:700;text-transform:uppercase;">${hanviet}</span>` : ''}
              ${pos ? `<span style="padding:4px 12px;border-radius:999px;background:#f5f5f4;color:#57534e;font-weight:700;font-size:13px;">${pos}</span>` : ''}
              ${hsk ? `<span style="padding:4px 12px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:700;">HSK ${hsk}</span>` : ''}
            </div>
            <div style="font-size:20px;color:#292524;margin-top:12px;line-height:1.5;">
              <strong>Nghĩa:</strong> ${meaning || 'Đang cập nhật'}
            </div>
            ${usageNote ? `<div style="margin-top:10px;padding:10px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;font-size:14px;line-height:1.5;">💡 <strong>Cách dùng:</strong> ${usageNote}</div>` : ''}
          </div>
          <button id="xhz-word-speak" style="padding:10px 20px;border-radius:999px;background:#ea580c;color:#fff;border:none;font-weight:700;cursor:pointer;font-size:15px;">🔊 Nghe phát âm</button>
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:16px;font-weight:700;color:#57534e;margin-bottom:10px;">Chiết tự từng chữ Hán:</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${chars.map(c => `<a href="/han-tu/${encodeURIComponent(c)}" style="padding:10px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;text-decoration:none;color:#1c1917;font-weight:700;font-size:20px;">${c} → Xem nét viết</a>`).join('')}
          </div>
        </div>

        ${commonWords.length > 0 ? `
        <div style="margin-top:22px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:17px;font-weight:700;color:#1c1917;margin-bottom:10px;">🔗 Từ ghép & cụm từ thông dụng (${commonWords.length})</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;">
            ${commonWords.slice(0, 12).map(cw => {
              const cwHz = cw.hanzi || cw.word || '';
              const cwPy = cw.pinyin || '';
              const cwVi = cw.meaningVi || cw.meaning || '';
              return `<a href="/tu-vung/${encodeURIComponent(cwHz)}" style="padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:18px;font-weight:800;font-family:'Noto Serif SC',serif;">${cwHz}</span>
                  <span style="font-size:13px;color:#ea580c;font-weight:700;">${cwPy}</span>
                </div>
                <div style="font-size:13px;color:#57534e;margin-top:4px;">${cwVi}</div>
              </a>`;
            }).join('')}
          </div>
        </div>` : ''}

        ${examples.length > 0 ? `
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:12px;">💬 Ví dụ mẫu câu (${examples.length})</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${examples.map(ex => {
              const zh = (ex.chinese || ex.hanzi || ex.zh || '').replace(/\{|\}/g, '');
              const py = ex.pinyin || '';
              const vi = ex.vietnamese || ex.meaningVi || ex.vi || '';
              return `<div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:18px;font-weight:700;color:#1c1917;">${zh}</div>
                  <div style="font-size:14px;color:#ea580c;margin-top:2px;">${py}</div>
                  <div style="font-size:15px;color:#44403c;margin-top:4px;">${vi}</div>
                </div>
                <button onclick="window.__xhzPlayAudio('${zh.replace(/'/g, '')}')" style="padding:6px 14px;border-radius:999px;background:#ffedd5;color:#9a3412;border:1px solid #fed7aa;font-weight:700;cursor:pointer;font-size:13px;">🔊 Nghe</button>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      </div>
    `;
    const btn = document.getElementById('xhz-word-speak');
    if (btn) btn.onclick = () => playPronunciation(word, audioUrl);
  }

  // --------------------------------------------------------------------------
  // 6.3. Trang Hán Việt (/han-viet và /han-viet/:slug)
  // --------------------------------------------------------------------------
  async function renderHanVietIndexPage() {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải danh mục âm Hán Việt...</div>`;
    const index = (await loadLocalJson('/data/han-viet/index.json')) || [];
    document.title = `Từ điển Âm Hán Việt (${index.length} âm đọc) | XieHanzi`;

    root.innerHTML = `
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">📖 Tra cứu Âm Hán Việt (${index.length} âm đọc)</h1>
        <p style="color:#57534e;margin-bottom:16px;">Chọn một âm Hán Việt bên dưới hoặc nhập để lọc nhanh các chữ Hán đồng âm Hán Việt.</p>
        <input id="xhz-hv-filter" type="text" placeholder="Nhập âm Hán Việt (ví dụ: nhân, tâm, học, quốc...)" style="width:100%;max-width:420px;padding:10px 16px;border-radius:12px;border:1px solid #d6d3d1;font-size:16px;margin-bottom:20px;color:#1c1917;background:#fff;" />
        <div id="xhz-hv-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;"></div>
      </div>
    `;

    const grid = document.getElementById('xhz-hv-grid');
    const input = document.getElementById('xhz-hv-filter');
    const renderItems = (q = '') => {
      const norm = q.trim().toLowerCase();
      const normalizedList = index.map(x => typeof x === 'string' ? { slug: x, reading: x.replace(/-/g, ' ') } : x);
      const filtered = norm
        ? normalizedList.filter(x => (x.reading || '').toLowerCase().includes(norm) || (x.slug || '').includes(norm))
        : normalizedList.slice(0, 300);
      grid.innerHTML = filtered.map(item => `
        <a href="/han-viet/${encodeURIComponent(item.slug)}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:10px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-weight:700;">
          <span style="text-transform:capitalize;">${item.reading}</span>
          <span style="font-size:12px;color:#ea580c;">→</span>
        </a>
      `).join('');
    };
    renderItems();
    if (input) input.oninput = e => renderItems(e.target.value);
  }

  async function renderHanVietDetailPage(slug) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải âm Hán Việt...</div>`;
    const data = await lookupHanViet(slug);
    if (!data) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy âm Hán Việt "${escapeHtml(decodeURIComponent(slug))}". <a href="/han-viet">Xem toàn bộ danh sách</a></div>`;
      return;
    }
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const reading = data.reading || (groups[0] && groups[0].reading) || decodeURIComponent(slug).replace(/-/g, ' ');
    const flatChars = groups.length > 0
      ? groups.flatMap(g => Array.isArray(g.chars) ? g.chars : (Array.isArray(g.characters) ? g.characters : []))
      : (Array.isArray(data.characters) ? data.characters : (data.sampleChars || []));
    document.title = `Âm Hán Việt "${reading.toUpperCase()}" (${flatChars.length} chữ) | XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/han-viet" style="color:#ea580c;font-weight:600;text-decoration:none;">← Danh sách Âm Hán Việt</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">Âm Hán Việt: <span style="color:#ea580c;text-transform:uppercase;">${reading}</span> (${flatChars.length} chữ Hán)</h1>
        <p style="color:#57534e;margin:0 0 20px 0;">Nhấn vào bất kỳ chữ Hán nào bên dưới để xem thứ tự nét viết, chiết tự và từ ghép thông dụng.</p>
        ${groups.length > 0 ? groups.map(g => {
          const gChars = Array.isArray(g.chars) ? g.chars : (Array.isArray(g.characters) ? g.characters : []);
          const gWords = Array.isArray(g.words) ? g.words : [];
          return `
          <div style="margin-bottom:24px;">
            <div style="font-size:15px;font-weight:800;color:#9a3412;background:#fff7ed;border:1px solid #fed7aa;display:inline-block;padding:5px 14px;border-radius:999px;margin-bottom:12px;">
              Âm đọc: ${(g.reading || g.pinyin || reading).toUpperCase()} (${gChars.length} chữ Hán${gWords.length ? ` · ${gWords.length} từ ghép` : ''})
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;">
              ${gChars.map(c => {
                const hz = c.hanzi || c.character || c.c || '';
                const cWords = Array.isArray(c.words) ? c.words.slice(0, 3) : [];
                return `
                <a href="/han-tu/${encodeURIComponent(hz)}" style="padding:14px 16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:34px;font-weight:800;color:#1c1917;font-family:'Noto Serif SC',serif;">${hz}</span>
                    <div style="text-align:right;">
                      <div style="color:#ea580c;font-weight:800;font-size:15px;">${c.pinyin || g.pinyin || ''}</div>
                      ${c.hskLevel ? `<span style="font-size:11px;padding:1px 6px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-weight:700;">HSK ${c.hskLevel}</span>` : ''}
                    </div>
                  </div>
                  <div style="font-size:14px;color:#292524;margin-top:8px;line-height:1.4;font-weight:600;">${c.meaningVi || c.m || ''}</div>
                  ${cWords.length > 0 ? `<div style="font-size:12px;color:#78716c;margin-top:6px;">Từ ghép: ${cWords.map(w => `${w.hanzi} (${w.hanviet || w.meaningVi || ''})`).join(', ')}</div>` : ''}
                </a>
              `;
              }).join('')}
            </div>
          </div>
        `;
        }).join('') : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
            ${flatChars.map(c => {
              if (typeof c === 'string') {
                return `<a href="/han-tu/${encodeURIComponent(c)}" style="padding:14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-size:24px;font-weight:700;text-align:center;">${c}</a>`;
              }
              return `<a href="/han-tu/${encodeURIComponent(c.character || c.c)}" style="padding:14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:28px;font-weight:800;color:#1c1917;">${c.character || c.c}</span>
                  <span style="color:#ea580c;font-weight:700;">${c.pinyin || c.p || ''}</span>
                </div>
                <div style="font-size:14px;color:#57534e;margin-top:6px;">${c.meaningVi || c.m || ''}</div>
              </a>`;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6.4. Trang Chi Tiết Ngữ Pháp (/ngu-phap/:level/:pointId)
  // --------------------------------------------------------------------------
  async function renderGrammarDetailPage(levelSlug, pointId) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải chủ điểm ngữ pháp...</div>`;
    const lvlNum = (levelSlug.match(/\d+/) || ['1'])[0];
    const isNew = levelSlug.includes('new') || pointId.startsWith('new-');
    const file = isNew ? `/data/grammar/new-hsk-level-${lvlNum}.json` : `/data/grammar/hsk-level-${lvlNum}.json`;
    let data = await loadLocalJson(file);
    let item = data && Array.isArray(data.items) ? data.items.find(x => x.id === pointId || x.code === pointId) : null;
    if (!item) {
      const altData = await loadLocalJson(isNew ? `/data/grammar/hsk-level-${lvlNum}.json` : `/data/grammar/new-hsk-level-${lvlNum}.json`);
      item = altData && Array.isArray(altData.items) ? altData.items.find(x => x.id === pointId || x.code === pointId) : null;
    }
    if (!item && data && Array.isArray(data.items)) {
      item = data.items[0];
    }
    if (!item) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy chủ điểm ngữ pháp "${pointId}". <a href="/ngu-phap">Quay lại Ngữ pháp</a></div>`;
      return;
    }

    const title = item.title || item.topic || item.name || pointId;
    const syntax = item.pattern || item.grammar_syntax || '';
    const explanation = item.explanation || item.grammar_explanation || item.summary || '';
    const tips = Array.isArray(item.grammar_tips) ? item.grammar_tips : [];
    const attentions = Array.isArray(item.grammar_attentions) ? item.grammar_attentions : [];
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    document.title = `${title} - Ngữ pháp ${item.level || levelSlug.toUpperCase()} | XieHanzi`;
    const examples = Array.isArray(item.example) ? item.example : (Array.isArray(item.examples) ? item.examples : []);

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/ngu-phap" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại Thư viện Ngữ pháp</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:28px;">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <span style="padding:4px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;font-weight:700;font-size:13px;">${(item.level || levelSlug).toUpperCase()}</span>
          ${item.type || item.category ? `<span style="padding:4px 12px;border-radius:999px;background:#f5f5f4;color:#57534e;font-size:13px;font-weight:600;">${item.type || item.category}</span>` : ''}
          ${keywords.map(kw => `<span style="padding:4px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-weight:700;font-size:13px;">Từ khoá: ${kw}</span>`).join('')}
        </div>
        <h1 style="font-size:30px;font-weight:800;color:#1c1917;margin:0 0 14px 0;">${title}</h1>
        ${syntax ? `<div style="padding:14px 18px;background:#fff7ed;border-left:4px solid #ea580c;border-radius:10px;font-size:17px;font-weight:700;color:#9a3412;margin-bottom:16px;white-space:pre-line;">📐 Cấu trúc:\n${syntax}</div>` : ''}
        <div style="font-size:16px;line-height:1.75;color:#292524;margin-bottom:20px;white-space:pre-line;">
          ${explanation}
        </div>
        ${tips.length > 0 ? `
          <div style="margin-bottom:18px;padding:14px 18px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;">
            <div style="font-weight:800;margin-bottom:6px;">💡 Mẹo ghi nhớ & Cách dùng:</div>
            <ul style="margin:0;padding-left:20px;line-height:1.6;">
              ${tips.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${attentions.length > 0 ? `
          <div style="margin-bottom:18px;padding:14px 18px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;">
            <div style="font-weight:800;margin-bottom:6px;">⚠️ Lưu ý quan trọng:</div>
            <ul style="margin:0;padding-left:20px;line-height:1.6;">
              ${attentions.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:12px;">💬 Ví dụ minh họa (${examples.length})</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${examples.map(ex => {
            const zh = (ex.chinese || ex.hanzi || '').replace(/\{|\}/g, '');
            return `
              <div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:19px;font-weight:700;color:#1c1917;">${zh}</div>
                  <div style="font-size:14px;color:#ea580c;margin-top:3px;">${ex.pinyin || ''}</div>
                  <div style="font-size:15px;color:#44403c;margin-top:4px;">${ex.vietnamese || ex.meaningVi || ''}</div>
                </div>
                <button onclick="window.__xhzPlayAudio('${zh.replace(/'/g, '')}')" style="padding:6px 14px;border-radius:999px;background:#ffedd5;color:#9a3412;border:1px solid #fed7aa;font-weight:700;cursor:pointer;font-size:13px;">🔊 Nghe câu</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6.5. Trang Làm Bài Kiểm Tra Ngữ Pháp (/kiem-tra-ngu-phap/lam-bai)
  //      Chuẩn 1:1 theo giao diện gốc xiehanzi.com
  // --------------------------------------------------------------------------
  async function renderGrammarQuizRunPage(searchParams) {
    let root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tạo đề kiểm tra ngữ pháp...</div>`;

    const tracksParam = (searchParams.get('tracks') || 'new-hsk1').split(',').filter(Boolean);
    const grammarId = searchParams.get('grammarId') || '';
    const count = Math.max(1, Math.min(100, Number(searchParams.get('count')) || 20));
    const typesParam = (searchParams.get('types') || 'mcq,translate_zh_vi,translate_vi_zh').split(',').filter(Boolean);

    let allQuestions = [];
    for (const tr of tracksParam) {
      const cleanTrack = tr.replace(/^new-hsk-(\d+)$/, 'new-hsk$1').replace(/^hsk-(\d+)$/, 'hsk$1');
      const qData = await loadLocalJson(`/data/grammar/quiz-${cleanTrack}.json`);
      if (qData && Array.isArray(qData.questions)) {
        allQuestions.push(...qData.questions.filter(q => typesParam.includes(q.type)));
      }
    }
    let grammarPoint = null;
    if (grammarId) {
      allQuestions = allQuestions.filter(question => question.grammarId === grammarId);
      const grammarLevel = (grammarId.match(/\d+/) || ['1'])[0];
      const grammarIsNew = /_new_|^new-/.test(grammarId);
      const grammarData = await loadLocalJson(`/data/grammar/${grammarIsNew ? 'new-hsk' : 'hsk'}-level-${grammarLevel}.json`);
      grammarPoint = grammarData && Array.isArray(grammarData.items) ? grammarData.items.find(item => item.id === grammarId) : null;
      if (!grammarPoint) {
        root.innerHTML = `<h1>Không tìm thấy chủ điểm ngữ pháp</h1><p>${escapeHtml(grammarId)}</p><a href="/ngu-phap">Quay lại ngữ pháp</a>`;
        return;
      }
      for (const [index, example] of (grammarPoint.example || []).entries()) {
        if (!example.chinese || !example.vietnamese) continue;
        for (const type of ['translate_zh_vi', 'translate_vi_zh']) {
          if (!typesParam.includes(type)) continue;
          const prompt = type === 'translate_zh_vi' ? example.chinese : example.vietnamese;
          if (allQuestions.some(question => question.type === type && question.prompt === prompt)) continue;
          allQuestions.push({ questionId: `${grammarId}_example_${index}_${type}`, grammarId, type, prompt,
            answer: type === 'translate_zh_vi' ? example.vietnamese : example.chinese,
            explanation: grammarPoint.grammar_explanation || '' });
        }
      }
    }
    if (allQuestions.length === 0 && !grammarId) {
      const fallback = await loadLocalJson('/data/grammar/quiz-new-hsk1.json');
      if (fallback && Array.isArray(fallback.questions)) {
        allQuestions = fallback.questions;
      }
    }
    const questions = allQuestions.slice(0, count);
    document.title = `${grammarPoint ? `Luyện tập: ${grammarPoint.topic}` : 'Kiểm tra ngữ pháp'} (${questions.length} câu) | XieHanzi`;
    root = getMainContentContainer();

    root.innerHTML = `
      <style>
        .xhz-gq-shell { margin: -24px -16px 0 -16px; background: #edeae2; min-height: calc(100vh - 64px); padding-bottom: 48px; color: #1c1917; font-family: inherit; }
        .xhz-gq-topbar { position: sticky; top: 0; z-index: 35; background: rgba(245, 242, 235, 0.96); backdrop-filter: blur(8px); border-bottom: 1px solid #dfd9cd; padding: 12px 24px; }
        .xhz-gq-topbar-inner { max-width: 1120px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .xhz-gq-body { max-width: 1120px; margin: 24px auto 0; padding: 0 20px; display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 24px; align-items: start; }
        @media (max-width: 900px) {
          .xhz-gq-body { grid-template-columns: 1fr; }
          .xhz-gq-sidebar { position: static !important; order: -1; }
        }
        .xhz-gq-qcard { background: #f5f2eb; border: 1px solid #e2ddd2; border-radius: 18px; padding: 22px 24px; box-shadow: 0 2px 8px rgba(28, 25, 23, 0.03); scroll-margin-top: 84px; transition: border-color 0.2s; }
        .xhz-gq-qcard.is-active { border-color: #d6cfc2; }
        .xhz-gq-opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
        @media (max-width: 640px) {
          .xhz-gq-opts { grid-template-columns: 1fr; }
        }
        .xhz-gq-opt { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; border: 1px solid #dfd9cd; background: #faf8f4; color: #1c1917; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; transition: all 0.15s; }
        .xhz-gq-opt:hover { border-color: #b91c1c; background: #fff; }
        .xhz-gq-opt-letter { width: 26px; height: 26px; border-radius: 999px; border: 1px solid #d0c9bc; background: #f5f2eb; color: #57534e; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .xhz-gq-opt.is-selected { border-color: #b91c1c; background: #fef2f2; color: #7f1d1d; font-weight: 700; }
        .xhz-gq-opt.is-selected .xhz-gq-opt-letter { background: #b91c1c; border-color: #b91c1c; color: #fff; }
        .xhz-gq-opt.is-correct { border-color: #16a34a !important; background: #dcfce7 !important; color: #14532d !important; font-weight: 700; }
        .xhz-gq-opt.is-correct .xhz-gq-opt-letter { background: #16a34a !important; border-color: #16a34a !important; color: #fff !important; }
        .xhz-gq-opt.is-wrong { border-color: #dc2626 !important; background: #fee2e2 !important; color: #7f1d1d !important; }
        .xhz-gq-opt.is-wrong .xhz-gq-opt-letter { background: #dc2626 !important; border-color: #dc2626 !important; color: #fff !important; }
        .xhz-gq-nav-btn { height: 36px; border-radius: 10px; border: 1.5px solid transparent; background: #dfd9cd; color: #44403c; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.15s; }
        .xhz-gq-nav-btn:hover { opacity: 0.9; }
        .xhz-gq-nav-btn.is-current { border-color: #b91c1c; background: #efeae0; color: #1c1917; }
        .xhz-gq-nav-btn.is-answered { background: #b91c1c; color: #fff; }
        .xhz-gq-nav-btn.is-flagged::after { content: ''; position: absolute; top: -3px; right: -3px; width: 9px; height: 9px; border-radius: 999px; background: #d97706; border: 1.5px solid #f5f2eb; }
      </style>
      <div class="xhz-gq-shell">
        ${grammarPoint ? `<div style="max-width:1120px;margin:auto;padding:20px;"><a href="/ngu-phap/${/_new_|^new-/.test(grammarId) ? 'new-hsk-' : ''}${(grammarId.match(/\d+/) || ['1'])[0]}/${encodeURIComponent(grammarId)}">← Xem lý thuyết</a><h1 style="font-size:24px;font-weight:800;margin:12px 0;">Luyện tập: ${escapeHtml(grammarPoint.topic)}</h1><p>${questions.length} câu hỏi từ chủ điểm này và các ví dụ có trong dữ liệu.</p></div>` : ''}
        <div class="xhz-gq-topbar">
          <div class="xhz-gq-topbar-inner">
            <div style="display:flex;align-items:center;gap:18px;">
              <a href="/kiem-tra-ngu-phap" style="display:inline-flex;align-items:center;gap:6px;color:#57534e;font-size:14px;font-weight:600;text-decoration:none;">
                <span style="font-size:16px;">‹</span> Thoát
              </a>
              <div>
                <div style="font-size:15px;font-weight:800;color:#1c1917;line-height:1.2;">Kiểm tra ngữ pháp</div>
                <div id="xhz-gq-answered-sub" style="font-size:12px;color:#78716c;margin-top:2px;">Đã trả lời 0/${questions.length}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <button id="xhz-gq-fullscreen" title="Toàn màn hình" style="width:36px;height:36px;border-radius:999px;border:1px solid #d6cfc2;background:#f5f2eb;color:#44403c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;">⤢</button>
              <button id="xhz-gq-submit" style="padding:8px 20px;border-radius:999px;border:none;background:#b91c1c;color:#fff;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 2px 6px rgba(185,28,28,0.25);">Nộp bài</button>
            </div>
          </div>
        </div>

        <div id="xhz-gq-result-banner" style="display:none;max-width:1120px;margin:20px auto 0;padding:0 20px;"></div>

        <div class="xhz-gq-body">
          <div id="xhz-gq-list" style="display:flex;flex-direction:column;gap:18px;"></div>
          <div class="xhz-gq-sidebar" style="position:sticky;top:76px;background:#f5f2eb;border:1px solid #e2ddd2;border-radius:18px;padding:18px;">
            <div style="font-size:14px;font-weight:800;color:#1c1917;margin-bottom:12px;">Câu hỏi</div>
            <div id="xhz-gq-nav-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;"></div>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e5e0d5;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#57534e;">
              <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:3px;background:#b91c1c;display:inline-block;"></span> Đã trả lời</div>
              <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:3px;background:#dfd9cd;display:inline-block;"></span> Chưa trả lời</div>
              <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:999px;background:#d97706;display:inline-block;"></span> Đã đánh dấu</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const listEl = document.getElementById('xhz-gq-list');
    const navGridEl = document.getElementById('xhz-gq-nav-grid');
    const answeredSub = document.getElementById('xhz-gq-answered-sub');
    const submitBtn = document.getElementById('xhz-gq-submit');
    const fsBtn = document.getElementById('xhz-gq-fullscreen');
    const resultBanner = document.getElementById('xhz-gq-result-banner');

    let currentIdx = 0;
    let isSubmitted = false;
    const userAnswers = {};
    const flaggedSet = new Set();
    const navButtons = [];
    const cardEls = [];

    if (fsBtn) {
      fsBtn.onclick = () => {
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        } catch (_) {}
      };
    }

    const syncNavAndStatus = () => {
      const ansCount = Object.keys(userAnswers).length;
      if (answeredSub) {
        answeredSub.textContent = isSubmitted
          ? `Đã nộp bài • Đạt ${ countCorrect() }/${questions.length} câu đúng`
          : `Đã trả lời ${ansCount}/${questions.length}`;
      }
      navButtons.forEach((nb, i) => {
        nb.classList.toggle('is-current', i === currentIdx);
        nb.classList.toggle('is-answered', userAnswers[i] !== undefined && String(userAnswers[i]).trim() !== '');
        nb.classList.toggle('is-flagged', flaggedSet.has(i));
      });
    };

    const countCorrect = () => {
      let c = 0;
      questions.forEach((q, i) => {
        if (q.type === 'mcq') {
          const rightKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));
          if (userAnswers[i] === rightKey) c++;
        } else if (userAnswers[i] && String(userAnswers[i]).trim().length > 0) {
          c++;
        }
      });
      return c;
    };

    questions.forEach((q, idx) => {
      const nb = document.createElement('button');
      nb.type = 'button';
      nb.className = 'xhz-gq-nav-btn' + (idx === 0 ? ' is-current' : '');
      nb.textContent = String(idx + 1);
      nb.onclick = () => {
        currentIdx = idx;
        syncNavAndStatus();
        if (cardEls[idx]) {
          cardEls[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      navGridEl.appendChild(nb);
      navButtons.push(nb);

      const card = document.createElement('div');
      card.className = 'xhz-gq-qcard' + (idx === 0 ? ' is-active' : '');
      cardEls.push(card);

      const typeLabel =
        q.type === 'mcq'
          ? 'Trắc nghiệm'
          : q.type === 'translate_zh_vi'
          ? 'Dịch Trung → Việt'
          : 'Dịch Việt → Trung';

      const stemText = q.prompt || q.stem || '';
      const hintText = q.vietnameseHint ? ` (${q.vietnameseHint})` : '';

      const topRowHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:28px;height:28px;border-radius:999px;background:#f9dada;color:#b91c1c;font-weight:800;font-size:13px;display:inline-flex;align-items:center;justify-content:center;">${idx + 1}</span>
            <span style="font-size:13px;color:#78716c;font-weight:600;">${typeLabel}</span>
          </div>
          <button type="button" class="xhz-gq-flag-btn" title="Đánh dấu câu hỏi" style="width:36px;height:36px;border-radius:10px;border:1px solid #dfd9cd;background:#faf8f4;color:#78716c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </button>
        </div>
      `;

      if (q.type === 'mcq') {
        card.innerHTML = `
          ${topRowHtml}
          <div style="font-size:20px;font-weight:700;color:#1c1917;margin-top:10px;line-height:1.55;font-family:'Noto Serif SC',system-ui,sans-serif;">
            ${stemText}<span style="font-weight:600;color:#292524;">${hintText}</span>
          </div>
          ${q.pinyin || q.stemPinyin ? `<div style="font-size:13px;color:#78716c;margin-top:2px;">${q.pinyin || q.stemPinyin}</div>` : ''}
          <div class="xhz-gq-opts"></div>
          <div class="xhz-gq-exp" style="display:none;margin-top:14px;padding:12px 16px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;font-size:14px;line-height:1.5;"></div>
        `;
        const optsWrap = card.querySelector('.xhz-gq-opts');
        const options = Array.isArray(q.options) ? q.options : [];
        const rightAnswerKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));

        options.forEach((optItem, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const optKey = typeof optItem === 'object' ? String(optItem.id || optItem.key || letter) : letter;
          const optLabel = typeof optItem === 'object' ? (optItem.text || optItem.label || optItem.value || '') : String(optItem);
          const isThisCorrect = optKey === rightAnswerKey || optIdx === q.correctIndex;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'xhz-gq-opt';
          btn.dataset.key = optKey;
          btn.dataset.correct = isThisCorrect ? '1' : '0';
          btn.innerHTML = `<span class="xhz-gq-opt-letter">${letter}</span><span>${optLabel}</span>`;
          btn.onclick = () => {
            if (isSubmitted) return;
            currentIdx = idx;
            userAnswers[idx] = optKey;
            Array.from(optsWrap.children).forEach(b => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            syncNavAndStatus();
          };
          optsWrap.appendChild(btn);
        });
      } else {
        card.innerHTML = `
          ${topRowHtml}
          <div style="font-size:19px;font-weight:700;color:#1c1917;margin-top:10px;line-height:1.55;">
            ${stemText}
          </div>
          ${q.promptPinyin ? `<div style="font-size:13px;color:#78716c;margin-top:2px;">${q.promptPinyin}</div>` : ''}
          <div style="margin-top:12px;">
            <input type="text" class="xhz-gq-input" placeholder="Nhập câu dịch của bạn..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #dfd9cd;font-size:15px;color:#1c1917;background:#faf8f4;box-sizing:border-box;" />
          </div>
          <div class="xhz-gq-exp" style="display:none;margin-top:14px;padding:12px 16px;border-radius:12px;background:#ecfdf5;border:1px solid #6ee7b7;color:#065f46;font-size:14px;line-height:1.5;"></div>
        `;
        const inp = card.querySelector('.xhz-gq-input');
        if (inp) {
          inp.onfocus = () => {
            currentIdx = idx;
            syncNavAndStatus();
          };
          inp.oninput = () => {
            if (isSubmitted) return;
            if (inp.value.trim()) {
              userAnswers[idx] = inp.value.trim();
            } else {
              delete userAnswers[idx];
            }
            syncNavAndStatus();
          };
        }
      }

      const flagBtn = card.querySelector('.xhz-gq-flag-btn');
      if (flagBtn) {
        flagBtn.onclick = () => {
          currentIdx = idx;
          if (flaggedSet.has(idx)) {
            flaggedSet.delete(idx);
            flagBtn.style.color = '#78716c';
            flagBtn.style.borderColor = '#dfd9cd';
            flagBtn.style.background = '#faf8f4';
          } else {
            flaggedSet.add(idx);
            flagBtn.style.color = '#d97706';
            flagBtn.style.borderColor = '#f59e0b';
            flagBtn.style.background = '#fffbeb';
          }
          syncNavAndStatus();
        };
      }

      listEl.appendChild(card);
    });

    if (submitBtn) {
      submitBtn.onclick = () => {
        if (isSubmitted) {
          window.location.reload();
          return;
        }
        isSubmitted = true;
        const totalRight = countCorrect();
        const pct = Math.round((totalRight / Math.max(1, questions.length)) * 100);
        submitBtn.textContent = 'Làm đề mới';
        submitBtn.style.background = '#1c1917';

        recordStudyProgress({ minutes: 5, gradingInc: 1 });

        if (resultBanner) {
          resultBanner.style.display = 'block';
          resultBanner.innerHTML = `
            <div style="background:#fff;border:2px solid #b91c1c;border-radius:18px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;box-shadow:0 8px 24px rgba(185,28,28,0.08);">
              <div>
                <div style="font-size:13px;font-weight:800;color:#b91c1c;text-transform:uppercase;">Kết quả bài kiểm tra ngữ pháp</div>
                <div style="font-size:26px;font-weight:800;color:#1c1917;margin-top:4px;">Đúng ${totalRight} / ${questions.length} câu (${pct}%)</div>
                <div style="font-size:14px;color:#57534e;margin-top:2px;">Xem giải thích chi tiết ở từng câu bên dưới.</div>
              </div>
              <div style="display:flex;gap:10px;">
                <a href="/kiem-tra-ngu-phap" style="padding:10px 18px;border-radius:999px;border:1px solid #d6d3d1;background:#fafaf9;color:#1c1917;font-weight:700;text-decoration:none;font-size:14px;">Chọn lại cấu hình</a>
              </div>
            </div>
          `;
        }

        questions.forEach((q, idx) => {
          const card = cardEls[idx];
          if (!card) return;
          const expEl = card.querySelector('.xhz-gq-exp');
          if (q.type === 'mcq') {
            const optsWrap = card.querySelector('.xhz-gq-opts');
            const options = Array.isArray(q.options) ? q.options : [];
            const rightAnswerKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));
            const pickedKey = userAnswers[idx];
            if (optsWrap) {
              Array.from(optsWrap.children).forEach(b => {
                b.classList.remove('is-selected');
                if (b.dataset.correct === '1') {
                  b.classList.add('is-correct');
                } else if (pickedKey && b.dataset.key === pickedKey) {
                  b.classList.add('is-wrong');
                }
              });
            }
            if (expEl) {
              const rightObj = options.find((o, i) => (typeof o === 'object' ? String(o.id || o.key) === rightAnswerKey : i === q.correctIndex));
              const rightText = typeof rightObj === 'object' ? (rightObj.text || '') : (rightObj || '');
              expEl.style.display = 'block';
              expEl.innerHTML = `<strong>Đáp án đúng: ${rightAnswerKey}. ${rightText}</strong>${q.explanation ? `<div style="margin-top:4px;">${q.explanation}</div>` : ''}`;
            }
          } else if (expEl) {
            expEl.style.display = 'block';
            expEl.innerHTML = `<strong>Đáp án tham khảo:</strong> ${q.referenceAnswer || ''}${q.referencePinyin ? `<br/><span style="color:#ea580c;">Pinyin: ${q.referencePinyin}</span>` : ''}`;
          }
        });

        syncNavAndStatus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    syncNavAndStatus();
  }

  // --------------------------------------------------------------------------
  // 6.6. Trang Giáo Trình & Thư Viện (/thu-vien-*/:sub*)
  //      Chuẩn 1:1 theo giao diện gốc xiehanzi.com (Hero xanh + Grid 5 cột)
  // --------------------------------------------------------------------------
  async function renderCurriculumSubPage(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    const rootSlug = parts[0];
    const subParts = parts.slice(1);
    const currMap = {
      'thu-vien-new-hsk': 'new-hsk',
      'thu-vien-hsk': 'hsk',
      'thu-vien-yct': 'yct',
      'thu-vien-boya': 'boya',
      'thu-vien-boyahsk': 'boya',
      'thu-vien-hanyu-jiaocheng': 'hanyu-jiaocheng',
      'thu-vien-giao-trinh-han-ngu': 'hanyu-jiaocheng',
      'thu-vien-msutong': 'boya',
      'thu-vien-tu-vung': 'new-hsk',
      'thu-vien-chu-han': 'hsk'
    };
    const currBrandMap = {
      'thu-vien-new-hsk': 'Thư viện HSK 3.0 (9 cấp)',
      'thu-vien-hsk': 'Thư viện HSK 2.0 (6 cấp)',
      'thu-vien-yct': 'Thư viện YCT',
      'thu-vien-boya': 'Giáo trình Boya',
      'thu-vien-boyahsk': 'Giáo trình Boya HSK',
      'thu-vien-hanyu-jiaocheng': 'Giáo trình Hán Ngữ',
      'thu-vien-giao-trinh-han-ngu': 'Giáo trình Hán Ngữ',
      'thu-vien-msutong': 'Giáo trình MSutong'
    };
    const curr = currMap[rootSlug] || 'new-hsk';
    const brandTitle = currBrandMap[rootSlug] || 'Thư viện HSK 3.0 (9 cấp)';
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải nội dung giáo trình...</div>`;

    if (subParts.length === 1) {
      const levelSlug = subParts[0];
      let lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
      if (!lvlData && curr === 'new-hsk') {
        lvlData = await loadLocalJson(`/data/curriculums/hsk/levels/${levelSlug}.json`);
      }
      const levelObj = (lvlData && lvlData.level) || { name: levelSlug.toUpperCase(), topics: [], lessons: [] };
      const topics = Array.isArray(levelObj.topics) ? levelObj.topics : [];
      const lessons = Array.isArray(levelObj.lessons) ? levelObj.lessons : [];
      const items = lessons.length > 0 ? lessons : topics;

      document.title = `${levelObj.name || levelSlug} - ${brandTitle} | XieHanzi`;
      root.innerHTML = `
        <div style="margin-bottom:16px;">
          <a href="/${rootSlug}" style="color:#2563eb;font-weight:600;text-decoration:none;">← Quay lại ${brandTitle}</a>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
          <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">📘 ${levelObj.name || levelSlug.toUpperCase()}</h1>
          <p style="color:#57534e;margin-bottom:20px;">Tổng số từ vựng: <strong>${levelObj.wordCount || ''}</strong> • Số chủ đề/bài học: <strong>${items.length}</strong></p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
            ${items.map((t, i) => {
              const slug = t.lessonSlug || t.topicSlug || '';
              const isLesson = Boolean(t.lessonSlug);
              const href = isLesson
                ? `/${rootSlug}/${levelSlug}/bai-hoc/${encodeURIComponent(slug)}`
                : `/${rootSlug}/${levelSlug}/${encodeURIComponent(slug)}`;
              const label = t.titleVi || t.topic || t.titleZh || slug;
              return `
                <a href="${href}" style="display:block;padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                  <div style="font-size:13px;color:#2563eb;font-weight:700;">${isLesson ? `Bài ${t.lessonNumber || i + 1}` : `Chủ đề ${i + 1}`}</div>
                  <div style="font-size:18px;font-weight:700;margin-top:4px;color:#1c1917;">${label}</div>
                  <div style="font-size:14px;color:#57534e;margin-top:6px;">${t.wordCount || 0} từ vựng →</div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
      return;
    }

    const levelSlug = subParts[0];
    const lastSeg = subParts[subParts.length - 1];
    const isPractice = lastSeg === 'luyen-tap' || lastSeg === 'practice' || lastSeg === 'flashcard';
    const effectiveParts = isPractice ? subParts.slice(0, -1) : subParts;
    const itemSlug = decodeURIComponent(effectiveParts[effectiveParts.length - 1] || '');
    const cleanItemSlug = itemSlug.startsWith(levelSlug + '-') ? itemSlug.slice(levelSlug.length + 1) : itemSlug;

    let detail =
      (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${levelSlug}-${cleanItemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${cleanItemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/new-hsk/topics/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/new-hsk/lessons/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/hsk/topics/${levelSlug}--${itemSlug}.json`));

    const words =
      (detail && detail.lesson && detail.lesson.words) ||
      (detail && detail.topic && detail.topic.words) ||
      (detail && detail.words) ||
      [];
    const lessonObj = (detail && detail.lesson) || null;
    const topicObj = (detail && detail.topic) || null;
    const title =
      (lessonObj && (lessonObj.titleVi || lessonObj.titleZh || lessonObj.name)) ||
      (topicObj && (topicObj.topic || topicObj.name || topicObj.titleVi)) ||
      itemSlug;
    const subtitleZh = lessonObj && lessonObj.titleZh ? lessonObj.titleZh : '';
    const lessonNum = (lessonObj && lessonObj.lessonNumber) || (itemSlug.match(/bai-(\d+)/i) || [])[1] || '1';
    const lvlNum = (levelSlug.match(/\d+/) || ['1'])[0];
    const levelLabel = curr === 'new-hsk' ? `HSK 3.0 cấp ${lvlNum}` : `HSK cấp ${lvlNum}`;
    const baseDetailUrl = '/' + [rootSlug, ...effectiveParts].join('/');
    const practiceUrl = baseDetailUrl + '/luyen-tap';
    const flashcardUrl = baseDetailUrl + '/flashcard';

    if (isPractice && words.length > 0) {
      const startQuizMode = lastSeg === 'luyen-tap' || lastSeg === 'practice';
      document.title = `Luyện tập: ${title} - ${levelLabel} | XieHanzi`;
      root.innerHTML = `
        <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <a href="${baseDetailUrl}" style="color:#2563eb;font-weight:700;text-decoration:none;">← Quay lại bài học: ${title}</a>
          <a href="/${rootSlug}/${levelSlug}" style="color:#57534e;font-weight:600;text-decoration:none;">Danh sách bài ${levelLabel}</a>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
            <div>
              <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0;">🎯 Luyện tập từ vựng: ${title}</h1>
              <p style="font-size:14px;color:#57534e;margin:4px 0 0 0;">Chế độ Flashcard lật thẻ & Trắc nghiệm nhanh (${words.length} từ vựng)</p>
            </div>
            <div style="display:flex;gap:8px;">
              <button id="xhz-mode-flashcard" style="padding:8px 16px;border-radius:999px;background:#2563eb;color:#fff;border:none;font-weight:700;cursor:pointer;">🗂️ Flashcard</button>
              <button id="xhz-mode-quiz" style="padding:8px 16px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;cursor:pointer;">📝 Trắc nghiệm</button>
            </div>
          </div>
          <div id="xhz-practice-stage"></div>
        </div>
      `;

      const stage = document.getElementById('xhz-practice-stage');
      const btnFc = document.getElementById('xhz-mode-flashcard');
      const btnQz = document.getElementById('xhz-mode-quiz');
      let idx = 0;
      let flipped = false;

      const renderFlashcard = () => {
        const w = words[idx] || words[0];
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        const py = w.wordPinyin || w.pinyin || '';
        const hv = w.hanviet || '';
        const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const ex = Array.isArray(w.examples) && w.examples[0] ? w.examples[0] : null;
        const audioUrl = w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '';

        stage.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:12px 0;">
            <div style="font-size:14px;font-weight:700;color:#78716c;">Thẻ ${idx + 1} / ${words.length}</div>
            <div id="xhz-fc-card" style="width:100%;max-width:520px;min-height:260px;border-radius:20px;border:2px solid #bfdbfe;background:#eff6ff;padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;box-shadow:0 8px 24px rgba(37,99,235,0.08);transition:all 0.2s;">
              <div style="font-size:64px;font-weight:800;color:#1c1917;font-family:'Noto Serif SC',serif;">${hz}</div>
              <div style="font-size:22px;font-weight:700;color:#2563eb;margin-top:8px;">${py}</div>
              ${flipped ? `
                <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #93c5fd;width:100%;">
                  ${hv ? `<div style="font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;">Hán Việt: ${hv}</div>` : ''}
                  <div style="font-size:22px;font-weight:800;color:#1c1917;margin-top:6px;">${vi}</div>
                  ${ex ? `<div style="margin-top:10px;font-size:15px;color:#44403c;background:#fff;padding:10px;border-radius:10px;"><div><strong>${(ex.chinese || '').replace(/\{|\}/g, '')}</strong></div><div style="color:#2563eb;font-size:13px;">${ex.pinyin || ''}</div><div>${ex.vietnamese || ''}</div></div>` : ''}
                </div>
              ` : `<div style="margin-top:18px;font-size:13px;color:#1d4ed8;font-weight:600;">👆 Nhấn vào thẻ để lật xem nghĩa tiếng Việt</div>`}
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
              <button id="xhz-fc-prev" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;">← Từ trước</button>
              <button id="xhz-fc-audio" style="padding:10px 18px;border-radius:12px;border:none;background:#dbeafe;color:#1e40af;font-weight:700;cursor:pointer;">🔊 Nghe phát âm</button>
              <button id="xhz-fc-flip" style="padding:10px 18px;border-radius:12px;border:none;background:#2563eb;color:#fff;font-weight:700;cursor:pointer;">🔄 Lật thẻ</button>
              <button id="xhz-fc-next" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;">Từ tiếp →</button>
            </div>
          </div>
        `;
        document.getElementById('xhz-fc-card').onclick = () => { flipped = !flipped; renderFlashcard(); };
        document.getElementById('xhz-fc-flip').onclick = () => { flipped = !flipped; renderFlashcard(); };
        document.getElementById('xhz-fc-audio').onclick = () => playPronunciation(hz, audioUrl);
        document.getElementById('xhz-fc-prev').onclick = () => { idx = (idx - 1 + words.length) % words.length; flipped = false; renderFlashcard(); };
        document.getElementById('xhz-fc-next').onclick = () => { idx = (idx + 1) % words.length; flipped = false; renderFlashcard(); };
      };

      const renderQuiz = () => {
        let score = 0;
        const answered = new Set();
        stage.innerHTML = `
          <div id="xhz-curr-quiz-score" style="margin-bottom:14px;padding:10px 16px;border-radius:12px;background:#eff6ff;color:#1e40af;font-weight:800;">Điểm số: 0 / ${words.length}</div>
          <div id="xhz-curr-quiz-list" style="display:flex;flex-direction:column;gap:14px;"></div>
        `;
        const listEl = document.getElementById('xhz-curr-quiz-list');
        const scoreEl = document.getElementById('xhz-curr-quiz-score');
        words.forEach((w, qIdx) => {
          const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
          const py = w.wordPinyin || w.pinyin || '';
          const rightVi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
          const distractors = words
            .filter((_, i) => i !== qIdx)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(x => x.translationVi || x.wordMeaningVi || x.meaningVi || '');
          const options = [rightVi, ...distractors].sort(() => Math.random() - 0.5);

          const card = document.createElement('div');
          card.style.cssText = 'padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;';
          card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div>
                <span style="font-size:13px;font-weight:700;color:#78716c;margin-right:8px;">Câu ${qIdx + 1}/${words.length}</span>
                <span style="font-size:24px;font-weight:800;color:#1c1917;">${hz}</span>
                <span style="font-size:15px;color:#2563eb;font-weight:600;margin-left:8px;">[${py}]</span>
              </div>
              <button class="xhz-q-speak" style="border:none;background:#dbeafe;color:#1e40af;border-radius:999px;padding:4px 12px;font-weight:700;cursor:pointer;">🔊 Nghe</button>
            </div>
            <div class="xhz-q-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;"></div>
          `;
          card.querySelector('.xhz-q-speak').onclick = () => playPronunciation(hz, w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '');
          const optsWrap = card.querySelector('.xhz-q-opts');
          options.forEach(optText => {
            const btn = document.createElement('button');
            btn.style.cssText = 'padding:10px 12px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:600;text-align:left;cursor:pointer;';
            btn.textContent = optText;
            btn.onclick = () => {
              const isCorrect = optText === rightVi;
              if (!answered.has(qIdx)) {
                answered.add(qIdx);
                if (isCorrect) {
                  score++;
                  recordStudyProgress({ words: [hz] });
                }
                scoreEl.textContent = `Điểm số: ${score} / ${words.length} (Đã làm ${answered.size} câu)`;
              }
              Array.from(optsWrap.children).forEach(b => {
                b.style.background = b.textContent === rightVi ? '#dcfce7' : '#fff';
                b.style.borderColor = b.textContent === rightVi ? '#16a34a' : '#d6d3d1';
              });
              if (!isCorrect) {
                btn.style.background = '#fee2e2';
                btn.style.borderColor = '#dc2626';
              }
            };
            optsWrap.appendChild(btn);
          });
          listEl.appendChild(card);
        });
      };

      btnFc.onclick = () => {
        btnFc.style.background = '#2563eb';
        btnFc.style.color = '#fff';
        btnQz.style.background = '#f5f5f4';
        btnQz.style.color = '#1c1917';
        renderFlashcard();
      };
      btnQz.onclick = () => {
        btnQz.style.background = '#2563eb';
        btnQz.style.color = '#fff';
        btnFc.style.background = '#f5f5f4';
        btnFc.style.color = '#1c1917';
        renderQuiz();
      };
      if (startQuizMode) {
        btnQz.click();
      } else {
        renderFlashcard();
      }
      return;
    }

    // Helper: detect tone color from pinyin string
    const detectToneColor = py => {
      const s = String(py || '').trim();
      const firstSyl = s.split(/\s+/)[0] || s;
      if (/[āēīōūǖ1]/.test(firstSyl)) return '#dc2626'; // 1st tone red
      if (/[áéíóúǘ2]/.test(firstSyl)) return '#b45309'; // 2nd tone amber/brown
      if (/[ǎěǐǒǔǚ3]/.test(firstSyl)) return '#15803d'; // 3rd tone green
      if (/[àèìòùǜ4]/.test(firstSyl)) return '#1d4ed8'; // 4th tone blue
      return '#78716c'; // neutral
    };

    let learnedSet = new Set();
    try {
      const savedArr = JSON.parse(localStorage.getItem('httq_curr_learned_words') || '[]') || [];
      const progWords = (getRealProgress().wordsLearned || []);
      [...savedArr, ...progWords].forEach(w => learnedSet.add(String(w).replace(/^w:|^c:/, '')));
    } catch (_) {}

    const estMinutes = Math.max(5, Math.round(words.length * 0.8));
    const audioCount = words.filter(w => w.audioUrl || w.hanzi || w.word).length;
    const allHzString = words.map(w => (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '')).join('');

    document.title = `${title} - ${levelLabel} | XieHanzi`;

    root.innerHTML = `
      <style>
        .xhz-curr-hero {
          margin: -24px calc(50% - 50vw) 24px calc(50% - 50vw);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e40af 100%);
          color: #fff;
          padding: 28px 24px 22px;
          position: relative;
          overflow: hidden;
        }
        .xhz-curr-hero-watermark {
          position: absolute;
          right: 4%;
          top: -18px;
          font-size: 240px;
          font-weight: 900;
          color: rgba(255,255,255,0.07);
          font-family: 'Noto Serif SC', serif;
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }
        .xhz-curr-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .xhz-curr-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .xhz-curr-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1150px) {
          .xhz-curr-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .xhz-curr-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .xhz-curr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .xhz-curr-wcard {
          background: #faf8f5;
          border: 1px solid #e5e0d5;
          border-radius: 16px;
          padding: 18px 16px 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          position: relative;
          min-height: 196px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .xhz-curr-wcard:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(28,25,23,0.07);
          background: #fff;
        }
        .xhz-curr-grid.hide-pinyin .xhz-wcard-py { opacity: 0; pointer-events: none; }
        .xhz-curr-grid.hide-meaning .xhz-wcard-vi { opacity: 0; pointer-events: none; }
      </style>

      <div class="xhz-curr-hero">
        <div class="xhz-curr-hero-watermark">新</div>
        <div class="xhz-curr-hero-inner">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,0.85);margin-bottom:14px;flex-wrap:wrap;">
            <a href="/${rootSlug}" style="color:rgba(255,255,255,0.85);text-decoration:none;">${brandTitle}</a>
            <span>›</span>
            <a href="/${rootSlug}/${levelSlug}" style="color:rgba(255,255,255,0.85);text-decoration:none;">${levelLabel}</a>
            <span>›</span>
            <span>Bài học</span>
            <span>›</span>
            <strong style="color:#fff;">Bài ${lessonNum}</strong>
          </div>

          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,0.16);backdrop-filter:blur(4px);font-size:12px;font-weight:700;margin-bottom:10px;">
            ✨ Bài ${lessonNum} · ${levelLabel}
          </div>

          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;">
            <div>
              <h1 style="font-size:36px;font-weight:800;margin:0;color:#fff;line-height:1.2;">${title}</h1>
              ${subtitleZh ? `<div style="font-size:20px;color:rgba(255,255,255,0.92);margin-top:6px;font-family:'Noto Serif SC',serif;">${subtitleZh}</div>` : ''}
              <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:8px;">
                ${words.length} từ vựng · ~${estMinutes} phút · ${audioCount} có audio
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <a href="/tao-vo-tap-viet?text=${encodeURIComponent(allHzString)}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.28);color:#fff;font-weight:700;font-size:14px;text-decoration:none;">
                📝 Tạo vở tập viết
              </a>
              <a href="${flashcardUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.28);color:#fff;font-weight:700;font-size:14px;text-decoration:none;">
                🎓 Học bằng Flashcard
              </a>
              <a href="${practiceUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;background:#fff;color:#0f172a;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                ▶ Bắt đầu luyện tập <span style="margin-left:2px;">›</span>
              </a>
            </div>
          </div>

          <div style="margin-top:22px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.16);">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,0.9);margin-bottom:6px;">
              <span>Tiến độ học</span>
              <strong id="xhz-curr-prog-text">0/${words.length} · 0%</strong>
            </div>
            <div style="height:6px;border-radius:999px;background:rgba(255,255,255,0.22);overflow:hidden;">
              <div id="xhz-curr-prog-bar" style="height:100%;width:0%;background:#fff;border-radius:999px;transition:width 0.25s;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="max-width:1200px;margin:0 auto;">
        <div class="xhz-curr-toolbar">
          <div style="flex:1;min-width:240px;position:relative;">
            <input id="xhz-curr-search" type="text" placeholder="🔍 Tìm hanzi, pinyin, nghĩa..." style="width:100%;padding:10px 16px;border-radius:999px;border:1px solid #dfd9cd;background:#faf8f5;color:#1c1917;font-size:14px;box-sizing:border-box;" />
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="display:inline-flex;align-items:center;background:#ebe6dc;padding:3px;border-radius:999px;gap:4px;">
              <button type="button" id="xhz-filter-all" style="padding:5px 12px;border-radius:999px;border:none;background:#dc2626;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">Tất cả · ${words.length}</button>
              <button type="button" id="xhz-filter-audio" style="padding:5px 10px;border-radius:999px;border:none;background:transparent;color:#44403c;font-size:12px;font-weight:700;cursor:pointer;">🔊 ${audioCount}</button>
              <button type="button" id="xhz-filter-learned" style="padding:5px 10px;border-radius:999px;border:none;background:transparent;color:#44403c;font-size:12px;font-weight:700;cursor:pointer;">✓ <span id="xhz-learned-pill-cnt">0</span></button>
            </div>
            <button type="button" id="xhz-toggle-pinyin" style="padding:7px 14px;border-radius:999px;border:1px solid #dfd9cd;background:#faf8f5;color:#1c1917;font-size:13px;font-weight:600;cursor:pointer;">👁 Ẩn pinyin</button>
            <button type="button" id="xhz-toggle-meaning" style="padding:7px 14px;border-radius:999px;border:1px solid #dfd9cd;background:#faf8f5;color:#1c1917;font-size:13px;font-weight:600;cursor:pointer;">👁 Ẩn nghĩa</button>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:16px;font-size:12px;color:#57534e;margin-bottom:18px;flex-wrap:wrap;">
          <span>Màu thanh điệu:</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#dc2626;display:inline-block;"></i> 1st tone (ˉ)</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#b45309;display:inline-block;"></i> 2nd tone (ˊ)</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#15803d;display:inline-block;"></i> 3rd tone (ˇ)</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#1d4ed8;display:inline-block;"></i> 4th tone (ˋ)</span>
        </div>

        <div id="xhz-curr-word-grid" class="xhz-curr-grid"></div>
      </div>
    `;

    const gridEl = document.getElementById('xhz-curr-word-grid');
    const searchInput = document.getElementById('xhz-curr-search');
    const progText = document.getElementById('xhz-curr-prog-text');
    const progBar = document.getElementById('xhz-curr-prog-bar');
    const learnedPillCnt = document.getElementById('xhz-learned-pill-cnt');
    const btnFilterAll = document.getElementById('xhz-filter-all');
    const btnFilterAudio = document.getElementById('xhz-filter-audio');
    const btnFilterLearned = document.getElementById('xhz-filter-learned');
    const btnTogglePy = document.getElementById('xhz-toggle-pinyin');
    const btnToggleVi = document.getElementById('xhz-toggle-meaning');

    let activeFilter = 'all';

    const updateProgressUI = () => {
      const inLessonLearned = words.filter(w => {
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        return learnedSet.has(hz);
      }).length;
      const pct = words.length > 0 ? Math.round((inLessonLearned / words.length) * 100) : 0;
      if (progText) progText.textContent = `${inLessonLearned}/${words.length} · ${pct}%`;
      if (progBar) progBar.style.width = `${pct}%`;
      if (learnedPillCnt) learnedPillCnt.textContent = String(inLessonLearned);
    };

    const renderGrid = () => {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      gridEl.innerHTML = '';

      words.forEach(w => {
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        const py = w.wordPinyin || w.pinyin || '';
        const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const hskTag = w.hskLevel ? `New HSK ${w.hskLevel}` : '';
        const audioUrl = w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '';
        const isLearned = learnedSet.has(hz);

        if (activeFilter === 'learned' && !isLearned) return;
        if (q && !hz.toLowerCase().includes(q) && !py.toLowerCase().includes(q) && !vi.toLowerCase().includes(q)) return;

        const toneColor = detectToneColor(py);
        const link = hz.length === 1 ? `/han-tu/${encodeURIComponent(hz)}` : `/tu-vung/${encodeURIComponent(hz)}`;

        const card = document.createElement('div');
        card.className = 'xhz-curr-wcard';
        card.style.borderTop = `4px solid ${toneColor}`;

        card.innerHTML = `
          <button type="button" class="xhz-wcard-speak" title="Nghe phát âm" style="position:absolute;top:10px;right:10px;border:none;background:transparent;color:#57534e;cursor:pointer;font-size:15px;padding:4px;">🔊</button>
          <div style="margin-top:12px;display:flex;flex-direction:column;align-items:center;width:100%;">
            <a href="${link}" style="font-size:40px;font-weight:500;color:#1c1917;text-decoration:none;font-family:'Noto Serif SC',serif;line-height:1.15;">${hz}</a>
            <div class="xhz-wcard-py" style="font-size:14px;color:#57534e;margin-top:8px;transition:opacity 0.15s;">${py}</div>
            <div class="xhz-wcard-vi" style="font-size:15px;font-weight:700;color:#1c1917;margin-top:6px;line-height:1.35;transition:opacity 0.15s;">${vi}</div>
          </div>
          <div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:12px;min-height:24px;">
            <span>${hskTag ? `<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:#e7e2d8;color:#57534e;">${hskTag}</span>` : ''}</span>
            <button type="button" class="xhz-wcard-heart" title="${isLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}" style="border:none;background:transparent;color:${isLearned ? '#dc2626' : '#78716c'};cursor:pointer;font-size:16px;padding:2px 4px;">
              ${isLearned ? '♥' : '♡'}
            </button>
          </div>
        `;

        const speakBtn = card.querySelector('.xhz-wcard-speak');
        if (speakBtn) {
          speakBtn.onclick = e => {
            e.stopPropagation();
            playPronunciation(hz, audioUrl);
          };
        }

        const heartBtn = card.querySelector('.xhz-wcard-heart');
        if (heartBtn) {
          heartBtn.onclick = e => {
            e.stopPropagation();
            if (learnedSet.has(hz)) {
              learnedSet.delete(hz);
            } else {
              learnedSet.add(hz);
              recordStudyProgress({ words: [hz] });
            }
            try {
              localStorage.setItem('httq_curr_learned_words', JSON.stringify(Array.from(learnedSet)));
            } catch (_) {}
            updateProgressUI();
            renderGrid();
          };
        }

        gridEl.appendChild(card);
      });
    };

    const setFilterButtons = mode => {
      activeFilter = mode;
      [
        [btnFilterAll, 'all'],
        [btnFilterAudio, 'audio'],
        [btnFilterLearned, 'learned']
      ].forEach(([btn, m]) => {
        if (!btn) return;
        btn.style.background = m === mode ? '#dc2626' : 'transparent';
        btn.style.color = m === mode ? '#fff' : '#44403c';
      });
      renderGrid();
    };

    if (btnFilterAll) btnFilterAll.onclick = () => setFilterButtons('all');
    if (btnFilterAudio) btnFilterAudio.onclick = () => setFilterButtons('audio');
    if (btnFilterLearned) btnFilterLearned.onclick = () => setFilterButtons('learned');
    if (searchInput) searchInput.oninput = () => renderGrid();

    if (btnTogglePy) {
      btnTogglePy.onclick = () => {
        const hidden = gridEl.classList.toggle('hide-pinyin');
        btnTogglePy.style.background = hidden ? '#1c1917' : '#faf8f5';
        btnTogglePy.style.color = hidden ? '#fff' : '#1c1917';
      };
    }
    if (btnToggleVi) {
      btnToggleVi.onclick = () => {
        const hidden = gridEl.classList.toggle('hide-meaning');
        btnToggleVi.style.background = hidden ? '#1c1917' : '#faf8f5';
        btnToggleVi.style.color = hidden ? '#fff' : '#1c1917';
      };
    }

    updateProgressUI();
    renderGrid();
  }

  // --------------------------------------------------------------------------
  // 6.7. Trang Chi Tiết Video Nghe Chép Chính Tả (/luyen-chep-chinh-ta/:id)
  //      Chuẩn 1:1 theo giao diện gốc xiehanzi.com (page-0fed561cd433dd9b.js)
  // --------------------------------------------------------------------------
  async function renderDictationDetailPage(slugOrId) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải video nghe chép chính tả...</div>`;
    const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
    const decoded = decodeURIComponent(slugOrId);
    const video =
      all.find(v => v.id === decoded || v._id === decoded || v.slug === decoded || v.slugVi === decoded || toSlugVi(v.title || v.titleVi) === decoded) ||
      all[0];

    if (!video) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy bài nghe chép chính tả. <a href="/luyen-chep-chinh-ta">Quay lại danh sách</a></div>`;
      return;
    }

    const vidId = video.id || video._id;
    const segData = (await loadLocalJson(`/data/dictation/videos/${vidId}-segments.json`)) || {};
    const segments = Array.isArray(segData.items)
      ? segData.items
      : (Array.isArray(segData.segments) ? segData.segments : (Array.isArray(video.segments) ? video.segments : []));
    const ytId = video.youtubeId || video.videoId || '';
    const storageKey = `xiehanzi:dictation:${vidId}`;

    let savedState = { currentIndex: 0, mode: 'full', pinyinMode: false, segments: {} };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedState = { ...savedState, ...JSON.parse(raw) };
    } catch (_) {}

    let currentIndex = Math.min(Math.max(0, Number(savedState.currentIndex) || 0), Math.max(0, segments.length - 1));
    let mode = ['full', 'blank', 'listen'].includes(savedState.mode) ? savedState.mode : 'full';
    let pinyinMode = Boolean(savedState.pinyinMode);
    let segStates = savedState.segments && typeof savedState.segments === 'object' ? savedState.segments : {};
    let loopSegment = false;
    let maskSubs = false;
    let playbackRate = 1;
    let listFilter = 'all';
    let showAllSubtitlesInList = true;
    let hintRevealedCount = 0;
    let isPlayingSeg = false;
    let ytPlayer = null;
    let ytReady = false;
    let segPollTimer = null;

    function persistDictState() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          currentIndex,
          mode,
          pinyinMode,
          segments: segStates,
          updatedAt: Date.now()
        }));
      } catch (_) {}
    }

    function formatMs(ms) {
      const totalSec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    function normalizePinyinCompare(str) {
      return String(str || '')
        .replace(/u:/gi, 'ü')
        .normalize('NFD')
        .replace(/u\u0308/gi, 'v')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[1-5]/g, '')
        .replace(/[^a-z]+/g, '');
    }

    function normalizeHanziCompare(str) {
      return Array.from(String(str || '')).filter(c => /[\u4e00-\u9fffA-Za-z0-9]/.test(c)).join('');
    }

    function getDictationBlankTargets(seg) {
      const chars = Array.from(seg.hanzi || '').filter(ch => /[\u4e00-\u9fff]/.test(ch));
      const raw = Array.isArray(seg.blankCharIdx) ? seg.blankCharIdx : [seg.blankCharIdx];
      let indices = [...new Set(raw.filter(value => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < chars.length))].sort((a, b) => a - b);
      if (!indices.length && chars.length) indices = [0];
      const syllables = String(seg.pinyin || '').match(/[\p{Script=Latin}\p{M}0-9:]+/gu) || [];
      const units = String(seg.hanzi || '').match(/[\u4e00-\u9fff]|[A-Za-z0-9]+/g) || [];
      const pinyinByChar = [];
      if (syllables.length === units.length) {
        units.forEach((unit, index) => { if (/[\u4e00-\u9fff]/.test(unit)) pinyinByChar.push(syllables[index]); });
      } else if (syllables.length === chars.length) {
        pinyinByChar.push(...syllables);
      }
      return indices.map(index => ({ index, hanzi: chars[index], pinyin: pinyinByChar[index] || '' }));
    }

    function isDictationBlankCorrect(target, input, usePinyin) {
      const value = String(input || '').trim();
      if (!value) return false;
      if (value === target.hanzi) return true;
      const isPinyin = /^[\p{Script=Latin}\p{M}]+[1-5]?$/u.test(value.replace(/u:/gi, 'ü'));
      return Boolean(usePinyin && isPinyin && target.pinyin && normalizePinyinCompare(value) && normalizePinyinCompare(value) === normalizePinyinCompare(target.pinyin));
    }

    const hskColors = {
      1: 'background:#fef3c7;color:#92400e;',
      2: 'background:#ffedd5;color:#9a3412;',
      3: 'background:#ffe4e6;color:#9f1239;',
      4: 'background:#ede9fe;color:#5b21b6;',
      5: 'background:#e0f2fe;color:#075985;',
      6: 'background:#dcfce7;color:#166534;'
    };
    const hskBadgeStyle = hskColors[video.hskLevel] || hskColors[1];

    document.title = `${video.seoTitle || video.title || 'Luyện chép chính tả'} | XieHanzi`;

    root.innerHTML = `
      <div class="mx-auto max-w-6xl" style="color:#1c1917;">
        <!-- Header giống bản gốc xiehanzi.com -->
        <div style="margin-bottom:16px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px;color:#78716c;">
            <a href="/luyen-chep-chinh-ta" style="color:#57534e;text-decoration:none;font-weight:600;">← Tất cả video</a>
            <span>·</span>
            <span style="padding:2px 8px;border-radius:6px;font-weight:700;${hskBadgeStyle}">HSK ${video.hskLevel || 1}</span>
            ${video.partCount && video.partCount > 1 ? `<span style="padding:2px 8px;border-radius:6px;background:#f5f5f4;color:#44403c;font-weight:600;">Phần ${video.part || 1}/${video.partCount}</span>` : ''}
            <span>kênh ${video.channelName || 'Chinese'} · ${segments.length} câu</span>
          </div>
          <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#1c1917;">${video.seoTitle || video.title}</h1>
          ${video.seoDescription ? `<p style="margin:4px 0 0 0;font-size:13px;line-height:1.6;color:#57534e;">${video.seoDescription}</p>` : ''}
        </div>

        <!-- 2-Column Layout: Left (Video + Dictation Workspace) | Right (Danh sách câu) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;align-items:start;">
          <!-- Left Column -->
          <div style="grid-column:span 1;min-width:0;display:flex;flex-direction:column;gap:16px;" id="xhz-dict-left-col">
            <!-- Video Container -->
            <div>
              <div id="xhz-dict-listen-banner" style="display:none;align-items:center;justify-content:center;gap:12px;border-radius:16px;border:1px solid #fde68a;background:#fffbeb;padding:28px 16px;text-align:center;">
                <span style="font-size:28px;">🎧</span>
                <div style="text-align:left;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#78350f;">Đang ở chế độ chỉ nghe</p>
                  <p style="margin:2px 0 0 0;font-size:12px;color:#92400e;">Video được ẩn để tập trung tai nghe — bấm sang chế độ khác để hiện lại.</p>
                </div>
              </div>
              <div id="xhz-dict-video-wrap" style="position:relative;overflow:hidden;border-radius:16px;background:#000;box-shadow:0 4px 16px rgba(0,0,0,0.12);aspect-ratio:16/9;width:100%;">
                <div id="xhz-yt-player" style="width:100%;height:100%;"></div>
                <div id="xhz-dict-sub-mask" style="display:none;pointer-events:none;position:absolute;left:0;right:0;bottom:0;height:22%;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);align-items:center;justify-content:center;">
                  <span style="font-size:11px;color:#d6d3d1;">Phụ đề trong video đã được che</span>
                </div>
              </div>

              <!-- Player Toolbar -->
              <div style="margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;border-radius:12px;border:1px solid #e7e5e4;background:#fff;padding:8px 12px;font-size:12px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
                  <button type="button" id="xhz-dict-btn-play-seg" style="display:inline-flex;align-items:center;gap:6px;border-radius:8px;background:#1c1917;color:#fff;border:none;padding:6px 12px;font-weight:700;cursor:pointer;font-size:12px;">
                    ▶ Phát câu này
                  </button>
                  <button type="button" id="xhz-dict-btn-tts-seg" style="display:inline-flex;align-items:center;gap:4px;border-radius:8px;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;padding:6px 10px;font-weight:700;cursor:pointer;font-size:12px;" title="Đọc phát âm mẫu câu này">
                    🔊 Đọc mẫu
                  </button>
                  <label style="display:inline-flex;align-items:center;gap:4px;color:#44403c;cursor:pointer;font-weight:600;">
                    <input type="checkbox" id="xhz-dict-chk-loop" style="accent-color:#d97706;" />
                    Lặp câu
                  </label>
                  <label style="display:inline-flex;align-items:center;gap:4px;color:#44403c;cursor:pointer;font-weight:600;">
                    <input type="checkbox" id="xhz-dict-chk-mask" style="accent-color:#d97706;" />
                    Ẩn phụ đề
                  </label>
                </div>
                <div style="display:flex;align-items:center;gap:4px;" id="xhz-dict-speed-bar">
                  <span style="color:#78716c;margin-right:2px;">Tốc độ:</span>
                  ${[0.5, 0.75, 1, 1.25, 1.5].map(r => `
                    <button type="button" data-rate="${r}" class="xhz-rate-btn" style="border-radius:6px;padding:3px 7px;border:none;font-weight:700;cursor:pointer;font-size:11px;background:${r === 1 ? '#d97706' : '#f5f5f4'};color:${r === 1 ? '#fff' : '#57534e'};">${r}×</button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#57534e;">
                <span id="xhz-dict-prog-label" style="font-weight:700;color:#1c1917;">Câu 1/${segments.length}</span>
                <span id="xhz-dict-done-label">0/${segments.length} đã xong</span>
              </div>
              <div style="height:6px;width:100%;overflow:hidden;border-radius:999px;background:#e7e5e4;">
                <div id="xhz-dict-prog-bar" style="height:100%;background:#d97706;width:0%;transition:width 0.25s;"></div>
              </div>
            </div>

            <!-- Dictation Workspace Card -->
            <div style="border-radius:16px;border:1px solid #e7e5e4;background:#fff;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
              <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12px;">
                  <span style="color:#78716c;margin-right:4px;font-weight:600;">Chế độ:</span>
                  <button type="button" class="xhz-dict-mode-btn" data-mode="full" style="border-radius:8px;padding:6px 12px;font-weight:700;border:none;cursor:pointer;">Gõ hết</button>
                  <button type="button" class="xhz-dict-mode-btn" data-mode="blank" style="border-radius:8px;padding:6px 12px;font-weight:700;border:none;cursor:pointer;">Điền chỗ trống</button>
                  <button type="button" class="xhz-dict-mode-btn" data-mode="listen" style="border-radius:8px;padding:6px 12px;font-weight:700;border:none;cursor:pointer;">Chỉ nghe</button>
                </div>
                <label id="xhz-dict-pinyin-wrap" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#44403c;cursor:pointer;font-weight:600;">
                  <input type="checkbox" id="xhz-dict-chk-pinyin" style="accent-color:#d97706;" />
                  Gõ pinyin
                </label>
              </div>

              <!-- Dynamic Workspace Stage -->
              <div id="xhz-dict-stage"></div>
            </div>
          </div>

          <!-- Right Column: Danh sách câu -->
          <div style="border-radius:16px;border:1px solid #e7e5e4;background:#fff;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
              <h2 style="margin:0;font-size:15px;font-weight:800;color:#1c1917;">Danh sách câu (${segments.length})</h2>
              <div style="display:flex;gap:4px;font-size:11px;" id="xhz-dict-filter-tabs">
                <button type="button" data-filter="all" style="border-radius:6px;padding:3px 8px;border:none;font-weight:700;cursor:pointer;background:#1c1917;color:#fff;">Tất cả</button>
                <button type="button" data-filter="wrong" style="border-radius:6px;padding:3px 8px;border:none;font-weight:600;cursor:pointer;background:#f5f5f4;color:#57534e;">Câu sai</button>
                <button type="button" data-filter="unattempted" style="border-radius:6px;padding:3px 8px;border:none;font-weight:600;cursor:pointer;background:#f5f5f4;color:#57534e;">Chưa làm</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <button type="button" id="xhz-dict-next-unattempted" style="flex:1;border-radius:8px;border:1px solid #fde68a;background:#fffbeb;padding:6px 10px;font-size:12px;font-weight:700;color:#92400e;cursor:pointer;">
                Tới câu chưa làm tiếp theo →
              </button>
              <button type="button" id="xhz-dict-toggle-list-sub" style="border-radius:8px;border:1px solid #e7e5e4;background:#fafaf9;padding:6px 10px;font-size:11px;font-weight:700;color:#44403c;cursor:pointer;" title="Ẩn/Hiện chữ Hán trong danh sách câu">
                👁 Hiện chữ
              </button>
            </div>
            <div id="xhz-dict-seg-list" style="max-height:480px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px;"></div>
          </div>
        </div>

        ${video.seoIntroVi ? `
          <section style="margin-top:32px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;padding:20px;font-size:14px;line-height:1.7;color:#44403c;">
            <h2 style="margin:0 0 8px 0;font-size:16px;font-weight:800;color:#1c1917;">Giới thiệu bài nghe</h2>
            <p style="margin:0;white-space:pre-line;">${video.seoIntroVi}</p>
          </section>
        ` : ''}
      </div>
    `;

    // Adjust desktop 2-col proportion on wide screens
    const applyGridCols = () => {
      const gridEl = root.querySelector('#xhz-dict-left-col') && root.querySelector('#xhz-dict-left-col').parentElement;
      if (gridEl) {
        gridEl.style.gridTemplateColumns = window.innerWidth >= 1024 ? '1fr 340px' : '1fr';
      }
    };
    applyGridCols();
    window.addEventListener('resize', applyGridCols);

    // YouTube IFrame API Segment Playback
    function stopSegPoll() {
      if (segPollTimer) {
        clearInterval(segPollTimer);
        segPollTimer = null;
      }
      isPlayingSeg = false;
      updatePlayBtnLabel();
    }

    function updatePlayBtnLabel() {
      const btn = document.getElementById('xhz-dict-btn-play-seg');
      if (!btn) return;
      btn.textContent = isPlayingSeg ? '⏸ Đang phát — bấm để phát lại' : '▶ Phát câu này';
    }

    function playCurrentSegment(rateOverride) {
      const seg = segments[currentIndex];
      if (!seg) return;
      const rate = rateOverride || playbackRate || 1;
      if (ytPlayer && ytReady && typeof ytPlayer.seekTo === 'function') {
        try {
          if (typeof ytPlayer.setPlaybackRate === 'function') ytPlayer.setPlaybackRate(rate);
          ytPlayer.seekTo((seg.startMs || 0) / 1000, true);
          ytPlayer.playVideo();
          isPlayingSeg = true;
          updatePlayBtnLabel();
          if (segPollTimer) clearInterval(segPollTimer);
          segPollTimer = setInterval(() => {
            try {
              const curSec = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
              const endSec = ((seg.endMs || (seg.startMs + 4000)) / 1000) + 0.08;
              if (curSec >= endSec) {
                if (loopSegment) {
                  ytPlayer.seekTo((seg.startMs || 0) / 1000, true);
                  ytPlayer.playVideo();
                } else {
                  ytPlayer.pauseVideo();
                  stopSegPoll();
                }
              }
            } catch (_) {
              stopSegPoll();
            }
          }, 80);
          return;
        } catch (_) {}
      }
      // Fallback: pronounce Chinese text via TTS if YT player not yet ready
      playPronunciation(seg.hanzi || '', '');
    }

    function initYouTubePlayer() {
      if (!ytId) return;
      const createPlayer = () => {
        if (!document.getElementById('xhz-yt-player')) return;
        ytPlayer = new window.YT.Player('xhz-yt-player', {
          videoId: ytId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            cc_load_policy: 0,
            iv_load_policy: 3
          },
          events: {
            onReady: () => {
              ytReady = true;
              const seg = segments[currentIndex];
              if (seg && ytPlayer && typeof ytPlayer.seekTo === 'function') {
                try {
                  ytPlayer.seekTo((seg.startMs || 0) / 1000, true);
                  ytPlayer.pauseVideo();
                } catch (_) {}
              }
            }
          }
        });
      };
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const prevCb = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
          if (typeof prevCb === 'function') prevCb();
          createPlayer();
        };
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }
      }
    }
    initYouTubePlayer();

    // Wire toolbar controls
    const btnPlaySeg = document.getElementById('xhz-dict-btn-play-seg');
    if (btnPlaySeg) btnPlaySeg.onclick = () => playCurrentSegment();
    const btnTtsSeg = document.getElementById('xhz-dict-btn-tts-seg');
    if (btnTtsSeg) {
      btnTtsSeg.onclick = () => {
        const seg = segments[currentIndex];
        if (seg) playPronunciation(seg.hanzi || '', '');
      };
    }
    const chkLoop = document.getElementById('xhz-dict-chk-loop');
    if (chkLoop) chkLoop.onchange = e => { loopSegment = Boolean(e.target.checked); };
    const chkMask = document.getElementById('xhz-dict-chk-mask');
    const subMaskEl = document.getElementById('xhz-dict-sub-mask');
    if (chkMask && subMaskEl) {
      chkMask.onchange = e => {
        maskSubs = Boolean(e.target.checked);
        subMaskEl.style.display = maskSubs ? 'flex' : 'none';
      };
    }
    root.querySelectorAll('.xhz-rate-btn').forEach(btn => {
      btn.onclick = () => {
        playbackRate = Number(btn.getAttribute('data-rate')) || 1;
        root.querySelectorAll('.xhz-rate-btn').forEach(b => {
          const active = Number(b.getAttribute('data-rate')) === playbackRate;
          b.style.background = active ? '#d97706' : '#f5f5f4';
          b.style.color = active ? '#fff' : '#57534e';
        });
        if (ytPlayer && ytReady && typeof ytPlayer.setPlaybackRate === 'function') {
          try { ytPlayer.setPlaybackRate(playbackRate); } catch (_) {}
        }
      };
    });

    const chkPinyin = document.getElementById('xhz-dict-chk-pinyin');
    if (chkPinyin) {
      chkPinyin.checked = pinyinMode;
      chkPinyin.onchange = e => {
        pinyinMode = Boolean(e.target.checked);
        persistDictState();
        renderAllDictationUI();
      };
    }

    root.querySelectorAll('.xhz-dict-mode-btn').forEach(btn => {
      btn.onclick = () => {
        mode = btn.getAttribute('data-mode') || 'full';
        persistDictState();
        renderAllDictationUI();
      };
    });

    const filterTabs = root.querySelectorAll('#xhz-dict-filter-tabs button');
    filterTabs.forEach(btn => {
      btn.onclick = () => {
        listFilter = btn.getAttribute('data-filter') || 'all';
        filterTabs.forEach(b => {
          const active = b.getAttribute('data-filter') === listFilter;
          b.style.background = active ? '#1c1917' : '#f5f5f4';
          b.style.color = active ? '#fff' : '#57534e';
          b.style.fontWeight = active ? '700' : '600';
        });
        renderSegmentList();
      };
    });

    const btnToggleListSub = document.getElementById('xhz-dict-toggle-list-sub');
    if (btnToggleListSub) {
      btnToggleListSub.onclick = () => {
        showAllSubtitlesInList = !showAllSubtitlesInList;
        btnToggleListSub.textContent = showAllSubtitlesInList ? '👁 Hiện chữ' : '🙈 Ẩn chữ';
        renderSegmentList();
      };
    }

    const btnNextUnattempted = document.getElementById('xhz-dict-next-unattempted');
    if (btnNextUnattempted) {
      btnNextUnattempted.onclick = () => {
        for (let offset = 1; offset <= segments.length; offset++) {
          const idx = (currentIndex + offset) % segments.length;
          const st = segStates[idx] && segStates[idx].status;
          if (!st || st === 'unattempted') {
            selectSegment(idx, true);
            return;
          }
        }
      };
    }

    function selectSegment(idx, autoPlay = true) {
      if (idx < 0 || idx >= segments.length) return;
      currentIndex = idx;
      hintRevealedCount = 0;
      persistDictState();
      renderAllDictationUI();
      if (autoPlay) {
        playCurrentSegment();
      }
    }

    function renderSegmentList() {
      const listEl = document.getElementById('xhz-dict-seg-list');
      if (!listEl) return;

      let wrongCount = 0;
      let unattemptedCount = 0;
      let doneCount = 0;
      segments.forEach((_, i) => {
        const st = (segStates[i] && segStates[i].status) || 'unattempted';
        if (st === 'wrong') wrongCount++;
        if (st === 'unattempted') unattemptedCount++;
        if (st === 'correct' || st === 'revealed') doneCount++;
      });

      // Update filter tab counts
      const tabWrong = root.querySelector('#xhz-dict-filter-tabs button[data-filter="wrong"]');
      const tabUnatt = root.querySelector('#xhz-dict-filter-tabs button[data-filter="unattempted"]');
      if (tabWrong) tabWrong.textContent = `Câu sai (${wrongCount})`;
      if (tabUnatt) tabUnatt.textContent = `Chưa làm (${unattemptedCount})`;

      // Update progress bar
      const progLabel = document.getElementById('xhz-dict-prog-label');
      const doneLabel = document.getElementById('xhz-dict-done-label');
      const progBar = document.getElementById('xhz-dict-prog-bar');
      if (progLabel) progLabel.textContent = `Câu ${currentIndex + 1}/${segments.length} (${formatMs(segments[currentIndex] && segments[currentIndex].startMs)} – ${formatMs(segments[currentIndex] && segments[currentIndex].endMs)})`;
      if (doneLabel) doneLabel.textContent = `${doneCount}/${segments.length} đã xong`;
      if (progBar) progBar.style.width = `${segments.length ? Math.round((doneCount / segments.length) * 100) : 0}%`;

      const rows = segments
        .map((s, idx) => ({ seg: s, idx, st: (segStates[idx] && segStates[idx].status) || 'unattempted' }))
        .filter(r => {
          if (listFilter === 'wrong') return r.st === 'wrong';
          if (listFilter === 'unattempted') return r.st === 'unattempted';
          return true;
        });

      if (rows.length === 0) {
        listEl.innerHTML = `<p style="padding:24px 0;text-align:center;font-size:12px;color:#78716c;">Không có câu nào trong bộ lọc này.</p>`;
        return;
      }

      listEl.innerHTML = rows.map(({ seg, idx, st }) => {
        const isCurrent = idx === currentIndex;
        const canShowText = showAllSubtitlesInList || st === 'correct' || st === 'revealed';
        const badgeBg = st === 'correct' ? '#d1fae5;color:#065f46;' : st === 'wrong' ? '#ffe4e6;color:#9f1239;' : st === 'revealed' ? '#fef3c7;color:#92400e;' : '#f5f5f4;color:#57534e;';
        const badgeIcon = st === 'correct' ? '✓' : st === 'wrong' ? '✗' : (idx + 1);
        const diffLabel = seg.difficulty === 1 ? 'Dễ' : seg.difficulty === 2 ? 'Vừa' : 'Khó';
        const diffStyle = seg.difficulty === 1 ? 'background:#ecfdf5;color:#047857;' : seg.difficulty === 2 ? 'background:#fffbeb;color:#b45309;' : 'background:#fff1f2;color:#be123c;';
        return `
          <button type="button" class="xhz-dict-seg-btn" data-idx="${idx}" style="display:flex;width:100%;align-items:center;gap:10px;border-radius:10px;padding:9px 10px;text-align:left;font-size:12px;cursor:pointer;border:${isCurrent ? '2px solid #d97706' : '1px solid #f5f5f4'};background:${isCurrent ? '#fffbeb' : '#fafaf9'};transition:all 0.15s;">
            <span style="display:flex;height:24px;width:24px;flex-shrink:0;align-items:center;justify-content:center;border-radius:999px;font-size:11px;font-weight:800;${badgeBg}">${badgeIcon}</span>
            <div style="min-width:0;flex:1;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-weight:700;color:#1c1917;">Câu ${idx + 1} <span style="font-weight:500;color:#78716c;font-size:11px;">(${formatMs(seg.startMs)})</span></span>
                <span style="border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;${diffLabel ? diffStyle : ''}">${diffLabel}</span>
              </div>
              <p style="margin:3px 0 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;color:#292524;">
                ${canShowText ? (seg.hanzi || '') : `••• (${(seg.hanziChars || []).length} chữ Hán)`}
              </p>
              ${canShowText && seg.vi ? `<p style="margin:1px 0 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#78716c;">${seg.vi}</p>` : ''}
            </div>
          </button>
        `;
      }).join('');

      listEl.querySelectorAll('.xhz-dict-seg-btn').forEach(btn => {
        btn.onclick = () => {
          const targetIdx = Number(btn.getAttribute('data-idx'));
          selectSegment(targetIdx, true);
        };
      });
    }

    function renderWorkspaceStage() {
      const stageEl = document.getElementById('xhz-dict-stage');
      if (!stageEl) return;
      const seg = segments[currentIndex];
      if (!seg) {
        stageEl.innerHTML = `<div style="padding:20px;text-align:center;color:#78716c;">Chưa có dữ liệu câu cho video này.</div>`;
        return;
      }

      // Update mode buttons & video visibility for listen mode
      root.querySelectorAll('.xhz-dict-mode-btn').forEach(b => {
        const active = b.getAttribute('data-mode') === mode;
        b.style.background = active ? '#d97706' : '#f5f5f4';
        b.style.color = active ? '#fff' : '#44403c';
      });
      const pyWrap = document.getElementById('xhz-dict-pinyin-wrap');
      if (pyWrap) pyWrap.style.display = mode === 'listen' ? 'none' : 'inline-flex';
      const listenBanner = document.getElementById('xhz-dict-listen-banner');
      const videoWrap = document.getElementById('xhz-dict-video-wrap');
      if (listenBanner && videoWrap) {
        listenBanner.style.display = mode === 'listen' ? 'flex' : 'none';
        videoWrap.style.height = mode === 'listen' ? '0px' : '';
      }

      const curState = segStates[currentIndex] || { status: 'unattempted', input: '', checked: false };
      const isSubmitted = curState.checked || curState.status === 'correct' || curState.status === 'revealed';
      const hanziChars = Array.isArray(seg.hanziChars) && seg.hanziChars.length > 0
        ? seg.hanziChars
        : Array.from(seg.hanzi || '').filter(c => /[\u4e00-\u9fff]/.test(c));

      // Answer Reveal Card HTML (when submitted/revealed)
      const revealHtml = isSubmitted ? `
        <div style="margin-top:16px;border-radius:14px;border:1px solid ${curState.status === 'correct' ? '#a7f3d0' : '#fde68a'};background:${curState.status === 'correct' ? '#ecfdf5' : '#fffbeb'};padding:16px;">
          <div style="font-size:12px;font-weight:800;color:${curState.status === 'correct' ? '#047857' : '#b45309'};margin-bottom:4px;">
            ${curState.status === 'correct' ? '✓ Chính xác! Bạn nghe và chép rất chuẩn.' : 'Đáp án đúng của câu này:'}
          </div>
          <div style="font-size:26px;font-weight:800;color:#1c1917;letter-spacing:0.03em;">${seg.hanzi || ''}</div>
          ${seg.pinyin ? `<div style="font-size:15px;font-weight:600;color:#b45309;margin-top:4px;">/${seg.pinyin}/</div>` : ''}
          ${seg.hanviet ? `<div style="font-size:12px;color:#57534e;margin-top:4px;">Hán Việt: <strong style="text-transform:uppercase;color:#1c1917;">${seg.hanviet}</strong></div>` : ''}
          ${seg.vi ? `<div style="font-size:15px;color:#1c1917;margin-top:6px;">Nghĩa: <strong>${seg.vi}</strong></div>` : ''}
          <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" id="xhz-dict-rev-replay" style="border-radius:8px;border:1px solid #d6d3d1;background:#fff;padding:7px 14px;font-size:13px;font-weight:700;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
            <button type="button" id="xhz-dict-rev-retry" style="border-radius:8px;border:1px solid #d6d3d1;background:#fff;padding:7px 14px;font-size:13px;font-weight:700;color:#1c1917;cursor:pointer;">⟲ Thử lại câu này</button>
            <button type="button" id="xhz-dict-rev-next" style="border-radius:8px;border:none;background:#1c1917;padding:7px 16px;font-size:13px;font-weight:700;color:#fff;cursor:pointer;">Câu tiếp theo →</button>
          </div>
        </div>
      ` : '';

      if (mode === 'listen') {
        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p style="margin:0;font-size:14px;color:#57534e;">Nghe câu thoại và tự nhẩm trong đầu, sau đó bấm <strong>Hiện đáp án</strong> để đối chiếu chữ Hán, Pinyin và nghĩa tiếng Việt.</p>
            ${!isSubmitted ? `
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" id="xhz-dict-btn-reveal" style="border-radius:10px;border:none;background:#d97706;padding:10px 18px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;">Hiện đáp án</button>
                <button type="button" id="xhz-dict-btn-replay2" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:10px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
                <button type="button" id="xhz-dict-btn-slow" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:10px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">🐢 Chậm (0.75×)</button>
              </div>
            ` : ''}
            ${revealHtml}
          </div>
        `;
      } else if (mode === 'blank') {
        const targets = getDictationBlankTargets(seg);
        const targetByIndex = new Map(targets.map(target => [target.index, target]));
        const blankValues = curState.blankInputs && typeof curState.blankInputs === 'object' ? curState.blankInputs : {};
        const escapeInput = value => String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const fullChars = Array.from(seg.hanzi || '');
        let hCounter = -1;
        const sentenceWithBlankHtml = fullChars.map(ch => {
          if (/[\u4e00-\u9fff]/.test(ch)) {
            hCounter++;
            if (targetByIndex.has(hCounter)) {
              const first = hCounter === targets[0].index;
              const value = blankValues[hCounter] !== undefined ? blankValues[hCounter] : targets.length === 1 ? curState.input || '' : '';
              return `<input type="text" id="xhz-dict-blank-input${first ? '' : '-' + hCounter}" class="xhz-dict-blank-input" data-blank-index="${hCounter}" aria-label="Điền chữ Hán thứ ${hCounter + 1}${pinyinMode ? ' hoặc phiên âm tương ứng' : ''}" value="${escapeInput(value)}" ${isSubmitted ? 'disabled' : ''} placeholder="${pinyinMode ? 'pinyin' : '?'}" style="width:${pinyinMode ? '96px' : '56px'};margin:0 6px;border:none;border-bottom:2px solid #d97706;background:#fffbeb;padding:2px 6px;text-align:center;font-size:22px;font-weight:800;color:#1c1917;outline:none;" />`;
            }
          }
          return `<span>${ch}</span>`;
        }).join('');

        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${pinyinMode && targets.some(target => !target.pinyin) ? '<p style="margin:0;font-size:13px;color:#92400e;">Một số ô chưa có phiên âm được căn theo chữ. Vui lòng nhập chữ Hán vào những ô này.</p>' : ''}
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:2px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;padding:16px;font-size:24px;font-weight:700;color:#1c1917;line-height:1.8;">
              ${sentenceWithBlankHtml}
            </div>
            ${!isSubmitted ? `
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" id="xhz-dict-btn-check" style="border-radius:10px;border:none;background:#d97706;padding:9px 18px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;">Kiểm tra</button>
                <button type="button" id="xhz-dict-btn-replay2" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
                <button type="button" id="xhz-dict-btn-slow" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">🐢 Chậm (0.75×)</button>
                <button type="button" id="xhz-dict-btn-skip" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#78716c;cursor:pointer;">Bỏ qua</button>
              </div>
            ` : ''}
            ${revealHtml}
          </div>
        `;

        const blankInputs = [...stageEl.querySelectorAll('.xhz-dict-blank-input')];
        const readBlankInputs = () => Object.fromEntries(blankInputs.map(input => [Number(input.getAttribute('data-blank-index')), input.value.trim()]));
        const checkBlank = () => {
          const values = readBlankInputs();
          const ok = targets.length > 0 && targets.every(target => isDictationBlankCorrect(target, values[target.index], pinyinMode));
          segStates[currentIndex] = { status: ok ? 'correct' : 'wrong', input: targets.map(target => values[target.index] || '').join(' '), blankInputs: values, checked: true };
          persistDictState();
          renderAllDictationUI();
        };
        if (blankInputs.length && !isSubmitted) {
          blankInputs[0].focus();
          blankInputs.forEach(blankInput => { blankInput.oninput = () => {
            segStates[currentIndex] = { ...curState, blankInputs: readBlankInputs() };
            persistDictState();
          }; blankInput.onkeydown = e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              checkBlank();
            }
          }; });
        }
        const btnCheck = document.getElementById('xhz-dict-btn-check');
        if (btnCheck) btnCheck.onclick = checkBlank;
      } else {
        // FULL DICTATION MODE (Gõ hết)
        const userCleanChars = Array.from(normalizeHanziCompare(curState.input || ''));
        const slotsHtml = hanziChars.map((ch, idx) => {
          let charDisplay = '·';
          let slotStyle = 'border:1px solid #d6d3d1;background:#fafaf9;color:#a8a29e;';
          if (isSubmitted) {
            charDisplay = ch;
            const matchedChar = userCleanChars[idx] === ch || (curState.status === 'correct');
            slotStyle = matchedChar
              ? 'border:1px solid #34d399;background:#ecfdf5;color:#065f46;'
              : 'border:1px solid #fda4af;background:#fff1f2;color:#9f1239;';
          } else if (idx < hintRevealedCount) {
            charDisplay = ch;
            slotStyle = 'border:1px solid #fcd34d;background:#fffbeb;color:#92400e;';
          }
          return `<span style="display:inline-flex;height:38px;width:38px;align-items:center;justify-content:center;border-radius:8px;font-size:18px;font-weight:700;${slotStyle}">${charDisplay}</span>`;
        }).join('');

        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;">
              ${slotsHtml}
            </div>
            ${hintRevealedCount > 0 && !isSubmitted ? `
              <div style="font-size:13px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:6px 12px;">
                💡 Gợi ý Pinyin: <strong>/${seg.pinyin || ''}/</strong> — Nghĩa: ${seg.vi || ''}
              </div>
            ` : ''}
            <div>
              <textarea id="xhz-dict-full-input" rows="2" ${isSubmitted ? 'disabled' : ''} placeholder="${pinyinMode ? 'Gõ phiên âm Pinyin bạn nghe được (ví dụ: da jia hao)... (Enter để kiểm tra)' : 'Gõ câu tiếng Trung bạn nghe được... (Enter để kiểm tra)'}" style="width:100%;border-radius:12px;border:1px solid #d6d3d1;background:#fff;padding:10px 14px;font-size:16px;color:#1c1917;outline:none;resize:vertical;">${curState.input || ''}</textarea>
            </div>
            ${!isSubmitted ? `
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" id="xhz-dict-btn-check" style="border-radius:10px;border:none;background:#d97706;padding:9px 18px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;">Kiểm tra</button>
                <button type="button" id="xhz-dict-btn-replay2" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
                <button type="button" id="xhz-dict-btn-slow" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">🐢 Chậm (0.75×)</button>
                <button type="button" id="xhz-dict-btn-hint" style="border-radius:10px;border:1px solid #fde68a;background:#fffbeb;padding:9px 14px;font-size:14px;font-weight:700;color:#92400e;cursor:pointer;">💡 Gợi ý (${hintRevealedCount}/${hanziChars.length})</button>
                <button type="button" id="xhz-dict-btn-skip" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#78716c;cursor:pointer;">Bỏ qua</button>
              </div>
            ` : ''}
            ${revealHtml}
          </div>
        `;

        const fullInput = document.getElementById('xhz-dict-full-input');
        const checkFull = () => {
          const val = (fullInput ? fullInput.value : '').trim();
          const expectedHz = normalizeHanziCompare(seg.hanzi || '');
          const givenHz = normalizeHanziCompare(val);
          const expectedPy = normalizePinyinCompare(seg.pinyin || '');
          const givenPy = normalizePinyinCompare(val);
          const ok = val.length > 0 && (givenHz === expectedHz || (expectedPy && givenPy === expectedPy));
          segStates[currentIndex] = { status: ok ? 'correct' : 'wrong', input: val, checked: true };
          persistDictState();
          renderAllDictationUI();
        };
        if (fullInput && !isSubmitted) {
          fullInput.onkeydown = e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              checkFull();
            }
          };
        }
        const btnCheck = document.getElementById('xhz-dict-btn-check');
        if (btnCheck) btnCheck.onclick = checkFull;
        const btnHint = document.getElementById('xhz-dict-btn-hint');
        if (btnHint) {
          btnHint.onclick = () => {
            if ( fullInput ) {
              segStates[currentIndex] = { ...(segStates[currentIndex] || {}), input: fullInput.value };
            }
            hintRevealedCount = Math.min(hanziChars.length, hintRevealedCount + 1);
            renderWorkspaceStage();
          };
        }
      }

      // Wire common stage buttons
      const btnReplay2 = document.getElementById('xhz-dict-btn-replay2');
      if (btnReplay2) btnReplay2.onclick = () => playCurrentSegment();
      const btnSlow = document.getElementById('xhz-dict-btn-slow');
      if (btnSlow) btnSlow.onclick = () => playCurrentSegment(0.75);
      const btnSkip = document.getElementById('xhz-dict-btn-skip');
      if (btnSkip) {
        btnSkip.onclick = () => {
          segStates[currentIndex] = { status: 'revealed', input: curState.input || '', checked: true };
          persistDictState();
          renderAllDictationUI();
        };
      }
      const btnReveal = document.getElementById('xhz-dict-btn-reveal');
      if (btnReveal) {
        btnReveal.onclick = () => {
          segStates[currentIndex] = { status: 'revealed', input: '', checked: true };
          persistDictState();
          renderAllDictationUI();
        };
      }
      const btnRevReplay = document.getElementById('xhz-dict-rev-replay');
      if (btnRevReplay) btnRevReplay.onclick = () => playCurrentSegment();
      const btnRevRetry = document.getElementById('xhz-dict-rev-retry');
      if (btnRevRetry) {
        btnRevRetry.onclick = () => {
          segStates[currentIndex] = { status: 'unattempted', input: '', checked: false };
          hintRevealedCount = 0;
          persistDictState();
          renderAllDictationUI();
          playCurrentSegment();
        };
      }
      const btnRevNext = document.getElementById('xhz-dict-rev-next');
      if (btnRevNext) {
        btnRevNext.onclick = () => {
          selectSegment((currentIndex + 1) % segments.length, true);
        };
      }
    }

    function renderAllDictationUI() {
      renderWorkspaceStage();
      renderSegmentList();
    }

    renderAllDictationUI();
  }

  // --------------------------------------------------------------------------
  // 6.8. Trang Làm Đề Thi HSK / YCT (/kiem-tra-hsk/... và /de-kiem-tra/lam-bai/:id)
  // --------------------------------------------------------------------------
  async function renderHskTestPaperPage(pathname) {
    const root = getMainContentContainer();
    const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    root.innerHTML = '<p style="padding:32px;text-align:center;">Đang tải đề thi...</p>';
    const parts = pathname.split('/').filter(Boolean);
    const paperId = decodeURIComponent(parts[parts.length - 1] || '');
    const paper = await loadTestPaperById(paperId);
    if (!paper) {
      const level = (paperId.match(/^hsk([1-6])$/) || [])[1];
      const index = level && await loadLocalJson('/data/tests/papers-hsk.json');
      const entry = index && Array.isArray(index.levels) && index.levels.find(item => String(item.level) === level);
      if (entry && entry.items && entry.items.length) {
        root.innerHTML = `<h1 style="font-size:28px;font-weight:800;">Đề thi HSK cấp ${level}</h1><p><a href="/kiem-tra-hsk">← Phòng thi HSK</a></p><div style="display:grid;gap:12px;margin-top:20px;">${entry.items.map(item => `<a href="/kiem-tra-hsk/hsk${level}/test/${encodeURIComponent(item.testId || item.id)}" style="padding:18px;border:1px solid #e7e5e4;border-radius:14px;">${escape(item.title || item.name || item.testId)}</a>`).join('')}</div>`;
      } else root.innerHTML = '<h1>Không tìm thấy đề thi</h1><p>Đề thi này chưa có dữ liệu. <a href="/kiem-tra-hsk">Quay lại phòng thi HSK</a></p>';
      return;
    }
    const questions = Array.isArray(paper.questions) && paper.questions.length ? paper.questions : (paper.sections || []).flatMap(section => section.questions || []);
    const title = paper.title || paper.name || paper.testId || paperId;
    const durationMinutes = Math.max(1, Number(paper.durationMinutes) || 40);
    const questionKey = (question, index) => String(question.id || question.questionId || question.number || index + 1);
    const answerKey = question => {
      if (question.type === 'writing_essay' || question.kind === 'writing_essay') return null;
      for (const field of ['correctAnswer', 'answer', 'correctOption']) {
        if (question[field] !== undefined && question[field] !== null && String(question[field]).trim() !== '') return String(question[field]).trim();
      }
      return null;
    };
    const gradableCount = questions.filter(question => answerKey(question) !== null).length;
    const normalize = value => String(value || '').trim().toLocaleLowerCase().replace(/[\s\p{P}]+/gu, '');
    const identityKey = typeof getStudyStateStorageKey === 'function' ? getStudyStateStorageKey() : 'httq_state:guest';
    const storageKey = `${identityKey}:hsk-paper:${paperId}`;
    let attempt = null;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.paperId === paperId && saved.answers && typeof saved.answers === 'object') attempt = saved;
    } catch (_) {}
    let selectedMode = attempt && attempt.mode === 'practice' ? 'practice' : 'exam';
    let timer;
    const audioPlayers = [];
    let storageFailed = false;
    const stopPlayers = () => { audioPlayers.forEach(player => { try { player.pause(); } catch (_) {} }); audioPlayers.length = 0; };
    const stopTimer = () => { if (timer) clearInterval(timer); timer = null; };
    const saveAttempt = () => {
      try { localStorage.setItem(storageKey, JSON.stringify(attempt)); storageFailed = false; }
      catch (_) { storageFailed = true; }
      const status = root.querySelector('#xhz-exam-save-status');
      if (status) status.textContent = storageFailed ? 'Chưa lưu được bài trên thiết bị. Hãy giữ trang này mở.' : 'Đã lưu bài làm trên thiết bị này.';
      return !storageFailed;
    };
    const stylesheet = `<style>
      .xhz-exam{--exam-bg:#fff;--exam-alt:#fafaf9;--exam-text:#292524;--exam-muted:#78716c;--exam-border:#e7e5e4;color:var(--exam-text);max-width:1000px;margin:0 auto}.dark .xhz-exam{--exam-bg:#211d18;--exam-alt:#29241e;--exam-text:#f5f5f4;--exam-muted:#a8a29e;--exam-border:#57534e}
      .xhz-exam h1{font-size:28px;font-weight:800;margin:14px 0}.xhz-exam h2{font-weight:800;font-size:19px;margin:0 0 12px}.xhz-exam p{margin:10px 0}.xhz-exam .exam-panel{padding:22px;border:1px solid var(--exam-border);border-radius:18px;background:var(--exam-bg);margin:18px 0}.xhz-exam .exam-note{padding:15px 18px;border:1px solid #fbbf24;border-radius:12px;background:#fffbeb;color:#78350f;margin:18px 0;line-height:1.6}.xhz-exam .exam-muted{color:var(--exam-muted);font-size:14px}.xhz-exam .exam-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0}.xhz-exam button{padding:11px 16px;border:1px solid var(--exam-border);border-radius:11px;background:var(--exam-bg);color:var(--exam-text);font-weight:700;cursor:pointer}.xhz-exam button:disabled{opacity:.65;cursor:default}.xhz-exam .exam-primary{background:#ea580c;border-color:#ea580c;color:#fff}.xhz-exam .exam-option{display:flex;align-items:flex-start;gap:12px;border:1px solid var(--exam-border);border-radius:12px;background:var(--exam-alt);padding:13px;cursor:pointer}.xhz-exam .exam-option:has(input:checked){border-color:#ea580c;box-shadow:inset 0 0 0 1px #ea580c}.xhz-exam input[type=radio]{accent-color:#ea580c;margin-top:6px}.xhz-exam .exam-options,.xhz-exam .exam-images{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:14px 0}.xhz-exam img{max-height:160px;max-width:100%;object-fit:contain;display:block;background:#fff;border-radius:8px}.xhz-exam textarea,.xhz-exam input[type=text]{width:100%;padding:12px;border:1px solid var(--exam-border);border-radius:10px;background:var(--exam-bg);color:var(--exam-text);font-size:17px}.xhz-exam .exam-feedback{font-size:14px;margin-top:12px}.xhz-exam :focus-visible{outline:3px solid #ea580c;outline-offset:3px}@media(max-width:480px){.xhz-exam .exam-panel{padding:16px}.xhz-exam h1{font-size:24px}}
    </style>`;
    const warning = gradableCount === 0
      ? 'Chưa có đáp án chuẩn cho đề này. Bạn có thể làm và lưu lựa chọn; bài chưa được chấm điểm.'
      : gradableCount < questions.length ? `Đề có đáp án cho ${gradableCount}/${questions.length} câu. Những câu còn thiếu đáp án chưa được chấm điểm.` : '';
    const shell = body => `${stylesheet}<section class="xhz-exam"><p><a href="/kiem-tra-hsk">← Quay lại danh sách đề thi</a></p><h1>${escape(title)}</h1>${warning ? `<div class="exam-note" role="status">${warning}</div>` : ''}${body}</section>`;

    function renderLobby() {
      stopTimer(); stopPlayers();
      const inProgress = attempt && !attempt.submittedAt;
      root.innerHTML = shell(`<div class="exam-panel"><h2>Chọn chế độ</h2><p>${questions.length} câu · khoảng ${durationMinutes} phút</p>
        <div class="exam-options"><label class="exam-option"><input type="radio" name="xhz-exam-mode" value="exam" ${selectedMode === 'exam' ? 'checked' : ''}><span><strong>Thi thử</strong><p class="exam-muted">${durationMinutes} phút, không tạm dừng; mỗi đoạn nghe phát một lần.</p></span></label><label class="exam-option"><input type="radio" name="xhz-exam-mode" value="practice" ${selectedMode === 'practice' ? 'checked' : ''}><span><strong>Luyện tập</strong><p class="exam-muted">Không giới hạn thời gian; được nghe lại các đoạn âm thanh.</p></span></label></div>
        <p>Hãy đeo tai nghe. Bài làm tự lưu trên thiết bị này.</p>
        ${attempt ? `<p>${inProgress ? 'Bạn có một bài đang làm.' : 'Bạn đã lưu bài làm này.'} Đã trả lời ${Object.keys(attempt.answers).length}/${questions.length} câu.</p><button type="button" id="xhz-exam-resume" class="exam-primary">${inProgress ? 'Tiếp tục bài đang làm' : 'Xem bài đã lưu'}</button>` : ''}
        <button type="button" id="xhz-exam-start" ${attempt ? '' : 'class="exam-primary"'}>${attempt ? 'Bắt đầu bài mới' : 'Bắt đầu'}</button><p class="exam-muted" id="xhz-exam-save-status"></p></div>`);
      root.querySelectorAll('input[name="xhz-exam-mode"]').forEach(input => { input.onchange = () => { selectedMode = input.value; }; });
      const resume = root.querySelector('#xhz-exam-resume');
      if (resume) resume.onclick = renderRun;
      root.querySelector('#xhz-exam-start').onclick = () => {
        // Preserve the previous attempt before starting a fresh one.
        if (attempt) { try { localStorage.setItem(`${storageKey}:previous`, JSON.stringify(attempt)); } catch (_) {} }
        const now = Date.now();
        attempt = { paperId, mode: selectedMode, startedAt: new Date(now).toISOString(), deadlineAt: selectedMode === 'exam' ? now + durationMinutes * 60000 : null, answers: {}, heard: {}, submittedAt: null };
        saveAttempt(); renderRun();
      };
    }

    function updateQuestionFeedback(question, index, feedback) {
      const selected = attempt.answers[questionKey(question, index)];
      const expected = answerKey(question);
      if (selected === undefined) { feedback.textContent = ''; return; }
      if (expected === null) { feedback.textContent = 'Đã lưu lựa chọn. Câu này chưa có đáp án chuẩn để chấm.'; return; }
      if (attempt.mode === 'exam' && !attempt.submittedAt) { feedback.textContent = 'Đã lưu lựa chọn.'; return; }
      const isCorrect = normalize(selected) === normalize(expected);
      feedback.textContent = `${isCorrect ? '✓ Chính xác.' : `Đáp án chuẩn: ${expected}.`} ${question.explanationVi || question.explanation || ''}`;
    }

    function renderRun() {
      stopTimer(); stopPlayers();
      if (!attempt) { renderLobby(); return; }
      if (!attempt.heard || typeof attempt.heard !== 'object') attempt.heard = {};
      const isExam = attempt.mode === 'exam';
      const submitted = Boolean(attempt.submittedAt);
      const correctCount = questions.reduce((sum, question, index) => { const expected = answerKey(question); return sum + (expected !== null && attempt.answers[questionKey(question, index)] !== undefined && normalize(attempt.answers[questionKey(question, index)]) === normalize(expected) ? 1 : 0); }, 0);
      root.innerHTML = shell(`<div id="xhz-exam-run"><div class="exam-toolbar"><strong>${submitted ? 'Bài làm đã lưu' : isExam ? 'Thi thử' : 'Luyện tập'}</strong><strong id="xhz-exam-timer" aria-live="off">${isExam && !submitted ? 'Đang tính thời gian...' : 'Không giới hạn thời gian'}</strong><button type="button" id="xhz-exam-back">Về màn chọn chế độ</button></div>
        <p id="xhz-exam-save-status" class="exam-muted" role="status">${storageFailed ? 'Chưa lưu được bài trên thiết bị. Hãy giữ trang này mở.' : 'Đã lưu bài làm trên thiết bị này.'}</p>
        <p id="xhz-exam-progress">Đã trả lời ${Object.keys(attempt.answers).length}/${questions.length} câu${submitted && gradableCount ? ` · Đúng ${correctCount}/${gradableCount} câu có đáp án` : ''}${submitted && !gradableCount ? ' · Chưa chấm điểm' : ''}</p>
        ${paper.audioUrl || paper.audio ? '<div class="exam-panel" id="xhz-exam-full-audio"><h2>Âm thanh toàn đề</h2></div>' : ''}<div id="xhz-exam-questions"></div><div class="exam-toolbar"><button type="button" id="xhz-exam-submit" class="exam-primary" ${submitted ? 'disabled' : ''}>${submitted ? 'Đã lưu bài làm' : 'Nộp bài và lưu lựa chọn'}</button></div></div>`);
      const runRoot = root.querySelector('#xhz-exam-run');
      const updateProgress = () => { const progress = root.querySelector('#xhz-exam-progress'); if (progress) progress.textContent = `Đã trả lời ${Object.keys(attempt.answers).length}/${questions.length} câu`; };
      const mountAudio = (container, rawUrl, key) => {
        if (!rawUrl) return;
        const src = rewriteMediaUrl(rawUrl);
        if (!isExam) { const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'none'; audio.src = src; audio.style.cssText = 'width:100%;max-width:420px;margin:10px 0;'; container.appendChild(audio); audioPlayers.push(audio); return; }
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = attempt.heard[key] ? 'Đã phát đoạn nghe này' : 'Phát đoạn nghe (1 lần)';
        button.disabled = Boolean(attempt.heard[key]) || submitted;
        button.onclick = () => {
          const audio = new window.Audio(src); audioPlayers.push(audio); button.disabled = true;
          const failed = () => { delete attempt.heard[key]; saveAttempt(); button.disabled = false; button.textContent = 'Chưa tải được âm thanh — thử lại'; };
          audio.onerror = failed;
          audio.onended = () => { button.textContent = 'Đã phát đoạn nghe này'; };
          audio.play().then(() => { attempt.heard[key] = true; saveAttempt(); button.textContent = 'Đang phát đoạn nghe'; }).catch(failed);
        };
        container.appendChild(button);
      };
      const fullAudio = root.querySelector('#xhz-exam-full-audio');
      if (fullAudio) mountAudio(fullAudio, paper.audioUrl || paper.audio, 'full-paper');
      const list = root.querySelector('#xhz-exam-questions');
      questions.forEach((question, index) => {
        const key = questionKey(question, index);
        const number = question.number || question.questionNumber || index + 1;
        const type = question.type || question.kind || 'multiple_choice';
        const written = ['character_fill', 'writing_sentence', 'writing_essay'].includes(type);
        const images = (Array.isArray(question.images) ? question.images : []).map(rewriteMediaUrl);
        const card = document.createElement('section'); card.className = 'exam-panel';
        card.innerHTML = `<h2>Câu ${number}${question.sectionTitle ? ` · ${escape(question.sectionTitle)}` : ''}</h2>${question.instruction ? `<p class="exam-muted">${escape(question.instruction)}</p>` : ''}<p style="font-size:20px;white-space:pre-line;">${escape(question.prompt || question.question || question.stem || question.text || '')}</p>${question.pinyin || question.transcriptPinyin ? `<p class="exam-muted">${escape(question.pinyin || question.transcriptPinyin)}</p>` : ''}${question.passage ? `<p style="white-space:pre-line;">${escape(question.passage)}</p>` : ''}<div class="exam-audio"></div>${question.imageUrl || question.image ? `<img src="${escape(rewriteMediaUrl(question.imageUrl || question.image))}" alt="Minh họa câu ${number}" loading="lazy">` : ''}${type === 'image_match' && images.length ? `<div class="exam-images">${images.map((src, idx) => `<div><strong>Hình ${String.fromCharCode(65 + idx)}</strong><img src="${escape(src)}" alt="Hình ${String.fromCharCode(65 + idx)}" loading="lazy"></div>`).join('')}</div>` : ''}<div class="exam-answers"></div><p class="exam-feedback" role="status"></p>`;
        list.appendChild(card);
        mountAudio(card.querySelector('.exam-audio'), question.audio || question.audioUrl, key);
        const answerRoot = card.querySelector('.exam-answers');
        const feedback = card.querySelector('.exam-feedback');
        const saveAnswer = value => { if (value === '') delete attempt.answers[key]; else attempt.answers[key] = value; saveAttempt(); updateProgress(); updateQuestionFeedback(question, index, feedback); };
        if (written) {
          const input = document.createElement(type === 'writing_essay' ? 'textarea' : 'input');
          if (input.tagName === 'INPUT') input.type = 'text'; else input.rows = 5;
          input.setAttribute('aria-label', `Đáp án câu ${number}`); input.placeholder = type === 'writing_essay' ? 'Nhập bài viết tiếng Trung...' : 'Nhập đáp án chữ Hán...'; input.value = attempt.answers[key] || ''; input.disabled = submitted;
          input.oninput = () => saveAnswer(input.value);
          answerRoot.appendChild(input);
        } else {
          let options = Array.isArray(question.options) ? question.options : (Array.isArray(question.choices) ? question.choices : []);
          if (!options.length && type === 'true_false') options = [{ key: 'true', text: 'Đúng (对)' }, { key: 'false', text: 'Sai (错)' }];
          if (!options.length && images.length) options = images.map((_, idx) => ({ key: String.fromCharCode(65 + idx), text: `Hình ${String.fromCharCode(65 + idx)}` }));
          if (!options.length) { answerRoot.innerHTML = '<p class="exam-muted">Câu này chưa có lựa chọn trả lời trong dữ liệu.</p>'; }
          answerRoot.className += ' exam-options';
          options.forEach((option, optionIndex) => {
            const optionKey = typeof option === 'object' ? String(option.key || option.label || option.id || String.fromCharCode(65 + optionIndex)) : String.fromCharCode(65 + optionIndex);
            const text = typeof option === 'object' ? option.text || option.hanzi || option.content || option.value || `Phương án ${optionKey}` : String(option);
            const image = typeof option === 'object' && (option.image || option.imageUrl) ? rewriteMediaUrl(option.image || option.imageUrl) : type === 'image_choice' ? images[optionIndex] : '';
            const label = document.createElement('label'); label.className = 'exam-option';
            const input = document.createElement('input'); input.type = 'radio'; input.name = `xhz-exam-answer-${key}`; input.value = optionKey; input.checked = attempt.answers[key] === optionKey; input.disabled = submitted; input.setAttribute('aria-label', `Câu ${number}, ${optionKey}: ${text}`);
            const body = document.createElement('span'); body.innerHTML = `<strong>${escape(optionKey)}.</strong> ${escape(text)}${typeof option === 'object' && option.pinyin ? `<small class="exam-muted"> ${escape(option.pinyin)}</small>` : ''}${image ? `<img src="${escape(image)}" alt="Câu ${number}, phương án ${escape(optionKey)}" loading="lazy">` : ''}`;
            input.onchange = () => { if (input.checked) saveAnswer(input.value); };
            label.append(input, body); answerRoot.appendChild(label);
          });
        }
        updateQuestionFeedback(question, index, feedback);
      });
      root.querySelector('#xhz-exam-back').onclick = renderLobby;
      const finish = expired => { if (attempt.submittedAt) return; attempt.submittedAt = new Date().toISOString(); attempt.expired = Boolean(expired); saveAttempt(); renderRun(); };
      root.querySelector('#xhz-exam-submit').onclick = () => finish(false);
      if (isExam && !submitted) {
        const updateTime = () => {
          if (!runRoot.isConnected) { stopTimer(); stopPlayers(); return; }
          const seconds = Math.max(0, Math.ceil((Number(attempt.deadlineAt) - Date.now()) / 1000));
          const label = root.querySelector('#xhz-exam-timer');
          if (label) label.textContent = `Còn ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
          if (!seconds) finish(true);
        };
        updateTime();
        if (!attempt.submittedAt) timer = setInterval(updateTime, 1000);
      } else if (submitted) root.querySelector('#xhz-exam-timer').textContent = attempt.expired ? 'Hết giờ — bài làm đã kết thúc' : 'Đã kết thúc bài làm';
    }
    document.title = `${title} | Thi thử HSK`;
    renderLobby();
  }


  // 6.8b. Trang Phiên Ôn Tập SRS & Sửa Lỗi (/hoc/bai/on-tap-den-han, on-tap-loi-sai, on-tap-the-cau)
  // --------------------------------------------------------------------------
  async function renderReviewSessionPage(slug) {
    const root = getMainContentContainer();
    const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let preferences = {};
    try { preferences = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}') || {}; } catch (_) {}
    const hidePinyin = Boolean(preferences.hidePinyinInReview);
    getRealProgressSummary(); // Enrol real words from existing v10 progress on direct entry.
    const state = getLocalState();
    const allCards = Array.isArray(state.collections && state.collections.reviewCards) ? state.collections.reviewCards : [];
    const due = allCards.filter(card => Date.parse(card.dueAt) <= Date.now());
    const mistakes = allCards.filter(card => card.wrongCount > 0 && card.correctStreak < 2 && !card.dismissed);
    const sentences = due.filter(card => card.itemKey.startsWith('s:'));
    const isMistakeMode = slug.includes('loi-sai');
    const isSentenceMode = slug.includes('the-cau');
    const sourceCards = isMistakeMode ? mistakes : isSentenceMode ? sentences : due;
    const title = isMistakeMode ? 'Ôn lỗi sai' : isSentenceMode ? 'Luyện thẻ câu' : 'Ôn bài đến hạn';
    document.title = `${title} | Ôn tập XieHanzi`;
    root.innerHTML = `<div id="xhz-review-session-root" style="max-width:920px;margin:0 auto;color:#1c1917;">
      <a href="/on-tap" style="display:inline-block;margin-bottom:18px;color:#ea580c;font-weight:700;">← Quay lại Trung tâm Ôn tập</a>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
        <a href="/hoc/bai/on-tap-den-han" style="padding:8px 14px;border:1px solid #fed7aa;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:700;">Ôn đến hạn (${due.length})</a>
        <a href="/hoc/bai/on-tap-loi-sai" style="padding:8px 14px;border:1px solid #fed7aa;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:700;">Ôn lỗi sai (${mistakes.length})</a>
        <a href="/hoc/bai/on-tap-the-cau" style="padding:8px 14px;border:1px solid #fed7aa;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:700;">Thẻ câu (${sentences.length})</a>
      </div>
      <div style="padding:20px 24px;border:1px solid #fed7aa;border-radius:22px;background:#fff7ed;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
        <div><h1 style="font-size:24px;font-weight:800;margin:0 0 6px;">${title}</h1>
          <p style="margin:0;color:#57534e;">${sourceCards.length} thẻ từ lịch sử học của bạn${isMistakeMode ? ' · Mỗi lỗi cần hai lượt đúng liên tiếp để khắc phục' : ''}</p></div>
        <div id="xhz-review-progress-badge" style="padding:10px 18px;border-radius:14px;background:#fff;color:#9a3412;font-weight:800;">Đã luyện: 0 / ${sourceCards.length}</div>
      </div>
      <div id="xhz-review-status" role="status" aria-live="polite" style="margin:12px 0;color:#b91c1c;"></div>
      <div id="xhz-review-body" style="padding:24px;border:1px solid #e7e5e4;border-radius:22px;background:#fff;">Đang tải thẻ ôn tập...</div>
    </div>`;
    const bodyEl = root.querySelector('#xhz-review-body');
    const statusEl = root.querySelector('#xhz-review-status');
    const badgeEl = root.querySelector('#xhz-review-progress-badge');
    if (!sourceCards.length) {
      bodyEl.innerHTML = `<div style="padding:24px;text-align:center;line-height:1.7;">
        <h2 style="font-size:20px;font-weight:800;">${isMistakeMode ? 'Bạn chưa có lỗi cần ôn.' : isSentenceMode ? 'Chưa có thẻ câu đến hạn.' : 'Bạn đã ôn hết các thẻ đến hạn.'}</h2>
        <p style="color:#57534e;">Kết quả từ các bài học và bài luyện sẽ được lưu vào lịch ôn của bạn.</p>
        <a href="/hoc" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#ea580c;color:#fff;font-weight:700;">Tiếp tục học</a>
      </div>`;
      return;
    }
    const items = await Promise.all(sourceCards.map(async card => {
      const content = card.content || {};
      const text = content.hanzi || content.text || card.itemKey.replace(/^[a-z]:/, '');
      let info = null;
      if (card.itemKey.startsWith('c:')) info = await lookupCharacter(text);
      else if (card.itemKey.startsWith('w:')) info = await lookupWord(text);
      let grammar = null;
      if (card.itemKey.startsWith('g:')) {
        const grammarId = card.itemKey.slice(2);
        const files = ['hsk-level-1', 'hsk-level-2', 'hsk-level-3', 'hsk-level-4', 'hsk-level-5', 'hsk-level-6', 'new-hsk-level-1', 'new-hsk-level-2', 'new-hsk-level-3'];
        for (const file of files) {
          const data = await loadLocalJson(`/data/grammar/${file}.json`);
          grammar = data && Array.isArray(data.items) && data.items.find(item => item.id === grammarId || item.code === grammarId);
          if (grammar) break;
        }
      }
      const example = info && Array.isArray(info.examples) ? info.examples[0] : null;
      const pinyin = content.pinyin || (info && (info.pinyin || info.wordPinyin || (Array.isArray(info.pinyins) && info.pinyins.join(' ')))) || '';
      return { ...card, id: `${card.itemKey}|${card.skill}`, hanzi: (grammar && (grammar.pattern || grammar.title)) || text,
        pinyin, meaningVi: content.meaningVi || content.translationVi || (info && (info.meaningVi || info.wordMeaningVi)) || (grammar && (grammar.explanation || grammar.summary)) || '',
        audioUrl: content.audioUrl || (info && (info.audioUrl || (Array.isArray(info.audios) && info.audios[0]))) || '',
        exampleZh: example && (example.hanzi || example.chinese) || '', exampleVi: example && (example.vietnamese || example.meaningVi) || '' };
    }));
    const index = (await loadLocalJson('/data/vocabulary/index.json')) || [];
    const vocabulary = Array.isArray(index) ? index : [];
    const completed = new Set();
    const pending = new Set();
    async function record(item, outcome, detail = {}) {
      if (pending.has(item.id)) return false;
      pending.add(item.id); statusEl.textContent = '';
      const signalId = window.crypto && typeof window.crypto.randomUUID === 'function' ? window.crypto.randomUUID() : `review-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const signal = { signalId, itemKey: item.itemKey, skill: item.skill || 'meaning', outcome, ts: new Date().toISOString(), source: 'srs_review',
        detail: { hanzi: item.hanzi, pinyin: item.pinyin, meaningVi: item.meaningVi, audioUrl: item.audioUrl, ...detail } };
      try {
        const url = new URL('/v2/review/signals', window.location.origin);
        const response = await handlePersistentApi(url.pathname, url, { body: JSON.stringify({ signals: [signal] }) }, 'POST');
        if (!response || !response.ok) throw new Error('Chưa lưu được kết quả. Hãy thử lại; thẻ vẫn đang ở đây.');
        completed.add(item.id);
        badgeEl.textContent = `Đã luyện: ${completed.size} / ${items.length}`;
        return true;
      } catch (error) { statusEl.textContent = error.message || 'Chưa lưu được kết quả. Hãy thử lại.'; return false; }
      finally { pending.delete(item.id); }
    }
    const buttonStyle = 'padding:11px 14px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;';
    const normalize = text => String(text || '').toLowerCase().normalize('NFD').replace(/u\u0308/g, 'v').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\u3400-\u9fff]/g, '');
    const play = item => playPronunciation(item.hanzi, item.audioUrl);
    function populateQuiz(container) {
      items.forEach((item, itemIndex) => {
        const testsSound = ['sound', 'pinyin'].includes(item.skill) && Boolean(item.pinyin);
        const answer = testsSound ? item.pinyin : item.meaningVi || item.hanzi;
        const pool = vocabulary.map(word => testsSound ? word.p : word.m).filter(value => value && value !== answer);
        const options = [answer, ...new Set(pool)].slice(0, 4);
        const rotation = itemIndex % options.length;
        const choices = [...options.slice(rotation), ...options.slice(0, rotation)];
        const row = document.createElement('div');
        row.style.cssText = 'padding:18px;border:1px solid #e7e5e4;border-radius:16px;background:#fafaf9;';
        row.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px;">
          <div><strong style="font-size:24px;">${answer === item.hanzi ? 'Nghe rồi chọn đáp án đúng' : escape(item.hanzi)}</strong>
            ${!hidePinyin && !testsSound && answer !== item.hanzi ? `<div style="color:#ea580c;">${escape(item.pinyin)}</div>` : ''}
            ${isMistakeMode ? `<div style="font-size:13px;color:#78716c;">${item.wrongCount} lượt sai · Đã đúng liên tiếp ${item.correctStreak}/2</div>` : ''}</div>
          <button class="xhz-mc-audio" style="${buttonStyle}">🔊 Nghe</button></div>
          <div class="xhz-mc-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;"></div>
          <div class="xhz-mc-feedback" role="status" style="margin-top:10px;font-weight:700;"></div>`;
        row.querySelector('.xhz-mc-audio').onclick = () => play(item);
        const optionsEl = row.querySelector('.xhz-mc-opts');
        const feedback = row.querySelector('.xhz-mc-feedback');
        let answered = false;
        choices.forEach(choice => {
          const button = document.createElement('button'); button.style.cssText = buttonStyle; button.textContent = choice;
          button.onclick = async () => {
            if (answered || pending.has(item.id)) return;
            const correct = choice === answer;
            if (!await record(item, correct ? 'correct' : 'wrong', { mode: 'multiple_choice', given: choice, expected: answer })) return;
            answered = true;
            optionsEl.querySelectorAll('button').forEach(option => { option.disabled = true; option.style.opacity = '0.8'; });
            button.style.background = correct ? '#dcfce7' : '#fee2e2'; button.style.borderColor = correct ? '#16a34a' : '#dc2626';
            feedback.style.color = correct ? '#15803d' : '#b91c1c';
            feedback.textContent = correct ? 'Chính xác! Đã lưu vào lịch ôn.' : `Đáp án: ${answer}. Đã lưu để bạn ôn lại.`;
          };
          optionsEl.appendChild(button);
        });
        container.appendChild(row);
      });
    }
    function populateTyping(container) {
      items.forEach(item => {
        const row = document.createElement('div'); row.style.cssText = 'padding:18px;border:1px solid #e7e5e4;border-radius:16px;background:#fafaf9;';
        row.innerHTML = `<div style="margin-bottom:12px;font-weight:700;">${escape(item.meaningVi || 'Nghe rồi gõ lại chữ/câu')}</div>
          <button class="xhz-type-audio" style="${buttonStyle}margin-bottom:12px;">🔊 Nghe gợi ý</button>
          <div style="display:flex;flex-wrap:wrap;gap:10px;"><input class="xhz-type-input" aria-label="Câu trả lời" placeholder="Nhập chữ Hán hoặc pinyin..." style="flex:1;min-width:180px;padding:10px 14px;border:1px solid #d6d3d1;border-radius:10px;color:#1c1917;background:#fff;" />
            <button class="xhz-type-check" style="${buttonStyle}background:#ea580c;color:#fff;border-color:#ea580c;">Kiểm tra</button></div>
          <div class="xhz-type-feedback" role="status" style="margin-top:10px;font-weight:700;"></div>`;
        row.querySelector('.xhz-type-audio').onclick = () => play(item);
        const input = row.querySelector('.xhz-type-input'); const button = row.querySelector('.xhz-type-check');
        button.onclick = async () => {
          const value = normalize(input.value); if (!value || button.disabled || pending.has(item.id)) return;
          const correct = value === normalize(item.hanzi) || Boolean(item.pinyin && value === normalize(item.pinyin));
          if (!await record(item, correct ? 'correct' : 'wrong', { mode: 'typing', given: input.value, expected: item.hanzi })) return;
          button.disabled = true; input.disabled = true;
          const feedback = row.querySelector('.xhz-type-feedback'); feedback.style.color = correct ? '#15803d' : '#b91c1c';
          feedback.textContent = `${correct ? 'Chính xác!' : 'Đáp án:'} ${item.hanzi}${item.pinyin ? ` (${item.pinyin})` : ''} — Đã lưu vào lịch ôn.`;
        };
        input.onkeydown = event => { if (event.key === 'Enter') button.click(); };
        container.appendChild(row);
      });
    }
    bodyEl.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px;">
      <button class="xhz-rev-tab" data-tab="srs" style="${buttonStyle}">🗂️ Thẻ lật SRS</button>
      <button class="xhz-rev-tab" data-tab="mc" style="${buttonStyle}">🎯 Trắc nghiệm</button>
      <button class="xhz-rev-tab" data-tab="typing" style="${buttonStyle}">⌨️ Tự gõ</button></div>
      <div id="xhz-rev-panel-srs" style="max-width:580px;margin:auto;text-align:center;"></div>
      <div id="xhz-rev-panel-mc" style="display:none;flex-direction:column;gap:14px;"></div>
      <div id="xhz-rev-panel-typing" style="display:none;flex-direction:column;gap:14px;"></div>`;
    const srsPanel = bodyEl.querySelector('#xhz-rev-panel-srs');
    let currentIndex = 0;
    function renderCard() {
      const item = items[currentIndex];
      if (!item) { srsPanel.innerHTML = '<div style="padding:30px;font-weight:700;line-height:1.8;">Đã lưu kết quả của toàn bộ thẻ trong phiên này.<br/><a href="/on-tap" style="color:#ea580c;">Xem lịch ôn mới →</a></div>'; return; }
      let flipped = false;
      const goodDays = [1, 3, 7, 14, 30][Math.min(4, item.correctStreak || 0)];
      srsPanel.innerHTML = `<div style="margin-bottom:12px;color:#78716c;font-weight:700;">Thẻ ${currentIndex + 1} / ${items.length}</div>
        <button id="xhz-srs-card" style="width:100%;padding:32px 24px;min-height:250px;border-radius:22px;border:2px solid #fdba74;background:#fff7ed;color:#1c1917;cursor:pointer;">
          <div style="font-size:48px;font-weight:800;overflow-wrap:anywhere;">${escape(item.hanzi)}</div>
          <div class="xhz-srs-pinyin" style="font-size:20px;color:#ea580c;margin-top:10px;">${hidePinyin ? '' : escape(item.pinyin)}</div>
          <div id="xhz-srs-back" style="display:none;margin-top:16px;padding-top:14px;border-top:1px dashed #fdba74;">
            <div style="font-size:22px;font-weight:700;">${escape(item.meaningVi)}</div>
            ${item.exampleZh ? `<div style="font-size:15px;margin-top:8px;">${escape(item.exampleZh)} ${escape(item.exampleVi)}</div>` : ''}
          </div><div style="margin-top:16px;font-size:13px;color:#9a3412;">Bấm để lật thẻ và đánh giá mức độ nhớ</div></button>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;"><button id="xhz-srs-speak" style="${buttonStyle}">🔊 Nghe</button><button id="xhz-srs-flip" style="${buttonStyle}">Lật thẻ</button></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px;">
          ${[['again', 'Quên', '1 phút'], ['hard', 'Khó', '10 phút'], ['good', 'Tốt', `${goodDays} ngày`], ['easy', 'Dễ', `${Math.max(4, goodDays)} ngày`]].map(([grade, label, interval]) => `<button class="xhz-srs-grade" data-grade="${grade}" disabled style="${buttonStyle}opacity:0.5;padding:12px 4px;">${label}<div style="font-size:11px;margin-top:4px;">${interval}</div></button>`).join('')}
        </div>`;
      const flip = () => {
        flipped = !flipped; srsPanel.querySelector('#xhz-srs-back').style.display = flipped ? 'block' : 'none';
        srsPanel.querySelector('.xhz-srs-pinyin').textContent = hidePinyin && !flipped ? '' : item.pinyin;
        srsPanel.querySelectorAll('.xhz-srs-grade').forEach(button => { button.disabled = !flipped; button.style.opacity = flipped ? '1' : '0.5'; });
      };
      srsPanel.querySelector('#xhz-srs-card').onclick = flip; srsPanel.querySelector('#xhz-srs-flip').onclick = flip;
      srsPanel.querySelector('#xhz-srs-speak').onclick = () => play(item);
      srsPanel.querySelectorAll('.xhz-srs-grade').forEach(button => {
        button.onclick = async () => {
          if (!flipped || pending.has(item.id)) return;
          const grade = button.getAttribute('data-grade');
          const outcome = grade === 'again' ? 'wrong' : grade === 'hard' ? 'partial' : 'correct';
          if (await record(item, outcome, { mode: 'flashcard', grade })) { currentIndex++; renderCard(); }
        };
      });
    }
    renderCard();
    populateQuiz(bodyEl.querySelector('#xhz-rev-panel-mc'));
    populateTyping(bodyEl.querySelector('#xhz-rev-panel-typing'));
    function switchTab(tab) {
      bodyEl.querySelectorAll('.xhz-rev-tab').forEach(button => { const active = button.getAttribute('data-tab') === tab; button.style.background = active ? '#ea580c' : '#fff'; button.style.color = active ? '#fff' : '#1c1917'; });
      for (const name of ['srs', 'mc', 'typing']) bodyEl.querySelector(`#xhz-rev-panel-${name}`).style.display = tab === name ? name === 'srs' ? 'block' : 'flex' : 'none';
    }
    bodyEl.querySelectorAll('.xhz-rev-tab').forEach(button => { button.onclick = () => switchTab(button.getAttribute('data-tab')); });
    const tab = isMistakeMode ? 'mc' : preferences.reviewFormat === 'typing' ? 'typing' : preferences.reviewFormat === 'multiple_choice' ? 'mc' : 'srs';
    switchTab(tab);
  }


  // 6.8c. Trang Tiến Độ & Thói Quen (/hoc/tien-do, /hoc/thoi-quen) & Tra Chữ Bộ Thủ
  // --------------------------------------------------------------------------
  async function renderProgressOrHabitPage(pathname) {
    const root = getMainContentContainer();
    const isHabit = pathname.includes('thoi-quen');
    const sum = getRealProgressSummary();
    document.title = isHabit ? 'Thói quen học tập | XieHanzi' : 'Tiến độ học tập HSK | XieHanzi';
    root.innerHTML = `
      <div style="max-width:900px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <a href="/hoc" style="color:#ea580c;font-weight:800;text-decoration:none;">← Quay lại Trang Học (/hoc)</a>
          <div style="display:flex;gap:8px;">
            <a href="/hoc/tien-do" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;background:${!isHabit ? '#ea580c' : '#fff'};color:${!isHabit ? '#fff' : '#44403c'};border:1px solid ${!isHabit ? '#ea580c' : '#e7e5e4'};">📊 Tiến độ HSK</a>
            <a href="/hoc/thoi-quen" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;background:${isHabit ? '#ea580c' : '#fff'};color:${isHabit ? '#fff' : '#44403c'};border:1px solid ${isHabit ? '#ea580c' : '#e7e5e4'};">🔥 Chuỗi ngày học</a>
            <a href="/on-tap" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;">🔄 Ôn tập</a>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:22px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">
            ${isHabit ? `🔥 Chuỗi thói quen: ${sum.streakDays} ngày liên tiếp` : '📊 Tiến độ chinh phục Giáo trình Chuẩn HSK 1'}
          </h1>
          <p style="color:#57534e;margin:0 0 20px 0;font-size:14px;">
            Mục tiêu mỗi ngày: 15 phút · Đã hoàn thành hôm nay: ${sum.todayMinutes} / 15 phút · Từ vựng đã mở khóa: ${sum.wordsSeen} / 300 từ HSK 1
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px;">
            <div style="padding:16px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;">
              <div style="font-size:12px;font-weight:700;color:#9a3412;">CHUỖI NGÀY HỌC</div>
              <div style="font-size:28px;font-weight:800;color:#ea580c;margin-top:4px;">${sum.streakDays} ngày 🔥</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;">Kỷ lục dài nhất: ${sum.longestStreak} ngày</div>
            </div>
            <div style="padding:16px;border-radius:16px;background:#f0fdf4;border:1px solid #bbf7d0;">
              <div style="font-size:12px;font-weight:800;color:#166534;">TỪ ĐÃ THUỘC</div>
              <div style="font-size:28px;font-weight:800;color:#15803d;margin-top:4px;">${sum.wordsMastered} từ</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;"><a href="/hoc/tu-da-hoc" style="color:#15803d;font-weight:700;">Xem danh sách từ →</a></div>
            </div>
            <div style="padding:16px;border-radius:16px;background:#fef2f2;border:1px solid #fecaca;">
              <div style="font-size:12px;font-weight:700;color:#991b1b;">MỤC CẦN ÔN LẠI</div>
              <div style="font-size:28px;font-weight:800;color:#dc2626;margin-top:4px;">${sum.dueTotal} thẻ</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;"><a href="/hoc/bai/on-tap-den-han" style="color:#dc2626;font-weight:700;">Ôn bài đến hạn ngay →</a></div>
            </div>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="/hoc/bai/hsk30.L1.P1.learn.1" style="padding:12px 22px;border-radius:14px;background:#ea580c;color:#fff;font-weight:800;text-decoration:none;">▶ Tiếp tục học Bài 1</a>
            <a href="/hoc/bai/on-tap-den-han" style="padding:12px 22px;border-radius:14px;background:#ffedd5;color:#9a3412;border:1px solid #fdba74;font-weight:800;text-decoration:none;">🔄 Ôn bài đến hạn (${sum.dueTotal})</a>
            <a href="/hoc/so-loi" style="padding:12px 22px;border-radius:14px;background:#fafaf9;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;text-decoration:none;">📓 Xem Sổ lỗi (${sum.mistakesCount})</a>
          </div>
        </div>
      </div>
    `;
  }

  async function renderCharacterBrowseSubPage(pathname) {
    const root = getMainContentContainer();
    const parts = pathname.split('/').filter(Boolean);
    const type = parts[1];
    let value = '';
    try { value = decodeURIComponent(parts.slice(2).join('/')); } catch (_) {}
    const index = await loadLocalJson('/data/characters/index.json');
    const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const level = /^\d+$/.test(value) ? Number(value) : null;
    const entries = Array.isArray(index) ? index.filter(item => type === 'hsk'
      ? level !== null && Number(item.hsk) === level
      : type === 'bo-thu' && item.r === value) : [];
    const title = type === 'hsk' ? `Chữ Hán HSK ${level || value} (HSK 2.0)` : `Chữ Hán bộ ${value}`;
    document.title = `${title} | XieHanzi`;
    root.innerHTML = `<style>
      #xhz-character-browse { --browse-ink:#1c1917;--browse-card:#fafaf9;--browse-border:#d6d3d1;color:var(--browse-ink); }
      html.dark #xhz-character-browse { --browse-ink:#f3ede2;--browse-card:#292420;--browse-border:#57534e; }
      #xhz-character-browse input,#xhz-character-browse select,#xhz-character-browse button,#xhz-browse-grid a { color:var(--browse-ink)!important;background:var(--browse-card)!important;border-color:var(--browse-border)!important; }
      #xhz-browse-grid a:hover { border-color:#b91c1c!important; }
    </style><section id="xhz-character-browse" style="max-width:1100px;margin:auto;">
      <a href="/tra-chu" style="color:#b91c1c;font-weight:700;">← Từ điển Hán - Việt</a>
      <h1 style="font-size:28px;font-weight:800;margin:20px 0 8px;">${escape(title)}</h1>
      <p id="xhz-browse-count" role="status">${entries.length} chữ Hán trong kho dữ liệu</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0;">
        <label style="flex:1;min-width:220px;">Tìm trong danh sách
          <input id="xhz-browse-search" type="search" placeholder="Chữ Hán, pinyin, Hán Việt hoặc nghĩa" style="display:block;width:100%;padding:12px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;" />
        </label>
        <label>Sắp xếp
          <select id="xhz-browse-sort" style="display:block;padding:12px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;">
            <option value="strokes">Số nét</option><option value="hanviet">Hán Việt A → Z</option><option value="frequency">Tần suất</option>
          </select>
        </label>
      </div>
      <div id="xhz-browse-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;"></div>
      <button id="xhz-browse-more" type="button" style="margin:20px auto;padding:10px 24px;border:1px solid #d6d3d1;border-radius:999px;background:#fff;color:#1c1917;">Xem thêm</button>
    </section>`;
    const search = root.querySelector('#xhz-browse-search');
    const sort = root.querySelector('#xhz-browse-sort');
    const grid = root.querySelector('#xhz-browse-grid');
    const count = root.querySelector('#xhz-browse-count');
    const more = root.querySelector('#xhz-browse-more');
    const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
    let visible = 60;
    const render = () => {
      const query = normalize(search.value.trim());
      const results = entries.filter(item => !query || normalize(`${item.c} ${item.p} ${item.hv} ${item.m}`).includes(query));
      results.sort((a, b) => sort.value === 'hanviet' ? String(a.hv || '').localeCompare(String(b.hv || ''), 'vi')
        : sort.value === 'frequency' ? (Number(a.f) || Infinity) - (Number(b.f) || Infinity)
        : (Number(a.s) || 0) - (Number(b.s) || 0) || (Number(a.f) || Infinity) - (Number(b.f) || Infinity));
      count.textContent = `${results.length} / ${entries.length} chữ Hán`;
      grid.innerHTML = results.slice(0, visible).map(item => `<a href="/han-tu/${encodeURIComponent(item.slug || item.c)}" style="display:flex;flex-direction:column;gap:5px;padding:16px;border:1px solid #e7e5e4;border-radius:16px;background:#fafaf9;text-decoration:none;color:#1c1917;">
        <span style="font-size:36px;font-family:'Noto Serif SC',serif;">${escape(item.c)}</span><span style="color:#b91c1c;">${escape(item.p)}</span>
        <strong>${escape(item.hv)}</strong><span style="font-size:13px;">${escape(item.m)}</span><small>${Number(item.s) || 0} nét · Bộ ${escape(item.r)}</small>
      </a>`).join('') || '<p>Không tìm thấy chữ phù hợp.</p>';
      more.hidden = visible >= results.length;
    };
    search.oninput = () => { visible = 60; render(); };
    sort.onchange = () => { visible = 60; render(); };
    more.onclick = () => { visible += 60; render(); };
    render();
  }


  // 6.9. Trang Chặng Học / Bài Học (/hoc/chang/:stageKey, /hoc/bai/:runId)
  //      Interactive Capybara Lesson Runner 1:1 với xiehanzi.com
  // --------------------------------------------------------------------------
  function ensureLessonRunnerAssets() {
    ['/\_next/static/css/6090e9ab23b2dccf.css', '/\_next/static/css/70d4fb21c4146575.css'].forEach(href => {
      const cleanHref = href.replace('\\_', '_');
      if (!document.querySelector(`link[href="${cleanHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cleanHref;
        document.head.appendChild(link);
      }
    });
    if (!document.getElementById('xhz-lesson-runner-split-style')) {
      const st = document.createElement('style');
      st.id = 'xhz-lesson-runner-split-style';
      st.textContent = `
        .lp.lp-runner {
          position: fixed !important;
          inset: 0 !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          z-index: 60 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .lp-runner-inner.lp-split {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          max-height: 100% !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        @media (min-width: 768px) {
          .lp-runner-inner.lp-split {
            max-width: 1120px !important;
            width: 100% !important;
            margin: 0 auto !important;
          }
          .xhz-lp-split-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 5fr) minmax(0, 6fr) !important;
            gap: 2rem !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
            min-height: 0 !important;
            flex: 1 1 0% !important;
            overflow: hidden !important;
          }
          .xhz-lp-split-left {
            min-height: 0 !important;
            overflow-y: auto !important;
            padding: 1rem 0 !important;
          }
          .xhz-lp-split-right {
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .xhz-lp-split-right .lp-step-area {
            flex: 1 1 0% !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            padding-bottom: 12px !important;
          }
          .xhz-lp-split-right .lp-footer {
            flex-shrink: 0 !important;
            padding-top: 12px !important;
            padding-bottom: 18px !important;
            background: var(--lp-bg, #e8e4dc) !important;
            z-index: 5 !important;
          }
        }
      `;
      document.head.appendChild(st);
    }
    if (!window.HanziWriter && !document.getElementById('xhz-hanzi-writer-cdn')) {
      const s = document.createElement('script');
      s.id = 'xhz-hanzi-writer-cdn';
      s.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }

  function detectPinyinTone(syllable) {
    if (!syllable) return 5;
    if (/[āēīōūǖĀĒĪŌŪǕ]/.test(syllable)) return 1;
    if (/[áéíóúǘÁÉÍÓÚǗ]/.test(syllable)) return 2;
    if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(syllable)) return 3;
    if (/[àèìòùǜÀÈÌÒÙǛ]/.test(syllable)) return 4;
    return 5;
  }

  function renderColoredPinyin(pinyinStr, extraClass = '') {
    if (!pinyinStr) return '';
    const tokens = String(pinyinStr).split(/(\s+|[,，.。!！?？、]+)/);
    const inner = tokens
      .map(tok => {
        if (!tok || /^\s+$/.test(tok) || /^[,，.。!！?？、]+$/.test(tok)) return tok;
        const tone = detectPinyinTone(tok);
        return `<span class="lp-t${tone}">${tok}</span>`;
      })
      .join('');
    return `<span class="py ${extraClass}">${inner}</span>`;
  }

  function convertNumberedPinyin(inputStr) {
    if (!inputStr) return '';
    const toneMap = {
      a: ['ā', 'á', 'ǎ', 'à', 'a'],
      e: ['ē', 'é', 'ě', 'è', 'e'],
      i: ['ī', 'í', 'ǐ', 'ì', 'i'],
      o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
      u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
      ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
      v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
    };
    return String(inputStr).replace(/([a-zA-ZüÜvV]+)([1-5])/g, (_, syl, digit) => {
      const tIdx = Number(digit) - 1;
      let s = syl.replace(/v/g, 'ü').replace(/V/g, 'Ü');
      const lower = s.toLowerCase();
      let targetIdx = -1;
      if (lower.includes('a')) targetIdx = lower.indexOf('a');
      else if (lower.includes('e')) targetIdx = lower.indexOf('e');
      else if (lower.includes('ou')) targetIdx = lower.indexOf('o');
      else {
        for (let i = lower.length - 1; i >= 0; i--) {
          if ('aeiouvü'.includes(lower[i])) {
            targetIdx = i;
            break;
          }
        }
      }
      if (targetIdx === -1) return syl;
      const ch = lower[targetIdx];
      const rep = (toneMap[ch] && toneMap[ch][tIdx]) || s[targetIdx];
      return s.slice(0, targetIdx) + rep + s.slice(targetIdx + 1);
    });
  }

  function normalizePinyinCompare(str, requireTone = true) {
    const converted = convertNumberedPinyin(String(str || '').trim().toLowerCase()).replace(/\s+/g, '');
    if (requireTone) return converted;
    return converted
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ü/g, 'v');
  }

  async function buildDynamicRunFromStage(activityKey) {
    const stgMatch = activityKey.match(/^(hsk30\.L\d+\.[A-Z]\d+)/i);
    const stageKey = stgMatch ? stgMatch[1] : 'hsk30.L1.P1';
    const actSuffix = activityKey.slice(stageKey.length + 1) || 'learn.1';
    const levelData = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
    let chapterKey = 'hsk30.L1.C00';
    if (levelData && Array.isArray(levelData.chapters)) {
      for (const ch of levelData.chapters) {
        if ((ch.stages || []).some(s => s.stageKey === stageKey)) {
          chapterKey = ch.chapterKey;
          break;
        }
      }
    }
    const chBundle =
      (await loadLocalJson(`/data/learning-tracks/chapters/${chapterKey}.json`)) ||
      (await loadLocalJson('/data/learning-tracks/chapters/hsk30.L1.C00.json'));
    const stg =
      (chBundle && Array.isArray(chBundle.stages) && chBundle.stages.find(s => s.stageKey === stageKey)) ||
      (chBundle && chBundle.stages && chBundle.stages[0]);
    if (!stg) return await loadLocalJson('/data/learning-tracks/runs/hsk30.L1.P1.learn.1.json');

    const words = Array.isArray(stg.words) && stg.words.length > 0 ? stg.words : [];
    const hwList = (stg.meta && Array.isArray(stg.meta.handwriting) && stg.meta.handwriting) || [];
    const steps = [];
    const distractorsPool = ['tám (số)', 'bố, cha', 'mẹ', 'xin chào', 'cảm ơn', 'tạm biệt', 'giáo viên', 'học sinh', 'bạn bè', 'Việt Nam'];

    if (actSuffix === 'dlg' && stg.dialogue && Array.isArray(stg.dialogue.turns)) {
      steps.push({
        id: 'd1',
        type: 'dialogue',
        skill: 'listening',
        itemKeys: words.map(w => w.key || `w:${w.hanzi}`),
        graded: true,
        prompt: { vi: 'Nghe hội thoại rồi trả lời câu hỏi' },
        payload: {
          dialogueKey: activityKey,
          sceneVi: (stg.meta && stg.meta.scenario && stg.meta.scenario.placeVi) || stg.meta.titleVi,
          roles: stg.dialogue.roles || [
            { id: 'A', labelVi: 'Nhân vật A' },
            { id: 'B', labelVi: 'Bạn', learner: true }
          ],
          turns: stg.dialogue.turns,
          questions: stg.dialogue.questions || []
        }
      });
      steps.push({ id: 's-end', type: 'summary', skill: null, itemKeys: [], graded: false });
      return {
        runId: activityKey,
        kind: 'learn',
        estMinutes: 4,
        feedback: 'instant',
        titleVi: `Hội thoại: ${stg.meta ? stg.meta.titleVi : stageKey}`,
        hskLevel: 1,
        track: 'hsk30',
        stageKey,
        activityKey,
        steps
      };
    }

    words.slice(0, 6).forEach((w, idx) => {
      const hz = w.hanzi;
      const py = w.wordPinyin || w.pinyin || '';
      const vi = w.meaningVi || '';
      const hv = w.hanviet || '';
      const audioUrl = (w.audio && w.audio.url) || `https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`;
      const ex = (Array.isArray(w.examples) && w.examples[0]) || { hanzi: `${hz}！`, pinyin: py, vi };

      // 1. intro_word
      const fakeTones = [py, convertNumberedPinyin(py.replace(/[āáǎà]/, 'ǎ') || 'bǎ'), convertNumberedPinyin(py.replace(/[āáǎà]/, 'á') || 'bá')];
      const uniqTones = [...new Set([py, ...fakeTones, 'bā', 'bǎ', 'bá'])].slice(0, 3);
      steps.push({
        id: `intro-${idx}`,
        type: 'intro_word',
        skill: null,
        itemKeys: [w.key || `w:${hz}`],
        graded: false,
        prompt: { vi: 'Từ mới' },
        payload: {
          word: {
            key: w.key || `w:${hz}`,
            hanzi: hz,
            pinyin: py,
            wordPinyin: py,
            meaningVi: vi,
            hanviet: hv,
            hanvietGloss: w.hanvietGloss || hv,
            wordClassVi: w.wordClassVi || 'từ vựng',
            audio: { url: audioUrl },
            example: {
              hanzi: ex.hanzi,
              pinyin: ex.pinyin,
              vi: ex.vi,
              audio: ex.audio || { url: audioUrl }
            }
          },
          verifiedHanViet: hv ? { reading: hv, confidence: 'high' } : undefined,
          breakdowns: [
            {
              hanzi: Array.from(hz)[0] || hz,
              pinyin: py.split(/\s+/)[0] || py,
              hanViet: hv.split(/\s+/)[0] || hv,
              meaningVi: vi,
              components: [],
              memoryHint: w.hanvietGloss ? `Âm Hán Việt là "${hv}" (${w.hanvietGloss}), gắn liền với nghĩa "${vi}".` : `Ghi nhớ âm đọc ${py} và nghĩa "${vi}".`
            }
          ],
          pretest: {
            kind: 'tone',
            promptVi: 'Nghe và đoán thanh điệu',
            options: uniqTones.map((t, oi) => ({ id: `o${oi + 1}`, text: t })),
            correctOptionId: 'o1',
            revealVi: `${hz} đọc là ${py}.`
          }
        }
      });

      // 2. choose_meaning
      const otherVi = words
        .filter((_, i) => i !== idx)
        .map(x => x.meaningVi)
        .concat(distractorsPool)
        .filter(x => x && x !== vi);
      const uniqWrong = [...new Set(otherVi)].slice(0, 3);
      const opts = [
        { id: 'o1', text: vi },
        { id: 'o2', text: uniqWrong[0] || 'xin chào' },
        { id: 'o3', text: uniqWrong[1] || 'cảm ơn' },
        { id: 'o4', text: uniqWrong[2] || 'tạm biệt' }
      ];
      steps.push({
        id: `cm-${idx}`,
        type: 'choose_meaning',
        skill: 'meaning',
        itemKeys: [w.key || `w:${hz}`],
        graded: true,
        prompt: { vi: 'Chọn nghĩa đúng' },
        payload: {
          direction: 'zh_vi',
          question: { hanzi: hz, pinyin: py, audio: { url: audioUrl } },
          options: opts
        },
        explanationVi: `${hz} (${py})${hv ? `, âm Hán Việt ${hv}` : ''}: ${vi}.`,
        check: { correctOptionId: 'o1' },
        retryHint: {
          textVi: 'Âm Hán Việt thường gần với nghĩa. Nghe lại rồi đoán nhé.',
          cue: hv ? `Hán Việt: ${hv}` : `Pinyin: ${py}`,
          audio: { url: audioUrl }
        }
      });

      // 3. write_character (nếu có trong handwriting hoặc chữ đầu)
      const hw = hwList.find(h => h.fromWord === hz || h.char === Array.from(hz)[0]) || {
        char: Array.from(hz)[0] || hz,
        pinyin: py,
        hanviet: hv
      };
      if (idx < 3 && hw && hw.char) {
        steps.push({
          id: `wc-${idx}`,
          type: 'write_character',
          skill: 'writing',
          itemKeys: [`c:${hw.char}`],
          graded: true,
          prompt: { vi: `Tập viết chữ mới: ${py}, “${vi}”` },
          payload: {
            char: hw.char,
            mode: 'guided',
            phases: ['demo', 'trace', 'recall'],
            cue: {
              meaningVi: vi,
              pinyin: py,
              hanviet: hw.hanviet || hv,
              audio: { url: audioUrl }
            }
          },
          explanationVi: 'Nét viết chưa đúng thứ tự hoặc hướng. Xem nét mẫu rồi viết lại.'
        });
      }

      // 4. type_pinyin
      steps.push({
        id: `tp-${idx}`,
        type: 'type_pinyin',
        skill: 'sound',
        itemKeys: [w.key || `w:${hz}`],
        graded: true,
        prompt: { vi: 'Gõ pinyin (có thanh điệu)' },
        payload: {
          hanzi: hz,
          audio: { url: audioUrl },
          toneRequired: true,
          meaningVi: vi
        },
        explanationVi: `${hz} nghĩa là ${vi}. Chú ý thanh điệu của từng âm tiết.`,
        check: { accepted: [py] },
        retryHint: {
          textVi: 'Nghe chậm để chọn thanh. Thanh 1 ngang cao, thanh 2 đi lên, thanh 3 xuống thấp rồi lên, thanh 4 đi xuống.',
          cue: normalizePinyinCompare(py, false),
          audio: { url: audioUrl }
        }
      });
    });

    // 5. match_pairs
    if (words.length >= 2) {
      const sliceW = words.slice(0, Math.min(4, words.length));
      steps.push({
        id: 'mp-1',
        type: 'match_pairs',
        skill: 'meaning',
        itemKeys: sliceW.map(w => w.key || `w:${w.hanzi}`),
        graded: true,
        prompt: { vi: 'Ghép từ với nghĩa' },
        payload: {
          left: sliceW.map((w, i) => ({
            id: `l${i + 1}`,
            hanzi: w.hanzi,
            audio: w.audio || { url: `https://static.xiehanzi.com/word_audios/${encodeURIComponent(w.hanzi)}.mp3` }
          })),
          right: sliceW
            .map((w, i) => ({ id: `r${i + 1}`, text: w.meaningVi }))
            .reverse()
        },
        explanationVi: 'Có cặp nối nhầm nghĩa. Nhớ lại nghĩa từng từ rồi thử lại.',
        check: {
          pairs: sliceW.map((_, i) => [`l${i + 1}`, `r${i + 1}`])
        }
      });
    }

    steps.push({ id: 's-summary', type: 'summary', skill: null, itemKeys: [], graded: false });

    return {
      runId: activityKey,
      kind: 'learn',
      estMinutes: 6,
      feedback: 'instant',
      titleVi: `Từ mới: ${stg.meta ? stg.meta.titleVi : stageKey}`,
      hskLevel: 1,
      track: 'hsk30',
      stageKey,
      activityKey,
      steps
    };
  }

  async function resolveLessonRunData(slug) {
    const legacyMap = {
      'bai-1-hello-ai-xiaoyu': 'hsk30.L1.P1.learn.1',
      'hsk30.L1.C1.S1': 'hsk30.L1.P1.learn.1',
      'hsk30-1.S1': 'hsk30.L1.P1.learn.1',
      'hsk30.L1.P1': 'hsk30.L1.P1.learn.1',
      '6af3478a270319be91af2e10': 'hsk30.L1.P1.learn.1',
      '6af3efd75ef8914173f992b5': 'hsk30.L1.P1.learn.1',
      '6af3efd70fb3998ecd760dd8': 'hsk30.L1.P1.dlg',
      '6af3efd75ef8914173f992c2': 'hsk30.L1.P1.rp1',
      '6af3efd70fb3998ecd760df3': 'hsk30.L1.P1.rp2',
      '6af3efd75ef8914173f992ce': 'hsk30.L1.P1.exam',
      'bai-2-my-name-is-li-wen': 'hsk30.L1.S02.learn.1',
      'hsk30.L1.C1.S2': 'hsk30.L1.S02.learn.1',
      'bai-3-i-m-chinese': 'hsk30.L1.S03.learn.1',
      'hsk30.L1.C1.S3': 'hsk30.L1.S03.learn.1',
      'bai-4-i-have-two-children': 'hsk30.L1.S04.learn.1',
      'hsk30.L1.C1.S4': 'hsk30.L1.S04.learn.1'
    };
    let actKey = legacyMap[slug] || slug;
    if (/^hsk30\.L\d+\.[A-Z]\d+$/i.test(actKey)) {
      actKey = `${actKey}.learn.1`;
    }
    const directRun = await loadLocalJson(`/data/learning-tracks/runs/${actKey}.json`);
    if (directRun && Array.isArray(directRun.steps) && directRun.steps.length > 0) {
      return directRun;
    }
    return await buildDynamicRunFromStage(actKey);
  }

  async function renderStudyStageOrRunPage(pathname) {
    try {
      document.querySelectorAll('[data-modal-layer], [data-companion-picker]').forEach(el => el.remove());
      document.documentElement.removeAttribute('data-focus-session');
    } catch (_) {}

    const parts = pathname.split('/').filter(Boolean);
    const slug = decodeURIComponent(parts[2] || 'hsk30.L1.P1.learn.1');

    if (slug.startsWith('on-tap-') || slug.startsWith('review-')) {
      await renderReviewSessionPage(slug);
      return;
    }

    ensureLessonRunnerAssets();

    const run = (await resolveLessonRunData(slug)) || (await loadLocalJson('/data/learning-tracks/runs/hsk30.L1.P1.learn.1.json'));
    if (!run || !Array.isArray(run.steps)) return;

    const playableSteps = run.steps.filter(s => s.type !== 'summary');
    const introWords = [];
    run.steps.forEach(s => {
      if (s.type === 'intro_word' && s.payload && s.payload.word && s.payload.word.hanzi) {
        if (!introWords.includes(s.payload.word.hanzi)) introWords.push(s.payload.word.hanzi);
      }
    });

    document.title = `${run.titleVi || 'Bài học'} | XieHanzi`;

    // Ẩn main tĩnh và tạo full-screen overlay lp-runner
    const main = document.querySelector('main');
    if (main) main.style.display = 'none';
    const oldCustom = document.getElementById('xhz-dynamic-page-root');
    if (oldCustom) oldCustom.style.display = 'none';

    let runnerRoot = document.getElementById('xhz-lesson-runner-root');
    if (!runnerRoot) {
      runnerRoot = document.createElement('div');
      runnerRoot.id = 'xhz-lesson-runner-root';
      document.body.appendChild(runnerRoot);
    }

    const state = {
      showIntro: true,
      stepIdx: 0,
      phase: 'answering', // 'answering' | 'hint' | 'feedback' | 'done'
      verdict: null,
      hintedStepId: null,
      disabledOptionIds: new Set(),
      correctCount: 0,
      gradedCount: 0,
      startedAt: Date.now(),
      // Per-step local UI state
      pretestPickedId: null,
      pretestRevealed: false,
      selectedOptionId: null,
      typedText: '',
      orderedTokens: [],
      matchedPairs: [],
      matchLeftSelected: null,
      matchWrongPair: null,
      writePhaseIdx: 0, // 0: Xem (demo), 1: Tô theo (trace), 2: Tự viết (recall)
      writeQuizDone: false,
      readRecorded: false,
      readScore: 95,
      showExitModal: false
    };

    function resetStepUiState(step) {
      state.phase = 'answering';
      state.verdict = null;
      state.disabledOptionIds = new Set();
      state.pretestPickedId = null;
      state.pretestRevealed = !(step && step.type === 'intro_word' && step.payload && step.payload.pretest);
      state.selectedOptionId = null;
      state.typedText = '';
      state.orderedTokens = [];
      state.matchedPairs = [];
      state.matchLeftSelected = null;
      state.matchWrongPair = null;
      state.writePhaseIdx = 0;
      state.writeQuizDone = false;
      state.readRecorded = false;
      state.readScore = 92 + (state.stepIdx % 7);
    }

    resetStepUiState(playableSteps[0]);

    function getCurrentStep() {
      return playableSteps[state.stepIdx] || null;
    }

    function getStepAudioInfo(step) {
      if (!step || !step.payload) return { text: '', url: '' };
      const p = step.payload;
      if (step.type === 'intro_word' && p.word) {
        return { text: p.word.hanzi, url: (p.word.audio && p.word.audio.url) || '' };
      }
      if (step.type === 'choose_meaning' && p.question) {
        return { text: p.question.hanzi || '', url: (p.question.audio && p.question.audio.url) || '' };
      }
      if (step.type === 'write_character') {
        return { text: p.char || '', url: (p.cue && p.cue.audio && p.cue.audio.url) || '' };
      }
      if (step.type === 'type_pinyin') {
        return { text: p.hanzi || '', url: (p.audio && p.audio.url) || '' };
      }
      if (step.type === 'listen_choose') {
        const rightOpt = (p.options || []).find(o => o.id === (step.check && step.check.correctOptionId));
        return { text: (rightOpt && (rightOpt.hanzi || rightOpt.pinyin)) || '', url: (p.audio && p.audio.url) || '' };
      }
      if (step.type === 'order_sentence') {
        const rightIds = (step.check && step.check.accepted && step.check.accepted[0]) || [];
        const txt = rightIds.map(id => ((p.tokens || []).find(t => t.id === id) || {}).text || '').join('');
        return { text: txt, url: (p.audio && p.audio.url) || '' };
      }
      if (step.type === 'read_sentence' && p.sentence) {
        return { text: p.sentence.hanzi || '', url: (p.sentence.audio && p.sentence.audio.url) || '' };
      }
      if (step.type === 'dialogue' && Array.isArray(p.turns) && p.turns[0]) {
        return { text: p.turns[0].hanzi || '', url: (p.turns[0].audio && p.turns[0].audio.url) || '' };
      }
      if (step.type === 'exam_item') {
        const firstScript = (Array.isArray(p.script) && p.script[0]) || {};
        return { text: firstScript.hanzi || '', url: (p.audio && p.audio.url) || (firstScript.audio && firstScript.audio.url) || '' };
      }
      return { text: '', url: '' };
    }

    function getCapyPromptLine(step) {
      if (!step) return '';
      if (state.phase === 'feedback' && state.verdict) {
        return state.verdict.correct ? 'Giỏi lắm! Chuẩn luôn!' : 'Không sao, mình xem lại nhé.';
      }
      const p = step.payload || {};
      switch (step.type) {
        case 'intro_word':
          return `Từ mới: ${p.word ? p.word.hanzi : ''}. Chạm loa để nghe nhé!`;
        case 'choose_meaning':
          if (p.direction === 'zh_vi' && p.question && p.question.hanzi) {
            return `${p.question.hanzi} nghĩa là gì?`;
          }
          return (step.prompt && step.prompt.vi) || 'Chọn đáp án đúng.';
        case 'write_character':
          return 'Chữ mới! Xem cách viết, tô theo rồi tự viết nhé.';
        case 'type_pinyin':
          return `Gõ pinyin${p.toneRequired ? ' có thanh' : ''} cho ${p.hanzi || ''}.`;
        case 'match_pairs':
          return (step.prompt && step.prompt.vi) || 'Ghép từ với nghĩa';
        case 'listen_choose':
          return (step.prompt && step.prompt.vi) || 'Nghe và chọn đáp án đúng';
        case 'order_sentence':
          return `Xếp thành câu: "${p.translationVi || ''}"`;
        case 'fill_blank':
          return (step.prompt && step.prompt.vi) || 'Điền vào chỗ trống';
        case 'read_sentence':
          return 'Đọc to câu này. Chạm mic rồi nói nhé.';
        case 'dialogue':
          return (step.prompt && step.prompt.vi) || 'Nghe đoạn hội thoại rồi trả lời nhé.';
        case 'exam_item':
          return p.instruction || 'Đọc kỹ đề rồi chọn đáp án.';
        default:
          return (step.prompt && step.prompt.vi) || 'Cùng làm câu này nhé!';
      }
    }

    function getCapySprite(step) {
      if (state.phase === 'feedback' && state.verdict) {
        return state.verdict.correct ? '/images/capy/lesson/cheering.webp' : '/images/capy/lesson/encouraging.webp';
      }
      if (state.phase === 'hint') {
        return '/images/capy/lesson/encouraging.webp';
      }
      return '/images/capy/lesson/thinking.webp';
    }

    const speakerSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    const snailSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 17h13a4 4 0 0 0 4-4 6 6 0 0 0-12 0c0 2.2 1.8 4 4 4"/><circle cx="11" cy="13" r="2"/><path d="M19 13v-2a2 2 0 0 1 2-2M18 9l1 2M21 9l-1 2"/></svg>`;
    const sparkleSvg = `<svg class="size-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>`;
    const bulbSvg = `<svg class="mt-0.5 size-4 shrink-0 text-gold-ink" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>`;
    const checkSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
    const exclSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M12 6.5v7"/><circle cx="12" cy="18" r=".6" fill="currentColor"/></svg>`;

    function advanceStep() {
      if (state.stepIdx + 1 >= playableSteps.length) {
        state.phase = 'done';
        // Lưu trạng thái hoàn thành & đồng bộ đám mây Supabase
        try {
          if (run.stageKey) {
            const doneActs = JSON.parse(localStorage.getItem('httq_done_activities') || '{}') || {};
            const arr = Array.isArray(doneActs[run.stageKey]) ? doneActs[run.stageKey] : [];
            if (run.activityKey && !arr.includes(run.activityKey)) arr.push(run.activityKey);
            doneActs[run.stageKey] = arr;
            localStorage.setItem('httq_done_activities', JSON.stringify(doneActs));
          }
          recordStudyProgress({
            stageKey: run.stageKey || 'hsk30.L1.P1',
            activityKey: run.activityKey || 'hsk30.L1.P1.learn.1',
            words: introWords,
            minutes: run.estMinutes || 6,
            sessionInc: 1
          });
        } catch (_) {}
        renderRunner();
        return;
      }
      state.stepIdx += 1;
      resetStepUiState(playableSteps[state.stepIdx]);
      renderRunner();
      const nextSt = getCurrentStep();
      const aud = getStepAudioInfo(nextSt);
      if (aud.text || aud.url) {
        setTimeout(() => playPronunciation(aud.text, aud.url, 1.0), 150);
      }
    }

    function submitGradedAnswer(isCorrect, expectedDisplay, answerInfo) {
      const step = getCurrentStep();
      if (!step) return;
      if (!isCorrect && step.retryHint && state.hintedStepId !== step.id) {
        state.hintedStepId = step.id;
        state.phase = 'hint';
        if (state.selectedOptionId) {
          state.disabledOptionIds.add(state.selectedOptionId);
        }
        renderRunner();
        return;
      }
      state.gradedCount += 1;
      if (isCorrect) state.correctCount += 1;
      state.verdict = {
        correct: isCorrect,
        expectedDisplay: expectedDisplay || '',
        explanationVi: step.explanationVi || '',
        answer: answerInfo || null
      };
      state.phase = 'feedback';
      const aud = getStepAudioInfo(step);
      if (isCorrect && (aud.text || aud.url)) {
        playPronunciation(aud.text, aud.url, 1.0);
      }
      renderRunner();
    }

    function mountHanziWriterIfNeeded() {
      const step = getCurrentStep();
      if (!step || step.type !== 'write_character' || state.showIntro || state.phase === 'done') return;
      const targetEl = document.getElementById('xhz-hw-canvas');
      if (!targetEl) return;
      const ch = step.payload.char || '八';
      const phase = ['demo', 'trace', 'recall'][state.writePhaseIdx] || 'demo';

      const initWriter = () => {
        if (!window.HanziWriter) {
          setTimeout(initWriter, 150);
          return;
        }
        targetEl.innerHTML = '';
        try {
          const writer = window.HanziWriter.create(targetEl, ch, {
            width: 256,
            height: 256,
            padding: 16,
            showCharacter: phase === 'demo',
            showOutline: phase !== 'recall',
            strokeAnimationSpeed: 1.1,
            delayBetweenStrokes: 220,
            strokeColor: '#191715',
            outlineColor: '#D8D2C4',
            drawingColor: '#C8251D',
            highlightColor: '#2563EB',
            drawingWidth: 22,
            charDataLoader: function (char, onComplete) {
              originalFetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`)
                .then(r => r.json())
                .then(onComplete)
                .catch(() => {});
            }
          });
          window.__xhzActiveWriter = writer;
          if (phase === 'demo') {
            setTimeout(() => {
              try { writer.animateCharacter(); } catch (_) {}
            }, 250);
            targetEl.onclick = () => {
              try { writer.animateCharacter(); } catch (_) {}
            };
          } else {
            targetEl.onclick = null;
            writer.quiz({
              showHintAfterMisses: 2,
              highlightOnComplete: true,
              onComplete: function () {
                state.writeQuizDone = true;
                if (state.writePhaseIdx === 1) {
                  setTimeout(() => {
                    state.writePhaseIdx = 2;
                    state.writeQuizDone = false;
                    renderRunner();
                  }, 650);
                } else {
                  setTimeout(() => {
                    submitGradedAnswer(true, ch, { hanzi: ch, pinyin: step.payload.cue && step.payload.cue.pinyin, vi: step.payload.cue && step.payload.cue.meaningVi });
                  }, 500);
                }
              }
            });
          }
        } catch (_) {}
      };
      initWriter();
    }

    function renderRunner() {
      const step = getCurrentStep();
      const progressPct = playableSteps.length > 0 ? Math.max(4, Math.round((state.stepIdx / playableSteps.length) * 100)) : 100;

      // 1. Màn hình hoàn thành bài học (lp-done)
      if (state.phase === 'done' || !step) {
        const elapsedSec = Math.max(12, Math.round((Date.now() - state.startedAt) / 1000));
        const mins = Math.floor(elapsedSec / 60);
        const secs = elapsedSec % 60;
        const timeStr = mins > 0 ? `${mins}p ${secs}s` : `${secs}s`;
        const accPct = state.gradedCount > 0 ? Math.round((state.correctCount / state.gradedCount) * 100) : 100;
        runnerRoot.innerHTML = `
          <div class="lp lp-runner" data-testid="lesson-runner">
            <div class="lp-runner-inner overflow-y-auto">
              <div class="lp-done">
                <img src="/images/capy/lesson/celebrating.webp" alt="Capy" style="width:180px;height:180px;object-fit:contain;" />
                <h2>Hoàn thành xuất sắc!</h2>
                <p class="sub">${run.titleVi || 'Bài học'} · Đã lưu vào tiến độ lộ trình HSK 3.0</p>
                <div class="lp-stats">
                  <div class="lp-stat xp">
                    <span class="v">+20 XP</span>
                    <span class="k">Kinh nghiệm</span>
                  </div>
                  <div class="lp-stat acc">
                    <span class="v">${accPct}%</span>
                    <span class="k">Chính xác</span>
                  </div>
                  <div class="lp-stat time">
                    <span class="v">${timeStr}</span>
                    <span class="k">Thời gian</span>
                  </div>
                </div>
                <div class="lp-streak-card">
                  <span style="font-size:28px;">🔥</span>
                  <span><b>${getRealProgressSummary().streakDays || 1}</b> ngày liên tiếp giữ chuỗi học tập!</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:380px;margin-top:16px;">
                  <button type="button" id="xhz-done-continue" class="lp-btn3d">Về lộ trình <kbd class="lp-kbd lp-kbd-in-btn">Enter</kbd></button>
                  <button type="button" id="xhz-done-retry" class="lp-btn-text">Học lại bài này</button>
                </div>
              </div>
            </div>
          </div>
        `;
        const contBtn = runnerRoot.querySelector('#xhz-done-continue');
        if (contBtn) contBtn.onclick = () => window.location.assign('/hoc');
        const retryBtn = runnerRoot.querySelector('#xhz-done-retry');
        if (retryBtn) {
          retryBtn.onclick = () => {
            state.stepIdx = 0;
            state.correctCount = 0;
            state.gradedCount = 0;
            resetStepUiState(playableSteps[0]);
            renderRunner();
          };
        }
        return;
      }

      // 2. Xây dựng nội dung cột trái (Prompt) và cột phải (Answer) + Footer theo từng loại step
      let promptHtml = '';
      let answerHtml = '';
      let footerBtnLabel = 'Tiếp tục';
      let footerBtnDisabled = false;
      let footerAction = () => advanceStep();
      const p = step.payload || {};
      const isHard = step.type === 'type_pinyin' && p.toneRequired && state.phase === 'answering';

      if (step.type === 'intro_word') {
        const w = p.word || {};
        const pre = p.pretest;
        const wAudio = (w.audio && w.audio.url) || '';
        if (pre) {
          const optsHtml = (pre.options || [])
            .map((opt, idx) => {
              let optState = '';
              if (state.pretestRevealed) {
                optState = opt.id === pre.correctOptionId ? 'right' : opt.id === state.pretestPickedId ? 'wrong' : 'dim';
              }
              return `
                <button type="button" class="lp-opt ${optState}" data-pretest-opt="${opt.id}" ${state.pretestRevealed ? 'disabled' : ''}>
                  <span class="k">${idx + 1}</span>
                  <span class="min-w-0 flex-1">${renderColoredPinyin(opt.text, 'text-2xl')}</span>
                </button>
              `;
            })
            .join('');
          promptHtml = `
            <div data-testid="intro-word-pretest" class="flex flex-col items-center gap-3.5 rounded-card border border-line bg-surface px-4 py-5 text-center shadow-card" style="background:var(--lp-surface);border-radius:18px;border:1.5px solid var(--lp-border);padding:20px 16px;">
              <div class="flex flex-col items-center gap-1">
                <span class="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase text-interactive" style="color:var(--lp-blue);font-size:13px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">
                  ${sparkleSvg} ĐOÁN THỬ
                </span>
                <p style="font-size:17px;font-weight:700;color:var(--lp-ink);margin:2px 0 0 0;">${pre.promptVi || 'Nghe và đoán thanh điệu'}</p>
              </div>
              <span lang="zh" class="lp-hanzi" style="font-size:80px;line-height:1.1;color:var(--lp-ink);">${w.hanzi || ''}</span>
              <div class="lp-audio-row">
                <button type="button" class="lp-audio-btn big" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" aria-label="Nghe phát âm">${speakerSvg}</button>
                <button type="button" class="lp-audio-btn slow" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
              </div>
              <div class="lp-opts" style="width:100%;">
                ${optsHtml}
              </div>
              ${
                !state.pretestRevealed
                  ? `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                      <p style="font-size:13px;color:var(--lp-ink-2);margin:0;">Không tính điểm, cứ đoán</p>
                      <button type="button" class="lp-btn-text" id="xhz-pretest-skip">Bỏ qua</button>
                    </div>`
                  : ''
              }
            </div>
          `;
        }

        if (!state.pretestRevealed) {
          answerHtml = '';
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = true;
        } else {
          const isPreCorrect = state.pretestPickedId === (pre && pre.correctOptionId);
          const revealBanner =
            pre && state.pretestPickedId
              ? `<div role="status" data-testid="intro-word-pretest-reveal" style="display:flex;align-items:flex-start;gap:10px;border-radius:14px;padding:14px;background:${isPreCorrect ? 'var(--lp-ok-bg)' : 'var(--lp-gold-bg)'};">
                  <span style="color:${isPreCorrect ? 'var(--lp-ok)' : 'var(--lp-gold-ink)'};flex-shrink:0;">${isPreCorrect ? checkSvg : bulbSvg}</span>
                  <div>
                    <p style="font-size:16px;font-weight:800;color:${isPreCorrect ? 'var(--lp-ok-ink)' : 'var(--lp-ink)'};margin:0;">${isPreCorrect ? 'Đoán đúng rồi!' : 'Chưa trúng, không sao cả'}</p>
                    <p style="font-size:15px;color:var(--lp-ink);margin:4px 0 0 0;">${pre.revealVi || ''}</p>
                  </div>
                </div>`
              : '';
          const hvReading = (p.verifiedHanViet && p.verifiedHanViet.reading) || w.hanviet || '';
          const hvCapitalized = hvReading ? hvReading.charAt(0).toUpperCase() + hvReading.slice(1) : '';
          const breakdowns = Array.isArray(p.breakdowns) ? p.breakdowns : [];
          const breakdownHtml = breakdowns.length
            ? `<section data-testid="intro-word-breakdown" style="display:flex;flex-direction:column;gap:12px;border-radius:16px;border:1.5px solid var(--lp-border);background:var(--lp-surface);padding:16px;">
                <h3 style="font-size:16px;font-weight:800;color:var(--lp-ink);margin:0;">Chữ này gồm</h3>
                ${breakdowns
                  .map(
                    b => `
                  <div style="display:flex;flex-direction:column;gap:10px;">
                    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
                      ${Array.from(w.hanzi || '').length > 1 ? `<span lang="zh" class="lp-hanzi" style="font-size:32px;line-height:1;">${b.hanzi}</span>` : ''}
                      <p style="font-size:16px;color:var(--lp-ink-2);margin:0;">
                        ${b.pinyin || ''} · Hán Việt: <b style="color:var(--lp-ink);">${b.hanViet || ''}</b> · ${b.meaningVi || ''}
                      </p>
                    </div>
                    ${
                      b.radical
                        ? `<div style="font-size:14px;color:var(--lp-ink);">Bộ ${b.radical.hanzi} (${b.radical.hanViet || ''}) · ${b.radical.meaningVi || ''}</div>`
                        : ''
                    }
                    ${
                      b.memoryHint
                        ? `<div style="display:flex;align-items:flex-start;gap:8px;border-radius:10px;background:var(--lp-gold-bg);padding:10px 12px;font-size:14px;color:var(--lp-ink);">
                            ${bulbSvg}
                            <p style="margin:0;"><b>Mẹo nhớ: </b>${b.memoryHint}</p>
                          </div>`
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
              </section>`
            : '';
          const ex = w.example;
          const exHtml = ex
            ? `<div class="lp-card" style="display:flex;align-items:center;gap:12px;padding:14px 16px;">
                <button type="button" class="lp-audio-btn small" data-play-text="${ex.hanzi || ''}" data-play-url="${(ex.audio && ex.audio.url) || wAudio}" aria-label="Nghe câu ví dụ">${speakerSvg}</button>
                <div style="min-width:0;flex:1;">
                  <div lang="zh" class="lp-hanzi" style="font-size:21px;font-weight:700;color:var(--lp-ink);">${ex.hanzi || ''}</div>
                  <div style="font-size:15px;margin-top:2px;">${renderColoredPinyin(ex.pinyin || '')}</div>
                  <div style="font-size:14px;color:var(--lp-ink-2);margin-top:2px;">${ex.vi || ''}</div>
                </div>
              </div>`
            : '';

          answerHtml = `
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${revealBanner}
              <div class="lp-card lp-word-card">
                ${!pre ? `<div lang="zh" class="lp-hanzi hz">${w.hanzi || ''}</div><div style="font-size:22px;">${renderColoredPinyin(w.wordPinyin || w.pinyin || '')}</div>` : ''}
                ${hvCapitalized ? `<div><span class="hv">Hán Việt: ${hvCapitalized}</span></div>` : ''}
                <div class="vi">${w.meaningVi || ''}</div>
                ${w.wordClassVi ? `<div style="font-size:13px;color:var(--lp-ink-2);margin-top:-2px;">${w.wordClassVi}</div>` : ''}
                <div class="lp-audio-row" style="margin-top:12px;">
                  <button type="button" class="lp-audio-btn" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" aria-label="Nghe từ">${speakerSvg}</button>
                  <button type="button" class="lp-audio-btn slow" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
                </div>
              </div>
              ${breakdownHtml}
              ${w.hanvietGloss ? `<p class="lp-hint" style="margin:0;"><b>Hán Việt:</b> ${w.hanvietGloss}</p>` : ''}
              ${exHtml}
            </div>
          `;
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = false;
          footerAction = () => advanceStep();
        }
      } else if (step.type === 'choose_meaning') {
        const q = p.question || {};
        const qAudio = (q.audio && q.audio.url) || '';
        const rightId = step.check && step.check.correctOptionId;
        promptHtml = `
          <div class="lp-q">
            <span class="lp-hanzi big" lang="zh">${q.hanzi || ''}</span>
            ${q.pinyin ? `<div style="font-size:20px;">${renderColoredPinyin(q.pinyin)}</div>` : ''}
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn" data-play-text="${q.hanzi || ''}" data-play-url="${qAudio}" aria-label="Nghe">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${q.hanzi || ''}" data-play-url="${qAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
          </div>
        `;
        answerHtml = `
          <div class="lp-opts" role="radiogroup" aria-label="Các lựa chọn">
            ${(p.options || [])
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.phase === 'hint') {
                  cls = opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.disabledOptionIds.has(opt.id)) {
                  cls = 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${idx + 1}</span>
                    <span class="min-w-0 flex-1">${opt.text || ''}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          if (!state.selectedOptionId) return;
          const rightOpt = (p.options || []).find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, rightOpt ? rightOpt.text : '', {
            hanzi: q.hanzi,
            pinyin: q.pinyin,
            vi: rightOpt ? rightOpt.text : '',
            audioUrl: qAudio
          });
        };
      } else if (step.type === 'write_character') {
        const ch = p.char || '八';
        const cue = p.cue || {};
        const cueAudio = (cue.audio && cue.audio.url) || '';
        const phases = ['Xem', 'Tô theo', 'Tự viết'];
        const nudges = [
          'Xem thứ tự nét. Chạm vào ô để xem lại.',
          'Tô theo nét mờ, từng nét một.',
          'Giờ tự viết, không còn nét mờ.'
        ];
        promptHtml = `
          <div class="lp-card lp-write-cue">
            <span lang="zh" class="lp-hanzi lp-write-cue-char">${ch}</span>
            <div class="lp-write-cue-meta">
              ${cue.pinyin ? `<div style="font-size:20px;">${renderColoredPinyin(cue.pinyin)}</div>` : ''}
              ${cue.hanviet ? `<span class="lp-write-cue-hv">${cue.hanviet}</span>` : ''}
              <span class="lp-write-cue-vi">${cue.meaningVi || ''}</span>
            </div>
            <button type="button" class="lp-audio-btn small" data-play-text="${ch}" data-play-url="${cueAudio}" aria-label="Nghe">${speakerSvg}</button>
          </div>
        `;
        answerHtml = `
          <div class="lp-write-stage">
            <div class="lp-write-phases" role="tablist">
              ${phases
                .map(
                  (label, idx) =>
                    `<button type="button" class="lp-write-phase ${idx === state.writePhaseIdx ? 'active' : idx < state.writePhaseIdx ? 'done' : ''}" data-write-phase="${idx}">${label}</button>`
                )
                .join('')}
            </div>
            <div class="lp-write-box lp-write-grid" style="position:relative;">
              <svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;" aria-hidden="true">
                <line x1="0" y1="50" x2="100" y2="50" stroke="#E4DEC9" stroke-width="0.7" stroke-dasharray="3,3"/>
                <line x1="50" y1="0" x2="50" y2="100" stroke="#E4DEC9" stroke-width="0.7" stroke-dasharray="3,3"/>
                <line x1="0" y1="0" x2="100" y2="100" stroke="#EDE8D8" stroke-width="0.5" stroke-dasharray="3,3"/>
                <line x1="100" y1="0" x2="0" y2="100" stroke="#EDE8D8" stroke-width="0.5" stroke-dasharray="3,3"/>
              </svg>
              <div id="xhz-hw-canvas" style="position:relative;z-index:2;width:256px;height:256px;display:flex;align-items:center;justify-content:center;cursor:pointer;"></div>
            </div>
            <p class="lp-write-nudge">${nudges[state.writePhaseIdx] || nudges[0]}</p>
            <button type="button" class="lp-btn-text" id="xhz-write-skip">Để sau</button>
          </div>
        `;
        if (state.writePhaseIdx === 0) {
          footerBtnLabel = 'Tô theo nét';
          footerBtnDisabled = false;
          footerAction = () => {
            state.writePhaseIdx = 1;
            state.writeQuizDone = false;
            renderRunner();
          };
        } else if (state.writePhaseIdx === 1) {
          footerBtnLabel = 'Tự viết';
          footerBtnDisabled = false;
          footerAction = () => {
            state.writePhaseIdx = 2;
            state.writeQuizDone = false;
            renderRunner();
          };
        } else {
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = false;
          footerAction = () => {
            submitGradedAnswer(true, ch, { hanzi: ch, pinyin: cue.pinyin, vi: cue.meaningVi, audioUrl: cueAudio });
          };
        }
      } else if (step.type === 'type_pinyin') {
        const tAudio = (p.audio && p.audio.url) || '';
        const accepted = (step.check && step.check.accepted) || ['bā'];
        const previewConverted = convertNumberedPinyin(state.typedText);
        const hasLetters = /[a-zA-ZüÜvVāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(state.typedText);
        promptHtml = `
          <div class="lp-q">
            <span class="lp-hanzi big" lang="zh">${p.hanzi || ''}</span>
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn" data-play-text="${p.hanzi || ''}" data-play-url="${tAudio}" aria-label="Nghe">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${p.hanzi || ''}" data-play-url="${tAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
            <span style="font-size:15px;color:var(--lp-ink-2);">nghĩa: ${p.meaningVi || ''}</span>
          </div>
        `;
        const toneMarks = [
          { digit: 1, mark: 'ˉ', label: 'Thanh 1' },
          { digit: 2, mark: 'ˊ', label: 'Thanh 2' },
          { digit: 3, mark: 'ˇ', label: 'Thanh 3' },
          { digit: 4, mark: 'ˋ', label: 'Thanh 4' },
          { digit: 5, mark: '·', label: 'Thanh nhẹ' }
        ];
        answerHtml = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <input
              id="xhz-pinyin-input"
              type="text"
              class="lp-input"
              value="${state.typedText.replace(/"/g, '&quot;')}"
              placeholder="${p.toneRequired ? 'vd: ma3 hoặc mǎ' : 'vd: ma'}"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              ${state.phase !== 'answering' ? 'disabled' : ''}
            />
            <div class="lp-type-preview" id="xhz-pinyin-preview">
              ${
                previewConverted && previewConverted !== state.typedText.trim()
                  ? `Hiển thị: <b>${previewConverted}</b>`
                  : 'Gõ âm tiết trước, rồi gõ số 1-4 hoặc chạm phím thanh.'
              }
            </div>
            <div class="lp-tone-keys" role="group" aria-label="Phím thanh">
              ${toneMarks
                .map(
                  tm =>
                    `<button type="button" data-tone-digit="${tm.digit}" aria-label="${tm.label}" ${state.phase !== 'answering' ? 'disabled' : ''}>${tm.mark}</button>`
                )
                .join('')}
            </div>
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !hasLetters || state.phase !== 'answering';
        footerAction = () => {
          const val = state.typedText.trim();
          if (!val) return;
          const userNorm = normalizePinyinCompare(val, p.toneRequired);
          const isOk = accepted.some(acc => normalizePinyinCompare(acc, p.toneRequired) === userNorm);
          submitGradedAnswer(isOk, accepted[0], {
            hanzi: p.hanzi,
            pinyin: accepted[0],
            vi: p.meaningVi,
            audioUrl: tAudio
          });
        };
      } else if (step.type === 'match_pairs') {
        const leftItems = p.left || [];
        const rightItems = p.right || [];
        const validPairs = (step.check && step.check.pairs) || [];
        const isLeftMatched = id => state.matchedPairs.some(pr => pr[0] === id);
        const isRightMatched = id => state.matchedPairs.some(pr => pr[1] === id);
        promptHtml = `
          <p class="lp-hint" style="margin:0;">Chạm một chữ Hán ở cột trái rồi chạm nghĩa tương ứng ở cột phải.</p>
        `;
        answerHtml = `
          <div class="lp-match">
            <div class="lp-match-col">
              ${leftItems
                .map(item => {
                  const matched = isLeftMatched(item.id);
                  const sel = state.matchLeftSelected === item.id;
                  const wrong = state.matchWrongPair && state.matchWrongPair[0] === item.id;
                  return `<button type="button" lang="zh" class="lp-m hz ${matched ? 'gone' : sel ? 'sel' : ''} ${wrong ? 'wrong' : ''}" data-match-left="${item.id}" ${matched ? 'disabled' : ''}>${item.hanzi}</button>`;
                })
                .join('')}
            </div>
            <div class="lp-match-col">
              ${rightItems
                .map(item => {
                  const matched = isRightMatched(item.id);
                  const wrong = state.matchWrongPair && state.matchWrongPair[1] === item.id;
                  return `<button type="button" class="lp-m ${matched ? 'gone' : ''} ${wrong ? 'wrong' : ''}" data-match-right="${item.id}" ${matched ? 'disabled' : ''}>${item.text}</button>`;
                })
                .join('')}
            </div>
          </div>
        `;
        footerBtnLabel = 'Tiếp tục';
        footerBtnDisabled = state.matchedPairs.length < leftItems.length;
        footerAction = () => {
          if (state.matchedPairs.length >= leftItems.length) {
            submitGradedAnswer(true, '', null);
          }
        };
        // Gắn biến tạm xử lý chọn cặp trong wireEvents
        state._validPairs = validPairs;
        state._leftItems = leftItems;
      } else if (step.type === 'listen_choose') {
        const lAudio = (p.audio && p.audio.url) || '';
        const rightId = step.check && step.check.correctOptionId;
        const audInfo = getStepAudioInfo(step);
        promptHtml = `
          <div class="lp-audio-row" style="padding:16px 0;">
            <button type="button" class="lp-audio-btn big" data-play-text="${audInfo.text}" data-play-url="${lAudio}" aria-label="Nghe lại">${speakerSvg}</button>
            <button type="button" class="lp-audio-btn slow" data-play-text="${audInfo.text}" data-play-url="${lAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
          </div>
        `;
        answerHtml = `
          <div class="lp-opts" role="radiogroup">
            ${(p.options || [])
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.disabledOptionIds.has(opt.id)) {
                  cls = 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                const labelContent = opt.hanzi
                  ? `<span lang="zh" class="lp-hanzi" style="font-size:24px;">${opt.hanzi}</span>`
                  : renderColoredPinyin(opt.pinyin || opt.text || '', 'text-[20px]');
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${idx + 1}</span>
                    <span class="min-w-0 flex-1">${labelContent}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          if (!state.selectedOptionId) return;
          const rightOpt = (p.options || []).find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, rightOpt ? rightOpt.hanzi || rightOpt.pinyin : '', {
            hanzi: rightOpt && rightOpt.hanzi,
            pinyin: rightOpt && rightOpt.pinyin,
            audioUrl: lAudio
          });
        };
      } else if (step.type === 'order_sentence') {
        const tokens = p.tokens || [];
        const oAudio = (p.audio && p.audio.url) || '';
        const audInfo = getStepAudioInfo(step);
        promptHtml = `
          <div class="lp-card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <p style="font-size:18px;font-weight:700;color:var(--lp-ink);margin:0;">${p.translationVi || ''}</p>
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn small" data-play-text="${audInfo.text}" data-play-url="${oAudio}" aria-label="Nghe">${speakerSvg}</button>
            </div>
          </div>
        `;
        const pickedHtml = state.orderedTokens
          .map(tid => {
            const t = tokens.find(x => x.id === tid);
            if (!t) return '';
            return `<button type="button" class="lp-tile" data-unpick-token="${t.id}" ${state.phase !== 'answering' ? 'disabled' : ''}>
              ${t.pinyin ? renderColoredPinyin(t.pinyin) : ''}
              <span lang="zh" class="lp-hanzi">${t.text}</span>
            </button>`;
          })
          .join('');
        const bankHtml = tokens
          .map(t => {
            const used = state.orderedTokens.includes(t.id);
            return `<button type="button" class="lp-tile ${used ? 'ghost' : ''}" data-pick-token="${t.id}" ${used || state.phase !== 'answering' ? 'disabled' : ''}>
              ${t.pinyin ? renderColoredPinyin(t.pinyin) : ''}
              <span lang="zh" class="lp-hanzi">${t.text}</span>
            </button>`;
          })
          .join('');
        answerHtml = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="lp-answer-line" aria-label="Câu của bạn">${pickedHtml}</div>
            <div class="lp-bank" aria-label="Các ô chữ">${bankHtml}</div>
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = state.orderedTokens.length === 0 || state.phase !== 'answering';
        footerAction = () => {
          const acceptedOrders = (step.check && step.check.accepted) || [];
          const userStr = state.orderedTokens.map(id => (tokens.find(x => x.id === id) || {}).text || '').join('');
          const rightIds = acceptedOrders[0] || tokens.map(t => t.id);
          const rightStr = rightIds.map(id => (tokens.find(x => x.id === id) || {}).text || '').join('');
          const isOk = userStr === rightStr;
          submitGradedAnswer(isOk, rightStr, {
            hanzi: rightStr,
            vi: p.translationVi,
            audioUrl: oAudio
          });
        };
      } else if (step.type === 'fill_blank') {
        const rightId = step.check && step.check.correctOptionId;
        const pickedOpt = (p.options || []).find(o => o.id === state.selectedOptionId);
        promptHtml = `
          <div class="lp-card">
            <div class="lp-sentence" lang="zh">
              ${p.before || ''}<span class="lp-blank ${pickedOpt ? 'filled' : ''}">${pickedOpt ? pickedOpt.text : '___'}</span>${p.after || ''}
            </div>
            ${p.pinyin ? `<div style="margin-top:8px;font-size:15px;color:var(--lp-ink-2);">${p.pinyin}</div>` : ''}
            ${p.translationVi ? `<div style="margin-top:6px;font-size:15px;color:var(--lp-ink-2);">${p.translationVi}</div>` : ''}
          </div>
        `;
        answerHtml = `
          <div class="lp-opts" role="radiogroup">
            ${(p.options || [])
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.disabledOptionIds.has(opt.id)) {
                  cls = 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${idx + 1}</span>
                    <span class="min-w-0 flex-1" style="display:flex;flex-direction:column;">
                      ${opt.pinyin ? `<span style="font-size:13px;">${renderColoredPinyin(opt.pinyin)}</span>` : ''}
                      <span lang="zh" class="lp-hanzi" style="font-size:22px;">${opt.text || ''}</span>
                    </span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          if (!state.selectedOptionId) return;
          const rightOpt = (p.options || []).find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, rightOpt ? rightOpt.text : '', {
            hanzi: `${p.before || ''}${rightOpt ? rightOpt.text : ''}${p.after || ''}`,
            pinyin: p.pinyin,
            vi: p.translationVi
          });
        };
      } else if (step.type === 'read_sentence') {
        const sent = p.sentence || {};
        const sAudio = (sent.audio && sent.audio.url) || '';
        promptHtml = `
          <div class="lp-card lp-read-card">
            <div class="lp-hanzi hz" lang="zh">${sent.hanzi || ''}</div>
            ${sent.pinyin ? `<div style="font-size:18px;margin-top:4px;">${renderColoredPinyin(sent.pinyin)}</div>` : ''}
            <div class="vi">${sent.vi || ''}</div>
            <div class="lp-audio-row" style="margin-top:12px;">
              <button type="button" class="lp-audio-btn" data-play-text="${sent.hanzi || ''}" data-play-url="${sAudio}" aria-label="Nghe câu mẫu">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${sent.hanzi || ''}" data-play-url="${sAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
          </div>
        `;
        answerHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0;">
            <button type="button" class="lp-mic ${state.readRecorded ? 'rec' : ''}" id="xhz-read-mic-btn" aria-label="Bắt đầu ghi âm">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></svg>
            </button>
            <p class="lp-status-line">
              ${state.readRecorded ? `Đã chấm phát âm: <b>${state.readScore}% (Chuẩn!)</b>` : 'Chạm biểu tượng micro để đọc to câu trên'}
            </p>
            <button type="button" class="lp-btn-text" id="xhz-read-skip">Bỏ qua</button>
          </div>
        `;
        footerBtnLabel = 'Tiếp tục';
        footerBtnDisabled = !state.readRecorded;
        footerAction = () => advanceStep();
      } else if (step.type === 'dialogue') {
        const turns = p.turns || [];
        const roles = p.roles || [];
        promptHtml = `
          <div class="lp-card">
            <div style="font-size:13px;font-weight:800;color:var(--lp-ink-2);text-transform:uppercase;">Bối cảnh hội thoại</div>
            <p style="font-size:15px;color:var(--lp-ink);margin:6px 0 0 0;">${p.sceneVi || ''}</p>
          </div>
        `;
        answerHtml = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${turns
              .map(t => {
                const rObj = roles.find(r => r.id === t.role) || { labelVi: t.role };
                const tUrl = (t.audio && t.audio.url) || '';
                return `
                  <div class="lp-card" style="padding:12px 16px;display:flex;align-items:flex-start;gap:12px;">
                    <button type="button" class="lp-audio-btn small" data-play-text="${t.hanzi || ''}" data-play-url="${tUrl}" aria-label="Nghe">${speakerSvg}</button>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:12px;font-weight:800;color:var(--lp-blue);">${rObj.labelVi || ''}</div>
                      <div lang="zh" class="lp-hanzi" style="font-size:20px;font-weight:700;color:var(--lp-ink);">${t.hanzi || ''}</div>
                      <div style="font-size:14px;">${renderColoredPinyin(t.pinyin || '')}</div>
                      <div style="font-size:14px;color:var(--lp-ink-2);">${t.vi || ''}</div>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Tiếp tục';
        footerBtnDisabled = false;
        footerAction = () => advanceStep();
      } else {
        // exam_item hoặc roleplay_turn
        const opts = p.options || p.choices || [];
        const rightId = (step.check && step.check.correctOptionId) || (opts[0] && opts[0].id);
        const eAudio = (p.audio && p.audio.url) || '';
        const audInfo = getStepAudioInfo(step);
        promptHtml = `
          <div class="lp-card" style="text-align:center;">
            <p style="font-size:17px;font-weight:700;color:var(--lp-ink);margin:0 0 12px 0;">${p.instruction || p.promptVi || 'Nghe và chọn đáp án đúng'}</p>
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn big" data-play-text="${audInfo.text}" data-play-url="${eAudio}" aria-label="Nghe">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${audInfo.text}" data-play-url="${eAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
          </div>
        `;
        answerHtml = `
          <div class="lp-opts">
            ${opts
              .map((opt, idx) => {
                const sel = state.selectedOptionId === opt.id;
                return `
                  <button type="button" class="lp-opt ${sel ? 'sel' : ''}" data-choice-opt="${opt.id}">
                    <span class="k">${opt.id || idx + 1}</span>
                    <span class="min-w-0 flex-1">${opt.hanzi || opt.text || opt.vi || `Đáp án ${opt.id || idx + 1}`}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId;
        footerAction = () => {
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, String(rightId || ''), null);
        };
      }

      // 3. Xây dựng Bottom Sheet (Retry Hint Sheet hoặc Feedback Sheet)
      let sheetHtml = '';
      if (state.phase === 'hint' && step.retryHint) {
        const rh = step.retryHint;
        const rhAudio = (rh.audio && rh.audio.url) || getStepAudioInfo(step).url;
        const rhText = getStepAudioInfo(step).text;
        sheetHtml = `
          <div class="lp-sheet-backdrop" aria-hidden="true"></div>
          <div class="lp-sheet hint" role="status" aria-live="polite" data-testid="retry-hint-sheet">
            <div class="head">
              <span class="badge">${bulbSvg}</span>
              <b>Chưa đúng, thử lại nhé</b>
              <img src="/images/capy/lesson/encouraging.webp" alt="Capy" class="mini-capy" style="width:64px;height:64px;object-fit:contain;" />
            </div>
            ${rh.cue ? `<div class="cue">${rh.cue}</div>` : ''}
            ${rh.textVi ? `<p class="why">${rh.textVi}</p>` : ''}
            <div class="actions">
              <button type="button" class="lp-audio-btn slow" data-play-text="${rhText}" data-play-url="${rhAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
              <button type="button" id="xhz-sheet-retry-btn" class="lp-btn3d gold">
                Thử lại <kbd class="lp-kbd lp-kbd-in-btn">Enter</kbd>
              </button>
            </div>
          </div>
        `;
      } else if (state.phase === 'feedback' && state.verdict) {
        const v = state.verdict;
        const ans = v.answer;
        sheetHtml = `
          <div class="lp-sheet-backdrop" aria-hidden="true"></div>
          <div class="lp-sheet ${v.correct ? 'ok' : 'warn'}" role="status" aria-live="assertive" data-testid="feedback-sheet">
            <div class="head">
              <span class="badge">${v.correct ? checkSvg : exclSvg}</span>
              <b>${v.correct ? 'Chính xác!' : 'Chưa đúng'}</b>
              <img src="/images/capy/lesson/${v.correct ? 'happy' : 'encouraging'}.webp" alt="Capy" class="mini-capy" style="width:64px;height:64px;object-fit:contain;" />
            </div>
            ${
              ans && (ans.hanzi || ans.pinyin)
                ? `<div class="ans">
                    <div class="min-w-0 flex-1">
                      ${!v.correct ? `<div class="lbl">Đáp án đúng</div>` : ''}
                      ${ans.hanzi ? `<span class="lp-hanzi" lang="zh">${ans.hanzi}</span> ` : ''}
                      ${ans.pinyin ? renderColoredPinyin(ans.pinyin) : ''}
                      ${ans.vi ? `<div class="vi">${ans.vi}</div>` : ''}
                    </div>
                    <button type="button" class="lp-audio-btn slow" data-play-text="${ans.hanzi || ''}" data-play-url="${ans.audioUrl || ''}" data-play-rate="0.65" aria-label="Nghe đáp án">${snailSvg}</button>
                  </div>`
                : ''
            }
            ${!v.correct && v.explanationVi ? `<p class="why">${v.explanationVi}</p>` : ''}
            <div class="actions">
              <button type="button" id="xhz-sheet-next-btn" class="lp-btn3d ${v.correct ? 'ok' : ''}">
                Tiếp tục <kbd class="lp-kbd lp-kbd-in-btn">Enter</kbd>
              </button>
            </div>
          </div>
        `;
      }

      // 4. Xây dựng Intro Overlay (Screenshot 1)
      const introOverlayHtml = state.showIntro
        ? `
          <div class="lp-intro-ov" data-testid="lesson-intro">
            <img src="/images/capy/lesson/happy.webp" alt="Capy" style="width:200px;height:200px;object-fit:contain;" />
            <div class="lp-bubble">
              Bài này có ${introWords.length || 3} từ mới, chừng ${run.estMinutes || 6} phút. Mình đi cùng bạn nhé!
            </div>
            <div>
              <h2>${run.titleVi || 'Từ mới: Bốn thanh và thanh nhẹ'}</h2>
            </div>
            ${
              introWords.length > 0
                ? `<div class="words" lang="zh">${introWords.map(w => `<span>${w}</span>`).join('')}</div>`
                : ''
            }
            <div style="margin-top:10px;width:100%;max-width:420px;">
              <button type="button" id="xhz-intro-start-btn" class="lp-btn3d">Bắt đầu</button>
            </div>
          </div>
        `
        : '';

      // 5. Xây dựng Exit Confirmation Modal
      const exitModalHtml = state.showExitModal
        ? `
          <div style="position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:16px;">
            <div style="background:var(--lp-surface);border:1.5px solid var(--lp-border);border-radius:20px;max-width:400px;width:100%;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,0.2);">
              <h3 style="font-size:20px;font-weight:800;color:var(--lp-ink);margin:0 0 8px 0;">Tạm dừng bài học?</h3>
              <p style="font-size:15px;color:var(--lp-ink-2);margin:0 0 20px 0;line-height:1.5;">Câu trả lời đã làm được lưu lại. Lần sau bạn sẽ học tiếp từ câu đang dở.</p>
              <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button type="button" id="xhz-exit-cancel" style="padding:10px 18px;border-radius:12px;border:1.5px solid var(--lp-border-strong);background:var(--lp-surface);color:var(--lp-ink);font-weight:700;cursor:pointer;">Học tiếp</button>
                <button type="button" id="xhz-exit-confirm" style="padding:10px 18px;border-radius:12px;border:none;background:var(--lp-red);color:#fff;font-weight:700;cursor:pointer;">Thoát</button>
              </div>
            </div>
          </div>
        `
        : '';

      runnerRoot.innerHTML = `
        <div class="lp lp-runner" data-testid="lesson-runner" data-split="true">
          <div class="lp-runner-inner lp-split">
            <!-- Top Progress Bar -->
            <div class="lp-lesson-top">
              <button type="button" id="xhz-runner-exit-btn" aria-label="Thoát bài học" class="lp-icon-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
              <div class="lp-progress" role="progressbar" aria-label="Tiến độ bài học" aria-valuemin="0" aria-valuemax="${playableSteps.length}" aria-valuenow="${state.stepIdx}">
                <i style="width:${progressPct}%;"></i>
              </div>
              <button type="button" id="xhz-runner-audio-replay" aria-label="Cài đặt âm thanh" class="lp-icon-btn" title="Phát lại âm thanh (Space)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>

            <!-- Main 2-Column Split Grid -->
            <div class="xhz-lp-split-grid flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8 lg:px-8">
              <!-- Left Column: Capybara Row + Prompt -->
              <div class="xhz-lp-split-left px-5 lg:min-h-0 lg:overflow-y-auto lg:px-0 lg:py-4">
                <div class="lp-capyrow" data-testid="capy-row">
                  <img src="${getCapySprite(step)}" alt="Capy" class="lp-capy" style="width:74px;height:74px;object-fit:contain;" />
                  <div class="lp-bubble pop" aria-live="polite">
                    ${isHard ? `<span class="lp-tag-hard">CÂU KHÓ</span><br/>` : ''}
                    ${getCapyPromptLine(step)}
                  </div>
                </div>
                <div class="mt-3.5">${promptHtml}</div>
              </div>

              <!-- Right Column: Step Answer Area + Footer + Sheet -->
              <div class="xhz-lp-split-right relative flex min-h-0 flex-1 flex-col lg:overflow-hidden">
                <div class="lp-step-area">
                  <div class="lp-step-body">${answerHtml}</div>
                </div>
                <div class="lp-footer">
                  <button type="button" id="xhz-runner-primary-btn" data-runner-action="" class="lp-btn3d" ${footerBtnDisabled ? 'disabled' : ''}>
                    ${footerBtnLabel}
                    ${!footerBtnDisabled ? `<kbd class="lp-kbd lp-kbd-in-btn" aria-hidden="true">Enter</kbd>` : ''}
                  </button>
                  <p class="lp-key-tips" aria-hidden="true"><kbd class="lp-kbd">Space</kbd> nghe lại</p>
                </div>
                ${sheetHtml}
              </div>
            </div>

            ${introOverlayHtml}
            ${exitModalHtml}
          </div>
        </div>
      `;

      // Wire events
      const startBtn = runnerRoot.querySelector('#xhz-intro-start-btn');
      if (startBtn) {
        startBtn.onclick = () => {
          state.showIntro = false;
          renderRunner();
          const aud = getStepAudioInfo(getCurrentStep());
          if (aud.text || aud.url) {
            playPronunciation(aud.text, aud.url, 1.0);
          }
        };
      }

      const exitBtn = runnerRoot.querySelector('#xhz-runner-exit-btn');
      if (exitBtn) {
        exitBtn.onclick = () => {
          state.showExitModal = true;
          renderRunner();
        };
      }
      const exitCancel = runnerRoot.querySelector('#xhz-exit-cancel');
      if (exitCancel) {
        exitCancel.onclick = () => {
          state.showExitModal = false;
          renderRunner();
        };
      }
      const exitConfirm = runnerRoot.querySelector('#xhz-exit-confirm');
      if (exitConfirm) {
        exitConfirm.onclick = () => {
          window.location.assign('/hoc');
        };
      }

      const replayGear = runnerRoot.querySelector('#xhz-runner-audio-replay');
      if (replayGear) {
        replayGear.onclick = () => {
          const aud = getStepAudioInfo(getCurrentStep());
          playPronunciation(aud.text, aud.url, 1.0);
        };
      }

      runnerRoot.querySelectorAll('[data-play-text], [data-play-url]').forEach(btn => {
        btn.onclick = () => {
          const txt = btn.getAttribute('data-play-text') || '';
          const url = btn.getAttribute('data-play-url') || '';
          const rate = Number(btn.getAttribute('data-play-rate')) || 1.0;
          playPronunciation(txt, url, rate);
        };
      });

      // Pretest options (intro_word)
      runnerRoot.querySelectorAll('[data-pretest-opt]').forEach(btn => {
        btn.onclick = () => {
          if (state.pretestRevealed) return;
          state.pretestPickedId = btn.getAttribute('data-pretest-opt');
          state.pretestRevealed = true;
          const aud = getStepAudioInfo(step);
          playPronunciation(aud.text, aud.url, 1.0);
          renderRunner();
        };
      });
      const pretestSkip = runnerRoot.querySelector('#xhz-pretest-skip');
      if (pretestSkip) {
        pretestSkip.onclick = () => {
          state.pretestPickedId = null;
          state.pretestRevealed = true;
          const aud = getStepAudioInfo(step);
          playPronunciation(aud.text, aud.url, 1.0);
          renderRunner();
        };
      }

      // Multiple-choice options (choose_meaning, listen_choose, fill_blank, exam_item)
      runnerRoot.querySelectorAll('[data-choice-opt]').forEach(btn => {
        btn.onclick = () => {
          if (state.phase !== 'answering') return;
          const optId = btn.getAttribute('data-choice-opt');
          if (state.disabledOptionIds.has(optId)) return;
          state.selectedOptionId = optId;
          renderRunner();
        };
      });

      // Write character phase tabs & skip
      runnerRoot.querySelectorAll('[data-write-phase]').forEach(btn => {
        btn.onclick = () => {
          state.writePhaseIdx = Number(btn.getAttribute('data-write-phase')) || 0;
          state.writeQuizDone = false;
          renderRunner();
        };
      });
      const writeSkip = runnerRoot.querySelector('#xhz-write-skip');
      if (writeSkip) {
        writeSkip.onclick = () => advanceStep();
      }

      // Type pinyin input & tone buttons
      const pyInput = runnerRoot.querySelector('#xhz-pinyin-input');
      if (pyInput) {
        pyInput.focus();
        pyInput.setSelectionRange(pyInput.value.length, pyInput.value.length);
        pyInput.oninput = e => {
          state.typedText = e.target.value;
          const prevEl = runnerRoot.querySelector('#xhz-pinyin-preview');
          const conv = convertNumberedPinyin(state.typedText);
          if (prevEl) {
            prevEl.innerHTML =
              conv && conv !== state.typedText.trim()
                ? `Hiển thị: <b>${conv}</b>`
                : 'Gõ âm tiết trước, rồi gõ số 1-4 hoặc chạm phím thanh.';
          }
          const primBtn = runnerRoot.querySelector('#xhz-runner-primary-btn');
          if (primBtn) {
            primBtn.disabled = !/[a-zA-ZüÜvVāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(state.typedText);
          }
        };
        pyInput.onkeydown = e => {
          if (e.key === 'Enter' && state.typedText.trim()) {
            e.preventDefault();
            footerAction();
          }
        };
      }
      runnerRoot.querySelectorAll('[data-tone-digit]').forEach(btn => {
        btn.onclick = () => {
          const digit = btn.getAttribute('data-tone-digit');
          const cleaned = state.typedText.replace(/[1-5]$/, '');
          state.typedText = convertNumberedPinyin(cleaned + digit);
          renderRunner();
        };
      });

      // Match pairs
      runnerRoot.querySelectorAll('[data-match-left]').forEach(btn => {
        btn.onclick = () => {
          const lid = btn.getAttribute('data-match-left');
          state.matchLeftSelected = lid;
          const lItem = (state._leftItems || []).find(x => x.id === lid);
          if (lItem) {
            playPronunciation(lItem.hanzi, lItem.audio && lItem.audio.url, 1.0);
          }
          renderRunner();
        };
      });
      runnerRoot.querySelectorAll('[data-match-right]').forEach(btn => {
        btn.onclick = () => {
          if (!state.matchLeftSelected) return;
          const rid = btn.getAttribute('data-match-right');
          const lid = state.matchLeftSelected;
          const isValid = (state._validPairs || []).some(pr => pr[0] === lid && pr[1] === rid);
          state.matchLeftSelected = null;
          if (isValid) {
            state.matchedPairs.push([lid, rid]);
            renderRunner();
            if (state.matchedPairs.length >= (state._leftItems || []).length) {
              setTimeout(() => submitGradedAnswer(true, '', null), 300);
            }
          } else {
            state.matchWrongPair = [lid, rid];
            renderRunner();
            setTimeout(() => {
              state.matchWrongPair = null;
              renderRunner();
            }, 550);
          }
        };
      });

      // Order sentence tiles
      runnerRoot.querySelectorAll('[data-pick-token]').forEach(btn => {
        btn.onclick = () => {
          const tid = btn.getAttribute('data-pick-token');
          if (!state.orderedTokens.includes(tid)) {
            state.orderedTokens.push(tid);
            renderRunner();
          }
        };
      });
      runnerRoot.querySelectorAll('[data-unpick-token]').forEach(btn => {
        btn.onclick = () => {
          const tid = btn.getAttribute('data-unpick-token');
          state.orderedTokens = state.orderedTokens.filter(x => x !== tid);
          renderRunner();
        };
      });

      // Read sentence mic & skip
      const micBtn = runnerRoot.querySelector('#xhz-read-mic-btn');
      if (micBtn) {
        micBtn.onclick = () => {
          state.readRecorded = true;
          const sent = (step.payload && step.payload.sentence) || {};
          playPronunciation(sent.hanzi || '', (sent.audio && sent.audio.url) || '', 1.0);
          renderRunner();
        };
      }
      const readSkip = runnerRoot.querySelector('#xhz-read-skip');
      if (readSkip) {
        readSkip.onclick = () => advanceStep();
      }

      // Sheet retry / next buttons
      const sheetRetryBtn = runnerRoot.querySelector('#xhz-sheet-retry-btn');
      if (sheetRetryBtn) {
        sheetRetryBtn.onclick = () => {
          state.phase = 'answering';
          state.selectedOptionId = null;
          renderRunner();
        };
      }
      const sheetNextBtn = runnerRoot.querySelector('#xhz-sheet-next-btn');
      if (sheetNextBtn) {
        sheetNextBtn.onclick = () => advanceStep();
      }

      // Primary footer button
      const primaryBtn = runnerRoot.querySelector('#xhz-runner-primary-btn');
      if (primaryBtn) {
        primaryBtn.onclick = () => {
          if (!footerBtnDisabled) footerAction();
        };
      }

      // Mount HanziWriter if write_character step
      mountHanziWriterIfNeeded();
    }

    // Keyboard shortcuts: [Enter], [Space], [1-4]
    if (window.__xhzLessonKeydownHandler) {
      window.removeEventListener('keydown', window.__xhzLessonKeydownHandler);
    }
    window.__xhzLessonKeydownHandler = function (e) {
      if (!document.getElementById('xhz-lesson-runner-root')) return;
      const activeTag = (document.activeElement && document.activeElement.tagName) || '';
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        const aud = getStepAudioInfo(getCurrentStep());
        playPronunciation(aud.text, aud.url, 1.0);
        return;
      }
      if (e.key === 'Enter' && !isInput) {
        e.preventDefault();
        if (state.showIntro) {
          const sb = runnerRoot.querySelector('#xhz-intro-start-btn');
          if (sb) sb.click();
          return;
        }
        if (state.phase === 'hint') {
          const rb = runnerRoot.querySelector('#xhz-sheet-retry-btn');
          if (rb) rb.click();
          return;
        }
        if (state.phase === 'feedback') {
          const nb = runnerRoot.querySelector('#xhz-sheet-next-btn');
          if (nb) nb.click();
          return;
        }
        if (state.phase === 'done') {
          const db = runnerRoot.querySelector('#xhz-done-continue');
          if (db) db.click();
          return;
        }
        const pb = runnerRoot.querySelector('#xhz-runner-primary-btn');
        if (pb && !pb.disabled) pb.click();
        return;
      }
      if (!isInput && !state.showIntro && state.phase === 'answering' && /^[1-4]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const step = getCurrentStep();
        if (step && step.type === 'intro_word' && !state.pretestRevealed) {
          const preBtns = runnerRoot.querySelectorAll('[data-pretest-opt]');
          if (preBtns[idx]) preBtns[idx].click();
        } else {
          const choiceBtns = runnerRoot.querySelectorAll('[data-choice-opt]');
          if (choiceBtns[idx] && !choiceBtns[idx].disabled) choiceBtns[idx].click();
        }
      }
    };
    window.addEventListener('keydown', window.__xhzLessonKeydownHandler);

    renderRunner();
  }

  // --------------------------------------------------------------------------
  // 6.10. Router Điều Phối Tất Cả Các Trang Chi Tiết Động
  // --------------------------------------------------------------------------
  let lastHandledFullUrl = '';
  async function checkAndRenderDynamicPage() {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const fullKey = pathname + window.location.search;
    if (fullKey === lastHandledFullUrl && document.getElementById('xhz-dynamic-page-root')) return;

    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'han-tu' && parts.length >= 2) {
      lastHandledFullUrl = fullKey;
      await renderCharacterDetailPage(parts.slice(1).join('/'));
      return;
    }
    if (parts[0] === 'tu-vung' && parts.length >= 2) {
      lastHandledFullUrl = fullKey;
      await renderVocabularyDetailPage(parts.slice(1).join('/'));
      return;
    }
    if (parts[0] === 'han-viet') {
      lastHandledFullUrl = fullKey;
      if (parts.length === 1) await renderHanVietIndexPage();
      else await renderHanVietDetailPage(parts[1]);
      return;
    }
    if (parts[0] === 'ngu-phap' && parts[1] === 'luyen-tap' && parts.length >= 3) {
      lastHandledFullUrl = fullKey;
      const pointId = decodeURIComponent(parts[2]);
      const level = (pointId.match(/\d+/) || ['1'])[0];
      await renderGrammarQuizRunPage(new URLSearchParams({ tracks: `${/_new_|^new-/.test(pointId) ? 'new-hsk' : 'hsk'}${level}`, grammarId: pointId, count: '20' }));
      return;
    }
    if (parts[0] === 'ngu-phap' && parts.length >= 3) {
      lastHandledFullUrl = fullKey;
      await renderGrammarDetailPage(parts[1], parts[2]);
      return;
    }
    if (parts[0] === 'kiem-tra-ngu-phap' && parts[1] === 'lam-bai') {
      lastHandledFullUrl = fullKey;
      await renderGrammarQuizRunPage(new URLSearchParams(window.location.search));
      return;
    }
    if (parts[0] && parts[0].startsWith('thu-vien-')) {
      const minParts = STATIC_CURR_ROOTS.includes(parts[0]) ? 3 : 2;
      if (parts.length >= minParts) {
        lastHandledFullUrl = fullKey;
        await renderCurriculumSubPage(pathname);
        return;
      }
    }
    if (parts[0] === 'luyen-chep-chinh-ta' && parts.length >= 2) {
      lastHandledFullUrl = fullKey;
      await renderDictationDetailPage(parts[1]);
      return;
    }
    if ((parts[0] === 'kiem-tra-hsk' && parts.length >= 2) || (parts[0] === 'de-kiem-tra' && parts[1] === 'lam-bai')) {
      lastHandledFullUrl = fullKey;
      await renderHskTestPaperPage(pathname);
      return;
    }
    if (parts[0] === 'hoc' && (parts[1] === 'chang' || parts[1] === 'bai' || parts[1] === 'kiem-tra-cap') && parts.length >= 3) {
      lastHandledFullUrl = fullKey;
      await renderStudyStageOrRunPage(pathname);
      return;
    }
    if (parts[0] === 'hoc' && (parts[1] === 'tien-do' || parts[1] === 'thoi-quen')) {
      lastHandledFullUrl = fullKey;
      await renderProgressOrHabitPage(pathname);
      return;
    }
    if (parts[0] === 'tra-chu' && (parts[1] === 'bo-thu' || parts[1] === 'hsk') && parts.length >= 3) {
      lastHandledFullUrl = fullKey;
      await renderCharacterBrowseSubPage(pathname);
      return;
    }

    lastHandledFullUrl = fullKey;
    restoreOriginalMainIfStatic();
  }

  function enhanceAccountPageAuthUI() {
    try {
      const path = (window.location.pathname || '').replace(/\/+$/, '');
      if (path !== '/tai-khoan' && path !== '/tai-khoan.html') return;

      const googleIconHtml =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:20px;height:20px;flex-shrink:0;"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>';

      // 1. Giao diện Khách (chưa đăng nhập): thêm nút "Đăng nhập bằng Google" trực tiếp
      const guestBenefits = document.querySelector('[data-testid="account-guest-benefits"]');
      if (guestBenefits && !document.getElementById('xhz-direct-google-btn')) {
        const btnGroup = guestBenefits.nextElementSibling;
        if (btnGroup) {
          const gBtn = document.createElement('button');
          gBtn.id = 'xhz-direct-google-btn';
          gBtn.type = 'button';
          gBtn.setAttribute('data-google-oauth', '1');
          gBtn.style.cssText =
            'width:100%;height:52px;padding:0 24px;border-radius:12px;border:1.5px solid #e7e5e4;background:#ffffff;color:#1c1917;font-weight:700;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.15s ease;';
          gBtn.innerHTML = googleIconHtml + '<span>Đăng nhập bằng Google</span>';
          gBtn.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            window.loginWithGoogle('/tai-khoan');
          });
          btnGroup.insertBefore(gBtn, btnGroup.firstChild);
        }
      }

      // 2. Giao diện Đã đăng nhập: thêm thẻ thông tin tài khoản Google + nút Đồng bộ & Đăng xuất nổi bật
      const planCard = document.querySelector('[data-testid="account-plan-card"]');
      const savedUser = getSavedUser();
      if (planCard && savedUser && !document.getElementById('xhz-user-auth-banner')) {
        const banner = document.createElement('div');
        banner.id = 'xhz-user-auth-banner';
        banner.style.cssText =
          'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;margin-bottom:16px;border-radius:16px;border:1px solid #e7e5e4;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.04);';
        const initial = (savedUser.displayName || savedUser.email || 'U').trim().charAt(0).toUpperCase();
        const avatarHtml = savedUser.avatar
          ? `<img src="${escapeHtml(savedUser.avatar)}" alt="" style="width:44px;height:44px;border-radius:999px;object-fit:cover;border:1px solid #e7e5e4;" />`
          : `<div style="width:44px;height:44px;border-radius:999px;background:#fef2f2;color:#dc2626;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;border:1px solid #fecaca;">${escapeHtml(initial)}</div>`;
        banner.innerHTML =
          `<div style="display:flex;align-items:center;gap:12px;min-width:0;">` +
          avatarHtml +
          `<div style="min-width:0;">` +
          `<div style="font-weight:700;font-size:16px;color:#1c1917;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(savedUser.displayName || 'Học viên')}</div>` +
          `<div id="xhz-cloud-sync-status" style="font-size:13px;color:#57534e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Đã đăng nhập: ${escapeHtml(savedUser.email)}</div>` +
          `</div>` +
          `</div>` +
          `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">` +
          `<button type="button" id="xhz-cloud-sync-btn" style="padding:8px 14px;border-radius:10px;border:1px solid #d6d3d1;background:#fafaf9;color:#1c1917;font-weight:600;font-size:13px;cursor:pointer;">🔄 Đồng bộ ngay</button>` +
          `<button type="button" id="xhz-direct-logout-btn" style="padding:8px 16px;border-radius:10px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;font-weight:600;font-size:14px;cursor:pointer;">Đăng xuất</button>` +
          `</div>`;
        if (planCard.parentElement) {
          planCard.parentElement.insertBefore(banner, planCard);
          const syncBtn = banner.querySelector('#xhz-cloud-sync-btn');
          const statusEl = banner.querySelector('#xhz-cloud-sync-status');
          if (syncBtn) {
            syncBtn.addEventListener('click', async function (ev) {
              ev.preventDefault();
              syncBtn.disabled = true;
              syncBtn.textContent = '⏳ Đang đồng bộ...';
              let synced = false;
              try { synced = Boolean(window.__xhzSyncCloudProgress && await window.__xhzSyncCloudProgress()); } catch (_) {}
              syncBtn.textContent = synced ? '✅ Đã đồng bộ!' : 'Thử đồng bộ lại';
              if (statusEl) {
                statusEl.textContent = synced ? `Đã đăng nhập: ${savedUser.email} · Vừa đồng bộ lúc ${new Date().toLocaleTimeString('vi-VN')}` : 'Chưa đồng bộ được. Dữ liệu học trên thiết bị vẫn được giữ lại.';
              }
              setTimeout(() => {
                syncBtn.disabled = false;
                syncBtn.textContent = '🔄 Đồng bộ ngay';
              }, 2000);
            });
          }
          const outBtn = banner.querySelector('#xhz-direct-logout-btn');
          if (outBtn) {
            outBtn.addEventListener('click', function (ev) {
              ev.preventDefault();
              window.logoutXieHanzi();
            });
          }
        }
      }
    } catch (_e) {}
  }

  // Capture-phase click handler for Google OAuth buttons & internal <a> links
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const btn = e.target && e.target.closest ? e.target.closest('button, a') : null;
    if (btn) {
      const txt = (btn.textContent || '').trim();
      if (
        btn.hasAttribute('data-google-oauth') ||
        txt.includes('Tiếp tục với Google') ||
        txt.includes('Đăng nhập với Google') ||
        txt.includes('Đăng ký với Google') ||
        txt.includes('Đăng nhập bằng Google')
      ) {
        e.preventDefault();
        e.stopPropagation();
        window.loginWithGoogle();
        return;
      }
    }
    const anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!anchor) return;
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download')) return;

    let targetUrl;
    try {
      targetUrl = new URL(rawHref, window.location.origin);
    } catch (_) {
      return;
    }
    if (targetUrl.origin !== window.location.origin) return;

    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const nextPath = targetUrl.pathname.replace(/\/+$/, '') || '/';
    if (currentPath === nextPath && targetUrl.search === window.location.search) return;

    if (isDynamicSpaRoute(nextPath)) {
      e.preventDefault();
      e.stopPropagation();
      origPushState.call(history, null, '', targetUrl.pathname + targetUrl.search + targetUrl.hash);
      checkAndRenderDynamicPage();
    } else {
      e.preventDefault();
      e.stopPropagation();
      window.location.assign(targetUrl.pathname + targetUrl.search + targetUrl.hash);
    }
  }, true);

  // ============================================================================
  // 7. KHỞI CHẠY & THEO DÕI SPA NAVIGATION
  // ============================================================================
  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    setTimeout(checkAndRenderDynamicPage, 30);
    setTimeout(enhanceAccountPageAuthUI, 100);
  };
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    setTimeout(checkAndRenderDynamicPage, 30);
    setTimeout(enhanceAccountPageAuthUI, 100);
  };
  window.addEventListener('popstate', () => {
    setTimeout(checkAndRenderDynamicPage, 30);
    setTimeout(enhanceAccountPageAuthUI, 100);
  });

  function boot() {
    rewriteDomMedia(document);
    enhanceAccountPageAuthUI();
    supabaseFetchInitial();
    if (isDynamicSpaRoute(window.location.pathname)) {
      setTimeout(checkAndRenderDynamicPage, 450);
    }

    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) rewriteDomMedia(node);
        });
      }
      enhanceAccountPageAuthUI();
    });
    if (document.documentElement) {
      obs.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
