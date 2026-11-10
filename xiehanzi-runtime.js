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

  const SUPABASE_URL = 'https://xcthntcgenzfybefaphh.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGhudGNnZW56ZnliZWZhcGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDE0NjQsImV4cCI6MjEwOTIxNzQ2NH0.0L3BZslXqmIkiH3kuKSL0HJeo_gmZ15E614xqnxhbdM';
  const RAW_GITHUB_REPO = 'https://raw.githubusercontent.com/hungktkthd/saochepweb';
  const DEFAULT_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXhoei0xIiwidHlwIjoiYWNjZXNzIiwiZyI6MCwiZXhwIjo0MTAyNDQ0ODAwfQ.xhzsignature';

  const originalFetch = window.fetch.bind(window);
  const jsonCache = new Map();

  // Tự động khởi tạo JWT hợp lệ để mở khóa toàn bộ các trang /hoc, /hoc/on-tap, /hoc/so-loi, /hoc/tu-da-hoc
  try {
    const existingToken = localStorage.getItem('xiehanzi_access_token');
    if (!existingToken || existingToken.split('.').length !== 3) {
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
    }
  } catch (_e) {}

  async function loadLocalJson(path) {
    if (jsonCache.has(path)) return jsonCache.get(path);
    const p = originalFetch(path)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
    jsonCache.set(path, p);
    return p;
  }

  // Stub Google Identity Services để tránh lỗi 403 origin trên /dang-nhap & /dang-ky
  try {
    window.google = window.google || {
      accounts: {
        id: {
          initialize: function () {},
          renderButton: function (el) {
            if (el) {
              el.innerHTML =
                '<button type="button" style="width:100%;padding:10px 16px;border-radius:999px;border:1px solid #d6d3d1;background:#ffffff;color:#1c1917;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><span>G</span><span>Tiếp tục với Google</span></button>';
            }
          },
          prompt: function () {},
          cancel: function () {},
          disableAutoSelect: function () {}
        },
        oauth2: {
          initTokenClient: function () { return { requestAccessToken: function () {} }; },
          initCodeClient: function () { return { requestCode: function () {} }; }
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

    if (url.startsWith('https://static.xiehanzi.com/')) {
      let rel = url.slice('https://static.xiehanzi.com/'.length).split('?')[0];
      try {
        rel = decodeURIComponent(rel);
      } catch (_e) {}
      const encRel = rel.split('/').map(s => encodeURIComponent(s)).join('/');

      if (
        rel.startsWith('gif/') ||
        rel.startsWith('hsk-tests/') ||
        rel.startsWith('word-illustration/') ||
        rel.startsWith('level_images/')
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
        isAuthenticated: true,
        accessToken: DEFAULT_JWT,
        token: DEFAULT_JWT,
        id: 'user-xhz-1',
        _id: 'user-xhz-1',
        email: 'hocvien@xiehanzi.com',
        username: 'hocvien',
        name: 'Học viên XieHanzi',
        displayName: 'Học viên XieHanzi',
        role: 'user',
        streak: 5,
        user: {
          id: 'user-xhz-1',
          _id: 'user-xhz-1',
          email: 'hocvien@xiehanzi.com',
          username: 'hocvien',
          name: 'Học viên XieHanzi',
          displayName: 'Học viên XieHanzi',
          role: 'user',
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
      const parts = p.split('/').filter(Boolean);
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
              meta: {
                titleVi: 'Xin chào, bạn khỏe không?',
                titleZh: '你好，你好吗？',
                titlePinyin: 'Nǐ hǎo, nǐ hǎo ma?',
                canDoVi: ['Chào hỏi và hỏi thăm sức khỏe bằng tiếng Trung', 'Phản hồi lịch sự khi gặp mặt lần đầu'],
                grammarNotes: []
              },
              activities: [
                { activityKey: `${chapterKey}.S1.learn`, type: 'learn', titleVi: 'Từ vựng & Mẫu câu trọng tâm', required: true },
                { activityKey: `${chapterKey}.S1.dialogue`, type: 'dialogue', titleVi: 'Hội thoại tình huống thực tế', required: true },
                { activityKey: `${chapterKey}.S1.exam`, type: 'exam', titleVi: 'Kiểm tra tổng hợp cuối chặng', required: true }
              ]
            },
            {
              stageKey: `${chapterKey}.S2`,
              meta: {
                titleVi: 'Bạn tên là gì? Người nước nào?',
                titleZh: '你叫什么名字？',
                titlePinyin: 'Nǐ jiào shénme míngzi?',
                canDoVi: ['Giới thiệu họ tên và quốc tịch', 'Hỏi thông tin làm quen với bạn mới'],
                grammarNotes: []
              },
              activities: [
                { activityKey: `${chapterKey}.S2.learn`, type: 'learn', titleVi: 'Từ vựng & Mẫu câu trọng tâm', required: true },
                { activityKey: `${chapterKey}.S2.dialogue`, type: 'dialogue', titleVi: 'Hội thoại tình huống thực tế', required: true },
                { activityKey: `${chapterKey}.S2.exam`, type: 'exam', titleVi: 'Kiểm tra tổng hợp cuối chặng', required: true }
              ]
            },
            {
              stageKey: `${chapterKey}.S3`,
              meta: {
                titleVi: 'Gia đình và nghề nghiệp',
                titleZh: '你家有几口人？',
                titlePinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
                canDoVi: ['Giới thiệu các thành viên trong gia đình', 'Nói về nghề nghiệp và nơi làm việc'],
                grammarNotes: []
              },
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
        streak: { count: 5, todayDone: true },
        streakDays: 5,
        minutesDone: 10,
        minutesGoal: 15,
        dailyGoalMinutes: 15,
        completedMinutes: 10,
        continue: { kind: 'lesson', lessonId: 'hsk30.L1.C1.S3' },
        items: [
          { kind: 'review', titleVi: 'Ôn từ đến hạn', dueCount: 12, estMinutes: 4, locked: false },
          { kind: 'errors', titleVi: 'Sửa lỗi hay sai', dueCount: 3, estMinutes: 2, locked: false },
          { kind: 'lesson', lessonId: 'hsk30.L1.C1.S3', titleVi: 'Chặng 3: Gia đình và nghề nghiệp', dueCount: 1, estMinutes: 8, locked: false }
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
      return jsonResponse({
        total: 3,
        categories: [
          { category: 'vocab_confusion', labelVi: 'Nhầm nghĩa từ vựng', titleVi: 'Nhầm nghĩa từ vựng', count: 2 },
          { category: 'tone_error', labelVi: 'Nhầm thanh điệu', titleVi: 'Nhầm thanh điệu', count: 1 }
        ],
        mistakes: [
          {
            itemKey: 'w:谢谢',
            word: '谢谢',
            hanzi: '谢谢',
            pinyin: 'xièxie',
            meaningVi: 'cảm ơn',
            skill: 'meaning',
            category: 'vocab_confusion',
            categoryLabelVi: 'Nhầm nghĩa từ vựng',
            givenDisplay: 'xin lỗi',
            expectedDisplay: 'cảm ơn (谢谢)',
            explanationVi: '谢谢 (xièxie) nghĩa là cảm ơn, còn 对不起 (duìbuqǐ) mới là xin lỗi.',
            wrongCount: 2,
            errorCount: 2,
            lastWrongAt: new Date().toISOString(),
            progress: { cleared: 1, needed: 2, nextCheckDay: '2026-11-10' }
          },
          {
            itemKey: 'w:不客气',
            word: '不客气',
            hanzi: '不客气',
            pinyin: 'bú kèqi',
            meaningVi: 'đừng khách sáo',
            skill: 'meaning',
            category: 'vocab_confusion',
            categoryLabelVi: 'Nhầm nghĩa từ vựng',
            givenDisplay: 'không sao',
            expectedDisplay: 'đừng khách sáo (不客气)',
            explanationVi: '不客气 dùng để đáp lại lời cảm ơn (谢谢), còn 没关系 dùng để đáp lại lời xin lỗi.',
            wrongCount: 1,
            errorCount: 1,
            lastWrongAt: new Date().toISOString(),
            progress: { cleared: 0, needed: 2, nextCheckDay: '2026-11-10' }
          },
          {
            itemKey: 'w:老师',
            word: '老师',
            hanzi: '老师',
            pinyin: 'lǎoshī',
            meaningVi: 'giáo viên, thầy cô',
            skill: 'pinyin',
            category: 'tone_error',
            categoryLabelVi: 'Nhầm thanh điệu',
            givenDisplay: 'lǎoshì',
            expectedDisplay: 'lǎoshī (thanh 1)',
            explanationVi: 'Chữ 师 (shī) mang thanh 1 (ngang cao), không phải thanh 4.',
            wrongCount: 1,
            errorCount: 1,
            lastWrongAt: new Date().toISOString(),
            progress: { cleared: 1, needed: 2, nextCheckDay: '2026-11-10' }
          }
        ]
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
    if (p.startsWith('/v1/games/daily/')) {
      const game = p.split('/v1/games/daily/')[1].split('/')[0] || 'ghep-chu';
      const isStart = p.endsWith('/start') && method === 'POST';
      if (isStart) {
        const round = game === 'tim-chu-trong-chu'
          ? await createTimChuRound('normal', 'daily', 0)
          : await createGhepChuRound('normal', 'daily', 0);
        return jsonResponse({
          date: new Date().toISOString().slice(0, 10),
          game,
          plays: 1,
          bestScore: 920,
          round
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
    if (p === '/v1/games/rank-runs' && method === 'POST') {
      const body = await parseRequestBody(init);
      const game = body.game || 'ghep-chu';
      const diff = body.difficulty || 'easy';
      const round = game === 'tim-chu-trong-chu'
        ? await createTimChuRound(diff, 'rank', 0)
        : await createGhepChuRound(diff, 'rank', 0);
      const run = {
        runId: `rankrun-${Date.now()}`,
        game,
        difficulty: diff,
        status: 'active',
        totalRounds: 1,
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
    if (p === '/v1/games/rounds' && method === 'POST') {
      const body = await parseRequestBody(init);
      const game = body.game || 'ghep-chu';
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
      const examType = (urlObj.searchParams.get('examType') || 'hsk').toLowerCase();
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
      return jsonResponse(data || { segments: [] });
    }
    if (p.includes('/v1/dictation/videos/') && method === 'GET') {
      const id = decodeURIComponent(p.split('/v1/dictation/videos/')[1].split('/')[0]);
      const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
      const video = all.find(v => v.id === id || v._id === id || v.slug === id || v.slugVi === id || toSlugVi(v.title || v.titleVi) === id) || all[0] || {};
      const realId = video.id || video._id || id;
      const segs = (await loadLocalJson(`/data/dictation/videos/${realId}-segments.json`)) || {};
      return jsonResponse({ ...video, ...(segs || {}) });
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
      if (subParts.length === 0) {
        const overview = await loadLocalJson(`/data/curriculums/${curr}/overview.json`);
        return jsonResponse(overview || { name: curr.toUpperCase(), slug: curr, levels: [] });
      }
      if (subParts[0] === 'levels' && subParts.length === 2) {
        const levelSlug = subParts[1];
        const lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
        return jsonResponse(lvlData || { curriculum: { slug: curr }, level: { slug: levelSlug, topics: [] } });
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
      return jsonResponse(overview || {});
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
  function isDynamicSpaRoute(pathname) {
    const p = (pathname || '/').replace(/\/+$/, '') || '/';
    const parts = p.split('/').filter(Boolean);
    if (parts[0] === 'han-tu' && parts.length >= 2) return true;
    if (parts[0] === 'tu-vung' && parts.length >= 2) return true;
    if (parts[0] === 'han-viet') return true;
    if (parts[0] === 'ngu-phap' && parts.length >= 3) return true;
    if (parts[0] === 'kiem-tra-ngu-phap' && parts[1] === 'lam-bai') return true;
    if (parts[0] && parts[0].startsWith('thu-vien-') && parts.length >= 2) return true;
    if (parts[0] === 'luyen-chep-chinh-ta' && parts.length >= 2) return true;
    if ((parts[0] === 'kiem-tra-hsk' && parts.length >= 2) || (parts[0] === 'de-kiem-tra' && parts[1] === 'lam-bai')) return true;
    if (parts[0] === 'hoc' && (parts[1] === 'chang' || parts[1] === 'bai' || parts[1] === 'kiem-tra-cap') && parts.length >= 3) return true;
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
    let url = typeof input === 'string' ? input : (input && input.url) || '';

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
      return handleApiRequest(fullUrl, init);
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
          Object.defineProperty(this, 'status', { value: 200, configurable: true });
          Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
          Object.defineProperty(this, 'responseText', { value: txt, configurable: true });
          Object.defineProperty(this, 'response', { value: txt, configurable: true });
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(new Event('load'));
          if (typeof this.onload === 'function') this.onload();
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
    const main = document.querySelector('main') || document.body;
    if (!customRoot) {
      Array.from(main.children).forEach(ch => {
        if (ch.id !== 'xhz-dynamic-page-root') {
          ch.style.display = 'none';
        }
      });
      customRoot = document.createElement('div');
      customRoot.id = 'xhz-dynamic-page-root';
      customRoot.className = 'mx-auto max-w-5xl px-4 py-8';
      customRoot.style.color = '#1c1917';
      main.prepend(customRoot);
    }
    customRoot.style.color = '#1c1917';
    return customRoot;
  }

  function restoreOriginalMainIfStatic() {
    const customRoot = document.getElementById('xhz-dynamic-page-root');
    if (customRoot) {
      const main = customRoot.parentElement;
      customRoot.remove();
      if (main) {
        Array.from(main.children).forEach(ch => {
          ch.style.display = '';
        });
      }
    }
  }

  function playPronunciation(text, audioUrl) {
    if (audioUrl) {
      const a = new window.Audio(rewriteMediaUrl(audioUrl));
      a.play().catch(() => {
        if ('speechSynthesis' in window && text) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'zh-CN';
          window.speechSynthesis.speak(u);
        }
      });
      return;
    }
    if ('speechSynthesis' in window && text) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
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
      const filtered = norm
        ? index.filter(x => (x.reading || '').toLowerCase().includes(norm) || (x.slug || '').includes(norm))
        : index.slice(0, 300);
      grid.innerHTML = filtered.map(item => `
        <a href="/han-viet/${encodeURIComponent(item.slug)}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:10px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-weight:600;">
          <span style="text-transform:capitalize;">${item.reading}</span>
          <span style="font-size:12px;padding:2px 8px;border-radius:999px;background:#ffedd5;color:#9a3412;">${item.charCount || (item.sampleChars && item.sampleChars.length) || 0}</span>
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
    const reading = data.reading || decodeURIComponent(slug);
    const chars = Array.isArray(data.characters) ? data.characters : (data.sampleChars || []);
    document.title = `Âm Hán Việt "${reading.toUpperCase()}" | XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/han-viet" style="color:#ea580c;font-weight:600;text-decoration:none;">← Danh sách Âm Hán Việt</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 16px 0;">Âm Hán Việt: <span style="color:#ea580c;text-transform:uppercase;">${reading}</span> (${chars.length} chữ Hán)</h1>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
          ${chars.map(c => {
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
    if (!item) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy chủ điểm ngữ pháp "${pointId}". <a href="/ngu-phap">Quay lại Ngữ pháp</a></div>`;
      return;
    }

    document.title = `${item.title} - Ngữ pháp ${item.level || levelSlug.toUpperCase()} | XieHanzi`;
    const examples = Array.isArray(item.example) ? item.example : (Array.isArray(item.examples) ? item.examples : []);

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/ngu-phap" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại Thư viện Ngữ pháp</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:28px;">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
          <span style="padding:4px 12px;border-radius:999px;background:#ffedd5;color:#9a3412;font-weight:700;font-size:13px;">${(item.level || levelSlug).toUpperCase()}</span>
          ${item.category ? `<span style="padding:4px 12px;border-radius:999px;background:#f5f5f4;color:#57534e;font-size:13px;">${item.category}</span>` : ''}
        </div>
        <h1 style="font-size:30px;font-weight:800;color:#1c1917;margin:0 0 12px 0;">${item.title}</h1>
        ${item.pattern ? `<div style="padding:14px 18px;background:#fff7ed;border-left:4px solid #ea580c;border-radius:10px;font-size:18px;font-weight:700;color:#9a3412;margin-bottom:16px;">📐 Cấu trúc: ${item.pattern}</div>` : ''}
        <div style="font-size:16px;line-height:1.7;color:#292524;margin-bottom:20px;">
          ${item.explanation || item.summary || ''}
        </div>
        <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:12px;">💬 Ví dụ minh họa (${examples.length})</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${examples.map(ex => `
            <div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;">
              <div style="font-size:19px;font-weight:700;color:#1c1917;">${ex.chinese || ex.hanzi || ''}</div>
              <div style="font-size:14px;color:#ea580c;margin-top:3px;">${ex.pinyin || ''}</div>
              <div style="font-size:15px;color:#44403c;margin-top:4px;">${ex.vietnamese || ex.meaningVi || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6.5. Trang Làm Bài Kiểm Tra Ngữ Pháp (/kiem-tra-ngu-phap/lam-bai)
  // --------------------------------------------------------------------------
  async function renderGrammarQuizRunPage(searchParams) {
    const root = getMainContentContainer();
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
        card.innerHTML = `
          ${headerHtml}
          <div style="font-size:20px;font-weight:700;color:#1c1917;margin-bottom:6px;">${q.stem || ''}</div>
          ${q.stemPinyin ? `<div style="font-size:14px;color:#ea580c;margin-bottom:4px;">${q.stemPinyin}</div>` : ''}
          ${q.vietnameseHint ? `<div style="font-size:14px;color:#57534e;margin-bottom:14px;">💡 Nghĩa: ${q.vietnameseHint}</div>` : ''}
          <div class="xhz-gq-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;"></div>
          <div class="xhz-gq-exp" style="display:none;margin-top:12px;padding:12px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;font-size:14px;"></div>
        `;
        const optsWrap = card.querySelector('.xhz-gq-opts');
        const expEl = card.querySelector('.xhz-gq-exp');
        const options = Array.isArray(q.options) ? q.options : [];
        options.forEach((optText, optIdx) => {
          const btn = document.createElement('button');
          btn.style.cssText = 'padding:12px 14px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;text-align:left;cursor:pointer;font-size:16px;font-weight:600;';
          btn.innerHTML = `<span style="color:#ea580c;font-weight:800;margin-right:6px;">${String.fromCharCode(65 + optIdx)}.</span> ${optText}`;
          btn.onclick = () => {
            if (!answeredSet.has(idx)) {
              answeredSet.add(idx);
              if (optIdx === q.correctIndex) correctCount++;
              updateBadge();
            }
            Array.from(optsWrap.children).forEach((b, bIdx) => {
              b.style.background = '#fff';
              b.style.borderColor = '#d6d3d1';
              b.style.color = '#1c1917';
              if (bIdx === q.correctIndex) {
                b.style.background = '#dcfce7';
                b.style.borderColor = '#16a34a';
                b.style.color = '#14532d';
              }
            });
            if (optIdx !== q.correctIndex) {
              btn.style.background = '#fee2e2';
              btn.style.borderColor = '#dc2626';
              btn.style.color = '#7f1d1d';
            }
            if (expEl) {
              expEl.style.display = 'block';
              expEl.innerHTML = `<strong>Đáp án đúng: ${String.fromCharCode(65 + (q.correctIndex || 0))}. ${options[q.correctIndex || 0] || ''}</strong><br/>${q.explanation || ''}`;
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
      'thu-vien-hsk': 'new-hsk',
      'thu-vien-yct': 'yct',
      'thu-vien-boyahsk': 'boya',
      'thu-vien-msutong': 'msutong',
      'thu-vien-giao-trinh-han-ngu': 'hanyu',
      'thu-vien-tu-vung': 'hsk',
      'thu-vien-chu-han': 'hsk'
    };
    const curr = currMap[rootSlug] || 'hsk';
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải nội dung giáo trình...</div>`;

    if (subParts.length === 1) {
      const levelSlug = subParts[0];
      let lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
      if (!lvlData && curr === 'new-hsk') {
        lvlData = await loadLocalJson(`/data/curriculums/hsk/levels/${levelSlug}.json`);
      }
      const levelObj = (lvlData && lvlData.level) || { name: levelSlug.toUpperCase(), topics: [] };
      const topics = Array.isArray(levelObj.topics) ? levelObj.topics : [];

      document.title = `${levelObj.name || levelSlug} - Giáo trình ${curr.toUpperCase()} | XieHanzi`;
      root.innerHTML = `
        <div style="margin-bottom:16px;">
          <a href="/${rootSlug}" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại ${rootSlug.replace(/-/g, ' ').toUpperCase()}</a>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
          <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">📘 ${levelObj.name || levelSlug.toUpperCase()}</h1>
          <p style="color:#57534e;margin-bottom:20px;">Tổng số từ vựng: <strong>${levelObj.wordCount || ''}</strong> • Số chủ đề/bài học: <strong>${topics.length}</strong></p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
            ${topics.map((t, i) => `
              <a href="/${rootSlug}/${levelSlug}/chu-de/${encodeURIComponent(t.topicSlug)}" style="display:block;padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                <div style="font-size:13px;color:#ea580c;font-weight:700;">Chủ đề ${i + 1}</div>
                <div style="font-size:18px;font-weight:700;margin-top:4px;color:#1c1917;">${t.topic}</div>
                <div style="font-size:14px;color:#57534e;margin-top:6px;">${t.wordCount || 0} từ vựng →</div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
      return;
    }

    const levelSlug = subParts[0];
    const itemSlug = subParts[subParts.length - 1];
    let detail =
      (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/hsk/topics/${levelSlug}--${itemSlug}.json`));

    const words = (detail && detail.topic && detail.topic.words) || (detail && detail.lesson && detail.lesson.words) || (detail && detail.words) || [];
    const title = (detail && detail.topic && detail.topic.name) || (detail && detail.lesson && detail.lesson.name) || decodeURIComponent(itemSlug);

    document.title = `${title} - ${levelSlug.toUpperCase()} | XieHanzi`;
    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/${rootSlug}/${levelSlug}" style="color:#ea580c;font-weight:600;text-decoration:none;">← Quay lại ${levelSlug.toUpperCase()}</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 16px 0;">📖 ${title} (${words.length} mục)</h1>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;">
          ${words.map(w => {
            const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
            const py = w.wordPinyin || w.pinyin || '';
            const hv = w.hanviet || '';
            const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
            const link = hz.length === 1 ? `/han-tu/${encodeURIComponent(hz)}` : `/tu-vung/${encodeURIComponent(hz)}`;
            return `<div style="padding:14px 16px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;justify-content:space-between;color:#1c1917;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <a href="${link}" style="font-size:24px;font-weight:800;color:#1c1917;text-decoration:none;">${hz}</a>
                  <button onclick="window.__xhzPlayAudio('${hz}')" style="border:none;background:#ffedd5;color:#9a3412;border-radius:999px;padding:4px 10px;cursor:pointer;font-size:13px;font-weight:700;">🔊 ${py}</button>
                </div>
                ${hv ? `<div style="font-size:12px;color:#78716c;text-transform:uppercase;margin-top:2px;">Hán Việt: ${hv}</div>` : ''}
                <div style="font-size:15px;color:#292524;margin-top:6px;">${vi}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6.7. Trang Chi Tiết Video Nghe Chép Chính Tả (/luyen-chep-chinh-ta/:id)
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
    const segments = Array.isArray(segData.segments) ? segData.segments : (Array.isArray(video.segments) ? video.segments : []);
    const ytId = video.youtubeId || video.videoId || '';

    document.title = `${video.titleVi || video.title || 'Nghe chép chính tả'} | XieHanzi`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/luyen-chep-chinh-ta" style="color:#ea580c;font-weight:600;text-decoration:none;">← Danh sách Video Nghe Chép Chính Tả</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;">
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;">
          <h1 style="font-size:22px;font-weight:800;color:#1c1917;margin:0 0 12px 0;">🎬 ${video.titleVi || video.title}</h1>
          ${ytId ? `
            <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:14px;background:#000;">
              <iframe src="https://www.youtube.com/embed/${ytId}?enablejsapi=1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
            </div>
          ` : ''}
          <div style="margin-top:16px;padding:14px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;">
            <div style="font-weight:700;color:#9a3412;margin-bottom:8px;">✍️ Chép chính tả câu đang nghe:</div>
            <input id="xhz-dict-input" type="text" placeholder="Gõ chữ Hán hoặc Pinyin bạn nghe được..." style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #fdba74;font-size:16px;color:#1c1917;background:#fff;" />
            <div id="xhz-dict-feedback" style="margin-top:8px;font-size:14px;color:#78716c;">Nhấn vào bất kỳ câu thoại nào bên phải để kiểm tra đáp án.</div>
          </div>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;max-height:600px;overflow-y:auto;">
          <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin:0 0 12px 0;">📜 Phụ đề song ngữ (${segments.length} câu)</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${segments.map((s, idx) => {
              const zh = s.hanzi || s.chinese || s.text || s.zh || '';
              const py = s.pinyin || '';
              const vi = s.vietnamese || s.meaningVi || s.translation || s.vi || '';
              return `<div class="xhz-seg-item" data-zh="${zh.replace(/"/g, '&quot;')}" style="padding:12px 14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;cursor:pointer;color:#1c1917;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:12px;font-weight:700;color:#ea580c;">Câu #${idx + 1}</span>
                  <button onclick="window.__xhzPlayAudio('${zh.replace(/'/g, '')}')" style="border:none;background:#e7e5e4;color:#1c1917;border-radius:999px;padding:2px 10px;font-size:12px;cursor:pointer;font-weight:600;">🔊 Đọc mẫu</button>
                </div>
                <div style="font-size:18px;font-weight:700;color:#1c1917;margin-top:4px;">${zh}</div>
                <div style="font-size:14px;color:#ea580c;">${py}</div>
                <div style="font-size:14px;color:#57534e;margin-top:2px;">${vi}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    const dictInput = document.getElementById('xhz-dict-input');
    const dictFb = document.getElementById('xhz-dict-feedback');
    if (dictInput && dictFb) {
      dictInput.oninput = () => {
        const val = dictInput.value.trim();
        if (!val) {
          dictFb.textContent = 'Nhập chữ Hán để đối chiếu phụ đề.';
          return;
        }
        const matched = segments.find(s => (s.hanzi || s.chinese || s.text || '').includes(val));
        if (matched) {
          dictFb.innerHTML = `<span style="color:#16a34a;font-weight:700;">✓ Chính xác! Khớp với câu: "${matched.hanzi || matched.chinese || matched.text}" (${matched.vietnamese || matched.meaningVi || ''})</span>`;
        } else {
          dictFb.innerHTML = `<span style="color:#d97706;">Đang gõ: "${val}" — tiếp tục nhập hoặc nhấn vào phụ đề để xem gợi ý.</span>`;
        }
      };
    }
  }

  // --------------------------------------------------------------------------
  // 6.8. Trang Làm Đề Thi HSK / YCT (/kiem-tra-hsk/... và /de-kiem-tra/lam-bai/:id)
  // --------------------------------------------------------------------------
  async function renderHskTestPaperPage(pathname) {
    const root = getMainContentContainer();
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
      paper = await loadLocalJson('/data/tests/papers/hsk30-1.json');
    }

    const questions =
      (paper && Array.isArray(paper.questions) && paper.questions.length > 0 && paper.questions) ||
      (paper && Array.isArray(paper.sections) ? paper.sections.flatMap(s => s.questions || []) : []);

    const title = (paper && (paper.title || paper.name || paper.testId)) || `Đề thi ${lastPart.toUpperCase()}`;
    const fullAudio = paper && paper.audioUrl ? rewriteMediaUrl(paper.audioUrl) : '';
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
      const prompt = q.prompt || q.question || q.stem || q.text || q.transcript || `Câu hỏi số ${qNum}`;
      const pinyin = q.pinyin || q.transcriptPinyin || '';
      const qAudio = q.audioUrl ? rewriteMediaUrl(q.audioUrl) : '';
      const qImg = q.imageUrl || q.image ? rewriteMediaUrl(q.imageUrl || q.image) : '';
      const qImgs = Array.isArray(q.images) ? q.images.map(u => rewriteMediaUrl(u)) : [];
      let rawOpts = Array.isArray(q.options) ? q.options : (Array.isArray(q.choices) ? q.choices : []);
      if (rawOpts.length === 0) {
        if (q.kind === 'true_false') {
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

      // Shared image bank for image_match or multiple images
      const sharedImagesHtml = (q.kind === 'image_match' && qImgs.length > 0)
        ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px;">
            ${qImgs.map((u, i) => `
              <div style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:8px;text-align:center;">
                <div style="font-weight:800;color:#ea580c;font-size:14px;margin-bottom:4px;">Hình ${String.fromCharCode(65 + i)}</div>
                <img src="${u}" alt="Hình ${String.fromCharCode(65 + i)}" style="max-height:110px;max-width:100%;border-radius:8px;object-fit:contain;margin:0 auto;" />
              </div>
            `).join('')}
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
        ${qImg ? `<div style="margin-bottom:12px;"><img src="${qImg}" alt="Câu ${qNum}" style="max-height:180px;border-radius:12px;border:1px solid #e7e5e4;background:#fff;padding:6px;" /></div>` : ''}
        ${sharedImagesHtml}
        <div class="xhz-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;"></div>
        <div class="xhz-exp" style="display:none;margin-top:12px;padding:12px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;font-size:14px;color:#78350f;"></div>
      `;

      const optsWrap = card.querySelector('.xhz-opts');
      const expEl = card.querySelector('.xhz-exp');

      rawOpts.forEach((opt, oIdx) => {
        const key = typeof opt === 'object' ? (opt.key || opt.label || opt.id || String.fromCharCode(65 + oIdx)) : String.fromCharCode(65 + oIdx);
        const text = typeof opt === 'object' ? (opt.text || opt.hanzi || opt.content || opt.value || key) : String(opt);
        const optImg = (typeof opt === 'object' && (opt.image || opt.imageUrl))
          ? rewriteMediaUrl(opt.image || opt.imageUrl)
          : (q.kind === 'image_choice' && qImgs[oIdx] ? qImgs[oIdx] : '');

        const btn = document.createElement('button');
        btn.style.cssText = 'padding:12px 14px;border-radius:12px;border:2px solid #d6d3d1;background:#ffffff;color:#1c1917;text-align:left;cursor:pointer;font-size:15px;font-weight:700;transition:all 0.15s;display:flex;flex-direction:column;gap:8px;';
        btn.innerHTML = `
          <div><span style="color:#ea580c;font-weight:800;margin-right:6px;">${key.toUpperCase()}.</span> <span style="color:#1c1917;">${text}</span></div>
          ${optImg ? `<img src="${optImg}" alt="Phương án ${key}" style="max-height:130px;width:100%;object-fit:contain;border-radius:8px;background:#fafaf9;padding:4px;" />` : ''}
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

      listEl.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 6.9. Trang Chặng Học / Bài Học (/hoc/chang/:stageKey, /hoc/bai/:runId)
  // --------------------------------------------------------------------------
  async function renderStudyStageOrRunPage(pathname) {
    const root = getMainContentContainer();
    const parts = pathname.split('/').filter(Boolean);
    const mode = parts[1];
    const slug = decodeURIComponent(parts[2] || 'hsk-1');

    const lvlMatch = slug.match(/\d+/);
    const lvlNum = lvlMatch ? lvlMatch[0] : '1';
    const lvlData = (await loadLocalJson(`/data/curriculums/new-hsk/levels/new-hsk-${lvlNum}.json`)) || (await loadLocalJson('/data/curriculums/hsk/levels/hsk-1.json'));
    const topics = (lvlData && lvlData.level && lvlData.level.topics) || [];
    const firstTopicSlug = (topics[0] && topics[0].topicSlug) || 'chao-hoi-giao-tiep';
    const topicDetail =
      (await loadLocalJson(`/data/curriculums/new-hsk/lessons/new-hsk-${lvlNum}--bai-1-hello-ai-xiaoyu.json`)) ||
      (await loadLocalJson(`/data/curriculums/hsk/topics/hsk-1--${firstTopicSlug}.json`));
    const words = (topicDetail && topicDetail.lesson && topicDetail.lesson.words) || (topicDetail && topicDetail.topic && topicDetail.topic.words) || [];

    document.title = `Học theo lộ trình HSK ${lvlNum} | XieHanzi`;
    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/hoc" style="color:#ea580c;font-weight:700;text-decoration:none;">← Quay lại Lộ trình Học</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <h1 style="font-size:26px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">🚀 ${mode === 'chang' ? `Chặng học: ${slug.toUpperCase()}` : `Bài luyện tập: ${slug}`}</h1>
        <p style="color:#57534e;margin-bottom:20px;">Hãy ôn tập từ vựng và bấm vào từng thẻ để nghe phát âm hoặc xem chi tiết nét viết chữ Hán.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
          ${words.slice(0, 30).map(w => {
            const hz = (w.hanzi || w.word || '').replace(/\{|\}/g, '');
            const py = w.wordPinyin || w.pinyin || '';
            const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
            return `<div style="padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;color:#1c1917;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <a href="/tu-vung/${encodeURIComponent(hz)}" style="font-size:26px;font-weight:800;color:#1c1917;text-decoration:none;">${hz}</a>
                <button onclick="window.__xhzPlayAudio('${hz}')" style="padding:4px 10px;border-radius:999px;background:#ffedd5;color:#9a3412;border:none;font-weight:700;cursor:pointer;">🔊 ${py}</button>
              </div>
              <div style="font-size:15px;color:#292524;margin-top:8px;">${vi}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
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
    if (parts[0] && parts[0].startsWith('thu-vien-') && parts.length >= 2) {
      lastHandledFullUrl = fullKey;
      await renderCurriculumSubPage(pathname);
      return;
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

    lastHandledFullUrl = fullKey;
    restoreOriginalMainIfStatic();
  }

  // Capture-phase click handler for internal <a> links so static export never stalls on missing .rsc files
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
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
  };
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    setTimeout(checkAndRenderDynamicPage, 30);
  };
  window.addEventListener('popstate', () => setTimeout(checkAndRenderDynamicPage, 30));

  function boot() {
    rewriteDomMedia(document);
    supabaseFetchInitial();
    checkAndRenderDynamicPage();

    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) rewriteDomMedia(node);
        });
      }
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
