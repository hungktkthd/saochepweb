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
