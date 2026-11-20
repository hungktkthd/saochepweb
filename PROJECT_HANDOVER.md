# PROJECT HANDOVER — Học Tiếng Trung (`saochepweb`) v14.0

- **Production URL**: https://hoctiengtrungquoc.vercel.app
- **GitHub Repository**: https://github.com/hungktkthd/saochepweb (nhánh `main` + 6 nhánh `media-*`)
- **Supabase Project**: `skxgzzdunqloxxombtuc` (`https://skxgzzdunqloxxombtuc.supabase.co`, Publishable Key: `sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18`)
- **Kiến trúc tổng thể**: Giao diện **Hanzi Studio v4** (`?v=htq5`, Indigo `#4f46e5` + Imperial Teal `#0d9488`, Mobile Bottom Nav, Command Palette `Ctrl+K`, PWA `site.webmanifest`/`sw.js`), lưu trữ tách riêng theo tài khoản (`initializeScopedStorage()`), hệ thống SRS thật + lớp Runtime trung tâm [`xiehanzi-runtime.js`](./xiehanzi-runtime.js) và API Serverless [`api/ai.js`](./api/ai.js).

---

## 1. Hệ thống đồng bộ & lưu trữ dữ liệu đa tầng (Non-Destructive + Per-Account Scoped)

1. **`localStorage` tách theo tài khoản & tương thích chéo 2 chiều (`initializeScopedStorage`)**:
   - Mọi khóa cục bộ (`httq_state`, `httq_learned_grammar`, `httq_user_mistakes`, `httq_dictation_progress`, `httq_habit_settings`, `httq_game_high_scores`, `httq_speaking_progress`, `httq_progress_v2`...) được tách vùng theo người dùng đăng nhập (`:user:${id}` vs `:guest`) tránh trộn dữ liệu giữa các tài khoản trên cùng trình duyệt.
   - Hỗ trợ **gộp tự nguyện (Opt-in Guest Migration)** từ chế độ Khách sang tài khoản đăng nhập trên `/tai-khoan` (`window.__xhzGetGuestMigrationSummary()`, `window.__xhzImportGuestProgressIntoAccount()`), không bao giờ gộp âm thầm.
   - Đồng bộ 2 chiều tự động với store Next.js gốc (`xhz-seen-words-v1`, `xhz-practice-v1`).
2. **Supabase Cloud Sync**:
   - Google OAuth & Email/Password qua Supabase (`/tai-khoan`, `/dang-nhap`, `/dang-ky`, `/v1/auth/forgot-password`, `/v1/users/me/password`).
   - Đồng bộ `auth/v1/user` (`user_metadata.xhz_progress`) và bảng `public.study_profiles` (`user_id, workspace: 'hoctiengtrungquoc'`), kèm fast-path cho phiên guest tránh Web Locks IPC thừa.
3. **Sao lưu, Khôi phục & Xuất Anki/Excel**:
   - Sao lưu JSON: UI trên `/tai-khoan` & `/xoa-tai-khoan` (`window.__xhzExportProgressJson()`, `window.__xhzImportProgressJson(jsonStr)`).
   - Xuất CSV UTF-8 BOM (Anki/Excel): nút `📥 Xuất CSV` trên `/on-tap/da-hoc` & `window.__xhzExportVocabularyCsv()`.

---

## 2. Tổng hợp 40 cải tiến đã triển khai & kiểm thử (Wave 1 v12.0 + Wave 2 v13.0)

