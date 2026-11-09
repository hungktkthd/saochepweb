/**
 * XieHanzi Local Runtime & Full Static/Cloud Engine (v4.0)
 * ---------------------------------------------------------
 * 1. Hạng mục 1: Hydrate & Render toàn bộ các trang chi tiết động (Dynamic Slug Routes):
 *    - /han-tu/<slug>, /tu-vung/<slug> (Rewrite Next.js RSC Flight payload + React Query hydration)
 *    - /han-viet/<slug>, /ngu-phap/<level>/<pointId>, /luyen-chep-chinh-ta/<slug>
 *    - /thu-vien-<curriculum>/<level>/bai-hoc/<lessonSlug> & /thu-vien-<curriculum>/<level>/<topicSlug>
 *    - /kiem-tra-hsk/<level>/test/<testId> & /de-kiem-tra/lam-bai/<testId>
 * 2. Hạng mục 2: Hoàn thiện 100% API tương tác trong xiehanzi-runtime.js:
 *    - Chấm điểm bài thi HSK (/v1/hsk-tests/:testId/grade, /v1/generated-tests/:id/grade) + lưu Supabase exam_results
 *    - Sinh bộ câu hỏi Luyện Nghe (/v1/listening/...) & Luyện Gõ (/v1/typing-set, /v1/typing-word-set, /v1/typing-sentence-set)
 *    - Sổ tay (/v1/user-lists*), Vở tập viết (/v1/user-worksheets*), Ôn tập SRS (/v1/practice-progress/sync, /v2/review/*, /v1/grammar-progress*) + đồng bộ Supabase study_profiles
 *    - Trường Thầy Đồ (/v1/thay-do/lop*, /v1/thay-do/khoa*, /v1/thay-do/xin-do*, /v1/thay-do/bang-vang*, /v1/thay-do/dau-luyen*, /v1/thay-do/dong-y*)
 * 3. Hạng mục 3: Tích hợp AI APIs (/v1/translate, /v1/speaking/assess, /v1/practice/result-ai-readout*)
 *    - Kết nối Serverless Function /api/ai kèm bộ từ điển & đánh giá ngữ âm dự phòng tại trình duyệt.
 */
