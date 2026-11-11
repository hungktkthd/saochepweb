  async function renderCharacterBrowseSubPage(pathname) {
    const root = getMainContentContainer();
    const parts = pathname.split('/').filter(Boolean);
    const type = parts[1];
    let value = '';
    try { value = decodeURIComponent(parts.slice(2).join('/')); } catch (_) {}
    const index = await loadLocalJson('/data/characters/index.json');
    const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const level = /^\d+$/.test(value) ? Number(value) : null;
    const entries = Array.isArray(index) ? index.filter(item => type === 'hsk'
      ? level !== null && Number(item.hsk) === level
      : type === 'bo-thu' && item.r === value) : [];
    const title = type === 'hsk' ? `Chữ Hán HSK ${level || value} (HSK 2.0)` : `Chữ Hán bộ ${value}`;
    document.title = `${title} | XieHanzi`;
    root.innerHTML = `<style>
      #xhz-character-browse { --browse-ink:#1c1917;--browse-card:#fafaf9;--browse-border:#d6d3d1;color:var(--browse-ink); }
      html.dark #xhz-character-browse { --browse-ink:#f3ede2;--browse-card:#292420;--browse-border:#57534e; }
      #xhz-character-browse input,#xhz-character-browse select,#xhz-character-browse button,#xhz-browse-grid a { color:var(--browse-ink)!important;background:var(--browse-card)!important;border-color:var(--browse-border)!important; }
      #xhz-browse-grid a:hover { border-color:#b91c1c!important; }
    </style><section id="xhz-character-browse" style="max-width:1100px;margin:auto;">
      <a href="/tra-chu" style="color:#b91c1c;font-weight:700;">← Từ điển Hán - Việt</a>
      <h1 style="font-size:28px;font-weight:800;margin:20px 0 8px;">${escape(title)}</h1>
      <p id="xhz-browse-count" role="status">${entries.length} chữ Hán trong kho dữ liệu</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0;">
        <label style="flex:1;min-width:220px;">Tìm trong danh sách
          <input id="xhz-browse-search" type="search" placeholder="Chữ Hán, pinyin, Hán Việt hoặc nghĩa" style="display:block;width:100%;padding:12px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;" />
        </label>
        <label>Sắp xếp
          <select id="xhz-browse-sort" style="display:block;padding:12px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;">
            <option value="strokes">Số nét</option><option value="hanviet">Hán Việt A → Z</option><option value="frequency">Tần suất</option>
          </select>
        </label>
      </div>
      <div id="xhz-browse-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;"></div>
      <button id="xhz-browse-more" type="button" style="margin:20px auto;padding:10px 24px;border:1px solid #d6d3d1;border-radius:999px;background:#fff;color:#1c1917;">Xem thêm</button>
    </section>`;
    const search = root.querySelector('#xhz-browse-search');
    const sort = root.querySelector('#xhz-browse-sort');
    const grid = root.querySelector('#xhz-browse-grid');
    const count = root.querySelector('#xhz-browse-count');
    const more = root.querySelector('#xhz-browse-more');
    const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
    let visible = 60;
    const render = () => {
      const query = normalize(search.value.trim());
      const results = entries.filter(item => !query || normalize(`${item.c} ${item.p} ${item.hv} ${item.m}`).includes(query));
      results.sort((a, b) => sort.value === 'hanviet' ? String(a.hv || '').localeCompare(String(b.hv || ''), 'vi')
        : sort.value === 'frequency' ? (Number(a.f) || Infinity) - (Number(b.f) || Infinity)
        : (Number(a.s) || 0) - (Number(b.s) || 0) || (Number(a.f) || Infinity) - (Number(b.f) || Infinity));
      count.textContent = `${results.length} / ${entries.length} chữ Hán`;
      grid.innerHTML = results.slice(0, visible).map(item => `<a href="/han-tu/${encodeURIComponent(item.slug || item.c)}" style="display:flex;flex-direction:column;gap:5px;padding:16px;border:1px solid #e7e5e4;border-radius:16px;background:#fafaf9;text-decoration:none;color:#1c1917;">
        <span style="font-size:36px;font-family:'Noto Serif SC',serif;">${escape(item.c)}</span><span style="color:#b91c1c;">${escape(item.p)}</span>
        <strong>${escape(item.hv)}</strong><span style="font-size:13px;">${escape(item.m)}</span><small>${Number(item.s) || 0} nét · Bộ ${escape(item.r)}</small>
      </a>`).join('') || '<p>Không tìm thấy chữ phù hợp.</p>';
      more.hidden = visible >= results.length;
    };
    search.oninput = () => { visible = 60; render(); };
    sort.onchange = () => { visible = 60; render(); };
    more.onclick = () => { visible += 60; render(); };
    render();
  }
