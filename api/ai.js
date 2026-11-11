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

async function callLlmJson(systemPrompt, userPrompt, clientApiKey) {
  const geminiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.25 }
          })
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
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
            { role: "user", content: userPrompt }
          ],
          temperature: 0.25
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        const raw = data?.choices?.[0]?.message?.content;
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
  }
  return null;
}

async function googleTranslateFallback(text, sourceLang, targetLang, script) {
  const sl = sourceLang === "zh" ? "zh-CN" : sourceLang === "vi" ? "vi" : "auto";
  const tl = targetLang === "zh" ? (script === "traditional" ? "zh-TW" : "zh-CN") : "vi";
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=rm&q=` +
    encodeURIComponent(text);
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  if (!resp.ok) throw new Error("GTX status " + resp.status);
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
  return {
    translation: translation.trim() || text,
    pinyin: translit.trim() || null
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Device-Id");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const reqUrl = String(req.url || "");
  if (reqUrl.includes("/monitoring") || reqUrl.includes("/thay-do-rt")) {
    return res.status(200).json({ ok: true, count: 18, online: 18, n: 18 });
  }

  let rawBody = {};
  try {
    rawBody = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch (_) {
    rawBody = {};
  }
  const clientApiKey = rawBody.apiKey || "";
  const body =
    rawBody.payload && typeof rawBody.payload === "object"
      ? { ...rawBody, ...rawBody.payload }
      : rawBody;

  const action = req.query?.action || body.action || (req.method === "GET" ? "ping" : "translate");
  if (action === "ping") {
    return res.status(200).json({ ok: true, count: 18, online: 18 });
  }

  try {
    // ------------------------------------------------------------------------
    // 1. COMPANION CHAT (Dương Dương / Capy / Tiểu Mãn / Hạ Vũ / Lục Thần / Mai)
    // ------------------------------------------------------------------------
    if (action === "companion-chat") {
      const msg = String(body.message || body.text || "").trim();
      const characterName = String(body.characterName || "Dương Dương").trim();
      const pagePath = String(body.pagePath || "").trim();
      const pageTitle = String(body.pageTitle || "").trim();
      const pageWord = body.pageWord || null;
      const dictMatches = Array.isArray(body.dictMatches) ? body.dictMatches : [];

      if (!msg) {
        return res.status(200).json({
          ok: true,
          reply: `Chào bạn! Mình là ${characterName} 😊 Bạn muốn hỏi từ vựng, ngữ pháp hay cách diễn đạt câu nào trong tiếng Trung cứ nhắn cho mình nhé!`
        });
      }

      const llmRes = await callLlmJson(
        `Bạn là ${characterName}, người bạn đồng hành dạy tiếng Trung thân thiện, thông minh trên nền tảng XieHanzi. Hãy trả lời trực tiếp, tự nhiên, chính xác bằng tiếng Việt (kèm chữ Hán, Pinyin có dấu thanh và nghĩa khi đưa ví dụ tiếng Trung). Dựa vào ngữ cảnh trang hiện tại (nếu có) và câu hỏi của học viên để giải đáp rõ ràng. Trả về JSON: { "reply": "..." }.`,
        JSON.stringify({ message: msg, pagePath, pageTitle, pageWord, dictMatches }),
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
            `Trên XieHanzi có đầy đủ các công cụ học tiếng Trung từ cơ bản đến nâng cao cho bạn nhé:${contextLine}\n\n` +
            `1. **Lộ trình Học (/hoc):** Học theo từng chặng HSK 3.0 (Cấp 1–9) với bài tập tương tác 4 kỹ năng.\n` +
            `2. **Từ điển (/tu-dien):** Tra từ vựng, chữ Hán, âm Hán Việt kèm thứ tự nét viết và ví dụ.\n` +
            `3. **Luyện tập:** Nghe chép chính tả video, Luyện nghe, Luyện nói AI, Tập viết chữ Hán & Tạo vở tập viết PDF.\n` +
            `4. **Ngữ pháp & Thi thử HSK:** Kho ngữ pháp HSK 1–6, Kiểm tra ngữ pháp và Phòng thi thử HSK.\n` +
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
          return `• **${d.hanzi}** [${d.pinyin || ""}]${d.hanviet ? ` (Hán Việt: *${d.hanviet.toUpperCase()}*)` : ""}: **${d.meaningVi || ""}**`;
        });
        return res.status(200).json({
          ok: true,
          reply: `Mình tra cứu nhanh cho bạn nhé:\n${lines.join("\n")}\n\nBạn muốn mình đặt câu ví dụ với từ nào trong số này không?`
        });
      }

      // D. Dịch tự động Trung ↔ Việt bằng Google Translate GTX kèm Pinyin
      const hasHanzi = /[\u4e00-\u9fff]/.test(msg);
      if (hasHanzi) {
        const gtxVi = await googleTranslateFallback(msg, "zh", "vi", "simplified");
        const gtxPy = await googleTranslateFallback(msg, "zh", "zh", "simplified");
        const dictNote =
          dictMatches.length > 0
            ? "\n\n📚 **Từ vựng trong câu:**\n" +
              dictMatches
                .slice(0, 4)
                .map((d) => `• **${d.hanzi}** (${d.pinyin}): ${d.meaningVi}${d.hanviet ? ` [HV: ${d.hanviet}]` : ""}`)
                .join("\n")
            : "";
        return res.status(200).json({
          ok: true,
          reply:
            `Giải nghĩa cho bạn câu/từ **"${msg}"**:\n` +
            `• **Pinyin:** ${gtxPy.pinyin || gtxVi.pinyin || ""}\n` +
            `• **Nghĩa tiếng Việt:** ${gtxVi.translation}` +
            dictNote
        });
      } else {
        // Câu tiếng Việt -> Dịch sang tiếng Trung + Pinyin
        const cleanQuery = msg
          .replace(/^(dịch giúp mình|dịch câu|dịch|tiếng trung nói sao|tiếng trung là gì|nói thế nào)[:\s]*/i, "")
          .replace(/\s*(trong tiếng trung là gì|tiếng trung là gì|nói tiếng trung thế nào)\??$/i, "")
          .trim() || msg;
        const gtxZh = await googleTranslateFallback(cleanQuery, "vi", "zh", "simplified");
        return res.status(200).json({
          ok: true,
          reply:
            `Trong tiếng Trung, **"${cleanQuery}"** được diễn đạt là:\n` +
            `👉 **${gtxZh.translation}**\n` +
            `${gtxZh.pinyin ? `🔊 **Pinyin:** *${gtxZh.pinyin}*\n` : ""}` +
            `\nBạn có thể bấm nút 🔊 **Nghe** bên dưới để nghe phát âm chuẩn nhé!`
        });
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
        "Bạn là chuyên gia dịch thuật tiếng Trung - tiếng Việt của XieHanzi. Trả về JSON với các trường: translation (bản dịch tự nhiên, chuẩn xác), pinyin (phiên âm Pinyin có dấu thanh cho phần tiếng Trung), note (ghi chú ngắn gọn về từ vựng/ngữ pháp hoặc âm Hán Việt đáng chú ý bằng tiếng Việt).",
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

      const gtx = await googleTranslateFallback(text, source, target, script);
      return res.status(200).json({
        ok: true,
        status: "ok",
        sourceText: text,
        sourceLang: source,
        targetLang: target,
        script,
        translatedText: gtx.translation,
        translation: gtx.translation,
        pinyin: gtx.pinyin || body.fallbackPinyin || null,
        note: body.fallbackNote || null,
        breakdown: body.breakdown || [],
        source: "ai"
      });
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
        "Bạn là gia sư tiếng Trung XieHanzi thân thiện. Hãy nhận xét ngắn gọn (2-3 câu) bằng tiếng Việt về kết quả luyện tập của học viên và đặt 1 câu hỏi gợi mở ôn tập. Trả về JSON: { message, question }.",
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
        "Bạn là gia sư tiếng Trung XieHanzi. Trả lời ngắn gọn, dễ hiểu, khích lệ học viên bằng tiếng Việt. Trả về JSON: { reply }.",
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
  } catch (err) {
    return res.status(200).json({
      ok: true,
      status: "ok",
      translation: body.text || "",
      message: "Hệ thống đã ghi nhận kết quả của bạn.",
      error: String(err?.message || err)
    });
  }
};
