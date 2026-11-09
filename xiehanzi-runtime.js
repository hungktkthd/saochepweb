(function () {
  'use strict';

  // 1. Dynamic Base Path detection (Vercel root "/" vs GitHub Pages "/saochepweb")
  var BASE = '';
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.pathname === '/saochepweb' || window.location.pathname.indexOf('/saochepweb/') === 0) {
      BASE = '/saochepweb';
    }
    window.__XIEHANZI_BASE__ = BASE;
  }

  var RAW_REPO = 'https://raw.githubusercontent.com/hungktkthd/saochepweb';
  var SUPABASE_URL = 'https://xcthntcgenzfybefaphh.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGhudGNnZW56ZnliZWZhcGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDE0NjQsImV4cCI6MjEwOTIxNzQ2NH0.0L3BZslXqmIkiH3kuKSL0HJeo_gmZ15E614xqnxhbdM';

  // 2. Universal URL & Media Rewriter
  function rewriteUrl(u) {
    if (!u || typeof u !== 'string') return u;
    var s = u.trim();
    if (!s || s.indexOf('data:') === 0 || s.indexOf('blob:') === 0 || s.indexOf('javascript:') === 0) return u;

    // Unwrap Next.js /_next/image/?url=...
    if (s.indexOf('/_next/image') !== -1 && s.indexOf('url=') !== -1) {
      try {
        var m = s.match(/[?&]url=([^&]+)/);
        if (m && m[1]) {
          s = decodeURIComponent(m[1].replace(/&amp;/g, '&'));
        }
      } catch (e) {}
    }

    // Map static.xiehanzi.com URLs to our consolidated GitHub repo & local root
    if (s.indexOf('https://static.xiehanzi.com/') === 0) {
      var rest = s.slice('https://static.xiehanzi.com/'.length);
      if (rest.indexOf('web/prod/_next/') === 0) {
        s = '/' + rest.slice('web/prod/'.length);
      } else if (rest.indexOf('level_images/') === 0) {
        s = '/' + rest;
      } else if (
        rest.indexOf('gif/') === 0 ||
        rest.indexOf('hsk-tests/') === 0 ||
        rest.indexOf('word-illustration/') === 0
      ) {
        return RAW_REPO + '/media-visuals/' + rest;
      } else if (rest.indexOf('etymology/') === 0) {
        return RAW_REPO + '/media-etymology/' + rest;
      } else if (rest.indexOf('audios/') === 0 || rest.indexOf('word_audios/') === 0) {
        return RAW_REPO + '/media-audios/' + rest;
      } else if (rest.indexOf('hsk-audio/') === 0) {
        return RAW_REPO + '/media-hsk-audio/' + rest;
      } else if (rest.indexOf('sentence-audio/') === 0) {
        var fname = rest.slice('sentence-audio/'.length);
        var firstChar = (fname.charAt(0) || '0').toLowerCase();
        var branch = firstChar >= '0' && firstChar <= '7' ? 'media-sentences-1' : 'media-sentences-2';
        return RAW_REPO + '/' + branch + '/' + rest;
      }
    }

    // Map /thay-do/strokes-all/2.0.1/<hex>.json to jsdelivr hanzi-writer-data
    var strokeMatch = s.match(/\/thay-do\/strokes-all\/2\.0\.1\/([0-9a-fA-F]+)\.json/);
    if (strokeMatch) {
      try {
        var cp = parseInt(strokeMatch[1], 16);
        var ch = String.fromCodePoint(cp);
        return 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json';
      } catch (e) {}
    }

    // Prefix root-relative paths when running under /saochepweb on GitHub Pages
    if (BASE && s.charAt(0) === '/' && s.charAt(1) !== '/' && s.indexOf(BASE + '/') !== 0 && s !== BASE) {
      return BASE + s;
    }

    return s;
  }

  function rewriteSrcSet(srcset) {
    if (!srcset || typeof srcset !== 'string') return srcset;
    return srcset
      .split(',')
      .map(function (part) {
        var trimmed = part.trim();
        if (!trimmed) return trimmed;
        var pieces = trimmed.split(/\s+/);
        pieces[0] = rewriteUrl(pieces[0]);
        return pieces.join(' ');
      })
      .join(', ');
  }

  function rewriteJsonMediaDeep(obj) {
    if (!obj) return obj;
    if (typeof obj === 'string') {
      if (obj.indexOf('static.xiehanzi.com') !== -1 || obj.indexOf('/_next/image') !== -1) {
        return rewriteUrl(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        obj[i] = rewriteJsonMediaDeep(obj[i]);
      }
      return obj;
    }
    if (typeof obj === 'object') {
      var keys = Object.keys(obj);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        obj[key] = rewriteJsonMediaDeep(obj[key]);
      }
    }
    return obj;
  }

  window.__rewriteXieHanziUrl = rewriteUrl;

  // 3. Patch DOM Element attributes & properties so hydrated React components load local images & audio
  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (typeof name === 'string') {
      var lower = name.toLowerCase();
      if (lower === 'src' || lower === 'href') {
        value = rewriteUrl(String(value));
      } else if (lower === 'srcset' || lower === 'imagesrcset') {
        value = rewriteSrcSet(String(value));
      }
    }
    return origSetAttr.call(this, name, value);
  };

  function patchProp(proto, prop, transform) {
    if (!proto) return;
    var desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc && desc.set && desc.configurable) {
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set: function (val) {
          desc.set.call(this, transform(val));
        }
      });
    }
  }

  if (typeof HTMLImageElement !== 'undefined') {
    patchProp(HTMLImageElement.prototype, 'src', rewriteUrl);
    patchProp(HTMLImageElement.prototype, 'srcset', rewriteSrcSet);
  }
  if (typeof HTMLMediaElement !== 'undefined') {
    patchProp(HTMLMediaElement.prototype, 'src', rewriteUrl);
  }
  if (typeof HTMLSourceElement !== 'undefined') {
    patchProp(HTMLSourceElement.prototype, 'src', rewriteUrl);
    patchProp(HTMLSourceElement.prototype, 'srcset', rewriteSrcSet);
  }
  if (typeof HTMLScriptElement !== 'undefined') {
    patchProp(HTMLScriptElement.prototype, 'src', rewriteUrl);
  }
  if (typeof HTMLLinkElement !== 'undefined') {
    patchProp(HTMLLinkElement.prototype, 'href', rewriteUrl);
  }

  if (typeof window.Audio === 'function') {
    var OrigAudio = window.Audio;
    window.Audio = function (src) {
      return new OrigAudio(src ? rewriteUrl(src) : undefined);
    };
    window.Audio.prototype = OrigAudio.prototype;
  }

  function fixDomNode(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.hasAttribute) {
      if (node.hasAttribute('src')) {
        var s = node.getAttribute('src');
        var ns = rewriteUrl(s);
        if (ns !== s) origSetAttr.call(node, 'src', ns);
      }
      if (node.hasAttribute('srcset')) {
        var ss = node.getAttribute('srcset');
        var nss = rewriteSrcSet(ss);
        if (nss !== ss) origSetAttr.call(node, 'srcset', nss);
      }
      if (node.hasAttribute('href')) {
        var h = node.getAttribute('href');
        var nh = rewriteUrl(h);
        if (nh !== h) origSetAttr.call(node, 'href', nh);
      }
    }
    if (node.querySelectorAll) {
      var els = node.querySelectorAll('[src],[srcset],[href]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.hasAttribute('src')) {
          var s1 = el.getAttribute('src');
          var ns1 = rewriteUrl(s1);
          if (ns1 !== s1) origSetAttr.call(el, 'src', ns1);
        }
        if (el.hasAttribute('srcset')) {
          var ss1 = el.getAttribute('srcset');
          var nss1 = rewriteSrcSet(ss1);
          if (nss1 !== ss1) origSetAttr.call(el, 'srcset', nss1);
        }
        if (el.hasAttribute('href')) {
          var h1 = el.getAttribute('href');
          var nh1 = rewriteUrl(h1);
          if (nh1 !== h1) origSetAttr.call(el, 'href', nh1);
        }
      }
    }
  }

  if (typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.target) {
          fixDomNode(m.target);
        } else if (m.addedNodes && m.addedNodes.length) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            fixDomNode(m.addedNodes[j]);
          }
        }
      }
    });
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'href']
    });
  }

  // 4. Local Dataset Cache & Lookup Engine (9,931 Characters + 11,534 Words + 6,704 Han-Viet)
  var origFetch = window.fetch ? window.fetch.bind(window) : null;
  var dataCache = {};
  var charMapPromise = null;
  var vocabMapPromise = null;
  var hanvietMapPromise = null;

  function fetchLocalJson(relPath) {
    var full = BASE + (relPath.charAt(0) === '/' ? relPath : '/' + relPath);
    if (dataCache[full]) return dataCache[full];
    dataCache[full] = origFetch(full).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      return rewriteJsonMediaDeep(d);
    });
    return dataCache[full];
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function loadCharMap() {
    if (charMapPromise) return charMapPromise;
    charMapPromise = fetchLocalJson('/data/characters/characters-01.json').then(function (chunk1) {
      var map = {};
      var list = [];
      function addChunk(arr) {
        if (!Array.isArray(arr)) return;
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];
          if (item && item.character) {
            map[item.character] = item;
            list.push(item);
          }
        }
      }
      addChunk(chunk1);
      // Background-load remaining chunks on demand
      return {
        map: map,
        list: list,
        loadedUpTo: 1,
        findChar: async function (ch) {
          if (map[ch]) return map[ch];
          for (var idx = 2; idx <= 20; idx++) {
            try {
              var ck = await fetchLocalJson('/data/characters/characters-' + pad2(idx) + '.json');
              addChunk(ck);
              if (map[ch]) return map[ch];
            } catch (e) {}
          }
          return null;
        }
      };
    });
    return charMapPromise;
  }

  function loadVocabMap() {
    if (vocabMapPromise) return vocabMapPromise;
    vocabMapPromise = fetchLocalJson('/data/vocabulary/vocabulary-01.json').then(function (chunk1) {
      var map = {};
      var list = [];
      function addChunk(arr) {
        if (!Array.isArray(arr)) return;
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];
          var key = item && (item.hanzi || item.word || item.character);
          if (key) {
            map[key] = item;
            list.push(item);
          }
        }
      }
      addChunk(chunk1);
      return {
        map: map,
        list: list,
        findWord: async function (w) {
          if (map[w]) return map[w];
          for (var idx = 2; idx <= 12; idx++) {
            try {
              var ck = await fetchLocalJson('/data/vocabulary/vocabulary-' + pad2(idx) + '.json');
              addChunk(ck);
              if (map[w]) return map[w];
            } catch (e) {}
          }
          return null;
        }
      };
    });
    return vocabMapPromise;
  }

  function loadHanVietMap() {
    if (hanvietMapPromise) return hanvietMapPromise;
    hanvietMapPromise = fetchLocalJson('/data/han-viet/han-viet-01.json').then(function (chunk1) {
      var map = {};
      var list = [];
      function addChunk(arr) {
        if (!Array.isArray(arr)) return;
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];
          var key = item && (item.slug || item.pinyin || item.hanviet);
          if (key) {
            map[String(key).toLowerCase()] = item;
            list.push(item);
          }
        }
      }
      addChunk(chunk1);
      return {
        map: map,
        list: list,
        findSlug: async function (slug) {
          var s = String(slug || '').toLowerCase();
          if (map[s]) return map[s];
          for (var idx = 2; idx <= 7; idx++) {
            try {
              var ck = await fetchLocalJson('/data/han-viet/han-viet-' + pad2(idx) + '.json');
              addChunk(ck);
              if (map[s]) return map[s];
            } catch (e) {}
          }
          return null;
        }
      };
    });
    return hanvietMapPromise;
  }

  // 5. Handle API calls (/v1/... and /v2/...) locally from /data/ + Supabase + AI
  async function resolveApiRequest(urlStr, method, bodyText) {
    var u;
    try {
      u = new URL(urlStr, window.location.origin);
    } catch (e) {
      return null;
    }
    var p = u.pathname.replace(/^\/api/, '');
    if (BASE && p.indexOf(BASE) === 0) p = p.slice(BASE.length);

    // Public settings & social proof
    if (p === '/v1/settings/public') return fetchLocalJson('/data/misc/settings-public.json');
    if (p === '/v1/social-proof/summary') return fetchLocalJson('/data/misc/social-proof-summary.json');
    if (p === '/v1/thay-do/hi-vien/danh-muc') return fetchLocalJson('/data/misc/thay-do-hi-vien-danh-muc.json');
    if (p === '/v1/thay-do/bang-vang') return fetchLocalJson('/data/misc/thay-do-bang-vang.json');

    // Daily games & leaderboards
    if (p.indexOf('/v1/games/') === 0) {
      if (p.indexOf('tim-chu-trong-chu') !== -1) {
        if (p.indexOf('leaderboard') !== -1) return fetchLocalJson('/data/misc/leaderboard-tim-chu-trong-chu.json');
        return fetchLocalJson('/data/misc/daily-tim-chu-trong-chu.json');
      }
      if (p.indexOf('leaderboard') !== -1) return fetchLocalJson('/data/misc/leaderboard-ghep-chu.json');
      return fetchLocalJson('/data/misc/daily-ghep-chu.json');
    }

    // Dictation videos
    if (p === '/v1/dictation/videos' || p === '/v1/dictation/videos/') {
      var vids = await fetchLocalJson('/data/dictation/videos-all.json');
      var hskParam = u.searchParams.get('hsk');
      if (hskParam && Array.isArray(vids)) {
        return vids.filter(function (v) { return String(v.hskLevel || v.hsk || '') === String(hskParam); });
      }
      return vids;
    }
    var dictSegMatch = p.match(/^\/v1\/dictation\/videos\/([^\/]+)\/segments/);
    if (dictSegMatch) {
      return fetchLocalJson('/data/dictation/videos/' + dictSegMatch[1] + '-segments.json');
    }
    var dictDetMatch = p.match(/^\/v1\/dictation\/videos\/([^\/]+)$/);
    if (dictDetMatch) {
      return fetchLocalJson('/data/dictation/videos/' + dictDetMatch[1] + '-detail.json');
    }

    // Grammar
    if (p === '/v1/grammar-quiz/tracks') return fetchLocalJson('/data/grammar/quiz-tracks.json');
    if (p.indexOf('/v1/grammar-quiz') === 0) {
      var track = u.searchParams.get('track') || u.searchParams.get('level') || '1';
      if (String(track).indexOf('new') !== -1) {
        var nl = String(track).replace(/[^0-9]/g, '') || '1';
        return fetchLocalJson('/data/grammar/quiz-new-hsk' + nl + '.json');
      }
      var hl = String(track).replace(/[^0-9]/g, '') || '1';
      return fetchLocalJson('/data/grammar/quiz-hsk' + hl + '.json');
    }
    var gramLvlMatch = p.match(/^\/v1\/grammar\/levels\/([^\/]+)/);
    if (gramLvlMatch) {
      var gl = gramLvlMatch[1];
      var sys = u.searchParams.get('system') || u.searchParams.get('standard') || '';
      if (sys.indexOf('new') !== -1 || gl.indexOf('new') !== -1) {
        var nnum = gl.replace(/[^0-9]/g, '') || '1';
        return fetchLocalJson('/data/grammar/new-hsk-level-' + nnum + '.json');
      }
      var hnum = gl.replace(/[^0-9]/g, '') || '1';
      return fetchLocalJson('/data/grammar/hsk-level-' + hnum + '.json');
    }
    if (p.indexOf('/v1/grammar-progress') === 0) {
      var savedGram = JSON.parse(localStorage.getItem('xhz_grammar_progress') || '[]');
      return { items: savedGram, studiedIds: savedGram };
    }

    // HSK & YCT Tests
    if (p === '/v1/generated-tests/options') return fetchLocalJson('/data/tests/generated-tests-options.json');
    if (p === '/v1/generated-tests/freshness') return fetchLocalJson('/data/tests/generated-tests-freshness.json');
    if (p === '/v1/hsk-tests/levels' || p === '/v1/hsk-tests/levels/') {
      var fam = (u.searchParams.get('family') || '').toUpperCase();
      if (fam === 'YCT') return fetchLocalJson('/data/tests/levels-yct.json');
      return fetchLocalJson('/data/tests/levels-hsk.json');
    }
    var testPaperMatch = p.match(/^\/v1\/hsk-tests\/(?:papers\/|levels\/([0-9]+)\/tests\/)?([^\/]+)$/);
    if (testPaperMatch && testPaperMatch[2] !== 'levels' && testPaperMatch[2] !== 'papers') {
      var tid = testPaperMatch[2];
      var lvlGuess = testPaperMatch[1];
      if (!lvlGuess) {
        var mLvl = tid.match(/(?:hsk30-|xh30-)([1-6])/);
        lvlGuess = mLvl ? mLvl[1] : (u.searchParams.get('level') || '1');
      }
      return fetchLocalJson('/data/tests/papers/level-' + lvlGuess + '-' + tid + '.json');
    }

    // Curriculums (HSK, New HSK, YCT, Boya, Hanyu Jiaocheng)
    var currLessonMatch = p.match(/^\/v1\/hanzi-curriculums\/([^\/]+)\/levels\/([^\/]+)\/lessons/);
    if (currLessonMatch) {
      return fetchLocalJson('/data/curriculums/' + currLessonMatch[1] + '/lessons/' + currLessonMatch[2] + '-lessons.json');
    }
    var currTopicMatch = p.match(/^\/v1\/hanzi-curriculums\/([^\/]+)\/levels\/([^\/]+)\/topics/);
    if (currTopicMatch) {
      return fetchLocalJson('/data/curriculums/' + currTopicMatch[1] + '/topics/' + currTopicMatch[2] + '-topics.json');
    }
    var currLevelMatch = p.match(/^\/v1\/hanzi-curriculums\/([^\/]+)\/levels\/([^\/]+)$/);
    if (currLevelMatch) {
      return fetchLocalJson('/data/curriculums/' + currLevelMatch[1] + '/levels/' + currLevelMatch[2] + '.json');
    }
    var currRootMatch = p.match(/^\/v1\/hanzi-curriculums\/([^\/]+)$/);
    if (currRootMatch) {
      return fetchLocalJson('/data/curriculums/' + currRootMatch[1] + '/curriculum.json');
    }

    // Character & Word lookup
    var charMatch = p.match(/^\/v1\/hanzi-characters?\/([^\/]+)$/);
    if (charMatch && charMatch[1] !== 'browse') {
      var decChar = decodeURIComponent(charMatch[1]);
      var cmap = await loadCharMap();
      var foundChar = await cmap.findChar(decChar);
      if (foundChar) return foundChar;
    }
    var wordMatch = p.match(/^\/v1\/hanzi-words\/([^\/]+)$/);
    if (wordMatch && wordMatch[1] !== 'batch') {
      var decWord = decodeURIComponent(wordMatch[1]);
      var vmap = await loadVocabMap();
      var foundWord = await vmap.findWord(decWord);
      if (foundWord) return foundWord;
    }

    // Search & Pinyin lookup
    if (p === '/v1/search' || p === '/v1/pinyin-lookup') {
      var q = (u.searchParams.get('q') || u.searchParams.get('query') || u.searchParams.get('keyword') || '').trim().toLowerCase();
      var cm = await loadCharMap();
      var vm = await loadVocabMap();
      var chars = cm.list.filter(function (c) {
        return !q ||
          (c.character && c.character.indexOf(q) !== -1) ||
          (c.pinyin && c.pinyin.toLowerCase().indexOf(q) !== -1) ||
          (c.hanviet && c.hanviet.toLowerCase().indexOf(q) !== -1) ||
          (c.meaningVi && c.meaningVi.toLowerCase().indexOf(q) !== -1);
      }).slice(0, 24);
      var words = vm.list.filter(function (w) {
        var hz = w.hanzi || w.word || '';
        return !q ||
          hz.indexOf(q) !== -1 ||
          (w.pinyin && w.pinyin.toLowerCase().indexOf(q) !== -1) ||
          (w.hanviet && w.hanviet.toLowerCase().indexOf(q) !== -1) ||
          (w.meaningVi && w.meaningVi.toLowerCase().indexOf(q) !== -1);
      }).slice(0, 24);
      return { characters: chars, words: words, items: chars.concat(words) };
    }

    // Supabase Auth (/v1/auth/login, /v1/auth/register, /v1/users/me)
    if (p === '/v1/auth/login' || p === '/v1/auth/register') {
      var payload = {};
      try { payload = JSON.parse(bodyText || '{}'); } catch (e) {}
      var email = payload.email || payload.username || '';
      var password = payload.password || '';
      var endpoint = p === '/v1/auth/register'
        ? SUPABASE_URL + '/auth/v1/signup'
        : SUPABASE_URL + '/auth/v1/token?grant_type=password';
      var sbResp = await origFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
        body: JSON.stringify({ email: email, password: password })
      });
      var sbData = await sbResp.json();
      if (!sbResp.ok) {
        throw { status: sbResp.status, data: { message: sbData.msg || sbData.error_description || 'Đăng nhập/Đăng ký thất bại' } };
      }
      var token = sbData.access_token || (sbData.session && sbData.session.access_token) || 'sb_session_' + Date.now();
      var userObj = sbData.user || { id: 'user_' + Date.now(), email: email };
      localStorage.setItem('xiehanzi_access_token', token);
      localStorage.setItem('xhz_supabase_user', JSON.stringify(userObj));
      return {
        accessToken: token,
        token: token,
        user: {
          id: userObj.id,
          email: userObj.email,
          name: (userObj.email || '').split('@')[0],
          emailVerified: true
        }
      };
    }

    if (p === '/v1/users/me') {
      var uRaw = localStorage.getItem('xhz_supabase_user');
      if (uRaw) {
        var uParsed = JSON.parse(uRaw);
        return {
          id: uParsed.id,
          email: uParsed.email,
          name: (uParsed.email || 'Học viên').split('@')[0],
          emailVerified: true,
          companion: 'tieu-man'
        };
      }
      return { id: 'guest', email: 'guest@hoctiengtrungquoc.vercel.app', name: 'Khách', emailVerified: true };
    }

    if (p === '/v1/metrics/event' || p === '/analytics/events' || p.indexOf('/sync') !== -1) {
      return { ok: true, success: true };
    }

    return null;
  }

  // Intercept window.fetch
  if (origFetch) {
    window.fetch = async function (input, init) {
      var urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));

      // Intercept API calls to api.xiehanzi.com or /api/v1
      if (urlStr.indexOf('api.xiehanzi.com') !== -1 || urlStr.indexOf('/v1/') !== -1) {
        try {
          var method = (init && init.method) || 'GET';
          var bodyText = init && typeof init.body === 'string' ? init.body : '';
          var localResult = await resolveApiRequest(urlStr, method, bodyText);
          if (localResult !== null) {
            return new Response(JSON.stringify(localResult), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (errObj) {
          if (errObj && errObj.status) {
            return new Response(JSON.stringify(errObj.data || {}), {
              status: errObj.status,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }

      var rewritten = rewriteUrl(urlStr);
      if (typeof input === 'string') {
        return origFetch(rewritten, init);
      }
      return origFetch(input, init);
    };
  }

  // Intercept XMLHttpRequest (used by axios in Next.js chunks)
  if (typeof XMLHttpRequest !== 'undefined') {
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      this.__xhzMethod = method;
      this.__xhzUrl = String(url || '');
      var targetUrl = rewriteUrl(this.__xhzUrl);
      return origOpen.call(this, method, targetUrl, async !== false, user, password);
    };

    XMLHttpRequest.prototype.send = function (body) {
      var xhr = this;
      var urlStr = xhr.__xhzUrl || '';
      if (urlStr.indexOf('api.xiehanzi.com') !== -1 || urlStr.indexOf('/v1/') !== -1) {
        resolveApiRequest(urlStr, xhr.__xhzMethod || 'GET', typeof body === 'string' ? body : '')
          .then(function (resData) {
            if (resData !== null) {
              var jsonText = JSON.stringify(resData);
              Object.defineProperty(xhr, 'readyState', { configurable: true, value: 4 });
              Object.defineProperty(xhr, 'status', { configurable: true, value: 200 });
              Object.defineProperty(xhr, 'statusText', { configurable: true, value: 'OK' });
              Object.defineProperty(xhr, 'responseText', { configurable: true, value: jsonText });
              Object.defineProperty(xhr, 'response', { configurable: true, value: jsonText });
              if (typeof xhr.onreadystatechange === 'function') xhr.onreadystatechange();
              if (typeof xhr.onload === 'function') xhr.onload();
              xhr.dispatchEvent(new Event('readystatechange'));
              xhr.dispatchEvent(new Event('load'));
              xhr.dispatchEvent(new Event('loadend'));
            } else {
              origSend.call(xhr, body);
            }
          })
          .catch(function (errObj) {
            if (errObj && errObj.status) {
              var errText = JSON.stringify(errObj.data || {});
              Object.defineProperty(xhr, 'readyState', { configurable: true, value: 4 });
              Object.defineProperty(xhr, 'status', { configurable: true, value: errObj.status });
              Object.defineProperty(xhr, 'responseText', { configurable: true, value: errText });
              Object.defineProperty(xhr, 'response', { configurable: true, value: errText });
              if (typeof xhr.onreadystatechange === 'function') xhr.onreadystatechange();
              if (typeof xhr.onload === 'function') xhr.onload();
              xhr.dispatchEvent(new Event('load'));
              xhr.dispatchEvent(new Event('loadend'));
            } else {
              origSend.call(xhr, body);
            }
          });
        return;
      }
      return origSend.call(xhr, body);
    };
  }

  // 6. Interactive Detail Drawer for Dynamic Routes (/han-tu/<char>, /tu-vung/<word>, /han-viet/<slug>)
  function openDetailModal(title, htmlContent) {
    var existing = document.getElementById('xhz-dynamic-modal');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'xhz-dynamic-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit;';
    overlay.innerHTML =
      '<div style="background:hsl(var(--background, 0 0% 100%));color:hsl(var(--foreground, 222 47% 11%));border:1px solid rgba(148,163,184,0.3);border-radius:20px;max-width:860px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,0.45);padding:24px;position:relative;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(148,163,184,0.2);padding-bottom:14px;margin-bottom:18px;">' +
          '<h2 style="font-size:20px;font-weight:800;margin:0;">' + title + '</h2>' +
          '<button id="xhz-modal-close" style="background:rgba(148,163,184,0.15);border:none;border-radius:10px;width:36px;height:36px;font-size:18px;font-weight:700;cursor:pointer;color:inherit;">✕</button>' +
        '</div>' +
        '<div id="xhz-modal-body">' + htmlContent + '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.id === 'xhz-modal-close') overlay.remove();
    });
  }

  async function showCharacterDetail(charStr) {
    openDetailModal('Tra cứu chữ Hán: ' + charStr, '<p style="padding:20px;text-align:center;">Đang tải dữ liệu chữ <b>' + charStr + '</b>...</p>');
    var cm = await loadCharMap();
    var c = await cm.findChar(charStr);
    var body = document.getElementById('xhz-modal-body');
    if (!body) return;
    if (!c) {
      body.innerHTML = '<p>Không tìm thấy dữ liệu cho chữ <b>' + charStr + '</b>.</p>';
      return;
    }
    var gifUrl = c.gif ? rewriteUrl(c.gif) : '';
    var audioUrl = (c.audios && c.audios[0]) ? rewriteUrl(c.audios[0]) : '';
    var etyImgs = (c.etymologyImages && c.etymologyImages.images) ? c.etymologyImages.images : [];
    var examples = c.examples || [];
    var words = c.commonWords || [];

    body.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;align-items:start;">' +
        '<div style="display:flex;flex-direction:column;align-items:center;background:rgba(234,88,12,0.06);border:2px solid rgba(234,88,12,0.25);border-radius:16px;padding:20px;">' +
          (gifUrl
            ? '<img src="' + gifUrl + '" alt="' + c.character + '" style="width:150px;height:150px;object-fit:contain;border-radius:12px;background:#fff;" />'
            : '<div style="font-size:96px;font-weight:800;line-height:1.1;">' + c.character + '</div>') +
          '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">' +
            (audioUrl ? '<button onclick="new Audio(\'' + audioUrl + '\').play()" style="background:#ea580c;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;">🔊 Nghe phát âm</button>' : '') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">' +
            '<span style="font-size:36px;font-weight:800;">' + c.character + '</span>' +
            '<span style="font-size:22px;font-weight:700;color:#ea580c;">' + (c.pinyin || '') + '</span>' +
            '<span style="background:rgba(234,88,12,0.12);color:#ea580c;padding:4px 10px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;">Hán Việt: ' + (c.hanviet || '') + '</span>' +
            (c.hskLevel ? '<span style="background:rgba(16,185,129,0.15);color:#059669;padding:4px 10px;border-radius:999px;font-weight:700;font-size:13px;">HSK ' + c.hskLevel + '</span>' : '') +
          '</div>' +
          '<p style="margin-top:12px;font-size:16px;line-height:1.6;"><b>Nghĩa:</b> ' + (c.meaningVi || '') + '</p>' +
          '<p style="font-size:14px;opacity:0.85;"><b>Bộ thủ:</b> ' + (c.radical || '') + ' &nbsp;|&nbsp; <b>Số nét:</b> ' + (c.strokeCount || '') + '</p>' +
          (c.componentNarrative ? '<div style="margin-top:10px;padding:12px;background:rgba(148,163,184,0.1);border-radius:10px;font-size:14px;"><b>Chiết tự:</b> ' + c.componentNarrative + '</div>' : '') +
          (c.memoryHook ? '<div style="margin-top:8px;padding:12px;background:rgba(234,88,12,0.08);border-radius:10px;font-size:14px;"><b>Mẹo nhớ:</b> ' + c.memoryHook + '</div>' : '') +
        '</div>' +
      '</div>' +
      (etyImgs.length
        ? '<div style="margin-top:18px;"><h4 style="margin:0 0 8px 0;font-size:15px;">📜 Tự nguyên (Giáp cốt / Kim văn / Triện thư):</h4><div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;">' +
          etyImgs.map(function (im) {
            return '<div style="text-align:center;background:#fff;color:#111;padding:8px;border-radius:10px;border:1px solid #e2e8f0;min-width:84px;"><img src="' + rewriteUrl(im.url) + '" style="height:56px;object-fit:contain;margin:0 auto;" /><div style="font-size:11px;margin-top:4px;font-weight:600;">' + (im.stageLabel || im.stage || '') + '</div></div>';
          }).join('') + '</div></div>'
        : '') +
      (words.length
        ? '<div style="margin-top:18px;"><h4 style="margin:0 0 8px 0;font-size:15px;">🧩 Từ ghép phổ biến:</h4><div style="display:flex;flex-wrap:wrap;gap:8px;">' +
          words.slice(0, 12).map(function (w) {
            return '<span style="padding:6px 12px;border-radius:999px;border:1px solid rgba(148,163,184,0.3);font-size:13px;"><b>' + (w.hanzi || w.word || '') + '</b> (' + (w.pinyin || '') + '): ' + (w.meaningVi || w.meaning || '') + '</span>';
          }).join('') + '</div></div>'
        : '') +
      (examples.length
        ? '<div style="margin-top:18px;"><h4 style="margin:0 0 8px 0;font-size:15px;">💬 Câu ví dụ:</h4>' +
          examples.slice(0, 5).map(function (ex) {
            var exAudio = ex.audio ? rewriteUrl(ex.audio) : '';
            return '<div style="padding:10px 12px;border-bottom:1px solid rgba(148,163,184,0.15);display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
              '<div><div style="font-size:16px;font-weight:700;">' + (ex.chinese || ex.hanzi || '') + '</div><div style="font-size:13px;color:#ea580c;">' + (ex.pinyin || '') + '</div><div style="font-size:14px;opacity:0.85;">' + (ex.vietnamese || ex.meaningVi || '') + '</div></div>' +
              (exAudio ? '<button onclick="new Audio(\'' + exAudio + '\').play()" style="background:rgba(234,88,12,0.12);color:#ea580c;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;font-weight:700;">🔊</button>' : '') +
            '</div>';
          }).join('') + '</div>'
        : '');
  }

  async function showWordDetail(wordStr) {
    openDetailModal('Từ vựng: ' + wordStr, '<p style="padding:20px;text-align:center;">Đang tải từ vựng <b>' + wordStr + '</b>...</p>');
    var vm = await loadVocabMap();
    var w = await vm.findWord(wordStr);
    var body = document.getElementById('xhz-modal-body');
    if (!body) return;
    if (!w) {
      body.innerHTML = '<p>Không tìm thấy dữ liệu cho từ <b>' + wordStr + '</b>.</p>';
      return;
    }
    var audioUrl = w.audio ? rewriteUrl(w.audio) : ((w.audios && w.audios[0]) ? rewriteUrl(w.audios[0]) : '');
    var examples = w.examples || [];
    body.innerHTML =
      '<div>' +
        '<div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;">' +
          '<span style="font-size:42px;font-weight:800;">' + (w.hanzi || w.word || wordStr) + '</span>' +
          '<span style="font-size:22px;font-weight:700;color:#ea580c;">' + (w.pinyin || '') + '</span>' +
          (w.hanviet ? '<span style="background:rgba(234,88,12,0.12);color:#ea580c;padding:4px 10px;border-radius:999px;font-weight:700;font-size:13px;text-transform:uppercase;">Hán Việt: ' + w.hanviet + '</span>' : '') +
          (audioUrl ? '<button onclick="new Audio(\'' + audioUrl + '\').play()" style="background:#ea580c;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer;">🔊 Nghe phát âm</button>' : '') +
        '</div>' +
        '<p style="margin-top:14px;font-size:17px;line-height:1.6;"><b>Nghĩa:</b> ' + (w.meaningVi || w.meaning || '') + '</p>' +
        (w.usageNote ? '<div style="margin-top:10px;padding:12px;background:rgba(148,163,184,0.1);border-radius:10px;font-size:14px;"><b>Ghi chú cách dùng:</b> ' + w.usageNote + '</div>' : '') +
        (examples.length
          ? '<div style="margin-top:18px;"><h4 style="margin:0 0 8px 0;font-size:15px;">💬 Câu ví dụ:</h4>' +
            examples.slice(0, 6).map(function (ex) {
              var exAudio = ex.audio ? rewriteUrl(ex.audio) : '';
              return '<div style="padding:10px 12px;border-bottom:1px solid rgba(148,163,184,0.15);display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
                '<div><div style="font-size:16px;font-weight:700;">' + (ex.chinese || ex.hanzi || '') + '</div><div style="font-size:13px;color:#ea580c;">' + (ex.pinyin || '') + '</div><div style="font-size:14px;opacity:0.85;">' + (ex.vietnamese || ex.meaningVi || '') + '</div></div>' +
                (exAudio ? '<button onclick="new Audio(\'' + exAudio + '\').play()" style="background:rgba(234,88,12,0.12);color:#ea580c;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;font-weight:700;">🔊</button>' : '') +
              '</div>';
            }).join('') + '</div>'
          : '') +
      '</div>';
  }

  // Intercept clicks on dynamic character / vocabulary links so they open instantaneously
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var clean = BASE && href.indexOf(BASE) === 0 ? href.slice(BASE.length) : href;

    var charLink = clean.match(/^\/han-tu\/([^\/?#]+)/);
    if (charLink) {
      e.preventDefault();
      e.stopPropagation();
      showCharacterDetail(decodeURIComponent(charLink[1]));
      return;
    }

    var wordLink = clean.match(/^\/tu-vung\/([^\/?#]+)/);
    if (wordLink) {
      e.preventDefault();
      e.stopPropagation();
      showWordDetail(decodeURIComponent(wordLink[1]));
      return;
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    fixDomNode(document.documentElement);
  });
})();
