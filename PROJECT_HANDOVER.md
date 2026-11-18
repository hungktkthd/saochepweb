# PROJECT HANDOVER — Học Tiếng Trung (`saochepweb`) v12.0

- **Production URL**: https://hoctiengtrungquoc.vercel.app
- **GitHub Repository**: https://github.com/hungktkthd/saochepweb (nhánh `main` + 6 nhánh `media-*`)
- **Supabase Project**: `skxgzzdunqloxxombtuc` (`https://skxgzzdunqloxxombtuc.supabase.co`, Publishable Key: `sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18`)
- **Kiến trúc tổng thể**: Giao diện **Hanzi Studio v4** (`?v=htq5`, Indigo `#4f46e5` + Imperial Teal `#0d9488`, đã loại bỏ branding cũ & thêm bảo vệ React hydration `#418`), lưu trữ tách riêng theo tài khoản (`initializeScopedStorage()`), hệ thống SRS thật + lớp Runtime trung tâm [`xiehanzi-runtime.js`](./xiehanzi-runtime.js) (intercept `window.fetch`, SPA routing, Capybara Lesson Runner, đồng bộ đa tầng) và API Serverless [`api/ai.js`](./api/ai.js).

---

## 1. Hệ thống đồng bộ & lưu trữ dữ liệu đa tầng (Non-Destructive + Per-Account Scoped)

1. **`localStorage` tách theo tài khoản & tương thích chéo 2 chiều (`initializeScopedStorage`)**:
   - Mọi khóa cục bộ (`httq_state`, `httq_learned_grammar`, `httq_user_mistakes`, `httq_dictation_progress`, `httq_habit_settings`, `httq_game_high_scores`, `httq_speaking_progress`) được tách vùng theo người dùng đăng nhập (`:user:${id}` vs `:guest`) tránh trộn dữ liệu giữa các tài khoản trên cùng trình duyệt.
   - `httq_progress_v2`: Khối tiến độ trung tâm (`doneStages`, `doneActivities`, `learnedWords`, `learnedGrammarIds`, `userMistakes`, `dismissedMistakes`, `savedWords`, `masteredChars`, `examHistory`, `dictationProgress`, `learningProfile`, `habitSettings`, `gameHighScores`, `speakingProgress`, `activeDates`, `minutesByDate`, `sessionsByDate`, `dailyStepsByDate`, `gradingUsed`, `voiceUsed`, `longestStreak`, `currentStageKey`, `currentLessonId`, `updatedAt`).
   - `xhz-seen-words-v1` & `xhz-practice-v1`: Store SRS gốc của bundle Next.js, tự động đồng bộ 2 chiều qua `getRealProgress()` / `saveRealProgress()` / `recordStudyProgress()`.
2. **Supabase Cloud Sync**:
   - Đăng nhập Google OAuth qua Supabase (`/tai-khoan` hoặc `/tai-khoan-moi`) lưu phiên (`xiehanzi_access_token`, `sb_access_token`, `httq_user`, `httq_user_id`, `httq_real_auth`).
   - Tiến độ được đồng bộ lên `auth/v1/user` (`user_metadata.xhz_progress`) và bảng `public.study_profiles` (`user_id, workspace: 'hoctiengtrungquoc', state, updated_at`, `on_conflict=user_id,workspace`).
3. **Sao lưu & Khôi phục JSON thủ công**:
   - UI trực tiếp trên `/tai-khoan` (`📥 Xuất sao lưu (.json)` / `📤 Khôi phục từ file (.json)`).
   - Helper console: `window.__xhzExportProgressJson()` và `window.__xhzImportProgressJson(jsonStr)`.

---

## 2. Tổng hợp 20 cải tiến đã triển khai & kiểm thử (v12.0)