### Đợt 1 (v12.0 — 20 cải tiến nền tảng)
1. Gỡ bỏ API bị che & nối `/v1/grammar-progress`, `/v2/me/weekly-activity`, `/v2/me/recent-actions`.
2. Cầu nối 2 chiều sang `xhz-seen-words-v1` / `xhz-practice-v1` & các API `/v2/review/signals`, `/v1/practice-progress/sync`, `/v1/study-time/sync`, `/v1/speaking-progress/sync`.
3. Hoàn thiện Capybara Lesson Runner (`dialogue`, `roleplay_turn`, `exam_item`) & audio fallback.
4. Mở khóa toàn bộ 8 Chương / 40 Chặng HSK 3.0 L1 từ `data/learning-tracks/hsk30-L1.json`.
5. Sao lưu đám mây đa tầng + tách kho theo từng tài khoản (`initializeScopedStorage`).
6. Ghi nhận lỗi sai thực, SRS thật (`/v2/review/summary`) & Sổ lỗi / Từ đã học (`/on-tap/da-hoc`, `/on-tap/so-loi`).
7. Khôi phục 6 file JSON Trò chơi (`data/misc/games-*.json`), Bộ đề YCT 1–4 & `gameHighScores`.
8. Đồng bộ tiến độ Giáo trình (`/thu-vien-*`) & bổ sung Tab `⌨️ Gõ Pinyin & Chữ Hán`.
9. Tự sinh hội thoại Luyện nói & tích hợp nhận diện giọng nói `zh-CN`.
10. Nút `"⭐ Lưu vào Sổ tay"` trên `/han-tu/:slug` & `/tu-vung/:slug` + làm giàu `/v1/notebook`.
11. Phòng thi HSK 3.0, CTI & YCT (`#xhz-exam-nav-grid`, không chấm ảo câu CTI chưa có đáp án).
12. Tra cứu 3.000+ chữ Hán theo Bộ thủ (`/tra-chu/bo-thu/:radical`) & Cấp HSK (`/tra-chu/hsk/:level`).
13. Biểu đồ 5 kỹ năng, dự đoán điểm HSK, Heatmap 12 tuần & cài đặt mục tiêu (`/hoc/tien-do`, `/hoc/thoi-quen`).
14. Tự động điền `?text=...` trên `/tao-vo-tap-viet` & thanh công cụ in `/flashcard-pdf`.
15. Ghi nhận tiến độ & từ vựng khi Luyện chép chính tả (`/luyen-chep-chinh-ta/:id`).
16. Phân tích từ ghép 2–4 chữ & chiết tự chữ Hán trong `/v1/translate` và `api/ai.js`.
17. Chuẩn hóa `tai-khoan-moi.html` (UTF-8) & UI Xuất/Nhập sao lưu `.json` trên `/tai-khoan`.
18. `loadLocalJson` loại bỏ HTML-stub/404 khỏi cache & preload ngầm `hsk30-L1.json`.
19. Bộ tự kiểm tra không phá hủy `window.__xhzRunDiagnostics()` (bản đầu 17 kiểm thử).
20. Hợp nhất giao diện Hanzi Studio v4 & kiểm thử thực tế trên Vercel.

