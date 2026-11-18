  // Scope the original client's fixed localStorage keys without changing auth
  // credentials or sessionStorage. Call once before the copied client starts.
  function initializeScopedStorage() {
    if (typeof Storage === 'undefined' || typeof window === 'undefined') return false;
    const prototype = Storage.prototype;
    const marker = Symbol.for('httq.scopedStorage.v1');
    if (prototype[marker]) return true;
    let local;
    try { local = window.localStorage; } catch (_) { return false; }
    if (!local) return false;
    const keys = new Set(['xhz-practice-v1', 'xhz-study-time-v1', 'xhz-intake-v1',
      'httq_companion_chat_turns', 'httq_learning_profile', 'httq_current_lesson_id',
      'httq_habit_settings', 'httq_account_profile', 'httq_companion_id',
      'httq_learned_grammar', 'httq_dismissed_mistakes', 'httq_progress_v2',
      'httq_done_stages', 'httq_done_activities', 'httq_curr_learned_words',
      'httq_current_stage_key', 'httq_last_review_mode', 'them-pinyin-history',
      'xhz-curriculum-place-v1', 'xhz-daily-session-opened-v1', 'xhz-grammar-study-v1',
      'xhz-lesson-prefs-v1', 'xhz-listening-v1', 'xhz-path-last-current',
      'xhz-practice-sound-v1', 'xhz-recent-lessons-v1', 'xhz-review-import-v1',
      'xhz-review-signals-v1', 'xhz-review-source', 'xhz-seen-words-sync-v1',
      'xhz-seen-words-v1', 'xhz-speaking-progress-v1', 'xhz-speaking-v1',
      'xhz-track-onboarding-v1', 'xhz_intake', 'xhz-collection-import-v1',
      'templateHistory', 'thay-do-world-guide-done']);
    const isScoped = key => keys.has(key) || key.startsWith('httq_daily_steps_') || key.startsWith('xiehanzi:dictation:');
    const nativeGet = prototype.getItem, nativeSet = prototype.setItem, nativeRemove = prototype.removeItem;
    const descriptors = Object.fromEntries(['getItem', 'setItem', 'removeItem'].map(name => [name, Object.getOwnPropertyDescriptor(prototype, name)]));
    const scope = () => typeof getStudyStateStorageKey === 'function' ? getStudyStateStorageKey() : 'httq_state:guest';
    const scopedKey = (key, owner) => `${key}:${owner}`;
    function getItem(input) {
      if (!arguments.length) return nativeGet.call(this);
      const key = String(input);
      if (this !== local || !isScoped(key)) return nativeGet.call(this, key);
      const owner = scope(), target = scopedKey(key, owner);
      let value = nativeGet.call(this, target);
      // Previously unscoped data belongs to this device's guest workspace. Never
      // import it into whichever registered account happens to sign in first.
      if (value === null && owner === 'httq_state:guest') {
        const legacy = nativeGet.call(this, key);
        if (legacy !== null) {
          nativeSet.call(this, target, legacy);
          nativeRemove.call(this, key);
          value = legacy;
        }
      }
      return value;
    }
    function setItem(input, value) {
      if (arguments.length < 2) return nativeSet.apply(this, arguments);
      const key = String(input);
      return nativeSet.call(this, this === local && isScoped(key) ? scopedKey(key, scope()) : key, value);
    }
    function removeItem(input) {
      if (!arguments.length) return nativeRemove.call(this);
      const key = String(input);
      if (this !== local || !isScoped(key)) return nativeRemove.call(this, key);
      const owner = scope();
      nativeRemove.call(this, scopedKey(key, owner));
      if (owner === 'httq_state:guest') nativeRemove.call(this, key);
    }
    try {
      Object.defineProperties(prototype, {
        getItem: { ...descriptors.getItem, value: getItem },
        setItem: { ...descriptors.setItem, value: setItem },
        removeItem: { ...descriptors.removeItem, value: removeItem }
      });
      Object.defineProperty(prototype, marker, { value: true, configurable: true });
    } catch (_) {
      for (const [name, descriptor] of Object.entries(descriptors)) {
        try { if (descriptor) Object.defineProperty(prototype, name, descriptor); } catch (_) {}
      }
      return false;
    }
    if (typeof window.addEventListener === 'function' && typeof StorageEvent !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.storageArea !== local || typeof event.key !== 'string') return;
        const markerIndex = event.key.lastIndexOf(':httq_state:');
        const key = markerIndex < 0 ? '' : event.key.slice(0, markerIndex);
        if (!key || !isScoped(key)) return;
        // Existing bundle listeners compare event.key with the original fixed
        // name. Translate only the active owner's event; ignore other owners.
        event.stopImmediatePropagation();
        if (event.key !== scopedKey(key, scope())) return;
        window.dispatchEvent(new StorageEvent('storage', { key, oldValue: event.oldValue, newValue: event.newValue,
          url: event.url, storageArea: local }));
      }, true);
    }
    return true;
  }