1. **Gỡ bỏ API bị che (shadowed) & nối Ngữ pháp / Hoạt động tuần / Gần đây**: `/v1/grammar-progress` (`GET`/`POST`/`DELETE`), `/v2/me/weekly-activity`, `/v2/me/recent-actions`.
2. **Cầu nối 2 chiều sang Store Next.js & các API Sync**: Đồng bộ `xhz-seen-words-v1` & `xhz-practice-v1`; xử lý `/v2/review/signals`, `/v1/practice-progress`, `/v1/practice-progress/sync`, `/v1/study-time/sync`, `/v1/speaking-progress/sync`, `/v1/speaking/progress`, `/v1/speaking/assess`.
3. **Capybara Lesson Runner đầy đủ cho Hội thoại (`dialogue`), Nhập vai (`roleplay_turn`) & Luyện đề (`exam_item`) + Fallback Audio**: Hỗ trợ chuỗi câu hỏi hội thoại, thẻ chuẩn bị & nhập vai mic, chuẩn hóa audio/hình ảnh.
4. **Mở khóa toàn bộ 8 Chương / 40 Chặng HSK 3.0 L1**: Đọc động từ `data/learning-tracks/hsk30-L1.json`, mở rộng `advanceNextLessonInTrack` 40 chặng, sinh động `.learn.2`, `.dlg`, `.rp1`/`.rp2`, `.exam`, `.write`.
5. **Sao lưu đám mây đa tầng & Xuất/Nhập JSON không mất dữ liệu**: Gộp không phá hủy mọi trường dữ liệu học tập + bảng `public.study_profiles` + tách kho theo từng tài khoản (`initializeScopedStorage`).
6. **Ghi nhận Lỗi sai thực & Sổ lỗi / Từ đã học (`/on-tap/da-hoc`, `/on-tap/so-loi`)**: Ghi lỗi thật khi trả lời sai, tự động đưa vào lịch ôn SRS (`/v2/review/summary`) & sửa khóa tra cứu từ vựng (`e.w || e.word || e.hanzi`).
7. **Khôi phục 6 file JSON Trò chơi (`data/misc/games-*.json`), Bộ đề YCT 1–4 & Kỷ lục điểm game (`gameHighScores`)**: Nạp danh sách & chi tiết đề YCT (`yct-1-01`..`yct-4-02`) từ kho `data/curriculums/yct/lessons/`.
8. **Đồng bộ tiến độ Giáo trình (`/thu-vien-*`) & Tab Luyện gõ Pinyin/Chữ Hán**: API `/v1/curriculums/*/levels/*/lessons` trả `learnedCount` & `progressPct`; bổ sung tab thứ 3 `⌨️ Gõ Pinyin & Chữ Hán` tại `/luyen-tap`.
9. **Tự động sinh hội thoại Luyện nói cho mọi chủ đề & Nhận diện giọng nói `zh-CN`**: API `/v1/speaking/dialogues/*` sinh hội thoại khi thiếu file tĩnh; tích hợp `SpeechRecognition`/`webkitSpeechRecognition` (`zh-CN`).
10. **Nút "⭐ Lưu vào Sổ tay" trên `/han-tu/:slug` & `/tu-vung/:slug` + Làm giàu `/v1/notebook`**: Đồng bộ `httq_state` và bổ sung Pinyin/Hán Việt/Nghĩa từ index.
11. **Phòng thi HSK 3.0, CTI & YCT (`/de-kiem-tra/lam-bai/:id`)**: Đồng hồ đếm ngược, bảng lưới câu hỏi (`#xhz-exam-nav-grid`), trung thực không chấm ảo câu CTI chưa có đáp án (`answerKey === null`), lưu lịch sử thi thật vào `/v2/me/exam-sittings` & `/v2/me/exam-readiness`.
12. **Tra cứu đầy đủ 3.000+ chữ Hán theo Bộ thủ (`/tra-chu/bo-thu/:radical`) & Cấp độ HSK (`/tra-chu/hsk/:level`)**: Lọc nhanh theo chữ/pinyin/Hán Việt/nghĩa, xem nét viết & phát âm.
13. **Biểu đồ 5 kỹ năng, Heatmap 12 tuần & Cài đặt mục tiêu (`/hoc/tien-do`, `/hoc/thoi-quen`)**: Bar chart 5 kỹ năng, dự đoán điểm HSK, lịch T2–CN, nhiệt đồ 12 tuần & form mục tiêu.
14. **Tự động điền chữ Hán từ `?text=...` trên `/tao-vo-tap-viet` & Thanh công cụ in `/flashcard-pdf`**: Hỗ trợ điền React-safe qua hydration & lấy nhanh từ đã học.
15. **Ghi nhận tiến độ & từ vựng khi Luyện chép chính tả (`/luyen-chep-chinh-ta/:id`)**: Cập nhật `dictationProgress` và từ vựng sau khi kiểm tra đáp án.
16. **Phân tích từ ghép + Chiết tự chữ Hán tự động trong `/v1/translate` & `api/ai.js`**: Tách từ ghép 2–4 chữ qua `vocabulary/index.json` kèm âm Hán Việt & chiết tự.
17. **Chuẩn hóa `tai-khoan-moi.html` (UTF-8 & chuyển hướng `/tai-khoan`) & Giao diện Xuất/Nhập sao lưu trên `/tai-khoan`**: Trải nghiệm đăng nhập Google & sao lưu file `.json` liền mạch.
18. **Cơ chế `loadLocalJson` thông minh**: Bỏ qua file lỗi/HTML-stub, xóa cache lỗi để retry an toàn & preload ngầm `hsk30-L1.json` tại `/hoc`.
19. **Bộ tự kiểm tra toàn diện `window.__xhzRunDiagnostics()`**: Chạy 17 kiểm thử toàn vẹn dữ liệu & API không làm thay đổi dữ liệu học viên.
20. **Hợp nhất Hanzi Studio v4, chuẩn hóa tài liệu bàn giao v12.0 & Kiểm thử E2E trên môi trường thực Vercel**.

