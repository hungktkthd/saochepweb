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
