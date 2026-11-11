/**
 * ============================================================================
 * XIEHANZI 1:1 CLONE RUNTIME ENGINE (v7.0 — FULL SUBPAGES + GAMES + HYDRATION)
 * ============================================================================
 * Phục vụ toàn bộ 280+ trang HTML tĩnh và mọi đường dẫn động (slug routes)
 * của https://hoctiengtrungquoc.vercel.app
 * Kết nối trực tiếp tới:
 *   1) Kho dữ liệu JSON cục bộ (/data/*)
 *   2) Kho 94,655 file Media trên GitHub hungktkthd/saochepweb
 *   3) Cơ sở dữ liệu đám mây Supabase (xcthntcgenzfybefaphh)
 *   4) Serverless AI Endpoint (/api/ai)
 * ============================================================================
 */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://skxgzzdunqloxxombtuc.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18';
  const SUPABASE_DB_URL = 'https://xcthntcgenzfybefaphh.supabase.co';
  const SUPABASE_DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGhudGNnZW56ZnliZWZhcGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDE0NjQsImV4cCI6MjEwOTIxNzQ2NH0.0L3BZslXqmIkiH3kuKSL0HJeo_gmZ15E614xqnxhbdM';
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
      return parsed && parsed.email ? parsed : null;
    } catch (_e) {
      return null;
    }
  }

  function saveAuthSession(accessToken, refreshToken, profileOverride) {
    try {
      const payload = decodeJwtPayload(accessToken) || {};
      const meta = payload.user_metadata || {};
      const over = profileOverride || {};
      const email = over.email || payload.email || meta.email || 'hocvien@gmail.com';
      const displayName =
        over.displayName ||
        over.name ||
        meta.full_name ||
        meta.name ||
        (email ? email.split('@')[0] : 'Học viên XieHanzi');
      const avatar = over.avatar || meta.avatar_url || meta.picture || '';
      const uid = over.id || payload.sub || 'user-' + Date.now();
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
        hasPassword: Boolean(over.hasPassword),
        showPinyinByDefault: over.showPinyinByDefault !== undefined ? over.showPinyinByDefault : true,
        showOnPublicFeed: over.showOnPublicFeed !== undefined ? over.showOnPublicFeed : true,
        streak: 5
      };
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
      if (accessToken) localStorage.setItem('sb_access_token', accessToken);
      if (refreshToken) localStorage.setItem('sb_refresh_token', refreshToken);
      localStorage.setItem('httq_user', JSON.stringify(userObj));
      localStorage.setItem('httq_user_id', uid);
      localStorage.setItem('httq_real_auth', '1');
      return userObj;
    } catch (_e) {
      return null;
    }
  }

  function clearAuthSession() {
    try {
      const sbToken = localStorage.getItem('sb_access_token');
      if (sbToken && sbToken !== DEFAULT_JWT) {
        originalFetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${sbToken}`
          }
        }).catch(() => {});
      }
      localStorage.removeItem('httq_user');
      localStorage.removeItem('httq_real_auth');
      localStorage.removeItem('httq_oauth_return_to');
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_refresh_token');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
    } catch (_e) {}
  }

  // Xử lý OAuth callback từ Supabase Google Login (#access_token=... hoặc token lưu bởi @supabase/supabase-js)
  try {
    const hash = window.location.hash ? window.location.hash.substring(1) : '';
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken) {
        saveAuthSession(accessToken, refreshToken);
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (_e) {}
        const returnTo = localStorage.getItem('httq_oauth_return_to') || '/tai-khoan';
        localStorage.removeItem('httq_oauth_return_to');
        const curPath = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
        originalFetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`
          }
        })
          .then(r => (r.ok ? r.json() : null))
          .then(u => {
            if (u && u.email) {
              const m = u.user_metadata || {};
              saveAuthSession(accessToken, refreshToken, {
                id: u.id,
                email: u.email,
                displayName: m.full_name || m.name || u.email.split('@')[0],
                avatar: m.avatar_url || m.picture || ''
              });
            }
          })
          .catch(() => {})
          .finally(() => {
            if (curPath === '/' || curPath === '/index.html' || curPath === '/dang-nhap' || curPath === '/dang-ky') {
              window.location.replace(returnTo);
            }
          });
      }
    } else {
      // Kiểm tra nếu người dùng đã đăng nhập qua tai-khoan-moi.html (sb-skxgzzdunqloxxombtuc-auth-token)
      const sbRaw = localStorage.getItem('sb-skxgzzdunqloxxombtuc-auth-token');
      if (sbRaw && localStorage.getItem('httq_real_auth') !== '1') {
        const sbSession = JSON.parse(sbRaw);
        if (sbSession && sbSession.access_token && sbSession.user) {
          const m = sbSession.user.user_metadata || {};
          saveAuthSession(sbSession.access_token, sbSession.refresh_token, {
            id: sbSession.user.id,
            email: sbSession.user.email,
            displayName: m.full_name || m.name || (sbSession.user.email || '').split('@')[0],
            avatar: m.avatar_url || m.picture || ''
          });
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
      if (key === 'xiehanzi_access_token') {
        origRemoveItem.call(localStorage, 'httq_user');
        origRemoveItem.call(localStorage, 'httq_real_auth');
        origRemoveItem.call(localStorage, 'sb_access_token');
        origRemoveItem.call(localStorage, 'sb_refresh_token');
        localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
      }
    };
  } catch (_e) {}

  window.loginWithGoogle = function (returnUrl) {
    let dest = returnUrl;
    if (!dest || typeof dest !== 'string') {
      const sp = new URLSearchParams(window.location.search);
      dest = sp.get('returnUrl') || '/tai-khoan';
    }
    const cleanDest = dest.startsWith('http') ? new URL(dest).pathname : dest.startsWith('/') ? dest : '/' + dest;
    try {
      localStorage.setItem('httq_oauth_return_to', cleanDest || '/tai-khoan');
    } catch (_e) {}
    const fullRedirect = dest.startsWith('http')
      ? dest
      : window.location.origin + (dest.startsWith('/') ? dest : '/' + dest);
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
  // 2. ĐỒNG BỘ SUPABASE & LOCAL STORAGE
  // ==========================================================================
  function getLocalState() {
    try {
      return JSON.parse(localStorage.getItem('httq_state') || '{"masteredChars":{},"savedWords":{},"examCount":0,"history":[]}');
    } catch (_e) {
      return { masteredChars: {}, savedWords: {}, examCount: 0, history: [] };
    }
  }

  function saveLocalState(state) {
    try {
      localStorage.setItem('httq_state', JSON.stringify(state));
    } catch (_e) {}
  }

  async function supabaseUpsert(state) {
    saveLocalState(state);
    try {
      const userId = localStorage.getItem('httq_user_id');
      if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(userId)) return;
      await originalFetch(`${SUPABASE_DB_URL}/rest/v1/study_profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_DB_KEY,
          'Authorization': `Bearer ${SUPABASE_DB_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          user_id: userId,
          workspace: 'hoctiengtrungquoc',
          state: state,
          updated_at: new Date().toISOString()
        })
      });
    } catch (_e) {}
  }

  async function supabasePull() {
    try {
      const userId = localStorage.getItem('httq_user_id');
      if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(userId)) return;
      const res = await originalFetch(
        `${SUPABASE_DB_URL}/rest/v1/study_profiles?select=state&user_id=eq.${encodeURIComponent(userId)}&workspace=eq.hoctiengtrungquoc`,
        {
          headers: {
            'apikey': SUPABASE_DB_KEY,
            'Authorization': `Bearer ${SUPABASE_DB_KEY}`
          }
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows[0] && rows[0].state) {
          const cur = getLocalState();
          const remote = rows[0].state;
          cur.masteredChars = { ...remote.masteredChars, ...cur.masteredChars };
          cur.savedWords = { ...remote.savedWords, ...cur.savedWords };
          cur.examCount = Math.max(cur.examCount || 0, remote.examCount || 0);
          saveLocalState(cur);
        }
      }
    } catch (_e) {}
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
    return found || chunk[0] || null;
  }

  async function lookupWord(slugOrWord) {
    const rawDecoded = decodeURIComponent(slugOrWord).trim();
    const word = extractHanziWord(rawDecoded);
    const index = (await loadLocalJson('/data/vocabulary/index.json')) || [];
    let entry = null;
    if (Array.isArray(index)) {
      entry = index.find(x => (x.w || x.word || x.hanzi) === word || (x.w || x.word || x.hanzi) === rawDecoded);
      if (!entry) {
        entry = index.find(x => (x.w || '').replace(/\{|\}/g, '') === word);
      }
    }
    const targetWord = entry ? (entry.w || entry.word || entry.hanzi) : word;
    const chunkId = entry && entry.chunk ? entry.chunk : 1;
    const chunkNum = String(chunkId).padStart(2, '0');
    const chunk = (await loadLocalJson(`/data/vocabulary/vocabulary-${chunkNum}.json`)) || [];
    let found = Array.isArray(chunk)
      ? chunk.find(w => (w.hanzi || w.word || w.w) === targetWord || (w.hanzi || '').replace(/\{|\}/g, '') === word)
      : null;
    if (!found && entry) {
      found = {
        hanzi: entry.w,
        pinyin: entry.p,
        hanviet: entry.hv,
        translationVi: entry.m,
        wordMeaningVi: entry.m
      };
    }
    return found || chunk[0] || null;
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
    const firstChunk = (await loadLocalJson('/data/han-viet/han-viet-01.json')) || [];
    return firstChunk[0] || null;
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
      `/data/tests/papers/level-6-${cleanId}.json`,
      `/data/tests/papers/hsk30-${fallbackLevel || 1}.json`,
      `/data/tests/papers/hsk30-1.json`
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

  async function handleApiRequest(urlOrObj, init) {
    const urlObj = typeof urlOrObj === 'string' ? new URL(urlOrObj, window.location.origin) : urlOrObj;
    const p = (urlObj.pathname || '').replace(/^\/api/, '');
    const method = (init && init.method ? init.method : 'GET').toUpperCase();

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
      const email = (body.email || 'hocvien@gmail.com').trim();
      const displayName = (body.displayName || body.name || email.split('@')[0] || 'Học viên').trim();
      const userObj = saveAuthSession(DEFAULT_JWT, '', {
        id: 'user-' + Date.now(),
        email,
        displayName,
        hasPassword: true
      });
      return jsonResponse({
        ok: true,
        isAuthenticated: true,
        accessToken: DEFAULT_JWT,
        token: DEFAULT_JWT,
        ...userObj,
        user: userObj
      });
    }
    if (p.includes('/v1/users/me/profile') || p.includes('/v1/users/me/preferences')) {
      const body = await parseRequestBody(init);
      const cur = getSavedUser() || { email: 'hocvien@gmail.com', displayName: 'Học viên' };
      const updated = saveAuthSession(localStorage.getItem('xiehanzi_access_token') || DEFAULT_JWT, '', {
        ...cur,
        ...body,
        displayName: body.displayName || body.name || cur.displayName
      });
      return jsonResponse({ ok: true, ...updated, user: updated });
    }
    if (p.includes('/v1/users/me/avatar')) {
      const cur = getSavedUser() || { email: 'hocvien@gmail.com', displayName: 'Học viên' };
      if (method === 'DELETE') {
        const updated = saveAuthSession(localStorage.getItem('xiehanzi_access_token') || DEFAULT_JWT, '', {
          ...cur,
          avatar: ''
        });
        return jsonResponse({ ok: true, ...updated, user: updated });
      }
      const body = await parseRequestBody(init);
      const updated = saveAuthSession(localStorage.getItem('xiehanzi_access_token') || DEFAULT_JWT, '', {
        ...cur,
        avatar: body.image || body.avatar || cur.avatar
      });
      return jsonResponse({ ok: true, ...updated, user: updated });
    }
    if (p.includes('/v1/users/me/password')) {
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/auth/') || p.includes('/v2/auth/') || p.includes('/v1/users/me') || p.includes('/v1/profile')) {
      const savedUser = getSavedUser();
      if (savedUser) {
        const tok = localStorage.getItem('xiehanzi_access_token') || DEFAULT_JWT;
        return jsonResponse({
          ok: true,
          isAuthenticated: true,
          isGuest: false,
          accessToken: tok,
          token: tok,
          ...savedUser,
          user: savedUser
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
        streak: 5,
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
          streak: 5
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
            text: '你好 (Nǐ hǎo)! Mình luôn sẵn sàng đồng hành cùng bạn. Bạn có thể nhắn tin hỏi từ vựng, ngữ pháp hoặc bấm nút Gọi thoại 🎙️ để luyện nói tiếng Trung trực tiếp với mình nhé!',
            createdAt: new Date(Date.now() - 60000).toISOString()
          }
        ];
      }
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const msg = (body.message || '').trim();
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
        let replyText = '太棒了 (Tài bàng le)! Mình đã nhận được câu của bạn. Hãy thử đọc to câu này nhé: “我每天都练习汉语” (Wǒ měitiān dōu liànxí Hànyǔ — Mỗi ngày tôi đều luyện tiếng Trung)! 💪';
        const lower = msg.toLowerCase();
        if (lower.includes('3 câu') || lower.includes('giao tiếp')) {
          replyText = 'Đây là 3 mẫu câu HSK 1 cực kỳ thông dụng:\n1. 你好，认识你很高兴！(Nǐ hǎo, rènshi nǐ hěn gāoxìng!) — Xin chào, rất vui được làm quen với bạn!\n2. 请问，你叫什么名字？(Qǐngwèn, nǐ jiào shénme míngzi?) — Xin hỏi, bạn tên là gì?\n3. 谢谢你！不客气！(Xièxie nǐ! Bú kèqi!) — Cảm ơn bạn! Đừng khách sáo!';
        } else if (lower.includes('不客气') || lower.includes('没关系') || lower.includes('phân biệt')) {
          replyText = 'Mẹo nhớ cực nhanh nhé:\n• 不客气 (bú kèqi — đừng khách sáo): dùng để đáp lại lời CẢM ƠN (谢谢 xièxie).\n• 没关系 (méi guānxi — không sao đâu): dùng để đáp lại lời XIN LỖI (对不起 duìbuqǐ).';
        } else if (lower.includes('phản xạ') || lower.includes('1 câu')) {
          replyText = 'Thử dịch và đọc to câu này sang tiếng Trung nhé:\n👉 “Hôm nay tôi học tiếng Trung rất vui!”\nĐáp án gợi ý: 今天我学汉语很开心！(Jīntiān wǒ xué Hànyǔ hěn kāixīn!)';
        } else if (msg) {
          replyText = `Mình nhận được tin nhắn "${msg}" của bạn rồi! Câu tương ứng trong tiếng Trung là: “你好，我们一起加油学中文吧！” (Nǐ hǎo, wǒmen yìqǐ jiāyóu xué Zhōngwén ba! — Xin chào, chúng mình cùng cố gắng học tiếng Trung nhé!).`;
        }
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
      return jsonResponse({
        streakDays: 5,
        totalMinutes: 145,
        wordsMastered: 64,
        wordsLearning: 22,
        lessonsDone: 4,
        stagesDone: 1,
        accuracyPct: 91,
        activity: [
          { isoWeek: '2026-W34', minutes: 25, activeDays: 2 },
          { isoWeek: '2026-W35', minutes: 40, activeDays: 3 },
          { isoWeek: '2026-W36', minutes: 35, activeDays: 3 },
          { isoWeek: '2026-W37', minutes: 50, activeDays: 4 },
          { isoWeek: '2026-W38', minutes: 45, activeDays: 4 },
          { isoWeek: '2026-W39', minutes: 60, activeDays: 5 },
          { isoWeek: '2026-W40', minutes: 55, activeDays: 4 },
          { isoWeek: '2026-W41', minutes: 70, activeDays: 5 },
          { isoWeek: '2026-W42', minutes: 65, activeDays: 5 },
          { isoWeek: '2026-W43', minutes: 80, activeDays: 6 },
          { isoWeek: '2026-W44', minutes: 75, activeDays: 5 },
          { isoWeek: '2026-W45', minutes: 90, activeDays: 6 }
        ]
      });
    }
    if (p === '/v2/me/habit' || p === '/v2/me/habit/weekly-goal') {
      let savedHabit = { dailyMinutes: 15, reminderTime: '20:00', reminderEnabled: true, goalSessions: 5 };
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
      }
      const goalSessions = Number(savedHabit.goalSessions) || 5;
      const sessionsDone = 4;
      return jsonResponse({
        ok: true,
        streakDays: 5,
        masteredWords: 64,
        ...savedHabit,
        streak: {
          count: 5,
          longest: 14,
          todayDone: true,
          activeDates: ['2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11']
        },
        week: {
          goalSessions,
          sessionsDone,
          reached: sessionsDone >= goalSessions,
          days: [
            { day: '2026-11-09', done: true, sessions: 1 },
            { day: '2026-11-10', done: true, sessions: 2 },
            { day: '2026-11-11', done: true, sessions: 1 }
          ]
        }
      });
    }
    if (p === '/v2/me/plans' || p === '/v2/plans' || p === '/plans' || p === '/v2/me/plans/interest') {
      return jsonResponse({
        ok: true,
        currentPlan: 'pro',
        tier: 'pro',
        plan: 'pro',
        grading: { used: 12, limit: 100, resetsAt: '2026-12-01T00:00:00Z' },
        speaking: { used: 12, limit: 100, resetsAt: '2026-12-01T00:00:00Z' },
        companionTurns: { used: 5, limit: 50, resetsAt: '2026-12-01T00:00:00Z' },
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
      return jsonResponse({
        level: 'HSK 1',
        wordsSeen: 64,
        wordsTotal: 300,
        skills: [
          { skill: 'listening', labelVi: 'Nghe hiểu', score: 78 },
          { skill: 'reading', labelVi: 'Đọc hiểu', score: 85 },
          { skill: 'writing', labelVi: 'Chữ Hán & Viết', score: 74 },
          { skill: 'speaking', labelVi: 'Phát âm & Nói', score: 80 },
          { skill: 'grammar', labelVi: 'Ngữ pháp', score: 82 }
        ]
      });
    }
    if (p === '/v2/me/score-prediction') {
      return jsonResponse({ level: 'HSK 2', predictedScore: 175, maxScore: 200, passScore: 120 });
    }
    if (p === '/v2/me/reports/weekly') {
      return jsonResponse({ streakDays: 5, minutesStudied: 68, wordsLearned: 34, lessonsCompleted: 4 });
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
          titleVi: 'Ôn 12 từ vựng đến hạn',
          detailVi: 'Củng cố trí nhớ ngắt quãng SRS',
          reasonVi: 'Đến hạn ôn tập hôm nay',
          estMinutes: 4,
          review: {
            minutes: 4,
            limit: 12
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
        completion: sessionStatus === 'completed' ? { streak: { count: 5, todayDone: true } } : null,
        streak: { count: 5, todayDone: true },
        streakDays: 5,
        minutesDone: 10,
        minutesGoal: reqMin,
        dailyGoalMinutes: reqMin,
        completedMinutes: 10,
        continue: { kind: 'lesson', lessonId: savedLessonId },
        items: [
          { kind: 'lesson', lessonId: savedLessonId, titleVi: 'Từ mới: Bốn thanh và thanh nhẹ (爸爸，妈妈)', dueCount: 1, estMinutes: 6, locked: false },
          { kind: 'review', titleVi: 'Ôn từ đến hạn', dueCount: 12, estMinutes: 4, locked: false },
          { kind: 'errors', titleVi: 'Sửa lỗi hay sai', dueCount: 3, estMinutes: 2, locked: false }
        ]
      });
    }
    if (p === '/v2/review/summary') {
      const today = Date.now();
      const forecast = [12, 8, 15, 6, 10, 5, 9].map((due, idx) => ({
        day: new Date(today + idx * 86400000).toISOString().slice(0, 10),
        due,
        minutes: Math.max(2, Math.round(due / 3)),
        heavy: due >= 15
      }));
      return jsonResponse({
        dueNow: { meaning: 8, pinyin: 4 },
        dueToday: { meaning: 8, pinyin: 4 },
        errorsQueue: 3,
        totalCards: 86,
        openRun: null,
        forecast
      });
    }
    if (p === '/v2/review/sentence-cards') {
      return jsonResponse({
        dueToday: 5,
        total: 24,
        upcoming: 8,
        measureWords: 10,
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
      const defaultWords = [
        { itemKey: '你好', word: '你好', hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '谢谢', word: '谢谢', hanzi: '谢谢', pinyin: 'xièxie', meaningVi: 'cảm ơn', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '不客气', word: '不客气', hanzi: '不客气', pinyin: 'bú kèqi', meaningVi: 'đừng khách sáo', state: 'learning', dueAt: new Date().toISOString() },
        { itemKey: '对不起', word: '对不起', hanzi: '对不起', pinyin: 'duìbuqǐ', meaningVi: 'xin lỗi', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '没关系', word: '没关系', hanzi: '没关系', pinyin: 'méi guānxi', meaningVi: 'không sao đâu', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '再见', word: '再见', hanzi: '再见', pinyin: 'zàijiàn', meaningVi: 'tạm biệt', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '老师', word: '老师', hanzi: '老师', pinyin: 'lǎoshī', meaningVi: 'giáo viên', state: 'learning', dueAt: new Date().toISOString() },
        { itemKey: '学生', word: '学生', hanzi: '学生', pinyin: 'xuésheng', meaningVi: 'học sinh, sinh viên', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '朋友', word: '朋友', hanzi: '朋友', pinyin: 'péngyou', meaningVi: 'bạn bè', state: 'learning', dueAt: new Date().toISOString() },
        { itemKey: '中国', word: '中国', hanzi: '中国', pinyin: 'Zhōngguó', meaningVi: 'Trung Quốc', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '越南', word: '越南', hanzi: '越南', pinyin: 'Yuènán', meaningVi: 'Việt Nam', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '喜欢', word: '喜欢', hanzi: '喜欢', pinyin: 'xǐhuan', meaningVi: 'thích, yêu thích', state: 'learning', dueAt: new Date().toISOString() }
      ];
      let items = defaultWords;
      if (status === 'known') items = items.filter(x => x.state === 'review');
      if (status === 'learning') items = items.filter(x => x.state === 'learning');
      if (q) items = items.filter(x => x.word.includes(q) || x.pinyin.toLowerCase().includes(q) || x.meaningVi.toLowerCase().includes(q));
      return jsonResponse({
        items,
        totals: { known: 8, learning: 4 },
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
      const userAnswers = body.answers || body.userAnswers || {};
      let correctCount = 0;
      const results = questions.map((q, idx) => {
        const qId = q.id || q._id || q.number || q.questionNumber || idx + 1;
        const userAns = userAnswers[qId] !== undefined ? userAnswers[qId] : userAnswers[idx];
        const rightAns = q.correctAnswer || q.answer || q.correctOption || 'A';
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
      customRoot.style.color = '#1c1917';
      if (main && main.parentNode) {
        main.parentNode.insertBefore(customRoot, main);
      } else {
        document.body.appendChild(customRoot);
      }
    }
    customRoot.style.color = '#1c1917';
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
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy chữ Hán cho "${decodeURIComponent(slug)}". <a href="/tu-dien" style="text-decoration:underline;margin-left:8px;">Quay lại Từ điển</a></div>`;
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
        <a href="/tu-dien" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại Từ điển</a>
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
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy từ vựng "${decodeURIComponent(slug)}". <a href="/tu-dien" style="text-decoration:underline;">Quay lại Từ điển</a></div>`;
      return;
    }
    const word = data.word || data.hanzi || decodeURIComponent(slug);
    const pinyin = (Array.isArray(data.pinyins) && data.pinyins.join(', ')) || data.pinyin || '';
    const hanviet = data.hanviet || '';
    const meaning = data.meaningVi || (Array.isArray(data.meanings) && data.meanings.join('; ')) || '';
    const hsk = data.hskLevel || '';
    const examples = Array.isArray(data.examples) ? data.examples : [];
    const chars = Array.from(word).filter(c => /[\u4e00-\u9fff]/.test(c));
    const audioUrl = rewriteMediaUrl(data.audioUrl || `https://static.xiehanzi.com/word_audios/${word}.mp3`);

    document.title = `Từ vựng ${word} (${pinyin}) - ${meaning} | XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/tu-dien" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại Từ điển</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
              <h1 style="font-size:44px;font-weight:800;margin:0;color:#1c1917;font-family:'Noto Serif SC',serif;">${word}</h1>
              <span style="font-size:24px;color:#ea580c;font-weight:700;">[${pinyin}]</span>
              ${hanviet ? `<span style="padding:4px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;font-weight:700;text-transform:uppercase;">${hanviet}</span>` : ''}
              ${hsk ? `<span style="padding:4px 12px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:700;">HSK ${hsk}</span>` : ''}
            </div>
            <div style="font-size:20px;color:#292524;margin-top:12px;">
              <strong>Nghĩa:</strong> ${meaning}
            </div>
          </div>
          <button id="xhz-word-speak" style="padding:10px 20px;border-radius:999px;background:#ea580c;color:#fff;border:none;font-weight:700;cursor:pointer;font-size:15px;">🔊 Nghe phát âm</button>
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:16px;font-weight:700;color:#57534e;margin-bottom:10px;">Chiết tự từng chữ Hán:</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${chars.map(c => `<a href="/han-tu/${encodeURIComponent(c)}" style="padding:10px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;text-decoration:none;color:#1c1917;font-weight:700;font-size:20px;">${c} → Xem nét viết</a>`).join('')}
          </div>
        </div>

        ${examples.length > 0 ? `
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:12px;">💬 Ví dụ mẫu câu (${examples.length})</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${examples.map(ex => {
              const zh = ex.chinese || ex.hanzi || ex.zh || '';
              const py = ex.pinyin || '';
              const vi = ex.vietnamese || ex.meaningVi || ex.vi || '';
              return `<div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;">
                <div style="font-size:18px;font-weight:700;color:#1c1917;">${zh}</div>
                <div style="font-size:14px;color:#ea580c;margin-top:2px;">${py}</div>
                <div style="font-size:15px;color:#44403c;margin-top:4px;">${vi}</div>
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
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy âm Hán Việt "${decodeURIComponent(slug)}". <a href="/han-viet">Xem toàn bộ danh sách</a></div>`;
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
  // --------------------------------------------------------------------------
  async function renderGrammarQuizRunPage(searchParams) {
    let root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tạo đề kiểm tra ngữ pháp...</div>`;

    const tracksParam = (searchParams.get('tracks') || 'new-hsk1').split(',').filter(Boolean);
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
    if (allQuestions.length === 0) {
      const fallback = await loadLocalJson('/data/grammar/quiz-new-hsk1.json');
      if (fallback && Array.isArray(fallback.questions)) {
        allQuestions = fallback.questions;
      }
    }
    const questions = allQuestions.slice(0, count);
    document.title = `Làm bài Kiểm tra Ngữ pháp (${questions.length} câu) | XieHanzi`;
    root = getMainContentContainer();

    root.innerHTML = `
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <a href="/kiem-tra-ngu-phap" style="color:#ea580c;font-weight:700;text-decoration:none;">← Chọn lại cấu hình đề</a>
        <div id="xhz-gq-score-badge" style="padding:8px 18px;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:800;border:1px solid #fed7aa;">
          Đã làm: 0 / ${questions.length} câu
        </div>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
        <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0 0 6px 0;">📝 Bài Kiểm Tra Ngữ Pháp (${questions.length} câu)</h1>
        <p style="color:#57534e;font-size:14px;margin:0 0 20px 0;">Chọn đáp án trắc nghiệm hoặc nhập bản dịch rồi nhấn Kiểm tra để chấm điểm ngay.</p>
        <div id="xhz-gq-list" style="display:flex;flex-direction:column;gap:20px;"></div>
      </div>
    `;

    const listEl = document.getElementById('xhz-gq-list');
    const scoreBadge = document.getElementById('xhz-gq-score-badge');
    let answeredCount = 0;
    let correctCount = 0;
    const answeredSet = new Set();

    const updateBadge = () => {
      if (scoreBadge) {
        scoreBadge.textContent = `Điểm trắc nghiệm: ${correctCount} đúng • Đã làm ${answeredSet.size} / ${questions.length} câu`;
      }
    };

    questions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'padding:20px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;color:#1c1917;';
      const gp = q.grammarPoint || {};
      const headerHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          <span style="font-size:13px;font-weight:800;padding:4px 10px;border-radius:999px;background:#e7e5e4;color:#1c1917;">Câu ${idx + 1} / ${questions.length}</span>
          ${gp.title ? `<span style="font-size:13px;color:#ea580c;font-weight:700;">Chủ điểm: ${gp.title} (${gp.pattern || gp.level || ''})</span>` : ''}
        </div>
      `;

      if (q.type === 'mcq') {
        const stemText = q.prompt || q.stem || '';
        const stemPy = q.pinyin || q.stemPinyin || '';
        card.innerHTML = `
          ${headerHtml}
          <div style="font-size:20px;font-weight:700;color:#1c1917;margin-bottom:6px;">${stemText}</div>
          ${stemPy ? `<div style="font-size:14px;color:#ea580c;margin-bottom:4px;">${stemPy}</div>` : ''}
          ${q.vietnameseHint ? `<div style="font-size:14px;color:#57534e;margin-bottom:14px;">💡 Nghĩa: ${q.vietnameseHint}</div>` : ''}
          <div class="xhz-gq-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;"></div>
          <div class="xhz-gq-exp" style="display:none;margin-top:12px;padding:12px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;font-size:14px;"></div>
        `;
        const optsWrap = card.querySelector('.xhz-gq-opts');
        const expEl = card.querySelector('.xhz-gq-exp');
        const options = Array.isArray(q.options) ? q.options : [];
        const rightAnswerKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));
        options.forEach((optItem, optIdx) => {
          const optKey = typeof optItem === 'object' ? String(optItem.id || optItem.key || String.fromCharCode(65 + optIdx)) : String.fromCharCode(65 + optIdx);
          const optLabel = typeof optItem === 'object' ? (optItem.text || optItem.label || optItem.value || '') : String(optItem);
          const isThisCorrect = optKey === rightAnswerKey || optIdx === q.correctIndex;
          const btn = document.createElement('button');
          btn.dataset.correct = isThisCorrect ? '1' : '0';
          btn.style.cssText = 'padding:12px 14px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;text-align:left;cursor:pointer;font-size:16px;font-weight:600;';
          btn.innerHTML = `<span style="color:#ea580c;font-weight:800;margin-right:6px;">${String.fromCharCode(65 + optIdx)}.</span> ${optLabel}`;
          btn.onclick = () => {
            if (!answeredSet.has(idx)) {
              answeredSet.add(idx);
              if (isThisCorrect) correctCount++;
              updateBadge();
            }
            Array.from(optsWrap.children).forEach(b => {
              b.style.background = '#fff';
              b.style.borderColor = '#d6d3d1';
              b.style.color = '#1c1917';
              if (b.dataset.correct === '1') {
                b.style.background = '#dcfce7';
                b.style.borderColor = '#16a34a';
                b.style.color = '#14532d';
              }
            });
            if (!isThisCorrect) {
              btn.style.background = '#fee2e2';
              btn.style.borderColor = '#dc2626';
              btn.style.color = '#7f1d1d';
            }
            if (expEl) {
              const rightObj = options.find((o, i) => (typeof o === 'object' ? String(o.id || o.key) === rightAnswerKey : i === q.correctIndex));
              const rightText = typeof rightObj === 'object' ? (rightObj.text || '') : (rightObj || '');
              expEl.style.display = 'block';
              expEl.innerHTML = `<strong>Đáp án đúng: ${rightText}</strong><br/>${q.explanation || ''}`;
            }
          };
          optsWrap.appendChild(btn);
        });
      } else {
        const isZhToVi = q.type === 'translate_zh_vi';
        card.innerHTML = `
          ${headerHtml}
          <div style="font-size:14px;font-weight:700;color:#57534e;margin-bottom:6px;">${isZhToVi ? 'Dịch câu tiếng Trung sau sang tiếng Việt:' : 'Dịch câu tiếng Việt sau sang tiếng Trung:'}</div>
          <div style="font-size:20px;font-weight:700;color:#1c1917;margin-bottom:6px;">${q.prompt || ''}</div>
          ${q.promptPinyin ? `<div style="font-size:14px;color:#ea580c;margin-bottom:12px;">${q.promptPinyin}</div>` : ''}
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
            <input type="text" class="xhz-gq-input" placeholder="Nhập câu dịch của bạn..." style="flex:1;min-width:220px;padding:10px 14px;border-radius:10px;border:1px solid #d6d3d1;font-size:15px;color:#1c1917;background:#fff;" />
            <button class="xhz-gq-check" style="padding:10px 18px;border-radius:10px;background:#ea580c;color:#fff;border:none;font-weight:700;cursor:pointer;">Đổi chiếu đáp án</button>
          </div>
          <div class="xhz-gq-exp" style="display:none;margin-top:12px;padding:12px 14px;border-radius:10px;background:#ecfdf5;border:1px solid #6ee7b7;color:#065f46;font-size:15px;"></div>
        `;
        const checkBtn = card.querySelector('.xhz-gq-check');
        const expEl = card.querySelector('.xhz-gq-exp');
        if (checkBtn && expEl) {
          checkBtn.onclick = () => {
            if (!answeredSet.has(idx)) {
              answeredSet.add(idx);
              correctCount++;
              updateBadge();
            }
            expEl.style.display = 'block';
            expEl.innerHTML = `<strong>Đáp án tham khảo:</strong> ${q.referenceAnswer || ''}${q.referencePinyin ? `<br/><span style="color:#ea580c;">Pinyin: ${q.referencePinyin}</span>` : ''}`;
          };
        }
      }

      listEl.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 6.6. Trang Giáo Trình & Thư Viện (/thu-vien-*/:sub*)
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
    const curr = currMap[rootSlug] || 'new-hsk';
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

      document.title = `${levelObj.name || levelSlug} - Giáo trình ${curr.toUpperCase()} | XieHanzi`;
      root.innerHTML = `
        <div style="margin-bottom:16px;">
          <a href="/${rootSlug}" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại ${rootSlug.replace(/-/g, ' ').toUpperCase()}</a>
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
                  <div style="font-size:13px;color:#ea580c;font-weight:700;">${isLesson ? `Bài ${t.lessonNumber || i + 1}` : `Chủ đề ${i + 1}`}</div>
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
    const subtitlePy = lessonObj && lessonObj.titlePinyin ? lessonObj.titlePinyin : '';
    const baseDetailUrl = '/' + [rootSlug, ...effectiveParts].join('/');
    const practiceUrl = baseDetailUrl + '/luyen-tap';

    if (isPractice && words.length > 0) {
      document.title = `Luyện tập: ${title} - ${levelSlug.toUpperCase()} | XieHanzi`;
      root.innerHTML = `
        <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <a href="${baseDetailUrl}" style="color:#ea580c;font-weight:700;text-decoration:none;">← Quay lại bài học: ${title}</a>
          <a href="/${rootSlug}/${levelSlug}" style="color:#57534e;font-weight:600;text-decoration:none;">Danh sách bài ${levelSlug.toUpperCase()}</a>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
            <div>
              <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0;">🎯 Luyện tập từ vựng: ${title}</h1>
              <p style="font-size:14px;color:#57534e;margin:4px 0 0 0;">Chế độ Flashcard lật thẻ & Trắc nghiệm nhanh (${words.length} từ vựng)</p>
            </div>
            <div style="display:flex;gap:8px;">
              <button id="xhz-mode-flashcard" style="padding:8px 16px;border-radius:999px;background:#ea580c;color:#fff;border:none;font-weight:700;cursor:pointer;">🗂️ Flashcard</button>
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
            <div id="xhz-fc-card" style="width:100%;max-width:520px;min-height:260px;border-radius:20px;border:2px solid #fed7aa;background:#fff7ed;padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;box-shadow:0 8px 24px rgba(234,88,12,0.08);transition:all 0.2s;">
              <div style="font-size:64px;font-weight:800;color:#1c1917;font-family:'Noto Serif SC',serif;">${hz}</div>
              <div style="font-size:22px;font-weight:700;color:#ea580c;margin-top:8px;">${py}</div>
              ${flipped ? `
                <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #fdba74;width:100%;">
                  ${hv ? `<div style="font-size:13px;font-weight:700;color:#9a3412;text-transform:uppercase;">Hán Việt: ${hv}</div>` : ''}
                  <div style="font-size:22px;font-weight:800;color:#1c1917;margin-top:6px;">${vi}</div>
                  ${ex ? `<div style="margin-top:10px;font-size:15px;color:#44403c;background:#fff;padding:10px;border-radius:10px;"><div><strong>${(ex.chinese || '').replace(/\{|\}/g, '')}</strong></div><div style="color:#ea580c;font-size:13px;">${ex.pinyin || ''}</div><div>${ex.vietnamese || ''}</div></div>` : ''}
                </div>
              ` : `<div style="margin-top:18px;font-size:13px;color:#9a3412;font-weight:600;">👆 Nhấn vào thẻ để lật xem nghĩa tiếng Việt</div>`}
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
              <button id="xhz-fc-prev" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;">← Từ trước</button>
              <button id="xhz-fc-audio" style="padding:10px 18px;border-radius:12px;border:none;background:#ffedd5;color:#9a3412;font-weight:700;cursor:pointer;">🔊 Nghe phát âm</button>
              <button id="xhz-fc-flip" style="padding:10px 18px;border-radius:12px;border:none;background:#ea580c;color:#fff;font-weight:700;cursor:pointer;">🔄 Lật thẻ</button>
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
          <div id="xhz-curr-quiz-score" style="margin-bottom:14px;padding:10px 16px;border-radius:12px;background:#fff7ed;color:#9a3412;font-weight:800;">Điểm số: 0 / ${words.length}</div>
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
                <span style="font-size:15px;color:#ea580c;font-weight:600;margin-left:8px;">[${py}]</span>
              </div>
              <button class="xhz-q-speak" style="border:none;background:#ffedd5;color:#9a3412;border-radius:999px;padding:4px 12px;font-weight:700;cursor:pointer;">🔊 Nghe</button>
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
                if (isCorrect) score++;
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
        btnFc.style.background = '#ea580c';
        btnFc.style.color = '#fff';
        btnQz.style.background = '#f5f5f4';
        btnQz.style.color = '#1c1917';
        renderFlashcard();
      };
      btnQz.onclick = () => {
        btnQz.style.background = '#ea580c';
        btnQz.style.color = '#fff';
        btnFc.style.background = '#f5f5f4';
        btnFc.style.color = '#1c1917';
        renderQuiz();
      };
      renderFlashcard();
      return;
    }

    document.title = `${title} - ${levelSlug.toUpperCase()} | XieHanzi`;
    root.innerHTML = `
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <a href="/${rootSlug}/${levelSlug}" style="color:#ea580c;font-weight:700;text-decoration:none;">← Quay lại ${levelSlug.toUpperCase()}</a>
        ${words.length > 0 ? `<a href="${practiceUrl}" style="padding:10px 20px;border-radius:999px;background:#ea580c;color:#fff;font-weight:700;text-decoration:none;box-shadow:0 4px 12px rgba(234,88,12,0.25);">🎯 Luyện tập / Flashcard (${words.length} từ) →</a>` : ''}
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <div style="margin-bottom:18px;border-bottom:1px solid #f5f5f4;padding-bottom:14px;">
          <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0;">📖 ${title} (${words.length} từ vựng)</h1>
          ${subtitleZh ? `<div style="font-size:18px;font-weight:700;color:#ea580c;margin-top:4px;">${subtitleZh} ${subtitlePy ? `<span style="font-weight:500;color:#78716c;">(${subtitlePy})</span>` : ''}</div>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
          ${words.map((w, idx) => {
            const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
            const py = w.wordPinyin || w.pinyin || '';
            const hv = w.hanviet || '';
            const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
            const pos = w.partOfSpeechVi || w.partOfSpeech || '';
            const audioUrl = w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '';
            const ex = Array.isArray(w.examples) && w.examples[0] ? w.examples[0] : null;
            const link = hz.length === 1 ? `/han-tu/${encodeURIComponent(hz)}` : `/tu-vung/${encodeURIComponent(hz)}`;
            return `<div style="padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;justify-content:space-between;color:#1c1917;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <div>
                    <span style="font-size:12px;color:#78716c;font-weight:700;margin-right:6px;">#${idx + 1}</span>
                    <a href="${link}" style="font-size:26px;font-weight:800;color:#1c1917;text-decoration:none;font-family:'Noto Serif SC',serif;">${hz}</a>
                  </div>
                  <button onclick="window.__xhzPlayAudio('${hz.replace(/'/g, '')}', '${audioUrl.replace(/'/g, '')}')" style="border:none;background:#ffedd5;color:#9a3412;border-radius:999px;padding:5px 12px;cursor:pointer;font-size:13px;font-weight:700;">🔊 ${py}</button>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                  ${hv ? `<span style="font-size:12px;color:#9a3412;background:#fff7ed;padding:2px 8px;border-radius:6px;font-weight:700;text-transform:uppercase;">HV: ${hv}</span>` : ''}
                  ${pos ? `<span style="font-size:12px;color:#57534e;background:#e7e5e4;padding:2px 8px;border-radius:6px;">${pos}</span>` : ''}
                </div>
                <div style="font-size:16px;font-weight:700;color:#292524;margin-top:8px;">${vi}</div>
                ${ex ? `
                  <div style="margin-top:10px;padding-top:8px;border-top:1px dashed #e7e5e4;font-size:13px;color:#44403c;">
                    <div style="font-weight:700;color:#1c1917;">VD: ${(ex.chinese || '').replace(/\{|\}/g, '')}</div>
                    <div style="color:#ea580c;">${ex.pinyin || ''}</div>
                    <div style="color:#57534e;">${ex.vietnamese || ''}</div>
                  </div>
                ` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
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
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
    }

    function normalizeHanziCompare(str) {
      return Array.from(String(str || '')).filter(c => /[\u4e00-\u9fffA-Za-z0-9]/.test(c)).join('');
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
        const blankIdx = typeof seg.blankCharIdx === 'number' ? seg.blankCharIdx : 0;
        const targetBlankChar = hanziChars[blankIdx] || hanziChars[0] || '';
        const fullChars = Array.from(seg.hanzi || '');
        let hCounter = -1;
        const sentenceWithBlankHtml = fullChars.map(ch => {
          if (/[\u4e00-\u9fff]/.test(ch)) {
            hCounter++;
            if (hCounter === blankIdx) {
              return `<input type="text" id="xhz-dict-blank-input" value="${(curState.input || '').replace(/"/g, '&quot;')}" ${isSubmitted ? 'disabled' : ''} placeholder="${pinyinMode ? 'pinyin' : '?'}" style="width:${pinyinMode ? '96px' : '56px'};margin:0 6px;border:none;border-bottom:2px solid #d97706;background:#fffbeb;padding:2px 6px;text-align:center;font-size:22px;font-weight:800;color:#1c1917;outline:none;" />`;
            }
          }
          return `<span>${ch}</span>`;
        }).join('');

        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
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

        const blankInput = document.getElementById('xhz-dict-blank-input');
        const checkBlank = () => {
          const val = (blankInput ? blankInput.value : '').trim();
          const ok = val.length > 0 && (val === targetBlankChar || (seg.hanzi || '').includes(val) || (pinyinMode && normalizePinyinCompare( seg.pinyin || '' ).includes(normalizePinyinCompare(val))));
          segStates[currentIndex] = { status: ok ? 'correct' : 'wrong', input: val, checked: true };
          persistDictState();
          renderAllDictationUI();
        };
        if (blankInput && !isSubmitted) {
          blankInput.focus();
          blankInput.onkeydown = e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              checkBlank();
            }
          };
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
    let root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải đề thi...</div>`;
    const parts = pathname.split('/').filter(Boolean);
    let lastPart = decodeURIComponent(parts[parts.length - 1] || '');
    if (lastPart === 'undefined' || !lastPart) {
      lastPart = 'hsk30-1';
      try {
        origReplaceState.call(history, null, '', '/de-kiem-tra/lam-bai/hsk30-1');
      } catch (_) {}
    }

    let paper = await loadTestPaperById(lastPart);
    root = getMainContentContainer();
    if (!paper) {
      const levelNum = (lastPart.match(/\d+/) || ['1'])[0];
      const papersHsk = await loadLocalJson('/data/tests/papers-hsk.json');
      const lvlEntry = papersHsk && Array.isArray(papersHsk.levels) ? papersHsk.levels.find(l => String(l.level) === String(levelNum)) : null;
      if (lvlEntry && Array.isArray(lvlEntry.items) && lvlEntry.items.length > 0) {
        document.title = `Đề thi HSK Cấp ${levelNum} | XieHanzi`;
        root.innerHTML = `
          <div style="margin-bottom:16px;">
            <a href="/kiem-tra-hsk" style="color:#ea580c;font-weight:700;text-decoration:none;">← Quay lại Phòng thi HSK</a>
          </div>
          <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
            <h1 style="font-size:26px;font-weight:800;color:#1c1917;margin:0 0 16px 0;">📋 Danh sách Đề thi HSK Cấp ${levelNum}</h1>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
              ${lvlEntry.items.map(it => `
                <a href="/kiem-tra-hsk/hsk${levelNum}/test/${encodeURIComponent(it.testId || it.id)}" style="display:block;padding:18px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                  <div style="font-size:18px;font-weight:700;color:#1c1917;">${it.title || it.name || it.testId}</div>
                  <div style="font-size:14px;color:#57534e;margin-top:6px;">Số câu: ${it.questionCount || 40} câu • Thời gian: ${it.durationMinutes || 40} phút</div>
                  <div style="margin-top:10px;display:inline-block;padding:6px 14px;border-radius:999px;background:#ea580c;color:#fff;font-size:13px;font-weight:700;">Vào làm bài →</div>
                </a>
              `).join('')}
            </div>
          </div>
        `;
        return;
      }
      const rawFallback = await loadLocalJson('/data/tests/papers/hsk30-1.json');
      paper = normalizeTestPaper(rawFallback, 'hsk30-1');
    }

    const questions =
      (paper && Array.isArray(paper.questions) && paper.questions.length > 0 && paper.questions) ||
      (paper && Array.isArray(paper.sections) ? paper.sections.flatMap(s => s.questions || []) : []);

    const title = (paper && (paper.title || paper.name || paper.testId)) || `Đề thi ${lastPart.toUpperCase()}`;
    const fullAudio = paper && (paper.audioUrl || paper.audio) ? rewriteMediaUrl(paper.audioUrl || paper.audio) : '';
    document.title = `${title} | Phòng thi XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <a href="/kiem-tra-hsk" style="color:#ea580c;font-weight:700;text-decoration:none;">← Quay lại Phòng thi HSK</a>
        <div id="xhz-exam-score-badge" style="padding:8px 18px;border-radius:999px;background:#fff7ed;color:#9a3412;font-weight:800;border:1px solid #fed7aa;">
          Điểm số: 0 / ${questions.length}
        </div>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;border-bottom:1px solid #e7e5e4;padding-bottom:16px;">
          <div>
            <h1 style="font-size:26px;font-weight:800;color:#1c1917;margin:0;">🏆 ${title} (${questions.length} câu)</h1>
            <p style="font-size:14px;color:#57534e;margin:4px 0 0 0;">Chọn đáp án trực tiếp trên từng câu hỏi để chấm điểm và xem giải thích chi tiết.</p>
          </div>
          ${fullAudio ? `<audio controls src="${fullAudio}" style="height:40px;"></audio>` : ''}
        </div>
        <div id="xhz-questions-list" style="display:flex;flex-direction:column;gap:20px;"></div>
      </div>
    `;

    const listEl = document.getElementById('xhz-questions-list');
    const scoreBadge = document.getElementById('xhz-exam-score-badge');
    const answeredMap = {};

    questions.forEach((q, idx) => {
      const qNum = q.number || q.questionNumber || idx + 1;
      const qType = q.type || q.kind || 'multiple_choice';
      const prompt = q.prompt || q.question || q.stem || q.text || q.transcript || `Câu hỏi số ${qNum}`;
      const pinyin = q.pinyin || q.transcriptPinyin || '';
      const qAudio = (q.audio || q.audioUrl) ? rewriteMediaUrl(q.audio || q.audioUrl) : '';
      const qImgs = Array.isArray(q.images) ? q.images.map(u => rewriteMediaUrl(u)) : [];
      const singleQuestionImg =
        q.imageUrl || q.image
          ? rewriteMediaUrl(q.imageUrl || q.image)
          : ((qType === 'component_match' || qType === 'writing_sentence') && qImgs.length === 1 ? qImgs[0] : '');

      let rawOpts = Array.isArray(q.options) ? q.options : (Array.isArray(q.choices) ? q.choices : []);
      const isWrittenQuestion = qType === 'character_fill' || qType === 'writing_sentence' || qType === 'writing_essay';

      if (rawOpts.length === 0 && !isWrittenQuestion) {
        if (qType === 'true_false') {
          rawOpts = [
            { key: 'true', text: '✓ Đúng (对)' },
            { key: 'false', text: '✗ Sai (错)' }
          ];
        } else if (qImgs.length > 0) {
          rawOpts = qImgs.map((imgUrl, i) => ({
            key: String.fromCharCode(65 + i),
            text: `Hình ${String.fromCharCode(65 + i)}`,
            image: imgUrl
          }));
        } else {
          rawOpts = ['A', 'B', 'C'].map(k => ({ key: k, text: `Phương án ${k}` }));
        }
      }
      const rightAns = String(q.correctAnswer !== undefined ? q.correctAnswer : (q.answer !== undefined ? q.answer : (q.correctOption || 'A'))).trim();

      const card = document.createElement('div');
      card.style.cssText = 'padding:20px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;color:#1c1917;';

      // Shared image bank for image_match or multiple images when options don't carry individual images
      const showSharedImageGrid = qType === 'image_match' && qImgs.length > 0;
      const sharedImagesHtml = showSharedImageGrid
        ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:14px;">
            ${qImgs.map((u, i) => `
              <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:10px;text-align:center;">
                <div style="font-weight:800;color:#ea580c;font-size:14px;margin-bottom:6px;">Hình ${String.fromCharCode(65 + i)}</div>
                <img src="${u}" alt="Hình ${String.fromCharCode(65 + i)}" style="max-height:130px;max-width:100%;border-radius:8px;object-fit:contain;margin:0 auto;display:block;" />
              </div>
            `).join('')}
          </div>`
        : '';

      const passageHtml = q.passage
        ? `<div style="margin-bottom:12px;padding:14px 16px;border-radius:12px;background:#fff;border:1px solid #e7e5e4;font-size:16px;line-height:1.7;color:#1c1917;">
            ${q.passage}
            ${q.passagePinyin ? `<div style="font-size:13px;color:#ea580c;margin-top:6px;">${q.passagePinyin}</div>` : ''}
          </div>`
        : '';

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <div style="font-size:16px;font-weight:800;color:#1c1917;">
            <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:#ffedd5;color:#9a3412;margin-right:8px;font-size:13px;">Câu ${qNum}</span>
            ${prompt}
          </div>
          ${q.sectionTitle ? `<span style="font-size:12px;padding:3px 10px;border-radius:999px;background:#e7e5e4;color:#44403c;font-weight:600;">${q.sectionTitle}</span>` : ''}
        </div>
        ${pinyin ? `<div style="font-size:14px;color:#ea580c;font-weight:600;margin-bottom:8px;">${pinyin}</div>` : ''}
        ${qAudio ? `<div style="margin-bottom:12px;"><audio controls src="${qAudio}" style="height:38px;max-width:100%;"></audio></div>` : ''}
        ${singleQuestionImg ? `<div style="margin-bottom:12px;"><img src="${singleQuestionImg}" alt="Câu ${qNum}" style="max-height:200px;max-width:100%;border-radius:12px;border:1px solid #e7e5e4;background:#fff;padding:6px;object-fit:contain;" /></div>` : ''}
        ${passageHtml}
        ${sharedImagesHtml}
        <div class="xhz-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;"></div>
        <div class="xhz-exp" style="display:none;margin-top:12px;padding:12px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;font-size:14px;color:#78350f;"></div>
      `;

      const optsWrap = card.querySelector('.xhz-opts');
      const expEl = card.querySelector('.xhz-exp');

      if (isWrittenQuestion) {
        optsWrap.style.display = 'block';
        optsWrap.innerHTML = `
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start;">
            ${qType === 'writing_essay'
              ? `<textarea class="xhz-write-input" rows="4" placeholder="Nhập bài viết tiếng Trung của bạn..." style="flex:1;min-width:260px;padding:10px 14px;border-radius:10px;border:1px solid #d6d3d1;font-size:16px;color:#1c1917;background:#fff;"></textarea>`
              : `<input type="text" class="xhz-write-input" placeholder="Nhập đáp án chữ Hán..." style="flex:1;min-width:220px;padding:10px 14px;border-radius:10px;border:1px solid #d6d3d1;font-size:16px;color:#1c1917;background:#fff;" />`
            }
            <button class="xhz-write-check" style="padding:10px 18px;border-radius:10px;background:#ea580c;color:#fff;border:none;font-weight:700;cursor:pointer;">Kiểm tra đáp án</button>
          </div>
        `;
        const inputEl = optsWrap.querySelector('.xhz-write-input');
        const checkBtn = optsWrap.querySelector('.xhz-write-check');
        checkBtn.onclick = () => {
          const userVal = (inputEl.value || '').trim();
          const isRight = qType === 'writing_essay' ? userVal.length > 0 : userVal === rightAns;
          answeredMap[qNum] = isRight ? 1 : 0;
          const totalScore = Object.values(answeredMap).reduce((a, b) => a + b, 0);
          if (scoreBadge) scoreBadge.textContent = `Điểm số: ${totalScore} / ${questions.length}`;
          if (expEl) {
            expEl.style.display = 'block';
            expEl.innerHTML = `${rightAns && rightAns !== 'null' ? `<strong>Đáp án chuẩn: ${rightAns}</strong><br/>` : ''}${q.explanationVi || q.explanation || ''}`;
          }
        };
      } else {
        rawOpts.forEach((opt, oIdx) => {
          const key = typeof opt === 'object' ? (opt.key || opt.label || opt.id || String.fromCharCode(65 + oIdx)) : String.fromCharCode(65 + oIdx);
          const text = typeof opt === 'object' ? (opt.text || opt.hanzi || opt.content || opt.value || key) : String(opt);
          const optPinyin = typeof opt === 'object' ? (opt.pinyin || '') : '';
          const optImg = (typeof opt === 'object' && (opt.image || opt.imageUrl))
            ? rewriteMediaUrl(opt.image || opt.imageUrl)
            : ((qType === 'image_choice' || qType === 'image_match') && qImgs[oIdx] ? qImgs[oIdx] : '');

          const btn = document.createElement('button');
          btn.style.cssText = 'padding:12px 14px;border-radius:12px;border:2px solid #d6d3d1;background:#ffffff;color:#1c1917;text-align:left;cursor:pointer;font-size:15px;font-weight:700;transition:all 0.15s;display:flex;flex-direction:column;gap:8px;';
          btn.innerHTML = `
            <div>
              <span style="color:#ea580c;font-weight:800;margin-right:6px;">${key.toUpperCase()}.</span>
              <span style="color:#1c1917;">${text !== key ? text : `Hình ${key.toUpperCase()}`}</span>
              ${optPinyin ? `<div style="font-size:12px;color:#78716c;font-weight:500;margin-top:2px;">${optPinyin}</div>` : ''}
            </div>
            ${optImg ? `<img src="${optImg}" alt="Phương án ${key}" style="max-height:140px;width:100%;object-fit:contain;border-radius:8px;background:#fafaf9;padding:4px;" />` : ''}
          `;
          btn.onclick = () => {
            const isRight = String(key).toUpperCase() === rightAns.toUpperCase() || String(text).toUpperCase() === rightAns.toUpperCase();
            answeredMap[qNum] = isRight ? 1 : 0;
            const totalScore = Object.values(answeredMap).reduce((a, b) => a + b, 0);
            if (scoreBadge) scoreBadge.textContent = `Điểm số: ${totalScore} / ${questions.length}`;

            Array.from(optsWrap.children).forEach(b => {
              b.style.background = '#ffffff';
              b.style.borderColor = '#d6d3d1';
              b.style.color = '#1c1917';
            });
            if (isRight) {
              btn.style.background = '#dcfce7';
              btn.style.borderColor = '#16a34a';
              btn.style.color = '#14532d';
            } else {
              btn.style.background = '#fee2e2';
              btn.style.borderColor = '#dc2626';
              btn.style.color = '#7f1d1d';
            }
            if (expEl) {
              expEl.style.display = 'block';
              expEl.innerHTML = `<strong>Đáp án đúng: ${rightAns.toUpperCase()}</strong> ${q.explanationVi || q.explanation || (q.transcript ? `<br/>Lời thoại (Transcript): <strong>${q.transcript}</strong> (${q.transcriptPinyin || ''}) — ${q.translationVi || ''}` : '')}`;
            }
          };
          optsWrap.appendChild(btn);
        });
      }

      listEl.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 6.8b. Trang Phiên Ôn Tập SRS & Sửa Lỗi (/hoc/bai/on-tap-den-han, on-tap-loi-sai, on-tap-the-cau)
  // --------------------------------------------------------------------------
  async function renderReviewSessionPage(slug) {
    const root = getMainContentContainer();
    let savedProf = {};
    try {
      savedProf = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}') || {};
    } catch (_) {}
    const hidePinyin = !!savedProf.hidePinyinInReview;
    const reviewFormat = savedProf.reviewFormat || 'mixed';

    const lesson1 = await loadLocalJson('/data/curriculums/new-hsk/lessons/new-hsk-1--bai-1-hello-ai-xiaoyu.json');
    const lesson2 = await loadLocalJson('/data/curriculums/new-hsk/lessons/new-hsk-1--bai-2-my-name-is-li-wen.json');
    const rawWords = [
      ...((lesson1 && lesson1.lesson && lesson1.lesson.words) || []),
      ...((lesson2 && lesson2.lesson && lesson2.lesson.words) || [])
    ].slice(0, 12);

    const dueItems = rawWords.length > 0 ? rawWords.map((w, idx) => {
      const hz = (w.hanzi || w.word || '你好').replace(/\{|\}/g, '');
      return {
        id: `due-${idx + 1}`,
        hanzi: hz,
        pinyin: w.wordPinyin || w.pinyin || 'nǐ hǎo',
        hanviet: w.hanviet || '',
        meaningVi: w.translationVi || w.wordMeaningVi || w.meaningVi || 'Xin chào',
        audioUrl: (Array.isArray(w.audios) && w.audios[0]) || `/word_audios/${hz}.mp3`,
        exampleZh: (w.examples && w.examples[0] && w.examples[0].hanzi) || `${hz}！`,
        examplePy: (w.examples && w.examples[0] && w.examples[0].pinyin) || '',
        exampleVi: (w.examples && w.examples[0] && w.examples[0].vietnamese) || ''
      };
    }) : [
      { id: 'due-1', hanzi: '你好', pinyin: 'nǐ hǎo', hanviet: 'NHĨ HẢO', meaningVi: 'Xin chào', audioUrl: '/word_audios/你好.mp3', exampleZh: '老师，你好！', examplePy: 'Lǎoshī, nǐ hǎo!', exampleVi: 'Chào thầy/cô ạ!' },
      { id: 'due-2', hanzi: '老师', pinyin: 'lǎoshī', hanviet: 'LÃO SƯ', meaningVi: 'Giáo viên, thầy cô', audioUrl: '/word_audios/老师.mp3', exampleZh: '她是我们的汉语老师。', examplePy: 'Tā shì wǒmen de Hànyǔ lǎoshī.', exampleVi: 'Cô ấy là giáo viên tiếng Trung của chúng tôi.' },
      { id: 'due-3', hanzi: '谢谢', pinyin: 'xièxie', hanviet: 'TẠ TẠ', meaningVi: 'Cảm ơn', audioUrl: '/word_audios/谢谢.mp3', exampleZh: '谢谢你的帮助！', examplePy: 'Xièxie nǐ de bāngzhù!', exampleVi: 'Cảm ơn sự giúp đỡ của bạn!' },
      { id: 'due-4', hanzi: '不客气', pinyin: 'bú kèqi', hanviet: 'BẤT KHÁCH KHÍ', meaningVi: 'Đừng khách sáo, không có gì', audioUrl: '/word_audios/不客气.mp3', exampleZh: 'A: 谢谢！ B: 不客气。', examplePy: 'Xièxie! Bú kèqi.', exampleVi: 'Cảm ơn! Không có gì.' },
      { id: 'due-5', hanzi: '对不起', pinyin: 'duìbuqǐ', hanviet: 'ĐỐI BẤT KHỞI', meaningVi: 'Xin lỗi', audioUrl: '/word_audios/对不起.mp3', exampleZh: '对不起，我来晚了。', examplePy: 'Duìbuqǐ, wǒ lái wǎn le.', exampleVi: 'Xin lỗi, tôi đến muộn.' },
      { id: 'due-6', hanzi: '没关系', pinyin: 'méi guānxi', hanviet: 'MỘT QUAN HỆ', meaningVi: 'Không sao đâu', audioUrl: '/word_audios/没关系.mp3', exampleZh: 'A: 对不起！ B: 没关系。', examplePy: 'Duìbuqǐ! Méi guānxi.', exampleVi: 'Xin lỗi! Không sao đâu.' },
      { id: 'due-7', hanzi: '再见', pinyin: 'zàijiàn', hanviet: 'TÁI KIẾN', meaningVi: 'Tạm biệt', audioUrl: '/word_audios/再见.mp3', exampleZh: '明天见，再见！', examplePy: 'Míngtiān jiàn, zàijiàn!', exampleVi: 'Mai gặp lại, tạm biệt!' },
      { id: 'due-8', hanzi: '请', pinyin: 'qǐng', hanviet: 'THỈNH', meaningVi: 'Mời, xin vui lòng', audioUrl: '/word_audios/请.mp3', exampleZh: '请坐，请喝茶。', examplePy: 'Qǐng zuò, qǐng hē chá.', exampleVi: 'Mời ngồi, mời uống trà.' }
    ];

    const mistakeItems = [
      {
        id: 'm-1',
        hanzi: '谢谢',
        pinyin: 'xièxie',
        meaningVi: 'Cảm ơn',
        confusedWith: '对不起 (duìbuqǐ — Xin lỗi)',
        reasonVi: 'Bạn từng nhầm nghĩa giữa "谢谢" (Cảm ơn) và "对不起" (Xin lỗi) trong hội thoại Bài 1.',
        tipVi: 'Ghi nhớ: 谢谢 (Tạ tạ) = Cảm ơn khi nhận sự giúp đỡ; 对不起 (Đối bất khởi) = Xin lỗi khi làm phiền.',
        question: 'Khi bạn được người khác giúp đỡ, bạn nói câu nào?',
        options: ['谢谢 (xièxie)', '对不起 (duìbuqǐ)', '没关系 (méi guānxi)', '再见 (zàijiàn)'],
        correctIndex: 0
      },
      {
        id: 'm-2',
        hanzi: '不客气',
        pinyin: 'bú kèqi',
        meaningVi: 'Đừng khách sáo (đáp lại lời cảm ơn)',
        confusedWith: '没关系 (méi guānxi — Không sao đâu)',
        reasonVi: 'Bạn từng dùng "不客气" để đáp lại câu "对不起" (Xin lỗi).',
        tipVi: 'Cặp chuẩn: 谢谢 ↔ 不客气 (Cảm ơn ↔ Đừng khách sáo) | 对不起 ↔ 没关系 (Xin lỗi ↔ Không sao đâu).',
        question: 'Người đối diện nói “谢谢你！” (Cảm ơn bạn!), bạn đáp lại thế nào?',
        options: ['不客气 (bú kèqi)', '没关系 (méi guānxi)', '对不起 (duìbuqǐ)', '请问 (qǐngwèn)'],
        correctIndex: 0
      },
      {
        id: 'm-3',
        hanzi: '老师',
        pinyin: 'lǎoshī',
        meaningVi: 'Giáo viên, thầy/cô',
        confusedWith: 'lǎoshì (sai thanh điệu âm shī)',
        reasonVi: 'Bạn từng chọn nhầm thanh điệu của chữ 师 (shī - thanh 1 ngang) thành thanh 4 (shì).',
        tipVi: 'Chữ 师 (Sư) đọc thanh 1 cao và bằng: lǎoshī (老 thanh 3 + 师 thanh 1).',
        question: 'Phiên âm Pinyin chính xác của từ “老师” (Giáo viên) là gì?',
        options: ['lǎoshī', 'lǎoshì', 'láoshī', 'lǎosī'],
        correctIndex: 0
      },
      {
        id: 'm-4',
        hanzi: '买 / 卖',
        pinyin: 'mǎi / mài',
        meaningVi: '买 (mǎi): Mua — 卖 (mài): Bán',
        confusedWith: 'Nhầm nét chữ 十 trên đầu chữ 卖 (Bán)',
        reasonVi: 'Bạn từng nhầm giữa 买 (mǎi - Mua) và 卖 (mài - Bán).',
        tipVi: 'Chữ 买 (Mua) không có chữ 十 ở trên. Có thêm hàng (十) ở trên là 卖 (Bán - mài thanh 4).',
        question: 'Trong câu “我去商店买水果” (Tôi đi cửa hàng mua hoa quả), từ “买” đọc và nghĩa là gì?',
        options: ['mǎi — Mua', 'mài — Bán', 'mái — Đến', 'mǎn — Đầy'],
        correctIndex: 0
      }
    ];

    const sentenceCards = [
      { id: 'sc-1', hanzi: '一个人', pinyin: 'yí gè rén', meaningVi: 'Một người (Lượng từ 个 dùng phổ biến nhất cho người & vật)', blankQuestion: '一 ___ 人 (Một người)', options: ['个 (gè)', '本 (běn)', '杯 (bēi)', '件 (jiàn)'], answer: '个 (gè)' },
      { id: 'sc-2', hanzi: '两本书', pinyin: 'liǎng běn shū', meaningVi: 'Hai quyển sách (Lượng từ 本 dùng cho sách, vở, từ điển)', blankQuestion: '两 ___ 书 (Hai quyển sách)', options: ['本 (běn)', '个 (gè)', '只 (zhī)', '杯 (bēi)'], answer: '本 (běn)' },
      { id: 'sc-3', hanzi: '三杯茶', pinyin: 'sān bēi chá', meaningVi: 'Ba tách/cốc trà (Lượng từ 杯 dùng cho cốc, tách, ly đồ uống)', blankQuestion: '三 ___ 茶 (Ba tách trà)', options: ['杯 (bēi)', '本 (běn)', '件 (jiàn)', '张 (zhāng)'], answer: '杯 (bēi)' },
      { id: 'sc-4', hanzi: '四件衣服', pinyin: 'sì jiàn yīfu', meaningVi: 'Bốn bộ/chiếc quần áo (Lượng từ 件 dùng cho áo, việc, món quà)', blankQuestion: '四 ___ 衣服 (Bốn chiếc áo)', options: ['件 (jiàn)', '本 (běn)', '杯 (bēi)', '只 (zhī)'], answer: '件 (jiàn)' },
      { id: 'sc-5', hanzi: '五只猫', pinyin: 'wǔ zhī māo', meaningVi: 'Năm con mèo (Lượng từ 只 dùng cho động vật nhỏ: mèo, chó, chim)', blankQuestion: '五 ___ 猫 (Năm con mèo)', options: ['只 (zhī)', '本 (běn)', '件 (jiàn)', '杯 (bēi)'], answer: '只 (zhī)' },
      { id: 'sc-6', hanzi: '我叫李文，我是越南人。', pinyin: 'Wǒ jiào Lǐ Wén, wǒ shì Yuènán rén.', meaningVi: 'Tôi tên là Lý Văn, tôi là người Việt Nam.', blankQuestion: '我 ___ 李文，我是越南人。 (Tôi tên là Lý Văn)', options: ['叫 (jiào)', '是 (shì)', '有 (yǒu)', '在 (zài)'], answer: '叫 (jiào)' }
    ];

    const isMistakeMode = slug.includes('loi-sai');
    const isSentenceMode = slug.includes('the-cau');

    const modeTitle = isMistakeMode
      ? 'Ôn lỗi sai — Sửa lỗi hay nhầm'
      : isSentenceMode
        ? 'Luyện thẻ câu & Lượng từ HSK 1'
        : 'Ôn bài đến hạn (SRS Ngắt quãng)';

    const modeSubtitle = isMistakeMode
      ? `${mistakeItems.length} mục hay nhầm · Phân biệt trực tiếp lỗi sai và kiểm tra lại ngay`
      : isSentenceMode
        ? `${sentenceCards.length} mẫu câu & lượng từ trọng tâm · Lật thẻ & Điền lượng từ`
        : `${dueItems.length} mục đến hạn ôn hôm nay · Chế độ: ${reviewFormat === 'flashcard' ? 'Thẻ lật' : reviewFormat === 'multiple_choice' ? 'Trắc nghiệm' : reviewFormat === 'typing' ? 'Tự gõ' : 'Hỗn hợp'}${hidePinyin ? ' · Đang ẩn Pinyin mặt trước' : ''}`;

    document.title = `${modeTitle} | Ôn tập XieHanzi`;

    root.innerHTML = `
      <div id="xhz-review-session-root" style="max-width:920px;margin:0 auto;">
        <!-- Top Navigation Bar -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <a href="/on-tap" style="color:#ea580c;font-weight:800;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:15px;">
            ← Quay lại Trung tâm Ôn tập (/on-tap)
          </a>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="/hoc/bai/on-tap-den-han" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;border:1px solid ${!isMistakeMode && !isSentenceMode ? '#ea580c' : '#e7e5e4'};background:${!isMistakeMode && !isSentenceMode ? '#ea580c' : '#fff'};color:${!isMistakeMode && !isSentenceMode ? '#fff' : '#44403c'};">
              🔄 Ôn bài đến hạn (${dueItems.length})
            </a>
            <a href="/hoc/bai/on-tap-loi-sai" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;border:1px solid ${isMistakeMode ? '#ea580c' : '#e7e5e4'};background:${isMistakeMode ? '#ea580c' : '#fff'};color:${isMistakeMode ? '#fff' : '#44403c'};">
              🛠️ Ôn lỗi sai (${mistakeItems.length})
            </a>
            <a href="/hoc/bai/on-tap-the-cau" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;border:1px solid ${isSentenceMode ? '#ea580c' : '#e7e5e4'};background:${isSentenceMode ? '#ea580c' : '#fff'};color:${isSentenceMode ? '#fff' : '#44403c'};">
              🃏 Luyện thẻ câu (${sentenceCards.length})
            </a>
          </div>
        </div>

        <!-- Header Card -->
        <div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border:1px solid #fed7aa;border-radius:22px;padding:20px 24px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="/images/capy/lesson/happy.webp" alt="Capy" style="width:64px;height:64px;border-radius:16px;object-fit:cover;background:#fff;border:2px solid #fdba74;" />
            <div>
              <div style="font-size:12px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:0.05em;">PHIÊN ÔN TẬP CHỦ ĐỘNG</div>
              <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:4px 0;">${modeTitle}</h1>
              <div style="font-size:14px;color:#57534e;">${modeSubtitle}</div>
            </div>
          </div>
          <div id="xhz-review-progress-badge" style="padding:10px 18px;border-radius:14px;background:#fff;border:1px solid #fdba74;font-weight:800;color:#9a3412;font-size:15px;">
            Hoàn thành: 0 / ${isMistakeMode ? mistakeItems.length : isSentenceMode ? sentenceCards.length : dueItems.length}
          </div>
        </div>

        <!-- Dynamic Mode Body -->
        <div id="xhz-review-body" style="background:#fff;border:1px solid #e7e5e4;border-radius:22px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);"></div>
      </div>
    `;

    const bodyEl = root.querySelector('#xhz-review-body');
    const badgeEl = root.querySelector('#xhz-review-progress-badge');

    // ========================================================================
    // MODE B: ÔN LỖI SAI (on-tap-loi-sai)
    // ========================================================================
    if (isMistakeMode) {
      const solvedMap = {};
      bodyEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:18px;">
          <div style="font-size:16px;font-weight:800;color:#1c1917;">
            Giải quyết từng cặp từ dễ nhầm dưới đây để xoá khỏi Sổ lỗi:
          </div>
          <a href="/hoc/so-loi" style="font-size:13px;font-weight:700;color:#ea580c;text-decoration:underline;">Xem toàn bộ Sổ lỗi →</a>
        </div>
        <div id="xhz-mistake-cards" style="display:flex;flex-direction:column;gap:18px;"></div>
      `;
      const listWrap = bodyEl.querySelector('#xhz-mistake-cards');
      mistakeItems.forEach((m, idx) => {
        const card = document.createElement('div');
        card.style.cssText = 'padding:20px;border-radius:18px;border:1px solid #fed7aa;background:#fffaf5;display:flex;flex-direction:column;gap:12px;';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <span style="font-size:12px;font-weight:800;padding:3px 10px;border-radius:999px;background:#fee2e2;color:#b91c1c;">Lỗi sai #${idx + 1}</span>
              <span style="font-size:26px;font-weight:800;color:#1c1917;margin-left:10px;">${m.hanzi}</span>
              <span style="font-size:16px;font-weight:700;color:#ea580c;margin-left:8px;">(${m.pinyin})</span>
              <span style="font-size:15px;font-weight:700;color:#44403c;margin-left:8px;">— ${m.meaningVi}</span>
            </div>
            <button class="xhz-mistake-speak" style="padding:7px 14px;border-radius:999px;background:#ffedd5;color:#9a3412;border:1px solid #fdba74;font-weight:700;cursor:pointer;font-size:13px;">
              🔊 Nghe phát âm chuẩn
            </button>
          </div>
          <div style="padding:12px 14px;border-radius:12px;background:#fff;border:1px solid #e7e5e4;font-size:14px;line-height:1.55;">
            <div style="color:#b91c1c;font-weight:700;">⚠️ Hay nhầm với: ${m.confusedWith}</div>
            <div style="color:#44403c;margin-top:4px;">${m.reasonVi}</div>
            <div style="color:#15803d;font-weight:700;margin-top:6px;">💡 Mẹo nhớ: ${m.tipVi}</div>
          </div>
          <div style="margin-top:4px;">
            <div style="font-size:15px;font-weight:800;color:#1c1917;margin-bottom:10px;">🎯 Kiểm tra khắc phục: ${m.question}</div>
            <div class="xhz-mistake-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;"></div>
            <div class="xhz-mistake-status" style="display:none;margin-top:10px;padding:10px 14px;border-radius:10px;font-size:14px;font-weight:700;"></div>
          </div>
        `;
        card.querySelector('.xhz-mistake-speak').onclick = () => {
          const cleanHz = m.hanzi.split('/')[0].trim();
          playPronunciation(cleanHz, `/word_audios/${cleanHz}.mp3`);
        };
        const optsWrap = card.querySelector('.xhz-mistake-opts');
        const statusEl = card.querySelector('.xhz-mistake-status');
        m.options.forEach((optText, oIdx) => {
          const btn = document.createElement('button');
          btn.style.cssText = 'padding:11px 14px;border-radius:12px;border:2px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;text-align:left;cursor:pointer;font-size:14px;';
          btn.textContent = `${String.fromCharCode(65 + oIdx)}. ${optText}`;
          btn.onclick = () => {
            const isCorrect = oIdx === m.correctIndex;
            solvedMap[m.id] = isCorrect ? 1 : 0;
            const solvedCount = Object.values(solvedMap).reduce((a, b) => a + b, 0);
            if (badgeEl) badgeEl.textContent = `Hoàn thành: ${solvedCount} / ${mistakeItems.length}`;
            Array.from(optsWrap.children).forEach(b => {
              b.style.background = '#fff';
              b.style.borderColor = '#d6d3d1';
              b.style.color = '#1c1917';
            });
            if (isCorrect) {
              btn.style.background = '#dcfce7';
              btn.style.borderColor = '#16a34a';
              btn.style.color = '#14532d';
              statusEl.style.display = 'block';
              statusEl.style.background = '#dcfce7';
              statusEl.style.color = '#14532d';
              statusEl.textContent = '✅ Chính xác! Bạn đã khắc phục được lỗi nhầm lẫn này.';
              const cleanHz = m.hanzi.split('/')[0].trim();
              playPronunciation(cleanHz, `/word_audios/${cleanHz}.mp3`);
            } else {
              btn.style.background = '#fee2e2';
              btn.style.borderColor = '#dc2626';
              btn.style.color = '#7f1d1d';
              statusEl.style.display = 'block';
              statusEl.style.background = '#fee2e2';
              statusEl.style.color = '#991b1b';
              statusEl.textContent = `❌ Chưa đúng. Hãy xem lại mẹo nhớ: ${m.tipVi}`;
            }
          };
          optsWrap.appendChild(btn);
        });
        listWrap.appendChild(card);
      });
      return;
    }

    // ========================================================================
    // MODE C: LUYỆN THẺ CÂU (on-tap-the-cau)
    // ========================================================================
    if (isSentenceMode) {
      const doneSentences = {};
      bodyEl.innerHTML = `
        <div style="font-size:16px;font-weight:800;color:#1c1917;margin-bottom:16px;">
          Luyện phản xạ cụm danh từ - lượng từ & mẫu câu giao tiếp HSK 1:
        </div>
        <div id="xhz-sentence-list" style="display:flex;flex-direction:column;gap:16px;"></div>
      `;
      const sList = bodyEl.querySelector('#xhz-sentence-list');
      sentenceCards.forEach((sc, idx) => {
        const card = document.createElement('div');
        card.style.cssText = 'padding:20px;border-radius:18px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;gap:12px;';
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <span style="font-size:12px;font-weight:800;color:#ea580c;">THẺ CÂU #${idx + 1}</span>
              <div style="font-size:28px;font-weight:800;color:#1c1917;margin-top:2px;">${sc.hanzi}</div>
              <div style="font-size:15px;font-weight:700;color:#ea580c;margin-top:2px;">${hidePinyin ? '(Đã ẩn Pinyin — bấm Nghe để kiểm tra)' : sc.pinyin}</div>
              <div style="font-size:15px;color:#44403c;margin-top:4px;font-weight:600;">${sc.meaningVi}</div>
            </div>
            <button class="xhz-sc-speak" style="padding:8px 16px;border-radius:999px;background:#ffedd5;color:#9a3412;border:1px solid #fdba74;font-weight:700;cursor:pointer;">
              🔊 Nghe câu
            </button>
          </div>
          <div style="padding-top:10px;border-top:1px dashed #d6d3d1;">
            <div style="font-size:14px;font-weight:800;color:#1c1917;margin-bottom:8px;">Điền từ/lượng từ đúng: ${sc.blankQuestion}</div>
            <div class="xhz-sc-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;"></div>
          </div>
        `;
        card.querySelector('.xhz-sc-speak').onclick = () => playPronunciation(sc.hanzi, '');
        const optsBox = card.querySelector('.xhz-sc-opts');
        sc.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.style.cssText = 'padding:10px 14px;border-radius:10px;border:2px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;font-size:14px;';
          btn.textContent = opt;
          btn.onclick = () => {
            const ok = opt === sc.answer;
            doneSentences[sc.id] = ok ? 1 : 0;
            const total = Object.values(doneSentences).reduce((a, b) => a + b, 0);
            if (badgeEl) badgeEl.textContent = `Hoàn thành: ${total} / ${sentenceCards.length}`;
            Array.from(optsBox.children).forEach(b => {
              b.style.background = '#fff';
              b.style.borderColor = '#d6d3d1';
              b.style.color = '#1c1917';
            });
            btn.style.background = ok ? '#dcfce7' : '#fee2e2';
            btn.style.borderColor = ok ? '#16a34a' : '#dc2626';
            btn.style.color = ok ? '#14532d' : '#7f1d1d';
            if (ok) playPronunciation(sc.hanzi, '');
          };
          optsBox.appendChild(btn);
        });
        sList.appendChild(card);
      });
      return;
    }

    // ========================================================================
    // MODE A: ÔN BÀI ĐẾN HẠN (on-tap-den-han) — Flashcard SRS + Trắc nghiệm + Tự gõ
    // ========================================================================
    const defaultTab = reviewFormat === 'multiple_choice' ? 'mc' : reviewFormat === 'typing' ? 'typing' : 'srs';
    bodyEl.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px;border-bottom:1px solid #f5f5f4;padding-bottom:14px;">
        <button class="xhz-rev-tab" data-tab="srs" style="padding:10px 18px;border-radius:12px;border:2px solid #ea580c;background:#ea580c;color:#fff;font-weight:800;cursor:pointer;font-size:14px;">
          1. 🗂️ Thẻ lật SRS (Ngắt quãng)
        </button>
        <button class="xhz-rev-tab" data-tab="mc" style="padding:10px 18px;border-radius:12px;border:2px solid #e7e5e4;background:#fafaf9;color:#1c1917;font-weight:800;cursor:pointer;font-size:14px;">
          2. 🎯 Trắc nghiệm nhanh (${dueItems.length} câu)
        </button>
        <button class="xhz-rev-tab" data-tab="typing" style="padding:10px 18px;border-radius:12px;border:2px solid #e7e5e4;background:#fafaf9;color:#1c1917;font-weight:800;cursor:pointer;font-size:14px;">
          3. ⌨️ Tự gõ chữ Hán / Pinyin
        </button>
      </div>

      <!-- TAB 1: SRS FLASHCARD -->
      <div id="xhz-rev-panel-srs" style="max-width:580px;margin:0 auto;text-align:center;">
        <div id="xhz-srs-counter" style="font-size:14px;font-weight:800;color:#78716c;margin-bottom:12px;">Thẻ 1 / ${dueItems.length}</div>
        <div id="xhz-srs-card" style="padding:36px 24px;border-radius:22px;border:2px solid #fdba74;background:#fff7ed;cursor:pointer;min-height:250px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(234,88,12,0.08);">
          <div id="xhz-srs-hanzi" style="font-size:68px;font-weight:800;color:#1c1917;"></div>
          <div id="xhz-srs-pinyin" style="font-size:22px;font-weight:700;color:#ea580c;"></div>
          <div id="xhz-srs-back" style="display:none;margin-top:12px;padding-top:14px;border-top:1px dashed #fdba74;width:100%;">
            <div id="xhz-srs-meaning" style="font-size:24px;font-weight:800;color:#1c1917;"></div>
            <div id="xhz-srs-example" style="font-size:14px;color:#57534e;margin-top:8px;"></div>
          </div>
          <div id="xhz-srs-hint" style="font-size:12px;color:#9a3412;margin-top:8px;">(Bấm vào thẻ để lật xem đáp án & chấm mức độ nhớ)</div>
        </div>
        <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;flex-wrap:wrap;">
          <button id="xhz-srs-speak" style="padding:10px 18px;border-radius:12px;border:1px solid #fdba74;background:#ffedd5;color:#9a3412;font-weight:800;cursor:pointer;">🔊 Nghe phát âm</button>
          <button id="xhz-srs-flip" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:800;cursor:pointer;">🔄 Lật thẻ</button>
        </div>
        <div style="margin-top:18px;">
          <div style="font-size:13px;font-weight:700;color:#57534e;margin-bottom:10px;">Đánh giá mức độ nhớ của bạn để lên lịch SRS tiếp theo:</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
            <button class="xhz-srs-grade" data-grade="again" style="padding:12px 8px;border-radius:12px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;font-weight:800;cursor:pointer;">
              Quên<div style="font-size:11px;font-weight:600;margin-top:2px;">1 phút</div>
            </button>
            <button class="xhz-srs-grade" data-grade="hard" style="padding:12px 8px;border-radius:12px;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;font-weight:800;cursor:pointer;">
              Khó<div style="font-size:11px;font-weight:600;margin-top:2px;">10 phút</div>
            </button>
            <button class="xhz-srs-grade" data-grade="good" style="padding:12px 8px;border-radius:12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#15803d;font-weight:800;cursor:pointer;">
              Tốt<div style="font-size:11px;font-weight:600;margin-top:2px;">1 ngày</div>
            </button>
            <button class="xhz-srs-grade" data-grade="easy" style="padding:12px 8px;border-radius:12px;border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;font-weight:800;cursor:pointer;">
              Dễ<div style="font-size:11px;font-weight:600;margin-top:2px;">4 ngày</div>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 2: MULTIPLE CHOICE -->
      <div id="xhz-rev-panel-mc" style="display:none;flex-direction:column;gap:14px;"></div>

      <!-- TAB 3: TYPING -->
      <div id="xhz-rev-panel-typing" style="display:none;flex-direction:column;gap:14px;"></div>
    `;

    let srsIdx = 0;
    const srsReviewed = {};
    const srsCounter = bodyEl.querySelector('#xhz-srs-counter');
    const srsCard = bodyEl.querySelector('#xhz-srs-card');
    const srsHanzi = bodyEl.querySelector('#xhz-srs-hanzi');
    const srsPinyin = bodyEl.querySelector('#xhz-srs-pinyin');
    const srsBack = bodyEl.querySelector('#xhz-srs-back');
    const srsMeaning = bodyEl.querySelector('#xhz-srs-meaning');
    const srsExample = bodyEl.querySelector('#xhz-srs-example');

    function renderSrsCard() {
      const item = dueItems[srsIdx % dueItems.length];
      if (!item) return;
      if (srsCounter) srsCounter.textContent = `Thẻ ${srsIdx + 1} / ${dueItems.length}`;
      if (srsHanzi) srsHanzi.textContent = item.hanzi;
      if (srsPinyin) {
        srsPinyin.textContent = hidePinyin ? '••• (Đang ẩn Pinyin — Lật thẻ để xem)' : `${item.pinyin}${item.hanviet ? ` · ${item.hanviet.toUpperCase()}` : ''}`;
      }
      if (srsMeaning) srsMeaning.textContent = `${item.meaningVi} (${item.pinyin})`;
      if (srsExample) srsExample.innerHTML = item.exampleZh ? `Ví dụ: <strong>${item.exampleZh}</strong> ${item.examplePy ? `(${item.examplePy})` : ''} — ${item.exampleVi}` : '';
      if (srsBack) srsBack.style.display = 'none';
    }
    renderSrsCard();

    function flipSrsCard() {
      const item = dueItems[srsIdx % dueItems.length];
      if (! srsBack) return;
      const showing = srsBack.style.display !== 'none';
      srsBack.style.display = showing ? 'none' : 'block';
      if (!showing && item && srsPinyin) {
        srsPinyin.textContent = `${item.pinyin}${item.hanviet ? ` · ${item.hanviet.toUpperCase()}` : ''}`;
      }
    }
    if (srsCard) srsCard.onclick = flipSrsCard;
    const flipBtn = bodyEl.querySelector('#xhz-srs-flip');
    if (flipBtn) flipBtn.onclick = flipSrsCard;

    const speakBtn = bodyEl.querySelector('#xhz-srs-speak');
    if (speakBtn) {
      speakBtn.onclick = () => {
        const item = dueItems[srsIdx % dueItems.length];
        if (item) playPronunciation(item.hanzi, item.audioUrl);
      };
    }

    bodyEl.querySelectorAll('.xhz-srs-grade').forEach(btn => {
      btn.onclick = () => {
        const item = dueItems[srsIdx % dueItems.length];
        if (item) {
          srsReviewed[item.id] = 1;
          const doneCount = Object.keys(srsReviewed).length;
          if (badgeEl) badgeEl.textContent = `Hoàn thành: ${doneCount} / ${dueItems.length}`;
        }
        srsIdx = (srsIdx + 1) % dueItems.length;
        renderSrsCard();
      };
    });

    // Populate Multiple Choice Panel
    const mcPanel = bodyEl.querySelector('#xhz-rev-panel-mc');
    dueItems.forEach((item, idx) => {
      const pool = dueItems.filter((_, i) => i !== idx).map(x => x.meaningVi);
      const opts = [item.meaningVi, pool[idx % pool.length] || 'Tạm biệt', pool[(idx + 2) % pool.length] || 'Học sinh', pool[(idx + 4) % pool.length] || 'Cảm ơn'];
      const rot = idx % opts.length;
      const rotated = [...opts.slice(rot), ...opts.slice(0, rot)];

      const row = document.createElement('div');
      row.style.cssText = 'padding:16px 20px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-size:17px;font-weight:800;color:#1c1917;">
            <span style="color:#ea580c;margin-right:6px;">Câu ${idx + 1}.</span>
            <span style="font-size:24px;">${item.hanzi}</span>
            ${hidePinyin ? '' : `<span style="color:#ea580c;margin-left:6px;">(${item.pinyin})</span>`}
          </div>
          <button class="xhz-mc-audio" style="padding:5px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;border:none;font-weight:700;cursor:pointer;">🔊 Nghe</button>
        </div>
        <div class="xhz-mc-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;"></div>
      `;
      row.querySelector('.xhz-mc-audio').onclick = () => playPronunciation(item.hanzi, item.audioUrl);
      const optsWrap = row.querySelector('.xhz-mc-opts');
      rotated.forEach((optText, oIdx) => {
        const b = document.createElement('button');
        b.style.cssText = 'padding:10px 14px;border-radius:10px;border:2px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;text-align:left;cursor:pointer;font-size:14px;';
        b.textContent = `${String.fromCharCode(65 + oIdx)}. ${optText}`;
        b.onclick = () => {
          const ok = optText === item.meaningVi;
          srsReviewed[item.id] = 1;
          if (badgeEl) badgeEl.textContent = `Hoàn thành: ${Object.keys(srsReviewed).length} / ${dueItems.length}`;
          Array.from(optsWrap.children).forEach(el => {
            el.style.background = '#fff';
            el.style.borderColor = '#d6d3d1';
            el.style.color = '#1c1917';
          });
          b.style.background = ok ? '#dcfce7' : '#fee2e2';
          b.style.borderColor = ok ? '#16a34a' : '#dc2626';
          b.style.color = ok ? '#14532d' : '#7f1d1d';
          if (ok) playPronunciation(item.hanzi, item.audioUrl);
        };
        optsWrap.appendChild(b);
      });
      mcPanel.appendChild(row);
    });

    // Populate Typing Panel
    const typingPanel = bodyEl.querySelector('#xhz-rev-panel-typing');
    dueItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'padding:16px 20px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;gap:10px;';
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="font-size:16px;font-weight:800;color:#1c1917;">
            #${idx + 1}. Nghĩa: <span style="color:#ea580c;">“${item.meaningVi}”</span> ${hidePinyin ? '' : `<span style="color:#78716c;font-size:14px;">(Gợi ý Pinyin: ${item.pinyin})</span>`}
          </div>
          <button class="xhz-type-audio" style="padding:5px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;border:none;font-weight:700;cursor:pointer;">🔊 Nghe gợi ý</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <input type="text" class="xhz-type-input" placeholder="Gõ chữ Hán (${item.hanzi}) hoặc Pinyin..." style="flex:1;min-width:200px;padding:10px 14px;border-radius:10px;border:2px solid #d6d3d1;font-size:15px;font-weight:700;" />
          <button class="xhz-type-check" style="padding:10px 18px;border-radius:10px;background:#ea580c;color:#fff;border:none;font-weight:800;cursor:pointer;">Kiểm tra</button>
        </div>
        <div class="xhz-type-feedback" style="display:none;font-size:14px;font-weight:700;"></div>
      `;
      row.querySelector('.xhz-type-audio').onclick = () => playPronunciation(item.hanzi, item.audioUrl);
      const inp = row.querySelector('.xhz-type-input');
      const fb = row.querySelector('.xhz-type-feedback');
      row.querySelector('.xhz-type-check').onclick = () => {
        const val = (inp.value || '').trim().toLowerCase();
        const cleanPy = item.pinyin.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const cleanVal = val.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const ok = val === item.hanzi || cleanVal === cleanPy;
        srsReviewed[item.id] = 1;
        if (badgeEl) badgeEl.textContent = `Hoàn thành: ${Object.keys(srsReviewed).length} / ${dueItems.length}`;
        fb.style.display = 'block';
        fb.style.color = ok ? '#15803d' : '#b91c1c';
        fb.textContent = ok ? `✅ Chính xác: ${item.hanzi} (${item.pinyin})` : `💡 Đáp án chuẩn: ${item.hanzi} (${item.pinyin}) — ${item.meaningVi}`;
        playPronunciation(item.hanzi, item.audioUrl);
      };
      typingPanel.appendChild(row);
    });

    // Tab switching
    const revTabs = bodyEl.querySelectorAll('.xhz-rev-tab');
    const panels = {
      srs: bodyEl.querySelector('#xhz-rev-panel-srs'),
      mc: mcPanel,
      typing: typingPanel
    };
    function switchRevTab(tabKey) {
      revTabs.forEach(b => {
        const active = b.getAttribute('data-tab') === tabKey;
        b.style.background = active ? '#ea580c' : '#fafaf9';
        b.style.color = active ? '#fff' : '#1c1917';
        b.style.borderColor = active ? '#ea580c' : '#e7e5e4';
      });
      if (panels.srs) panels.srs.style.display = tabKey === 'srs' ? 'block' : 'none';
      if (panels.mc) panels.mc.style.display = tabKey === 'mc' ? 'flex' : 'none';
      if (panels.typing) panels.typing.style.display = tabKey === 'typing' ? 'flex' : 'none';
    }
    revTabs.forEach(b => {
      b.onclick = () => switchRevTab(b.getAttribute('data-tab'));
    });
    switchRevTab(defaultTab);
  }

  // --------------------------------------------------------------------------
  // 6.8c. Trang Tiến Độ & Thói Quen (/hoc/tien-do, /hoc/thoi-quen) & Tra Chữ Bộ Thủ
  // --------------------------------------------------------------------------
  async function renderProgressOrHabitPage(pathname) {
    const root = getMainContentContainer();
    const isHabit = pathname.includes('thoi-quen');
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
            ${isHabit ? '🔥 Chuỗi thói quen: 3 ngày liên tiếp' : '📊 Tiến độ chinh phục Giáo trình Chuẩn HSK 1'}
          </h1>
          <p style="color:#57534e;margin:0 0 20px 0;font-size:14px;">
            Mục tiêu mỗi ngày: 15 phút · Đã hoàn thành hôm nay: 10 / 15 phút · Từ vựng đã mở khóa: 18 / 300 từ HSK 1
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px;">
            <div style="padding:16px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;">
              <div style="font-size:12px;font-weight:700;color:#9a3412;">CHUỖI NGÀY HỌC</div>
              <div style="font-size:28px;font-weight:800;color:#ea580c;margin-top:4px;">3 ngày 🔥</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;">Kỷ lục dài nhất: 7 ngày</div>
            </div>
            <div style="padding:16px;border-radius:16px;background:#f0fdf4;border:1px solid #bbf7d0;">
              <div style="font-size:12px;font-weight:700;color:#166534;">TỪ ĐÃ HỌC</div>
              <div style="font-size:28px;font-weight:800;color:#15803d;margin-top:4px;">18 từ</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;"><a href="/hoc/tu-da-hoc" style="color:#15803d;font-weight:700;">Xem danh sách từ →</a></div>
            </div>
            <div style="padding:16px;border-radius:16px;background:#fef2f2;border:1px solid #fecaca;">
              <div style="font-size:12px;font-weight:700;color:#991b1b;">MỤC CẦN ÔN LẠI</div>
              <div style="font-size:28px;font-weight:800;color:#dc2626;margin-top:4px;">12 mục</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;"><a href="/hoc/bai/on-tap-den-han" style="color:#dc2626;font-weight:700;">Ôn bài đến hạn ngay →</a></div>
            </div>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="/hoc/bai/bai-1-hello-ai-xiaoyu" style="padding:12px 22px;border-radius:14px;background:#ea580c;color:#fff;font-weight:800;text-decoration:none;">▶ Tiếp tục học Bài 1</a>
            <a href="/hoc/bai/on-tap-den-han" style="padding:12px 22px;border-radius:14px;background:#ffedd5;color:#9a3412;border:1px solid #fdba74;font-weight:800;text-decoration:none;">🔄 Ôn bài đến hạn (12)</a>
            <a href="/hoc/so-loi" style="padding:12px 22px;border-radius:14px;background:#fafaf9;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;text-decoration:none;">📓 Xem Sổ lỗi (4)</a>
          </div>
        </div>
      </div>
    `;
  }

  async function renderCharacterBrowseSubPage(pathname) {
    const root = getMainContentContainer();
    const parts = pathname.split('/').filter(Boolean);
    const browseType = parts[1]; // 'bo-thu' or 'hsk'
    const rawVal = decodeURIComponent(parts.slice(2).join('/'));
    const lesson1 = await loadLocalJson('/data/curriculums/new-hsk/lessons/new-hsk-1--bai-1-hello-ai-xiaoyu.json');
    const lesson2 = await loadLocalJson('/data/curriculums/new-hsk/lessons/new-hsk-1--bai-2-my-name-is-li-wen.json');
    const words = [
      ...((lesson1 && lesson1.lesson && lesson1.lesson.words) || []),
      ...((lesson2 && lesson2.lesson && lesson2.lesson.words) || [])
    ];
    document.title = `Tra chữ Hán theo ${browseType === 'bo-thu' ? `Bộ thủ ${rawVal}` : `HSK ${rawVal}`} | XieHanzi`;
    root.innerHTML = `
      <div style="max-width:960px;margin:0 auto;">
        <div style="margin-bottom:16px;">
          <a href="/tra-chu/${browseType}" style="color:#ea580c;font-weight:800;text-decoration:none;">← Quay lại Tra chữ theo ${browseType === 'bo-thu' ? 'Bộ thủ' : 'cấp độ HSK'}</a>
        </div>
        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:22px;padding:24px;">
          <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0 0 16px 0;">
            Danh sách chữ Hán & Từ vựng (${browseType === 'bo-thu' ? `Bộ thủ: ${rawVal}` : `Cấp độ: HSK ${rawVal}`})
          </h1>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">
            ${words.map(w => {
              const hz = (w.hanzi || w.word || '你好').replace(/\{|\}/g, '');
              const ch = Array.from(hz)[0] || hz;
              return `<a href="/han-tu/${encodeURIComponent(ch)}" style="padding:16px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;display:flex;flex-direction:column;gap:4px;">
                <div style="font-size:32px;font-weight:800;color:#1c1917;">${hz}</div>
                <div style="font-size:14px;font-weight:700;color:#ea580c;">${w.wordPinyin || w.pinyin || ''}</div>
                <div style="font-size:14px;color:#44403c;">${w.translationVi || w.meaningVi || ''}</div>
              </a>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
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
        @media (min-width: 768px) {
          .lp-runner-inner.lp-split {
            max-width: 1120px !important;
          }
          .xhz-lp-split-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 5fr) minmax(0, 6fr) !important;
            gap: 2rem !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
            min-height: 0 !important;
            flex: 1 1 0% !important;
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
            overflow: hidden !important;
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
        // Lưu trạng thái hoàn thành
        try {
          if (run.stageKey) {
            const doneActs = JSON.parse(localStorage.getItem('httq_done_activities') || '{}') || {};
            const arr = Array.isArray(doneActs[run.stageKey]) ? doneActs[run.stageKey] : [];
            if (run.activityKey && !arr.includes(run.activityKey)) arr.push(run.activityKey);
            doneActs[run.stageKey] = arr;
            localStorage.setItem('httq_done_activities', JSON.stringify(doneActs));
          }
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
                  <span><b>5</b> ngày liên tiếp giữ chuỗi học tập!</span>
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

      // 2. Giao diện Đã đăng nhập: thêm thẻ thông tin tài khoản Google + nút Đăng xuất nổi bật
      const planCard = document.querySelector('[data-testid="account-plan-card"]');
      const savedUser = getSavedUser();
      if (planCard && savedUser && !document.getElementById('xhz-user-auth-banner')) {
        const banner = document.createElement('div');
        banner.id = 'xhz-user-auth-banner';
        banner.style.cssText =
          'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;margin-bottom:16px;border-radius:16px;border:1px solid #e7e5e4;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.04);';
        const initial = (savedUser.displayName || savedUser.email || 'U').trim().charAt(0).toUpperCase();
        const avatarHtml = savedUser.avatar
          ? `<img src="${savedUser.avatar}" alt="" style="width:44px;height:44px;border-radius:999px;object-fit:cover;border:1px solid #e7e5e4;" />`
          : `<div style="width:44px;height:44px;border-radius:999px;background:#fef2f2;color:#dc2626;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;border:1px solid #fecaca;">${initial}</div>`;
        banner.innerHTML =
          `<div style="display:flex;align-items:center;gap:12px;min-width:0;">` +
          avatarHtml +
          `<div style="min-width:0;">` +
          `<div style="font-weight:700;font-size:16px;color:#1c1917;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${savedUser.displayName || 'Học viên'}</div>` +
          `<div style="font-size:13px;color:#57534e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Đã đăng nhập: ${savedUser.email}</div>` +
          `</div>` +
          `</div>` +
          `<button type="button" id="xhz-direct-logout-btn" style="padding:8px 16px;border-radius:10px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;font-weight:600;font-size:14px;cursor:pointer;">Đăng xuất</button>`;
        if (planCard.parentElement) {
          planCard.parentElement.insertBefore(banner, planCard);
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