---

## 3. Kiến trúc & Lệnh nhanh cho máy mới

```text
GitHub (https://github.com/hungktkthd/saochepweb — nhánh main + 6 nhánh media-*)
       │
       ▼  (Tự động triển khai khi push lên nhánh `main`)
Vercel (https://hoctiengtrungquoc.vercel.app)
       │
       ├──► xiehanzi-runtime.js — SPA Router, API Interceptor (/v1/*, /v2/*), SRS thật, Capybara Runner, Hanzi Studio v4
       ├──► Supabase (https://skxgzzdunqloxxombtuc.supabase.co) — OAuth, public.study_profiles, user_metadata.xhz_progress
       └──► AI APIs (/api/ai.js + Web Speech / TTS) — Chấm nói, chấm viết, dịch, gia sư AI
```

| Thành phần | Thông số / Giá trị chi tiết |
| :--- | :--- |
| **Kho GitHub duy nhất** | [`https://github.com/hungktkthd/saochepweb`](https://github.com/hungktkthd/saochepweb) |
| **Tên miền chính thức (Vercel)** | **[`https://hoctiengtrungquoc.vercel.app`](https://hoctiengtrungquoc.vercel.app)** |
| **Vercel Project** | Scope: `hungktkthd-7816` / Project Name: `hoctiengtrungquoc` |
| **Supabase Project ID** | `skxgzzdunqloxxombtuc` (Google OAuth `external.google: true`) |
| **Supabase URL & Key** | `https://skxgzzdunqloxxombtuc.supabase.co` / `sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18` |
| **Redirect URI sau đăng nhập** | `https://hoctiengtrungquoc.vercel.app/tai-khoan` |
| **Bảng Supabase** | `public.study_profiles` (`workspace: 'hoctiengtrungquoc'`) + Auth `user_metadata.xhz_progress` |
| **7 nhánh lưu trữ (~3,27 GB)** | `main` (~250 MB code + JSON), `media-visuals`, `media-etymology`, `media-audios`, `media-hsk-audio`, `media-sentences-1`, `media-sentences-2` |

Lệnh khởi chạy local trên máy mới:

```bash
git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git
cd saochepweb
node scripts/dev-server.mjs
```

---

## 4. Prompt dán nhanh khi tiếp tục trên trình duyệt / phiên AI khác

```text
Tôi đang tiếp tục phát triển và hoàn thiện dự án web học tiếng Trung (Hanzi Studio v4) tại https://hoctiengtrungquoc.vercel.app, mã nguồn GitHub: https://github.com/hungktkthd/saochepweb (nhánh `main` + 6 nhánh `media-*`), Supabase project `skxgzzdunqloxxombtuc`.

Hãy thực hiện các bước sau trước khi bắt đầu:
1. Clone hoặc cập nhật nhánh `main`:
   git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git (hoặc `git pull origin main`).
2. Đọc `PROJECT_HANDOVER.md`, `xiehanzi-runtime.js`, `api/ai.js`, `tai-khoan-moi.html`, `vercel.json`. Giữ nguyên 100% giao diện Hanzi Studio v4, cơ chế tách kho theo tài khoản (`initializeScopedStorage`) và không làm mất dữ liệu trong `httq_progress_v2`, `xhz-seen-words-v1`, `xhz-practice-v1`, `httq_state`.
3. Kiểm tra sức khỏe hệ thống bằng `await window.__xhzRunDiagnostics()` trên Console trình duyệt (phải đạt `17/17`, `failed: 0`), sau đó tiếp tục yêu cầu mới của tôi: [MÔ TẢ YÊU CẦU MỚI TẠI ĐÂY].
```
