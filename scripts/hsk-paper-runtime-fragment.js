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