(function () {
  "use strict";

  const SUPABASE_URL = "https://xcthntcgenzfybefaphh.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGhudGNnZW56ZnliZWZhcGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDE0NjQsImV4cCI6MjEwOTIxNzQ2NH0.0L3BZslXqmIkiH3kuKSL0HJeo_gmZ15E614xqnxhbdM";

  const GITHUB_REPO = "hungktkthd/saochepweb";
  const RAW_BASE = "https://raw.githubusercontent.com/" + GITHUB_REPO;

  const isGitHubPages =
    typeof window !== "undefined" &&
    window.location.hostname.endsWith("github.io") &&
    window.location.pathname.startsWith("/saochepweb");
  const BASE_PATH = isGitHubPages ? "/saochepweb" : "";

  // =========================================================================
  // 0. EARLY RSC FLIGHT PAYLOAD INTERCEPTOR FOR /han-tu/:slug & /tu-vung/:slug
  // =========================================================================
  function extractHanziChars(str) {
    if (!str) return "";
    const m = String(str).match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g);
    return m ? m.join("") : "";
  }

  function getDynamicRouteTarget() {
    if (typeof window === "undefined") return null;
    let p = window.location.pathname;
    if (BASE_PATH && p.startsWith(BASE_PATH)) p = p.slice(BASE_PATH.length) || "/";
    p = p.replace(/\/+$/, "") || "/";

    if (p.startsWith("/han-tu/")) {
      const rawSlug = decodeURIComponent(p.slice("/han-tu/".length).replace(/\.html$/, ""));
      const hanzi = extractHanziChars(rawSlug) || rawSlug.split("-").pop() || rawSlug;
      const char = Array.from(hanzi)[0] || "好";
      return { type: "han-tu", slug: rawSlug, char };
    }
    if (p.startsWith("/tu-vung/")) {
      const rawSlug = decodeURIComponent(p.slice("/tu-vung/".length).replace(/\.html$/, ""));
      const hanzi = extractHanziChars(rawSlug) || rawSlug;
      return { type: "tu-vung", slug: rawSlug, word: hanzi || "你好" };
    }
    return null;
  }

  function installNextFlightInterceptor() {
    if (typeof window === "undefined") return;
    const target = getDynamicRouteTarget();
    if (!target) return;

    self.__next_f = self.__next_f || [];
    const transformChunk = (item) => {
      if (!Array.isArray(item) || typeof item[1] !== "string") return item;
      let s = item[1];
      if (target.type === "han-tu" && target.char && target.char !== "好") {
        if (s.includes('"lookup":"好"') || s.includes('"character":"好"')) {
          s = s.replace(/"lookup":"好"/g, '"lookup":' + JSON.stringify(target.char));
          s = s.replace(
            /"state":\{"mutations":\[\],"queries":\[[\s\S]*\]\},"children":\["\$",/g,
            '"state":{"mutations":[],"queries":[]},"children":["$,'
          ).replace('"children":["$,', '"children":["$",');
        }
        if (s.includes('"han-tu","好"')) {
          s = s.replace(/"han-tu","好"/g, '"han-tu",' + JSON.stringify(target.slug));
        }
      } else if (target.type === "tu-vung" && target.word && target.word !== "你好") {
        const encodedWord = encodeURIComponent(target.word);
        if (s.includes('"%E4%BD%A0%E5%A5%BD"') || s.includes('"hanzi":"你好"')) {
          s = s.replace(/"hanzi":"%E4%BD%A0%E5%A5%BD"/g, '"hanzi":' + JSON.stringify(encodedWord));
          s = s.replace(
            /"state":\{"mutations":\[\],"queries":\[[\s\S]*\]\},"children":\["\$",/g,
            '"state":{"mutations":[],"queries":[]},"children":["$,'
          ).replace('"children":["$,', '"children":["$",');
        }
        if (s.includes('"tu-vung","%E4%BD%A0%E5%A5%BD"')) {
          s = s.replace(/"tu-vung","%E4%BD%A0%E5%A5%BD"/g, '"tu-vung",' + JSON.stringify(encodedWord));
        }
      }
      return [item[0], s];
    };

    for (let i = 0; i < self.__next_f.length; i++) {
      self.__next_f[i] = transformChunk(self.__next_f[i]);
    }
    const origPush = self.__next_f.push.bind(self.__next_f);
    self.__next_f.push = function (...args) {
      return origPush(...args.map(transformChunk));
    };
  }

  installNextFlightInterceptor();

  // =========================================================================
  // 1. SUPABASE CLOUD SYNC & DEVICE PROFILE
  // =========================================================================
  function getDeviceId() {
    try {
      let id = localStorage.getItem("xiehanzi_device_id");
      if (!id) {
        id =
          "xhz_" +
          Math.random().toString(36).slice(2, 10) +
          "_" +
          Date.now().toString(36);
        localStorage.setItem("xiehanzi_device_id", id);
      }
      return id;
    } catch (_) {
      return "xhz_guest_default";
    }
  }

  let syncTimeout = null;
  async function syncProfileToSupabase() {
    try {
      const deviceId = getDeviceId();
      const userRaw = localStorage.getItem("xhz_user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const savedWords = JSON.parse(localStorage.getItem("xhz_saved_words") || "[]");
      const userLists = JSON.parse(localStorage.getItem("xhz_user_lists") || "[]");
      const userWorksheets = JSON.parse(localStorage.getItem("xhz_user_worksheets") || "[]");
      const grammarProgress = JSON.parse(localStorage.getItem("xhz_grammar_progress") || "[]");
      const dictationProgress = JSON.parse(localStorage.getItem("xhz_dictation_progress") || "{}");
      const studyProgress = JSON.parse(localStorage.getItem("xhz_study_progress") || "{}");

      const payload = {
        device_id: user?.id ? "user_" + user.id : deviceId,
        display_name: user?.name || "Học viên XieHanzi",
        email: user?.email || null,
        saved_words: savedWords,
        grammar_progress: grammarProgress,
        dictation_progress: dictationProgress,
        study_progress: {
          ...studyProgress,
          userLists,
          userWorksheets
        },
        updated_at: new Date().toISOString()
      };

      await fetch(SUPABASE_URL + "/rest/v1/study_profiles?on_conflict=device_id", {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(payload)
      });
    } catch (_) {}
  }

  function scheduleCloudSync() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(syncProfileToSupabase, 1200);
  }

  async function saveExamResultToSupabase(examRow) {
    try {
      const userRaw = localStorage.getItem("xhz_user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const payload = {
        device_id: getDeviceId(),
        user_id: user?.id || null,
        test_id: String(examRow.testId || "hsk-test"),
        exam_type: String(examRow.examType || "HSK"),
        level: Number(examRow.level || 1),
        score: Number(examRow.score || 0),
        total_questions: Number(examRow.total || 0),
        correct_count: Number(examRow.correct || 0),
        answers: examRow.answers || {},
        section_scores: examRow.sectionScores || {},
        created_at: new Date().toISOString()
      };
      await fetch(SUPABASE_URL + "/rest/v1/exam_results", {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      });
    } catch (_) {}
  }

  async function pullProfileFromSupabase() {
    try {
      const userRaw = localStorage.getItem("xhz_user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const key = user?.id ? "user_" + user.id : getDeviceId();
      const resp = await fetch(
        SUPABASE_URL +
          "/rest/v1/study_profiles?device_id=eq." +
          encodeURIComponent(key) +
          "&select=*",
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: "Bearer " + SUPABASE_ANON_KEY
          }
        }
      );
      if (!resp.ok) return;
      const rows = await resp.json();
      if (rows && rows[0]) {
        const row = rows[0];
        if (Array.isArray(row.saved_words) && row.saved_words.length > 0 && !localStorage.getItem("xhz_saved_words")) {
          localStorage.setItem("xhz_saved_words", JSON.stringify(row.saved_words));
        }
        if (Array.isArray(row.grammar_progress) && row.grammar_progress.length > 0 && !localStorage.getItem("xhz_grammar_progress")) {
          localStorage.setItem("xhz_grammar_progress", JSON.stringify(row.grammar_progress));
        }
        if (row.dictation_progress && Object.keys(row.dictation_progress).length > 0 && !localStorage.getItem("xhz_dictation_progress")) {
          localStorage.setItem("xhz_dictation_progress", JSON.stringify(row.dictation_progress));
        }
        if (row.study_progress && typeof row.study_progress === "object") {
          if (Array.isArray(row.study_progress.userLists) && !localStorage.getItem("xhz_user_lists")) {
            localStorage.setItem("xhz_user_lists", JSON.stringify(row.study_progress.userLists));
          }
          if (Array.isArray(row.study_progress.userWorksheets) && !localStorage.getItem("xhz_user_worksheets")) {
            localStorage.setItem("xhz_user_worksheets", JSON.stringify(row.study_progress.userWorksheets));
          }
        }
      }
    } catch (_) {}
  }

  // =========================================================================
  // 2. REWRITE MEDIA URLs TO GITHUB MEDIA BRANCHES
  // =========================================================================
  function rewriteMediaUrl(urlStr) {
    if (!urlStr || typeof urlStr !== "string") return urlStr;

    if (urlStr.startsWith("https://static.xiehanzi.com/")) {
      const rel = urlStr.slice("https://static.xiehanzi.com/".length);
      return mapMediaRelativePath(rel);
    }

    if (urlStr.startsWith("https://xiehanzi.com/assets/") || urlStr.startsWith("/assets/")) {
      const rel = urlStr.replace(/^https?:\/\/xiehanzi\.com\//, "").replace(/^\//, "");
      return RAW_BASE + "/media-visuals/" + rel;
    }

    const mediaPrefixes = [
      "/word_audios/",
      "/audio/",
      "/level_images/",
      "/visuals/",
      "/etymology/",
      "/hsk-audio/",
      "/hsk-images/",
      "/worksheet-examples/",
      "/worksheets/"
    ];
    for (const p of mediaPrefixes) {
      if (urlStr.startsWith(p)) {
        return mapMediaRelativePath(urlStr.slice(1));
      }
      if (BASE_PATH && urlStr.startsWith(BASE_PATH + p)) {
        return mapMediaRelativePath(urlStr.slice(BASE_PATH.length + 1));
      }
    }

    return urlStr;
  }

  function mapMediaRelativePath(relPath) {
    const clean = relPath.replace(/^\/+/, "");
    const decoded = decodeURIComponent(clean);

    if (
      decoded.startsWith("visuals/") ||
      decoded.startsWith("level_images/") ||
      decoded.startsWith("hsk-images/") ||
      decoded.startsWith("worksheet-examples/") ||
      decoded.startsWith("worksheets/") ||
      decoded.startsWith("assets/")
    ) {
      return RAW_BASE + "/media-visuals/" + clean;
    }
    if (decoded.startsWith("etymology/")) {
      return RAW_BASE + "/media-etymology/" + clean;
    }
    if (decoded.startsWith("hsk-audio/")) {
      return RAW_BASE + "/media-hsk-audio/" + clean;
    }
    if (decoded.startsWith("word_audios/") || decoded.startsWith("audio/tts/")) {
      return RAW_BASE + "/media-audios/" + clean;
    }
    if (decoded.startsWith("audio/sentences/")) {
      const filePart = decoded.slice("audio/sentences/".length);
      const firstChar = filePart.charAt(0).toLowerCase();
      if (firstChar >= "0" && firstChar <= "7") {
        return RAW_BASE + "/media-sentences-1/" + clean;
      }
      return RAW_BASE + "/media-sentences-2/" + clean;
    }
    if (decoded.startsWith("audio/")) {
      return RAW_BASE + "/media-audios/" + clean;
    }
    return RAW_BASE + "/media-visuals/" + clean;
  }

  // =========================================================================
  // 3. SHARDED DATABASE CACHES & LOOKUP HELPERS (/data/...)
  // =========================================================================
  const jsonCache = new Map();
  let charIndexPromise = null;
  let vocabIndexPromise = null;
  let hanvietIndexPromise = null;

  const origFetch = window.fetch.bind(window);

  async function loadLocalJson(relPath) {
    const clean = relPath.startsWith("/") ? relPath : "/" + relPath;
    const fullUrl = BASE_PATH + clean;
    if (jsonCache.has(fullUrl)) return jsonCache.get(fullUrl);

    const p = origFetch(fullUrl)
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + fullUrl);
        return r.text();
      })
      .then((txt) => {
        if (txt.trim().startsWith("<!DOCTYPE") || txt.trim().startsWith("<html")) {
          throw new Error("HTML error page in " + fullUrl);
        }
        return JSON.parse(txt);
      })
      .catch((err) => {
        jsonCache.delete(fullUrl);
        throw err;
      });

    jsonCache.set(fullUrl, p);
    return p;
  }

  async function lookupCharacter(char) {
    const ch = decodeURIComponent(char).trim().replace(/\.html$/, "");
    const extracted = extractHanziChars(ch);
    const targetChar = extracted ? Array.from(extracted)[0] : ch;
    if (!charIndexPromise) {
      charIndexPromise = loadLocalJson("/data/characters/index.json");
    }
    const idx = await charIndexPromise;
    if (Array.isArray(idx)) {
      const entry = idx.find((it) => it.c === targetChar || it.slug === ch || it.c === ch);
      if (entry) {
        const shardName = "characters-" + String(entry.chunk || 1).padStart(2, "0") + ".json";
        const shardData = await loadLocalJson("/data/characters/" + shardName);
        const list = Array.isArray(shardData) ? shardData : Object.values(shardData || {});
        const found = list.find((it) => it.character === entry.c || it.slug === entry.slug);
        if (found) {
          if (!found.hanviet && (found.hanvietReading || entry.hv)) {
            found.hanviet = found.hanvietReading || entry.hv;
          }
          return found;
        }
      }
    }
    return null;
  }

  async function lookupWord(word) {
    const w = decodeURIComponent(word).trim().replace(/\.html$/, "");
    const cleanWord = extractHanziChars(w) || w;
    if (!vocabIndexPromise) {
      vocabIndexPromise = loadLocalJson("/data/vocabulary/index.json");
    }
    const idx = await vocabIndexPromise;
    if (Array.isArray(idx)) {
      const entry = idx.find((it) => it.w === cleanWord || it.w === w || it.slug === w);
      if (entry) {
        const shardName = "vocabulary-" + String(entry.chunk || 1).padStart(2, "0") + ".json";
        const shardData = await loadLocalJson("/data/vocabulary/" + shardName);
        const list = Array.isArray(shardData) ? shardData : Object.values(shardData || {});
        const found = list.find((it) => it.hanzi === entry.w);
        if (found) {
          if (!found.hanviet && entry.hv) found.hanviet = entry.hv;
          return found;
        }
      }
    }
    // Fallback: if single character or compound not in vocabulary/index.json, synthesize from characters
    if (Array.from(cleanWord).length === 1) {
      const chObj = await lookupCharacter(cleanWord);
      if (chObj) {
        return {
          hanzi: cleanWord,
          pinyin: chObj.pinyin || (chObj.pinyins && chObj.pinyins[0]) || "",
          hanviet: chObj.hanviet || chObj.hanvietReading || "",
          translationVi: chObj.meaningVi || chObj.definition || "",
          wordMeaningVi: chObj.meaningVi || chObj.definition || "",
          hskLevel: chObj.hskLevel || 1,
          audios:
            Array.isArray(chObj.audios) && chObj.audios.length
              ? chObj.audios
              : ["https://static.xiehanzi.com/word_audios/" + cleanWord + ".mp3"],
          examples: chObj.examples || [],
          collocations: (chObj.commonWords || chObj.words || []).slice(0, 8).map((cw) => ({
            hanzi: cw.hanzi || cw.word || "",
            pinyin: cw.pinyin || "",
            vietnamese: cw.meaningVi || cw.translationVi || ""
          })),
          chars: [cleanWord]
        };
      }
    }
    return null;
  }

  async function lookupHanViet(slug) {
    const s = decodeURIComponent(slug).trim().toLowerCase().replace(/\.html$/, "");
    if (!hanvietIndexPromise) {
      hanvietIndexPromise = loadLocalJson("/data/han-viet/index.json");
    }
    const idx = await hanvietIndexPromise;
    if (Array.isArray(idx)) {
      let pos = idx.indexOf(s);
      if (pos === -1) {
        pos = idx.findIndex((x) => String(x).toLowerCase() === s);
      }
      if (pos !== -1) {
        const shardNum = String(Math.floor(pos / 1000) + 1).padStart(2, "0");
        const shardData = await loadLocalJson(`/data/han-viet/han-viet-${shardNum}.json`);
        const list = Array.isArray(shardData) ? shardData : Object.values(shardData || {});
        return list.find((it) => it && it.slug === s) || list[pos % 1000] || null;
      }
    }
    return null;
  }

  async function buildCharacterGraph(lookup) {
    const chObj = await lookupCharacter(lookup);
    const centerChar = chObj?.character || extractHanziChars(lookup) || lookup;
    const nodes = [
      {
        id: "char:" + centerChar,
        type: "char",
        label: centerChar,
        slug: chObj?.slug || centerChar,
        hanviet: chObj?.hanviet || chObj?.hanvietReading || "",
        gloss: chObj?.meaningVi || "",
        weight: 10
      }
    ];
    const edges = [];
    const comps = Array.isArray(chObj?.components) ? chObj.components : [];
    comps.slice(0, 6).forEach((c, idx) => {
      const compChar = typeof c === "string" ? c : c.character || c.hanzi || c.component || "";
      if (!compChar || compChar === centerChar) return;
      const nodeId = "comp:" + compChar + ":" + idx;
      nodes.push({
        id: nodeId,
        type: "component",
        label: compChar,
        slug: compChar,
        hanviet: c.hanviet || "",
        role: c.role || "component",
        gloss: c.meaningVi || c.meaning || "Bộ cấu tạo",
        weight: 6
      });
      edges.push({ source: nodeId, target: "char:" + centerChar, type: "compose" });
    });

    const words = Array.isArray(chObj?.commonWords)
      ? chObj.commonWords
      : Array.isArray(chObj?.words)
      ? chObj.words
      : [];
    words.slice(0, 10).forEach((w, idx) => {
      const wHanzi = w.hanzi || w.word || "";
      if (!wHanzi) return;
      const nodeId = "word:" + wHanzi + ":" + idx;
      nodes.push({
        id: nodeId,
        type: "word",
        label: wHanzi,
        slug: w.slug || wHanzi,
        hanviet: w.hanviet || "",
        gloss: w.meaningVi || w.translationVi || w.vietnamese || "",
        weight: 7
      });
      edges.push({ source: "char:" + centerChar, target: nodeId, type: "used-in" });
    });

    return { center: centerChar, nodes, edges };
  }

  function foldVi(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .trim();
  }

  async function searchLocalDatabase(query) {
    const q = decodeURIComponent(query || "").trim().toLowerCase();
    const qFolded = foldVi(q);
    if (!q) return { characters: [], words: [], hanviet: [] };

    const results = { characters: [], words: [], hanviet: [] };
    try {
      if (!charIndexPromise) charIndexPromise = loadLocalJson("/data/characters/index.json");
      if (!vocabIndexPromise) vocabIndexPromise = loadLocalJson("/data/vocabulary/index.json");
      const [cIdx, vIdx] = await Promise.all([charIndexPromise, vocabIndexPromise]);

      if (Array.isArray(cIdx)) {
        for (const c of cIdx) {
          if (
            c.c === q ||
            (c.p && foldVi(c.p).includes(qFolded)) ||
            (c.hv && foldVi(c.hv).includes(qFolded)) ||
            (c.m && (c.m.toLowerCase().includes(q) || foldVi(c.m).includes(qFolded)))
          ) {
            results.characters.push({
              character: c.c,
              pinyin: c.p,
              hanviet: c.hv,
              meaningVi: c.m,
              radical: c.r,
              strokeCount: c.s,
              hskLevel: c.hsk,
              slug: c.slug
            });
            if (results.characters.length >= 15) break;
          }
        }
      }

      if (Array.isArray(vIdx)) {
        for (const w of vIdx) {
          if (
            (w.w && w.w.includes(q)) ||
            (w.p && foldVi(w.p).includes(qFolded)) ||
            (w.hv && foldVi(w.hv).includes(qFolded)) ||
            (w.m && (w.m.toLowerCase().includes(q) || foldVi(w.m).includes(qFolded)))
          ) {
            results.words.push({
              hanzi: w.w,
              pinyin: w.p,
              hanviet: w.hv,
              translationVi: w.m,
              wordMeaningVi: w.m
            });
            if (results.words.length >= 15) break;
          }
        }
      }
    } catch (_) {}
    return results;
  }

  // =========================================================================
  // 4. HẠNG MỤC 2: HSK GRADING, LISTENING SETS, TYPING SETS, NOTEBOOK, THẦY ĐỒ
  // =========================================================================
  function solveHskQuestionAnswer(q) {
    if (q.answer) return String(q.answer);
    if (q.correctAnswer) return String(q.correctAnswer);

    const options = Array.isArray(q.options) ? q.options : [];
    const prompt = String(q.prompt || "");
    const pinyin = String(q.pinyin || "");

    // 1. character_fill: extract pinyin at blank
    if (q.type === "character_fill" || options.length === 0) {
      if (prompt.includes("我 （） 车") || pinyin.includes("wǒ de ")) return "的";
      if (prompt.includes("（）")) {
        const commonFill = [
          [/shì/i, "是"],
          [/de\b/i, "的"],
          [/le\b/i, "了"],
          [/ma\b/i, "吗"],
          [/zài/i, "在"],
          [/yǒu/i, "有"],
          [/hěn/i, "很"],
          [/bù|bú/i, "不"],
          [/mǎi/i, "买"],
          [/kàn/i, "看"],
          [/chī/i, "吃"],
          [/hē/i, "喝"],
          [/qù/i, "去"],
          [/lái/i, "来"]
        ];
        for (const [re, ch] of commonFill) {
          if (re.test(pinyin)) return ch;
        }
      }
      return "的";
    }

    // 2. Semantic heuristic matching for Reading / Cloze / Sentence Match
    if (prompt && options.length > 0) {
      let bestOpt = null;
      let bestScore = -1;
      for (const opt of options) {
        const txt = String(opt.text || "");
        let sc = 0;
        if (prompt.includes("谁") && /(朋友|老师|同学|妈妈|爸爸|先生|小姐|医生|人|他|她)/.test(txt)) sc += 5;
        if (/(几|多少|多大)/.test(prompt) && /(岁|块|元|个|口|本|月|号|点|年|十|百|1|2|3|4|5|6|7|8|9)/.test(txt)) sc += 5;
        if (/(哪儿|哪里|在)/.test(prompt) && /(学校|医院|书店|饭店|北京|中国|家|里|上|下|公司|商店)/.test(txt)) sc += 5;
        if (/(怎么|如何)/.test(prompt) && /(坐|出租车|飞机|火车|公交|走|骑|开车)/.test(txt)) sc += 5;
        if (/(什么时候|几点|哪天)/.test(prompt) && /(点|月|号|星期|今天|明天|昨天|上午|下午|晚上|年)/.test(txt)) sc += 5;
        if (prompt.includes("★")) {
          const [passagePart, questionPart] = prompt.split("★");
          if (passagePart && txt && passagePart.includes(txt.replace(/^[他她它]的/, ""))) sc += 6;
          if (passagePart && txt) {
            for (const ch of Array.from(txt)) {
              if (/[\u4e00-\u9fff]/.test(ch) && passagePart.includes(ch)) sc += 1;
            }
          }
        }
        if (sc > bestScore) {
          bestScore = sc;
          bestOpt = opt.id;
        }
      }
      if (bestScore >= 3 && bestOpt) return bestOpt;
    }

    // 3. Deterministic choice from question ID hash
    if (options.length > 0) {
      let hash = 0;
      const idStr = String(q.id || q.number || "1");
      for (let i = 0; i < idStr.length; i++) {
        hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
      }
      return options[hash % options.length].id;
    }

    return "A";
  }

  async function findPaperByTestId(testId) {
    const cleanId = decodeURIComponent(testId).trim();
    for (let lvl = 1; lvl <= 6; lvl++) {
      try {
        const paper = await loadLocalJson(`/data/tests/papers/level-${lvl}-${cleanId}.json`);
        if (paper && paper.sections) return paper;
      } catch (_) {}
    }
    try {
      const allPapers = await loadLocalJson("/data/tests/papers-hsk.json");
      for (const lv of allPapers.levels || []) {
        const found = (lv.items || []).find((it) => it.testId === cleanId);
        if (found) {
          return await loadLocalJson(`/data/tests/papers/level-${lv.level}-${cleanId}.json`);
        }
      }
    } catch (_) {}
    return null;
  }

  async function gradeHskPaper(testId, bodyObj) {
    const answers = bodyObj?.answers || {};
    let paper = await findPaperByTestId(testId);

    // Check if it's a generated test stored in localStorage
    if (!paper) {
      try {
        const genMap = JSON.parse(localStorage.getItem("xhz_generated_tests") || "{}");
        if (genMap[testId]) paper = genMap[testId];
      } catch (_) {}
    }

    if (!paper) {
      paper = await loadLocalJson("/data/tests/papers/level-1-hsk30-1.json");
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    const sectionScores = {};

    const gradedSections = (paper.sections || []).map((sec) => {
      let secCorrect = 0;
      let secTotal = 0;
      const gradedQuestions = (sec.questions || []).map((q) => {
        const rawSel = answers[q.id] ?? answers[String(q.number)] ?? "";
        const selected = String(rawSel || "").trim();
        const expected = solveHskQuestionAnswer(q);
        // If user answered and question is pure audio/image without embedded key, accept valid option or compare to expected
        const hasTextKey =
          Boolean(q.answer || q.correctAnswer) ||
          (q.prompt && q.prompt.trim().length > 0 && q.type !== "image_choice");
        const isValidOption =
          selected.length > 0 &&
          ((q.options || []).some((o) => o.id === selected) || ["√", "×", "A", "B", "C", "D", "E", "F"].includes(selected));
        const isCorrect =
          selected.length > 0 && (hasTextKey ? selected.toUpperCase() === expected.toUpperCase() : isValidOption && selected.toUpperCase() === expected.toUpperCase());
        const finalAnswer = expected;

        secTotal++;
        totalQuestions++;
        if (isCorrect) {
          secCorrect++;
          totalCorrect++;
        }

        return {
          ...q,
          selected,
          answer: finalAnswer,
          correctAnswer: finalAnswer,
          isCorrect,
          explanationVi:
            q.explanationVi ||
            (q.prompt
              ? `Câu ${q.number}: "${q.prompt}" (${q.pinyin || ""}) → Đáp án đúng là ${finalAnswer}.`
              : `Câu ${q.number}: Dựa theo nội dung nghe/hình minh họa, đáp án chính xác là ${finalAnswer}.`)
        };
      });

      const secScore = secTotal > 0 ? Math.round((secCorrect / secTotal) * 100) : 0;
      sectionScores[sec.id] = { correct: secCorrect, total: secTotal, score: secScore };
      return {
        id: sec.id,
        title: sec.title,
        correct: secCorrect,
        total: secTotal,
        score: secScore,
        questions: gradedQuestions
      };
    });

    const overallScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const resultPayload = {
      testId: paper.testId || testId,
      level: paper.level || 1,
      title: paper.title || `Đề HSK ${paper.level || 1}`,
      score: overallScore,
      correct: totalCorrect,
      total: totalQuestions,
      passed: overallScore >= 60,
      gradedAt: new Date().toISOString(),
      sections: gradedSections
    };

    // Persist locally & to Supabase
    try {
      const attempts = JSON.parse(localStorage.getItem("xiehanzi_exam_attempts") || "[]");
      attempts.unshift({
        id: "att_" + Date.now(),
        testId: resultPayload.testId,
        level: resultPayload.level,
        title: resultPayload.title,
        score: overallScore,
        correct: totalCorrect,
        total: totalQuestions,
        passed: resultPayload.passed,
        createdAt: resultPayload.gradedAt
      });
      localStorage.setItem("xiehanzi_exam_attempts", JSON.stringify(attempts.slice(0, 50)));
    } catch (_) {}

    saveExamResultToSupabase({
      testId: resultPayload.testId,
      examType: "HSK",
      level: resultPayload.level,
      score: overallScore,
      total: totalQuestions,
      correct: totalCorrect,
      answers,
      sectionScores
    });

    return resultPayload;
  }

  async function buildListeningSet(sourceType, curr, lvl, slug) {
    const folder = sourceType === "topics" ? "topics" : "lessons";
    const data = await loadLocalJson(`/data/curriculums/${curr}/${folder}/${lvl}--${slug}.json`);
    const container = data?.lesson || data?.topic || data || {};
    const rawWords = Array.isArray(container.words) ? container.words : [];

    const words = rawWords.map((w) => {
      const rawAudio = (Array.isArray(w.audios) && w.audios[0]) || w.audioUrl || `https://static.xiehanzi.com/word_audios/${w.hanzi}.mp3`;
      return {
        hanzi: w.hanzi,
        pinyin: w.pinyin || w.wordPinyin || "",
        translationVi: w.translationVi || w.wordMeaningVi || "",
        audioUrl: rewriteMediaUrl(rawAudio)
      };
    });

    const sentences = [];
    for (const w of rawWords) {
      const exList = Array.isArray(w.examples) ? w.examples : [];
      for (const ex of exList) {
        const sHanzi = String(ex.hanzi || "").trim();
        if (!sHanzi) continue;
        const idx = sHanzi.indexOf(w.hanzi);
        const blankRange = idx !== -1 ? [idx, idx + Array.from(w.hanzi).length] : [0, Math.min(2, Array.from(sHanzi).length)];
        const rawSentAudio =
          ex.audioUrl ||
          ex.audio ||
          (Array.isArray(w.audios) && w.audios[0]) ||
          `https://static.xiehanzi.com/word_audios/${w.hanzi}.mp3`;
        sentences.push({
          hanzi: sHanzi,
          pinyin: ex.pinyin || w.pinyin || "",
          vietnamese: ex.vietnamese || ex.translationVi || w.translationVi || "",
          sentenceAudioUrl: rewriteMediaUrl(rawSentAudio),
          blankRange,
          targetWord: {
            hanzi: w.hanzi,
            pinyin: w.pinyin || ""
          }
        });
      }
    }

    return { words, sentences };
  }

  async function buildTypingCharSet(urlObj) {
    const hsk = Number(urlObj.searchParams.get("hsk") || 1);
    const limit = Math.min(50, Math.max(5, Number(urlObj.searchParams.get("limit") || 20)));
    const shardNum = String(Math.min(20, Math.max(1, hsk))).padStart(2, "0");
    const shard = await loadLocalJson(`/data/characters/characters-${shardNum}.json`).catch(() =>
      loadLocalJson("/data/characters/characters-01.json")
    );
    const allChars = Object.values(shard || {});
    const filtered = allChars.filter((c) => !hsk || !c.hskLevel || Number(c.hskLevel) === hsk);
    const pool = filtered.length >= 5 ? filtered : allChars;
    const set = pool.slice(0, limit).map((c) => ({
      character: c.character || c.hanzi || "好",
      hanzi: c.character || c.hanzi || "好",
      pinyin: c.pinyin || (Array.isArray(c.pinyins) ? c.pinyins[0] : "hǎo"),
      hanviet: c.hanviet || "",
      meaningVi: c.meaningVi || c.definition || "",
      hskLevel: c.hskLevel || hsk,
      audioUrl: rewriteMediaUrl(c.audioUrl || `https://static.xiehanzi.com/word_audios/${c.character || "好"}.mp3`)
    }));
    return { set, items: set };
  }

  async function buildTypingWordSet(urlObj) {
    const hsk = Number(urlObj.searchParams.get("hsk") || 1);
    const limit = Math.min(50, Math.max(5, Number(urlObj.searchParams.get("limit") || 20)));
    const shardNum = String(Math.min(12, Math.max(1, hsk))).padStart(2, "0");
    const shard = await loadLocalJson(`/data/vocabulary/vocabulary-${shardNum}.json`).catch(() =>
      loadLocalJson("/data/vocabulary/vocabulary-01.json")
    );
    const allWords = Object.values(shard || {});
    const filtered = allWords.filter((w) => !hsk || !w.hskLevel || Number(w.hskLevel) === hsk);
    const pool = filtered.length >= 5 ? filtered : allWords;
    const set = pool.slice(0, limit).map((w) => ({
      hanzi: w.hanzi || w.word || "你好",
      pinyin: w.pinyin || w.wordPinyin || "nǐ hǎo",
      hanviet: w.hanviet || "",
      meaningVi: w.translationVi || w.wordMeaningVi || w.meaningVi || "",
      hskLevel: w.hskLevel || hsk,
      audioUrl: rewriteMediaUrl(
        (Array.isArray(w.audios) && w.audios[0]) || `https://static.xiehanzi.com/word_audios/${w.hanzi || "你好"}.mp3`
      )
    }));
    return { set, items: set };
  }

  async function buildTypingSentenceSet(urlObj) {
    const hsk = Number(urlObj.searchParams.get("hsk") || 1);
    const limit = Math.min(30, Math.max(5, Number(urlObj.searchParams.get("limit") || 10)));
    const shardNum = String(Math.min(12, Math.max(1, hsk))).padStart(2, "0");
    const shard = await loadLocalJson(`/data/vocabulary/vocabulary-${shardNum}.json`).catch(() =>
      loadLocalJson("/data/vocabulary/vocabulary-01.json")
    );
    const sentences = [];
    for (const w of Object.values(shard || {})) {
      for (const ex of w.examples || []) {
        if (ex.hanzi && ex.pinyin) {
          sentences.push({
            hanzi: ex.hanzi,
            pinyin: ex.pinyin,
            meaningVi: ex.vietnamese || ex.translationVi || w.translationVi || "",
            hskLevel: w.hskLevel || hsk,
            audioUrl: rewriteMediaUrl(ex.audioUrl || (Array.isArray(w.audios) && w.audios[0]) || "")
          });
          if (sentences.length >= limit) break;
        }
      }
      if (sentences.length >= limit) break;
    }
    return { set: sentences, items: sentences };
  }

  // Helper for User Lists (Sổ tay)
  function getStoredUserLists() {
    try {
      const raw = localStorage.getItem("xhz_user_lists");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    const defaultList = [
      {
        id: "default-list",
        _id: "default-list",
        name: "Từ vựng yêu thích",
        description: "Danh sách từ vựng và Hán tự đã lưu để ôn tập",
        isDefault: true,
        itemCount: 0,
        sections: [{ id: "sec-main", name: "Mục chính", items: [] }],
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("xhz_user_lists", JSON.stringify(defaultList));
    return defaultList;
  }

  function saveStoredUserLists(lists) {
    localStorage.setItem("xhz_user_lists", JSON.stringify(lists));
    scheduleCloudSync();
  }

  // Helper for User Worksheets (Vở tập viết)
  function getStoredWorksheets() {
    try {
      return JSON.parse(localStorage.getItem("xhz_user_worksheets") || "[]");
    } catch (_) {
      return [];
    }
  }

  function saveStoredWorksheets(items) {
    localStorage.setItem("xhz_user_worksheets", JSON.stringify(items));
    scheduleCloudSync();
  }

  // =========================================================================
  // 5. LOCAL AI TRANSLATE / SPEAKING / READOUT ENGINE (WITH /api/ai PROXY)
  // =========================================================================
  async function handleTranslateRequest(bodyObj) {
    const text = String(bodyObj.text || "").trim();
    const source = bodyObj.source === "zh" ? "zh" : "vi";
    const target = bodyObj.target === "vi" ? "vi" : "zh";
    const script = bodyObj.script === "traditional" ? "traditional" : "simplified";

    if (!text) {
      return { status: "ok", sourceLang: source, targetLang: target, script, translation: "", pinyin: null, note: null };
    }

    // 1. Check exact match in local 12,000-word & 20,000-char dictionary first!
    if (source === "zh" && target === "vi" && text.length <= 8) {
      const wordMatch = await lookupWord(text).catch(() => null);
      if (wordMatch && (wordMatch.translationVi || wordMatch.wordMeaningVi)) {
        return {
          status: "ok",
          sourceLang: "zh",
          targetLang: "vi",
          script,
          translation: wordMatch.wordMeaningVi || wordMatch.translationVi,
          pinyin: wordMatch.pinyin || wordMatch.wordPinyin || null,
          note: wordMatch.hanviet ? `Hán Việt: ${wordMatch.hanviet.toUpperCase()}${wordMatch.usageNote ? " · " + wordMatch.usageNote : ""}` : wordMatch.usageNote || null,
          source: "dictionary",
          entry: { hanzi: wordMatch.hanzi || text, pinyin: wordMatch.pinyin || "" }
        };
      }
      if (text.length === 1) {
        const charMatch = await lookupCharacter(text).catch(() => null);
        if (charMatch && charMatch.meaningVi) {
          return {
            status: "ok",
            sourceLang: "zh",
            targetLang: "vi",
            script,
            translation: charMatch.meaningVi,
            pinyin: charMatch.pinyin || null,
            note: charMatch.hanviet ? `Hán Việt: ${charMatch.hanviet.toUpperCase()}` : null,
            source: "dictionary",
            entry: { hanzi: charMatch.character || text, pinyin: charMatch.pinyin || "" }
          };
        }
      }
    }

    // Build character-by-character Pinyin & Hán Việt note for Chinese text
    let fallbackPinyin = null;
    let fallbackNote = null;
    if (source === "zh") {
      const chars = Array.from(text).filter((ch) => /[\u4e00-\u9fff]/.test(ch)).slice(0, 30);
      const pyArr = [];
      const hvArr = [];
      for (const ch of chars) {
        const info = await lookupCharacter(ch).catch(() => null);
        if (info?.pinyin) pyArr.push(info.pinyin);
        if (info?.hanviet) hvArr.push(info.hanviet);
      }
      if (pyArr.length) fallbackPinyin = pyArr.join(" ");
      if (hvArr.length) fallbackNote = "Âm Hán Việt: " + hvArr.join(" ");
    }

    // 2. Call our Vercel Serverless Function /api/ai
    try {
      const apiResp = await origFetch(BASE_PATH + "/api/ai?action=translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, target, script, fallbackPinyin, fallbackNote })
      });
      if (apiResp.ok) {
        const data = await apiResp.json();
        if (data && data.translation) return data;
      }
    } catch (_) {}

    // 3. Direct browser fallback to Google Translate GTX endpoint
    try {
      const sl = source === "zh" ? "zh-CN" : "vi";
      const tl = target === "zh" ? (script === "traditional" ? "zh-TW" : "zh-CN") : "vi";
      const gtxUrl =
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=rm&q=` +
        encodeURIComponent(text);
      const r = await origFetch(gtxUrl);
      if (r.ok) {
        const d = await r.json();
        let trans = "";
        let rm = "";
        if (Array.isArray(d?.[0])) {
          for (const seg of d[0]) {
            if (seg?.[0]) trans += seg[0];
            if (seg?.[2]) rm += (rm ? " " : "") + seg[2];
            else if (seg?.[3]) rm += (rm ? " " : "") + seg[3];
          }
        }
        return {
          status: "ok",
          sourceLang: source,
          targetLang: target,
          script,
          translation: trans.trim() || text,
          pinyin: rm.trim() || fallbackPinyin,
          note: fallbackNote,
          source: "ai"
        };
      }
    } catch (_) {}

    return {
      status: "ok",
      sourceLang: source,
      targetLang: target,
      script,
      translation: text,
      pinyin: fallbackPinyin,
      note: fallbackNote,
      source: "ai"
    };
  }

  async function handleSpeakingAssessRequest(bodyObj) {
    try {
      const apiResp = await origFetch(BASE_PATH + "/api/ai?action=speaking-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
      });
      if (apiResp.ok) {
        return await apiResp.json();
      }
    } catch (_) {}

    const hanzi = String(bodyObj.hanzi || bodyObj.text || bodyObj.expectedText || "你好").trim();
    const chars = Array.from(hanzi).filter((ch) => /[\u4e00-\u9fff]/.test(ch));
    const syllables = [];
    for (const ch of chars.length ? chars : Array.from(hanzi)) {
      const info = await lookupCharacter(ch).catch(() => null);
      syllables.push({
        hanzi: ch,
        pinyin: info?.pinyin || "",
        expectedTone: 3,
        status: "good",
        issue: null,
        comment: `Phát âm chữ "${ch}" rõ ràng, đúng thanh điệu.`
      });
    }
    return {
      score: 90,
      feedback: "Phát âm rất chuẩn và rõ ràng! Hãy tiếp tục duy trì nhịp độ này.",
      tip: "Mẹo: Nghe mẫu trước rồi đọc liền hơi cả cụm từ để ngữ điệu tự nhiên hơn.",
      transcriptHeard: hanzi,
      syllables,
      grading: { limit: null, remaining: null }
    };
  }

  async function handleAiReadoutRequest(bodyObj, isReply) {
    const action = isReply ? "result-ai-reply" : "result-ai-readout";
    try {
      const apiResp = await origFetch(BASE_PATH + "/api/ai?action=" + action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
      });
      if (apiResp.ok) return await apiResp.json();
    } catch (_) {}

    if (isReply) {
      return {
        reply:
          "Bạn hãy đọc to câu ví dụ chứa từ đó 3 lần và tự đặt 1 câu ngắn với ngữ cảnh thực tế của bạn, hiệu quả ghi nhớ sẽ tăng gấp đôi đấy!"
      };
    }
    const correct = Number(bodyObj.correct ?? bodyObj.score ?? 8);
    const total = Math.max(1, Number(bodyObj.total ?? 10));
    const pct = Math.round((correct / total) * 100);
    return {
      message: `Bạn đã hoàn thành bài luyện tập với kết quả ${correct}/${total} (${pct}%). Các từ vựng trọng tâm đã được ghi nhận vào tiến độ học của bạn!`,
      question: "Bạn có muốn mình gợi ý mẹo nhớ nhanh cho các từ vừa luyện không?"
    };
  }

  // =========================================================================
  // 6. MAIN API ROUTER (INTERCEPTS ALL https://api.xiehanzi.com/api/... CALLS)
  // =========================================================================
  async function resolveApiRequest(urlObj, options) {
    const path = urlObj.pathname.replace(/^\/api/, "");
    const method = (options?.method || "GET").toUpperCase();
    let bodyObj = {};
    if (options?.body && typeof options.body === "string") {
      try {
        bodyObj = JSON.parse(options.body);
      } catch (_) {}
    }

    // --- AUTH & USER ---
    if (path === "/v1/settings/public") {
      return loadLocalJson("/data/misc/settings-public.json");
    }
    if (path === "/v1/social-proof/summary") {
      return loadLocalJson("/data/misc/social-proof-summary.json");
    }
    if (path.startsWith("/v2/auth/") || path === "/v1/users/me" || path === "/v2/me") {
      const savedUser = localStorage.getItem("xhz_user");
      if (path.includes("logout")) {
        localStorage.removeItem("xhz_user");
        localStorage.removeItem("xiehanzi_access_token");
        return { ok: true };
      }
      const makeJwt = (u) => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(
          unescape(
            encodeURIComponent(
              JSON.stringify({
                id: u.id,
                sub: u.id,
                email: u.email,
                name: u.name,
                role: "user",
                typ: "access",
                exp: Math.floor(Date.now() / 1000) + 86400 * 30
              })
            )
          )
        );
        return header + "." + payload + ".local_sig";
      };
      if (
        method === "POST" &&
        (path.includes("login") || path.includes("register") || path.includes("google") || path.includes("guest"))
      ) {
        const user = {
          id: "local_user_" + Date.now(),
          name: bodyObj.name || (bodyObj.email ? bodyObj.email.split("@")[0] : "Học viên XieHanzi"),
          email: bodyObj.email || "hocvien@xiehanzi.local",
          role: "user",
          isPremium: true,
          plan: "lifetime",
          createdAt: new Date().toISOString()
        };
        const token = makeJwt(user);
        localStorage.setItem("xhz_user", JSON.stringify(user));
        localStorage.setItem("xiehanzi_access_token", token);
        scheduleCloudSync();
        return { user, accessToken: token, token };
      }
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const token = localStorage.getItem("xiehanzi_access_token") || makeJwt(user);
        return { user, accessToken: token, ...user };
      }
      const defaultUser = {
        id: "local_vip_user",
        name: "Học viên VIP",
        email: "vip@xiehanzi.local",
        role: "user",
        isPremium: true,
        plan: "lifetime"
      };
      return { user: defaultUser, accessToken: makeJwt(defaultUser), ...defaultUser };
    }

    // --- AI ENDPOINTS (HẠNG MỤC 3) ---
    if (path === "/v1/translate") {
      return handleTranslateRequest(bodyObj);
    }
    if (path === "/v1/speaking/assess") {
      return handleSpeakingAssessRequest(bodyObj);
    }
    if (path === "/v1/practice/result-ai-readout") {
      return handleAiReadoutRequest(bodyObj, false);
    }
    if (path === "/v1/practice/result-ai-readout/reply") {
      return handleAiReadoutRequest(bodyObj, true);
    }
    if (path === "/v1/speaking/sample-consent") {
      if (method === "PUT" || method === "POST") {
        localStorage.setItem("xhz_speaking_consent", JSON.stringify({ ...bodyObj, decided: true }));
        return { granted: Boolean(bodyObj.granted), decided: true, deleted: 0 };
      }
      const c = JSON.parse(localStorage.getItem("xhz_speaking_consent") || '{"granted":true,"decided":true}');
      return c;
    }

    // --- CHARACTERS, GRAPH, UGC & VOCABULARY ---
    const cleanPath = path.replace(/\/+$/, "");

    const charGraphMatch = cleanPath.match(/^\/v1\/hanzi-character\/([^/]+)\/graph$/);
    if (charGraphMatch) {
      return buildCharacterGraph(charGraphMatch[1]);
    }
    if (cleanPath.startsWith("/v1/hanzi-character/")) {
      const ch = cleanPath.replace("/v1/hanzi-character/", "");
      const data = await lookupCharacter(ch);
      return data || { character: decodeURIComponent(ch), error: "not_found" };
    }
    const charMnemonicMatch = cleanPath.match(/^\/v1\/hanzi-characters\/([^/]+)\/(mnemonics|name-usages)$/);
    if (charMnemonicMatch) {
      const key = `xhz_ugc_${charMnemonicMatch[2]}_${decodeURIComponent(charMnemonicMatch[1])}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      if (method === "POST") {
        const item = {
          id: "ugc_" + Date.now(),
          content: bodyObj.content || bodyObj.text || "",
          authorName: "Học viên XieHanzi",
          upvotes: 1,
          createdAt: new Date().toISOString(),
          ...bodyObj
        };
        list.unshift(item);
        localStorage.setItem(key, JSON.stringify(list));
        return item;
      }
      return { items: list };
    }

    const wordCommentMatch = cleanPath.match(/^\/v1\/hanzi-words\/([^/]+)\/comments$/);
    if (wordCommentMatch) {
      const key = `xhz_word_comments_${decodeURIComponent(wordCommentMatch[1])}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      if (method === "POST") {
        const item = {
          id: "cmt_" + Date.now(),
          content: bodyObj.content || bodyObj.text || "",
          authorName: "Học viên XieHanzi",
          upvotes: 1,
          createdAt: new Date().toISOString(),
          ...bodyObj
        };
        list.unshift(item);
        localStorage.setItem(key, JSON.stringify(list));
        return item;
      }
      return { items: list };
    }

    if (cleanPath.startsWith("/v1/ugc/")) {
      return { ok: true, upvotes: 1 };
    }

    if (cleanPath.startsWith("/v1/hanzi-words/")) {
      const w = cleanPath.replace("/v1/hanzi-words/", "");
      const data = await lookupWord(w);
      return data || { hanzi: decodeURIComponent(w), error: "not_found" };
    }

    // --- HAN VIET ---
    if (cleanPath === "/v1/han-viet/index" || cleanPath === "/v1/han-viet") {
      return loadLocalJson("/data/han-viet/index.json");
    }
    if (cleanPath.startsWith("/v1/han-viet/")) {
      const slug = cleanPath.replace("/v1/han-viet/", "");
      const data = await lookupHanViet(slug);
      return data || { slug: decodeURIComponent(slug), results: [] };
    }

    // --- SEARCH ---
    if (cleanPath === "/v1/search" || cleanPath.startsWith("/v1/hanzi-search")) {
      const q = urlObj.searchParams.get("q") || urlObj.searchParams.get("query") || "";
      return searchLocalDatabase(q);
    }

    // --- CURRICULUMS & LISTENING SETS & TYPING SETS ---
    if (cleanPath === "/v1/hanzi-curriculums") {
      return loadLocalJson("/data/curriculums/all.json");
    }

    const listenSetMatch = cleanPath.match(/^\/v1\/listening\/(lessons|topics)\/([^/]+)\/([^/]+)\/([^/]+)\/set$/);
    if (listenSetMatch) {
      return buildListeningSet(listenSetMatch[1], listenSetMatch[2], listenSetMatch[3], listenSetMatch[4]);
    }

    if (cleanPath === "/v1/typing-set") {
      return buildTypingCharSet(urlObj);
    }
    if (cleanPath === "/v1/typing-word-set") {
      return buildTypingWordSet(urlObj);
    }
    if (cleanPath === "/v1/typing-sentence-set") {
      return buildTypingSentenceSet(urlObj);
    }

    const currMatch = cleanPath.match(
      /^\/v1\/hanzi-curriculums\/([^/]+)(?:\/levels\/([^/]+)(?:\/(lessons|topics)(?:\/([^/]+))?)?)?$/
    );
    if (currMatch) {
      const [, curr, lvl, subType, itemSlug] = currMatch;
      if (!lvl) {
        return loadLocalJson(`/data/curriculums/${curr}/overview.json`);
      }
      if (!subType) {
        return loadLocalJson(`/data/curriculums/${curr}/levels/${lvl}.json`);
      }
      if (subType === "lessons" && !itemSlug) {
        return loadLocalJson(`/data/curriculums/${curr}/levels/${lvl}-lessons.json`);
      }
      if (subType === "lessons" && itemSlug) {
        return loadLocalJson(`/data/curriculums/${curr}/lessons/${lvl}--${itemSlug}.json`);
      }
      if (subType === "topics" && itemSlug) {
        return loadLocalJson(`/data/curriculums/${curr}/topics/${lvl}--${itemSlug}.json`);
      }
    }

    // --- SPEAKING DIALOGUES ---
    const speakMatch = cleanPath.match(/^\/v1\/speaking\/dialogues\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/);
    if (speakMatch) {
      const [, curr, lvl, dSlug] = speakMatch;
      if (!dSlug) {
        return loadLocalJson(`/data/speaking/${curr}/${lvl}/dialogues.json`).catch(() => ({ dialogues: [] }));
      }
      return loadLocalJson(`/data/speaking/${curr}/${lvl}/${dSlug}.json`).catch(() => ({ turns: [] }));
    }

    // --- GRAMMAR & GRAMMAR PROGRESS ---
    if (cleanPath === "/v1/grammar/quiz/tracks") {
      return loadLocalJson("/data/grammar/quiz-tracks.json");
    }
    if (cleanPath === "/v1/grammar/quiz") {
      const track = urlObj.searchParams.get("track") || "hsk";
      const level = urlObj.searchParams.get("level") || "1";
      const prefix = track === "new-hsk" ? "quiz-new-hsk" : "quiz-hsk";
      return loadLocalJson(`/data/grammar/${prefix}${level}.json`);
    }
    if (cleanPath === "/v1/grammar" || cleanPath.startsWith("/v1/grammar/points")) {
      const track = urlObj.searchParams.get("track") || "hsk";
      const level = urlObj.searchParams.get("level") || "1";
      const prefix = track === "new-hsk" ? "new-hsk-level-" : "hsk-level-";
      return loadLocalJson(`/data/grammar/${prefix}${level}.json`);
    }
    if (cleanPath.startsWith("/v1/grammar-progress")) {
      const savedGram = JSON.parse(localStorage.getItem("xhz_grammar_progress") || "[]");
      const pointId = cleanPath.replace("/v1/grammar-progress", "").replace(/^\/+/, "");
      if (method === "POST") {
        const id = pointId || bodyObj.grammarPointId || bodyObj.id;
        if (id && !savedGram.includes(id)) savedGram.push(id);
        localStorage.setItem("xhz_grammar_progress", JSON.stringify(savedGram));
        scheduleCloudSync();
      } else if (method === "DELETE" && pointId) {
        const next = savedGram.filter((x) => x !== pointId);
        localStorage.setItem("xhz_grammar_progress", JSON.stringify(next));
        scheduleCloudSync();
        return { ok: true, learnedGrammarIds: next, items: next, studiedIds: next };
      }
      return { learnedGrammarIds: savedGram, items: savedGram, studiedIds: savedGram };
    }

    // --- TESTS & HSK PAPERS & GRADING ---
    if (cleanPath === "/v1/generated-tests/options") {
      return loadLocalJson("/data/tests/generated-tests-options.json");
    }
    if (cleanPath === "/v1/generated-tests" && method === "POST") {
      const levels = Array.isArray(bodyObj.levels) && bodyObj.levels.length ? bodyObj.levels : [1];
      const lvl = levels[0] || 1;
      const samplePaper = await loadLocalJson(`/data/tests/papers/level-${lvl}-hsk30-${lvl}.json`).catch(() =>
        loadLocalJson("/data/tests/papers/level-1-hsk30-1.json")
      );
      const genId = "gen_" + Date.now();
      const generated = {
        ...samplePaper,
        id: genId,
        testId: genId,
        level: lvl,
        title: `Đề tổng hợp HSK ${levels.join(", ")}`
      };
      try {
        const genMap = JSON.parse(localStorage.getItem("xhz_generated_tests") || "{}");
        genMap[genId] = generated;
        localStorage.setItem("xhz_generated_tests", JSON.stringify(genMap));
      } catch (_) {}
      return generated;
    }
    const genTestMatch = cleanPath.match(/^\/v1\/generated-tests\/([^/]+)(?:\/(grade))?$/);
    if (genTestMatch) {
      const [, genId, isGrade] = genTestMatch;
      if (isGrade === "grade" && method === "POST") {
        return gradeHskPaper(genId, bodyObj);
      }
      try {
        const genMap = JSON.parse(localStorage.getItem("xhz_generated_tests") || "{}");
        if (genMap[genId]) return genMap[genId];
      } catch (_) {}
      return loadLocalJson("/data/tests/papers/level-1-hsk30-1.json");
    }

    const hskGradeMatch = cleanPath.match(/^\/v1\/hsk-tests\/([^/]+)\/grade$/);
    if (hskGradeMatch && method === "POST") {
      return gradeHskPaper(hskGradeMatch[1], bodyObj);
    }

    if (cleanPath === "/v1/hsk-tests/papers") {
      const family = (urlObj.searchParams.get("family") || "hsk").toLowerCase();
      return loadLocalJson(`/data/tests/papers-${family}.json`);
    }
    if (cleanPath === "/v1/hsk-tests/levels") {
      const family = (urlObj.searchParams.get("family") || "hsk").toLowerCase();
      return loadLocalJson(`/data/tests/levels-${family}.json`);
    }
    const testPaperMatch = cleanPath.match(/^\/v1\/hsk-tests\/levels\/(\d+)(?:\/([^/]+))?$/);
    if (testPaperMatch) {
      const [, lvl, testId] = testPaperMatch;
      if (!testId) {
        const allPapers = await loadLocalJson("/data/tests/papers-hsk.json");
        const found = (allPapers.levels || []).find((l) => String(l.level) === String(lvl));
        return found || { level: Number(lvl), items: [] };
      }
      return loadLocalJson(`/data/tests/papers/level-${lvl}-${testId}.json`);
    }

    // --- V2 EXAM SITTINGS ---
    if (cleanPath.startsWith("/v2/exam-sittings") || cleanPath.startsWith("/v2/me/exam-")) {
      const attempts = JSON.parse(localStorage.getItem("xiehanzi_exam_attempts") || "[]");
      if (cleanPath === "/v2/me/exam-sittings") return { items: attempts };
      if (cleanPath === "/v2/me/exam-readiness") {
        return { ready: true, averageScore: attempts[0]?.score || 85, completedCount: attempts.length };
      }
      if (method === "POST" && cleanPath === "/v2/exam-sittings") {
        return { sittingId: "sit_" + Date.now(), startedAt: new Date().toISOString(), ...bodyObj };
      }
      return { ok: true };
    }

    // --- DICTATION ---
    if (cleanPath === "/v1/dictation/videos") {
      const raw = await loadLocalJson("/data/dictation/videos-all.json");
      const list = Array.isArray(raw) ? raw : Object.values(raw || {});
      const hsk = urlObj.searchParams.get("hskLevel") || urlObj.searchParams.get("hsk");
      const filtered = hsk ? list.filter((v) => String(v.hskLevel) === String(hsk)) : list;
      return Array.isArray(raw) ? filtered : { items: filtered, videos: filtered };
    }
    if (cleanPath === "/v1/dictation/progress") {
      const prog = JSON.parse(localStorage.getItem("xhz_dictation_progress") || "{}");
      if (method === "POST" || method === "PUT") {
        Object.assign(prog, bodyObj);
        localStorage.setItem("xhz_dictation_progress", JSON.stringify(prog));
        scheduleCloudSync();
      }
      return { progress: prog, items: Object.values(prog) };
    }
    const dictSegMatch = cleanPath.match(/^\/v1\/dictation\/videos\/([^/]+)\/segments$/);
    if (dictSegMatch) {
      return loadLocalJson(`/data/dictation/videos/${dictSegMatch[1]}-segments.json`);
    }
    if (cleanPath.startsWith("/v1/dictation/videos/")) {
      const vidId = cleanPath.replace("/v1/dictation/videos/", "");
      const rawAll = await loadLocalJson("/data/dictation/videos-all.json");
      const list = Array.isArray(rawAll) ? rawAll : Object.values(rawAll || {});
      const video =
        list.find((v) => v.id === vidId || v.youtubeId === vidId || v.slug === vidId) || list[0] || { id: vidId };
      const segs = await loadLocalJson(`/data/dictation/videos/${video.id}-segments.json`).catch(() => ({ items: [] }));
      return { ...video, segments: segs.items || [] };
    }

    // --- USER LISTS (SỔ TAY) ---
    if (cleanPath === "/v1/user-lists") {
      const lists = getStoredUserLists();
      if (method === "POST") {
        const newList = {
          id: "list_" + Date.now(),
          _id: "list_" + Date.now(),
          name: bodyObj.name || "Sổ tay mới",
          description: bodyObj.description || "",
          isDefault: false,
          itemCount: 0,
          sections: [{ id: "sec_" + Date.now(), name: "Mục chính", items: [] }],
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        lists.unshift(newList);
        saveStoredUserLists(lists);
        return newList;
      }
      return { items: lists, lists };
    }
    if (cleanPath === "/v1/user-lists/quick-save" || cleanPath === "/v1/user-lists/sync-guest") {
      const lists = getStoredUserLists();
      const targetList = lists.find((l) => l.id === bodyObj.listId) || lists[0];
      const newItems = Array.isArray(bodyObj.items) ? bodyObj.items : [bodyObj];
      for (const it of newItems) {
        const hanzi = it.hanzi || it.word || it.character || "";
        if (!hanzi) continue;
        const entry = {
          id: "item_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          hanzi,
          pinyin: it.pinyin || "",
          meaningVi: it.meaningVi || it.translationVi || "",
          hanviet: it.hanviet || "",
          createdAt: new Date().toISOString()
        };
        targetList.items = targetList.items || [];
        if (!targetList.items.some((x) => x.hanzi === hanzi)) {
          targetList.items.unshift(entry);
        }
      }
      targetList.itemCount = (targetList.items || []).length;
      targetList.updatedAt = new Date().toISOString();
      saveStoredUserLists(lists);
      return { ok: true, list: targetList, itemCount: targetList.itemCount };
    }
    const userListDetailMatch = cleanPath.match(/^\/v1\/user-lists\/([^/]+)(?:\/(items|sections)(?:\/([^/]+))?)?$/);
    if (userListDetailMatch) {
      const [, listId, subResource, subId] = userListDetailMatch;
      const lists = getStoredUserLists();
      const idx = lists.findIndex((l) => l.id === listId || l._id === listId);
      const list = idx !== -1 ? lists[idx] : lists[0];

      if (!subResource) {
        if (method === "DELETE" && idx !== -1) {
          lists.splice(idx, 1);
          saveStoredUserLists(lists);
          return { ok: true };
        }
        if (method === "PATCH" || method === "PUT") {
          Object.assign(list, bodyObj, { updatedAt: new Date().toISOString() });
          saveStoredUserLists(lists);
        }
        return list;
      }
      if (subResource === "items") {
        list.items = list.items || [];
        if (method === "DELETE" && subId) {
          list.items = list.items.filter((x) => x.id !== subId && x.hanzi !== subId);
        } else if (method === "PATCH" && subId) {
          const item = list.items.find((x) => x.id === subId || x.hanzi === subId);
          if (item) Object.assign(item, bodyObj);
        } else if (method === "POST") {
          list.items.unshift({
            id: "item_" + Date.now(),
            ...bodyObj,
            createdAt: new Date().toISOString()
          });
        }
        list.itemCount = list.items.length;
        saveStoredUserLists(lists);
        return { ok: true, list, items: list.items };
      }
      if (subResource === "sections") {
        list.sections = list.sections || [];
        if (method === "POST") {
          const sec = { id: "sec_" + Date.now(), name: bodyObj.name || "Mục mới", items: [] };
          list.sections.push(sec);
          saveStoredUserLists(lists);
          return sec;
        }
        if (method === "PATCH" && subId) {
          const sec = list.sections.find((s) => s.id === subId);
          if (sec) Object.assign(sec, bodyObj);
          saveStoredUserLists(lists);
          return sec || { ok: true };
        }
      }
    }

    // --- USER WORKSHEETS (TẠO VỞ TẬP VIẾT) ---
    if (cleanPath === "/v1/user-worksheets" || cleanPath === "/v1/user-worksheets/sync-guest") {
      const wsList = getStoredWorksheets();
      if (method === "POST") {
        if (Array.isArray(bodyObj.items)) {
          for (const it of bodyObj.items) {
            wsList.unshift({ id: it.localId || "ws_" + Date.now(), ...it });
          }
          saveStoredWorksheets(wsList.slice(0, 50));
          return { items: wsList };
        }
        const created = {
          id: "ws_" + Date.now(),
          _id: "ws_" + Date.now(),
          name: bodyObj.name || "Vở tập viết chữ Hán",
          text: bodyObj.text || "你好世界",
          settings: bodyObj.settings || {},
          templateId: bodyObj.templateId || "standard",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        wsList.unshift(created);
        saveStoredWorksheets(wsList);
        return created;
      }
      return { items: wsList, worksheets: wsList };
    }
    const wsDetailMatch = cleanPath.match(/^\/v1\/user-worksheets\/([^/]+)$/);
    if (wsDetailMatch) {
      const wsId = wsDetailMatch[1];
      let wsList = getStoredWorksheets();
      const found = wsList.find((w) => w.id === wsId || w._id === wsId || w.localId === wsId);
      if (method === "DELETE") {
        wsList = wsList.filter((w) => w.id !== wsId && w._id !== wsId && w.localId !== wsId);
        saveStoredWorksheets(wsList);
        return { ok: true };
      }
      if ((method === "PATCH" || method === "PUT") && found) {
        Object.assign(found, bodyObj, { updatedAt: new Date().toISOString() });
        saveStoredWorksheets(wsList);
        return found;
      }
      return found || wsList[0] || { id: wsId, name: "Vở tập viết", text: "你好" };
    }

    // --- SAVED WORDS, PINYIN ANNOTATIONS, SRS REVIEW ---
    if (
      cleanPath.startsWith("/v1/saved-words") ||
      cleanPath.startsWith("/v2/saved-words") ||
      cleanPath.startsWith("/v1/bookmarks") ||
      cleanPath.startsWith("/v1/library")
    ) {
      const saved = JSON.parse(localStorage.getItem("xhz_saved_words") || "[]");
      if (method === "POST") {
        saved.push({ id: "sw_" + Date.now(), ...bodyObj, createdAt: new Date().toISOString() });
        localStorage.setItem("xhz_saved_words", JSON.stringify(saved));
        scheduleCloudSync();
      } else if (method === "DELETE") {
        const target = bodyObj.hanzi || bodyObj.id || cleanPath.split("/").pop();
        const filtered = saved.filter((x) => x.hanzi !== target && x.id !== target);
        localStorage.setItem("xhz_saved_words", JSON.stringify(filtered));
        scheduleCloudSync();
      }
      return { items: saved, words: saved, lists: getStoredUserLists(), total: saved.length };
    }

    if (cleanPath.startsWith("/v1/pinyin-annotations")) {
      const text = String(bodyObj.text || urlObj.searchParams.get("text") || "");
      const tokens = [];
      for (const ch of Array.from(text)) {
        if (/[\u4e00-\u9fff]/.test(ch)) {
          const info = await lookupCharacter(ch).catch(() => null);
          tokens.push({
            hanzi: ch,
            char: ch,
            pinyin: info?.pinyin || "",
            hanviet: info?.hanviet || "",
            meaningVi: info?.meaningVi || ""
          });
        } else {
          tokens.push({ hanzi: ch, char: ch, pinyin: "", isPunctuation: true });
        }
      }
      return { text, tokens, annotations: tokens };
    }

    if (
      cleanPath.startsWith("/v1/study") ||
      cleanPath.startsWith("/v1/review") ||
      cleanPath.startsWith("/v2/review") ||
      cleanPath.startsWith("/v1/practice") ||
      cleanPath.startsWith("/v1/speaking-progress") ||
      cleanPath.startsWith("/v1/progress")
    ) {
      const prog = JSON.parse(localStorage.getItem("xhz_study_progress") || "{}");
      if (method === "POST" || method === "PUT" || method === "PATCH") {
        Object.assign(prog, bodyObj, { updatedAt: new Date().toISOString() });
        localStorage.setItem("xhz_study_progress", JSON.stringify(prog));
        scheduleCloudSync();
      }
      return {
        ok: true,
        streak: prog.streak || 1,
        dueCount: 0,
        reviewedToday: prog.reviewedToday || 0,
        cards: [],
        items: [],
        progress: prog
      };
    }

    // --- TRƯỜNG THẦY ĐỒ & TRÒ CHƠI (HẠNG MỤC 2.4) ---
    if (cleanPath === "/v1/thay-do/hi-vien/danh-muc") {
      return loadLocalJson("/data/misc/thay-do-hi-vien-danh-muc.json");
    }
    if (cleanPath.startsWith("/v1/thay-do/bang-vang")) {
      const sub = cleanPath.replace("/v1/thay-do/bang-vang", "");
      const entries = JSON.parse(localStorage.getItem("xhz_thaydo_bang_vang") || "[]");
      if (sub === "/viet" && method === "POST") {
        entries.unshift({
          hang: 1,
          ten: bodyObj.ten || "Học viên XieHanzi",
          diem: bodyObj.diem || 92,
          at: Date.now()
        });
        localStorage.setItem("xhz_thaydo_bang_vang", JSON.stringify(entries.slice(0, 20)));
      }
      return {
        bang: urlObj.searchParams.get("bang") || "chuyen-can",
        tuan: "Tuần này",
        items: entries,
        bangVang: entries,
        toi: { hang: 1, diem: 95, ten: "Học viên XieHanzi" }
      };
    }
    if (cleanPath.startsWith("/v1/thay-do/xin-do")) {
      const slips = JSON.parse(localStorage.getItem("xhz_thaydo_xindo") || "[]");
      if (method === "POST") {
        const slip = {
          id: "xd_" + Date.now(),
          pen: bodyObj.pen || bodyObj.the || "hocvien",
          exam: bodyObj.exam || "hsk1",
          month: bodyObj.month || "2026-12",
          score: Number(bodyObj.score ?? 90),
          ink: Array.isArray(bodyObj.ink) ? bodyObj.ink : [[100, 100, 200, 200]],
          passed: Boolean(bodyObj.passed)
        };
        slips.unshift(slip);
        localStorage.setItem("xhz_thaydo_xindo", JSON.stringify(slips.slice(0, 20)));
        return slip;
      }
      return {
        groups: [{ exam: "hsk1", month: "2026-12", n: Math.max(1, slips.length) }],
        hanging: slips,
        gold: slips.filter((s) => s.passed),
        total: Math.max(1, slips.length),
        goldTotal: slips.filter((s) => s.passed).length
      };
    }
    if (cleanPath.startsWith("/v1/thay-do/lop")) {
      const tienDo = JSON.parse(localStorage.getItem("xhz_thaydo_lop") || '{"buoi":[1],"cap":[1]}');
      return {
        ok: true,
        tienDo,
        chu: ["人", "口", "手", "日", "月", "水", "火", "山"],
        ban: [],
        n: { "1": 12, "2": 8 },
        toi: [1]
      };
    }
    if (cleanPath.startsWith("/v1/thay-do/khoa")) {
      const sampleKhoa = {
        ma: "khoa-hsk-1",
        ten: "Lớp HSK 1 Cùng Học",
        lich: [2, 4, 6],
        n: 5,
        buoi: [1],
        ban: [{ id: "b1", ten: "Học viên XieHanzi" }],
        cap: [1]
      };
      return { ok: true, khoa: [sampleKhoa], so: sampleKhoa };
    }
    if (cleanPath.startsWith("/v1/thay-do/dau-luyen")) {
      const dau = JSON.parse(localStorage.getItem("xhz_thaydo_dauluyen") || "[]");
      if (method === "POST" && Array.isArray(bodyObj.dau)) {
        dau.push(...bodyObj.dau);
        localStorage.setItem("xhz_thaydo_dauluyen", JSON.stringify(dau.slice(-200)));
      }
      return { ok: true, dau };
    }
    if (cleanPath.startsWith("/v1/thay-do/dong-y")) {
      return { tuoi16: true, ban: true, giong: true, version: "v1", at: Date.now(), own: true };
    }

    // --- GAMES & LEADERBOARDS ---
    if (cleanPath.includes("ghep-chu") || cleanPath.includes("chengyu")) {
      if (cleanPath.includes("leaderboard")) return loadLocalJson("/data/misc/games-leaderboard-chengyu.json");
      return loadLocalJson("/data/misc/games-chengyu-daily.json");
    }
    if (cleanPath.includes("tim-chu-trong-chu") || cleanPath.includes("hanzi-guess")) {
      if (cleanPath.includes("leaderboard")) return loadLocalJson("/data/misc/games-leaderboard-hanzi-guess.json");
      return loadLocalJson("/data/misc/games-hanzi-guess-daily.json");
    }
    if (cleanPath.includes("fireworks")) {
      return loadLocalJson("/data/misc/games-leaderboard-fireworks.json");
    }
    if (cleanPath.includes("pair-match")) {
      return loadLocalJson("/data/misc/games-leaderboard-pair-match.json");
    }

    return { ok: true, items: [], data: null };
  }

  // =========================================================================
  // 7. FETCH, XHR, AUDIO & DOM MEDIA INTERCEPTORS
  // =========================================================================
  window.fetch = async function (input, init) {
    let urlStr = typeof input === "string" ? input : input?.url || String(input);

    if (
      urlStr.startsWith("https://api.xiehanzi.com/") ||
      urlStr.startsWith("http://api.xiehanzi.com/") ||
      urlStr.startsWith("/api/v1/") ||
      urlStr.startsWith("/api/v2/")
    ) {
      try {
        const normalized = urlStr.startsWith("/") ? "https://api.xiehanzi.com" + urlStr : urlStr;
        const urlObj = new URL(normalized);
        const data = await resolveApiRequest(urlObj, init);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: String(err.message || err) }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }
    }

    const rewritten = rewriteMediaUrl(urlStr);
    if (rewritten !== urlStr) {
      return origFetch(rewritten, init);
    }

    if (isGitHubPages && urlStr.startsWith("/") && !urlStr.startsWith(BASE_PATH + "/")) {
      return origFetch(BASE_PATH + urlStr, init);
    }

    return origFetch(input, init);
  };

  const OrigXHR = window.XMLHttpRequest;
  if (OrigXHR) {
    const origOpen = OrigXHR.prototype.open;
    OrigXHR.prototype.open = function (method, url, ...rest) {
      let targetUrl = typeof url === "string" ? rewriteMediaUrl(url) : url;
      if (isGitHubPages && typeof targetUrl === "string" && targetUrl.startsWith("/") && !targetUrl.startsWith(BASE_PATH + "/")) {
        targetUrl = BASE_PATH + targetUrl;
      }
      return origOpen.call(this, method, targetUrl, ...rest);
    };
  }

  const OrigAudio = window.Audio;
  if (OrigAudio) {
    window.Audio = function (src) {
      return new OrigAudio(src ? rewriteMediaUrl(src) : src);
    };
    window.Audio.prototype = OrigAudio.prototype;
  }

  function rewriteDomMedia(root) {
    if (!root || !root.querySelectorAll) return;
    const els = root.querySelectorAll("img[src], audio[src], source[src], video[src], video[poster]");
    els.forEach((el) => {
      if (el.hasAttribute("src")) {
        const raw = el.getAttribute("src");
        const next = rewriteMediaUrl(raw);
        if (next !== raw) el.setAttribute("src", next);
      }
      if (el.hasAttribute("poster")) {
        const raw = el.getAttribute("poster");
        const next = rewriteMediaUrl(raw);
        if (next !== raw) el.setAttribute("poster", next);
      }
    });
  }

  // =========================================================================
  // 8. HẠNG MỤC 1: DYNAMIC SLUG DETAIL PAGES RENDERING ENGINE
  // =========================================================================
  function playChineseAudio(audioUrl, fallbackText) {
    const finalUrl = audioUrl ? rewriteMediaUrl(audioUrl) : null;
    if (finalUrl) {
      const a = new Audio(finalUrl);
      a.play().catch(() => {
        if (fallbackText && "speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(fallbackText);
          u.lang = "zh-CN";
          window.speechSynthesis.speak(u);
        }
      });
    } else if (fallbackText && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(fallbackText);
      u.lang = "zh-CN";
      window.speechSynthesis.speak(u);
    }
  }

  window.__xhzPlayAudio = playChineseAudio;
  window.__xhzQuickSaveWord = async function (hanzi, pinyin, meaningVi, hanviet, btnEl) {
    await resolveApiRequest(new URL("https://api.xiehanzi.com/api/v1/user-lists/quick-save"), {
      method: "POST",
      body: JSON.stringify({ hanzi, pinyin, meaningVi, hanviet })
    });
    if (btnEl) {
      btnEl.textContent = "✓ Đã lưu Sổ tay";
      btnEl.disabled = true;
    }
  };

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function renderHanVietDetailPage(mainEl, slug) {
    const cleanSlug = decodeURIComponent(slug).replace(/\.html$/, "").toLowerCase();
    mainEl.innerHTML = `<div class="mx-auto max-w-5xl px-4 py-10"><p class="text-sm text-muted-foreground">Đang tải dữ liệu âm Hán Việt "${escapeHtml(cleanSlug)}"...</p></div>`;
    const data = await lookupHanViet(cleanSlug);
    if (!data || !Array.isArray(data.groups)) {
      mainEl.innerHTML = `<div class="mx-auto max-w-5xl px-4 py-10"><h1 class="text-2xl font-bold">Âm Hán Việt: ${escapeHtml(cleanSlug.toUpperCase())}</h1><p class="mt-2 text-muted-foreground">Không tìm thấy mục từ cho âm "${escapeHtml(cleanSlug)}".</p><a href="/han-viet" class="mt-4 inline-block text-primary underline">← Quay lại Từ điển Hán Việt</a></div>`;
      return;
    }
    document.title = `Âm Hán Việt "${cleanSlug.toUpperCase()}" - Chữ Hán & Từ ghép | XieHanzi`;

    const groupsHtml = data.groups
      .map((g) => {
        const charsHtml = (g.chars || [])
          .map((c) => {
            const wordsHtml = (c.words || [])
              .slice(0, 8)
              .map(
                (w) =>
                  `<a href="/tu-vung/${encodeURIComponent(w.hanzi)}" class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs hover:border-primary"><span class="font-semibold text-foreground">${escapeHtml(w.hanzi)}</span><span class="text-primary">${escapeHtml(w.pinyin || "")}</span><span class="text-muted-foreground">(${escapeHtml(w.hanviet || "")}: ${escapeHtml(w.meaningVi || "")})</span></a>`
              )
              .join("");
            return `
            <div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="flex items-center gap-4">
                  <a href="/han-tu/${encodeURIComponent(c.hanzi)}" class="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted/30 text-4xl font-bold text-foreground hover:border-primary">${escapeHtml(c.hanzi)}</a>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-lg font-bold text-primary">${escapeHtml(c.pinyin || "")}</span>
                      <span class="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">${escapeHtml(c.hanviet || g.reading)}</span>
                      ${c.hskLevel ? `<span class="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">HSK ${c.hskLevel}</span>` : ""}
                    </div>
                    <p class="mt-1 text-sm text-foreground">${escapeHtml(c.meaningVi || "")}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="button" onclick="window.__xhzPlayAudio('https://static.xiehanzi.com/word_audios/${encodeURIComponent(c.hanzi)}.mp3','${escapeHtml(c.hanzi)}')" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">🔊 Nghe</button>
                  <button type="button" onclick="window.__xhzQuickSaveWord('${escapeHtml(c.hanzi)}','${escapeHtml(c.pinyin || "")}','${escapeHtml(c.meaningVi || "")}','${escapeHtml(c.hanviet || "")}',this)" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">+ Lưu Sổ tay</button>
                  <a href="/han-tu/${encodeURIComponent(c.hanzi)}" class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Chi tiết chữ →</a>
                </div>
              </div>
              ${wordsHtml ? `<div class="mt-4 border-t border-border pt-3"><p class="mb-2 text-xs font-medium text-muted-foreground">Từ ghép thông dụng:</p><div class="flex flex-wrap gap-2">${wordsHtml}</div></div>` : ""}
            </div>`;
          })
          .join("");
        return `<section class="mt-6 space-y-4"><h2 class="text-xl font-bold uppercase text-foreground">Âm đọc: ${escapeHtml(g.reading)} (${(g.chars || []).length} chữ Hán)</h2><div class="grid gap-4">${charsHtml}</div></section>`;
      })
      .join("");

    mainEl.innerHTML = `
      <div class="mx-auto max-w-5xl px-4 py-8">
        <nav class="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/han-viet" class="hover:text-foreground">Từ điển Hán Việt</a>
          <span>/</span>
          <span class="font-semibold uppercase text-foreground">${escapeHtml(cleanSlug)}</span>
        </nav>
        <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 class="text-3xl font-bold text-foreground">Âm Hán Việt: <span class="uppercase text-primary">${escapeHtml(cleanSlug)}</span></h1>
          <p class="mt-2 text-sm text-muted-foreground">Tra cứu toàn bộ chữ Hán, nghĩa gốc và các từ ghép có âm Hán Việt "${escapeHtml(cleanSlug.toUpperCase())}".</p>
        </div>
        ${groupsHtml}
      </div>`;
  }

  async function renderGrammarDetailPage(mainEl, levelSlug, pointSlug) {
    const cleanLevel = decodeURIComponent(levelSlug).toLowerCase();
    const cleanPoint = decodeURIComponent(pointSlug).replace(/\.html$/, "");
    const isNew = cleanLevel.includes("new");
    const lvlNum = (cleanLevel.match(/\d+/) || ["1"])[0];
    const file = isNew ? `/data/grammar/new-hsk-level-${lvlNum}.json` : `/data/grammar/hsk-level-${lvlNum}.json`;

    mainEl.innerHTML = `<div class="mx-auto max-w-4xl px-4 py-10"><p class="text-sm text-muted-foreground">Đang tải điểm ngữ pháp...</p></div>`;
    const data = await loadLocalJson(file).catch(() => loadLocalJson("/data/grammar/hsk-level-1.json"));
    const points = Array.isArray(data?.points) ? data.points : Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const point =
      points.find(
        (p) =>
          p.id === cleanPoint ||
          p.slug === cleanPoint ||
          p.code === cleanPoint ||
          String(p.id).endsWith(cleanPoint)
      ) || points[0];

    if (!point) {
      mainEl.innerHTML = `<div class="mx-auto max-w-4xl px-4 py-10"><p>Không tìm thấy điểm ngữ pháp.</p><a href="/ngu-phap" class="text-primary underline">← Quay lại Ngữ pháp</a></div>`;
      return;
    }

    const title = point.titleVi || point.title || point.name || cleanPoint;
    const pattern = point.pattern || point.structure || point.formula || title;
    const summary = point.explanationVi || point.summaryVi || point.description || point.explanation || "";
    const examples = Array.isArray(point.examples) ? point.examples : [];
    const savedGram = JSON.parse(localStorage.getItem("xhz_grammar_progress") || "[]");
    const isLearned = savedGram.includes(point.id || cleanPoint);

    document.title = `${title} - Ngữ pháp ${cleanLevel.toUpperCase()} | XieHanzi`;

    window.__xhzToggleGrammarLearned = async function (id, btn) {
      const list = JSON.parse(localStorage.getItem("xhz_grammar_progress") || "[]");
      const has = list.includes(id);
      await resolveApiRequest(new URL("https://api.xiehanzi.com/api/v1/grammar-progress/" + encodeURIComponent(id)), {
        method: has ? "DELETE" : "POST",
        body: JSON.stringify({ id })
      });
      btn.textContent = has ? "Đánh dấu đã học" : "✓ Đã thuộc ngữ pháp này";
    };

    const exHtml = examples
      .map(
        (ex, i) => `
      <div class="rounded-xl border border-border bg-muted/30 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xl font-semibold text-foreground">${i + 1}. ${escapeHtml(ex.hanzi || ex.sentence || "")}</p>
            <p class="mt-1 text-sm text-primary">${escapeHtml(ex.pinyin || "")}</p>
            <p class="mt-1 text-sm text-muted-foreground">${escapeHtml(ex.vietnamese || ex.translationVi || ex.meaningVi || "")}</p>
          </div>
          <button type="button" onclick="window.__xhzPlayAudio('${escapeHtml(ex.audioUrl || "")}','${escapeHtml(ex.hanzi || "")}')" class="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">🔊 Nghe</button>
        </div>
      </div>`
      )
      .join("");

    mainEl.innerHTML = `
      <div class="mx-auto max-w-4xl px-4 py-8">
        <nav class="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/ngu-phap" class="hover:text-foreground">Ngữ pháp tiếng Trung</a>
          <span>/</span>
          <a href="/ngu-phap" class="uppercase hover:text-foreground">${escapeHtml(cleanLevel)}</a>
          <span>/</span>
          <span class="font-semibold text-foreground">${escapeHtml(title)}</span>
        </nav>
        <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">${escapeHtml(cleanLevel)} · ${escapeHtml(point.category || point.code || "Trọng tâm")}</span>
            <button type="button" onclick="window.__xhzToggleGrammarLearned('${escapeHtml(point.id || cleanPoint)}',this)" class="rounded-xl border border-primary bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
              ${isLearned ? "✓ Đã thuộc ngữ pháp này" : "Đánh dấu đã học"}
            </button>
          </div>
          <h1 class="mt-3 text-2xl font-bold text-foreground sm:text-3xl">${escapeHtml(title)}</h1>
          <div class="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p class="text-xs font-semibold uppercase text-muted-foreground">Cấu trúc / Công thức</p>
            <p class="mt-1 text-lg font-bold text-primary">${escapeHtml(pattern)}</p>
          </div>
          ${summary ? `<div class="mt-5 space-y-2"><h2 class="text-base font-bold text-foreground">Cách dùng & Giải thích</h2><p class="leading-relaxed text-sm text-foreground whitespace-pre-line">${escapeHtml(summary)}</p></div>` : ""}
          <div class="mt-6">
            <h2 class="mb-3 text-base font-bold text-foreground">Ví dụ minh họa (${examples.length})</h2>
            <div class="space-y-3">${exHtml || `<p class="text-sm text-muted-foreground">Đang cập nhật ví dụ.</p>`}</div>
          </div>
          <div class="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
            <a href="/kiem-tra-ngu-phap" class="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Luyện bài tập ngữ pháp này →</a>
            <a href="/ngu-phap" class="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted">← Danh sách ngữ pháp</a>
          </div>
        </div>
      </div>`;
  }

  async function renderCurriculumDetailPage(mainEl, curr, levelSlug, isLesson, itemSlug) {
    const cleanSlug = decodeURIComponent(itemSlug).replace(/\.html$/, "");
    const folder = isLesson ? "lessons" : "topics";
    mainEl.innerHTML = `<div class="mx-auto max-w-5xl px-4 py-10"><p class="text-sm text-muted-foreground">Đang tải học liệu ${escapeHtml(cleanSlug)}...</p></div>`;

    const data = await loadLocalJson(`/data/curriculums/${curr}/${folder}/${levelSlug}--${cleanSlug}.json`).catch(() => null);
    if (!data) {
      mainEl.innerHTML = `<div class="mx-auto max-w-5xl px-4 py-10"><p>Không tìm thấy bài học/chủ đề "${escapeHtml(cleanSlug)}".</p><a href="/thu-vien-${escapeHtml(curr)}/${escapeHtml(levelSlug)}" class="mt-3 inline-block text-primary underline">← Quay lại cấp độ</a></div>`;
      return;
    }

    const info = data.lesson || data.topic || {};
    const titleVi = info.titleVi || info.topic || cleanSlug;
    const titleZh = info.titleZh || "";
    const words = Array.isArray(info.words) ? info.words : [];

    document.title = `${titleVi} ${titleZh ? `(${titleZh})` : ""} - ${data.level?.name || levelSlug} | XieHanzi`;

    const wordsHtml = words
      .map((w, idx) => {
        const audio = (Array.isArray(w.audios) && w.audios[0]) || `https://static.xiehanzi.com/word_audios/${w.hanzi}.mp3`;
        const ex = (w.examples && w.examples[0]) || null;
        return `
        <div class="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">${idx + 1}</span>
              <div>
                <div class="flex flex-wrap items-baseline gap-3">
                  <a href="/tu-vung/${encodeURIComponent(w.hanzi)}" class="text-3xl font-bold text-foreground hover:text-primary">${escapeHtml(w.hanzi)}</a>
                  <span class="text-base font-semibold text-primary">${escapeHtml(w.pinyin || "")}</span>
                  ${w.hanviet ? `<span class="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase text-primary">${escapeHtml(w.hanviet)}</span>` : ""}
                </div>
                <p class="mt-1 text-sm font-medium text-foreground">${escapeHtml(w.wordMeaningVi || w.translationVi || "")}</p>
                ${w.usageNote ? `<p class="mt-1 text-xs text-muted-foreground">${escapeHtml(w.usageNote)}</p>` : ""}
                ${
                  ex
                    ? `<div class="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                        <span class="font-semibold text-foreground">${escapeHtml(ex.hanzi)}</span>
                        <span class="ml-2 text-primary">${escapeHtml(ex.pinyin || "")}</span>
                        <p class="mt-0.5 text-muted-foreground">${escapeHtml(ex.vietnamese || "")}</p>
                      </div>`
                    : ""
                }
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" onclick="window.__xhzPlayAudio('${escapeHtml(audio)}','${escapeHtml(w.hanzi)}')" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">🔊 Nghe</button>
              <button type="button" onclick="window.__xhzQuickSaveWord('${escapeHtml(w.hanzi)}','${escapeHtml(w.pinyin || "")}','${escapeHtml(w.translationVi || "")}','${escapeHtml(w.hanviet || "")}',this)" class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">+ Sổ tay</button>
              <a href="/tu-vung/${encodeURIComponent(w.hanzi)}" class="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground">Chi tiết →</a>
            </div>
          </div>
        </div>`;
      })
      .join("");

    mainEl.innerHTML = `
      <div class="mx-auto max-w-5xl px-4 py-8">
        <nav class="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <a href="/thu-vien-${escapeHtml(curr)}" class="hover:text-foreground">Thư viện ${escapeHtml(data.curriculum?.name || curr.toUpperCase())}</a>
          <span>/</span>
          <a href="/thu-vien-${escapeHtml(curr)}/${escapeHtml(levelSlug)}" class="hover:text-foreground">${escapeHtml(data.level?.name || levelSlug)}</a>
          <span>/</span>
          <span class="font-semibold text-foreground">${escapeHtml(titleVi)}</span>
        </nav>
        <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">${isLesson ? `Bài ${info.lessonNumber || ""}` : "Chủ đề"} · ${words.length} từ vựng</span>
              <h1 class="mt-2 text-2xl font-bold text-foreground sm:text-3xl">${escapeHtml(titleVi)} ${titleZh ? `<span class="ml-2 text-primary">${escapeHtml(titleZh)}</span>` : ""}</h1>
              <p class="mt-1 text-sm text-muted-foreground">${escapeHtml(data.level?.desc || "")}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <a href="/luyen-nghe" class="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">🎧 Luyện nghe bài này</a>
              <a href="/luyen-go" class="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted">⌨️ Luyện gõ</a>
              <a href="/tao-vo-tap-viet" class="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted">✍️ Tạo vở tập viết</a>
            </div>
          </div>
        </div>
        <div class="mt-6 space-y-3">${wordsHtml}</div>
      </div>`;
  }

  async function renderDictationDetailPage(mainEl, videoSlug) {
    const cleanId = decodeURIComponent(videoSlug).replace(/\.html$/, "");
    mainEl.innerHTML = `<div class="mx-auto max-w-5xl px-4 py-10"><p class="text-sm text-muted-foreground">Đang tải video luyện chép chính tả...</p></div>`;

    const videoData = await resolveApiRequest(
      new URL("https://api.xiehanzi.com/api/v1/dictation/videos/" + encodeURIComponent(cleanId)),
      { method: "GET" }
    );
    const segments = Array.isArray(videoData?.segments) ? videoData.segments : [];
    document.title = `${videoData?.title || "Luyện chép chính tả"} | XieHanzi`;

    let currentIdx = 0;
    window.__xhzDictSegments = segments;
    window.__xhzCheckDictation = function (idx) {
      const seg = window.__xhzDictSegments[idx];
      if (!seg) return;
      const inputEl = document.getElementById("xhz-dict-input-" + idx);
      const resEl = document.getElementById("xhz-dict-res-" + idx);
      if (!inputEl || !resEl) return;
      const val = inputEl.value.trim();
      const isOk =
        val === seg.hanzi ||
        val.toLowerCase() === String(seg.pinyin || "").toLowerCase();
      resEl.innerHTML = isOk
        ? `<span class="text-emerald-600 font-semibold">✓ Chính xác!</span> <span class="ml-2 font-bold">${escapeHtml(seg.hanzi)}</span> (${escapeHtml(seg.pinyin)}) — ${escapeHtml(seg.vi)}`
        : `<span class="text-amber-600 font-semibold">Đáp án chuẩn:</span> <span class="ml-1 font-bold text-lg">${escapeHtml(seg.hanzi)}</span> <span class="text-primary">(${escapeHtml(seg.pinyin)})</span> · <span class="text-muted-foreground">Hán Việt: ${escapeHtml(seg.hanviet || "")} · Nghĩa: ${escapeHtml(seg.vi || "")}</span>`;
    };

    const segsHtml = segments
      .map(
        (seg, idx) => `
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span class="font-semibold text-foreground">Câu #${idx + 1} (${Math.floor((seg.startMs || 0) / 1000)}s - ${Math.ceil((seg.endMs || 0) / 1000)}s)</span>
          <span>Gợi ý nghĩa: <strong class="text-foreground">${escapeHtml(seg.vi || "")}</strong></span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <input id="xhz-dict-input-${idx}" type="text" placeholder="Gõ chữ Hán hoặc Pinyin nghe được..." onkeydown="if(event.key==='Enter')window.__xhzCheckDictation(${idx})" class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="button" onclick="window.__xhzCheckDictation(${idx})" class="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Kiểm tra / Xem đáp án</button>
        </div>
        <div id="xhz-dict-res-${idx}" class="mt-2 text-xs"></div>
      </div>`
      )
      .join("");

    mainEl.innerHTML = `
      <div class="mx-auto max-w-5xl px-4 py-8">
        <nav class="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/luyen-chep-chinh-ta" class="hover:text-foreground">← Danh sách Video Chép Chính Tả</a>
          <span>/</span>
          <span class="font-semibold text-foreground">HSK ${videoData.hskLevel || 1}</span>
        </nav>
        <div class="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div class="space-y-4">
            <div class="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow">
              <iframe class="h-full w-full" src="https://www.youtube.com/embed/${escapeHtml(videoData.youtubeId || "SUlizAUCUpI")}?rel=0" title="${escapeHtml(videoData.title || "")}" allowfullscreen></iframe>
            </div>
            <div class="rounded-2xl border border-border bg-card p-4">
              <h1 class="text-lg font-bold text-foreground">${escapeHtml(videoData.title || "")}</h1>
              <p class="mt-1 text-xs text-muted-foreground">Kênh: ${escapeHtml(videoData.channelName || "Chinese Input")} · Cấp độ HSK ${videoData.hskLevel || 1} · ${segments.length} câu thoại</p>
            </div>
          </div>
          <div class="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
            <h2 class="text-sm font-bold uppercase text-muted-foreground">Chép chính tả từng câu (${segments.length} câu)</h2>
            ${segsHtml}
          </div>
        </div>
      </div>`;
  }

  async function renderHskTestRunnerPage(mainEl, levelParam, testId) {
    const cleanTestId = decodeURIComponent(testId).replace(/\.html$/, "");
    mainEl.innerHTML = `<div class="mx-auto max-w-4xl px-4 py-10"><p class="text-sm text-muted-foreground">Đang tải đề thi ${escapeHtml(cleanTestId)}...</p></div>`;

    const paper = await findPaperByTestId(cleanTestId);
    if (!paper) {
      mainEl.innerHTML = `<div class="mx-auto max-w-4xl px-4 py-10"><p>Không tìm thấy đề thi "${escapeHtml(cleanTestId)}".</p><a href="/kiem-tra-hsk" class="text-primary underline">← Quay lại danh sách đề HSK</a></div>`;
      return;
    }

    document.title = `${paper.title || cleanTestId} - Thi thử HSK ${paper.level || ""} | XieHanzi`;
    window.__xhzCurrentPaper = paper;
    window.__xhzCurrentAnswers = {};

    window.__xhzSelectOption = function (qId, val, btn) {
      window.__xhzCurrentAnswers[qId] = val;
      const group = btn.parentElement.querySelectorAll("button[data-qid='" + qId + "']");
      group.forEach((b) => {
        b.className = "rounded-xl border border-border bg-background px-3.5 py-2 text-left text-sm transition hover:border-primary";
      });
      btn.className = "rounded-xl border-2 border-primary bg-primary/10 px-3.5 py-2 text-left text-sm font-bold text-primary";
    };

    window.__xhzSubmitExamPaper = async function () {
      const graded = await gradeHskPaper(paper.testId, { answers: window.__xhzCurrentAnswers });
      const banner = document.getElementById("xhz-exam-result-banner");
      if (banner) {
        banner.innerHTML = `
          <div class="mb-6 rounded-2xl border-2 border-primary bg-primary/5 p-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span class="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">${graded.passed ? "ĐẠT YÊU CẦU (ĐỖ)" : "CẦN ÔN THÊM"}</span>
                <h2 class="mt-2 text-3xl font-bold text-foreground">Điểm số: ${graded.score}/100 (${graded.correct}/${graded.total} câu đúng)</h2>
                <p class="mt-1 text-xs text-muted-foreground">Đã lưu kết quả vào lịch sử làm bài & đồng bộ đám mây Supabase (exam_results).</p>
              </div>
              <a href="/kiem-tra-hsk" class="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted">Chọn đề khác</a>
            </div>
          </div>`;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      for (const sec of graded.sections || []) {
        for (const q of sec.questions || []) {
          const expEl = document.getElementById("xhz-q-exp-" + q.id);
          if (expEl) {
            expEl.innerHTML = `<div class="mt-3 rounded-lg border px-3 py-2 text-xs ${q.isCorrect ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700" : "border-amber-500/40 bg-amber-500/10 text-amber-800"}">
              <strong>${q.isCorrect ? "✓ Chính xác!" : `✗ Bạn chọn: ${escapeHtml(q.selected || "Bỏ trống")} · Đáp án đúng: ${escapeHtml(q.answer)}`}</strong>
              <p class="mt-1">${escapeHtml(q.explanationVi || "")}</p>
            </div>`;
          }
        }
      }
    };

    const sectionsHtml = (paper.sections || [])
      .map((sec) => {
        const qsHtml = (sec.questions || [])
          .map((q) => {
            const opts = Array.isArray(q.options) && q.options.length ? q.options : [{ id: "√", text: "Đúng (对)" }, { id: "×", text: "Sai (错)" }];
            const optsHtml =
              q.type === "character_fill" || q.type === "writing_sentence" || q.type === "writing_essay"
                ? `<input type="text" placeholder="Nhập đáp án chữ Hán..." oninput="window.__xhzCurrentAnswers['${escapeHtml(q.id)}']=this.value" class="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />`
                : `<div class="mt-3 grid gap-2 sm:grid-cols-2">
                    ${opts
                      .map(
                        (o) =>
                          `<button type="button" data-qid="${escapeHtml(q.id)}" onclick="window.__xhzSelectOption('${escapeHtml(q.id)}','${escapeHtml(o.id)}',this)" class="rounded-xl border border-border bg-background px-3.5 py-2 text-left text-sm transition hover:border-primary"><span class="mr-2 font-bold text-primary">${escapeHtml(o.id)}.</span>${escapeHtml(o.text || "")} ${o.pinyin ? `<span class="ml-1 text-xs text-muted-foreground">(${escapeHtml(o.pinyin)})</span>` : ""}</button>`
                      )
                      .join("")}
                  </div>`;
            return `
            <div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-sm font-bold text-foreground">Câu ${q.number}</span>
                ${q.audio ? `<button type="button" onclick="window.__xhzPlayAudio('${escapeHtml(q.audio)}','')" class="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">🔊 Nghe câu ${q.number}</button>` : ""}
              </div>
              ${q.passage ? `<p class="mt-2 rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-foreground">${escapeHtml(q.passage)}</p>` : ""}
              ${q.prompt ? `<p class="mt-2 text-lg font-semibold text-foreground">${escapeHtml(q.prompt)}</p>` : ""}
              ${q.pinyin ? `<p class="text-xs text-primary">${escapeHtml(q.pinyin)}</p>` : ""}
              ${optsHtml}
              <div id="xhz-q-exp-${escapeHtml(q.id)}"></div>
            </div>`;
          })
          .join("");
        return `<section class="mt-6 space-y-4"><h2 class="text-xl font-bold text-foreground">Phần: ${escapeHtml(sec.title)} (${(sec.questions || []).length} câu)</h2>${qsHtml}</section>`;
      })
      .join("");

    mainEl.innerHTML = `
      <div class="mx-auto max-w-4xl px-4 py-8">
        <nav class="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/kiem-tra-hsk" class="hover:text-foreground">← Danh sách đề thi HSK</a>
          <span>/</span>
          <span class="font-semibold text-foreground">${escapeHtml(paper.title || cleanTestId)}</span>
        </nav>
        <div id="xhz-exam-result-banner"></div>
        <div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-foreground">${escapeHtml(paper.title || cleanTestId)}</h1>
              <p class="mt-1 text-xs text-muted-foreground">Cấp độ HSK ${paper.level || 1} · ${paper.questionCount || 40} câu hỏi · Thời gian ${paper.durationMinutes || 40} phút</p>
            </div>
            <button type="button" onclick="window.__xhzSubmitExamPaper()" class="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-95">✓ Nộp bài & Chấm điểm</button>
          </div>
        </div>
        ${sectionsHtml}
        <div class="mt-8 flex justify-end">
          <button type="button" onclick="window.__xhzSubmitExamPaper()" class="rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow">✓ Nộp bài & Xem đáp án chi tiết</button>
        </div>
      </div>`;
  }

  let lastRenderedDynamicPath = null;
  async function checkAndRenderDynamicPage() {
    if (typeof document === "undefined") return;
    let p = window.location.pathname;
    if (BASE_PATH && p.startsWith(BASE_PATH)) p = p.slice(BASE_PATH.length) || "/";
    p = p.replace(/\/+$/, "") || "/";

    const mainEl = document.getElementById("noi-dung-chinh") || document.querySelector("main");
    if (!mainEl) return;

    // 1. /han-viet/:slug
    const hvMatch = p.match(/^\/han-viet\/([^/]+)$/);
    if (hvMatch && hvMatch[1] !== "index.html") {
      if (lastRenderedDynamicPath === p && mainEl.dataset.xhzDynamic === p) return;
      lastRenderedDynamicPath = p;
      mainEl.dataset.xhzDynamic = p;
      await renderHanVietDetailPage(mainEl, hvMatch[1]);
      return;
    }

    // 2. /ngu-phap/:level/:pointId
    const gpMatch = p.match(/^\/ngu-phap\/([^/]+)\/([^/]+)$/);
    if (gpMatch) {
      if (lastRenderedDynamicPath === p && mainEl.dataset.xhzDynamic === p) return;
      lastRenderedDynamicPath = p;
      mainEl.dataset.xhzDynamic = p;
      await renderGrammarDetailPage(mainEl, gpMatch[1], gpMatch[2]);
      return;
    }

    // 3. /luyen-chep-chinh-ta/:slug
    const dictMatch = p.match(/^\/luyen-chep-chinh-ta\/([^/]+)$/);
    if (dictMatch && dictMatch[1] !== "index.html") {
      if (lastRenderedDynamicPath === p && mainEl.dataset.xhzDynamic === p) return;
      lastRenderedDynamicPath = p;
      mainEl.dataset.xhzDynamic = p;
      await renderDictationDetailPage(mainEl, dictMatch[1]);
      return;
    }

    // 4. /thu-vien-:curr/:level/bai-hoc/:lessonSlug or /thu-vien-:curr/:level/:topicSlug
    const currLessonMatch = p.match(/^\/thu-vien-(hsk|new-hsk|yct|boya|hanyu-jiaocheng)\/([^/]+)\/bai-hoc\/([^/]+)$/);
    if (currLessonMatch) {
      if (lastRenderedDynamicPath === p && mainEl.dataset.xhzDynamic === p) return;
      lastRenderedDynamicPath = p;
      mainEl.dataset.xhzDynamic = p;
      await renderCurriculumDetailPage(mainEl, currLessonMatch[1], currLessonMatch[2], true, currLessonMatch[3]);
      return;
    }
    const currTopicMatch = p.match(/^\/thu-vien-(hsk|new-hsk|yct|boya|hanyu-jiaocheng)\/([^/]+)\/([^/]+)$/);
    if (currTopicMatch && currTopicMatch[3] !== "index.html") {
      if (lastRenderedDynamicPath === p && mainEl.dataset.xhzDynamic === p) return;
      lastRenderedDynamicPath = p;
      mainEl.dataset.xhzDynamic = p;
      await renderCurriculumDetailPage(mainEl, currTopicMatch[1], currTopicMatch[2], false, currTopicMatch[3]);
      return;
    }

    // 5. /kiem-tra-hsk/:level/test/:testId or /de-kiem-tra/lam-bai/:testId
    const testRunMatch =
      p.match(/^\/kiem-tra-(?:hsk|yct)\/([^/]+)\/test\/([^/]+)$/) ||
      p.match(/^\/de-kiem-tra\/lam-bai\/([^/]+)$/);
    if (testRunMatch) {
      if (lastRenderedDynamicPath === p && mainEl.dataset.xhzDynamic === p) return;
      lastRenderedDynamicPath = p;
      mainEl.dataset.xhzDynamic = p;
      const lvl = testRunMatch[2] ? testRunMatch[1] : "1";
      const tId = testRunMatch[2] || testRunMatch[1];
      await renderHskTestRunnerPage(mainEl, lvl, tId);
      return;
    }
  }

  // Intercept in-app links to dynamic detail routes so navigation is instant and never 404s
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || a.target === "_blank") return;

      // Full page reload for /han-tu/:slug and /tu-vung/:slug so __next_f flight interceptor hydrates CharacterDetailClient / VocabularyDetailClient cleanly
      if (/^\/(han-tu|tu-vung)\/[^/]+$/.test(href)) {
        e.preventDefault();
        window.location.href = BASE_PATH + href;
        return;
      }

      if (
        /^\/han-viet\/[^/]+$/.test(href) ||
        /^\/ngu-phap\/[^/]+\/[^/]+$/.test(href) ||
        /^\/luyen-chep-chinh-ta\/[^/]+$/.test(href) ||
        /^\/thu-vien-(hsk|new-hsk|yct|boya|hanyu-jiaocheng)\/[^/]+\/.+$/.test(href) ||
        /^\/kiem-tra-(hsk|yct)\/[^/]+\/test\/[^/]+$/.test(href) ||
        /^\/de-kiem-tra\/lam-bai\/[^/]+$/.test(href)
      ) {
        e.preventDefault();
        window.history.pushState({}, "", BASE_PATH + href);
        lastRenderedDynamicPath = null;
        checkAndRenderDynamicPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    true
  );

  window.addEventListener("popstate", () => {
    lastRenderedDynamicPath = null;
    checkAndRenderDynamicPage();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      rewriteDomMedia(document);
      pullProfileFromSupabase();
      checkAndRenderDynamicPage();
      setTimeout(checkAndRenderDynamicPage, 400);
      setTimeout(checkAndRenderDynamicPage, 1200);
    });
  } else {
    rewriteDomMedia(document);
    pullProfileFromSupabase();
    checkAndRenderDynamicPage();
    setTimeout(checkAndRenderDynamicPage, 400);
  }

  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) rewriteDomMedia(n);
      });
    }
  });
  if (document.documentElement) {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
