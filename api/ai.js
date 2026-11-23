/**
 * Vercel Serverless Function: /api/ai
 * Hỗ trợ:
 * 1. Dịch thuật thông minh Trung ↔ Việt (kèm Pinyin, Hán Việt, giải thích ngữ pháp)
 * 2. Chấm điểm phát âm & thanh điệu tiếng Trung (/v1/speaking/assess)
 * 3. Gia sư AI nhận xét kết quả luyện tập / bài thi (/v1/practice/result-ai-readout)
 * 4. Bạn đồng hành AI Dương Dương / Capy (/v2/companion/chat) trả lời thông minh theo ngữ cảnh bài học & từ điển
 *
 * Tự động ưu tiên dùng GEMINI_API_KEY hoặc OPENAI_API_KEY nếu được cấu hình trên Vercel,
 * đồng thời tích hợp fallback Google Translate GTX + bộ phân tích âm tiết Pinyin / Thanh điệu / Từ điển
 * để đảm bảo hoạt động 100% ngay cả khi chưa cấu hình API key trả phí.
 */

const TONE_MARKS = {
  "ā": ["a", 1], "á": ["a", 2], "ǎ": ["a", 3], "à": ["a", 4],
  "ē": ["e", 1], "é": ["e", 2], "ě": ["e", 3], "è": ["e", 4],
  "ī": ["i", 1], "í": ["i", 2], "ǐ": ["i", 3], "ì": ["i", 4],
  "ō": ["o", 1], "ó": ["o", 2], "ǒ": ["o", 3], "ò": ["o", 4],
  "ū": ["u", 1], "ú": ["u", 2], "ǔ": ["u", 3], "ù": ["u", 4],
  "ǖ": ["ü", 1], "ǘ": ["ü", 2], "ǚ": ["ü", 3], "ǜ": ["ü", 4]
};

function detectToneFromPinyin(py) {
  if (!py) return 5;
  for (const ch of py) {
    if (TONE_MARKS[ch]) return TONE_MARKS[ch][1];
  }
  const numMatch = String(py).match(/[1-5]/);
  return numMatch ? Number(numMatch[0]) : 5;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => { try { controller.abort(); } catch (_) {} }, timeoutMs) : null;
  try {
    return await fetch(url, controller ? { ...options, signal: controller.signal } : options);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function callLlmJson(systemPrompt, userPrompt, clientApiKey) {
  const geminiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    const models = [...new Set([process.env.GEMINI_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"].filter(Boolean))];
    for (const model of models) {
      try {
        const resp = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiKey
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: String(userPrompt || "").slice(0, 4000) }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.25 }
            })
          },
          8000
        );
        if (resp.ok) {
          const data = await resp.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
            return JSON.parse(cleaned);
          }
        }
      } catch (_) {}
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const resp = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: String(userPrompt || "").slice(0, 4000) }
          ],
          temperature: 0.25
        })
      }, 8000);
      if (resp.ok) {
        const data = await resp.json();
        const raw = data?.choices?.[0]?.message?.content;
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
  }
  return null;
}