### Đợt 2 (v13.0 — 20 cải tiến chuyên sâu)
1. **Triệt tiêu lỗi React Hydration `#418` / `#422` / `#423`** trên `/tai-khoan`, `/tao-vo-tap-viet`, `/xoa-tai-khoan`, `/` (chặn mọi DOM enhancer chạy trước `htqHydrationSettled`).
2. **Tái tạo sạch 91/91 file `data/dictation/videos/*-detail.json`** bị hỏng HTML stub thành JSON chuẩn UTF-8 (`0` file stub còn lại trên toàn kho `data/`).
3. **Triệt tiêu lỗi Console `_rsc=` Prefetch `DOMException` & chặn sạch request analytics/telemetry chết** (`google-analytics`, `sentry`, `umami`, `posthog`, `/g/collect`).
4. **Dọn sạch 306 dòng API dead code bị che** (`/v1/study-time/sync`, `/v2/review/*` trùng lặp) & tối ưu chọn đúng `/topics/` vs `/lessons/` (triệt tiêu 404 thừa trên giáo trình).
5. **Nhập tiến độ Khách vào Tài khoản đăng nhập tự nguyện (Opt-in Guest Migration)** trên `/tai-khoan`.
6. **Chuẩn hóa `/v1/auth/forgot-password`, đặt mật khẩu lần đầu cho tài khoản OAuth (`/v1/users/me/password`) & trang `/xoa-tai-khoan`** (sao lưu `.json` + xác nhận 2 bước).
7. **Mở rộng Lộ trình Học Đa cấp & Đa giáo trình (`HSK 3.0 L2–L6`, `YCT L1–L4`, `Boya E1–E2`)** qua `synthesizeTrackLevel` + `buildDynamicRunFromStage`.
8. **Làm giàu 18/18 file `*-lessons.json` trống** (`boya`, `hanyu-jiaocheng`, `new-hsk-4..7-9`) ngay tại kho JSON chuẩn (`0` file `-lessons.json` trống).
9. **Nâng cấp Luyện Gõ Pinyin & Hán Tự (`/v1/typing-set`, `/v1/typing-word-set`, `/v1/typing/complete`)** lọc chuẩn từng cấp HSK 1–6, hỗ trợ `mode=learned|mistakes` & lưu tiến độ thật.
10. **Kích hoạt Trường Thầy Đồ (`/v1/thay-do/*`)** nối trực tiếp với tiến độ học & bảng vàng của học viên.
11. **Nâng cấp AI Serverless [`api/ai.js`](./api/ai.js)**: `AbortController` timeout 8s, đa model dự phòng (`GEMINI_MODEL` → `gemini-2.0-flash` → `gemini-1.5-flash` → OpenAI → GTX), truyền lịch sử 6 lượt chat & sửa tra cứu từ Việt–Trung (`f.w`).
12. **Nâng cấp Luyện nói theo chặng (`/v2/learning-tracks/:track/stage-talks/*`)** sinh chủ đề, nhiệm vụ & nhận xét khớp từng `stageKey` + ghi nhận tiến độ.
13. **Lọc trạng thái (`Tất cả` / `Đã thuộc` / `Đang học`) & Xuất từ vựng CSV UTF-8 BOM (Anki/Excel)** trên `/on-tap/da-hoc`.
14. **Command Palette tìm nhanh toàn trang (`Ctrl+K` / `⌘K`)** tra tức thì chữ Hán, từ vựng, phát âm 🔊 & 15 lối tắt công cụ.
15. **Phím tắt học tập chuẩn mượt** (`Space` lật thẻ, `R` nghe lại, `1–4` chấm SRS, `←/→` chuyển thẻ) có bảo vệ ô nhập liệu.
16. **Sửa lỗi co chiều rộng `<main>` (`min-width: 0; width: 100%`) & Thanh điều hướng Di động (`#htq-mobile-nav`)** cho màn hình `<= 768px`.
17. **Nâng cấp PWA & Offline Cache thực sự** (`site.webmanifest`, `manifest.webmanifest` dùng icon thật `/apple-touch-icon.png` + `/favicon-48x48.png` + `/favicon.svg`, và [`sw.js`](./sw.js) `htq-studio-v13`).
18. **Nâng cấp Bento Dashboard Trang chủ (`buildHomeWorkspace`)**: 4 chỉ số thật (`Chuỗi ngày`, `Từ đã học`, `Thẻ cần ôn`, `Chặng xong`), nút tiếp tục đúng bài đang dở & nút ôn thẻ đến hạn.
19. **Nâng cấp bộ tự kiểm tra `window.__xhzRunDiagnostics()` lên 28/28 kiểm thử không phá hủy dữ liệu**.
20. **Cập nhật tài liệu bàn giao v13.0, đẩy `origin/main` & kiểm thử thực tế trên Vercel**.

### Đợt 3 (v13.1 — Hoàn thiện lõi thực dụng, không rườm rà)
1. **Gỡ sạch iOS Smart App Banner cũ (`apple-itunes-app` / `app-id=6824317704`)** trên cả `<head>` lẫn `self.__next_f` của toàn bộ 285 file HTML (0 hydration mismatch, không còn hiện banner mời tải app cũ trên Safari iPhone/iPad).
2. **Tối ưu HTTP Cache & Service Worker (`vercel.json` + [`sw.js`](./sw.js) `htq-studio-v13.1`)**: thêm `Cache-Control: public, max-age=0, must-revalidate` + `Service-Worker-Allowed: /` cho `/sw.js` & `*.webmanifest`, đổi `/data/(.*)` sang `max-age=3600, stale-while-revalidate=86400` và nâng cấp SW `/data/` sang Stale-While-Revalidate để dữ liệu vừa nhanh vừa luôn nhận bản vá mới.
3. **Thật hóa 4 API cá nhân hóa còn lại (`/v2/me/skill-map`, `/v2/me/score-prediction`, `/v2/me/exam-plan` CRUD, `/v2/me/shadowing/summary`)**: tính 5 kỹ năng từ tiến độ thực (`learnedWords`, `masteredChars`, `learnedGrammarIds`, `dictationProgress`, `speakingProgress`, `examHistory`), lưu kế hoạch thi `examPlan` an toàn trong `httq_progress_v2` & đồng bộ cloud.
4. **Thật hóa bộ nhớ & hộp thư Trợ lý Học tập (`/v2/companion/memory`, `/v2/companion/inbox`, `/v2/companion/inbox/read`)**: sinh nhắc ôn thẻ SRS, sổ lỗi, đếm ngược kỳ thi & mốc thành tích thực tế, lưu trạng thái đã đọc theo tài khoản.
5. **Nâng cấp Bộ sinh đề thi thông minh (`/v1/generated-tests/freshness`, `POST /v1/generated-tests/create`)**: trừ đề đã làm từ `examHistory`, ưu tiên chọn đề chưa thi trong 66 đề HSK + hỗ trợ `examType: 'yct'`.
6. **Tìm kiếm Pinyin không dấu & chiết chữ Hán (`/v1/search`, `/v1/lookup`, Command Palette `Ctrl+K`)**: chuẩn hóa dấu thanh (`nihao` → `你好`, `xiexie` → `谢谢`), lọc sạch dấu `{}` và trả kèm từng chữ Hán cấu thành.
7. **Fallback Ngữ pháp New HSK 4–6 (`/v1/grammar/levels/:lvl`, `/v1/grammar/points`)**: tự động nối sang `hsk-level-4..6.json` khi chưa có file `new-hsk-level-4..6.json`, tránh trang rỗng.
8. **Nâng cấp `window.__xhzRunDiagnostics()` lên 34/34 kiểm thử không phá hủy dữ liệu**.

