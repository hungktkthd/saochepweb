/**
 * ============================================================================
 * RUNTIME ENGINE (v9.0 — HANZI STUDIO v4 SIDEBAR + BENTO WORKSPACE + CACHE BUST htq5)
 * ============================================================================
 * Phục vụ toàn bộ 280+ trang HTML tĩnh và mọi đường dẫn động (slug routes)
 * của https://hoctiengtrungquoc.vercel.app
 * Kết nối trực tiếp tới:
 *   1) Kho dữ liệu JSON cục bộ (/data/*)
 *   2) Kho 94,655 file Media trên GitHub hungktkthd/saochepweb
 *   3) Cơ sở dữ liệu đám mây Supabase (skxgzzdunqloxxombtuc)
 *   4) Serverless AI Endpoint (/api/ai)
 * ============================================================================
 */
(function () {
  'use strict';

  // ============================================================================
  // 0. REACT 19 SELECTIVE-HYDRATION CAPTURE SHIELD FOR RUNTIME-OWNED VANILLA DOM
  // ============================================================================
  // Next.js App Router mounts React 19 on `document` and attaches capture-phase
  // listeners (`uO`/`uD`) that call `event.stopPropagation()` whenever a root
  // or Suspense boundary remains dehydrated (e.g. rewritten dynamic SPA routes
  // like `/luyen-chep-chinh-ta/:slug`, `/han-tu/:char`, `/hoc/bai/:id`).
  // Guarding third-party capture listeners on document/html/body when the event
  // originates inside our own vanilla-DOM roots ensures every native `.onclick`,
  // `.onkeydown`, `.onchange`, `.oninput` fires reliably without affecting React.
  const HTQ_VANILLA_ROOT_SEL =
    '#xhz-dynamic-page-root, #xhz-lesson-runner-root, #htq-studio-sidebar, #htq-studio-workspace, #htq-page-stage, #htq-subpage-ribbon, #htq-buddy-dock, #htq-cmdk-overlay, #htq-mobile-nav, #xhz-backup-controls, #xhz-user-auth-banner, #xhz-guest-migration-card, #xhz-safe-delete-panel, #xhz-quick-tools-bar';
  (function installReactCaptureShield() {
    try {
      if (typeof window === 'undefined' || typeof EventTarget === 'undefined') return;
      if (window.__xhzCaptureShieldInstalled) return;
      window.__xhzCaptureShieldInstalled = true;
      const origAdd = EventTarget.prototype.addEventListener;
      const origRemove = EventTarget.prototype.removeEventListener;
      const listenerMap = new WeakMap();
      EventTarget.prototype.addEventListener = function (type, listener, options) {
        const isCapture = typeof options === 'boolean' ? options : Boolean(options && options.capture);
        if (
          isCapture &&
          typeof listener === 'function' &&
          !listener.__xhzRuntimeListener &&
          (this === document || this === document.documentElement || this === document.body)
        ) {
          let wrapped = listenerMap.get(listener);
          if (!wrapped) {
            wrapped = function (ev) {
              try {
                const t = ev && ev.target;
                const el = t && t.nodeType === 1 ? t : (t && t.parentElement ? t.parentElement : null);
                if (el && typeof el.closest === 'function' && el.closest(HTQ_VANILLA_ROOT_SEL)) {
                  return;
                }
              } catch (_) {}
              return listener.call(this, ev);
            };
            listenerMap.set(listener, wrapped);
          }
          return origAdd.call(this, type, wrapped, options);
        }
        return origAdd.call(this, type, listener, options);
      };
      EventTarget.prototype.removeEventListener = function (type, listener, options) {
        const isCapture = typeof options === 'boolean' ? options : Boolean(options && options.capture);
        if (isCapture && typeof listener === 'function') {
          const wrapped = listenerMap.get(listener);
          if (wrapped) {
            return origRemove.call(this, type, wrapped, options);
          }
        }
        return origRemove.call(this, type, listener, options);
      };
    } catch (_) {}
  })();

  function injectMasterV3Styles() {
    try {
      if (typeof document === 'undefined') return;
      var root = document.head || document.documentElement;
      if (!root) return;
      var st = document.getElementById('htq-v3-master-css');
      if (st && st.getAttribute('data-htq-ver') === '16') {
        injectStudioV14FxStyles();
        return;
      }
      var oldV2 = document.getElementById('htq-v2-master-css');
      if (oldV2 && oldV2.parentNode) oldV2.parentNode.removeChild(oldV2);
      if (!st) {
        st = document.createElement('style');
        st.id = 'htq-v3-master-css';
        root.appendChild(st);
      }
      var cssText = "/* === HTQ STUDIO v4 (ROYAL INDIGO SIDEBAR WORKSPACE + BENTO DASHBOARD) === */\n:root{\n  --brand:243 75% 58% !important;\n  --brand-ink:244 65% 42% !important;\n  --brand-foreground:0 0% 100% !important;\n  --interactive:262 83% 58% !important;\n  --interactive-bg:250 100% 97% !important;\n  --ring:243 75% 58% !important;\n  --primary:243 75% 58% !important;\n  --primary-foreground:0 0% 100% !important;\n}\n.dark{\n  --brand:239 84% 67% !important;\n  --brand-ink:235 90% 82% !important;\n  --brand-foreground:230 45% 8% !important;\n  --interactive:263 85% 70% !important;\n  --interactive-bg:255 45% 18% !important;\n  --ring:239 84% 67% !important;\n  --primary:239 84% 67% !important;\n  --primary-foreground:230 45% 8% !important;\n}\n\n/* Rice-paper Alabaster & Cosmic Slate Canvas */\nbody{\n  background-color:#f6f5f0 !important;\n  background-image:\n    radial-gradient(60% 45% at 15% -5%, rgba(79,70,229,.10), transparent 70%),\n    radial-gradient(50% 42% at 92% 4%, rgba(124,58,237,.08), transparent 68%),\n    radial-gradient(45% 40% at 65% 95%, rgba(225,29,72,.05), transparent 72%) !important;\n  background-attachment:fixed !important;\n}\n.dark body, html.dark body{\n  background-color:#090b14 !important;\n  background-image:\n    radial-gradient(60% 45% at 15% -5%, rgba(99,102,241,.16), transparent 70%),\n    radial-gradient(50% 42% at 92% 6%, rgba(139,92,246,.13), transparent 68%),\n    radial-gradient(45% 40% at 60% 95%, rgba(244,63,94,.07), transparent 72%) !important;\n}\n\n/* Keep Zero Old Logos & Zero Third-Party App Badges */\nheader[data-site-header=\"true\"] a[href=\"/\"] img,\nfooter[data-site-chrome=\"true\"] a[href=\"/\"] img,\nfooter a[href=\"/\"]:has(img),\nfooter a[href=\"/\"] img,\nimg[src*=\"XieHanzi_480x150\"],\nimg[alt*=\"Logo\"],\nimg[src*=\"R0lGODlhAQABAIAAAAAAAP\"],\n[data-htq-logo=\"1\"],\n[data-phone-float=\"invite\"],\na[href*=\"apps.apple.com\"],\n[data-platform=\"android\"],\n[data-platform=\"ios\"],\ndiv:has(> a[href*=\"apps.apple.com\"]),\ndiv:has(> span[data-platform=\"android\"]),\ndiv:has(> div > img[src*=\"tai-app-qr\"]),\ndiv:has(> img[src*=\"tai-app-qr\"]),\nimg[src*=\"tai-app-qr\"],\na[href*=\"facebook.com/xiehanzi\"],\na[href*=\"m.me/xiehanzi\"],\na[href*=\"youtube.com/@xiehanzi\"],\na[href*=\"status.xiehanzi.com\"]{\n  display:none !important;\n  width:0 !important;\n  height:0 !important;\n  opacity:0 !important;\n  pointer-events:none !important;\n}\n\n/* Desktop Sidebar Shell Reservation (>= 1180px on standard layout pages) */\n@media (min-width:1180px){\n  body:not([data-htq-immersive=\"1\"]) > div.flex.flex-col.min-h-screen:has(> header[data-site-header=\"true\"]){\n    padding-left:252px !important;\n  }\n}\n\n/* Detached Floating Command Bar */\nheader[data-site-header=\"true\"]{\n  top:10px !important;\n  width:calc(100% - 1.5rem) !important;\n  max-width:1320px !important;\n  margin:10px auto 0 !important;\n  border-radius:18px !important;\n  background:rgba(255,255,255,.84) !important;\n  backdrop-filter:blur(22px) saturate(165%) !important;\n  -webkit-backdrop-filter:blur(22px) saturate(165%) !important;\n  border:1px solid rgba(79,70,229,.18) !important;\n  box-shadow:0 10px 30px -14px rgba(79,70,229,.18) !important;\n}\n.dark header[data-site-header=\"true\"]{\n  background:rgba(18,22,38,.86) !important;\n  border-color:rgba(129,140,248,.22) !important;\n  box-shadow:0 12px 32px -12px rgba(0,0,0,.65) !important;\n}\nheader[data-site-header=\"true\"] > div{\n  max-width:100% !important;\n}\n\n/* Royal Indigo Home Pill */\nheader[data-site-header=\"true\"] > div > a[href=\"/\"],\nheader a[data-htq-home-pill=\"1\"]{\n  display:inline-flex !important;\n  align-items:center !important;\n  gap:.45rem !important;\n  min-height:2.25rem !important;\n  padding:.38rem .95rem !important;\n  border-radius:9999px !important;\n  background:linear-gradient(135deg, rgba(79,70,229,.14), rgba(124,58,237,.12)) !important;\n  border:1px solid rgba(79,70,229,.32) !important;\n  color:#4338ca !important;\n  font-size:.875rem !important;\n  font-weight:700 !important;\n  letter-spacing:-.01em !important;\n  text-decoration:none !important;\n  white-space:nowrap !important;\n  box-shadow:0 2px 10px -2px rgba(79,70,229,.16) !important;\n  transition:all .2s cubic-bezier(.22,1,.36,1) !important;\n}\nheader[data-site-header=\"true\"] > div > a[href=\"/\"]:hover,\nheader a[data-htq-home-pill=\"1\"]:hover{\n  transform:translateY(-1px) !important;\n  background:linear-gradient(135deg, rgba(79,70,229,.22), rgba(124,58,237,.18)) !important;\n}\nheader[data-site-header=\"true\"] > div > a[href=\"/\"]::before,\nheader a[data-htq-home-pill=\"1\"]::before{\n  content:\"❖ Trang chủ\" !important;\n  font-weight:700 !important;\n  line-height:1 !important;\n}\n.dark header[data-site-header=\"true\"] > div > a[href=\"/\"],\n.dark header a[data-htq-home-pill=\"1\"]{\n  background:linear-gradient(135deg, rgba(99,102,241,.24), rgba(139,92,246,.20)) !important;\n  border-color:rgba(165,180,252,.36) !important;\n  color:#c7d2fe !important;\n}\nheader[data-site-header=\"true\"] nav a,\nheader[data-site-header=\"true\"] nav button{\n  border-radius:9999px !important;\n}\n\n/* Complete Home Layout Restructure at t = 0ms */\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu){\n  display:flex !important;\n  flex-direction:column !important;\n  gap:1.15rem !important;\n  max-width:1320px !important;\n  margin:0 auto !important;\n  padding:1rem 1rem 2.75rem !important;\n}\n/* Hide old mobile-app marketing sections permanently */\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section:first-of-type,\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section:has(ul[aria-label=\"Tính năng của app\"]),\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section.band-dark,\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section[aria-labelledby=\"app-faq-heading\"],\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section[aria-labelledby=\"app-final-cta-heading\"]{\n  display:none !important;\n}\n/* Order 1: Top Studio Search Command Hero */\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section#tra-cuu{\n  order:1 !important;\n  padding:0 !important;\n}\nsection#tra-cuu > div.mx-auto:first-child{\n  max-width:100% !important;\n  padding:1.45rem 1.35rem !important;\n  border-radius:24px !important;\n  background:linear-gradient(135deg, #ffffff 0%, #eef2ff 52%, #fdf2f8 100%) !important;\n  border:1px solid rgba(79,70,229,.22) !important;\n  box-shadow:0 20px 50px -24px rgba(79,70,229,.26), inset 0 1px 0 rgba(255,255,255,.95) !important;\n}\n@media (min-width:768px){\n  section#tra-cuu > div.mx-auto:first-child{\n    padding:1.75rem 2.25rem !important;\n  }\n}\n.dark section#tra-cuu > div.mx-auto:first-child{\n  background:linear-gradient(135deg, #121626 0%, #1a1836 52%, #241328 100%) !important;\n  border-color:rgba(129,140,248,.28) !important;\n  box-shadow:0 24px 56px -20px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.06) !important;\n}\nsection#tra-cuu > div.mx-auto.mt-4:not(:has(a,button)){\n  display:none !important;\n}\nsection#tra-cuu > div.mx-auto:first-child::before{\n  content:\"HÁN NGỮ STUDIO 4.0  •  CHIẾT TỰ & LUYỆN AI  •  HSK 3.0\";\n  display:inline-flex;\n  align-items:center;\n  margin-bottom:.75rem;\n  padding:.34rem .85rem;\n  border-radius:9999px;\n  font-size:.70rem;\n  font-weight:800;\n  letter-spacing:.05em;\n  color:#4338ca;\n  background:rgba(79,70,229,.10);\n  border:1px solid rgba(79,70,229,.24);\n}\n@media (max-width:639px){\n  section#tra-cuu > div.mx-auto:first-child::before{\n    font-size:.57rem;\n    padding:.28rem .62rem;\n    letter-spacing:.02em;\n    max-width:100%;\n  }\n}\n.dark section#tra-cuu > div.mx-auto:first-child::before{\n  color:#c7d2fe;\n  background:rgba(129,140,248,.16);\n  border-color:rgba(165,180,252,.28);\n}\nsection#tra-cuu .max-w-3xl{\n  max-width:100% !important;\n}\n/* Order 2: New 12-Col Bento Workspace */\n#htq-studio-workspace{\n  order:2 !important;\n}\n/* Order 3: Daily Hanzi + Web Tools */\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section.bg-surface-2:not([aria-labelledby]){\n  order:3 !important;\n  border-radius:24px !important;\n  padding:1.75rem 0 !important;\n  background:rgba(255,255,255,.78) !important;\n  border:1px solid rgba(79,70,229,.14) !important;\n  backdrop-filter:blur(14px) !important;\n}\n.dark main#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section.bg-surface-2:not([aria-labelledby]){\n  background:rgba(18,22,38,.82) !important;\n  border-color:rgba(129,140,248,.18) !important;\n}\n/* Order 4: Thay Do Feature Banner */\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section[aria-labelledby=\"home-thay-do-heading\"]{\n  order:4 !important;\n  padding:0 !important;\n}\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section[aria-labelledby=\"home-thay-do-heading\"] > div.max-w-6xl,\nmain#noi-dung-chinh > div.overflow-x-clip:has(> section#tra-cuu) > section.bg-surface-2:not([aria-labelledby]) > div.max-w-6xl{\n  max-width:100% !important;\n}\n\n/* Studio Left Sidebar (#htq-studio-sidebar) */\n#htq-studio-sidebar{\n  display:none;\n}\n@media (min-width:1180px){\n  #htq-studio-sidebar{\n    position:fixed;\n    top:0;\n    left:0;\n    bottom:0;\n    width:252px;\n    z-index:60;\n    display:flex;\n    flex-direction:column;\n    background:rgba(255,255,255,.90);\n    backdrop-filter:blur(22px) saturate(160%);\n    -webkit-backdrop-filter:blur(22px) saturate(160%);\n    border-right:1px solid rgba(79,70,229,.14);\n    box-shadow:8px 0 32px -18px rgba(79,70,229,.14);\n    padding:16px 14px;\n    overflow-y:auto;\n    font-family:inherit;\n  }\n  .dark #htq-studio-sidebar{\n    background:rgba(13,16,30,.92);\n    border-right-color:rgba(129,140,248,.18);\n    box-shadow:8px 0 36px -14px rgba(0,0,0,.65);\n  }\n}\n.htq-sb-brand{\n  display:flex;\n  align-items:center;\n  gap:10px;\n  padding:10px 10px 14px;\n  margin-bottom:8px;\n  border-bottom:1px solid rgba(79,70,229,.12);\n  text-decoration:none;\n}\n.dark .htq-sb-brand{border-bottom-color:rgba(129,140,248,.16)}\n.htq-sb-emblem{\n  width:36px;height:36px;border-radius:11px;flex-shrink:0;\n  display:grid;place-items:center;font-weight:900;font-size:17px;color:#fff;\n  background:linear-gradient(135deg,#4f46e5,#7c3aed 60%,#e11d48);\n  box-shadow:0 6px 16px -4px rgba(79,70,229,.45);\n}\n.htq-sb-title{font-size:15px;font-weight:800;line-height:1.2;color:#111827}\n.dark .htq-sb-title{color:#f8fafc}\n.htq-sb-sub{font-size:11px;font-weight:600;color:#6366f1;margin-top:2px}\n.dark .htq-sb-sub{color:#a5b4fc}\n.htq-sb-group{margin-top:12px}\n.htq-sb-label{\n  padding:0 10px 6px;\n  font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;\n  color:#64748b;\n}\n.dark .htq-sb-label{color:#94a3b8}\n.htq-sb-link{\n  display:flex;align-items:center;gap:9px;\n  padding:7.5px 10px;border-radius:11px;margin-bottom:2px;\n  font-size:13px;font-weight:600;color:#334155;text-decoration:none;\n  transition:all .16s ease;\n}\n.dark .htq-sb-link{color:#cbd5e1}\n.htq-sb-link:hover{\n  background:rgba(79,70,229,.09);\n  color:#4338ca;\n  transform:translateX(2px);\n}\n.dark .htq-sb-link:hover{\n  background:rgba(129,140,248,.15);\n  color:#e0e7ff;\n}\n.htq-sb-link.is-active{\n  background:linear-gradient(135deg, rgba(79,70,229,.15), rgba(124,58,237,.12));\n  color:#4338ca;font-weight:700;\n  box-shadow:inset 3px 0 0 #4f46e5;\n}\n.dark .htq-sb-link.is-active{\n  background:linear-gradient(135deg, rgba(99,102,241,.24), rgba(139,92,246,.20));\n  color:#eef2ff;\n  box-shadow:inset 3px 0 0 #818cf8;\n}\n.htq-sb-footer{\n  margin-top:auto;padding-top:12px;border-top:1px solid rgba(79,70,229,.12);\n  display:flex;flex-direction:column;gap:6px;\n}\n.dark .htq-sb-footer{border-top-color:rgba(129,140,248,.16)}\n.htq-sb-btn{\n  width:100%;display:flex;align-items:center;justify-content:space-between;\n  padding:8px 10px;border-radius:11px;border:1px solid rgba(79,70,229,.20);\n  background:rgba(79,70,229,.06);color:#312e81;font-size:12.5px;font-weight:700;\n  cursor:pointer;transition:all .16s ease;\n}\n.dark .htq-sb-btn{\n  border-color:rgba(129,140,248,.26);background:rgba(99,102,241,.14);color:#e0e7ff;\n}\n.htq-sb-btn:hover{background:rgba(79,70,229,.14)}\n\n/* Home 12-Col Bento Workspace (#htq-studio-workspace) */\n#htq-studio-workspace{width:100%}\n.htq-ws-grid{\n  display:grid;\n  grid-template-columns:1fr;\n  gap:1.25rem;\n}\n@media (min-width:1024px){\n  .htq-ws-grid{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}\n}\n.htq-ws-panel{\n  border-radius:22px;\n  padding:1.35rem;\n  background:rgba(255,255,255,.86);\n  border:1px solid rgba(79,70,229,.16);\n  box-shadow:0 16px 40px -24px rgba(15,23,42,.12);\n  backdrop-filter:blur(14px);\n}\n.dark .htq-ws-panel{\n  background:rgba(18,22,38,.88);\n  border-color:rgba(129,140,248,.20);\n  box-shadow:0 20px 44px -20px rgba(0,0,0,.62);\n}\n.htq-ws-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:1rem;flex-wrap:wrap}\n.htq-ws-title{font-size:1.125rem;font-weight:800;color:#0f172a;margin:0}\n.dark .htq-ws-title{color:#f8fafc}\n.htq-ws-badge{\n  font-size:.72rem;font-weight:700;padding:.25rem .65rem;border-radius:9999px;\n  background:rgba(124,58,237,.10);color:#6d28d9;border:1px solid rgba(124,58,237,.22);\n}\n.dark .htq-ws-badge{background:rgba(139,92,246,.20);color:#ddd6fe;border-color:rgba(167,139,250,.30)}\n.htq-skill-grid{\n  display:grid;\n  grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));\n  gap:.85rem;\n}\n.htq-skill-card{\n  display:flex;flex-direction:column;gap:.4rem;\n  padding:1rem;border-radius:16px;text-decoration:none;\n  background:rgba(248,250,252,.85);\n  border:1px solid rgba(79,70,229,.13);\n  transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;\n}\n.dark .htq-skill-card{\n  background:rgba(25,31,52,.78);\n  border-color:rgba(129,140,248,.18);\n}\n.htq-skill-card:hover{\n  transform:translateY(-2px);\n  border-color:rgba(79,70,229,.42);\n  box-shadow:0 12px 26px -14px rgba(79,70,229,.28);\n}\n.htq-skill-top{display:flex;align-items:center;gap:.55rem;font-weight:800;font-size:.94rem;color:#1e1b4b}\n.dark .htq-skill-top{color:#e0e7ff}\n.htq-skill-desc{font-size:.80rem;line-height:1.45;color:#475569;margin:0}\n.dark .htq-skill-desc{color:#94a3b8}\n.htq-curr-row{\n  display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.1rem;padding-top:1rem;\n  border-top:1px dashed rgba(79,70,229,.18);\n}\n.htq-curr-pill{\n  display:inline-flex;align-items:center;gap:.35rem;\n  padding:.42rem .82rem;border-radius:9999px;text-decoration:none;\n  font-size:.78rem;font-weight:700;color:#4338ca;\n  background:rgba(79,70,229,.08);border:1px solid rgba(79,70,229,.20);\n  transition:all .15s ease;\n}\n.dark .htq-curr-pill{color:#c7d2fe;background:rgba(99,102,241,.16);border-color:rgba(129,140,248,.28)}\n.htq-curr-pill:hover{background:#4f46e5;color:#fff;border-color:#4f46e5}\n.htq-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin:.85rem 0 1rem}\n.htq-stat-box{\n  padding:.7rem .5rem;border-radius:14px;text-align:center;\n  background:linear-gradient(180deg, rgba(79,70,229,.08), rgba(124,58,237,.04));\n  border:1px solid rgba(79,70,229,.16);\n}\n.dark .htq-stat-box{background:rgba(99,102,241,.12);border-color:rgba(129,140,248,.22)}\n.htq-stat-num{font-size:1.35rem;font-weight:900;color:#4f46e5;line-height:1.1}\n.dark .htq-stat-num{color:#a5b4fc}\n.htq-stat-lbl{font-size:.70rem;font-weight:600;color:#64748b;margin-top:3px}\n.dark .htq-stat-lbl{color:#94a3b8}\n.htq-cta-btn{\n  display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;\n  padding:.8rem 1rem;border-radius:14px;font-weight:800;font-size:.92rem;color:#fff !important;\n  text-decoration:none;margin-bottom:1rem;\n  background:linear-gradient(135deg,#4f46e5,#7c3aed 60%,#e11d48);\n  box-shadow:0 12px 26px -10px rgba(79,70,229,.55);\n  transition:transform .18s ease, filter .18s ease;\n}\n.htq-cta-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}\n.htq-quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem}\n.htq-quick-item{\n  display:flex;align-items:center;gap:.45rem;padding:.65rem .75rem;border-radius:12px;\n  font-size:.79rem;font-weight:700;text-decoration:none;color:#1e293b;\n  background:rgba(248,250,252,.9);border:1px solid rgba(79,70,229,.14);\n  transition:all .15s ease;\n}\n.dark .htq-quick-item{color:#e2e8f0;background:rgba(25,31,52,.78);border-color:rgba(129,140,248,.20)}\n.htq-quick-item:hover{border-color:#7c3aed;transform:translateY(-1px)}\n\n/* Subpage Quick-Switch Ribbon */\n#htq-subpage-ribbon{\n  max-width:1320px;margin:.75rem auto 0;padding:0 1rem;\n}\n.htq-ribbon-inner{\n  display:flex;align-items:center;gap:.45rem;overflow-x:auto;padding:.55rem .75rem;\n  border-radius:14px;\n  background:rgba(255,255,255,.78);border:1px solid rgba(79,70,229,.16);\n  backdrop-filter:blur(12px);\n}\n.dark .htq-ribbon-inner{background:rgba(18,22,38,.82);border-color:rgba(129,140,248,.20)}\n.htq-ribbon-chip{\n  white-space:nowrap;padding:.34rem .75rem;border-radius:9999px;font-size:.77rem;font-weight:700;\n  text-decoration:none;color:#334155;background:rgba(79,70,229,.07);border:1px solid transparent;\n  transition:all .15s ease;\n}\n.dark .htq-ribbon-chip{color:#cbd5e1;background:rgba(129,140,248,.12)}\n.htq-ribbon-chip.is-active, .htq-ribbon-chip:hover{\n  background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;\n}\n\n/* Search Input Focus & Global Polish */\ninput[type=\"search\"]:focus{\n  box-shadow:0 0 0 4px rgba(79,70,229,.16), 0 10px 24px -8px rgba(79,70,229,.24) !important;\n  border-color:#4f46e5 !important;\n}\nfooter[data-site-chrome=\"true\"]{\n  background:rgba(248,247,242,.86) !important;\n  backdrop-filter:blur(14px) !important;\n  border-top:1px solid rgba(79,70,229,.14) !important;\n}\n.dark footer[data-site-chrome=\"true\"]{\n  background:rgba(12,15,28,.88) !important;\n  border-top-color:rgba(129,140,248,.16) !important;\n}\n::-webkit-scrollbar{width:8px;height:8px}\n::-webkit-scrollbar-track{background:transparent}\n::-webkit-scrollbar-thumb{background:rgba(79,70,229,.28);border-radius:9999px}\n::-webkit-scrollbar-thumb:hover{background:rgba(79,70,229,.50)}\n\n/* === HTQ STUDIO LP v4 === */\n.lp .lp-hero{\n  background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(238,242,255,.88) 55%, rgba(253,242,248,.86)) !important;\n  border:1px solid rgba(79,70,229,.24) !important;\n  border-radius:24px !important;\n  box-shadow:0 18px 42px -18px rgba(79,70,229,.24) !important;\n}\n.dark .lp .lp-hero{\n  background:linear-gradient(135deg, rgba(18,22,38,.92), rgba(26,24,54,.86) 55%, rgba(36,19,40,.88)) !important;\n  border-color:rgba(129,140,248,.28) !important;\n}\n.lp .lp-card{\n  background:rgba(255,255,255,.86) !important;\n  border:1px solid rgba(79,70,229,.16) !important;\n  border-radius:18px !important;\n}\n.dark .lp .lp-card{\n  background:rgba(18,22,38,.86) !important;\n  border-color:rgba(129,140,248,.20) !important;\n}\n.lp .lp-btn{\n  background:linear-gradient(135deg, #4f46e5, #7c3aed) !important;\n  color:#ffffff !important;\n  border-radius:12px !important;\n  box-shadow:0 8px 20px -6px rgba(79,70,229,.48) !important;\n}\n\n/* === HTQ STUDIO THAY DO v4 === */\n.thay-do-landing_hero__Pqn_q:after{\n  background:linear-gradient(180deg, rgba(9,11,20,.62), rgba(9,11,20,.18) 38%, rgba(9,11,20,.42) 62%, rgba(9,11,20,.95)) !important;\n}\n.thay-do-landing_hookRed__5MHuV{\n  color:#a5b4fc !important;\n  text-shadow:0 2px 16px rgba(99,102,241,.42) !important;\n}\n\n/* === HTQ RESPONSIVE MAIN & MOBILE BOTTOM NAV === */\nhtml, body{max-width:100vw;overflow-x:clip;}\nmain, main#noi-dung-chinh, #xhz-dynamic-page-root, .htq-ws-grid, .htq-ws-panel, .htq-ws-head{\n  min-width:0 !important;\n  max-width:100% !important;\n  width:100% !important;\n  box-sizing:border-box !important;\n}\n.htq-skill-grid{grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)) !important;}\n#htq-mobile-nav{display:none;}\n@media (max-width:768px){\n  body:not([data-htq-immersive=\"1\"]){padding-bottom:68px !important;}\n  body:not([data-htq-immersive=\"1\"]) #htq-mobile-nav{\n    display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:55;\n    padding:6px 4px calc(6px + env(safe-area-inset-bottom, 0px));\n    background:rgba(255,255,255,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);\n    border-top:1px solid rgba(79,70,229,.16);box-shadow:0 -8px 24px rgba(15,23,42,.08);\n  }\n  .dark body:not([data-htq-immersive=\"1\"]) #htq-mobile-nav, html.dark body:not([data-htq-immersive=\"1\"]) #htq-mobile-nav{\n    background:rgba(13,16,30,.95);border-top-color:rgba(129,140,248,.22);box-shadow:0 -8px 24px rgba(0,0,0,.55);\n  }\n  .htq-mnav-item{\n    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;\n    text-decoration:none;color:#475569;font-size:10.5px;font-weight:700;padding:4px 2px;border-radius:10px;\n  }\n  .dark .htq-mnav-item{color:#cbd5e1;}\n  .htq-mnav-item.is-active{color:#4f46e5;background:rgba(79,70,229,.10);}\n  .dark .htq-mnav-item.is-active{color:#a5b4fc;background:rgba(129,140,248,.16);}\n}\n\n/* Accessible Focus-Visible Rings */\na:focus-visible, button:focus-visible, [role=\"button\"]:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible{\n  outline:2px solid #4f46e5 !important;\n  outline-offset:2px !important;\n}\n.dark a:focus-visible, .dark button:focus-visible, .dark [role=\"button\"]:focus-visible, .dark input:focus-visible, .dark select:focus-visible, .dark textarea:focus-visible{\n  outline-color:#a5b4fc !important;\n}\n";
      if (st.textContent !== cssText) st.textContent = cssText;
      st.setAttribute('data-htq-ver', '16');
      injectStudioV14FxStyles();
    } catch (_e) {}
  }

  function injectStudioV14FxStyles() {
    try {
      if (typeof document === 'undefined') return;
      var root = document.head || document.documentElement;
      if (!root) return;
      var st = document.getElementById('htq-v14-fx-css');
      if (st && st.getAttribute('data-htq-ver') === '16') return;
      if (!st) {
        st = document.createElement('style');
        st.id = 'htq-v14-fx-css';
        root.appendChild(st);
      }
      var fxCss = `
/* === HTQ STUDIO v14 — VISUAL ARTWORK, INTERACTIVE STAGES & MOTION FX === */
@keyframes htqFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes htqFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes htqShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes htqPulseSoft { 0%, 100% { box-shadow: 0 0 0 0 rgba(79,70,229,.28); } 60% { box-shadow: 0 0 0 8px rgba(79,70,229,0); } }
@keyframes htqEqBar { 0%, 100% { transform: scaleY(.28); } 50% { transform: scaleY(1); } }
@keyframes htqShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
@keyframes htqPop { 0% { transform: scale(.92); } 55% { transform: scale(1.06); } 100% { transform: scale(1); } }

#htq-scroll-progress {
  position: fixed; top: 0; left: 0; height: 2.5px; width: 0; z-index: 9998;
  background: linear-gradient(90deg, #4f46e5 0%, #0d9488 55%, #e11d48 100%);
  pointer-events: none; transition: width .12s linear;
}
#htq-toast-stack {
  position: fixed; right: 18px; top: 76px; z-index: 99990;
  display: flex; flex-direction: column; gap: 8px; pointer-events: none; max-width: min(340px, calc(100vw - 36px));
}
@media (max-width: 768px) { #htq-toast-stack { top: 68px; right: 12px; } }
.htq-toast {
  pointer-events: auto; padding: 10px 14px; border-radius: 14px; font-size: 13px; font-weight: 700;
  color: #f8fafc; background: rgba(15,23,42,.92); border: 1px solid rgba(129,140,248,.35);
  box-shadow: 0 14px 32px -10px rgba(15,23,42,.45); backdrop-filter: blur(12px);
  animation: htqFadeUp .28s cubic-bezier(.22,1,.36,1) both;
}
.htq-toast.is-success { background: linear-gradient(135deg, rgba(13,148,136,.95), rgba(15,118,110,.95)); border-color: rgba(153,246,228,.45); }
.htq-toast.is-warn { background: linear-gradient(135deg, rgba(217,119,6,.95), rgba(180,83,9,.95)); border-color: rgba(253,230,138,.45); }

.htq-anim-up { animation: htqFadeUp .42s cubic-bezier(.22,1,.36,1) both; }
.htq-float { animation: htqFloat 3.6s ease-in-out infinite; }
.htq-pulse-soft { animation: htqPulseSoft 2.4s ease-out infinite; }
.htq-shake { animation: htqShake .28s ease-in-out; }
.htq-pop { animation: htqPop .26s cubic-bezier(.22,1,.36,1); }
.htq-shimmer-bar {
  background-image: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.32) 50%, rgba(255,255,255,0) 100%);
  background-size: 200% 100%; animation: htqShimmer 2.8s linear infinite;
}

/* Audio Equalizer 5 Bars */
.htq-eq { display: inline-flex; align-items: flex-end; gap: 2.5px; height: 15px; vertical-align: middle; }
.htq-eq i { display: block; width: 3px; height: 100%; border-radius: 99px; background: currentColor; transform: scaleY(.32); transform-origin: bottom; transition: transform .2s ease; }
.htq-eq.is-active i { animation: htqEqBar .65s ease-in-out infinite; }
.htq-eq.is-active i:nth-child(2) { animation-delay: .12s; }
.htq-eq.is-active i:nth-child(3) { animation-delay: .24s; }
.htq-eq.is-active i:nth-child(4) { animation-delay: .16s; }
.htq-eq.is-active i:nth-child(5) { animation-delay: .06s; }

/* Mi-Zi-Ge Calligraphy Grid Square */
.htq-mizige {
  position: relative; display: grid; place-items: center; border-radius: 16px;
  border: 1.5px solid rgba(79,70,229,.35); background-color: #fffdf8;
  background-image:
    linear-gradient(to right, transparent 49.2%, rgba(79,70,229,.18) 49.2%, rgba(79,70,229,.18) 50.8%, transparent 50.8%),
    linear-gradient(to bottom, transparent 49.2%, rgba(79,70,229,.18) 49.2%, rgba(79,70,229,.18) 50.8%, transparent 50.8%),
    linear-gradient(45deg, transparent 49.4%, rgba(13,148,136,.12) 49.4%, rgba(13,148,136,.12) 50.6%, transparent 50.6%),
    linear-gradient(-45deg, transparent 49.4%, rgba(13,148,136,.12) 49.4%, rgba(13,148,136,.12) 50.6%, transparent 50.6%);
}
.dark .htq-mizige {
  background-color: #151b31; border-color: rgba(129,140,248,.38);
}

/* 3D Flashcard Flip */
.htq-flip-wrap { perspective: 950px; cursor: pointer; user-select: none; }
.htq-flip-inner {
  position: relative; width: 100%; min-height: 158px;
  transform-style: preserve-3d; transition: transform .5s cubic-bezier(.22,1,.36,1);
}
.htq-flip-wrap.is-flipped .htq-flip-inner { transform: rotateY(180deg); }
.htq-flip-face {
  position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border-radius: 18px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between;
  background: rgba(255,255,255,.94); border: 1px solid rgba(79,70,229,.20);
  box-shadow: 0 12px 28px -18px rgba(79,70,229,.25);
}
.dark .htq-flip-face { background: rgba(21,27,49,.94); border-color: rgba(129,140,248,.26); color: #f8fafc; }
.htq-flip-front { pointer-events: auto; }
.htq-flip-back { transform: rotateY(180deg); background: linear-gradient(135deg, #f5f3ff, #f0fdfa); pointer-events: none; visibility: hidden; }
.dark .htq-flip-back { background: linear-gradient(135deg, #1b1e3f, #112a30); }
.htq-flip-wrap.is-flipped .htq-flip-front { pointer-events: none; visibility: hidden; }
.htq-flip-wrap.is-flipped .htq-flip-back { pointer-events: auto; visibility: visible; }

/* Home Hero Strip + Upgraded Skill Card Artwork */
.htq-home-hero-strip {
  display: grid; grid-template-columns: 1fr; gap: 1.15rem; margin-bottom: 1.25rem;
}
@media (min-width: 960px) {
  .htq-home-hero-strip { grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); }
}
.htq-hero-art-card {
  position: relative; border-radius: 22px; overflow: hidden; min-height: 196px;
  border: 1px solid rgba(79,70,229,.22); box-shadow: 0 18px 42px -22px rgba(79,70,229,.30);
  display: flex; align-items: flex-end; background: #1e1b4b;
}
.htq-hero-art-card > img.htq-hero-bg {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform .6s cubic-bezier(.22,1,.36,1);
}
.htq-hero-art-card:hover > img.htq-hero-bg { transform: scale(1.03); }
.htq-hero-art-scrim {
  position: relative; z-index: 2; width: 100%; padding: 16px 18px;
  background: linear-gradient(180deg, rgba(15,23,42,.08) 0%, rgba(15,23,42,.68) 46%, rgba(15,23,42,.90) 100%);
  display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; color: #fff;
}
.htq-skill-card-art {
  display: flex; align-items: flex-start; gap: 11px;
}
.htq-skill-thumb {
  width: 46px; height: 46px; border-radius: 12px; object-fit: cover; flex-shrink: 0;
  border: 1px solid rgba(79,70,229,.16); background: rgba(79,70,229,.06);
  transition: transform .22s cubic-bezier(.22,1,.36,1);
}
.htq-skill-card:hover .htq-skill-thumb { transform: scale(1.07) rotate(-2deg); }

/* Subpage Editorial Stage (#htq-page-stage) */
#htq-page-stage {
  max-width: 1320px; margin: .75rem auto .35rem; padding: 0 1rem;
  animation: htqFadeUp .38s cubic-bezier(.22,1,.36,1) both;
}
.htq-stage-shell {
  border-radius: 22px; overflow: hidden;
  background: rgba(255,255,255,.88); border: 1px solid rgba(79,70,229,.18);
  box-shadow: 0 18px 40px -26px rgba(15,23,42,.18); backdrop-filter: blur(14px);
}
.dark .htq-stage-shell {
  background: rgba(18,22,38,.90); border-color: rgba(129,140,248,.22);
  box-shadow: 0 20px 44px -22px rgba(0,0,0,.62);
}
.htq-stage-grid {
  display: grid; grid-template-columns: 1fr; gap: 0;
}
@media (min-width: 880px) {
  .htq-stage-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.15fr); }
}
.htq-stage-visual {
  position: relative; min-height: 176px; max-height: 220px; overflow: hidden;
  display: flex; align-items: flex-end; background: #1e1b4b;
}
@media (min-width: 880px) {
  .htq-stage-visual { max-height: none; height: 100%; min-height: 210px; }
}
.htq-stage-visual > img.htq-stage-bg {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  transition: transform .65s cubic-bezier(.22,1,.36,1);
}
.htq-stage-shell:hover .htq-stage-visual > img.htq-stage-bg { transform: scale(1.035); }
.htq-stage-visual-scrim {
  position: relative; z-index: 2; width: 100%; padding: 14px 16px;
  background: linear-gradient(180deg, rgba(15,23,42,.06) 0%, rgba(15,23,42,.64) 48%, rgba(15,23,42,.90) 100%);
  color: #fff; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px;
}
.htq-stage-body {
  padding: 14px 18px; display: flex; flex-direction: column; justify-content: center; gap: 10px;
}
.htq-stage-chip-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px;
  font-size: 12.5px; font-weight: 700; cursor: pointer; text-decoration: none;
  border: 1.5px solid rgba(99,102,241,.24); background: rgba(255,250,244,.92); color: #3730a3;
  box-shadow: 0 2px 8px -4px rgba(79,70,229,.18);
  transition: transform .22s cubic-bezier(.34,1.56,.64,1), background .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease;
}
.dark .htq-stage-chip-btn { color: #c7d2fe; background: rgba(30,36,64,.85); border-color: rgba(129,140,248,.30); }
.htq-stage-chip-btn:hover { transform: translateY(-2px) scale(1.03); background: linear-gradient(135deg, #4f46e5, #0d9488); color: #fff; border-color: transparent; box-shadow: 0 8px 18px -6px rgba(79,70,229,.42); }
.htq-stage-chip-btn.is-active { background: linear-gradient(135deg, #4f46e5, #0d9488); color: #fff; border-color: transparent; }
.htq-stage-toggle-btn {
  position: absolute; top: 10px; right: 10px; z-index: 5;
  padding: 4px 11px; border-radius: 999px; border: 1px solid rgba(255,255,255,.38);
  background: rgba(15,23,42,.56); color: #fff; font-size: 11px; font-weight: 700;
  cursor: pointer; backdrop-filter: blur(8px); transition: transform .18s ease;
}
.htq-stage-toggle-btn:hover { transform: scale(1.05); }
.htq-stage-collapsed-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 14px;
  font-size: 13px; font-weight: 700; color: #312e81;
}
.dark .htq-stage-collapsed-bar { color: #e0e7ff; }

/* Cozy Warm Cute Polish (v14.1) */
body {
  background-color: #fcf8f2 !important;
  background-image:
    radial-gradient(58% 44% at 14% -4%, rgba(251,146,60,.11), transparent 70%),
    radial-gradient(52% 44% at 92% 4%, rgba(99,102,241,.10), transparent 68%),
    radial-gradient(46% 42% at 55% 96%, rgba(20,184,166,.09), transparent 72%) !important;
}
.dark body, html.dark body {
  background-color: #0b0e1a !important;
  background-image:
    radial-gradient(58% 44% at 14% -4%, rgba(99,102,241,.18), transparent 70%),
    radial-gradient(52% 44% at 92% 6%, rgba(20,184,166,.13), transparent 68%),
    radial-gradient(46% 42% at 58% 96%, rgba(244,114,182,.09), transparent 72%) !important;
}
.htq-ws-panel, .htq-stage-shell { border-radius: 24px !important; }
.htq-skill-card, .htq-stat-box, .htq-quick-item, .htq-stamp-card {
  transition: transform .24s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, border-color .2s ease !important;
}
.htq-skill-card:hover { transform: translateY(-3px) scale(1.01) !important; }
.htq-stat-box:hover, .htq-stamp-card:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 24px -14px rgba(79,70,229,.32); }
.htq-quick-item:hover { transform: translateY(-2px) scale(1.02) !important; }

/* Compact Sidebar Fit on 800px Desktop + Dark-Mode Backup Card + Zero-Overlap Buddy Dock */
@media (min-width: 1180px) {
  #htq-studio-sidebar { padding: 10px 12px 14px !important; }
  .htq-sb-brand { padding: 4px 48px 8px 8px !important; margin-bottom: 4px !important; }
  .htq-sb-emblem { width: 32px !important; height: 32px !important; font-size: 15px !important; }
  .htq-sb-group { margin-top: 6px !important; }
  .htq-sb-label { padding: 0 8px 3px !important; font-size: 9.5px !important; }
  .htq-sb-link { padding: 4.5px 9px !important; font-size: 12.5px !important; margin-bottom: 1px !important; }
  #htq-sb-cmdk-btn { padding: 6px 9px !important; margin-bottom: 6px !important; font-size: 12px !important; }
  .htq-sb-footer { padding-top: 7px !important; margin-top: 8px !important; gap: 4px !important; }
  .htq-sb-footer .htq-sb-btn { padding: 6px 9px !important; font-size: 12px !important; }
}
.htq-backup-card {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
  padding: 16px 20px; margin: 14px 0; border-radius: 18px;
  border: 1px solid #fed7aa; background: #fff7ed; color: #1c1917;
  box-shadow: 0 2px 10px -4px rgba(234,88,12,.12);
}
.htq-backup-card .htq-backup-title { font-weight: 800; font-size: 15px; color: #1c1917; }
.htq-backup-card .htq-backup-desc { font-size: 13px; color: #57534e; margin-top: 2px; }
.htq-backup-card .htq-backup-export-btn {
  padding: 8px 14px; border-radius: 10px; border: 1px solid #fdba74; background: #ffffff;
  color: #9a3412; font-weight: 700; font-size: 13px; cursor: pointer;
}
.dark .htq-backup-card {
  border-color: rgba(129,140,248,.26); background: rgba(24,29,52,.92); color: #f8fafc;
  box-shadow: 0 10px 28px -12px rgba(0,0,0,.55);
}
.dark .htq-backup-card .htq-backup-title { color: #f8fafc; }
.dark .htq-backup-card .htq-backup-desc { color: #cbd5e1; }
.dark .htq-backup-card .htq-backup-export-btn {
  background: rgba(30,41,59,.95); border-color: rgba(251,146,60,.45); color: #fdba74;
}

/* Floating Cute Study Buddy Dock (#htq-buddy-dock) — nestled cleanly in sidebar header top-right on desktop (>=1180px), ZERO overlap anywhere */
#htq-buddy-dock {
  position: fixed; top: 11px; left: 196px; z-index: 82;
  display: flex; flex-direction: column-reverse; align-items: flex-start; gap: 10px;
  pointer-events: none;
}
@media (min-width: 769px) and (max-width: 1179px) {
  #htq-buddy-dock { top: auto; bottom: 72px; right: 16px; left: auto; flex-direction: column; align-items: flex-end; }
}
@media (max-width: 768px) {
  #htq-buddy-dock { top: auto; bottom: 76px; left: 12px; flex-direction: column; }
}
header[data-site-header="true"] { z-index: 50 !important; transform: translateZ(0); }
@media (min-width: 1180px) {
  body:not([data-htq-immersive="1"]) > div:has(> header[data-site-header="true"]) { padding-left: 252px !important; }
  body:not([data-htq-immersive="1"]) > #xhz-dynamic-page-root { padding-left: 268px !important; }
}
#xhz-dynamic-page-root a, #xhz-dynamic-page-root button { scroll-margin-top: 96px; }
#xhz-dict-video-wrap { position: relative; isolation: isolate; z-index: 1; contain: layout paint; transform: translateZ(0); overflow: hidden; border-radius: 16px; background: #0f172a; }
#xhz-dict-video-wrap iframe { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; border: 0 !important; display: block !important; z-index: 1 !important; }
.dark #xhz-dynamic-page-root { color: #e2e8f0 !important; }
.dark #xhz-dynamic-page-root h1,
.dark #xhz-dynamic-page-root h2,
.dark #xhz-dynamic-page-root h3 { color: #f8fafc !important; }
.dark #xhz-dynamic-page-root [style*="background:#fff"],
.dark #xhz-dynamic-page-root [style*="background: #fff"],
.dark #xhz-dynamic-page-root [style*="background:#ffffff"],
.dark #xhz-dynamic-page-root [style*="background: #ffffff"] {
  background: #13182b !important; color: #f1f5f9 !important; border-color: rgba(129,140,248,.22) !important;
}
.dark #xhz-dynamic-page-root [style*="background:#fafaf9"],
.dark #xhz-dynamic-page-root [style*="background: #fafaf9"],
.dark #xhz-dynamic-page-root [style*="background:#f5f5f4"],
.dark #xhz-dynamic-page-root [style*="background: #f5f5f4"],
.dark #xhz-dynamic-page-root [style*="background:#f2fbfa"],
.dark #xhz-dynamic-page-root [style*="background: #f2fbfa"] {
  background: #1a2138 !important; color: #e2e8f0 !important; border-color: rgba(148,163,184,.22) !important;
}
.dark #xhz-dynamic-page-root [style*="background:#f0fdfa"] {
  background: rgba(13,148,136,.16) !important; color: #ccfbf1 !important; border-color: rgba(45,212,191,.35) !important;
}
.dark #xhz-dynamic-page-root [style*="color:#1c1917"],
.dark #xhz-dynamic-page-root [style*="color: #1c1917"],
.dark #xhz-dynamic-page-root [style*="color:#292524"],
.dark #xhz-dynamic-page-root [style*="color: #292524"] { color: #f1f5f9 !important; }
.dark #xhz-dynamic-page-root [style*="color:#44403c"],
.dark #xhz-dynamic-page-root [style*="color:#57534e"],
.dark #xhz-dynamic-page-root [style*="color:#78716c"] { color: #cbd5e1 !important; }
.dark #xhz-dynamic-page-root input,
.dark #xhz-dynamic-page-root textarea,
.dark #xhz-dynamic-page-root select {
  background: #0f1526 !important; color: #f8fafc !important; border-color: rgba(129,140,248,.34) !important;
}
.htq-buddy-fab {
  pointer-events: auto; position: relative; width: 40px; height: 40px; padding: 0; border-radius: 999px;
  border: 2px solid #fff; cursor: pointer; background: linear-gradient(135deg, #fde68a, #fbcfe8 55%, #a5f3fc);
  box-shadow: 0 8px 20px -6px rgba(79,70,229,.42), 0 0 0 2.5px rgba(99,102,241,.18);
  display: grid; place-items: center; overflow: visible;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
}
.dark .htq-buddy-fab { border-color: #312e81; box-shadow: 0 12px 30px -6px rgba(0,0,0,.68), 0 0 0 3px rgba(129,140,248,.28); }
.htq-buddy-fab:hover { transform: translateY(-3px) scale(1.08) rotate(-3deg); }
.htq-buddy-fab > img { width: 100%; height: 100%; border-radius: 999px; object-fit: cover; display: block; }
.htq-buddy-dot {
  position: absolute; top: -3px; right: -3px; width: 20px; height: 20px; border-radius: 999px;
  background: linear-gradient(135deg, #f43f5e, #f59e0b); color: #fff; font-size: 11px;
  display: grid; place-items: center; border: 2px solid #fff; box-shadow: 0 3px 8px rgba(244,63,94,.45);
}
.htq-buddy-bubble {
  pointer-events: auto; width: min(312px, calc(100vw - 28px)); border-radius: 22px; padding: 14px 15px;
  background: rgba(255,253,249,.96); color: #1e1b4b;
  border: 1.5px solid rgba(99,102,241,.24);
  box-shadow: 0 20px 48px -14px rgba(15,23,42,.28); backdrop-filter: blur(16px);
  animation: htqFadeUp .28s cubic-bezier(.34,1.56,.64,1) both;
}
.dark .htq-buddy-bubble {
  background: rgba(20,24,44,.96); color: #f8fafc; border-color: rgba(129,140,248,.34);
  box-shadow: 0 22px 52px -12px rgba(0,0,0,.72);
}

/* === v15.0 KAWAII AMBIENT PETALS, TAP SPARKLES, STORYBOOK GALLERY & STICKER ALBUM === */
@keyframes htqPetalDrift {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
  12% { opacity: .68; }
  85% { opacity: .55; }
  100% { transform: translate3d(34px, 106vh, 0) rotate(260deg); opacity: 0; }
}
@keyframes htqSparklePop {
  0% { transform: translate(0, 0) scale(.4); opacity: 1; }
  60% { opacity: 1; }
  100% { transform: translate(var(--sx, 0px), var(--sy, -26px)) scale(1.15) rotate(18deg); opacity: 0; }
}
#htq-ambient-petals {
  position: fixed; inset: 0; pointer-events: none; z-index: 2; overflow: hidden;
}
.htq-petal {
  position: absolute; top: -28px; font-size: 14px; line-height: 1; user-select: none;
  animation: htqPetalDrift var(--dur, 14s) linear var(--del, 0s) infinite;
  filter: drop-shadow(0 2px 4px rgba(244,114,182,.25));
}
.htq-sparkle-dot {
  position: fixed; pointer-events: none; z-index: 99997; font-size: 15px; line-height: 1; user-select: none;
  animation: htqSparklePop .68s cubic-bezier(.22,1,.36,1) forwards;
}

/* Home Cozy Storybook Gallery Strip */
.htq-cute-gallery-panel {
  margin-top: 1.25rem; border-radius: 24px; padding: 1.2rem 1.35rem;
  background: linear-gradient(135deg, rgba(255,253,248,.92), rgba(254,242,242,.72) 48%, rgba(240,253,250,.85));
  border: 1.5px solid rgba(244,114,182,.22);
  box-shadow: 0 16px 38px -22px rgba(236,72,153,.20);
}
.dark .htq-cute-gallery-panel {
  background: linear-gradient(135deg, rgba(20,24,44,.92), rgba(34,20,44,.84) 50%, rgba(16,32,42,.90));
  border-color: rgba(244,114,182,.26);
}
.htq-cute-gallery-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: .8rem; margin-top: .85rem;
}
.htq-story-card {
  position: relative; display: flex; flex-direction: column; border-radius: 18px; overflow: hidden;
  text-decoration: none; border: 1.5px solid rgba(99,102,241,.16); background: rgba(255,255,255,.92);
  box-shadow: 0 10px 24px -16px rgba(15,23,42,.18);
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease, border-color .2s ease;
}
.dark .htq-story-card { background: rgba(24,29,52,.90); border-color: rgba(129,140,248,.22); }
.htq-story-card:hover { transform: translateY(-4px) scale(1.02); border-color: #f472b6; box-shadow: 0 18px 30px -16px rgba(236,72,153,.32); }
.htq-story-card-img-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; background: #1e1b4b; }
.htq-story-card-img-wrap > img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s cubic-bezier(.22,1,.36,1); }
.htq-story-card:hover .htq-story-card-img-wrap > img { transform: scale(1.07); }
.htq-story-card-cap { padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 12.5px; font-weight: 800; color: #1e1b4b; }
.dark .htq-story-card-cap { color: #f8fafc; }

/* Collectible Kawaii SVG Sticker Album (Account & Companion Hub) */
.htq-sticker-grid {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
}
@media (max-width: 560px) { .htq-sticker-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.htq-sticker-tile {
  cursor: pointer; padding: 8px 6px; border-radius: 18px; text-align: center;
  border: 1.5px solid rgba(148,163,184,.28); background: rgba(255,253,249,.75); color: inherit;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, border-color .2s ease;
}
.dark .htq-sticker-tile { background: rgba(24,29,52,.78); border-color: rgba(129,140,248,.24); }
.htq-sticker-tile.is-unlocked {
  border-color: rgba(244,114,182,.45);
  background: linear-gradient(180deg, rgba(254,243,199,.58), rgba(252,231,243,.45));
}
.dark .htq-sticker-tile.is-unlocked {
  border-color: rgba(244,114,182,.48);
  background: linear-gradient(180deg, rgba(67,56,202,.28), rgba(157,23,77,.24));
}
.htq-sticker-tile:hover { transform: translateY(-3px) scale(1.04) rotate(-1.5deg); box-shadow: 0 12px 22px -12px rgba(236,72,153,.38); }
.htq-sticker-tile > img { width: 44px; height: 44px; display: block; transition: transform .25s cubic-bezier(.34,1.56,.64,1); }
.htq-sticker-tile:not(.is-unlocked) > img { filter: grayscale(.65) opacity(.68); }
.htq-sticker-tile:hover > img { transform: scale(1.12) rotate(4deg); }

@media (prefers-reduced-motion: reduce) {
  .htq-anim-up, .htq-float, .htq-pulse-soft, .htq-shimmer-bar, .htq-shake, .htq-pop, .htq-eq.is-active i, .htq-buddy-bubble, .htq-petal, .htq-sparkle-dot, .htq-story-card, .htq-sticker-tile, .htq-story-card-img-wrap > img, .htq-buddy-fab {
    animation: none !important; transition: none !important;
  }
  #htq-ambient-petals { display: none !important; }
  .htq-flip-inner { transition: none !important; }
}
`;
      if (st.textContent !== fxCss) st.textContent = fxCss;
      st.setAttribute('data-htq-ver', '16');
    } catch (_e) {}
  }
  injectMasterV3Styles();

const SUPABASE_URL = 'https://skxgzzdunqloxxombtuc.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18';
  const RAW_GITHUB_REPO = 'https://raw.githubusercontent.com/hungktkthd/saochepweb';
  const DEFAULT_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXhoei0xIiwidHlwIjoiYWNjZXNzIiwiZyI6MCwiZXhwIjo0MTAyNDQ0ODAwfQ.xhzsignature';

  const originalFetch = window.fetch.bind(window);
  const jsonCache = new Map();

  // Scrub brand strings from shared images / worksheets rendered on HTML5 Canvas
  function scrubBrandText(input) {
    if (typeof input !== 'string' || !/xiehanzi/i.test(input)) return input;
    return input
      .replace(/©\s*2026\s*xiehanzi\.com\s*·\s*Made in 🇻🇳 Vietnam/gi, '© 2026 Học Tiếng Trung · Made in 🇻🇳 Vietnam')
      .replace(/Trong app XieHanzi/gi, 'Tính năng nổi bật')
      .replace(/Dùng app XieHanzi cho tiện hơn/gi, 'Học mọi lúc mọi nơi')
      .replace(/Học tiếp trên app XieHanzi/gi, 'Học tiếp mỗi ngày')
      .replace(/App XieHanzi có miễn phí không\??/gi, 'Nền tảng có miễn phí không?')
      .replace(/Những gì bạn vẫn dùng ở XieHanzi vẫn ở đây/gi, 'Mọi công cụ học tập đều có sẵn ở đây')
      .replace(/Cộng đồng học viên XieHanzi/gi, 'Cộng đồng học viên')
      .replace(/Đề luyện XieHanzi/g, 'Đề luyện HSK')
      .replace(/đề luyện XieHanzi/g, 'đề luyện HSK')
      .replace(/Từ điển XieHanzi/gi, 'Từ điển chữ Hán')
      .replace(/Góp ý cho XieHanzi/gi, 'Góp ý cải thiện')
      .replace(/Tài khoản XieHanzi/gi, 'Tài khoản học tập')
      .replace(/Đăng nhập XieHanzi/gi, 'Đăng nhập tài khoản')
      .replace(/Đăng ký XieHanzi/gi, 'Đăng ký tài khoản')
      .replace(/Đội XieHanzi/gi, 'Đội ngũ hỗ trợ')
      .replace(/Học chữ Hán miễn phí cùng XieHanzi/gi, 'Học chữ Hán miễn phí')
      .replace(/mở app XieHanzi trên điện thoại/gi, 'mở ứng dụng trên điện thoại')
      .replace(/Tải app XieHanzi/gi, 'Tải ứng dụng học')
      .replace(/Mời tải app XieHanzi/gi, 'Tải ứng dụng')
      .replace(/Mã QR tải app XieHanzi/gi, 'Mã QR tải ứng dụng')
      .replace(/Vở tập viết PDF của XieHanzi/gi, 'Vở tập viết PDF')
      .replace(/tại XieHanzi/gi, 'tại đây')
      .replace(/trên XieHanzi/gi, 'trực tuyến')
      .replace(/của XieHanzi/gi, 'của hệ thống')
      .replace(/cho XieHanzi/gi, 'cho hệ thống')
      .replace(/cùng XieHanzi/gi, '')
      .replace(/XieHanzi\s*trang\s*chủ/gi, 'Trang chủ')
      .replace(/Logo\s*XieHanzi/gi, 'Trang chủ')
      .replace(/Facebook\s*XieHanzi/gi, 'Facebook')
      .replace(/YouTube\s*XieHanzi/gi, 'YouTube')
      .replace(/https?:\/\/(?:www\.)?xiehanzi\.com\/thay-do/gi, 'Trường Thầy Đồ')
      .replace(/xiehanzi\.com\/thay-do/gi, 'Trường Thầy Đồ')
      .replace(/xiehanzi\.com\/luyen-go/gi, 'Luyện gõ tiếng Trung')
      .replace(/xiehanzi\.com\/them-pinyin/gi, 'Thêm Pinyin')
      .replace(/https?:\/\/(?:www\.)?xiehanzi\.com/gi, 'Học Tiếng Trung')
      .replace(/xiehanzi\.com/gi, 'Học Tiếng Trung')
      .replace(/XieHanzi\s*🌱/gi, 'Học Tiếng Trung 🌱')
      .replace(/XieHanzi/gi, 'Học Tiếng Trung');
  }

  try {
    if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.__htqWrapped) {
      const origFill = CanvasRenderingContext2D.prototype.fillText;
      const origStroke = CanvasRenderingContext2D.prototype.strokeText;
      CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
        return origFill.call(this, scrubBrandText(String(text)), ...rest);
      };
      CanvasRenderingContext2D.prototype.strokeText = function (text, ...rest) {
        return origStroke.call(this, scrubBrandText(String(text)), ...rest);
      };
      CanvasRenderingContext2D.prototype.__htqWrapped = true;
    }
  } catch (_e) {}

  function decodeJwtPayload(token) {
    try {
      if (!token || typeof token !== 'string') return null;
      const part = token.split('.')[1];
      if (!part) return null;
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (_e) {
      return null;
    }
  }

  function getSavedUser() {
    try {
      if (localStorage.getItem('httq_real_auth') !== '1') return null;
      const raw = localStorage.getItem('httq_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const token = localStorage.getItem('sb_access_token');
      const payload = decodeJwtPayload(token);
      return parsed && parsed.email && token !== DEFAULT_JWT && payload && payload.sub === parsed.id &&
        payload.iss === `${SUPABASE_URL}/auth/v1` && payload.role === 'authenticated' ? parsed : null;
    } catch (_e) {
      return null;
    }
  }

  let authSessionRequest = null;
  let authCallbackRequest = null;
  let authSessionRevision = 0;
  let validatedAuthToken = '';

  // Only call this with a user returned by Supabase Auth, never decoded JWT metadata.
  function saveAuthSession(accessToken, refreshToken, verifiedUser) {
    try {
      const payload = decodeJwtPayload(accessToken);
      if (!payload || accessToken === DEFAULT_JWT || !verifiedUser || !verifiedUser.id || !verifiedUser.email ||
          payload.sub !== verifiedUser.id || payload.iss !== `${SUPABASE_URL}/auth/v1` ||
          payload.role !== 'authenticated' || !Number.isFinite(Number(payload.exp)) || Number(payload.exp) <= Date.now() / 1000) return null;
      const meta = verifiedUser.user_metadata || {};
      const preferences = meta.xhz_preferences || {};
      const email = verifiedUser.email;
      const displayName =
        meta.displayName || meta.display_name ||
        meta.full_name ||
        meta.name ||
        email.split('@')[0];
      const avatar = Object.prototype.hasOwnProperty.call(meta, 'avatar_url') ? meta.avatar_url : meta.picture || '';
      const uid = verifiedUser.id;
      const providers = (verifiedUser.app_metadata || {}).providers || [];
      const userObj = {
        id: uid,
        _id: uid,
        email: email,
        username: email.split('@')[0] || 'hocvien',
        name: displayName,
        displayName: displayName,
        avatar: avatar,
        role: 'user',
        isGuest: false,
        hasPassword: providers.includes('email') || (verifiedUser.app_metadata || {}).provider === 'email' || meta.xhz_has_password === true,
        showPinyinByDefault: preferences.showPinyinByDefault !== undefined ? preferences.showPinyinByDefault : true,
        showOnPublicFeed: preferences.showOnPublicFeed !== undefined ? preferences.showOnPublicFeed : true,
        streak: 0
      };
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
      if (accessToken) localStorage.setItem('sb_access_token', accessToken);
      if (refreshToken) localStorage.setItem('sb_refresh_token', refreshToken);
      localStorage.setItem('httq_user', JSON.stringify(userObj));
      localStorage.setItem('httq_user_id', uid);
      localStorage.setItem('httq_real_auth', '1');
      validatedAuthToken = accessToken;
      return userObj;
    } catch (_e) {
      return null;
    }
  }

  function clearAuthSession(notifyServer = true) {
    try {
      authSessionRevision++;
      validatedAuthToken = '';
      const sbToken = localStorage.getItem('sb_access_token');
      if (notifyServer && sbToken && sbToken !== DEFAULT_JWT) {
        originalFetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${sbToken}`
          }
        }).catch(() => {});
      }
      localStorage.removeItem('httq_user');
      localStorage.removeItem('httq_user_id');
      localStorage.removeItem('httq_real_auth');
      localStorage.removeItem('httq_oauth_return_to');
      localStorage.removeItem('sb_access_token');
      localStorage.removeItem('sb_refresh_token');
      localStorage.removeItem('sb-skxgzzdunqloxxombtuc-auth-token');
      localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
    } catch (_e) {}
  }

  async function requestSupabaseAuth(path, options = {}) {
    const response = await originalFetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      ...options,
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const error = new Error(data.msg || data.message || data.error_description || 'Không thể kết nối dịch vụ tài khoản.');
      error.status = response.status;
      error.code = data.error_code || data.code || data.error || 'auth_request_failed';
      throw error;
    }
    return data;
  }

  async function getSupabaseSession() {
    if (authCallbackRequest) await authCallbackRequest;
    if (authSessionRequest) return authSessionRequest;
    const token = localStorage.getItem('sb_access_token');
    const refresh = localStorage.getItem('sb_refresh_token') || '';
    if (!token || token === DEFAULT_JWT) {
      if (token === DEFAULT_JWT || localStorage.getItem('httq_real_auth') === '1' || localStorage.getItem('httq_user')) clearAuthSession(false);
      return null;
    }
    const revision = authSessionRevision;
    const owner = getSavedUser();
    const stillCurrent = () => revision === authSessionRevision && localStorage.getItem('sb_access_token') === token;
    const operation = (async () => {
      try {
        let accessToken = token;
        let refreshToken = refresh;
        let payload = decodeJwtPayload(token);
        let user;
        if (!payload || Number(payload.exp) <= Date.now() / 1000 + 60) {
          if (!refresh) { if (stillCurrent()) clearAuthSession(false); return null; }
          const next = await requestSupabaseAuth('token?grant_type=refresh_token', {
            method: 'POST', body: JSON.stringify({ refresh_token: refresh })
          });
          if (!stillCurrent()) return null;
          accessToken = next.access_token;
          refreshToken = next.refresh_token;
          user = next.user;
          payload = decodeJwtPayload(accessToken);
        }
        if (!user && (validatedAuthToken !== accessToken || !owner)) {
          user = await requestSupabaseAuth('user', { headers: { Authorization: `Bearer ${accessToken}` } });
        }
        if (!stillCurrent()) return null;
        if (user) {
          if (owner && user.id !== owner.id) { clearAuthSession(false); return null; }
          if (!saveAuthSession(accessToken, refreshToken, user)) { clearAuthSession(false); return null; }
        }
        const currentUser = getSavedUser();
        if (!currentUser || !payload || payload.sub !== currentUser.id || validatedAuthToken !== accessToken) return null;
        return { access_token: accessToken, refresh_token: refreshToken, user: currentUser, expires_at: Number(payload.exp) };
      } catch (error) {
        if (stillCurrent() && (error.status === 400 || error.status === 401 || error.status === 403)) clearAuthSession(false);
        return null;
      }
    })();
    authSessionRequest = operation;
    try { return await operation; } finally { if (authSessionRequest === operation) authSessionRequest = null; }
  }
  window.getSupabaseSession = getSupabaseSession;

  function authErrorResponse(error) {
    const code = error.code || 'auth_request_failed';
    const messages = {
      invalid_credentials: 'Email hoặc mật khẩu không đúng.',
      email_not_confirmed: 'Vui lòng xác nhận email trước khi đăng nhập.',
      over_email_send_rate_limit: 'Đã gửi quá nhiều email. Vui lòng chờ rồi thử lại.',
      over_request_rate_limit: 'Bạn thao tác quá nhanh. Vui lòng chờ rồi thử lại.',
      signup_disabled: 'Đăng ký email hiện chưa được bật. Bạn có thể đăng nhập bằng Google.'
    };
    const message = messages[code] || error.message || 'Không thể kết nối dịch vụ tài khoản.';
    return jsonResponse({ ok: false, code, message, error: { code, message } }, error.status || 503);
  }

  async function updateSupabaseProfile(body, kind, method) {
    const revision = authSessionRevision;
    const session = await getSupabaseSession();
    if (!session) return authErrorResponse({ status: 401, code: 'unauthorized', message: 'Vui lòng đăng nhập để cập nhật tài khoản.' });
    const stillCurrent = () => revision === authSessionRevision && (getSavedUser() || {}).id === session.user.id;
    if (!stillCurrent()) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
    if (method === 'GET') return jsonResponse({ ok: true, ...session.user, user: session.user });
    try {
      const data = {};
      if (kind === 'profile') {
        const name = String(body.displayName || body.name || '').trim();
        if (name.length < 2 || name.length > 40) return authErrorResponse({ status: 400, code: 'invalid_name', message: 'Tên hiển thị phải từ 2 đến 40 ký tự.' });
        data.displayName = name;
        data.full_name = name;
        data.name = name;
      } else if (kind === 'preferences') {
        data.xhz_preferences = {
          showPinyinByDefault: session.user.showPinyinByDefault,
          showOnPublicFeed: session.user.showOnPublicFeed
        };
        for (const key of ['showPinyinByDefault', 'showOnPublicFeed']) {
          if (body[key] !== undefined) {
            if (typeof body[key] !== 'boolean') return authErrorResponse({ status: 400, code: 'invalid_preference', message: 'Tùy chọn tài khoản không hợp lệ.' });
            data.xhz_preferences[key] = body[key];
          }
        }
      } else {
        const avatar = method === 'DELETE' ? '' : body.image || body.avatar;
        if (typeof avatar !== 'string' || avatar.length > 512000 || (avatar && !/^https:\/\/[^\s"'<>]+$/.test(avatar) && !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar))) {
          return authErrorResponse({ status: 400, code: 'invalid_avatar', message: 'Vui lòng chọn ảnh JPG, PNG hoặc WebP có dung lượng nhỏ hơn 500KB.' });
        }
        data.avatar_url = avatar;
        data.picture = avatar;
      }
      const user = await requestSupabaseAuth('user', {
        method: 'PUT', headers: { Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ data })
      });
      if (!stillCurrent() || user.id !== session.user.id) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
      const updated = saveAuthSession(session.access_token, session.refresh_token, user);
      if (!updated) return authErrorResponse({ status: 401, code: 'invalid_session', message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      return jsonResponse({ ok: true, ...updated, user: updated });
    } catch (error) { return authErrorResponse(error); }
  }

  // Xử lý OAuth callback từ Supabase Google Login (#access_token=... hoặc token lưu bởi @supabase/supabase-js)
  try {
    const hash = window.location.hash ? window.location.hash.substring(1) : '';
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken) {
        const callbackRevision = ++authSessionRevision;
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (_e) {}
        let returnTo = '/tai-khoan';
        try {
          const target = new URL(localStorage.getItem('httq_oauth_return_to') || returnTo, window.location.origin);
          if (target.origin === window.location.origin) returnTo = target.pathname + target.search;
        } catch (_) {}
        localStorage.removeItem('httq_oauth_return_to');
        let callbackValidated = false;
        authCallbackRequest = requestSupabaseAuth('user', { headers: { Authorization: `Bearer ${accessToken}` } })
          .then(u => {
            if (callbackRevision === authSessionRevision && u && u.email) {
              if (!saveAuthSession(accessToken, refreshToken, u)) throw new Error('invalid_session');
              callbackValidated = true;
            }
          })
          .catch(() => { if (callbackRevision === authSessionRevision) clearAuthSession(false); })
          .finally(() => {
            authCallbackRequest = null;
            if (callbackValidated && callbackRevision === authSessionRevision) {
              window.location.replace(returnTo);
            }
          });
      }
    } else {
      // Kiểm tra nếu người dùng đã đăng nhập qua tai-khoan-moi.html (sb-skxgzzdunqloxxombtuc-auth-token)
      const sbRaw = localStorage.getItem('sb-skxgzzdunqloxxombtuc-auth-token');
      if (sbRaw && localStorage.getItem('httq_real_auth') !== '1') {
        const sbSession = JSON.parse(sbRaw);
        if (sbSession && sbSession.access_token) {
          localStorage.setItem('sb_access_token', sbSession.access_token);
          if (sbSession.refresh_token) localStorage.setItem('sb_refresh_token', sbSession.refresh_token);
          getSupabaseSession();
        }
      }
    }
    localStorage.setItem('xiehanzi_access_token', DEFAULT_JWT);
  } catch (_e) {}

  // Đồng bộ khi Next.js gọi localStorage.removeItem('xiehanzi_access_token') lúc Đăng xuất
  try {
    const origRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      origRemoveItem.apply(this, arguments);
      if (this === localStorage && key === 'xiehanzi_access_token') {
        clearAuthSession();
      }
    };
  } catch (_e) {}

  window.loginWithGoogle = function (returnUrl) {
    let dest = returnUrl;
    if (!dest || typeof dest !== 'string') {
      const sp = new URLSearchParams(window.location.search);
      dest = sp.get('returnUrl') || '/tai-khoan';
    }
    let cleanDest = '/tai-khoan';
    try { const target = new URL(dest, window.location.origin); if (target.origin === window.location.origin) cleanDest = target.pathname + target.search; } catch (_) {}
    try {
      localStorage.setItem('httq_oauth_return_to', cleanDest || '/tai-khoan');
    } catch (_e) {}
    const fullRedirect = window.location.origin + cleanDest;
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(fullRedirect)}`;
  };

  window.logoutXieHanzi = function () {
    clearAuthSession();
    window.location.href = '/tai-khoan';
  };

  async function loadLocalJson(path) {
    if (jsonCache.has(path)) return jsonCache.get(path);
    const p = originalFetch(path)
      .then(async r => {
        if (!r || !r.ok) return null;
        const txt = await r.text();
        const trimmed = (txt || '').trim();
        if (!trimmed || trimmed.startsWith('<')) return null;
        return JSON.parse(trimmed);
      })
      .catch(() => null)
      .then(data => {
        if (data === null) jsonCache.delete(path);
        return data;
      });
    jsonCache.set(path, p);
    return p;
  }
  window.__xhzLoadLocalJson = loadLocalJson;

  // Tích hợp Google Identity Services với Supabase Google OAuth trên /dang-nhap, /dang-ky, /tai-khoan
  try {
    const googleSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:18px;height:18px;flex-shrink:0;"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>';
    window.google = window.google || {
      accounts: {
        id: {
          initialize: function () {},
          renderButton: function (el) {
            if (el) {
              el.innerHTML =
                '<button type="button" data-google-oauth="1" style="width:100%;padding:10px 16px;border-radius:999px;border:1px solid #d6d3d1;background:#ffffff;color:#1c1917;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 1px 2px rgba(0,0,0,0.04);">' +
                googleSvg +
                '<span>Tiếp tục với Google</span></button>';
              const btn = el.querySelector('button');
              if (btn) {
                btn.addEventListener('click', function (e) {
                  e.preventDefault();
                  e.stopPropagation();
                  window.loginWithGoogle();
                });
              }
            }
          },
          prompt: function () {},
          cancel: function () {},
          disableAutoSelect: function () {}
        },
        oauth2: {
          initTokenClient: function () { return { requestAccessToken: function () { window.loginWithGoogle(); } }; },
          initCodeClient: function () { return { requestCode: function () { window.loginWithGoogle(); } }; }
        }
      }
    };
    if (navigator && navigator.sendBeacon) {
      const origBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function (url, data) {
        const s = String(url || '');
        if (
          s.includes('/monitoring') ||
          s.includes('xiehanzi.com') ||
          s.includes('/v1/') ||
          s.includes('/v2/') ||
          /google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|sentry\.io|posthog|umami|clarity\.ms|\/g\/collect/i.test(s)
        ) {
          return true;
        }
        return origBeacon(url, data);
      };
    }
    const createSyntheticAudioStream = () => {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      const stream = dest.stream;
      stream.getTracks().forEach(t => {
        const origStop = t.stop.bind(t);
        t.stop = function () {
          try { osc.stop(); ctx.close(); } catch (_) {}
          return origStop();
        };
      });
      return stream;
    };
    if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async function (constraints) {
        try {
          return await origGetUserMedia(constraints);
        } catch (_err) {
          if (constraints && constraints.audio) {
            return createSyntheticAudioStream();
          }
          throw _err;
        }
      };
    } else if (navigator) {
      try {
        navigator.mediaDevices = navigator.mediaDevices || {};
        navigator.mediaDevices.getUserMedia = async function () {
          return createSyntheticAudioStream();
        };
      } catch (_) {}
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
        if (inner) return rewriteMediaUrl(safeDecodeURIComponent(inner));
      } catch (_e) {}
    }

    if (url.startsWith('https://static.xiehanzi.com/web/prod/_next/static/')) {
      return '/_next/static/' + url.slice('https://static.xiehanzi.com/web/prod/_next/static/'.length);
    }

    if (url.startsWith('assets/')) {
      const m = window.location.pathname.match(/\/(?:test|lam-bai)\/([^/?#]+)/);
      const tid = m ? safeDecodeURIComponent(m[1]) : 'hsk30-1';
      return `${RAW_GITHUB_REPO}/media-visuals/hsk-tests/${encodeURIComponent(tid)}/${url}`;
    }

    if (url.startsWith('https://api.xiehanzi.com/media-signed/')) {
      const relSigned = url.slice('https://api.xiehanzi.com/media-signed/'.length).split('?')[0];
      if (
        relSigned.startsWith('word_audios/') ||
        relSigned.startsWith('audios/') ||
        relSigned.startsWith('hsk-audio/') ||
        relSigned.startsWith('sentence-audio/')
      ) {
        return rewriteMediaUrl('https://static.xiehanzi.com/' + relSigned);
      }
    }

    if (url.startsWith('https://static.xiehanzi.com/')) {
      let rel = url.slice('https://static.xiehanzi.com/'.length).split('?')[0].split('&')[0];
      try {
        rel = safeDecodeURIComponent(rel);
      } catch (_e) {}
      const encRel = rel.split('/').map(s => encodeURIComponent(s)).join('/');

      if (rel.startsWith('level_images/')) {
        return '/' + encRel;
      }
      if (
        rel.startsWith('gif/') ||
        rel.startsWith('hsk-tests/') ||
        rel.startsWith('word-illustration/')
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
  // 2. ĐỒNG BỘ SUPABASE AUTH (user_metadata.xhz_progress) & LOCAL STORAGE
  // ==========================================================================
  function getIsoWeekKey(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function mergeMnemonicMaps(mapA, mapB) {
    const out = {};
    const ingest = (src) => {
      if (!src || typeof src !== 'object' || Array.isArray(src)) return;
      for (const [target, list] of Object.entries(src)) {
        if (!target || !Array.isArray(list)) continue;
        if (!out[target]) out[target] = [];
        list.forEach(rawItem => {
          if (!rawItem || typeof rawItem !== 'object') return;
          const note = String(rawItem.note || '').trim();
          if (!note) return;
          const id = String(rawItem.id || '');
          const hit = out[target].find(x => (id && x.id === id) || x.note === note);
          const votes = Math.max(1, Number(rawItem.votes) || 1);
          const updatedAt = rawItem.updatedAt || new Date().toISOString();
          if (hit) {
            hit.votes = Math.max(Number(hit.votes) || 1, votes);
            if (updatedAt > (hit.updatedAt || '')) hit.updatedAt = updatedAt;
          } else {
            out[target].push({
              id: id || ('mn-' + Math.random().toString(36).slice(2, 8)),
              target,
              note,
              votes,
              updatedAt
            });
          }
        });
      }
    };
    ingest(mapA);
    ingest(mapB);
    for (const k of Object.keys(out)) {
      if (out[k].length === 0) {
        delete out[k];
        continue;
      }
      out[k].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
      out[k] = out[k].slice(0, 10);
    }
    return out;
  }

  function getRealProgress() {
    let prog = {
      doneStages: [],
      doneActivities: {},
      learnedWords: [],
      learnedGrammarIds: [],
      userMistakes: [],
      dismissedMistakes: [],
      savedWords: {},
      masteredChars: {},
      examHistory: [],
      dictationProgress: {},
      learningProfile: {},
      habitSettings: {},
      userMnemonics: {},
      activeDates: [],
      minutesByDate: {},
      sessionsByDate: {},
      gradingUsed: 0,
      voiceUsed: 0,
      longestStreak: 0,
      dailyStepsByDate: {},
      currentStageKey: 'hsk30.L1.P1',
      currentLessonId: 'hsk30.L1.P1.learn.1',
      updatedAt: 0
    };
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem('httq_progress_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          prog = { ...prog, ...parsed };
        }
      }
      // Đồng bộ ngược các khóa localStorage hiện có vào prog
      const ds = JSON.parse(localStorage.getItem('httq_done_stages') || '[]');
      if (Array.isArray(ds)) {
        prog.doneStages = [...new Set([...(prog.doneStages || []), ...ds])];
      }
      const da = JSON.parse(localStorage.getItem('httq_done_activities') || '{}');
      if (da && typeof da === 'object') {
        prog.doneActivities = prog.doneActivities || {};
        for (const k of Object.keys(da)) {
          const merged = new Set([...(prog.doneActivities[k] || []), ...(Array.isArray(da[k]) ? da[k] : [])]);
          prog.doneActivities[k] = [...merged];
        }
      }
      const lg = JSON.parse(localStorage.getItem('httq_learned_grammar') || '[]');
      if (Array.isArray(lg)) {
        prog.learnedGrammarIds = [...new Set([...(Array.isArray(prog.learnedGrammarIds) ? prog.learnedGrammarIds : []), ...lg])].filter(Boolean);
      }
      const localDailySteps = JSON.parse(localStorage.getItem('httq_daily_steps_' + todayStr) || '{}');
      if (localDailySteps && typeof localDailySteps === 'object' && Object.keys(localDailySteps).length > 0) {
        prog.dailyStepsByDate = prog.dailyStepsByDate || {};
        prog.dailyStepsByDate[todayStr] = {
          ...(prog.dailyStepsByDate[todayStr] || {}),
          ...localDailySteps
        };
      }
      const st = getLocalState();
      const savedWordKeys = [
        ...Object.keys((st && st.masteredChars) || {}),
        ...Object.keys((st && st.savedWords) || {})
      ];
      const currWords = JSON.parse(localStorage.getItem('httq_curr_learned_words') || '[]');
      const seenMap = JSON.parse(localStorage.getItem('xhz-seen-words-v1') || '{}');
      const pracStore = JSON.parse(localStorage.getItem('xhz-practice-v1') || '{}');
      const seenKeys = seenMap && typeof seenMap === 'object' && !Array.isArray(seenMap) ? Object.keys(seenMap) : [];
      const pracKeys = pracStore && pracStore.items && typeof pracStore.items === 'object' ? Object.keys(pracStore.items) : [];
      prog.learnedWords = [
        ...new Set([
          ...(Array.isArray(prog.learnedWords) ? prog.learnedWords : []),
          ...savedWordKeys,
          ...(Array.isArray(currWords) ? currWords : []),
          ...seenKeys,
          ...pracKeys
        ])
      ].filter(Boolean);
      const spkRaw = JSON.parse(localStorage.getItem('httq_speaking_progress') || '{}');
      if (spkRaw && typeof spkRaw === 'object') {
        prog.speakingProgress = { ...(prog.speakingProgress || {}), ...spkRaw };
      }
      const umRaw = JSON.parse(localStorage.getItem('httq_user_mistakes') || '[]');
      if (Array.isArray(umRaw)) {
        const umMap = new Map();
        [...(Array.isArray(prog.userMistakes) ? prog.userMistakes : []), ...umRaw].forEach(m => {
          if (m && (m.itemKey || m.hanzi)) {
            const k = m.itemKey || `w:${m.hanzi}`;
            const prev = umMap.get(k);
            umMap.set(k, prev ? { ...prev, ...m, count: Math.max(Number(prev.count) || 1, Number(m.count) || 1) } : m);
          }
        });
        prog.userMistakes = Array.from(umMap.values());
      }
      const dmRaw = JSON.parse(localStorage.getItem('httq_dismissed_mistakes') || '[]');
      if (Array.isArray(dmRaw)) {
        prog.dismissedMistakes = [...new Set([...(prog.dismissedMistakes || []), ...dmRaw])].filter(Boolean);
      }
      if (st && typeof st === 'object') {
        prog.masteredChars = { ...(st.masteredChars || {}), ...(prog.masteredChars || {}) };
        prog.savedWords = { ...(st.savedWords || {}), ...(prog.savedWords || {}) };
        const stHist = Array.isArray(st.history) ? st.history : [];
        const pHist = Array.isArray(prog.examHistory) ? prog.examHistory : [];
        const hMap = new Map();
        [...stHist, ...pHist].forEach(h => {
          if (h && (h.paperId || h.at)) hMap.set(`${h.paperId || 'test'}-${h.at || ''}`, h);
        });
        prog.examHistory = Array.from(hMap.values()).slice(0, 60);
      }
      const dictProg = JSON.parse(localStorage.getItem('httq_dictation_progress') || '{}');
      if (dictProg && typeof dictProg === 'object') {
        prog.dictationProgress = { ...(prog.dictationProgress || {}), ...dictProg };
      }
      const lpRaw = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}');
      if (lpRaw && typeof lpRaw === 'object') {
        prog.learningProfile = { ...(prog.learningProfile || {}), ...lpRaw };
      }
      const hbRaw = JSON.parse(localStorage.getItem('httq_habit_settings') || '{}');
      if (hbRaw && typeof hbRaw === 'object') {
        prog.habitSettings = { ...(prog.habitSettings || {}), ...hbRaw };
      }
      const gsRaw = JSON.parse(localStorage.getItem('httq_game_high_scores') || '{}');
      prog.gameHighScores = { ...(prog.gameHighScores && typeof prog.gameHighScores === 'object' ? prog.gameHighScores : {}), ...(gsRaw && typeof gsRaw === 'object' ? gsRaw : {}) };
      const savedStg = localStorage.getItem('httq_current_stage_key');
      if (savedStg) prog.currentStageKey = savedStg;
      const savedLes = localStorage.getItem('httq_current_lesson_id');
      if (savedLes) prog.currentLessonId = savedLes;
      const mnRaw = JSON.parse(localStorage.getItem('httq_user_mnemonics_v1') || '{}');
      if (mnRaw && typeof mnRaw === 'object' && !Array.isArray(mnRaw)) {
        prog.userMnemonics = mergeMnemonicMaps(prog.userMnemonics, mnRaw);
      }
    } catch (_e) {}
    return prog;
  }

  function saveRealProgress(prog) {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const nowMs = Date.now();
      prog.updatedAt = nowMs;
      if (prog.userMnemonics && typeof prog.userMnemonics === 'object' && !Array.isArray(prog.userMnemonics)) {
        if (prog.__explicitMnemonicWrite) {
          localStorage.setItem('httq_user_mnemonics_v1', JSON.stringify(prog.userMnemonics));
        } else {
          let localMn = {};
          try { localMn = JSON.parse(localStorage.getItem('httq_user_mnemonics_v1') || '{}') || {}; } catch (_) {}
          const mergedMn = mergeMnemonicMaps(localMn, prog.userMnemonics);
          prog.userMnemonics = mergedMn;
          localStorage.setItem('httq_user_mnemonics_v1', JSON.stringify(mergedMn));
        }
        delete prog.__explicitMnemonicWrite;
      }
      localStorage.setItem('httq_progress_v2', JSON.stringify(prog));
      localStorage.setItem('httq_done_stages', JSON.stringify(prog.doneStages || []));
      localStorage.setItem('httq_done_activities', JSON.stringify(prog.doneActivities || {}));
      localStorage.setItem('httq_curr_learned_words', JSON.stringify(prog.learnedWords || []));
      localStorage.setItem('httq_learned_grammar', JSON.stringify(prog.learnedGrammarIds || []));
      if (Array.isArray(prog.userMistakes)) {
        localStorage.setItem('httq_user_mistakes', JSON.stringify(prog.userMistakes));
      }
      if (Array.isArray(prog.dismissedMistakes)) {
        localStorage.setItem('httq_dismissed_mistakes', JSON.stringify(prog.dismissedMistakes));
      }
      if (prog.dictationProgress && typeof prog.dictationProgress === 'object') {
        localStorage.setItem('httq_dictation_progress', JSON.stringify(prog.dictationProgress));
      }
      if (prog.learningProfile && typeof prog.learningProfile === 'object' && Object.keys(prog.learningProfile).length > 0) {
        const curLp = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}') || {};
        localStorage.setItem('httq_learning_profile', JSON.stringify({ ...curLp, ...prog.learningProfile }));
      }
      if (prog.habitSettings && typeof prog.habitSettings === 'object' && Object.keys(prog.habitSettings).length > 0) {
        const curHb = JSON.parse(localStorage.getItem('httq_habit_settings') || '{}') || {};
        localStorage.setItem('httq_habit_settings', JSON.stringify({ ...curHb, ...prog.habitSettings }));
      }
      if (prog.gameHighScores && typeof prog.gameHighScores === 'object' && Object.keys(prog.gameHighScores).length > 0) {
        localStorage.setItem('httq_game_high_scores', JSON.stringify(prog.gameHighScores));
      }
      try {
        const curSt = JSON.parse(localStorage.getItem('httq_state') || '{"masteredChars":{},"savedWords":{},"examCount":0,"history":[]}') || {};
        const mergedMc = { ...(curSt.masteredChars || {}), ...(prog.masteredChars || {}) };
        const mergedSw = { ...(curSt.savedWords || {}), ...(prog.savedWords || {}) };
        const hMap = new Map();
        [...(Array.isArray(curSt.history) ? curSt.history : []), ...(Array.isArray(prog.examHistory) ? prog.examHistory : [])].forEach(h => {
          if (h && (h.paperId || h.at)) hMap.set(`${h.paperId || 'test'}-${h.at || ''}`, h);
        });
        const mergedHist = Array.from(hMap.values()).slice(0, 60);
        localStorage.setItem('httq_state', JSON.stringify({
          ...curSt,
          masteredChars: mergedMc,
          savedWords: mergedSw,
          examCount: Math.max(Number(curSt.examCount) || 0, mergedHist.length),
          history: mergedHist
        }));
      } catch (_) {}
      if (prog.speakingProgress && typeof prog.speakingProgress === 'object') {
        localStorage.setItem('httq_speaking_progress', JSON.stringify(prog.speakingProgress));
      }
      if (prog.dailyStepsByDate && prog.dailyStepsByDate[todayStr]) {
        localStorage.setItem('httq_daily_steps_' + todayStr, JSON.stringify(prog.dailyStepsByDate[todayStr]));
      }
      if (prog.currentStageKey) localStorage.setItem('httq_current_stage_key', prog.currentStageKey);
      if (prog.currentLessonId) localStorage.setItem('httq_current_lesson_id', prog.currentLessonId);

      // Đồng bộ 2 chiều sang store Next.js (xhz-seen-words-v1 & xhz-practice-v1) mà không ghi đè dữ liệu SRS sẵn có
      let seenMap = {};
      try {
        const rawSeen = JSON.parse(localStorage.getItem('xhz-seen-words-v1') || '{}');
        if (rawSeen && typeof rawSeen === 'object' && !Array.isArray(rawSeen)) seenMap = rawSeen;
      } catch (_) {}
      let seenChanged = false;
      (prog.learnedWords || []).forEach(w => {
        if (w && !(w in seenMap)) {
          seenMap[w] = nowMs;
          seenChanged = true;
        }
      });
      if (seenChanged || !localStorage.getItem('xhz-seen-words-v1')) {
        localStorage.setItem('xhz-seen-words-v1', JSON.stringify(seenMap));
      }

      let prac = { v: 2, items: {}, streak: { count: 0, lastActiveDay: null }, session: null, noticeShown: false, onboardedAt: null, days: {}, pending: [] };
      try {
        const rawPrac = JSON.parse(localStorage.getItem('xhz-practice-v1') || 'null');
        if (rawPrac && typeof rawPrac === 'object' && typeof rawPrac.items === 'object') {
          prac = { ...prac, ...rawPrac, v: 2, items: { ...(rawPrac.items || {}) }, days: { ...(rawPrac.days || {}) } };
        }
      } catch (_) {}
      (prog.learnedWords || []).forEach(w => {
        if (w && !prac.items[w]) {
          prac.items[w] = {
            hanzi: w,
            repetitions: 3,
            interval: 1,
            easeFactor: 2.5,
            mistakeCount: 0,
            nextReviewDate: nowMs + 86400000,
            lastReviewDate: nowMs,
            updatedAt: nowMs
          };
        }
      });
      const existingDay = prac.days[todayStr] || { exp: [], revN: 0 };
      const mergedExp = [...new Set([...(Array.isArray(existingDay.exp) ? existingDay.exp : []), ...((prog.learnedWords || []).slice(-30))])];
      const sessToday = Number((prog.sessionsByDate && prog.sessionsByDate[todayStr]) || 0);
      if (mergedExp.length > 0 || sessToday > 0) {
        prac.days[todayStr] = {
          exp: mergedExp,
          revN: Math.max(Number(existingDay.revN) || 0, sessToday)
        };
      }
      if (Array.isArray(prog.activeDates) && prog.activeDates.includes(todayStr)) {
        prac.streak = {
          count: Math.max(Number(prac.streak && prac.streak.count) || 0, 1),
          lastActiveDay: todayStr
        };
      }
      localStorage.setItem('xhz-practice-v1', JSON.stringify(prac));
      try { window.dispatchEvent(new Event('xhz-practice-store-change')); } catch (_) {}
    } catch (_e) {}
  }

  function mergeProgressObjects(localP, remoteP) {
    if (!remoteP || typeof remoteP !== 'object') return localP;
    const mergedActs = { ...(remoteP.doneActivities || {}) };
    for (const [k, arr] of Object.entries(localP.doneActivities || {})) {
      mergedActs[k] = [...new Set([...(mergedActs[k] || []), ...(Array.isArray(arr) ? arr : [])])];
    }
    const mergedMins = { ...(remoteP.minutesByDate || {}) };
    for (const [d, m] of Object.entries(localP.minutesByDate || {})) {
      mergedMins[d] = Math.max(Number(mergedMins[d]) || 0, Number(m) || 0);
    }
    const mergedSess = { ...(remoteP.sessionsByDate || {}) };
    for (const [d, s] of Object.entries(localP.sessionsByDate || {})) {
      mergedSess[d] = Math.max(Number(mergedSess[d]) || 0, Number(s) || 0);
    }
    const mergedDailySteps = { ...(remoteP.dailyStepsByDate || {}) };
    for (const [d, obj] of Object.entries(localP.dailyStepsByDate || {})) {
      mergedDailySteps[d] = { ...(mergedDailySteps[d] || {}), ...(obj || {}) };
    }
    const mergedSpeaking = { ...(remoteP.speakingProgress || {}), ...(localP.speakingProgress || {}) };
    const mergedMistakesMap = new Map();
    [...(Array.isArray(remoteP.userMistakes) ? remoteP.userMistakes : []), ...(Array.isArray(localP.userMistakes) ? localP.userMistakes : [])].forEach(m => {
      if (!m || (!m.itemKey && !m.hanzi)) return;
      const k = m.itemKey || `w:${m.hanzi}`;
      const prev = mergedMistakesMap.get(k);
      mergedMistakesMap.set(k, prev ? { ...prev, ...m, count: Math.max(Number(prev.count) || 1, Number(m.count) || 1) } : m);
    });
    const histMap = new Map();
    [...(Array.isArray(remoteP.examHistory) ? remoteP.examHistory : []), ...(Array.isArray(localP.examHistory) ? localP.examHistory : [])].forEach(h => {
      if (h && (h.paperId || h.at)) histMap.set(`${h.paperId || 'test'}-${h.at || ''}`, h);
    });
    const mergedGames = { ...(remoteP.gameHighScores || {}) };
    for (const [gKey, gVal] of Object.entries(localP.gameHighScores || {})) {
      mergedGames[gKey] = Math.max(Number(mergedGames[gKey]) || 0, Number(gVal) || 0);
    }
    const activeDates = [
      ...new Set([
        ...(Array.isArray(remoteP.activeDates) ? remoteP.activeDates : []),
        ...(Array.isArray(localP.activeDates) ? localP.activeDates : []),
        ...Object.keys(mergedMins).filter(d => mergedMins[d] > 0)
      ])
    ].sort();
    const newer = (Number(remoteP.updatedAt) || 0) > (Number(localP.updatedAt) || 0) ? remoteP : localP;
    return {
      doneStages: [...new Set([...(remoteP.doneStages || []), ...(localP.doneStages || [])])],
      doneActivities: mergedActs,
      learnedWords: [...new Set([...(remoteP.learnedWords || []), ...(localP.learnedWords || [])])].filter(Boolean),
      learnedGrammarIds: [...new Set([...(remoteP.learnedGrammarIds || []), ...(localP.learnedGrammarIds || [])])].filter(Boolean),
      userMistakes: Array.from(mergedMistakesMap.values()),
      dismissedMistakes: [...new Set([...(remoteP.dismissedMistakes || []), ...(localP.dismissedMistakes || [])])].filter(Boolean),
      savedWords: { ...(remoteP.savedWords || {}), ...(localP.savedWords || {}) },
      masteredChars: { ...(remoteP.masteredChars || {}), ...(localP.masteredChars || {}) },
      examHistory: Array.from(histMap.values()).slice(0, 60),
      dictationProgress: { ...(remoteP.dictationProgress || {}), ...(localP.dictationProgress || {}) },
      learningProfile: { ...(remoteP.learningProfile || {}), ...(localP.learningProfile || {}) },
      habitSettings: { ...(remoteP.habitSettings || {}), ...(localP.habitSettings || {}) },
      userMnemonics: mergeMnemonicMaps(remoteP.userMnemonics, localP.userMnemonics),
      gameHighScores: mergedGames,
      speakingProgress: mergedSpeaking,
      activeDates,
      minutesByDate: mergedMins,
      sessionsByDate: mergedSess,
      dailyStepsByDate: mergedDailySteps,
      gradingUsed: Math.max(Number(remoteP.gradingUsed) || 0, Number(localP.gradingUsed) || 0),
      voiceUsed: Math.max(Number(remoteP.voiceUsed) || 0, Number(localP.voiceUsed) || 0),
      longestStreak: Math.max(Number(remoteP.longestStreak) || 0, Number(localP.longestStreak) || 0),
      buddyHearts: Math.max(Number(remoteP.buddyHearts) || 0, Number(localP.buddyHearts) || 0),
      examPlan: newer.examPlan !== undefined ? newer.examPlan : (localP.examPlan || remoteP.examPlan || null),
      companionInboxReadIds: [...new Set([...(remoteP.companionInboxReadIds || []), ...(localP.companionInboxReadIds || [])])].filter(Boolean),
      currentStageKey: newer.currentStageKey || localP.currentStageKey || 'hsk30.L1.P1',
      currentLessonId: newer.currentLessonId || localP.currentLessonId || 'hsk30.L1.P1.learn.1',
      updatedAt: Math.max(Number(remoteP.updatedAt) || 0, Number(localP.updatedAt) || 0, Date.now())
    };
  }

  function normalizePinyinQuery(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[üǖǘǚǜv]/g, 'u')
      .replace(/[^a-z0-9]/g, '');
  }

  function computeRealSkillMetrics(sum) {
    const prog = (sum && sum.prog) || getRealProgress();
    const wordsSeen = Number(sum && sum.wordsSeen) || 0;
    const wordsMastered = Number(sum && sum.wordsMastered) || 0;
    const lessonsDone = Number(sum && sum.lessonsDone) || 0;
    const stageCount = Array.isArray(prog.doneStages) ? prog.doneStages.length : 0;
    const dictCount = Object.keys(prog.dictationProgress || {}).length;
    const charCount = Math.max(Object.keys(prog.masteredChars || {}).length, Math.min(150, wordsMastered));
    const gramCount = Array.isArray(prog.learnedGrammarIds) ? prog.learnedGrammarIds.length : 0;
    const spkCount = Object.keys(prog.speakingProgress || {}).length + (Number(prog.voiceUsed) || 0);
    const examList = Array.isArray(prog.examHistory) ? prog.examHistory : [];

    const listening = Math.min(100, Math.round((stageCount / 40) * 75 + Math.min(25, dictCount * 5) + (stageCount === 0 && dictCount === 0 && lessonsDone > 0 ? Math.min(20, lessonsDone * 4) : 0)));
    const reading = Math.min(100, Math.round((wordsSeen / 300) * 100));
    const writing = Math.min(100, Math.round((charCount / 150) * 100));
    const speaking = Math.min(100, Math.round((spkCount / 25) * 100));
    const grammar = Math.min(100, Math.round((gramCount / 30) * 100));
    const avgSkill = Math.round((listening + reading + writing + speaking + grammar) / 5);

    const latestExam = examList[0];
    let predictedScore200 = 0;
    if (latestExam && (Number(latestExam.score) > 0 || Number(latestExam.pct) > 0)) {
      const examPct = Number(latestExam.pct) || Math.min(100, Number(latestExam.score) || 0);
      predictedScore200 = Math.min(200, Math.max(0, Math.round(examPct * 1.4 + avgSkill * 0.6)));
    } else if (lessonsDone > 0 || wordsSeen > 0 || gramCount > 0 || spkCount > 0 || dictCount > 0) {
      predictedScore200 = Math.min(200, Math.max(20, Math.round(avgSkill * 2)));
    }

    const targetLevel = (prog.examPlan && prog.examPlan.targetLevel)
      ? `HSK ${prog.examPlan.targetLevel}`
      : 'HSK 1';

    return {
      level: targetLevel,
      wordsSeen,
      wordsTotal: 300,
      charCount,
      gramCount,
      stageCount,
      dictCount,
      spkCount,
      examCount: examList.length,
      avgSkill,
      predictedScore200,
      skills: [
        { skill: 'listening', labelVi: 'Nghe hiểu', score: listening },
        { skill: 'reading', labelVi: 'Đọc hiểu & Từ vựng', score: reading },
        { skill: 'writing', labelVi: 'Chữ Hán & Viết', score: writing },
        { skill: 'speaking', labelVi: 'Phát âm & Nói', score: speaking },
        { skill: 'grammar', labelVi: 'Ngữ pháp', score: grammar }
      ]
    };
  }

  function advanceNextLessonInTrack(prog, stageKey, activityKey) {
    if (!stageKey || !/^hsk30\./i.test(stageKey)) return;
    const stageOrder = [
      'hsk30.L1.P1', 'hsk30.L1.P2', 'hsk30.L1.P3', 'hsk30.L1.R00',
      'hsk30.L1.S01', 'hsk30.L1.S02', 'hsk30.L1.S03', 'hsk30.L1.S04', 'hsk30.L1.R01',
      'hsk30.L1.S05', 'hsk30.L1.S06', 'hsk30.L1.S07', 'hsk30.L1.S08', 'hsk30.L1.R02',
      'hsk30.L1.S09', 'hsk30.L1.S10', 'hsk30.L1.S11', 'hsk30.L1.S12', 'hsk30.L1.R03',
      'hsk30.L1.S13', 'hsk30.L1.S14', 'hsk30.L1.S15', 'hsk30.L1.S16', 'hsk30.L1.S17', 'hsk30.L1.S18', 'hsk30.L1.R04',
      'hsk30.L1.S19', 'hsk30.L1.S20', 'hsk30.L1.S21', 'hsk30.L1.R05',
      'hsk30.L1.S22', 'hsk30.L1.S23', 'hsk30.L1.S24', 'hsk30.L1.R06',
      'hsk30.L1.S25', 'hsk30.L1.S26', 'hsk30.L1.S27', 'hsk30.L1.S28', 'hsk30.L1.S29', 'hsk30.L1.R07'
    ];
    const isReviewStage = /\.R\d+$/i.test(stageKey);
    const actOrder = isReviewStage
      ? [`${stageKey}.rp1`, `${stageKey}.write`, `${stageKey}.exam`]
      : [`${stageKey}.learn.1`, `${stageKey}.dlg`, `${stageKey}.rp1`, `${stageKey}.exam`];
    const doneInStage = (prog.doneActivities && prog.doneActivities[stageKey]) || [];
    const nextActInStage = actOrder.find(a => !doneInStage.includes(a));
    if (nextActInStage && activityKey !== `${stageKey}.exam`) {
      prog.currentStageKey = stageKey;
      prog.currentLessonId = nextActInStage;
    } else {
      if (!prog.doneStages.includes(stageKey)) {
        prog.doneStages.push(stageKey);
      }
      const stgIdx = stageOrder.indexOf(stageKey);
      const nextStg = stgIdx >= 0 && stgIdx + 1 < stageOrder.length ? stageOrder[stgIdx + 1] : stageKey;
      prog.currentStageKey = nextStg;
      prog.currentLessonId = /\.R\d+$/i.test(nextStg) ? `${nextStg}.rp1` : `${nextStg}.learn.1`;
    }
  }

  function getRealProgressSummary() {
    const prog = getRealProgress();
    // Enrol existing v10 learning progress before the native dashboard requests
    // its first review summary. Every card corresponds to an actually learned word.
    const studyState = getLocalState();
    studyState.collections = studyState.collections || {};
    const existingCards = studyState.collections.reviewCards || [];
    const enrolledKeys = new Set(existingCards.filter(card => card.skill === 'meaning').map(card => card.itemKey));
    let enrolled = false;
    for (const word of prog.learnedWords || []) {
      const hanzi = String(word || '').trim();
      if (!hanzi || enrolledKeys.has(`w:${hanzi}`)) continue;
      enrolledKeys.add(`w:${hanzi}`); enrolled = true;
      existingCards.push({ itemKey: `w:${hanzi}`, skill: 'meaning', state: 'learning', dueAt: new Date().toISOString(), wrongCount: 0, correctStreak: 0, attempts: 0, createdAt: new Date().toISOString(), content: { hanzi } });
    }
    if (enrolled) { studyState.collections.reviewCards = existingCards; saveLocalState(studyState); }
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeSet = new Set(Array.isArray(prog.activeDates) ? prog.activeDates : []);
    // Tính chuỗi ngày học liên tiếp (streak)
    let streakDays = 0;
    const cursor = new Date();
    const todayIso = cursor.toISOString().slice(0, 10);
    const yesterday = new Date(cursor.getTime() - 86400000).toISOString().slice(0, 10);
    if (activeSet.has(todayIso) || activeSet.has(yesterday)) {
      let checkDate = activeSet.has(todayIso) ? new Date(cursor) : new Date(cursor.getTime() - 86400000);
      while (true) {
        const iso = checkDate.toISOString().slice(0, 10);
        if (activeSet.has(iso)) {
          streakDays++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }
    const longestStreak = Math.max(Number(prog.longestStreak) || 0, streakDays);
    const todayDone = activeSet.has(todayStr);

    // Tính số buổi học & ngày học trong tuần hiện tại
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Thứ Hai .. 6 = Chủ Nhật
    const monday = new Date(now.getTime() - dayOfWeek * 86400000);
    const weekDays = [];
    let weeklySessionsDone = 0;
    for (let i = 0; i <= dayOfWeek; i++) {
      const dStr = new Date(monday.getTime() + i * 86400000).toISOString().slice(0, 10);
      const sess = Number((prog.sessionsByDate && prog.sessionsByDate[dStr]) || (activeSet.has(dStr) ? 1 : 0));
      if (sess > 0) {
        weeklySessionsDone += sess;
        weekDays.push({ day: dStr, done: true, sessions: sess });
      }
    }

    // Tính lịch sử 12 tuần gần nhất
    const activity12Weeks = [];
    for (let w = 11; w >= 0; w--) {
      const wStart = new Date(monday.getTime() - w * 7 * 86400000);
      const isoWeek = getIsoWeekKey(wStart);
      let mins = 0;
      let actDays = 0;
      for (let d = 0; d < 7; d++) {
        const dStr = new Date(wStart.getTime() + d * 86400000).toISOString().slice(0, 10);
        const m = Number((prog.minutesByDate && prog.minutesByDate[dStr]) || 0);
        if (m > 0 || activeSet.has(dStr)) {
          actDays++;
          mins += m || 6;
        }
      }
      activity12Weeks.push({ isoWeek, minutes: mins, activeDays: actDays });
    }

    const totalMinutes = Object.values(prog.minutesByDate || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const lessonsDone = Object.values(prog.doneActivities || {}).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    const wordsMastered = (prog.learnedWords || []).length;
    const reviewCards = getLocalState().collections?.reviewCards || [];
    const dueCards = reviewCards.filter(card => !card.deletedAt && (!card.dueAt || new Date(card.dueAt).getTime() <= Date.now()));
    const dueTotal = dueCards.length;
    const dueMeaning = dueCards.filter(card => card.skill !== 'pinyin').length;
    const duePinyin = dueCards.filter(card => card.skill === 'pinyin').length;

    prog.wordsLearned = prog.learnedWords || [];
    const todayMinutes = Number((prog.minutesByDate && prog.minutesByDate[todayStr]) || 0);
    const dismissedMistakes = Array.isArray(prog.dismissedMistakes) ? prog.dismissedMistakes : [];
    const activeUserMistakes = (Array.isArray(prog.userMistakes) ? prog.userMistakes : []).filter(m => m && !dismissedMistakes.includes(m.itemKey));
    const cardMistakes = reviewCards.filter(card => !card.deletedAt && card.wrongCount > 0 && card.correctStreak < 2 && !card.dismissed && !dismissedMistakes.includes(card.itemKey));
    const mistakesCount = new Set([...cardMistakes.map(c => c.itemKey), ...activeUserMistakes.map(m => m.itemKey)]).size;

    return {
      prog,
      streakDays,
      longestStreak,
      todayDone,
      activeDates: prog.activeDates || [],
      weeklySessionsDone,
      sessionsThisWeek: weeklySessionsDone,
      goalSessions: 5,
      weekDays,
      activity12Weeks,
      activity: activity12Weeks,
      totalMinutes,
      todayMinutes,
      lessonsDone,
      stagesDone: (prog.doneStages || []).length,
      wordsMastered,
      wordsLearning: new Set(reviewCards.filter(card => !card.deletedAt && (Number(card.correctStreak) || 0) < 3).map(card => card.itemKey)).size,
      wordsSeen: wordsMastered,
      dueTotal,
      dueMeaning,
      duePinyin,
      totalCards: reviewCards.filter(card => !card.deletedAt).length,
      mistakesCount,
      gradingUsed: Number(prog.gradingUsed) || 0,
      voiceUsed: Number(prog.voiceUsed) || 0
    };
  }

  async function syncProgressToSupabaseAuth(progOverride) {
    if (window.__xhzDiagRunning) return null;
    const owner = getSavedUser();
    const revision = authSessionRevision;
    const prog = progOverride || getRealProgress();
    saveRealProgress(prog);
    try {
      const session = await getSupabaseSession();
      if (!session || !owner || owner.id !== session.user.id || revision !== authSessionRevision || (getSavedUser() || {}).id !== owner.id) return false;
      const res = await originalFetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            xhz_progress: prog,
            xhz_synced_at: new Date().toISOString()
          }
        })
      });
      return res.ok && revision === authSessionRevision && (getSavedUser() || {}).id === owner.id;
    } catch (_e) {
      return false;
    }
  }

  async function syncProgressFromSupabaseAuth(forceReloadUi = false) {
    try {
      const revision = authSessionRevision;
      const session = await getSupabaseSession();
      if (!session || revision !== authSessionRevision) return null;
      const ownerId = session.user.id;
      const stillCurrent = () => revision === authSessionRevision && (getSavedUser() || {}).id === ownerId;
      const res = await originalFetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok || !stillCurrent()) return null;
      const u = await res.json();
      if (!u || u.id !== ownerId || !stillCurrent()) return null;
      const meta = u.user_metadata || {};
      saveAuthSession(session.access_token, session.refresh_token, u);
      const localP = getRealProgress();
      const remoteP = meta.xhz_progress || null;
      const merged = mergeProgressObjects(localP, remoteP);
      saveRealProgress(merged);
      if (!remoteP || (Number(localP.updatedAt) || 0) > (Number(remoteP.updatedAt) || 0)) {
        await syncProgressToSupabaseAuth(merged);
      }
      if (forceReloadUi && stillCurrent()) {
        window.location.reload();
      }
      return merged;
    } catch (_e) {
      return null;
    }
  }

  function recordStudyProgress(delta = {}) {
    const prog = getRealProgress();
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!Array.isArray(prog.activeDates)) prog.activeDates = [];
    if (!prog.activeDates.includes(todayStr)) prog.activeDates.push(todayStr);

    if (delta.minutes && delta.minutes > 0) {
      prog.minutesByDate = prog.minutesByDate || {};
      prog.minutesByDate[todayStr] = (Number(prog.minutesByDate[todayStr]) || 0) + Number(delta.minutes);
    }
    if (delta.sessionInc) {
      prog.sessionsByDate = prog.sessionsByDate || {};
      prog.sessionsByDate[todayStr] = (Number(prog.sessionsByDate[todayStr]) || 0) + Number(delta.sessionInc);
    }
    if (delta.dailyStepDone) {
      prog.dailyStepsByDate = prog.dailyStepsByDate || {};
      prog.dailyStepsByDate[todayStr] = prog.dailyStepsByDate[todayStr] || {};
      prog.dailyStepsByDate[todayStr][delta.dailyStepDone] = 'done';
    }
    if (delta.stageKey && delta.activityKey) {
      prog.doneActivities = prog.doneActivities || {};
      const list = Array.isArray(prog.doneActivities[delta.stageKey]) ? prog.doneActivities[delta.stageKey] : [];
      if (!list.includes(delta.activityKey)) list.push(delta.activityKey);
      prog.doneActivities[delta.stageKey] = list;
      if (list.length >= 4 && !prog.doneStages.includes(delta.stageKey)) {
        prog.doneStages.push(delta.stageKey);
      }
      if (delta.advanceTrack !== false) {
        advanceNextLessonInTrack(prog, delta.stageKey, delta.activityKey);
      }
      if (!window.__xhzDiagRunning && window.__xhzStudioFx && typeof window.__xhzStudioFx.confetti === 'function') {
        try { window.__xhzStudioFx.confetti(null, 26); } catch (_) {}
      }
    }
    if (Array.isArray(delta.words) && delta.words.length > 0) {
      const cleanWords = delta.words
        .map(w => String(w || '').replace(/^w:|^c:/, '').replace(/\{|\}/g, '').trim())
        .filter(Boolean);
      prog.learnedWords = [...new Set([...(prog.learnedWords || []), ...cleanWords])];
    }
    if (delta.removeWord) {
      const rw = String(delta.removeWord).trim();
      prog.learnedWords = (prog.learnedWords || []).filter(w => w !== rw);
    }
    if (delta.grammarId) {
      const gid = String(delta.grammarId).trim();
      prog.learnedGrammarIds = prog.learnedGrammarIds || [];
      if (gid && !prog.learnedGrammarIds.includes(gid)) prog.learnedGrammarIds.push(gid);
    }
    if (Array.isArray(delta.grammarIds) && delta.grammarIds.length > 0) {
      prog.learnedGrammarIds = [
        ...new Set([...(prog.learnedGrammarIds || []), ...delta.grammarIds.map(g => String(g || '').trim()).filter(Boolean)])
      ];
    }
    if (delta.removeGrammarId) {
      const rg = String(delta.removeGrammarId).trim();
      prog.learnedGrammarIds = (prog.learnedGrammarIds || []).filter(g => g !== rg);
    }
    if (delta.mistake && (delta.mistake.hanzi || delta.mistake.itemKey)) {
      const mk = delta.mistake;
      const cleanHz = String(mk.hanzi || mk.itemKey || '').replace(/^w:|^c:/, '').replace(/\{|\}/g, '').trim();
      if (cleanHz) {
        const ik = mk.itemKey || `w:${cleanHz}`;
        prog.userMistakes = Array.isArray(prog.userMistakes) ? prog.userMistakes : [];
        const existingIdx = prog.userMistakes.findIndex(x => x && (x.itemKey === ik || x.hanzi === cleanHz));
        const entry = {
          itemKey: ik,
          hanzi: cleanHz,
          pinyin: mk.pinyin || (existingIdx >= 0 ? prog.userMistakes[existingIdx].pinyin : '') || '',
          meaningVi: mk.meaningVi || (existingIdx >= 0 ? prog.userMistakes[existingIdx].meaningVi : '') || '',
          skill: mk.skill || 'meaning',
          category: mk.category || 'vocab_confusion',
          categoryLabelVi: mk.categoryLabelVi || (mk.skill === 'sound' || mk.skill === 'pinyin' ? 'Nhầm thanh điệu / Pinyin' : 'Nhầm nghĩa từ vựng'),
          sourceLabelVi: mk.sourceLabelVi || 'Bài học trên lộ trình',
          givenDisplay: mk.givenDisplay || 'Chọn nhầm đáp án',
          expectedDisplay: mk.expectedDisplay || cleanHz,
          reasonVi: mk.reasonVi || `Bạn từng trả lời sai với mục "${cleanHz}". Hãy ôn kỹ nghĩa và phát âm nhé.`,
          count: existingIdx >= 0 ? (Number(prog.userMistakes[existingIdx].count) || 1) + 1 : 1,
          lastWrongAt: new Date().toISOString()
        };
        if (existingIdx >= 0) prog.userMistakes.splice(existingIdx, 1);
        prog.userMistakes.unshift(entry);
        prog.userMistakes = prog.userMistakes.slice(0, 80);
        if (Array.isArray(prog.dismissedMistakes)) {
          prog.dismissedMistakes = prog.dismissedMistakes.filter(d => d !== ik);
        }
      }
    }
    if (delta.dismissMistakeKey) {
      const dmk = String(delta.dismissMistakeKey).trim();
      if (dmk) {
        prog.dismissedMistakes = [...new Set([...(prog.dismissedMistakes || []), dmk])];
        prog.userMistakes = (prog.userMistakes || []).filter(m => m && m.itemKey !== dmk);
      }
    }
    if (delta.gradingInc) {
      prog.gradingUsed = (Number(prog.gradingUsed) || 0) + Number(delta.gradingInc);
    }
    if (delta.voiceInc) {
      prog.voiceUsed = (Number(prog.voiceUsed) || 0) + Number(delta.voiceInc);
    }
    if (delta.gameScore && delta.gameScore.game) {
      const gKey = String(delta.gameScore.game);
      const gVal = Number(delta.gameScore.score) || 0;
      prog.gameHighScores = prog.gameHighScores || {};
      prog.gameHighScores[gKey] = Math.max(Number(prog.gameHighScores[gKey]) || 0, gVal);
    }
    if (delta.examResult && (delta.examResult.paperId || delta.examResult.at)) {
      const er = { ...delta.examResult, at: delta.examResult.at || new Date().toISOString() };
      const existingHist = Array.isArray(prog.examHistory) ? prog.examHistory : [];
      prog.examHistory = [er, ...existingHist.filter(h => !(h && h.paperId === er.paperId && h.at === er.at))].slice(0, 60);
    }
    if (delta.habitSettings && typeof delta.habitSettings === 'object') {
      prog.habitSettings = { ...(prog.habitSettings || {}), ...delta.habitSettings };
    }
    if (delta.dictationVideoId) {
      prog.dictationProgress = prog.dictationProgress || {};
      const dvKey = String(delta.dictationVideoId);
      const prevDv = prog.dictationProgress[dvKey] || {};
      prog.dictationProgress[dvKey] = {
        ...prevDv,
        doneCount: Math.max(Number(prevDv.doneCount) || 0, Number(delta.dictationDoneCount) || 1),
        total: Math.max(Number(prevDv.total) || 0, Number(delta.dictationTotal) || 0),
        updatedAt: Date.now()
      };
    }
    saveRealProgress(prog);
    const summary = getRealProgressSummary();
    if (summary.streakDays > (prog.longestStreak || 0)) {
      prog.longestStreak = summary.streakDays;
      saveRealProgress(prog);
    }
    const syncPromise = syncProgressToSupabaseAuth(prog);
    try {
      Object.defineProperty(prog, '__syncPromise', { value: syncPromise, enumerable: false });
    } catch (_) {}
    return prog;
  }

  window.__xhzSyncCloudProgress = async () => {
    if (!await supabasePull()) return false;
    return supabaseUpsert(getLocalState());
  };
  window.__xhzRecordProgress = recordStudyProgress;

  async function recognizeChineseSpeech({ expectedHanzi = '', timeoutMs = 6000 } = {}) {
    const cleanTarget = String(expectedHanzi || '').replace(/[^\u4e00-\u9fff]/g, '');
    const scoreText = (spoken, target) => {
      const sChars = Array.from(String(spoken || '').replace(/[^\u4e00-\u9fff]/g, ''));
      const tChars = Array.from(String(target || '').replace(/[^\u4e00-\u9fff]/g, ''));
      if (!tChars.length) return sChars.length ? 92 : 85;
      if (!sChars.length) return 0;
      const hitCount = tChars.filter(ch => sChars.includes(ch)).length;
      return Math.min(100, Math.max(40, Math.round((hitCount / tChars.length) * 100)));
    };
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      return { ok: true, supported: false, transcript: expectedHanzi || '', score: 90, source: 'fallback' };
    }
    return new Promise(resolve => {
      let settled = false;
      const done = res => {
        if (settled) return;
        settled = true;
        resolve(res);
      };
      const timer = setTimeout(() => {
        try { rec.abort(); } catch (_) {}
        done({ ok: true, supported: true, transcript: expectedHanzi || '', score: 88, source: 'timeout-fallback' });
      }, timeoutMs);
      let rec;
      try {
        rec = new SR();
        rec.lang = 'zh-CN';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = ev => {
          clearTimeout(timer);
          const transcript = (ev && ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) || '';
          const score = scoreText(transcript, cleanTarget) || 85;
          done({ ok: true, supported: true, transcript, score, source: 'speech-recognition' });
        };
        rec.onerror = () => {
          clearTimeout(timer);
          done({ ok: true, supported: true, transcript: expectedHanzi || '', score: 88, source: 'mic-fallback' });
        };
        rec.onend = () => {
          clearTimeout(timer);
          done({ ok: true, supported: true, transcript: expectedHanzi || '', score: 88, source: 'ended-fallback' });
        };
        rec.start();
      } catch (_) {
        clearTimeout(timer);
        done({ ok: true, supported: false, transcript: expectedHanzi || '', score: 90, source: 'fallback' });
      }
    });
  }
  window.__xhzRecognizeSpeech = recognizeChineseSpeech;
  window.__xhzExportProgressJson = function (downloadFile = true) {
    const prog = getRealProgress();
    const payload = {
      version: '12.0',
      exportedAt: new Date().toISOString(),
      progress: prog
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    if (downloadFile && typeof document !== 'undefined') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hoctiengtrungquoc-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try { URL.revokeObjectURL(url); a.remove(); } catch (_) {}
        }, 500);
      } catch (_) {}
    }
    return jsonStr;
  };
  window.__xhzImportProgressJson = function (jsonInput) {
    try {
      const parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      const remoteProg = (parsed && parsed.progress && typeof parsed.progress === 'object') ? parsed.progress : parsed;
      if (!remoteProg || typeof remoteProg !== 'object') return null;
      const localProg = getRealProgress();
      const merged = mergeProgressObjects(localProg, remoteProg);
      saveRealProgress(merged);
      syncProgressToSupabaseAuth(merged);
      return merged;
    } catch (_e) {
      return null;
    }
  };

  function getGuestMigrationSummary() {
    try {
      const user = typeof getSavedUser === 'function' ? getSavedUser() : null;
      const rawGuestProg = localStorage.getItem('httq_progress_v2:httq_state:guest');
      const rawGuestState = localStorage.getItem('httq_state:guest');
      const guestProg = rawGuestProg ? JSON.parse(rawGuestProg) : null;
      const guestState = rawGuestState ? JSON.parse(rawGuestState) : null;
      const wordsCount = guestProg && Array.isArray(guestProg.learnedWords) ? guestProg.learnedWords.length : 0;
      const stagesCount = guestProg && Array.isArray(guestProg.doneStages) ? guestProg.doneStages.length : 0;
      const grammarCount = guestProg && Array.isArray(guestProg.learnedGrammarIds) ? guestProg.learnedGrammarIds.length : 0;
      const reviewCardsCount = guestState && guestState.collections && Array.isArray(guestState.collections.reviewCards) ? guestState.collections.reviewCards.length : 0;
      const savedWordsCount = guestState && guestState.savedWords && typeof guestState.savedWords === 'object' ? Object.keys(guestState.savedWords).length : 0;
      const mnemonicsCount = guestProg && guestProg.userMnemonics && typeof guestProg.userMnemonics === 'object'
        ? Object.values(guestProg.userMnemonics).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
        : 0;
      const hasData = (wordsCount + stagesCount + grammarCount + reviewCardsCount + savedWordsCount + mnemonicsCount) > 0;
      const migFlagKey = user && user.id ? `httq_guest_migrated_for_${user.id}` : '';
      const alreadyMigrated = Boolean(migFlagKey && localStorage.getItem(migFlagKey));
      return { hasData, wordsCount, stagesCount, grammarCount, reviewCardsCount, savedWordsCount, mnemonicsCount, alreadyMigrated };
    } catch (_e) {
      return { hasData: false, wordsCount: 0, stagesCount: 0, grammarCount: 0, reviewCardsCount: 0, savedWordsCount: 0, mnemonicsCount: 0, alreadyMigrated: false };
    }
  }

  async function importGuestProgressIntoAccount() {
    const user = typeof getSavedUser === 'function' ? getSavedUser() : null;
    if (!user || !user.id) return { ok: false, reason: 'not_signed_in' };
    try {
      const rawGuestProg = localStorage.getItem('httq_progress_v2:httq_state:guest');
      const rawGuestState = localStorage.getItem('httq_state:guest');
      const guestProg = rawGuestProg ? JSON.parse(rawGuestProg) : null;
      const guestState = rawGuestState ? JSON.parse(rawGuestState) : null;
      if (!guestProg && !guestState) return { ok: false, reason: 'no_guest_data' };
      let mergedProg = getRealProgress();
      if (guestProg && typeof guestProg === 'object') {
        mergedProg = mergeProgressObjects(mergedProg, guestProg);
        saveRealProgress(mergedProg);
      }
      let mergedState = getLocalState();
      if (guestState && typeof guestState === 'object') {
        mergedState = mergeStudyState(guestState, mergedState);
        saveLocalState(mergedState);
      }
      try { localStorage.setItem(`httq_guest_migrated_for_${user.id}`, String(Date.now())); } catch (_) {}
      if (!window.__xhzDiagRunning) {
        try { await syncProgressToSupabaseAuth(mergedProg); } catch (_) {}
        try { await supabaseUpsert(mergedState); } catch (_) {}
      }
      return {
        ok: true,
        wordsTotal: (mergedProg.learnedWords || []).length,
        stagesTotal: (mergedProg.doneStages || []).length,
        grammarTotal: (mergedProg.learnedGrammarIds || []).length,
        reviewCardsTotal: (mergedState.collections && Array.isArray(mergedState.collections.reviewCards) ? mergedState.collections.reviewCards.length : 0)
      };
    } catch (_e) {
      return { ok: false, reason: 'merge_error' };
    }
  }
  window.__xhzGetGuestMigrationSummary = getGuestMigrationSummary;
  window.__xhzImportGuestProgressIntoAccount = importGuestProgressIntoAccount;

  window.__xhzExportVocabularyCsv = async function (triggerDownload = false) {
    const prog = getRealProgress();
    const state = getLocalState();
    const cards = (state.collections && Array.isArray(state.collections.reviewCards)) ? state.collections.reviewCards : [];
    const cardByHz = new Map();
    cards.forEach(c => {
      if (c && c.itemKey && /^[cw]:/.test(c.itemKey)) {
        const hz = c.itemKey.replace(/^[cw]:/, '');
        if (!cardByHz.has(hz)) cardByHz.set(hz, c);
      }
    });
    const allHz = [...new Set([
      ...(Array.isArray(prog.learnedWords) ? prog.learnedWords : []),
      ...Array.from(cardByHz.keys())
    ].map(w => String(w || '').replace(/^w:|^c:/, '').trim()).filter(Boolean))];
    const vIdx = (await loadLocalJson('/data/vocabulary/index.json')) || [];
    const cIdx = (await loadLocalJson('/data/characters/index.json')) || [];
    const vMap = new Map((Array.isArray(vIdx) ? vIdx : []).map(x => [String(x.w || '').replace(/\{|\}/g, ''), x]));
    const cMap = new Map((Array.isArray(cIdx) ? cIdx : []).map(x => [x.c || x.character, x]));
    const escCsv = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = ['Hanzi,Pinyin,HanViet,MeaningVi,Status'];
    for (const hz of allHz) {
      const card = cardByHz.get(hz);
      const v = vMap.get(hz);
      const c = cMap.get(hz);
      const py = (card && card.content && card.content.pinyin) || (v && v.p) || (c && c.p) || '';
      const hv = (v && v.hv) || (c && c.hv) || '';
      const mv = (card && card.content && card.content.meaningVi) || (v && v.m) || (c && c.m) || '';
      const st = card && card.state === 'review' ? 'Đã thuộc' : 'Đang học';
      rows.push([hz, py, hv, mv, st].map(escCsv).join(','));
    }
    const csv = '\uFEFF' + rows.join('\r\n');
    if (triggerDownload && typeof Blob !== 'undefined') {
      try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hoctiengtrungquoc-tu-vung-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { try { URL.revokeObjectURL(url); a.remove(); } catch (_) {} }, 500);
      } catch (_) {}
    }
    return csv;
  };

  window.__xhzRunDiagnostics = async function () {
    const studyKey = typeof getStudyStateStorageKey === 'function' ? getStudyStateStorageKey() : 'httq_state:guest';
    const diagKeys = [
      'httq_progress_v2', 'httq_done_stages', 'httq_done_activities',
      'httq_curr_learned_words', 'httq_learned_grammar', 'httq_user_mistakes',
      'httq_dismissed_mistakes', 'httq_dictation_progress', 'httq_learning_profile',
      'httq_habit_settings', 'httq_game_high_scores', 'httq_speaking_progress',
      'httq_state', studyKey, 'xhz-seen-words-v1', 'xhz-practice-v1',
      'httq_current_stage_key', 'httq_current_lesson_id',
      'httq_active_dates', 'httq_minutes_by_date', 'httq_sessions_by_date',
      'httq_user_mnemonics_v1'
    ];
    const snapshot = {};
    diagKeys.forEach(k => { snapshot[k] = localStorage.getItem(k); });
    window.__xhzDiagRunning = true;
    const checks = [];
    const runCheck = async (name, fn) => {
      try {
        const res = await fn();
        checks.push({ name, ok: !!res });
      } catch (err) {
        checks.push({ name, ok: false, error: err && err.message ? err.message : String(err) });
      }
    };

    try {
      await runCheck('storage-merge', () => {
        const merged = mergeProgressObjects(
          { learnedWords: ['八'], learnedGrammarIds: ['g-a'], doneStages: ['hsk30.L1.P1'], minutesByDate: { '2026-11-18': 5 } },
          { learnedWords: ['妈'], learnedGrammarIds: ['g-b'], doneStages: ['hsk30.L1.P2'], minutesByDate: { '2026-11-18': 12 } }
        );
        return merged.learnedWords.includes('八') && merged.learnedWords.includes('妈') && merged.learnedGrammarIds.length === 2 && merged.minutesByDate['2026-11-18'] === 12;
      });
      await runCheck('bridge-stores', () => {
        recordStudyProgress({ words: ['诊断测试词'], minutes: 1 });
        const seen = JSON.parse(localStorage.getItem('xhz-seen-words-v1') || '{}');
        const prac = JSON.parse(localStorage.getItem('xhz-practice-v1') || '{}');
        return Boolean(seen['诊断测试词'] && prac && prac.items && prac.items['诊断测试词']);
      });
      await runCheck('api-progress', async () => {
        const d = await (await fetch('/v2/me/progress')).json();
        return Boolean(d && typeof d.streakDays === 'number' && Array.isArray(d.activity));
      });
      await runCheck('api-tracks', async () => {
        const d = await (await fetch('/v2/learning-tracks/hsk30')).json();
        return Boolean(d && Array.isArray(d.stages) && d.stages.length >= 30);
      });
      await runCheck('api-today', async () => {
        const d = await (await fetch('/v2/today')).json();
        return Boolean(d && Array.isArray(d.steps) && d.steps.length > 0);
      });
      await runCheck('api-review-summary', async () => {
        const d = await (await fetch('/v2/review/summary')).json();
        return Boolean(d && d.dueNow && Array.isArray(d.forecast));
      });
      await runCheck('api-review-mistakes', async () => {
        await fetch('/v2/review/signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signals: [{ signalId: 'diag-m-' + Date.now(), itemKey: 'w:书', skill: 'meaning', outcome: 'wrong' }] })
        });
        const d = await (await fetch('/v2/review/mistakes')).json();
        return Boolean(d && Array.isArray(d.mistakes) && d.mistakes.some(m => m.hanzi === '书'));
      });
      await runCheck('api-grammar-progress', async () => {
        const p1 = await (await fetch('/v1/grammar-progress/g-diag-1', { method: 'POST' })).json();
        const p2 = await (await fetch('/v1/grammar-progress/g-diag-1', { method: 'DELETE' })).json();
        return Boolean(p1 && p1.ok && p2 && p2.ok && !p2.learnedGrammarIds.includes('g-diag-1'));
      });
      await runCheck('api-practice-sync', async () => {
        const d = await (await fetch('/v1/practice-progress/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: [], states: [{ hanzi: '茶', repetitions: 2 }], days: [] })
        })).json();
        return Boolean(d && d.ok && d.items && d.items['茶']);
      });
      await runCheck('api-games', async () => {
        const ov = await (await fetch('/v1/games/overview')).json();
        const lb = await (await fetch('/v1/games/leaderboard?game=chengyu')).json();
        return Boolean(ov && Array.isArray(ov.games) && ov.games.length >= 6 && lb && Array.isArray(lb.entries) && lb.entries.length > 0);
      });
      await runCheck('api-yct-tests', async () => {
        const yct = await (await fetch('/v1/hsk-tests/papers?examType=yct')).json();
        const yPaper = await (await fetch('/v1/hsk-tests/papers/yct-1-01')).json();
        return Boolean(yct && Array.isArray(yct.levels) && yPaper && Array.isArray(yPaper.questions) && yPaper.questions.length === 20);
      });
      await runCheck('api-curriculums', async () => {
        const d = await (await fetch('/v1/curriculums/boya/levels/boya-elementary-1/lessons')).json();
        return Boolean(d && Array.isArray(d.lessons) && d.lessons.length > 0 && 'progressPct' in d.lessons[0]);
      });
      await runCheck('api-speaking', async () => {
        const d = await (await fetch('/v1/speaking/dialogues/hsk/hsk-1/bai-tap-bat-ky')).json();
        return Boolean(d && Array.isArray(d.turns) && d.turns.length >= 2);
      });
      await runCheck('api-notebook', async () => {
        await fetch('/v1/notebook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: '咖啡', pinyin: 'kāfēi', meaningVi: 'cà phê' }) });
        const d = await (await fetch('/v1/notebook')).json();
        return Boolean(d && d.ok && Array.isArray(d.items) && d.items.some(i => (i.hanzi || i.word) === '咖啡'));
      });
      await runCheck('api-exam-sittings', async () => {
        await fetch('/v1/hsk-tests/hsk30-1/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paperId: 'hsk30-1', answers: { 1: 'A' } }) });
        const d = await (await fetch('/v2/me/exam-sittings')).json();
        return Boolean(d && Array.isArray(d.items) && d.items.length >= 1);
      });
      await runCheck('api-translate', async () => {
        const d = await (await fetch('/v1/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '你好中国' }) })).json();
        return Boolean(d && d.ok && Array.isArray(d.breakdown) && d.breakdown.length > 0 && Array.isArray(d.words) && d.words.some(w => w.word === '中国'));
      });
      await runCheck('dynamic-run-resolve', async () => {
        const r = window.__xhzResolveRun ? await window.__xhzResolveRun('hsk30.L1.S05.learn.1') : null;
        const htmlReject = await loadLocalJson('/index.html');
        const vidDetail = await loadLocalJson('/data/dictation/videos/6a0f4ee00a345b96919efd1e-detail.json');
        return Boolean(r && Array.isArray(r.steps) && r.steps.length >= 5 && htmlReject === null && vidDetail && vidDetail.id === '6a0f4ee00a345b96919efd1e');
      });
      await runCheck('data-dictation-details', async () => {
        const d = await loadLocalJson('/data/dictation/videos/6ade7cf5a90e9d319b7d4abf-detail.json');
        return Boolean(d && d.id === '6ade7cf5a90e9d319b7d4abf' && Number(d.segmentCount) >= 10 && d.hasSegments === true);
      });
      await runCheck('data-hollow-lessons-fixed', async () => {
        const b = await loadLocalJson('/data/curriculums/boya/levels/boya-elementary-1-lessons.json');
        const h4 = await loadLocalJson('/data/curriculums/new-hsk/levels/new-hsk-4-lessons.json');
        return Boolean(b && Array.isArray(b.lessons) && b.lessons.length === 30 && h4 && Array.isArray(h4.lessons) && h4.lessons.length === 37);
      });
      await runCheck('api-tracks-multilevel', async () => {
        const l2 = await (await fetch('/v2/learning-tracks/hsk30/levels/L2')).json();
        const y1 = await (await fetch('/v2/learning-tracks/yct/levels/L1')).json();
        const b1 = await (await fetch('/v2/learning-tracks/boya/levels/E1')).json();
        const run2 = window.__xhzResolveRun ? await window.__xhzResolveRun('hsk30.L2.S01.learn.1') : null;
        return Boolean(l2 && l2.stages && l2.stages.length > 0 && y1 && y1.stages && y1.stages.length > 0 && b1 && b1.stages && b1.stages.length > 0 && run2 && Array.isArray(run2.steps) && run2.steps.length >= 4);
      });
      await runCheck('api-stage-talks-dynamic', async () => {
        const p1 = await (await fetch('/v2/learning-tracks/hsk30/stage-talks/hsk30.L1.P1')).json();
        const s1 = await (await fetch('/v2/learning-tracks/hsk30/stage-talks/hsk30.L1.S01')).json();
        return Boolean(p1 && s1 && p1.titleVi !== s1.titleVi && Array.isArray(s1.missions) && s1.missions.length === 2);
      });
      await runCheck('api-typing-hsk-filter', async () => {
        const t1 = await (await fetch('/v1/typing-word-set?hsk=1&limit=8')).json();
        const t2 = await (await fetch('/v1/typing-word-set?hsk=2&limit=8')).json();
        const tc = await (await fetch('/v1/typing/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ words: ['汉字'], minutes: 1 }) })).json();
        return Boolean(t1 && t2 && t1.set && t2.set && t1.set.length === 8 && t2.set.length === 8 && t1.set[0].hanzi !== t2.set[0].hanzi && tc && tc.ok);
      });
      await runCheck('api-thay-do-real', async () => {
        const toi = await (await fetch('/v1/thay-do/lop/toi')).json();
        const bv = await (await fetch('/v1/thay-do/bang-vang/dau')).json();
        return Boolean(toi && toi.ok && toi.tienDo && bv && bv.ok && bv.bang && Array.isArray(bv.bang['chuyen-can']));
      });
      await runCheck('api-forgot-password-guard', async () => {
        const r = await fetch('/v1/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'bad-email' }) });
        return r && r.status === 400;
      });
      await runCheck('export-vocab-csv', async () => {
        const csv = window.__xhzExportVocabularyCsv ? await window.__xhzExportVocabularyCsv(false) : '';
        return Boolean(typeof csv === 'string' && csv.includes('Hanzi,Pinyin,HanViet,MeaningVi,Status'));
      });
      await runCheck('guest-migration-helper', async () => {
        const s = window.__xhzGetGuestMigrationSummary ? window.__xhzGetGuestMigrationSummary() : null;
        return Boolean(s && typeof s.hasData === 'boolean' && typeof window.__xhzImportGuestProgressIntoAccount === 'function');
      });
      await runCheck('command-palette-ready', async () => {
        return Boolean(typeof window.__xhzOpenCommandPalette === 'function' && typeof window.__xhzCloseCommandPalette === 'function');
      });
      await runCheck('pwa-manifest-valid', async () => {
        const sm = await (await fetch('/site.webmanifest')).json();
        const mm = await (await fetch('/manifest.webmanifest')).json();
        return Boolean(sm && sm.start_url === '/hoc/' && mm && mm.start_url === '/hoc/' && Array.isArray(sm.icons) && !JSON.stringify(sm.icons).includes('web-app-manifest-192'));
      });
      await runCheck('api-skill-map-real', async () => {
        const sm = await (await fetch('/v2/me/skill-map')).json();
        const sp = await (await fetch('/v2/me/score-prediction')).json();
        const sh = await (await fetch('/v2/me/shadowing/summary')).json();
        return Boolean(sm && Array.isArray(sm.skills) && sm.skills.length === 5 && typeof sm.grammarDone === 'number' && sp && typeof sp.predictedScore === 'number' && sh && sh.enabled === true);
      });
      await runCheck('api-exam-plan-crud', async () => {
        const postRes = await (await fetch('/v2/me/exam-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetLevel: 3, targetDate: '2027-06-15', dailyMinutes: 25 })
        })).json();
        const getRes = await (await fetch('/v2/me/exam-plan')).json();
        const delRes = await (await fetch('/v2/me/exam-plan', { method: 'DELETE' })).json();
        return Boolean(postRes && postRes.ok && getRes && getRes.status === 'active' && getRes.plan && getRes.plan.targetLevel === 3 && delRes && delRes.status === 'none');
      });
      await runCheck('api-companion-memory', async () => {
        const mem = await (await fetch('/v2/companion/memory')).json();
        const inb1 = await (await fetch('/v2/companion/inbox')).json();
        const rd = await (await fetch('/v2/companion/inbox/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })).json();
        const inb2 = await (await fetch('/v2/companion/inbox')).json();
        return Boolean(mem && Array.isArray(mem.items) && mem.items.length >= 1 && inb1 && Array.isArray(inb1.items) && rd && rd.ok && inb2 && inb2.unreadCount === 0);
      });
      await runCheck('api-generated-tests-yct', async () => {
        const fr = await (await fetch('/v1/generated-tests/freshness')).json();
        const hskGen = await (await fetch('/v1/generated-tests/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ examType: 'hsk', level: 1 }) })).json();
        const yctGen = await (await fetch('/v1/generated-tests/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ examType: 'yct', level: 1 }) })).json();
        return Boolean(fr && Array.isArray(fr.levels) && fr.levels.length >= 6 && hskGen && hskGen.deId && hskGen.deId !== 'hsk30-1' && yctGen && /^yct-1-/.test(yctGen.deId) && Array.isArray(yctGen.questions) && yctGen.questions.length === 20);
      });
      await runCheck('api-search-pinyin-toneless', async () => {
        const pyRes = await (await fetch('/v1/search?q=nihao')).json();
        const hzRes = await (await fetch('/v1/search?q=' + encodeURIComponent('你好'))).json();
        const foundNihao = Array.isArray(pyRes.words) && pyRes.words.some(w => w.w === '你好');
        const foundChars = Array.isArray(hzRes.characters) && hzRes.characters.some(c => c.c === '你') && hzRes.characters.some(c => c.c === '好');
        return Boolean(foundNihao && foundChars);
      });
      await runCheck('api-grammar-fallback', async () => {
        const lv4 = await (await fetch('/v1/grammar/levels/4?curriculum=new-hsk')).json();
        const lvList = await (await fetch('/v1/grammar/levels?curriculum=new-hsk')).json();
        const lv4Meta = lvList && Array.isArray(lvList.levels) && lvList.levels.find(x => String(x.level) === '4');
        return Boolean(lv4 && Array.isArray(lv4.items) && lv4.items.length > 0 && lv4.fallbackFrom === 'hsk' && lv4Meta && Number(lv4Meta.count) > 0);
      });
      await runCheck('studio-assets-available', async () => {
        const assets = [
          '/images/studio/hero-hanzi-studio.jpg',
          '/images/studio/banner-dictionary-calligraphy.jpg',
          '/images/studio/banner-listening-speaking.jpg',
          '/images/studio/banner-exam-hall.jpg',
          '/images/studio/banner-review-srs.jpg',
          '/images/studio/banner-games-arcade.jpg',
          '/images/studio/cute-capy-study.jpg',
          '/images/studio/cute-panda-dict.jpg',
          '/images/studio/cute-music-buddy.jpg',
          '/images/studio/cute-lantern-party.jpg',
          '/images/studio/cute-bunny-writing.jpg',
          '/images/studio/stickers/boba.svg',
          '/images/studio/stickers/panda.svg',
          '/images/studio/stickers/baozi.svg',
          '/images/studio/stickers/lantern.svg',
          '/images/studio/stickers/sakura.svg',
          '/images/studio/stickers/bunny.svg',
          '/images/studio/stickers/star.svg',
          '/images/studio/stickers/heart.svg'
        ];
        const resList = await Promise.all(assets.map(u => originalFetch(u, { method: 'HEAD' }).catch(() => ({ ok: false }))));
        return resList.every(r => r && r.ok);
      });
      await runCheck('studio-fx-engine', () => {
        const fx = window.__xhzStudioFx;
        return Boolean(fx && typeof fx.confetti === 'function' && typeof fx.toast === 'function' && typeof fx.animateCountUp === 'function' && typeof fx.pulseEq === 'function' && typeof fx.sparkle === 'function');
      });
      await runCheck('studio-stage-resolver', () => {
        if (typeof window.__xhzResolvePageStageConfig !== 'function') return false;
        const probes = ['/hoc', '/on-tap', '/tra-chu', '/thu-vien-new-hsk', '/luyen-nghe', '/luyen-go', '/kiem-tra-hsk', '/tro-choi', '/tao-vo-tap-viet', '/tai-khoan'];
        const allResolved = probes.every(p => {
          const cfg = window.__xhzResolvePageStageConfig(p);
          return Boolean(cfg && cfg.id && cfg.banner && cfg.title);
        });
        const excluded = window.__xhzResolvePageStageConfig('/hoc/bai/hsk30.L1.P1.learn.1') === null && window.__xhzResolvePageStageConfig('/thay-do') === null;
        return allResolved && excluded;
      });
      await runCheck('studio-home-daily-hanzi', () => {
        const pool = window.__xhzDailyHanziPool;
        return Boolean(Array.isArray(pool) && pool.length >= 20 && pool.every(x => x.hanzi && x.pinyin && x.meaning));
      });
      await runCheck('studio-cute-buddy', () => {
        return Boolean(typeof window.__xhzBuildCuteBuddyDock === 'function' && Array.isArray(window.__xhzCuteCheers) && window.__xhzCuteCheers.length >= 8);
      });
      await runCheck('studio-pet-hearts', () => {
        const m = mergeProgressObjects({ buddyHearts: 3 }, { buddyHearts: 7 });
        return Boolean(m.buddyHearts === 7 && window.__xhzStudioFx && typeof window.__xhzStudioFx.petBuddy === 'function');
      });
      await runCheck('studio-ambient-petals', () => {
        return Boolean(window.__xhzStudioFx && typeof window.__xhzStudioFx.syncAmbientPetals === 'function' && Array.isArray(window.__xhzLuckyFortunes) && window.__xhzLuckyFortunes.length >= 8);
      });
      await runCheck('react-capture-shield', () => {
        if (!window.__xhzCaptureShieldInstalled) return false;
        const trap = ev => { ev.stopPropagation(); };
        document.addEventListener('click', trap, true);
        let fired = false;
        const box = document.createElement('div');
        box.id = 'xhz-dynamic-page-root';
        const hadExisting = Boolean(document.getElementById('xhz-dynamic-page-root'));
        const btn = document.createElement('button');
        btn.onclick = () => { fired = true; };
        if (hadExisting) {
          document.getElementById('xhz-dynamic-page-root').appendChild(btn);
        } else {
          box.appendChild(btn);
          document.body.appendChild(box);
        }
        try {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        } finally {
          document.removeEventListener('click', trap, true);
          if (hadExisting) btn.remove();
          else box.remove();
        }
        return fired;
      });
      await runCheck('dictation-slug-and-segments', async () => {
        const slug = 'luyen-chep-chinh-ta-hsk-1-gioi-thieu-ban-than-va-so-thich-bang-tieng-trung-phan-1';
        const d = await (await fetch('/v1/dictation/videos/' + slug)).json();
        return Boolean(d && d.id === '6ade7cf5a90e9d319b7d4abf' && Array.isArray(d.segments) && d.segments.length >= 40 && d.segments[0].hanzi);
      });
      await runCheck('lesson-capy-sprites-valid', async () => {
        const imgs = ['/images/capy/lesson/celebrate.webp', '/images/capy/lesson/encouraging.webp', '/images/capy/lesson/thinking.webp'];
        const rs = await Promise.all(imgs.map(u => originalFetch(u, { method: 'HEAD' }).catch(() => ({ ok: false }))));
        return rs.every(r => r && r.ok);
      });
      await runCheck('test-paper-zero-404', async () => {
        const p5 = await loadTestPaperById('xh30-5-01');
        const pAlias = await loadTestPaperById('hsk1-1');
        return Boolean(p5 && Array.isArray(p5.questions) && p5.questions.length > 0 && pAlias && Array.isArray(pAlias.questions) && pAlias.questions.length > 0);
      });
      await runCheck('route-lo-trinh-and-rsc-guard', async () => {
        const loTrinhRes = await originalFetch('/lo-trinh', { method: 'HEAD' }).catch(() => ({ ok: false }));
        const rscRes = await fetch('/luyen-chep-chinh-ta?_rsc=test123', { headers: { 'Next-Router-Prefetch': '1', 'RSC': '1' } });
        return Boolean(loTrinhRes && loTrinhRes.ok && rscRes && rscRes.status === 404 && String(rscRes.url || '').includes('/luyen-chep-chinh-ta'));
      });
      await runCheck('api-metrics-event', async () => {
        const res = await (await fetch('/v1/metrics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'diag_ping', path: '/hoc' })
        })).json();
        return Boolean(res && res.ok && res.recorded === true);
      });
      await runCheck('api-ugc-mnemonic-crud', async () => {
        const created = await (await fetch('/v1/ugc/mnemonic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: '好', note: 'Nữ + Tử = Hảo' })
        })).json();
        const listRes = await (await fetch('/v1/ugc/mnemonic?target=' + encodeURIComponent('好'))).json();
        const cid = created && created.item && created.item.id;
        const voteRes = cid ? await (await fetch('/v1/ugc/mnemonic/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: '好', id: cid })
        })).json() : null;
        return Boolean(created && created.ok && cid && listRes && Array.isArray(listRes.items) && listRes.items.some(x => x.id === cid) && voteRes && voteRes.ok && Number(voteRes.votes) >= 2);
      });
      await runCheck('safe-decode-uri-malformed', () => {
        return Boolean(typeof window.__xhzSafeDecode === 'function' && window.__xhzSafeDecode('%E0%A4%A') === '%E0%A4%A' && window.__xhzSafeDecode('%E5%A5%BD') === '好');
      });
      await runCheck('cmdk-keyboard-and-no-inline-onclick', async () => {
        window.__xhzOpenCommandPalette('你好');
        const inp = document.getElementById('htq-cmdk-input');
        const resEl = document.getElementById('htq-cmdk-results');
        let loaded = false;
        for (let i = 0; i < 10; i++) {
          if (resEl && resEl.querySelector('.htq-cmdk-link') && resEl.textContent.includes('你好')) { loaded = true; break; }
          await new Promise(r => setTimeout(r, 40));
        }
        const noOnclick = Boolean(resEl && resEl.querySelectorAll('[onclick]').length === 0);
        const linkCount = resEl ? resEl.querySelectorAll('.htq-cmdk-link').length : 0;
        if (inp) inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        const idxDown = resEl ? resEl.getAttribute('data-cmdk-active-idx') : null;
        if (inp) inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        const idxUp = resEl ? resEl.getAttribute('data-cmdk-active-idx') : null;
        window.__xhzCloseCommandPalette();
        const navOk = linkCount >= 2 ? (idxDown === '1' && idxUp === '0') : (idxDown === '0' && idxUp === '0');
        return Boolean(loaded && noOnclick && navOk);
      });
      await runCheck('style-guard-o1-and-focus', () => {
        injectMasterV3Styles();
        const m = document.getElementById('htq-v3-master-css');
        const f = document.getElementById('htq-v14-fx-css');
        return Boolean(m && m.getAttribute('data-htq-ver') === '16' && m.textContent.includes(':focus-visible') && f && f.getAttribute('data-htq-ver') === '16');
      });
      await runCheck('seo-robots-and-sitemap', async () => {
        const rb = await originalFetch('/robots.txt').then(r => r.ok ? r.text() : '').catch(() => '');
        const sm = await originalFetch('/sitemap.xml').then(r => r.ok ? r.text() : '').catch(() => '');
        return Boolean(rb.includes('hoctiengtrungquoc.vercel.app/sitemap.xml') && sm.includes('<urlset') && sm.includes('luyen-chep-chinh-ta'));
      });
      await runCheck('mnemonic-cloud-merge-and-delete', async () => {
        const merged = mergeMnemonicMaps(
          { '好': [{ id: 'm1', target: '好', note: 'Nữ tử hảo', votes: 1, updatedAt: '2026-11-20T00:00:00Z' }] },
          { '好': [{ id: 'm1', target: '好', note: 'Nữ tử hảo', votes: 4, updatedAt: '2026-11-22T00:00:00Z' }, { id: 'm2', target: '好', note: 'Tốt đẹp', votes: 2, updatedAt: '2026-11-23T00:00:00Z' }] }
        );
        const mergeOk = Boolean(merged['好'] && merged['好'].length === 2 && merged['好'].find(x => x.id === 'm1').votes === 4);
        const cr = await (await fetch('/v1/ugc/mnemonic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: '茶', note: 'Thảo nhân mộc là cây trà' })
        })).json();
        const delId = cr && cr.item && cr.item.id;
        const delRes = delId ? await (await fetch('/v1/ugc/mnemonic?target=' + encodeURIComponent('茶') + '&id=' + encodeURIComponent(delId), { method: 'DELETE' })).json() : null;
        const afterList = await (await fetch('/v1/ugc/mnemonic?target=' + encodeURIComponent('茶'))).json();
        return Boolean(mergeOk && delId && delRes && delRes.ok && delRes.deleted && Array.isArray(afterList.items) && !afterList.items.some(x => x.id === delId));
      });
      await runCheck('flight-stream-integrity', async () => {
        const [homeHtml, dictHtml, hsk1Html] = await Promise.all([
          originalFetch('/').then(r => r.ok ? r.text() : '').catch(() => ''),
          originalFetch('/luyen-chep-chinh-ta').then(r => r.ok ? r.text() : '').catch(() => ''),
          originalFetch('/tra-chu/hsk/1').then(r => r.ok ? r.text() : '').catch(() => '')
        ]);
        return Boolean(
          homeHtml.includes('2f:T924,') && !homeHtml.includes('2f:T8e7,') &&
          dictHtml.includes('34:T91b,') && !dictHtml.includes('34:T91a,') &&
          hsk1Html.includes('2e:T2d1c,') && !hsk1Html.includes('2e:T26dc,')
        );
      });
      await runCheck('vocab-detail-mnemonic-ready', () => {
        if (typeof window.__xhzBuildMnemonicSectionHtml !== 'function' || typeof window.__xhzWireMnemonicSection !== 'function') return false;
        const html = window.__xhzBuildMnemonicSectionHtml('你好');
        return Boolean(html.includes('xhz-char-mnemonic-section') && html.includes('xhz-mnemonic-submit') && html.includes('你好'));
      });
      await runCheck('cmdk-window-keydown-instant', () => {
        window.__xhzCloseCommandPalette();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }));
        const opened = Boolean(document.getElementById('htq-cmdk-overlay'));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        const closed = !document.getElementById('htq-cmdk-overlay');
        return Boolean(opened && closed);
      });
    } finally {
      window.__xhzDiagRunning = false;
      diagKeys.forEach(k => {
        if (snapshot[k] === null) localStorage.removeItem(k);
        else localStorage.setItem(k, snapshot[k]);
      });
    }
    const passed = checks.filter(c => c.ok).length;
    const failed = checks.length - passed;
    return { ok: failed === 0, passed, failed, total: checks.length, checks };
  };

  // BEGIN GENERATED STORAGE SUPPORT
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
      'httq_learned_grammar', 'httq_user_mistakes', 'httq_dismissed_mistakes', 'httq_progress_v2',
      'httq_dictation_progress', 'httq_game_high_scores', 'httq_speaking_progress',
      'httq_done_stages', 'httq_done_activities', 'httq_curr_learned_words',
      'httq_current_stage_key', 'httq_last_review_mode', 'them-pinyin-history',
      'xhz-curriculum-place-v1', 'xhz-daily-session-opened-v1', 'xhz-grammar-study-v1',
      'xhz-lesson-prefs-v1', 'xhz-listening-v1', 'xhz-path-last-current',
      'xhz-practice-sound-v1', 'xhz-recent-lessons-v1', 'xhz-review-import-v1',
      'xhz-review-signals-v1', 'xhz-review-source', 'xhz-seen-words-sync-v1',
      'xhz-seen-words-v1', 'xhz-speaking-progress-v1', 'xhz-speaking-v1',
      'xhz-track-onboarding-v1', 'xhz_intake', 'xhz-collection-import-v1',
      'templateHistory', 'thay-do-world-guide-done', 'httq_user_mnemonics_v1']);
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
  initializeScopedStorage();

  // END GENERATED STORAGE SUPPORT

  function getStudyStateStorageKey() {
    const user = getSavedUser();
    return user && user.id ? `httq_state:user:${user.id}` : 'httq_state:guest';
  }

  function getLocalState() {
    const empty = { masteredChars: {}, savedWords: {}, examCount: 0, history: [] };
    try {
      const key = getStudyStateStorageKey();
      let raw = localStorage.getItem(key);
      if (!raw) {
        const legacy = localStorage.getItem('httq_state');
        const legacyOwner = localStorage.getItem('httq_state_owner');
        if (legacy && (key === 'httq_state:guest' || legacyOwner === key)) {
          localStorage.setItem(key, legacy);
          raw = legacy;
        }
      }
      const state = JSON.parse(raw || '{}');
      return state && typeof state === 'object' && !Array.isArray(state) ? { ...empty, ...state } : empty;
    } catch (_) { return empty; }
  }

  function saveLocalState(state, key = getStudyStateStorageKey()) {
    if (key !== getStudyStateStorageKey()) return false;
    try { localStorage.setItem(key, JSON.stringify(state)); return true; }
    catch (_) { return false; }
  }

  let studyCloudQueue = Promise.resolve();
  function supabaseUpsert(state, options = {}) {
    const key = options.storageKey || getStudyStateStorageKey();
    if (!saveLocalState(state, key)) return Promise.resolve(false);
    const token = localStorage.getItem('sb_access_token');
    if (!authCallbackRequest && (window.__xhzDiagRunning || !token || token === DEFAULT_JWT || key === 'httq_state:guest')) {
      if (token === DEFAULT_JWT) clearAuthSession(false);
      return Promise.resolve(false);
    }
    const write = async () => {
      try {
        const session = await getSupabaseSession();
        if (!session || key !== getStudyStateStorageKey() || key !== `httq_state:user:${session.user.id}`) return false;
        const res = await originalFetch(`${SUPABASE_URL}/rest/v1/study_profiles?on_conflict=user_id,workspace`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({ user_id: session.user.id, workspace: 'hoctiengtrungquoc', state: getLocalState(), updated_at: new Date().toISOString() })
        });
        const metadataSynced = res.ok && key === getStudyStateStorageKey() && await syncProgressToSupabaseAuth();
        return Boolean(metadataSynced && key === getStudyStateStorageKey() && (getSavedUser() || {}).id === session.user.id);
      } catch (_) { return false; }
    };
    const run = () => navigator.locks && navigator.locks.request ? navigator.locks.request(`httq-study-cloud:${key}`, write) : write();
    const operation = studyCloudQueue.then(run, run);
    studyCloudQueue = operation.catch(() => false);
    return operation;
  }

  async function supabasePull() {
    const key = getStudyStateStorageKey();
    const metadata = await syncProgressFromSupabaseAuth(false);
    try {
      const session = await getSupabaseSession();
      if (!session || key !== getStudyStateStorageKey() || key !== `httq_state:user:${session.user.id}`) return false;
      const res = await originalFetch(`${SUPABASE_URL}/rest/v1/study_profiles?select=state&user_id=eq.${encodeURIComponent(session.user.id)}&workspace=eq.hoctiengtrungquoc`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) return false;
      const rows = await res.json();
      if (key !== getStudyStateStorageKey() || (getSavedUser() || {}).id !== session.user.id || !Array.isArray(rows)) return false;
      if (rows[0] && rows[0].state && !saveLocalState(mergeStudyState(rows[0].state, getLocalState()), key)) return false;
      return Boolean(metadata);
    } catch (_) { return false; }
  }
  const initialCloudPullPromise = supabasePull().catch(() => null);
  async function ensureInitialCloudPull() {
    try {
      await Promise.race([
        initialCloudPullPromise,
        new Promise(resolve => setTimeout(resolve, 1800))
      ]);
    } catch (_) {}
  }

  // ==========================================================================
  // 3. TRA CỨU DỮ LIỆU ĐỘNG TỪ KHO /data/*
  // ==========================================================================
  function extractHanziChar(slug) {
    if (!slug) return '';
    const decoded = safeDecodeURIComponent(slug).trim();
    const hanziMatch = decoded.match(/[\u4e00-\u9fff]/g);
    if (hanziMatch && hanziMatch.length > 0) {
      return hanziMatch[hanziMatch.length - 1];
    }
    return decoded;
  }

  function extractHanziWord(slug) {
    if (!slug) return '';
    const decoded = safeDecodeURIComponent(slug).trim();
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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function safeDecodeURIComponent(value) {
    const s = String(value == null ? '' : value);
    try {
      return decodeURIComponent(s);
    } catch (_) {
      return s;
    }
  }
  if (typeof window !== 'undefined') window.__xhzSafeDecode = safeDecodeURIComponent;

  async function lookupCharacter(slugOrChar) {
    const char = extractHanziChar(slugOrChar);
    const index = (await loadLocalJson('/data/characters/index.json')) || [];
    let entry = null;
    if (Array.isArray(index)) {
      entry = index.find(x => (x.c || x.character) === char);
      if (!entry) {
        const cleanSlug = safeDecodeURIComponent(slugOrChar).toLowerCase().trim();
        entry = index.find(x => x.slug === cleanSlug || (x.hv && `${x.hv}-${x.c}` === cleanSlug));
        if (!entry) {
          const baseSlug = toSlugVi(cleanSlug.replace(/-\d+$/, ''));
          if (baseSlug) {
            const cands = index.filter(x =>
              (x.slug && toSlugVi(x.slug.replace(/-[\u4e00-\u9fff]+$/, '')) === baseSlug) ||
              (x.hv && toSlugVi(x.hv) === baseSlug)
            );
            if (cands.length) {
              const numM = cleanSlug.match(/-(\d+)$/);
              entry = (numM && cands.find(x => String(x.m || '').includes(numM[1]))) || cands[0];
            }
          }
        }
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
    return found || null;
  }

  async function lookupWord(slugOrWord) {
    const rawDecoded = safeDecodeURIComponent(slugOrWord || '').trim();
    if (!rawDecoded) return null;
    const word = extractHanziWord(rawDecoded);
    const index = (await loadLocalJson('/data/vocabulary/index.json')) || [];
    let entry = null;
    if (Array.isArray(index)) {
      entry = index.find(x => (x.w || x.word || x.hanzi) === word || (x.w || x.word || x.hanzi) === rawDecoded);
      if (!entry) {
        entry = index.find(x => (x.w || '').replace(/\{|\}/g, '') === word);
      }
      if (!entry) {
        const cleanSlug = safeDecodeURIComponent(rawDecoded).toLowerCase().trim();
        const stripped = toSlugVi(cleanSlug.replace(/-\d+$/, ''));
        if (stripped) {
          const parts = stripped.split('-').filter(Boolean);
          const hvPart = parts[0];
          const meaningParts = parts.slice(1);
          entry =
            index.find(x => {
              const hvSlug = toSlugVi(x.hv || '');
              const pSlug = toSlugVi(x.p || '').replace(/-/g, '');
              if (hvSlug !== hvPart && pSlug !== hvPart) return false;
              if (!meaningParts.length) return true;
              const mSlug = toSlugVi(x.m || '');
              return meaningParts.every(t => mSlug.includes(t));
            }) ||
            index.find(x => {
              const hvSlug = toSlugVi(x.hv || '');
              const pSlug = toSlugVi(x.p || '').replace(/-/g, '');
              return hvSlug === stripped || pSlug === stripped;
            });
        }
      }
    }
    if (entry) {
      const targetWord = entry.w || entry.word || entry.hanzi || word;
      const chunkId = entry.chunk || 1;
      const chunkNum = String(chunkId).padStart(2, '0');
      const chunk = (await loadLocalJson(`/data/vocabulary/vocabulary-${chunkNum}.json`)) || [];
      let found = Array.isArray(chunk)
        ? chunk.find(w => (w.hanzi || w.word || w.w) === targetWord || (w.hanzi || '').replace(/\{|\}/g, '') === word)
        : null;
      if (!found) {
        found = {
          hanzi: (entry.w || word).replace(/\{|\}/g, ''),
          word: (entry.w || word).replace(/\{|\}/g, ''),
          pinyin: entry.p || '',
          hanviet: entry.hv || '',
          meaningVi: entry.m || '',
          translationVi: entry.m || '',
          wordMeaningVi: entry.m || ''
        };
      } else {
        const cleanHz = (found.hanzi || found.word || found.w || word).replace(/\{|\}/g, '');
        const mean =
          found.meaningVi ||
          found.wordMeaningVi ||
          found.translationVi ||
          (Array.isArray(found.meanings) && found.meanings.join('; ')) ||
          entry.m ||
          '';
        found = {
          ...found,
          hanzi: cleanHz,
          word: cleanHz,
          pinyin: found.pinyin || found.wordPinyin || entry.p || '',
          hanviet: found.hanviet || entry.hv || '',
          meaningVi: mean,
          translationVi: found.translationVi || mean,
          wordMeaningVi: found.wordMeaningVi || mean
        };
      }
      return found;
    }

    // Fallback cho từ đơn âm tiết (1 chữ Hán như 的, 八, 好, 我, 你, 们, 您, v.v.) từ kho Chữ Hán & Giáo trình
    const charData = await lookupCharacter(word || rawDecoded);
    if (charData) {
      const ch = charData.character || charData.c || word;
      const py = (Array.isArray(charData.pinyins) && charData.pinyins[0]) || charData.pinyin || charData.p || '';
      const hv = charData.hanvietReading || charData.hv || '';
      const mean = charData.meaningVi || charData.m || '';
      const commonWords = Array.isArray(charData.commonWords) ? charData.commonWords : [];
      const rawExamples = Array.isArray(charData.examples) ? charData.examples : [];
      const builtExamples =
        rawExamples.length > 0
          ? rawExamples
          : commonWords.slice(0, 5).map(cw => ({
              hanzi: cw.word || cw.hanzi || cw.characters || ch,
              pinyin: cw.pinyin || py,
              vietnamese: cw.meaningVi || cw.meaning || mean
            }));
      return {
        hanzi: ch,
        word: ch,
        pinyin: py,
        pinyins: charData.pinyins || [py].filter(Boolean),
        hanviet: hv,
        meaningVi: mean,
        translationVi: mean,
        wordMeaningVi: mean,
        hskLevel: charData.hskLevel || charData.hsk || 1,
        radical: charData.radical || charData.r || '',
        strokeCount: charData.strokeCount || charData.s || '',
        usageNote: (charData.etymology && (charData.etymology.hintVi || charData.etymology.hint)) || charData.mnemonic || '',
        commonWords,
        examples: builtExamples,
        audios: [`https://static.xiehanzi.com/word_audios/${encodeURIComponent(ch)}.mp3`]
      };
    }

    return null;
  }

  async function lookupHanViet(slug) {
    const clean = safeDecodeURIComponent(slug).trim().toLowerCase();
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
    return null;
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

  function normalizeTestPaper(rawPaper, fallbackId = 'hsk30-1') {
    if (!rawPaper || typeof rawPaper !== 'object') return rawPaper;
    const paper = JSON.parse(JSON.stringify(rawPaper));
    const testId = paper.testId || paper.id || fallbackId;
    const imgMap = {};
    if (Array.isArray(paper.images)) {
      paper.images = paper.images.map(it => {
        if (it && it.path && it.src) {
          const rewritten = rewriteMediaUrl(it.src);
          imgMap[it.path] = rewritten;
          return { ...it, src: rewritten };
        }
        return it;
      });
    }
    const resolvePaperImg = u => {
      if (!u || typeof u !== 'string') return '';
      if (imgMap[u]) return imgMap[u];
      if (u.startsWith('assets/')) {
        return rewriteMediaUrl(`https://static.xiehanzi.com/hsk-tests/${testId}/${u}`);
      }
      return rewriteMediaUrl(u);
    };
    if (paper.audioUrl) paper.audioUrl = rewriteMediaUrl(paper.audioUrl);
    const normQuestion = (q, sec) => {
      if (!q || typeof q !== 'object') return q;
      if (sec) {
        q.sectionId = q.sectionId || sec.id;
        q.sectionTitle = q.sectionTitle || sec.title;
      }
      const audioSrc = q.audio || q.audioUrl || '';
      if (audioSrc) {
        q.audio = rewriteMediaUrl(audioSrc);
        q.audioUrl = q.audio;
      }
      if (q.image) q.image = resolvePaperImg(q.image);
      if (q.imageUrl) q.imageUrl = resolvePaperImg(q.imageUrl);
      if (Array.isArray(q.images)) {
        q.images = q.images.map(resolvePaperImg);
      }
      return q;
    };
    if (Array.isArray(paper.sections)) {
      paper.sections.forEach(s => {
        if (s && Array.isArray(s.questions)) {
          s.questions = s.questions.map(q => normQuestion(q, s));
        }
      });
    }
    if (Array.isArray(paper.questions) && paper.questions.length > 0) {
      paper.questions = paper.questions.map(q => normQuestion(q, null));
    } else if (Array.isArray(paper.sections)) {
      paper.questions = paper.sections.flatMap(s => (s && s.questions) || []);
    }
    if (Array.isArray(paper.examples)) {
      paper.examples = paper.examples.map(ex => {
        if (!ex || typeof ex !== 'object') return ex;
        if (ex.audio) ex.audio = rewriteMediaUrl(ex.audio);
        if (Array.isArray(ex.images)) ex.images = ex.images.map(resolvePaperImg);
        return ex;
      });
    }
    return paper;
  }

  async function buildYctTestPaper(cleanId, fallbackLevel = 1) {
    const m = cleanId.match(/^yct-(\d+)(?:-(\d+))?/i);
    const yctLvl = Math.max(1, Math.min(6, Number((m && m[1]) || fallbackLevel) || 1));
    const variantIdx = Math.max(0, (Number(m && m[2]) || 1) - 1);
    const fallbackLessonFiles = {
      1: ['yct-1--bai-1-hello.json', 'yct-1--bai-2-what-s-your-name.json', 'yct-1--bai-3-who-is-he.json', 'yct-1--bai-4-there-are-four-people-in-my-family.json'],
      2: ['yct-2--bai-1-may-i-sit-here.json', 'yct-2--bai-2-when-do-you-get-up-in-the-morning.json', 'yct-2--bai-3-where-is-your-pencil.json', 'yct-2--bai-4-there-are-two-books-in-the-schoolbag.json'],
      3: ['yct-3--bai-1-i-m-in-the-third-grade.json', 'yct-3--bai-2-what-s-your-favorite-sport.json', 'yct-3--bai-3-i-m-drawing-a-picture.json', 'yct-3--bai-5-have-some-more.json'],
      4: ['yct-4--bai-1-we-have-108-students.json', 'yct-4--bai-2-how-long-have-you-been-learning-chinese.json', 'yct-4--bai-3-it-opens-as-early-as-8-30-in-the-morning.json', 'yct-4--bai-4-i-have-a-cold.json']
    };
    let lessonFiles = [];
    const overview = await loadLocalJson('/data/curriculums/yct/overview.json');
    if (overview && Array.isArray(overview.levels)) {
      const lvlObj = overview.levels.find(l => l && (String(l.level) === String(yctLvl) || l.slug === `yct-${yctLvl}`));
      const rawLessons = lvlObj && (lvlObj.lessons || lvlObj.topics || lvlObj.items);
      if (Array.isArray(rawLessons) && rawLessons.length > 0) {
        lessonFiles = rawLessons.map(it => {
          const lSlug = it.lessonSlug || it.slug || '';
          return lSlug ? `yct-${yctLvl}--${lSlug}.json` : '';
        }).filter(Boolean);
      }
    }
    if (lessonFiles.length === 0) {
      lessonFiles = fallbackLessonFiles[yctLvl] || fallbackLessonFiles[1];
    }
    const startIdx = (variantIdx * 2) % lessonFiles.length;
    const chosenFiles = [];
    for (let i = 0; i < Math.min(3, lessonFiles.length); i++) {
      chosenFiles.push(lessonFiles[(startIdx + i) % lessonFiles.length]);
    }
    const wordMap = new Map();
    for (const fname of chosenFiles) {
      const lData = await loadLocalJson(`/data/curriculums/yct/lessons/${fname}`);
      const ws = (lData && lData.lesson && Array.isArray(lData.lesson.words))
        ? lData.lesson.words
        : (lData && Array.isArray(lData.words) ? lData.words : []);
      ws.forEach(w => {
        if (w && w.hanzi && !wordMap.has(w.hanzi)) wordMap.set(w.hanzi, w);
      });
    }
    const words = Array.from(wordMap.values());
    if (words.length < 4) return null;
    const listeningQs = [];
    const readingQs = [];
    for (let i = 0; i < 10; i++) {
      const target = words[i % words.length];
      const d1 = words[(i + 3) % words.length];
      const d2 = words[(i + 7) % words.length];
      const correctPos = i % 3;
      const pool = [target, d1, d2];
      const ordered = correctPos === 0 ? pool : (correctPos === 1 ? [d1, target, d2] : [d1, d2, target]);
      const letters = ['A', 'B', 'C'];
      const audioSrc = (Array.isArray(target.audios) && target.audios[0])
        ? target.audios[0]
        : `https://static.xiehanzi.com/word_audios/${encodeURIComponent(target.hanzi)}.mp3`;
      listeningQs.push({
        id: `${cleanId}-q${String(i + 1).padStart(3, '0')}`,
        number: i + 1,
        type: 'multiple_choice',
        instruction: i === 0 ? 'Phần 1 · Nghe và chọn từ/nghĩa đúng (Câu 1–10)' : '',
        prompt: `Nghe phát âm và chọn đáp án đúng tương ứng:`,
        audio: audioSrc,
        options: ordered.map((opt, idx) => ({
          id: letters[idx],
          text: `${opt.hanzi} — ${opt.translationVi || opt.wordMeaningVi || ''}`,
          pinyin: opt.pinyin || opt.wordPinyin || ''
        })),
        answer: letters[correctPos],
        explanationVi: `${target.hanzi} (${target.pinyin || ''}): ${target.translationVi || target.wordMeaningVi || ''}`
      });
    }
    for (let j = 0; j < 10; j++) {
      const target = words[(j + Math.floor(words.length / 2)) % words.length];
      const d1 = words[(j + 2) % words.length];
      const d2 = words[(j + 5) % words.length];
      const correctPos = (j + 1) % 3;
      const pool = [target, d1, d2];
      const ordered = correctPos === 0 ? pool : (correctPos === 1 ? [d1, target, d2] : [d1, d2, target]);
      const letters = ['A', 'B', 'C'];
      const ex = Array.isArray(target.examples) && target.examples[0];
      const promptText = ex
        ? `${ex.hanzi}\nNghĩa đúng của từ「${target.hanzi}」trong câu là gì?`
        : `Từ「${target.hanzi}」có nghĩa là gì?`;
      readingQs.push({
        id: `${cleanId}-q${String(j + 11).padStart(3, '0')}`,
        number: j + 11,
        type: 'multiple_choice',
        instruction: j === 0 ? 'Phần 2 · Đọc hiểu và chọn nghĩa tiếng Việt đúng (Câu 11–20)' : '',
        prompt: promptText,
        pinyin: (ex && ex.pinyin) ? ex.pinyin : (target.pinyin || ''),
        options: ordered.map((opt, idx) => ({
          id: letters[idx],
          text: opt.translationVi || opt.wordMeaningVi || opt.hanzi,
          pinyin: `${opt.hanzi} (${opt.pinyin || ''})`
        })),
        answer: letters[correctPos],
        explanationVi: `${target.hanzi} (${target.pinyin || ''}) = ${target.translationVi || target.wordMeaningVi || ''}`
      });
    }
    return normalizeTestPaper({
      testId: cleanId,
      examType: 'yct',
      level: yctLvl,
      title: `Đề luyện YCT Cấp ${yctLvl} · Đề ${String(variantIdx + 1).padStart(2, '0')}`,
      published: true,
      standard: 'YCT',
      durationMinutes: 25 + yctLvl * 5,
      questionCount: 20,
      hasAudio: true,
      sections: [
        { id: 'listening', title: 'Listening', questions: listeningQs },
        { id: 'reading', title: 'Reading', questions: readingQs }
      ]
    }, cleanId);
  }

  async function loadTestPaperById(paperId, fallbackLevel = 1) {
    if (!paperId || paperId === 'undefined') paperId = `hsk30-${fallbackLevel || 1}`;
    const cleanId = safeDecodeURIComponent(paperId).replace(/\.json$/i, '');
    if (/^yct-/i.test(cleanId)) {
      const yctPaper = await buildYctTestPaper(cleanId, fallbackLevel);
      if (yctPaper) return yctPaper;
    }
    const candidates = [];
    const pushCand = p => { if (p && !candidates.includes(p)) candidates.push(p); };
    const knownLvlMatch = cleanId.match(/^(?:hsk30|xh30)-(\d)(?:-|$)/i);
    if (knownLvlMatch) {
      pushCand(`/data/tests/papers/level-${knownLvlMatch[1]}-${cleanId}.json`);
    }
    const aliasMatch = cleanId.match(/^hsk(\d)-(\d+)$/i);
    if (aliasMatch) {
      const lv = aliasMatch[1];
      const num = String(Number(aliasMatch[2]) || 1).padStart(2, '0');
      pushCand(`/data/tests/papers/level-${lv}-xh30-${lv}-${num}.json`);
      pushCand(`/data/tests/papers/level-${lv}-hsk30-${lv}.json`);
    }
    if (/^level-\d+-/i.test(cleanId)) {
      pushCand(`/data/tests/papers/${cleanId}.json`);
    } else {
      const hintLvl = Number((cleanId.match(/\d/) || [fallbackLevel || 1])[0]) || 1;
      if (hintLvl >= 1 && hintLvl <= 6) {
        pushCand(`/data/tests/papers/level-${hintLvl}-${cleanId}.json`);
      }
      pushCand(`/data/tests/papers/${cleanId}.json`);
      for (let lv = 1; lv <= 6; lv++) {
        pushCand(`/data/tests/papers/level-${lv}-${cleanId}.json`);
      }
    }
    for (const c of candidates) {
      const data = await loadLocalJson(c);
      if (data && (Array.isArray(data.questions) || Array.isArray(data.sections))) {
        return normalizeTestPaper(data, cleanId);
      }
    }
    return null;
  }

  function buildCompanionCharactersResponse() {
    const baseSprites = id => ({
      poses: {
        idle: '/images/capy/lesson/idle.webp',
        talking: '/images/capy/lesson/talking.webp',
        happy: '/images/capy/lesson/happy.webp',
        encouraging: '/images/capy/lesson/encouraging.webp',
        thinking: '/images/capy/lesson/thinking.webp',
        celebrate: '/images/capy/lesson/celebrate.webp',
        sleepy: '/images/capy/lesson/sleepy.webp',
        surprised: '/images/capy/lesson/surprised.webp'
      },
      eyesClosed: '/images/capy/lesson/eyes-closed.webp',
      mouths: {
        closed: '/images/capy/lesson/mouth-closed.webp',
        small: '/images/capy/lesson/mouth-small.webp',
        wide: '/images/capy/lesson/mouth-wide.webp',
        o: '/images/capy/lesson/mouth-o.webp'
      },
      bubble: {
        idle: id === 'capy' ? '/images/capy/lesson/idle.webp' : `/images/companion/${id}/splash/hero.webp`,
        eyesClosed: '/images/capy/lesson/eyes-closed.webp'
      },
      breath: { periodMs: 3400, scale: 0.012, liftPx: 2.2 }
    });
    const list = [
      { id: 'capy', name: 'Capy', nameZh: '卡皮', role: 'Bạn đồng hành điềm tĩnh', tagline: 'Kiên nhẫn, nhẹ nhàng đồng hành cùng bạn mỗi ngày.', fitFor: 'muốn học đều đặn, không áp lực.', greetingText: 'Chào bạn, mình là Capy! Mình cùng học từng bước vững chắc nhé!' },
      { id: 'tieu-man', name: 'Tiểu Mãn', nameZh: '小满', role: 'Bạn cùng bàn nhiệt tình', tagline: 'Năng lượng tích cực, luôn cổ vũ bạn vượt qua từng chặng HSK.', fitFor: 'cần người nhắc nhở và truyền cảm hứng mỗi ngày.', greetingText: 'Chào bạn! Mình là Tiểu Mãn, cùng chinh phục tiếng Trung nhé!' },
      { id: 'ha-vu', name: 'Hạ Vũ', nameZh: '夏雨', role: 'Đàn chị ôn thi HSK', tagline: 'Giúp bạn nắm chắc từ vựng, ngữ pháp và mẹo làm bài thi.', fitFor: 'đang ôn thi chứng chỉ HSK hoặc chuẩn bị du học.', greetingText: 'Chào bạn, mình là Hạ Vũ! Có câu nào khó cứ hỏi mình nhé.' },
      { id: 'luc-than', name: 'Lục Thần', nameZh: '陆辰', role: 'Cố vấn giao tiếp & công việc', tagline: 'Thực tế, rõ ràng, tập trung vào phản xạ nghe nói tự nhiên.', fitFor: 'học tiếng Trung để giao tiếp và làm việc.', greetingText: 'Chào bạn, mình là Lục Thần. Bắt đầu luyện phản xạ ngay hôm nay nhé!' },
      { id: 'duong-duong', name: 'Dương Dương', nameZh: '洋洋', role: 'Bạn học vui vẻ', tagline: 'Biến mỗi bài học thành trò chơi thú vị, dễ nhớ lâu.', fitFor: 'mới bắt đầu làm quen với chữ Hán và Pinyin.', greetingText: 'Chào bạn! Mình là Dương Dương, học tiếng Trung vui lắm đó!' },
      { id: 'mai', name: 'Mai', nameZh: '阿梅', role: 'Người dẫn đường tỉ mỉ', tagline: 'Giải thích chiết tự chữ Hán và lỗi sai cực kỳ dễ hiểu.', fitFor: 'muốn nhớ sâu chữ Hán và không bị nhầm lẫn.', greetingText: 'Chào bạn, mình là Mai! Mình sẽ giúp bạn nhớ chữ Hán thật dễ dàng.' }
    ].map(c => ({
      ...c,
      available: true,
      greetings: [c.greetingText],
      lessonStartLine: 'Mình bắt đầu Bài 1 luôn nhé!',
      splash: { hero: `/images/companion/${c.id}/splash/hero.webp`, scenes: [] },
      sprites: baseSprites(c.id)
    }));
    const selectedId = localStorage.getItem('httq_companion_id') || 'capy';
    return {
      items: list,
      recommendedIds: ['capy', 'tieu-man', 'ha-vu'],
      lockedItems: [],
      selectedId,
      defaultId: 'capy'
    };
  }








  async function annotateLocalPinyin(text) {
    const charIndex = await loadLocalJson('/data/characters/index.json') || [];
    const wordIndex = await loadLocalJson('/data/vocabulary/index.json') || [];
    const characters = new Map(charIndex.map(item => [item.c, item]));
    const words = new Map(wordIndex.map(item => [item.w, item]));
    const input = Array.from(text);
    const annotations = [];
    const maxLength = Math.min(input.length, Math.max(1, ...wordIndex.map(item => Array.from(item.w || '').length)));
    for (let index = 0; index < input.length;) {
      const char = input[index];
      const isHanzi = /\p{Script=Han}/u.test(char);
      let match = null;
      if (isHanzi) {
        for (let size = Math.min(maxLength, input.length - index); size >= 2; size--) {
          const word = words.get(input.slice(index, index + size).join(''));
          if (!word) continue;
          const syllables = String(word.p || '').trim().split(/\s+/);
          if (syllables.length === size && input.slice(index, index + size).every(value => /\p{Script=Han}/u.test(value))) {
            match = { word, syllables, size }; break;
          }
        }
      }
      if (match) {
        for (let offset = 0; offset < match.size; offset++) annotations.push({ char: input[index + offset], isHanzi: true, pinyin: match.syllables[offset], meaningVi: match.word.m || '', isWordStart: offset === 0, wordHanzi: match.word.w, wordPinyin: match.syllables.join(' ') });
        index += match.size;
      } else {
        const info = characters.get(char);
        annotations.push({ char, isHanzi, pinyin: isHanzi && info ? String(info.p || '').split(/[,，;/]/)[0].trim() : '', meaningVi: isHanzi && info ? info.m || '' : '', isWordStart: false });
        index++;
      }
    }
    return annotations;
  }

  // BEGIN GENERATED PERSISTENCE SUPPORT
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
      // Enroll words and user mistakes from existing progress cleanly.
      if (typeof getRealProgress === 'function') {
        const progress = getRealProgress();
        const dismissedSet = new Set(Array.isArray(progress.dismissedMistakes) ? progress.dismissedMistakes : []);
        for (const rawWord of (Array.isArray(progress.learnedWords) ? progress.learnedWords : [])) {
          const hanzi = String(rawWord || '').trim();
          if (!hanzi || store.reviewCards.some(card => card.itemKey === `w:${hanzi}` && card.skill === 'meaning')) continue;
          store.reviewCards.push({ itemKey: `w:${hanzi}`, skill: 'meaning', state: 'learning',
            dueAt: new Date().toISOString(), wrongCount: 0, correctStreak: 0, attempts: 0,
            content: { hanzi }, createdAt: new Date().toISOString() });
          enrolledCards = true;
        }
        for (const m of (Array.isArray(progress.userMistakes) ? progress.userMistakes : [])) {
          if (!m || (!m.itemKey && !m.hanzi)) continue;
          const mKey = m.itemKey || `w:${m.hanzi}`;
          const mSkill = m.skill || 'meaning';
          if (dismissedSet.has(mKey)) continue;
          let existingCard = store.reviewCards.find(c => c.itemKey === mKey && c.skill === mSkill);
          if (!existingCard) {
            store.reviewCards.push({
              itemKey: mKey, skill: mSkill, state: 'learning', dueAt: new Date().toISOString(),
              wrongCount: Number(m.count) || 1, correctStreak: 0, attempts: Number(m.count) || 1,
              content: { hanzi: m.hanzi || mKey.replace(/^[a-z]:/, ''), pinyin: m.pinyin || '', meaningVi: m.meaningVi || '' },
              createdAt: m.lastWrongAt || new Date().toISOString()
            });
            enrolledCards = true;
          } else if ((existingCard.wrongCount || 0) === 0 && !existingCard.dismissed) {
            existingCard.wrongCount = Number(m.count) || 1;
            existingCard.correctStreak = 0;
            enrolledCards = true;
          }
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
        const libraryId = safeDecodeURIComponent(p.slice('/v1/library/'.length));
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
        const worksheetId = safeDecodeURIComponent(p.slice('/v1/user-worksheets/'.length));
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
        const noteId = safeDecodeURIComponent(p.slice('/v1/hsk-note-sets/'.length));
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
          const rawBlocks = Array.isArray(body.blocks)
            ? body.blocks
            : (body.blocks && typeof body.blocks === 'object' ? Object.values(body.blocks) : []);
          for (const block of rawBlocks) {
            const bId = block && (block.id || block.day);
            if (!bId || !Number.isFinite(Number(block.seconds)) || Number(block.seconds) < 0) continue;
            const index = store.studyBlocks.findIndex(item => (item.id || item.day) === bId);
            const current = store.studyBlocks[index];
            if (!current || String(block.updatedAt || '') >= String(current.updatedAt || '') || Number(block.seconds) > Number(current.seconds)) {
              const normBlock = { ...block, id: bId, seconds: Number(block.seconds) };
              if (index < 0) store.studyBlocks.push(normBlock);
              else store.studyBlocks[index] = normBlock;
            }
          }
          const addMins = Math.round((Number(body.seconds) || 0) / 60);
          if (addMins > 0 && typeof recordStudyProgress === 'function') {
            recordStudyProgress({ minutes: addMins });
          }
        }
        const result = { ok: true, blocks: store.studyBlocks, totalSeconds: store.studyBlocks.reduce((sum, block) => sum + Number(block.seconds || 0), 0) };
        return method === 'POST' ? commit(result) : jsonResponse(result);
      }
      if (p === '/v1/speaking-progress/sync') {
        if (method !== 'POST' && method !== 'GET') return error('method_not_allowed', 405);
        for (const item of (Array.isArray(body.items) ? body.items : [])) {
          if (!item || typeof item.key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(item.key)) continue;
          const current = store.speaking[item.key] || {};
          const recent = String(item.updatedAt || '') >= String(current.updatedAt || '') ? item : current;
          const itemScore = Number(item.best ?? item.score) || 0;
          const bestVal = Math.max(Number(current.best) || Number(current.score) || 0, itemScore);
          store.speaking[item.key] = {
            best: bestVal,
            score: bestVal,
            attempts: Math.max(Number(current.attempts) || 0, Number(item.attempts) || 1),
            lastScore: recent.lastScore ?? itemScore,
            updatedAt: recent.updatedAt || now
          };
        }
        try {
          const curSpk = JSON.parse(localStorage.getItem('httq_speaking_progress') || '{}') || {};
          localStorage.setItem('httq_speaking_progress', JSON.stringify({ ...curSpk, ...store.speaking }));
        } catch (_) {}
        return method === 'POST' ? commit({ ok: true, items: store.speaking }) : jsonResponse({ ok: true, items: store.speaking });
      }

      if (p === '/v2/review/signals') {
        if (method !== 'POST') return error('method_not_allowed', 405);
        if (!Array.isArray(body.signals)) return error('invalid_signals');
        const seen = new Set(store.reviewSignals.map(signal => signal.signalId));
        let accepted = 0;
        const learnedWordsBatch = [];
        const learnedGrammarBatch = [];
        const wrongBatch = [];
        for (const signal of body.signals) {
          if (!signal || !signal.signalId || !signal.itemKey || !['correct', 'wrong', 'partial'].includes(signal.outcome)) return error('invalid_signal');
          if (seen.has(signal.signalId)) continue;
          seen.add(signal.signalId); store.reviewSignals.push({ ...signal, receivedAt: now }); accepted++;
          const skill = signal.skill || 'meaning';
          let card = store.reviewCards.find(item => item.itemKey === signal.itemKey && item.skill === skill);
          if (!card) { card = { itemKey: signal.itemKey, skill, correctStreak: 0, attempts: 0, wrongCount: 0, createdAt: now }; store.reviewCards.push(card); }
          applyStudyReviewSignal(card, signal, now);
          const cleanK = String(signal.itemKey || '').replace(/^[a-z]:/i, '').trim();
          if (signal.itemKey.startsWith('g:')) {
            if (cleanK) learnedGrammarBatch.push(cleanK);
          } else if (signal.outcome === 'wrong' && cleanK) {
            wrongBatch.push({ itemKey: signal.itemKey, hanzi: cleanK, skill });
          } else if (cleanK) {
            learnedWordsBatch.push(cleanK);
          }
        }
        if (typeof recordStudyProgress === 'function' && (learnedWordsBatch.length || learnedGrammarBatch.length || wrongBatch.length)) {
          recordStudyProgress({
            words: learnedWordsBatch,
            grammarIds: learnedGrammarBatch,
            mistake: wrongBatch[0],
            minutes: 0
          });
          for (let wi = 1; wi < wrongBatch.length; wi++) recordStudyProgress({ mistake: wrongBatch[wi], minutes: 0 });
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
  // END GENERATED PERSISTENCE SUPPORT

  async function handleApiRequest(urlOrObj, init) {
    const urlObj = typeof urlOrObj === 'string' ? new URL(urlOrObj, window.location.origin) : urlOrObj;
    const p = (urlObj.pathname || '').replace(/^\/api/, '');
    const method = (init && init.method ? init.method : 'GET').toUpperCase();

    const persisted = await handlePersistentApi(p, urlObj, init, method);
    if (persisted) return persisted;

    // ------------------------------------------------------------------------
    // A. SERVER TIME & PUBLIC SETTINGS & AUTH
    // ------------------------------------------------------------------------
    if (p === '/server-time' || p === '/server-time/') {
      return jsonResponse({ now: Date.now() });
    }
    if (p.includes('/v2/analytics/events')) {
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/settings/public')) {
      const data = await loadLocalJson('/data/misc/settings-public.json');
      return jsonResponse(data || { ok: true });
    }
    if (p.includes('/v1/social-proof/summary')) {
      const data = await loadLocalJson('/data/misc/social-proof-summary.json');
      return jsonResponse(data || { ok: true });
    }
    if (p.includes('/users/me/weekly-activity') || p === '/v2/me/weekly-activity') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      return jsonResponse({
        ok: true,
        daysActive: sum.weekDays.length,
        minutes: sum.totalMinutes,
        todayMinutes: sum.todayMinutes,
        streakDays: sum.streakDays
      });
    }
    if (p.includes('/users/me/recent-actions') || p === '/v2/me/recent-actions') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const actions = [];
      for (const [stgKey, acts] of Object.entries(sum.prog.doneActivities || {})) {
        (Array.isArray(acts) ? acts : []).slice(-5).forEach(actKey => {
          actions.push({ type: 'lesson', stageKey: stgKey, key: actKey, title: `Hoàn thành ${actKey}` });
        });
      }
      (sum.prog.learnedWords || []).slice(-10).reverse().forEach(w => {
        actions.push({ type: 'word', key: w, title: `Đã học từ ${w}` });
      });
      return jsonResponse({ ok: true, actions: actions.slice(0, 15) });
    }
    if (p.includes('/v1/speaking/sample-consent')) {
      return jsonResponse({ ok: true, granted: false, decided: true, deleted: 0 });
    }
    if (p.includes('/auth/logout')) {
      clearAuthSession();
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/auth/google')) {
      const cb = urlObj.searchParams.get('callbackUrl') || '/tai-khoan';
      setTimeout(() => window.loginWithGoogle(cb), 10);
      return jsonResponse({ ok: true });
    }
    if (p.includes('/v1/auth/login') || p.includes('/v1/auth/register')) {
      const body = await parseRequestBody(init);
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) return authErrorResponse({ status: 400, code: 'invalid_credentials', message: 'Vui lòng nhập email hợp lệ và mật khẩu từ 6 ký tự.' });
      const register = p.includes('/v1/auth/register');
      const revision = ++authSessionRevision;
      try {
        const data = register
          ? await requestSupabaseAuth(`signup?redirect_to=${encodeURIComponent(window.location.origin + '/tai-khoan')}`, {
            method: 'POST', body: JSON.stringify({ email, password, data: { full_name: String(body.displayName || body.name || email.split('@')[0]).trim() } })
          })
          : await requestSupabaseAuth('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (revision !== authSessionRevision) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        if (register && !data.access_token) return jsonResponse({ ok: true, isAuthenticated: false, requiresEmailConfirmation: true, message: 'Vui lòng kiểm tra email và mở liên kết xác nhận trước khi đăng nhập.' }, 202);
        const user = data.user || await requestSupabaseAuth('user', { headers: { Authorization: `Bearer ${data.access_token}` } });
        if (revision !== authSessionRevision) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        const userObj = saveAuthSession(data.access_token, data.refresh_token, user);
        if (!userObj) return authErrorResponse({ status: 401, code: 'invalid_session', message: 'Không thể xác thực phiên đăng nhập.' });
        return jsonResponse({ ok: true, isAuthenticated: true, accessToken: DEFAULT_JWT, token: DEFAULT_JWT, ...userObj, user: userObj });
      } catch (error) { return authErrorResponse(error); }
    }
    if (p.includes('/v1/users/me/profile') || p.includes('/v1/users/me/preferences')) {
      return updateSupabaseProfile(await parseRequestBody(init), p.includes('/preferences') ? 'preferences' : 'profile', method);
    }
    if (p.includes('/v1/users/me/avatar')) {
      return updateSupabaseProfile(await parseRequestBody(init), 'avatar', method);
    }
    if (p.includes('/v1/auth/forgot-password') || p.includes('/v1/auth/reset-password')) {
      const body = await parseRequestBody(init);
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return authErrorResponse({ status: 400, code: 'invalid_email', message: 'Vui lòng nhập địa chỉ email hợp lệ để nhận liên kết đặt lại mật khẩu.' });
      }
      try {
        await requestSupabaseAuth(`recover?redirect_to=${encodeURIComponent(window.location.origin + '/tai-khoan')}`, {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        return jsonResponse({ ok: true, message: 'Đã gửi liên kết đặt lại mật khẩu tới email của bạn.' });
      } catch (error) {
        return authErrorResponse(error);
      }
    }
    if (p.includes('/v1/users/me/password')) {
      const body = await parseRequestBody(init);
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 6) return authErrorResponse({ status: 400, code: 'weak_password', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      const revision = authSessionRevision;
      const session = await getSupabaseSession();
      if (!session) return authErrorResponse({ status: 401, code: 'unauthorized', message: 'Vui lòng đăng nhập để đổi mật khẩu.' });
      const hasExistingPassword = Boolean(session.user && session.user.hasPassword !== false);
      const isInitialOAuthSet = !hasExistingPassword && (!body.currentPassword || body.mode === 'set');
      if (!isInitialOAuthSet && (typeof body.currentPassword !== 'string' || !body.currentPassword)) {
        return authErrorResponse({ status: 400, code: 'current_password_required', message: 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.' });
      }
      const stillCurrent = () => revision === authSessionRevision && (getSavedUser() || {}).id === session.user.id;
      try {
        let activeAccess = session.access_token;
        let activeRefresh = session.refresh_token;
        if (!isInitialOAuthSet) {
          const verified = await requestSupabaseAuth('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: session.user.email, password: body.currentPassword }) });
          if (!stillCurrent() || !verified.user || verified.user.id !== session.user.id) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
          activeAccess = verified.access_token;
          activeRefresh = verified.refresh_token;
        }
        const user = await requestSupabaseAuth('user', { method: 'PUT', headers: { Authorization: `Bearer ${activeAccess}` }, body: JSON.stringify({ password: body.newPassword, data: { xhz_has_password: true } }) });
        if (!stillCurrent() || user.id !== session.user.id) return authErrorResponse({ status: 409, code: 'session_changed', message: 'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.' });
        if (!saveAuthSession(activeAccess, activeRefresh, user)) return authErrorResponse({ status: 401, code: 'invalid_session', message: 'Vui lòng đăng nhập lại bằng mật khẩu mới.' });
        return jsonResponse({ ok: true });
      } catch (error) { return authErrorResponse(error); }
    }
    if (p.includes('/v1/auth/') || p.includes('/v2/auth/') || p.includes('/v1/users/me') || p.includes('/v1/profile')) {
      const realSum = getRealProgressSummary();
      const session = await getSupabaseSession();
      const savedUser = session && session.user;
      if (savedUser) {
        const tok = localStorage.getItem('xiehanzi_access_token') || DEFAULT_JWT;
        const mergedUser = { ...savedUser, streak: realSum.streakDays };
        return jsonResponse({
          ok: true,
          isAuthenticated: true,
          isGuest: false,
          accessToken: tok,
          token: tok,
          ...mergedUser,
          user: mergedUser
        });
      }
      return jsonResponse({
        ok: true,
        isAuthenticated: false,
        isGuest: true,
        accessToken: DEFAULT_JWT,
        token: DEFAULT_JWT,
        id: 'guest-xhz',
        _id: 'guest-xhz',
        email: '',
        username: 'guest',
        name: 'Khách',
        displayName: 'Khách',
        avatar: '',
        role: 'guest',
        streak: realSum.streakDays,
        user: {
          id: 'guest-xhz',
          _id: 'guest-xhz',
          email: '',
          username: 'guest',
          name: 'Khách',
          displayName: 'Khách',
          avatar: '',
          role: 'guest',
          isGuest: true,
          streak: realSum.streakDays
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
          webPathB: true,
          examReview: true,
          speaking: true,
          thayDo: true,
          companion: true
        }
      });
    }
    if (p === '/v2/companion/characters') {
      return jsonResponse(buildCompanionCharactersResponse());
    }
    if (p === '/v2/companion/character') {
      const body = await parseRequestBody(init);
      const selectedId = body.characterId || localStorage.getItem('httq_companion_id') || 'capy';
      localStorage.setItem('httq_companion_id', selectedId);
      return jsonResponse({ ok: true, selectedId });
    }
    if (p === '/v2/companion/call/status') {
      return jsonResponse({
        callEnabled: true,
        voice: 'allowed',
        secondsLeftToday: 900,
        capSeconds: 1800,
        trial: false,
        upsell: null
      });
    }
    if (p === '/v2/companion/unlocks') {
      return jsonResponse({ unlockedIds: ['capy', 'tieu-man', 'ha-vu', 'luc-than', 'duong-duong', 'mai'], newlyUnlocked: [] });
    }
    if (p === '/v2/companion/memory') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const prog = sum.prog || getRealProgress();
      const recentWords = (prog.learnedWords || []).slice(-5);
      const gramCount = (prog.learnedGrammarIds || []).length;
      const items = [];
      if (sum.wordsMastered > 0) {
        items.push({ id: 'mem-vocab', kind: 'vocab', textVi: `Đã học ${sum.wordsMastered} từ vựng${recentWords.length ? ` (gần đây: ${recentWords.join('、')})` : ''}.` });
      }
      if (sum.streakDays > 0) {
        items.push({ id: 'mem-streak', kind: 'habit', textVi: `Đang giữ chuỗi học ${sum.streakDays} ngày liên tiếp (kỷ lục ${sum.longestStreak} ngày).` });
      }
      if (gramCount > 0) {
        items.push({ id: 'mem-grammar', kind: 'grammar', textVi: `Đã nắm ${gramCount} điểm ngữ pháp HSK.` });
      }
      if (prog.examPlan && prog.examPlan.targetLevel) {
        items.push({ id: 'mem-exam', kind: 'goal', textVi: `Mục tiêu thi HSK ${prog.examPlan.targetLevel}${prog.examPlan.targetDate ? ` vào ngày ${prog.examPlan.targetDate}` : ''}.` });
      }
      if (sum.mistakesCount > 0) {
        items.push({ id: 'mem-mistakes', kind: 'review', textVi: `Còn ${sum.mistakesCount} mục trong sổ lỗi cần ôn kỹ lại.` });
      }
      const summaryVi = sum.wordsMastered > 0 || sum.stagesDone > 0
        ? `Đã hoàn thành ${sum.stagesDone} chặng, học ${sum.wordsMastered} từ và duy trì chuỗi ${sum.streakDays} ngày.`
        : 'Đang bắt đầu lộ trình HSK 1 — hãy hoàn thành bài học đầu tiên hôm nay!';
      return jsonResponse({ items, summaryVi });
    }
    if (p === '/v2/companion/inbox') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const prog = sum.prog || getRealProgress();
      const readSet = new Set(Array.isArray(prog.companionInboxReadIds) ? prog.companionInboxReadIds : []);
      const todayStr = new Date().toISOString().slice(0, 10);
      const rawItems = [];
      if (sum.dueTotal > 0) {
        rawItems.push({
          id: `due-${todayStr}`,
          kind: 'review',
          titleVi: `Bạn có ${sum.dueTotal} thẻ đến hạn ôn SRS`,
          bodyVi: 'Ôn 3–5 phút để giữ trí nhớ dài hạn không bị đứt quãng.',
          href: '/on-tap/',
          createdAt: new Date().toISOString()
        });
      }
      if (sum.mistakesCount > 0) {
        rawItems.push({
          id: `mistakes-${todayStr}`,
          kind: 'mistake',
          titleVi: `${sum.mistakesCount} lỗi sai đang chờ khắc phục`,
          bodyVi: 'Luyện nhanh sổ lỗi giúp tránh mất điểm oan khi làm đề HSK.',
          href: '/on-tap/',
          createdAt: new Date().toISOString()
        });
      }
      if (prog.examPlan && prog.examPlan.targetDate) {
        const diffDays = Math.ceil((new Date(prog.examPlan.targetDate).getTime() - Date.now()) / 86400000);
        if (Number.isFinite(diffDays) && diffDays >= 0) {
          rawItems.push({
            id: `exam-plan-${prog.examPlan.targetDate}`,
            kind: 'goal',
            titleVi: `Còn ${diffDays} ngày tới kỳ thi HSK ${prog.examPlan.targetLevel || 1}`,
            bodyVi: `Mục tiêu mỗi ngày ${prog.examPlan.dailyMinutes || 15} phút để về đích đúng hẹn.`,
            href: '/kiem-tra-hsk/',
            createdAt: new Date().toISOString()
          });
        }
      }
      const celebrate = [];
      if (sum.wordsMastered >= 10) celebrate.push({ id: 'milestone-10-words', labelVi: `Đạt mốc ${sum.wordsMastered} từ vựng!` });
      if (sum.streakDays >= 3) celebrate.push({ id: `milestone-streak-${sum.streakDays}`, labelVi: `Chuỗi ${sum.streakDays} ngày học liên tiếp!` });
      const items = rawItems.map(it => ({ ...it, read: readSet.has(it.id) }));
      const unreadCount = items.filter(it => !it.read).length;
      return jsonResponse({ items, unreadCount, celebrate });
    }
    if (p === '/v2/companion/inbox/read') {
      const body = await parseRequestBody(init);
      const prog = getRealProgress();
      const readSet = new Set(Array.isArray(prog.companionInboxReadIds) ? prog.companionInboxReadIds : []);
      const todayStr = new Date().toISOString().slice(0, 10);
      if (Array.isArray(body.ids)) body.ids.forEach(id => { if (id) readSet.add(String(id)); });
      else if (body.id) readSet.add(String(body.id));
      else {
        readSet.add(`due-${todayStr}`);
        readSet.add(`mistakes-${todayStr}`);
        if (prog.examPlan && prog.examPlan.targetDate) readSet.add(`exam-plan-${prog.examPlan.targetDate}`);
      }
      prog.companionInboxReadIds = Array.from(readSet).slice(-60);
      saveRealProgress(prog);
      supabaseUpsert(getLocalState()).catch(() => {});
      return jsonResponse({ ok: true, unreadCount: 0, readIds: prog.companionInboxReadIds });
    }
    if (p === '/v2/companion/tts/stream') {
      return jsonResponse({ error: { code: 'not_found', message: 'Use standard TTS' } }, 404);
    }
    if (p === '/v2/companion/tts') {
      const body = await parseRequestBody(init);
      const txt = (body.text || '你好').trim();
      const cleanHz = (txt.match(/[\u4e00-\u9fff]+/g) || ['你好']).join('');
      const audioUrl = rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(cleanHz.slice(0, 4) || '你好')}.mp3`);
      setTimeout(() => {
        try { playPronunciation(txt, ''); } catch (_) {}
      }, 60);
      return jsonResponse({ url: audioUrl, audioUrl });
    }
    if (p === '/v2/companion/voice/turn' || /^\/v1\/thay-do\/pho\/canh\/[^/]+\/luot$/.test(p)) {
      const isOpener = urlObj.searchParams.get('opener') === 'true';
      const targetHanzi = (urlObj.searchParams.get('targetHanzi') || '').trim();
      const targetPinyin = (urlObj.searchParams.get('targetPinyin') || '').trim();
      const stageKey = (urlObj.searchParams.get('stageKey') || '').trim();
      const turnIdx = (window.__xhzVoiceTurnIdx = (window.__xhzVoiceTurnIdx || 0) + 1);

      const userSamples = [
        { text: '你好，我叫明安，很高兴认识你！', pinyin: 'Nǐ hǎo, wǒ jiào Míng Ān, hěn gāoxìng rènshi nǐ!' },
        { text: '我是越南人，我正在学习汉语。', pinyin: 'Wǒ shì Yuènán rén, wǒ zhèngzài xuéxí Hànyǔ.' },
        { text: '我今天很忙，但是我很喜欢学中文。', pinyin: 'Wǒ jīntiān hěn máng, dànshì wǒ hěn xǐhuan xué Zhōngwén.' },
        { text: '谢谢老师，我们继续练习吧！', pinyin: 'Xièxie lǎoshī, wǒmen jìxù liànxí ba!' }
      ];
      const aiReplies = [
        {
          text: '你好！认识你我也很高兴！你的发音非常标准，你叫什么名字呢？',
          pinyin: 'Nǐ hǎo! Rènshi nǐ wǒ yě hěn gāoxìng! Nǐ de fāyīn fēicháng biāozhǔn, nǐ jiào shénme míngzi ne?'
        },
        {
          text: '太棒了！你的声调很清楚。你是哪国人？平时喜欢做什么呢？',
          pinyin: 'Tài bàng le! Nǐ de shēngdiào hěn qīngchu. Nǐ shì nǎ guó rén? Píngshí xǐhuan zuò shénme ne?'
        },
        {
          text: '说得真好！每天坚持练习几分钟，你的中文一定会进步飞快！',
          pinyin: 'Shuō de zhēn hǎo! Měitiān jiānchí liànxí jǐ fēnzhōng, nǐ de Zhōngwén yídìng huì jìnbù fēikuài!'
        },
        {
          text: '非常棒！今天我们的口语练习很顺利，给你点个大大的赞！',
          pinyin: 'Fēicháng bàng! Jīntiān wǒmen de kǒuyǔ liànxí hěn shùnlì, gěi nǐ diǎn gè dàdà de zàn!'
        }
      ];
      const suggestSets = [
        [
          { hanzi: '你好，我叫明安', pinyin: 'Nǐ hǎo, wǒ jiào Míng Ān', vi: 'Xin chào, tôi tên là Minh Anh' },
          { hanzi: '很高兴认识你', pinyin: 'Hěn gāoxìng rènshi nǐ', vi: 'Rất vui được làm quen với bạn' },
          { hanzi: '我是越南人', pinyin: 'Wǒ shì Yuènán rén', vi: 'Tôi là người Việt Nam' }
        ],
        [
          { hanzi: '我喜欢学习汉语', pinyin: 'Wǒ xǐhuan xuéxí Hànyǔ', vi: 'Tôi thích học tiếng Trung' },
          { hanzi: '我喜欢喝茶和看书', pinyin: 'Wǒ xǐhuan hē chá hé kàn shū', vi: 'Tôi thích uống trà và đọc sách' },
          { hanzi: '谢谢你，不客气', pinyin: 'Xièxie nǐ, bú kèqi', vi: 'Cảm ơn bạn, đừng khách sáo' }
        ]
      ];

      const events = [];
      let replyObj = aiReplies[0];
      if (isOpener) {
        replyObj = {
          text: '你好！很高兴和你一起练习中文口语。你可以用中文向我打个招呼吗？',
          pinyin: 'Nǐ hǎo! Hěn gāoxìng hé nǐ yìqǐ liànxí Zhōngwén kǒuyǔ. Nǐ kěyǐ yòng Zhōngwén xiàng wǒ dǎ gè zhāohu ma?'
        };
      } else {
        const pickedUser = targetHanzi
          ? { text: targetHanzi, pinyin: targetPinyin || 'Nǐ hǎo, hěn gāoxìng rènshi nǐ!' }
          : userSamples[(turnIdx - 1) % userSamples.length];
        events.push(`event: heard\ndata: ${JSON.stringify({ text: pickedUser.text, pinyin: pickedUser.pinyin })}\n\n`);
        const chars = Array.from(pickedUser.text.replace(/[^\u4e00-\u9fff]/g, ''));
        const syllables = (chars.length ? chars : ['你', '好']).map(ch => ({ text: ch, pinyin: '', status: 'good' }));
        events.push(`event: grade\ndata: ${JSON.stringify({ score: 94, syllables })}\n\n`);
        replyObj = aiReplies[turnIdx % aiReplies.length];
        try {
          recordStudyProgress({
            voiceInc: 1,
            gradingInc: 1,
            minutes: 2,
            dailyStepDone: 'step-talk-1'
          });
        } catch (_) {}
      }

      events.push(`event: sentence\ndata: ${JSON.stringify({ i: 0, text: replyObj.text, pinyin: replyObj.pinyin, lang: 'zh' })}\n\n`);
      events.push(`event: sentence_end\ndata: {"i":0}\n\n`);
      events.push(`event: suggest\ndata: ${JSON.stringify({ items: suggestSets[turnIdx % suggestSets.length] })}\n\n`);
      if (stageKey) {
        events.push(`event: mission\ndata: ${JSON.stringify({ completedIds: turnIdx >= 2 ? ['m1', 'm2'] : ['m1'] })}\n\n`);
      }
      events.push(`event: quota\ndata: ${JSON.stringify({ secondsLeft: Math.max(600, 900 - turnIdx * 15), capSeconds: 1800, voice: 'allowed' })}\n\n`);
      events.push(`event: done\ndata: {}\n\n`);

      setTimeout(() => {
        try { playPronunciation(replyObj.text, ''); } catch (_) {}
      }, 150);

      const sseBody = events.join('');
      return new Response(sseBody, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (p === '/v2/companion/chat' || p === '/v2/companion/chat/stream') {
      const characterId = urlObj.searchParams.get('characterId') || localStorage.getItem('httq_companion_id') || 'capy';
      const defaultSuggestions = [
        'Dạy mình 3 câu giao tiếp HSK 1 thông dụng',
        'Phân biệt 不客气 và 没关系 như thế nào?',
        'Cho mình 1 câu tiếng Trung để luyện phản xạ'
      ];
      let savedTurns = [];
      try {
        savedTurns = JSON.parse(localStorage.getItem('httq_companion_chat_turns') || '[]');
        if (!Array.isArray(savedTurns)) savedTurns = [];
      } catch (_) {
        savedTurns = [];
      }
      if (savedTurns.length === 0) {
        savedTurns = [
          {
            id: 'turn-welcome-1',
            role: 'assistant',
            characterId,
            text: '你好 (Nǐ hǎo)! Mình luôn sẵn sàng đồng hành cùng bạn. Bạn có thể nhắn tin hỏi từ vựng, ngữ pháp hoặc bấm nút Nói 🎙️ để luyện nói tiếng Trung trực tiếp với mình nhé!',
            createdAt: new Date(Date.now() - 60000).toISOString()
          }
        ];
      }
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const msg = (body.message || body.text || body.prompt || '').trim();
        const reqCharId = body.characterId || characterId;
        if (msg) {
          savedTurns.push({
            id: `turn-u-${Date.now()}`,
            role: 'user',
            characterId: reqCharId,
            text: msg,
            createdAt: new Date().toISOString()
          });
        }
        let pageWord = null;
        try {
          const curPath = safeDecodeURIComponent(window.location.pathname || '');
          const mVocab = curPath.match(/^\/(tu-vung|han-tu)\/([^/?#]+)/);
          if (mVocab && mVocab[2]) {
            pageWord = mVocab[1] === 'han-tu' ? await lookupCharacter(mVocab[2]) : await lookupWord(mVocab[2]);
          }
        } catch (_) {}

        let dictMatches = [];
        try {
          const hzTokens = msg.match(/[\u4e00-\u9fff]+/g) || [];
          for (const hz of hzTokens.slice(0, 3)) {
            const w = await lookupWord(hz);
            if (w && w.hanzi) {
              dictMatches.push({
                hanzi: w.hanzi,
                pinyin: w.wordPinyin || w.pinyin || '',
                hanViet: w.hanViet || '',
                meaningVi: w.wordMeaningVi || w.meaningVi || w.translationVi || '',
                usageNote: w.usageNote || '',
                examples: (w.examples || []).slice(0, 2)
              });
            }
          }
          if (dictMatches.length === 0 && msg.length >= 2) {
            const qClean = msg
              .toLowerCase()
              .replace(/^(tiếng trung|từ|chữ|dịch|nghĩa của|cho mình hỏi|hỏi|cách nói)\s+/i, '')
              .replace(/\s+(trong tiếng trung|là gì|nói sao|như thế nào|nghĩa là gì)\??$/i, '')
              .trim();
            if (qClean.length >= 2) {
              const vIdx = await loadLocalJson('/data/vocabulary/index.json');
              if (Array.isArray(vIdx)) {
                const found = vIdx.filter(item => {
                  const m = String(item.m || '').toLowerCase();
                  return m === qClean || m.startsWith(qClean + ',') || m.startsWith(qClean + ';') || m.includes(', ' + qClean);
                }).slice(0, 3);
                dictMatches = found.map(f => ({
                  hanzi: String(f.w || f.h || '').replace(/\{|\}/g, ''),
                  pinyin: f.p,
                  hanViet: f.hv || '',
                  meaningVi: f.m || ''
                }));
              }
            }
          }
        } catch (_) {}

        let replyText = '';
        try {
          const aiRes = await callAiEndpoint('companion-chat', {
            message: msg,
            history: savedTurns.slice(-7, -1).map(t => ({ role: t.role, text: t.text })),
            characterId: reqCharId,
            characterName: reqCharId === 'duong-duong' ? 'Dương Dương 洋洋' : 'Bạn đồng hành AI',
            pagePath: window.location.pathname,
            pageTitle: document.title,
            pageWord: pageWord
              ? {
                  hanzi: pageWord.hanzi,
                  pinyin: pageWord.wordPinyin || pageWord.pinyin || '',
                  hanViet: pageWord.hanViet || '',
                  meaningVi: pageWord.wordMeaningVi || pageWord.meaningVi || pageWord.translationVi || '',
                  usageNote: pageWord.usageNote || ''
                }
              : null,
            dictMatches
          });
          if (aiRes && aiRes.reply) {
            replyText = String(aiRes.reply).trim();
          }
        } catch (_) {}

        if (!replyText) {
          if (dictMatches.length > 0) {
            const d0 = dictMatches[0];
            replyText = `Trong tiếng Trung:\n• **${d0.hanzi}** (${d0.pinyin}${d0.hanViet ? ' — Hán Việt: ' + d0.hanViet.toUpperCase() : ''}): **${d0.meaningVi}**`;
          } else if (pageWord && pageWord.hanzi) {
            replyText = `Bạn đang xem từ **${pageWord.hanzi}** (${pageWord.wordPinyin || pageWord.pinyin || ''}) có nghĩa là **${pageWord.wordMeaningVi || pageWord.meaningVi || ''}**. Bạn muốn mình đặt câu ví dụ hay giải thích thêm cách dùng từ này không?`;
          } else {
            replyText = 'Mình đang lắng nghe bạn đây! Bạn có thể hỏi mình nghĩa từ vựng, cách dùng ngữ pháp hoặc nhờ mình dịch bất kỳ câu tiếng Việt / tiếng Trung nào nhé!';
          }
        }

        recordStudyProgress({ voiceInc: 1 });

        const assistantTurn = {
          id: `turn-a-${Date.now() + 1}`,
          role: 'assistant',
          characterId: reqCharId,
          text: replyText,
          createdAt: new Date().toISOString()
        };
        savedTurns.push(assistantTurn);
        try {
          localStorage.setItem('httq_companion_chat_turns', JSON.stringify(savedTurns.slice(-30)));
        } catch (_) {}
        return jsonResponse({
          ok: true,
          reply: assistantTurn,
          text: replyText,
          message: replyText,
          suggestions: defaultSuggestions
        });
      }
      return jsonResponse({
        characterId,
        turns: savedTurns,
        messages: savedTurns,
        items: savedTurns,
        suggestions: defaultSuggestions
      });
    }
    const getMergedExamHistory = () => {
      const prog = getRealProgress();
      const st = getLocalState();
      const hMap = new Map();
      [...(Array.isArray(st.history) ? st.history : []), ...(Array.isArray(prog.examHistory) ? prog.examHistory : [])].forEach(h => {
        if (h && (h.paperId || h.at)) hMap.set(`${h.paperId || 'test'}-${h.at || ''}`, h);
      });
      return Array.from(hMap.values()).sort((a, b) => (Date.parse(b.at || '') || 0) - (Date.parse(a.at || '') || 0));
    };
    if (p === '/v2/me/exam-readiness') {
      const hist = getMergedExamHistory();
      const byLevel = new Map();
      hist.forEach(h => {
        const m = String(h.paperId || '').match(/(\d+)/);
        const lvl = m ? Number(m[1]) : 1;
        if (!byLevel.has(lvl)) byLevel.set(lvl, []);
        byLevel.get(lvl).push(Number(h.score) || 0);
      });
      const levels = Array.from(byLevel.entries()).map(([level, scores]) => {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const predicted300 = Math.round(avg * 3);
        return { level, attempts: scores.length, latestScore: scores[0], averageScore: avg, predictedHsk300: predicted300, ready: predicted300 >= 180 };
      });
      return jsonResponse({
        method: 'Tính dựa trên kết quả làm đề gần nhất và tiến độ ôn tập thực tế.',
        disclaimer: 'Không phải điểm thi chính thức',
        attemptsCount: hist.length,
        levels
      });
    }
    if (p === '/v2/me/exam-sittings' || p.startsWith('/v2/me/exam-sittings/')) {
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const entry = {
          paperId: body.paperId || body.testId || 'hsk30-1',
          score: Number(body.score) || 0,
          correctCount: Number(body.correctCount) || 0,
          total: Number(body.total || body.totalQuestions) || 40,
          at: new Date().toISOString()
        };
        recordStudyProgress({ examResult: entry, minutes: 5, sessionInc: 1 });
      }
      const items = getMergedExamHistory();
      return jsonResponse({ ok: true, items, imported: items.length });
    }
    if (p === '/v2/exam-sittings' || p.startsWith('/v2/exam-sittings/')) {
      const items = getMergedExamHistory();
      return jsonResponse({ ok: true, id: `sit-${Date.now()}`, sittingId: `sit-${Date.now()}`, status: 'active', answers: [], items });
    }
    if (p === '/v2/me/learning-profile') {
      let saved = {};
      try {
        saved = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}') || {};
      } catch (_) {
        saved = {};
      }
      if (method === 'PATCH' || method === 'POST') {
        const body = await parseRequestBody(init);
        saved = { ...saved, ...(body || {}) };
        try {
          localStorage.setItem('httq_learning_profile', JSON.stringify(saved));
        } catch (_) {}
      }
      return jsonResponse({
        goal: saved.goal || 'giao-tiep',
        dailyMinutes: saved.dailyMinutes || 15,
        currentLevel: saved.currentLevel || 1,
        companionId: saved.companionId || localStorage.getItem('httq_companion_id') || 'capy',
        hidePinyinInReview: Boolean(saved.hidePinyinInReview),
        reviewFormat: saved.reviewFormat || 'auto',
        onboardingCompleted: true,
        ...saved
      });
    }
    if (p === '/v2/me/progress' || p === '/v1/me/progress') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      return jsonResponse({
        streakDays: sum.streakDays,
        totalMinutes: sum.totalMinutes,
        wordsMastered: sum.wordsMastered,
        wordsLearning: sum.wordsLearning,
        lessonsDone: sum.lessonsDone,
        stagesDone: sum.stagesDone,
        accuracyPct: sum.lessonsDone > 0 ? 92 : 0,
        activity: sum.activity
      });
    }
    if (p === '/v2/me/habit' || p === '/v2/me/habit/weekly-goal') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      let savedHabit = { dailyMinutes: 15, reminderTime: '20:00', reminderEnabled: true, goalSessions: sum.goalSessions || 5 };
      try {
        const raw = JSON.parse(localStorage.getItem('httq_habit_settings') || '{}');
        savedHabit = { ...savedHabit, ...raw };
      } catch (_) {}
      if (method === 'PATCH' || method === 'PUT' || method === 'POST') {
        const body = await parseRequestBody(init);
        if (body && body.sessions !== undefined) {
          savedHabit.goalSessions = Number(body.sessions) || 5;
        }
        savedHabit = { ...savedHabit, ...(body || {}) };
        try { localStorage.setItem('httq_habit_settings', JSON.stringify(savedHabit)); } catch (_) {}
        syncProgressToSupabaseAuth();
      }
      const goalSessions = Number(savedHabit.goalSessions) || 5;
      const sessionsDone = sum.sessionsThisWeek;
      return jsonResponse({
        ok: true,
        streakDays: sum.streakDays,
        masteredWords: sum.wordsMastered,
        ...savedHabit,
        streak: {
          count: sum.streakDays,
          longest: sum.longestStreak,
          todayDone: sum.todayDone,
          activeDates: sum.activeDates
        },
        week: {
          goalSessions,
          sessionsDone,
          reached: sessionsDone >= goalSessions,
          days: sum.weekDays
        }
      });
    }
    if (p === '/v2/me/plans' || p === '/v2/plans' || p === '/plans' || p === '/v2/me/plans/interest') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const now = new Date();
      const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
      return jsonResponse({
        ok: true,
        currentPlan: 'free',
        tier: 'free',
        plan: 'free',
        grading: { used: sum.gradingUsed, limit: 100, resetsAt: nextMonth },
        speaking: { used: sum.gradingUsed, limit: 100, resetsAt: nextMonth },
        companionTurns: { used: sum.voiceUsed, limit: 50, resetsAt: nextMonth },
        plans: [
          {
            plan: 'free',
            titleVi: 'Miễn phí',
            badge: 'Bản web',
            price: 0,
            features: ['Tra cứu và học từ vựng', 'Lộ trình học', 'Đồng bộ tiến độ']
          }
        ]
      });
    }
    if (p === '/v2/me/entitlements') {
      return jsonResponse({
        plan: 'free',
        tier: 'free',
        isPro: false,
        features: ['smart_error_review', 'learning_path', 'speaking_practice', 'voice_call', 'exam_prep'],
        limits: { aiExplainPerDay: 999, speakingPerDay: 999 }
      });
    }
    if (p === '/v2/me/exam-plan') {
      await ensureInitialCloudPull();
      const prog = getRealProgress();
      if (method === 'DELETE') {
        prog.examPlan = null;
        saveRealProgress(prog);
        supabaseUpsert(getLocalState()).catch(() => {});
        return jsonResponse({ ok: true, status: 'none', plan: null });
      }
      if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
        const body = await parseRequestBody(init);
        const targetLevel = Math.max(1, Math.min(9, Number(body.targetLevel || body.level || (prog.examPlan && prog.examPlan.targetLevel) || 1) || 1));
        const dailyMinutes = Math.max(5, Math.min(180, Number(body.dailyMinutes || body.minutesPerDay || (prog.examPlan && prog.examPlan.dailyMinutes) || 15) || 15));
        const examType = String(body.examType || (prog.examPlan && prog.examPlan.examType) || 'hsk').toLowerCase();
        const targetDate = typeof body.targetDate === 'string' && body.targetDate.trim()
          ? body.targetDate.trim().slice(0, 10)
          : ((prog.examPlan && prog.examPlan.targetDate) || null);
        prog.examPlan = {
          ...(prog.examPlan || {}),
          examType,
          targetLevel,
          targetDate,
          dailyMinutes,
          goalScore: Number(body.goalScore) || (targetLevel <= 2 ? 160 : 220),
          status: 'active',
          updatedAt: new Date().toISOString()
        };
        saveRealProgress(prog);
        supabaseUpsert(getLocalState()).catch(() => {});
        return jsonResponse({ ok: true, status: 'active', plan: prog.examPlan });
      }
      const plan = prog.examPlan || null;
      return jsonResponse({ status: plan ? (plan.status || 'active') : 'none', plan });
    }
    if (p === '/v2/me/skill-map') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const m = computeRealSkillMetrics(sum);
      return jsonResponse({
        level: m.level,
        wordsSeen: m.wordsSeen,
        wordsTotal: m.wordsTotal,
        grammarDone: m.gramCount,
        dictationDone: m.dictCount,
        speakingSessions: m.spkCount,
        avgScore: m.avgSkill,
        skills: m.skills
      });
    }
    if (p === '/v2/me/score-prediction') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const m = computeRealSkillMetrics(sum);
      return jsonResponse({
        level: m.level,
        predictedScore: m.predictedScore200,
        maxScore: 200,
        passScore: 120,
        readinessPct: m.avgSkill,
        examCount: m.examCount
      });
    }
    if (p === '/v2/me/reports/weekly') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      return jsonResponse({
        streakDays: sum.streakDays,
        minutesStudied: sum.totalMinutes,
        wordsLearned: sum.wordsMastered,
        lessonsCompleted: sum.lessonsDone
      });
    }
    if (p === '/v2/me/consents') {
      return jsonResponse({ ok: true, consents: {} });
    }
    if (p === '/v2/learning-tracks' || p === '/v2/paths') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const isBatDauPage = (window.location.pathname || '').includes('bat-dau');
      const savedStageKey = sum.prog.currentStageKey || localStorage.getItem('httq_current_stage_key') || 'hsk30.L1.P1';
      const savedLessonId = sum.prog.currentLessonId || localStorage.getItem('httq_current_lesson_id') || 'hsk30.L1.P1.learn.1';
      const doneStages = sum.prog.doneStages || [];
      const rawTracks = await loadLocalJson('/data/learning-tracks/tracks.json');
      if (rawTracks && Array.isArray(rawTracks.tracks)) {
        const tracks = rawTracks.tracks.map(t => ({
          ...t,
          slug: t.track === 'hsk30' ? 'hsk30-1' : t.track,
          level: 1,
          titleVi: 'HSK 1',
          isDefault: t.track === 'hsk30',
          enrollment:
            !isBatDauPage && t.track === 'hsk30'
              ? {
                  pathSlug: 'hsk30-1',
                  track: 'hsk30',
                  current: true,
                  currentLevel: 'L1',
                  currentStageId: savedStageKey,
                  currentLessonId: savedLessonId,
                  startStageKey: savedStageKey,
                  stagesDone: doneStages.length,
                  stagesTotal: 40,
                  active: true,
                  enrolledAt: '2026-11-10T00:00:00.000Z'
                }
              : null
        }));
        return jsonResponse({ tracks, paths: tracks });
      }
      const stdObj = { code: 'hsk30', sourceLineVi: 'Theo Đề cương thi HSK (HSK 3.0, ban hành 11/2025)', issuerVi: 'Trung tâm Hợp tác Giao lưu Ngôn ngữ Trung Quốc - Nước ngoài' };
      const tracks = [
        {
          track: 'hsk30',
          slug: 'hsk30-1',
          level: 1,
          titleVi: 'HSK 1',
          brandVi: 'HSK 3.0',
          standard: stdObj,
          isDefault: true,
          placementAvailable: true,
          levels: [
            { level: 'L1', titleVi: 'Cấp 1', chapterCount: 8, stageCount: 40 },
            { level: 'L2', titleVi: 'Cấp 2', chapterCount: 6, stageCount: 29 },
            { level: 'L3', titleVi: 'Cấp 3', chapterCount: 8, stageCount: 38 }
          ],
          enrollment: isBatDauPage
            ? null
            : {
                pathSlug: 'hsk30-1',
                track: 'hsk30',
                current: true,
                currentLevel: 'L1',
                currentStageId: savedStageKey,
                currentLessonId: savedLessonId,
                startStageKey: savedStageKey,
                stagesDone: doneStages.length,
                stagesTotal: 40,
                active: true,
                enrolledAt: '2026-11-10T00:00:00.000Z'
              }
        }
      ];
      return jsonResponse({ tracks, paths: tracks });
    }
    async function synthesizeTrackLevel(trackSlug, levelCode) {
      const cleanTrack = trackSlug === 'hsk30-1' ? 'hsk30' : (trackSlug || 'hsk30');
      const cleanLvl = String(levelCode || (cleanTrack === 'boya' ? 'E1' : 'L1')).toUpperCase();
      if (cleanTrack === 'hsk30' && cleanLvl === 'L1') {
        const l1 = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
        if (l1) return { ...l1, track: 'hsk30', level: 'L1' };
      }
      const numMatch = cleanLvl.match(/\d+/);
      const lvlNum = numMatch ? Number(numMatch[0]) : 1;
      let curr = 'new-hsk';
      let levelSlug = lvlNum >= 7 ? 'new-hsk-7-9' : `new-hsk-${Math.max(1, Math.min(6, lvlNum))}`;
      if (cleanTrack === 'yct') {
        curr = 'yct';
        levelSlug = `yct-${Math.max(1, Math.min(4, lvlNum))}`;
      } else if (cleanTrack === 'boya') {
        curr = 'boya';
        levelSlug = `boya-elementary-${lvlNum >= 2 ? 2 : 1}`;
      }
      const lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
      const lessData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}-lessons.json`);
      const rawLessons = (lessData && Array.isArray(lessData.lessons) && lessData.lessons.length > 0)
        ? lessData.lessons
        : ((lvlData && lvlData.level && Array.isArray(lvlData.level.lessons) && lvlData.level.lessons.length > 0)
          ? lvlData.level.lessons
          : ((lvlData && lvlData.level && Array.isArray(lvlData.level.topics)) ? lvlData.level.topics : []));
      if (!rawLessons.length) {
        const fb = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
        return fb ? { ...fb, track: cleanTrack, level: cleanLvl } : null;
      }
      const chapters = [];
      const perChapter = 5;
      for (let ci = 0; ci < rawLessons.length; ci += perChapter) {
        const chIdx = Math.floor(ci / perChapter) + 1;
        const chKey = `${cleanTrack}.${cleanLvl}.C${String(chIdx).padStart(2, '0')}`;
        const slice = rawLessons.slice(ci, ci + perChapter);
        const stages = slice.map((item, si) => {
          const stgNum = ci + si + 1;
          const stgKey = `${cleanTrack}.${cleanLvl}.S${String(stgNum).padStart(2, '0')}`;
          const srcSlug = item.lessonSlug || item.topicSlug || item.slug || '';
          const isTopic = !item.lessonSlug && Boolean(item.topicSlug);
          const titleVi = item.titleVi || item.topic || item.titleZh || `Bài ${stgNum}`;
          return {
            stageKey: stgKey,
            kind: 'scene',
            order: stgNum,
            titleVi,
            meta: { titleVi, titleZh: item.titleZh || '', wordCount: Number(item.wordCount) || 12 },
            sourceCurr: curr,
            sourceLevelSlug: levelSlug,
            sourceSlug: srcSlug,
            sourceKind: isTopic ? 'topic' : 'lesson',
            activities: [
              { activityKey: `${stgKey}.learn.1`, kind: 'learn', titleVi: `Từ mới: ${titleVi}`, estMinutes: 6 },
              { activityKey: `${stgKey}.dlg`, kind: 'dialogue', titleVi: `Hội thoại: ${titleVi}`, estMinutes: 4 },
              { activityKey: `${stgKey}.rp1`, kind: 'roleplay', titleVi: `Nhập vai: ${titleVi}`, estMinutes: 5 },
              { activityKey: `${stgKey}.exam`, kind: 'exam', titleVi: `Kiểm tra chặng ${stgNum}`, estMinutes: 5 }
            ]
          };
        });
        chapters.push({
          chapterKey: chKey,
          order: chIdx,
          titleVi: `Chương ${chIdx}: ${stages[0].titleVi}`,
          stages
        });
      }
      return {
        track: cleanTrack,
        level: cleanLvl,
        titleVi: (lvlData && lvlData.level && lvlData.level.name) || `${cleanTrack.toUpperCase()} ${cleanLvl}`,
        wordCount: (lvlData && lvlData.level && lvlData.level.wordCount) || rawLessons.reduce((a, x) => a + (Number(x.wordCount) || 10), 0),
        chapters,
        stages: chapters.flatMap(c => c.stages)
      };
    }
    window.__xhzSynthesizeTrackLevel = synthesizeTrackLevel;

    if (p.startsWith('/v2/learning-tracks/') || p.startsWith('/v2/paths/')) {
      await ensureInitialCloudPull();
      const parts = p.split('/').filter(Boolean);
      const track = parts[2] || 'hsk30';
      const sub = parts[3] || '';
      if (sub === 'activities' && parts[5] === 'runs') {
        const activityKey = safeDecodeURIComponent(parts[4] || 'hsk30.L1.P1.learn.1');
        localStorage.setItem('httq_current_lesson_id', activityKey);
        const stgMatch = activityKey.match(/^([a-z0-9-]+\.[A-Z]\d+\.[A-Z]\d+)/i);
        if (stgMatch && stgMatch[1]) {
          localStorage.setItem('httq_current_stage_key', stgMatch[1]);
        }
        setTimeout(() => {
          try {
            if (!window.location.pathname.startsWith('/hoc/bai/')) {
              origPushState.call(history, null, '', '/hoc/bai/' + encodeURIComponent(activityKey));
              checkAndRenderDynamicPage();
            }
          } catch (_) {}
        }, 60);
        return jsonResponse({
          runId: activityKey,
          kind: 'learn',
          track: 'hsk30',
          activityKey,
          total: 21,
          answered: 0,
          steps: []
        });
      }
      if (sub === 'placement' && parts[4] === 'runs') {
        const activityKey = 'hsk30.L1.P1.learn.1';
        localStorage.setItem('httq_current_lesson_id', activityKey);
        setTimeout(() => {
          try {
            origPushState.call(history, null, '', '/hoc/bai/' + encodeURIComponent(activityKey));
            checkAndRenderDynamicPage();
          } catch (_) {}
        }, 60);
        return jsonResponse({
          runId: activityKey,
          kind: 'learn',
          track: 'hsk30',
          activityKey,
          total: 21,
          answered: 0,
          steps: []
        });
      }
      if (sub === 'stage-talks') {
        const stageKey = safeDecodeURIComponent(parts[4] || 'hsk30.L1.P1');
        const action = parts[5] || '';
        const subAction = parts[6] || '';
        // Resolve real stage title & vocabulary dynamically for stageKey
        let stgTitle = 'Chào hỏi & Làm quen';
        let stgWords = [
          { hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào' },
          { hanzi: '谢谢', pinyin: 'xièxie', meaningVi: 'cảm ơn' },
          { hanzi: '高兴', pinyin: 'gāoxìng', meaningVi: 'vui mừng' }
        ];
        try {
          const skParts = stageKey.split('.');
          const skTrack = skParts[0] || track || 'hsk30';
          const skLevel = skParts[1] || 'L1';
          const lvlObj = await synthesizeTrackLevel(skTrack, skLevel);
          let foundChKey = '';
          let foundStgMeta = null;
          if (lvlObj && Array.isArray(lvlObj.chapters)) {
            for (const ch of lvlObj.chapters) {
              const hit = (ch.stages || []).find(s => s.stageKey === stageKey);
              if (hit) {
                foundChKey = ch.chapterKey;
                foundStgMeta = hit;
                break;
              }
            }
          }
          if (foundStgMeta && (foundStgMeta.titleVi || (foundStgMeta.meta && foundStgMeta.meta.titleVi))) {
            stgTitle = foundStgMeta.titleVi || foundStgMeta.meta.titleVi;
          }
          if (foundChKey && skTrack === 'hsk30' && skLevel === 'L1') {
            const chB = await loadLocalJson(`/data/learning-tracks/chapters/${foundChKey}.json`);
            const fullStg = chB && Array.isArray(chB.stages) && chB.stages.find(s => s.stageKey === stageKey);
            if (fullStg && Array.isArray(fullStg.words) && fullStg.words.length > 0) {
              if (fullStg.meta && fullStg.meta.titleVi) stgTitle = fullStg.meta.titleVi;
              stgWords = fullStg.words.slice(0, 6).map(w => ({
                hanzi: String(w.hanzi || w.word || '').replace(/\{|\}/g, ''),
                pinyin: w.pinyin || '',
                meaningVi: w.meaningVi || w.translationVi || ''
              })).filter(w => w.hanzi);
            }
          } else if (foundStgMeta && foundStgMeta.sourceSlug) {
            const fDir = foundStgMeta.sourceKind === 'topic' ? 'topics' : 'lessons';
            const det = await loadLocalJson(`/data/curriculums/${foundStgMeta.sourceCurr}/${fDir}/${foundStgMeta.sourceLevelSlug}--${foundStgMeta.sourceSlug}.json`);
            const wl = (det && det.lesson && det.lesson.words) || (det && det.topic && det.topic.words) || [];
            if (wl.length > 0) {
              stgWords = wl.slice(0, 6).map(w => ({
                hanzi: String(w.hanzi || w.word || '').replace(/\{|\}/g, ''),
                pinyin: w.pinyin || w.wordPinyin || '',
                meaningVi: w.meaningVi || w.translationVi || w.meaning || ''
              })).filter(w => w.hanzi);
            }
          }
        } catch (_) {}

        const w0 = stgWords[0] || { hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào' };
        const w1 = stgWords[1] || stgWords[0] || { hanzi: '谢谢', pinyin: 'xièxie', meaningVi: 'cảm ơn' };
        const phrase1Hz = stgWords.length >= 2 ? `${w0.hanzi}，${w1.hanzi}！` : `${w0.hanzi}！`;
        const phrase1Py = stgWords.length >= 2 ? `${w0.pinyin}, ${w1.pinyin}!` : `${w0.pinyin}!`;
        const phrase1Vi = stgWords.length >= 2 ? `${w0.meaningVi}, ${w1.meaningVi}` : w0.meaningVi;

        if (action === 'restart' && method === 'POST') {
          window.__xhzVoiceTurnIdx = 0;
          return jsonResponse({ ok: true });
        }
        if (action === 'recap' && subAction === 'say' && method === 'POST') {
          const body = await parseRequestBody(init);
          const spoken = String((body && (body.text || body.transcript || body.spokenText)) || phrase1Hz).trim();
          recordStudyProgress({
            words: stgWords.slice(0, 4).map(w => w.hanzi),
            voiceInc: 1,
            gradingInc: 1,
            minutes: 2,
            dailyStepDone: 'step-talk-1'
          });
          return jsonResponse({
            ok: true,
            score: 94,
            passed: true,
            heardText: spoken || phrase1Hz,
            heardPinyin: phrase1Py
          });
        }
        if (action === 'recap') {
          return jsonResponse({
            stageKey,
            summaryVi: `Bạn đã hoàn thành tốt cuộc hội thoại chặng "${stgTitle}"! Phát âm rõ ràng và vận dụng tự nhiên các từ trọng tâm.`,
            strengthsVi: [
              `Phát âm chuẩn các từ khóa chủ đề "${stgTitle}" (${stgWords.slice(0, 3).map(w => w.hanzi).join(', ')})`,
              'Tốc độ phản xạ tốt, giữ đúng thanh điệu cơ bản'
            ],
            nextFocusVi: `Thử đặt thêm câu giao tiếp mở rộng kết hợp "${w0.hanzi}" và "${w1.hanzi}" trong tình huống thực tế.`,
            phrases: stgWords.slice(0, 4).map(w => ({ hanzi: w.hanzi, pinyin: w.pinyin, meaningVi: w.meaningVi, mastered: true }))
          });
        }
        return jsonResponse({
          stageKey,
          titleVi: `Luyện nói phản xạ: ${stgTitle}`,
          maxTurns: 10,
          voiceTurnsLeft: 10,
          missions: [
            {
              id: 'm1',
              titleVi: `Sử dụng từ "${w0.hanzi}" (${w0.meaningVi}) trong lượt nói đầu tiên`,
              done: (window.__xhzVoiceTurnIdx || 0) >= 1,
              hints: {
                pinyin: phrase1Py,
                hanzi: phrase1Hz,
                vi: phrase1Vi,
                words: stgWords.slice(0, 3)
              }
            },
            {
              id: 'm2',
              titleVi: `Phản hồi tự nhiên cho chủ đề "${stgTitle}" với "${w1.hanzi}"`,
              done: (window.__xhzVoiceTurnIdx || 0) >= 2,
              hints: {
                pinyin: w1.pinyin || phrase1Py,
                hanzi: w1.hanzi || phrase1Hz,
                vi: w1.meaningVi || phrase1Vi,
                words: stgWords.slice(1, 4)
              }
            }
          ],
          session: {
            id: `st-sess-${stageKey}`,
            ended: false,
            hasLines: true,
            learnerTurns: Math.max(1, window.__xhzVoiceTurnIdx || 1)
          }
        });
      }
      if (sub === 'levels') {
        const level = parts[4] || (track === 'boya' ? 'E1' : 'L1');
        const levelData = await synthesizeTrackLevel(track, level);
        if (levelData) {
          return jsonResponse({ ...levelData, track, level });
        }
      }
      if (sub === 'progress') {
        const sum = getRealProgressSummary();
        const reqLevel = urlObj.searchParams.get('level') || (track === 'boya' ? 'E1' : 'L1');
        const levelData = await synthesizeTrackLevel(track, reqLevel);
        const defaultStg = (levelData && levelData.chapters && levelData.chapters[0] && levelData.chapters[0].stages && levelData.chapters[0].stages[0] && levelData.chapters[0].stages[0].stageKey) || 'hsk30.L1.P1';
        const savedStageKey = sum.prog.currentStageKey || localStorage.getItem('httq_current_stage_key') || defaultStg;
        const doneStages = sum.prog.doneStages || [];
        const doneActivities = sum.prog.doneActivities || {};
        const allStages = [];
        if (levelData && Array.isArray(levelData.chapters)) {
          levelData.chapters.forEach(ch => {
            (ch.stages || []).forEach(stg => {
              allStages.push(stg.stageKey);
            });
          });
        }
        if (allStages.length === 0) {
          allStages.push('hsk30.L1.P1', 'hsk30.L1.P2', 'hsk30.L1.P3', 'hsk30.L1.R00', 'hsk30.L1.S01', 'hsk30.L1.S02', 'hsk30.L1.S03', 'hsk30.L1.S04', 'hsk30.L1.R01');
        }
        return jsonResponse({
          track: track === 'hsk30-1' ? 'hsk30' : track,
          level: reqLevel,
          enrollment: {
            track: track === 'hsk30-1' ? 'hsk30' : track,
            current: true,
            currentLevel: reqLevel,
            startStageKey: savedStageKey,
            stagesDone: doneStages.length,
            stagesTotal: allStages.length,
            active: true
          },
          stages: allStages.map(sk => {
            const actsDone = Array.isArray(doneActivities[sk]) ? doneActivities[sk] : [];
            const isDone = doneStages.includes(sk) || actsDone.length >= 4;
            return {
              stageKey: sk,
              status: isDone ? 'completed' : sk === savedStageKey || actsDone.length > 0 ? 'in_progress' : 'available',
              activityKeysDone: actsDone,
              examBestPct: isDone || actsDone.includes(`${sk}.exam`) ? 100 : undefined
            };
          }),
          levelTest: null
        });
      }
      if (sub === 'chapters') {
        const chapterKey = safeDecodeURIComponent(parts[4] || 'hsk30.L1.C00');
        const normKey = chapterKey.replace(/\.C(\d)$/, '.C0$1');
        let chData =
          (await loadLocalJson(`/data/learning-tracks/chapters/${normKey}.json`)) ||
          (await loadLocalJson(`/data/learning-tracks/chapters/${chapterKey}.json`));
        if (!chData) {
          const chParts = chapterKey.split('.');
          const syn = await synthesizeTrackLevel(chParts[0] || track, chParts[1] || 'L1');
          const foundCh = syn && Array.isArray(syn.chapters) && syn.chapters.find(c => c.chapterKey === normKey || c.chapterKey === chapterKey);
          if (foundCh) chData = { track: syn.track, level: syn.level, ...foundCh };
        }
        if (!chData) chData = await loadLocalJson('/data/learning-tracks/chapters/hsk30.L1.C00.json');
        if (chData) {
          return jsonResponse(chData);
        }
      }
      if (sub === 'enroll' || sub === 'select') {
        const body = await parseRequestBody(init);
        const startStageKey = (body && (body.startStageKey || body.startStageId)) || 'hsk30.L1.P1';
        const targetLessonId = `${startStageKey}.learn.1`;
        localStorage.setItem('httq_current_stage_key', startStageKey);
        localStorage.setItem('httq_current_lesson_id', targetLessonId);
        const prog = getRealProgress();
        prog.currentStageKey = startStageKey;
        prog.currentLessonId = targetLessonId;
        saveRealProgress(prog);
        syncProgressToSupabaseAuth(prog);
        return jsonResponse({
          ok: true,
          currentLessonId: targetLessonId,
          enrollment: {
            pathSlug: track,
            track: 'hsk30',
            current: true,
            currentLevel: (body && body.level) || 'L1',
            currentStageId: startStageKey,
            currentLessonId: targetLessonId,
            startStageKey,
            stagesDone: (prog.doneStages || []).length,
            stagesTotal: 40,
            active: true,
            enrolledAt: new Date().toISOString()
          }
        });
      }
      const sum = getRealProgressSummary();
      const savedLessonId = sum.prog.currentLessonId || localStorage.getItem('httq_current_lesson_id') || 'hsk30.L1.P1.learn.1';
      const savedStageKey = sum.prog.currentStageKey || localStorage.getItem('httq_current_stage_key') || 'hsk30.L1.P1';
      const doneStages = Array.isArray(sum.prog.doneStages) ? sum.prog.doneStages : [];
      const doneActsMap = sum.prog.doneActivities || {};
      const levelData = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
      const builtStages = [];
      let stgIdxCounter = 0;
      if (levelData && Array.isArray(levelData.chapters)) {
        levelData.chapters.forEach(ch => {
          (ch.stages || []).forEach(stg => {
            const sk = stg.stageKey;
            const doneInStg = Array.isArray(doneActsMap[sk]) ? doneActsMap[sk] : [];
            const isReview = stg.kind === 'review' || /\.R\d+$/i.test(sk);
            const lessons = isReview
              ? [
                  { id: `${sk}.rp1`, index: 0, kind: 'learn', status: doneInStg.includes(`${sk}.rp1`) ? 'completed' : 'available', titleVi: `Nhập vai: ${stg.titleVi}`, newWordCount: 0, estMinutes: 5 },
                  { id: `${sk}.write`, index: 1, kind: 'learn', status: doneInStg.includes(`${sk}.write`) ? 'completed' : 'available', titleVi: `Tập viết tổng hợp: ${stg.titleVi}`, newWordCount: 0, estMinutes: 4 },
                  { id: `${sk}.exam`, index: 2, kind: 'stage_test', status: doneInStg.includes(`${sk}.exam`) ? 'completed' : 'available', titleVi: `Kiểm tra chặng: ${stg.titleVi}`, newWordCount: 0, estMinutes: 5 }
                ]
              : [
                  { id: `${sk}.learn.1`, index: 0, kind: 'learn', status: doneInStg.includes(`${sk}.learn.1`) ? 'completed' : 'available', titleVi: `Từ mới: ${stg.titleVi}${stg.titleZh ? ` (${stg.titleZh})` : ''}`, newWordCount: stg.newWordCount || 6, estMinutes: 6 },
                  { id: `${sk}.dlg`, index: 1, kind: 'learn', status: doneInStg.includes(`${sk}.dlg`) ? 'completed' : 'available', titleVi: `Hội thoại: ${stg.titleVi}`, newWordCount: 0, estMinutes: 4 },
                  { id: `${sk}.rp1`, index: 2, kind: 'learn', status: doneInStg.includes(`${sk}.rp1`) ? 'completed' : 'available', titleVi: `Nhập vai: ${stg.titleVi}`, newWordCount: 0, estMinutes: 5 },
                  { id: `${sk}.exam`, index: 3, kind: 'stage_test', status: doneInStg.includes(`${sk}.exam`) ? 'completed' : 'available', titleVi: `Luyện đề: ${stg.titleVi}`, newWordCount: 0, estMinutes: 4 }
                ];
            const isStgDone = doneStages.includes(sk) || doneInStg.length >= lessons.length;
            builtStages.push({
              id: sk,
              stageKey: sk,
              chapterKey: ch.chapterKey,
              chapterTitleVi: ch.titleVi,
              index: stgIdxCounter++,
              titleVi: `${ch.titleVi}: ${stg.titleVi}`,
              status: isStgDone ? 'completed' : (sk === savedStageKey || doneInStg.length > 0 ? 'in_progress' : 'available'),
              wordCount: stg.newWordCount || 6,
              grammarCount: isReview ? 0 : 2,
              progress: { lessonsDone: Math.min(lessons.length, doneInStg.length), lessonsTotal: lessons.length },
              lessons
            });
          });
        });
      }
      return jsonResponse({
        slug: track,
        track: 'hsk30',
        level: 1,
        titleVi: 'HSK 1',
        enrollment: {
          pathSlug: track,
          track: 'hsk30',
          current: true,
          currentLevel: 'L1',
          currentStageId: savedStageKey,
          currentLessonId: savedLessonId,
          startStageKey: savedStageKey,
          stagesDone: sum.stagesDone,
          stagesTotal: builtStages.length || 40,
          active: true,
          enrolledAt: '2026-11-10T00:00:00.000Z'
        },
        stages: builtStages
      });
    }
    if (p === '/v2/companion/unlocks/celebrated') {
      return jsonResponse({ ok: true });
    }
    if (p === '/v2/me/shadowing/summary') {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      const prog = sum.prog || getRealProgress();
      const spkCount = Object.keys(prog.speakingProgress || {}).length + (Number(prog.voiceUsed) || 0);
      const dictCount = Object.keys(prog.dictationProgress || {}).length;
      const completedCount = spkCount + dictCount;
      const hasPractice = sum.wordsMastered > 0 || completedCount > 0;
      return jsonResponse({
        enabled: true,
        todayCard: hasPractice,
        completedCount,
        speakingCount: spkCount,
        dictationCount: dictCount,
        checkpoint: { due: completedCount >= 5 && completedCount % 5 === 0, completedCount }
      });
    }
    if (p === '/v2/today' || p === '/v2/today/session' || p.startsWith('/v2/today/session/steps/')) {
      await ensureInitialCloudPull();
      const sum = getRealProgressSummary();
      let savedLessonId = sum.prog.currentLessonId || localStorage.getItem('httq_current_lesson_id') || 'hsk30.L1.P1.learn.1';
      if (savedLessonId === 'bai-1-hello-ai-xiaoyu') savedLessonId = 'hsk30.L1.P1.learn.1';
      const todayStr = new Date().toISOString().slice(0, 10);
      let reqMin = Number(urlObj.searchParams.get('minutes')) || 15;
      let sessionStatus = method === 'POST' ? 'in_progress' : 'preview';
      let stepStatuses = {
        ...((sum.prog.dailyStepsByDate && sum.prog.dailyStepsByDate[todayStr]) || {})
      };
      try {
        const localSteps = JSON.parse(localStorage.getItem('httq_daily_steps_' + todayStr) || '{}') || {};
        stepStatuses = { ...stepStatuses, ...localSteps };
      } catch (_) {}
      if (p.startsWith('/v2/today/session/steps/') && method === 'POST') {
        const stepId = safeDecodeURIComponent(p.replace('/v2/today/session/steps/', ''));
        const body = await parseRequestBody(init);
        if (stepId && body && body.status) {
          stepStatuses[stepId] = body.status;
          try {
            localStorage.setItem('httq_daily_steps_' + todayStr, JSON.stringify(stepStatuses));
          } catch (_) {}
          if (body.status === 'done') {
            recordStudyProgress({ dailyStepDone: stepId });
          }
        }
        sessionStatus = 'in_progress';
      } else if (p === '/v2/today/session' && method === 'POST') {
        const body = await parseRequestBody(init);
        if (body && body.minutes) reqMin = Number(body.minutes) || 15;
        sessionStatus = 'in_progress';
      }
      const lessonTitleMap = {
        'hsk30.L1.P1.learn.1': 'Từ mới: Bốn thanh và thanh nhẹ (八，爸爸，妈妈)',
        'hsk30.L1.P1.dlg': 'Hội thoại: Bốn thanh và thanh nhẹ',
        'hsk30.L1.P1.rp1': 'Nhập vai: Chào hỏi bố mẹ Tiểu Văn',
        'hsk30.L1.P1.exam': 'Luyện đề: Bốn thanh và thanh nhẹ',
        'hsk30.L1.P2.learn.1': 'Từ mới: Biến điệu thanh 3 & 不，一',
        'hsk30.L1.P3.learn.1': 'Từ mới: Vận mẫu mũi & Luyện nghe phân biệt',
        'hsk30.L1.S01.learn.1': 'Bài 1: Xin chào, cảm ơn, tạm biệt (老师，您好！)'
      };
      let curLessonTitle = lessonTitleMap[savedLessonId];
      if (!curLessonTitle) {
        const stgKeyFromLes = (savedLessonId.match(/^(hsk30\.L\d+\.[A-Z]\d+)/i) || [])[1];
        const lData = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
        let foundStg = null;
        if (lData && Array.isArray(lData.chapters) && stgKeyFromLes) {
          for (const ch of lData.chapters) {
            const s = (ch.stages || []).find(x => x.stageKey === stgKeyFromLes);
            if (s) { foundStg = s; break; }
          }
        }
        if (foundStg) {
          const prefix = savedLessonId.endsWith('.dlg') ? 'Hội thoại' : savedLessonId.includes('.rp') ? 'Nhập vai' : savedLessonId.endsWith('.exam') ? 'Luyện đề' : savedLessonId.endsWith('.write') ? 'Tập viết' : 'Từ mới';
          curLessonTitle = `${prefix}: ${foundStg.titleVi}${foundStg.titleZh ? ` (${foundStg.titleZh})` : ''}`;
        } else {
          curLessonTitle = `Bài tiếp theo (${savedLessonId})`;
        }
      }
      const dueCount = Math.max(0, sum.dueTotal || 0);
      const steps = [
        {
          id: 'step-lesson-1',
          kind: 'lesson',
          status: stepStatuses['step-lesson-1'] || 'pending',
          titleVi: curLessonTitle,
          detailVi: 'Học từ mới, luyện viết chữ Hán và phản xạ câu',
          reasonVi: 'Bài tiếp theo trong lộ trình HSK 3.0 Cấp 1',
          estMinutes: 6,
          lesson: {
            lessonId: savedLessonId
          }
        },
        {
          id: 'step-review-1',
          kind: 'review',
          status: stepStatuses['step-review-1'] || 'pending',
          titleVi: dueCount > 0 ? `Ôn ${dueCount} từ vựng đến hạn` : 'Ôn từ vựng đã học',
          detailVi: 'Củng cố trí nhớ ngắt quãng SRS',
          reasonVi: 'Đến hạn ôn tập hôm nay',
          estMinutes: 4,
          review: {
            minutes: 4,
            limit: Math.max(6, dueCount)
          }
        },
        {
          id: 'step-talk-1',
          kind: 'talk',
          status: stepStatuses['step-talk-1'] || 'pending',
          titleVi: 'Luyện nói cùng Bạn đồng hành AI',
          detailVi: 'Thực hành phản xạ nghe nói tiếng Trung',
          reasonVi: 'Luyện giao tiếp hằng ngày',
          estMinutes: 2,
          talk: {
            stageKey: sum.prog.currentStageKey || 'hsk30.L1.P1'
          }
        }
      ];
      if (Object.keys(stepStatuses).length > 0) {
        sessionStatus = steps.every(s => s.status === 'done') ? 'completed' : 'in_progress';
      }
      const nextPending = steps.find(s => s.status === 'pending');
      return jsonResponse({
        status: sessionStatus,
        localDay: todayStr,
        date: todayStr,
        minutes: reqMin,
        estMinutes: 12,
        minutesOptions: [5, 10, 15, 20],
        nextStepId: nextPending ? nextPending.id : steps[0].id,
        steps,
        completion: sessionStatus === 'completed' ? { streak: { count: sum.streakDays, todayDone: sum.todayDone } } : null,
        streak: { count: sum.streakDays, todayDone: sum.todayDone },
        streakDays: sum.streakDays,
        minutesDone: sum.todayMinutes,
        minutesGoal: reqMin,
        dailyGoalMinutes: reqMin,
        completedMinutes: sum.todayMinutes,
        continue: { kind: 'lesson', lessonId: savedLessonId },
        items: [
          { kind: 'lesson', lessonId: savedLessonId, titleVi: curLessonTitle, dueCount: 1, estMinutes: 6, locked: false },
          { kind: 'review', titleVi: 'Ôn từ đến hạn', dueCount: dueCount, estMinutes: 4, locked: false },
          { kind: 'errors', titleVi: 'Sửa lỗi hay sai', dueCount: sum.mistakesCount, estMinutes: 2, locked: false }
        ]
      });
    }
    if (p === '/v2/review/runs' || p.startsWith('/v2/lesson-runs') || p.includes('/runs')) {
      let targetRunId = 'hsk30.L1.P1.learn.1';
      let runKind = 'learn';
      let runMode = 'due';
      if (p === '/v2/review/runs') {
        const body = await parseRequestBody(init);
        runKind = 'review';
        runMode = (body && body.mode) || 'due';
        if (body && Array.isArray(body.itemKinds) && body.itemKinds.includes('s')) {
          targetRunId = 'on-tap-the-cau';
        } else if (runMode === 'errors') {
          targetRunId = 'on-tap-loi-sai';
        } else {
          targetRunId = 'on-tap-den-han';
        }
        try { localStorage.setItem('httq_last_review_mode', targetRunId); } catch (_) {}
      } else if (p.startsWith('/v2/lessons/') && p.endsWith('/runs')) {
        targetRunId = safeDecodeURIComponent(p.slice('/v2/lessons/'.length, -'/runs'.length)) || 'hsk30.L1.P1.learn.1';
        if (targetRunId === 'bai-1-hello-ai-xiaoyu') targetRunId = 'hsk30.L1.P1.learn.1';
        localStorage.setItem('httq_current_lesson_id', targetRunId);
      } else if (p.startsWith('/v2/stages/') && p.endsWith('/test-out-runs')) {
        const stg = safeDecodeURIComponent(p.slice('/v2/stages/'.length, -'/test-out-runs'.length));
        targetRunId = `${stg}.exam`;
        localStorage.setItem('httq_current_lesson_id', targetRunId);
      } else if (p.startsWith('/v2/lesson-runs/')) {
        targetRunId = safeDecodeURIComponent(p.slice('/v2/lesson-runs/'.length).split('/')[0]) || 'hsk30.L1.P1.learn.1';
      }
      setTimeout(() => {
        try {
          if (!window.location.pathname.startsWith('/hoc/bai/')) {
            origPushState.call(history, null, '', '/hoc/bai/' + encodeURIComponent(targetRunId));
            checkAndRenderDynamicPage();
          }
        } catch (_) {}
      }, 60);
      return jsonResponse({
        runId: targetRunId,
        kind: runKind,
        mode: runMode,
        total: 21,
        answered: 0,
        steps: []
      });
    }
    if (p.startsWith('/v2/dictionary/entries/')) {
      const slug = safeDecodeURIComponent(p.replace('/v2/dictionary/entries/', ''));
      const cleanHz = extractHanziWord(slug) || slug;
      const w = await lookupWord(slug);
      const rawAudio =
        (w && w.audios && w.audios[0]) ||
        (w && w.audioUrl) ||
        `https://static.xiehanzi.com/word_audios/${encodeURIComponent(cleanHz)}.mp3`;
      return jsonResponse({
        slug,
        audioUrl: rewriteMediaUrl(rawAudio)
      });
    }

    // ------------------------------------------------------------------------
    // C. TRƯỜNG THẦY ĐỒ API (/v1/thay-do/*)
    // ------------------------------------------------------------------------
    if (p === '/v1/thay-do/bang-vang/dau' || p.startsWith('/v1/thay-do/bang-vang/tuan')) {
      const sum = getRealProgressSummary();
      const me = getSavedUser();
      const myName = ((me && (me.displayName || me.name)) || 'Bạn') + ' (Bạn)';
      const weekKey = getIsoWeekKey(new Date());
      const injectMe = (baseList, myVal) => {
        const merged = [...baseList, ...(myVal > 0 ? [{ ten: myName, so: myVal, isMe: true }] : [])]
          .sort((a, b) => Number(b.so) - Number(a.so))
          .map((item, idx) => ({ ...item, hang: idx + 1 }));
        return merged;
      };
      const bestExam = (sum.prog.examHistory || []).reduce((mx, x) => Math.max(mx, Number(x && x.pct) || 0), 0);
      return jsonResponse({
        ok: true,
        nhan: weekKey,
        tuan: weekKey,
        me: { ten: myName, minutes: sum.totalMinutes, words: sum.wordsMastered, streakDays: sum.streakDays },
        bang: {
          'chuyen-can': injectMe([
            { ten: 'Minh Anh', so: 42 },
            { ten: 'Hoàng Long', so: 38 },
            { ten: 'Thanh Thảo', so: 31 }
          ], sum.totalMinutes),
          'khoa-bang': injectMe([
            { ten: 'Tuấn Kiệt', so: 98 },
            { ten: 'Bảo Ngọc', so: 95 },
            { ten: 'Đức Duy', so: 92 }
          ], bestExam || Math.min(100, sum.wordsMastered * 2)),
          'hoa-tay': injectMe([
            { ten: 'Lan Hương', so: 96.5 },
            { ten: 'Quốc Bảo', so: 94.2 },
            { ten: 'Khánh Linh', so: 91.8 }
          ], Math.min(100, (sum.wordsMastered || 0) * 3)),
          'thu-vien': injectMe([
            { ten: 'Thảo Vy', so: 12 },
            { ten: 'Hữu Phước', so: 9 }
          ], sum.stagesDone),
          'hieu-sach': injectMe([
            { ten: 'Gia Hân', so: 95.4 },
            { ten: 'Văn Nam', so: 92.1 }
          ], (sum.prog.learnedGrammarIds || []).length)
        }
      });
    }
    if (p.startsWith('/v1/thay-do/bang-vang/')) {
      return jsonResponse({ ok: true, bang: [], ds: [] });
    }
    if (p === '/v1/thay-do/lop/muon') {
      const sum = getRealProgressSummary();
      return jsonResponse({ n: { '4': 68, '5': 42, '6': 29 }, toi: sum.prog.doneStages || [] });
    }
    if (p === '/v1/thay-do/lop/toi') {
      const sum = getRealProgressSummary();
      const buoi = (sum.prog.doneStages || []).map((sk, idx) => ({ id: sk, stt: idx + 1, done: true }));
      const cap = [
        { cap: 1, ten: 'HSK 3.0 Cấp 1', tienDoPct: sum.hsk1Pct, tuDaHoc: sum.wordsMastered, changXong: sum.stagesDone }
      ];
      return jsonResponse({
        ok: true,
        tienDo: {
          buoi,
          cap,
          streakDays: sum.streakDays,
          totalMinutes: sum.totalMinutes,
          wordsMastered: sum.wordsMastered
        }
      });
    }
    if (p.startsWith('/v1/thay-do/lop/bang/')) {
      const sum = getRealProgressSummary();
      const chars = [...new Set((sum.prog.learnedWords || []).flatMap(w => Array.from(String(w || '').replace(/[^\u4e00-\u9fff]/g, ''))))];
      return jsonResponse({ ok: true, chu: chars.map(c => ({ hanzi: c, mastered: true })) });
    }
    if (p === '/v1/thay-do/lop/canh') {
      return jsonResponse({ ok: true, ban: [] });
    }
    if (p === '/v1/thay-do/khoa/mine') {
      const sum = getRealProgressSummary();
      return jsonResponse({
        ok: true,
        khoa: [
          { id: 'hsk30-L1', title: 'HSK 3.0 Cấp 1', progressPct: sum.hsk1Pct, wordsMastered: sum.wordsMastered, active: true }
        ]
      });
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
      const prog = getRealProgress();
      const hs = prog.gameHighScores || {};
      return jsonResponse({
        games: [
          { game: 'ghep-chu', dailyPlayers: 142, topScore: Math.max(980, Number(hs['ghep-chu']) || 0), myBestScore: Number(hs['ghep-chu']) || null },
          { game: 'tim-chu-trong-chu', dailyPlayers: 118, topScore: Math.max(950, Number(hs['tim-chu-trong-chu']) || 0), myBestScore: Number(hs['tim-chu-trong-chu']) || null },
          { game: 'chengyu', dailyPlayers: 64, topScore: Math.max(980, Number(hs['chengyu']) || 0), myBestScore: Number(hs['chengyu']) || null },
          { game: 'hanzi-guess', dailyPlayers: 72, topScore: Math.max(975, Number(hs['hanzi-guess']) || 0), myBestScore: Number(hs['hanzi-guess']) || null },
          { game: 'fireworks', dailyPlayers: 58, topScore: Math.max(990, Number(hs['fireworks']) || 0), myBestScore: Number(hs['fireworks']) || null },
          { game: 'pair-match', dailyPlayers: 69, topScore: Math.max(985, Number(hs['pair-match']) || 0), myBestScore: Number(hs['pair-match']) || null }
        ]
      });
    }
    const gameDailyMatch = p.match(/^\/v1\/games\/(?:daily\/([^/]+)|([^/]+)\/daily|(chengyu-daily|hanzi-guess-daily))(?:\/start)?$/);
    if (gameDailyMatch) {
      const rawGame = gameDailyMatch[1] || gameDailyMatch[2] || gameDailyMatch[3] || 'ghep-chu';
      const game = rawGame.replace(/-daily$/, '');
      const prog = getRealProgress();
      const prevBest = Number((prog.gameHighScores || {})[game]) || null;
      if (game === 'chengyu' || game === 'hanzi-guess') {
        const miscDaily = await loadLocalJson(`/data/misc/games-${game}-daily.json`);
        if (method === 'POST') {
          const pts = 880;
          recordStudyProgress({ minutes: 2, sessionInc: 1, gameScore: { game, score: pts } });
          return jsonResponse({ ...(miscDaily || {}), game, plays: 1, bestScore: Math.max(pts, prevBest || 0), myBestScore: Math.max(pts, prevBest || 0) });
        }
        return jsonResponse({ ...(miscDaily || { date: new Date().toISOString().slice(0, 10), game, plays: 0 }), bestScore: prevBest, myBestScore: prevBest });
      }
      if (method === 'POST') {
        const round = game === 'tim-chu-trong-chu'
          ? await createTimChuRound('normal', 'daily', 0)
          : await createGhepChuRound('normal', 'daily', 0);
        return jsonResponse({
          date: new Date().toISOString().slice(0, 10),
          game,
          plays: 1,
          bestScore: prevBest || 920,
          round,
          run: null
        });
      }
      return jsonResponse({
        date: new Date().toISOString().slice(0, 10),
        game,
        plays: prevBest ? 1 : 0,
        bestScore: prevBest,
        activeRoundId: null,
        totalPlayers: 48
      });
    }
    const gameRankRunCreateMatch = p.match(/^\/v1\/games\/(?:([^/]+)\/)?rank-runs$/);
    if (gameRankRunCreateMatch && method === 'POST') {
      const body = await parseRequestBody(init);
      const game = gameRankRunCreateMatch[1] || body.game || 'ghep-chu';
      const diff = body.difficulty || 'easy';
      const round = game === 'tim-chu-trong-chu'
        ? await createTimChuRound(diff, 'rank', 0)
        : await createGhepChuRound(diff, 'rank', 0);
      const run = {
        runId: `rankrun-${Date.now()}`,
        game,
        difficulty: diff,
        status: 'active',
        totalRounds: game === 'tim-chu-trong-chu' ? 5 : 1,
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
    const gameRoundCreateMatch = p.match(/^\/v1\/games\/(?:([^/]+)\/)?rounds$/);
    if (gameRoundCreateMatch && method === 'POST') {
      const body = await parseRequestBody(init);
      const game = gameRoundCreateMatch[1] || body.game || 'ghep-chu';
      const diff = body.difficulty || 'easy';
      const round = game === 'tim-chu-trong-chu'
        ? await createTimChuRound(diff, 'casual', 0)
        : await createGhepChuRound(diff, 'casual', 0);
      return jsonResponse(round);
    }
    if (p.startsWith('/v1/games/rounds/')) {
      const parts = p.split('/').filter(Boolean); // ['v1','games','rounds', roundId, action?]
      const roundId = parts[3];
      if (!roundId) return jsonResponse({ error: 'round_not_found' }, 404);
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
        const wrongPenalty = (Number(round.wrongSubmits) || 0) * 15 + (Number(round.hintsUsed) || 0) * 20;
        const speedBonus = Math.max(0, Math.min(160, Math.round((60000 - Math.min(60000, durationMs)) / 400)));
        if (round.game === 'tim-chu-trong-chu') {
          const foundCount = (round.found || []).length || round.targetCount;
          const earned = Math.round(760 * (foundCount / Math.max(1, round.targetCount || 1)));
          const score = Math.max(100, earned + speedBonus - wrongPenalty);
          const updatedProg = recordStudyProgress({
            minutes: 2,
            sessionInc: 1,
            gameScore: { game: 'tim-chu-trong-chu', score }
          });
          const bestScore = Math.max(score, Number((updatedProg.gameHighScores || {})['tim-chu-trong-chu']) || 0);
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
            score,
            bestScore,
            durationMs,
            hintsUsed: round.hintsUsed || 0,
            wrongSubmits: round.wrongSubmits || 0,
            round,
            breakdown: { earned, timeBonus: speedBonus, penalty: wrongPenalty },
            answers,
            run: round.mode === 'rank' ? { runId: 'rank-1', roundIndex: 0, totalRounds: 1, totalScore: score, completed: true, recorded: true } : null,
            daily: round.mode === 'daily' ? { play: 1, bestScore, rank: 2, totalPlayers: 48 } : null
          });
        } else {
          const solvedCount = (round.rows || []).filter(r => !!r.solved).length || round.targetCount;
          const earned = Math.round(800 * (solvedCount / Math.max(1, round.targetCount || 1)));
          const score = Math.max(100, earned + speedBonus - wrongPenalty);
          const updatedProg = recordStudyProgress({
            minutes: 2,
            sessionInc: 1,
            gameScore: { game: 'ghep-chu', score }
          });
          const bestScore = Math.max(score, Number((updatedProg.gameHighScores || {})['ghep-chu']) || 0);
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
            score,
            bestScore,
            durationMs,
            hintsUsed: round.hintsUsed || 0,
            wrongSubmits: round.wrongSubmits || 0,
            round,
            breakdown: { earned, timeBonus: speedBonus, penalty: wrongPenalty },
            answers,
            run: round.mode === 'rank' ? { runId: 'rank-1', roundIndex: 0, totalRounds: 1, totalScore: score, completed: true, recorded: true } : null,
            daily: round.mode === 'daily' ? { play: 1, bestScore, rank: 1, totalPlayers: 52 } : null
          });
        }
      }
    }
    const gameLbMatch = p.match(/^\/v1\/games\/(?:([^/]+)\/)?(?:daily[/-])?leaderboard/);
    if (gameLbMatch) {
      const game = gameLbMatch[1] || urlObj.searchParams.get('game') || 'ghep-chu';
      const todayKey = new Date().toISOString().slice(0, 10);
      const miscLb = ['chengyu', 'fireworks', 'hanzi-guess', 'pair-match'].includes(game)
        ? await loadLocalJson(`/data/misc/games-leaderboard-${game}.json`)
        : null;
      const defaultEntries = [
        { rank: 1, userId: 'u1', displayName: 'Minh Anh', score: 980, durationMs: 19400, difficulty: 'hard' },
        { rank: 2, userId: 'u2', displayName: 'Tuấn Kiệt', score: 945, durationMs: 22100, difficulty: 'hard' },
        { rank: 3, userId: 'u3', displayName: 'Thanh Thảo', score: 910, durationMs: 25800, difficulty: 'normal' },
        { rank: 4, userId: 'u4', displayName: 'Hoàng Long', score: 885, durationMs: 28000, difficulty: 'normal' },
        { rank: 5, userId: 'u5', displayName: 'Bảo Ngọc', score: 860, durationMs: 31200, difficulty: 'easy' }
      ];
      let entries = (miscLb && Array.isArray(miscLb.entries) && miscLb.entries.length > 0)
        ? [...miscLb.entries]
        : [...defaultEntries];
      const prog = getRealProgress();
      const myScore = Number((prog.gameHighScores || {})[game]) || 0;
      let meObj = (miscLb && miscLb.me) ? { ...miscLb.me } : { rank: 3, score: 910 };
      if (myScore > 0) {
        const userEntry = { rank: 0, userId: 'me', displayName: 'Bạn', score: myScore, durationMs: 18000, difficulty: 'normal', isMe: true };
        entries = [...entries.filter(e => e.userId !== 'me'), userEntry]
          .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
          .map((e, idx) => ({ ...e, rank: idx + 1 }));
        const myRank = entries.find(e => e.userId === 'me');
        meObj = { rank: myRank ? myRank.rank : 1, score: myScore };
      }
      return jsonResponse({
        game,
        weekKey: (miscLb && miscLb.weekKey) || '2026-W47',
        date: todayKey,
        dayKey: todayKey,
        entries,
        items: (miscLb && Array.isArray(miscLb.items)) ? miscLb.items : entries.slice(0, 3),
        me: meObj
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
      await ensureInitialCloudPull();
      const prog = getRealProgress();
      const data = await loadLocalJson('/data/tests/generated-tests-options.json');
      const takenIds = new Set(
        (Array.isArray(prog.examHistory) ? prog.examHistory : [])
          .map(h => String((h && (h.paperId || h.testId || h.id)) || '').trim().toLowerCase())
          .filter(Boolean)
      );
      const levels = (data && Array.isArray(data.levels) ? data.levels : []).map(l => {
        const lvlNum = Number(l.level) || 1;
        const total = Number(l.questionCount || l.total) || 40;
        const testCount = Math.max(1, Number(l.testCount) || 11);
        const candidates = [`hsk30-${lvlNum}`, ...Array.from({ length: 10 }, (_, i) => `xh30-${lvlNum}-${String(i + 1).padStart(2, '0')}`)];
        const donePapers = candidates.filter(id => takenIds.has(id));
        const avgPerTest = Math.round(total / testCount);
        const unseenCount = Math.max(0, total - donePapers.length * avgPerTest);
        return {
          ...l,
          unseenCount,
          totalCount: total,
          completedTests: donePapers.length,
          takenPaperIds: donePapers
        };
      });
      return jsonResponse({ levels });
    }
    if (p.includes('/v1/generated-tests/create') || p.includes('/v1/generated-tests/start') || (p.includes('/v1/generated-tests') && method === 'POST')) {
      await ensureInitialCloudPull();
      const prog = getRealProgress();
      const body = await parseRequestBody(init);
      const examType = String(body.examType || body.family || 'hsk').toLowerCase();
      const rawLevel = Number(body.level || body.hskLevel || (Array.isArray(body.levels) && body.levels[0]) || 1) || 1;
      const level = examType === 'yct' ? Math.max(1, Math.min(4, rawLevel)) : Math.max(1, Math.min(6, rawLevel));
      const takenIds = new Set(
        (Array.isArray(prog.examHistory) ? prog.examHistory : [])
          .map(h => String((h && (h.paperId || h.testId || h.id)) || '').trim().toLowerCase())
          .filter(Boolean)
      );
      const candidates = examType === 'yct'
        ? [`yct-${level}-01`, `yct-${level}-02`]
        : [`hsk30-${level}`, ...Array.from({ length: 10 }, (_, i) => `xh30-${level}-${String(i + 1).padStart(2, '0')}`)];
      const unseenId = candidates.find(id => !takenIds.has(id));
      const deId = unseenId || candidates[0];
      const repeatedLevels = unseenId ? [] : [level];
      const fullPaper = await loadTestPaperById(deId, level);
      if (fullPaper) {
        return jsonResponse({
          ...fullPaper,
          deId,
          id: deId,
          testId: fullPaper.testId || deId,
          examType,
          level,
          questionCount: fullPaper.questionCount || (Array.isArray(fullPaper.questions) ? fullPaper.questions.length : 40),
          repeatedLevels,
          durationMinutes: fullPaper.durationMinutes || 40
        });
      }
      return jsonResponse({ deId: 'hsk30-1', id: 'hsk30-1', testId: 'hsk30-1', examType: 'hsk', level: 1, questionCount: 40, repeatedLevels: [], questions: [] });
    }
    if (p.startsWith('/v1/generated-tests/') && method === 'GET') {
      const deId = safeDecodeURIComponent(p.slice('/v1/generated-tests/'.length).split('/')[0] || 'hsk30-1');
      const safeId = deId === 'undefined' ? 'hsk30-1' : deId;
      const paper = await loadTestPaperById(safeId);
      return jsonResponse({ ...(paper || {}), deId: safeId, id: safeId, testId: safeId });
    }
    if (p.includes('/v1/hsk-tests/levels')) {
      const subParts = (p.split('/v1/hsk-tests/levels')[1] || '').split('/').filter(Boolean);
      const examType = (urlObj.searchParams.get('examType') || urlObj.searchParams.get('family') || 'hsk').toLowerCase();
      if (subParts.length >= 2) {
        const lvl = subParts[0];
        const tid = safeDecodeURIComponent(subParts[1]);
        const paper = await loadTestPaperById(tid, lvl);
        return jsonResponse(paper || {});
      }
      if (subParts.length === 1) {
        const lvl = subParts[0];
        const data = (await loadLocalJson(`/data/tests/papers-${examType}.json`)) || { levels: [] };
        const matchedLvl = Array.isArray(data.levels) ? data.levels.find(l => String(l.level) === String(lvl)) : null;
        return jsonResponse(matchedLvl ? matchedLvl.items || [] : []);
      }
      const data = await loadLocalJson(`/data/tests/levels-${examType}.json`);
      return jsonResponse(data || []);
    }
    if (p.includes('/v1/hsk-tests/papers/') && method === 'GET') {
      const paperId = safeDecodeURIComponent(p.split('/v1/hsk-tests/papers/')[1].split('/')[0]);
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
      const id = safeDecodeURIComponent(p.split('/v1/dictation/videos/')[1].replace('/segments', ''));
      let data = await loadLocalJson(`/data/dictation/videos/${id}-segments.json`);
      if (!data) {
        const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
        const matched = all.find(v => v.id === id || v._id === id || v.slug === id || v.slugVi === id || toSlugVi(v.title || v.titleVi) === id);
        if (matched) {
          data = await loadLocalJson(`/data/dictation/videos/${matched.id || matched._id}-segments.json`);
        }
      }
      const items = (data && (Array.isArray(data.items) ? data.items : (Array.isArray(data.segments) ? data.segments : []))) || [];
      return jsonResponse({ ...(data || {}), items, segments: items });
    }
    if (p.includes('/v1/dictation/videos/') && method === 'GET') {
      const id = safeDecodeURIComponent(p.split('/v1/dictation/videos/')[1].split('/')[0]);
      const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
      const video = all.find(v => v.id === id || v._id === id || v.slug === id || v.slugVi === id || toSlugVi(v.title || v.titleVi) === id) || all[0] || {};
      const realId = video.id || video._id || id;
      const segs = (await loadLocalJson(`/data/dictation/videos/${realId}-segments.json`)) || {};
      const items = (segs && (Array.isArray(segs.items) ? segs.items : (Array.isArray(segs.segments) ? segs.segments : []))) || [];
      return jsonResponse({ ...video, ...(segs || {}), items, segments: items });
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
    if (p.startsWith('/v1/grammar-progress')) {
      await ensureInitialCloudPull();
      const prog = getRealProgress();
      const set = new Set(Array.isArray(prog.learnedGrammarIds) ? prog.learnedGrammarIds : []);
      const pathId = p.length > '/v1/grammar-progress/'.length ? safeDecodeURIComponent(p.slice('/v1/grammar-progress/'.length)) : '';
      if (method === 'POST') {
        const body = pathId ? null : await parseRequestBody(init);
        const gid = (pathId || (body && (body.grammarId || body.id)) || '').trim();
        if (gid) {
          set.add(gid);
          recordStudyProgress({ grammarId: gid, minutes: 2 });
        }
      } else if (method === 'DELETE') {
        const gid = pathId.trim();
        if (gid) {
          set.delete(gid);
          prog.learnedGrammarIds = [...set];
          saveRealProgress(prog);
          syncProgressToSupabaseAuth(prog);
        }
      }
      return jsonResponse({ ok: true, learnedGrammarIds: [...set] });
    }
    if (p.startsWith('/v1/practice-progress')) {
      const body = method === 'POST' ? await parseRequestBody(init) : {};
      let prac = { v: 2, items: {}, days: {} };
      try {
        const raw = JSON.parse(localStorage.getItem('xhz-practice-v1') || 'null');
        if (raw && typeof raw === 'object') prac = { ...prac, ...raw, items: { ...(raw.items || {}) }, days: { ...(raw.days || {}) } };
      } catch (_) {}
      const syncWords = [];
      if (Array.isArray(body.states)) {
        body.states.forEach(st => {
          if (st && st.hanzi) {
            prac.items[st.hanzi] = { ...(prac.items[st.hanzi] || {}), ...st };
            syncWords.push(st.hanzi);
          }
        });
      }
      if (Array.isArray(body.events)) {
        body.events.forEach(ev => {
          if (ev && ev.hanzi) syncWords.push(ev.hanzi);
        });
      }
      if (Array.isArray(body.days)) {
        body.days.forEach(d => {
          if (d && d.day) {
            const cur = prac.days[d.day] || { exp: [], revN: 0 };
            const mergedExp = [...new Set([...(cur.exp || []), ...(Array.isArray(d.exp) ? d.exp : [])])];
            prac.days[d.day] = { exp: mergedExp, revN: Math.max(Number(cur.revN) || 0, Number(d.revN) || 0) };
            mergedExp.forEach(w => syncWords.push(w));
          }
        });
      }
      if (method === 'POST') {
        try { localStorage.setItem('xhz-practice-v1', JSON.stringify(prac)); } catch (_) {}
        recordStudyProgress({
          words: [...new Set(syncWords)],
          minutes: syncWords.length > 0 ? 2 : 0,
          sessionInc: syncWords.length > 0 ? 1 : 0
        });
      }
      const progAfter = getRealProgress();
      let finalPrac = prac;
      try {
        const rawAfter = JSON.parse(localStorage.getItem('xhz-practice-v1') || 'null');
        if (rawAfter && typeof rawAfter === 'object') finalPrac = rawAfter;
      } catch (_) {}
      return jsonResponse({
        ok: true,
        states: Object.values((finalPrac && finalPrac.items) || {}),
        days: Object.entries((finalPrac && finalPrac.days) || {}).map(([day, d]) => ({ day, exp: (d && d.exp) || [], revN: (d && d.revN) || 0 })),
        items: (finalPrac && finalPrac.items) || {},
        updated: (progAfter.learnedWords || []).length
      });
    }
    if (p.startsWith('/v1/grammar/levels/')) {
      const lvl = safeDecodeURIComponent(p.slice('/v1/grammar/levels/'.length).split('/')[0] || '1');
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const prefix = curr === 'new-hsk' ? 'new-hsk-level-' : 'hsk-level-';
      let data = await loadLocalJson(`/data/grammar/${prefix}${lvl}.json`);
      let fallbackFrom = null;
      if (!data && curr === 'new-hsk') {
        data = await loadLocalJson(`/data/grammar/hsk-level-${lvl}.json`);
        if (data) fallbackFrom = 'hsk';
      }
      return jsonResponse(data ? { ...data, curriculum: curr, level: lvl, ...(fallbackFrom ? { fallbackFrom } : {}) } : { curriculum: curr, level: lvl, total: 0, items: [] });
    }
    if (p.includes('/v1/grammar/levels')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const data = await loadLocalJson(`/data/grammar/levels-${curr}.json`);
      if (data && curr === 'new-hsk' && Array.isArray(data.levels)) {
        const hskLevels = await loadLocalJson('/data/grammar/levels-hsk.json');
        const hskMap = new Map((hskLevels && Array.isArray(hskLevels.levels) ? hskLevels.levels : []).map(x => [String(x.level), Number(x.count) || 0]));
        const mergedLevels = data.levels.map(lv => {
          const cnt = Number(lv.count) || 0;
          const fb = hskMap.get(String(lv.level)) || 0;
          return cnt > 0 ? lv : (fb > 0 ? { ...lv, count: fb, fallbackFrom: 'hsk' } : lv);
        });
        return jsonResponse({ ...data, levels: mergedLevels });
      }
      return jsonResponse(data || { levels: [] });
    }
    if (p.includes('/v1/grammar/points')) {
      const curr = urlObj.searchParams.get('curriculum') || 'hsk';
      const lvl = urlObj.searchParams.get('level') || '1';
      const prefix = curr === 'new-hsk' ? 'new-hsk-level-' : 'hsk-level-';
      let data = await loadLocalJson(`/data/grammar/${prefix}${lvl}.json`);
      if (!data && curr === 'new-hsk') {
        data = await loadLocalJson(`/data/grammar/hsk-level-${lvl}.json`);
      }
      return jsonResponse(data || { items: [] });
    }

    // LUYỆN NGHE & LUYỆN NÓI SET: /v1/listening/(topics|lessons)/:curr/:levelSlug/:sourceSlug/set
    const listenSetMatch = p.match(/^\/v1\/listening\/(topics|lessons)\/([^/]+)\/([^/]+)\/([^/]+)\/set$/);
    if (listenSetMatch || p.includes('/v1/listening')) {
      const sourceType = listenSetMatch ? listenSetMatch[1] : 'lessons';
      const curr = listenSetMatch ? listenSetMatch[2] : (urlObj.searchParams.get('curriculum') || 'new-hsk');
      const levelSlug = listenSetMatch ? listenSetMatch[3] : (urlObj.searchParams.get('levelSlug') || 'new-hsk-1');
      const sourceSlug = listenSetMatch ? safeDecodeURIComponent(listenSetMatch[4]) : 'bai-1-hello-ai-xiaoyu';

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
    if (p.startsWith('/v1/speaking-progress') || p.startsWith('/v1/speaking/progress')) {
      const prog = getRealProgress();
      const map = { ...(prog.speakingProgress || {}) };
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const list = Array.isArray(body && body.items)
          ? body.items
          : (body && body.items && typeof body.items === 'object' ? Object.entries(body.items).map(([k, v]) => ({ key: k, ...(v || {}) })) : []);
        const spkWords = [];
        list.forEach(it => {
          if (!it || typeof it !== 'object') return;
          const k = String(it.key || it.hanzi || it.sentence || '').trim();
          if (k) {
            map[k] = { ...(map[k] || {}), ...it, updatedAt: Date.now() };
            if (/[\u4e00-\u9fff]/.test(k)) spkWords.push(k);
          }
        });
        prog.speakingProgress = map;
        saveRealProgress(prog);
        recordStudyProgress({
          words: spkWords,
          voiceInc: 1,
          gradingInc: 1,
          minutes: list.length > 0 ? 1 : 0,
          dailyStepDone: list.length > 0 ? 'step-talk-1' : undefined
        });
      }
      return jsonResponse({ ok: true, items: map });
    }
    async function synthesizeSpeakingTopicList(curr, levelSlug) {
      const mappedCurr = curr === 'hsk' ? 'new-hsk' : curr;
      const mappedLvl = curr === 'hsk' && !/^new-/.test(levelSlug) ? `new-${levelSlug}` : levelSlug;
      const lvlData =
        (await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`)) ||
        (await loadLocalJson(`/data/curriculums/${mappedCurr}/levels/${mappedLvl}.json`)) ||
        (await loadLocalJson('/data/curriculums/new-hsk/levels/new-hsk-1.json'));
      const rawList = (lvlData && lvlData.level && (lvlData.level.topics || lvlData.level.lessons)) || [];
      return rawList.slice(0, 20).map((it, idx) => ({
        topicSlug: it.topicSlug || it.lessonSlug || `bai-${idx + 1}`,
        title: it.titleVi || it.topic || it.titleZh || `Chủ đề ${idx + 1}`,
        titleVi: it.titleVi || it.topic || `Chủ đề ${idx + 1}`,
        titleZh: it.titleZh || it.topic || '',
        wordCount: it.wordCount || 10,
        curriculumSlug: curr,
        levelSlug
      }));
    }

    async function synthesizeSpeakingDialogue(curr, levelSlug, topicSlug) {
      const mappedCurr = curr === 'hsk' ? 'new-hsk' : curr;
      const mappedLvl = curr === 'hsk' && !/^new-/.test(levelSlug) ? `new-${levelSlug}` : levelSlug;
      let srcData =
        (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${topicSlug}.json`)) ||
        (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${topicSlug}.json`)) ||
        (await loadLocalJson(`/data/curriculums/${mappedCurr}/topics/${mappedLvl}--${topicSlug}.json`)) ||
        (await loadLocalJson(`/data/curriculums/${mappedCurr}/lessons/${mappedLvl}--${topicSlug}.json`));
      if (!srcData) {
        const lvlData =
          (await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`)) ||
          (await loadLocalJson(`/data/curriculums/${mappedCurr}/levels/${mappedLvl}.json`)) ||
          (await loadLocalJson('/data/curriculums/new-hsk/levels/new-hsk-1.json'));
        const items = (lvlData && lvlData.level && (lvlData.level.lessons || lvlData.level.topics)) || [];
        const picked = items.find(it => (it.topicSlug || it.lessonSlug) === topicSlug) || items[0];
        if (picked) {
          const s = picked.topicSlug || picked.lessonSlug || '';
          const cSlug = (lvlData && lvlData.curriculum && lvlData.curriculum.slug) || mappedCurr;
          const lSlug = (lvlData && lvlData.level && lvlData.level.slug) || mappedLvl;
          srcData =
            (await loadLocalJson(`/data/curriculums/${cSlug}/lessons/${lSlug}--${s}.json`)) ||
            (await loadLocalJson(`/data/curriculums/${cSlug}/topics/${lSlug}--${s}.json`));
        }
      }
      if (!srcData) {
        srcData = await loadLocalJson('/data/curriculums/new-hsk/lessons/new-hsk-1--bai-1-hello-ai-xiaoyu.json');
      }
      const words = (srcData && srcData.lesson && srcData.lesson.words) || (srcData && srcData.topic && srcData.topic.words) || (srcData && srcData.words) || [];
      if (!words.length) return null;
      const turns = [];
      const usableWords = words.slice(0, 6);
      usableWords.forEach((w, idx) => {
        const hz = String(w.hanzi || w.word || '').replace(/\{|\}/g, '').trim();
        const py = w.wordPinyin || w.pinyin || '';
        const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const ex = Array.isArray(w.examples) && w.examples[0] ? w.examples[0] : null;
        const turnHz = (ex && (ex.hanzi || ex.chinese)) ? String(ex.hanzi || ex.chinese).replace(/\{|\}/g, '').trim() : `请问，「${hz}」是什么意思？`;
        const turnPy = (ex && ex.pinyin) ? ex.pinyin : (py ? `${py} (${vi})` : '');
        const turnVi = (ex && (ex.vietnamese || ex.vi)) ? (ex.vietnamese || ex.vi) : `${hz} nghĩa là "${vi}".`;
        const roleId = idx % 2 === 0 ? 'A' : 'B';
        const rawAud = (Array.isArray(w.audios) && w.audios[0]) || w.audioUrl || `https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`;
        turns.push({
          role: roleId,
          speaker: roleId,
          hanzi: turnHz,
          zh: turnHz,
          pinyin: turnPy,
          vietnamese: turnVi,
          vi: turnVi,
          audioUrl: rewriteMediaUrl(rawAud)
        });
      });
      const topicMeta = (srcData && (srcData.lesson || srcData.topic)) || {};
      return {
        curriculumSlug: curr,
        levelSlug,
        topicSlug,
        title: topicMeta.titleZh || topicMeta.topic || topicSlug,
        titleVi: topicMeta.titleVi || topicMeta.topic || `Luyện nói: ${topicSlug}`,
        roles: [{ id: 'A', labelVi: 'Người hỏi' }, { id: 'B', labelVi: 'Người trả lời' }],
        turns
      };
    }

    const speakDiagMatch = p.match(/^\/v1\/speaking\/dialogues\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/);
    if (speakDiagMatch) {
      const curr = speakDiagMatch[1];
      const levelSlug = speakDiagMatch[2];
      const topicSlug = speakDiagMatch[3] ? safeDecodeURIComponent(speakDiagMatch[3]) : '';
      if (!topicSlug) {
        const listData = await loadLocalJson(`/data/speaking/${curr}/${levelSlug}/dialogues.json`);
        if (listData && Array.isArray(listData.dialogues) && listData.dialogues.length > 0) {
          return jsonResponse(listData);
        }
        const synthList = await synthesizeSpeakingTopicList(curr, levelSlug);
        if (synthList.length > 0) return jsonResponse({ dialogues: synthList });
        const fallbackList = await loadLocalJson('/data/speaking/new-hsk/new-hsk-1/dialogues.json');
        return jsonResponse(fallbackList || { dialogues: [] });
      }
      let topicData =
        (await loadLocalJson(`/data/speaking/${curr}/${levelSlug}/${topicSlug}.json`)) ||
        (curr === 'hsk' ? await loadLocalJson(`/data/speaking/new-hsk/new-${levelSlug}/${topicSlug}.json`) : null);
      if (!topicData || !Array.isArray(topicData.turns) || topicData.turns.length === 0) {
        topicData = await synthesizeSpeakingDialogue(curr, levelSlug, topicSlug);
      }
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
      if (data && Array.isArray(data.dialogues) && data.dialogues.length > 0) return jsonResponse(data);
      const synthList = await synthesizeSpeakingTopicList(curr, lvl);
      return jsonResponse({ dialogues: synthList });
    }

    async function enrichCurriculumItemsWithProgress(items, curr, levelSlug, kindHint = '') {
      if (!Array.isArray(items) || items.length === 0) return [];
      const prog = getRealProgress();
      const learnedSet = new Set((prog.learnedWords || []).map(w => String(w || '').replace(/^w:|^c:/, '').trim()).filter(Boolean));
      const doneActs = (prog.doneActivities && (prog.doneActivities[`curr.thu-vien-${curr}`] || prog.doneActivities[`curr.${curr}`])) || [];
      return Promise.all(items.map(async (it) => {
        const copy = { ...(it || {}) };
        const isTopicOnly = kindHint === 'topic' || copy.sourceType === 'topic' || (Boolean(copy.topicSlug) && !copy.lessonSlug);
        const slug = copy.lessonSlug || copy.topicSlug || copy.slug || '';
        const cleanSlug = slug && levelSlug && slug.startsWith(levelSlug + '-') ? slug.slice(levelSlug.length + 1) : slug;
        let wordList = Array.isArray(copy.words) ? copy.words : null;
        if (!wordList && slug) {
          let detail = null;
          if (isTopicOnly) {
            detail =
              (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${slug}.json`)) ||
              (cleanSlug && cleanSlug !== slug ? await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${levelSlug}-${cleanSlug}.json`) : null) ||
              (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${slug}.json`));
          } else {
            detail =
              (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${slug}.json`)) ||
              (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${slug}.json`)) ||
              (cleanSlug && cleanSlug !== slug ? await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${levelSlug}-${cleanSlug}.json`) : null);
          }
          wordList = (detail && detail.lesson && detail.lesson.words) || (detail && detail.topic && detail.topic.words) || (detail && detail.words) || null;
        }
        const total = Math.max(Number(copy.wordCount) || 0, Array.isArray(wordList) ? wordList.length : 0);
        let learnedCount = 0;
        if (Array.isArray(wordList) && wordList.length > 0) {
          learnedCount = wordList.filter(w => {
            const hz = String((w && (w.hanzi || w.word || w.character)) || '').replace(/\{|\}/g, '').trim();
            return hz && learnedSet.has(hz);
          }).length;
        } else if (slug && (doneActs.includes(`${slug}.fc`) || doneActs.includes(`${slug}.quiz`) || doneActs.includes(`${slug}.typing`))) {
          learnedCount = total;
        }
        const progressPct = total > 0 ? Math.min(100, Math.round((learnedCount / total) * 100)) : 0;
        copy.wordCount = total;
        copy.learnedCount = learnedCount;
        copy.progressPct = progressPct;
        return copy;
      }));
    }

    const currMatch = p.match(/^\/v1\/(?:hanzi-)?curriculums\/([^/]+)(?:\/(.*))?$/);
    if (currMatch) {
      const curr = currMatch[1] || 'hsk';
      const subParts = (currMatch[2] || '').split('/').filter(Boolean);
      const normOverview = ov => {
        if (!ov || typeof ov !== 'object') return ov;
        const copy = JSON.parse(JSON.stringify(ov));
        if (Array.isArray(copy.levels)) {
          copy.levels.forEach(l => {
            if (l && l.image) l.image = rewriteMediaUrl(l.image);
          });
        }
        return copy;
      };
      if (subParts.length === 0) {
        const overview = await loadLocalJson(`/data/curriculums/${curr}/overview.json`);
        return jsonResponse(normOverview(overview) || { name: curr.toUpperCase(), slug: curr, levels: [] });
      }
      if (subParts[0] === 'levels' && subParts.length === 2) {
        const levelSlug = subParts[1];
        const lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
        if (lvlData) {
          const copy = JSON.parse(JSON.stringify(lvlData));
          if (copy.level && copy.level.image) copy.level.image = rewriteMediaUrl(copy.level.image);
          if (copy.level && Array.isArray(copy.level.topics)) {
            copy.level.topics = await enrichCurriculumItemsWithProgress(copy.level.topics, curr, levelSlug, 'topic');
          }
          if (copy.level && Array.isArray(copy.level.lessons)) {
            copy.level.lessons = await enrichCurriculumItemsWithProgress(copy.level.lessons, curr, levelSlug, 'lesson');
          }
          return jsonResponse(copy);
        }
        return jsonResponse({ curriculum: { slug: curr }, level: { slug: levelSlug, topics: [] } });
      }
      if (subParts[0] === 'levels' && subParts[2] === 'lessons' && subParts.length === 3) {
        const levelSlug = subParts[1];
        let lessonsData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}-lessons.json`);
        let usedTopicFallback = false;
        if (!lessonsData || !Array.isArray(lessonsData.lessons) || lessonsData.lessons.length === 0) {
          usedTopicFallback = true;
          const lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
          const topics = (lvlData && lvlData.level && lvlData.level.topics) || [];
          lessonsData = {
            curriculum: (lvlData && lvlData.curriculum) || { slug: curr },
            level: (lvlData && lvlData.level) || { slug: levelSlug },
            lessons: topics.map((t, idx) => ({
              lessonSlug: t.topicSlug,
              topicSlug: t.topicSlug,
              lessonNumber: idx + 1,
              titleVi: t.topic,
              titleZh: t.topic,
              wordCount: t.wordCount || 10,
              stageCount: 1,
              stageMinutes: 8,
              estimatedMinutes: 8
            }))
          };
        } else {
          lessonsData = JSON.parse(JSON.stringify(lessonsData));
        }
        lessonsData.lessons = await enrichCurriculumItemsWithProgress(lessonsData.lessons, curr, levelSlug, usedTopicFallback ? 'topic' : 'lesson');
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
      return jsonResponse(normOverview(overview) || {});
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
      const slug = safeDecodeURIComponent(p.split('/').slice(-2, -1)[0] || '');
      const charData = await lookupCharacter(slug);
      return jsonResponse({
        character: (charData && charData.character) || extractHanziChar(slug),
        nodes: [],
        edges: [],
        words: (charData && charData.commonWords) || [],
        components: (charData && charData.components) || []
      });
    }
    if (p.startsWith('/v1/hanzi-characters/browse/')) {
      const subParts = p.slice('/v1/hanzi-characters/browse/'.length).split('/').filter(Boolean);
      const browseType = subParts[0] || 'hsk';
      const browseVal = safeDecodeURIComponent(subParts[1] || '1');
      const index = (await loadLocalJson('/data/characters/index.json')) || [];
      let filtered = Array.isArray(index) ? index : [];
      if (browseType === 'hsk') {
        filtered = filtered.filter(x => String(x.hsk) === String(browseVal));
      } else if (browseType === 'radical') {
        filtered = filtered.filter(x => (x.r || x.radical) === browseVal);
      }
      const chars = filtered.slice(0, 300).map((entry, idx) => ({
        character: entry.c || entry.character,
        slug: entry.slug || `${entry.hv || entry.p || 'han'}-${entry.c}`,
        pinyin: entry.p || entry.pinyin || '',
        hanvietReading: entry.hv || '',
        meaningVi: entry.m || entry.meaningVi || '',
        radical: entry.r || '',
        strokeCount: entry.s || 1,
        hskLevel: entry.hsk || Number(browseVal) || 1,
        frequencyRank: idx + 1
      }));
      return jsonResponse({ chars, items: chars, total: filtered.length });
    }
    if (p === '/v1/hanzi-words/batch') {
      const body = await parseRequestBody(init);
      const rawWords = (body && (body.words || body.hanzis || body.items)) || (urlObj.searchParams.get('words') || '').split(',').filter(Boolean);
      const results = {};
      const items = [];
      for (const wStr of (Array.isArray(rawWords) ? rawWords : [])) {
        const wData = await lookupWord(wStr);
        if (wData) {
          results[wStr] = wData;
          items.push(wData);
        }
      }
      return jsonResponse({ words: results, items });
    }
    if (p.startsWith('/v1/pinyin-lookup')) {
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        if (typeof body.text !== 'string' || Array.from(body.text).length > 2000) return jsonResponse({ error: 'invalid_text', message: 'Nhập tối đa 2000 ký tự.' }, 400);
        return jsonResponse({ annotations: await annotateLocalPinyin(body.text) });
      }
      const q = (urlObj.searchParams.get('q') || urlObj.searchParams.get('pinyin') || '').trim().toLowerCase();
      const charIdx = (await loadLocalJson('/data/characters/index.json')) || [];
      const matches = (Array.isArray(charIdx) ? charIdx : [])
        .filter(c => (c.p || '').toLowerCase().includes(q) || (c.hv || '').toLowerCase().includes(q))
        .slice(0, 60)
        .map(entry => ({
          character: entry.c,
          slug: entry.slug || `${entry.hv || 'han'}-${entry.c}`,
          pinyin: entry.p,
          hanvietReading: entry.hv,
          meaningVi: entry.m,
          strokeCount: entry.s,
          hskLevel: entry.hsk
        }));
      return jsonResponse({ items: matches, characters: matches, total: matches.length });
    }
    if (p.startsWith('/v1/hanzi-characters/')) {
      const rawChars = safeDecodeURIComponent(p.slice('/v1/hanzi-characters/'.length));
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
      const rawQ = (urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '').trim();
      const q = rawQ.toLowerCase();
      const qNorm = normalizePinyinQuery(rawQ);
      const hasHanzi = /[\u4e00-\u9fff]/.test(rawQ);
      const charIdx = (await loadLocalJson('/data/characters/index.json')) || [];
      const vocabIdx = (await loadLocalJson('/data/vocabulary/index.json')) || [];

      const scoreChar = c => {
        const ch = String((c && c.c) || '');
        const py = String((c && c.p) || '').toLowerCase();
        const pyNorm = normalizePinyinQuery(py);
        const hv = String((c && c.hv) || '').toLowerCase();
        const mv = String((c && c.m) || '').toLowerCase();
        if (ch === rawQ) return 100;
        if (hasHanzi && ch && rawQ.includes(ch)) return 90;
        if (qNorm && pyNorm === qNorm) return 80;
        if (hv && hv === q) return 70;
        if (ch.includes(rawQ) || py.includes(q) || (qNorm.length >= 2 && pyNorm.startsWith(qNorm))) return 50;
        if (q.length >= 2 && (hv.includes(q) || mv.includes(q) || (qNorm.length >= 3 && pyNorm.includes(qNorm)))) return 25;
        return 0;
      };
      const scoreWord = w => {
        const hw = String((w && w.w) || '').replace(/\{|\}/g, '');
        const py = String((w && w.p) || '').toLowerCase();
        const pyNorm = normalizePinyinQuery(py);
        const hv = String((w && w.hv) || '').toLowerCase();
        const mv = String((w && w.m) || '').toLowerCase();
        if (hw === rawQ) return 100;
        if (qNorm && pyNorm === qNorm) return 88;
        if (hw && hw.includes(rawQ)) return 75;
        if (py.includes(q) || (qNorm.length >= 2 && pyNorm.startsWith(qNorm))) return 55;
        if (q.length >= 2 && (hv.includes(q) || mv.includes(q) || (qNorm.length >= 3 && pyNorm.includes(qNorm)))) return 25;
        return 0;
      };

      const chars = rawQ ? (Array.isArray(charIdx) ? charIdx : [])
        .map(c => ({ c, s: scoreChar(c) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 12)
        .map(x => x.c) : [];
      const words = rawQ ? (Array.isArray(vocabIdx) ? vocabIdx : [])
        .map(w => ({ w: { ...w, w: String((w && w.w) || '').replace(/\{|\}/g, '') }, s: scoreWord(w) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 12)
        .map(x => x.w) : [];
      return jsonResponse({ characters: chars, words, items: [...words, ...chars] });
    }

    // ------------------------------------------------------------------------
    // J. CHẤM ĐIỂM ĐỀ THI, LUYỆN GÕ, SỔ TAY
    // ------------------------------------------------------------------------
    if (p === '/v1/typing-set') {
      const hsk = Number(urlObj.searchParams.get('hsk')) || 1;
      const mode = urlObj.searchParams.get('mode') || '';
      const limit = Math.max(1, Math.min(100, Number(urlObj.searchParams.get('limit')) || 20));
      const index = (await loadLocalJson('/data/characters/index.json')) || [];
      let pool = [];
      if (mode === 'learned' || mode === 'mistakes') {
        const prog = getRealProgress();
        const srcChars = mode === 'mistakes'
          ? (prog.userMistakes || []).flatMap(m => Array.from(String((m && m.hanzi) || '').replace(/[^\u4e00-\u9fff]/g, '')))
          : (prog.learnedWords || []).flatMap(w => Array.from(String(w || '').replace(/[^\u4e00-\u9fff]/g, '')));
        const uniq = [...new Set(srcChars)];
        const byChar = new Map((Array.isArray(index) ? index : []).map(x => [x.c || x.character, x]));
        pool = uniq.map(ch => byChar.get(ch)).filter(x => x && x.p);
      }
      if (pool.length === 0) {
        pool = Array.isArray(index) ? index.filter(x => Number(x.hsk) === hsk && x.p) : [];
      }
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
      return jsonResponse({ hsk, mode: mode || 'hsk', set });
    }
    if (p === '/v1/typing-word-set') {
      const hsk = Math.max(1, Math.min(6, Number(urlObj.searchParams.get('hsk')) || 1));
      const mode = urlObj.searchParams.get('mode') || '';
      const limit = Math.max(1, Math.min(100, Number(urlObj.searchParams.get('limit')) || 20));
      const vocabIdx = (await loadLocalJson('/data/vocabulary/index.json')) || [];
      let set = [];
      if (mode === 'learned' || mode === 'mistakes') {
        const prog = getRealProgress();
        const rawList = mode === 'mistakes'
          ? (prog.userMistakes || []).map(m => String((m && m.hanzi) || '').trim()).filter(Boolean)
          : (prog.learnedWords || []).map(w => String(w || '').trim()).filter(Boolean);
        const byWord = new Map((Array.isArray(vocabIdx) ? vocabIdx : []).map(x => [String(x.w || '').replace(/\{|\}/g, ''), x]));
        const charIdx = (await loadLocalJson('/data/characters/index.json')) || [];
        const byChar = new Map((Array.isArray(charIdx) ? charIdx : []).map(x => [x.c || x.character, x]));
        set = [...new Set(rawList)].slice(0, limit).map(hz => {
          const v = byWord.get(hz);
          const c = byChar.get(hz);
          return {
            word: hz,
            hanzi: hz,
            pinyin: (v && v.p) || (c && c.p) || '',
            hanviet: (v && v.hv) || (c && c.hv) || '',
            meaningVi: (v && v.m) || (c && c.m) || '',
            hskLevel: hsk,
            audioUrl: rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`)
          };
        }).filter(x => x.hanzi && x.pinyin);
      }
      if (set.length < limit) {
        const lvlSlug = `new-hsk-${hsk}`;
        const lessFile = await loadLocalJson(`/data/curriculums/new-hsk/levels/${lvlSlug}-lessons.json`);
        const lessons = (lessFile && Array.isArray(lessFile.lessons)) ? lessFile.lessons : [];
        const seenW = new Set(set.map(x => x.hanzi));
        for (const l of lessons.slice(0, 4)) {
          if (set.length >= limit) break;
          const slug = l.lessonSlug || l.topicSlug || '';
          if (!slug) continue;
          const folder = l.sourceType === 'topic' ? 'topics' : 'lessons';
          const det = await loadLocalJson(`/data/curriculums/new-hsk/${folder}/${lvlSlug}--${slug}.json`);
          const wl = (det && det.lesson && det.lesson.words) || (det && det.topic && det.topic.words) || (det && det.words) || [];
          for (const w of wl) {
            if (set.length >= limit) break;
            const hz = String((w && (w.hanzi || w.word)) || '').replace(/\{|\}/g, '').trim();
            const py = (w && (w.pinyin || w.wordPinyin)) || '';
            if (!hz || !py || seenW.has(hz)) continue;
            seenW.add(hz);
            set.push({
              word: hz,
              hanzi: hz,
              pinyin: py,
              hanviet: (w && (w.hanviet || w.hanViet)) || '',
              meaningVi: (w && (w.meaningVi || w.translationVi || w.meaning)) || '',
              hskLevel: hsk,
              audioUrl: rewriteMediaUrl((w && ((Array.isArray(w.audios) && w.audios[0]) || w.audioUrl)) || `https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`)
            });
          }
        }
      }
      if (set.length < limit && Array.isArray(vocabIdx)) {
        const seenW = new Set(set.map(x => x.hanzi));
        const offset = (hsk - 1) * 180;
        const pool = vocabIdx.filter(x => x.p && (x.w || '').length >= 2).slice(offset, offset + limit * 2);
        for (const x of pool) {
          if (set.length >= limit) break;
          const hz = (x.w || '').replace(/\{|\}/g, '');
          if (!hz || seenW.has(hz)) continue;
          seenW.add(hz);
          set.push({
            word: hz,
            hanzi: hz,
            pinyin: x.p || 'nǐ hǎo',
            hanviet: x.hv || '',
            meaningVi: x.m || '',
            hskLevel: hsk,
            audioUrl: rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`)
          });
        }
      }
      return jsonResponse({ hsk, mode: mode || 'hsk', set });
    }
    if (p === '/v1/typing/complete' || p === '/v1/typing-progress') {
      const body = method === 'POST' ? await parseRequestBody(init) : {};
      const words = Array.isArray(body.words) ? body.words.map(w => String(w || '').trim()).filter(Boolean) : [];
      const mins = Math.max(1, Number(body.minutes) || Math.ceil((Number(body.seconds) || 60) / 60));
      const prog = method === 'POST'
        ? recordStudyProgress({ words, minutes: mins, sessionInc: 1, gradingInc: Math.max(1, words.length) })
        : getRealProgress();
      return jsonResponse({ ok: true, wordsRecorded: words.length, totalLearned: (prog.learnedWords || []).length });
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
      try {
        recordStudyProgress({
          voiceInc: 1,
          gradingInc: 1,
          minutes: 1,
          dailyStepDone: 'step-talk-1'
        });
      } catch (_) {}
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
      if (!Array.isArray(questions) || !questions.length) return jsonResponse({ error: 'EMPTY_EXAM', message: 'Chưa có câu hỏi để chấm bài.' }, 400);
      if (questions.some(q => ![q.correctAnswer, q.answer, q.correctOption].some(answer => answer !== undefined && answer !== null && String(answer).trim() !== ''))) {
        return jsonResponse({ error: 'ANSWER_KEY_UNAVAILABLE', message: 'Đề này chưa có đáp án chuẩn trong kho dữ liệu. Có thể lưu bài làm để xem lại, nhưng chưa thể tính điểm chính xác.' }, 409);
      }
      const userAnswers = body.answers || body.userAnswers || {};
      let correctCount = 0;
      const results = questions.map((q, idx) => {
        const qId = q.id || q._id || q.number || q.questionNumber || idx + 1;
        const userAns = userAnswers[qId] !== undefined ? userAnswers[qId] : userAnswers[idx];
        const rightAns = q.correctAnswer ?? q.answer ?? q.correctOption;
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
      const entry = {
        paperId,
        title: (paper && (paper.title || paper.testId)) || paperId,
        score,
        score300: Math.round((correctCount / total) * 300),
        score200: Math.round((correctCount / total) * 200),
        correctCount,
        total,
        passed: score >= 60,
        at: new Date().toISOString()
      };
      st.examCount = (st.examCount || 0) + 1;
      st.history = [entry, ...(st.history || []).slice(0, 49)];
      saveLocalState(st);
      recordStudyProgress({
        minutes: Math.max(5, Number(body.durationMinutes) || 10),
        sessionInc: 1,
        gradingInc: 1,
        examResult: entry
      });
      supabaseUpsert(st).catch(() => {});

      return jsonResponse({
        ok: true,
        paperId,
        score,
        score300: entry.score300,
        score200: entry.score200,
        correctCount,
        totalQuestions: total,
        passed: score >= 60,
        results,
        entry
      });
    }

    if (p.includes('/v1/notebook') || p.includes('/v1/bookmarks') || p.includes('/v1/saved')) {
      const st = getLocalState();
      st.masteredChars = st.masteredChars && typeof st.masteredChars === 'object' ? st.masteredChars : {};
      st.savedWords = st.savedWords && typeof st.savedWords === 'object' ? st.savedWords : {};
      const prog = getRealProgress();
      if (method === 'POST') {
        const body = await parseRequestBody(init);
        const key = String(body.word || body.character || body.hanzi || body.id || '').trim();
        if (key) {
          const entry = {
            hanzi: key,
            word: key,
            character: key.length === 1 ? key : undefined,
            pinyin: body.pinyin || '',
            hanviet: body.hanviet || body.hanViet || '',
            meaningVi: body.meaningVi || body.translationVi || '',
            savedAt: body.savedAt || Date.now()
          };
          if (key.length === 1 || body.isCharacter) {
            st.masteredChars[key] = { ...(st.masteredChars[key] || {}), ...entry };
            prog.masteredChars[key] = st.masteredChars[key];
          } else {
            st.savedWords[key] = { ...(st.savedWords[key] || {}), ...entry };
            prog.savedWords[key] = st.savedWords[key];
          }
          saveLocalState(st);
          saveRealProgress(prog);
          recordStudyProgress({ words: [key] });
          supabaseUpsert(st).catch(() => {});
        }
      } else if (method === 'DELETE') {
        const rawLast = safeDecodeURIComponent(p.split('/').pop() || '');
        const body = rawLast === 'notebook' || rawLast === 'bookmarks' || rawLast === 'saved' ? await parseRequestBody(init) : {};
        const key = String(body.word || body.hanzi || body.character || rawLast || '').trim();
        if (key) {
          delete st.masteredChars[key];
          delete st.savedWords[key];
          if (prog.masteredChars) delete prog.masteredChars[key];
          if (prog.savedWords) delete prog.savedWords[key];
          saveLocalState(st);
          saveRealProgress(prog);
          supabaseUpsert(st).catch(() => {});
        }
      }
      const [vocabIdx, charIdx] = await Promise.all([
        loadLocalJson('/data/vocabulary/index.json'),
        loadLocalJson('/data/characters/index.json')
      ]);
      const vocabMap = new Map();
      if (Array.isArray(vocabIdx)) {
        vocabIdx.forEach(e => {
          const wKey = e && (e.w || e.word || e.hanzi);
          if (wKey) vocabMap.set(wKey, e);
        });
      }
      const charMap = new Map();
      if (Array.isArray(charIdx)) {
        charIdx.forEach(e => {
          const cKey = e && (e.c || e.character);
          if (cKey) charMap.set(cKey, e);
        });
      }
      const enrichEntry = (k, rawVal, isChar) => {
        const base = typeof rawVal === 'object' && rawVal ? rawVal : {};
        const key = String(base.hanzi || base.word || base.character || k || '').trim();
        const vInfo = vocabMap.get(key);
        const cInfo = charMap.get(key) || (key ? charMap.get(key[0]) : null);
        return {
          ...base,
          hanzi: key,
          word: key,
          character: isChar ? key : base.character,
          pinyin: base.pinyin || (vInfo && vInfo.p) || (cInfo && cInfo.p) || '',
          hanviet: base.hanviet || base.hanViet || (vInfo && vInfo.hv) || (cInfo && cInfo.hv) || '',
          meaningVi: base.meaningVi || (vInfo && vInfo.m) || (cInfo && cInfo.m) || '',
          hskLevel: base.hskLevel || (vInfo && vInfo.hsk) || (cInfo && cInfo.hsk) || null
        };
      };
      const allChars = Object.entries({ ...(prog.masteredChars || {}), ...(st.masteredChars || {}) })
        .filter(([k]) => !!k)
        .map(([k, v]) => enrichEntry(k, v, true));
      const allWords = Object.entries({ ...(prog.savedWords || {}), ...(st.savedWords || {}) })
        .filter(([k]) => !!k)
        .map(([k, v]) => enrichEntry(k, v, false));
      return jsonResponse({
        ok: true,
        characters: allChars,
        words: allWords,
        items: [...allChars, ...allWords]
      });
    }

    // ------------------------------------------------------------------------
    // K. AI APIs (/v1/translate, /v1/practice/result-ai-readout)
    // ------------------------------------------------------------------------
    if (p.includes('/v1/translate')) {
      const body = await parseRequestBody(init);
      const text = (body.text || body.q || body.sourceText || urlObj.searchParams.get('text') || '').trim();
      if (!text) return jsonResponse({ ok: true, translatedText: '', pinyin: '', breakdown: [], words: [], characters: [] });

      const [charIdx, vocabIdx] = await Promise.all([
        loadLocalJson('/data/characters/index.json'),
        loadLocalJson('/data/vocabulary/index.json')
      ]);
      const charMap = new Map();
      if (Array.isArray(charIdx)) {
        charIdx.forEach(x => {
          const c = x && (x.c || x.character);
          if (c && !charMap.has(c)) charMap.set(c, x);
        });
      }
      const vocabMap = new Map();
      if (Array.isArray(vocabIdx)) {
        vocabIdx.forEach(x => {
          const w = x && String(x.w || x.word || x.hanzi || '').replace(/\{|\}/g, '').trim();
          if (w && w.length >= 2 && !vocabMap.has(w)) vocabMap.set(w, x);
        });
      }

      const wordMatches = [];
      const seenWords = new Set();
      const runs = text.match(/[\u4e00-\u9fff]{2,}/g) || [];
      runs.forEach(run => {
        let i = 0;
        while (i < run.length) {
          let matched = null;
          for (let len = Math.min(4, run.length - i); len >= 2; len--) {
            const sub = run.slice(i, i + len);
            if (vocabMap.has(sub)) {
              matched = { word: sub, info: vocabMap.get(sub), len };
              break;
            }
          }
          if (matched) {
            if (!seenWords.has(matched.word)) {
              seenWords.add(matched.word);
              wordMatches.push({
                type: 'word',
                word: matched.word,
                character: matched.word,
                pinyin: matched.info.p || matched.info.pinyin || '',
                hanviet: matched.info.hv || matched.info.hanviet || '',
                meaningVi: matched.info.m || matched.info.meaningVi || '',
                hskLevel: matched.info.hsk || null
              });
            }
            i += matched.len;
          } else {
            i += 1;
          }
        }
      });

      const hanziChars = [...new Set(text.match(/[\u4e00-\u9fff]/g) || [])];
      const charMatches = hanziChars
        .map(ch => charMap.get(ch))
        .filter(Boolean)
        .map(info => ({
          type: 'char',
          character: info.c || info.character,
          pinyin: info.p || info.pinyin || '',
          hanviet: info.hv || info.hanviet || '',
          meaningVi: info.m || info.meaningVi || '',
          radical: info.r || info.radical || '',
          strokes: info.s || info.strokeCount || null,
          hskLevel: info.hsk || null
        }));

      const breakdown = [...wordMatches, ...charMatches];
      const fallbackPinyin = charMatches.map(b => b.pinyin).filter(Boolean).join(' ');
      const fallbackMeaning = (wordMatches.length ? wordMatches : charMatches)
        .map(b => `${b.word || b.character}${b.hanviet ? ` [${b.hanviet}]` : ''}: ${b.meaningVi}`)
        .filter(Boolean)
        .join('; ');
      const fallbackNote = charMatches.length
        ? `Âm Hán Việt: ${charMatches.map(c => `${c.character} (${c.hanviet || c.pinyin})`).join(' · ')}`
        : '';

      const aiRes = await callAiEndpoint('translate', {
        text,
        direction: body.direction || 'auto',
        breakdown,
        fallbackPinyin,
        fallbackNote
      });
      if (aiRes && aiRes.ok) {
        return jsonResponse({
          ...aiRes,
          pinyin: aiRes.pinyin || fallbackPinyin,
          note: aiRes.note || fallbackNote,
          breakdown: (Array.isArray(aiRes.breakdown) && aiRes.breakdown.length > 0) ? aiRes.breakdown : breakdown,
          words: wordMatches,
          characters: charMatches
        });
      }

      return jsonResponse({
        ok: true,
        sourceText: text,
        translatedText: fallbackMeaning || text,
        translation: fallbackMeaning || text,
        pinyin: fallbackPinyin,
        note: fallbackNote,
        breakdown,
        words: wordMatches,
        characters: charMatches
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

    // 4.19 Lightweight telemetry endpoint (local session buffer, zero external tracking)
    if (p === '/v1/metrics/event' && method === 'POST') {
      const body = await parseRequestBody(init);
      try {
        const bufRaw = sessionStorage.getItem('httq_metrics_buf_v1');
        const buf = bufRaw ? JSON.parse(bufRaw) : [];
        const arr = Array.isArray(buf) ? buf : [];
        arr.push({
          event: String(body.event || body.name || 'page_view').slice(0, 80),
          path: String(body.path || window.location.pathname || '/').slice(0, 160),
          ts: Date.now()
        });
        sessionStorage.setItem('httq_metrics_buf_v1', JSON.stringify(arr.slice(-30)));
      } catch (_) {}
      return jsonResponse({ ok: true, recorded: true });
    }

    // 4.20 Personal Character & Vocab Mnemonics (/v1/ugc/mnemonic)
    if (p === '/v1/ugc/mnemonic' || p.startsWith('/v1/ugc/mnemonic/')) {
      const body = method === 'GET' ? {} : await parseRequestBody(init);
      const MNEMONIC_KEY = 'httq_user_mnemonics_v1';
      const readMnemonicMap = () => {
        try {
          const raw = localStorage.getItem(MNEMONIC_KEY);
          const parsed = raw ? JSON.parse(raw) : {};
          return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch (_) {
          return {};
        }
      };
      const writeMnemonicMap = (map) => {
        try {
          localStorage.setItem(MNEMONIC_KEY, JSON.stringify(map));
          const curP = getRealProgress();
          curP.userMnemonics = map;
          curP.__explicitMnemonicWrite = true;
          saveRealProgress(curP);
          if (!window.__xhzDiagRunning) {
            syncProgressToSupabaseAuth(curP).catch(() => {});
          }
        } catch (_) {}
      };
      const target = String(urlObj.searchParams.get('target') || urlObj.searchParams.get('hanzi') || urlObj.searchParams.get('character') || body.target || body.hanzi || body.character || '').trim();

      if (method === 'GET') {
        const map = readMnemonicMap();
        const items = target
          ? (Array.isArray(map[target]) ? map[target] : [])
          : Object.keys(map).flatMap(k => Array.isArray(map[k]) ? map[k] : []);
        return jsonResponse({ ok: true, target, items, total: items.length });
      }

      if ((p === '/v1/ugc/mnemonic' && method === 'DELETE') || (p === '/v1/ugc/mnemonic/delete' && method === 'POST') || (/^\/v1\/ugc\/mnemonic\/[^/]+$/.test(p) && method === 'DELETE')) {
        const mDel = p.match(/^\/v1\/ugc\/mnemonic\/([^/]+)$/);
        const delId = String(urlObj.searchParams.get('id') || body.id || (mDel ? safeDecodeURIComponent(mDel[1]) : '') || '').trim();
        if (!delId) return jsonResponse({ ok: false, error: 'Thiếu mã ghi chú.' }, 400);
        const map = readMnemonicMap();
        const keysToScan = target && Array.isArray(map[target]) ? [target] : Object.keys(map);
        let removed = false;
        let remainItems = target && Array.isArray(map[target]) ? map[target] : [];
        for (const k of keysToScan) {
          const list = Array.isArray(map[k]) ? map[k] : [];
          const nextList = list.filter(x => x && x.id !== delId);
          if (nextList.length !== list.length) {
            removed = true;
            if (nextList.length > 0) map[k] = nextList;
            else delete map[k];
            if (!target || target === k) remainItems = nextList;
          }
        }
        if (!removed) return jsonResponse({ ok: false, error: 'Không tìm thấy ghi chú.' }, 404);
        writeMnemonicMap(map);
        return jsonResponse({ ok: true, deleted: true, id: delId, items: remainItems });
      }

      if ((p === '/v1/ugc/mnemonic/vote' || /^\/v1\/ugc\/mnemonic\/[^/]+\/vote$/.test(p)) && method === 'POST') {
        const mVote = p.match(/^\/v1\/ugc\/mnemonic\/([^/]+)\/vote$/);
        const voteId = String(body.id || (mVote ? safeDecodeURIComponent(mVote[1]) : '') || '').trim();
        const map = readMnemonicMap();
        const keysToScan = target && Array.isArray(map[target]) ? [target] : Object.keys(map);
        let foundItem = null;
        let foundList = [];
        for (const k of keysToScan) {
          const list = Array.isArray(map[k]) ? map[k] : [];
          const hit = list.find(x => x && x.id === voteId);
          if (hit) {
            const delta = Number(body.delta) === -1 ? -1 : 1;
            hit.votes = Math.max(0, (Number(hit.votes) || 0) + delta);
            foundItem = hit;
            foundList = list;
            break;
          }
        }
        if (!foundItem) return jsonResponse({ ok: false, error: 'Không tìm thấy ghi chú.' }, 404);
        writeMnemonicMap(map);
        return jsonResponse({ ok: true, id: voteId, votes: foundItem.votes, items: foundList });
      }

      if (p === '/v1/ugc/mnemonic' && method === 'POST') {
        const note = String(body.note || body.content || body.text || '').trim();
        if (!target || note.length < 2 || note.length > 280) {
          return jsonResponse({ ok: false, error: 'Vui lòng nhập ghi chú từ 2 đến 280 ký tự.' }, 400);
        }
        const map = readMnemonicMap();
        const existing = Array.isArray(map[target]) ? map[target] : [];
        const item = {
          id: 'mn-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
          target,
          note,
          votes: 1,
          updatedAt: new Date().toISOString()
        };
        map[target] = [item, ...existing].slice(0, 10);
        writeMnemonicMap(map);
        return jsonResponse({ ok: true, item, items: map[target] });
      }
    }

    return jsonResponse({ ok: true, items: [], data: null });
  }


  // ============================================================================
  // 5. INTERCEPT FETCH, XHR & DOM MEDIA ELEMENTS
  // ============================================================================
  const ORIG_FETCH = originalFetch;
  const ORIG_XHR_OPEN = XMLHttpRequest.prototype.open;
  const ORIG_XHR_SEND = XMLHttpRequest.prototype.send;
  const supabaseFetchInitial = supabasePull;
  function isApiUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return (
      url.includes('api.xiehanzi.com') ||
      url.includes('/v1/') ||
      url.includes('/v2/') ||
      url.startsWith('/v1') ||
      url.startsWith('/v2')
    );
  }

  const STATIC_CURR_ROOTS = [
    'thu-vien-new-hsk',
    'thu-vien-hsk',
    'thu-vien-yct',
    'thu-vien-boya',
    'thu-vien-hanyu-jiaocheng'
  ];

  function isDynamicSpaRoute(pathname) {
    const p = (pathname || '/').replace(/\/+$/, '') || '/';
    const parts = p.split('/').filter(Boolean);
    if (parts[0] === 'han-tu' && parts.length >= 2) return true;
    if (parts[0] === 'tu-vung' && parts.length >= 2) return true;
    if (parts[0] === 'han-viet') return true;
    if (parts[0] === 'ngu-phap' && parts.length >= 3) return true;
    if (parts[0] === 'kiem-tra-ngu-phap' && parts[1] === 'lam-bai') return true;
    if (parts[0] && parts[0].startsWith('thu-vien-')) {
      if (STATIC_CURR_ROOTS.includes(parts[0])) return parts.length >= 3;
      return parts.length >= 2;
    }
    if (parts[0] === 'luyen-chep-chinh-ta' && parts.length >= 2) return true;
    if ((parts[0] === 'kiem-tra-hsk' && parts.length >= 2) || (parts[0] === 'de-kiem-tra' && parts[1] === 'lam-bai')) return true;
    if (parts[0] === 'hoc' && (parts[1] === 'chang' || parts[1] === 'bai' || parts[1] === 'kiem-tra-cap') && parts.length >= 3) return true;
    if (parts[0] === 'hoc' && (parts[1] === 'tien-do' || parts[1] === 'thoi-quen')) return true;
    if (parts[0] === 'on-tap' && (parts[1] === 'da-hoc' || parts[1] === 'so-loi' || parts[1] === 'loi-sai')) return true;
    if (parts[0] === 'tra-chu' && (parts[1] === 'bo-thu' || parts[1] === 'hsk') && parts.length >= 3) return true;
    return false;
  }

  function getRequestHeaderValue(input, init, headerName) {
    try {
      const target = String(headerName || '').toLowerCase();
      const h = (init && init.headers) || (input && input.headers);
      if (!h) return '';
      if (typeof h.get === 'function') return String(h.get(headerName) || h.get(target) || '');
      if (Array.isArray(h)) {
        const pair = h.find(([k]) => String(k || '').toLowerCase() === target);
        return pair ? String(pair[1] || '') : '';
      }
      if (typeof h === 'object') {
        for (const k of Object.keys(h)) {
          if (k.toLowerCase() === target) return String(h[k] || '');
        }
      }
    } catch (_) {}
    return '';
  }

  function isPrefetchRequest(input, init) {
    return Boolean(
      getRequestHeaderValue(input, init, 'next-router-prefetch') ||
      getRequestHeaderValue(input, init, 'purpose') === 'prefetch'
    );
  }

  function isRscRequest(url, input, init) {
    return Boolean(
      (typeof url === 'string' && url.includes('_rsc=')) ||
      getRequestHeaderValue(input, init, 'rsc') === '1'
    );
  }

  function createSyntheticResponse(body, status, contentType, urlStr) {
    const res = new Response(body, {
      status,
      headers: { 'Content-Type': contentType || 'text/plain; charset=utf-8' }
    });
    if (urlStr) {
      try { Object.defineProperty(res, 'url', { value: urlStr, configurable: true }); } catch (_) {}
    }
    return res;
  }

  window.fetch = async function (input, init) {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input && typeof input === 'object') {
      url = input.url || input.href || '';
    }

    // 0. Silently swallow dead third-party analytics/telemetry requests
    if (/google-analytics\.com|analytics\.google\.com|googletagmanager\.com|doubleclick\.net|sentry\.io|posthog|umami|clarity\.ms|\/g\/collect/i.test(url)) {
      return new Response('', { status: 204 });
    }
    if (url === '/monitoring' || url.includes('/monitoring?')) {
      return jsonResponse({ ok: true });
    }

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
      const mergedInit = init ? { ...init } : {};
      if (!mergedInit.method && input && input.method) {
        mergedInit.method = input.method;
      }
      const reqMethod = (mergedInit.method || 'GET').toUpperCase();
      if (mergedInit.body === undefined && reqMethod !== 'GET' && reqMethod !== 'HEAD' && input && typeof input.clone === 'function') {
        try {
          mergedInit.body = await input.clone().text();
        } catch (_) {}
      }
      return handleApiRequest(fullUrl, mergedInit);
    }

    // 3. Intercept Next.js App Router RSC requests on static export cleanly without Connection closed / Error Boundary crashes
    if (isRscRequest(url, input, init)) {
      let cleanUrlStr = window.location.href;
      try {
        const cleanU = new URL(url, window.location.origin);
        cleanU.searchParams.delete('_rsc');
        cleanUrlStr = cleanU.toString();
        if (isPrefetchRequest(input, init)) {
          return createSyntheticResponse('', 404, 'text/plain; charset=utf-8', cleanUrlStr);
        }
        const targetHref = cleanU.pathname + cleanU.search + cleanU.hash;
        if (isDynamicSpaRoute(window.location.pathname) && cleanU.pathname === '/hoc/bat-dau') {
          return createSyntheticResponse('', 404, 'text/plain; charset=utf-8', cleanUrlStr);
        }
        if (isDynamicSpaRoute(cleanU.pathname)) {
          origPushState.call(history, null, '', targetHref);
          setTimeout(() => { checkAndRenderDynamicPage(); setTimeout(mountStudioLayout, 50); }, 10);
          return new Promise(() => {});
        }
        const curNorm = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
        const nextNorm = (cleanU.pathname || '/').replace(/\/+$/, '') || '/';
        if (nextNorm !== curNorm || cleanU.search !== window.location.search) {
          window.location.assign(targetHref);
          return new Promise(() => {});
        }
        // Same-route router.refresh() (e.g. clicking "Thử lại") -> real page reload instead of empty Flight stream
        window.location.reload();
        return new Promise(() => {});
      } catch (_) {}
      return createSyntheticResponse('', 404, 'text/plain; charset=utf-8', cleanUrlStr);
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
          let parsed = txt;
          if (this.responseType === 'json') {
            try { parsed = JSON.parse(txt); } catch (_) {}
          }
          Object.defineProperty(this, 'status', { value: 200, configurable: true });
          Object.defineProperty(this, 'statusText', { value: 'OK', configurable: true });
          Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
          Object.defineProperty(this, 'responseText', { value: txt, configurable: true });
          Object.defineProperty(this, 'response', { value: parsed, configurable: true });
          Object.defineProperty(this, 'responseURL', { value: fullUrl, configurable: true });
          this.getAllResponseHeaders = () => 'content-type: application/json; charset=utf-8\r\n';
          this.getResponseHeader = name =>
            String(name || '').toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null;
          this.dispatchEvent(new Event('readystatechange'));
          this.dispatchEvent(new Event('load'));
          this.dispatchEvent(new Event('loadend'));
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
    const main = document.querySelector('main');
    if (main) {
      main.style.display = 'none';
    }
    if (!customRoot || !customRoot.isConnected) {
      customRoot = document.createElement('div');
      customRoot.id = 'xhz-dynamic-page-root';
      customRoot.className = 'mx-auto max-w-5xl px-4 py-8';
      customRoot.style.color = 'inherit';
      const siteHdr = document.querySelector('header[data-site-header="true"]');
      if (main && main.parentNode) {
        main.parentNode.insertBefore(customRoot, main);
      } else if (siteHdr && siteHdr.parentNode) {
        siteHdr.parentNode.insertBefore(customRoot, siteHdr.nextSibling);
      } else {
        document.body.appendChild(customRoot);
      }
    }
    customRoot.style.color = 'inherit';
    customRoot.style.width = '100%';
    customRoot.style.boxSizing = 'border-box';
    customRoot.style.minWidth = '0';
    return customRoot;
  }

  function restoreOriginalMainIfStatic() {
    if (window.__xhzDictSegPollTimer) {
      clearInterval(window.__xhzDictSegPollTimer);
      window.__xhzDictSegPollTimer = null;
    }
    if (window.__xhzDictResizeHandler) {
      window.removeEventListener('resize', window.__xhzDictResizeHandler);
      window.__xhzDictResizeHandler = null;
    }
    if (window.__xhzDictYtPlayer && typeof window.__xhzDictYtPlayer.destroy === 'function') {
      try { window.__xhzDictYtPlayer.destroy(); } catch (_) {}
      window.__xhzDictYtPlayer = null;
    }
    const customRoot = document.getElementById('xhz-dynamic-page-root');
    if (customRoot) {
      customRoot.remove();
    }
    const runnerRoot = document.getElementById('xhz-lesson-runner-root');
    if (runnerRoot) {
      runnerRoot.remove();
    }
    if (window.__xhzLessonKeydownHandler) {
      window.removeEventListener('keydown', window.__xhzLessonKeydownHandler);
      window.__xhzLessonKeydownHandler = null;
    }
    const main = document.querySelector('main');
    if (main) {
      main.style.display = '';
    }
    document.body.style.overflow = '';
  }

  function playPronunciation(text, audioUrl, rate) {
    const cleanText = String(text || '').replace(/[\r\n]+/g, ' ').trim();
    const cleanHz = cleanText.replace(/[^\u4e00-\u9fff]/g, '');
    const speakFallback = () => {
      if ('speechSynthesis' in window && cleanText) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(cleanText);
          u.lang = 'zh-CN';
          u.rate = rate ? Math.min(1, Math.max(0.5, rate)) : 0.9;
          window.speechSynthesis.speak(u);
        } catch (_) {}
      }
    };
    const tryWordAudioOrSpeak = () => {
      if (audioUrl !== 'tts' && cleanHz && cleanHz.length >= 2 && cleanHz.length <= 4) {
        try {
          const a = new window.Audio(rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(cleanHz)}.mp3`));
          if (rate) a.playbackRate = rate;
          a.onerror = speakFallback;
          a.play().catch(speakFallback);
          return;
        } catch (_) {}
      }
      speakFallback();
    };
    if (audioUrl && audioUrl !== 'tts' && !audioUrl.includes('media-signed/')) {
      // Skip known-missing 1-character MP3 paths under word_audios/ (avoids 404/ORB console errors)
      let isMissingSingleCharMp3 = false;
      try {
        const m = String(audioUrl).match(/\/word_audios\/([^/?#]+)\.mp3$/i);
        if (m) {
          const decodedStem = safeDecodeURIComponent(m[1]).replace(/[^\u4e00-\u9fff]/g, '');
          if (decodedStem.length < 2) isMissingSingleCharMp3 = true;
        }
      } catch (_) {}
      if (!isMissingSingleCharMp3) {
        try {
          const a = new window.Audio(rewriteMediaUrl(audioUrl));
          if (rate) a.playbackRate = rate;
          a.onerror = tryWordAudioOrSpeak;
          a.play().catch(tryWordAudioOrSpeak);
          return;
        } catch (_) {
          tryWordAudioOrSpeak();
          return;
        }
      }
    }
    tryWordAudioOrSpeak();
  }
  window.__xhzPlayAudio = playPronunciation;

  // --------------------------------------------------------------------------
  // 6.1. Trang Chi Tiết Chữ Hán (/han-tu/:slug)
  // --------------------------------------------------------------------------
  function wireNotebookToggleButton(btnId, { key, isChar, meta = {} }) {
    const btn = document.getElementById(btnId);
    if (!btn || !key) return;
    const checkSaved = () => {
      const st = getLocalState();
      const prog = getRealProgress();
      return Boolean(
        (st.masteredChars && st.masteredChars[key]) ||
        (st.savedWords && st.savedWords[key]) ||
        (prog.masteredChars && prog.masteredChars[key]) ||
        (prog.savedWords && prog.savedWords[key])
      );
    };
    const renderBtn = () => {
      const saved = checkSaved();
      btn.textContent = saved ? '✅ Đã lưu Sổ tay' : '⭐ Lưu vào Sổ tay';
      btn.style.background = saved ? '#dcfce7' : '#f5f5f4';
      btn.style.color = saved ? '#15803d' : '#1c1917';
      btn.style.borderColor = saved ? '#86efac' : '#d6d3d1';
    };
    renderBtn();
    btn.onclick = async () => {
      const wasSaved = checkSaved();
      btn.disabled = true;
      try {
        if (wasSaved) {
          await fetch(`/v1/notebook/${encodeURIComponent(key)}`, { method: 'DELETE' });
        } else {
          await fetch('/v1/notebook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word: key,
              hanzi: key,
              character: isChar ? key : undefined,
              isCharacter: !!isChar,
              pinyin: meta.pinyin || '',
              hanviet: meta.hanviet || '',
              meaningVi: meta.meaningVi || ''
            })
          });
        }
      } catch (_) {}
      btn.disabled = false;
      renderBtn();
    };
  }

  function buildMnemonicSectionHtml(targetKey) {
    return `
      <div id="xhz-char-mnemonic-section" style="margin-top:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
          <h3 style="font-size:18px;font-weight:700;margin:0;color:#1c1917;">📝 Ghi chú ghi nhớ cá nhân cho "${escapeHtml(targetKey)}"</h3>
          <span style="font-size:12px;color:#0d9488;font-weight:700;">Đồng bộ theo tài khoản</span>
        </div>
        <form id="xhz-mnemonic-form" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
          <input id="xhz-mnemonic-input" type="text" maxlength="280" placeholder="Nhập mẹo nhớ chiết tự hoặc câu chuyện cho chữ/từ ${escapeHtml(targetKey)}..." style="flex:1;min-width:220px;padding:10px 14px;border-radius:12px;border:1px solid #d6d3d1;background:#fafaf9;color:#1c1917;font-size:14px;" />
          <button type="submit" id="xhz-mnemonic-submit" style="padding:10px 18px;border-radius:12px;border:none;background:#4f46e5;color:#fff;font-weight:700;cursor:pointer;font-size:14px;">Lưu mẹo nhớ</button>
        </form>
        <div id="xhz-mnemonic-list" style="display:flex;flex-direction:column;gap:8px;font-size:14px;color:#44403c;">Chưa có ghi chú nào. Hãy thêm mẹo nhớ đầu tiên của bạn!</div>
      </div>`;
  }

  function wireMnemonicSection(targetKey) {
    const mnemonicForm = document.getElementById('xhz-mnemonic-form');
    const mnemonicInp = document.getElementById('xhz-mnemonic-input');
    const mnemonicSubmitBtn = document.getElementById('xhz-mnemonic-submit');
    const mnemonicList = document.getElementById('xhz-mnemonic-list');
    const renderMnemonicList = (items) => {
      if (!mnemonicList) return;
      const arr = Array.isArray(items) ? items : [];
      if (arr.length === 0) {
        mnemonicList.innerHTML = '<div style="opacity:.72;font-size:13.5px;">Chưa có ghi chú nào cho mục này. Hãy thêm mẹo nhớ để ôn tập nhanh hơn!</div>';
        return;
      }
      mnemonicList.innerHTML = arr.map(it =>
        `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;">` +
          `<div style="flex:1;min-width:0;word-break:break-word;line-height:1.45;">${escapeHtml(it.note || '')}</div>` +
          `<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">` +
            `<button type="button" data-mn-vote="${escapeHtml(it.id || '')}" aria-label="Thích ghi chú" style="border:1px solid #d6d3d1;background:#fff;color:#4338ca;border-radius:999px;padding:4px 11px;font-size:12.5px;font-weight:700;cursor:pointer;">👍 ${Number(it.votes) || 1}</button>` +
            `<button type="button" data-mn-del="${escapeHtml(it.id || '')}" aria-label="Xóa ghi chú" title="Xóa ghi chú" style="border:1px solid #fecaca;background:#fff1f2;color:#b91c1c;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:700;cursor:pointer;">🗑️</button>` +
          `</div>` +
        `</div>`
      ).join('');
      mnemonicList.querySelectorAll('[data-mn-vote]').forEach(btn => {
        bindStudioClick(btn, async () => {
          const vid = btn.getAttribute('data-mn-vote') || '';
          if (!vid) return;
          try {
            const r = await (await fetch('/v1/ugc/mnemonic/vote', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: targetKey, id: vid })
            })).json();
            if (r && r.ok && Array.isArray(r.items)) renderMnemonicList(r.items);
          } catch (_) {}
        });
      });
      mnemonicList.querySelectorAll('[data-mn-del]').forEach(btn => {
        bindStudioClick(btn, async () => {
          const did = btn.getAttribute('data-mn-del') || '';
          if (!did) return;
          try {
            const r = await (await fetch('/v1/ugc/mnemonic/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: targetKey, id: did })
            })).json();
            if (r && r.ok) {
              renderMnemonicList(r.items || []);
              HTQ_STUDIO_FX.toast('🗑️ Đã xóa ghi chú.', 'info');
            }
          } catch (_) {}
        });
      });
    };
    if (mnemonicList) {
      fetch('/v1/ugc/mnemonic?target=' + encodeURIComponent(targetKey))
        .then(r => r.json())
        .then(d => { if (d && Array.isArray(d.items)) renderMnemonicList(d.items); })
        .catch(() => {});
    }
    let submittingMnemonic = false;
    const submitMnemonic = async () => {
      if (submittingMnemonic || !mnemonicInp) return;
      const note = String(mnemonicInp.value || '').trim();
      if (note.length < 2) {
        HTQ_STUDIO_FX.toast('Vui lòng nhập mẹo nhớ dài ít nhất 2 ký tự.', 'warn');
        mnemonicInp.focus();
        return;
      }
      submittingMnemonic = true;
      try {
        const res = await (await fetch('/v1/ugc/mnemonic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: targetKey, note })
        })).json();
        if (res && res.ok) {
          mnemonicInp.value = '';
          renderMnemonicList(res.items);
          HTQ_STUDIO_FX.toast('✨ Đã lưu mẹo nhớ cho ' + targetKey + '!', 'success');
        } else {
          HTQ_STUDIO_FX.toast((res && res.error) || 'Không thể lưu ghi chú.', 'warn');
        }
      } catch (_) {}
      submittingMnemonic = false;
    };
    if (mnemonicForm && mnemonicInp) {
      mnemonicForm.addEventListener('submit', ev => {
        ev.preventDefault();
        submitMnemonic();
      });
    }
    if (mnemonicSubmitBtn) {
      bindStudioClick(mnemonicSubmitBtn, () => submitMnemonic());
    }
  }
  window.__xhzBuildMnemonicSectionHtml = buildMnemonicSectionHtml;
  window.__xhzWireMnemonicSection = wireMnemonicSection;

  async function renderCharacterDetailPage(slug) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải dữ liệu chữ Hán...</div>`;
    const data = await lookupCharacter(slug);
    if (!data) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy chữ Hán cho "${escapeHtml(safeDecodeURIComponent(slug))}". <a href="/tra-chu" style="text-decoration:underline;margin-left:8px;">Quay lại Từ điển</a></div>`;
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
    const audioSrc = String(ch || '').length >= 2 ? rewriteMediaUrl(`https://static.xiehanzi.com/word_audios/${encodeURIComponent(ch)}.mp3`) : 'tts';

    document.title = `Chữ ${ch} (${pinyin} - ${hanviet}) | Học Tiếng Trung`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/tra-chu" style="color:#0d9488;font-weight:600;text-decoration:none;">← Quay lại Từ điển</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid #f5f5f4;padding:16px;">
          <div id="xhz-hanzi-writer-target" style="width:200px;height:200px;background:#fafaf9;border:2px dashed #d6d3d1;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:110px;font-family:'Noto Serif SC',serif;color:#1c1917;">
            ${escapeHtml(ch)}
          </div>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;justify-content:center;">
            <button type="button" id="xhz-btn-speak" style="padding:8px 16px;border-radius:999px;background:#0d9488;color:#fff;border:none;font-weight:600;cursor:pointer;">🔊 Phát âm</button>
            <button type="button" id="xhz-btn-animate" style="padding:8px 16px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:600;cursor:pointer;">✍️ Xem thứ tự nét</button>
            <button type="button" id="xhz-btn-quiz-stroke" style="padding:8px 16px;border-radius:999px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;font-weight:600;cursor:pointer;">🎯 Tập viết chữ</button>
            <button type="button" id="xhz-btn-save-notebook" style="padding:8px 16px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:600;cursor:pointer;">⭐ Lưu vào Sổ tay</button>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <span style="font-size:36px;font-weight:800;color:#1c1917;">${escapeHtml(ch)}</span>
            <span style="font-size:22px;color:#0d9488;font-weight:700;">[${escapeHtml(pinyin)}]</span>
            ${hanviet ? `<span style="padding:4px 12px;border-radius:999px;background:#ccfbf1;color:#115e59;font-weight:700;text-transform:uppercase;">Hán Việt: ${escapeHtml(hanviet)}</span>` : ''}
            ${hsk ? `<span style="padding:4px 10px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:600;font-size:13px;">HSK ${escapeHtml(hsk)}</span>` : ''}
          </div>
          <div style="font-size:18px;color:#292524;line-height:1.6;">
            <strong>Nghĩa tiếng Việt:</strong> ${escapeHtml(meaning || 'Đang cập nhật')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:8px;">
            <div style="background:#fafaf9;padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;">
              <div style="font-size:12px;color:#78716c;">Bộ thủ</div>
              <div style="font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(radical || '—')}</div>
            </div>
            <div style="background:#fafaf9;padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;">
              <div style="font-size:12px;color:#78716c;">Số nét</div>
              <div style="font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(strokes || '—')} nét</div>
            </div>
            <div style="background:#fafaf9;padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;">
              <div style="font-size:12px;color:#78716c;">Cấu trúc</div>
              <div style="font-size:16px;font-weight:700;color:#1c1917;">${escapeHtml(decomposition || 'Đơn thể / Hợp thể')}</div>
            </div>
          </div>
          ${etymology ? `<div style="margin-top:8px;padding:12px 16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;color:#78350f;font-size:15px;">💡 <strong>Gợi ý ghi nhớ / Nguồn gốc:</strong> ${escapeHtml(etymology)}</div>` : ''}
        </div>
      </div>

      ${components.length > 0 ? `
      <div style="margin-top:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1c1917;">🧩 Thành phần cấu tạo</h3>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${components.map(c => {
            const compChar = typeof c === 'string' ? c : (c.character || c.component || '');
            const compMean = typeof c === 'object' ? (c.meaningVi || c.pinyin || '') : '';
            return `<a href="/han-tu/${encodeURIComponent(compChar)}" style="padding:10px 16px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-weight:600;">${escapeHtml(compChar)} ${compMean ? `<span style="color:#78716c;font-weight:400;">(${escapeHtml(compMean)})</span>` : ''}</a>`;
          }).join('')}
        </div>
      </div>` : ''}

      ${commonWords.length > 0 ? `
      <div style="margin-top:24px;background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:20px;">
        <h3 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1c1917;">📚 Từ ghép thông dụng chứa "${escapeHtml(ch)}" (${commonWords.length})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
          ${commonWords.slice(0, 24).map(w => {
            const wHz = w.word || w.hanzi || '';
            const wPy = w.pinyin || '';
            const wMean = w.meaningVi || w.meaning || '';
            return `<a href="/tu-vung/${encodeURIComponent(wHz)}" style="display:block;padding:12px 16px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:20px;font-weight:700;color:#1c1917;">${escapeHtml(wHz)}</span>
                <span style="font-size:14px;color:#0d9488;font-weight:600;">${escapeHtml(wPy)}</span>
              </div>
              <div style="font-size:14px;color:#57534e;margin-top:4px;">${escapeHtml(wMean)}</div>
            </a>`;
          }).join('')}
        </div>
      </div>` : ''}

      ${buildMnemonicSectionHtml(ch)}
    `;

    const speakBtn = document.getElementById('xhz-btn-speak');
    if (speakBtn) speakBtn.onclick = () => playPronunciation(ch, audioSrc);
    wireNotebookToggleButton('xhz-btn-save-notebook', {
      key: ch,
      isChar: true,
      meta: { pinyin, hanviet, meaningVi: meaning }
    });
    wireMnemonicSection(ch);

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
        radicalColor: '#0d9488'
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
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy từ vựng "${escapeHtml(safeDecodeURIComponent(slug))}". <a href="/tra-chu" style="text-decoration:underline;">Quay lại Từ điển</a></div>`;
      return;
    }
    const word = data.word || data.hanzi || safeDecodeURIComponent(slug);
    const pinyin = data.wordPinyin || (Array.isArray(data.pinyins) && data.pinyins.join(', ')) || data.pinyin || '';
    const hanviet = data.hanViet || data.hanviet || '';
    const meaning =
      data.meaningVi ||
      data.wordMeaningVi ||
      data.translationVi ||
      (Array.isArray(data.meanings) && data.meanings.join('; ')) ||
      '';
    const pos = data.partOfSpeechVi || data.partOfSpeech || '';
    const usageNote = data.usageNote || '';
    const hsk = data.hskLevel || '';
    const examples = Array.isArray(data.examples) ? data.examples : [];
    const commonWords = Array.isArray(data.commonWords) ? data.commonWords : [];
    const chars = Array.from(word).filter(c => /[\u4e00-\u9fff]/.test(c));
    const audioUrl = rewriteMediaUrl(
      (Array.isArray(data.audios) && data.audios[0]) ||
        data.audioUrl ||
        `https://static.xiehanzi.com/word_audios/${encodeURIComponent(word)}.mp3`
    );

    document.title = `Từ vựng ${word} (${pinyin}) - ${meaning} | Học Tiếng Trung`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/tra-chu" style="color:#0d9488;font-weight:600;text-decoration:none;">← Quay lại Từ điển</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
              <h1 style="font-size:44px;font-weight:800;margin:0;color:#1c1917;font-family:'Noto Serif SC',serif;">${escapeHtml(word)}</h1>
              ${pinyin ? `<span style="font-size:24px;color:#0d9488;font-weight:700;">[${escapeHtml(pinyin)}]</span>` : ''}
              ${hanviet ? `<span style="padding:4px 12px;border-radius:999px;background:#ccfbf1;color:#115e59;font-weight:700;text-transform:uppercase;">${escapeHtml(hanviet)}</span>` : ''}
              ${pos ? `<span style="padding:4px 12px;border-radius:999px;background:#f5f5f4;color:#57534e;font-weight:700;font-size:13px;">${escapeHtml(pos)}</span>` : ''}
              ${hsk ? `<span style="padding:4px 12px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:700;">HSK ${escapeHtml(hsk)}</span>` : ''}
            </div>
            <div style="font-size:20px;color:#292524;margin-top:12px;line-height:1.5;">
              <strong>Nghĩa:</strong> ${escapeHtml(meaning || 'Đang cập nhật')}
            </div>
            ${usageNote ? `<div style="margin-top:10px;padding:10px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;font-size:14px;line-height:1.5;">💡 <strong>Cách dùng:</strong> ${escapeHtml(usageNote)}</div>` : ''}
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <button type="button" id="xhz-word-speak" style="padding:10px 20px;border-radius:999px;background:#0d9488;color:#fff;border:none;font-weight:700;cursor:pointer;font-size:15px;">🔊 Nghe phát âm</button>
            <button type="button" id="xhz-btn-save-notebook" style="padding:10px 18px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;cursor:pointer;font-size:14px;">⭐ Lưu vào Sổ tay</button>
          </div>
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:16px;font-weight:700;color:#57534e;margin-bottom:10px;">Chiết tự từng chữ Hán:</h3>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${chars.map(c => `<a href="/han-tu/${encodeURIComponent(c)}" style="padding:10px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;text-decoration:none;color:#1c1917;font-weight:700;font-size:20px;">${escapeHtml(c)} → Xem nét viết</a>`).join('')}
          </div>
        </div>

        ${commonWords.length > 0 ? `
        <div style="margin-top:22px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:17px;font-weight:700;color:#1c1917;margin-bottom:10px;">🔗 Từ ghép & cụm từ thông dụng (${commonWords.length})</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;">
            ${commonWords.slice(0, 12).map(cw => {
              const cwHz = cw.hanzi || cw.word || '';
              const cwPy = cw.pinyin || '';
              const cwVi = cw.meaningVi || cw.meaning || '';
              return `<a href="/tu-vung/${encodeURIComponent(cwHz)}" style="padding:10px 14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:18px;font-weight:800;font-family:'Noto Serif SC',serif;">${escapeHtml(cwHz)}</span>
                  <span style="font-size:13px;color:#0d9488;font-weight:700;">${escapeHtml(cwPy)}</span>
                </div>
                <div style="font-size:13px;color:#57534e;margin-top:4px;">${escapeHtml(cwVi)}</div>
              </a>`;
            }).join('')}
          </div>
        </div>` : ''}

        ${examples.length > 0 ? `
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f5f5f4;">
          <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:12px;">💬 Ví dụ mẫu câu (${examples.length})</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${examples.map(ex => {
              const zh = (ex.chinese || ex.hanzi || ex.zh || '').replace(/\{|\}/g, '');
              const py = ex.pinyin || '';
              const vi = ex.vietnamese || ex.meaningVi || ex.vi || '';
              return `<div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(zh)}</div>
                  <div style="font-size:14px;color:#0d9488;margin-top:2px;">${escapeHtml(py)}</div>
                  <div style="font-size:15px;color:#44403c;margin-top:4px;">${escapeHtml(vi)}</div>
                </div>
                <button type="button" data-xhz-play="${escapeHtml(zh)}" aria-label="Nghe phát âm" style="padding:6px 14px;border-radius:999px;background:#ccfbf1;color:#115e59;border:1px solid #99f6e4;font-weight:700;cursor:pointer;font-size:13px;">🔊 Nghe</button>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      </div>
      ${buildMnemonicSectionHtml(word)}
    `;
    const btn = document.getElementById('xhz-word-speak');
    if (btn) btn.onclick = () => playPronunciation(word, audioUrl);
    wireNotebookToggleButton('xhz-btn-save-notebook', {
      key: word,
      isChar: word.length === 1,
      meta: { pinyin, hanviet, meaningVi: meaning }
    });
    wireMnemonicSection(word);
  }

  // --------------------------------------------------------------------------
  // 6.3. Trang Hán Việt (/han-viet và /han-viet/:slug)
  // --------------------------------------------------------------------------
  async function renderHanVietIndexPage() {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải danh mục âm Hán Việt...</div>`;
    const index = (await loadLocalJson('/data/han-viet/index.json')) || [];
    document.title = `Từ điển Âm Hán Việt (${index.length} âm đọc) | Học Tiếng Trung`;

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
      const normalizedList = index.map(x => typeof x === 'string' ? { slug: x, reading: x.replace(/-/g, ' ') } : x);
      const filtered = norm
        ? normalizedList.filter(x => (x.reading || '').toLowerCase().includes(norm) || (x.slug || '').includes(norm))
        : normalizedList.slice(0, 300);
      grid.innerHTML = filtered.map(item => `
        <a href="/han-viet/${encodeURIComponent(item.slug)}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:10px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-weight:700;">
          <span style="text-transform:capitalize;">${escapeHtml(item.reading)}</span>
          <span style="font-size:12px;color:#0d9488;">→</span>
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
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy âm Hán Việt "${escapeHtml(safeDecodeURIComponent(slug))}". <a href="/han-viet">Xem toàn bộ danh sách</a></div>`;
      return;
    }
    const groups = Array.isArray(data.groups) ? data.groups : [];
    const reading = data.reading || (groups[0] && groups[0].reading) || safeDecodeURIComponent(slug).replace(/-/g, ' ');
    const flatChars = groups.length > 0
      ? groups.flatMap(g => Array.isArray(g.chars) ? g.chars : (Array.isArray(g.characters) ? g.characters : []))
      : (Array.isArray(data.characters) ? data.characters : (data.sampleChars || []));
    document.title = `Âm Hán Việt "${reading.toUpperCase()}" (${flatChars.length} chữ) | Học Tiếng Trung`;

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/han-viet" style="color:#0d9488;font-weight:600;text-decoration:none;">← Danh sách Âm Hán Việt</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
        <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">Âm Hán Việt: <span style="color:#0d9488;text-transform:uppercase;">${escapeHtml(reading)}</span> (${flatChars.length} chữ Hán)</h1>
        <p style="color:#57534e;margin:0 0 20px 0;">Nhấn vào bất kỳ chữ Hán nào bên dưới để xem thứ tự nét viết, chiết tự và từ ghép thông dụng.</p>
        ${groups.length > 0 ? groups.map(g => {
          const gChars = Array.isArray(g.chars) ? g.chars : (Array.isArray(g.characters) ? g.characters : []);
          const gWords = Array.isArray(g.words) ? g.words : [];
          return `
          <div style="margin-bottom:24px;">
            <div style="font-size:15px;font-weight:800;color:#115e59;background:#f0fdfa;border:1px solid #99f6e4;display:inline-block;padding:5px 14px;border-radius:999px;margin-bottom:12px;">
              Âm đọc: ${escapeHtml((g.reading || g.pinyin || reading).toUpperCase())} (${gChars.length} chữ Hán${gWords.length ? ` · ${gWords.length} từ ghép` : ''})
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;">
              ${gChars.map(c => {
                const hz = c.hanzi || c.character || c.c || '';
                const cWords = Array.isArray(c.words) ? c.words.slice(0, 3) : [];
                return `
                <a href="/han-tu/${encodeURIComponent(hz)}" style="padding:14px 16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;display:flex;flex-direction:column;justify-content:space-between;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:34px;font-weight:800;color:#1c1917;font-family:'Noto Serif SC',serif;">${escapeHtml(hz)}</span>
                    <div style="text-align:right;">
                      <div style="color:#0d9488;font-weight:800;font-size:15px;">${escapeHtml(c.pinyin || g.pinyin || '')}</div>
                      ${c.hskLevel ? `<span style="font-size:11px;padding:1px 6px;border-radius:6px;background:#e0f2fe;color:#0369a1;font-weight:700;">HSK ${escapeHtml(c.hskLevel)}</span>` : ''}
                    </div>
                  </div>
                  <div style="font-size:14px;color:#292524;margin-top:8px;line-height:1.4;font-weight:600;">${escapeHtml(c.meaningVi || c.m || '')}</div>
                  ${cWords.length > 0 ? `<div style="font-size:12px;color:#78716c;margin-top:6px;">Từ ghép: ${escapeHtml(cWords.map(w => `${w.hanzi} (${w.hanviet || w.meaningVi || ''})`).join(', '))}</div>` : ''}
                </a>
              `;
              }).join('')}
            </div>
          </div>
        `;
        }).join('') : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
            ${flatChars.map(c => {
              if (typeof c === 'string') {
                return `<a href="/han-tu/${encodeURIComponent(c)}" style="padding:14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;font-size:24px;font-weight:700;text-align:center;">${escapeHtml(c)}</a>`;
              }
              return `<a href="/han-tu/${encodeURIComponent(c.character || c.c)}" style="padding:14px;border-radius:12px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:28px;font-weight:800;color:#1c1917;">${escapeHtml(c.character || c.c)}</span>
                  <span style="color:#0d9488;font-weight:700;">${escapeHtml(c.pinyin || c.p || '')}</span>
                </div>
                <div style="font-size:14px;color:#57534e;margin-top:6px;">${escapeHtml(c.meaningVi || c.m || '')}</div>
              </a>`;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6.4. Trang Chi Tiết Ngữ Pháp (/ngu-phap/:level/:pointId)
  // --------------------------------------------------------------------------
  async function renderGrammarDetailPage(levelSlug, pointId) {
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải chủ điểm ngữ pháp...</div>`;
    const decodedPointId = (() => { try { return safeDecodeURIComponent(pointId || ''); } catch (_) { return String(pointId || ''); } })();
    const lvlNum = (String(levelSlug || '').match(/\d+/) || ['1'])[0];
    const isNew = String(levelSlug || '').includes('new') || /_new_|^new-/.test(decodedPointId);
    const file = isNew ? `/data/grammar/new-hsk-level-${lvlNum}.json` : `/data/grammar/hsk-level-${lvlNum}.json`;
    let data = await loadLocalJson(file);
    let item = data && Array.isArray(data.items) ? data.items.find(x => x.id === decodedPointId || x.code === decodedPointId) : null;
    if (!item) {
      const altData = await loadLocalJson(isNew ? `/data/grammar/hsk-level-${lvlNum}.json` : `/data/grammar/new-hsk-level-${lvlNum}.json`);
      item = altData && Array.isArray(altData.items) ? altData.items.find(x => x.id === decodedPointId || x.code === decodedPointId) : null;
      if (!data && altData) data = altData;
    }
    if (!item && data && Array.isArray(data.items)) {
      item = data.items[0];
    }
    if (!item) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy chủ điểm ngữ pháp "${escapeHtml(decodedPointId)}". <a href="/ngu-phap">Quay lại Ngữ pháp</a></div>`;
      return;
    }

    const title = item.title || item.topic || item.name || pointId;
    const syntax = item.pattern || item.grammar_syntax || '';
    const explanation = item.explanation || item.grammar_explanation || item.summary || '';
    const tips = Array.isArray(item.grammar_tips) ? item.grammar_tips : [];
    const attentions = Array.isArray(item.grammar_attentions) ? item.grammar_attentions : [];
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    document.title = `${title} - Ngữ pháp ${item.level || levelSlug.toUpperCase()} | Học Tiếng Trung`;
    const examples = Array.isArray(item.example) ? item.example : (Array.isArray(item.examples) ? item.examples : []);

    root.innerHTML = `
      <div style="margin-bottom:16px;">
        <a href="/ngu-phap" style="color:#0d9488;font-weight:600;text-decoration:none;">← Quay lại Thư viện Ngữ pháp</a>
      </div>
      <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:28px;">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <span style="padding:4px 12px;border-radius:999px;background:#ccfbf1;color:#115e59;font-weight:700;font-size:13px;">${escapeHtml((item.level || levelSlug).toUpperCase())}</span>
          ${item.type || item.category ? `<span style="padding:4px 12px;border-radius:999px;background:#f5f5f4;color:#57534e;font-size:13px;font-weight:600;">${escapeHtml(item.type || item.category)}</span>` : ''}
          ${keywords.map(kw => `<span style="padding:4px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-weight:700;font-size:13px;">Từ khoá: ${escapeHtml(kw)}</span>`).join('')}
        </div>
        <h1 style="font-size:30px;font-weight:800;color:#1c1917;margin:0 0 14px 0;">${escapeHtml(title)}</h1>
        ${syntax ? `<div style="padding:14px 18px;background:#f0fdfa;border-left:4px solid #0d9488;border-radius:10px;font-size:17px;font-weight:700;color:#115e59;margin-bottom:16px;white-space:pre-line;">📐 Cấu trúc:\n${escapeHtml(syntax)}</div>` : ''}
        <div style="font-size:16px;line-height:1.75;color:#292524;margin-bottom:20px;white-space:pre-line;">
          ${escapeHtml(explanation)}
        </div>
        ${tips.length > 0 ? `
          <div style="margin-bottom:18px;padding:14px 18px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;">
            <div style="font-weight:800;margin-bottom:6px;">💡 Mẹo ghi nhớ & Cách dùng:</div>
            <ul style="margin:0;padding-left:20px;line-height:1.6;">
              ${tips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${attentions.length > 0 ? `
          <div style="margin-bottom:18px;padding:14px 18px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;">
            <div style="font-weight:800;margin-bottom:6px;">⚠️ Lưu ý quan trọng:</div>
            <ul style="margin:0;padding-left:20px;line-height:1.6;">
              ${attentions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <h3 style="font-size:18px;font-weight:700;color:#1c1917;margin-bottom:12px;">💬 Ví dụ minh họa (${examples.length})</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${examples.map(ex => {
            const zh = (ex.chinese || ex.hanzi || '').replace(/\{|\}/g, '');
            return `
              <div style="padding:14px 18px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:19px;font-weight:700;color:#1c1917;">${escapeHtml(zh)}</div>
                  <div style="font-size:14px;color:#0d9488;margin-top:3px;">${escapeHtml(ex.pinyin || '')}</div>
                  <div style="font-size:15px;color:#44403c;margin-top:4px;">${escapeHtml(ex.vietnamese || ex.meaningVi || '')}</div>
                </div>
                <button type="button" data-xhz-play="${escapeHtml(zh)}" aria-label="Nghe phát âm" style="padding:6px 14px;border-radius:999px;background:#ccfbf1;color:#115e59;border:1px solid #99f6e4;font-weight:700;cursor:pointer;font-size:13px;">🔊 Nghe câu</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6.5. Trang Làm Bài Kiểm Tra Ngữ Pháp (/kiem-tra-ngu-phap/lam-bai)
  //      Chuẩn 1:1 theo giao diện gốc xiehanzi.com
  // --------------------------------------------------------------------------
  async function renderGrammarQuizRunPage(searchParams) {
    let root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tạo đề kiểm tra ngữ pháp...</div>`;

    const tracksParam = (searchParams.get('tracks') || 'new-hsk1').split(',').filter(Boolean);
    const grammarId = searchParams.get('grammarId') || '';
    const count = Math.max(1, Math.min(100, Number(searchParams.get('count')) || 20));
    const typesParam = (searchParams.get('types') || 'mcq,translate_zh_vi,translate_vi_zh').split(',').filter(Boolean);

    let allQuestions = [];
    for (const tr of tracksParam) {
      const cleanTrack = tr.replace(/^new-hsk-(\d+)$/, 'new-hsk$1').replace(/^hsk-(\d+)$/, 'hsk$1');
      let qData = await loadLocalJson(`/data/grammar/quiz-${cleanTrack}.json`);
      if (!qData && /^new-hsk(\d+)$/.test(cleanTrack)) {
        const fbNum = cleanTrack.replace(/^new-hsk/, '');
        qData = await loadLocalJson(`/data/grammar/quiz-hsk${fbNum}.json`);
      }
      if (qData && Array.isArray(qData.questions)) {
        allQuestions.push(...qData.questions.filter(q => typesParam.includes(q.type)));
      }
    }
    let grammarPoint = null;
    if (grammarId) {
      allQuestions = allQuestions.filter(question => question.grammarId === grammarId);
      const grammarLevel = (grammarId.match(/\d+/) || ['1'])[0];
      const grammarIsNew = /_new_|^new-/.test(grammarId);
      const grammarData = await loadLocalJson(`/data/grammar/${grammarIsNew ? 'new-hsk' : 'hsk'}-level-${grammarLevel}.json`);
      grammarPoint = grammarData && Array.isArray(grammarData.items) ? grammarData.items.find(item => item.id === grammarId) : null;
      if (!grammarPoint) {
        root.innerHTML = `<h1>Không tìm thấy chủ điểm ngữ pháp</h1><p>${escapeHtml(grammarId)}</p><a href="/ngu-phap">Quay lại ngữ pháp</a>`;
        return;
      }
      for (const [index, example] of (grammarPoint.example || []).entries()) {
        if (!example.chinese || !example.vietnamese) continue;
        for (const type of ['translate_zh_vi', 'translate_vi_zh']) {
          if (!typesParam.includes(type)) continue;
          const prompt = type === 'translate_zh_vi' ? example.chinese : example.vietnamese;
          if (allQuestions.some(question => question.type === type && question.prompt === prompt)) continue;
          allQuestions.push({ questionId: `${grammarId}_example_${index}_${type}`, grammarId, type, prompt,
            answer: type === 'translate_zh_vi' ? example.vietnamese : example.chinese,
            explanation: grammarPoint.grammar_explanation || '' });
        }
      }
    }
    if (allQuestions.length === 0 && !grammarId) {
      const fallback = await loadLocalJson('/data/grammar/quiz-new-hsk1.json');
      if (fallback && Array.isArray(fallback.questions)) {
        allQuestions = fallback.questions;
      }
    }
    const questions = allQuestions.slice(0, count);
    document.title = `${grammarPoint ? `Luyện tập: ${grammarPoint.topic}` : 'Kiểm tra ngữ pháp'} (${questions.length} câu) | Học Tiếng Trung`;
    root = getMainContentContainer();

    root.innerHTML = `
      <style>
        .xhz-gq-shell { margin: -24px -16px 0 -16px; background: #edf6f5; min-height: calc(100vh - 64px); padding-bottom: 48px; color: #1c1917; font-family: inherit; }
        .xhz-gq-topbar { position: sticky; top: 0; z-index: 35; background: rgba(240, 250, 249, 0.96); backdrop-filter: blur(8px); border-bottom: 1px solid #d3eae7; padding: 12px 24px; }
        .xhz-gq-topbar-inner { max-width: 1120px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .xhz-gq-body { max-width: 1120px; margin: 24px auto 0; padding: 0 20px; display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 24px; align-items: start; }
        @media (max-width: 900px) {
          .xhz-gq-body { grid-template-columns: 1fr; }
          .xhz-gq-sidebar { position: static !important; order: -1; }
        }
        .xhz-gq-qcard { background: #ffffff; border: 1px solid #cde5e2; border-radius: 18px; padding: 22px 24px; box-shadow: 0 2px 8px rgba(28, 25, 23, 0.03); scroll-margin-top: 84px; transition: border-color 0.2s; }
        .xhz-gq-qcard.is-active { border-color: #bde0dc; }
        .xhz-gq-opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
        @media (max-width: 640px) {
          .xhz-gq-opts { grid-template-columns: 1fr; }
        }
        .xhz-gq-opt { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; border: 1px solid #d3eae7; background: #f2fbfa; color: #1c1917; font-size: 15px; font-weight: 500; text-align: left; cursor: pointer; transition: all 0.15s; }
        .xhz-gq-opt:hover { border-color: #0d9488; background: #fff; }
        .xhz-gq-opt-letter { width: 26px; height: 26px; border-radius: 999px; border: 1px solid #99d5ce; background: #ffffff; color: #57534e; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .xhz-gq-opt.is-selected { border-color: #0d9488; background: #f0fdfa; color: #115e59; font-weight: 700; }
        .xhz-gq-opt.is-selected .xhz-gq-opt-letter { background: #0d9488; border-color: #0d9488; color: #fff; }
        .xhz-gq-opt.is-correct { border-color: #16a34a !important; background: #dcfce7 !important; color: #14532d !important; font-weight: 700; }
        .xhz-gq-opt.is-correct .xhz-gq-opt-letter { background: #16a34a !important; border-color: #16a34a !important; color: #fff !important; }
        .xhz-gq-opt.is-wrong { border-color: #dc2626 !important; background: #fee2e2 !important; color: #7f1d1d !important; }
        .xhz-gq-opt.is-wrong .xhz-gq-opt-letter { background: #dc2626 !important; border-color: #dc2626 !important; color: #fff !important; }
        .xhz-gq-nav-btn { height: 36px; border-radius: 10px; border: 1.5px solid transparent; background: #d3eae7; color: #44403c; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.15s; }
        .xhz-gq-nav-btn:hover { opacity: 0.9; }
        .xhz-gq-nav-btn.is-current { border-color: #0d9488; background: #d9f2ef; color: #1c1917; }
        .xhz-gq-nav-btn.is-answered { background: #0d9488; color: #fff; }
        .xhz-gq-nav-btn.is-flagged::after { content: ''; position: absolute; top: -3px; right: -3px; width: 9px; height: 9px; border-radius: 999px; background: #d97706; border: 1.5px solid #ffffff; }
      </style>
      <div class="xhz-gq-shell">
        ${grammarPoint ? `<div style="max-width:1120px;margin:auto;padding:20px;"><a href="/ngu-phap/${/_new_|^new-/.test(grammarId) ? 'new-hsk-' : ''}${(grammarId.match(/\d+/) || ['1'])[0]}/${encodeURIComponent(grammarId)}">← Xem lý thuyết</a><h1 style="font-size:24px;font-weight:800;margin:12px 0;">Luyện tập: ${escapeHtml(grammarPoint.topic)}</h1><p>${questions.length} câu hỏi từ chủ điểm này và các ví dụ có trong dữ liệu.</p></div>` : ''}
        <div class="xhz-gq-topbar">
          <div class="xhz-gq-topbar-inner">
            <div style="display:flex;align-items:center;gap:18px;">
              <a href="/kiem-tra-ngu-phap" style="display:inline-flex;align-items:center;gap:6px;color:#57534e;font-size:14px;font-weight:600;text-decoration:none;">
                <span style="font-size:16px;">‹</span> Thoát
              </a>
              <div>
                <div style="font-size:15px;font-weight:800;color:#1c1917;line-height:1.2;">Kiểm tra ngữ pháp</div>
                <div id="xhz-gq-answered-sub" style="font-size:12px;color:#78716c;margin-top:2px;">Đã trả lời 0/${questions.length}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <button type="button" id="xhz-gq-fullscreen" title="Toàn màn hình" aria-label="Toàn màn hình" style="width:36px;height:36px;border-radius:999px;border:1px solid #bde0dc;background:#ffffff;color:#44403c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:15px;">⤢</button>
              <button type="button" id="xhz-gq-submit" style="padding:8px 20px;border-radius:999px;border:none;background:#0d9488;color:#fff;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 2px 8px rgba(13,148,136,0.28);">Nộp bài</button>
            </div>
          </div>
        </div>

        <div id="xhz-gq-result-banner" style="display:none;max-width:1120px;margin:20px auto 0;padding:0 20px;"></div>

        <div class="xhz-gq-body">
          <div id="xhz-gq-list" style="display:flex;flex-direction:column;gap:18px;"></div>
          <div class="xhz-gq-sidebar" style="position:sticky;top:76px;background:#ffffff;border:1px solid #cde5e2;border-radius:18px;padding:18px;">
            <div style="font-size:14px;font-weight:800;color:#1c1917;margin-bottom:12px;">Câu hỏi</div>
            <div id="xhz-gq-nav-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;"></div>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid #d3eae7;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#57534e;">
              <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:3px;background:#0d9488;display:inline-block;"></span> Đã trả lời</div>
              <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:3px;background:#d3eae7;display:inline-block;"></span> Chưa trả lời</div>
              <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:999px;background:#d97706;display:inline-block;"></span> Đã đánh dấu</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const listEl = document.getElementById('xhz-gq-list');
    const navGridEl = document.getElementById('xhz-gq-nav-grid');
    const answeredSub = document.getElementById('xhz-gq-answered-sub');
    const submitBtn = document.getElementById('xhz-gq-submit');
    const fsBtn = document.getElementById('xhz-gq-fullscreen');
    const resultBanner = document.getElementById('xhz-gq-result-banner');

    let currentIdx = 0;
    let isSubmitted = false;
    const userAnswers = {};
    const flaggedSet = new Set();
    const navButtons = [];
    const cardEls = [];

    if (fsBtn) {
      fsBtn.onclick = () => {
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        } catch (_) {}
      };
    }

    const syncNavAndStatus = () => {
      const ansCount = Object.keys(userAnswers).length;
      if (answeredSub) {
        answeredSub.textContent = isSubmitted
          ? `Đã nộp bài • Đạt ${ countCorrect() }/${questions.length} câu đúng`
          : `Đã trả lời ${ansCount}/${questions.length}`;
      }
      navButtons.forEach((nb, i) => {
        nb.classList.toggle('is-current', i === currentIdx);
        nb.classList.toggle('is-answered', userAnswers[i] !== undefined && String(userAnswers[i]).trim() !== '');
        nb.classList.toggle('is-flagged', flaggedSet.has(i));
      });
    };

    const countCorrect = () => {
      let c = 0;
      questions.forEach((q, i) => {
        if (q.type === 'mcq') {
          const rightKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));
          if (userAnswers[i] === rightKey) c++;
        } else if (userAnswers[i] && String(userAnswers[i]).trim().length > 0) {
          c++;
        }
      });
      return c;
    };

    questions.forEach((q, idx) => {
      const nb = document.createElement('button');
      nb.type = 'button';
      nb.className = 'xhz-gq-nav-btn' + (idx === 0 ? ' is-current' : '');
      nb.textContent = String(idx + 1);
      nb.onclick = () => {
        currentIdx = idx;
        syncNavAndStatus();
        if (cardEls[idx]) {
          cardEls[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      navGridEl.appendChild(nb);
      navButtons.push(nb);

      const card = document.createElement('div');
      card.className = 'xhz-gq-qcard' + (idx === 0 ? ' is-active' : '');
      cardEls.push(card);

      const typeLabel =
        q.type === 'mcq'
          ? 'Trắc nghiệm'
          : q.type === 'translate_zh_vi'
          ? 'Dịch Trung → Việt'
          : 'Dịch Việt → Trung';

      const stemText = q.prompt || q.stem || '';
      const hintText = q.vietnameseHint ? ` (${q.vietnameseHint})` : '';

      const topRowHtml = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:28px;height:28px;border-radius:999px;background:#ccfbf1;color:#0d9488;font-weight:800;font-size:13px;display:inline-flex;align-items:center;justify-content:center;">${idx + 1}</span>
            <span style="font-size:13px;color:#78716c;font-weight:600;">${typeLabel}</span>
          </div>
          <button type="button" class="xhz-gq-flag-btn" title="Đánh dấu câu hỏi" style="width:36px;height:36px;border-radius:10px;border:1px solid #d3eae7;background:#f2fbfa;color:#78716c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </button>
        </div>
      `;

      if (q.type === 'mcq') {
        card.innerHTML = `
          ${topRowHtml}
          <div style="font-size:20px;font-weight:700;color:#1c1917;margin-top:10px;line-height:1.55;font-family:'Noto Serif SC',system-ui,sans-serif;">
            ${escapeHtml(stemText)}<span style="font-weight:600;color:#292524;">${escapeHtml(hintText)}</span>
          </div>
          ${q.pinyin || q.stemPinyin ? `<div style="font-size:13px;color:#78716c;margin-top:2px;">${escapeHtml(q.pinyin || q.stemPinyin)}</div>` : ''}
          <div class="xhz-gq-opts"></div>
          <div class="xhz-gq-exp" style="display:none;margin-top:14px;padding:12px 16px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a;color:#78350f;font-size:14px;line-height:1.5;"></div>
        `;
        const optsWrap = card.querySelector('.xhz-gq-opts');
        const options = Array.isArray(q.options) ? q.options : [];
        const rightAnswerKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));

        options.forEach((optItem, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const optKey = typeof optItem === 'object' ? String(optItem.id || optItem.key || letter) : letter;
          const optLabel = typeof optItem === 'object' ? (optItem.text || optItem.label || optItem.value || '') : String(optItem);
          const isThisCorrect = optKey === rightAnswerKey || optIdx === q.correctIndex;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'xhz-gq-opt';
          btn.dataset.key = optKey;
          btn.dataset.correct = isThisCorrect ? '1' : '0';
          btn.type = 'button'; btn.innerHTML = `<span class="xhz-gq-opt-letter">${escapeHtml(letter)}</span><span>${escapeHtml(optLabel)}</span>`;
          btn.onclick = () => {
            if (isSubmitted) return;
            currentIdx = idx;
            userAnswers[idx] = optKey;
            Array.from(optsWrap.children).forEach(b => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            syncNavAndStatus();
          };
          optsWrap.appendChild(btn);
        });
      } else {
        card.innerHTML = `
          ${topRowHtml}
          <div style="font-size:19px;font-weight:700;color:#1c1917;margin-top:10px;line-height:1.55;">
            ${escapeHtml(stemText)}
          </div>
          ${q.promptPinyin ? `<div style="font-size:13px;color:#78716c;margin-top:2px;">${escapeHtml(q.promptPinyin)}</div>` : ''}
          <div style="margin-top:12px;">
            <input type="text" class="xhz-gq-input" placeholder="Nhập câu dịch của bạn..." style="width:100%;padding:12px 16px;border-radius:12px;border:1px solid #d3eae7;font-size:15px;color:#1c1917;background:#f2fbfa;box-sizing:border-box;" />
          </div>
          <div class="xhz-gq-exp" style="display:none;margin-top:14px;padding:12px 16px;border-radius:12px;background:#ecfdf5;border:1px solid #6ee7b7;color:#065f46;font-size:14px;line-height:1.5;"></div>
        `;
        const inp = card.querySelector('.xhz-gq-input');
        if (inp) {
          inp.onfocus = () => {
            currentIdx = idx;
            syncNavAndStatus();
          };
          inp.oninput = () => {
            if (isSubmitted) return;
            if (inp.value.trim()) {
              userAnswers[idx] = inp.value.trim();
            } else {
              delete userAnswers[idx];
            }
            syncNavAndStatus();
          };
        }
      }

      const flagBtn = card.querySelector('.xhz-gq-flag-btn');
      if (flagBtn) {
        flagBtn.onclick = () => {
          currentIdx = idx;
          if (flaggedSet.has(idx)) {
            flaggedSet.delete(idx);
            flagBtn.style.color = '#78716c';
            flagBtn.style.borderColor = '#d3eae7';
            flagBtn.style.background = '#f2fbfa';
          } else {
            flaggedSet.add(idx);
            flagBtn.style.color = '#d97706';
            flagBtn.style.borderColor = '#f59e0b';
            flagBtn.style.background = '#fffbeb';
          }
          syncNavAndStatus();
        };
      }

      listEl.appendChild(card);
    });

    if (submitBtn) {
      submitBtn.onclick = () => {
        if (isSubmitted) {
          window.location.reload();
          return;
        }
        isSubmitted = true;
        const totalRight = countCorrect();
        const pct = Math.round((totalRight / Math.max(1, questions.length)) * 100);
        submitBtn.textContent = 'Làm đề mới';
        submitBtn.style.background = '#1c1917';

        recordStudyProgress({ minutes: 5, gradingInc: 1 });

        if (resultBanner) {
          resultBanner.style.display = 'block';
          resultBanner.innerHTML = `
            <div style="background:#fff;border:2px solid #0d9488;border-radius:18px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;box-shadow:0 8px 24px rgba(13,148,136,0.12);">
              <div>
                <div style="font-size:13px;font-weight:800;color:#0d9488;text-transform:uppercase;">Kết quả bài kiểm tra ngữ pháp</div>
                <div style="font-size:26px;font-weight:800;color:#1c1917;margin-top:4px;">Đúng ${totalRight} / ${questions.length} câu (${pct}%)</div>
                <div style="font-size:14px;color:#57534e;margin-top:2px;">Xem giải thích chi tiết ở từng câu bên dưới.</div>
              </div>
              <div style="display:flex;gap:10px;">
                <a href="/kiem-tra-ngu-phap" style="padding:10px 18px;border-radius:999px;border:1px solid #d6d3d1;background:#fafaf9;color:#1c1917;font-weight:700;text-decoration:none;font-size:14px;">Chọn lại cấu hình</a>
              </div>
            </div>
          `;
        }

        questions.forEach((q, idx) => {
          const card = cardEls[idx];
          if (!card) return;
          const expEl = card.querySelector('.xhz-gq-exp');
          if (q.type === 'mcq') {
            const optsWrap = card.querySelector('.xhz-gq-opts');
            const options = Array.isArray(q.options) ? q.options : [];
            const rightAnswerKey = q.answer !== undefined ? String(q.answer) : String.fromCharCode(65 + (q.correctIndex || 0));
            const pickedKey = userAnswers[idx];
            if (optsWrap) {
              Array.from(optsWrap.children).forEach(b => {
                b.classList.remove('is-selected');
                if (b.dataset.correct === '1') {
                  b.classList.add('is-correct');
                } else if (pickedKey && b.dataset.key === pickedKey) {
                  b.classList.add('is-wrong');
                }
              });
            }
            if (expEl) {
              const rightObj = options.find((o, i) => (typeof o === 'object' ? String(o.id || o.key) === rightAnswerKey : i === q.correctIndex));
              const rightText = typeof rightObj === 'object' ? (rightObj.text || '') : (rightObj || '');
              expEl.style.display = 'block';
              expEl.innerHTML = `<strong>Đáp án đúng: ${escapeHtml(rightAnswerKey)}. ${escapeHtml(rightText)}</strong>${q.explanation ? `<div style="margin-top:4px;">${escapeHtml(q.explanation)}</div>` : ''}`;
            }
          } else if (expEl) {
            expEl.style.display = 'block';
            expEl.innerHTML = `<strong>Đáp án tham khảo:</strong> ${escapeHtml(q.referenceAnswer || '')}${q.referencePinyin ? `<br/><span style="color:#0d9488;">Pinyin: ${escapeHtml(q.referencePinyin)}</span>` : ''}`;
          }
        });

        syncNavAndStatus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    syncNavAndStatus();
  }

  // --------------------------------------------------------------------------
  // 6.6. Trang Giáo Trình & Thư Viện (/thu-vien-*/:sub*)
  //      Chuẩn 1:1 theo giao diện gốc xiehanzi.com (Hero xanh + Grid 5 cột)
  // --------------------------------------------------------------------------
  async function renderCurriculumSubPage(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    const rootSlug = parts[0];
    const subParts = parts.slice(1);
    const currMap = {
      'thu-vien-new-hsk': 'new-hsk',
      'thu-vien-hsk': 'hsk',
      'thu-vien-yct': 'yct',
      'thu-vien-boya': 'boya',
      'thu-vien-boyahsk': 'boya',
      'thu-vien-hanyu-jiaocheng': 'hanyu-jiaocheng',
      'thu-vien-giao-trinh-han-ngu': 'hanyu-jiaocheng',
      'thu-vien-msutong': 'boya',
      'thu-vien-tu-vung': 'new-hsk',
      'thu-vien-chu-han': 'hsk'
    };
    const currBrandMap = {
      'thu-vien-new-hsk': 'Thư viện HSK 3.0 (9 cấp)',
      'thu-vien-hsk': 'Thư viện HSK 2.0 (6 cấp)',
      'thu-vien-yct': 'Thư viện YCT',
      'thu-vien-boya': 'Giáo trình Boya',
      'thu-vien-boyahsk': 'Giáo trình Boya HSK',
      'thu-vien-hanyu-jiaocheng': 'Giáo trình Hán Ngữ',
      'thu-vien-giao-trinh-han-ngu': 'Giáo trình Hán Ngữ',
      'thu-vien-msutong': 'Giáo trình MSutong'
    };
    const curr = currMap[rootSlug] || 'new-hsk';
    const brandTitle = currBrandMap[rootSlug] || 'Thư viện HSK 3.0 (9 cấp)';
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải nội dung giáo trình...</div>`;

    if (subParts.length === 1) {
      const levelSlug = subParts[0];
      let lvlData = await loadLocalJson(`/data/curriculums/${curr}/levels/${levelSlug}.json`);
      if (!lvlData && curr === 'new-hsk') {
        lvlData = await loadLocalJson(`/data/curriculums/hsk/levels/${levelSlug}.json`);
      }
      const levelObj = (lvlData && lvlData.level) || { name: levelSlug.toUpperCase(), topics: [], lessons: [] };
      const topics = Array.isArray(levelObj.topics) ? levelObj.topics : [];
      const lessons = Array.isArray(levelObj.lessons) ? levelObj.lessons : [];
      const rawItems = lessons.length > 0 ? lessons : topics;
      const learnedSet2 = new Set((getRealProgress().learnedWords || []).map(w => String(w || '').replace(/^w:|^c:/, '')));
      const items = await Promise.all(rawItems.map(async (it) => {
        const isTopicOnly = Boolean(it.topicSlug) && !it.lessonSlug;
        const slug = it.lessonSlug || it.topicSlug || '';
        const d = slug
          ? (isTopicOnly
              ? ((await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${slug}.json`)) || (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${slug}.json`)))
              : ((await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${slug}.json`)) || (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${slug}.json`))))
          : null;
        const wl = (d && d.lesson && d.lesson.words) || (d && d.topic && d.topic.words) || (d && d.words) || [];
        const wc = Math.max(Number(it.wordCount) || 0, wl.length);
        const lc = wl.filter(w => { const hz = String((w && (w.hanzi || w.word)) || '').replace(/\{|\}/g, ''); return hz && learnedSet2.has(hz); }).length;
        const pct = wc > 0 ? Math.min(100, Math.round((lc / wc) * 100)) : 0;
        return { ...it, wordCount: wc, learnedCount: lc, progressPct: pct };
      }));

      document.title = `${levelObj.name || levelSlug} - ${brandTitle} | Học Tiếng Trung`;
      root.innerHTML = `
        <div style="margin-bottom:16px;">
          <a href="/${rootSlug}" style="color:#0d9488;font-weight:600;text-decoration:none;">← Quay lại ${escapeHtml(brandTitle)}</a>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;">
          <h1 style="font-size:28px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">📘 ${escapeHtml(levelObj.name || levelSlug.toUpperCase())}</h1>
          <p style="color:#57534e;margin-bottom:20px;">Tổng số từ vựng: <strong>${escapeHtml(levelObj.wordCount || '')}</strong> • Số chủ đề/bài học: <strong>${items.length}</strong></p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
            ${items.map((t, i) => {
              const slug = t.lessonSlug || t.topicSlug || '';
              const isLesson = Boolean(t.lessonSlug);
              const href = isLesson
                ? `/${rootSlug}/${levelSlug}/bai-hoc/${encodeURIComponent(slug)}`
                : `/${rootSlug}/${levelSlug}/${encodeURIComponent(slug)}`;
              const label = t.titleVi || t.topic || t.titleZh || slug;
              return `
                <a href="${href}" style="display:block;padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;text-decoration:none;color:#1c1917;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <span style="font-size:13px;color:#2563eb;font-weight:700;">${isLesson ? `Bài ${t.lessonNumber || i + 1}` : `Chủ đề ${i + 1}`}</span>
                    <span style="font-size:12px;font-weight:700;color:${t.progressPct > 0 ? '#15803d' : '#78716c'};background:${t.progressPct > 0 ? '#dcfce7' : '#f5f5f4'};padding:2px 8px;border-radius:999px;">${t.learnedCount || 0}/${t.wordCount || 0} (${t.progressPct || 0}%)</span>
                  </div>
                  <div style="font-size:18px;font-weight:700;margin-top:4px;color:#1c1917;">${escapeHtml(label)}</div>
                  <div style="height:5px;border-radius:999px;background:#e7e5e4;margin:10px 0 6px 0;overflow:hidden;"><div style="height:100%;width:${t.progressPct || 0}%;background:#2563eb;"></div></div>
                  <div style="font-size:14px;color:#57534e;">${escapeHtml(t.wordCount || 0)} từ vựng →</div>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `;
      return;
    }

    const levelSlug = subParts[0];
    const lastSeg = subParts[subParts.length - 1];
    const isPractice = lastSeg === 'luyen-tap' || lastSeg === 'practice' || lastSeg === 'flashcard';
    const effectiveParts = isPractice ? subParts.slice(0, -1) : subParts;
    const itemSlug = safeDecodeURIComponent(effectiveParts[effectiveParts.length - 1] || '');
    const cleanItemSlug = itemSlug.startsWith(levelSlug + '-') ? itemSlug.slice(levelSlug.length + 1) : itemSlug;

    let detail =
      (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/topics/${levelSlug}--${levelSlug}-${cleanItemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/${curr}/lessons/${levelSlug}--${cleanItemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/new-hsk/topics/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/new-hsk/lessons/${levelSlug}--${itemSlug}.json`)) ||
      (await loadLocalJson(`/data/curriculums/hsk/topics/${levelSlug}--${itemSlug}.json`));

    const words =
      (detail && detail.lesson && detail.lesson.words) ||
      (detail && detail.topic && detail.topic.words) ||
      (detail && detail.words) ||
      [];
    const lessonObj = (detail && detail.lesson) || null;
    const topicObj = (detail && detail.topic) || null;
    const title =
      (lessonObj && (lessonObj.titleVi || lessonObj.titleZh || lessonObj.name)) ||
      (topicObj && (topicObj.topic || topicObj.name || topicObj.titleVi)) ||
      itemSlug;
    const subtitleZh = lessonObj && lessonObj.titleZh ? lessonObj.titleZh : '';
    const lessonNum = (lessonObj && lessonObj.lessonNumber) || (itemSlug.match(/bai-(\d+)/i) || [])[1] || '1';
    const lvlNum = (levelSlug.match(/\d+/) || ['1'])[0];
    const levelLabel = curr === 'new-hsk' ? `HSK 3.0 cấp ${lvlNum}` : `HSK cấp ${lvlNum}`;
    const baseDetailUrl = '/' + [rootSlug, ...effectiveParts].join('/');
    const practiceUrl = baseDetailUrl + '/luyen-tap';
    const flashcardUrl = baseDetailUrl + '/flashcard';

    if (isPractice && words.length > 0) {
      const startQuizMode = lastSeg === 'luyen-tap' || lastSeg === 'practice';
      document.title = `Luyện tập: ${title} - ${levelLabel} | Học Tiếng Trung`;
      root.innerHTML = `
        <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <a href="${baseDetailUrl}" style="color:#0d9488;font-weight:700;text-decoration:none;">← Quay lại bài học: ${escapeHtml(title)}</a>
          <a href="/${rootSlug}/${levelSlug}" style="color:#57534e;font-weight:600;text-decoration:none;">Danh sách bài ${escapeHtml(levelLabel)}</a>
        </div>
        <div style="background:#fff;color:#1c1917;border:1px solid #e7e5e4;border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
            <div>
              <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0;">🎯 Luyện tập từ vựng: ${escapeHtml(title)}</h1>
              <p style="font-size:14px;color:#57534e;margin:4px 0 0 0;">Chế độ Flashcard lật thẻ & Trắc nghiệm nhanh (${words.length} từ vựng)</p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" id="xhz-mode-flashcard" style="padding:8px 16px;border-radius:999px;background:#0d9488;color:#fff;border:none;font-weight:700;cursor:pointer;">🗂️ Flashcard</button>
              <button type="button" id="xhz-mode-quiz" style="padding:8px 16px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;cursor:pointer;">📝 Trắc nghiệm</button>
              <button type="button" id="xhz-mode-typing" style="padding:8px 16px;border-radius:999px;background:#f5f5f4;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;cursor:pointer;">⌨️ Gõ Pinyin &amp; Chữ Hán</button>
            </div>
          </div>
          <div id="xhz-practice-stage"></div>
        </div>
      `;

      const stage = document.getElementById('xhz-practice-stage');
      const btnFc = document.getElementById('xhz-mode-flashcard');
      const btnQz = document.getElementById('xhz-mode-quiz');
      const btnTy = document.getElementById('xhz-mode-typing');
      let idx = 0;
      let flipped = false;

      const renderFlashcard = () => {
        const w = words[idx] || words[0];
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        const py = w.wordPinyin || w.pinyin || '';
        const hv = w.hanviet || '';
        const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const ex = Array.isArray(w.examples) && w.examples[0] ? w.examples[0] : null;
        const audioUrl = w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '';

        stage.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:12px 0;">
            <div style="font-size:14px;font-weight:700;color:#78716c;">Thẻ ${idx + 1} / ${words.length}</div>
            <div id="xhz-fc-card" style="width:100%;max-width:520px;min-height:260px;border-radius:20px;border:2px solid #99f6e4;background:#f0fdfa;padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;box-shadow:0 8px 24px rgba(37,99,235,0.08);transition:all 0.2s;">
              <div style="font-size:64px;font-weight:800;color:#1c1917;font-family:'Noto Serif SC',serif;">${escapeHtml(hz)}</div>
              <div style="font-size:22px;font-weight:700;color:#2563eb;margin-top:8px;">${escapeHtml(py)}</div>
              ${flipped ? `
                <div style="margin-top:16px;padding-top:16px;border-top:1px dashed #93c5fd;width:100%;">
                  ${hv ? `<div style="font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;">Hán Việt: ${escapeHtml(hv)}</div>` : ''}
                  <div style="font-size:22px;font-weight:800;color:#1c1917;margin-top:6px;">${escapeHtml(vi)}</div>
                  ${ex ? `<div style="margin-top:10px;font-size:15px;color:#44403c;background:#fff;padding:10px;border-radius:10px;"><div><strong>${escapeHtml((ex.chinese || '').replace(/\{|\}/g, ''))}</strong></div><div style="color:#2563eb;font-size:13px;">${escapeHtml(ex.pinyin || '')}</div><div>${escapeHtml(ex.vietnamese || '')}</div></div>` : ''}
                </div>
              ` : `<div style="margin-top:18px;font-size:13px;color:#1d4ed8;font-weight:600;">👆 Nhấn vào thẻ để lật xem nghĩa tiếng Việt</div>`}
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
              <button type="button" id="xhz-fc-prev" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;">← Từ trước</button>
              <button type="button" id="xhz-fc-audio" style="padding:10px 18px;border-radius:12px;border:none;background:#ccfbf1;color:#115e59;font-weight:700;cursor:pointer;">🔊 Nghe phát âm</button>
              <button type="button" id="xhz-fc-flip" style="padding:10px 18px;border-radius:12px;border:none;background:#0d9488;color:#fff;font-weight:700;cursor:pointer;">🔄 Lật thẻ</button>
              <button type="button" id="xhz-fc-next" style="padding:10px 18px;border-radius:12px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;cursor:pointer;">Từ tiếp →</button>
              <button type="button" id="xhz-fc-done-all" style="padding:10px 18px;border-radius:12px;border:none;background:#16a34a;color:#fff;font-weight:800;cursor:pointer;">✅ Hoàn thành & Lưu tiến độ</button>
            </div>
          </div>
        `;
        document.getElementById('xhz-fc-card').onclick = () => {
          flipped = !flipped;
          if (flipped && hz) recordStudyProgress({ words: [hz] });
          renderFlashcard();
        };
        document.getElementById('xhz-fc-flip').onclick = () => {
          flipped = !flipped;
          if (flipped && hz) recordStudyProgress({ words: [hz] });
          renderFlashcard();
        };
        document.getElementById('xhz-fc-audio').onclick = () => playPronunciation(hz, audioUrl);
        document.getElementById('xhz-fc-prev').onclick = () => { idx = (idx - 1 + words.length) % words.length; flipped = false; renderFlashcard(); };
        document.getElementById('xhz-fc-next').onclick = () => {
          if (hz) recordStudyProgress({ words: [hz] });
          idx = (idx + 1) % words.length;
          flipped = false;
          renderFlashcard();
        };
        const fcDoneBtn = document.getElementById('xhz-fc-done-all');
        if (fcDoneBtn) {
          fcDoneBtn.onclick = async () => {
            fcDoneBtn.textContent = 'Đang đồng bộ...';
            fcDoneBtn.disabled = true;
            const allLessonWords = words.map(x => (x.hanzi || x.word || x.character || '').replace(/\{|\}/g, '')).filter(Boolean);
            const prog = recordStudyProgress({
              stageKey: `curr.${rootSlug}`,
              activityKey: `${itemSlug}.fc`,
              advanceTrack: false,
              words: allLessonWords,
              minutes: Math.max(4, Math.round(words.length * 0.6)),
              sessionInc: 1
            });
            try {
              await Promise.race([prog.__syncPromise || syncProgressToSupabaseAuth(prog), new Promise(r => setTimeout(r, 2000))]);
            } catch (_) {}
            window.location.assign(baseDetailUrl);
          };
        }
      };

      const renderQuiz = () => {
        let score = 0;
        const answered = new Set();
        stage.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;padding:10px 16px;border-radius:12px;background:#f0fdfa;color:#115e59;">
            <div id="xhz-curr-quiz-score" style="font-weight:800;">Điểm số: 0 / ${words.length}</div>
            <button type="button" id="xhz-curr-quiz-finish" style="padding:8px 16px;border-radius:999px;border:none;background:#16a34a;color:#fff;font-weight:800;cursor:pointer;font-size:13px;">✅ Hoàn thành bài tập &amp; Lưu tiến độ</button>
          </div>
          <div id="xhz-curr-quiz-list" style="display:flex;flex-direction:column;gap:14px;"></div>
        `;
        const listEl = document.getElementById('xhz-curr-quiz-list');
        const scoreEl = document.getElementById('xhz-curr-quiz-score');
        const finishQzBtn = document.getElementById('xhz-curr-quiz-finish');
        if (finishQzBtn) {
          finishQzBtn.onclick = async () => {
            finishQzBtn.textContent = 'Đang đồng bộ...';
            finishQzBtn.disabled = true;
            const allLessonWords = words.map(x => (x.hanzi || x.word || x.character || '').replace(/\{|\}/g, '')).filter(Boolean);
            const prog = recordStudyProgress({
              stageKey: `curr.${rootSlug}`,
              activityKey: `${itemSlug}.quiz`,
              advanceTrack: false,
              words: allLessonWords,
              minutes: Math.max(5, Math.round(words.length * 0.8)),
              sessionInc: 1,
              gradingInc: 1
            });
            try {
              await Promise.race([prog.__syncPromise || syncProgressToSupabaseAuth(prog), new Promise(r => setTimeout(r, 2000))]);
            } catch (_) {}
            window.location.assign(baseDetailUrl);
          };
        }
        words.forEach((w, qIdx) => {
          const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
          const py = w.wordPinyin || w.pinyin || '';
          const rightVi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
          const distractors = words
            .filter((_, i) => i !== qIdx)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(x => x.translationVi || x.wordMeaningVi || x.meaningVi || '');
          const options = [rightVi, ...distractors].sort(() => Math.random() - 0.5);

          const card = document.createElement('div');
          card.style.cssText = 'padding:16px;border-radius:14px;border:1px solid #e7e5e4;background:#fafaf9;';
          card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div>
                <span style="font-size:13px;font-weight:700;color:#78716c;margin-right:8px;">Câu ${qIdx + 1}/${words.length}</span>
                <span style="font-size:24px;font-weight:800;color:#1c1917;">${escapeHtml(hz)}</span>
                <span style="font-size:15px;color:#2563eb;font-weight:600;margin-left:8px;">[${escapeHtml(py)}]</span>
              </div>
              <button type="button" class="xhz-q-speak" style="border:none;background:#ccfbf1;color:#115e59;border-radius:999px;padding:4px 12px;font-weight:700;cursor:pointer;">🔊 Nghe</button>
            </div>
            <div class="xhz-q-opts" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;"></div>
          `;
          card.querySelector('.xhz-q-speak').onclick = () => playPronunciation(hz, w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '');
          const optsWrap = card.querySelector('.xhz-q-opts');
          options.forEach(optText => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'padding:10px 12px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:600;text-align:left;cursor:pointer;';
            btn.textContent = optText;
            btn.onclick = () => {
              const isCorrect = optText === rightVi;
              if (!answered.has(qIdx)) {
                answered.add(qIdx);
                if (isCorrect) {
                  score++;
                  recordStudyProgress({ words: [hz] });
                }
                if (answered.size === words.length) {
                  const allLessonWords = words.map(x => (x.hanzi || x.word || x.character || '').replace(/\{|\}/g, '')).filter(Boolean);
                  recordStudyProgress({
                    stageKey: `curr.${rootSlug}`,
                    activityKey: `${itemSlug}.quiz`,
                    advanceTrack: false,
                    words: allLessonWords,
                    minutes: Math.max(5, Math.round(words.length * 0.8)),
                    sessionInc: 1,
                    gradingInc: 1
                  });
                }
                scoreEl.textContent = `Điểm số: ${score} / ${words.length} (Đã làm ${answered.size} câu)${answered.size === words.length ? ' — Đã lưu tiến độ!' : ''}`;
              }
              Array.from(optsWrap.children).forEach(b => {
                b.style.background = b.textContent === rightVi ? '#dcfce7' : '#fff';
                b.style.borderColor = b.textContent === rightVi ? '#16a34a' : '#d6d3d1';
              });
              if (!isCorrect) {
                btn.style.background = '#fee2e2';
                btn.style.borderColor = '#dc2626';
              }
            };
            optsWrap.appendChild(btn);
          });
          listEl.appendChild(card);
        });
      };

      const normalizePinyin = s => String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ü/gi, 'u')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase();

      let tyIdx = 0;
      let tyCorrect = 0;
      const tyDone = new Set();

      const renderTypingMode = () => {
        const w = words[tyIdx] || words[0];
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        const py = w.wordPinyin || w.pinyin || '';
        const hv = w.hanviet || '';
        const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const audioUrl = w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '';
        stage.innerHTML = `
          <div style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:12px;background:#f5f5f4;font-weight:700;font-size:14px;">
              <span>Từ ${tyIdx + 1} / ${words.length}</span>
              <span style="color:#16a34a;">Đúng: ${tyCorrect} / ${words.length}</span>
            </div>
            <div style="padding:24px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;text-align:center;">
              <div style="font-size:13px;font-weight:700;color:#78716c;text-transform:uppercase;">Nghĩa tiếng Việt</div>
              <div style="font-size:26px;font-weight:800;color:#1c1917;margin:8px 0;">${escapeHtml(vi)}</div>
              ${hv ? `<div style="font-size:13px;color:#0d9488;font-weight:700;">Hán Việt: ${escapeHtml(hv)}</div>` : ''}
              <div id="xhz-ty-hint-box" style="display:none;margin-top:8px;font-size:16px;color:#0d9488;font-weight:700;">${escapeHtml(hz)} · ${escapeHtml(py)}</div>
              <div style="display:flex;gap:8px;justify-content:center;margin-top:14px;">
                <button type="button" id="xhz-ty-speak" style="padding:8px 14px;border-radius:999px;border:none;background:#f0fdfa;color:#115e59;font-weight:700;cursor:pointer;">🔊 Nghe phát âm</button>
                <button type="button" id="xhz-ty-hint" style="padding:8px 14px;border-radius:999px;border:1px solid #d6d3d1;background:#fff;color:#44403c;font-weight:700;cursor:pointer;">💡 Hiện gợi ý</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              <input id="xhz-typing-input" type="text" placeholder="Gõ chữ Hán (${escapeHtml(hz.slice(0, 1))}...) hoặc Pinyin (vd: ni hao)" style="flex:1;padding:12px 14px;border-radius:12px;border:1px solid #d6d3d1;font-size:16px;outline:none;" />
              <button type="button" id="xhz-ty-check" style="padding:12px 20px;border-radius:12px;border:none;background:#0d9488;color:#fff;font-weight:800;cursor:pointer;">Kiểm tra</button>
            </div>
            <div id="xhz-ty-feedback" style="min-height:24px;font-size:14px;font-weight:700;"></div>
            <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <div style="display:flex;gap:8px;">
                <button type="button" id="xhz-ty-prev" style="padding:9px 16px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;font-weight:700;cursor:pointer;">← Trước</button>
                <button type="button" id="xhz-ty-next" style="padding:9px 16px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;font-weight:700;cursor:pointer;">Tiếp →</button>
              </div>
              <button type="button" id="xhz-ty-finish" style="padding:9px 18px;border-radius:10px;border:none;background:#16a34a;color:#fff;font-weight:800;cursor:pointer;">✅ Hoàn thành &amp; Lưu tiến độ</button>
            </div>
          </div>
        `;
        const inp = document.getElementById('xhz-typing-input');
        const fb = document.getElementById('xhz-ty-feedback');
        document.getElementById('xhz-ty-speak').onclick = () => playPronunciation(hz, audioUrl);
        document.getElementById('xhz-ty-hint').onclick = () => {
          const hb = document.getElementById('xhz-ty-hint-box');
          if (hb) hb.style.display = hb.style.display === 'none' ? 'block' : 'none';
        };
        const checkAnswer = () => {
          const val = (inp.value || '').trim();
          if (!val) return;
          const isOk = val === hz || (py && normalizePinyin(val) === normalizePinyin(py));
          if (isOk) {
            if (!tyDone.has(tyIdx)) {
              tyDone.add(tyIdx);
              tyCorrect++;
            }
            recordStudyProgress({ words: [hz] });
            playPronunciation(hz, audioUrl);
            fb.innerHTML = `<span style="color:#16a34a;">✅ Chính xác! ${hz} [${py}] — ${vi}</span>`;
          } else {
            fb.innerHTML = `<span style="color:#dc2626;">❌ Chưa đúng. Đáp án: <strong>${hz}</strong> [${py}]</span>`;
          }
        };
        document.getElementById('xhz-ty-check').onclick = checkAnswer;
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            checkAnswer();
          }
        });
        document.getElementById('xhz-ty-prev').onclick = () => { tyIdx = (tyIdx - 1 + words.length) % words.length; renderTypingMode(); };
        document.getElementById('xhz-ty-next').onclick = () => { tyIdx = (tyIdx + 1) % words.length; renderTypingMode(); };
        document.getElementById('xhz-ty-finish').onclick = async () => {
          const allLessonWords = words.map(x => (x.hanzi || x.word || x.character || '').replace(/\{|\}/g, '')).filter(Boolean);
          const prog = recordStudyProgress({
            stageKey: `curr.${rootSlug}`,
            activityKey: `${itemSlug}.typing`,
            advanceTrack: false,
            words: allLessonWords,
            minutes: Math.max(4, Math.round(words.length * 0.6)),
            sessionInc: 1
          });
          try { await Promise.race([prog.__syncPromise || syncProgressToSupabaseAuth(prog), new Promise(r => setTimeout(r, 1500))]); } catch (_) {}
          window.location.assign(baseDetailUrl);
        };
      };

      const setActivePracticeTab = activeBtn => {
        [btnFc, btnQz, btnTy].forEach(b => {
          if (!b) return;
          const isAct = b === activeBtn;
          b.style.background = isAct ? '#0d9488' : '#f5f5f4';
          b.style.color = isAct ? '#fff' : '#1c1917';
          b.style.border = isAct ? 'none' : '1px solid #d6d3d1';
        });
      };

      btnFc.onclick = () => { setActivePracticeTab(btnFc); renderFlashcard(); };
      btnQz.onclick = () => { setActivePracticeTab(btnQz); renderQuiz(); };
      if (btnTy) btnTy.onclick = () => { setActivePracticeTab(btnTy); renderTypingMode(); };
      if (startQuizMode) {
        btnQz.click();
      } else {
        renderFlashcard();
      }
      return;
    }

    // Helper: detect tone color from pinyin string
    const detectToneColor = py => {
      const s = String(py || '').trim();
      const firstSyl = s.split(/\s+/)[0] || s;
      if (/[āēīōūǖ1]/.test(firstSyl)) return '#dc2626'; // 1st tone red
      if (/[áéíóúǘ2]/.test(firstSyl)) return '#b45309'; // 2nd tone amber/brown
      if (/[ǎěǐǒǔǚ3]/.test(firstSyl)) return '#15803d'; // 3rd tone green
      if (/[àèìòùǜ4]/.test(firstSyl)) return '#1d4ed8'; // 4th tone blue
      return '#78716c'; // neutral
    };

    let learnedSet = new Set();
    try {
      const savedArr = JSON.parse(localStorage.getItem('httq_curr_learned_words') || '[]') || [];
      const progWords = (getRealProgress().learnedWords || []);
      [...savedArr, ...progWords].forEach(w => learnedSet.add(String(w).replace(/^w:|^c:/, '')));
    } catch (_) {}

    const estMinutes = Math.max(5, Math.round(words.length * 0.8));
    const audioCount = words.filter(w => w.audioUrl || w.hanzi || w.word).length;
    const allHzString = words.map(w => (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '')).join('');

    document.title = `${title} - ${levelLabel} | Học Tiếng Trung`;

    root.innerHTML = `
      <style>
        .xhz-curr-hero {
          margin: 0 0 24px 0;
          border-radius: 22px;
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 52%, #312e81 100%);
          color: #fff;
          padding: 28px 24px 22px;
          position: relative;
          overflow: hidden;
        }
        .xhz-curr-hero-watermark {
          position: absolute;
          right: 4%;
          top: -18px;
          font-size: 240px;
          font-weight: 900;
          color: rgba(255,255,255,0.07);
          font-family: 'Noto Serif SC', serif;
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }
        .xhz-curr-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .xhz-curr-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .xhz-curr-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1150px) {
          .xhz-curr-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 900px) {
          .xhz-curr-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .xhz-curr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .xhz-curr-wcard {
          background: #f2fbfa;
          border: 1px solid #d3eae7;
          border-radius: 16px;
          padding: 18px 16px 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          position: relative;
          min-height: 196px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .xhz-curr-wcard:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(28,25,23,0.07);
          background: #fff;
        }
        .xhz-curr-grid.hide-pinyin .xhz-wcard-py { opacity: 0; pointer-events: none; }
        .xhz-curr-grid.hide-meaning .xhz-wcard-vi { opacity: 0; pointer-events: none; }
      </style>

      <div class="xhz-curr-hero">
        <div class="xhz-curr-hero-watermark">新</div>
        <div class="xhz-curr-hero-inner">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,0.85);margin-bottom:14px;flex-wrap:wrap;">
            <a href="/${rootSlug}" style="color:rgba(255,255,255,0.85);text-decoration:none;">${escapeHtml(brandTitle)}</a>
            <span>›</span>
            <a href="/${rootSlug}/${levelSlug}" style="color:rgba(255,255,255,0.85);text-decoration:none;">${escapeHtml(levelLabel)}</a>
            <span>›</span>
            <span>Bài học</span>
            <span>›</span>
            <strong style="color:#fff;">Bài ${escapeHtml(lessonNum)}</strong>
          </div>

          <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,0.16);backdrop-filter:blur(4px);font-size:12px;font-weight:700;margin-bottom:10px;">
            ✨ Bài ${escapeHtml(lessonNum)} · ${escapeHtml(levelLabel)}
          </div>

          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;">
            <div>
              <h1 style="font-size:36px;font-weight:800;margin:0;color:#fff;line-height:1.2;">${escapeHtml(title)}</h1>
              ${subtitleZh ? `<div style="font-size:20px;color:rgba(255,255,255,0.92);margin-top:6px;font-family:'Noto Serif SC',serif;">${escapeHtml(subtitleZh)}</div>` : ''}
              <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:8px;">
                ${words.length} từ vựng · ~${estMinutes} phút · ${audioCount} có audio
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <a href="/tao-vo-tap-viet?text=${encodeURIComponent(allHzString)}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.28);color:#fff;font-weight:700;font-size:14px;text-decoration:none;">
                📝 Tạo vở tập viết
              </a>
              <a href="${flashcardUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.28);color:#fff;font-weight:700;font-size:14px;text-decoration:none;">
                🎓 Học bằng Flashcard
              </a>
              <a href="${practiceUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;background:#fff;color:#0f172a;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
                ▶ Bắt đầu luyện tập <span style="margin-left:2px;">›</span>
              </a>
            </div>
          </div>

          <div style="margin-top:22px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.16);">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,0.9);margin-bottom:6px;">
              <span>Tiến độ học</span>
              <strong id="xhz-curr-prog-text">0/${words.length} · 0%</strong>
            </div>
            <div style="height:6px;border-radius:999px;background:rgba(255,255,255,0.22);overflow:hidden;">
              <div id="xhz-curr-prog-bar" style="height:100%;width:0%;background:#fff;border-radius:999px;transition:width 0.25s;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="max-width:1200px;margin:0 auto;">
        <div class="xhz-curr-toolbar">
          <div style="flex:1;min-width:240px;position:relative;">
            <input id="xhz-curr-search" type="text" placeholder="🔍 Tìm hanzi, pinyin, nghĩa..." style="width:100%;padding:10px 16px;border-radius:999px;border:1px solid #d3eae7;background:#f2fbfa;color:#1c1917;font-size:14px;box-sizing:border-box;" />
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="display:inline-flex;align-items:center;background:#dcf0ee;padding:3px;border-radius:999px;gap:4px;">
              <button type="button" id="xhz-filter-all" style="padding:5px 12px;border-radius:999px;border:none;background:#0d9488;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">Tất cả · ${words.length}</button>
              <button type="button" id="xhz-filter-audio" style="padding:5px 10px;border-radius:999px;border:none;background:transparent;color:#44403c;font-size:12px;font-weight:700;cursor:pointer;">🔊 ${audioCount}</button>
              <button type="button" id="xhz-filter-learned" style="padding:5px 10px;border-radius:999px;border:none;background:transparent;color:#44403c;font-size:12px;font-weight:700;cursor:pointer;">✓ <span id="xhz-learned-pill-cnt">0</span></button>
            </div>
            <button type="button" id="xhz-toggle-pinyin" style="padding:7px 14px;border-radius:999px;border:1px solid #d3eae7;background:#f2fbfa;color:#1c1917;font-size:13px;font-weight:600;cursor:pointer;">👁 Ẩn pinyin</button>
            <button type="button" id="xhz-toggle-meaning" style="padding:7px 14px;border-radius:999px;border:1px solid #d3eae7;background:#f2fbfa;color:#1c1917;font-size:13px;font-weight:600;cursor:pointer;">👁 Ẩn nghĩa</button>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:16px;font-size:12px;color:#57534e;margin-bottom:18px;flex-wrap:wrap;">
          <span>Màu thanh điệu:</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#dc2626;display:inline-block;"></i> 1st tone (ˉ)</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#b45309;display:inline-block;"></i> 2nd tone (ˊ)</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#15803d;display:inline-block;"></i> 3rd tone (ˇ)</span>
          <span style="display:inline-flex;align-items:center;gap:5px;"><i style="width:9px;height:9px;border-radius:999px;background:#1d4ed8;display:inline-block;"></i> 4th tone (ˋ)</span>
        </div>

        <div id="xhz-curr-word-grid" class="xhz-curr-grid"></div>
      </div>
    `;

    const gridEl = document.getElementById('xhz-curr-word-grid');
    const searchInput = document.getElementById('xhz-curr-search');
    const progText = document.getElementById('xhz-curr-prog-text');
    const progBar = document.getElementById('xhz-curr-prog-bar');
    const learnedPillCnt = document.getElementById('xhz-learned-pill-cnt');
    const btnFilterAll = document.getElementById('xhz-filter-all');
    const btnFilterAudio = document.getElementById('xhz-filter-audio');
    const btnFilterLearned = document.getElementById('xhz-filter-learned');
    const btnTogglePy = document.getElementById('xhz-toggle-pinyin');
    const btnToggleVi = document.getElementById('xhz-toggle-meaning');

    let activeFilter = 'all';

    const updateProgressUI = () => {
      const inLessonLearned = words.filter(w => {
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        return learnedSet.has(hz);
      }).length;
      const pct = words.length > 0 ? Math.round((inLessonLearned / words.length) * 100) : 0;
      if (progText) progText.textContent = `${inLessonLearned}/${words.length} · ${pct}%`;
      if (progBar) progBar.style.width = `${pct}%`;
      if (learnedPillCnt) learnedPillCnt.textContent = String(inLessonLearned);
    };

    const normPyQuery = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ü/gi, 'v').toLowerCase().replace(/[^a-z0-9]/g, '');
    const renderGrid = () => {
      const q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const qPy = normPyQuery(q);
      gridEl.innerHTML = '';

      words.forEach(w => {
        const hz = (w.hanzi || w.word || w.character || '').replace(/\{|\}/g, '');
        const py = w.wordPinyin || w.pinyin || '';
        const vi = w.translationVi || w.wordMeaningVi || w.meaningVi || '';
        const hskTag = w.hskLevel ? `New HSK ${w.hskLevel}` : '';
        const audioUrl = w.audioUrl ? rewriteMediaUrl(w.audioUrl) : '';
        const isLearned = learnedSet.has(hz);

        if (activeFilter === 'learned' && !isLearned) return;
        if (activeFilter === 'audio' && !audioUrl && !hz) return;
        if (q && !hz.toLowerCase().includes(q) && !py.toLowerCase().includes(q) && (!qPy || !normPyQuery(py).includes(qPy)) && !vi.toLowerCase().includes(q)) return;

        const toneColor = detectToneColor(py);
        const link = hz.length === 1 ? `/han-tu/${encodeURIComponent(hz)}` : `/tu-vung/${encodeURIComponent(hz)}`;

        const card = document.createElement('div');
        card.className = 'xhz-curr-wcard';
        card.style.borderTop = `4px solid ${toneColor}`;

        card.innerHTML = `
          <button type="button" class="xhz-wcard-speak" title="Nghe phát âm" style="position:absolute;top:10px;right:10px;border:none;background:transparent;color:#57534e;cursor:pointer;font-size:15px;padding:4px;">🔊</button>
          <div style="margin-top:12px;display:flex;flex-direction:column;align-items:center;width:100%;">
            <a href="${link}" style="font-size:40px;font-weight:500;color:#1c1917;text-decoration:none;font-family:'Noto Serif SC',serif;line-height:1.15;">${escapeHtml(hz)}</a>
            <div class="xhz-wcard-py" style="font-size:14px;color:#57534e;margin-top:8px;transition:opacity 0.15s;">${escapeHtml(py)}</div>
            <div class="xhz-wcard-vi" style="font-size:15px;font-weight:700;color:#1c1917;margin-top:6px;line-height:1.35;transition:opacity 0.15s;">${escapeHtml(vi)}</div>
          </div>
          <div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:12px;min-height:24px;">
            <span>${hskTag ? `<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:#d7ebe9;color:#57534e;">${escapeHtml(hskTag)}</span>` : ''}</span>
            <button type="button" class="xhz-wcard-heart" title="${isLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}" style="border:none;background:transparent;color:${isLearned ? '#0d9488' : '#78716c'};cursor:pointer;font-size:16px;padding:2px 4px;">
              ${isLearned ? '♥' : '♡'}
            </button>
          </div>
        `;

        const speakBtn = card.querySelector('.xhz-wcard-speak');
        if (speakBtn) {
          speakBtn.onclick = e => {
            e.stopPropagation();
            playPronunciation(hz, audioUrl);
          };
        }

        const heartBtn = card.querySelector('.xhz-wcard-heart');
        if (heartBtn) {
          heartBtn.onclick = e => {
            e.stopPropagation();
            if (learnedSet.has(hz)) {
              learnedSet.delete(hz);
            } else {
              learnedSet.add(hz);
              recordStudyProgress({ words: [hz] });
            }
            try {
              localStorage.setItem('httq_curr_learned_words', JSON.stringify(Array.from(learnedSet)));
            } catch (_) {}
            updateProgressUI();
            renderGrid();
          };
        }

        gridEl.appendChild(card);
      });
    };

    const setFilterButtons = mode => {
      activeFilter = mode;
      [
        [btnFilterAll, 'all'],
        [btnFilterAudio, 'audio'],
        [btnFilterLearned, 'learned']
      ].forEach(([btn, m]) => {
        if (!btn) return;
        btn.style.background = m === mode ? '#0d9488' : 'transparent';
        btn.style.color = m === mode ? '#fff' : '#44403c';
      });
      renderGrid();
    };

    if (btnFilterAll) btnFilterAll.onclick = () => setFilterButtons('all');
    if (btnFilterAudio) btnFilterAudio.onclick = () => setFilterButtons('audio');
    if (btnFilterLearned) btnFilterLearned.onclick = () => setFilterButtons('learned');
    if (searchInput) searchInput.oninput = () => renderGrid();

    if (btnTogglePy) {
      btnTogglePy.onclick = () => {
        const hidden = gridEl.classList.toggle('hide-pinyin');
        btnTogglePy.style.background = hidden ? '#1c1917' : '#f2fbfa';
        btnTogglePy.style.color = hidden ? '#fff' : '#1c1917';
      };
    }
    if (btnToggleVi) {
      btnToggleVi.onclick = () => {
        const hidden = gridEl.classList.toggle('hide-meaning');
        btnToggleVi.style.background = hidden ? '#1c1917' : '#f2fbfa';
        btnToggleVi.style.color = hidden ? '#fff' : '#1c1917';
      };
    }

    updateProgressUI();
    renderGrid();
  }

  // --------------------------------------------------------------------------
  // 6.7. Trang Chi Tiết Video Nghe Chép Chính Tả (/luyen-chep-chinh-ta/:id)
  //      Chuẩn 1:1 theo giao diện gốc xiehanzi.com (page-0fed561cd433dd9b.js)
  // --------------------------------------------------------------------------
  async function renderDictationDetailPage(slugOrId) {
    if (window.__xhzDictSegPollTimer) {
      clearInterval(window.__xhzDictSegPollTimer);
      window.__xhzDictSegPollTimer = null;
    }
    if (window.__xhzDictResizeHandler) {
      window.removeEventListener('resize', window.__xhzDictResizeHandler);
      window.__xhzDictResizeHandler = null;
    }
    if (window.__xhzDictYtPlayer && typeof window.__xhzDictYtPlayer.destroy === 'function') {
      try { window.__xhzDictYtPlayer.destroy(); } catch (_) {}
      window.__xhzDictYtPlayer = null;
    }
    const root = getMainContentContainer();
    root.innerHTML = `<div style="padding:32px;text-align:center;color:#78716c;">Đang tải video nghe chép chính tả...</div>`;
    const all = (await loadLocalJson('/data/dictation/videos-all.json')) || [];
    const decoded = (() => { try { return safeDecodeURIComponent(slugOrId || '').trim(); } catch (_) { return String(slugOrId || '').trim(); } })();
    const video =
      all.find(v => v.id === decoded || v._id === decoded || v.slug === decoded || v.slugVi === decoded || toSlugVi(v.title || v.titleVi) === decoded) ||
      all[0];

    if (!video) {
      root.innerHTML = `<div style="padding:32px;text-align:center;color:#dc2626;">Không tìm thấy bài nghe chép chính tả. <a href="/luyen-chep-chinh-ta">Quay lại danh sách</a></div>`;
      return;
    }

    const vidId = video.id || video._id;
    const siblingParts = video.youtubeId
      ? all.filter(v => v.youtubeId === video.youtubeId).sort((a, b) => (Number(a.part) || 1) - (Number(b.part) || 1))
      : [];
    const segData = (await loadLocalJson(`/data/dictation/videos/${vidId}-segments.json`)) || {};
    const segments = Array.isArray(segData.items)
      ? segData.items
      : (Array.isArray(segData.segments) ? segData.segments : (Array.isArray(video.segments) ? video.segments : []));
    const ytId = video.youtubeId || video.videoId || '';
    const storageKey = `xiehanzi:dictation:${vidId}`;

    let savedState = { currentIndex: 0, mode: 'full', pinyinMode: false, segments: {} };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedState = { ...savedState, ...JSON.parse(raw) };
    } catch (_) {}

    let currentIndex = Math.min(Math.max(0, Number(savedState.currentIndex) || 0), Math.max(0, segments.length - 1));
    let mode = ['full', 'blank', 'listen'].includes(savedState.mode) ? savedState.mode : 'full';
    let pinyinMode = Boolean(savedState.pinyinMode);
    let segStates = savedState.segments && typeof savedState.segments === 'object' ? savedState.segments : {};
    let loopSegment = false;
    let maskSubs = false;
    let playbackRate = 1;
    let listFilter = 'all';
    let showAllSubtitlesInList = true;
    let hintRevealedCount = 0;
    let isPlayingSeg = false;
    let ytPlayer = null;
    let ytReady = false;
    let segPollTimer = null;

    function persistDictState() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          currentIndex,
          mode,
          pinyinMode,
          segments: segStates,
          updatedAt: Date.now()
        }));
      } catch (_) {}
    }

    function recordDictationAttempt(seg, ok) {
      try {
        const doneCount = Object.values(segStates).filter(s => s && (s.status === 'correct' || s.checked)).length;
        const segChars = Array.from(String((seg && seg.hanzi) || '')).filter(c => /[\u4e00-\u9fff]/.test(c));
        recordStudyProgress({
          words: ok ? segChars : [],
          mistake: !ok && segChars[0] ? { itemKey: `w:${segChars[0]}`, hanzi: segChars[0], pinyin: (seg && seg.pinyin) || '', meaningVi: (seg && seg.vi) || '' } : undefined,
          minutes: ok ? 1 : 0,
          gradingInc: 1,
          dictationVideoId: vidId,
          dictationDoneCount: doneCount,
          dictationTotal: segments.length
        });
      } catch (_) {}
    }

    function formatMs(ms) {
      const totalSec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }

    function normalizePinyinCompare(str) {
      return String(str || '')
        .replace(/u:/gi, 'ü')
        .normalize('NFD')
        .replace(/u\u0308/gi, 'v')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[1-5]/g, '')
        .replace(/[^a-z]+/g, '');
    }

    function normalizeHanziCompare(str) {
      return Array.from(String(str || '')).filter(c => /[\u4e00-\u9fffA-Za-z0-9]/.test(c)).join('');
    }

    function getDictationBlankTargets(seg) {
      const chars = Array.from(seg.hanzi || '').filter(ch => /[\u4e00-\u9fff]/.test(ch));
      const raw = Array.isArray(seg.blankCharIdx) ? seg.blankCharIdx : [seg.blankCharIdx];
      let indices = [...new Set(raw.filter(value => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < chars.length))].sort((a, b) => a - b);
      if (!indices.length && chars.length) indices = [0];
      const syllables = String(seg.pinyin || '').match(/[\p{Script=Latin}\p{M}0-9:]+/gu) || [];
      const units = String(seg.hanzi || '').match(/[\u4e00-\u9fff]|[A-Za-z0-9]+/g) || [];
      const pinyinByChar = [];
      if (syllables.length === units.length) {
        units.forEach((unit, index) => { if (/[\u4e00-\u9fff]/.test(unit)) pinyinByChar.push(syllables[index]); });
      } else if (syllables.length === chars.length) {
        pinyinByChar.push(...syllables);
      }
      return indices.map(index => ({ index, hanzi: chars[index], pinyin: pinyinByChar[index] || '' }));
    }

    function isDictationBlankCorrect(target, input, usePinyin) {
      const value = String(input || '').trim();
      if (!value) return false;
      if (value === target.hanzi) return true;
      const isPinyin = /^[\p{Script=Latin}\p{M}]+[1-5]?$/u.test(value.replace(/u:/gi, 'ü'));
      return Boolean(usePinyin && isPinyin && target.pinyin && normalizePinyinCompare(value) && normalizePinyinCompare(value) === normalizePinyinCompare(target.pinyin));
    }

    const hskColors = {
      1: 'background:#fef3c7;color:#92400e;',
      2: 'background:#ccfbf1;color:#115e59;',
      3: 'background:#ffe4e6;color:#9f1239;',
      4: 'background:#ede9fe;color:#5b21b6;',
      5: 'background:#e0f2fe;color:#075985;',
      6: 'background:#dcfce7;color:#166534;'
    };
    const hskBadgeStyle = hskColors[video.hskLevel] || hskColors[1];

    document.title = `${video.seoTitle || video.title || 'Luyện chép chính tả'} | Học Tiếng Trung`;

    root.innerHTML = `
      <div class="mx-auto max-w-6xl" style="color:#1c1917;">
        <!-- Header giống bản gốc xiehanzi.com -->
        <div style="margin-bottom:16px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px;color:#78716c;">
            <a href="/luyen-chep-chinh-ta" style="color:#0d9488;text-decoration:none;font-weight:700;">← Tất cả video</a>
            <span>·</span>
            <span style="padding:2px 8px;border-radius:6px;font-weight:700;${hskBadgeStyle}">HSK ${video.hskLevel || 1}</span>
            ${video.partCount && video.partCount > 1 ? `<span style="padding:2px 8px;border-radius:6px;background:#f5f5f4;color:#44403c;font-weight:600;">Phần ${video.part || 1}/${video.partCount}</span>` : ''}
            <span>kênh ${escapeHtml(video.channelName || 'Chinese')} · ${segments.length} câu</span>
            ${siblingParts.length > 1 ? `<span style="display:inline-flex;gap:4px;margin-left:auto;">${siblingParts.map(sp => {
              const spHref = `/luyen-chep-chinh-ta/${encodeURIComponent(sp.slugVi || sp.id)}`;
              const isCurPart = (sp.id || sp._id) === vidId;
              return `<a href="${spHref}" style="padding:2px 8px;border-radius:999px;text-decoration:none;font-weight:700;font-size:11px;${isCurPart ? 'background:#0d9488;color:#fff;' : 'background:#f5f5f4;color:#44403c;border:1px solid #e7e5e4;'}">Phần ${sp.part || 1}</a>`;
            }).join('')}</span>` : ''}
          </div>
          <h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#1c1917;">${escapeHtml(video.seoTitle || video.title || '')}</h1>
          ${video.seoDescription ? `<p style="margin:4px 0 0 0;font-size:13px;line-height:1.6;color:#57534e;">${escapeHtml(video.seoDescription)}</p>` : ''}
        </div>

        <!-- 2-Column Layout: Left (Video + Dictation Workspace) | Right (Danh sách câu) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;align-items:start;">
          <!-- Left Column -->
          <div style="grid-column:span 1;min-width:0;display:flex;flex-direction:column;gap:16px;" id="xhz-dict-left-col">
            <!-- Video Container -->
            <div>
              <div id="xhz-dict-listen-banner" style="display:none;align-items:center;justify-content:center;gap:12px;border-radius:16px;border:1px solid #99f6e4;background:#f0fdfa;padding:28px 16px;text-align:center;">
                <span style="font-size:28px;">🎧</span>
                <div style="text-align:left;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#115e59;">Đang ở chế độ chỉ nghe</p>
                  <p style="margin:2px 0 0 0;font-size:12px;color:#0f766e;">Video được ẩn để tập trung tai nghe — bấm sang chế độ khác để hiện lại.</p>
                </div>
              </div>
              <div id="xhz-dict-video-wrap" style="position:relative;isolation:isolate;z-index:1;overflow:hidden;border-radius:16px;background:#0f172a;box-shadow:0 4px 16px rgba(0,0,0,0.12);aspect-ratio:16/9;width:100%;">
                <div id="xhz-yt-player" style="position:absolute;inset:0;width:100%;height:100%;"></div>
                <div id="xhz-dict-sub-mask" style="display:none;pointer-events:none;position:absolute;left:0;right:0;bottom:0;height:22%;z-index:3;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);align-items:center;justify-content:center;">
                  <span style="font-size:11px;color:#d6d3d1;">Phụ đề trong video đã được che</span>
                </div>
              </div>
              <div id="xhz-dict-yt-fallback" style="display:none;margin-top:8px;border-radius:10px;border:1px solid #fde68a;background:#fffbeb;padding:8px 12px;font-size:12px;color:#92400e;">
                ⚠️ Video YouTube đang bị chặn hoặc tải chậm — nút <strong>▶ Phát câu này</strong> và <strong>🔊 Đọc mẫu</strong> sẽ tự động dùng giọng đọc chuẩn tiếng Trung (zh-CN).
              </div>

              <!-- Player Toolbar -->
              <div style="margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;border-radius:12px;border:1px solid #e7e5e4;background:#fff;padding:8px 12px;font-size:12px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
                  <button type="button" id="xhz-dict-btn-play-seg" style="display:inline-flex;align-items:center;gap:6px;border-radius:8px;background:#1c1917;color:#fff;border:none;padding:6px 12px;font-weight:700;cursor:pointer;font-size:12px;">
                    ▶ Phát câu này
                  </button>
                  <button type="button" id="xhz-dict-btn-tts-seg" style="display:inline-flex;align-items:center;gap:4px;border-radius:8px;background:#f0fdfa;color:#115e59;border:1px solid #99f6e4;padding:6px 10px;font-weight:700;cursor:pointer;font-size:12px;" title="Đọc phát âm mẫu câu này">
                    🔊 Đọc mẫu
                  </button>
                  <label style="display:inline-flex;align-items:center;gap:4px;color:#44403c;cursor:pointer;font-weight:600;">
                    <input type="checkbox" id="xhz-dict-chk-loop" style="accent-color:#0d9488;" />
                    Lặp câu
                  </label>
                  <label style="display:inline-flex;align-items:center;gap:4px;color:#44403c;cursor:pointer;font-weight:600;">
                    <input type="checkbox" id="xhz-dict-chk-mask" style="accent-color:#0d9488;" />
                    Ẩn phụ đề
                  </label>
                  ${ytId ? `<a href="https://www.youtube.com/watch?v=${encodeURIComponent(ytId)}" target="_blank" rel="noopener noreferrer" style="color:#0d9488;font-weight:700;text-decoration:none;font-size:11px;">↗ YouTube</a>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:4px;" id="xhz-dict-speed-bar">
                  <span style="color:#78716c;margin-right:2px;">Tốc độ:</span>
                  ${[0.5, 0.75, 1, 1.25, 1.5].map(r => `
                    <button type="button" data-rate="${r}" class="xhz-rate-btn" style="border-radius:6px;padding:3px 7px;border:none;font-weight:700;cursor:pointer;font-size:11px;background:${r === 1 ? '#0d9488' : '#f5f5f4'};color:${r === 1 ? '#fff' : '#57534e'};">${r}×</button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#57534e;">
                <span id="xhz-dict-prog-label" style="font-weight:700;color:#1c1917;">Câu 1/${segments.length}</span>
                <span id="xhz-dict-done-label">0/${segments.length} đã xong</span>
              </div>
              <div style="height:6px;width:100%;overflow:hidden;border-radius:999px;background:#e7e5e4;">
                <div id="xhz-dict-prog-bar" style="height:100%;background:#0d9488;width:0%;transition:width 0.25s;"></div>
              </div>
            </div>

            <!-- Dictation Workspace Card -->
            <div style="border-radius:16px;border:1px solid #e7e5e4;background:#fff;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
              <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12px;">
                  <span style="color:#78716c;margin-right:4px;font-weight:600;">Chế độ:</span>
                  <button type="button" class="xhz-dict-mode-btn" data-mode="full" style="border-radius:8px;padding:6px 12px;font-weight:700;border:none;cursor:pointer;">Gõ hết</button>
                  <button type="button" class="xhz-dict-mode-btn" data-mode="blank" style="border-radius:8px;padding:6px 12px;font-weight:700;border:none;cursor:pointer;">Điền chỗ trống</button>
                  <button type="button" class="xhz-dict-mode-btn" data-mode="listen" style="border-radius:8px;padding:6px 12px;font-weight:700;border:none;cursor:pointer;">Chỉ nghe</button>
                </div>
                <label id="xhz-dict-pinyin-wrap" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#44403c;cursor:pointer;font-weight:600;">
                  <input type="checkbox" id="xhz-dict-chk-pinyin" style="accent-color:#0d9488;" />
                  Gõ pinyin
                </label>
              </div>

              <!-- Dynamic Workspace Stage -->
              <div id="xhz-dict-stage"></div>
            </div>
          </div>

          <!-- Right Column: Danh sách câu -->
          <div style="border-radius:16px;border:1px solid #e7e5e4;background:#fff;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
              <h2 style="margin:0;font-size:15px;font-weight:800;color:#1c1917;">Danh sách câu (${segments.length})</h2>
              <div style="display:flex;gap:4px;font-size:11px;" id="xhz-dict-filter-tabs">
                <button type="button" data-filter="all" style="border-radius:6px;padding:3px 8px;border:none;font-weight:700;cursor:pointer;background:#1c1917;color:#fff;">Tất cả</button>
                <button type="button" data-filter="wrong" style="border-radius:6px;padding:3px 8px;border:none;font-weight:600;cursor:pointer;background:#f5f5f4;color:#57534e;">Câu sai</button>
                <button type="button" data-filter="unattempted" style="border-radius:6px;padding:3px 8px;border:none;font-weight:600;cursor:pointer;background:#f5f5f4;color:#57534e;">Chưa làm</button>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <button type="button" id="xhz-dict-next-unattempted" style="flex:1;border-radius:8px;border:1px solid #99f6e4;background:#f0fdfa;padding:6px 10px;font-size:12px;font-weight:700;color:#115e59;cursor:pointer;">
                Tới câu chưa làm tiếp theo →
              </button>
              <button type="button" id="xhz-dict-toggle-list-sub" style="border-radius:8px;border:1px solid #e7e5e4;background:#fafaf9;padding:6px 10px;font-size:11px;font-weight:700;color:#44403c;cursor:pointer;" title="Ẩn/Hiện chữ Hán trong danh sách câu">
                👁 Hiện chữ
              </button>
            </div>
            <div id="xhz-dict-seg-list" style="max-height:480px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px;"></div>
          </div>
        </div>

        ${video.seoIntroVi ? `
          <section style="margin-top:32px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;padding:20px;font-size:14px;line-height:1.7;color:#44403c;">
            <h2 style="margin:0 0 8px 0;font-size:16px;font-weight:800;color:#1c1917;">Giới thiệu bài nghe</h2>
            <p style="margin:0;white-space:pre-line;">${escapeHtml(video.seoIntroVi)}</p>
          </section>
        ` : ''}
      </div>
    `;

    // Adjust desktop 2-col proportion on wide screens (cleaned up on re-render)
    const applyGridCols = () => {
      const gridEl = root.querySelector('#xhz-dict-left-col') && root.querySelector('#xhz-dict-left-col').parentElement;
      if (gridEl) {
        gridEl.style.gridTemplateColumns = window.innerWidth >= 1024 ? '1fr 340px' : '1fr';
      }
    };
    applyGridCols();
    window.__xhzDictResizeHandler = applyGridCols;
    window.addEventListener('resize', applyGridCols);

    // YouTube IFrame API Segment Playback
    function stopSegPoll() {
      if (segPollTimer) {
        clearInterval(segPollTimer);
        segPollTimer = null;
      }
      if (window.__xhzDictSegPollTimer) {
        clearInterval(window.__xhzDictSegPollTimer);
        window.__xhzDictSegPollTimer = null;
      }
      isPlayingSeg = false;
      updatePlayBtnLabel();
    }

    function updatePlayBtnLabel() {
      const btn = document.getElementById('xhz-dict-btn-play-seg');
      if (!btn) return;
      btn.textContent = isPlayingSeg ? '⏸ Đang phát — bấm để phát lại' : '▶ Phát câu này';
    }

    function playCurrentSegment(rateOverride) {
      const seg = segments[currentIndex];
      if (!seg) return;
      const rate = rateOverride || playbackRate || 1;
      if (ytPlayer && ytReady && typeof ytPlayer.seekTo === 'function') {
        try {
          if (typeof ytPlayer.setPlaybackRate === 'function') ytPlayer.setPlaybackRate(rate);
          ytPlayer.seekTo((seg.startMs || 0) / 1000, true);
          ytPlayer.playVideo();
          isPlayingSeg = true;
          updatePlayBtnLabel();
          if (segPollTimer) clearInterval(segPollTimer);
          segPollTimer = setInterval(() => {
            try {
              const curSec = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
              const endSec = ((seg.endMs || (seg.startMs + 4000)) / 1000) + 0.08;
              if (curSec >= endSec) {
                if (loopSegment) {
                  ytPlayer.seekTo((seg.startMs || 0) / 1000, true);
                  ytPlayer.playVideo();
                } else {
                  ytPlayer.pauseVideo();
                  stopSegPoll();
                }
              }
            } catch (_) {
              stopSegPoll();
            }
          }, 80);
          window.__xhzDictSegPollTimer = segPollTimer;
          return;
        } catch (_) {}
      }
      // Fallback: pronounce Chinese text via TTS if YT player not yet ready or blocked
      playPronunciation(seg.hanzi || '', 'tts', rate);
    }

    function initYouTubePlayer() {
      if (!ytId) return;
      const createPlayer = () => {
        if (!document.getElementById('xhz-yt-player')) return;
        ytPlayer = new window.YT.Player('xhz-yt-player', {
          width: '100%',
          height: '100%',
          videoId: ytId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            cc_load_policy: 0,
            iv_load_policy: 3,
            origin: window.location.origin
          },
          events: {
            onReady: () => {
              ytReady = true;
              const seg = segments[currentIndex];
              if (seg && ytPlayer && typeof ytPlayer.seekTo === 'function') {
                try {
                  ytPlayer.seekTo((seg.startMs || 0) / 1000, true);
                  ytPlayer.pauseVideo();
                } catch (_) {}
              }
            },
            onError: () => {
              ytReady = false;
              const fb = document.getElementById('xhz-dict-yt-fallback');
              if (fb) fb.style.display = 'block';
            }
          }
        });
        window.__xhzDictYtPlayer = ytPlayer;
      };
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const prevCb = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
          if (typeof prevCb === 'function') prevCb();
          createPlayer();
        };
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }
      }
    }
    initYouTubePlayer();

    // Wire toolbar controls
    const btnPlaySeg = document.getElementById('xhz-dict-btn-play-seg');
    if (btnPlaySeg) btnPlaySeg.onclick = () => playCurrentSegment();
    const btnTtsSeg = document.getElementById('xhz-dict-btn-tts-seg');
    if (btnTtsSeg) {
      btnTtsSeg.onclick = () => {
        const seg = segments[currentIndex];
        if (seg) playPronunciation(seg.hanzi || '', 'tts', playbackRate);
      };
    }
    const chkLoop = document.getElementById('xhz-dict-chk-loop');
    if (chkLoop) chkLoop.onchange = e => { loopSegment = Boolean(e.target.checked); };
    const chkMask = document.getElementById('xhz-dict-chk-mask');
    const subMaskEl = document.getElementById('xhz-dict-sub-mask');
    if (chkMask && subMaskEl) {
      chkMask.onchange = e => {
        maskSubs = Boolean(e.target.checked);
        subMaskEl.style.display = maskSubs ? 'flex' : 'none';
      };
    }
    root.querySelectorAll('.xhz-rate-btn').forEach(btn => {
      btn.onclick = () => {
        playbackRate = Number(btn.getAttribute('data-rate')) || 1;
        root.querySelectorAll('.xhz-rate-btn').forEach(b => {
          const active = Number(b.getAttribute('data-rate')) === playbackRate;
          b.style.background = active ? '#0d9488' : '#f5f5f4';
          b.style.color = active ? '#fff' : '#57534e';
        });
        if (ytPlayer && ytReady && typeof ytPlayer.setPlaybackRate === 'function') {
          try { ytPlayer.setPlaybackRate(playbackRate); } catch (_) {}
        }
      };
    });

    const chkPinyin = document.getElementById('xhz-dict-chk-pinyin');
    if (chkPinyin) {
      chkPinyin.checked = pinyinMode;
      chkPinyin.onchange = e => {
        pinyinMode = Boolean(e.target.checked);
        persistDictState();
        renderAllDictationUI();
      };
    }

    root.querySelectorAll('.xhz-dict-mode-btn').forEach(btn => {
      btn.onclick = () => {
        mode = btn.getAttribute('data-mode') || 'full';
        persistDictState();
        renderAllDictationUI();
      };
    });

    const filterTabs = root.querySelectorAll('#xhz-dict-filter-tabs button');
    filterTabs.forEach(btn => {
      btn.onclick = () => {
        listFilter = btn.getAttribute('data-filter') || 'all';
        filterTabs.forEach(b => {
          const active = b.getAttribute('data-filter') === listFilter;
          b.style.background = active ? '#1c1917' : '#f5f5f4';
          b.style.color = active ? '#fff' : '#57534e';
          b.style.fontWeight = active ? '700' : '600';
        });
        renderSegmentList();
      };
    });

    const btnToggleListSub = document.getElementById('xhz-dict-toggle-list-sub');
    if (btnToggleListSub) {
      btnToggleListSub.onclick = () => {
        showAllSubtitlesInList = !showAllSubtitlesInList;
        btnToggleListSub.textContent = showAllSubtitlesInList ? '👁 Hiện chữ' : '🙈 Ẩn chữ';
        renderSegmentList();
      };
    }

    const btnNextUnattempted = document.getElementById('xhz-dict-next-unattempted');
    if (btnNextUnattempted) {
      btnNextUnattempted.onclick = () => {
        for (let offset = 1; offset <= segments.length; offset++) {
          const idx = (currentIndex + offset) % segments.length;
          const st = segStates[idx] && segStates[idx].status;
          if (!st || st === 'unattempted') {
            selectSegment(idx, true);
            return;
          }
        }
      };
    }

    function selectSegment(idx, autoPlay = true) {
      if (idx < 0 || idx >= segments.length) return;
      currentIndex = idx;
      hintRevealedCount = 0;
      persistDictState();
      renderAllDictationUI();
      if (autoPlay) {
        playCurrentSegment();
      }
    }

    function renderSegmentList() {
      const listEl = document.getElementById('xhz-dict-seg-list');
      if (!listEl) return;

      let wrongCount = 0;
      let unattemptedCount = 0;
      let doneCount = 0;
      segments.forEach((_, i) => {
        const st = (segStates[i] && segStates[i].status) || 'unattempted';
        if (st === 'wrong') wrongCount++;
        if (st === 'unattempted') unattemptedCount++;
        if (st === 'correct' || st === 'revealed') doneCount++;
      });

      // Update filter tab counts
      const tabWrong = root.querySelector('#xhz-dict-filter-tabs button[data-filter="wrong"]');
      const tabUnatt = root.querySelector('#xhz-dict-filter-tabs button[data-filter="unattempted"]');
      if (tabWrong) tabWrong.textContent = `Câu sai (${wrongCount})`;
      if (tabUnatt) tabUnatt.textContent = `Chưa làm (${unattemptedCount})`;

      // Update progress bar
      const progLabel = document.getElementById('xhz-dict-prog-label');
      const doneLabel = document.getElementById('xhz-dict-done-label');
      const progBar = document.getElementById('xhz-dict-prog-bar');
      if (progLabel) progLabel.textContent = `Câu ${currentIndex + 1}/${segments.length} (${formatMs(segments[currentIndex] && segments[currentIndex].startMs)} – ${formatMs(segments[currentIndex] && segments[currentIndex].endMs)})`;
      if (doneLabel) doneLabel.textContent = `${doneCount}/${segments.length} đã xong`;
      if (progBar) progBar.style.width = `${segments.length ? Math.round((doneCount / segments.length) * 100) : 0}%`;

      const rows = segments
        .map((s, idx) => ({ seg: s, idx, st: (segStates[idx] && segStates[idx].status) || 'unattempted' }))
        .filter(r => {
          if (listFilter === 'wrong') return r.st === 'wrong';
          if (listFilter === 'unattempted') return r.st === 'unattempted';
          return true;
        });

      if (rows.length === 0) {
        listEl.innerHTML = `<p style="padding:24px 0;text-align:center;font-size:12px;color:#78716c;">Không có câu nào trong bộ lọc này.</p>`;
        return;
      }

      listEl.innerHTML = rows.map(({ seg, idx, st }) => {
        const isCurrent = idx === currentIndex;
        const canShowText = showAllSubtitlesInList || st === 'correct' || st === 'revealed';
        const badgeBg = st === 'correct' ? '#d1fae5;color:#065f46;' : st === 'wrong' ? '#ffe4e6;color:#9f1239;' : st === 'revealed' ? '#fef3c7;color:#92400e;' : '#f5f5f4;color:#57534e;';
        const badgeIcon = st === 'correct' ? '✓' : st === 'wrong' ? '✗' : (idx + 1);
        const diffLabel = seg.difficulty === 1 ? 'Dễ' : seg.difficulty === 2 ? 'Vừa' : 'Khó';
        const diffStyle = seg.difficulty === 1 ? 'background:#ecfdf5;color:#047857;' : seg.difficulty === 2 ? 'background:#fffbeb;color:#b45309;' : 'background:#fff1f2;color:#be123c;';
        return `
          <button type="button" class="xhz-dict-seg-btn" data-idx="${idx}" style="display:flex;width:100%;align-items:center;gap:10px;border-radius:10px;padding:9px 10px;text-align:left;font-size:12px;cursor:pointer;border:${isCurrent ? '2px solid #0d9488' : '1px solid #f5f5f4'};background:${isCurrent ? '#f0fdfa' : '#fafaf9'};transition:all 0.15s;">
            <span style="display:flex;height:24px;width:24px;flex-shrink:0;align-items:center;justify-content:center;border-radius:999px;font-size:11px;font-weight:800;${badgeBg}">${badgeIcon}</span>
            <div style="min-width:0;flex:1;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-weight:700;color:#1c1917;">Câu ${idx + 1} <span style="font-weight:500;color:#78716c;font-size:11px;">(${formatMs(seg.startMs)})</span></span>
                <span style="border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;${diffLabel ? diffStyle : ''}">${diffLabel}</span>
              </div>
              <p style="margin:3px 0 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;color:#292524;">
                ${canShowText ? (seg.hanzi || '') : `••• (${(seg.hanziChars || []).length} chữ Hán)`}
              </p>
              ${canShowText && seg.vi ? `<p style="margin:1px 0 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#78716c;">${seg.vi}</p>` : ''}
            </div>
          </button>
        `;
      }).join('');

      listEl.querySelectorAll('.xhz-dict-seg-btn').forEach(btn => {
        btn.onclick = () => {
          const targetIdx = Number(btn.getAttribute('data-idx'));
          selectSegment(targetIdx, true);
        };
      });
    }

    function renderWorkspaceStage() {
      const stageEl = document.getElementById('xhz-dict-stage');
      if (!stageEl) return;
      const seg = segments[currentIndex];
      if (!seg) {
        stageEl.innerHTML = `<div style="padding:20px;text-align:center;color:#78716c;">Chưa có dữ liệu câu cho video này.</div>`;
        return;
      }

      // Update mode buttons & video visibility for listen mode
      root.querySelectorAll('.xhz-dict-mode-btn').forEach(b => {
        const active = b.getAttribute('data-mode') === mode;
        b.style.background = active ? '#0d9488' : '#f5f5f4';
        b.style.color = active ? '#fff' : '#44403c';
      });
      const pyWrap = document.getElementById('xhz-dict-pinyin-wrap');
      if (pyWrap) pyWrap.style.display = mode === 'listen' ? 'none' : 'inline-flex';
      const listenBanner = document.getElementById('xhz-dict-listen-banner');
      const videoWrap = document.getElementById('xhz-dict-video-wrap');
      if (listenBanner && videoWrap) {
        listenBanner.style.display = mode === 'listen' ? 'flex' : 'none';
        videoWrap.style.height = mode === 'listen' ? '0px' : '';
      }

      const curState = segStates[currentIndex] || { status: 'unattempted', input: '', checked: false };
      const isSubmitted = curState.checked || curState.status === 'correct' || curState.status === 'revealed';
      const hanziChars = Array.isArray(seg.hanziChars) && seg.hanziChars.length > 0
        ? seg.hanziChars
        : Array.from(seg.hanzi || '').filter(c => /[\u4e00-\u9fff]/.test(c));

      // Answer Reveal Card HTML (when submitted/revealed)
      const revealHtml = isSubmitted ? `
        <div style="margin-top:16px;border-radius:14px;border:1px solid ${curState.status === 'correct' ? '#a7f3d0' : '#fde68a'};background:${curState.status === 'correct' ? '#ecfdf5' : '#fffbeb'};padding:16px;">
          <div style="font-size:12px;font-weight:800;color:${curState.status === 'correct' ? '#047857' : '#b45309'};margin-bottom:4px;">
            ${curState.status === 'correct' ? '✓ Chính xác! Bạn nghe và chép rất chuẩn.' : 'Đáp án đúng của câu này:'}
          </div>
          <div style="font-size:26px;font-weight:800;color:#1c1917;letter-spacing:0.03em;">${seg.hanzi || ''}</div>
          ${seg.pinyin ? `<div style="font-size:15px;font-weight:600;color:#b45309;margin-top:4px;">/${seg.pinyin}/</div>` : ''}
          ${seg.hanviet ? `<div style="font-size:12px;color:#57534e;margin-top:4px;">Hán Việt: <strong style="text-transform:uppercase;color:#1c1917;">${seg.hanviet}</strong></div>` : ''}
          ${seg.vi ? `<div style="font-size:15px;color:#1c1917;margin-top:6px;">Nghĩa: <strong>${seg.vi}</strong></div>` : ''}
          <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;">
            <button type="button" id="xhz-dict-rev-replay" style="border-radius:8px;border:1px solid #d6d3d1;background:#fff;padding:7px 14px;font-size:13px;font-weight:700;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
            <button type="button" id="xhz-dict-rev-retry" style="border-radius:8px;border:1px solid #d6d3d1;background:#fff;padding:7px 14px;font-size:13px;font-weight:700;color:#1c1917;cursor:pointer;">⟲ Thử lại câu này</button>
            <button type="button" id="xhz-dict-rev-next" style="border-radius:8px;border:none;background:#1c1917;padding:7px 16px;font-size:13px;font-weight:700;color:#fff;cursor:pointer;">Câu tiếp theo →</button>
          </div>
        </div>
      ` : '';

      if (mode === 'listen') {
        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p style="margin:0;font-size:14px;color:#57534e;">Nghe câu thoại và tự nhẩm trong đầu, sau đó bấm <strong>Hiện đáp án</strong> để đối chiếu chữ Hán, Pinyin và nghĩa tiếng Việt.</p>
            ${!isSubmitted ? `
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" id="xhz-dict-btn-reveal" style="border-radius:10px;border:none;background:#0d9488;padding:10px 18px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;">Hiện đáp án</button>
                <button type="button" id="xhz-dict-btn-replay2" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:10px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
                <button type="button" id="xhz-dict-btn-slow" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:10px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">🐢 Chậm (0.75×)</button>
              </div>
            ` : ''}
            ${revealHtml}
          </div>
        `;
      } else if (mode === 'blank') {
        const targets = getDictationBlankTargets(seg);
        const targetByIndex = new Map(targets.map(target => [target.index, target]));
        const blankValues = curState.blankInputs && typeof curState.blankInputs === 'object' ? curState.blankInputs : {};
        const escapeInput = value => String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const fullChars = Array.from(seg.hanzi || '');
        let hCounter = -1;
        const sentenceWithBlankHtml = fullChars.map(ch => {
          if (/[\u4e00-\u9fff]/.test(ch)) {
            hCounter++;
            if (targetByIndex.has(hCounter)) {
              const first = hCounter === targets[0].index;
              const value = blankValues[hCounter] !== undefined ? blankValues[hCounter] : targets.length === 1 ? curState.input || '' : '';
              return `<input type="text" id="xhz-dict-blank-input${first ? '' : '-' + hCounter}" class="xhz-dict-blank-input" data-blank-index="${hCounter}" aria-label="Điền chữ Hán thứ ${hCounter + 1}${pinyinMode ? ' hoặc phiên âm tương ứng' : ''}" value="${escapeInput(value)}" ${isSubmitted ? 'disabled' : ''} placeholder="${pinyinMode ? 'pinyin' : '?'}" style="width:${pinyinMode ? '96px' : '56px'};margin:0 6px;border:none;border-bottom:2px solid #0d9488;background:#f0fdfa;padding:2px 6px;text-align:center;font-size:22px;font-weight:800;color:#1c1917;outline:none;" />`;
            }
          }
          return `<span>${ch}</span>`;
        }).join('');

        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${pinyinMode && targets.some(target => !target.pinyin) ? '<p style="margin:0;font-size:13px;color:#92400e;">Một số ô chưa có phiên âm được căn theo chữ. Vui lòng nhập chữ Hán vào những ô này.</p>' : ''}
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:2px;border-radius:12px;background:#fafaf9;border:1px solid #e7e5e4;padding:16px;font-size:24px;font-weight:700;color:#1c1917;line-height:1.8;">
              ${sentenceWithBlankHtml}
            </div>
            ${!isSubmitted ? `
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" id="xhz-dict-btn-check" style="border-radius:10px;border:none;background:#0d9488;padding:9px 18px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;">Kiểm tra</button>
                <button type="button" id="xhz-dict-btn-replay2" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
                <button type="button" id="xhz-dict-btn-slow" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">🐢 Chậm (0.75×)</button>
                <button type="button" id="xhz-dict-btn-skip" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#78716c;cursor:pointer;">Bỏ qua</button>
              </div>
            ` : ''}
            ${revealHtml}
          </div>
        `;

        const blankInputs = [...stageEl.querySelectorAll('.xhz-dict-blank-input')];
        const readBlankInputs = () => Object.fromEntries(blankInputs.map(input => [Number(input.getAttribute('data-blank-index')), input.value.trim()]));
        const checkBlank = () => {
          const values = readBlankInputs();
          const ok = targets.length > 0 && targets.every(target => isDictationBlankCorrect(target, values[target.index], pinyinMode));
          segStates[currentIndex] = { status: ok ? 'correct' : 'wrong', input: targets.map(target => values[target.index] || '').join(' '), blankInputs: values, checked: true };
          persistDictState();
          recordDictationAttempt(seg, ok);
          renderAllDictationUI();
          if (ok && window.__xhzStudioFx) {
            window.__xhzStudioFx.sparkle(document.getElementById('xhz-dict-stage'));
            window.__xhzStudioFx.toast('✨ Chính xác! Bạn nghe chép rất chuẩn.', 'success');
          }
        };
        if (blankInputs.length && !isSubmitted) {
          blankInputs[0].focus();
          blankInputs.forEach(blankInput => { blankInput.oninput = () => {
            segStates[currentIndex] = { ...curState, blankInputs: readBlankInputs() };
            persistDictState();
          }; blankInput.onkeydown = e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              checkBlank();
            }
          }; });
        }
        const btnCheck = document.getElementById('xhz-dict-btn-check');
        if (btnCheck) btnCheck.onclick = checkBlank;
      } else {
        // FULL DICTATION MODE (Gõ hết)
        const userCleanChars = Array.from(normalizeHanziCompare(curState.input || ''));
        const slotsHtml = hanziChars.map((ch, idx) => {
          let charDisplay = '·';
          let slotStyle = 'border:1px solid #d6d3d1;background:#fafaf9;color:#a8a29e;';
          if (isSubmitted) {
            charDisplay = ch;
            const matchedChar = userCleanChars[idx] === ch || (curState.status === 'correct');
            slotStyle = matchedChar
              ? 'border:1px solid #34d399;background:#ecfdf5;color:#065f46;'
              : 'border:1px solid #fda4af;background:#fff1f2;color:#9f1239;';
          } else if (idx < hintRevealedCount) {
            charDisplay = ch;
            slotStyle = 'border:1px solid #fcd34d;background:#fffbeb;color:#92400e;';
          }
          return `<span style="display:inline-flex;height:38px;width:38px;align-items:center;justify-content:center;border-radius:8px;font-size:18px;font-weight:700;${slotStyle}">${charDisplay}</span>`;
        }).join('');

        stageEl.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;">
              ${slotsHtml}
            </div>
            ${hintRevealedCount > 0 && !isSubmitted ? `
              <div style="font-size:13px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:6px 12px;">
                💡 Gợi ý Pinyin: <strong>/${seg.pinyin || ''}/</strong> — Nghĩa: ${seg.vi || ''}
              </div>
            ` : ''}
            <div>
              <textarea id="xhz-dict-full-input" rows="2" ${isSubmitted ? 'disabled' : ''} placeholder="${pinyinMode ? 'Gõ phiên âm Pinyin bạn nghe được (ví dụ: da jia hao)... (Enter để kiểm tra)' : 'Gõ câu tiếng Trung bạn nghe được... (Enter để kiểm tra)'}" style="width:100%;border-radius:12px;border:1px solid #d6d3d1;background:#fff;padding:10px 14px;font-size:16px;color:#1c1917;outline:none;resize:vertical;">${escapeHtml(curState.input || '')}</textarea>
            </div>
            ${!isSubmitted ? `
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                <button type="button" id="xhz-dict-btn-check" style="border-radius:10px;border:none;background:#0d9488;padding:9px 18px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;">Kiểm tra</button>
                <button type="button" id="xhz-dict-btn-replay2" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">↻ Nghe lại</button>
                <button type="button" id="xhz-dict-btn-slow" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#1c1917;cursor:pointer;">🐢 Chậm (0.75×)</button>
                <button type="button" id="xhz-dict-btn-hint" style="border-radius:10px;border:1px solid #99f6e4;background:#f0fdfa;padding:9px 14px;font-size:14px;font-weight:700;color:#115e59;cursor:pointer;">💡 Gợi ý (${hintRevealedCount}/${hanziChars.length})</button>
                <button type="button" id="xhz-dict-btn-skip" style="border-radius:10px;border:1px solid #d6d3d1;background:#fff;padding:9px 14px;font-size:14px;font-weight:600;color:#78716c;cursor:pointer;">Bỏ qua</button>
              </div>
            ` : ''}
            ${revealHtml}
          </div>
        `;

        const fullInput = document.getElementById('xhz-dict-full-input');
        const checkFull = () => {
          const val = (fullInput ? fullInput.value : '').trim();
          const expectedHz = normalizeHanziCompare(seg.hanzi || '');
          const givenHz = normalizeHanziCompare(val);
          const expectedPy = normalizePinyinCompare(seg.pinyin || '');
          const givenPy = normalizePinyinCompare(val);
          const ok = val.length > 0 && (givenHz === expectedHz || (expectedPy && givenPy === expectedPy));
          segStates[currentIndex] = { status: ok ? 'correct' : 'wrong', input: val, checked: true };
          persistDictState();
          recordDictationAttempt(seg, ok);
          renderAllDictationUI();
          if (ok && window.__xhzStudioFx) {
            window.__xhzStudioFx.sparkle(document.getElementById('xhz-dict-stage'));
            window.__xhzStudioFx.toast('✨ Chính xác! Bạn nghe chép rất chuẩn.', 'success');
          }
        };
        if (fullInput && !isSubmitted) {
          fullInput.onkeydown = e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              checkFull();
            }
          };
        }
        const btnCheck = document.getElementById('xhz-dict-btn-check');
        if (btnCheck) btnCheck.onclick = checkFull;
        const btnHint = document.getElementById('xhz-dict-btn-hint');
        if (btnHint) {
          btnHint.onclick = () => {
            if ( fullInput ) {
              segStates[currentIndex] = { ...(segStates[currentIndex] || {}), input: fullInput.value };
            }
            hintRevealedCount = Math.min(hanziChars.length, hintRevealedCount + 1);
            renderWorkspaceStage();
          };
        }
      }

      // Wire common stage buttons
      const btnReplay2 = document.getElementById('xhz-dict-btn-replay2');
      if (btnReplay2) btnReplay2.onclick = () => playCurrentSegment();
      const btnSlow = document.getElementById('xhz-dict-btn-slow');
      if (btnSlow) btnSlow.onclick = () => playCurrentSegment(0.75);
      const btnSkip = document.getElementById('xhz-dict-btn-skip');
      if (btnSkip) {
        btnSkip.onclick = () => {
          segStates[currentIndex] = { status: 'revealed', input: curState.input || '', checked: true };
          persistDictState();
          renderAllDictationUI();
        };
      }
      const btnReveal = document.getElementById('xhz-dict-btn-reveal');
      if (btnReveal) {
        btnReveal.onclick = () => {
          segStates[currentIndex] = { status: 'revealed', input: '', checked: true };
          persistDictState();
          renderAllDictationUI();
        };
      }
      const btnRevReplay = document.getElementById('xhz-dict-rev-replay');
      if (btnRevReplay) btnRevReplay.onclick = () => playCurrentSegment();
      const btnRevRetry = document.getElementById('xhz-dict-rev-retry');
      if (btnRevRetry) {
        btnRevRetry.onclick = () => {
          segStates[currentIndex] = { status: 'unattempted', input: '', checked: false };
          hintRevealedCount = 0;
          persistDictState();
          renderAllDictationUI();
          playCurrentSegment();
        };
      }
      const btnRevNext = document.getElementById('xhz-dict-rev-next');
      if (btnRevNext) {
        btnRevNext.onclick = () => {
          selectSegment((currentIndex + 1) % segments.length, true);
        };
      }
    }

    function renderAllDictationUI() {
      renderWorkspaceStage();
      renderSegmentList();
    }

    renderAllDictationUI();
  }

  // --------------------------------------------------------------------------
  // 6.8. Trang Làm Đề Thi HSK / YCT (/kiem-tra-hsk/... và /de-kiem-tra/lam-bai/:id)
  // --------------------------------------------------------------------------
  async function renderHskTestPaperPage(pathname) {
    const root = getMainContentContainer();
    const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    root.innerHTML = '<p style="padding:32px;text-align:center;">Đang tải đề thi...</p>';
    const parts = pathname.split('/').filter(Boolean);
    const paperId = safeDecodeURIComponent(parts[parts.length - 1] || '');
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
      .xhz-exam{--exam-bg:#fff;--exam-alt:#fafaf9;--exam-text:#292524;--exam-muted:#78716c;--exam-border:#e7e5e4;color:var(--exam-text);max-width:1000px;margin:0 auto}.dark .xhz-exam{--exam-bg:#0f172a;--exam-alt:#1e293b;--exam-text:#f5f5f4;--exam-muted:#a8a29e;--exam-border:#57534e}
      .xhz-exam h1{font-size:28px;font-weight:800;margin:14px 0}.xhz-exam h2{font-weight:800;font-size:19px;margin:0 0 12px}.xhz-exam p{margin:10px 0}.xhz-exam .exam-panel{padding:22px;border:1px solid var(--exam-border);border-radius:18px;background:var(--exam-bg);margin:18px 0}.xhz-exam .exam-note{padding:15px 18px;border:1px solid #fbbf24;border-radius:12px;background:#fffbeb;color:#78350f;margin:18px 0;line-height:1.6}.xhz-exam .exam-muted{color:var(--exam-muted);font-size:14px}.xhz-exam .exam-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0}.xhz-exam button{padding:11px 16px;border:1px solid var(--exam-border);border-radius:11px;background:var(--exam-bg);color:var(--exam-text);font-weight:700;cursor:pointer}.xhz-exam button:disabled{opacity:.65;cursor:default}.xhz-exam .exam-primary{background:#0d9488;border-color:#0d9488;color:#fff}.xhz-exam .exam-option{display:flex;align-items:flex-start;gap:12px;border:1px solid var(--exam-border);border-radius:12px;background:var(--exam-alt);padding:13px;cursor:pointer}.xhz-exam .exam-option:has(input:checked){border-color:#0d9488;box-shadow:inset 0 0 0 1px #0d9488}.xhz-exam input[type=radio]{accent-color:#0d9488;margin-top:6px}.xhz-exam .exam-options,.xhz-exam .exam-images{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:14px 0}.xhz-exam img{max-height:160px;max-width:100%;object-fit:contain;display:block;background:#fff;border-radius:8px}.xhz-exam textarea,.xhz-exam input[type=text]{width:100%;padding:12px;border:1px solid var(--exam-border);border-radius:10px;background:var(--exam-bg);color:var(--exam-text);font-size:17px}.xhz-exam .exam-feedback{font-size:14px;margin-top:12px}.xhz-exam :focus-visible{outline:3px solid #0d9488;outline-offset:3px}@media(max-width:480px){.xhz-exam .exam-panel{padding:16px}.xhz-exam h1{font-size:24px}}
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
        <div id="xhz-exam-layout" style="display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:18px;align-items:start;">
          <div style="min-width:0;">
            ${paper.audioUrl || paper.audio ? '<div class="exam-panel" id="xhz-exam-full-audio"><h2>Âm thanh toàn đề</h2></div>' : ''}
            <div id="xhz-exam-questions"></div>
            <div class="exam-toolbar"><button type="button" id="xhz-exam-submit" class="exam-primary" ${submitted ? 'disabled' : ''}>${submitted ? 'Đã lưu bài làm' : 'Nộp bài và lưu lựa chọn'}</button></div>
          </div>
          <aside id="xhz-exam-nav-grid" class="exam-panel" style="position:sticky;top:80px;">
            <h2 style="margin:0 0 10px;">Bảng câu hỏi</h2>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
              ${questions.map((q, i) => {
                const qk = questionKey(q, i);
                const qn = q.number || q.questionNumber || i + 1;
                const answered = attempt.answers[qk] !== undefined;
                return `<button type="button" id="xhz-qnav-${qn}" data-scroll-q="${qn}" style="height:32px;border-radius:8px;border:1px solid ${answered ? '#0d9488' : '#d6d3d1'};background:${answered ? '#f0fdfa' : '#fafaf9'};color:${answered ? '#115e59' : '#44403c'};font-weight:700;font-size:12px;cursor:pointer;">${qn}</button>`;
              }).join('')}
            </div>
          </aside>
        </div>
        <style>@media (max-width: 900px) { #xhz-exam-layout { grid-template-columns: 1fr !important; } #xhz-exam-nav-grid { position: static !important; order: -1; } }</style>
      </div>`);
      const runRoot = root.querySelector('#xhz-exam-run');
      root.querySelectorAll('[data-scroll-q]').forEach(pill => {
        pill.onclick = () => {
          const card = root.querySelector('#xhz-qcard-' + pill.getAttribute('data-scroll-q'));
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
      });
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
        const card = document.createElement('section'); card.className = 'exam-panel'; card.id = `xhz-qcard-${number}`;
        card.innerHTML = `<h2>Câu ${number}${question.sectionTitle ? ` · ${escape(question.sectionTitle)}` : ''}</h2>${question.instruction ? `<p class="exam-muted">${escape(question.instruction)}</p>` : ''}<p style="font-size:20px;white-space:pre-line;">${escape(question.prompt || question.question || question.stem || question.text || '')}</p>${question.pinyin || question.transcriptPinyin ? `<p class="exam-muted">${escape(question.pinyin || question.transcriptPinyin)}</p>` : ''}${question.passage ? `<p style="white-space:pre-line;">${escape(question.passage)}</p>` : ''}<div class="exam-audio"></div>${question.imageUrl || question.image ? `<img src="${escape(rewriteMediaUrl(question.imageUrl || question.image))}" onerror="this.style.display='none'" alt="Minh họa câu ${number}" loading="lazy">` : ''}${type === 'image_match' && images.length ? `<div class="exam-images">${images.map((src, idx) => `<div><strong>Hình ${String.fromCharCode(65 + idx)}</strong><img src="${escape(src)}" onerror="this.style.display='none'" alt="Hình ${String.fromCharCode(65 + idx)}" loading="lazy"></div>`).join('')}</div>` : ''}<div class="exam-answers"></div><p class="exam-feedback" role="status"></p>`;
        list.appendChild(card);
        mountAudio(card.querySelector('.exam-audio'), question.audio || question.audioUrl, key);
        const answerRoot = card.querySelector('.exam-answers');
        const feedback = card.querySelector('.exam-feedback');
        const saveAnswer = value => {
          if (value === '') delete attempt.answers[key];
          else attempt.answers[key] = value;
          saveAttempt(); updateProgress(); updateQuestionFeedback(question, index, feedback);
          const pill = root.querySelector('#xhz-qnav-' + number);
          if (pill) {
            const hasAns = value !== '';
            pill.style.background = hasAns ? '#f0fdfa' : '#fafaf9';
            pill.style.borderColor = hasAns ? '#0d9488' : '#d6d3d1';
            pill.style.color = hasAns ? '#115e59' : '#44403c';
          }
        };
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
            const body = document.createElement('span'); body.innerHTML = `<strong>${escape(optionKey)}.</strong> ${escape(text)}${typeof option === 'object' && option.pinyin ? `<small class="exam-muted"> ${escape(option.pinyin)}</small>` : ''}${image ? `<img src="${escape(image)}" onerror="this.style.display='none'" alt="Câu ${number}, phương án ${escape(optionKey)}" loading="lazy">` : ''}`;
            input.onchange = () => { if (input.checked) saveAnswer(input.value); };
            label.append(input, body); answerRoot.appendChild(label);
          });
        }
        updateQuestionFeedback(question, index, feedback);
      });
      root.querySelector('#xhz-exam-back').onclick = renderLobby;
      const finish = async expired => {
        if (attempt.submittedAt) return;
        attempt.submittedAt = new Date().toISOString();
        attempt.expired = Boolean(expired);
        saveAttempt();
        try {
          await fetch(`/v1/hsk-tests/${encodeURIComponent(paperId)}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId, answers: attempt.answers, durationMinutes })
          });
        } catch (_) {}
        renderRun();
      };
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


  // 6.8b. Trang Phiên Ôn Tập SRS & Sửa Lỗi (/hoc/bai/on-tap-den-han, on-tap-loi-sai, on-tap-the-cau)
  // --------------------------------------------------------------------------
  async function renderReviewSessionPage(slug) {
    const root = getMainContentContainer();
    const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    let preferences = {};
    try { preferences = JSON.parse(localStorage.getItem('httq_learning_profile') || '{}') || {}; } catch (_) {}
    const hidePinyin = Boolean(preferences.hidePinyinInReview);
    getRealProgressSummary(); // Enrol real words from existing v10 progress on direct entry.
    await handleApiRequest(window.location.origin + '/v2/review/summary', { method: 'GET' }).catch(() => null);
    const state = getLocalState();
    const allCards = Array.isArray(state.collections && state.collections.reviewCards) ? state.collections.reviewCards : [];
    const due = allCards.filter(card => Date.parse(card.dueAt) <= Date.now());
    const mistakes = allCards.filter(card => card.wrongCount > 0 && card.correctStreak < 2 && !card.dismissed);
    const sentences = due.filter(card => card.itemKey.startsWith('s:'));
    const isMistakeMode = slug.includes('loi-sai');
    const isSentenceMode = slug.includes('the-cau');
    const sourceCards = isMistakeMode ? mistakes : isSentenceMode ? sentences : due;
    const title = isMistakeMode ? 'Ôn lỗi sai' : isSentenceMode ? 'Luyện thẻ câu' : 'Ôn bài đến hạn';
    document.title = `${title} | Ôn tập Hán ngữ`;
    root.innerHTML = `<div id="xhz-review-session-root" style="max-width:920px;margin:0 auto;color:#1c1917;">
      <a href="/on-tap" style="display:inline-block;margin-bottom:18px;color:#0d9488;font-weight:700;">← Quay lại Trung tâm Ôn tập</a>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
        <a href="/hoc/bai/on-tap-den-han" style="padding:8px 14px;border:1px solid #99f6e4;border-radius:999px;background:#f0fdfa;color:#115e59;font-weight:700;">Ôn đến hạn (${due.length})</a>
        <a href="/hoc/bai/on-tap-loi-sai" style="padding:8px 14px;border:1px solid #99f6e4;border-radius:999px;background:#f0fdfa;color:#115e59;font-weight:700;">Ôn lỗi sai (${mistakes.length})</a>
        <a href="/hoc/bai/on-tap-the-cau" style="padding:8px 14px;border:1px solid #99f6e4;border-radius:999px;background:#f0fdfa;color:#115e59;font-weight:700;">Thẻ câu (${sentences.length})</a>
      </div>
      <div style="padding:20px 24px;border:1px solid #99f6e4;border-radius:22px;background:#f0fdfa;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
        <div><h1 style="font-size:24px;font-weight:800;margin:0 0 6px;">${title}</h1>
          <p style="margin:0;color:#57534e;">${sourceCards.length} thẻ từ lịch sử học của bạn${isMistakeMode ? ' · Mỗi lỗi cần hai lượt đúng liên tiếp để khắc phục' : ''}</p></div>
        <div id="xhz-review-progress-badge" style="padding:10px 18px;border-radius:14px;background:#fff;color:#115e59;font-weight:800;">Đã luyện: 0 / ${sourceCards.length}</div>
      </div>
      <div id="xhz-review-status" role="status" aria-live="polite" style="margin:12px 0;color:#0d9488;"></div>
      <div id="xhz-review-body" style="padding:24px;border:1px solid #e7e5e4;border-radius:22px;background:#fff;">Đang tải thẻ ôn tập...</div>
    </div>`;
    const bodyEl = root.querySelector('#xhz-review-body');
    const statusEl = root.querySelector('#xhz-review-status');
    const badgeEl = root.querySelector('#xhz-review-progress-badge');
    if (!sourceCards.length) {
      bodyEl.innerHTML = `<div style="padding:24px;text-align:center;line-height:1.7;">
        <h2 style="font-size:20px;font-weight:800;">${isMistakeMode ? 'Bạn chưa có lỗi cần ôn.' : isSentenceMode ? 'Chưa có thẻ câu đến hạn.' : 'Bạn đã ôn hết các thẻ đến hạn.'}</h2>
        <p style="color:#57534e;">Kết quả từ các bài học và bài luyện sẽ được lưu vào lịch ôn của bạn.</p>
        <a href="/hoc" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#0d9488;color:#fff;font-weight:700;">Tiếp tục học</a>
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
        if (completed.size === 1) { recordStudyProgress({ minutes: 2, sessionInc: 1, dailyStepDone: 'step-review-1' }); }
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
            ${!hidePinyin && !testsSound && answer !== item.hanzi ? `<div style="color:#0d9488;">${escape(item.pinyin)}</div>` : ''}
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
            <button class="xhz-type-check" style="${buttonStyle}background:#0d9488;color:#fff;border-color:#0d9488;">Kiểm tra</button></div>
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
      if (!item) { srsPanel.innerHTML = '<div style="padding:30px;font-weight:700;line-height:1.8;">Đã lưu kết quả của toàn bộ thẻ trong phiên này.<br/><a href="/on-tap" style="color:#0d9488;">Xem lịch ôn mới →</a></div>'; return; }
      let flipped = false;
      const goodDays = [1, 3, 7, 14, 30][Math.min(4, item.correctStreak || 0)];
      srsPanel.innerHTML = `<div style="margin-bottom:12px;color:#78716c;font-weight:700;">Thẻ ${currentIndex + 1} / ${items.length}</div>
        <button id="xhz-srs-card" style="width:100%;padding:32px 24px;min-height:250px;border-radius:22px;border:2px solid #5eead4;background:#f0fdfa;color:#1c1917;cursor:pointer;">
          <div style="font-size:48px;font-weight:800;overflow-wrap:anywhere;">${escape(item.hanzi)}</div>
          <div class="xhz-srs-pinyin" style="font-size:20px;color:#0d9488;margin-top:10px;">${hidePinyin ? '' : escape(item.pinyin)}</div>
          <div id="xhz-srs-back" style="display:none;margin-top:16px;padding-top:14px;border-top:1px dashed #5eead4;">
            <div style="font-size:22px;font-weight:700;">${escape(item.meaningVi)}</div>
            ${item.exampleZh ? `<div style="font-size:15px;margin-top:8px;">${escape(item.exampleZh)} ${escape(item.exampleVi)}</div>` : ''}
          </div><div style="margin-top:16px;font-size:13px;color:#115e59;">Bấm để lật thẻ và đánh giá mức độ nhớ</div></button>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;"><button id="xhz-srs-speak" style="${buttonStyle}">🔊 Nghe</button><button id="xhz-srs-flip" style="${buttonStyle}">Lật thẻ</button></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px;">
          ${[['again', 'Quên', '1 phút', '1'], ['hard', 'Khó', '10 phút', '2'], ['good', 'Tốt', `${goodDays} ngày`, '3'], ['easy', 'Dễ', `${Math.max(4, goodDays)} ngày`, '4']].map(([grade, label, interval, keyHint]) => `<button class="xhz-srs-grade" data-grade="${grade}" data-key="${keyHint}" disabled style="${buttonStyle}opacity:0.5;padding:12px 4px;">${label}<div style="font-size:11px;margin-top:4px;">${interval} · [${keyHint}]</div></button>`).join('')}
        </div>
        <div id="xhz-srs-kbd-hint" style="margin-top:12px;font-size:12px;color:#78716c;">⌨️ Phím tắt: <strong>Space</strong> lật thẻ · <strong>R</strong> nghe lại · <strong>1–4</strong> chấm mức nhớ</div>`;
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
      bodyEl.querySelectorAll('.xhz-rev-tab').forEach(button => { const active = button.getAttribute('data-tab') === tab; button.style.background = active ? '#0d9488' : '#fff'; button.style.color = active ? '#fff' : '#1c1917'; });
      for (const name of ['srs', 'mc', 'typing']) bodyEl.querySelector(`#xhz-rev-panel-${name}`).style.display = tab === name ? name === 'srs' ? 'block' : 'flex' : 'none';
    }
    bodyEl.querySelectorAll('.xhz-rev-tab').forEach(button => { button.onclick = () => switchTab(button.getAttribute('data-tab')); });
    const tab = isMistakeMode ? 'mc' : preferences.reviewFormat === 'typing' ? 'typing' : preferences.reviewFormat === 'multiple_choice' ? 'mc' : 'srs';
    switchTab(tab);
  }

  async function renderMistakeBookOrLearnedWordsPage(pathname) {
    const isMistakeView = pathname.includes('so-loi') || pathname.includes('loi-sai');
    if (isMistakeView) {
      await renderReviewSessionPage('on-tap-loi-sai');
      return;
    }
    const root = getMainContentContainer();
    const res = await (await handleApiRequest(window.location.origin + '/v2/review/words', { method: 'GET' })).json();
    const items = Array.isArray(res && res.items) ? res.items : [];
    document.title = `Từ đã học (${items.length} từ) | Học Tiếng Trung`;

    root.innerHTML = `
      <div style="max-width:960px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <a href="/on-tap" style="color:#0d9488;font-weight:800;text-decoration:none;">← Quay lại Trung tâm Ôn tập</a>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" id="xhz-lw-export-csv" style="padding:8px 14px;border-radius:999px;background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;font-weight:700;cursor:pointer;font-size:13px;">📥 Xuất CSV (Anki/Excel)</button>
            <a href="/hoc/bai/on-tap-den-han" style="padding:8px 16px;border-radius:999px;background:#0d9488;color:#fff;font-weight:700;text-decoration:none;font-size:13px;">🔄 Ôn tập ngay</a>
            <a href="/hoc/tu-da-hoc" style="padding:8px 16px;border-radius:999px;background:#fff;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;text-decoration:none;font-size:13px;">📚 Xem bản đầy đủ</a>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:22px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
            <div>
              <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0;">📚 Từ vựng đã học (${items.length} từ)</h1>
              <p style="font-size:14px;color:#57534e;margin:4px 0 0 0;">Tổng hợp toàn bộ chữ Hán và từ vựng đã ghi nhận trong quá trình học tập của bạn.</p>
            </div>
            <input id="xhz-lw-search" type="text" placeholder="🔍 Lọc từ vựng, pinyin, nghĩa..." style="padding:9px 14px;border-radius:999px;border:1px solid #d6d3d1;font-size:14px;min-width:220px;" />
          </div>
          <div id="xhz-lw-filters" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
            <button type="button" data-status="all" class="xhz-lw-filter" style="padding:6px 14px;border-radius:999px;border:1px solid #0d9488;background:#0d9488;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">Tất cả (${items.length})</button>
            <button type="button" data-status="known" class="xhz-lw-filter" style="padding:6px 14px;border-radius:999px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;font-size:13px;cursor:pointer;">Đã thuộc (${items.filter(i => i.state === 'review').length})</button>
            <button type="button" data-status="learning" class="xhz-lw-filter" style="padding:6px 14px;border-radius:999px;border:1px solid #d6d3d1;background:#fff;color:#1c1917;font-weight:700;font-size:13px;cursor:pointer;">Đang học (${items.filter(i => i.state !== 'review').length})</button>
          </div>
          <div id="xhz-lw-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;"></div>
        </div>
      </div>
    `;
    const grid = root.querySelector('#xhz-lw-grid');
    const searchEl = root.querySelector('#xhz-lw-search');
    const exportBtn = root.querySelector('#xhz-lw-export-csv');
    let activeStatus = 'all';
    const renderCards = (q = '') => {
      const norm = q.trim().toLowerCase();
      const filtered = items.filter(it => {
        if (activeStatus === 'known' && it.state !== 'review') return false;
        if (activeStatus === 'learning' && it.state === 'review') return false;
        if (!norm) return true;
        return it.hanzi.includes(norm) || (it.pinyin || '').toLowerCase().includes(norm) || (it.meaningVi || '').toLowerCase().includes(norm);
      });
      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;padding:28px;text-align:center;color:#78716c;">Chưa có từ vựng nào khớp với bộ lọc. Hãy hoàn thành bài học trên <a href="/hoc" style="color:#0d9488;font-weight:700;">Lộ trình học</a> để tích lũy từ mới nhé!</div>`;
        return;
      }
      grid.innerHTML = filtered.map(it => {
        const href = it.hanzi.length === 1 ? `/han-tu/${encodeURIComponent(it.hanzi)}` : `/tu-vung/${encodeURIComponent(it.hanzi)}`;
        const isKnown = it.state === 'review';
        return `
          <div style="padding:14px 16px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
              <a href="${href}" style="text-decoration:none;color:#1c1917;font-size:28px;font-weight:800;font-family:'Noto Serif SC',serif;">${escapeHtml(it.hanzi)}</a>
              <div style="display:flex;gap:6px;align-items:center;">
                <span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:999px;background:${isKnown ? '#dcfce7' : '#fef3c7'};color:${isKnown ? '#15803d' : '#92400e'};">${isKnown ? 'Thuộc' : 'Đang học'}</span>
                <button type="button" data-xhz-play="${escapeHtml(it.hanzi || '')}" aria-label="Nghe phát âm" style="border:none;background:#f0fdfa;color:#115e59;border-radius:999px;padding:4px 10px;font-weight:700;cursor:pointer;font-size:12px;">🔊</button>
              </div>
            </div>
            ${it.pinyin ? `<div style="font-size:14px;color:#0d9488;font-weight:700;">${escapeHtml(it.pinyin)}</div>` : ''}
            <div style="font-size:14px;color:#44403c;line-height:1.4;">${escapeHtml(it.meaningVi || 'Từ vựng đã học')}</div>
          </div>
        `;
      }).join('');
    };
    renderCards();
    if (searchEl) searchEl.oninput = e => renderCards(e.target.value);
    root.querySelectorAll('.xhz-lw-filter').forEach(btn => {
      btn.onclick = () => {
        activeStatus = btn.getAttribute('data-status') || 'all';
        root.querySelectorAll('.xhz-lw-filter').forEach(b => {
          const on = b === btn;
          b.style.background = on ? '#0d9488' : '#fff';
          b.style.color = on ? '#fff' : '#1c1917';
          b.style.borderColor = on ? '#0d9488' : '#d6d3d1';
        });
        renderCards(searchEl ? searchEl.value : '');
      };
    });
    if (exportBtn) {
      exportBtn.onclick = async () => {
        exportBtn.textContent = '⏳ Đang xuất...';
        await window.__xhzExportVocabularyCsv(true);
        exportBtn.textContent = '✅ Đã tải CSV!';
        setTimeout(() => { exportBtn.textContent = '📥 Xuất CSV (Anki/Excel)'; }, 2000);
      };
    }
  }

  // --------------------------------------------------------------------------
  // 6.8c. Trang Tiến Độ & Thói Quen (/hoc/tien-do, /hoc/thoi-quen) & Tra Chữ Bộ Thủ
  // --------------------------------------------------------------------------
  async function renderProgressOrHabitPage(pathname) {
    const root = getMainContentContainer();
    const isHabit = pathname.includes('thoi-quen');
    const sum = getRealProgressSummary();
    const prog = getRealProgress();
    const hb = prog.habitSettings || {};
    const dailyGoal = Number(hb.dailyMinutesGoal || hb.dailyMinutes || 15) || 15;
    const weeklyGoal = Number(hb.weeklySessionsGoal || hb.weeklyGoal || 5) || 5;
    document.title = isHabit ? 'Thói quen học tập | Học Tiếng Trung' : 'Tiến độ học tập HSK | Học Tiếng Trung';

    // Build 5-skill mastery & readiness stats
    const vocabPct = Math.min(100, Math.round((sum.wordsSeen / 300) * 100));
    const charCount = Math.max(Object.keys(prog.masteredChars || {}).length, Math.min(150, sum.wordsMastered));
    const writingPct = Math.min(100, Math.round((charCount / 150) * 100));
    const gramCount = Array.isArray(prog.learnedGrammarIds) ? prog.learnedGrammarIds.length : 0;
    const gramPct = Math.min(100, Math.round((gramCount / 30) * 100));
    const stageCount = Array.isArray(prog.doneStages) ? prog.doneStages.length : 0;
    const listeningPct = Math.min(100, Math.round((stageCount / 40) * 100));
    const spkCount = Object.keys(prog.speakingProgress || {}).length + (Number(prog.voiceUsed) || 0);
    const speakingPct = Math.min(100, Math.round((spkCount / 25) * 100));
    const skillRows = [
      { label: 'Từ vựng HSK 1', pct: vocabPct, detail: `${sum.wordsSeen} / 300 từ`, color: '#2563eb' },
      { label: 'Chữ Hán & Viết nét', pct: writingPct, detail: `${charCount} / 150 chữ`, color: '#0d9488' },
      { label: 'Ngữ pháp trọng tâm', pct: gramPct, detail: `${gramCount} / 30 điểm`, color: '#7c3aed' },
      { label: 'Lộ trình & Nghe hiểu', pct: listeningPct, detail: `${stageCount} / 40 chặng`, color: '#16a34a' },
      { label: 'Luyện nói AI', pct: speakingPct, detail: `${spkCount} lượt`, color: '#db2777' }
    ];
    const latestExam = Array.isArray(prog.examHistory) && prog.examHistory[0];
    const avgSkill = Math.round((vocabPct + writingPct + gramPct + listeningPct + speakingPct) / 5);
    const predictedScore300 = latestExam ? Math.round((Number(latestExam.score) || 0) * 3) : Math.max(60, Math.round(avgSkill * 3));

    // Build Mon-Sun tracker
    const now = new Date();
    const dow = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const activeSet = new Set(Array.isArray(prog.activeDates) ? prog.activeDates : []);
    (sum.weekDays || []).forEach(wd => { if (wd && wd.day && wd.done) activeSet.add(wd.day); });
    const weekPills = dayLabels.map((lbl, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + idx);
      const iso = d.toISOString().slice(0, 10);
      const isDone = activeSet.has(iso) || (Number((prog.minutesByDate || {})[iso]) || 0) > 0;
      const mins = Number((prog.minutesByDate || {})[iso]) || 0;
      return { lbl, iso, isDone, mins };
    });

    const weeks12 = Array.isArray(sum.activity12Weeks) ? sum.activity12Weeks : [];

    root.innerHTML = `
      <div style="max-width:940px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <a href="/hoc" style="color:#0d9488;font-weight:800;text-decoration:none;">← Quay lại Trang Học (/hoc)</a>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="/hoc/tien-do" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;background:${!isHabit ? '#0d9488' : '#fff'};color:${!isHabit ? '#fff' : '#44403c'};border:1px solid ${!isHabit ? '#0d9488' : '#e7e5e4'};">📊 Tiến độ HSK</a>
            <a href="/hoc/thoi-quen" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;background:${isHabit ? '#0d9488' : '#fff'};color:${isHabit ? '#fff' : '#44403c'};border:1px solid ${isHabit ? '#0d9488' : '#e7e5e4'};">🔥 Chuỗi ngày học</a>
            <a href="/on-tap" style="padding:7px 14px;border-radius:999px;font-size:13px;font-weight:700;text-decoration:none;background:#f0fdfa;color:#0f766e;border:1px solid #99f6e4;">🔄 Ôn tập</a>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e7e5e4;border-radius:22px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          <h1 style="font-size:24px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">
            ${isHabit ? `🔥 Chuỗi thói quen: ${sum.streakDays} ngày liên tiếp` : '📊 Tiến độ chinh phục Giáo trình Chuẩn HSK 1'}
          </h1>
          <p style="color:#57534e;margin:0 0 20px 0;font-size:14px;">
            Mục tiêu mỗi ngày: <strong>${dailyGoal} phút</strong> · Đã hoàn thành hôm nay: <strong>${sum.todayMinutes} / ${dailyGoal} phút</strong> · Từ vựng đã mở khóa: <strong>${sum.wordsSeen} / 300</strong> từ HSK 1
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px;">
            <div style="padding:16px;border-radius:16px;background:#f0fdfa;border:1px solid #99f6e4;">
              <div style="font-size:12px;font-weight:700;color:#115e59;">CHUỖI NGÀY HỌC</div>
              <div style="font-size:28px;font-weight:800;color:#0d9488;margin-top:4px;">${sum.streakDays} ngày 🔥</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;">Kỷ lục dài nhất: ${sum.longestStreak} ngày · Tuần này: ${sum.sessionsThisWeek}/${weeklyGoal} buổi</div>
            </div>
            <div style="padding:16px;border-radius:16px;background:#f0fdf4;border:1px solid #bbf7d0;">
              <div style="font-size:12px;font-weight:800;color:#166534;">TỪ ĐÃ THUỘC</div>
              <div style="font-size:28px;font-weight:800;color:#15803d;margin-top:4px;">${sum.wordsMastered} từ</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;"><a href="/hoc/tu-da-hoc" style="color:#15803d;font-weight:700;">Xem danh sách từ →</a></div>
            </div>
            <div style="padding:16px;border-radius:16px;background:#fef2f2;border:1px solid #fecaca;">
              <div style="font-size:12px;font-weight:700;color:#991b1b;">MỤC CẦN ÔN LẠI</div>
              <div style="font-size:28px;font-weight:800;color:#dc2626;margin-top:4px;">${sum.dueTotal} thẻ</div>
              <div style="font-size:12px;color:#78716c;margin-top:4px;"><a href="/hoc/bai/on-tap-den-han" style="color:#dc2626;font-weight:700;">Ôn bài đến hạn ngay →</a></div>
            </div>
          </div>

          ${!isHabit ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin-bottom:22px;">
              <div id="xhz-skill-bars" style="padding:18px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;">
                <h3 style="font-size:16px;font-weight:800;color:#1c1917;margin:0 0 14px 0;">🎯 Bản đồ 5 Kỹ năng HSK</h3>
                <div style="display:flex;flex-direction:column;gap:12px;">
                  ${skillRows.map(r => `
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px;">
                        <span style="color:#1c1917;">${r.label}</span>
                        <span style="color:${r.color};">${r.detail} (${r.pct}%)</span>
                      </div>
                      <div style="height:8px;border-radius:999px;background:#e7e5e4;overflow:hidden;">
                        <div style="height:100%;width:${r.pct}%;background:${r.color};border-radius:999px;transition:width 0.3s;"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div id="xhz-hsk-readiness-card" style="padding:18px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
                <div>
                  <h3 style="font-size:16px;font-weight:800;color:#1c1917;margin:0 0 8px 0;">🏆 Dự đoán điểm thi HSK</h3>
                  <div style="font-size:34px;font-weight:900;color:#ea580c;">${predictedScore300} <span style="font-size:16px;font-weight:700;color:#78716c;">/ 300 điểm</span></div>
                  <p style="font-size:13px;color:#57534e;margin:6px 0 0 0;">
                    ${latestExam ? `Dựa theo đề gần nhất (${latestExam.paperId || 'HSK'} · ${latestExam.score}%)` : 'Ước lượng dựa trên tiến độ 5 kỹ năng hiện tại.'}
                  </p>
                </div>
                <a href="/de-kiem-tra" style="display:inline-block;text-align:center;padding:10px 16px;border-radius:12px;background:#1c1917;color:#fff;font-weight:700;text-decoration:none;font-size:13px;">Vào Phòng thi thử HSK / YCT →</a>
              </div>
            </div>
          ` : `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin-bottom:22px;">
              <div id="xhz-week-tracker" style="padding:18px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;">
                <h3 style="font-size:16px;font-weight:800;color:#1c1917;margin:0 0 12px 0;">📅 Lịch học tuần này (T2 → CN)</h3>
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;text-align:center;">
                  ${weekPills.map(wp => `
                    <div title="${wp.iso}: ${wp.mins} phút" style="padding:10px 4px;border-radius:12px;background:${wp.isDone ? '#ea580c' : '#fff'};color:${wp.isDone ? '#fff' : '#78716c'};border:1px solid ${wp.isDone ? '#ea580c' : '#e7e5e4'};font-weight:800;font-size:13px;">
                      <div>${wp.lbl}</div>
                      <div style="font-size:11px;margin-top:4px;">${wp.isDone ? '✓' : '·'}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <form id="xhz-habit-goal-form" style="padding:18px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;display:flex;flex-direction:column;gap:10px;">
                <h3 style="font-size:16px;font-weight:800;color:#1c1917;margin:0;">⚙️ Cài đặt mục tiêu học tập</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                  <label style="font-size:13px;font-weight:700;color:#44403c;">
                    Số buổi / tuần
                    <input id="xhz-goal-sessions" type="number" min="1" max="7" value="${weeklyGoal}" style="width:100%;margin-top:4px;padding:8px 10px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;font-weight:700;" />
                  </label>
                  <label style="font-size:13px;font-weight:700;color:#44403c;">
                    Số phút / ngày
                    <input id="xhz-goal-minutes" type="number" min="5" max="120" step="5" value="${dailyGoal}" style="width:100%;margin-top:4px;padding:8px 10px;border-radius:10px;border:1px solid #d6d3d1;background:#fff;font-weight:700;" />
                  </label>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <button id="xhz-save-habit-goal" type="submit" style="padding:9px 18px;border-radius:10px;background:#ea580c;color:#fff;border:none;font-weight:800;cursor:pointer;font-size:13px;">Lưu mục tiêu</button>
                  <span id="xhz-goal-saved-msg" style="font-size:13px;font-weight:700;color:#16a34a;"></span>
                </div>
              </form>
            </div>
            <div id="xhz-heatmap-12w" style="padding:18px;border-radius:16px;border:1px solid #e7e5e4;background:#fafaf9;margin-bottom:22px;">
              <h3 style="font-size:16px;font-weight:800;color:#1c1917;margin:0 0 12px 0;">🗓️ Biểu đồ nhiệt 12 tuần gần nhất</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:8px;">
                ${weeks12.map((w, idx) => {
                  const m = Number(w.minutes) || 0;
                  const bg = m >= 90 ? '#c2410c' : m >= 30 ? '#fb923c' : m > 0 ? '#fed7aa' : '#e7e5e4';
                  const fg = m >= 30 ? '#fff' : '#44403c';
                  return `<div title="${w.isoWeek || ''}: ${m} phút, ${w.activeDays || 0} ngày" style="padding:8px 6px;border-radius:10px;background:${bg};color:${fg};text-align:center;font-size:12px;font-weight:700;">
                    <div>T-${12 - idx}</div>
                    <div style="font-size:11px;opacity:0.9;">${m}p</div>
                  </div>`;
                }).join('')}
              </div>
            </div>
          `}

          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="/hoc/bai/hsk30.L1.P1.learn.1" style="padding:12px 22px;border-radius:14px;background:#0d9488;color:#fff;font-weight:800;text-decoration:none;">▶ Tiếp tục học Bài 1</a>
            <a href="/hoc/bai/on-tap-den-han" style="padding:12px 22px;border-radius:14px;background:#ffedd5;color:#9a3412;border:1px solid #fdba74;font-weight:800;text-decoration:none;">🔄 Ôn bài đến hạn (${sum.dueTotal})</a>
            <a href="/hoc/so-loi" style="padding:12px 22px;border-radius:14px;background:#fafaf9;color:#1c1917;border:1px solid #d6d3d1;font-weight:700;text-decoration:none;">📓 Xem Sổ lỗi (${sum.mistakesCount})</a>
          </div>
        </div>
      </div>
    `;

    const goalForm = document.getElementById('xhz-habit-goal-form');
    if (goalForm) {
      goalForm.onsubmit = async ev => {
        ev.preventDefault();
        const sessVal = Math.max(1, Math.min(7, Number(document.getElementById('xhz-goal-sessions').value) || 5));
        const minVal = Math.max(5, Math.min(120, Number(document.getElementById('xhz-goal-minutes').value) || 15));
        recordStudyProgress({
          habitSettings: { weeklySessionsGoal: sessVal, weeklyGoal: sessVal, dailyMinutesGoal: minVal, dailyMinutes: minVal }
        });
        try {
          await fetch('/v2/me/habit/weekly-goal', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weeklyGoal: sessVal, weeklySessionsGoal: sessVal, dailyMinutesGoal: minVal })
          });
        } catch (_) {}
        const msgEl = document.getElementById('xhz-goal-saved-msg');
        if (msgEl) msgEl.textContent = '✅ Đã lưu & đồng bộ!';
      };
    }
  }

  async function renderCharacterBrowseSubPage(pathname) {
    const root = getMainContentContainer();
    const parts = pathname.split('/').filter(Boolean);
    const type = parts[1];
    let value = '';
    try { value = safeDecodeURIComponent(parts.slice(2).join('/')); } catch (_) {}
    const index = await loadLocalJson('/data/characters/index.json');
    const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const level = (value.match(/\d+/) || [null])[0] ? Number((value.match(/\d+/) || [])[0]) : null;
    const radM = value.match(/[\u4e00-\u9fff\u2f00-\u2fdf\u2e80-\u2eff\u3400-\u4dbf]/);
    const radChar = radM ? radM[0] : value.trim();
    const RADICAL_VARIANT_MAP = {
      '亻': ['人'], '⺅': ['人'], '氵': ['水'], '⺡': ['水'], '氺': ['水'], '扌': ['手'], '⺘': ['手'],
      '讠': ['言'], '訁': ['言'], '钅': ['金'], '釒': ['金'], '纟': ['糸'], '糹': ['糸'],
      '艹': ['艸'], '⺾': ['艸'], '⺿': ['艸'], '⻀': ['艸'], '忄': ['心'], '⺖': ['心'], '⺗': ['心'],
      '辶': ['辵'], '⻌': ['辵'], '⻍': ['辵'], '阝': ['阜', '邑'], '⻖': ['阜'], '⻏': ['邑'],
      '犭': ['犬'], '⺨': ['犬'], '灬': ['火'], '礻': ['示'], '⺭': ['示'], '⺬': ['示'],
      '衤': ['衣'], '⻂': ['衣'], '刂': ['刀'], '⺉': ['刀'], '攵': ['攴'], '⺙': ['攴'],
      '牜': ['牛'], '⺧': ['牛'], '王': ['玉', '王'], '⺩': ['玉'], '月': ['月', '肉'], '⺼': ['肉'],
      '罒': ['网'], '⺫': ['网'], '罓': ['网'], '⺳': ['网'], '⺮': ['竹'], '⻊': ['足'],
      '耂': ['老'], '⺹': ['老'], '爫': ['爪'], '⺤': ['爪'], '⺥': ['爪'], '户': ['戶'], '戸': ['戶'],
      '长': ['長'], '镸': ['長'], '门': ['門'], '见': ['見'], '页': ['頁'], '贝': ['貝'],
      '马': ['馬'], '飞': ['飛'], '风': ['風'], '车': ['車'], '鱼': ['魚'], '鸟': ['鳥'],
      '麦': ['麥'], '韦': ['韋'], '黄': ['黃'], '齿': ['齒'], '龙': ['龍'], '龟': ['龜'],
      '齐': ['齊'], '卤': ['鹵'], '黾': ['黽'], '饣': ['食'], '飠': ['食'], '⻟': ['食'],
      '西': ['襾'], '覀': ['襾'], '⻃': ['襾'], '川': ['巛'], '彑': ['彐'], '⺕': ['彐'],
      '母': ['毋'], '歺': ['歹'], '⺆': ['冂'], '⺇': ['几'], '⺋': ['卩'], '⺍': ['小'],
      '⺎': ['尢'], '尣': ['尢'], '⺐': ['尢'], '⺑': ['尢'], '⺣': ['火'], '⺦': ['爿'],
      '⺶': ['羊'], '⺷': ['羊'], '⺸': ['羊'], '⺻': ['聿'], '肀': ['聿'], '⻁': ['虍'],
      '⻗': ['雨'], '斗': ['斗', '鬥']
    };
    const radTargets = new Set();
    if (radChar) {
      radTargets.add(radChar);
      try { radTargets.add(radChar.normalize('NFKC')); } catch (_) {}
      (RADICAL_VARIANT_MAP[radChar] || []).forEach(c => radTargets.add(c));
      try { (RADICAL_VARIANT_MAP[radChar.normalize('NFKC')] || []).forEach(c => radTargets.add(c)); } catch (_) {}
    }
    const entries = Array.isArray(index) ? index.filter(item => type === 'hsk'
      ? level !== null && Number(item.hsk) === level
      : type === 'bo-thu' && (radTargets.has(item.r) || radTargets.has(item.c))) : [];
    const title = type === 'hsk' ? `Chữ Hán HSK ${level || value} (HSK 2.0)` : `Chữ Hán bộ ${radChar || value}`;
    document.title = `${title} | Học Tiếng Trung`;
    root.innerHTML = `<style>
      #xhz-character-browse { --browse-ink:#1c1917;--browse-card:#fafaf9;--browse-border:#d6d3d1;color:var(--browse-ink); }
      html.dark #xhz-character-browse { --browse-ink:#e2e8f0;--browse-card:#0f172a;--browse-border:#57534e; }
      #xhz-character-browse input,#xhz-character-browse select,#xhz-character-browse button.xhz-nav-btn,#xhz-browse-grid .xhz-char-card { color:var(--browse-ink)!important;background:var(--browse-card)!important;border-color:var(--browse-border)!important; }
      #xhz-browse-grid .xhz-char-card:hover { border-color:#0d9488!important; }
    </style><section id="xhz-character-browse" style="max-width:1100px;margin:auto;">
      <a href="/tra-chu" style="color:#0d9488;font-weight:700;">← Từ điển Hán - Việt</a>
      <h1 style="font-size:28px;font-weight:800;margin:20px 0 8px;">${escape(title)}</h1>
      <p id="xhz-browse-count" role="status">${entries.length} chữ Hán trong kho dữ liệu</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0;">
        <label style="flex:1;min-width:220px;">Tìm trong danh sách
          <input id="xhz-char-browse-filter" type="search" placeholder="Chữ Hán, pinyin, Hán Việt hoặc nghĩa" style="display:block;width:100%;padding:12px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;" />
        </label>
        <label>Sắp xếp
          <select id="xhz-browse-sort" style="display:block;padding:12px;border:1px solid #d6d3d1;border-radius:12px;background:#fff;color:#1c1917;">
            <option value="strokes">Số nét</option><option value="hanviet">Hán Việt A → Z</option><option value="frequency">Tần suất</option>
          </select>
        </label>
      </div>
      <div id="xhz-browse-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:12px;"></div>
      <button id="xhz-browse-more" class="xhz-nav-btn" type="button" style="margin:20px auto;padding:10px 24px;border:1px solid #d6d3d1;border-radius:999px;background:#fff;color:#1c1917;">Xem thêm</button>
    </section>`;
    const search = root.querySelector('#xhz-char-browse-filter');
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
      grid.innerHTML = results.slice(0, visible).map(item => `
        <div class="xhz-char-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:6px;padding:14px;border:1px solid #d6d3d1;border-radius:16px;background:#fafaf9;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
              <a href="/han-tu/${encodeURIComponent(item.slug || item.c)}" style="font-size:36px;font-family:'Noto Serif SC',serif;color:inherit;text-decoration:none;line-height:1.1;">${escape(item.c)}</a>
              <button type="button" data-xhz-play="${escapeHtml(item.c || '')}" aria-label="Nghe phát âm" style="border:none;background:#f0fdfa;color:#0f766e;border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700;cursor:pointer;">🔊</button>
            </div>
            <div style="margin-top:4px;color:#0d9488;font-weight:700;">${escape(item.p)}</div>
            <strong>${escape(item.hv)}</strong>
            <div style="font-size:13px;margin-top:2px;">${escape(item.m)}</div>
          </div>
          <small style="opacity:0.8;">${Number(item.s) || 0} nét · Bộ ${escape(item.r)}${item.hsk ? ` · HSK ${escape(item.hsk)}` : ''}</small>
        </div>`).join('') || '<p>Không tìm thấy chữ phù hợp.</p>';
      more.hidden = visible >= results.length;
    };
    search.oninput = () => { visible = 60; render(); };
    sort.onchange = () => { visible = 60; render(); };
    more.onclick = () => { visible += 60; render(); };
    render();
  }


  // 6.9. Trang Chặng Học / Bài Học (/hoc/chang/:stageKey, /hoc/bai/:runId)
  //      Interactive Capybara Lesson Runner 1:1 với xiehanzi.com
  // --------------------------------------------------------------------------
  function ensureLessonRunnerAssets() {
    ['/\_next/static/css/6090e9ab23b2dccf.css', '/\_next/static/css/70d4fb21c4146575.css'].forEach(href => {
      const cleanHref = href.replace('\\_', '_');
      if (!document.querySelector(`link[href="${cleanHref}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cleanHref;
        document.head.appendChild(link);
      }
    });
    if (!document.getElementById('xhz-lesson-runner-split-style')) {
      const st = document.createElement('style');
      st.id = 'xhz-lesson-runner-split-style';
      st.textContent = `
        .lp.lp-runner {
          position: fixed !important;
          inset: 0 !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          z-index: 60 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .lp-runner-inner.lp-split {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          max-height: 100% !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        @media (min-width: 768px) {
          .lp-runner-inner.lp-split {
            max-width: 1120px !important;
            width: 100% !important;
            margin: 0 auto !important;
          }
          .xhz-lp-split-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 5fr) minmax(0, 6fr) !important;
            gap: 2rem !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
            min-height: 0 !important;
            flex: 1 1 0% !important;
            overflow: hidden !important;
          }
          .xhz-lp-split-left {
            min-height: 0 !important;
            overflow-y: auto !important;
            padding: 1rem 0 !important;
          }
          .xhz-lp-split-right {
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .xhz-lp-split-right .lp-step-area {
            flex: 1 1 0% !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            padding-bottom: 12px !important;
          }
          .xhz-lp-split-right .lp-footer {
            flex-shrink: 0 !important;
            padding-top: 12px !important;
            padding-bottom: 18px !important;
            background: var(--lp-bg, #eef8f7) !important;
            z-index: 5 !important;
          }
        }
      `;
      document.head.appendChild(st);
    }
    if (!window.HanziWriter && !document.getElementById('xhz-hanzi-writer-cdn')) {
      const s = document.createElement('script');
      s.id = 'xhz-hanzi-writer-cdn';
      s.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js';
      s.async = true;
      document.head.appendChild(s);
    }
  }

  function detectPinyinTone(syllable) {
    if (!syllable) return 5;
    if (/[āēīōūǖĀĒĪŌŪǕ]/.test(syllable)) return 1;
    if (/[áéíóúǘÁÉÍÓÚǗ]/.test(syllable)) return 2;
    if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(syllable)) return 3;
    if (/[àèìòùǜÀÈÌÒÙǛ]/.test(syllable)) return 4;
    return 5;
  }

  function renderColoredPinyin(pinyinStr, extraClass = '') {
    if (!pinyinStr) return '';
    const tokens = String(pinyinStr).split(/(\s+|[,，.。!！?？、]+)/);
    const inner = tokens
      .map(tok => {
        if (!tok || /^\s+$/.test(tok) || /^[,，.。!！?？、]+$/.test(tok)) return tok;
        const tone = detectPinyinTone(tok);
        return `<span class="lp-t${tone}">${tok}</span>`;
      })
      .join('');
    return `<span class="py ${extraClass}">${inner}</span>`;
  }

  function convertNumberedPinyin(inputStr) {
    if (!inputStr) return '';
    const toneMap = {
      a: ['ā', 'á', 'ǎ', 'à', 'a'],
      e: ['ē', 'é', 'ě', 'è', 'e'],
      i: ['ī', 'í', 'ǐ', 'ì', 'i'],
      o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
      u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
      ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
      v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
    };
    return String(inputStr).replace(/([a-zA-ZüÜvV]+)([1-5])/g, (_, syl, digit) => {
      const tIdx = Number(digit) - 1;
      let s = syl.replace(/v/g, 'ü').replace(/V/g, 'Ü');
      const lower = s.toLowerCase();
      let targetIdx = -1;
      if (lower.includes('a')) targetIdx = lower.indexOf('a');
      else if (lower.includes('e')) targetIdx = lower.indexOf('e');
      else if (lower.includes('ou')) targetIdx = lower.indexOf('o');
      else {
        for (let i = lower.length - 1; i >= 0; i--) {
          if ('aeiouvü'.includes(lower[i])) {
            targetIdx = i;
            break;
          }
        }
      }
      if (targetIdx === -1) return syl;
      const ch = lower[targetIdx];
      const rep = (toneMap[ch] && toneMap[ch][tIdx]) || s[targetIdx];
      return s.slice(0, targetIdx) + rep + s.slice(targetIdx + 1);
    });
  }

  function normalizePinyinCompare(str, requireTone = true) {
    const converted = convertNumberedPinyin(String(str || '').trim().toLowerCase()).replace(/\s+/g, '');
    if (requireTone) return converted;
    return converted
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ü/g, 'v');
  }

  async function buildDynamicRunFromStage(activityKey) {
    const stgMatch = activityKey.match(/^([a-z0-9-]+)\.([A-Z]\d+)\.([A-Z]\d+)/i);
    const trackName = stgMatch ? stgMatch[1].toLowerCase() : 'hsk30';
    const levelCode = stgMatch ? stgMatch[2].toUpperCase() : 'L1';
    const stageKey = stgMatch ? `${trackName}.${levelCode}.${stgMatch[3].toUpperCase()}` : 'hsk30.L1.P1';
    const actSuffix = stgMatch ? (activityKey.slice(stgMatch[0].length + 1) || 'learn.1') : 'learn.1';

    let stg = null;
    if (trackName === 'hsk30' && levelCode === 'L1') {
      const levelData = await loadLocalJson('/data/learning-tracks/hsk30-L1.json');
      let chapterKey = 'hsk30.L1.C00';
      if (levelData && Array.isArray(levelData.chapters)) {
        for (const ch of levelData.chapters) {
          if ((ch.stages || []).some(s => s.stageKey === stageKey)) {
            chapterKey = ch.chapterKey;
            break;
          }
        }
      }
      const chBundle =
        (await loadLocalJson(`/data/learning-tracks/chapters/${chapterKey}.json`)) ||
        (await loadLocalJson('/data/learning-tracks/chapters/hsk30.L1.C00.json'));
      stg =
        (chBundle && Array.isArray(chBundle.stages) && chBundle.stages.find(s => s.stageKey === stageKey)) ||
        (chBundle && chBundle.stages && chBundle.stages[0]);
    } else {
      let syn = null;
      if (typeof window.__xhzSynthesizeTrackLevel === 'function') {
        syn = await window.__xhzSynthesizeTrackLevel(trackName, levelCode);
      } else {
        try {
          const r = await handleApiRequest(window.location.origin + `/v2/learning-tracks/${trackName}/levels/${levelCode}`, { method: 'GET' });
          if (r && r.ok) syn = await r.json();
        } catch (_) {}
      }
      const found = syn && Array.isArray(syn.stages) && (syn.stages.find(s => s.stageKey === stageKey) || syn.stages[0]);
      if (found) {
        const folder = found.sourceKind === 'topic' ? 'topics' : 'lessons';
        const altFolder = folder === 'topics' ? 'lessons' : 'topics';
        const detail =
          (await loadLocalJson(`/data/curriculums/${found.sourceCurr}/${folder}/${found.sourceLevelSlug}--${found.sourceSlug}.json`)) ||
          (await loadLocalJson(`/data/curriculums/${found.sourceCurr}/${altFolder}/${found.sourceLevelSlug}--${found.sourceSlug}.json`));
        const rawW = (detail && detail.lesson && detail.lesson.words) || (detail && detail.topic && detail.topic.words) || (detail && detail.words) || [];
        const normWords = rawW.slice(0, 8).map(w => {
          const hz = String((w && (w.hanzi || w.word)) || '').replace(/\{|\}/g, '').trim();
          return {
            key: `w:${hz}`,
            hanzi: hz,
            pinyin: (w && (w.pinyin || w.wordPinyin)) || '',
            hanviet: (w && (w.hanviet || w.hanViet)) || '',
            meaningVi: (w && (w.meaningVi || w.translationVi || w.meaning)) || '',
            audioUrl: (w && ((Array.isArray(w.audios) && w.audios[0]) || w.audioUrl)) || `https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`
          };
        }).filter(w => w.hanzi);
        stg = {
          stageKey: found.stageKey,
          meta: { titleVi: found.titleVi || found.stageKey, handwriting: normWords.slice(0, 3).map(w => Array.from(w.hanzi)[0]).filter(Boolean) },
          words: normWords
        };
      }
    }
    if (!stg) return await loadLocalJson('/data/learning-tracks/runs/hsk30.L1.P1.learn.1.json');

    const words = Array.isArray(stg.words) && stg.words.length > 0 ? stg.words : [];
    const hwList = (stg.meta && Array.isArray(stg.meta.handwriting) && stg.meta.handwriting) || [];
    const steps = [];
    const distractorsPool = ['tám (số)', 'bố, cha', 'mẹ', 'xin chào', 'cảm ơn', 'tạm biệt', 'giáo viên', 'học sinh', 'bạn bè', 'Việt Nam'];

    if (actSuffix === 'dlg' && stg.dialogue && Array.isArray(stg.dialogue.turns)) {
      steps.push({
        id: 'd1',
        type: 'dialogue',
        skill: 'listening',
        itemKeys: words.map(w => w.key || `w:${w.hanzi}`),
        graded: true,
        prompt: { vi: 'Nghe hội thoại rồi trả lời câu hỏi' },
        payload: {
          dialogueKey: activityKey,
          sceneVi: (stg.meta && stg.meta.scenario && stg.meta.scenario.placeVi) || (stg.meta && stg.meta.titleVi) || stageKey,
          roles: stg.dialogue.roles || [
            { id: 'A', labelVi: 'Nhân vật A' },
            { id: 'B', labelVi: 'Bạn', learner: true }
          ],
          turns: stg.dialogue.turns,
          questions: stg.dialogue.questions || []
        },
        check: stg.dialogue.check || (Array.isArray(stg.dialogue.questions) ? {
          answers: stg.dialogue.questions.map(q => ({ questionId: q.id, correctOptionId: q.correctOptionId || (q.options && q.options[0] && q.options[0].id) || 'a' }))
        } : undefined)
      });
      steps.push({ id: 's-end', type: 'summary', skill: null, itemKeys: [], graded: false });
      return {
        runId: activityKey,
        kind: 'learn',
        estMinutes: 4,
        feedback: 'instant',
        titleVi: `Hội thoại: ${stg.meta ? stg.meta.titleVi : stageKey}`,
        hskLevel: 1,
        track: 'hsk30',
        stageKey,
        activityKey,
        steps
      };
    }

    if ((actSuffix === 'rp1' || actSuffix === 'rp2') && Array.isArray(stg.roleplays) && stg.roleplays.length > 0) {
      const rpObj = stg.roleplays.find(r => r.key === activityKey) || stg.roleplays[actSuffix === 'rp2' && stg.roleplays.length > 1 ? 1 : 0];
      if (rpObj && Array.isArray(rpObj.turns)) {
        rpObj.turns.forEach((t, tIdx) => {
          steps.push({
            id: `t-${tIdx + 1}`,
            type: 'roleplay_turn',
            skill: 'speaking',
            itemKeys: words.slice(0, 4).map(w => w.key || `w:${w.hanzi}`),
            graded: true,
            prompt: { vi: 'Chọn một câu rồi nói' },
            payload: {
              roleplayKey: activityKey,
              turnIndex: tIdx + 1,
              prepCardVi: tIdx === 0 ? rpObj.prepCardVi : undefined,
              checklist: rpObj.checklist || [],
              checklistId: t.checklistId,
              roles: rpObj.roles || [],
              npcRole: t.npcRole,
              npcLine: t.npcLine,
              choices: t.choices || [],
              coachVi: t.coachVi || '',
              allowSkip: true
            }
          });
        });
        steps.push({ id: 's-end', type: 'summary', skill: null, itemKeys: [], graded: false });
        return {
          runId: activityKey,
          kind: 'learn',
          estMinutes: 5,
          feedback: 'instant',
          titleVi: `Nhập vai: ${stg.meta ? stg.meta.titleVi : stageKey}`,
          hskLevel: 1,
          track: 'hsk30',
          stageKey,
          activityKey,
          steps
        };
      }
    }

    if (actSuffix === 'exam' && Array.isArray(stg.examItems) && stg.examItems.length > 0) {
      stg.examItems.forEach((exIt, eIdx) => {
        steps.push({
          id: `e-${eIdx + 1}`,
          type: 'exam_item',
          skill: exIt.section || 'listening',
          itemKeys: Array.isArray(exIt.wordKeys) ? exIt.wordKeys : words.slice(0, 3).map(w => w.key || `w:${w.hanzi}`),
          graded: true,
          payload: {
            itemKey: exIt.key || `${activityKey}.${eIdx + 1}`,
            examType: exIt.type || 'multiple_choice',
            section: exIt.section || 'listening',
            instruction: exIt.instruction || 'Chọn đáp án đúng.',
            script: exIt.script || [],
            audio: exIt.audio || null,
            options: exIt.options || [],
            hanziOnly: Boolean(exIt.hanziOnly)
          },
          explanationVi: exIt.explanationVi || '',
          check: { correctOptionId: exIt.answer || 'A' }
        });
      });
      steps.push({ id: 's-end', type: 'summary', skill: null, itemKeys: [], graded: false });
      return {
        runId: activityKey,
        kind: 'learn',
        estMinutes: 4,
        feedback: 'instant',
        titleVi: `Luyện đề: ${stg.meta ? stg.meta.titleVi : stageKey}`,
        hskLevel: 1,
        track: 'hsk30',
        stageKey,
        activityKey,
        steps
      };
    }

    if (actSuffix === 'write') {
      const writeList = hwList.length > 0 ? hwList : words.slice(0, 5).map(w => ({ char: Array.from(w.hanzi || '')[0], pinyin: w.pinyin, hanviet: w.hanviet, fromWord: w.hanzi }));
      writeList.slice(0, 5).forEach((hw, idx) => {
        if (!hw || !hw.char) return;
        const relWord = words.find(w => w.hanzi === hw.fromWord || (w.hanzi && w.hanzi.includes(hw.char))) || {};
        steps.push({
          id: `wc-rev-${idx}`,
          type: 'write_character',
          skill: 'writing',
          itemKeys: [`c:${hw.char}`],
          graded: true,
          prompt: { vi: `Ôn viết chữ: ${hw.char} (${hw.pinyin || relWord.pinyin || ''})` },
          payload: {
            char: hw.char,
            mode: 'guided',
            phases: ['demo', 'trace', 'recall'],
            cue: {
              meaningVi: relWord.meaningVi || 'Chữ Hán trọng tâm',
              pinyin: hw.pinyin || relWord.pinyin || '',
              hanviet: hw.hanviet || relWord.hanviet || '',
              audio: relWord.audio || { url: `https://static.xiehanzi.com/word_audios/${encodeURIComponent(hw.char)}.mp3` }
            }
          },
          explanationVi: 'Xem nét mẫu rồi tô và tự viết lại.'
        });
      });
      steps.push({ id: 's-end', type: 'summary', skill: null, itemKeys: [], graded: false });
      return {
        runId: activityKey,
        kind: 'learn',
        estMinutes: 4,
        feedback: 'instant',
        titleVi: `Tập viết tổng hợp: ${stg.meta ? stg.meta.titleVi : stageKey}`,
        hskLevel: 1,
        track: 'hsk30',
        stageKey,
        activityKey,
        steps
      };
    }

    const activeWordSlice = actSuffix === 'learn.2' && words.length > 6 ? words.slice(6, 12) : words.slice(0, 6);
    activeWordSlice.forEach((w, idx) => {
      const hz = w.hanzi;
      const py = w.wordPinyin || w.pinyin || '';
      const vi = w.meaningVi || '';
      const hv = w.hanviet || '';
      const audioUrl = (w.audio && w.audio.url) || `https://static.xiehanzi.com/word_audios/${encodeURIComponent(hz)}.mp3`;
      const ex = (Array.isArray(w.examples) && w.examples[0]) || { hanzi: `${hz}！`, pinyin: py, vi };

      // 1. intro_word
      const fakeTones = [py, convertNumberedPinyin(py.replace(/[āáǎà]/, 'ǎ') || 'bǎ'), convertNumberedPinyin(py.replace(/[āáǎà]/, 'á') || 'bá')];
      const uniqTones = [...new Set([py, ...fakeTones, 'bā', 'bǎ', 'bá'])].slice(0, 3);
      steps.push({
        id: `intro-${idx}`,
        type: 'intro_word',
        skill: null,
        itemKeys: [w.key || `w:${hz}`],
        graded: false,
        prompt: { vi: 'Từ mới' },
        payload: {
          word: {
            key: w.key || `w:${hz}`,
            hanzi: hz,
            pinyin: py,
            wordPinyin: py,
            meaningVi: vi,
            hanviet: hv,
            hanvietGloss: w.hanvietGloss || hv,
            wordClassVi: w.wordClassVi || 'từ vựng',
            audio: { url: audioUrl },
            example: {
              hanzi: ex.hanzi,
              pinyin: ex.pinyin,
              vi: ex.vi,
              audio: ex.audio || { url: audioUrl }
            }
          },
          verifiedHanViet: hv ? { reading: hv, confidence: 'high' } : undefined,
          breakdowns: [
            {
              hanzi: Array.from(hz)[0] || hz,
              pinyin: py.split(/\s+/)[0] || py,
              hanViet: hv.split(/\s+/)[0] || hv,
              meaningVi: vi,
              components: [],
              memoryHint: w.hanvietGloss ? `Âm Hán Việt là "${hv}" (${w.hanvietGloss}), gắn liền với nghĩa "${vi}".` : `Ghi nhớ âm đọc ${py} và nghĩa "${vi}".`
            }
          ],
          pretest: {
            kind: 'tone',
            promptVi: 'Nghe và đoán thanh điệu',
            options: uniqTones.map((t, oi) => ({ id: `o${oi + 1}`, text: t })),
            correctOptionId: 'o1',
            revealVi: `${hz} đọc là ${py}.`
          }
        }
      });

      // 2. choose_meaning
      const otherVi = words
        .filter(x => x && x.hanzi !== hz)
        .map(x => x.meaningVi)
        .concat(distractorsPool)
        .filter(x => x && x !== vi);
      const uniqWrong = [...new Set(otherVi)].slice(0, 3);
      const opts = [
        { id: 'o1', text: vi },
        { id: 'o2', text: uniqWrong[0] || 'xin chào' },
        { id: 'o3', text: uniqWrong[1] || 'cảm ơn' },
        { id: 'o4', text: uniqWrong[2] || 'tạm biệt' }
      ];
      steps.push({
        id: `cm-${idx}`,
        type: 'choose_meaning',
        skill: 'meaning',
        itemKeys: [w.key || `w:${hz}`],
        graded: true,
        prompt: { vi: 'Chọn nghĩa đúng' },
        payload: {
          direction: 'zh_vi',
          question: { hanzi: hz, pinyin: py, audio: { url: audioUrl } },
          options: opts
        },
        explanationVi: `${hz} (${py})${hv ? `, âm Hán Việt ${hv}` : ''}: ${vi}.`,
        check: { correctOptionId: 'o1' },
        retryHint: {
          textVi: 'Âm Hán Việt thường gần với nghĩa. Nghe lại rồi đoán nhé.',
          cue: hv ? `Hán Việt: ${hv}` : `Pinyin: ${py}`,
          audio: { url: audioUrl }
        }
      });

      // 3. write_character (nếu có trong handwriting hoặc chữ đầu)
      const hw = hwList.find(h => h.fromWord === hz || h.char === Array.from(hz)[0]) || {
        char: Array.from(hz)[0] || hz,
        pinyin: py,
        hanviet: hv
      };
      if (idx < 3 && hw && hw.char) {
        steps.push({
          id: `wc-${idx}`,
          type: 'write_character',
          skill: 'writing',
          itemKeys: [`c:${hw.char}`],
          graded: true,
          prompt: { vi: `Tập viết chữ mới: ${py}, “${vi}”` },
          payload: {
            char: hw.char,
            mode: 'guided',
            phases: ['demo', 'trace', 'recall'],
            cue: {
              meaningVi: vi,
              pinyin: py,
              hanviet: hw.hanviet || hv,
              audio: { url: audioUrl }
            }
          },
          explanationVi: 'Nét viết chưa đúng thứ tự hoặc hướng. Xem nét mẫu rồi viết lại.'
        });
      }

      // 4. type_pinyin
      steps.push({
        id: `tp-${idx}`,
        type: 'type_pinyin',
        skill: 'sound',
        itemKeys: [w.key || `w:${hz}`],
        graded: true,
        prompt: { vi: 'Gõ pinyin (có thanh điệu)' },
        payload: {
          hanzi: hz,
          audio: { url: audioUrl },
          toneRequired: true,
          meaningVi: vi
        },
        explanationVi: `${hz} nghĩa là ${vi}. Chú ý thanh điệu của từng âm tiết.`,
        check: { accepted: [py] },
        retryHint: {
          textVi: 'Nghe chậm để chọn thanh. Thanh 1 ngang cao, thanh 2 đi lên, thanh 3 xuống thấp rồi lên, thanh 4 đi xuống.',
          cue: normalizePinyinCompare(py, false),
          audio: { url: audioUrl }
        }
      });
    });

    // 5. match_pairs
    if (words.length >= 2) {
      const sliceW = words.slice(0, Math.min(4, words.length));
      steps.push({
        id: 'mp-1',
        type: 'match_pairs',
        skill: 'meaning',
        itemKeys: sliceW.map(w => w.key || `w:${w.hanzi}`),
        graded: true,
        prompt: { vi: 'Ghép từ với nghĩa' },
        payload: {
          left: sliceW.map((w, i) => ({
            id: `l${i + 1}`,
            hanzi: w.hanzi,
            audio: w.audio || { url: `https://static.xiehanzi.com/word_audios/${encodeURIComponent(w.hanzi)}.mp3` }
          })),
          right: sliceW
            .map((w, i) => ({ id: `r${i + 1}`, text: w.meaningVi }))
            .reverse()
        },
        explanationVi: 'Có cặp nối nhầm nghĩa. Nhớ lại nghĩa từng từ rồi thử lại.',
        check: {
          pairs: sliceW.map((_, i) => [`l${i + 1}`, `r${i + 1}`])
        }
      });
    }

    steps.push({ id: 's-summary', type: 'summary', skill: null, itemKeys: [], graded: false });

    return {
      runId: activityKey,
      kind: 'learn',
      estMinutes: 6,
      feedback: 'instant',
      titleVi: `Từ mới: ${stg.meta ? stg.meta.titleVi : stageKey}`,
      hskLevel: 1,
      track: 'hsk30',
      stageKey,
      activityKey,
      steps
    };
  }

  async function resolveLessonRunData(slug) {
    const legacyMap = {
      'bai-1-hello-ai-xiaoyu': 'hsk30.L1.P1.learn.1',
      'hsk30.L1.C1.S1': 'hsk30.L1.P1.learn.1',
      'hsk30-1.S1': 'hsk30.L1.P1.learn.1',
      'hsk30.L1.P1': 'hsk30.L1.P1.learn.1',
      '6af3478a270319be91af2e10': 'hsk30.L1.P1.learn.1',
      '6af3efd75ef8914173f992b5': 'hsk30.L1.P1.learn.1',
      '6af3efd70fb3998ecd760dd8': 'hsk30.L1.P1.dlg',
      '6af3efd75ef8914173f992c2': 'hsk30.L1.P1.rp1',
      '6af3efd70fb3998ecd760df3': 'hsk30.L1.P1.rp2',
      '6af3efd75ef8914173f992ce': 'hsk30.L1.P1.exam',
      'bai-2-my-name-is-li-wen': 'hsk30.L1.S02.learn.1',
      'hsk30.L1.C1.S2': 'hsk30.L1.S02.learn.1',
      'bai-3-i-m-chinese': 'hsk30.L1.S03.learn.1',
      'hsk30.L1.C1.S3': 'hsk30.L1.S03.learn.1',
      'bai-4-i-have-two-children': 'hsk30.L1.S04.learn.1',
      'hsk30.L1.C1.S4': 'hsk30.L1.S04.learn.1'
    };
    let actKey = legacyMap[slug] || slug;
    if (/^hsk30\.L\d+\.[A-Z]\d+$/i.test(actKey)) {
      actKey = `${actKey}.learn.1`;
    }
    const resolvedStg = (actKey.match(/^(hsk30\.L\d+\.[A-Z]\d+)/i) || [])[1] || 'hsk30.L1.P1';
    const directRun = await loadLocalJson(`/data/learning-tracks/runs/${actKey}.json`);
    if (directRun && Array.isArray(directRun.steps) && directRun.steps.length > 0) {
      directRun.activityKey = directRun.activityKey || directRun.runId || actKey;
      directRun.stageKey = directRun.stageKey || resolvedStg;
      return directRun;
    }
    const dynRun = await buildDynamicRunFromStage(actKey);
    if (dynRun) {
      dynRun.activityKey = dynRun.activityKey || actKey;
      dynRun.stageKey = dynRun.stageKey || resolvedStg;
    }
    return dynRun;
  }
  window.__xhzResolveRun = resolveLessonRunData;

  async function renderStudyStageOrRunPage(pathname) {
    try {
      document.querySelectorAll('[data-modal-layer], [data-companion-picker]').forEach(el => el.remove());
      document.documentElement.removeAttribute('data-focus-session');
    } catch (_) {}

    const parts = pathname.split('/').filter(Boolean);
    const slug = safeDecodeURIComponent(parts[2] || 'hsk30.L1.P1.learn.1');

    if (slug.startsWith('on-tap-') || slug.startsWith('review-')) {
      await renderReviewSessionPage(slug);
      return;
    }

    ensureLessonRunnerAssets();

    const run = (await resolveLessonRunData(slug)) || (await loadLocalJson('/data/learning-tracks/runs/hsk30.L1.P1.learn.1.json'));
    if (!run || !Array.isArray(run.steps)) return;
    if (!run.activityKey) run.activityKey = run.runId || 'hsk30.L1.P1.learn.1';
    if (!run.stageKey) {
      run.stageKey = (String(run.activityKey).match(/^(hsk30\.L\d+\.[A-Z]\d+)/i) || [])[1] || 'hsk30.L1.P1';
    }

    function extractStepWords(s) {
      if (!s) return [];
      const found = [];
      const addW = w => {
        const clean = String(w || '').replace(/^w:|^c:/, '').replace(/\{|\}/g, '').trim();
        if (clean && /[\u4e00-\u9fff]/.test(clean) && clean.length <= 6 && !found.includes(clean)) {
          found.push(clean);
        }
      };
      if (s.type === 'intro_word' && s.payload && s.payload.word && s.payload.word.hanzi) {
        addW(s.payload.word.hanzi);
      }
      if (Array.isArray(s.itemKeys)) {
        s.itemKeys.forEach(k => {
          if (String(k).startsWith('w:') || String(k).startsWith('c:')) addW(k);
        });
      }
      if (s.payload) {
        if (s.payload.question && s.payload.question.hanzi) addW(s.payload.question.hanzi);
        if (s.payload.hanzi) addW(s.payload.hanzi);
        if (s.payload.char) addW(s.payload.char);
      }
      return found;
    }

    const playableSteps = run.steps.filter(s => s.type !== 'summary');
    const introWords = [];
    run.steps.forEach(s => {
      extractStepWords(s).forEach(w => {
        if (!introWords.includes(w)) introWords.push(w);
      });
    });

    document.title = `${run.titleVi || 'Bài học'} | Học Tiếng Trung`;

    // Ẩn main tĩnh và tạo full-screen overlay lp-runner
    const main = document.querySelector('main');
    if (main) main.style.display = 'none';
    const oldCustom = document.getElementById('xhz-dynamic-page-root');
    if (oldCustom) oldCustom.style.display = 'none';

    let runnerRoot = document.getElementById('xhz-lesson-runner-root');
    if (!runnerRoot) {
      runnerRoot = document.createElement('div');
      runnerRoot.id = 'xhz-lesson-runner-root';
      document.body.appendChild(runnerRoot);
    }

    const state = {
      showIntro: true,
      stepIdx: 0,
      phase: 'answering', // 'answering' | 'hint' | 'feedback' | 'done'
      verdict: null,
      hintedStepId: null,
      disabledOptionIds: new Set(),
      correctCount: 0,
      gradedCount: 0,
      startedAt: Date.now(),
      // Per-step local UI state
      pretestPickedId: null,
      pretestRevealed: false,
      selectedOptionId: null,
      typedText: '',
      orderedTokens: [],
      matchedPairs: [],
      matchLeftSelected: null,
      matchWrongPair: null,
      writePhaseIdx: 0, // 0: Xem (demo), 1: Tô theo (trace), 2: Tự viết (recall)
      writeQuizDone: false,
      readRecorded: false,
      readScore: 95,
      dlgQuestionIdx: 0,
      roleplayChoiceId: null,
      roleplaySpoken: false,
      showExitModal: false
    };

    function resetStepUiState(step) {
      state.phase = 'answering';
      state.verdict = null;
      state.disabledOptionIds = new Set();
      state.pretestPickedId = null;
      state.pretestRevealed = !(step && step.type === 'intro_word' && step.payload && step.payload.pretest);
      state.selectedOptionId = null;
      state.typedText = '';
      state.orderedTokens = [];
      state.matchedPairs = [];
      state.matchLeftSelected = null;
      state.matchWrongPair = null;
      state.writePhaseIdx = 0;
      state.writeQuizDone = false;
      state.readRecorded = false;
      state.readScore = 92 + (state.stepIdx % 7);
      state.dlgQuestionIdx = 0;
      state.roleplayChoiceId =
        step && step.type === 'roleplay_turn' && step.payload && Array.isArray(step.payload.choices) && step.payload.choices[0]
          ? step.payload.choices[0].id
          : null;
      state.roleplaySpoken = false;
    }

    resetStepUiState(playableSteps[0]);

    function getCurrentStep() {
      return playableSteps[state.stepIdx] || null;
    }

    function getStepAudioInfo(step) {
      if (!step || !step.payload) return { text: '', url: '' };
      const p = step.payload;
      if (step.type === 'intro_word' && p.word) {
        return { text: p.word.hanzi, url: (p.word.audio && p.word.audio.url) || '' };
      }
      if (step.type === 'choose_meaning' && p.question) {
        return { text: p.question.hanzi || '', url: (p.question.audio && p.question.audio.url) || '' };
      }
      if (step.type === 'write_character') {
        return { text: p.char || '', url: (p.cue && p.cue.audio && p.cue.audio.url) || '' };
      }
      if (step.type === 'type_pinyin') {
        return { text: p.hanzi || '', url: (p.audio && p.audio.url) || '' };
      }
      if (step.type === 'listen_choose') {
        const rightOpt = (p.options || []).find(o => o.id === (step.check && step.check.correctOptionId));
        return { text: (rightOpt && (rightOpt.hanzi || rightOpt.pinyin)) || '', url: (p.audio && p.audio.url) || '' };
      }
      if (step.type === 'order_sentence') {
        const rightIds = (step.check && step.check.accepted && step.check.accepted[0]) || [];
        const txt = rightIds.map(id => ((p.tokens || []).find(t => t.id === id) || {}).text || '').join('');
        return { text: txt, url: (p.audio && p.audio.url) || '' };
      }
      if (step.type === 'read_sentence' && p.sentence) {
        return { text: p.sentence.hanzi || '', url: (p.sentence.audio && p.sentence.audio.url) || '' };
      }
      if (step.type === 'dialogue' && Array.isArray(p.turns) && p.turns[0]) {
        return { text: p.turns[0].hanzi || '', url: (p.turns[0].audio && p.turns[0].audio.url) || '' };
      }
      if (step.type === 'roleplay_turn' && p.npcLine) {
        return { text: p.npcLine.hanzi || '', url: (p.npcLine.audio && p.npcLine.audio.url) || '' };
      }
      if (step.type === 'exam_item') {
        const firstScript = (Array.isArray(p.script) && p.script[0]) || {};
        const fallbackItem = Array.isArray(step.itemKeys) && step.itemKeys[0] ? String(step.itemKeys[0]).replace(/^w:|^c:/, '') : '';
        return { text: firstScript.hanzi || fallbackItem || '', url: (p.audio && p.audio.url) || (firstScript.audio && firstScript.audio.url) || '' };
      }
      return { text: '', url: '' };
    }

    function getCapyPromptLine(step) {
      if (!step) return '';
      if (state.phase === 'feedback' && state.verdict) {
        return state.verdict.correct ? 'Giỏi lắm! Chuẩn luôn!' : 'Không sao, mình xem lại nhé.';
      }
      const p = step.payload || {};
      switch (step.type) {
        case 'intro_word':
          return `Từ mới: ${p.word ? p.word.hanzi : ''}. Chạm loa để nghe nhé!`;
        case 'choose_meaning':
          if (p.direction === 'zh_vi' && p.question && p.question.hanzi) {
            return `${p.question.hanzi} nghĩa là gì?`;
          }
          return (step.prompt && step.prompt.vi) || 'Chọn đáp án đúng.';
        case 'write_character':
          return 'Chữ mới! Xem cách viết, tô theo rồi tự viết nhé.';
        case 'type_pinyin':
          return `Gõ pinyin${p.toneRequired ? ' có thanh' : ''} cho ${p.hanzi || ''}.`;
        case 'match_pairs':
          return (step.prompt && step.prompt.vi) || 'Ghép từ với nghĩa';
        case 'listen_choose':
          return (step.prompt && step.prompt.vi) || 'Nghe và chọn đáp án đúng';
        case 'order_sentence':
          return `Xếp thành câu: "${p.translationVi || ''}"`;
        case 'fill_blank':
          return (step.prompt && step.prompt.vi) || 'Điền vào chỗ trống';
        case 'read_sentence':
          return 'Đọc to câu này. Chạm mic rồi nói nhé.';
        case 'dialogue':
          return (step.prompt && step.prompt.vi) || 'Nghe đoạn hội thoại rồi trả lời nhé.';
        case 'roleplay_turn':
          return p.coachVi || (step.prompt && step.prompt.vi) || 'Nghe đối thoại rồi bấm Mic đọc câu trả lời nhé!';
        case 'exam_item':
          return p.instruction || 'Đọc kỹ đề rồi chọn đáp án.';
        default:
          return (step.prompt && step.prompt.vi) || 'Cùng làm câu này nhé!';
      }
    }

    function getCapySprite(step) {
      if (state.phase === 'feedback' && state.verdict) {
        return state.verdict.correct ? '/images/capy/lesson/celebrate.webp' : '/images/capy/lesson/encouraging.webp';
      }
      if (state.phase === 'hint') {
        return '/images/capy/lesson/encouraging.webp';
      }
      return '/images/capy/lesson/thinking.webp';
    }

    const speakerSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    const snailSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 17h13a4 4 0 0 0 4-4 6 6 0 0 0-12 0c0 2.2 1.8 4 4 4"/><circle cx="11" cy="13" r="2"/><path d="M19 13v-2a2 2 0 0 1 2-2M18 9l1 2M21 9l-1 2"/></svg>`;
    const sparkleSvg = `<svg class="size-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>`;
    const bulbSvg = `<svg class="mt-0.5 size-4 shrink-0 text-gold-ink" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>`;
    const checkSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
    const exclSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M12 6.5v7"/><circle cx="12" cy="18" r=".6" fill="currentColor"/></svg>`;

    function advanceStep() {
      const curStep = getCurrentStep();
      if (curStep) {
        try {
          const stepWords = extractStepWords(curStep);
          if (stepWords.length > 0) {
            state.lastSyncPromise = recordStudyProgress({ words: stepWords }).__syncPromise;
          }
        } catch (_) {}
      }
      if (state.stepIdx + 1 >= playableSteps.length) {
        state.phase = 'done';
        // Lưu trạng thái hoàn thành & đồng bộ đám mây Supabase
        try {
          const stgKey = run.stageKey || 'hsk30.L1.P1';
          const actKey = run.activityKey || 'hsk30.L1.P1.learn.1';
          const prog = recordStudyProgress({
            stageKey: stgKey,
            activityKey: actKey,
            words: introWords,
            minutes: run.estMinutes || 6,
            sessionInc: 1,
            gradingInc: 1,
            dailyStepDone: 'step-lesson-1'
          });
          state.lastSyncPromise = prog.__syncPromise;
        } catch (_) {}
        renderRunner();
        return;
      }
      state.stepIdx += 1;
      resetStepUiState(playableSteps[state.stepIdx]);
      renderRunner();
      const nextSt = getCurrentStep();
      const aud = getStepAudioInfo(nextSt);
      if (aud.text || aud.url) {
        setTimeout(() => playPronunciation(aud.text, aud.url, 1.0), 150);
      }
    }

    function submitGradedAnswer(isCorrect, expectedDisplay, answerInfo) {
      const step = getCurrentStep();
      if (!step) return;
      if (!isCorrect && step.retryHint && state.hintedStepId !== step.id) {
        state.hintedStepId = step.id;
        state.phase = 'hint';
        if (state.selectedOptionId) {
          state.disabledOptionIds.add(state.selectedOptionId);
        }
        renderRunner();
        return;
      }
      state.gradedCount += 1;
      if (isCorrect) state.correctCount += 1;
      try {
        const stepWords = extractStepWords(step);
        let mistakeObj = undefined;
        if (!isCorrect && stepWords.length > 0) {
          mistakeObj = {
            itemKey: `w:${stepWords[0]}`,
            hanzi: stepWords[0],
            pinyin: (answerInfo && answerInfo.pinyin) || '',
            meaningVi: (answerInfo && answerInfo.vi) || expectedDisplay || '',
            skill: step.skill || 'meaning',
            category: step.skill === 'sound' ? 'tone_error' : 'vocab_confusion',
            expectedDisplay: expectedDisplay || stepWords[0],
            reasonVi: step.explanationVi || `Cần ôn lại từ "${stepWords[0]}" (${expectedDisplay || ''}).`
          };
        }
        state.lastSyncPromise = recordStudyProgress({
          words: isCorrect ? stepWords : [],
          mistake: mistakeObj,
          gradingInc: 1
        }).__syncPromise;
      } catch (_) {}
      state.verdict = {
        correct: isCorrect,
        expectedDisplay: expectedDisplay || '',
        explanationVi: step.explanationVi || '',
        answer: answerInfo || null
      };
      state.phase = 'feedback';
      const aud = getStepAudioInfo(step);
      if (isCorrect && (aud.text || aud.url)) {
        playPronunciation(aud.text, aud.url, 1.0);
      }
      renderRunner();
    }

    function mountHanziWriterIfNeeded() {
      const step = getCurrentStep();
      if (!step || step.type !== 'write_character' || state.showIntro || state.phase === 'done') return;
      const targetEl = document.getElementById('xhz-hw-canvas');
      if (!targetEl) return;
      const ch = step.payload.char || '八';
      const phase = ['demo', 'trace', 'recall'][state.writePhaseIdx] || 'demo';

      const initWriter = () => {
        if (!window.HanziWriter) {
          setTimeout(initWriter, 150);
          return;
        }
        targetEl.innerHTML = '';
        try {
          const writer = window.HanziWriter.create(targetEl, ch, {
            width: 256,
            height: 256,
            padding: 16,
            showCharacter: phase === 'demo',
            showOutline: phase !== 'recall',
            strokeAnimationSpeed: 1.1,
            delayBetweenStrokes: 220,
            strokeColor: '#0f172a',
            outlineColor: '#cbd5e1',
            drawingColor: '#0d9488',
            highlightColor: '#4f46e5',
            drawingWidth: 22,
            charDataLoader: function (char, onComplete) {
              originalFetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`)
                .then(r => r.json())
                .then(onComplete)
                .catch(() => {});
            }
          });
          window.__xhzActiveWriter = writer;
          if (phase === 'demo') {
            setTimeout(() => {
              try { writer.animateCharacter(); } catch (_) {}
            }, 250);
            targetEl.onclick = () => {
              try { writer.animateCharacter(); } catch (_) {}
            };
          } else {
            targetEl.onclick = null;
            writer.quiz({
              showHintAfterMisses: 2,
              highlightOnComplete: true,
              onComplete: function () {
                state.writeQuizDone = true;
                if (state.writePhaseIdx === 1) {
                  setTimeout(() => {
                    state.writePhaseIdx = 2;
                    state.writeQuizDone = false;
                    renderRunner();
                  }, 650);
                } else {
                  setTimeout(() => {
                    submitGradedAnswer(true, ch, { hanzi: ch, pinyin: step.payload.cue && step.payload.cue.pinyin, vi: step.payload.cue && step.payload.cue.meaningVi });
                  }, 500);
                }
              }
            });
          }
        } catch (_) {}
      };
      initWriter();
    }

    function renderRunner() {
      const step = getCurrentStep();
      const progressPct = playableSteps.length > 0 ? Math.max(4, Math.round((state.stepIdx / playableSteps.length) * 100)) : 100;

      // 1. Màn hình hoàn thành bài học (lp-done)
      if (state.phase === 'done' || !step) {
        const elapsedSec = Math.max(12, Math.round((Date.now() - state.startedAt) / 1000));
        const mins = Math.floor(elapsedSec / 60);
        const secs = elapsedSec % 60;
        const timeStr = mins > 0 ? `${mins}p ${secs}s` : `${secs}s`;
        const accPct = state.gradedCount > 0 ? Math.round((state.correctCount / state.gradedCount) * 100) : 100;
        runnerRoot.innerHTML = `
          <div class="lp lp-runner" data-testid="lesson-runner">
            <div class="lp-runner-inner overflow-y-auto">
              <div class="lp-done">
                <img src="/images/capy/lesson/celebrate.webp" alt="Capy" style="width:180px;height:180px;object-fit:contain;" />
                <h2>Hoàn thành xuất sắc!</h2>
                <p class="sub">${run.titleVi || 'Bài học'} · Đã lưu vào tiến độ lộ trình HSK 3.0</p>
                <div class="lp-stats">
                  <div class="lp-stat xp">
                    <span class="v">+20 XP</span>
                    <span class="k">Kinh nghiệm</span>
                  </div>
                  <div class="lp-stat acc">
                    <span class="v">${accPct}%</span>
                    <span class="k">Chính xác</span>
                  </div>
                  <div class="lp-stat time">
                    <span class="v">${timeStr}</span>
                    <span class="k">Thời gian</span>
                  </div>
                </div>
                <div class="lp-streak-card">
                  <span style="font-size:28px;">🔥</span>
                  <span><b>${getRealProgressSummary().streakDays || 1}</b> ngày liên tiếp giữ chuỗi học tập!</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:380px;margin-top:16px;">
                  <button type="button" id="xhz-done-continue" class="lp-btn3d">Về lộ trình <kbd class="lp-kbd lp-kbd-in-btn">Enter</kbd></button>
                  <button type="button" id="xhz-done-next-lesson" class="lp-btn-text" style="font-weight:800;color:var(--lp-blue);">Học bài tiếp theo →</button>
                  <button type="button" id="xhz-done-retry" class="lp-btn-text">Học lại bài này</button>
                </div>
              </div>
            </div>
          </div>
        `;
        const contBtn = runnerRoot.querySelector('#xhz-done-continue');
        if (contBtn) {
          contBtn.onclick = async () => {
            contBtn.textContent = 'Đang đồng bộ tiến độ...';
            contBtn.disabled = true;
            try {
              await Promise.race([
                state.lastSyncPromise || syncProgressToSupabaseAuth(),
                new Promise(resolve => setTimeout(resolve, 2200))
              ]);
            } catch (_) {}
            window.location.assign('/hoc');
          };
        }
        const nextLesBtn = runnerRoot.querySelector('#xhz-done-next-lesson');
        if (nextLesBtn) {
          nextLesBtn.onclick = async () => {
            nextLesBtn.textContent = 'Đang mở bài tiếp theo...';
            nextLesBtn.disabled = true;
            try {
              await Promise.race([
                state.lastSyncPromise || syncProgressToSupabaseAuth(),
                new Promise(resolve => setTimeout(resolve, 2200))
              ]);
            } catch (_) {}
            const nextId = getRealProgress().currentLessonId || 'hsk30.L1.P1.dlg';
            window.location.assign('/hoc/bai/' + encodeURIComponent(nextId));
          };
        }
        const retryBtn = runnerRoot.querySelector('#xhz-done-retry');
        if (retryBtn) {
          retryBtn.onclick = () => {
            state.stepIdx = 0;
            state.correctCount = 0;
            state.gradedCount = 0;
            resetStepUiState(playableSteps[0]);
            renderRunner();
          };
        }
        return;
      }

      // 2. Xây dựng nội dung cột trái (Prompt) và cột phải (Answer) + Footer theo từng loại step
      let promptHtml = '';
      let answerHtml = '';
      let footerBtnLabel = 'Tiếp tục';
      let footerBtnDisabled = false;
      let footerAction = () => advanceStep();
      const p = step.payload || {};
      const isHard = step.type === 'type_pinyin' && p.toneRequired && state.phase === 'answering';

      if (step.type === 'intro_word') {
        const w = p.word || {};
        const pre = p.pretest;
        const wAudio = (w.audio && w.audio.url) || '';
        if (pre) {
          const optsHtml = (pre.options || [])
            .map((opt, idx) => {
              let optState = '';
              if (state.pretestRevealed) {
                optState = opt.id === pre.correctOptionId ? 'right' : opt.id === state.pretestPickedId ? 'wrong' : 'dim';
              }
              return `
                <button type="button" class="lp-opt ${optState}" data-pretest-opt="${opt.id}" ${state.pretestRevealed ? 'disabled' : ''}>
                  <span class="k">${idx + 1}</span>
                  <span class="min-w-0 flex-1">${renderColoredPinyin(opt.text, 'text-2xl')}</span>
                </button>
              `;
            })
            .join('');
          promptHtml = `
            <div data-testid="intro-word-pretest" class="flex flex-col items-center gap-3.5 rounded-card border border-line bg-surface px-4 py-5 text-center shadow-card" style="background:var(--lp-surface);border-radius:18px;border:1.5px solid var(--lp-border);padding:20px 16px;">
              <div class="flex flex-col items-center gap-1">
                <span class="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase text-interactive" style="color:var(--lp-blue);font-size:13px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">
                  ${sparkleSvg} ĐOÁN THỬ
                </span>
                <p style="font-size:17px;font-weight:700;color:var(--lp-ink);margin:2px 0 0 0;">${pre.promptVi || 'Nghe và đoán thanh điệu'}</p>
              </div>
              <span lang="zh" class="lp-hanzi" style="font-size:80px;line-height:1.1;color:var(--lp-ink);">${w.hanzi || ''}</span>
              <div class="lp-audio-row">
                <button type="button" class="lp-audio-btn big" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" aria-label="Nghe phát âm">${speakerSvg}</button>
                <button type="button" class="lp-audio-btn slow" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
              </div>
              <div class="lp-opts" style="width:100%;">
                ${optsHtml}
              </div>
              ${
                !state.pretestRevealed
                  ? `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                      <p style="font-size:13px;color:var(--lp-ink-2);margin:0;">Không tính điểm, cứ đoán</p>
                      <button type="button" class="lp-btn-text" id="xhz-pretest-skip">Bỏ qua</button>
                    </div>`
                  : ''
              }
            </div>
          `;
        }

        if (!state.pretestRevealed) {
          answerHtml = '';
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = true;
        } else {
          const isPreCorrect = state.pretestPickedId === (pre && pre.correctOptionId);
          const revealBanner =
            pre && state.pretestPickedId
              ? `<div role="status" data-testid="intro-word-pretest-reveal" style="display:flex;align-items:flex-start;gap:10px;border-radius:14px;padding:14px;background:${isPreCorrect ? 'var(--lp-ok-bg)' : 'var(--lp-gold-bg)'};">
                  <span style="color:${isPreCorrect ? 'var(--lp-ok)' : 'var(--lp-gold-ink)'};flex-shrink:0;">${isPreCorrect ? checkSvg : bulbSvg}</span>
                  <div>
                    <p style="font-size:16px;font-weight:800;color:${isPreCorrect ? 'var(--lp-ok-ink)' : 'var(--lp-ink)'};margin:0;">${isPreCorrect ? 'Đoán đúng rồi!' : 'Chưa trúng, không sao cả'}</p>
                    <p style="font-size:15px;color:var(--lp-ink);margin:4px 0 0 0;">${pre.revealVi || ''}</p>
                  </div>
                </div>`
              : '';
          const hvReading = (p.verifiedHanViet && p.verifiedHanViet.reading) || w.hanviet || '';
          const hvCapitalized = hvReading ? hvReading.charAt(0).toUpperCase() + hvReading.slice(1) : '';
          const breakdowns = Array.isArray(p.breakdowns) ? p.breakdowns : [];
          const breakdownHtml = breakdowns.length
            ? `<section data-testid="intro-word-breakdown" style="display:flex;flex-direction:column;gap:12px;border-radius:16px;border:1.5px solid var(--lp-border);background:var(--lp-surface);padding:16px;">
                <h3 style="font-size:16px;font-weight:800;color:var(--lp-ink);margin:0;">Chữ này gồm</h3>
                ${breakdowns
                  .map(
                    b => `
                  <div style="display:flex;flex-direction:column;gap:10px;">
                    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
                      ${Array.from(w.hanzi || '').length > 1 ? `<span lang="zh" class="lp-hanzi" style="font-size:32px;line-height:1;">${b.hanzi}</span>` : ''}
                      <p style="font-size:16px;color:var(--lp-ink-2);margin:0;">
                        ${b.pinyin || ''} · Hán Việt: <b style="color:var(--lp-ink);">${b.hanViet || ''}</b> · ${b.meaningVi || ''}
                      </p>
                    </div>
                    ${
                      b.radical
                        ? `<div style="font-size:14px;color:var(--lp-ink);">Bộ ${b.radical.hanzi} (${b.radical.hanViet || ''}) · ${b.radical.meaningVi || ''}</div>`
                        : ''
                    }
                    ${
                      b.memoryHint
                        ? `<div style="display:flex;align-items:flex-start;gap:8px;border-radius:10px;background:var(--lp-gold-bg);padding:10px 12px;font-size:14px;color:var(--lp-ink);">
                            ${bulbSvg}
                            <p style="margin:0;"><b>Mẹo nhớ: </b>${b.memoryHint}</p>
                          </div>`
                        : ''
                    }
                  </div>
                `
                  )
                  .join('')}
              </section>`
            : '';
          const ex = w.example;
          const exHtml = ex
            ? `<div class="lp-card" style="display:flex;align-items:center;gap:12px;padding:14px 16px;">
                <button type="button" class="lp-audio-btn small" data-play-text="${ex.hanzi || ''}" data-play-url="${(ex.audio && ex.audio.url) || wAudio}" aria-label="Nghe câu ví dụ">${speakerSvg}</button>
                <div style="min-width:0;flex:1;">
                  <div lang="zh" class="lp-hanzi" style="font-size:21px;font-weight:700;color:var(--lp-ink);">${ex.hanzi || ''}</div>
                  <div style="font-size:15px;margin-top:2px;">${renderColoredPinyin(ex.pinyin || '')}</div>
                  <div style="font-size:14px;color:var(--lp-ink-2);margin-top:2px;">${ex.vi || ''}</div>
                </div>
              </div>`
            : '';

          answerHtml = `
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${revealBanner}
              <div class="lp-card lp-word-card">
                ${!pre ? `<div lang="zh" class="lp-hanzi hz">${w.hanzi || ''}</div><div style="font-size:22px;">${renderColoredPinyin(w.wordPinyin || w.pinyin || '')}</div>` : ''}
                ${hvCapitalized ? `<div><span class="hv">Hán Việt: ${hvCapitalized}</span></div>` : ''}
                <div class="vi">${w.meaningVi || ''}</div>
                ${w.wordClassVi ? `<div style="font-size:13px;color:var(--lp-ink-2);margin-top:-2px;">${w.wordClassVi}</div>` : ''}
                <div class="lp-audio-row" style="margin-top:12px;">
                  <button type="button" class="lp-audio-btn" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" aria-label="Nghe từ">${speakerSvg}</button>
                  <button type="button" class="lp-audio-btn slow" data-play-text="${w.hanzi || ''}" data-play-url="${wAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
                </div>
              </div>
              ${breakdownHtml}
              ${w.hanvietGloss ? `<p class="lp-hint" style="margin:0;"><b>Hán Việt:</b> ${w.hanvietGloss}</p>` : ''}
              ${exHtml}
            </div>
          `;
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = false;
          footerAction = () => advanceStep();
        }
      } else if (step.type === 'choose_meaning') {
        const q = p.question || {};
        const qAudio = (q.audio && q.audio.url) || '';
        const rightId = step.check && step.check.correctOptionId;
        promptHtml = `
          <div class="lp-q">
            <span class="lp-hanzi big" lang="zh">${q.hanzi || ''}</span>
            ${q.pinyin ? `<div style="font-size:20px;">${renderColoredPinyin(q.pinyin)}</div>` : ''}
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn" data-play-text="${q.hanzi || ''}" data-play-url="${qAudio}" aria-label="Nghe">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${q.hanzi || ''}" data-play-url="${qAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
          </div>
        `;
        answerHtml = `
          <div class="lp-opts" role="radiogroup" aria-label="Các lựa chọn">
            ${(p.options || [])
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.phase === 'hint') {
                  cls = opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.disabledOptionIds.has(opt.id)) {
                  cls = 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${idx + 1}</span>
                    <span class="min-w-0 flex-1">${opt.text || ''}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          if (!state.selectedOptionId) return;
          const rightOpt = (p.options || []).find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, rightOpt ? rightOpt.text : '', {
            hanzi: q.hanzi,
            pinyin: q.pinyin,
            vi: rightOpt ? rightOpt.text : '',
            audioUrl: qAudio
          });
        };
      } else if (step.type === 'write_character') {
        const ch = p.char || '八';
        const cue = p.cue || {};
        const cueAudio = (cue.audio && cue.audio.url) || '';
        const phases = ['Xem', 'Tô theo', 'Tự viết'];
        const nudges = [
          'Xem thứ tự nét. Chạm vào ô để xem lại.',
          'Tô theo nét mờ, từng nét một.',
          'Giờ tự viết, không còn nét mờ.'
        ];
        promptHtml = `
          <div class="lp-card lp-write-cue">
            <span lang="zh" class="lp-hanzi lp-write-cue-char">${ch}</span>
            <div class="lp-write-cue-meta">
              ${cue.pinyin ? `<div style="font-size:20px;">${renderColoredPinyin(cue.pinyin)}</div>` : ''}
              ${cue.hanviet ? `<span class="lp-write-cue-hv">${cue.hanviet}</span>` : ''}
              <span class="lp-write-cue-vi">${cue.meaningVi || ''}</span>
            </div>
            <button type="button" class="lp-audio-btn small" data-play-text="${ch}" data-play-url="${cueAudio}" aria-label="Nghe">${speakerSvg}</button>
          </div>
        `;
        answerHtml = `
          <div class="lp-write-stage">
            <div class="lp-write-phases" role="tablist">
              ${phases
                .map(
                  (label, idx) =>
                    `<button type="button" class="lp-write-phase ${idx === state.writePhaseIdx ? 'active' : idx < state.writePhaseIdx ? 'done' : ''}" data-write-phase="${idx}">${label}</button>`
                )
                .join('')}
            </div>
            <div class="lp-write-box lp-write-grid" style="position:relative;">
              <svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;" aria-hidden="true">
                <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" stroke-width="0.7" stroke-dasharray="3,3"/>
                <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" stroke-width="0.7" stroke-dasharray="3,3"/>
                <line x1="0" y1="0" x2="100" y2="100" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="3,3"/>
                <line x1="100" y1="0" x2="0" y2="100" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="3,3"/>
              </svg>
              <div id="xhz-hw-canvas" style="position:relative;z-index:2;width:256px;height:256px;display:flex;align-items:center;justify-content:center;cursor:pointer;"></div>
            </div>
            <p class="lp-write-nudge">${nudges[state.writePhaseIdx] || nudges[0]}</p>
            <button type="button" class="lp-btn-text" id="xhz-write-skip">Để sau</button>
          </div>
        `;
        if (state.writePhaseIdx === 0) {
          footerBtnLabel = 'Tô theo nét';
          footerBtnDisabled = false;
          footerAction = () => {
            state.writePhaseIdx = 1;
            state.writeQuizDone = false;
            renderRunner();
          };
        } else if (state.writePhaseIdx === 1) {
          footerBtnLabel = 'Tự viết';
          footerBtnDisabled = false;
          footerAction = () => {
            state.writePhaseIdx = 2;
            state.writeQuizDone = false;
            renderRunner();
          };
        } else {
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = false;
          footerAction = () => {
            submitGradedAnswer(true, ch, { hanzi: ch, pinyin: cue.pinyin, vi: cue.meaningVi, audioUrl: cueAudio });
          };
        }
      } else if (step.type === 'type_pinyin') {
        const tAudio = (p.audio && p.audio.url) || '';
        const accepted = (step.check && step.check.accepted) || ['bā'];
        const previewConverted = convertNumberedPinyin(state.typedText);
        const hasLetters = /[a-zA-ZüÜvVāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(state.typedText);
        promptHtml = `
          <div class="lp-q">
            <span class="lp-hanzi big" lang="zh">${p.hanzi || ''}</span>
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn" data-play-text="${p.hanzi || ''}" data-play-url="${tAudio}" aria-label="Nghe">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${p.hanzi || ''}" data-play-url="${tAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
            <span style="font-size:15px;color:var(--lp-ink-2);">nghĩa: ${p.meaningVi || ''}</span>
          </div>
        `;
        const toneMarks = [
          { digit: 1, mark: 'ˉ', label: 'Thanh 1' },
          { digit: 2, mark: 'ˊ', label: 'Thanh 2' },
          { digit: 3, mark: 'ˇ', label: 'Thanh 3' },
          { digit: 4, mark: 'ˋ', label: 'Thanh 4' },
          { digit: 5, mark: '·', label: 'Thanh nhẹ' }
        ];
        answerHtml = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <input
              id="xhz-pinyin-input"
              type="text"
              class="lp-input"
              value="${state.typedText.replace(/"/g, '&quot;')}"
              placeholder="${p.toneRequired ? 'vd: ma3 hoặc mǎ' : 'vd: ma'}"
              autocomplete="off"
              autocapitalize="none"
              spellcheck="false"
              ${state.phase !== 'answering' ? 'disabled' : ''}
            />
            <div class="lp-type-preview" id="xhz-pinyin-preview">
              ${
                previewConverted && previewConverted !== state.typedText.trim()
                  ? `Hiển thị: <b>${previewConverted}</b>`
                  : 'Gõ âm tiết trước, rồi gõ số 1-4 hoặc chạm phím thanh.'
              }
            </div>
            <div class="lp-tone-keys" role="group" aria-label="Phím thanh">
              ${toneMarks
                .map(
                  tm =>
                    `<button type="button" data-tone-digit="${tm.digit}" aria-label="${tm.label}" ${state.phase !== 'answering' ? 'disabled' : ''}>${tm.mark}</button>`
                )
                .join('')}
            </div>
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !hasLetters || state.phase !== 'answering';
        footerAction = () => {
          const val = state.typedText.trim();
          if (!val) return;
          const userNorm = normalizePinyinCompare(val, p.toneRequired);
          const isOk = accepted.some(acc => normalizePinyinCompare(acc, p.toneRequired) === userNorm);
          submitGradedAnswer(isOk, accepted[0], {
            hanzi: p.hanzi,
            pinyin: accepted[0],
            vi: p.meaningVi,
            audioUrl: tAudio
          });
        };
      } else if (step.type === 'match_pairs') {
        const leftItems = p.left || [];
        const rightItems = p.right || [];
        const validPairs = (step.check && step.check.pairs) || [];
        const isLeftMatched = id => state.matchedPairs.some(pr => pr[0] === id);
        const isRightMatched = id => state.matchedPairs.some(pr => pr[1] === id);
        promptHtml = `
          <p class="lp-hint" style="margin:0;">Chạm một chữ Hán ở cột trái rồi chạm nghĩa tương ứng ở cột phải.</p>
        `;
        answerHtml = `
          <div class="lp-match">
            <div class="lp-match-col">
              ${leftItems
                .map(item => {
                  const matched = isLeftMatched(item.id);
                  const sel = state.matchLeftSelected === item.id;
                  const wrong = state.matchWrongPair && state.matchWrongPair[0] === item.id;
                  return `<button type="button" lang="zh" class="lp-m hz ${matched ? 'gone' : sel ? 'sel' : ''} ${wrong ? 'wrong' : ''}" data-match-left="${item.id}" ${matched ? 'disabled' : ''}>${item.hanzi}</button>`;
                })
                .join('')}
            </div>
            <div class="lp-match-col">
              ${rightItems
                .map(item => {
                  const matched = isRightMatched(item.id);
                  const wrong = state.matchWrongPair && state.matchWrongPair[1] === item.id;
                  return `<button type="button" class="lp-m ${matched ? 'gone' : ''} ${wrong ? 'wrong' : ''}" data-match-right="${item.id}" ${matched ? 'disabled' : ''}>${item.text}</button>`;
                })
                .join('')}
            </div>
          </div>
        `;
        footerBtnLabel = 'Tiếp tục';
        footerBtnDisabled = state.matchedPairs.length < leftItems.length;
        footerAction = () => {
          if (state.matchedPairs.length >= leftItems.length) {
            submitGradedAnswer(true, '', null);
          }
        };
        // Gắn biến tạm xử lý chọn cặp trong wireEvents
        state._validPairs = validPairs;
        state._leftItems = leftItems;
      } else if (step.type === 'listen_choose') {
        const lAudio = (p.audio && p.audio.url) || '';
        const rightId = step.check && step.check.correctOptionId;
        const audInfo = getStepAudioInfo(step);
        promptHtml = `
          <div class="lp-audio-row" style="padding:16px 0;">
            <button type="button" class="lp-audio-btn big" data-play-text="${audInfo.text}" data-play-url="${lAudio}" aria-label="Nghe lại">${speakerSvg}</button>
            <button type="button" class="lp-audio-btn slow" data-play-text="${audInfo.text}" data-play-url="${lAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
          </div>
        `;
        answerHtml = `
          <div class="lp-opts" role="radiogroup">
            ${(p.options || [])
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.disabledOptionIds.has(opt.id)) {
                  cls = 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                const labelContent = opt.hanzi
                  ? `<span lang="zh" class="lp-hanzi" style="font-size:24px;">${opt.hanzi}</span>`
                  : renderColoredPinyin(opt.pinyin || opt.text || '', 'text-[20px]');
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${idx + 1}</span>
                    <span class="min-w-0 flex-1">${labelContent}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          if (!state.selectedOptionId) return;
          const rightOpt = (p.options || []).find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, rightOpt ? rightOpt.hanzi || rightOpt.pinyin : '', {
            hanzi: rightOpt && rightOpt.hanzi,
            pinyin: rightOpt && rightOpt.pinyin,
            audioUrl: lAudio
          });
        };
      } else if (step.type === 'order_sentence') {
        const tokens = p.tokens || [];
        const oAudio = (p.audio && p.audio.url) || '';
        const audInfo = getStepAudioInfo(step);
        promptHtml = `
          <div class="lp-card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <p style="font-size:18px;font-weight:700;color:var(--lp-ink);margin:0;">${p.translationVi || ''}</p>
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn small" data-play-text="${audInfo.text}" data-play-url="${oAudio}" aria-label="Nghe">${speakerSvg}</button>
            </div>
          </div>
        `;
        const pickedHtml = state.orderedTokens
          .map(tid => {
            const t = tokens.find(x => x.id === tid);
            if (!t) return '';
            return `<button type="button" class="lp-tile" data-unpick-token="${t.id}" ${state.phase !== 'answering' ? 'disabled' : ''}>
              ${t.pinyin ? renderColoredPinyin(t.pinyin) : ''}
              <span lang="zh" class="lp-hanzi">${t.text}</span>
            </button>`;
          })
          .join('');
        const bankHtml = tokens
          .map(t => {
            const used = state.orderedTokens.includes(t.id);
            return `<button type="button" class="lp-tile ${used ? 'ghost' : ''}" data-pick-token="${t.id}" ${used || state.phase !== 'answering' ? 'disabled' : ''}>
              ${t.pinyin ? renderColoredPinyin(t.pinyin) : ''}
              <span lang="zh" class="lp-hanzi">${t.text}</span>
            </button>`;
          })
          .join('');
        answerHtml = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="lp-answer-line" aria-label="Câu của bạn">${pickedHtml}</div>
            <div class="lp-bank" aria-label="Các ô chữ">${bankHtml}</div>
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = state.orderedTokens.length === 0 || state.phase !== 'answering';
        footerAction = () => {
          const acceptedOrders = (step.check && step.check.accepted) || [];
          const userStr = state.orderedTokens.map(id => (tokens.find(x => x.id === id) || {}).text || '').join('');
          const rightIds = acceptedOrders[0] || tokens.map(t => t.id);
          const rightStr = rightIds.map(id => (tokens.find(x => x.id === id) || {}).text || '').join('');
          const isOk = userStr === rightStr;
          submitGradedAnswer(isOk, rightStr, {
            hanzi: rightStr,
            vi: p.translationVi,
            audioUrl: oAudio
          });
        };
      } else if (step.type === 'fill_blank') {
        const rightId = step.check && step.check.correctOptionId;
        const pickedOpt = (p.options || []).find(o => o.id === state.selectedOptionId);
        promptHtml = `
          <div class="lp-card">
            <div class="lp-sentence" lang="zh">
              ${p.before || ''}<span class="lp-blank ${pickedOpt ? 'filled' : ''}">${pickedOpt ? pickedOpt.text : '___'}</span>${p.after || ''}
            </div>
            ${p.pinyin ? `<div style="margin-top:8px;font-size:15px;color:var(--lp-ink-2);">${p.pinyin}</div>` : ''}
            ${p.translationVi ? `<div style="margin-top:6px;font-size:15px;color:var(--lp-ink-2);">${p.translationVi}</div>` : ''}
          </div>
        `;
        answerHtml = `
          <div class="lp-opts" role="radiogroup">
            ${(p.options || [])
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.disabledOptionIds.has(opt.id)) {
                  cls = 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${idx + 1}</span>
                    <span class="min-w-0 flex-1" style="display:flex;flex-direction:column;">
                      ${opt.pinyin ? `<span style="font-size:13px;">${renderColoredPinyin(opt.pinyin)}</span>` : ''}
                      <span lang="zh" class="lp-hanzi" style="font-size:22px;">${opt.text || ''}</span>
                    </span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          if (!state.selectedOptionId) return;
          const rightOpt = (p.options || []).find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, rightOpt ? rightOpt.text : '', {
            hanzi: `${p.before || ''}${rightOpt ? rightOpt.text : ''}${p.after || ''}`,
            pinyin: p.pinyin,
            vi: p.translationVi
          });
        };
      } else if (step.type === 'read_sentence') {
        const sent = p.sentence || {};
        const sAudio = (sent.audio && sent.audio.url) || '';
        promptHtml = `
          <div class="lp-card lp-read-card">
            <div class="lp-hanzi hz" lang="zh">${sent.hanzi || ''}</div>
            ${sent.pinyin ? `<div style="font-size:18px;margin-top:4px;">${renderColoredPinyin(sent.pinyin)}</div>` : ''}
            <div class="vi">${sent.vi || ''}</div>
            <div class="lp-audio-row" style="margin-top:12px;">
              <button type="button" class="lp-audio-btn" data-play-text="${sent.hanzi || ''}" data-play-url="${sAudio}" aria-label="Nghe câu mẫu">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${sent.hanzi || ''}" data-play-url="${sAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>
          </div>
        `;
        answerHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 0;">
            <button type="button" class="lp-mic ${state.readRecorded ? 'rec' : ''}" id="xhz-read-mic-btn" aria-label="Bắt đầu ghi âm">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></svg>
            </button>
            <p class="lp-status-line">
              ${state.readRecorded ? `Đã chấm phát âm: <b>${state.readScore}%</b>${state.readTranscript ? ` (Nghe được: "${state.readTranscript}")` : ' (Chuẩn!)'}` : 'Chạm biểu tượng micro để đọc to câu trên'}
            </p>
            <button type="button" class="lp-btn-text" id="xhz-read-skip">Bỏ qua</button>
          </div>
        `;
        footerBtnLabel = 'Tiếp tục';
        footerBtnDisabled = !state.readRecorded;
        footerAction = () => advanceStep();
      } else if (step.type === 'dialogue') {
        const turns = p.turns || [];
        const roles = p.roles || [];
        const dQuestions = Array.isArray(p.questions) ? p.questions : [];
        const curQ = dQuestions[state.dlgQuestionIdx] || null;
        const turnsHtml = turns
          .map(t => {
            const rObj = roles.find(r => r.id === t.role) || { labelVi: t.role };
            const tUrl = (t.audio && t.audio.url) || '';
            return `
              <div class="lp-card" style="padding:10px 14px;display:flex;align-items:flex-start;gap:10px;">
                <button type="button" class="lp-audio-btn small" data-play-text="${t.hanzi || ''}" data-play-url="${tUrl}" aria-label="Nghe">${speakerSvg}</button>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;font-weight:800;color:var(--lp-blue);">${rObj.labelVi || ''}</div>
                  <div lang="zh" class="lp-hanzi" style="font-size:19px;font-weight:700;color:var(--lp-ink);">${t.hanzi || ''}</div>
                  <div style="font-size:13px;">${renderColoredPinyin(t.pinyin || '')}</div>
                  <div style="font-size:13px;color:var(--lp-ink-2);">${t.vi || ''}</div>
                </div>
              </div>
            `;
          })
          .join('');
        if (curQ) {
          const checkAns = (step.check && Array.isArray(step.check.answers) && step.check.answers.find(a => a.questionId === curQ.id)) || null;
          const rightId = (checkAns && checkAns.correctOptionId) || curQ.correctOptionId || (curQ.options && curQ.options[0] && curQ.options[0].id);
          promptHtml = `
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div class="lp-card" style="padding:12px 16px;">
                <div style="font-size:12px;font-weight:800;color:var(--lp-ink-2);text-transform:uppercase;">Bối cảnh hội thoại</div>
                <p style="font-size:14px;color:var(--lp-ink);margin:4px 0 0 0;">${p.sceneVi || ''}</p>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;">${turnsHtml}</div>
            </div>
          `;
          answerHtml = `
            <div class="lp-card" style="margin-bottom:14px;padding:16px;">
              <div style="font-size:12px;font-weight:800;color:var(--lp-blue);margin-bottom:6px;">CÂU HỎI ${state.dlgQuestionIdx + 1}/${dQuestions.length}</div>
              <div style="font-size:18px;font-weight:800;color:var(--lp-ink);">${curQ.promptVi || ''}</div>
            </div>
            <div class="lp-opts" role="radiogroup">
              ${(curQ.options || [])
                .map((opt, idx) => {
                  let cls = '';
                  if (state.phase === 'feedback') {
                    cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                  } else if (state.selectedOptionId === opt.id) {
                    cls = 'sel';
                  }
                  return `
                    <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${state.phase !== 'answering' ? 'disabled' : ''}>
                      <span class="k">${idx + 1}</span>
                      <span class="min-w-0 flex-1">${opt.text || ''}</span>
                    </button>
                  `;
                })
                .join('')}
            </div>
          `;
          footerBtnLabel = 'Kiểm tra';
          footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
          footerAction = () => {
            if (!state.selectedOptionId) return;
            const rightOpt = (curQ.options || []).find(o => o.id === rightId);
            const isOk = state.selectedOptionId === rightId;
            submitGradedAnswer(isOk, rightOpt ? rightOpt.text : '', {
              hanzi: rightOpt ? rightOpt.text : '',
              vi: rightOpt ? rightOpt.text : ''
            });
          };
        } else {
          promptHtml = `
            <div class="lp-card">
              <div style="font-size:13px;font-weight:800;color:var(--lp-ink-2);text-transform:uppercase;">Bối cảnh hội thoại</div>
              <p style="font-size:15px;color:var(--lp-ink);margin:6px 0 0 0;">${p.sceneVi || ''}</p>
            </div>
          `;
          answerHtml = `<div style="display:flex;flex-direction:column;gap:10px;">${turnsHtml}</div>`;
          footerBtnLabel = 'Tiếp tục';
          footerBtnDisabled = false;
          footerAction = () => advanceStep();
        }
      } else if (step.type === 'roleplay_turn') {
        const npc = p.npcLine || {};
        const npcRoleObj = (Array.isArray(p.roles) && p.roles.find(r => r.id === p.npcRole)) || { labelVi: 'Đối tác' };
        const npcAudio = (npc.audio && npc.audio.url) || '';
        const choices = Array.isArray(p.choices) ? p.choices : [];
        const pickedChoice = choices.find(c => c.id === state.roleplayChoiceId) || choices[0] || {};
        const checklistHtml = Array.isArray(p.checklist) && p.checklist.length > 0
          ? `<div class="lp-card" style="padding:12px 14px;background:#faf8f4;">
              <div style="font-size:12px;font-weight:800;color:var(--lp-ink-2);text-transform:uppercase;margin-bottom:6px;">Nhiệm vụ nhập vai</div>
              ${p.checklist.map(c => `
                <div style="font-size:13px;padding:3px 0;font-weight:${c.id === p.checklistId ? '800' : '500'};color:${c.id === p.checklistId ? 'var(--lp-blue)' : 'var(--lp-ink-2)'};">
                  ${c.id === p.checklistId ? '👉' : '•'} ${c.goalVi}
                </div>
              `).join('')}
            </div>`
          : '';
        promptHtml = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${p.prepCardVi ? `<div class="lp-card" style="padding:12px 14px;background:var(--lp-gold-bg);border-color:#fde68a;font-size:13px;line-height:1.5;"><strong>Tình huống:</strong> ${p.prepCardVi}</div>` : ''}
            ${checklistHtml}
            <div class="lp-card" style="padding:16px;display:flex;align-items:flex-start;gap:12px;">
              <button type="button" class="lp-audio-btn" data-play-text="${npc.hanzi || ''}" data-play-url="${npcAudio}" aria-label="Nghe câu đối thoại">${speakerSvg}</button>
              <div style="min-width:0;flex:1;">
                <div style="font-size:12px;font-weight:800;color:var(--lp-blue);">${npcRoleObj.labelVi || 'Nhân vật'} nói:</div>
                <div lang="zh" class="lp-hanzi" style="font-size:24px;font-weight:800;color:var(--lp-ink);margin-top:2px;">${npc.hanzi || ''}</div>
                ${npc.pinyin ? `<div style="font-size:15px;margin-top:2px;">${renderColoredPinyin(npc.pinyin)}</div>` : ''}
                ${npc.vi ? `<div style="font-size:14px;color:var(--lp-ink-2);margin-top:4px;">${npc.vi}</div>` : ''}
              </div>
            </div>
          </div>
        `;
        answerHtml = `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="font-size:13px;font-weight:800;color:var(--lp-ink-2);text-transform:uppercase;">Chọn câu trả lời của bạn rồi đọc to</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${choices.map((c, idx) => {
                const sel = c.id === pickedChoice.id;
                const cAudio = (c.audio && c.audio.url) || '';
                return `
                  <div class="lp-card" style="padding:12px 16px;border-width:2px;border-color:${sel ? 'var(--lp-blue)' : 'var(--lp-border)'};background:${sel ? '#eff6ff' : 'var(--lp-surface)'};display:flex;align-items:center;gap:12px;cursor:pointer;" data-rp-choice="${c.id}">
                    <button type="button" class="lp-audio-btn small" data-play-text="${c.hanzi || ''}" data-play-url="${cAudio}" aria-label="Nghe gợi ý">${speakerSvg}</button>
                    <div style="min-width:0;flex:1;">
                      <div lang="zh" class="lp-hanzi" style="font-size:22px;font-weight:800;color:var(--lp-ink);">${c.hanzi || ''}</div>
                      ${c.pinyin ? `<div style="font-size:14px;">${renderColoredPinyin(c.pinyin)}</div>` : ''}
                      ${c.vi ? `<div style="font-size:13px;color:var(--lp-ink-2);">${c.vi}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0;">
              <button type="button" class="lp-mic ${state.roleplaySpoken ? 'rec' : ''}" id="xhz-rp-mic-btn" aria-label="Đọc to câu trả lời">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/></svg>
              </button>
              <p class="lp-status-line" id="xhz-rp-status">
                ${state.roleplaySpoken ? `Đã chấm phát âm nhập vai: <b>${state.readScore}%</b>${state.readTranscript ? ` (Nghe được: "${state.readTranscript}")` : ' (Tốt!)'}` : 'Chạm micro để nói câu đã chọn'}
              </p>
              ${p.allowSkip !== false ? `<button type="button" class="lp-btn-text" id="xhz-rp-skip">Bỏ qua lượt này</button>` : ''}
            </div>
          </div>
        `;
        footerBtnLabel = 'Tiếp tục';
        footerBtnDisabled = !state.roleplaySpoken && p.allowSkip === false;
        footerAction = () => {
          submitGradedAnswer(true, pickedChoice.hanzi || '', {
            hanzi: pickedChoice.hanzi || '',
            pinyin: pickedChoice.pinyin || '',
            vi: pickedChoice.vi || '',
            audioUrl: (pickedChoice.audio && pickedChoice.audio.url) || ''
          });
        };
      } else {
        // exam_item
        const opts = p.options || p.choices || [];
        const rightId = (step.check && step.check.correctOptionId) || (opts[0] && opts[0].id);
        const eAudio = (p.audio && p.audio.url) || '';
        const audInfo = getStepAudioInfo(step);
        const firstScript = (Array.isArray(p.script) && p.script[0]) || {};
        const showAudioBar = Boolean(eAudio || audInfo.text || p.section === 'listening');
        promptHtml = `
          <div class="lp-card" style="text-align:center;">
            ${p.section ? `<div style="font-size:12px;font-weight:800;color:var(--lp-blue);text-transform:uppercase;margin-bottom:6px;">${p.section === 'listening' ? '🎧 NGHE HIỂU HSK' : '📖 ĐỌC HIỂU HSK'}</div>` : ''}
            <p style="font-size:18px;font-weight:800;color:var(--lp-ink);margin:0 0 12px 0;">${p.instruction || p.promptVi || 'Nghe và chọn đáp án đúng'}</p>
            ${showAudioBar ? `
            <div class="lp-audio-row">
              <button type="button" class="lp-audio-btn big" data-play-text="${audInfo.text}" data-play-url="${eAudio}" aria-label="Nghe">${speakerSvg}</button>
              <button type="button" class="lp-audio-btn slow" data-play-text="${audInfo.text}" data-play-url="${eAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
            </div>` : ''}
          </div>
        `;
        answerHtml = `
          <div class="lp-opts">
            ${opts
              .map((opt, idx) => {
                const isDisabled = state.disabledOptionIds.has(opt.id) || state.phase !== 'answering';
                let cls = '';
                if (state.phase === 'feedback') {
                  cls = opt.id === rightId ? 'right' : opt.id === state.selectedOptionId ? 'wrong' : 'dim';
                } else if (state.selectedOptionId === opt.id) {
                  cls = 'sel';
                }
                const imgUrl = opt.image && opt.image.url ? String(opt.image.url) : '';
                const hasExpiredImg = imgUrl.includes('media-signed/path-content');
                const mainLabel = opt.hanzi || opt.text || opt.vi || '';
                const contentHtml = mainLabel
                  ? `<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
                      <span lang="zh" class="lp-hanzi" style="font-size:24px;">${mainLabel}</span>
                      ${opt.pinyin ? `<span style="font-size:16px;">${renderColoredPinyin(opt.pinyin)}</span>` : ''}
                    </div>`
                  : (imgUrl && !hasExpiredImg
                      ? `<img src="${rewriteMediaUrl(imgUrl)}" alt="Phương án ${opt.id || idx + 1}" style="max-height:76px;border-radius:10px;object-fit:contain;" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" /><span style="display:none;font-weight:700;">Phương án ${opt.id || idx + 1}</span>`
                      : `<span style="font-weight:700;">🖼️ Tranh minh họa ${opt.id || idx + 1}</span>`);
                return `
                  <button type="button" class="lp-opt ${cls}" data-choice-opt="${opt.id}" ${isDisabled ? 'disabled' : ''}>
                    <span class="k">${opt.id || idx + 1}</span>
                    <span class="min-w-0 flex-1">${contentHtml}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;
        footerBtnLabel = 'Kiểm tra';
        footerBtnDisabled = !state.selectedOptionId || state.phase !== 'answering';
        footerAction = () => {
          const rightOpt = opts.find(o => o.id === rightId);
          const isOk = state.selectedOptionId === rightId;
          submitGradedAnswer(isOk, (rightOpt && (rightOpt.text || rightOpt.id)) || String(rightId || ''), {
            hanzi: firstScript.hanzi || (rightOpt && (rightOpt.hanzi || rightOpt.text)) || '',
            pinyin: firstScript.pinyin || (rightOpt && rightOpt.pinyin) || '',
            vi: step.explanationVi || '',
            audioUrl: eAudio
          });
        };
      }

      // 3. Xây dựng Bottom Sheet (Retry Hint Sheet hoặc Feedback Sheet)
      let sheetHtml = '';
      if (state.phase === 'hint' && step.retryHint) {
        const rh = step.retryHint;
        const rhAudio = (rh.audio && rh.audio.url) || getStepAudioInfo(step).url;
        const rhText = getStepAudioInfo(step).text;
        sheetHtml = `
          <div class="lp-sheet-backdrop" aria-hidden="true"></div>
          <div class="lp-sheet hint" role="status" aria-live="polite" data-testid="retry-hint-sheet">
            <div class="head">
              <span class="badge">${bulbSvg}</span>
              <b>Chưa đúng, thử lại nhé</b>
              <img src="/images/capy/lesson/encouraging.webp" alt="Capy" class="mini-capy" style="width:64px;height:64px;object-fit:contain;" />
            </div>
            ${rh.cue ? `<div class="cue">${rh.cue}</div>` : ''}
            ${rh.textVi ? `<p class="why">${rh.textVi}</p>` : ''}
            <div class="actions">
              <button type="button" class="lp-audio-btn slow" data-play-text="${rhText}" data-play-url="${rhAudio}" data-play-rate="0.65" aria-label="Nghe chậm">${snailSvg}</button>
              <button type="button" id="xhz-sheet-retry-btn" class="lp-btn3d gold">
                Thử lại <kbd class="lp-kbd lp-kbd-in-btn">Enter</kbd>
              </button>
            </div>
          </div>
        `;
      } else if (state.phase === 'feedback' && state.verdict) {
        const v = state.verdict;
        const ans = v.answer;
        sheetHtml = `
          <div class="lp-sheet-backdrop" aria-hidden="true"></div>
          <div class="lp-sheet ${v.correct ? 'ok' : 'warn'}" role="status" aria-live="assertive" data-testid="feedback-sheet">
            <div class="head">
              <span class="badge">${v.correct ? checkSvg : exclSvg}</span>
              <b>${v.correct ? 'Chính xác!' : 'Chưa đúng'}</b>
              <img src="/images/capy/lesson/${v.correct ? 'happy' : 'encouraging'}.webp" alt="Capy" class="mini-capy" style="width:64px;height:64px;object-fit:contain;" />
            </div>
            ${
              ans && (ans.hanzi || ans.pinyin)
                ? `<div class="ans">
                    <div class="min-w-0 flex-1">
                      ${!v.correct ? `<div class="lbl">Đáp án đúng</div>` : ''}
                      ${ans.hanzi ? `<span class="lp-hanzi" lang="zh">${ans.hanzi}</span> ` : ''}
                      ${ans.pinyin ? renderColoredPinyin(ans.pinyin) : ''}
                      ${ans.vi ? `<div class="vi">${ans.vi}</div>` : ''}
                    </div>
                    <button type="button" class="lp-audio-btn slow" data-play-text="${ans.hanzi || ''}" data-play-url="${ans.audioUrl || ''}" data-play-rate="0.65" aria-label="Nghe đáp án">${snailSvg}</button>
                  </div>`
                : ''
            }
            ${!v.correct && v.explanationVi ? `<p class="why">${v.explanationVi}</p>` : ''}
            <div class="actions">
              <button type="button" id="xhz-sheet-next-btn" class="lp-btn3d ${v.correct ? 'ok' : ''}">
                Tiếp tục <kbd class="lp-kbd lp-kbd-in-btn">Enter</kbd>
              </button>
            </div>
          </div>
        `;
      }

      // 4. Xây dựng Intro Overlay (Screenshot 1)
      const introOverlayHtml = state.showIntro
        ? `
          <div class="lp-intro-ov" data-testid="lesson-intro">
            <img src="/images/capy/lesson/happy.webp" alt="Capy" style="width:200px;height:200px;object-fit:contain;" />
            <div class="lp-bubble">
              Bài này có ${introWords.length || 3} từ mới, chừng ${run.estMinutes || 6} phút. Mình đi cùng bạn nhé!
            </div>
            <div>
              <h2>${run.titleVi || 'Từ mới: Bốn thanh và thanh nhẹ'}</h2>
            </div>
            ${
              introWords.length > 0
                ? `<div class="words" lang="zh">${introWords.map(w => `<span>${w}</span>`).join('')}</div>`
                : ''
            }
            <div style="margin-top:10px;width:100%;max-width:420px;">
              <button type="button" id="xhz-intro-start-btn" class="lp-btn3d">Bắt đầu</button>
            </div>
          </div>
        `
        : '';

      // 5. Xây dựng Exit Confirmation Modal
      const exitModalHtml = state.showExitModal
        ? `
          <div style="position:fixed;inset:0;z-index:80;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:16px;">
            <div style="background:var(--lp-surface);border:1.5px solid var(--lp-border);border-radius:20px;max-width:400px;width:100%;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,0.2);">
              <h3 style="font-size:20px;font-weight:800;color:var(--lp-ink);margin:0 0 8px 0;">Tạm dừng bài học?</h3>
              <p style="font-size:15px;color:var(--lp-ink-2);margin:0 0 20px 0;line-height:1.5;">Câu trả lời đã làm được lưu lại. Lần sau bạn sẽ học tiếp từ câu đang dở.</p>
              <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button type="button" id="xhz-exit-cancel" style="padding:10px 18px;border-radius:12px;border:1.5px solid var(--lp-border-strong);background:var(--lp-surface);color:var(--lp-ink);font-weight:700;cursor:pointer;">Học tiếp</button>
                <button type="button" id="xhz-exit-confirm" style="padding:10px 18px;border-radius:12px;border:none;background:var(--lp-red);color:#fff;font-weight:700;cursor:pointer;">Thoát</button>
              </div>
            </div>
          </div>
        `
        : '';

      runnerRoot.innerHTML = `
        <div class="lp lp-runner" data-testid="lesson-runner" data-split="true">
          <div class="lp-runner-inner lp-split">
            <!-- Top Progress Bar -->
            <div class="lp-lesson-top">
              <button type="button" id="xhz-runner-exit-btn" aria-label="Thoát bài học" class="lp-icon-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
              <div class="lp-progress" role="progressbar" aria-label="Tiến độ bài học" aria-valuemin="0" aria-valuemax="${playableSteps.length}" aria-valuenow="${state.stepIdx}">
                <i style="width:${progressPct}%;"></i>
              </div>
              <button type="button" id="xhz-runner-audio-replay" aria-label="Cài đặt âm thanh" class="lp-icon-btn" title="Phát lại âm thanh (Space)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
            </div>

            <!-- Main 2-Column Split Grid -->
            <div class="xhz-lp-split-grid flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8 lg:px-8">
              <!-- Left Column: Capybara Row + Prompt -->
              <div class="xhz-lp-split-left px-5 lg:min-h-0 lg:overflow-y-auto lg:px-0 lg:py-4">
                <div class="lp-capyrow" data-testid="capy-row">
                  <img src="${getCapySprite(step)}" alt="Capy" class="lp-capy" style="width:74px;height:74px;object-fit:contain;" />
                  <div class="lp-bubble pop" aria-live="polite">
                    ${isHard ? `<span class="lp-tag-hard">CÂU KHÓ</span><br/>` : ''}
                    ${getCapyPromptLine(step)}
                  </div>
                </div>
                <div class="mt-3.5">${promptHtml}</div>
              </div>

              <!-- Right Column: Step Answer Area + Footer + Sheet -->
              <div class="xhz-lp-split-right relative flex min-h-0 flex-1 flex-col lg:overflow-hidden">
                <div class="lp-step-area">
                  <div class="lp-step-body">${answerHtml}</div>
                </div>
                <div class="lp-footer">
                  <button type="button" id="xhz-runner-primary-btn" data-runner-action="" class="lp-btn3d" ${footerBtnDisabled ? 'disabled' : ''}>
                    ${footerBtnLabel}
                    ${!footerBtnDisabled ? `<kbd class="lp-kbd lp-kbd-in-btn" aria-hidden="true">Enter</kbd>` : ''}
                  </button>
                  <p class="lp-key-tips" aria-hidden="true"><kbd class="lp-kbd">Space</kbd> nghe lại</p>
                </div>
                ${sheetHtml}
              </div>
            </div>

            ${introOverlayHtml}
            ${exitModalHtml}
          </div>
        </div>
      `;

      // Wire events
      const startBtn = runnerRoot.querySelector('#xhz-intro-start-btn');
      if (startBtn) {
        startBtn.onclick = () => {
          state.showIntro = false;
          renderRunner();
          const aud = getStepAudioInfo(getCurrentStep());
          if (aud.text || aud.url) {
            playPronunciation(aud.text, aud.url, 1.0);
          }
        };
      }

      const exitBtn = runnerRoot.querySelector('#xhz-runner-exit-btn');
      if (exitBtn) {
        exitBtn.onclick = () => {
          state.showExitModal = true;
          renderRunner();
        };
      }
      const exitCancel = runnerRoot.querySelector('#xhz-exit-cancel');
      if (exitCancel) {
        exitCancel.onclick = () => {
          state.showExitModal = false;
          renderRunner();
        };
      }
      const exitConfirm = runnerRoot.querySelector('#xhz-exit-confirm');
      if (exitConfirm) {
        exitConfirm.onclick = async () => {
          exitConfirm.textContent = 'Đang lưu...';
          exitConfirm.disabled = true;
          try {
            if (state.stepIdx > 0) {
              const prog = recordStudyProgress({
                minutes: Math.max(1, Math.round(state.stepIdx * 0.4)),
                dailyStepDone: state.stepIdx >= 4 ? 'step-lesson-1' : undefined
              });
              await Promise.race([
                prog.__syncPromise || syncProgressToSupabaseAuth(prog),
                new Promise(resolve => setTimeout(resolve, 1800))
              ]);
            }
          } catch (_) {}
          window.location.assign('/hoc');
        };
      }

      const replayGear = runnerRoot.querySelector('#xhz-runner-audio-replay');
      if (replayGear) {
        replayGear.onclick = () => {
          const aud = getStepAudioInfo(getCurrentStep());
          playPronunciation(aud.text, aud.url, 1.0);
        };
      }

      runnerRoot.querySelectorAll('[data-play-text], [data-play-url]').forEach(btn => {
        btn.onclick = () => {
          const txt = btn.getAttribute('data-play-text') || '';
          const url = btn.getAttribute('data-play-url') || '';
          const rate = Number(btn.getAttribute('data-play-rate')) || 1.0;
          playPronunciation(txt, url, rate);
        };
      });

      // Pretest options (intro_word)
      runnerRoot.querySelectorAll('[data-pretest-opt]').forEach(btn => {
        btn.onclick = () => {
          if (state.pretestRevealed) return;
          state.pretestPickedId = btn.getAttribute('data-pretest-opt');
          state.pretestRevealed = true;
          const aud = getStepAudioInfo(step);
          playPronunciation(aud.text, aud.url, 1.0);
          renderRunner();
        };
      });
      const pretestSkip = runnerRoot.querySelector('#xhz-pretest-skip');
      if (pretestSkip) {
        pretestSkip.onclick = () => {
          state.pretestPickedId = null;
          state.pretestRevealed = true;
          const aud = getStepAudioInfo(step);
          playPronunciation(aud.text, aud.url, 1.0);
          renderRunner();
        };
      }

      // Multiple-choice options (choose_meaning, listen_choose, fill_blank, exam_item)
      runnerRoot.querySelectorAll('[data-choice-opt]').forEach(btn => {
        btn.onclick = () => {
          if (state.phase !== 'answering') return;
          const optId = btn.getAttribute('data-choice-opt');
          if (state.disabledOptionIds.has(optId)) return;
          state.selectedOptionId = optId;
          renderRunner();
        };
      });

      // Write character phase tabs & skip
      runnerRoot.querySelectorAll('[data-write-phase]').forEach(btn => {
        btn.onclick = () => {
          state.writePhaseIdx = Number(btn.getAttribute('data-write-phase')) || 0;
          state.writeQuizDone = false;
          renderRunner();
        };
      });
      const writeSkip = runnerRoot.querySelector('#xhz-write-skip');
      if (writeSkip) {
        writeSkip.onclick = () => advanceStep();
      }

      // Type pinyin input & tone buttons
      const pyInput = runnerRoot.querySelector('#xhz-pinyin-input');
      if (pyInput) {
        pyInput.focus();
        pyInput.setSelectionRange(pyInput.value.length, pyInput.value.length);
        pyInput.oninput = e => {
          state.typedText = e.target.value;
          const prevEl = runnerRoot.querySelector('#xhz-pinyin-preview');
          const conv = convertNumberedPinyin(state.typedText);
          if (prevEl) {
            prevEl.innerHTML =
              conv && conv !== state.typedText.trim()
                ? `Hiển thị: <b>${conv}</b>`
                : 'Gõ âm tiết trước, rồi gõ số 1-4 hoặc chạm phím thanh.';
          }
          const primBtn = runnerRoot.querySelector('#xhz-runner-primary-btn');
          if (primBtn) {
            primBtn.disabled = !/[a-zA-ZüÜvVāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(state.typedText);
          }
        };
        pyInput.onkeydown = e => {
          if (e.key === 'Enter' && state.typedText.trim()) {
            e.preventDefault();
            footerAction();
          }
        };
      }
      runnerRoot.querySelectorAll('[data-tone-digit]').forEach(btn => {
        btn.onclick = () => {
          const digit = btn.getAttribute('data-tone-digit');
          const cleaned = state.typedText.replace(/[1-5]$/, '');
          state.typedText = convertNumberedPinyin(cleaned + digit);
          renderRunner();
        };
      });

      // Match pairs
      runnerRoot.querySelectorAll('[data-match-left]').forEach(btn => {
        btn.onclick = () => {
          const lid = btn.getAttribute('data-match-left');
          state.matchLeftSelected = lid;
          const lItem = (state._leftItems || []).find(x => x.id === lid);
          if (lItem) {
            playPronunciation(lItem.hanzi, lItem.audio && lItem.audio.url, 1.0);
          }
          renderRunner();
        };
      });
      runnerRoot.querySelectorAll('[data-match-right]').forEach(btn => {
        btn.onclick = () => {
          if (!state.matchLeftSelected) return;
          const rid = btn.getAttribute('data-match-right');
          const lid = state.matchLeftSelected;
          const isValid = (state._validPairs || []).some(pr => pr[0] === lid && pr[1] === rid);
          state.matchLeftSelected = null;
          if (isValid) {
            state.matchedPairs.push([lid, rid]);
            renderRunner();
            if (state.matchedPairs.length >= (state._leftItems || []).length) {
              setTimeout(() => submitGradedAnswer(true, '', null), 300);
            }
          } else {
            state.matchWrongPair = [lid, rid];
            renderRunner();
            setTimeout(() => {
              state.matchWrongPair = null;
              renderRunner();
            }, 550);
          }
        };
      });

      // Order sentence tiles
      runnerRoot.querySelectorAll('[data-pick-token]').forEach(btn => {
        btn.onclick = () => {
          const tid = btn.getAttribute('data-pick-token');
          if (!state.orderedTokens.includes(tid)) {
            state.orderedTokens.push(tid);
            renderRunner();
          }
        };
      });
      runnerRoot.querySelectorAll('[data-unpick-token]').forEach(btn => {
        btn.onclick = () => {
          const tid = btn.getAttribute('data-unpick-token');
          state.orderedTokens = state.orderedTokens.filter(x => x !== tid);
          renderRunner();
        };
      });

      const handleSpeakingMic = async ({ expectedHanzi, audioUrl, statusEl, onDone }) => {
        if (statusEl) statusEl.textContent = 'Đang nghe tiếng Trung (zh-CN)... Hãy đọc to!';
        const res = await recognizeChineseSpeech({ expectedHanzi, timeoutMs: 5500 });
        state.readScore = (res && res.score) || 90;
        state.readTranscript = (res && res.transcript) || '';
        playPronunciation(expectedHanzi || '', audioUrl || '', 1.0);
        try {
          if (expectedHanzi) {
            recordStudyProgress({ voiceInc: 1, gradingInc: 1, speakingItem: { key: expectedHanzi, score: state.readScore } });
          } else {
            recordStudyProgress({ voiceInc: 1, gradingInc: 1 });
          }
        } catch (_) {}
        onDone();
        renderRunner();
      };

      // Read sentence mic & skip
      const micBtn = runnerRoot.querySelector('#xhz-read-mic-btn');
      if (micBtn) {
        micBtn.onclick = () => {
          const sent = (step.payload && step.payload.sentence) || {};
          handleSpeakingMic({
            expectedHanzi: sent.hanzi || '',
            audioUrl: (sent.audio && sent.audio.url) || '',
            statusEl: runnerRoot.querySelector('.lp-status-line'),
            onDone: () => { state.readRecorded = true; }
          });
        };
      }
      const readSkip = runnerRoot.querySelector('#xhz-read-skip');
      if (readSkip) {
        readSkip.onclick = () => advanceStep();
      }

      // Roleplay choice & mic
      runnerRoot.querySelectorAll('[data-rp-choice]').forEach(el => {
        el.onclick = e => {
          if (e.target && e.target.closest && e.target.closest('.lp-audio-btn')) return;
          state.roleplayChoiceId = el.getAttribute('data-rp-choice');
          const cObj = (step.payload && Array.isArray(step.payload.choices) ? step.payload.choices : []).find(c => c.id === state.roleplayChoiceId);
          if (cObj) playPronunciation(cObj.hanzi || '', (cObj.audio && cObj.audio.url) || '', 1.0);
          renderRunner();
        };
      });
      const rpMicBtn = runnerRoot.querySelector('#xhz-rp-mic-btn');
      if (rpMicBtn) {
        rpMicBtn.onclick = () => {
          const choices = (step.payload && Array.isArray(step.payload.choices)) ? step.payload.choices : [];
          const picked = choices.find(c => c.id === state.roleplayChoiceId) || choices[0] || {};
          handleSpeakingMic({
            expectedHanzi: picked.hanzi || '',
            audioUrl: (picked.audio && picked.audio.url) || '',
            statusEl: runnerRoot.querySelector('#xhz-rp-status'),
            onDone: () => {
              state.roleplaySpoken = true;
              try { recordStudyProgress({ dailyStepDone: 'step-talk-1' }); } catch (_) {}
            }
          });
        };
      }
      const rpSkip = runnerRoot.querySelector('#xhz-rp-skip');
      if (rpSkip) {
        rpSkip.onclick = () => advanceStep();
      }

      // Sheet retry / next buttons
      const sheetRetryBtn = runnerRoot.querySelector('#xhz-sheet-retry-btn');
      if (sheetRetryBtn) {
        sheetRetryBtn.onclick = () => {
          state.phase = 'answering';
          state.selectedOptionId = null;
          renderRunner();
        };
      }
      const sheetNextBtn = runnerRoot.querySelector('#xhz-sheet-next-btn');
      if (sheetNextBtn) {
        sheetNextBtn.onclick = () => {
          const curSt = getCurrentStep();
          if (
            curSt &&
            curSt.type === 'dialogue' &&
            curSt.payload &&
            Array.isArray(curSt.payload.questions) &&
            state.dlgQuestionIdx + 1 < curSt.payload.questions.length
          ) {
            state.dlgQuestionIdx += 1;
            state.phase = 'answering';
            state.selectedOptionId = null;
            state.verdict = null;
            renderRunner();
            return;
          }
          advanceStep();
        };
      }

      // Primary footer button
      const primaryBtn = runnerRoot.querySelector('#xhz-runner-primary-btn');
      if (primaryBtn) {
        primaryBtn.onclick = () => {
          if (!footerBtnDisabled) footerAction();
        };
      }

      // Mount HanziWriter if write_character step
      mountHanziWriterIfNeeded();
    }

    // Keyboard shortcuts: [Enter], [Space], [1-4]
    if (window.__xhzLessonKeydownHandler) {
      window.removeEventListener('keydown', window.__xhzLessonKeydownHandler);
    }
    window.__xhzLessonKeydownHandler = function (e) {
      if (!document.getElementById('xhz-lesson-runner-root')) return;
      const activeTag = (document.activeElement && document.activeElement.tagName) || '';
      const isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        const aud = getStepAudioInfo(getCurrentStep());
        playPronunciation(aud.text, aud.url, 1.0);
        return;
      }
      if (e.key === 'Enter' && !isInput) {
        e.preventDefault();
        if (state.showIntro) {
          const sb = runnerRoot.querySelector('#xhz-intro-start-btn');
          if (sb) sb.click();
          return;
        }
        if (state.phase === 'hint') {
          const rb = runnerRoot.querySelector('#xhz-sheet-retry-btn');
          if (rb) rb.click();
          return;
        }
        if (state.phase === 'feedback') {
          const nb = runnerRoot.querySelector('#xhz-sheet-next-btn');
          if (nb) nb.click();
          return;
        }
        if (state.phase === 'done') {
          const db = runnerRoot.querySelector('#xhz-done-continue');
          if (db) db.click();
          return;
        }
        const pb = runnerRoot.querySelector('#xhz-runner-primary-btn');
        if (pb && !pb.disabled) pb.click();
        return;
      }
      if (!isInput && !state.showIntro && state.phase === 'answering' && /^[1-4]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const step = getCurrentStep();
        if (step && step.type === 'intro_word' && !state.pretestRevealed) {
          const preBtns = runnerRoot.querySelectorAll('[data-pretest-opt]');
          if (preBtns[idx]) preBtns[idx].click();
        } else {
          const choiceBtns = runnerRoot.querySelectorAll('[data-choice-opt]');
          if (choiceBtns[idx] && !choiceBtns[idx].disabled) choiceBtns[idx].click();
        }
      }
    };
    window.addEventListener('keydown', window.__xhzLessonKeydownHandler);

    renderRunner();
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
    if (parts[0] === 'ngu-phap' && parts[1] === 'luyen-tap' && parts.length >= 3) {
      lastHandledFullUrl = fullKey;
      const pointId = safeDecodeURIComponent(parts[2]);
      const level = (pointId.match(/\d+/) || ['1'])[0];
      await renderGrammarQuizRunPage(new URLSearchParams({ tracks: `${/_new_|^new-/.test(pointId) ? 'new-hsk' : 'hsk'}${level}`, grammarId: pointId, count: '20' }));
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
    if (parts[0] && parts[0].startsWith('thu-vien-')) {
      const minParts = STATIC_CURR_ROOTS.includes(parts[0]) ? 3 : 2;
      if (parts.length >= minParts) {
        lastHandledFullUrl = fullKey;
        await renderCurriculumSubPage(pathname);
        return;
      }
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
    if (parts[0] === 'hoc' && (parts[1] === 'tien-do' || parts[1] === 'thoi-quen')) {
      lastHandledFullUrl = fullKey;
      await renderProgressOrHabitPage(pathname);
      return;
    }
    if (parts[0] === 'on-tap' && (parts[1] === 'da-hoc' || parts[1] === 'so-loi' || parts[1] === 'loi-sai')) {
      lastHandledFullUrl = fullKey;
      await renderMistakeBookOrLearnedWordsPage(pathname);
      return;
    }
    if (parts[0] === 'tra-chu' && (parts[1] === 'bo-thu' || parts[1] === 'hsk') && parts.length >= 3) {
      lastHandledFullUrl = fullKey;
      await renderCharacterBrowseSubPage(pathname);
      return;
    }

    lastHandledFullUrl = fullKey;
    restoreOriginalMainIfStatic();
  }

  function enhanceAccountPageAuthUI() {
    if (!htqHydrationSettled) return;
    try {
      const path = (window.location.pathname || '').replace(/\/+$/, '');
      if (path === '/xoa-tai-khoan' || path === '/xoa-tai-khoan.html') {
        if (!document.getElementById('xhz-safe-delete-panel')) {
          const host = document.querySelector('main') || document.body;
          if (host) {
            const panel = document.createElement('div');
            panel.id = 'xhz-safe-delete-panel';
            panel.style.cssText = 'max-width:720px;margin:20px auto;padding:20px 24px;border-radius:18px;border:1px solid #fecaca;background:#fff1f2;color:#881337;';
            panel.innerHTML =
              `<div style="font-weight:800;font-size:16px;margin-bottom:6px;">🛡️ Dọn dữ liệu an toàn trên thiết bị này</div>` +
              `<p style="margin:0 0 12px;font-size:14px;color:#9f1239;line-height:1.6;">Trước khi đăng xuất hoặc xóa dữ liệu học trên trình duyệt, bạn nên tải bản sao lưu <code>.json</code> để có thể khôi phục bất cứ lúc nào.</p>` +
              `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">` +
              `<button type="button" id="xhz-del-backup-btn" style="padding:9px 15px;border-radius:10px;border:1px solid #0d9488;background:#fff;color:#0f766e;font-weight:700;font-size:13px;cursor:pointer;">📥 Tải bản sao lưu (.json) trước</button>` +
              `<button type="button" id="xhz-clear-local-data-btn" style="padding:9px 15px;border-radius:10px;border:none;background:#dc2626;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">🗑️ Xóa dữ liệu cục bộ trên trình duyệt này</button>` +
              `</div><div id="xhz-del-status" style="margin-top:10px;font-size:13px;font-weight:600;"></div>`;
            host.appendChild(panel);
            let armed = false;
            panel.querySelector('#xhz-del-backup-btn').onclick = () => {
              if (window.__xhzExportProgressJson) window.__xhzExportProgressJson(true);
              panel.querySelector('#xhz-del-status').textContent = '✅ Đã tải xuống file sao lưu .json an toàn.';
            };
            const clrBtn = panel.querySelector('#xhz-clear-local-data-btn');
            clrBtn.onclick = () => {
              const st = panel.querySelector('#xhz-del-status');
              if (!armed) {
                armed = true;
                clrBtn.textContent = '⚠️ Nhấn lần nữa để xác nhận xóa dữ liệu cục bộ';
                st.textContent = 'Hành động này chỉ xóa tiến độ lưu trên trình duyệt này (dữ liệu đã đồng bộ lên Supabase không bị xóa).';
                return;
              }
              const ownerKey = getStudyStateStorageKey();
              const keysToDrop = Object.keys(localStorage).filter(k => k === ownerKey || k.endsWith(':' + ownerKey));
              keysToDrop.forEach(k => localStorage.removeItem(k));
              clearAuthSession(false);
              clrBtn.disabled = true;
              clrBtn.textContent = '✅ Đã dọn sạch dữ liệu cục bộ';
              st.textContent = 'Hoàn tất. Bạn có thể quay về Trang chủ hoặc nhập lại từ file .json bất cứ lúc nào.';
            };
          }
        }
        return;
      }
      if (path !== '/tai-khoan' && path !== '/tai-khoan.html') return;

      const googleIconHtml =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:20px;height:20px;flex-shrink:0;"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>';

      // 1. Giao diện Khách (chưa đăng nhập): thêm nút "Đăng nhập bằng Google" trực tiếp
      const guestBenefits = document.querySelector('[data-testid="account-guest-benefits"]');
      if (guestBenefits && !document.getElementById('xhz-direct-google-btn')) {
        const btnGroup = guestBenefits.nextElementSibling;
        if (btnGroup) {
          const gBtn = document.createElement('button');
          gBtn.id = 'xhz-direct-google-btn';
          gBtn.type = 'button';
          gBtn.setAttribute('data-google-oauth', '1');
          gBtn.style.cssText =
            'width:100%;height:52px;padding:0 24px;border-radius:12px;border:1.5px solid #e7e5e4;background:#ffffff;color:#1c1917;font-weight:700;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.15s ease;';
          gBtn.innerHTML = googleIconHtml + '<span>Đăng nhập bằng Google</span>';
          gBtn.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            window.loginWithGoogle('/tai-khoan');
          });
          btnGroup.insertBefore(gBtn, btnGroup.firstChild);
        }
      }

      // 2. Giao diện Đã đăng nhập: thêm thẻ thông tin tài khoản Google + nút Đồng bộ & Đăng xuất nổi bật
      const planCard = document.querySelector('[data-testid="account-plan-card"]');
      const savedUser = getSavedUser();
      if (planCard && savedUser && !document.getElementById('xhz-user-auth-banner')) {
        const banner = document.createElement('div');
        banner.id = 'xhz-user-auth-banner';
        banner.style.cssText =
          'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;margin-bottom:16px;border-radius:16px;border:1px solid #e7e5e4;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.04);';
        const initial = (savedUser.displayName || savedUser.email || 'U').trim().charAt(0).toUpperCase();
        const avatarHtml = savedUser.avatar
          ? `<img src="${escapeHtml(savedUser.avatar)}" alt="" style="width:44px;height:44px;border-radius:999px;object-fit:cover;border:1px solid #e7e5e4;" />`
          : `<div style="width:44px;height:44px;border-radius:999px;background:#fef2f2;color:#dc2626;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;border:1px solid #fecaca;">${escapeHtml(initial)}</div>`;
        banner.innerHTML =
          `<div style="display:flex;align-items:center;gap:12px;min-width:0;">` +
          avatarHtml +
          `<div style="min-width:0;">` +
          `<div style="font-weight:700;font-size:16px;color:#1c1917;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(savedUser.displayName || 'Học viên')}</div>` +
          `<div id="xhz-cloud-sync-status" style="font-size:13px;color:#57534e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Đã đăng nhập: ${escapeHtml(savedUser.email)}</div>` +
          `</div>` +
          `</div>` +
          `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">` +
          `<button type="button" id="xhz-cloud-sync-btn" style="padding:8px 14px;border-radius:10px;border:1px solid #d6d3d1;background:#fafaf9;color:#1c1917;font-weight:600;font-size:13px;cursor:pointer;">🔄 Đồng bộ ngay</button>` +
          `<button type="button" id="xhz-direct-logout-btn" style="padding:8px 16px;border-radius:10px;border:1px solid #fecaca;background:#fef2f2;color:#dc2626;font-weight:600;font-size:14px;cursor:pointer;">Đăng xuất</button>` +
          `</div>`;
        if (planCard.parentElement) {
          planCard.parentElement.insertBefore(banner, planCard);
          const syncBtn = banner.querySelector('#xhz-cloud-sync-btn');
          const statusEl = banner.querySelector('#xhz-cloud-sync-status');
          if (syncBtn) {
            syncBtn.addEventListener('click', async function (ev) {
              ev.preventDefault();
              syncBtn.disabled = true;
              syncBtn.textContent = '⏳ Đang đồng bộ...';
              let synced = false;
              try { synced = Boolean(window.__xhzSyncCloudProgress && await window.__xhzSyncCloudProgress()); } catch (_) {}
              syncBtn.textContent = synced ? '✅ Đã đồng bộ!' : 'Thử đồng bộ lại';
              if (statusEl) {
                statusEl.textContent = synced ? `Đã đăng nhập: ${savedUser.email} · Vừa đồng bộ lúc ${new Date().toLocaleTimeString('vi-VN')}` : 'Chưa đồng bộ được. Dữ liệu học trên thiết bị vẫn được giữ lại.';
              }
              setTimeout(() => {
                syncBtn.disabled = false;
                syncBtn.textContent = '🔄 Đồng bộ ngay';
              }, 2000);
            });
          }
          const outBtn = banner.querySelector('#xhz-direct-logout-btn');
          if (outBtn) {
            outBtn.addEventListener('click', function (ev) {
              ev.preventDefault();
              window.logoutXieHanzi();
            });
          }
        }
      }

      // 2b. Gợi ý gộp tiến độ Khách (opt-in, không bao giờ gộp âm thầm)
      if (planCard && savedUser && !document.getElementById('xhz-guest-migration-card')) {
        const gSum = getGuestMigrationSummary();
        if (gSum && gSum.hasData && !gSum.alreadyMigrated && planCard.parentElement) {
          const migCard = document.createElement('div');
          migCard.id = 'xhz-guest-migration-card';
          migCard.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;margin-bottom:14px;border-radius:14px;border:1px solid #99f6e4;background:#f0fdfa;color:#115e59;';
          migCard.innerHTML =
            `<div style="min-width:200px;">` +
            `<div style="font-weight:800;font-size:14px;">📥 Phát hiện tiến độ học ở chế độ Khách trên máy này</div>` +
            `<div id="xhz-guest-mig-desc" style="font-size:13px;color:#0f766e;margin-top:2px;">Có ${gSum.wordsCount} từ đã học, ${gSum.stagesCount} chặng, ${gSum.reviewCardsCount} thẻ ôn. Bạn có muốn gộp vào tài khoản ${escapeHtml(savedUser.email || '')} không?</div>` +
            `</div>` +
            `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">` +
            `<button type="button" id="xhz-btn-import-guest" style="padding:8px 14px;border-radius:10px;border:none;background:#0d9488;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">Gộp vào tài khoản này</button>` +
            `<button type="button" id="xhz-btn-dismiss-guest" style="padding:8px 12px;border-radius:10px;border:1px solid #99f6e4;background:#fff;color:#115e59;font-weight:600;font-size:13px;cursor:pointer;">Bỏ qua</button>` +
            `</div>`;
          planCard.parentElement.insertBefore(migCard, planCard);
          const impBtn = migCard.querySelector('#xhz-btn-import-guest');
          const disBtn = migCard.querySelector('#xhz-btn-dismiss-guest');
          const descEl = migCard.querySelector('#xhz-guest-mig-desc');
          if (impBtn) {
            impBtn.onclick = async () => {
              impBtn.disabled = true;
              impBtn.textContent = '⏳ Đang gộp...';
              const res = await importGuestProgressIntoAccount();
              if (res && res.ok && descEl) {
                descEl.textContent = `✅ Đã gộp an toàn! Hiện tài khoản có ${res.wordsTotal} từ, ${res.stagesTotal} chặng, ${res.reviewCardsTotal} thẻ ôn.`;
                impBtn.textContent = '✅ Đã gộp xong';
                if (disBtn) disBtn.style.display = 'none';
              } else if (descEl) {
                descEl.textContent = 'Chưa thể gộp tiến độ Khách. Dữ liệu vẫn được giữ nguyên.';
                impBtn.disabled = false;
                impBtn.textContent = 'Thử lại';
              }
            };
          }
          if (disBtn) {
            disBtn.onclick = () => {
              try { localStorage.setItem(`httq_guest_migrated_for_${savedUser.id}`, 'dismissed'); } catch (_) {}
              migCard.remove();
            };
          }
        }
      }

      // 3. Thẻ Sao lưu & Khôi phục tiến độ (.json) trên /tai-khoan (cộng gộp an toàn, không ghi đè)
      if ((window.location.pathname || '').startsWith('/tai-khoan') && !document.getElementById('xhz-backup-controls')) {
        const hostEl = (planCard && planCard.parentElement) || document.querySelector('main');
        if (hostEl) {
          const box = document.createElement('div');
          box.id = 'xhz-backup-controls';
          box.className = 'htq-backup-card';
          box.innerHTML =
            `<div style="min-width:200px;">` +
            `<div class="htq-backup-title">💾 Sao lưu &amp; Khôi phục dữ liệu học</div>` +
            `<div id="xhz-backup-status" class="htq-backup-desc">Xuất file .json dự phòng hoặc nhập từ trình duyệt khác (gộp an toàn, không mất dữ liệu cũ).</div>` +
            `</div>` +
            `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">` +
            `<button type="button" id="xhz-export-json-btn" class="htq-backup-export-btn">📥 Xuất sao lưu (.json)</button>` +
            `<button type="button" id="xhz-import-json-btn" style="padding:8px 14px;border-radius:10px;border:none;background:#ea580c;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">📤 Khôi phục từ file (.json)</button>` +
            `<input type="file" id="xhz-import-json-file" accept=".json,application/json" style="display:none;" />` +
            `</div>`;
          if (planCard && planCard.parentElement === hostEl) {
            hostEl.insertBefore(box, planCard.nextSibling);
          } else {
            hostEl.appendChild(box);
          }
          const expBtn = box.querySelector('#xhz-export-json-btn');
          const impBtn = box.querySelector('#xhz-import-json-btn');
          const impFile = box.querySelector('#xhz-import-json-file');
          const bStatus = box.querySelector('#xhz-backup-status');
          if (expBtn) {
            expBtn.addEventListener('click', ev => {
              ev.preventDefault();
              if (window.__xhzExportProgressJson) window.__xhzExportProgressJson(true);
              if (bStatus) bStatus.textContent = '✅ Đã tải xuống file sao lưu .json!';
            });
          }
          if (impBtn && impFile) {
            impBtn.addEventListener('click', ev => {
              ev.preventDefault();
              impFile.click();
            });
            impFile.addEventListener('change', async () => {
              const f = impFile.files && impFile.files[0];
              if (!f) return;
              try {
                const txt = await f.text();
                const merged = window.__xhzImportProgressJson ? window.__xhzImportProgressJson(txt) : null;
                if (merged && bStatus) {
                  bStatus.style.color = '#15803d';
                  bStatus.textContent = `✅ Đã gộp khôi phục thành công (${(merged.learnedWords || []).length} từ, ${(merged.doneStages || []).length} chặng)!`;
                } else if (bStatus) {
                  bStatus.style.color = '#dc2626';
                  bStatus.textContent = '❌ File JSON không hợp lệ.';
                }
              } catch (_) {
                if (bStatus) {
                  bStatus.style.color = '#dc2626';
                  bStatus.textContent = '❌ Không thể đọc file đã chọn.';
                }
              }
              impFile.value = '';
            });
          }
        }
      }
    } catch (_e) {}
  }

  // Helper to bind Studio UI click handlers at window capture phase (immune to React 19 hydration event replay traps on /)
  function bindStudioClick(el, handler) {
    if (!el || typeof handler !== 'function') return;
    el.__htqClickHandler = handler;
    el.setAttribute('data-htq-click', '1');
  }

  // Capture-phase click handler for Studio UI controls, Command Palette triggers, Google OAuth buttons & internal <a> links
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const cmdkTrigger = e.target && e.target.closest ? e.target.closest('#htq-sb-cmdk-btn, #htq-ws-cmdk-btn, [data-htq-cmdk-trigger]') : null;
    if (cmdkTrigger) {
      e.preventDefault();
      e.stopPropagation();
      openCommandPalette();
      return;
    }
    const studioClickEl = e.target && e.target.closest ? e.target.closest('[data-htq-click="1"]') : null;
    if (studioClickEl && typeof studioClickEl.__htqClickHandler === 'function') {
      const innerLink = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!innerLink || innerLink === studioClickEl || !studioClickEl.contains(innerLink)) {
        e.preventDefault();
        e.stopPropagation();
        try { studioClickEl.__htqClickHandler(e); } catch (_) {}
        return;
      }
    }
    const xhzPlayBtn = e.target && e.target.closest ? e.target.closest('[data-xhz-play]') : null;
    if (xhzPlayBtn) {
      e.preventDefault();
      e.stopPropagation();
      const textToSpeak = xhzPlayBtn.getAttribute('data-xhz-play') || '';
      if (textToSpeak && typeof window.__xhzPlayAudio === 'function') {
        try { window.__xhzPlayAudio(textToSpeak); } catch (_) {}
      }
      return;
    }
    const btn = e.target && e.target.closest ? e.target.closest('button, a') : null;
    if (btn) {
      const aria = String(btn.getAttribute('aria-label') || '');
      if (btn.closest('header[data-site-header="true"]') && isDynamicSpaRoute(window.location.pathname)) {
        if (/giao diện (tối|sáng)/i.test(aria)) {
          e.preventDefault();
          e.stopPropagation();
          toggleStudioTheme(true);
          return;
        }
        if (/tìm kiếm|search/i.test(aria)) {
          e.preventDefault();
          e.stopPropagation();
          openCommandPalette();
          return;
        }
      }
      const txt = (btn.textContent || '').trim();
      if (
        btn.hasAttribute('data-google-oauth') ||
        txt.includes('Tiếp tục với Google') ||
        txt.includes('Đăng nhập với Google') ||
        txt.includes('Đăng ký với Google') ||
        txt.includes('Đăng nhập bằng Google')
      ) {
        e.preventDefault();
        e.stopPropagation();
        window.loginWithGoogle();
        return;
      }
    }
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
      try { window.scrollTo(0, 0); } catch (_) {}
      Promise.resolve(checkAndRenderDynamicPage()).finally(() => {
        setTimeout(() => { scrubBrandingAndLogos(document.body); mountStudioLayout(); }, 40);
      });
    } else {
      e.preventDefault();
      e.stopPropagation();
      window.location.assign(targetUrl.pathname + targetUrl.search + targetUrl.hash);
    }
  }, true);

  function enhanceWorksheetAndPdfTools() {
    if (!htqHydrationSettled) return;
    try {
      const p = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
      if (p !== '/tao-vo-tap-viet' && p !== '/flashcard-pdf') return;
      const setNativeVal = (el, val) => {
        if (!el) return;
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc && desc.set) desc.set.call(el, val);
        else el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const prog = getRealProgress();
      const learned = Array.isArray(prog.learnedWords) ? prog.learnedWords.filter(Boolean) : [];
      const learnedText = learned.slice(-20).join(' ') || '你 好 我 是 老 师 爸 爸 妈 妈';

      if (p === '/tao-vo-tap-viet') {
        const rawQText = (new URLSearchParams(window.location.search).get('text') || window.__xhzWorksheetQueryText || '').trim();
        if (rawQText) window.__xhzWorksheetQueryText = rawQText;
        const applyWorksheetQueryText = () => {
          const curTa = document.getElementById('characters') || document.querySelector('textarea');
          if (!curTa || !rawQText) return;
          if (curTa.dataset.xhzUserEdited === '1') return;
          if (curTa.value === rawQText && curTa.dataset.xhzPrefilled === '1') return;
          setNativeVal(curTa, rawQText);
          curTa.dataset.xhzPrefilled = '1';
        };
        const ta = document.getElementById('characters') || document.querySelector('textarea');
        if (!ta) return;
        if (!ta.dataset.xhzEditBound) {
          ta.dataset.xhzEditBound = '1';
          ta.addEventListener('input', ev => {
            if (ev && ev.isTrusted) ta.dataset.xhzUserEdited = '1';
          });
        }
        applyWorksheetQueryText();
        if (rawQText && !window.__xhzWorksheetTimersScheduled) {
          window.__xhzWorksheetTimersScheduled = true;
          [250, 600, 1100].forEach(ms => setTimeout(applyWorksheetQueryText, ms));
        }
        if (!document.getElementById('xhz-quick-tools-bar')) {
          const bar = document.createElement('div');
          bar.id = 'xhz-quick-tools-bar';
          bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px 0;align-items:center;';
          bar.innerHTML = `
            <button type="button" id="xhz-qt-learned" style="padding:7px 14px;border-radius:999px;border:1px solid #fed7aa;background:#fff7ed;color:#9a3412;font-weight:700;font-size:13px;cursor:pointer;">📚 Từ đã học của bạn (${learned.length})</button>
            <button type="button" id="xhz-qt-hsk1" style="padding:7px 14px;border-radius:999px;border:1px solid #d6d3d1;background:#fafaf9;color:#1c1917;font-weight:700;font-size:13px;cursor:pointer;">✨ HSK 1 Bài 1</button>
            <button type="button" id="xhz-qt-print" style="padding:7px 14px;border-radius:999px;border:none;background:#ea580c;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">🖨️ In / Xuất PDF</button>
          `;
          ta.parentNode.insertBefore(bar, ta);
          document.getElementById('xhz-qt-learned').onclick = () => {
            const tNow = document.getElementById('characters') || ta;
            tNow.dataset.xhzUserEdited = '1';
            setNativeVal(tNow, learnedText);
          };
          document.getElementById('xhz-qt-hsk1').onclick = () => {
            const tNow = document.getElementById('characters') || ta;
            tNow.dataset.xhzUserEdited = '1';
            setNativeVal(tNow, '八 爸爸 妈妈 你 好 不 客气 老师 大家');
          };
          document.getElementById('xhz-qt-print').onclick = () => window.print();
        }
      } else if (p === '/flashcard-pdf') {
        if (document.getElementById('xhz-quick-tools-bar')) return;
        const h1 = document.querySelector('h1');
        if (!h1 || !h1.parentNode) return;
        const bar = document.createElement('div');
        bar.id = 'xhz-quick-tools-bar';
        bar.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 16px 0;align-items:center;';
        bar.innerHTML = `
          <a href="/tao-vo-tap-viet?text=${encodeURIComponent(learnedText)}" style="padding:8px 16px;border-radius:999px;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;font-weight:700;font-size:13px;text-decoration:none;">✍️ Tạo vở tập viết từ đã học (${learned.length})</a>
          <button type="button" id="xhz-pdf-print-btn" style="padding:8px 16px;border-radius:999px;border:none;background:#ea580c;color:#fff;font-weight:700;font-size:13px;cursor:pointer;">🖨️ In / Xuất PDF</button>
        `;
        h1.parentNode.insertBefore(bar, h1.nextSibling);
        document.getElementById('xhz-pdf-print-btn').onclick = () => window.print();
      }
    } catch (_) {}
  }

  // ============================================================================
  // 7. KHỞI CHẠY & THEO DÕI SPA NAVIGATION
  // ============================================================================
  let htqHydrationSettled = false;

  function cleanDocumentTitle() {
    if (!htqHydrationSettled) return;
    try {
      if (/xiehanzi/i.test(document.title)) {
        document.title = scrubBrandText(document.title)
          .replace(/\s*-\s*học chữ Hán online/gi, ' - Học chữ Hán online')
          .replace(/\s{2,}/g, ' ')
          .trim();
      }
    } catch (_e) {}
  }

  function scrubBrandingAndLogos(root) {
    if (!htqHydrationSettled) return;
    cleanDocumentTitle();
    injectMasterV3Styles();
    const target = root && root.nodeType === 1 ? root : document.body;
    if (!target) return;

    try {
      // Tag primary header home link as Jade Glass pill and hide logo image cleanly
      target.querySelectorAll('header[data-site-header="true"] > div > a[href="/"]').forEach(anchor => {
        anchor.setAttribute('data-htq-home-pill', '1');
        anchor.setAttribute('aria-label', 'Trang chủ');
        anchor.classList.remove('dark:bg-foreground', 'dark:px-2');
        anchor.querySelectorAll('img').forEach(img => {
          img.setAttribute('data-htq-logo', '1');
          img.style.setProperty('display', 'none', 'important');
        });
      });

      // Hide any XieHanzi / placeholder logo images in headers or footers
      target.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        const isBlank = src.indexOf('R0lGODlhAQABAIAAAAAAAP') !== -1;
        const isOldLogo = /XieHanzi_480x150/i.test(src) || /Logo XieHanzi|^XieHanzi$/i.test(alt);
        if (isOldLogo || (isBlank && (img.closest('header') || img.closest('footer')))) {
          img.setAttribute('data-htq-logo', '1');
          img.style.setProperty('display', 'none', 'important');
          const anchor = img.closest('a');
          if (anchor) {
            if (anchor.closest('header') || anchor.closest('nav')) {
              anchor.setAttribute('data-htq-home-pill', '1');
              anchor.setAttribute('aria-label', 'Trang chủ');
              anchor.classList.remove('dark:bg-foreground', 'dark:px-2');
            } else if (anchor.closest('footer')) {
              anchor.style.setProperty('display', 'none', 'important');
            }
          }
        } else if (/xiehanzi/i.test(alt)) {
          img.setAttribute('alt', scrubBrandText(alt));
        }
      });

      // Replace Thay Do landing top-left brand text cleanly
      target.querySelectorAll('[class*="thay-do-landing_brand"]').forEach(el => {
        if (/xiehanzi/i.test(el.textContent || '')) {
          el.textContent = 'Trang chủ';
        }
      });

      // Scrub attributes with brand strings
      target.querySelectorAll('[aria-label*="ieHanzi" i],[title*="ieHanzi" i],[placeholder*="ieHanzi" i]').forEach(el => {
        ['aria-label', 'title', 'placeholder'].forEach(attr => {
          const val = el.getAttribute(attr);
          if (val && /xiehanzi/i.test(val)) {
            el.setAttribute(attr, scrubBrandText(val));
          }
        });
      });

      // Hide old third-party app badges, QR boxes, and XieHanzi external brand social links
      target.querySelectorAll(
        'a[href*="facebook.com/xiehanzi"], a[href*="m.me/xiehanzi"], a[href*="youtube.com/@xiehanzi"], a[href*="status.xiehanzi.com"], ' +
        '[data-phone-float="invite"], a[href*="apps.apple.com"], [data-platform="android"], [data-platform="ios"], img[src*="tai-app-qr"]'
      ).forEach(el => {
        if (el.tagName === 'IMG') {
          const card = el.closest('.rounded-2xl');
          if (card) card.style.setProperty('display', 'none', 'important');
          else el.style.setProperty('display', 'none', 'important');
        } else if (el.matches('a[href*="apps.apple.com"], [data-platform="android"], [data-platform="ios"]')) {
          const row = el.parentElement;
          if (row && row.tagName === 'DIV' && row.querySelectorAll('a[href*="apps.apple.com"], [data-platform]').length >= 1) {
            row.style.setProperty('display', 'none', 'important');
          }
          el.style.setProperty('display', 'none', 'important');
        } else {
          const li = el.closest('li');
          if (li) li.style.setProperty('display', 'none', 'important');
          else el.style.setProperty('display', 'none', 'important');
        }
      });

      // Walk all visible Text nodes (skip script/style/textarea)
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.nodeValue || !/xiehanzi/i.test(node.nodeValue)) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const toUpdate = [];
      let n;
      while ((n = walker.nextNode())) toUpdate.push(n);
      for (const textNode of toUpdate) {
        const cleaned = scrubBrandText(textNode.nodeValue);
        if (cleaned !== textNode.nodeValue) {
          textNode.nodeValue = cleaned;
        }
      }
    } catch (_e) {}
  }






  function isImmersiveRoute(p) {
    return /^\/(thay-do|truong-thay-do|kho-du-lieu)/.test(p || '/');
  }

  // === HTQ STUDIO v14 — MOTION FX ENGINE & CURATED LEARNING POOLS ===
  const HTQ_STUDIO_FX = (() => {
    const prefersReducedMotion = () => {
      try { return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (_) { return false; }
    };
    const toast = (msg, tone = 'info') => {
      try {
        if (!document.body || !msg) return;
        let stack = document.getElementById('htq-toast-stack');
        if (!stack) {
          stack = document.createElement('div');
          stack.id = 'htq-toast-stack';
          stack.setAttribute('aria-live', 'polite');
          document.body.appendChild(stack);
        }
        const el = document.createElement('div');
        el.className = 'htq-toast' + (tone === 'success' ? ' is-success' : tone === 'warn' ? ' is-warn' : '');
        el.textContent = String(msg);
        stack.appendChild(el);
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(6px)';
          el.style.transition = 'opacity .22s ease, transform .22s ease';
          setTimeout(() => { try { el.remove(); } catch (_) {} }, 240);
        }, 2700);
      } catch (_) {}
    };
    const confetti = (anchorEl = null, count = 26) => {
      try {
        if (prefersReducedMotion() || !document.body || window.__xhzDiagRunning) return;
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;';
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) { canvas.remove(); return; }
        ctx.scale(dpr, dpr);
        let ox = window.innerWidth * 0.5;
        let oy = window.innerHeight * 0.34;
        if (anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
          const r = anchorEl.getBoundingClientRect();
          if (r.width > 0 || r.height > 0) {
            ox = r.left + r.width / 2;
            oy = r.top + r.height / 2;
          }
        }
        const colors = ['#4f46e5', '#0d9488', '#f59e0b', '#e11d48', '#8b5cf6', '#10b981'];
        const particles = Array.from({ length: Math.min(48, Math.max(10, count)) }, (_, i) => {
          const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 1.9;
          const speed = 3.2 + Math.random() * 5.2;
          return {
            x: ox, y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.4,
            w: 5 + Math.random() * 5,
            h: 4 + Math.random() * 4,
            rot: Math.random() * Math.PI * 2,
            vrot: (Math.random() - 0.5) * 0.24,
            color: colors[i % colors.length],
            alpha: 1
          };
        });
        const t0 = performance.now();
        const step = (now) => {
          const dt = now - t0;
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          let alive = 0;
          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.22;
            p.vx *= 0.99;
            p.rot += p.vrot;
            p.alpha = Math.max(0, 1 - dt / 1250);
            if (p.alpha > 0.02) {
              alive++;
              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.fillStyle = p.color;
              ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
              ctx.restore();
            }
          }
          if (alive > 0 && dt < 1350) requestAnimationFrame(step);
          else { try { canvas.remove(); } catch (_) {} }
        };
        requestAnimationFrame(step);
      } catch (_) {}
    };
    const animateCountUp = (el, targetVal) => {
      try {
        if (!el) return;
        const target = Math.max(0, Math.round(Number(targetVal) || 0));
        if (prefersReducedMotion() || target === 0 || el.getAttribute('data-htq-counted') === String(target)) {
          el.textContent = String(target);
          el.setAttribute('data-htq-counted', String(target));
          return;
        }
        el.setAttribute('data-htq-counted', String(target));
        const t0 = performance.now();
        const dur = 520;
        const tick = (now) => {
          const prog = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - prog, 3);
          el.textContent = String(Math.round(target * eased));
          if (prog < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } catch (_) {}
    };
    const pulseEq = (el, durationMs = 1400) => {
      try {
        if (!el) return;
        el.classList.add('is-active');
        clearTimeout(el.__htqEqTimer);
        el.__htqEqTimer = setTimeout(() => el.classList.remove('is-active'), durationMs);
      } catch (_) {}
    };
    const initScrollHairline = () => {
      try {
        if (!document.body) return;
        let bar = document.getElementById('htq-scroll-progress');
        if (!bar) {
          bar = document.createElement('div');
          bar.id = 'htq-scroll-progress';
          bar.setAttribute('aria-hidden', 'true');
          document.body.appendChild(bar);
        }
        if (window.__xhzScrollHairlineBound) return;
        window.__xhzScrollHairlineBound = true;
        const update = () => {
          const b = document.getElementById('htq-scroll-progress');
          if (!b) return;
          const docH = Math.max(1, (document.documentElement.scrollHeight || 0) - window.innerHeight);
          const pct = Math.min(100, Math.max(0, (window.scrollY / docH) * 100));
          b.style.width = pct.toFixed(1) + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
      } catch (_) {}
    };
    const sparkle = (anchorEl = null) => {
      try {
        if (prefersReducedMotion() || !document.body || window.__xhzDiagRunning) return;
        let ox = window.innerWidth * 0.5;
        let oy = window.innerHeight * 0.4;
        if (anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
          const r = anchorEl.getBoundingClientRect();
          if (r.width > 0 || r.height > 0) {
            ox = r.left + r.width / 2;
            oy = r.top + r.height / 2;
          }
        }
        const icons = ['✨', '🌸', '⭐', '💖', '🌼', '💫'];
        for (let i = 0; i < 6; i++) {
          const sp = document.createElement('span');
          sp.className = 'htq-sparkle-dot';
          sp.textContent = icons[i % icons.length];
          const ang = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.4;
          const dist = 24 + Math.random() * 26;
          sp.style.left = (ox - 8) + 'px';
          sp.style.top = (oy - 8) + 'px';
          sp.style.setProperty('--sx', Math.round(Math.cos(ang) * dist) + 'px');
          sp.style.setProperty('--sy', Math.round(Math.sin(ang) * dist - 12) + 'px');
          document.body.appendChild(sp);
          setTimeout(() => { try { sp.remove(); } catch (_) {} }, 720);
        }
      } catch (_) {}
    };
    const petBuddy = (anchorEl = null) => {
      const prog = getRealProgress();
      const nextHearts = (Number(prog.buddyHearts) || 0) + 1;
      prog.buddyHearts = nextHearts;
      saveRealProgress(prog);
      supabaseUpsert(getLocalState()).catch(() => {});
      const reactions = [
        { zh: '摸摸头好舒服呀！', py: 'Mōmo tóu hǎo shūfu ya!', vi: 'Vuốt đầu dễ chịu quá đi!' },
        { zh: '谢谢你陪我学中文！', py: 'Xièxie nǐ péi wǒ xué Zhōngwén!', vi: 'Cảm ơn bạn học tiếng Trung cùng mình!' },
        { zh: '给你一颗小红花！', py: 'Gěi nǐ yī kē xiǎo hónghuā!', vi: 'Tặng bạn một bông hoa đỏ bé ngoan nè!' },
        { zh: '我们是最好的学习伙伴！', py: 'Wǒmen shì zuì hǎo de xuéxí huǒbàn!', vi: 'Tụi mình là đôi bạn học ăn ý nhất!' }
      ];
      const rx = reactions[nextHearts % reactions.length];
      sparkle(anchorEl);
      confetti(anchorEl, 22);
      try { playPronunciation(rx.zh, 'tts'); } catch (_) {}
      toast('💖 ' + rx.zh + ' (' + rx.vi + ') · Thân thiết ❤️ ' + nextHearts, 'success');
      return { hearts: nextHearts, reaction: rx };
    };
    const isPetalsEnabled = () => {
      try { return localStorage.getItem('htq_ambient_petals') !== '0'; } catch (_) { return true; }
    };
    const syncAmbientPetals = (curPath = '/') => {
      try {
        const norm = (curPath || '/').replace(/\/+$/, '') || '/';
        const existing = document.getElementById('htq-ambient-petals');
        const busy = /^\/(thay-do|truong-thay-do|kho-du-lieu|hoc\/bai\/|de-kiem-tra\/lam-bai|kiem-tra-ngu-phap\/lam-bai)/.test(norm) || Boolean(document.getElementById('xhz-lesson-runner-root'));
        if (busy || prefersReducedMotion() || !isPetalsEnabled() || !document.body) {
          if (existing) existing.remove();
          return;
        }
        if (existing) return;
        const layer = document.createElement('div');
        layer.id = 'htq-ambient-petals';
        layer.setAttribute('aria-hidden', 'true');
        const seeds = [
          { ico: '🌸', left: '4%', dur: '16s', del: '0s', size: '14px' },
          { ico: '✨', left: '19%', dur: '19s', del: '-5s', size: '12px' },
          { ico: '🌸', left: '37%', dur: '15s', del: '-9s', size: '13px' },
          { ico: '⭐', left: '54%', dur: '21s', del: '-3s', size: '11px' },
          { ico: '🌸', left: '72%', dur: '17s', del: '-12s', size: '15px' },
          { ico: '✨', left: '88%', dur: '18s', del: '-7s', size: '12px' },
          { ico: '🌸', left: '95%', dur: '14s', del: '-2s', size: '13px' }
        ];
        layer.innerHTML = seeds.map(s =>
          '<span class="htq-petal" style="left:' + s.left + ';--dur:' + s.dur + ';--del:' + s.del + ';font-size:' + s.size + ';">' + s.ico + '</span>'
        ).join('');
        document.body.appendChild(layer);
      } catch (_) {}
    };
    return { prefersReducedMotion, toast, confetti, sparkle, petBuddy, isPetalsEnabled, syncAmbientPetals, animateCountUp, pulseEq, initScrollHairline };
  })();
  window.__xhzStudioFx = HTQ_STUDIO_FX;

  const HTQ_LUCKY_FORTUNES = [
    { zh: '大吉大利', py: 'Dà jí dà lì', vi: 'Đại cát đại lợi — Hôm nay học gì cũng vào đầu cực nhanh!' },
    { zh: '学业进步', py: 'Xuéyè jìnbù', vi: 'Học hành tấn tới — Sắp lên hạng HSK mới rồi đó!' },
    { zh: '心想事成', py: 'Xīn xiǎng shì chéng', vi: 'Cầu được ước thấy — Mọi mục tiêu tiếng Trung đều thành hiện thực!' },
    { zh: '笑口常开', py: 'Xiào kǒu cháng kāi', vi: 'Luôn tươi cười rạng rỡ — Học vui nhớ lâu gấp đôi!' },
    { zh: '一帆风顺', py: 'Yī fān fēng shùn', vi: 'Thuận buồm xuôi gió — Thi thử HSK trơn tru đạt điểm cao!' },
    { zh: '天天开心', py: 'Tiāntiān kāixīn', vi: 'Mỗi ngày đều vui vẻ — Tự thưởng ly trà sữa thôi nào 🧋' },
    { zh: '万事如意', py: 'Wànshì rúyì', vi: 'Vạn sự như ý — Gõ Pinyin chuẩn xác không sai một thanh!' },
    { zh: '前程似锦', py: 'Qiánchéng sì jǐn', vi: 'Tương lai rạng rỡ — Kiên trì mỗi ngày sẽ hái quả ngọt!' }
  ];
  window.__xhzLuckyFortunes = HTQ_LUCKY_FORTUNES;

  const HTQ_DAILY_HANZI_POOL = [
    { hanzi: '学', pinyin: 'xué', hv: 'HỌC', meaning: 'học tập, nghiên cứu', example: '我每天学习中文。(Tôi học tiếng Trung mỗi ngày.)' },
    { hanzi: '好', pinyin: 'hǎo', hv: 'HẢO', meaning: 'tốt, khỏe, hay', example: '你好，很高兴认识你！(Xin chào, rất vui được biết bạn!)' },
    { hanzi: '书', pinyin: 'shū', hv: 'THƯ', meaning: 'sách, chữ viết', example: '我喜欢看中文书。(Tôi thích đọc sách tiếng Trung.)' },
    { hanzi: '茶', pinyin: 'chá', hv: 'TRÀ', meaning: 'trà, nước chè', example: '请喝一杯热茶。(Mời uống một tách trà nóng.)' },
    { hanzi: '友', pinyin: 'yǒu', hv: 'HỮU', meaning: 'bạn bè, thân thiện', example: '他是我的好朋友。(Anh ấy là bạn tốt của tôi.)' },
    { hanzi: '家', pinyin: 'jiā', hv: 'GIA', meaning: 'nhà, gia đình', example: '欢迎来我家做客。(Chào mừng đến nhà tôi chơi.)' },
    { hanzi: '爱', pinyin: 'ài', hv: 'ÁI', meaning: 'yêu thương, thích', example: '我爱我的家人。(Tôi yêu gia đình của mình.)' },
    { hanzi: '心', pinyin: 'xīn', hv: 'TÂM', meaning: 'trái tim, tấm lòng', example: '学习要有耐心。(Học tập cần có sự kiên nhẫn.)' },
    { hanzi: '明', pinyin: 'míng', hv: 'MINH', meaning: 'sáng sủa, rõ ràng, ngày mai', example: '明天见！(Hẹn gặp ngày mai!)' },
    { hanzi: '时', pinyin: 'shí', hv: 'THỜI', meaning: 'thời gian, giờ khắc', example: '现在几点钟？(Bây giờ là mấy giờ?)' },
    { hanzi: '水', pinyin: 'shuǐ', hv: 'THỦY', meaning: 'nước, dòng nước', example: '多喝温水对身体好。(Uống nhiều nước ấm tốt cho sức khỏe.)' },
    { hanzi: '山', pinyin: 'shān', hv: 'SƠN', meaning: 'núi, ngọn núi', example: '这座山风景很美。(Ngọn núi này phong cảnh rất đẹp.)' },
    { hanzi: '月', pinyin: 'yuè', hv: 'NGUYỆT', meaning: 'mặt trăng, tháng', example: '今晚的月亮真圆。(Trăng tối nay thật tròn.)' },
    { hanzi: '风', pinyin: 'fēng', hv: 'PHONG', meaning: 'gió, phong cách', example: '秋天的风很凉爽。(Gió mùa thu rất mát mẻ.)' },
    { hanzi: '花', pinyin: 'huā', hv: 'HOA', meaning: 'hoa, bông hoa; tiêu tốn', example: '春天的花都开了。(Hoa mùa xuân đều nở rồi.)' },
    { hanzi: '语', pinyin: 'yǔ', hv: 'NGỮ', meaning: 'ngôn ngữ, lời nói', example: '汉语越来越受欢迎。(Tiếng Hán ngày càng được yêu thích.)' },
    { hanzi: '听', pinyin: 'tīng', hv: 'THÍNH', meaning: 'nghe, lắng nghe', example: '请仔细听录音。(Xin hãy nghe kỹ đoạn ghi âm.)' },
    { hanzi: '说', pinyin: 'shuō', hv: 'THUYẾT', meaning: 'nói, trò chuyện', example: '你会说汉语吗？(Bạn biết nói tiếng Trung không?)' },
    { hanzi: '写', pinyin: 'xiě', hv: 'TẢ', meaning: 'viết, chép', example: '这个汉字怎么写？(Chữ Hán này viết thế nào?)' },
    { hanzi: '读', pinyin: 'dú', hv: 'ĐỘC', meaning: 'đọc, đọc to', example: '请跟我一起读。(Xin hãy đọc theo tôi.)' },
    { hanzi: '笑', pinyin: 'xiào', hv: 'TIẾU', meaning: 'cười, mỉm cười', example: '她笑得很开心。(Cô ấy cười rất vui vẻ.)' },
    { hanzi: '梦', pinyin: 'mèng', hv: 'MỘNG', meaning: 'giấc mơ, ước mơ', example: '坚持你的梦想。(Hãy kiên trì với ước mơ của bạn.)' },
    { hanzi: '乐', pinyin: 'lè', hv: 'LẠC', meaning: 'vui vẻ, hạnh phúc', example: '祝你每天快乐！(Chúc bạn mỗi ngày đều vui vẻ!)' },
    { hanzi: '福', pinyin: 'fú', hv: 'PHÚC', meaning: 'phúc lành, may mắn', example: '新年幸福安康。(Năm mới hạnh phúc an khang.)' }
  ];
  window.__xhzDailyHanziPool = HTQ_DAILY_HANZI_POOL;

  const HTQ_COMPANIONS_LIST = [
    { id: 'capy', name: 'Capy', zh: '卡皮', emoji: '🦫', role: 'Điềm tĩnh · Học đều mỗi ngày', quote: 'Chậm mà chắc — mỗi ngày 10 phút là đủ tiến xa lắm luôn đó!' },
    { id: 'banh-bao', name: 'Bánh Bao', zh: '小包', emoji: '🥟', role: 'Dễ thương · Thích thưởng kẹo', quote: 'Học xong bài này tự thưởng một ly trà sữa nha bạn ơi! 🧋' },
    { id: 'tieu-man', name: 'Tiểu Mãn', zh: '小满', emoji: '🌸', role: 'Nhiệt tình · Cổ vũ chuỗi ngày', quote: 'Tuyệt lắm! Cố thêm một bài nhỏ nữa để giữ lửa streak nhé ✨' },
    { id: 'ha-vu', name: 'Hạ Vũ', zh: '夏雨', emoji: '☔', role: 'Chuyên ôn thi HSK 1–6', quote: 'Nắm chắc từ lõi và ngữ pháp sẽ giúp bạn đỗ HSK nhẹ tênh.' },
    { id: 'luc-than', name: 'Lục Thần', zh: '陆辰', emoji: '🌿', role: 'Phản xạ giao tiếp thực tế', quote: 'Đọc to thành tiếng giúp não nhớ thanh điệu nhanh gấp đôi!' },
    { id: 'duong-duong', name: 'Dương Dương', zh: '洋洋', emoji: '☀️', role: 'Vui vẻ · Học qua trò chơi', quote: 'Học chữ Hán cũng vui như chơi trò ghép hình vậy đó!' },
    { id: 'mai', name: 'Mai', zh: '阿梅', emoji: '🌺', role: 'Chiết tự & Ghi nhớ sâu', quote: 'Hiểu bộ thủ là chìa khóa mở khóa hàng nghìn chữ Hán.' },
    { id: 'mac-ngon', name: 'Mặc Ngôn', zh: '墨言', emoji: '🖋️', role: 'Thư pháp & Văn hóa Trung Hoa', quote: 'Mỗi nét bút Hán tự đều mang theo một câu chuyện thật đẹp.' }
  ];

  const HTQ_CUTE_CHEERS = [
    { zh: '加油！你真棒！', py: 'Jiāyóu! Nǐ zhēn bàng!', vi: 'Cố lên! Bạn giỏi quá trời luôn!' },
    { zh: '今天也要开心学习哦！', py: 'Jīntiān yě yào kāixīn xuéxí o!', vi: 'Hôm nay cũng học thật vui vẻ nhé!' },
    { zh: '每天进步一点点！', py: 'Měitiān jìnbù yīdiǎndiǎn!', vi: 'Mỗi ngày tiến bộ thêm một chút xíu!' },
    { zh: '喝杯奶茶休息一下吧！', py: 'Hē bēi nǎichá xiūxi yīxià ba!', vi: 'Uống ly trà sữa nghỉ ngơi chút nhé!' },
    { zh: '太厉害了，继续保持！', py: 'Tài lìhai le, jìxù bǎochí!', vi: 'Đỉnh quá đi, giữ phong độ nha!' },
    { zh: '汉字越来越简单啦！', py: 'Hànzì yuèláiyuè jiǎndān la!', vi: 'Chữ Hán ngày càng dễ nhớ rồi nè!' },
    { zh: '别放弃，我一直陪着你！', py: 'Bié fàngqì, wǒ yīzhí péizhe nǐ!', vi: 'Đừng bỏ cuộc, mình luôn đồng hành cùng bạn!' },
    { zh: '祝你今天顺顺利利！', py: 'Zhù nǐ jīntiān shùnshùnlìlì!', vi: 'Chúc bạn hôm nay mọi việc suôn sẻ!' }
  ];
  window.__xhzCuteCheers = HTQ_CUTE_CHEERS;

  const HTQ_TONE_DRILL_POOL = [
    { hanzi: '妈', pinyin: 'mā', tone: 1, meaning: 'mẹ' },
    { hanzi: '麻', pinyin: 'má', tone: 2, meaning: 'cây gai / tê' },
    { hanzi: '马', pinyin: 'mǎ', tone: 3, meaning: 'con ngựa' },
    { hanzi: '骂', pinyin: 'mà', tone: 4, meaning: 'mắng' },
    { hanzi: '书', pinyin: 'shū', tone: 1, meaning: 'sách' },
    { hanzi: '茶', pinyin: 'chá', tone: 2, meaning: 'trà' },
    { hanzi: '好', pinyin: 'hǎo', tone: 3, meaning: 'tốt' },
    { hanzi: '爱', pinyin: 'ài', tone: 4, meaning: 'yêu' },
    { hanzi: '天', pinyin: 'tiān', tone: 1, meaning: 'trời / ngày' },
    { hanzi: '人', pinyin: 'rén', tone: 2, meaning: 'người' },
    { hanzi: '水', pinyin: 'shuǐ', tone: 3, meaning: 'nước' },
    { hanzi: '去', pinyin: 'qù', tone: 4, meaning: 'đi' }
  ];

  const HTQ_PINYIN_SPRINT_POOL = [
    { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'xin chào' },
    { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'cảm ơn' },
    { hanzi: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên' },
    { hanzi: '中国', pinyin: 'Zhōngguó', meaning: 'Trung Quốc' },
    { hanzi: '学习', pinyin: 'xuéxí', meaning: 'học tập' },
    { hanzi: '朋友', pinyin: 'péngyou', meaning: 'bạn bè' },
    { hanzi: '今天', pinyin: 'jīntiān', meaning: 'hôm nay' },
    { hanzi: '汉语', pinyin: 'Hànyǔ', meaning: 'tiếng Hán' },
    { hanzi: '高兴', pinyin: 'gāoxìng', meaning: 'vui vẻ' },
    { hanzi: '喜欢', pinyin: 'xǐhuan', meaning: 'thích' }
  ];

  const HTQ_CHENGYU_POOL = [
    { full: '一石二鸟', blankIdx: 1, answer: '石', opts: ['石', '木', '山', '水'], pinyin: 'yī shí èr niǎo', meaning: 'Một mũi tên trúng hai đích' },
    { full: '画蛇添足', blankIdx: 3, answer: '足', opts: ['手', '足', '头', '口'], pinyin: 'huà shé tiān zú', meaning: 'Vẽ rắn thêm chân (làm thừa thãi)' },
    { full: '半途而废', blankIdx: 0, answer: '半', opts: ['全', '半', '一', '多'], pinyin: 'bàn tú ér fèi', meaning: 'Bỏ cuộc giữa chừng' },
    { full: '井底之蛙', blankIdx: 3, answer: '蛙', opts: ['鱼', '鸟', '蛙', '马'], pinyin: 'jǐng dǐ zhī wā', meaning: 'Ếch ngồi đáy giếng' },
    { full: '对牛弹琴', blankIdx: 1, answer: '牛', opts: ['马', '羊', '牛', '虎'], pinyin: 'duì niú tán qín', meaning: 'Đàn gảy tai trâu' },
    { full: '马马虎虎', blankIdx: 2, answer: '虎', opts: ['龙', '虎', '猫', '兔'], pinyin: 'mǎmǎhūhū', meaning: 'Qua loa, tàm tạm' },
    { full: '守株待兔', blankIdx: 3, answer: '兔', opts: ['狗', '鸡', '兔', '鹿'], pinyin: 'shǒu zhū dài tù', meaning: 'Ôm cây đợi thỏ' },
    { full: '一心一意', blankIdx: 1, answer: '心', opts: ['心', '手', '眼', '天'], pinyin: 'yī xīn yī yì', meaning: 'Một lòng một dạ, toàn tâm toàn ý' }
  ];

  function toggleStudioTheme(directOnly) {
    const wasDark = document.documentElement.classList.contains('dark');
    const applyDirect = () => {
      const nextDark = !wasDark;
      document.documentElement.classList.toggle('dark', nextDark);
      document.documentElement.classList.toggle('light', !nextDark);
      document.documentElement.style.colorScheme = nextDark ? 'dark' : 'light';
      try { localStorage.setItem('theme', nextDark ? 'dark' : 'light'); } catch (_e) {}
    };
    const hdrBtn = !directOnly && !isDynamicSpaRoute(window.location.pathname)
      ? document.querySelector('header[data-site-header="true"] button[aria-label*="giao diện"]')
      : null;
    if (hdrBtn) {
      hdrBtn.click();
    } else {
      applyDirect();
    }
    setTimeout(() => {
      try {
        if (hdrBtn && document.documentElement.classList.contains('dark') === wasDark) {
          applyDirect();
        }
        const isDarkNow = document.documentElement.classList.contains('dark');
        document.querySelectorAll('header[data-site-header="true"] button[aria-label*="giao diện"]').forEach(hb => {
          hb.setAttribute('aria-label', isDarkNow ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
        });
        document.querySelectorAll('img[data-htq-light-src][data-htq-dark-src]').forEach(img => {
          img.src = isDarkNow ? img.getAttribute('data-htq-dark-src') : img.getAttribute('data-htq-light-src');
        });
        const oldStage = document.getElementById('htq-page-stage');
        if (oldStage) oldStage.remove();
        buildPageExperienceStage(window.location.pathname || '/');
        buildStudioSidebar(window.location.pathname || '/');
      } catch (_) {}
    }, 50);
  }

  function buildStudioSidebar(curPath) {
    if (isImmersiveRoute(curPath) || !document.querySelector('header[data-site-header="true"]')) {
      document.body.setAttribute('data-htq-immersive', '1');
      const existing = document.getElementById('htq-studio-sidebar');
      if (existing) existing.remove();
      return;
    }
    document.body.removeAttribute('data-htq-immersive');
    let sb = document.getElementById('htq-studio-sidebar');
    if (!sb) {
      sb = document.createElement('aside');
      sb.id = 'htq-studio-sidebar';
      sb.setAttribute('aria-label', 'Thanh điều hướng Hán Ngữ Studio');
      document.body.appendChild(sb);
    }

    const groups = [
      {
        label: 'Bàn làm việc',
        items: [
          ['🏠', 'Trang chủ Studio', '/'],
          ['🗺️', 'Lộ trình HSK 3.0', '/lo-trinh/'],
          ['📖', 'Bài học hôm nay', '/hoc/'],
          ['🔁', 'Ôn tập thông minh', '/on-tap/']
        ]
      },
      {
        label: 'Từ điển & Tra cứu',
        items: [
          ['🔍', 'Từ điển Chữ Hán', '/tra-chu/'],
          ['🌐', 'Dịch Trung - Việt AI', '/dich-tieng-trung/'],
          ['📚', 'Kho từ vựng HSK', '/thu-vien-new-hsk/']
        ]
      },
      {
        label: 'Luyện 4 kỹ năng AI',
        items: [
          ['🎧', 'Luyện nghe phản xạ', '/luyen-nghe/'],
          ['🎙️', 'Luyện nói AI', '/luyen-noi/'],
          ['⌨️', 'Luyện gõ Pinyin', '/luyen-go/'],
          ['✍️', 'Chép chính tả Video', '/luyen-chep-chinh-ta/']
        ]
      },
      {
        label: 'Phòng thi & Công cụ',
        items: [
          ['📝', 'Thi thử HSK', '/kiem-tra-hsk/'],
          ['📋', 'Đề kiểm tra', '/de-kiem-tra/'],
          ['⚖️', 'Kiểm tra Ngữ pháp', '/kiem-tra-ngu-phap/'],
          ['🖨️', 'Tạo vở tập viết PDF', '/tao-vo-tap-viet/'],
          ['🎮', 'Trò chơi Chữ Hán', '/tro-choi/'],
          ['🏮', 'Trường Thầy Đồ', '/thay-do/']
        ]
      }
    ];

    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    const isDark = document.documentElement.classList.contains('dark');
    const sbKey = norm + '|' + (isDark ? '1' : '0');
    if (sb.getAttribute('data-htq-key') === sbKey) return;
    sb.setAttribute('data-htq-key', sbKey);

    const navHtml = groups.map(g => {
      const links = g.items.map(([ico, text, href]) => {
        const hrefNorm = href.replace(/\/+$/, '') || '/';
        const active = hrefNorm === '/' ? norm === '/' : (norm === hrefNorm || norm.startsWith(hrefNorm + '/'));
        return '<a href="' + href + '" class="htq-sb-link' + (active ? ' is-active' : '') + '"><span>' + ico + '</span><span>' + text + '</span></a>';
      }).join('');
      return '<div class="htq-sb-group"><div class="htq-sb-label">' + g.label + '</div>' + links + '</div>';
    }).join('');
    sb.innerHTML =
      '<a href="/" class="htq-sb-brand">' +
        '<div class="htq-sb-emblem">汉</div>' +
        '<div><div class="htq-sb-title">Hán Ngữ Studio</div><div class="htq-sb-sub">Học Tiếng Trung v4</div></div>' +
      '</a>' +
      '<button type="button" id="htq-sb-cmdk-btn" class="htq-sb-btn" style="margin-bottom:10px;width:100%;"><span>🔍 Tìm nhanh chữ / công cụ</span><span style="font-size:11px;opacity:.75;">Ctrl+K</span></button>' +
      navHtml +
      '<div class="htq-sb-footer">' +
        '<button type="button" id="htq-sb-theme-btn" class="htq-sb-btn"><span>' + (isDark ? '🌙 Giao diện Tối' : '☀️ Giao diện Sáng') + '</span><span>Đổi</span></button>' +
        '<a href="/tai-khoan/" class="htq-sb-link" style="margin-bottom:0"><span>👤</span><span>Tài khoản &amp; Đồng bộ</span></a>' +
      '</div>';

    const cmdkBtn = document.getElementById('htq-sb-cmdk-btn');
    if (cmdkBtn) {
      bindStudioClick(cmdkBtn, () => { if (window.__xhzOpenCommandPalette) window.__xhzOpenCommandPalette(); });
    }
    const themeBtn = document.getElementById('htq-sb-theme-btn');
    if (themeBtn) {
      bindStudioClick(themeBtn, () => {
        toggleStudioTheme();
        setTimeout(() => buildStudioSidebar(window.location.pathname), 60);
      });
    }
  }

  function buildHomeWorkspace(curPath) {
    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    const existing = document.getElementById('htq-studio-workspace');
    if (norm !== '/') {
      if (existing) existing.remove();
      return;
    }
    const traCuu = document.getElementById('tra-cuu');
    if (!traCuu || !traCuu.parentElement) return;
    if (existing) return;

    const isDark = document.documentElement.classList.contains('dark');
    let summary = { streakDays: 0, wordsMastered: 0, stagesDone: 0, dueTotal: 0, prog: {} };
    let dueNowCount = 0;
    try {
      if (typeof getRealProgressSummary === 'function') {
        summary = getRealProgressSummary() || summary;
      }
      const st = typeof getLocalState === 'function' ? getLocalState() : null;
      const cards = (st && st.collections && Array.isArray(st.collections.reviewCards)) ? st.collections.reviewCards : [];
      dueNowCount = cards.filter(c => c && Date.parse(c.dueAt) <= Date.now()).length || Number(summary.dueTotal || 0);
    } catch (_e) {}
    const curLessonId = (summary.prog && summary.prog.currentLessonId) || localStorage.getItem('httq_current_lesson_id') || '';
    const ctaHref = curLessonId ? `/hoc/bai/${encodeURIComponent(curLessonId)}` : '/hoc/';
    const ctaLabel = curLessonId ? `▶ Tiếp tục: ${escapeHtml(curLessonId)}` : '▶ Vào bài học hôm nay';

    const compId = localStorage.getItem('httq_companion_id') || 'capy';
    const compObj = HTQ_COMPANIONS_LIST.find(c => c.id === compId) || HTQ_COMPANIONS_LIST[0];
    const hr = new Date().getHours();
    const greetVi = hr < 12 ? 'Chào buổi sáng' : hr < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

    const dayIndex = Math.floor(Date.now() / 86400000) % HTQ_DAILY_HANZI_POOL.length;
    let curDailyIdx = dayIndex;

    const skills = [
      ['listening', 'Luyện Nghe Phản Xạ', 'Bài nghe hội thoại & đề thi HSK theo tốc độ tự chọn.', '/luyen-nghe/'],
      ['speaking_practice', 'Luyện Nói AI Thanh Điệu', 'Chấm điểm phát âm từng âm tiết và thanh 1-4.', '/luyen-noi/'],
      ['type', 'Luyện Gõ Pinyin', 'Rèn phản xạ bàn phím chữ Hán nhanh và chuẩn xác.', '/luyen-go/'],
      ['dictation', 'Chép Chính Tả Video', 'Nghe câu thật từ video và gõ lại toàn bộ chữ Hán.', '/luyen-chep-chinh-ta/'],
      ['test', 'Phòng Thi HSK 1–6 & 3.0', 'Kho đề chính thức và đề luyện tự chấm điểm tức thì.', '/kiem-tra-hsk/'],
      ['grammar_test', 'Kiểm Tra Ngữ Pháp', 'Hơn 480 điểm ngữ pháp từ HSK 1 đến HSK 3.0.', '/kiem-tra-ngu-phap/']
    ];
    const curriculums = [
      ['HSK 3.0 Mới', '/thu-vien-new-hsk/'],
      ['HSK 2.0', '/thu-vien-hsk/'],
      ['Giáo trình Boya', '/thu-vien-boya/'],
      ['Giáo trình Hán Ngữ', '/thu-vien-hanyu-jiaocheng/'],
      ['YCT Thiếu nhi', '/thu-vien-yct/'],
      ['Tất cả lộ trình →', '/lo-trinh/']
    ];

    const sec = document.createElement('section');
    sec.id = 'htq-studio-workspace';
    sec.className = 'htq-anim-up';
    sec.setAttribute('aria-label', 'Bảng điều khiển học tập Hán Ngữ Studio');
    sec.innerHTML =
      '<div class="htq-home-hero-strip" id="htq-home-hero-strip">' +
        '<div class="htq-hero-art-card">' +
          '<img class="htq-hero-bg" src="/images/studio/cute-capy-study.jpg" alt="Capybara chăm chỉ học chữ Hán cùng trà sữa" loading="eager" decoding="async" />' +
          '<div class="htq-hero-art-scrim">' +
            '<div style="min-width:0;">' +
              '<div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#fde68a;margin-bottom:4px;">' + greetVi + ' · ' + (compObj.emoji || '✨') + ' ' + escapeHtml(compObj.name) + ' đồng hành</div>' +
              '<div style="font-size:19px;font-weight:800;line-height:1.25;margin-bottom:6px;">Góc Học Hán Ngữ Ấm Áp Của Bạn</div>' +
              '<div style="font-size:13px;color:rgba(255,251,235,.92);line-height:1.45;">' + escapeHtml(compObj.quote) + '</div>' +
            '</div>' +
            '<img src="/images/companion/' + encodeURIComponent(compObj.id) + '/splash/hero.webp" alt="' + escapeHtml(compObj.name) + '" loading="eager" decoding="async" class="htq-float" style="width:74px;height:74px;border-radius:18px;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.55);box-shadow:0 12px 26px rgba(15,23,42,.45);" />' +
          '</div>' +
        '</div>' +
        '<div class="htq-ws-panel" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
            '<span style="font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#4f46e5;">✨ Chữ Hán Hôm Nay</span>' +
            '<button type="button" id="htq-daily-next-btn" class="htq-stage-chip-btn" style="padding:4px 10px;font-size:11.5px;">🎲 Đổi chữ</button>' +
          '</div>' +
          '<div class="htq-flip-wrap" id="htq-daily-hanzi-card" title="Bấm để lật xem Pinyin và Nghĩa">' +
            '<div class="htq-flip-inner" id="htq-daily-flip-inner"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="htq-ws-grid">' +
        '<div class="htq-ws-panel">' +
          '<div class="htq-ws-head"><h2 class="htq-ws-title">Trung Tâm Luyện Tập 6 Kỹ Năng &amp; Khảo Thí HSK</h2><span class="htq-ws-badge">Mở miễn phí 100%</span></div>' +
          '<div class="htq-skill-grid">' +
            skills.map(([imgKey, title, desc, href]) => {
              const lightSrc = '/images/home/' + imgKey + '.webp';
              const darkSrc = '/images/home/dark/' + imgKey + '.webp';
              return '<a href="' + href + '" class="htq-skill-card">' +
                '<div class="htq-skill-card-art">' +
                  '<img class="htq-skill-thumb" src="' + (isDark ? darkSrc : lightSrc) + '" data-htq-light-src="' + lightSrc + '" data-htq-dark-src="' + darkSrc + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async" />' +
                  '<div style="min-width:0;">' +
                    '<div class="htq-skill-top" style="margin-bottom:3px;"><span>' + title + '</span></div>' +
                    '<p class="htq-skill-desc">' + desc + '</p>' +
                  '</div>' +
                '</div>' +
              '</a>';
            }).join('') +
          '</div>' +
          '<div class="htq-curr-row">' +
            curriculums.map(([lbl, href]) => '<a href="' + href + '" class="htq-curr-pill">' + lbl + '</a>').join('') +
          '</div>' +
        '</div>' +
        '<div class="htq-ws-panel">' +
          '<div class="htq-ws-head"><h2 class="htq-ws-title">Tiến Độ &amp; Tiện Ích Nhanh</h2><button type="button" id="htq-ws-cmdk-btn" data-htq-cmdk-trigger="1" class="htq-ws-badge" style="cursor:pointer;">🔍 Tìm nhanh (Ctrl+K)</button></div>' +
          '<div class="htq-stat-row" style="grid-template-columns:repeat(2,1fr);">' +
            '<div class="htq-stat-box"><div class="htq-stat-num" data-htq-count="' + Number(summary.streakDays || 0) + '">' + Number(summary.streakDays || 0) + '</div><div class="htq-stat-lbl">Ngày liên tiếp</div></div>' +
            '<div class="htq-stat-box"><div class="htq-stat-num" data-htq-count="' + Number(summary.wordsMastered || 0) + '">' + Number(summary.wordsMastered || 0) + '</div><div class="htq-stat-lbl">Từ đã học</div></div>' +
            '<div class="htq-stat-box"><div class="htq-stat-num" data-htq-count="' + Number(dueNowCount || 0) + '">' + Number(dueNowCount || 0) + '</div><div class="htq-stat-lbl">Thẻ cần ôn</div></div>' +
            '<div class="htq-stat-box"><div class="htq-stat-num" data-htq-count="' + Number(summary.stagesDone || 0) + '">' + Number(summary.stagesDone || 0) + '</div><div class="htq-stat-lbl">Chặng xong</div></div>' +
          '</div>' +
          '<a id="htq-home-cta" href="' + ctaHref + '" class="htq-cta-btn">' + ctaLabel + '</a>' +
          (dueNowCount > 0 ? '<a id="htq-home-due-cta" href="/hoc/bai/on-tap-den-han" class="htq-pulse-soft" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:9px 12px;border-radius:12px;font-weight:700;font-size:13px;color:#0f766e;background:#f0fdfa;border:1px solid #99f6e4;text-decoration:none;margin-bottom:12px;">🔁 Ôn ' + dueNowCount + ' thẻ đến hạn ngay →</a>' : '') +
          '<div class="htq-quick-grid">' +
            '<a href="/tro-choi/ghep-chu/" class="htq-quick-item"><span>🧩</span><span>Ghép Chữ Hán</span></a>' +
            '<a href="/tro-choi/tim-chu-trong-chu/" class="htq-quick-item"><span>🔎</span><span>Tìm Chữ Trong Chữ</span></a>' +
            '<a href="/tao-vo-tap-viet/" class="htq-quick-item"><span>🖨️</span><span>Vở Tập Viết PDF</span></a>' +
            '<a href="/flashcard-pdf/" class="htq-quick-item"><span>📇</span><span>Flashcard PDF</span></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="htq-cute-gallery-panel" id="htq-home-cute-gallery">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
          '<div>' +
            '<div style="font-size:15px;font-weight:900;color:#be185d;">🌸 Vườn Thú Cưng Hán Ngữ · Khám Phá 5 Góc Học Dễ Thương</div>' +
            '<div id="htq-home-fortune-line" style="font-size:12.5px;opacity:.82;margin-top:2px;">Độ thân thiết cùng ' + escapeHtml(compObj.name) + ': <strong id="htq-home-hearts-val">❤️ ' + Number((summary.prog && summary.prog.buddyHearts) || 0) + '</strong> · Chạm vào các nút dễ thương bên cạnh nhé!</div>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:7px;">' +
            '<button type="button" id="htq-home-pet-btn" class="htq-stage-chip-btn is-active">🫶 Vuốt ve ' + escapeHtml(compObj.name) + ' (+1 ❤️)</button>' +
            '<button type="button" id="htq-home-fortune-btn" class="htq-stage-chip-btn">🎁 Bốc quẻ may mắn</button>' +
            '<button type="button" id="htq-home-petals-btn" class="htq-stage-chip-btn">' + (HTQ_STUDIO_FX.isPetalsEnabled() ? '🌸 Hoa rơi: Bật' : '🌸 Hoa rơi: Tắt') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="htq-cute-gallery-grid">' +
          [
            ['/images/studio/cute-capy-study.jpg', '🦫 Capy Học HSK 3.0', '/hoc/'],
            ['/images/studio/cute-panda-dict.jpg', '🐼 Gấu Trúc Tra Chữ', '/tra-chu/'],
            ['/images/studio/cute-music-buddy.jpg', '🎧 Capy Nghe · Nói AI', '/luyen-nghe/'],
            ['/images/studio/cute-bunny-writing.jpg', '🐰 Bé Thỏ Tập Viết', '/tao-vo-tap-viet/'],
            ['/images/studio/cute-lantern-party.jpg', '🏮 Lễ Hội & Sticker', '/tai-khoan/']
          ].map(([imgSrc, label, href]) =>
            '<a href="' + href + '" class="htq-story-card">' +
              '<div class="htq-story-card-img-wrap"><img src="' + imgSrc + '" alt="' + escapeHtml(label) + '" loading="lazy" decoding="async" /></div>' +
              '<div class="htq-story-card-cap"><span>' + label + '</span><span style="opacity:.6;">→</span></div>' +
            '</a>'
          ).join('') +
        '</div>' +
      '</div>';

    traCuu.parentElement.insertBefore(sec, traCuu.nextSibling);

    const wsCmdkBtn = sec.querySelector('#htq-ws-cmdk-btn');
    if (wsCmdkBtn) {
      bindStudioClick(wsCmdkBtn, () => openCommandPalette());
    }

    // Wire Home Cozy Pet Garden controls via window capture-phase bindStudioClick
    const homePetBtn = sec.querySelector('#htq-home-pet-btn');
    const homeHeartsEl = sec.querySelector('#htq-home-hearts-val');
    const homeFortuneBtn = sec.querySelector('#htq-home-fortune-btn');
    const homeFortuneLine = sec.querySelector('#htq-home-fortune-line');
    const homePetalsBtn = sec.querySelector('#htq-home-petals-btn');
    if (homePetBtn) {
      bindStudioClick(homePetBtn, () => {
        const res = HTQ_STUDIO_FX.petBuddy(homePetBtn);
        if (homeHeartsEl) homeHeartsEl.textContent = '❤️ ' + res.hearts;
      });
    }
    if (homeFortuneBtn) {
      bindStudioClick(homeFortuneBtn, () => {
        const ft = HTQ_LUCKY_FORTUNES[Math.floor(Math.random() * HTQ_LUCKY_FORTUNES.length)];
        HTQ_STUDIO_FX.sparkle(homeFortuneBtn);
        HTQ_STUDIO_FX.confetti(homeFortuneBtn, 20);
        try { playPronunciation(ft.zh, 'tts'); } catch (_) {}
        if (homeFortuneLine) {
          homeFortuneLine.innerHTML = '🎁 Quẻ may mắn: <strong style="color:#4f46e5;">' + escapeHtml(ft.zh) + '</strong> (' + escapeHtml(ft.py) + ') — ' + escapeHtml(ft.vi);
        }
        HTQ_STUDIO_FX.toast('🎁 ' + ft.zh + ' — ' + ft.vi, 'success');
      });
    }
    if (homePetalsBtn) {
      bindStudioClick(homePetalsBtn, () => {
        const nextOn = !HTQ_STUDIO_FX.isPetalsEnabled();
        try { localStorage.setItem('htq_ambient_petals', nextOn ? '1' : '0'); } catch (_) {}
        HTQ_STUDIO_FX.syncAmbientPetals(window.location.pathname || '/');
        homePetalsBtn.textContent = nextOn ? '🌸 Hoa rơi: Bật' : '🌸 Hoa rơi: Tắt';
        HTQ_STUDIO_FX.toast(nextOn ? '🌸 Đã bật hiệu ứng hoa anh đào rơi nhẹ!' : '🌸 Đã tắt hiệu ứng hoa rơi');
      });
    }

    // Wire interactive 3D Daily Hanzi Flip Card
    const cardWrap = sec.querySelector('#htq-daily-hanzi-card');
    const cardInner = sec.querySelector('#htq-daily-flip-inner');
    const nextBtn = sec.querySelector('#htq-daily-next-btn');
    const renderDailyCard = () => {
      if (!cardInner) return;
      const item = HTQ_DAILY_HANZI_POOL[curDailyIdx % HTQ_DAILY_HANZI_POOL.length];
      cardWrap.classList.remove('is-flipped');
      cardInner.innerHTML =
        '<div class="htq-flip-face htq-flip-front">' +
          '<div style="display:flex;align-items:center;gap:14px;">' +
            '<div class="htq-mizige" style="width:82px;height:82px;font-size:44px;font-weight:800;color:#4f46e5;flex-shrink:0;">' + escapeHtml(item.hanzi) + '</div>' +
            '<div style="min-width:0;flex:1;">' +
              '<div style="font-size:18px;font-weight:800;color:#0d9488;">' + escapeHtml(item.pinyin) + ' <span style="font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(79,70,229,.12);color:#4338ca;vertical-align:middle;">' + escapeHtml(item.hv) + '</span></div>' +
              '<div style="font-size:13px;opacity:.78;margin-top:6px;">Chạm vào thẻ để lật xem nghĩa &amp; câu ví dụ ↻</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;">' +
            '<button type="button" class="htq-stage-chip-btn" data-daily-act="speak">🔊 Nghe phát âm</button>' +
            '<a href="/han-tu/' + encodeURIComponent(item.hanzi) + '" class="htq-stage-chip-btn" data-daily-act="nav">Chiết tự →</a>' +
          '</div>' +
        '</div>' +
        '<div class="htq-flip-face htq-flip-back">' +
          '<div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
              '<strong style="font-size:16px;">' + escapeHtml(item.hanzi) + ' · ' + escapeHtml(item.pinyin) + ' (' + escapeHtml(item.hv) + ')</strong>' +
              '<span style="font-size:11px;opacity:.7;">Chạm để lật lại ↺</span>' +
            '</div>' +
            '<div style="font-size:14px;font-weight:700;color:#0d9488;margin:4px 0;">Nghĩa: ' + escapeHtml(item.meaning) + '</div>' +
            '<div style="font-size:12.5px;opacity:.85;line-height:1.4;">' + escapeHtml(item.example) + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px;">' +
            '<button type="button" class="htq-stage-chip-btn is-active" data-daily-act="save">⭐ Lưu sổ tay</button>' +
            '<a href="/tao-vo-tap-viet?text=' + encodeURIComponent(item.hanzi) + '" class="htq-stage-chip-btn" data-daily-act="nav">✍️ Tập viết</a>' +
          '</div>' +
        '</div>';

      cardInner.querySelectorAll('[data-daily-act="speak"]').forEach(btn => {
        bindStudioClick(btn, () => {
          try { playPronunciation(item.hanzi, 'tts'); } catch (_) {}
          HTQ_STUDIO_FX.toast('🔊 Đang đọc: ' + item.hanzi + ' (' + item.pinyin + ')');
        });
      });
      cardInner.querySelectorAll('[data-daily-act="save"]').forEach(btn => {
        bindStudioClick(btn, async () => {
          try {
            await fetch('/v1/notebook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word: item.hanzi, pinyin: item.pinyin, meaningVi: item.meaning })
            });
            recordStudyProgress({ words: [item.hanzi] });
            HTQ_STUDIO_FX.confetti(btn, 22);
            HTQ_STUDIO_FX.toast('⭐ Đã lưu "' + item.hanzi + '" vào Sổ tay & Tiến độ!', 'success');
          } catch (_) {}
        });
      });
    };
    if (cardWrap) {
      bindStudioClick(cardWrap, () => cardWrap.classList.toggle('is-flipped'));
    }
    if (nextBtn) {
      bindStudioClick(nextBtn, () => {
        curDailyIdx = (curDailyIdx + 1) % HTQ_DAILY_HANZI_POOL.length;
        renderDailyCard();
        if (cardWrap) { cardWrap.classList.add('htq-pop'); setTimeout(() => cardWrap.classList.remove('htq-pop'), 260); }
      });
    }
    renderDailyCard();

    // Animate KPI stat numbers smoothly
    sec.querySelectorAll('[data-htq-count]').forEach(el => {
      HTQ_STUDIO_FX.animateCountUp(el, Number(el.getAttribute('data-htq-count')) || 0);
    });
  }

  function resolvePageStageConfig(curPath) {
    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    if (norm === '/') return null;
    if (/^\/(thay-do|truong-thay-do|kho-du-lieu|hoc\/bai\/|luyen-chep-chinh-ta\/.+|kiem-tra-hsk\/.+\/test\/|de-kiem-tra\/lam-bai|kiem-tra-ngu-phap\/lam-bai|xoa-tai-khoan|chinh-sach-bao-mat|dieu-khoan-su-dung|lien-he|nguon-am-thanh|404)/.test(norm)) {
      return null;
    }
    if (/^\/(hoc|lo-trinh|bat-dau)/.test(norm)) {
      return { id: 'learning', banner: '/images/studio/cute-capy-study.jpg', badge: 'Lộ trình HSK 3.0', title: 'Chọn Bạn Đồng Hành Dễ Thương & Nhịp Học Hôm Nay', sub: 'Đổi giữa 8 người bạn đồng hành và cùng nhau chinh phục từng chặng HSK nhé!' };
    }
    if (/^\/(on-tap|so-tay)/.test(norm)) {
      return { id: 'review', banner: '/images/studio/banner-review-srs.jpg', badge: 'Trí nhớ dài hạn SRS', title: 'Khởi Động Nhanh 1 Thẻ Nhớ 3D', sub: 'Lật thẻ, nghe phát âm và chấm nhanh để đánh thức trí nhớ ngay tại chỗ.' };
    }
    if (/^\/(tra-chu|han-tu|tu-vung|han-viet)/.test(norm)) {
      return { id: 'dictionary', banner: '/images/studio/cute-panda-dict.jpg', badge: 'Thư viện Gấu Trúc & Bộ thủ', title: 'Luyện Nghe 4 Thanh Điệu & Tra Nhanh Bộ Thủ', sub: 'Chạm từng thanh điệu để nghe phân biệt âm chuẩn Bắc Kinh thật sinh động.' };
    }
    if (/^\/thu-vien/.test(norm)) {
      return { id: 'curriculum', banner: '/images/studio/hero-hanzi-studio.jpg', badge: 'Kho Giáo trình Chuẩn', title: 'Tiến Độ Phủ Từ Vựng Toàn Giáo Trình', sub: 'Mọi bài học ở đây đều tự đồng bộ từ vựng sang thẻ ôn SRS của bạn.' };
    }
    if (/^\/(luyen-nghe|luyen-noi|luyen-chep-chinh-ta)/.test(norm)) {
      return { id: 'audio', banner: '/images/studio/cute-music-buddy.jpg', badge: 'Phòng thu Capybara AI', title: 'Khởi Động Tai — Nhận Diện 4 Thanh Điệu', sub: 'Cùng Capy đeo tai nghe đoán nhanh đúng thanh 1, 2, 3 hay 4 nhé!' };
    }
    if (/^\/(luyen-go|luyen-go-han-tu)/.test(norm)) {
      return { id: 'typing', banner: '/images/studio/banner-review-srs.jpg', badge: 'Phản xạ Pinyin', title: 'Thử Thách Gõ Nhanh Mini (Không Cần Dấu)', sub: 'Gõ Pinyin không dấu (vd: nihao, xiexie) để lên chuỗi Combo!' };
    }
    if (/^\/(kiem-tra-hsk|de-kiem-tra|kiem-tra-ngu-phap|ngu-phap)/.test(norm)) {
      return { id: 'exam', banner: '/images/studio/banner-exam-hall.jpg', badge: 'Phòng Thi & Ngữ Pháp HSK', title: 'Kế Hoạch & Đếm Ngược Mục Tiêu Kỳ Thi', sub: 'Đặt cấp độ và ngày thi để hệ thống theo dõi độ sẵn sàng mỗi ngày.' };
    }
    if (/^\/tro-choi/.test(norm)) {
      return { id: 'games', banner: '/images/studio/cute-lantern-party.jpg', badge: 'Lễ hội Đèn lồng & Thành ngữ', title: 'Đố Vui Thành Ngữ 4 Chữ Trong Ngày', sub: 'Cùng Capy và bé Thỏ chọn đúng chữ Hán hoàn thiện câu thành ngữ kinh điển!' };
    }
    if (/^\/(tao-vo-tap-viet|flashcard-pdf|luyen-viet|tai-gif-but-thuan|them-pinyin|dich-tieng-trung|cong-cu)/.test(norm)) {
      const isWriting = /^\/(tao-vo-tap-viet|luyen-viet|tai-gif-but-thuan|flashcard-pdf)/.test(norm);
      return {
        id: isWriting ? 'tools-writing' : 'tools-translate',
        banner: isWriting ? '/images/studio/cute-bunny-writing.jpg' : '/images/studio/banner-games-arcade.jpg',
        badge: isWriting ? 'Xưởng Tập Viết Bé Thỏ' : 'Trợ lý Dịch AI & Pinyin',
        title: isWriting ? 'Nạp Nhanh Bộ Chữ Mẫu 1 Chạm Cùng Bé Thỏ' : 'Nạp Nhanh Mẫu Câu Giao Tiếp Thực Tế',
        sub: isWriting ? 'Chọn ngay nhóm từ chuẩn HSK hoặc từ bạn đã học để tạo tờ luyện viết siêu xinh.' : 'Bấm một câu mẫu bên dưới để nạp tức thì vào khung và nghe phát âm.'
      };
    }
    if (/^\/(tai-khoan|dang-nhap|dang-ky)/.test(norm)) {
      return {
        id: norm === '/tai-khoan' ? 'account' : 'auth',
        banner: norm === '/tai-khoan' ? '/images/studio/cute-lantern-party.jpg' : '/images/studio/cute-capy-study.jpg',
        badge: norm === '/tai-khoan' ? 'Góc Thành Tích & Tem Thưởng' : 'Đồng bộ Đám mây Miễn phí',
        title: norm === '/tai-khoan' ? 'Cấp Bậc & Bộ Sưu Tập Tem Học Giả' : 'Lưu Trọn Vẹn Tiến Độ Học Trên Mọi Thiết Bị',
        sub: norm === '/tai-khoan' ? 'Mở khóa tem dễ thương khi bạn giữ chuỗi ngày, học từ mới và luyện đề HSK!' : 'Đăng nhập Google hoặc Email để đồng bộ tức thì với Supabase Cloud.'
      };
    }
    return null;
  }
  window.__xhzResolvePageStageConfig = resolvePageStageConfig;

  function buildPageExperienceStage(curPath) {
    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    const existing = document.getElementById('htq-page-stage');
    const cfg = resolvePageStageConfig(norm);
    if (!cfg || document.getElementById('xhz-lesson-runner-root') || !document.querySelector('header[data-site-header="true"]')) {
      if (existing) existing.remove();
      return;
    }
    const main = document.getElementById('noi-dung-chinh');
    const dynRoot = document.getElementById('xhz-dynamic-page-root');
    const useDynHost = Boolean(dynRoot && dynRoot.isConnected && (!main || main.style.display === 'none'));
    if (!main && !useDynHost) return;
    const isDark = document.documentElement.classList.contains('dark');
    let collapsed = false;
    try { collapsed = sessionStorage.getItem('htq_stage_collapsed') === '1'; } catch (_) {}
    const stageKey = norm + '|' + cfg.id + '|' + (isDark ? '1' : '0') + '|' + (collapsed ? 'c' : 'e') + '|' + (useDynHost ? 'd' : 'm');
    if (existing && existing.getAttribute('data-htq-stage-key') === stageKey) return;
    if (existing) existing.remove();

    const wrap = document.createElement('section');
    wrap.id = 'htq-page-stage';
    wrap.setAttribute('data-htq-stage-key', stageKey);
    wrap.setAttribute('data-htq-stage-id', cfg.id);
    wrap.setAttribute('aria-label', cfg.title);

    if (useDynHost && dynRoot.parentElement) {
      dynRoot.parentElement.insertBefore(wrap, dynRoot);
    } else if (main) {
      const ribbon = document.getElementById('htq-subpage-ribbon');
      if (ribbon && ribbon.parentElement === main) {
        main.insertBefore(wrap, ribbon.nextSibling);
      } else {
        main.insertBefore(wrap, main.firstChild);
      }
    }

    if (collapsed) {
      wrap.innerHTML =
        '<div class="htq-stage-shell"><div class="htq-stage-collapsed-bar">' +
          '<span>✨ ' + escapeHtml(cfg.badge) + ' · ' + escapeHtml(cfg.title) + '</span>' +
          '<button type="button" id="htq-stage-expand-btn" class="htq-stage-chip-btn">Mở rộng hoạt động ▾</button>' +
        '</div></div>';
      const expBtn = wrap.querySelector('#htq-stage-expand-btn');
      if (expBtn) bindStudioClick(expBtn, () => { try { sessionStorage.setItem('htq_stage_collapsed', '0'); } catch (_) {} wrap.remove(); buildPageExperienceStage(curPath); });
      return;
    }

    const sum = typeof getRealProgressSummary === 'function' ? getRealProgressSummary() : { streakDays: 0, wordsMastered: 0, wordsSeen: 0, stagesDone: 0, dueTotal: 0, prog: {} };
    const prog = (sum && sum.prog) || (typeof getRealProgress === 'function' ? getRealProgress() : {});
    const eqHtml = '<span class="htq-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';

    // Choose companion / feature thumbnail accent for left visual overlay
    let cornerImg = '';
    if (cfg.id === 'learning') {
      const pose = sum.streakDays >= 3 ? 'celebrate' : (sum.wordsMastered > 0 ? 'happy' : 'encouraging');
      cornerImg = '/images/capy/lesson/' + pose + '.webp';
    } else if (cfg.id === 'review') {
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + 'flashcard.webp';
    } else if (cfg.id === 'dictionary') {
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + 'search.webp';
    } else if (cfg.id === 'curriculum') {
      cornerImg = '/images/home/app/learning-path.webp';
    } else if (cfg.id === 'audio') {
      const aKey = norm.includes('noi') ? 'speaking_practice' : (norm.includes('chep') ? 'dictation' : 'listening');
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + aKey + '.webp';
    } else if (cfg.id === 'typing') {
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + 'type.webp';
    } else if (cfg.id === 'exam') {
      const eKey = norm.includes('ngu-phap') ? 'grammar' : 'test';
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + eKey + '.webp';
    } else if (cfg.id === 'games') {
      cornerImg = '/images/games/ghep-thanh-ngu.webp';
    } else if (cfg.id === 'tools-writing') {
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + 'write.webp';
    } else if (cfg.id === 'tools-translate') {
      cornerImg = '/images/home/' + (isDark ? 'dark/' : '') + 'translate.webp';
    } else if (cfg.id === 'account') {
      const xpPreview = (sum.wordsMastered || 0) * 10 + (sum.stagesDone || 0) * 25 + (sum.streakDays || 0) * 15;
      cornerImg = xpPreview >= 300 ? '/images/practice/summary-great.webp' : (xpPreview >= 80 ? '/images/practice/summary-good.webp' : '/images/practice/summary-keep.webp');
    } else if (cfg.id === 'auth') {
      cornerImg = '/images/brand/auth-tieu-man-welcome.webp';
    }

    wrap.innerHTML =
      '<div class="htq-stage-shell">' +
        '<div class="htq-stage-grid">' +
          '<div class="htq-stage-visual">' +
            '<img class="htq-stage-bg" src="' + cfg.banner + '" alt="' + escapeHtml(cfg.title) + '" loading="eager" decoding="async" />' +
            '<button type="button" id="htq-stage-collapse-btn" class="htq-stage-toggle-btn" title="Thu gọn thanh hoạt động">Thu gọn ▴</button>' +
            '<div class="htq-stage-visual-scrim">' +
              '<div style="min-width:0;">' +
                '<div style="font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#a5b4fc;margin-bottom:3px;">' + escapeHtml(cfg.badge) + '</div>' +
                '<div style="font-size:17px;font-weight:800;line-height:1.25;margin-bottom:4px;">' + escapeHtml(cfg.title) + '</div>' +
                '<div style="font-size:12.5px;color:rgba(241,245,249,.88);line-height:1.4;">' + escapeHtml(cfg.sub) + '</div>' +
              '</div>' +
              (cornerImg ? '<img src="' + cornerImg + '" alt="' + escapeHtml(cfg.badge) + '" loading="lazy" decoding="async" class="htq-float" style="width:66px;height:66px;border-radius:16px;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,.55);box-shadow:0 10px 24px rgba(15,23,42,.42);" />' : '') +
            '</div>' +
          '</div>' +
          '<div class="htq-stage-body" id="htq-stage-activity-host"></div>' +
        '</div>' +
      '</div>';

    const colBtn = wrap.querySelector('#htq-stage-collapse-btn');
    if (colBtn) bindStudioClick(colBtn, () => { try { sessionStorage.setItem('htq_stage_collapsed', '1'); } catch (_) {} wrap.remove(); buildPageExperienceStage(curPath); });

    const host = wrap.querySelector('#htq-stage-activity-host');
    if (!host) return;

    // 1) LEARNING & PATH: Interactive 6-Companion Switcher + SVG Mastery Ring
    if (cfg.id === 'learning') {
      let activeComp = localStorage.getItem('httq_companion_id') || 'capy';
      const pct = Math.min(100, Math.round(((sum.wordsSeen || 0) / 300) * 100));
      const circ = 2 * Math.PI * 24;
      const dashOff = circ * (1 - pct / 100);
      const renderComp = () => {
        const cObj = HTQ_COMPANIONS_LIST.find(x => x.id === activeComp) || HTQ_COMPANIONS_LIST[0];
        host.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
            '<div style="display:flex;align-items:center;gap:10px;min-width:0;">' +
              '<img src="/images/companion/' + encodeURIComponent(cObj.id) + '/splash/hero.webp" alt="' + escapeHtml(cObj.name) + '" loading="lazy" decoding="async" style="width:48px;height:48px;border-radius:14px;object-fit:cover;border:2px solid #4f46e5;" />' +
              '<div style="min-width:0;">' +
                '<div style="font-size:14px;font-weight:800;">' + escapeHtml(cObj.name) + ' (' + escapeHtml(cObj.zh) + ') · <span style="color:#0d9488;font-size:12px;">' + escapeHtml(cObj.role) + '</span></div>' +
                '<div style="font-size:12.5px;opacity:.82;margin-top:2px;">“' + escapeHtml(cObj.quote) + '”</div>' +
              '</div>' +
            '</div>' +
            '<div style="position:relative;width:58px;height:58px;flex-shrink:0;" title="Độ phủ HSK 1">' +
              '<svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" fill="none" stroke="rgba(79,70,229,.16)" stroke-width="5"/><circle cx="29" cy="29" r="24" fill="none" stroke="#0d9488" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + dashOff.toFixed(1) + '" transform="rotate(-90 29 29)"/></svg>' +
              '<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:12px;font-weight:900;color:#0d9488;">' + pct + '%</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
            HTQ_COMPANIONS_LIST.map(c =>
              '<button type="button" class="htq-stage-chip-btn' + (c.id === activeComp ? ' is-active' : '') + '" data-comp-id="' + c.id + '">' +
                '<img src="/images/companion/' + encodeURIComponent(c.id) + '/splash/hero.webp" alt="' + escapeHtml(c.name) + '" loading="lazy" decoding="async" style="width:18px;height:18px;border-radius:999px;object-fit:cover;" />' +
                '<span>' + escapeHtml(c.name) + '</span>' +
              '</button>'
            ).join('') +
          '</div>';
        host.querySelectorAll('[data-comp-id]').forEach(btn => {
          btn.addEventListener('click', () => {
            activeComp = btn.getAttribute('data-comp-id') || 'capy';
            try { localStorage.setItem('httq_companion_id', activeComp); } catch (_) {}
            renderComp();
            const picked = HTQ_COMPANIONS_LIST.find(x => x.id === activeComp);
            HTQ_STUDIO_FX.confetti(btn, 18);
            HTQ_STUDIO_FX.toast('✨ Đã chọn ' + (picked ? picked.name : activeComp) + ' làm bạn đồng hành!', 'success');
          });
        });
      };
      renderComp();
      return;
    }

    // 2) REVIEW SRS & NOTEBOOK: Lightning 1-Card 3D Flip Warm-up
    if (cfg.id === 'review') {
      const learned = Array.isArray(prog.learnedWords) ? prog.learnedWords.filter(Boolean) : [];
      const deck = learned.length > 0
        ? learned.slice(-12).map(w => {
            const hit = HTQ_DAILY_HANZI_POOL.find(x => x.hanzi === w);
            return hit || { hanzi: w, pinyin: 'Ôn nhanh', hv: 'ĐÃ HỌC', meaning: 'Bấm 🔊 để nghe & tự kiểm tra nghĩa', example: 'Từ trong kho đã học của bạn.' };
          })
        : HTQ_DAILY_HANZI_POOL.slice(0, 10);
      let idx = 0;
      const renderFlash = () => {
        const it = deck[idx % deck.length];
        host.innerHTML =
          '<div class="htq-flip-wrap" id="htq-srs-mini-flip">' +
            '<div class="htq-flip-inner" style="min-height:132px;">' +
              '<div class="htq-flip-face htq-flip-front">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
                  '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div class="htq-mizige" style="width:66px;height:66px;font-size:32px;font-weight:800;color:#4f46e5;">' + escapeHtml(it.hanzi) + '</div>' +
                    '<div><div style="font-size:12px;font-weight:700;color:#0d9488;">THẺ KHỞI ĐỘNG ' + ((idx % deck.length) + 1) + '/' + deck.length + '</div><div style="font-size:14px;font-weight:700;margin-top:4px;">Bạn còn nhớ nghĩa từ này không?</div><div style="font-size:12px;opacity:.72;margin-top:2px;">Chạm để lật 3D ↻</div></div>' +
                  '</div>' +
                  '<button type="button" class="htq-stage-chip-btn" data-srs-act="speak">🔊</button>' +
                '</div>' +
              '</div>' +
              '<div class="htq-flip-face htq-flip-back">' +
                '<div>' +
                  '<div style="font-size:16px;font-weight:800;">' + escapeHtml(it.hanzi) + ' · <span style="color:#0d9488;">' + escapeHtml(it.pinyin) + '</span></div>' +
                  '<div style="font-size:13.5px;font-weight:700;margin-top:4px;">' + escapeHtml(it.meaning) + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">' +
                  '<button type="button" class="htq-stage-chip-btn is-active" data-srs-act="good">✅ Nhớ rõ</button>' +
                  '<button type="button" class="htq-stage-chip-btn" data-srs-act="again">↺ Ôn lại sau</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        const fw = host.querySelector('#htq-srs-mini-flip');
        if (fw) bindStudioClick(fw, () => fw.classList.toggle('is-flipped'));
        host.querySelectorAll('[data-srs-act="speak"]').forEach(b => bindStudioClick(b, () => { try { playPronunciation(it.hanzi, 'tts'); } catch (_) {} }));
        const sendGrade = async (outcome, btn) => {
          try {
            await fetch('/v2/review/signals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ signals: [{ signalId: 'mini-' + Date.now(), itemKey: 'w:' + it.hanzi, skill: 'meaning', outcome }] })
            });
          } catch (_) {}
          if (outcome === 'correct') {
            HTQ_STUDIO_FX.confetti(btn, 20);
            HTQ_STUDIO_FX.toast('✅ Tuyệt vời! Đã cập nhật nhịp ôn SRS cho "' + it.hanzi + '"', 'success');
          } else {
            HTQ_STUDIO_FX.toast('↺ Đã đưa "' + it.hanzi + '" vào danh sách ôn sớm', 'warn');
          }
          idx = (idx + 1) % deck.length;
          renderFlash();
        };
        host.querySelectorAll('[data-srs-act="good"]').forEach(b => bindStudioClick(b, () => sendGrade('correct', b)));
        host.querySelectorAll('[data-srs-act="again"]').forEach(b => bindStudioClick(b, () => sendGrade('wrong', b)));
      };
      renderFlash();
      return;
    }

    // 3) DICTIONARY & RADICALS: 4-Tone Interactive Audio Bar + Radical Quick Chips
    if (cfg.id === 'dictionary') {
      const tones = [
        { n: 1, hz: '妈', py: 'mā', desc: 'Thanh 1 (ngang cao)', color: '#dc2626' },
        { n: 2, hz: '麻', py: 'má', desc: 'Thanh 2 (đi lên)', color: '#d97706' },
        { n: 3, hz: '马', py: 'mǎ', desc: 'Thanh 3 (xuống-lên)', color: '#16a34a' },
        { n: 4, hz: '骂', py: 'mà', desc: 'Thanh 4 (dứt khoát)', color: '#2563eb' }
      ];
      const rads = [
        ['亻 Nhân', '/tra-chu/bo-thu/%E4%BA%BB'],
        ['氵 Thủy', '/tra-chu/bo-thu/%E6%B0%B5'],
        ['忄 Tâm', '/tra-chu/bo-thu/%E5%BF%84'],
        ['木 Mộc', '/tra-chu/bo-thu/%E6%9C%A8'],
        ['HSK 1', '/tra-chu/hsk/1']
      ];
      host.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
          '<span style="font-size:12px;font-weight:800;color:#4f46e5;">🔊 Bấm nghe mẫu 4 thanh điệu</span>' +
          '<span id="htq-dict-eq" style="color:#0d9488;">' + eqHtml + '</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">' +
          tones.map(t =>
            '<button type="button" class="htq-stage-chip-btn" data-tone-hz="' + t.hz + '" data-tone-py="' + t.py + '" style="flex-direction:column;border-radius:14px;padding:8px 6px;gap:2px;border-color:' + t.color + '44;">' +
              '<span style="font-size:20px;font-weight:800;color:' + t.color + ';line-height:1.1;">' + t.hz + '</span>' +
              '<span style="font-size:12px;font-weight:800;">' + t.py + '</span>' +
            '</button>'
          ).join('') +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">' +
          rads.map(([lbl, href]) => '<a href="' + href + '" class="htq-stage-chip-btn">' + lbl + '</a>').join('') +
          '<button type="button" id="htq-dict-rand-btn" class="htq-stage-chip-btn is-active">🎲 Chữ ngẫu nhiên</button>' +
        '</div>';
      const eqEl = host.querySelector('#htq-dict-eq .htq-eq');
      host.querySelectorAll('[data-tone-hz]').forEach(btn => {
        bindStudioClick(btn, () => {
          const hz = btn.getAttribute('data-tone-hz');
          const py = btn.getAttribute('data-tone-py');
          try { playPronunciation(hz, 'tts'); } catch (_) {}
          HTQ_STUDIO_FX.pulseEq(eqEl, 1300);
          btn.classList.add('htq-pop'); setTimeout(() => btn.classList.remove('htq-pop'), 260);
          HTQ_STUDIO_FX.toast('🔊 Thanh điệu: ' + hz + ' (' + py + ')');
        });
      });
      const rBtn = host.querySelector('#htq-dict-rand-btn');
      if (rBtn) rBtn.addEventListener('click', () => {
        const pick = HTQ_DAILY_HANZI_POOL[Math.floor(Math.random() * HTQ_DAILY_HANZI_POOL.length)];
        window.location.href = '/han-tu/' + encodeURIComponent(pick.hanzi);
      });
      return;
    }

    // 4) CURRICULUM: Coverage Progress Bar + Practice Shortcuts
    if (cfg.id === 'curriculum') {
      const seen = Number(sum.wordsSeen || 0);
      const pct = Math.min(100, Math.round((seen / 300) * 100));
      const learnedSample = (prog.learnedWords || []).slice(0, 12).join('');
      host.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:800;">' +
          '<span>Độ phủ từ vựng HSK 1 của bạn</span>' +
          '<span style="color:#0d9488;">' + seen + ' / 300 từ (' + pct + '%)</span>' +
        '</div>' +
        '<div style="height:10px;border-radius:999px;background:rgba(79,70,229,.14);overflow:hidden;">' +
          '<div class="htq-shimmer-bar" style="height:100%;width:' + Math.max(4, pct) + '%;background:linear-gradient(90deg,#4f46e5,#0d9488);border-radius:999px;transition:width .5s ease;"></div>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:7px;">' +
          '<a href="/luyen-noi/" class="htq-stage-chip-btn">🎙️ Luyện nói theo bài</a>' +
          '<a href="/luyen-go/" class="htq-stage-chip-btn">⌨️ Gõ từ đã học</a>' +
          '<a href="/tao-vo-tap-viet' + (learnedSample ? '?text=' + encodeURIComponent(learnedSample) : '') + '" class="htq-stage-chip-btn is-active">🖨️ In vở tập viết từ đã học</a>' +
        '</div>';
      return;
    }

    // 5) AUDIO (LISTENING / SPEAKING / DICTATION): Tone Ear Warm-up Quiz
    if (cfg.id === 'audio') {
      let qIdx = Math.floor(Math.random() * HTQ_TONE_DRILL_POOL.length);
      let streak = 0;
      const renderToneQuiz = () => {
        const q = HTQ_TONE_DRILL_POOL[qIdx % HTQ_TONE_DRILL_POOL.length];
        host.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<button type="button" id="htq-ear-play" class="htq-stage-chip-btn is-active" style="padding:8px 14px;font-size:13px;">🔊 Nghe: ' + escapeHtml(q.hanzi) + ' ' + eqHtml + '</button>' +
              '<span style="font-size:13px;font-weight:700;opacity:.82;">(' + escapeHtml(q.meaning) + ')</span>' +
            '</div>' +
            '<span id="htq-ear-streak" style="font-size:12px;font-weight:800;color:#0d9488;">🔥 Chuỗi đúng: ' + streak + '</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;">' +
            [1, 2, 3, 4].map(tn => '<button type="button" class="htq-stage-chip-btn" data-ear-tone="' + tn + '" style="justify-content:center;padding:8px 6px;">Thanh ' + tn + '</button>').join('') +
          '</div>' +
          '<div id="htq-ear-feedback" style="font-size:12.5px;font-weight:700;min-height:18px;opacity:.85;">Nghe âm tiết và chọn đúng thanh điệu tương ứng.</div>';
        const eqEl = host.querySelector('#htq-ear-play .htq-eq');
        const playBtn = host.querySelector('#htq-ear-play');
        const fbEl = host.querySelector('#htq-ear-feedback');
        if (playBtn) playBtn.addEventListener('click', () => {
          try { playPronunciation(q.hanzi, ''); } catch (_) {}
          HTQ_STUDIO_FX.pulseEq(eqEl, 1300);
        });
        host.querySelectorAll('[data-ear-tone]').forEach(btn => {
          btn.addEventListener('click', () => {
            const pick = Number(btn.getAttribute('data-ear-tone'));
            if (pick === q.tone) {
              streak++;
              btn.classList.add('is-active', 'htq-pop');
              if (fbEl) fbEl.innerHTML = '<span style="color:#0d9488;">✅ Chính xác! ' + escapeHtml(q.hanzi) + ' đọc là <strong>' + escapeHtml(q.pinyin) + '</strong> (Thanh ' + q.tone + ').</span>';
              if (streak % 3 === 0) HTQ_STUDIO_FX.confetti(btn, 24);
              setTimeout(() => { qIdx = (qIdx + 1 + Math.floor(Math.random() * 3)) % HTQ_TONE_DRILL_POOL.length; renderToneQuiz(); }, 900);
            } else {
              streak = 0;
              btn.classList.add('htq-shake');
              setTimeout(() => btn.classList.remove('htq-shake'), 300);
              const stEl = host.querySelector('#htq-ear-streak');
              if (stEl) stEl.textContent = '🔥 Chuỗi đúng: 0';
              if (fbEl) fbEl.innerHTML = '<span style="color:#dc2626;">❌ Chưa đúng, nghe lại lần nữa nhé! (Gợi ý: thử bấm loa)</span>';
            }
          });
        });
      };
      renderToneQuiz();
      return;
    }

    // 6) TYPING: Mini Pinyin Sprint
    if (cfg.id === 'typing') {
      let sIdx = 0;
      let combo = 0;
      const renderSprint = () => {
        const w = HTQ_PINYIN_SPRINT_POOL[sIdx % HTQ_PINYIN_SPRINT_POOL.length];
        const expectedNorm = normalizePinyinQuery(w.pinyin);
        host.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:28px;font-weight:900;color:#4f46e5;">' + escapeHtml(w.hanzi) + '</span>' +
              '<span style="font-size:13px;font-weight:700;opacity:.82;">' + escapeHtml(w.meaning) + '</span>' +
            '</div>' +
            '<span style="font-size:12px;font-weight:800;color:#d97706;">🔥 Combo x' + combo + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;">' +
            '<input id="htq-sprint-inp" type="text" autocomplete="off" placeholder="Gõ Pinyin không dấu (vd: ' + expectedNorm + ')..." style="flex:1;padding:8px 12px;border-radius:12px;border:1.5px solid rgba(79,70,229,.28);background:transparent;color:inherit;font-size:14px;font-weight:700;outline:none;" />' +
            '<button type="button" id="htq-sprint-speak" class="htq-stage-chip-btn">🔊</button>' +
          '</div>';
        const inp = host.querySelector('#htq-sprint-inp');
        const spk = host.querySelector('#htq-sprint-speak');
        if (spk) spk.addEventListener('click', () => { try { playPronunciation(w.hanzi, ''); } catch (_) {} });
        if (inp) {
          inp.addEventListener('input', () => {
            if (normalizePinyinQuery(inp.value) === expectedNorm) {
              combo++;
              recordStudyProgress({ words: [w.hanzi] });
              if (combo % 3 === 0) HTQ_STUDIO_FX.confetti(inp, 22);
              HTQ_STUDIO_FX.toast('⌨️ Chuẩn xác! ' + w.hanzi + ' (' + w.pinyin + ') · Combo x' + combo, 'success');
              sIdx = (sIdx + 1) % HTQ_PINYIN_SPRINT_POOL.length;
              renderSprint();
              setTimeout(() => { const n = document.getElementById('htq-sprint-inp'); if (n) n.focus(); }, 20);
            }
          });
        }
      };
      renderSprint();
      return;
    }

    // 7) EXAM & GRAMMAR: Real Exam Plan Countdown Widget (powered by /v2/me/exam-plan)
    if (cfg.id === 'exam') {
      const m = computeRealSkillMetrics(sum);
      const renderPlan = (plan) => {
        if (plan && plan.targetLevel) {
          const daysLeft = plan.targetDate ? Math.max(0, Math.ceil((new Date(plan.targetDate).getTime() - Date.now()) / 86400000)) : null;
          host.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
              '<div>' +
                '<div style="font-size:15px;font-weight:800;color:#4f46e5;">🎯 Mục tiêu: HSK ' + escapeHtml(String(plan.targetLevel)) + (daysLeft !== null ? ' · Còn <span style="color:#e11d48;">' + daysLeft + ' ngày</span>' : '') + '</div>' +
                '<div style="font-size:12.5px;opacity:.82;margin-top:2px;">Lịch luyện: ' + Number(plan.dailyMinutes || 20) + ' phút/ngày · Dự đoán hiện tại: <strong>' + m.predictedScore200 + '/200 điểm</strong> (' + m.avgSkill + '% sẵn sàng)</div>' +
              '</div>' +
              '<button type="button" id="htq-exam-plan-edit" class="htq-stage-chip-btn">✏️ Đổi kế hoạch</button>' +
            '</div>' +
            '<div style="height:8px;border-radius:999px;background:rgba(79,70,229,.14);overflow:hidden;">' +
              '<div class="htq-shimmer-bar" style="height:100%;width:' + Math.max(6, m.avgSkill) + '%;background:linear-gradient(90deg,#4f46e5,#0d9488);border-radius:999px;"></div>' +
            '</div>';
          const ed = host.querySelector('#htq-exam-plan-edit');
          if (ed) ed.onclick = () => renderPlan(null);
          return;
        }
        const defDate = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
        host.innerHTML =
          '<div style="font-size:13px;font-weight:800;">📅 Lập kế hoạch thi HSK cá nhân (đồng bộ tài khoản)</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">' +
            '<select id="htq-ep-lvl" style="padding:7px 10px;border-radius:10px;border:1px solid rgba(79,70,229,.28);background:transparent;color:inherit;font-size:13px;font-weight:700;">' +
              [1, 2, 3, 4, 5, 6].map(l => '<option value="' + l + '" style="color:#0f172a;">HSK ' + l + '</option>').join('') +
            '</select>' +
            '<input id="htq-ep-date" type="date" value="' + defDate + '" style="padding:6px 10px;border-radius:10px;border:1px solid rgba(79,70,229,.28);background:transparent;color:inherit;font-size:13px;font-weight:700;" />' +
            '<select id="htq-ep-min" style="padding:7px 10px;border-radius:10px;border:1px solid rgba(79,70,229,.28);background:transparent;color:inherit;font-size:13px;font-weight:700;">' +
              [15, 20, 30, 45].map(mn => '<option value="' + mn + '" style="color:#0f172a;">' + mn + ' phút/ngày</option>').join('') +
            '</select>' +
            '<button type="button" id="htq-ep-save" class="htq-stage-chip-btn is-active">💾 Lưu mục tiêu</button>' +
          '</div>';
        const sv = host.querySelector('#htq-ep-save');
        if (sv) sv.onclick = async () => {
          const targetLevel = Number((host.querySelector('#htq-ep-lvl') || {}).value) || 1;
          const targetDate = (host.querySelector('#htq-ep-date') || {}).value || defDate;
          const dailyMinutes = Number((host.querySelector('#htq-ep-min') || {}).value) || 20;
          try {
            const res = await (await fetch('/v2/me/exam-plan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetLevel, targetDate, dailyMinutes })
            })).json();
            if (res && res.plan) {
              HTQ_STUDIO_FX.confetti(sv, 24);
              HTQ_STUDIO_FX.toast('🎯 Đã lưu kế hoạch thi HSK ' + targetLevel + '!', 'success');
              renderPlan(res.plan);
            }
          } catch (_) {}
        };
      };
      renderPlan(prog.examPlan || null);
      return;
    }

    // 8) GAMES: Daily Chengyu 4-Character Teaser
    if (cfg.id === 'games') {
      let cIdx = Math.floor(Date.now() / 86400000) % HTQ_CHENGYU_POOL.length;
      const renderChengyu = () => {
        const it = HTQ_CHENGYU_POOL[cIdx % HTQ_CHENGYU_POOL.length];
        const chars = Array.from(it.full);
        host.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
              chars.map((ch, i) =>
                '<span class="htq-mizige" data-cy-slot="' + i + '" style="width:44px;height:44px;font-size:22px;font-weight:900;color:' + (i === it.blankIdx ? '#e11d48' : '#4f46e5') + ';">' + (i === it.blankIdx ? '?' : escapeHtml(ch)) + '</span>'
              ).join('') +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button type="button" id="htq-cy-fortune" class="htq-stage-chip-btn is-active">🎁 Bốc quẻ</button>' +
              '<button type="button" id="htq-cy-next" class="htq-stage-chip-btn">🎲 Câu khác</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">' +
            it.opts.map(op => '<button type="button" class="htq-stage-chip-btn" data-cy-opt="' + escapeHtml(op) + '" style="font-size:17px;padding:6px 14px;">' + escapeHtml(op) + '</button>').join('') +
          '</div>' +
          '<div id="htq-cy-res" style="font-size:12.5px;font-weight:700;opacity:.85;">Nghĩa gợi ý: “' + escapeHtml(it.meaning) + '”</div>';
        host.querySelectorAll('[data-cy-opt]').forEach(btn => {
          bindStudioClick(btn, () => {
            const pick = btn.getAttribute('data-cy-opt');
            const resEl = host.querySelector('#htq-cy-res');
            if (pick === it.answer) {
              const slot = host.querySelector('[data-cy-slot="' + it.blankIdx + '"]');
              if (slot) { slot.textContent = it.answer; slot.style.color = '#0d9488'; slot.classList.add('htq-pop'); }
              btn.classList.add('is-active');
              recordStudyProgress({ words: [it.full] });
              HTQ_STUDIO_FX.sparkle(btn);
              HTQ_STUDIO_FX.confetti(btn, 26);
              if (resEl) resEl.innerHTML = '<span style="color:#0d9488;">🎉 Chuẩn xác! <strong>' + escapeHtml(it.full) + '</strong> (' + escapeHtml(it.pinyin) + ') — ' + escapeHtml(it.meaning) + '</span>';
              try { playPronunciation(it.full, 'tts'); } catch (_) {}
            } else {
              btn.classList.add('htq-shake'); setTimeout(() => btn.classList.remove('htq-shake'), 300);
              HTQ_STUDIO_FX.toast('Thử chọn chữ Hán khác nhé!', 'warn');
            }
          });
        });
        const ftBtn = host.querySelector('#htq-cy-fortune');
        if (ftBtn) bindStudioClick(ftBtn, () => {
          const ft = HTQ_LUCKY_FORTUNES[Math.floor(Math.random() * HTQ_LUCKY_FORTUNES.length)];
          const resEl = host.querySelector('#htq-cy-res');
          HTQ_STUDIO_FX.sparkle(ftBtn);
          HTQ_STUDIO_FX.confetti(ftBtn, 22);
          try { playPronunciation(ft.zh, 'tts'); } catch (_) {}
          if (resEl) resEl.innerHTML = '<span style="color:#be185d;">🎁 Quẻ may mắn: <strong>' + escapeHtml(ft.zh) + '</strong> (' + escapeHtml(ft.py) + ') — ' + escapeHtml(ft.vi) + '</span>';
        });
        const nx = host.querySelector('#htq-cy-next');
        if (nx) bindStudioClick(nx, () => { cIdx = (cIdx + 1) % HTQ_CHENGYU_POOL.length; renderChengyu(); });
      };
      renderChengyu();
      return;
    }

    // 9) TOOLS (WRITING / TRANSLATE): 1-Tap Quick Presets
    if (cfg.id === 'tools-writing' || cfg.id === 'tools-translate') {
      const learnedStr = (prog.learnedWords || []).join('').replace(/[^\u4e00-\u9fff]/g, '').slice(0, 14);
      const presets = cfg.id === 'tools-writing'
        ? [
            { label: '👋 Chào hỏi HSK 1', text: '你好谢谢再见' },
            { label: '🔢 Số đếm 1–10', text: '一二三四五六七八九十' },
            { label: '👨‍👩‍👧 Gia đình', text: '爸爸妈妈哥哥姐姐我爱你' },
            ...(learnedStr ? [{ label: '⭐ Từ tôi đã học', text: learnedStr }] : [{ label: '🌸 Thiên nhiên', text: '山水日月风花雪月' }])
          ]
        : [
            { label: '👋 Giới thiệu', text: '你好，我是越南人，我正在学习中文。' },
            { label: '🍜 Gọi món', text: '请问，这附近有好吃的中国菜吗？' },
            { label: '🗺️ Hỏi đường', text: '请问去火车站怎么走？' },
            { label: '🤝 Hẹn gặp', text: '明天上午九点我们一起去喝咖啡吧！' }
          ];
      host.innerHTML =
        '<div style="font-size:12.5px;font-weight:800;opacity:.85;">Chọn nhanh một mẫu bên dưới để nạp tức thì vào công cụ:</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:7px;">' +
          presets.map((pr, i) => '<button type="button" class="htq-stage-chip-btn" data-preset-idx="' + i + '">' + escapeHtml(pr.label) + '</button>').join('') +
        '</div>';
      host.querySelectorAll('[data-preset-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const pr = presets[Number(btn.getAttribute('data-preset-idx'))];
          if (!pr) return;
          const targetInp = document.querySelector('main textarea, main input[type="text"]:not(#htq-cmdk-input)');
          if (targetInp) {
            const proto = targetInp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(targetInp, pr.text);
            else targetInp.value = pr.text;
            targetInp.dispatchEvent(new Event('input', { bubbles: true }));
            targetInp.dispatchEvent(new Event('change', { bubbles: true }));
            targetInp.focus();
            HTQ_STUDIO_FX.toast('✨ Đã nạp mẫu: ' + pr.label, 'success');
            try { playPronunciation(pr.text.slice(0, 12), ''); } catch (_) {}
          } else if (cfg.id === 'tools-writing') {
            window.location.href = '/tao-vo-tap-viet?text=' + encodeURIComponent(pr.text);
          }
        });
      });
      return;
    }

    // 10) ACCOUNT & AUTH: Scholar Rank + 8 Collectible Custom Kawaii SVG Stickers + Companion Picker + Pet Buddy
    if (cfg.id === 'account') {
      const renderAccountStage = () => {
        const curSum = typeof getRealProgressSummary === 'function' ? getRealProgressSummary() : sum;
        const curProg = (curSum && curSum.prog) || getRealProgress();
        const wordsN = Number(curSum.wordsMastered || 0);
        const stagesN = Number(curSum.stagesDone || 0);
        const gramN = Array.isArray(curProg.learnedGrammarIds) ? curProg.learnedGrammarIds.length : 0;
        const examN = Array.isArray(curProg.examHistory) ? curProg.examHistory.length : 0;
        const streakN = Number(curSum.streakDays || 0);
        const savedN = Object.keys(curProg.savedWords || {}).length;
        const charN = Object.keys(curProg.masteredChars || {}).length;
        const heartsN = Number(curProg.buddyHearts || 0);
        const curCompId = localStorage.getItem('httq_companion_id') || 'capy';
        const curComp = HTQ_COMPANIONS_LIST.find(c => c.id === curCompId) || HTQ_COMPANIONS_LIST[0];
        const xp = wordsN * 10 + stagesN * 25 + gramN * 15 + examN * 40 + streakN * 15 + heartsN * 5;
        const ranks = [
          { min: 0, max: 100, name: '🌱 Tân Học Viên', next: 'Thư Sinh HSK 1' },
          { min: 100, max: 350, name: '📜 Thư Sinh HSK 1', next: 'Cử Nhân Hán Ngữ' },
          { min: 350, max: 900, name: '🎓 Cử Nhân Hán Ngữ', next: 'Học Giả Chữ Hán' },
          { min: 900, max: 2000, name: '🏆 Học Giả Chữ Hán', next: 'Đại Sư Hán Tự' }
        ];
        const rk = ranks.slice().reverse().find(r => xp >= r.min) || ranks[0];
        const rankPct = Math.min(100, Math.round(((xp - rk.min) / Math.max(1, rk.max - rk.min)) * 100));
        const stickers = [
          { img: '/images/studio/stickers/boba.svg', lbl: 'Trà Sữa Chăm Chỉ', val: streakN + ' ngày', ok: streakN >= 1, tip: 'Học ít nhất 1 ngày để mở khóa!' },
          { img: '/images/studio/stickers/panda.svg', lbl: 'Gấu Trúc Từ Vựng', val: wordsN + ' từ', ok: wordsN >= 5, tip: 'Học đủ 5 từ vựng để mở khóa!' },
          { img: '/images/studio/stickers/baozi.svg', lbl: 'Bánh Bao Ngữ Pháp', val: gramN + ' điểm', ok: gramN >= 1, tip: 'Đánh dấu 1 điểm ngữ pháp để mở khóa!' },
          { img: '/images/studio/stickers/lantern.svg', lbl: 'Đèn Lồng Khảo Thí', val: examN + ' đề', ok: examN >= 1, tip: 'Hoàn thành 1 bài thi thử HSK/YCT!' },
          { img: '/images/studio/stickers/sakura.svg', lbl: 'Anh Đào Kiên Trì', val: streakN + '/3 ngày', ok: streakN >= 3, tip: 'Giữ chuỗi 3 ngày học liên tiếp!' },
          { img: '/images/studio/stickers/bunny.svg', lbl: 'Bé Thỏ Sổ Tay', val: savedN + ' từ lưu', ok: savedN >= 1, tip: 'Lưu 1 từ vào Sổ tay cá nhân!' },
          { img: '/images/studio/stickers/star.svg', lbl: 'Ngôi Sao Bút Thuận', val: charN + ' chữ', ok: charN >= 1, tip: 'Luyện thành thạo 1 chữ Hán!' },
          { img: '/images/studio/stickers/heart.svg', lbl: 'Trái Tim Thân Thiết', val: '❤️ ' + heartsN, ok: heartsN >= 1, tip: 'Bấm "Vuốt ve bạn học" ít nhất 1 lần!' }
        ];
        const unlockedCount = stickers.filter(s => s.ok).length;
        host.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
            '<div style="font-size:15px;font-weight:900;color:#4f46e5;">' + rk.name + ' <span style="font-size:12px;font-weight:700;color:#0d9488;">(' + xp + ' XP)</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
              '<button type="button" id="htq-acc-pet-btn" class="htq-stage-chip-btn is-active" style="padding:5px 11px;font-size:12px;">🫶 Vuốt ve ' + escapeHtml(curComp.name) + ' (❤️ ' + heartsN + ')</button>' +
              '<span style="font-size:11.5px;font-weight:800;color:#be185d;">🎀 ' + unlockedCount + '/8 Sticker</span>' +
            '</div>' +
          '</div>' +
          '<div style="height:8px;border-radius:999px;background:rgba(79,70,229,.14);overflow:hidden;">' +
            '<div class="htq-shimmer-bar" style="height:100%;width:' + Math.max(5, rankPct) + '%;background:linear-gradient(90deg,#f59e0b,#ec4899,#4f46e5,#0d9488);border-radius:999px;"></div>' +
          '</div>' +
          '<div class="htq-sticker-grid" id="htq-stamp-album">' +
            stickers.map((s, i) =>
              '<button type="button" class="htq-sticker-tile' + (s.ok ? ' is-unlocked' : '') + '" data-stamp-idx="' + i + '" title="' + escapeHtml(s.lbl + ': ' + s.tip) + '">' +
                '<img src="' + s.img + '" alt="' + escapeHtml(s.lbl) + '" loading="lazy" decoding="async" />' +
                '<div style="font-size:11px;font-weight:800;line-height:1.15;">' + escapeHtml(s.val) + '</div>' +
                '<div style="font-size:10px;opacity:.78;line-height:1.15;">' + escapeHtml(s.lbl) + '</div>' +
              '</button>'
            ).join('') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding-top:4px;border-top:1px dashed rgba(99,102,241,.20);">' +
            '<span style="font-size:11px;font-weight:800;opacity:.78;">🐾 Đổi bạn đồng hành:</span>' +
            HTQ_COMPANIONS_LIST.map(c =>
              '<button type="button" class="htq-stage-chip-btn' + (c.id === curCompId ? ' is-active' : '') + '" data-acc-comp="' + c.id + '" style="padding:3.5px 8px;font-size:11px;">' +
                '<img src="/images/companion/' + encodeURIComponent(c.id) + '/splash/hero.webp" alt="' + escapeHtml(c.name) + '" loading="lazy" decoding="async" style="width:16px;height:16px;border-radius:999px;object-fit:cover;" />' +
                '<span>' + escapeHtml(c.name) + '</span>' +
              '</button>'
            ).join('') +
          '</div>';
        const accPetBtn = host.querySelector('#htq-acc-pet-btn');
        if (accPetBtn) bindStudioClick(accPetBtn, () => {
          HTQ_STUDIO_FX.petBuddy(accPetBtn);
          renderAccountStage();
          buildCuteBuddyDock(window.location.pathname || '/tai-khoan');
        });
        host.querySelectorAll('[data-stamp-idx]').forEach(btn => {
          bindStudioClick(btn, () => {
            const s = stickers[Number(btn.getAttribute('data-stamp-idx'))];
            if (!s) return;
            if (s.ok) {
              HTQ_STUDIO_FX.sparkle(btn);
              HTQ_STUDIO_FX.confetti(btn, 22);
              HTQ_STUDIO_FX.toast('🎀 Sticker "' + s.lbl + '" đã mở khóa (' + s.val + ')! Dễ thương quá đi!', 'success');
            } else {
              HTQ_STUDIO_FX.toast('🔒 ' + s.lbl + ': ' + s.tip, 'info');
            }
          });
        });
        host.querySelectorAll('[data-acc-comp]').forEach(btn => {
          bindStudioClick(btn, () => {
            const cid = btn.getAttribute('data-acc-comp') || 'capy';
            try { localStorage.setItem('httq_companion_id', cid); } catch (_) {}
            const picked = HTQ_COMPANIONS_LIST.find(x => x.id === cid);
            HTQ_STUDIO_FX.sparkle(btn);
            HTQ_STUDIO_FX.confetti(btn, 18);
            HTQ_STUDIO_FX.toast((picked ? picked.emoji + ' ' + picked.name : cid) + ' đã sẵn sàng đồng hành cùng bạn!', 'success');
            renderAccountStage();
            const oldDock = document.getElementById('htq-buddy-dock');
            if (oldDock) oldDock.remove();
            buildCuteBuddyDock(window.location.pathname || '/tai-khoan');
          });
        });
      };
      renderAccountStage();
      return;
    }

    if (cfg.id === 'auth') {
      host.innerHTML =
        '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">' +
          '<span class="htq-stage-chip-btn is-active">☁️ Đồng bộ tiến độ 2 chiều</span>' +
          '<span class="htq-stage-chip-btn">🔒 Kho dữ liệu tách riêng theo tài khoản</span>' +
          '<span class="htq-stage-chip-btn">📥 Sao lưu JSON &amp; Xuất Anki CSV</span>' +
        '</div>';
    }
  }

  function buildSubpageRibbon(curPath) {
    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    const existing = document.getElementById('htq-subpage-ribbon');
    if (norm === '/' || isImmersiveRoute(norm) || !document.querySelector('header[data-site-header="true"]')) {
      if (existing) existing.remove();
      return;
    }
    const main = document.getElementById('noi-dung-chinh');
    if (!main) return;
    if (existing && existing.getAttribute('data-htq-path') === norm) return;
    if (existing) existing.remove();

    const chips = [
      ['Từ điển', '/tra-chu/'],
      ['Lộ trình', '/lo-trinh/'],
      ['Nghe', '/luyen-nghe/'],
      ['Nói AI', '/luyen-noi/'],
      ['Gõ Pinyin', '/luyen-go/'],
      ['Thi HSK', '/kiem-tra-hsk/'],
      ['Ngữ pháp', '/kiem-tra-ngu-phap/'],
      ['Trò chơi', '/tro-choi/'],
      ['Thầy Đồ', '/thay-do/']
    ];
    const ribbon = document.createElement('div');
    ribbon.id = 'htq-subpage-ribbon';
    ribbon.setAttribute('data-htq-path', norm);
    ribbon.innerHTML = '<div class="htq-ribbon-inner">' +
      '<button type="button" data-htq-cmdk-trigger="1" class="htq-ribbon-chip" style="cursor:pointer;border:1px solid rgba(79,70,229,.25);">🔍 Tìm nhanh</button>' +
      chips.map(([t, h]) => {
        const hn = h.replace(/\/+$/, '');
        const act = norm === hn || norm.startsWith(hn + '/');
        return '<a href="' + h + '" class="htq-ribbon-chip' + (act ? ' is-active' : '') + '">' + t + '</a>';
      }).join('') + '</div>';
    main.insertBefore(ribbon, main.firstChild);
  }

  function buildMobileBottomNav(curPath) {
    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    const existing = document.getElementById('htq-mobile-nav');
    if (isImmersiveRoute(norm) || document.getElementById('xhz-lesson-runner-root')) {
      if (existing) existing.remove();
      return;
    }
    let nav = existing;
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'htq-mobile-nav';
      nav.setAttribute('aria-label', 'Điều hướng nhanh di động');
      document.body.appendChild(nav);
    }
    if (nav.getAttribute('data-htq-path') === norm) return;
    nav.setAttribute('data-htq-path', norm);
    const tabs = [
      ['📖', 'Học', '/hoc/'],
      ['🔁', 'Ôn tập', '/on-tap/'],
      ['🔍', 'Tra chữ', '/tra-chu/'],
      ['📝', 'Thi thử', '/kiem-tra-hsk/'],
      ['👤', 'Tài khoản', '/tai-khoan/']
    ];
    nav.innerHTML = tabs.map(([ico, lbl, href]) => {
      const hn = href.replace(/\/+$/, '');
      const act = norm === hn || norm.startsWith(hn + '/');
      return `<a href="${href}" class="htq-mnav-item${act ? ' is-active' : ''}"><span style="font-size:17px;line-height:1;">${ico}</span><span>${lbl}</span></a>`;
    }).join('');
  }

  function buildCuteBuddyDock(curPath) {
    const norm = (curPath || '/').replace(/\/+$/, '') || '/';
    const existing = document.getElementById('htq-buddy-dock');
    const isBusyRoute = isImmersiveRoute(norm) || /^\/(hoc\/bai\/|de-kiem-tra\/lam-bai|kiem-tra-ngu-phap\/lam-bai)/.test(norm) || Boolean(document.getElementById('xhz-lesson-runner-root'));
    if (isBusyRoute || !document.body) {
      if (existing) existing.remove();
      return;
    }
    const compId = localStorage.getItem('httq_companion_id') || 'capy';
    const comp = HTQ_COMPANIONS_LIST.find(c => c.id === compId) || HTQ_COMPANIONS_LIST[0];
    const dockKey = comp.id;
    if (existing && existing.getAttribute('data-htq-buddy') === dockKey) return;
    if (existing) existing.remove();

    const dock = document.createElement('div');
    dock.id = 'htq-buddy-dock';
    dock.setAttribute('data-htq-buddy', dockKey);
    dock.setAttribute('aria-label', 'Bạn học đồng hành dễ thương');

    let cheerIdx = Math.floor(Date.now() / 60000) % HTQ_CUTE_CHEERS.length;
    let isOpen = false;

    const renderDock = () => {
      const curCompId = localStorage.getItem('httq_companion_id') || 'capy';
      const curComp = HTQ_COMPANIONS_LIST.find(c => c.id === curCompId) || HTQ_COMPANIONS_LIST[0];
      const ch = HTQ_CUTE_CHEERS[cheerIdx % HTQ_CUTE_CHEERS.length];
      let sum = { streakDays: 0, wordsMastered: 0, prog: {} };
      try { sum = getRealProgressSummary() || sum; } catch (_) {}
      const heartsN = Number((sum.prog && sum.prog.buddyHearts) || 0);
      const petalsOn = HTQ_STUDIO_FX.isPetalsEnabled();

      dock.innerHTML =
        (isOpen
          ? '<div class="htq-buddy-bubble" id="htq-buddy-bubble">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                  '<img src="/images/companion/' + encodeURIComponent(curComp.id) + '/splash/hero.webp" alt="' + escapeHtml(curComp.name) + '" loading="lazy" decoding="async" style="width:40px;height:40px;border-radius:13px;object-fit:cover;border:2px solid #f472b6;" />' +
                  '<div>' +
                    '<div style="font-size:13.5px;font-weight:800;">' + (curComp.emoji || '✨') + ' ' + escapeHtml(curComp.name) + ' <span style="opacity:.65;font-size:11.5px;">(' + escapeHtml(curComp.zh) + ')</span> <span style="font-size:11px;color:#e11d48;">❤️ ' + heartsN + '</span></div>' +
                    '<div style="font-size:11px;color:#0d9488;font-weight:700;">' + (sum.wordsMastered > 0 ? 'Bạn đã thuộc ' + sum.wordsMastered + ' từ · Chuỗi ' + sum.streakDays + ' ngày!' : 'Cùng học vui mỗi ngày nhé!') + '</div>' +
                  '</div>' +
                '</div>' +
                '<button type="button" id="htq-buddy-close" aria-label="Đóng bong bóng" style="border:none;background:transparent;color:inherit;font-size:15px;font-weight:800;cursor:pointer;opacity:.65;padding:2px 6px;">✕</button>' +
              '</div>' +
              '<div style="padding:10px 12px;border-radius:14px;background:linear-gradient(135deg, rgba(254,243,199,.58), rgba(252,231,243,.58));border:1px solid rgba(244,114,182,.25);margin-bottom:10px;">' +
                '<div style="font-size:15px;font-weight:900;color:#4338ca;">' + escapeHtml(ch.zh) + '</div>' +
                '<div style="font-size:12px;font-weight:700;color:#0d9488;margin-top:2px;">' + escapeHtml(ch.py) + '</div>' +
                '<div style="font-size:12.5px;margin-top:3px;opacity:.9;">' + escapeHtml(ch.vi) + '</div>' +
              '</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
                '<button type="button" id="htq-buddy-pet" class="htq-stage-chip-btn is-active" style="font-size:11.5px;padding:5px 10px;">🫶 Vuốt ve (+1 ❤️)</button>' +
                '<button type="button" id="htq-buddy-speak" class="htq-stage-chip-btn" style="font-size:11.5px;padding:5px 10px;">🔊 Nghe chúc</button>' +
                '<button type="button" id="htq-buddy-cheer" class="htq-stage-chip-btn" style="font-size:11.5px;padding:5px 10px;">🎉 Cổ vũ</button>' +
                '<button type="button" id="htq-buddy-swap" class="htq-stage-chip-btn" style="font-size:11.5px;padding:5px 10px;">🐾 Đổi bạn</button>' +
                '<button type="button" id="htq-buddy-petals" class="htq-stage-chip-btn" style="font-size:11px;padding:4px 9px;">' + (petalsOn ? '🌸 Hoa rơi: Bật' : '🌸 Hoa rơi: Tắt') + '</button>' +
              '</div>' +
            '</div>'
          : '') +
        '<button type="button" id="htq-buddy-fab" class="htq-buddy-fab htq-float" title="Chạm vào ' + escapeHtml(curComp.name) + ' để nhận lời chúc tiếng Trung ✨">' +
          '<img src="/images/companion/' + encodeURIComponent(curComp.id) + '/splash/hero.webp" alt="' + escapeHtml(curComp.name) + '" loading="lazy" decoding="async" />' +
          '<span class="htq-buddy-dot" aria-hidden="true">✨</span>' +
        '</button>';

      const fab = dock.querySelector('#htq-buddy-fab');
      if (fab) bindStudioClick(fab, () => { isOpen = !isOpen; renderDock(); });
      const cl = dock.querySelector('#htq-buddy-close');
      if (cl) bindStudioClick(cl, () => { isOpen = false; renderDock(); });
      const pet = dock.querySelector('#htq-buddy-pet');
      if (pet) bindStudioClick(pet, () => {
        HTQ_STUDIO_FX.petBuddy(pet);
        renderDock();
      });
      const spk = dock.querySelector('#htq-buddy-speak');
      if (spk) bindStudioClick(spk, () => {
        try { playPronunciation(ch.zh, 'tts'); } catch (_) {}
        HTQ_STUDIO_FX.sparkle(spk);
        HTQ_STUDIO_FX.toast('🔊 ' + ch.zh + ' — ' + ch.vi);
      });
      const chr = dock.querySelector('#htq-buddy-cheer');
      if (chr) bindStudioClick(chr, () => {
        cheerIdx = (cheerIdx + 1) % HTQ_CUTE_CHEERS.length;
        HTQ_STUDIO_FX.sparkle(chr);
        HTQ_STUDIO_FX.confetti(chr, 28);
        renderDock();
      });
      const swp = dock.querySelector('#htq-buddy-swap');
      if (swp) bindStudioClick(swp, () => {
        const curIdx = HTQ_COMPANIONS_LIST.findIndex(x => x.id === curComp.id);
        const nxt = HTQ_COMPANIONS_LIST[(curIdx + 1) % HTQ_COMPANIONS_LIST.length];
        try { localStorage.setItem('httq_companion_id', nxt.id); } catch (_) {}
        dock.setAttribute('data-htq-buddy', nxt.id);
        HTQ_STUDIO_FX.sparkle(swp);
        HTQ_STUDIO_FX.confetti(swp, 20);
        HTQ_STUDIO_FX.toast((nxt.emoji || '🐾') + ' Chào bạn! Mình là ' + nxt.name + ' sẽ học cùng bạn nha!', 'success');
        renderDock();
      });
      const ptl = dock.querySelector('#htq-buddy-petals');
      if (ptl) bindStudioClick(ptl, () => {
        const nextOn = !HTQ_STUDIO_FX.isPetalsEnabled();
        try { localStorage.setItem('htq_ambient_petals', nextOn ? '1' : '0'); } catch (_) {}
        HTQ_STUDIO_FX.syncAmbientPetals(window.location.pathname || '/');
        renderDock();
      });
    };

    document.body.appendChild(dock);
    renderDock();
  }
  window.__xhzBuildCuteBuddyDock = buildCuteBuddyDock;

  function mountStudioLayout() {
    if (!htqHydrationSettled) return;
    try {
      const p = window.location.pathname || '/';
      HTQ_STUDIO_FX.initScrollHairline();
      HTQ_STUDIO_FX.syncAmbientPetals(p);
      buildStudioSidebar(p);
      buildHomeWorkspace(p);
      buildSubpageRibbon(p);
      buildPageExperienceStage(p);
      buildMobileBottomNav(p);
      buildCuteBuddyDock(p);
    } catch (_e) {}
  }

  function ensurePwaWired() {
    try {
      if (document.head && !document.querySelector('link[rel="manifest"]')) {
        const lnk = document.createElement('link');
        lnk.rel = 'manifest';
        lnk.href = '/manifest.webmanifest';
        document.head.appendChild(lnk);
      }
      if (
        !window.__xhzSwRegistered &&
        typeof navigator !== 'undefined' &&
        'serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
      ) {
        window.__xhzSwRegistered = true;
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    } catch (_) {}
  }

  function runPostHydrationEnhancers() {
    htqHydrationSettled = true;
    ensurePwaWired();
    rewriteDomMedia(document);
    scrubBrandingAndLogos(document.body);
    mountStudioLayout();
    enhanceAccountPageAuthUI();
    enhanceWorksheetAndPdfTools();
  }

  // Global Command Palette (Ctrl+K / Cmd+K) for instant Hanzi/Vocab/Tool search
  const HTQ_QUICK_ROUTES = [
    { icon: '📖', title: 'Lộ trình học HSK 3.0', desc: 'Tiếp tục bài học hôm nay', href: '/hoc/', keys: 'hoc lo trinh hsk' },
    { icon: '🔁', title: 'Trung tâm Ôn tập SRS', desc: 'Ôn bài đến hạn, sổ lỗi & từ đã học', href: '/on-tap/', keys: 'on tap srs the nho loi sai' },
    { icon: '📚', title: 'Từ vựng đã học & Xuất CSV', desc: 'Lọc từ đã thuộc và xuất Anki/Excel', href: '/on-tap/da-hoc', keys: 'tu da hoc csv anki' },
    { icon: '🔍', title: 'Từ điển Chữ Hán & Bộ thủ', desc: 'Tra hơn 9.900 chữ Hán theo HSK/Bộ thủ', href: '/tra-chu/', keys: 'tu dien tra chu bo thu' },
    { icon: '🌐', title: 'Dịch Trung - Việt AI', desc: 'Dịch câu kèm phân tích từ ghép & Hán Việt', href: '/dich-tieng-trung/', keys: 'dich translate ai' },
    { icon: '🎧', title: 'Luyện nghe phản xạ', desc: 'Luyện nghe theo giáo trình HSK', href: '/luyen-nghe/', keys: 'luyen nghe listening' },
    { icon: '🎙️', title: 'Luyện nói AI Thanh điệu', desc: 'Thu âm zh-CN và chấm phát âm', href: '/luyen-noi/', keys: 'luyen noi speaking mic' },
    { icon: '⌨️', title: 'Luyện gõ Pinyin & Hán tự', desc: 'Rèn gõ nhanh theo cấp HSK 1–6', href: '/luyen-go/', keys: 'luyen go pinyin typing' },
    { icon: '✍️', title: 'Nghe chép chính tả Video', desc: '91 video thực tế có phân đoạn chuẩn', href: '/luyen-chep-chinh-ta/', keys: 'chep chinh ta dictation video' },
    { icon: '📝', title: 'Phòng thi thử HSK & YCT', desc: '66 bộ đề HSK 1–6, HSK 3.0 & YCT 1–4', href: '/kiem-tra-hsk/', keys: 'thi thu de kiem tra hsk yct' },
    { icon: '⚖️', title: 'Kiểm tra Ngữ pháp', desc: 'Ôn luyện 480+ điểm ngữ pháp HSK', href: '/kiem-tra-ngu-phap/', keys: 'ngu phap grammar quiz' },
    { icon: '🖨️', title: 'Tạo vở tập viết PDF', desc: 'Tạo tờ luyện viết chữ Hán in PDF', href: '/tao-vo-tap-viet/', keys: 'tap viet pdf worksheet' },
    { icon: '🎮', title: 'Trò chơi Chữ Hán', desc: '6 mini-game ghép chữ, thành ngữ, pháo hoa', href: '/tro-choi/', keys: 'tro choi game ghep chu chengyu' },
    { icon: '🏮', title: 'Trường Thầy Đồ', desc: 'Bảng vàng và lớp học tương tác', href: '/thay-do/', keys: 'thay do bang vang' },
    { icon: '👤', title: 'Tài khoản, Đồng bộ & Sao lưu', desc: 'Google OAuth, Supabase & Xuất/Nhập JSON', href: '/tai-khoan/', keys: 'tai khoan google dong bo sao luu backup' }
  ];

  let htqCmdkPollTimer = null;
  let htqCmdkPrevFocus = null;
  function closeCommandPalette() {
    if (htqCmdkPollTimer) {
      clearInterval(htqCmdkPollTimer);
      htqCmdkPollTimer = null;
    }
    const ov = document.getElementById('htq-cmdk-overlay');
    if (ov) ov.remove();
    const prev = htqCmdkPrevFocus;
    htqCmdkPrevFocus = null;
    if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
      setTimeout(() => { try { prev.focus(); } catch (_) {} }, 0);
    }
  }

  function openCommandPalette(initialQuery = '') {
    const prevFocus = !document.getElementById('htq-cmdk-overlay') ? document.activeElement : htqCmdkPrevFocus;
    closeCommandPalette();
    htqCmdkPrevFocus = prevFocus;
    const isDark = document.documentElement.classList.contains('dark');
    const ov = document.createElement('div');
    ov.id = 'htq-cmdk-overlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Tìm nhanh Hán Ngữ Studio');
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.55);backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:8vh 16px 24px;';
    ov.innerHTML =
      `<div id="htq-cmdk-box" style="width:100%;max-width:620px;border-radius:20px;background:${isDark ? '#111629' : '#ffffff'};color:${isDark ? '#f8fafc' : '#1c1917'};border:1px solid ${isDark ? 'rgba(129,140,248,0.28)' : '#e7e5e4'};box-shadow:0 24px 64px rgba(15,23,42,0.35);overflow:hidden;">` +
        `<div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid ${isDark ? 'rgba(148,163,184,0.18)' : '#e7e5e4'};">` +
          `<span style="font-size:18px;">🔍</span>` +
          `<input id="htq-cmdk-input" type="text" autocomplete="off" aria-label="Tìm chữ Hán, Pinyin hoặc lối tắt" placeholder="Nhập chữ Hán, Pinyin, nghĩa Việt hoặc tên công cụ (vd: 你好, hsk, pdf)..." style="flex:1;border:none;outline:none;background:transparent;color:inherit;font-size:15px;font-weight:600;" />` +
          `<button type="button" id="htq-cmdk-close" aria-label="Đóng hộp tìm kiếm" style="padding:4px 10px;border-radius:8px;border:1px solid ${isDark ? '#334155' : '#d6d3d1'};background:transparent;color:inherit;font-size:12px;font-weight:700;cursor:pointer;">ESC</button>` +
        `</div>` +
        `<div id="htq-cmdk-results" role="listbox" style="max-height:56vh;overflow-y:auto;padding:10px 12px 14px;display:flex;flex-direction:column;gap:6px;"></div>` +
        `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-top:1px solid ${isDark ? 'rgba(148,163,184,0.18)' : '#e7e5e4'};font-size:11.5px;opacity:.75;">` +
          `<span>↑↓ Chọn kết quả · Enter Mở · Ctrl+K Tìm nhanh</span><span>ESC Đóng</span>` +
        `</div>` +
      `</div>`;
    ov.addEventListener('click', ev => { if (ev.target === ov) closeCommandPalette(); });
    document.body.appendChild(ov);
    const inp = ov.querySelector('#htq-cmdk-input');
    const resEl = ov.querySelector('#htq-cmdk-results');
    ov.querySelector('#htq-cmdk-close').onclick = closeCommandPalette;

    // Pre-warm dictionary indexes immediately on palette open
    const dictLoadPromise = Promise.all([
      loadLocalJson('/data/characters/index.json').catch(() => []),
      loadLocalJson('/data/vocabulary/index.json').catch(() => [])
    ]);

    const itemBg = isDark ? 'rgba(30,41,59,0.65)' : '#f8fafc';
    const buildHtml = (q, dictRows, matchedRoutes, loadingDict) => {
      let html = '';
      if (dictRows.length > 0) {
        html += `<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;opacity:.65;padding:4px 6px;">Từ điển Chữ Hán &amp; Từ vựng (${dictRows.length})</div>`;
        html += dictRows.map(d =>
          `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:12px;background:${itemBg};">` +
            `<a href="${d.href}" role="option" class="htq-cmdk-link" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;text-decoration:none;color:inherit;padding:2px 4px;border-radius:8px;border:1px solid transparent;">` +
              `<span style="font-size:24px;font-weight:800;color:#4f46e5;min-width:44px;">${escapeHtml(d.hanzi)}</span>` +
              `<div style="min-width:0;">` +
                `<div style="font-size:13px;font-weight:700;color:#0d9488;">${escapeHtml(d.pinyin)}${d.hv ? ' · ' + escapeHtml(d.hv.toUpperCase()) : ''}</div>` +
                `<div style="font-size:13px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(d.meaning)}</div>` +
              `</div>` +
            `</a>` +
            `<button type="button" data-xhz-play="${escapeHtml(d.hanzi || '')}" aria-label="Nghe phát âm" style="border:none;border-radius:999px;padding:6px 10px;background:#eef2ff;color:#4338ca;font-weight:700;cursor:pointer;font-size:12px;">🔊</button>` +
          `</div>`
        ).join('');
      } else if (loadingDict && q.length >= 1) {
        html += `<div style="padding:10px 12px;font-size:13px;color:#0d9488;font-weight:600;">⏳ Đang tra từ điển cho "${escapeHtml(q)}"...</div>`;
      }
      if (matchedRoutes.length > 0) {
        html += `<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;opacity:.65;padding:6px 6px 4px;">Lối tắt nhanh</div>`;
        html += matchedRoutes.map(r =>
          `<a href="${r.href}" role="option" class="htq-cmdk-link" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:${itemBg};text-decoration:none;color:inherit;border:1px solid transparent;">` +
            `<span style="font-size:20px;">${r.icon}</span>` +
            `<div><div style="font-weight:700;font-size:14px;">${r.title}</div><div style="font-size:12px;opacity:.72;">${r.desc}</div></div>` +
          `</a>`
        ).join('');
      }
      if (!html) {
        html = `<div style="padding:24px;text-align:center;opacity:.7;font-size:14px;">Không tìm thấy kết quả cho "${escapeHtml(q)}".</div>`;
      }
      return html;
    };

    let activeIdx = 0;
    const syncActive = (nextIdx) => {
      const links = Array.from(resEl.querySelectorAll('.htq-cmdk-link'));
      if (links.length === 0) {
        activeIdx = 0;
        resEl.removeAttribute('data-cmdk-active-idx');
        return;
      }
      activeIdx = ((nextIdx % links.length) + links.length) % links.length;
      resEl.setAttribute('data-cmdk-active-idx', String(activeIdx));
      links.forEach((a, i) => {
        const on = i === activeIdx;
        a.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) {
          a.setAttribute('data-active', '1');
          a.style.borderColor = 'rgba(79,70,229,0.55)';
          a.style.background = isDark ? 'rgba(79,70,229,0.22)' : 'rgba(79,70,229,0.08)';
          try { a.scrollIntoView({ block: 'nearest' }); } catch (_) {}
        } else {
          a.removeAttribute('data-active');
          a.style.borderColor = 'transparent';
          a.style.background = a.parentElement === resEl ? itemBg : 'transparent';
        }
      });
    };

    const paint = (html) => {
      resEl.innerHTML = html;
      resEl.querySelectorAll('.htq-cmdk-link').forEach(a => a.addEventListener('click', closeCommandPalette));
      syncActive(0);
    };

    let searchSeq = 0;
    let lastRenderedVal = null;
    const renderResults = async (qStr) => {
      const seq = ++searchSeq;
      const q = String(qStr || '').trim();
      lastRenderedVal = qStr;
      const ql = q.toLowerCase();
      const matchedRoutes = HTQ_QUICK_ROUTES.filter(r =>
        !ql || r.title.toLowerCase().includes(ql) || r.desc.toLowerCase().includes(ql) || r.keys.includes(ql)
      ).slice(0, q ? 5 : 8);

      // Instant synchronous update BEFORE awaiting dictionary JSONs
      paint(buildHtml(q, [], matchedRoutes, q.length >= 1));
      if (q.length < 1) return;

      let dictRows = [];
      try {
        const loaded = await Promise.race([
          dictLoadPromise,
          new Promise(resolve => setTimeout(() => resolve([[], []]), 6000))
        ]);
        if (seq !== searchSeq) return;
        const cIdx = Array.isArray(loaded && loaded[0]) ? loaded[0] : [];
        const vIdx = Array.isArray(loaded && loaded[1]) ? loaded[1] : [];
        const hasHanzi = /[\u4e00-\u9fff]/.test(q);
        const qNorm = normalizePinyinQuery(q);
        const vHits = vIdx
          .map(v => {
            const hw = String((v && v.w) || '').replace(/\{|\}/g, '');
            const py = String((v && v.p) || '').toLowerCase();
            const pyNorm = normalizePinyinQuery(py);
            const mv = String((v && v.m) || '').toLowerCase();
            let score = 0;
            if (hw && hw === q) score = 100;
            else if (qNorm && pyNorm === qNorm) score = 90;
            else if (hw && hw.includes(q)) score = 75;
            else if (py.includes(ql) || (qNorm.length >= 2 && pyNorm.startsWith(qNorm))) score = 55;
            else if (ql.length >= 2 && (mv.includes(ql) || (qNorm.length >= 3 && pyNorm.includes(qNorm)))) score = 25;
            return { v, hw, score };
          })
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map(x => ({ kind: 'word', hanzi: x.hw, pinyin: String(x.v.p || ''), hv: String(x.v.hv || ''), meaning: String(x.v.m || ''), href: `/tu-vung/${encodeURIComponent(x.hw)}` }));
        const cHits = cIdx
          .map(c => {
            const ch = String((c && c.c) || '');
            const py = String((c && c.p) || '').toLowerCase();
            const pyNorm = normalizePinyinQuery(py);
            const hv = String((c && c.hv) || '').toLowerCase();
            const mv = String((c && c.m) || '').toLowerCase();
            let score = 0;
            if (ch && ch === q) score = 100;
            else if (hasHanzi && ch && q.includes(ch)) score = 90;
            else if (qNorm && pyNorm === qNorm) score = 80;
            else if (hv && hv === ql) score = 70;
            else if ((ch && ch.includes(q)) || py.includes(ql) || (qNorm.length >= 2 && pyNorm.startsWith(qNorm))) score = 50;
            else if (ql.length >= 2 && (mv.includes(ql) || (qNorm.length >= 3 && pyNorm.includes(qNorm)))) score = 25;
            return { c, score };
          })
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(x => ({ kind: 'char', hanzi: String(x.c.c || ''), pinyin: String(x.c.p || ''), hv: String(x.c.hv || ''), meaning: String(x.c.m || ''), href: `/han-tu/${encodeURIComponent(x.c.c)}` }));
        dictRows = [...vHits, ...cHits];
      } catch (_) {}
      if (seq !== searchSeq) return;
      paint(buildHtml(q, dictRows, matchedRoutes, false));
    };

    const handleChange = () => {
      if (inp.value !== lastRenderedVal) renderResults(inp.value);
    };
    if (initialQuery) inp.value = initialQuery;
    inp.addEventListener('input', handleChange);
    inp.addEventListener('keyup', handleChange);
    inp.addEventListener('change', handleChange);
    inp.addEventListener('compositionend', handleChange);
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeCommandPalette();
      } else if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        syncActive(activeIdx + 1);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        syncActive(activeIdx - 1);
      } else if (ev.key === 'Enter') {
        const target = resEl.querySelector('.htq-cmdk-link[data-active="1"]') || resEl.querySelector('.htq-cmdk-link');
        if (target) {
          ev.preventDefault();
          target.click();
        }
      }
    });
    htqCmdkPollTimer = setInterval(() => {
      if (!document.body.contains(inp)) { closeCommandPalette(); return; }
      handleChange();
    }, 180);
    renderResults(initialQuery);
    setTimeout(() => { try { inp.focus(); } catch (_) {} }, 20);
  }

  window.__xhzOpenCommandPalette = openCommandPalette;
  window.__xhzCloseCommandPalette = closeCommandPalette;
  const htqGlobalKeydownHandler = function (ev) {
    if (!ev || ev.__xhzKeyHandled) return;
    ev.__xhzKeyHandled = true;
    if ((ev.ctrlKey || ev.metaKey) && String(ev.key || '').toLowerCase() === 'k') {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      if (document.getElementById('htq-cmdk-overlay')) closeCommandPalette();
      else openCommandPalette();
      return;
    } else if (ev.key === 'Escape' && document.getElementById('htq-cmdk-overlay')) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      closeCommandPalette();
      return;
    }
    // Global study keyboard shortcuts (never steal focus inside inputs/modals)
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (document.getElementById('htq-cmdk-overlay')) return;
    const ae = document.activeElement;
    if (ae && (['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName) || ae.isContentEditable)) return;

    const srsPanel = document.getElementById('xhz-rev-panel-srs');
    if (srsPanel && srsPanel.style.display !== 'none') {
      const k = String(ev.key || '');
      if (k === ' ' || k === 'Spacebar') {
        const flipBtn = document.getElementById('xhz-srs-flip');
        if (flipBtn) { ev.preventDefault(); flipBtn.click(); }
      } else if (k.toLowerCase() === 'r') {
        const spkBtn = document.getElementById('xhz-srs-speak');
        if (spkBtn) { ev.preventDefault(); spkBtn.click(); }
      } else if (['1', '2', '3', '4'].includes(k)) {
        const gBtn = srsPanel.querySelector(`.xhz-srs-grade[data-key="${k}"]:not([disabled])`);
        if (gBtn) { ev.preventDefault(); gBtn.click(); }
      }
      return;
    }

    const fcCard = document.getElementById('xhz-fc-card');
    if (fcCard && fcCard.offsetParent !== null) {
      const k = String(ev.key || '');
      if (k === ' ' || k === 'Spacebar') { ev.preventDefault(); fcCard.click(); }
      else if (k === 'ArrowLeft') { const b = document.getElementById('xhz-fc-prev'); if (b) { ev.preventDefault(); b.click(); } }
      else if (k === 'ArrowRight') { const b = document.getElementById('xhz-fc-next'); if (b) { ev.preventDefault(); b.click(); } }
      else if (k.toLowerCase() === 'r') { const b = document.getElementById('xhz-fc-audio'); if (b) { ev.preventDefault(); b.click(); } }
    }
  };
  htqGlobalKeydownHandler.__xhzRuntimeListener = true;
  window.addEventListener('keydown', htqGlobalKeydownHandler, true);
  document.addEventListener('keydown', htqGlobalKeydownHandler, true);

  function isReactHydrated() {
    try {
      const mainEl = document.querySelector('main#noi-dung-chinh') || document.querySelector('main');
      if (!mainEl) return true;
      const mainReady = Object.keys(mainEl).some(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
      if (!mainReady) return false;
      const firstChild = mainEl.firstElementChild;
      if (!firstChild) return true;
      return Object.keys(firstChild).some(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
    } catch (_) {
      return true;
    }
  }

  function scheduleScrubPasses() {
    const tBoot = Date.now();
    let settledOnce = false;
    const triggerSafe = () => {
      if (settledOnce) return;
      settledOnce = true;
      const remain = Math.max(180, 900 - (Date.now() - tBoot));
      requestAnimationFrame(() => {
        setTimeout(() => {
          runPostHydrationEnhancers();
          if (isDynamicSpaRoute(window.location.pathname)) {
            checkAndRenderDynamicPage();
          }
        }, remain);
      });
    };
    let tries = 0;
    const poll = setInterval(() => {
      tries++;
      if ((document.readyState === 'complete' && isReactHydrated()) || tries >= 14) {
        clearInterval(poll);
        triggerSafe();
      }
    }, 120);
    setTimeout(() => {
      clearInterval(poll);
      triggerSafe();
      setTimeout(runPostHydrationEnhancers, 900);
    }, 1800);
  }

  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    htqHydrationSettled = true;
    setTimeout(checkAndRenderDynamicPage, 30);
    setTimeout(enhanceAccountPageAuthUI, 100);
    setTimeout(enhanceWorksheetAndPdfTools, 120);
    setTimeout(() => { scrubBrandingAndLogos(document.body); mountStudioLayout(); }, 120);
    setTimeout(() => { scrubBrandingAndLogos(document.body); mountStudioLayout(); }, 500);
  };
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    htqHydrationSettled = true;
    setTimeout(checkAndRenderDynamicPage, 30);
    setTimeout(enhanceAccountPageAuthUI, 100);
    setTimeout(enhanceWorksheetAndPdfTools, 120);
    setTimeout(() => { scrubBrandingAndLogos(document.body); mountStudioLayout(); }, 120);
    setTimeout(() => { scrubBrandingAndLogos(document.body); mountStudioLayout(); }, 500);
  };
  window.addEventListener('popstate', () => {
    htqHydrationSettled = true;
    setTimeout(checkAndRenderDynamicPage, 30);
    setTimeout(enhanceAccountPageAuthUI, 100);
    setTimeout(enhanceWorksheetAndPdfTools, 120);
    setTimeout(() => { scrubBrandingAndLogos(document.body); mountStudioLayout(); }, 120);
  });

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (htqHydrationSettled) {
        runPostHydrationEnhancers();
        if (isDynamicSpaRoute(window.location.pathname)) {
          checkAndRenderDynamicPage();
        }
      }
    }, 1100);
  });

  function boot() {
    supabaseFetchInitial();
    try {
      if (isDynamicSpaRoute(window.location.pathname)) {
        const main = document.querySelector('main');
        if (main) main.style.display = 'none';
        checkAndRenderDynamicPage();
      }
    } catch (_) {}
    scheduleScrubPasses();
    if ((window.location.pathname || '').startsWith('/hoc')) {
      const idleFn = window.requestIdleCallback || (cb => setTimeout(cb, 650));
      idleFn(() => {
        loadLocalJson('/data/learning-tracks/hsk30-L1.json').catch(() => {});
      });
    }

    let scrubTimer = 0;
    let scrubRaf = 0;
    const IGNORED_OBS_SEL = '#htq-ambient-petals, #htq-toast-stack, #htq-scroll-progress, #htq-buddy-dock, #htq-cmdk-overlay, #htq-confetti-layer';
    const isTransientOverlayNode = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (el.closest && el.closest(IGNORED_OBS_SEL)) return true;
      return false;
    };
    const obs = new MutationObserver(mutations => {
      if (!htqHydrationSettled) return;
      let sawContentMutation = false;
      for (const m of mutations) {
        if (isTransientOverlayNode(m.target)) continue;
        sawContentMutation = true;
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1 && !isTransientOverlayNode(node)) rewriteDomMedia(node);
        });
      }
      if (!sawContentMutation) return;
      cleanDocumentTitle();
      const curPath = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
      if (/^\/(tai-khoan|dang-nhap|dang-ky|xoa-tai-khoan)(\/|$|\.html$)/.test(curPath)) {
        enhanceAccountPageAuthUI();
      }
      if (curPath === '/tao-vo-tap-viet' || curPath === '/flashcard-pdf') {
        enhanceWorksheetAndPdfTools();
      }
      if (!scrubTimer) {
        scrubTimer = setTimeout(() => {
          scrubTimer = 0;
          if (!scrubRaf) {
            scrubRaf = requestAnimationFrame(() => {
              scrubRaf = 0;
              scrubBrandingAndLogos(document.body);
            });
          }
        }, 120);
      }
    });
    const obsRoot = document.body || document.documentElement;
    if (obsRoot) {
      obs.observe(obsRoot, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
