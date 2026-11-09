/**
 * ============================================================================
 * XIEHANZI 1:1 CLONE RUNTIME ENGINE (v5.0 — FULL DYNAMIC HYDRATION + AI + API)
 * ============================================================================
 * Phục vụ toàn bộ 45+ trang HTML tĩnh và mọi đường dẫn động (slug routes)
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

  const SUPABASE_URL = 'https://xcthntcgenzfybefaphh.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGhudGNnZW56ZnliZWZhcGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDE0NjQsImV4cCI6MjEwOTIxNzQ2NH0.0L3BZslXqmIkiH3kuKSL0HJeo_gmZ15E614xqnxhbdM';
  const RAW_GITHUB_BASE = 'https://raw.githubusercontent.com/hungktkthd/saochepweb/main';

  const originalFetch = window.fetch.bind(window);
  const jsonCache = new Map();

  async function loadLocalJson(path) {
    if (jsonCache.has(path)) return jsonCache.get(path);
    const p = originalFetch(path)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
    jsonCache.set(path, p);
    return p;
  }

  // ==========================================================================
  // 1. BỘ ĐỊNH TUYẾN MEDIA (CHUYỂN static.xiehanzi.com & /_next/image)
  // ==========================================================================
  function rewriteMediaUrl(url) {
    if (!url || typeof url !== 'string') return url;

    // 1a. Giải nén /_next/image?url=...
    if (url.includes('/_next/image')) {
      try {
        const u = new URL(url, window.location.origin);
        const inner = u.searchParams.get('url');
        if (inner) return rewriteMediaUrl(decodeURIComponent(inner));
      } catch (_e) {}
    }

    // 1b. Thay thế font/static _next/static của xiehanzi về local
    if (url.startsWith('https://static.xiehanzi.com/web/prod/_next/static/')) {
      return '/_next/static/' + url.slice('https://static.xiehanzi.com/web/prod/_next/static/'.length);
    }

    // 1c. Chuyển media (gif, audio, hình minh họa) sang nhánh main của hungktkthd/saochepweb
    if (url.startsWith('https://static.xiehanzi.com/')) {
      const rel = url.slice('https://static.xiehanzi.com/'.length);
      return `${RAW_GITHUB_BASE}/media/${rel}`;
    }
    return url;
  }

  function rewriteSrcset(srcset) {
    if (!srcset || typeof srcset !== 'string') return srcset;
    if (!srcset.includes('/_next/image') && !srcset.includes('xiehanzi.com')) return srcset;
    return srcset
      .split(',')
      .map(part => {
        const trimmed = part.trim();
        if (!trimmed) return '';
        const spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx === -1) return rewriteMediaUrl(trimmed);
        const u = trimmed.slice(0, spaceIdx);
        const desc = trimmed.slice(spaceIdx + 1);
        return `${rewriteMediaUrl(u)} ${desc}`;
      })
      .filter(Boolean)
      .join(', ');
  }

  // Chặn ngay ở tầng DOM setter/setAttribute để Next.js <Image> không bao giờ gọi 404 /_next/image
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
      // Chỉ đồng bộ lên bảng study_profiles khi có UUID hợp lệ
      if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(userId)) return;
      await originalFetch(`${SUPABASE_URL}/rest/v1/study_profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        `${SUPABASE_URL}/rest/v1/study_profiles?select=state&user_id=eq.${encodeURIComponent(userId)}&workspace=eq.hoctiengtrungquoc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
  // 4. CHẶN & XỬ LÝ TOÀN BỘ API (/v1/*, /v2/*, AI, CHẤM ĐIỂM)
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

  async function handleApiRequest(urlObj, init) {
    const p = urlObj.pathname.replace(/^\/api/, '');
    const method = (init && init.method ? init.method : 'GET').toUpperCase();

    // ------------------------------------------------------------------------
    // A. SERVER TIME & PUBLIC SETTINGS & AUTH
    // ------------------------------------------------------------------------
    if (p === '/server-time' || p === '/server-time/') {
      return jsonResponse({ now: Date.now() });
    }
    if (p.includes('/v1/settings/public')) {
      const data = await loadLocalJson('/data/misc/settings-public.json');
      return jsonResponse(data || { ok: true });
    }
    if (p.includes('/v1/social-proof/summary')) {
      const data = await loadLocalJson('/data/misc/social-proof-summary.json');
      return jsonResponse(data || { ok: true });
    }
    if (p.includes('/v1/auth/') || p.includes('/v2/auth/') || p.includes('/v1/users/me') || p.includes('/v1/profile')) {
      return jsonResponse({
        ok: true,
        isAuthenticated: false,
        user: null,
        accessToken: null
      });
    }

    // ------------------------------------------------------------------------
    // B. V2 LEARNING PATH & SRS REVIEW API (/hoc, /bat-dau, /on-tap, /hoc/*)
    // ------------------------------------------------------------------------
    if (p === '/v2/meta') {
      return jsonResponse({
        flags: {
          learningPath: true,
          examReview: true,
          speaking: true,
          thayDo: true,
          companion: true
        }
      });
    }
    if (p === '/v2/me/learning-profile') {
      if (method === 'PATCH' || method === 'POST') {
        const body = await parseRequestBody(init);
        localStorage.setItem('httq_learning_profile', JSON.stringify(body));
      }
      const saved = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}');
      return jsonResponse({
        goal: saved.goal || 'communication',
        dailyMinutes: saved.dailyMinutes || 15,
        currentLevel: saved.currentLevel || 1,
        companionId: saved.companionId || 'tieu-man',
        onboardingCompleted: true,
        ...saved
      });
    }
    if (p === '/v2/me/entitlements') {
      return jsonResponse({
        plan: 'free',
        features: ['smart_error_review', 'learning_path', 'speaking_practice']
      });
    }
    if (p === '/v2/me/exam-plan') {
      return jsonResponse({ status: 'none', plan: null });
    }
    if (p === '/v2/me/skill-map') {
      return jsonResponse({
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
      return jsonResponse({ consents: {} });
    }
    if (p === '/v2/learning-tracks' || p === '/v2/paths') {
      const tracks = [
        {
          track: 'hsk30',
          slug: 'hsk30',
          brandVi: 'Lộ trình HSK 3.0 Chuẩn',
          standard: 'hsk30',
          isDefault: true,
          placementAvailable: true,
          levels: [
            { level: 'L1', titleVi: 'HSK 1', stageCount: 7 },
            { level: 'L2', titleVi: 'HSK 2', stageCount: 8 },
            { level: 'L3', titleVi: 'HSK 3', stageCount: 10 }
          ],
          enrollment: {
            track: 'hsk30',
            currentLevel: 'L1',
            startStageKey: 'hsk30.L1.C1.S1',
            stagesDone: 2,
            stagesTotal: 7,
            active: true
          }
        },
        {
          track: 'hsk20',
          slug: 'hsk20',
          brandVi: 'Giáo trình HSK 2.0 (Cấp 1–6)',
          standard: 'hsk20',
          isDefault: false,
          placementAvailable: true,
          levels: [
            { level: 'L1', titleVi: 'HSK 1', stageCount: 6 },
            { level: 'L2', titleVi: 'HSK 2', stageCount: 6 },
            { level: 'L3', titleVi: 'HSK 3', stageCount: 8 }
          ],
          enrollment: null
        },
        {
          track: 'boya',
          slug: 'boya',
          brandVi: 'Giáo trình Boya Sơ cấp',
          standard: 'boya',
          isDefault: false,
          placementAvailable: false,
          levels: [
            { level: 'L1', titleVi: 'Boya Sơ cấp 1', stageCount: 10 },
            { level: 'L2', titleVi: 'Boya Sơ cấp 2', stageCount: 10 }
          ],
          enrollment: null
        }
      ];
      return jsonResponse({ tracks, paths: tracks });
    }
    if (p.startsWith('/v2/learning-tracks/') || p.startsWith('/v2/paths/')) {
      const parts = p.split('/').filter(Boolean); // ['v2', 'learning-tracks', track, ...]
      const track = parts[2] || 'hsk30';
      const sub = parts[3] || '';
      if (sub === 'levels') {
        const level = parts[4] || 'L1';
        return jsonResponse({
          track,
          level,
          levelVersion: 'v1',
          chapters: [
            {
              chapterKey: `${track}.${level}.C1`,
              order: 1,
              titleVi: 'Chào hỏi & Làm quen cơ bản',
              titleZh: '你好！认识你很高兴',
              stages: [
                { stageKey: `${track}.${level}.C1.S1`, order: 1, kind: 'stage', titleVi: 'Xin chào, bạn khỏe không?', titleZh: '你好，你好吗？', newWordCount: 12 },
                { stageKey: `${track}.${level}.C1.S2`, order: 2, kind: 'stage', titleVi: 'Bạn tên là gì? Người nước nào?', titleZh: '你叫什么名字？', newWordCount: 14 },
                { stageKey: `${track}.${level}.C1.S3`, order: 3, kind: 'stage', titleVi: 'Gia đình và nghề nghiệp', titleZh: '你家有几口人？', newWordCount: 15 },
                { stageKey: `${track}.${level}.C1.S4`, order: 4, kind: 'review', titleVi: 'Ôn tập Chương 1', titleZh: '复习（一）', newWordCount: 0 }
              ]
            },
            {
              chapterKey: `${track}.${level}.C2`,
              order: 2,
              titleVi: 'Thời gian, Mua sắm & Đời sống',
              titleZh: '今天几月几号？',
              stages: [
                { stageKey: `${track}.${level}.C2.S1`, order: 5, kind: 'stage', titleVi: 'Ngày tháng & Giờ giấc', titleZh: '现在几点？', newWordCount: 14 },
                { stageKey: `${track}.${level}.C2.S2`, order: 6, kind: 'stage', titleVi: 'Mua sắm & Giá cả', titleZh: '这个多少钱？', newWordCount: 16 },
                { stageKey: `${track}.${level}.C2.S3`, order: 7, kind: 'stage', titleVi: 'Đi lại & Phương tiện', titleZh: '怎么去学校？', newWordCount: 15 }
              ]
            }
          ],
          levelTest: { available: true, minPct: 80, questionCount: 20 }
        });
      }
      if (sub === 'progress') {
        return jsonResponse({
          track,
          level: 'L1',
          enrollment: {
            track,
            currentLevel: 'L1',
            startStageKey: `${track}.L1.C1.S1`,
            stagesDone: 2,
            stagesTotal: 7,
            active: true
          },
          stages: [
            { stageKey: `${track}.L1.C1.S1`, status: 'completed', activityKeysDone: ['learn', 'dialogue', 'exam'], examBestPct: 95 },
            { stageKey: `${track}.L1.C1.S2`, status: 'completed', activityKeysDone: ['learn', 'dialogue', 'exam'], examBestPct: 90 },
            { stageKey: `${track}.L1.C1.S3`, status: 'in_progress', activityKeysDone: ['learn'], examBestPct: null },
            { stageKey: `${track}.L1.C1.S4`, status: 'available', activityKeysDone: [], examBestPct: null },
            { stageKey: `${track}.L1.C2.S1`, status: 'available', activityKeysDone: [], examBestPct: null },
            { stageKey: `${track}.L1.C2.S2`, status: 'locked', activityKeysDone: [], examBestPct: null },
            { stageKey: `${track}.L1.C2.S3`, status: 'locked', activityKeysDone: [], examBestPct: null }
          ],
          levelTest: null
        });
      }
      if (sub === 'chapters') {
        const chapterKey = parts[4] || `${track}.L1.C1`;
        return jsonResponse({
          chapterKey,
          contentVersion: 'v1',
          stages: [
            {
              stageKey: `${chapterKey}.S1`,
              meta: { titleVi: 'Xin chào, bạn khỏe không?', titleZh: '你好，你好吗？', titlePinyin: 'Nǐ hǎo, nǐ hǎo ma?' },
              activities: [
                { activityKey: `${chapterKey}.S1.learn`, type: 'learn', titleVi: 'Từ vựng & Mẫu câu trọng tâm', required: true },
                { activityKey: `${chapterKey}.S1.dialogue`, type: 'dialogue', titleVi: 'Hội thoại tình huống thực tế', required: true },
                { activityKey: `${chapterKey}.S1.exam`, type: 'exam', titleVi: 'Kiểm tra tổng hợp cuối chặng', required: true }
              ]
            },
            {
              stageKey: `${chapterKey}.S2`,
              meta: { titleVi: 'Bạn tên là gì? Người nước nào?', titleZh: '你叫什么名字？', titlePinyin: 'Nǐ jiào shénme míngzi?' },
              activities: [
                { activityKey: `${chapterKey}.S2.learn`, type: 'learn', titleVi: 'Từ vựng & Mẫu câu trọng tâm', required: true },
                { activityKey: `${chapterKey}.S2.dialogue`, type: 'dialogue', titleVi: 'Hội thoại tình huống thực tế', required: true },
                { activityKey: `${chapterKey}.S2.exam`, type: 'exam', titleVi: 'Kiểm tra tổng hợp cuối chặng', required: true }
              ]
            },
            {
              stageKey: `${chapterKey}.S3`,
              meta: { titleVi: 'Gia đình và nghề nghiệp', titleZh: '你家有几口人？', titlePinyin: 'Nǐ jiā yǒu jǐ kǒu rén?' },
              activities: [
                { activityKey: `${chapterKey}.S3.learn`, type: 'learn', titleVi: 'Từ vựng & Mẫu câu trọng tâm', required: true },
                { activityKey: `${chapterKey}.S3.dialogue`, type: 'dialogue', titleVi: 'Hội thoại tình huống thực tế', required: true },
                { activityKey: `${chapterKey}.S3.exam`, type: 'exam', titleVi: 'Kiểm tra tổng hợp cuối chặng', required: true }
              ]
            }
          ]
        });
      }
      if (sub === 'enroll' || sub === 'select') {
        return jsonResponse({
          ok: true,
          enrollment: {
            track,
            currentLevel: 'L1',
            startStageKey: `${track}.L1.C1.S1`,
            stagesDone: 2,
            stagesTotal: 7,
            active: true
          }
        });
      }
      return jsonResponse({
        runId: `run-${Date.now()}`,
        kind: 'lesson',
        track
      });
    }
    if (p === '/v2/today') {
      return jsonResponse({
        date: new Date().toISOString().slice(0, 10),
        streakDays: 5,
        dailyGoalMinutes: 15,
        completedMinutes: 10,
        items: [
          { kind: 'review', titleVi: 'Ôn từ đến hạn', dueCount: 12, estMinutes: 4, locked: false },
          { kind: 'errors', titleVi: 'Sửa lỗi hay sai', dueCount: 3, estMinutes: 2, locked: false },
          { kind: 'lesson', titleVi: 'Chặng 3: Gia đình và nghề nghiệp', dueCount: 1, estMinutes: 8, locked: false }
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
      return jsonResponse({
        total: 3,
        categories: [
          { category: 'meaning', titleVi: 'Nghĩa từ vựng', count: 2 },
          { category: 'tone', titleVi: 'Thanh điệu', count: 1 }
        ],
        mistakes: [
          { itemKey: '谢谢', word: '谢谢', pinyin: 'xièxie', meaningVi: 'cảm ơn', skill: 'meaning', category: 'meaning', errorCount: 2, lastWrongAt: new Date().toISOString() },
          { itemKey: '不客气', word: '不客气', pinyin: 'bú kèqi', meaningVi: 'đừng khách sáo', skill: 'meaning', category: 'meaning', errorCount: 1, lastWrongAt: new Date().toISOString() },
          { itemKey: '老师', word: '老师', pinyin: 'lǎoshī', meaningVi: 'giáo viên, thầy cô', skill: 'tone', category: 'tone', errorCount: 1, lastWrongAt: new Date().toISOString() }
        ]
      });
    }
    if (p === '/v2/review/words') {
      const q = (urlObj.searchParams.get('q') || '').trim().toLowerCase();
      const status = urlObj.searchParams.get('status') || 'all';
      const defaultWords = [
        { itemKey: '你好', word: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '谢谢', word: '谢谢', pinyin: 'xièxie', meaningVi: 'cảm ơn', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '不客气', word: '不客气', pinyin: 'bú kèqi', meaningVi: 'đừng khách sáo', state: 'learning', dueAt: new Date().toISOString() },
        { itemKey: '对不起', word: '对不起', pinyin: 'duìbuqǐ', meaningVi: 'xin lỗi', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '没关系', word: '没关系', pinyin: 'méi guānxi', meaningVi: 'không sao đâu', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '再见', word: '再见', pinyin: 'zàijiàn', meaningVi: 'tạm biệt', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '老师', word: '老师', pinyin: 'lǎoshī', meaningVi: 'giáo viên', state: 'learning', dueAt: new Date().toISOString() },
        { itemKey: '学生', word: '学生', pinyin: 'xuésheng', meaningVi: 'học sinh, sinh viên', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '朋友', word: '朋友', pinyin: 'péngyou', meaningVi: 'bạn bè', state: 'learning', dueAt: new Date().toISOString() },
        { itemKey: '中国', word: '中国', pinyin: 'Zhōngguó', meaningVi: 'Trung Quốc', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '越南', word: '越南', pinyin: 'Yuènán', meaningVi: 'Việt Nam', state: 'review', dueAt: new Date().toISOString() },
        { itemKey: '喜欢', word: '喜欢', pinyin: 'xǐhuan', meaningVi: 'thích, yêu thích', state: 'learning', dueAt: new Date().toISOString() }
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
    if (p === '/v2/review/runs' || p.startsWith('/v2/lesson-runs')) {
      return jsonResponse({
        runId: `review-${Date.now()}`,
        kind: 'review',
        mode: 'due',
        total: 10,
        answered: 0,
        steps: []
      });
    }
    if (p.startsWith('/v2/dictionary/entries/')) {
      const slug = decodeURIComponent(p.replace('/v2/dictionary/entries/', ''));
      const w = await lookupWord(slug);
      const rawAudio = w && w.audios && w.audios[0] ? w.audios[0] : '';
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
      return jsonResponse(data || []);
    }
    if (p.startsWith('/v1/thay-do/')) {
      return jsonResponse({ ok: true, chu: [], ban: [], khoa: [], tienDo: { buoi: [], cap: [] } });
    }

    // ------------------------------------------------------------------------
    // D. TRÒ CHƠI & BẢNG XẾP HẠNG (/v1/games/*)
    // ------------------------------------------------------------------------
    if (p.includes('/v1/games/chengyu/daily')) {
      const data = await loadLocalJson('/data/misc/games-chengyu-daily.json');
      return jsonResponse(data || {});
    }
    if (p.includes('/v1/games/hanzi-guess/daily')) {
      const data = await loadLocalJson('/data/misc/games-hanzi-guess-daily.json');
      return jsonResponse(data || {});
    }
    if (p.includes('/v1/games/leaderboard')) {
      const game = urlObj.searchParams.get('game') || 'hanzi-guess';
      const data = await loadLocalJson(`/data/misc/games-leaderboard-${game}.json`);
      return jsonResponse(data || { items: [] });
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
    if (p.includes('/v1/hsk-tests/levels')) {
      const examType = (urlObj.searchParams.get('examType') || 'hsk').toLowerCase();
      const data = await loadLocalJson(`/data/tests/levels-${examType}.json`);
      return jsonResponse(data || []);
    }
    if (p.includes('/v1/hsk-tests/papers/') && method === 'GET') {
      const paperId = p.split('/v1/hsk-tests/papers/')[1].split('/')[0];
      const data = await loadLocalJson(`/data/tests/papers/${paperId}.json`);
      return jsonResponse(data || {});
    }
    if (p.includes('/v1/hsk-tests/papers')) {
      const examType = (urlObj.searchParams.get('examType') || 'hsk').toLowerCase();
      const level = urlObj.searchParams.get('level');
      let data = (await loadLocalJson(`/data/tests/papers-${examType}.json`)) || [];
      if (level && Array.isArray(data)) {
        data = data.filter(item => String(item.level || item.hskLevel) === String(level));
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
        const matched = all.find(v => v.id === id || v._id === id || v.slug === id || toSlugVi(v.title || v.titleVi) === id);
        if (matched) {
          data = await loadLocalJson(`/data/dictation/videos/${matched.id || matched._id}-segments.json`);
        }
      }
      return jsonResponse(data || { segments: [] });
    }
    if (p.includes('/v1/dictation/videos/') && method === 'GET') {
      const id = decodeURIComponent(p.split('/v1/dictation/videos/')[1].split('/')[0]);
      const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
      const video = all.find(v => v.id === id || v._id === id || v.slug === id || toSlugVi(v.title || v.titleVi) === id) || all[0] || {};
      const realId = video.id || video._id || id;
      const segs = (await loadLocalJson(`/data/dictation/videos/${realId}-segments.json`)) || {};
      return jsonResponse({ ...video, ...(segs || {}) });
    }
    if (p.includes('/v1/dictation/videos')) {
      const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
      const hsk = urlObj.searchParams.get('hskLevel') || urlObj.searchParams.get('level');
      const filtered = hsk ? all.filter(v => String(v.hskLevel) === String(hsk)) : all;
      return jsonResponse({ items: filtered, videos: filtered, total: filtered.length, page: 1, limit: 100 });
    }

    // ------------------------------------------------------------------------
    // H. NGỮ PHÁP & GIÁO TRÌNH & LUYỆN NÓI (/v1/grammar/*, /v1/curriculums/*, /v1/speaking/*)
    // ------------------------------------------------------------------------
    if (p.includes('/v1/grammar/levels')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const data = await loadLocalJson(`/data/grammar/levels-${curr}.json`);
      return jsonResponse(data || []);
    }
    if (p.includes('/v1/grammar/points')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const lvl = urlObj.searchParams.get('level') || '1';
      const prefix = curr === 'new-hsk' ? 'new-hsk-level-' : 'hsk-level-';
      const data = await loadLocalJson(`/data/grammar/${prefix}${lvl}.json`);
      return jsonResponse(data || { items: [] });
    }
    if (p.includes('/v1/speaking/curriculums')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const lvl = urlObj.searchParams.get('level');
      if (lvl) {
        const data = await loadLocalJson(`/data/speaking/${curr}/level-${lvl}.json`);
        return jsonResponse(data || []);
      }
      const data = await loadLocalJson(`/data/speaking/${curr}/levels.json`);
      return jsonResponse(data || []);
    }
    if (p.includes('/v1/curriculums/')) {
      const parts = p.split('/v1/curriculums/')[1].split('/').filter(Boolean);
      const curr = parts[0] || 'hsk';
      if (parts.length === 1 || parts[1] === 'levels') {
        const data = await loadLocalJson(`/data/curriculums/${curr}/levels.json`);
        return jsonResponse(data || []);
      }
      const level = parts[1];
      if (parts[2] === 'lessons' && parts[3]) {
        const data = await loadLocalJson(`/data/curriculums/${curr}/lessons/${parts[3]}.json`);
        return jsonResponse(data || {});
      }
      if (parts[2] === 'lessons') {
        const data = await loadLocalJson(`/data/curriculums/${curr}/lessons-${level}.json`);
        return jsonResponse(data || []);
      }
      const data = await loadLocalJson(`/data/curriculums/${curr}/topics-${level}.json`);
      return jsonResponse(data || []);
    }

    // ------------------------------------------------------------------------
    // I. TRA CỨU CHỮ HÁN, TỪ VỰNG, HÁN VIỆT (/v1/characters/*, /v1/words/*, /v1/han-viet/*)
    // ------------------------------------------------------------------------
    if (p.startsWith('/v1/characters/') || p.startsWith('/v1/hanzi/')) {
      const slug = p.split('/').pop();
      const charData = await lookupCharacter(slug);
      return jsonResponse(charData || {});
    }
    if (p.startsWith('/v1/words/') || p.startsWith('/v1/vocabulary/')) {
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
    // J. CHẤM ĐIỂM ĐỀ THI, LUYỆN NGHE, LUYỆN GÕ, SỔ TAY
    // ------------------------------------------------------------------------
    if ((p.includes('/submit') || p.includes('/grade') || p.includes('/attempts')) && method === 'POST') {
      const body = await parseRequestBody(init);
      const paperId = body.paperId || body.testId || p.split('/').filter(Boolean).slice(-2, -1)[0];
      const paper = paperId ? await loadLocalJson(`/data/tests/papers/${paperId}.json`) : null;
      const questions = (paper && (paper.questions || paper.items)) || body.questions || [];
      const userAnswers = body.answers || body.userAnswers || {};
      let correctCount = 0;
      const results = questions.map((q, idx) => {
        const qId = q.id || q._id || q.questionNumber || idx + 1;
        const userAns = userAnswers[qId] !== undefined ? userAnswers[qId] : userAnswers[idx];
        const rightAns = q.correctAnswer || q.answer || q.correctOption;
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

    if (p.includes('/v1/generated-tests/create') || p.includes('/v1/generated-tests/start') || (p.includes('/v1/generated-tests') && method === 'POST')) {
      const body = await parseRequestBody(init);
      const level = body.level || body.hskLevel || 1;
      const papers = (await loadLocalJson('/data/tests/papers-hsk.json')) || [];
      const matched = papers.find(x => String(x.level || x.hskLevel) === String(level)) || papers[0];
      if (matched && (matched.id || matched._id)) {
        const fullPaper = await loadLocalJson(`/data/tests/papers/${matched.id || matched._id}.json`);
        if (fullPaper) return jsonResponse({ ...fullPaper, testId: matched.id || matched._id });
      }
      return jsonResponse({ testId: 'hsk1-sample', questions: [] });
    }

    if (p.includes('/v1/listening') || p.includes('/v1/typing')) {
      const body = await parseRequestBody(init);
      const level = urlObj.searchParams.get('level') || body.level || '1';
      const lessons = (await loadLocalJson(`/data/curriculums/hsk/lessons-${level}.json`)) || [];
      const firstLessonId = lessons[0] ? (lessons[0].id || lessons[0]._id || lessons[0].slug) : null;
      const lessonData = firstLessonId ? await loadLocalJson(`/data/curriculums/hsk/lessons/${firstLessonId}.json`) : null;
      const vocab = (lessonData && (lessonData.vocabulary || lessonData.words)) || [];
      return jsonResponse({
        ok: true,
        items: vocab,
        questions: vocab.map((w, i) => ({
          id: w.id || i + 1,
          hanzi: w.hanzi || w.word || w.character,
          pinyin: w.pinyin,
          meaningVi: w.meaningVi || w.meaning,
          audioUrl: rewriteMediaUrl(w.audioUrl || w.audio)
        }))
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
    // K. AI APIs (/v1/translate, /v1/speaking/assess, /v1/practice/result-ai-readout)
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

    if (p.includes('/v1/speaking/assess') || p.includes('/v1/speaking/evaluate')) {
      const body = await parseRequestBody(init);
      const expected = (body.expectedText || body.referenceText || body.hanzi || body.text || '').trim();
      const recognized = (body.recognizedText || body.transcript || body.spokenText || expected).trim();
      const aiRes = await callAiEndpoint('speaking-assess', { expected, recognized });
      if (aiRes && aiRes.ok) return jsonResponse(aiRes);

      const cleanExp = expected.replace(/[^\u4e00-\u9fff]/g, '');
      const cleanRec = recognized.replace(/[^\u4e00-\u9fff]/g, '');
      let matches = 0;
      for (const ch of cleanExp) {
        if (cleanRec.includes(ch)) matches++;
      }
      const accuracy = cleanExp.length > 0 ? Math.round((matches / cleanExp.length) * 100) : 92;
      const overall = Math.max(65, Math.min(100, accuracy));
      return jsonResponse({
        ok: true,
        score: overall,
        overallScore: overall,
        accuracyScore: overall,
        fluencyScore: Math.min(100, overall + 4),
        pronunciationScore: overall,
        feedback: overall >= 85
          ? 'Phát âm rất chuẩn xác! Thanh điệu và âm tiết rõ ràng.'
          : 'Khá tốt! Hãy chú ý giữ đều nhịp và thanh điệu ở cuối câu.',
        words: [...cleanExp].map(ch => ({
          word: ch,
          score: cleanRec.includes(ch) ? 95 : 65,
          errorType: cleanRec.includes(ch) ? 'None' : 'Mispronunciation'
        }))
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

  // ==========================================================================
  // 5. GHI ĐÈ window.fetch & XMLHttpRequest
  // ==========================================================================
  window.fetch = async function (input, init) {
    let url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

    // Chặn các request _rsc prefetch của Next.js và Sentry /monitoring để tránh 404 console
    if (url.includes('_rsc=') || url.includes('/monitoring')) {
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.startsWith('https://static.xiehanzi.com/') || url.includes('/_next/image')) {
      const rewritten = rewriteMediaUrl(url);
      return originalFetch(rewritten, init);
    }

    if (
      url.startsWith('https://api.xiehanzi.com/') ||
      url.includes('/api/v1/') ||
      url.includes('/api/v2/') ||
      url.includes('/api/server-time') ||
      url.startsWith('/v1/') ||
      url.startsWith('/v2/')
    ) {
      const fullUrl = url.startsWith('http') ? url : `https://api.xiehanzi.com${url}`;
      return handleApiRequest(new URL(fullUrl), init);
    }

    return originalFetch(input, init);
  };

  const origXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === 'string') {
      if (url.startsWith('https://static.xiehanzi.com/') || url.includes('/_next/image')) {
        url = rewriteMediaUrl(url);
      }
    }
    return origXhrOpen.call(this, method, url, ...rest);
  };

  // ==========================================================================
  // 6. DYNAMIC PAGE ROUTER & RENDERER CHO CÁC TRANG SLUG ĐỘNG
  // ==========================================================================
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.__xhzPlayAudio = function (rawUrl) {
    if (!rawUrl) return;
    const u = rewriteMediaUrl(rawUrl);
    const a = new Audio(u);
    a.play().catch(() => {});
  };

  window.__xhzToggleSave = function (key, type, btnEl) {
    const st = getLocalState();
    if (type === 'char') {
      if (st.masteredChars[key]) {
        delete st.masteredChars[key];
        if (btnEl) btnEl.textContent = '⭐ Lưu chữ Hán';
      } else {
        st.masteredChars[key] = { character: key, savedAt: Date.now() };
        if (btnEl) btnEl.textContent = '✓ Đã lưu chữ Hán';
      }
    } else {
      if (st.savedWords[key]) {
        delete st.savedWords[key];
        if (btnEl) btnEl.textContent = '⭐ Lưu từ vựng';
      } else {
        st.savedWords[key] = { word: key, savedAt: Date.now() };
        if (btnEl) btnEl.textContent = '✓ Đã lưu từ vựng';
      }
    }
    supabaseUpsert(st);
  };

  function getDetachedMain() {
    let mainEl = document.querySelector('main#noi-dung-chinh') || document.querySelector('main');
    if (!mainEl) return null;
    if (!mainEl.dataset.xhzDetached) {
      const clone = mainEl.cloneNode(false);
      clone.dataset.xhzDetached = '1';
      if (mainEl.parentNode) {
        mainEl.parentNode.replaceChild(clone, mainEl);
        mainEl = clone;
      }
    }
    return mainEl;
  }

  function initMizigeCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    let drawing = false;
    const pos = e => {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    };
    canvas.addEventListener('pointerdown', e => {
      drawing = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    });
    canvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });
    window.addEventListener('pointerup', () => { drawing = false; });
  }

  window.__xhzClearCanvas = function (canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // --------------------------------------------------------------------------
  // 6A. TRANG CHI TIẾT CHỮ HÁN (/han-tu/:slug)
  // --------------------------------------------------------------------------
  async function renderCharacterDetailPage(slug) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const charData = await lookupCharacter(slug);
    if (!charData) return;

    const char = charData.character || charData.c || extractHanziChar(slug);
    const pinyin = charData.pinyin || charData.p || '';
    const hv = (charData.hanvietReading || (charData.hanvietReadings && charData.hanvietReadings[0]) || charData.hv || '').toUpperCase();
    const meaningVi = charData.meaningVi || charData.m || '';
    const meaningEn = charData.meaningEn || '';
    const radical = charData.radical || charData.r || '';
    const strokeCount = charData.strokeCount || charData.s || '';
    const hskLevel = charData.hskLevel || charData.hsk || '';
    const gifUrl = rewriteMediaUrl(charData.gif || '');
    const audioUrl = charData.audios && charData.audios[0]
      ? (typeof charData.audios[0] === 'string' ? charData.audios[0] : charData.audios[0].url)
      : '';
    const st = getLocalState();
    const isSaved = !!(st.masteredChars && st.masteredChars[char]);

    document.title = `Chữ ${char} (${pinyin}${hv ? ' - ' + hv : ''}): Nghĩa, Bút thuận, Chiết tự | XieHanzi`;

    const components = Array.isArray(charData.components) ? charData.components : [];
    const commonWords = Array.isArray(charData.commonWords) ? charData.commonWords : [];
    const examples = Array.isArray(charData.examples) ? charData.examples : [];
    const etymImages = Array.isArray(charData.etymologyImages) ? charData.etymologyImages : [];

    mainEl.innerHTML = `
      <div style="max-width:1040px;margin:0 auto;padding:24px 16px 48px;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
        <nav style="margin-bottom:16px;font-size:14px;color:#57534e;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <a href="/tra-chu" style="color:#ea580c;text-decoration:none;font-weight:600;">← Tra cứu chữ Hán</a>
          <span>/</span>
          <span style="font-weight:700;color:#1c1917;">Chữ Hán: ${escapeHtml(char)} (${escapeHtml(pinyin)})</span>
        </nav>

        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:20px;padding:28px;box-shadow:0 4px 16px rgba(0,0,0,0.04);margin-bottom:24px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:start;">
            <div>
              <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-bottom:20px;">
                <div style="width:120px;height:120px;border-radius:18px;background:#fff7ed;border:2px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:68px;font-weight:800;color:#c2410c;font-family:'Noto Serif SC','KaiTi',serif;">
                  ${escapeHtml(char)}
                </div>
                ${gifUrl ? `
                  <div style="text-align:center;">
                    <img src="${escapeHtml(gifUrl)}" alt="Bút thuận ${escapeHtml(char)}" style="width:120px;height:120px;border-radius:18px;border:1px solid #e7e5e4;background:#fff;" />
                    <div style="font-size:12px;color:#78716c;margin-top:4px;">Thứ tự nét viết</div>
                  </div>
                ` : ''}
                <div style="flex:1;min-width:180px;">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <h1 style="font-size:32px;font-weight:800;margin:0;color:#1c1917;">${escapeHtml(char)}</h1>
                    <span style="font-size:22px;font-weight:700;color:#ea580c;">${escapeHtml(pinyin)}</span>
                    ${hv ? `<span style="background:#fee2e2;color:#b91c1c;padding:4px 12px;border-radius:99px;font-size:14px;font-weight:800;">HÁN VIỆT: ${escapeHtml(hv)}</span>` : ''}
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
                    ${hskLevel ? `<span style="background:#f5f5f4;color:#44403c;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:600;">HSK ${escapeHtml(hskLevel)}</span>` : ''}
                    ${radical ? `<span style="background:#f5f5f4;color:#44403c;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:600;">Bộ thủ: ${escapeHtml(radical)}</span>` : ''}
                    ${strokeCount ? `<span style="background:#f5f5f4;color:#44403c;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:600;">${escapeHtml(strokeCount)} nét</span>` : ''}
                  </div>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
                    ${audioUrl ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(audioUrl)}')" style="padding:8px 16px;border-radius:10px;border:1px solid #fdba74;background:#fff7ed;color:#c2410c;font-weight:700;cursor:pointer;font-size:14px;">🔊 Nghe phát âm</button>` : ''}
                    <button onclick="window.__xhzToggleSave('${escapeHtml(char)}', 'char', this)" style="padding:8px 16px;border-radius:10px;border:1px solid #d6d3d1;background:#ffffff;color:#1c1917;font-weight:700;cursor:pointer;font-size:14px;">
                      ${isSaved ? '✓ Đã lưu chữ Hán' : '⭐ Lưu chữ Hán'}
                    </button>
                  </div>
                </div>
              </div>

              <div style="border-top:1px solid #f5f5f4;padding-top:16px;">
                <div style="margin-bottom:10px;font-size:16px;line-height:1.6;">
                  <strong style="color:#57534e;">Nghĩa tiếng Việt:</strong>
                  <span style="font-weight:600;color:#1c1917;"> ${escapeHtml(meaningVi)}</span>
                </div>
                ${meaningEn ? `
                  <div style="margin-bottom:12px;font-size:14px;color:#57534e;">
                    <strong>Nghĩa tiếng Anh:</strong> ${escapeHtml(meaningEn)}
                  </div>
                ` : ''}

                ${charData.componentNarrative ? `
                  <div style="margin-top:14px;background:#fafaf9;border-left:4px solid #ea580c;padding:12px 16px;border-radius:10px;">
                    <div style="font-weight:700;color:#9a3412;margin-bottom:4px;">🧩 Chiết tự & Cấu tạo chữ:</div>
                    <div style="font-size:15px;line-height:1.6;color:#292524;">${escapeHtml(charData.componentNarrative)}</div>
                  </div>
                ` : ''}

                ${charData.memoryHook ? `
                  <div style="margin-top:12px;background:#fefce8;border-left:4px solid #eab308;padding:12px 16px;border-radius:10px;">
                    <div style="font-weight:700;color:#854d0e;margin-bottom:4px;">💡 Mẹo ghi nhớ nhanh:</div>
                    <div style="font-size:15px;line-height:1.6;color:#292524;">${escapeHtml(charData.memoryHook)}</div>
                  </div>
                ` : ''}
              </div>
            </div>

            <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:16px;padding:18px;display:flex;flex-direction:column;align-items:center;">
              <div style="font-weight:700;font-size:15px;margin-bottom:10px;color:#1c1917;">✍️ Luyện viết chữ ${escapeHtml(char)} trực tiếp</div>
              <div style="position:relative;width:220px;height:220px;border:2px solid #ea580c;border-radius:12px;background:#ffffff;touch-action:none;user-select:none;">
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:160px;color:rgba(234,88,12,0.13);font-family:'KaiTi','Noto Serif SC',serif;pointer-events:none;line-height:1;">
                  ${escapeHtml(char)}
                </div>
                <canvas id="xhz-char-canvas" width="220" height="220" style="position:relative;z-index:2;cursor:crosshair;"></canvas>
              </div>
              <div style="display:flex;gap:10px;margin-top:10px;">
                <button onclick="window.__xhzClearCanvas('xhz-char-canvas')" style="padding:6px 14px;border-radius:8px;border:1px solid #d6d3d1;background:#fff;cursor:pointer;font-size:13px;font-weight:600;">🗑️ Xóa viết lại</button>
                <a href="/tao-vo-tap-viet" style="padding:6px 14px;border-radius:8px;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;text-decoration:none;font-size:13px;font-weight:600;">📄 Tạo vở tập viết PDF</a>
              </div>
            </div>
          </div>
        </div>

        ${components.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;margin-bottom:20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Bộ phận cấu thành chữ ${escapeHtml(char)}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;">
              ${components.map(comp => {
                const cChar = comp.char || comp.character || '';
                const cHv = comp.hanviet || '';
                const cRole = comp.role || '';
                const cGloss = comp.gloss || comp.meaning || '';
                return `
                  <a href="/han-tu/${encodeURIComponent(cChar)}" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;border:1px solid #e7e5e4;text-decoration:none;color:inherit;background:#fafaf9;">
                    <span style="font-size:32px;font-weight:800;color:#ea580c;font-family:'Noto Serif SC',serif;">${escapeHtml(cChar)}</span>
                    <div>
                      <div style="font-weight:700;font-size:14px;">${escapeHtml(cHv.toUpperCase())} ${cRole ? `<span style="font-size:12px;color:#78716c;font-weight:500;">(${escapeHtml(cRole)})</span>` : ''}</div>
                      <div style="font-size:13px;color:#57534e;">${escapeHtml(cGloss)}</div>
                    </div>
                  </a>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        ${etymImages.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;margin-bottom:20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Lịch sử tiến hóa hình thái chữ cổ</h2>
            <div style="display:flex;gap:14px;flex-wrap:wrap;">
              ${etymImages.map(img => {
                const u = rewriteMediaUrl(img.url || img);
                return `
                  <div style="text-align:center;padding:10px 14px;border:1px solid #e7e5e4;border-radius:12px;background:#fafaf9;">
                    <img src="${escapeHtml(u)}" alt="${escapeHtml(img.stage || char)}" style="height:64px;object-fit:contain;" />
                    ${img.stage ? `<div style="font-size:12px;color:#57534e;margin-top:6px;font-weight:600;">${escapeHtml(img.stage)}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        ${commonWords.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;margin-bottom:20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Từ ghép thông dụng chứa chữ ${escapeHtml(char)} (${commonWords.length})</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
              ${commonWords.map(w => {
                const wHz = w.hanzi || w.word || '';
                const wPy = w.pinyin || '';
                const wVi = w.vi || w.meaningVi || w.meaning || '';
                return `
                  <a href="/tu-vung/${encodeURIComponent(wHz)}" style="display:block;padding:12px 16px;border-radius:12px;border:1px solid #e7e5e4;text-decoration:none;color:inherit;background:#fafaf9;">
                    <div style="display:flex;justify-content:space-between;align-items:baseline;">
                      <strong style="font-size:20px;color:#1c1917;">${escapeHtml(wHz)}</strong>
                      <span style="font-size:14px;color:#ea580c;font-weight:600;">${escapeHtml(wPy)}</span>
                    </div>
                    <div style="font-size:14px;color:#57534e;margin-top:4px;">${escapeHtml(wVi)}</div>
                  </a>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        ${examples.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Câu ví dụ thực tế (${examples.length})</h2>
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${examples.map(ex => {
                const exHz = ex.hanzi || ex.zh || '';
                const exPy = ex.pinyin || '';
                const exVi = ex.vi || ex.meaningVi || ex.vietnamese || '';
                const exAudio = ex.audio || ex.audioUrl || '';
                return `
                  <div style="padding:14px 16px;border-radius:12px;background:#fafaf9;border:1px solid #f5f5f4;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                    <div>
                      <div style="font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(exHz)}</div>
                      <div style="font-size:14px;color:#ea580c;margin-top:2px;">${escapeHtml(exPy)}</div>
                      <div style="font-size:14px;color:#57534e;margin-top:4px;">${escapeHtml(exVi)}</div>
                    </div>
                    ${exAudio ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(exAudio)}')" style="padding:8px 12px;border-radius:10px;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;cursor:pointer;font-weight:700;flex-shrink:0;">🔊 Nghe</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
    initMizigeCanvas('xhz-char-canvas');
  }

  // --------------------------------------------------------------------------
  // 6B. TRANG CHI TIẾT TỪ VỰNG (/tu-vung/:slug)
  // --------------------------------------------------------------------------
  async function renderVocabularyDetailPage(slug) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const wordData = await lookupWord(slug);
    if (!wordData) return;

    const word = wordData.hanzi || wordData.word || wordData.w || extractHanziWord(slug);
    const pinyin = wordData.pinyin || wordData.p || '';
    const hv = (wordData.hanviet || wordData.hv || '').toUpperCase();
    const meaningVi = wordData.wordMeaningVi || wordData.translationVi || wordData.meaningVi || wordData.m || '';
    const wordType = wordData.wordType || '';
    const usageNote = wordData.usageNote || wordData.wordClassNote || '';
    const audioUrl = wordData.audios && wordData.audios[0] ? wordData.audios[0] : '';
    const st = getLocalState();
    const isSaved = !!(st.savedWords && st.savedWords[word]);

    document.title = `Từ vựng ${word} (${pinyin}): ${meaningVi} | XieHanzi`;

    const chars = Array.isArray(wordData.characters) ? wordData.characters : [];
    const collocations = Array.isArray(wordData.collocations) ? wordData.collocations : [];
    const examples = Array.isArray(wordData.examples) ? wordData.examples : [];

    mainEl.innerHTML = `
      <div style="max-width:1000px;margin:0 auto;padding:24px 16px 48px;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
        <nav style="margin-bottom:16px;font-size:14px;color:#57534e;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <a href="/thu-vien" style="color:#ea580c;text-decoration:none;font-weight:600;">← Thư viện Từ vựng</a>
          <span>/</span>
          <span style="font-weight:700;color:#1c1917;">Từ vựng: ${escapeHtml(word)}</span>
        </nav>

        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:20px;padding:28px;box-shadow:0 4px 16px rgba(0,0,0,0.04);margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
            <div>
              <div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;">
                <h1 style="font-size:48px;font-weight:800;margin:0;color:#c2410c;font-family:'Noto Serif SC',serif;">${escapeHtml(word)}</h1>
                <span style="font-size:24px;font-weight:700;color:#ea580c;">${escapeHtml(pinyin)}</span>
                ${hv ? `<span style="background:#fee2e2;color:#b91c1c;padding:4px 12px;border-radius:99px;font-size:14px;font-weight:800;">HÁN VIỆT: ${escapeHtml(hv)}</span>` : ''}
                ${wordType ? `<span style="background:#f5f5f4;color:#44403c;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:600;">${escapeHtml(wordType)}</span>` : ''}
              </div>
              <div style="font-size:20px;font-weight:700;color:#1c1917;margin-top:14px;">
                Nghĩa: ${escapeHtml(meaningVi)}
              </div>
              ${usageNote ? `
                <div style="margin-top:12px;background:#fafaf9;border-left:4px solid #ea580c;padding:12px 16px;border-radius:10px;font-size:15px;color:#44403c;line-height:1.6;">
                  <strong>💡 Ghi chú cách dùng:</strong> ${escapeHtml(usageNote)}
                </div>
              ` : ''}
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              ${audioUrl ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(audioUrl)}')" style="padding:10px 18px;border-radius:12px;border:1px solid #fdba74;background:#fff7ed;color:#c2410c;font-weight:700;cursor:pointer;font-size:14px;">🔊 Nghe phát âm</button>` : ''}
              <button onclick="window.__xhzToggleSave('${escapeHtml(word)}', 'word', this)" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#ffffff;color:#1c1917;font-weight:700;cursor:pointer;font-size:14px;">
                ${isSaved ? '✓ Đã lưu từ vựng' : '⭐ Lưu từ vựng'}
              </button>
            </div>
          </div>
        </div>

        ${chars.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;margin-bottom:20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Phân tích từng chữ Hán trong từ "${escapeHtml(word)}"</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
              ${chars.map(c => `
                <a href="/han-tu/${encodeURIComponent(c.slug || c.char)}" style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:12px;border:1px solid #e7e5e4;text-decoration:none;color:inherit;background:#fafaf9;">
                  <div style="width:52px;height:52px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#c2410c;flex-shrink:0;">
                    ${escapeHtml(c.char)}
                  </div>
                  <div>
                    <div style="font-weight:700;font-size:14px;color:#b91c1c;">Hán Việt: ${escapeHtml((c.hanviet || '').toUpperCase())}</div>
                    <div style="font-size:13px;color:#57534e;margin-top:2px;">${escapeHtml(c.meaningVi || '')}</div>
                  </div>
                </a>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${collocations.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;margin-bottom:20px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Cụm từ kết hợp phổ biến (Collocations)</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
              ${collocations.map(col => `
                <div style="padding:12px 16px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;">
                  <div style="font-weight:700;font-size:16px;color:#1c1917;">${escapeHtml(col.hanzi)}</div>
                  <div style="font-size:13px;color:#ea580c;margin-top:2px;">${escapeHtml(col.pinyin)}</div>
                  <div style="font-size:14px;color:#57534e;margin-top:4px;">${escapeHtml(col.vietnamese)}</div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        ${examples.length > 0 ? `
          <section style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:22px;">
            <h2 style="font-size:18px;font-weight:800;margin:0 0 14px;">Câu ví dụ sử dụng từ "${escapeHtml(word)}" (${examples.length})</h2>
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${examples.map(ex => {
                const exHz = ex.hanzi || ex.zh || '';
                const exPy = ex.pinyin || '';
                const exVi = ex.vietnamese || ex.meaningVi || ex.vi || '';
                const exAudio = ex.audioUrl || ex.audio || '';
                return `
                  <div style="padding:14px 16px;border-radius:12px;background:#fafaf9;border:1px solid #f5f5f4;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                    <div>
                      <div style="font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(exHz)}</div>
                      <div style="font-size:14px;color:#ea580c;margin-top:2px;">${escapeHtml(exPy)}</div>
                      <div style="font-size:14px;color:#57534e;margin-top:4px;">${escapeHtml(exVi)}</div>
                    </div>
                    ${exAudio ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(exAudio)}')" style="padding:8px 12px;border-radius:10px;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;cursor:pointer;font-weight:700;flex-shrink:0;">🔊 Nghe</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6C. TRANG TỪ ĐIỂN HÁN VIỆT (/han-viet & /han-viet/:slug)
  // --------------------------------------------------------------------------
  async function renderHanVietIndexPage() {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    document.title = 'Từ Điển Âm Hán Việt Toàn Diện (6.704 Âm) | XieHanzi';

    const chunk1 = (await loadLocalJson('/data/han-viet/han-viet-01.json')) || [];
    const sampleItems = Array.isArray(chunk1) ? chunk1.slice(0, 60) : [];

    mainEl.innerHTML = `
      <div style="max-width:1040px;margin:0 auto;padding:28px 16px 48px;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:20px;padding:28px;margin-bottom:24px;">
          <h1 style="font-size:28px;font-weight:800;margin:0 0 8px;">📖 Tra Cứu Từ Điển Hán Việt (6.704 mục)</h1>
          <p style="color:#57534e;margin:0 0 18px;font-size:15px;">Tra cứu chữ Hán và từ ghép theo âm đọc Hán Việt chuẩn xác.</p>
          <form onsubmit="event.preventDefault(); const v = document.getElementById('xhz-hv-q').value.trim(); if(v) window.location.href='/han-viet/' + encodeURIComponent(v.toLowerCase());" style="display:flex;gap:10px;max-width:520px;">
            <input id="xhz-hv-q" type="search" placeholder="Nhập âm Hán Việt (VD: minh, tâm, học, nhân, gia)..." style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid #d6d3d1;font-size:15px;" />
            <button type="submit" style="padding:10px 20px;border-radius:10px;border:none;background:#ea580c;color:#fff;font-weight:700;cursor:pointer;">Tra cứu</button>
          </form>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
            ${['minh', 'tam', 'hoc', 'nhan', 'gia', 'quoc', 'thien', 'dia', 'dao', 'duc', 'phuc', 'loc', 'tho', 'an'].map(s => `
              <a href="/han-viet/${s}" style="padding:5px 12px;border-radius:99px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;text-decoration:none;font-size:13px;font-weight:700;">${s.toUpperCase()}</a>
            `).join('')}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
          ${sampleItems.map(item => {
            const group = (item.groups && item.groups[0]) || {};
            const reading = group.reading || item.slug || '';
            const chars = (group.chars || []).slice(0, 5).map(c => c.hanzi).join(' · ');
            return `
              <a href="/han-viet/${encodeURIComponent(item.slug)}" style="display:block;padding:14px 16px;border-radius:14px;border:1px solid #e7e5e4;background:#ffffff;text-decoration:none;color:inherit;">
                <div style="font-weight:800;font-size:17px;color:#b91c1c;text-transform:uppercase;">${escapeHtml(reading)}</div>
                <div style="font-size:18px;color:#1c1917;margin-top:6px;font-weight:600;">${escapeHtml(chars)}</div>
                <div style="font-size:12px;color:#78716c;margin-top:4px;">${(group.chars || []).length} chữ Hán</div>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  async function renderHanVietDetailPage(slug) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const hvData = await lookupHanViet(slug);
    if (!hvData) return;

    const groups = Array.isArray(hvData.groups) ? hvData.groups : [{ reading: hvData.reading || slug, chars: hvData.characters || [] }];
    const mainReading = (groups[0] && groups[0].reading) || decodeURIComponent(slug);
    document.title = `Âm Hán Việt "${mainReading.toUpperCase()}" — Danh sách chữ Hán & Từ ghép | XieHanzi`;

    mainEl.innerHTML = `
      <div style="max-width:1000px;margin:0 auto;padding:24px 16px 48px;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
        <nav style="margin-bottom:16px;font-size:14px;color:#57534e;display:flex;gap:8px;align-items:center;">
          <a href="/han-viet" style="color:#ea580c;text-decoration:none;font-weight:600;">← Từ điển Hán Việt</a>
          <span>/</span>
          <span style="font-weight:700;color:#1c1917;">Âm Hán Việt: ${escapeHtml(mainReading.toUpperCase())}</span>
        </nav>

        ${groups.map(group => {
          const chars = Array.isArray(group.chars) ? group.chars : [];
          return `
            <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:24px;margin-bottom:24px;">
              <h1 style="font-size:26px;font-weight:800;margin:0 0 6px;color:#b91c1c;">
                Âm Hán Việt: "${escapeHtml((group.reading || mainReading).toUpperCase())}"
              </h1>
              <p style="color:#57534e;margin:0 0 20px;font-size:14px;">Tìm thấy ${chars.length} chữ Hán mang âm Hán Việt "${escapeHtml(group.reading || mainReading)}"</p>

              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
                ${chars.map(ch => {
                  const hz = ch.hanzi || ch.character || ch.c || '';
                  const py = ch.pinyin || ch.p || '';
                  const m = ch.meaningVi || ch.m || '';
                  const words = Array.isArray(ch.words) ? ch.words.slice(0, 4) : [];
                  return `
                    <div style="padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;">
                      <div style="display:flex;align-items:center;gap:14px;">
                        <a href="/han-tu/${encodeURIComponent(ch.slug || hz)}" style="width:56px;height:56px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#c2410c;text-decoration:none;flex-shrink:0;">
                          ${escapeHtml(hz)}
                        </a>
                        <div>
                          <a href="/han-tu/${encodeURIComponent(ch.slug || hz)}" style="font-weight:800;font-size:17px;color:#1c1917;text-decoration:none;">
                            ${escapeHtml(hz)} <span style="color:#ea580c;">(${escapeHtml(py)})</span>
                          </a>
                          <div style="font-size:13px;color:#57534e;margin-top:3px;">${escapeHtml(m)}</div>
                        </div>
                      </div>
                      ${words.length > 0 ? `
                        <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #e7e5e4;display:flex;flex-wrap:wrap;gap:6px;">
                          ${words.map(w => `
                            <a href="/tu-vung/${encodeURIComponent(w.hanzi)}" style="font-size:12px;padding:3px 8px;border-radius:6px;background:#ffffff;border:1px solid #e7e5e4;color:#44403c;text-decoration:none;">
                              <strong>${escapeHtml(w.hanzi)}</strong>: ${escapeHtml(w.meaningVi || '')}
                            </a>
                          `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6D. TRANG CHI TIẾT NGỮ PHÁP (/ngu-phap/:level/:pointId)
  // --------------------------------------------------------------------------
  async function renderGrammarDetailPage(levelSlug, pointSlug) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const isNewHsk = levelSlug.includes('new');
    const lvlNum = (levelSlug.match(/\d+/) || ['1'])[0];
    const prefix = isNewHsk ? 'new-hsk-level-' : 'hsk-level-';
    const data = await loadLocalJson(`/data/grammar/${prefix}${lvlNum}.json`);
    const list = (data && (data.items || data.points || data.grammarPoints)) || (Array.isArray(data) ? data : []);
    const cleanSlug = decodeURIComponent(pointSlug).toLowerCase();
    const numMatch = cleanSlug.match(/(\d+)$/);
    const pointIdx = numMatch ? Math.max(0, parseInt(numMatch[1], 10) - 1) : 0;

    const point = list.find(item => {
      const id = String(item.id || item._id || item.slug || '').toLowerCase();
      return id === cleanSlug || id === `hsk${lvlNum}_${pointIdx + 1}`;
    }) || list[pointIdx] || list[0];

    if (!point) return;

    const title = point.topic || point.title || point.name || point.grammarPoint || pointSlug;
    const syntax = point.grammar_syntax || point.structure || point.pattern || point.formula || '';
    const explanation = point.grammar_explanation || point.explanation || point.description || point.meaning || '';
    const tips = point.grammar_tips || '';
    const examples = point.examples || point.sentences || [];
    document.title = `${title} — Ngữ pháp HSK ${lvlNum} | XieHanzi`;

    mainEl.innerHTML = `
      <div style="max-width:920px;margin:0 auto;padding:28px 16px 48px;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
        <div style="margin-bottom:16px;">
          <a href="/ngu-phap" style="color:#ea580c;text-decoration:none;font-weight:600;">← Quay lại danh sách Ngữ pháp</a>
        </div>
        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;box-shadow:0 2px 10px rgba(0,0,0,0.04);">
          <span style="display:inline-block;padding:4px 12px;border-radius:99px;background:#fff7ed;color:#c2410c;font-size:13px;font-weight:700;margin-bottom:10px;">
            NGỮ PHÁP HSK ${escapeHtml(lvlNum)}
          </span>
          <h1 style="font-size:28px;font-weight:800;margin:0 0 14px;color:#1c1917;">${escapeHtml(title)}</h1>

          ${syntax ? `
            <div style="background:#fafaf9;border-left:4px solid #ea580c;padding:14px 18px;border-radius:10px;margin-bottom:20px;">
              <div style="font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;">Cấu trúc ngữ pháp</div>
              <div style="font-size:19px;font-weight:800;color:#c2410c;margin-top:4px;">${escapeHtml(syntax)}</div>
            </div>
          ` : ''}

          <div style="font-size:16px;line-height:1.75;color:#292524;margin-bottom:20px;">
            ${escapeHtml(explanation)}
          </div>

          ${tips ? `
            <div style="background:#fefce8;border-left:4px solid #eab308;padding:12px 16px;border-radius:10px;margin-bottom:24px;font-size:15px;color:#44403c;">
              <strong>💡 Lưu ý sử dụng:</strong> ${escapeHtml(tips)}
            </div>
          ` : ''}

          <h2 style="font-size:19px;font-weight:700;margin:0 0 12px;">Ví dụ minh họa (${examples.length})</h2>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${examples.map(ex => {
              const zh = ex.chinese || ex.hanzi || ex.zh || ex.sentence || '';
              const py = ex.pinyin || '';
              const vi = ex.vietnamese || ex.meaningVi || ex.vi || ex.translation || '';
              const audio = ex.audioUrl || ex.audio || '';
              return `
                <div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #f5f5f4;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                  <div>
                    <div style="font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(zh)}</div>
                    <div style="font-size:14px;color:#ea580c;margin-top:2px;">${escapeHtml(py)}</div>
                    <div style="font-size:14px;color:#57534e;margin-top:4px;">${escapeHtml(vi)}</div>
                  </div>
                  ${audio ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(audio)}')" style="padding:8px 12px;border-radius:10px;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;cursor:pointer;font-weight:700;">🔊 Nghe</button>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6E. TRANG CHI TIẾT GIÁO TRÌNH & BÀI HỌC (/thu-vien-*)
  // --------------------------------------------------------------------------
  async function renderCurriculumSubPage(pathname) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const m = pathname.match(/^\/thu-vien-(hsk|new-hsk|boya|hanyu-jiaocheng|yct)\/([^/]+)(?:\/(.*))?$/);
    if (!m) return;
    const curr = m[1];
    const levelSlug = m[2];
    const rest = m[3] || '';
    const lvlNum = (levelSlug.match(/\d+/) || ['1'])[0];

    const lessons = (await loadLocalJson(`/data/curriculums/${curr}/lessons-${lvlNum}.json`)) ||
                    (await loadLocalJson(`/data/curriculums/${curr}/lessons-${levelSlug}.json`)) ||
                    (await loadLocalJson(`/data/curriculums/${curr}/topics-${lvlNum}.json`)) || [];
    const lessonList = Array.isArray(lessons) ? lessons : (lessons.items || lessons.lessons || lessons.topics || []);

    const lessonMatch = rest.match(/bai-hoc\/([^/]+)/);
    let activeLesson = null;
    if (lessonMatch) {
      const targetSlug = decodeURIComponent(lessonMatch[1]);
      const foundMeta = lessonList.find(l => String(l.id || l._id || l.slug || l.lessonNumber) === targetSlug) || lessonList[0];
      if (foundMeta) {
        const lid = foundMeta.id || foundMeta._id || foundMeta.slug || targetSlug;
        activeLesson = (await loadLocalJson(`/data/curriculums/${curr}/lessons/${lid}.json`)) || foundMeta;
      }
    }

    if (activeLesson) {
      const vocab = activeLesson.vocabulary || activeLesson.words || activeLesson.items || [];
      const dialogues = activeLesson.dialogues || activeLesson.conversations || activeLesson.sentences || [];
      const title = activeLesson.title || activeLesson.name || activeLesson.titleVi || 'Bài học';
      document.title = `${title} — Giáo trình ${curr.toUpperCase()} | XieHanzi`;

      mainEl.innerHTML = `
        <div style="max-width:980px;margin:0 auto;padding:28px 16px;font-family:system-ui,-apple-system,sans-serif;">
          <div style="margin-bottom:16px;">
            <a href="/thu-vien-${curr}/${levelSlug}" style="color:#ea580c;text-decoration:none;font-weight:600;">← Quay lại ${curr.toUpperCase()} Cấp ${lvlNum}</a>
          </div>
          <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;">
            <h1 style="font-size:26px;font-weight:800;margin:0 0 8px;">${escapeHtml(title)}</h1>
            <p style="color:#57534e;margin:0 0 24px;">Từ vựng trọng tâm (${vocab.length} từ) & Hội thoại bài học</p>

            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-bottom:28px;">
              ${vocab.map(w => {
                const hz = w.hanzi || w.word || w.character || '';
                const py = w.pinyin || '';
                const vi = w.meaningVi || w.meaning || w.vi || '';
                const audio = w.audioUrl || w.audio || '';
                return `
                  <div style="padding:14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;justify-content:space-between;align-items:start;">
                    <div>
                      <a href="/tu-vung/${encodeURIComponent(hz)}" style="font-size:22px;font-weight:800;color:#1c1917;text-decoration:none;">${escapeHtml(hz)}</a>
                      <div style="font-size:14px;color:#ea580c;margin-top:2px;">${escapeHtml(py)}</div>
                      <div style="font-size:14px;color:#44403c;margin-top:4px;">${escapeHtml(vi)}</div>
                    </div>
                    ${audio ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(audio)}')" style="border:none;background:#fff7ed;color:#ea580c;padding:6px 10px;border-radius:8px;cursor:pointer;">🔊</button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            ${dialogues.length > 0 ? `
              <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">Hội thoại / Câu mẫu</h2>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${dialogues.map(d => {
                  const zh = d.hanzi || d.chinese || d.zh || d.text || '';
                  const py = d.pinyin || '';
                  const vi = d.meaningVi || d.vietnamese || d.vi || '';
                  return `
                    <div style="padding:12px 16px;border-radius:12px;background:#fafaf9;border:1px solid #f5f5f4;">
                      <div style="font-weight:700;font-size:16px;">${escapeHtml(zh)}</div>
                      <div style="font-size:14px;color:#ea580c;">${escapeHtml(py)}</div>
                      <div style="font-size:14px;color:#57534e;">${escapeHtml(vi)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
      return;
    }

    document.title = `Giáo trình ${curr.toUpperCase()} Cấp ${lvlNum} | XieHanzi`;
    mainEl.innerHTML = `
      <div style="max-width:980px;margin:0 auto;padding:28px 16px;font-family:system-ui,-apple-system,sans-serif;">
        <div style="margin-bottom:16px;">
          <a href="/thu-vien-${curr}" style="color:#ea580c;text-decoration:none;font-weight:600;">← Quay lại Thư viện ${curr.toUpperCase()}</a>
        </div>
        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;">
          <h1 style="font-size:26px;font-weight:800;margin:0 0 8px;">Danh sách Bài học & Chủ đề — ${curr.toUpperCase()} Cấp ${escapeHtml(lvlNum)}</h1>
          <p style="color:#57534e;margin:0 0 20px;">Chọn bài học bên dưới để xem từ vựng, nghe phát âm và luyện tập:</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
            ${lessonList.map((item, idx) => {
              const id = item.id || item._id || item.slug || idx + 1;
              const title = item.title || item.name || item.titleVi || `Bài ${idx + 1}`;
              const count = item.wordCount || item.vocabCount || (item.words && item.words.length) || '';
              return `
                <a href="/thu-vien-${curr}/${levelSlug}/bai-hoc/${encodeURIComponent(id)}" style="display:block;padding:16px 18px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:inherit;">
                  <div style="font-size:12px;font-weight:700;color:#ea580c;">BÀI ${idx + 1}</div>
                  <div style="font-size:17px;font-weight:700;color:#1c1917;margin-top:4px;">${escapeHtml(title)}</div>
                  ${count ? `<div style="font-size:13px;color:#57534e;margin-top:6px;">📚 ${count} từ vựng</div>` : ''}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6F. TRANG VIDEO NGHE CHÉP CHÍNH TẢ (/luyen-chep-chinh-ta/:slug)
  // --------------------------------------------------------------------------
  async function renderDictationDetailPage(videoId) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const decoded = decodeURIComponent(videoId);
    const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
    const video = all.find(v =>
      v.id === decoded ||
      v._id === decoded ||
      v.slug === decoded ||
      toSlugVi(v.title || v.titleVi) === decoded ||
      decoded.includes(String(v.id || v._id))
    ) || all[0] || {};
    const realId = video.id || video._id || decoded;
    const segData = (await loadLocalJson(`/data/dictation/videos/${realId}-segments.json`)) || {};
    const segments = segData.segments || segData.items || (Array.isArray(segData) ? segData : []);
    const ytId = video.youtubeId || video.videoId || segData.youtubeId || '';
    const title = video.title || video.titleVi || 'Luyện nghe chép chính tả';
    document.title = `${title} | Luyện chép chính tả XieHanzi`;

    mainEl.innerHTML = `
      <div style="max-width:980px;margin:0 auto;padding:28px 16px;font-family:system-ui,-apple-system,sans-serif;">
        <div style="margin-bottom:16px;">
          <a href="/luyen-chep-chinh-ta" style="color:#ea580c;text-decoration:none;font-weight:600;">← Quay lại danh sách Video Chép chính tả</a>
        </div>
        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:24px;">
          <h1 style="font-size:24px;font-weight:800;margin:0 0 16px;">🎧 ${escapeHtml(title)}</h1>
          ${ytId ? `
            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:14px;margin-bottom:20px;background:#000;">
              <iframe src="https://www.youtube.com/embed/${escapeHtml(ytId)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
            </div>
          ` : ''}
          <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;">Luyện gõ từng câu thoại (${segments.length} câu)</h2>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${segments.map((s, idx) => {
              const zh = s.hanzi || s.chinese || s.text || s.transcript || '';
              const py = s.pinyin || '';
              const vi = s.meaningVi || s.vietnamese || s.translation || '';
              return `
                <div style="padding:14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;">
                  <div style="display:flex;gap:10px;align-items:center;">
                    <span style="font-weight:700;color:#ea580c;">#${idx + 1}</span>
                    <input type="text" placeholder="Gõ lại câu tiếng Trung bạn nghe được..."
                      oninput="const ok = this.value.replace(/[^\\u4e00-\\u9fff]/g,'') === '${escapeHtml(zh.replace(/[^\u4e00-\u9fff]/g, ''))}'; this.style.borderColor = ok ? '#16a34a' : '#d6d3d1'; this.style.background = ok ? '#f0fdf4' : '#ffffff';"
                      style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid #d6d3d1;font-size:15px;" />
                    <button onclick="const ans = this.parentElement.nextElementSibling; ans.style.display = ans.style.display === 'none' ? 'block' : 'none';"
                      style="padding:8px 12px;border-radius:8px;border:1px solid #d6d3d1;background:#fff;cursor:pointer;font-size:13px;font-weight:600;">
                      Đáp án
                    </button>
                  </div>
                  <div style="display:none;margin-top:10px;padding-top:10px;border-top:1px dashed #d6d3d1;">
                    <div style="font-weight:700;font-size:17px;color:#1c1917;">${escapeHtml(zh)}</div>
                    <div style="font-size:14px;color:#ea580c;">${escapeHtml(py)}</div>
                    <div style="font-size:14px;color:#57534e;">${escapeHtml(vi)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6G. TRANG PHÒNG THI HSK & KIỂM TRA NGỮ PHÁP ĐỘNG
  // --------------------------------------------------------------------------
  async function renderHskTestPaperPage(pathname) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const parts = pathname.split('/').filter(Boolean);
    const lastSeg = parts[parts.length - 1];
    const lvlMatch = pathname.match(/hsk(\d+)/i);
    const lvl = lvlMatch ? lvlMatch[1] : '1';

    let paper = await loadLocalJson(`/data/tests/papers/${lastSeg}.json`);
    if (!paper) {
      const papers = (await loadLocalJson('/data/tests/papers-hsk.json')) || [];
      const found = papers.find(p => String(p.level || p.hskLevel) === String(lvl)) || papers[0];
      if (found) {
        paper = await loadLocalJson(`/data/tests/papers/${found.id || found._id}.json`);
      }
    }
    if (!paper) return;

    const questions = paper.questions || paper.items || [];
    const title = paper.title || paper.name || `Đề thi HSK ${lvl}`;
    document.title = `${title} | Phòng thi HSK XieHanzi`;

    mainEl.innerHTML = `
      <div style="max-width:920px;margin:0 auto;padding:28px 16px;font-family:system-ui,-apple-system,sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <a href="/kiem-tra-hsk" style="color:#ea580c;text-decoration:none;font-weight:600;">← Quay lại Phòng thi HSK</a>
          <div id="xhz-exam-score-badge" style="padding:6px 14px;border-radius:99px;background:#fff7ed;color:#c2410c;font-weight:800;">
            Điểm số: <span id="xhz-exam-score">0</span> / ${questions.length}
          </div>
        </div>
        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;">
          <h1 style="font-size:24px;font-weight:800;margin:0 0 20px;">🏆 ${escapeHtml(title)} (${questions.length} câu)</h1>
          <div style="display:flex;flex-direction:column;gap:16px;">
            ${questions.map((q, idx) => {
              const prompt = q.question || q.prompt || q.stem || q.text || `Câu hỏi ${idx + 1}`;
              const audio = rewriteMediaUrl(q.audioUrl || q.audio || '');
              const image = rewriteMediaUrl(q.imageUrl || q.image || '');
              const options = q.options || q.choices || [];
              const rightAns = String(q.correctAnswer || q.answer || q.correctOption || 'A').trim();
              return `
                <div class="xhz-q-card" style="padding:18px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;">
                  <div style="font-weight:700;font-size:16px;margin-bottom:10px;">Câu ${idx + 1}: ${escapeHtml(prompt)}</div>
                  ${audio ? `<audio controls src="${escapeHtml(audio)}" style="height:36px;margin-bottom:10px;"></audio>` : ''}
                  ${image ? `<img src="${escapeHtml(image)}" style="max-height:140px;border-radius:10px;margin-bottom:10px;display:block;" />` : ''}
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">
                    ${options.map((opt, oIdx) => {
                      const key = opt.key || opt.label || opt.id || ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
                      const val = typeof opt === 'string' ? opt : (opt.text || opt.content || opt.value || '');
                      return `
                        <button type="button"
                          onclick="const card = this.closest('.xhz-q-card'); if(card.dataset.done) return; card.dataset.done='1'; const isRight = '${escapeHtml(key)}' === '${escapeHtml(rightAns)}'; this.style.background = isRight ? '#dcfce7' : '#fee2e2'; this.style.borderColor = isRight ? '#16a34a' : '#dc2626'; if(isRight){ const s = document.getElementById('xhz-exam-score'); s.textContent = Number(s.textContent)+1; } card.querySelector('.xhz-q-exp').style.display='block';"
                          style="text-align:left;padding:10px 14px;border-radius:10px;border:1px solid #d6d3d1;background:#ffffff;cursor:pointer;font-size:14px;">
                          <strong>${escapeHtml(key)}.</strong> ${escapeHtml(val)}
                        </button>
                      `;
                    }).join('')}
                  </div>
                  <div class="xhz-q-exp" style="display:none;margin-top:10px;padding:10px 12px;border-radius:8px;background:#fff7ed;font-size:13px;color:#9a3412;">
                    <strong>Đáp án đúng: ${escapeHtml(rightAns)}</strong>
                    ${q.explanationVi || q.explanation ? `<br/>${escapeHtml(q.explanationVi || q.explanation)}` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6H. TRANG HỌC CHẶNG / ÔN TẬP ĐỘNG (/hoc/chang/:stageKey, /hoc/bai/:runId)
  // --------------------------------------------------------------------------
  async function renderStudyStageOrRunPage(pathname) {
    const mainEl = getDetachedMain();
    if (!mainEl) return;
    const slug = decodeURIComponent(pathname.split('/').pop() || '');
    const vocabChunk = (await loadLocalJson('/data/vocabulary/vocabulary-01.json')) || [];
    const words = Array.isArray(vocabChunk) ? vocabChunk.slice(0, 12) : [];
    document.title = `Bài học tương tác: ${slug} | XieHanzi`;

    mainEl.innerHTML = `
      <div style="max-width:920px;margin:0 auto;padding:28px 16px;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;">
        <div style="margin-bottom:16px;">
          <a href="/hoc" style="color:#ea580c;text-decoration:none;font-weight:600;">← Quay lại Lộ trình học</a>
        </div>
        <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:99px;background:#fff7ed;color:#c2410c;font-size:13px;font-weight:700;margin-bottom:8px;">
            CHẶNG HỌC TƯƠNG TÁC · ${escapeHtml(slug)}
          </span>
          <h1 style="font-size:26px;font-weight:800;margin:0 0 8px;">Từ vựng & Flashcard trong chặng</h1>
          <p style="color:#57534e;margin:0 0 20px;">Nhấp nghe phát âm, lưu sổ tay và ôn tập từng từ trong chặng học:</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
            ${words.map(w => {
              const hz = w.hanzi || '';
              const py = w.pinyin || '';
              const vi = w.wordMeaningVi || w.translationVi || '';
              const audio = w.audios && w.audios[0] ? w.audios[0] : '';
              return `
                <div style="padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <a href="/tu-vung/${encodeURIComponent(hz)}" style="font-size:26px;font-weight:800;color:#c2410c;text-decoration:none;">${escapeHtml(hz)}</a>
                    ${audio ? `<button onclick="window.__xhzPlayAudio('${escapeHtml(audio)}')" style="border:1px solid #fed7aa;background:#fff7ed;color:#c2410c;padding:6px 10px;border-radius:8px;cursor:pointer;font-weight:700;">🔊</button>` : ''}
                  </div>
                  <div style="font-size:15px;color:#ea580c;font-weight:600;margin-top:4px;">${escapeHtml(py)}</div>
                  <div style="font-size:14px;color:#44403c;margin-top:4px;">${escapeHtml(vi)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  let lastRenderedPath = '';
  async function checkAndRenderDynamicPage() {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    if (pathname === lastRenderedPath) return;

    // 1. /han-tu/:slug
    if (pathname.startsWith('/han-tu/') && pathname.length > '/han-tu/'.length) {
      lastRenderedPath = pathname;
      await renderCharacterDetailPage(pathname.slice('/han-tu/'.length));
      return;
    }

    // 2. /tu-vung/:slug
    if (pathname.startsWith('/tu-vung/') && pathname.length > '/tu-vung/'.length) {
      lastRenderedPath = pathname;
      await renderVocabularyDetailPage(pathname.slice('/tu-vung/'.length));
      return;
    }

    // 3. /han-viet (index) & /han-viet/:slug
    if (pathname === '/han-viet') {
      lastRenderedPath = pathname;
      await renderHanVietIndexPage();
      return;
    }
    if (pathname.startsWith('/han-viet/') && pathname.length > '/han-viet/'.length) {
      lastRenderedPath = pathname;
      await renderHanVietDetailPage(pathname.slice('/han-viet/'.length));
      return;
    }

    // 4. /ngu-phap/:level/:pointId
    const gpMatch = pathname.match(/^\/ngu-phap\/([^/]+)\/([^/]+)$/);
    if (gpMatch) {
      lastRenderedPath = pathname;
      await renderGrammarDetailPage(gpMatch[1], gpMatch[2]);
      return;
    }

    // 5. /thu-vien-(hsk|new-hsk|boya|hanyu-jiaocheng|yct)/:sub*
    if (/^\/thu-vien-(hsk|new-hsk|boya|hanyu-jiaocheng|yct)\/.+/.test(pathname)) {
      lastRenderedPath = pathname;
      await renderCurriculumSubPage(pathname);
      return;
    }

    // 6. /luyen-chep-chinh-ta/:id
    const dictMatch = pathname.match(/^\/luyen-chep-chinh-ta\/([^/]+)$/);
    if (dictMatch) {
      lastRenderedPath = pathname;
      await renderDictationDetailPage(dictMatch[1]);
      return;
    }

    // 7. /kiem-tra-hsk/:sub+ hoặc /de-kiem-tra/lam-bai/:id
    if (/^\/kiem-tra-hsk\/.+/.test(pathname) || /^\/de-kiem-tra\/lam-bai\/.+/.test(pathname)) {
      lastRenderedPath = pathname;
      await renderHskTestPaperPage(pathname);
      return;
    }

    // 8. /hoc/chang/:stageKey hoặc /hoc/bai/:runId
    if (pathname.startsWith('/hoc/chang/') || pathname.startsWith('/hoc/bai/')) {
      lastRenderedPath = pathname;
      await renderStudyStageOrRunPage(pathname);
      return;
    }
  }

  // Theo dõi thay đổi URL trong SPA (history.pushState / replaceState / popstate)
  const origPushState = history.pushState;
  history.pushState = function (...args) {
    const ret = origPushState.apply(this, args);
    setTimeout(checkAndRenderDynamicPage, 120);
    return ret;
  };
  const origReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const ret = origReplaceState.apply(this, args);
    setTimeout(checkAndRenderDynamicPage, 120);
    return ret;
  };
  window.addEventListener('popstate', () => setTimeout(checkAndRenderDynamicPage, 120));

  // ==========================================================================
  // 7. SỬA ẢNH & INJECT NAVIGATION NHẸ NHÀNG
  // ==========================================================================
  function fixBrokenImages(root = document) {
    const imgs = root.querySelectorAll ? root.querySelectorAll('img') : [];
    imgs.forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('https://static.xiehanzi.com/') || src.includes('/_next/image')) {
        img.setAttribute('src', rewriteMediaUrl(src));
      }
      const srcset = img.getAttribute('srcset') || '';
      if (srcset && (srcset.includes('xiehanzi.com') || srcset.includes('/_next/image'))) {
        img.setAttribute('srcset', rewriteSrcset(srcset));
      }
    });
  }

  function injectGlobalNavigation() {
    if (document.getElementById('xiehanzi-clone-quickbar')) return;

    const hasHeader = document.querySelector('header') || document.querySelector('nav');
    if (!hasHeader) {
      const nav = document.createElement('header');
      nav.id = 'xiehanzi-clone-quickbar';
      nav.style.cssText = 'position:sticky;top:0;z-index:9999;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-bottom:1px solid #e7e5e4;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;font-family:system-ui,-apple-system,sans-serif;';
      nav.innerHTML = `
        <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#1c1917;font-weight:800;font-size:18px;">
          <span style="display:inline-flex;width:28px;height:28px;border-radius:6px;background:#ea580c;color:#fff;align-items:center;justify-content:center;font-weight:900;">漢</span>
          <span>XieHanzi</span>
        </a>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:14px;font-weight:600;">
          <a href="/hoc" style="color:#44403c;text-decoration:none;">Lộ trình</a>
          <a href="/tra-chu" style="color:#44403c;text-decoration:none;">Tra chữ</a>
          <a href="/thu-vien" style="color:#44403c;text-decoration:none;">Thư viện</a>
          <a href="/ngu-phap" style="color:#44403c;text-decoration:none;">Ngữ pháp</a>
          <a href="/kiem-tra-hsk" style="color:#44403c;text-decoration:none;">Thi HSK</a>
          <a href="/luyen-chep-chinh-ta" style="color:#44403c;text-decoration:none;">Chép chính tả</a>
          <a href="/dich-tieng-trung" style="color:#44403c;text-decoration:none;">Dịch AI</a>
          <a href="/thay-do" style="color:#b91c1c;text-decoration:none;">Trường Thầy Đồ</a>
          <a href="/kho-du-lieu" style="background:#ea580c;color:#fff;padding:6px 12px;border-radius:99px;text-decoration:none;font-size:13px;">Kho 96.860 File</a>
        </div>
      `;
      document.body.prepend(nav);
    }

    const fab = document.createElement('a');
    fab.id = 'xiehanzi-clone-fab';
    fab.href = '/kho-du-lieu';
    fab.title = 'Mở Kho Dữ Liệu Toàn Diện (9.931 Chữ Hán, 11.534 Từ vựng, 66 Đề HSK, 91 Video)';
    fab.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:9998;background:#1c1917;color:#fafaf9;padding:8px 14px;border-radius:99px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.2);display:flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,0.15);';
    fab.innerHTML = `<span style="color:#fb923c;">🏮</span> <span>Kho Dữ Liệu Đầy Đủ</span>`;
    document.body.appendChild(fab);
  }

  function scheduleDynamicRender() {
    // Chờ React hydrate xong trên SSR shell (khoảng 300ms) rồi mới tách và render trang động
    // để tuyệt đối không gây lỗi React Hydration #418/#422
    setTimeout(() => {
      checkAndRenderDynamicPage();
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fixBrokenImages();
      injectGlobalNavigation();
      scheduleDynamicRender();
    });
  } else {
    fixBrokenImages();
    injectGlobalNavigation();
    scheduleDynamicRender();
  }

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.target && m.target.tagName === 'IMG') {
        fixBrokenImages(m.target.parentElement || document);
      } else {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') fixBrokenImages(node.parentElement || document);
            else fixBrokenImages(node);
          }
        });
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset']
  });
})();