### Đợt 4 (v14.1 — Giao Diện Dễ Thương Sinh Động, 10 Ảnh Minh Họa Biên Tập, Hoạt Động Tương Tác & Hệ Hiệu Ứng)
- Tài liệu chi tiết: [`docs/VISUAL_INTERACTIVE_PLAN_v14.md`](./docs/VISUAL_INTERACTIVE_PLAN_v14.md).
1. **10 ảnh minh họa biên tập + phong cách storybook dễ thương** trong `images/studio/` (4 tranh mới kawaii ấm áp: `cute-capy-study.jpg`, `cute-panda-dict.jpg`, `cute-music-buddy.jpg`, `cute-lantern-party.jpg` + 6 tranh biên tập học thuật `hero-hanzi-studio.jpg`, `banner-dictionary-calligraphy.jpg`, `banner-listening-speaking.jpg`, `banner-exam-hall.jpg`, `banner-review-srs.jpg`, `banner-games-arcade.jpg`, tối ưu 45–146 KB, cache CDN & SW `htq-studio-v14`) kết hợp trưng bày kho 76 ảnh WebP sẵn có (tự chuyển sáng/tối `images/home/dark/*.webp` khi đổi Dark Mode).
2. **Nâng cấp Trang chủ (`/`)**: tông nền giấy kem ấm + ánh cam đào/tím/ngọc bích mềm mại, bo góc `24px`, hiệu ứng nảy lò xo nhẹ khi hover, Hero Capybara kính tròn + trà sữa, thẻ **Chữ Hán Hôm Nay 3D Flip** nền ô Mễ Tự Cách (米字格), ảnh minh họa cho 6 thẻ kỹ năng & hiệu ứng đếm số KPI mượt (`animateCountUp`).
3. **Bạn Học Đồng Hành Nổi Dễ Thương (`#htq-buddy-dock`)** ở góc trái dưới (tránh hoàn toàn nút chat góc phải & thanh Mobile Bottom Nav, tự ẩn trong phòng thi/bài học): chạm mở bong bóng thoại cổ vũ tiếng Trung thật (`加油！你真棒！`, `喝杯奶茶休息一下吧！`...), nghe phát âm `🔊`, bắn pháo hoa cổ vũ & xoay vòng đổi cả **8 bạn đồng hành** (`Capy 🦫`, `Bánh Bao 🥟`, `Tiểu Mãn 🌸`, `Hạ Vũ ☔`, `Lục Thần 🌿`, `Dương Dương ☀️`, `Mai 🌺`, `Mặc Ngôn 🖋️`).
4. **10 sân khấu hoạt động tương tác riêng theo từng nhóm trang (`#htq-page-stage`, có nút Thu gọn/Mở rộng)**:
   - `/hoc`, `/lo-trinh`: **Đổi 8 Bạn đồng hành trực tiếp** + vòng SVG tiến độ HSK 1.
   - `/on-tap`, `/so-tay`: **Thẻ lật 3D khởi động SRS** nối thẳng `/v2/review/signals`.
   - `/tra-chu`, `/han-tu`, `/tu-vung`, `/han-viet`: Banner Bé Gấu Trúc Đỏ + **Thanh nghe 4 thanh điệu mẫu (`mā má mǎ mà`)** có sóng âm Equalizer + chip bộ thủ & tra chữ ngẫu nhiên.
   - `/thu-vien*`: **Thanh độ phủ từ vựng Shimmer** + lối tắt luyện tập.
   - `/luyen-nghe`, `/luyen-noi`, `/luyen-chep-chinh-ta`: Banner Capy đeo tai nghe + **Khởi động tai nhận diện 4 thanh điệu** có đếm chuỗi đúng + sóng âm Equalizer.
   - `/luyen-go*`: **Mini Pinyin Sprint** gõ không dấu + Combo counter + lưu tiến độ.
   - `/kiem-tra-hsk`, `/de-kiem-tra`, `/kiem-tra-ngu-phap`, `/ngu-phap`: **Widget Kế hoạch & Đếm ngược kỳ thi HSK** nối trực tiếp `/v2/me/exam-plan` & `/v2/me/score-prediction`.
   - `/tro-choi*`: Banner Lễ hội Đèn lồng Capy & Bé Thỏ + **Đố vui Thành ngữ 4 chữ trong ngày** có ô chữ + giải nghĩa + phát âm.
   - `/tao-vo-tap-viet`, `/luyen-viet`, `/dich-tieng-trung`, `/them-pinyin`, `/cong-cu`: **Nạp nhanh mẫu chữ/mẫu câu 1 chạm**.
   - `/tai-khoan`: **Thẻ Cấp bậc Học giả & 4 Tem Thưởng Dễ Thương** (`🧋 Trà Sữa Chăm Chỉ`, `🐼 Gấu Trúc Từ Vựng`, `🥟 Bánh Bao Ngữ Pháp`, `🏮 Đèn Lồng Khảo Thí`) tính từ XP học tập thực tế.