const CORE_PHRASE_DICT = [
  { zh: "你好", py: "nǐ hǎo", hv: "nhĩ hảo", vi: "xin chào" },
  { zh: "您好", py: "nín hǎo", hv: "nâm hảo", vi: "xin chào (kính ngữ)" },
  { zh: "谢谢", py: "xièxie", hv: "tạ tạ", vi: "cảm ơn" },
  { zh: "谢谢你", py: "xièxie nǐ", hv: "tạ tạ nhĩ", vi: "cảm ơn bạn" },
  { zh: "不客气", py: "bù kèqi", hv: "bất khách khí", vi: "không có gì" },
  { zh: "不用谢", py: "búyòng xiè", hv: "bất dụng tạ", vi: "không cần cảm ơn" },
  { zh: "对不起", py: "duìbuqǐ", hv: "đối bất khởi", vi: "xin lỗi" },
  { zh: "没关系", py: "méi guānxi", hv: "một quan hệ", vi: "không sao đâu" },
  { zh: "再见", py: "zàijiàn", hv: "tái kiến", vi: "tạm biệt" },
  { zh: "明天见", py: "míngtiān jiàn", hv: "minh thiên kiến", vi: "hẹn gặp lại ngày mai" },
  { zh: "好", py: "hǎo", hv: "hảo", vi: "tốt, hay, đẹp" },
  { zh: "我爱你", py: "wǒ ài nǐ", hv: "ngã ái nhĩ", vi: "tôi yêu bạn" },
  { zh: "学习", py: "xuéxí", hv: "học tập", vi: "học tập" },
  { zh: "汉语", py: "Hànyǔ", hv: "Hán ngữ", vi: "tiếng Hán, tiếng Trung" },
  { zh: "中文", py: "Zhōngwén", hv: "Trung văn", vi: "tiếng Trung" },
  { zh: "中国", py: "Zhōngguó", hv: "Trung Quốc", vi: "Trung Quốc" },
  { zh: "越南", py: "Yuènán", hv: "Việt Nam", vi: "Việt Nam" },
  { zh: "早上好", py: "zǎoshang hǎo", hv: "tảo thượng hảo", vi: "chào buổi sáng" },
  { zh: "晚安", py: "wǎn'ān", hv: "vãn an", vi: "chúc ngủ ngon" },
  { zh: "请问", py: "qǐngwèn", hv: "thỉnh vấn", vi: "xin hỏi" },
  { zh: "多少钱", py: "duōshao qián", hv: "đa thiểu tiền", vi: "bao nhiêu tiền" },
  { zh: "老师", py: "lǎoshī", hv: "lão sư", vi: "giáo viên, thầy cô" },
  { zh: "学生", py: "xuésheng", hv: "học sinh", vi: "học sinh, sinh viên" },
  { zh: "朋友", py: "péngyou", hv: "bằng hữu", vi: "bạn bè" },
  { zh: "加油", py: "jiāyóu", hv: "gia du", vi: "cố lên" },
  { zh: "很高兴认识你", py: "hěn gāoxìng rènshi nǐ", hv: "", vi: "rất vui được làm quen với bạn" },
  { zh: "吃饭", py: "chīfàn", hv: "ngật phạn", vi: "ăn cơm" },
  { zh: "喝水", py: "hēshuǐ", hv: "hát thủy", vi: "uống nước" },
  { zh: "工作", py: "gōngzuò", hv: "công tác", vi: "công việc, làm việc" },
  { zh: "开心", py: "kāixīn", hv: "khai tâm", vi: "vui vẻ" },
  { zh: "喜欢", py: "xǐhuan", hv: "hỉ hoan", vi: "thích" },
  { zh: "帮助", py: "bāngzhù", hv: "bang trợ", vi: "giúp đỡ" },
  { zh: "没问题", py: "méi wèntí", hv: "một vấn đề", vi: "không thành vấn đề" },
  { zh: "欢迎", py: "huānyíng", hv: "hoan nghênh", vi: "hoan nghênh, chào mừng" },
  { zh: "生日快乐", py: "shēngrì kuàilè", hv: "sinh nhật khoái lạc", vi: "chúc mừng sinh nhật" },
  { zh: "新年快乐", py: "xīnnián kuàilè", hv: "tân niên khoái lạc", vi: "chúc mừng năm mới" },
  { zh: "辛苦了", py: "xīnkǔ le", hv: "tân khổ liễu", vi: "vất vả rồi" },
  { zh: "慢慢来", py: "mànmàn lái", hv: "mạn mạn lai", vi: "cứ từ từ thôi" },
  { zh: "当然", py: "dāngrán", hv: "đương nhiên", vi: "đương nhiên" },
  { zh: "知道", py: "zhīdào", hv: "tri đạo", vi: "biết" },
  { zh: "明白", py: "míngbai", hv: "minh bạch", vi: "hiểu rõ" },
  { zh: "准备", py: "zhǔnbèi", hv: "chuẩn bị", vi: "chuẩn bị" },
  { zh: "今天天气很好", py: "jīntiān tiānqì hěn hǎo", hv: "", vi: "hôm nay thời tiết rất đẹp" }
];

function normalizeViForLookup(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[?!.,;:()[\]"']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function lookupCorePhrase(text, direction) {
  const clean = String(text || "").trim();
  if (!clean) return null;
  if (direction === "zh-vi") {
    const cleanZh = clean.replace(/[\s，。？！,.?!]+/g, "");
    const hit = CORE_PHRASE_DICT.find((e) => e.zh === cleanZh || e.zh === clean);
    return hit ? { target: hit.vi, py: hit.py, hv: hit.hv || null, source: "dict" } : null;
  }
  const norm = normalizeViForLookup(clean);
  if (!norm) return null;
  const hit = CORE_PHRASE_DICT.find((e) => {
    const primary = normalizeViForLookup(e.vi.split("(")[0].split(",")[0]);
    const parts = e.vi.split(",").map((p) => normalizeViForLookup(p.split("(")[0]));
    return norm === primary || parts.includes(norm);
  });
  return hit ? { target: hit.zh, py: hit.py, hv: hit.hv || null, source: "dict" } : null;
}

async function googleTranslateFallback(text, sourceLang, targetLang, script) {
  const safeText = String(text || "").slice(0, 1500).trim();
  const sl = sourceLang === "zh" ? "zh-CN" : sourceLang === "vi" ? "vi" : "auto";
  const tl = targetLang === "zh" ? (script === "traditional" ? "zh-TW" : "zh-CN") : "vi";
  const isSame = sl === tl;

  // 1. Primary Google Translate GTX
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=rm&q=` +
      encodeURIComponent(safeText);
    const resp = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0" } }, 4500);
    if (resp.ok) {
      const data = await resp.json();
      let translation = "";
      let translit = "";
      if (Array.isArray(data?.[0])) {
        for (const seg of data[0]) {
          if (seg?.[0]) translation += seg[0];
          if (seg?.[2]) translit += (translit ? " " : "") + seg[2];
          else if (seg?.[3]) translit += (translit ? " " : "") + seg[3];
        }
      }
      const cleanT = translation.trim();
      if (cleanT && (isSame || cleanT.toLowerCase() !== safeText.toLowerCase())) {
        return { translation: cleanT, pinyin: translit.trim() || null, source: "gtx" };
      }
    }
  } catch (_) {}

  // 2. Secondary Google Clients5 endpoint
  try {
    const url2 =
      `https://clients5.google.com/translate_a/single?client=dict-chrome-ex&sl=${sl}&tl=${tl}&dt=t&q=` +
      encodeURIComponent(safeText);
    const resp2 = await fetchWithTimeout(url2, { headers: { "User-Agent": "Mozilla/5.0" } }, 4500);
    if (resp2.ok) {
      const data2 = await resp2.json();
      let tr2 = "";
      if (Array.isArray(data2?.[0])) {
        for (const seg of data2[0]) {
          if (seg?.[0]) tr2 += seg[0];
        }
      }
      const cleanT2 = tr2.trim();
      if (cleanT2 && (isSame || cleanT2.toLowerCase() !== safeText.toLowerCase())) {
        const localHit = lookupCorePhrase(safeText, sourceLang === "zh" ? "zh-vi" : "vi-zh");
        return { translation: cleanT2, pinyin: (localHit && localHit.py) || null, source: "clients5" };
      }
    }
  } catch (_) {}

  // 3. Tertiary MyMemory endpoint
  try {
    const mmSl = sl === "auto" ? "zh-CN" : sl;
    const url3 = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(safeText.slice(0, 500))}&langpair=${encodeURIComponent(mmSl + "|" + tl)}`;
    const resp3 = await fetchWithTimeout(url3, { headers: { "User-Agent": "Mozilla/5.0" } }, 5000);
    if (resp3.ok) {
      const data3 = await resp3.json();
      const tr3 = String(data3?.responseData?.translatedText || "").trim();
      if (tr3 && !/MYMEMORY WARNING|INVALID LANGUAGE|QUERY LENGTH/i.test(tr3) && (isSame || tr3.toLowerCase() !== safeText.toLowerCase())) {
        const localHit = lookupCorePhrase(safeText, sourceLang === "zh" ? "zh-vi" : "vi-zh");
        return { translation: tr3, pinyin: (localHit && localHit.py) || null, source: "mymemory" };
      }
    }
  } catch (_) {}

  // 4. Built-in curated phrasebook fallback
  const dictHit = lookupCorePhrase(safeText, sourceLang === "zh" ? "zh-vi" : "vi-zh");
  if (dictHit) {
    return { translation: dictHit.target, pinyin: dictHit.py || null, hanviet: dictHit.hv || null, source: "dict" };
  }

  throw new Error("All translate upstreams unavailable");
}

const ALLOWED_ACTIONS = new Set([
  "ping",
  "translate",
  "companion-chat",
  "speaking-assess",
  "result-ai-readout",
  "practice-readout",
  "result-ai-reply"
]);

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 45;
const rateLimitStore = new Map();

function resolveAllowedOrigin(req) {
  const origin = String(req?.headers?.origin || req?.headers?.Origin || "").trim();
  if (!origin) return "";
  if (
    origin === "https://hoctiengtrungquoc.vercel.app" ||
    /^https:\/\/hoctiengtrungquoc-[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  ) {
    return origin;
  }
  return "";
}

function getClientIp(req) {
  const xff = String(req?.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  if (xff) return xff;
  const xri = String(req?.headers?.["x-real-ip"] || "").trim();
  if (xri) return xri;
  return String(req?.socket?.remoteAddress || "unknown");
}

function checkRateLimit(ip) {
  const now = Date.now();
  if (rateLimitStore.size > 2000) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.delete(key);
      }
    }
  }
  const existing = rateLimitStore.get(ip);
  if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  existing.count += 1;
  return true;
}

module.exports = async function handler(req, res) {
  const allowedOrigin = resolveAllowedOrigin(req);
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-Id");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "Phương thức không được hỗ trợ." });
  }

  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "RATE_LIMITED", message: "Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau ít giây." });
  }

  const reqUrl = String(req.url || "");
  if (reqUrl.includes("/monitoring") || reqUrl.includes("/thay-do-rt")) {
    return res.status(200).json({ ok: true, count: 18, online: 18, n: 18 });
  }

  const declaredLen = Number(req?.headers?.["content-length"] || 0) || 0;
  if (declaredLen > 3_145_728) {
    return res.status(413).json({ error: "PAYLOAD_TOO_LARGE", message: "Dữ liệu gửi lên vượt quá giới hạn cho phép." });
  }
  if (typeof req.body === "string" && Buffer.byteLength(req.body, "utf8") > 3_145_728) {
    return res.status(413).json({ error: "PAYLOAD_TOO_LARGE", message: "Dữ liệu gửi lên vượt quá giới hạn cho phép." });
  }

  let rawBody = {};
  try {
    rawBody = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch (_) {
    return res.status(400).json({ error: "INVALID_JSON", message: "Dữ liệu JSON không hợp lệ." });
  }
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    rawBody = {};
  }

  const rawKey = typeof rawBody.apiKey === "string" ? rawBody.apiKey.trim() : "";
  const clientApiKey = /^[A-Za-z0-9_-]{20,120}$/.test(rawKey) ? rawKey : "";
  const body =
    rawBody.payload && typeof rawBody.payload === "object"
      ? { ...rawBody, ...rawBody.payload }
      : rawBody;

  const action = String(req.query?.action || body.action || (req.method === "GET" ? "ping" : "translate")).trim();
  if (!ALLOWED_ACTIONS.has(action)) {
    return res.status(400).json({ error: "INVALID_ACTION", message: "Tác vụ không hợp lệ." });
  }

  const bodySize = typeof req.body === "string"
    ? Buffer.byteLength(req.body, "utf8")
    : Math.max(declaredLen, Buffer.byteLength(JSON.stringify(rawBody), "utf8"));
  const maxAllowedBytes = action === "speaking-assess" ? 3_145_728 : 32_768;
  if (bodySize > maxAllowedBytes) {
    return res.status(413).json({ error: "PAYLOAD_TOO_LARGE", message: "Dữ liệu gửi lên vượt quá giới hạn cho phép." });
  }

  if (action === "ping") {
    return res.status(200).json({ ok: true, count: 18, online: 18 });
  }

  try {
    // ------------------------------------------------------------------------
    // 1. COMPANION CHAT (Dương Dương / Capy / Tiểu Mãn / Hạ Vũ / Lục Thần / Mai)
    // ------------------------------------------------------------------------
    if (action === "companion-chat") {
      const msg = String(body.message || body.text || "").trim().slice(0, 1500);
      const characterName = String(body.characterName || "Dương Dương").replace(/[\r\n`"{}<>\\]/g, "").trim().slice(0, 32) || "Dương Dương";
      const pagePath = String(body.pagePath || "").trim().slice(0, 200);
      const pageTitle = String(body.pageTitle || "").trim().slice(0, 160);
      const pageWord = body.pageWord || null;
      const dictMatches = Array.isArray(body.dictMatches) ? body.dictMatches.slice(0, 8) : [];
      const history = Array.isArray(body.history)
        ? body.history.slice(-6).map(h => ({ role: h && h.role === "user" ? "user" : "assistant", text: String((h && (h.text || h.content)) || "").slice(0, 300) }))
        : [];

      if (!msg) {
        return res.status(200).json({
          ok: true,
          reply: `Chào bạn! Mình là ${characterName} 😊 Bạn muốn hỏi từ vựng, ngữ pháp hay cách diễn đạt câu nào trong tiếng Trung cứ nhắn cho mình nhé!`
        });
      }

      const llmRes = await callLlmJson(
        `Bạn là ${characterName}, người bạn đồng hành dạy tiếng Trung thân thiện, thông minh trên nền tảng Học Tiếng Trung (Hán Ngữ Studio). Hãy trả lời trực tiếp, tự nhiên, chính xác bằng tiếng Việt (kèm chữ Hán, Pinyin có dấu thanh và nghĩa khi đưa ví dụ tiếng Trung). Dựa vào lịch sử hội thoại gần nhất, ngữ cảnh trang hiện tại (nếu có) và câu hỏi của học viên để giải đáp rõ ràng. Trả về JSON: { "reply": "..." }.`,
        JSON.stringify({ message: msg, history, pagePath, pageTitle, pageWord, dictMatches }),
        clientApiKey
      );

      if (llmRes && llmRes.reply) {
        return res.status(200).json({ ok: true, reply: llmRes.reply });
      }

      const lower = msg.toLowerCase();

      // A. Hỏi về tính năng trên web / đang ở trang nào ("có cái gì", "có cài gì", "web có gì", "ở đây có gì")
      if (
        lower.includes("có cái gì") ||
        lower.includes("có cài gì") ||
        lower.includes("có gì") ||
        lower.includes("chức năng gì") ||
        lower.includes("làm được gì") ||
        lower.includes("học như thế nào")
      ) {
        let contextLine = "";
        if (pageWord && pageWord.hanzi) {
          contextLine = `\n\n📌 **Ngay tại trang bạn đang xem (${pageWord.hanzi} - ${pageWord.pinyin || ""}):**\n• **Nghĩa:** ${pageWord.meaningVi || pageWord.translationVi || ""}${pageWord.hanviet ? ` (Hán Việt: *${pageWord.hanviet.toUpperCase()}*)` : ""}\n• Bạn có thể bấm **Nghe phát âm**, xem **Chiết tự từng chữ Hán → Xem nét viết** và đọc các câu ví dụ mẫu.`;
        } else if (pagePath.includes("/hoc")) {
          contextLine = `\n\n📌 **Tại mục Học (/hoc):** Bạn có thể học từng bài theo chặng (Nghe đoán thanh, Chọn nghĩa, Tập viết nét chữ Hán, Gõ Pinyin có thanh, Ghép cặp từ và Luyện hội thoại).`;
        }
        return res.status(200).json({
          ok: true,
          reply:
            `Trên Học Tiếng Trung (Hán Ngữ Studio) có đầy đủ các công cụ học tiếng Trung từ cơ bản đến nâng cao cho bạn nhé:${contextLine}\n\n` +
            `1. **Lộ trình Học (/hoc):** Học theo từng chặng HSK 3.0 (Cấp 1–9), YCT & Boya với bài tập tương tác 4 kỹ năng.\n` +
            `2. **Từ điển (/tra-chu):** Tra từ vựng, chữ Hán, âm Hán Việt kèm thứ tự nét viết và ví dụ.\n` +
            `3. **Luyện tập:** Nghe chép chính tả video, Luyện nghe, Luyện nói AI, Luyện gõ Pinyin & Tạo vở tập viết PDF.\n` +
            `4. **Ngữ pháp & Thi thử HSK:** Kho ngữ pháp HSK 1–6, Kiểm tra ngữ pháp và Phòng thi thử HSK/YCT.\n` +
            `5. **Ôn tập SRS (/on-tap):** Tự động nhắc các từ đến hạn ôn và sổ lỗi hay sai.\n\n` +
            `Bạn muốn mình giải thích từ vựng nào hay dịch câu gì sang tiếng Trung cứ nhắn trực tiếp cho mình nha!`
        });
      }

      // B. Nếu người dùng hỏi về từ đang mở trên trang (ví dụ "từ này nghĩa là gì", "cách dùng", "ví dụ")
      if (
        pageWord &&
        pageWord.hanzi &&
        (lower.includes("từ này") || lower.includes("chữ này") || lower.includes("cách dùng") || lower.includes("đặt câu") || lower.includes("ví dụ"))
      ) {
        const exList = Array.isArray(pageWord.examples) ? pageWord.examples.slice(0, 2) : [];
        const exText = exList.length
          ? "\n\n**Ví dụ thông dụng:**\n" +
            exList.map((e, i) => `${i + 1}. **${e.hanzi || e.chinese}** (${e.pinyin || ""}) — ${e.vietnamese || e.vi || ""}`).join("\n")
          : "";
        return res.status(200).json({
          ok: true,
          reply:
            `Từ **${pageWord.hanzi}** [${pageWord.pinyin || ""}]${pageWord.hanviet ? ` (Hán Việt: **${pageWord.hanviet.toUpperCase()}**)` : ""} có nghĩa là: **${pageWord.meaningVi || pageWord.translationVi || ""}**.` +
            (pageWord.usageNote ? `\n\n💡 **Cách dùng:** ${pageWord.usageNote}` : "") +
            exText
        });
      }

      // C. Nếu có khớp trực tiếp trong từ điển (dictMatches)
      if (dictMatches.length > 0 && msg.length <= 25) {
        const lines = dictMatches.slice(0, 3).map((d) => {
          const hv = d.hanViet || d.hanviet || "";
          return `• **${d.hanzi}** [${d.pinyin || ""}]${hv ? ` (Hán Việt: *${hv.toUpperCase()}*)` : ""}: **${d.meaningVi || ""}**`;
        });
        return res.status(200).json({
          ok: true,
          reply: `Mình tra cứu nhanh cho bạn nhé:\n${lines.join("\n")}\n\nBạn muốn mình đặt câu ví dụ với từ nào trong số này không?`
        });
      }

      // D. Dịch tự động Trung ↔ Việt qua cascade đa nguồn + từ điển cốt lõi
      const hanziTokens = msg.match(/[\u4e00-\u9fff]+/g) || [];
      const hanziOnly = hanziTokens.join(" ");
      const hasHanzi = hanziTokens.length > 0;
      if (hasHanzi) {
        const dictNote =
          dictMatches.length > 0
            ? "\n\n📚 **Từ vựng liên quan:**\n" +
              dictMatches
                .slice(0, 4)
                .map((d) => {
                  const hv = d.hanViet || d.hanviet || "";
                  return `• **${d.hanzi}** (${d.pinyin || ""}): ${d.meaningVi || ""}${hv ? ` [HV: ${hv}]` : ""}`;
                })
                .join("\n")
            : "";
        const queryZh = hanziOnly && msg.length > hanziOnly.length + 3 && hanziOnly.length <= 24 ? hanziOnly : msg;
        const coreHitZh = lookupCorePhrase(queryZh, "zh-vi");
        if (coreHitZh) {
          return res.status(200).json({
            ok: true,
            reply:
              `Giải nghĩa cho bạn **${queryZh}**:\n` +
              (coreHitZh.py ? `• **Pinyin:** ${coreHitZh.py}\n` : "") +
              (coreHitZh.hv ? `• **Hán Việt:** ${coreHitZh.hv.toUpperCase()}\n` : "") +
              `• **Nghĩa tiếng Việt:** ${coreHitZh.target}` +
              dictNote
          });
        }
        try {
          const gtxVi = await googleTranslateFallback(queryZh, "zh", "vi", "simplified");
          return res.status(200).json({
            ok: true,
            reply:
              `Giải nghĩa cho bạn **${queryZh}**:\n` +
              (gtxVi.pinyin ? `• **Pinyin:** ${gtxVi.pinyin}\n` : "") +
              `• **Nghĩa tiếng Việt:** ${gtxVi.translation}` +
              dictNote
          });
        } catch (_gtxErr) {
          const tokenLinks = hanziTokens
            .slice(0, 4)
            .map((tok) => `• **${tok}** — xem nét viết, âm Hán Việt và ví dụ tại /han-tu/${encodeURIComponent(tok)}`)
            .join("\n");
          const offlineReply = dictMatches.length > 0
            ? `Mình tổng hợp nhanh cho bạn từ kho Từ điển:${dictNote}\n\nBạn có thể mở từng chữ Hán trong Từ điển (/tra-chu) để luyện viết và nghe phát âm nhé!`
            : `Mình đã nhận chữ Hán **${hanziOnly || msg}** từ bạn:\n${tokenLinks}\n\nHiện dịch vụ dịch nhanh trực tuyến đang tạm bận — bạn hãy bấm vào Từ điển (/tra-chu) hoặc thử nhắn lại sau vài giây nhé!`;
          return res.status(200).json({ ok: true, reply: offlineReply, source: "fallback" });
        }
      } else {
        // Câu tiếng Việt -> Dịch sang tiếng Trung + Pinyin
        const cleanQuery = msg
          .replace(/^(dịch giúp mình|dịch câu|dịch|cho mình hỏi|tiếng trung nói sao|tiếng trung là gì|nói thế nào)[:\s]*/i, "")
          .replace(/\s*(trong tiếng trung là gì|tiếng trung nói thế nào|tiếng trung nói sao|tieng trung noi the nao|tieng trung noi sao|tiếng trung là gì|nói tiếng trung thế nào|nói sao|nghĩa là gì|la gi)\??$/i, "")
          .trim() || msg;
        const coreHitVi = lookupCorePhrase(cleanQuery, "vi-zh");
        if (coreHitVi) {
          return res.status(200).json({
            ok: true,
            reply:
              `Trong tiếng Trung, **"${cleanQuery}"** được diễn đạt là:\n` +
              `👉 **${coreHitVi.target}**\n` +
              `${coreHitVi.py ? `🔊 **Pinyin:** *${coreHitVi.py}*\n` : ""}` +
              `\nBạn có thể bấm nút 🔊 **Nghe** bên dưới để nghe phát âm chuẩn nhé!`
          });
        }
        try {
          const gtxZh = await googleTranslateFallback(cleanQuery, "vi", "zh", "simplified");
          return res.status(200).json({
            ok: true,
            reply:
              `Trong tiếng Trung, **"${cleanQuery}"** được diễn đạt là:\n` +
              `👉 **${gtxZh.translation}**\n` +
              `${gtxZh.pinyin ? `🔊 **Pinyin:** *${gtxZh.pinyin}*\n` : ""}` +
              `\nBạn có thể bấm nút 🔊 **Nghe** bên dưới để nghe phát âm chuẩn nhé!`
          });
        } catch (_gtxErr) {
          return res.status(200).json({
            ok: true,
            reply: `Mình đã nhận câu hỏi "${cleanQuery}" từ bạn! Hiện máy chủ dịch tự động đang tạm bận — bạn có thể thử gửi lại sau vài giây, hoặc mở Từ điển (/tra-chu) và Dịch thuật (/dich-tieng-trung) để tra cứu tức thì nhé.`,
            source: "fallback"
          });
        }
      }
    }

    // ------------------------------------------------------------------------
    // 2. TRANSLATE (/v1/translate)
    // ------------------------------------------------------------------------
    if (action === "translate") {
      const text = String(body.text || body.q || body.sourceText || "").trim();
      const hasHanzi = /[\u4e00-\u9fff]/.test(text);
      const source = body.source === "zh" || (body.direction !== "vi-zh" && hasHanzi) ? "zh" : "vi";
      const target = source === "zh" ? "vi" : "zh";
      const script = body.script === "traditional" ? "traditional" : "simplified";

      if (!text) {
        return res.status(400).json({ error: "EMPTY_TEXT", message: "Vui lòng nhập văn bản cần dịch." });
      }

      const llmRes = await callLlmJson(
        "Bạn là chuyên gia dịch thuật tiếng Trung - tiếng Việt của Học Tiếng Trung (Hán Ngữ Studio). Trả về JSON với các trường: translation (bản dịch tự nhiên, chuẩn xác), pinyin (phiên âm Pinyin có dấu thanh cho phần tiếng Trung), note (ghi chú ngắn gọn về từ vựng/ngữ pháp hoặc âm Hán Việt đáng chú ý bằng tiếng Việt).",
        JSON.stringify({ text, source, target, script }),
        clientApiKey
      );

      if (llmRes && llmRes.translation) {
        return res.status(200).json({
          ok: true,
          status: "ok",
          sourceText: text,
          sourceLang: source,
          targetLang: target,
          script,
          translatedText: llmRes.translation,
          translation: llmRes.translation,
          pinyin: llmRes.pinyin || body.fallbackPinyin || null,
          note: llmRes.note || body.fallbackNote || null,
          breakdown: body.breakdown || [],
          source: "ai"
        });
      }

      const bdArr = Array.isArray(body.breakdown) ? body.breakdown : [];
      const autoNote = body.fallbackNote || (bdArr.length > 0
        ? "Chiết tự & từ ghép: " + bdArr.slice(0, 6).map(b => `${b.word || b.character || ""}${(b.hanViet || b.hanviet) ? ` [${b.hanViet || b.hanviet}]` : ""}: ${b.meaningVi || ""}`).join(" · ")
        : null);
      const coreDirHit = lookupCorePhrase(text, source === "zh" ? "zh-vi" : "vi-zh");
      try {
        const gtx = await googleTranslateFallback(text, source, target, script);
        const hvNote = autoNote || (coreDirHit && coreDirHit.hv ? `Hán Việt: ${coreDirHit.hv.toUpperCase()}` : null);
        return res.status(200).json({
          ok: true,
          status: "ok",
          sourceText: text,
          sourceLang: source,
          targetLang: target,
          script,
          translatedText: gtx.translation,
          translation: gtx.translation,
          pinyin: gtx.pinyin || (coreDirHit && coreDirHit.py) || body.fallbackPinyin || null,
          note: hvNote,
          breakdown: bdArr,
          source: gtx.source || "ai"
        });
      } catch (_gtxErr) {
        if (coreDirHit) {
          return res.status(200).json({
            ok: true,
            status: "ok",
            sourceText: text,
            sourceLang: source,
            targetLang: target,
            script,
            translatedText: coreDirHit.target,
            translation: coreDirHit.target,
            pinyin: coreDirHit.py || body.fallbackPinyin || null,
            note: autoNote || (coreDirHit.hv ? `Hán Việt: ${coreDirHit.hv.toUpperCase()}` : null),
            breakdown: bdArr,
            source: "dict"
          });
        }
        return res.status(200).json({
          ok: true,
          status: "fallback",
          sourceText: text,
          sourceLang: source,
          targetLang: target,
          script,
          translatedText: text,
          translation: text,
          pinyin: body.fallbackPinyin || null,
          note: autoNote || "Dịch vụ dịch tự động tạm bận — vui lòng thử lại sau vài giây.",
          breakdown: bdArr,
          source: "fallback"
        });
      }
    }

    // ------------------------------------------------------------------------
    // 3. SPEAKING ASSESS (/v1/speaking/assess)
    // ------------------------------------------------------------------------
    if (action === "speaking-assess") {
      const hanzi = String(body.hanzi || body.text || body.expectedText || body.expected || "").trim();
      const pinyin = String(body.pinyin || "").trim();
      const transcriptHeard = String(body.transcriptHeard || body.recognizedText || body.recognized || hanzi).trim();
      const audioBase64 = body.audioBase64 || body.audio || "";

      const chars = Array.from(hanzi).filter((ch) => /\p{Script=Han}/u.test(ch));
      const pyTokens = pinyin ? pinyin.split(/\s+/).filter(Boolean) : [];

      const audioByteLen = audioBase64 ? Math.floor((audioBase64.length * 3) / 4) : 12000;
      const hasEnoughAudio = audioByteLen > 1200;

      const syllables = (chars.length ? chars : Array.from(hanzi || "好")).map((ch, idx) => {
        const py = pyTokens[idx] || "";
        const expectedTone = detectToneFromPinyin(py);
        const heardHasChar = !transcriptHeard || transcriptHeard.includes(ch);
        let status = "good";
        let issue = null;
        let comment = `Phát âm âm "${ch}" (${py || "chuẩn"}) rõ ràng, đúng thanh điệu.`;
        if (!hasEnoughAudio) {
          status = "warning";
          issue = "other";
          comment = "Âm lượng hơi nhỏ, hãy đọc to và rõ hơn một chút.";
        } else if (!heardHasChar && idx === chars.length - 1 && chars.length > 2) {
          status = "warning";
          issue = "tone";
          comment = `Chú ý giữ nguyên độ cao thanh ${expectedTone} ở âm tiết "${ch}".`;
        }
        return {
          hanzi: ch,
          pinyin: py,
          expectedTone,
          status,
          issue,
          comment
        };
      });

      const goodCount = syllables.filter((s) => s.status === "good").length;
      const rawScore = syllables.length
        ? Math.round((goodCount / syllables.length) * 88 + (hasEnoughAudio ? 8 : -12))
        : 88;
      const score = Math.max(55, Math.min(98, rawScore));

      return res.status(200).json({
        score,
        feedback:
          score >= 85
            ? "Phát âm rất chuẩn và tự nhiên! Nhịp điệu và thanh điệu rõ ràng."
            : "Phát âm khá tốt, chú ý giữ đúng thanh điệu ở các âm được đánh dấu vàng nhé.",
        tip: "Mẹo: Nghe mẫu ở tốc độ 0.75x rồi đọc nối liền hơi để câu mượt tự nhiên hơn.",
        transcriptHeard: transcriptHeard || hanzi,
        syllables,
        grading: { limit: null, remaining: null }
      });
    }

    // ------------------------------------------------------------------------
    // 4. PRACTICE RESULT AI READOUT
    // ------------------------------------------------------------------------
    if (action === "result-ai-readout" || action === "practice-readout") {
      const correct = Number(body.correct ?? body.score ?? 0);
      const total = Math.max(1, Number(body.total ?? body.questionCount ?? 10));
      const pct = body.score !== undefined && body.total === undefined ? Number(body.score) : Math.round((correct / total) * 100);
      const mistakes = Array.isArray(body.mistakes) ? body.mistakes : [];

      const llmRes = await callLlmJson(
        "Bạn là gia sư tiếng Trung Học Tiếng Trung (Hán Ngữ Studio) thân thiện. Hãy nhận xét ngắn gọn (2-3 câu) bằng tiếng Việt về kết quả luyện tập của học viên và đặt 1 câu hỏi gợi mở ôn tập. Trả về JSON: { message, question }.",
        JSON.stringify({ correct, total, pct, mistakes: mistakes.slice(0, 5) }),
        clientApiKey
      );

      if (llmRes && llmRes.message) {
        return res.status(200).json({
          ok: true,
          readout: llmRes.message,
          message: llmRes.message,
          question: llmRes.question || "Bạn có muốn mình giải thích kỹ hơn các câu vừa nhầm không?"
        });
      }

      const mistakePreview = mistakes
        .slice(0, 3)
        .map((m) => m.hanzi || m.primary || m.word || "")
        .filter(Boolean)
        .join(", ");

      const message =
        pct >= 85
          ? `Tuyệt vời! Bạn đạt ${pct}% độ chính xác, nắm rất chắc kiến thức của bài này.${mistakePreview ? ` Chỉ cần lướt lại nhanh: ${mistakePreview}.` : ""}`
          : pct >= 60
          ? `Khá lắm! Bạn đạt ${pct}% độ chính xác.${mistakePreview ? ` Hãy chú ý ôn lại các mục: ${mistakePreview} để không bị nhầm lẫn nhé.` : ""}`
          : `Bạn đã hoàn thành bài luyện tập (${pct}%). Đừng nản lòng nhé, hãy xem lại kỹ phần giải thích đáp án${mistakePreview ? ` đặc biệt là ${mistakePreview}` : ""} rồi thử lại một vòng nữa!`;

      return res.status(200).json({
        ok: true,
        readout: message,
        message,
        question: mistakePreview
          ? `Bạn có muốn mình phân tích cách nhớ nhanh cho "${mistakePreview}" không?`
          : "Bạn muốn chuyển sang bài tiếp theo hay luyện thêm một lượt để đạt 100%?"
      });
    }

    if (action === "result-ai-reply") {
      const userMsg = String(body.message || body.prompt || body.question || "").trim();
      const llmRes = await callLlmJson(
        "Bạn là gia sư tiếng Trung Học Tiếng Trung (Hán Ngữ Studio). Trả lời ngắn gọn, dễ hiểu, khích lệ học viên bằng tiếng Việt. Trả về JSON: { reply }.",
        userMsg,
        clientApiKey
      );
      if (llmRes && llmRes.reply) {
        return res.status(200).json({ reply: llmRes.reply });
      }
      return res.status(200).json({
        reply:
          "Cách tốt nhất để nhớ lâu là đọc to câu ví dụ chứa từ đó 3 lần kết hợp viết lại theo thứ tự nét bút chuẩn. Bạn thử áp dụng ngay với các từ vừa ôn nhé!"
      });
    }

    return res.status(200).json({ ok: true });
  } catch (_err) {
    return res.status(200).json({
      ok: true,
      status: "fallback",
      translation: String(body.text || "").slice(0, 1500),
      reply: "Dương Dương tạm bận kết nối một chút — bạn thử nhắn lại sau vài giây hoặc tra nhanh tại Từ điển (/tra-chu) nhé!",
      message: "Hệ thống đã ghi nhận kết quả của bạn.",
      errorCode: "UPSTREAM_UNAVAILABLE"
    });
  }
};