5. **Hệ hiệu ứng toàn cục `window.__xhzStudioFx`**: thanh tiến độ cuộn trang 2.5px, pháo hoa giấy canvas (`confetti`), thông báo nổi (`toast`), đếm số (`animateCountUp`), sóng âm Equalizer (`pulseEq`), tôn trọng tuyệt đối `prefers-reduced-motion` và giữ `0` lỗi React hydration.
6. **Nâng cấp `window.__xhzRunDiagnostics()` lên 39/39 kiểm thử không phá hủy dữ liệu**.

---

## 3. Kiến trúc & Lệnh nhanh cho máy mới

| Thành phần | Thông số / Giá trị chi tiết |
| :--- | :--- |
| **Kho GitHub duy nhất** | [`https://github.com/hungktkthd/saochepweb`](https://github.com/hungktkthd/saochepweb) |
| **Tên miền chính thức (Vercel)** | **[`https://hoctiengtrungquoc.vercel.app`](https://hoctiengtrungquoc.vercel.app)** |
| **Supabase Project** | `skxgzzdunqloxxombtuc` (`https://skxgzzdunqloxxombtuc.supabase.co`, `public.study_profiles` + Auth `user_metadata.xhz_progress`) |
| **7 nhánh lưu trữ (~3,27 GB)** | `main` (~250 MB code + JSON), `media-visuals`, `media-etymology`, `media-audios`, `media-hsk-audio`, `media-sentences-1`, `media-sentences-2` |

```bash
git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git
cd saochepweb
node scripts/dev-server.mjs
```

---

## 4. Prompt dán nhanh khi tiếp tục trên trình duyệt / phiên AI khác

```text
Tôi đang tiếp tục phát triển và hoàn thiện dự án web học tiếng Trung (Hanzi Studio v4 — bản v14.0) tại https://hoctiengtrungquoc.vercel.app, mã nguồn GitHub: https://github.com/hungktkthd/saochepweb (nhánh `main` + 6 nhánh `media-*`), Supabase project `skxgzzdunqloxxombtuc`.

Hãy thực hiện các bước sau trước khi bắt đầu:
1. Clone hoặc cập nhật nhánh `main`:
   git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git (hoặc `git pull origin main`).
2. Đọc `PROJECT_HANDOVER.md`, `docs/VISUAL_INTERACTIVE_PLAN_v14.md`, `xiehanzi-runtime.js`, `api/ai.js`, `sw.js`, `site.webmanifest`, `vercel.json`. Giữ nguyên 100% giao diện Hanzi Studio v4, cơ chế tách kho theo tài khoản (`initializeScopedStorage`) và không làm mất dữ liệu trong `httq_progress_v2`, `xhz-seen-words-v1`, `xhz-practice-v1`, `httq_state`.
3. Kiểm tra sức khỏe hệ thống bằng `await window.__xhzRunDiagnostics()` trên Console trình duyệt (phải đạt `39/39`, `failed: 0`), sau đó tiếp tục yêu cầu mới của tôi: [MÔ TẢ YÊU CẦU MỚI TẠI ĐÂY].
```
