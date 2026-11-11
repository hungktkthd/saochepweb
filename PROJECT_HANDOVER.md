# 📋 TÀI LIỆU BÀN GIAO, TIẾN ĐỘ & CÂU LỆNH TIẾP TỤC TRÊN TRÌNH DUYỆT / MÁY MỚI (`PROJECT_HANDOVER.md`)

> **Cập nhật lần cuối**: Phiên bản **v10.0** (Đã tích hợp Lesson Runner Capybara 1:1 `/hoc/bai/*`, giao diện bài học giáo trình 1:1 `/thu-vien-*`, giao diện làm đề ngữ pháp 1:1 `/kiem-tra-ngu-phap/lam-bai`, sửa tra cứu từ đơn `/tu-vung/的`, nâng cấp AI Chatbox Dương Dương `/api/ai`, và đồng bộ tiến độ thực 2 chiều với Supabase Auth `user_metadata.xhz_progress` trên **`https://hoctiengtrungquoc.vercel.app`**).

---

## 🚀 1. CÂU LỆNH COPY-PASTE ĐỂ DÁN VÀO TRÌNH DUYỆT KHÁC / ĐOẠN CHAT MỚI / MÁY TÍNH MỚI

Khi bạn mở một **trình duyệt khác, đoạn chat AI mới hoặc máy tính mới chưa có dữ liệu**, chỉ cần **copy nguyên văn đoạn prompt dưới đây** và dán vào khung chat:

```text
Tôi đang tiếp tục phát triển và hoàn thiện dự án web học tiếng Trung (bản sao 1:1 của https://xiehanzi.com/) tại địa chỉ https://hoctiengtrungquoc.vercel.app.
Toàn bộ 100% mã nguồn, giao diện và 96.860 tệp dữ liệu (3,27 GB) đã được lưu trên kho GitHub: https://github.com/hungktkthd/saochepweb (nhánh chính `main` và 6 nhánh `media-*`).

Hãy thực hiện các bước sau trước khi bắt đầu:
1. Kiểm tra thư mục làm việc hiện tại:
   - Nếu chưa có repo `saochepweb` trên máy, hãy clone nhánh `main` về:
     git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git
   - Nếu đã có repo, hãy chạy `git pull origin main` để đồng bộ bản mới nhất.
2. Đọc kỹ file `PROJECT_HANDOVER.md` và `xiehanzi-runtime.js` ở thư mục gốc của repo để nắm toàn bộ kiến trúc hệ thống:
   - GitHub (`https://github.com/hungktkthd/saochepweb`) -> Vercel (`https://hoctiengtrungquoc.vercel.app`) -> Supabase (`xcthntcgenzfybefaphh`) + Vercel Serverless AI API (`/api/ai.js`).
   - Toàn bộ cơ chế chặn API `/v1/*`, `/v2/*`, luồng SSE voice/chat, trình phát phân đoạn YouTube Dictation, hệ thống ôn tập SRS `/on-tap`, các trang chi tiết động và rewrite URL nằm trong `xiehanzi-runtime.js` (6.050+ dòng) và `vercel.json`.
3. Xác nhận trạng thái đồng bộ hiện tại với tôi và sẵn sàng nhận yêu cầu kiểm tra / chỉnh sửa / nâng cấp tiếp theo. Mỗi khi sửa xong bất kỳ tính năng nào, luôn kiểm thử bằng trình duyệt thực tế, commit và push thẳng lên nhánh `main` của `https://github.com/hungktkthd/saochepweb` để tự động cập nhật lên `https://hoctiengtrungquoc.vercel.app`.
```

---

## 🛠️ 2. LỆNH KHỞI TẠO NHANH TRÊN MÁY TÍNH MỚI (DÀNH CHO AI HOẶC TERMINAL)

Nếu máy mới chưa có code, chỉ cần chạy các lệnh sau để tải bộ khung nhẹ (`main` ~250 MB, không cần tải 3 GB media về ổ cứng vì toàn bộ media đã được trỏ trực tiếp lên 6 nhánh `media-*` trên GitHub):

```bash
# 1. Tải nhánh main của dự án về máy mới (chỉ ~250MB, chứa đủ 100% code + JSON + giao diện)
git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git
cd saochepweb

# 2. Chạy thử ngay ở máy local (cổng 3000)
npx serve . -l 3000

# 3. Đẩy thay đổi lên GitHub (Vercel tự động deploy lên https://hoctiengtrungquoc.vercel.app)
git add -A
git commit -m "update"
git push origin main
```

---

## 🏗️ 3. KIẾN TRÚC HẠ TẦNG & THÔNG TIN KẾT NỐI ĐẦY ĐỦ

```text
GitHub (https://github.com/hungktkthd/saochepweb)
       │
       ▼  (Tự động triển khai khi push lên nhánh `main`)
Vercel (https://hoctiengtrungquoc.vercel.app)
       │
       ├──► xiehanzi-runtime.js (6.050+ dòng) — Bộ định tuyến SPA, API Interceptor (/v1/*, /v2/*), SSE Voice/Chat, Dictation Player, SRS Review
       ├──► Supabase (https://xcthntcgenzfybefaphh.supabase.co) — Tài khoản, tiến độ học, kết quả thi, sổ tay
       └──► AI APIs (/api/ai.js + Web Speech / TTS)             — Chấm nói, chấm viết, dịch, gia sư AI
```

| Thành phần | Thông số / Giá trị chi tiết |
| :--- | :--- |
| **Kho GitHub duy nhất** | [`https://github.com/hungktkthd/saochepweb`](https://github.com/hungktkthd/saochepweb) |
| **Tên miền chính thức (Vercel)** | **[`https://hoctiengtrungquoc.vercel.app`](https://hoctiengtrungquoc.vercel.app)** |
| **Vercel Project** | Scope: `hungktkthd-7816` / Project Name: `hoctiengtrungquoc` (đã tắt SSO Protection, gán domain `hoctiengtrungquoc.vercel.app`) |
| **Tên miền phụ (GitHub Pages)** | [`https://hungktkthd.github.io/saochepweb/`](https://hungktkthd.github.io/saochepweb/) |
| **Supabase Project ID** | `skxgzzdunqloxxombtuc` (kích hoạt Google OAuth `external.google: true`) |
| **Supabase URL** | `https://skxgzzdunqloxxombtuc.supabase.co` |
| **Supabase Publishable Key** | `sb_publishable_tyYxDk87Wa70dYxea2ljug_DCZEx-18` |
| **Google OAuth Redirect URL** | `https://hoctiengtrungquoc.vercel.app/tai-khoan` |
| **Các bảng Supabase đã tạo (có RLS)** | `public.study_profiles` (lưu tiến độ, từ vựng đã lưu, streak cho workspace `hoctiengtrungquoc`), `public.exam_results` (lưu lịch sử làm đề thi HSK) |

---

## ✅ 4. TẤT CẢ NHỮNG GÌ ĐÃ HOÀN THÀNH (CẬP NHẬT ĐẾN v9.0)

### 4.1. Sao chép & Gộp 100% Dữ liệu + Media (`96.860 tệp — 3,27 GB`) vào 1 Repo GitHub duy nhất
Toàn bộ dữ liệu và media của `https://xiehanzi.com/` đã được tải về 100% và lưu trong duy nhất kho `hungktkthd/saochepweb` chia làm **7 nhánh (branches)**:

| Nhánh (Branch) | Số tệp | Dung lượng | Nội dung chi tiết |
| :--- | ---: | ---: | :--- |
| **`main`** | **2.400+ tệp** | **~250 MB** | Toàn bộ 283 tệp HTML gốc, 231/231 gói Webpack JS và 181/181 tệp CSS/WOFF2/PNG (`_next/static/`), 280+ ảnh giao diện (`images/`, `thay-do/`, `level_images/`, `sounds/`, `hanzi-lookup/`), toàn bộ kho dữ liệu JSON (`data/`), `xiehanzi-runtime.js`, `vercel.json`. |
| **`media-visuals`** | **9.231 tệp** | **592,74 MB** | 7.751 ảnh động GIF bút thuận (`gif/`), 1.045 ảnh đề thi HSK (`hsk-tests/`), 414 ảnh minh họa từ vựng (`word-illustration/`), 21 ảnh cấp độ (`level_images/`). |
| **`media-etymology`** | **13.434 tệp** | **52,06 MB** | Toàn bộ 13.434 hình ảnh tự nguyên chữ Hán cổ (Giáp cốt, Kim văn, Triện thư, Lệ thư) trong `etymology/`. |
| **`media-audios`** | **30.781 tệp** | **281,73 MB** | 17.760 file MP3 phát âm chữ Hán (`audios/`) và 13.021 file MP3 phát âm từ vựng (`word_audios/`). |
| **`media-hsk-audio`** | **1.562 tệp** | **1.097,62 MB** | Toàn bộ 1.562 file MP3 bài nghe của 66 bộ đề thi thử HSK 1–6 (`hsk-audio/`). |
| **`media-sentences-1`** | **20.035 tệp** | **514,80 MB** | Nửa đầu (mã hash `0`–`7`) file MP3 phát âm câu ví dụ (`sentence-audio/`). |
| **`media-sentences-2`** | **19.612 tệp** | **504,32 MB** | Nửa sau (mã hash `8`–`f`) file MP3 phát âm câu ví dụ (`sentence-audio/`). |

### 4.2. Các Tính Năng Trọng Tâm Đã Rà Sửa & Hoàn Thiện Triệt Để (v8.0)

1. **Lộ trình Học (`/hoc`), Bắt đầu Học (`/hoc/bat-dau`) & Bạn Đồng Hành (Gọi điện Voice + Chat)**:
   - Luồng `/hoc/bat-dau`: Chọn mục tiêu → Chọn thời lượng → Chọn trình độ → Chọn Bạn đồng hành (Capy, Tiểu Mao, Tiểu Hổ...) → Intro → **Vào Bài 1** (`/hoc/bai/bai-1-hello-ai-xiaoyu`) mượt mà, tự động dọn dẹp lớp phủ modal (`[data-modal-layer]`) và không bị redirect ngược lại.
   - **Nói chuyện Voice (`POST /v2/companion/voice/turn` & `/v1/thay-do/pho/canh/:id/luot`)**:
     - Đã bổ sung cơ chế **Microphone Fallback** tự tạo luồng âm thanh giả lập qua `AudioContext.createMediaStreamDestination()` khi máy không có mic hoặc trình duyệt chặn quyền mic.
     - Trả về luồng **Server-Sent Events (`text/event-stream`)** chuẩn gồm các sự kiện `heard` → `grade` → `sentence` → `sentence_end` → `suggest` → `mission` → `quota` → `done` kèm đọc phát âm tiếng Trung trực tiếp — **triệt tiêu hoàn toàn lỗi *"Không có kết nối mạng. Kiểm tra mạng rồi thử lại."***.
   - **Nhắn tin Chat với Bạn đồng hành (`GET/POST /v2/companion/chat`, `POST /v2/companion/chat/stream`)**: Lưu lịch sử hội thoại vào `localStorage` (`httq_companion_chat_turns`) và phản hồi thông minh theo ngữ cảnh bài học.

2. **Luyện Nghe Chép Chính Tả (`/luyen-chep-chinh-ta` & `/luyen-chep-chinh-ta/:slug`) — Chuẩn 1:1 Bản Gốc**:
   - Đọc đầy đủ danh sách phân đoạn từ `segData.items` trong `/data/dictation/videos/{id}-segments.json`.
   - Tích hợp **YouTube IFrame Player API** thực sự:
     - Tự động tua tới `seg.startMs / 1000` và tự dừng (hoặc lặp lại khi bật **Lặp câu**) tại `seg.endMs / 1000`.
     - Đầy đủ nút chỉnh tốc độ **`0.5×`, `0.75×`, `1×`, `1.25×`, `1.5×`**, **Ẩn phụ đề** (che phụ đề cứng dưới đáy video), **Đọc mẫu**.
   - **Cột phải — Danh sách câu (`Câu 1 .. Câu N`)**:
     - Hiển thị toàn bộ các câu trong bài kèm thời gian, độ khó (`Dễ`, `Vừa`, `Khó`), bộ lọc (**Tất cả / Câu sai / Chưa làm**), nút **Tới câu chưa làm tiếp theo →**, và nút **👁 Hiện chữ / 🙈 Ẩn chữ**.
     - **Bấm vào bất kỳ câu nào trong danh sách** để nhảy ngay tới đoạn đó và chép chính tả.
   - Hỗ trợ đủ 4 chế độ: **Gõ hết** (kèm ô chữ Hán và nút 💡 Gợi ý từng chữ), **Điền chỗ trống** (đục lỗ từ khóa), **Chỉ nghe**, và **Gõ pinyin**.

3. **Trung Tâm Ôn Tập (`/on-tap`, `/hoc/on-tap`) & Toàn Bộ Chức Năng Con**:
   - **Chức năng 1 — Ôn bài đến hạn (`/hoc/bai/on-tap-den-han`)**: Phiên ôn tập ngắt quãng SRS gồm 3 tab tương tác:
     1. **🗂️ Thẻ lật SRS**: Lật thẻ xem nghĩa + ví dụ, nghe phát âm và chấm 4 mức độ nhớ (**Quên 1 phút / Khó 10 phút / Tốt 1 ngày / Dễ 4 ngày**).
     2. **🎯 Trắc nghiệm nhanh (12 câu)**: Chọn đáp án đúng và tính điểm trực tiếp.
     3. **⌨️ Tự gõ chữ Hán / Pinyin**: Nhìn nghĩa tiếng Việt và gõ lại chữ Hán hoặc Pinyin.
   - **Chức năng 2 — Ôn lỗi sai (`/hoc/bai/on-tap-loi-sai`)**: Luyện phân biệt và khắc phục 4 lỗi sai hay nhầm (`谢谢 vs 对不起`, `不客气 vs 没关系`, thanh điệu `老师 lǎoshī vs lǎoshì`, nét chữ `买 mǎi vs 卖 mài`).
   - **Chức năng 3 — Luyện thẻ câu (`/hoc/bai/on-tap-the-cau`)**: Luyện phản xạ 6 mẫu câu & lượng từ HSK 1 (`一个人`, `两本书`, `三杯茶`, `四件衣服`, `五只猫`...).
   - **Trang Sổ lỗi (`/hoc/so-loi`) & Từ đã học (`/hoc/tu-da-hoc`)**: Hiển thị đầy đủ danh sách từ, giải thích lỗi sai, phát âm và nút *"Đã nhớ, bỏ qua"*.
   - **Cài đặt Ôn tập**: Lưu bền vững tùy chọn **Ẩn pinyin khi ôn** và **Dạng câu hỏi ôn** qua `PATCH /v2/me/learning-profile`.

4. **Thư Viện Giáo Trình (`/thu-vien-new-hsk/*`, ...), Đề Thi Thử HSK (`/kiem-tra-hsk/*`), Ngữ Pháp, Từ Điển & Trò Chơi**:
   - Hiển thị đầy đủ ảnh minh họa và audio cho mọi đề thi thử HSK 3.0 (`/kiem-tra-hsk/hsk1/test/hsk30-1` .. `hsk6`).
   - Hiển thị đầy đủ tất cả các cấp độ, chủ đề và bài học trong `/thu-vien-new-hsk`, `/thu-vien-hsk`, `/thu-vien-yct`, `/thu-vien-boya`, `/thu-vien-hanyu-jiaocheng`.
   - Hiển thị đầy đủ trang chi tiết Chữ Hán (`/han-tu/:char`), Từ vựng (`/tu-vung/:word`), Âm Hán Việt (`/han-viet/:slug`), Ngữ pháp (`/ngu-phap/:level/:pointId`), Tiến độ (`/hoc/tien-do`) và Thói quen (`/hoc/thoi-quen`).

5. **Tài Khoản Người Dùng (`/tai-khoan`, `/dang-nhap`, `/dang-ky`) & Đồng Bộ Tiến Độ Thực Qua Supabase (`v10.0`)**:
   - Tích hợp trực tiếp **Supabase Google OAuth** (`https://skxgzzdunqloxxombtuc.supabase.co`) vào giao diện gốc của `tai-khoan.html`, `dang-nhap.html`, `dang-ky.html` và thanh Header toàn trang mà **giữ nguyên 100% thiết kế gốc**.
   - **Đồng bộ tiến độ thực 2 chiều (`getRealProgressSummary` & `syncProgressToSupabaseAuth` / `syncProgressFromSupabaseAuth`)**: Loại bỏ toàn bộ con số giả cố định (`5 ngày`, `4/5 buổi`, `64 từ`, `12/100`), thay bằng thống kê thực tế theo hoạt động học tập của người dùng và lưu trực tiếp lên `user_metadata.xhz_progress` của tài khoản Supabase Auth (kèm nút **🔄 Đồng bộ ngay** trên `/tai-khoan`).
   - **Capybara Lesson Runner 1:1 (`/hoc/bai/*`)**: Đầy đủ màn hình Intro Capybara, chuỗi bài tập tương tác liên hoàn (`intro_word` → `choose_meaning` → `write_character` với HanziWriter → `type_pinyin` → `match_pairs` → `listen_choose` → `order_sentence` → `fill_blank` → `read_sentence`), không bị che khuất nút `Kiểm tra` / `Tiếp tục` ở chân trang.
   - **Giao diện Chi tiết Bài học Giáo trình 1:1 (`/thu-vien-new-hsk/...`)**: Banner Hero xanh dương (`AI Tiểu Ngữ, xin chào!`), 3 nút hành động (`Tạo vở tập viết`, `Học bằng Flashcard`, `Bắt đầu luyện tập`), thanh công cụ lọc/ẩn Pinyin/ẩn nghĩa, chú thích màu 4 thanh điệu và lưới thẻ từ vựng 5 cột.
   - **Giao diện Làm bài Kiểm tra Ngữ pháp 1:1 (`/kiem-tra-ngu-phap/lam-bai`)**: Thanh điều hướng dính trên cùng (`‹ Thoát`, `Kiểm tra ngữ pháp`, `Đã trả lời X/20`, toàn màn hình, `Nộp bài`), bố cục 2 cột với thẻ câu hỏi đánh số, nút gắn cờ đánh dấu và bảng lưới `Câu hỏi 1..20` ở cột phải.
   - **Tra cứu từ đơn (`/tu-vung/的`) & AI Chatbox Dương Dương (`/api/ai`)**: Tự động liên kết dữ liệu chữ Hán đơn trong `/data/characters/` khi tra cứu tại `/tu-vung/:slug`, và kết nối khung chat Dương Dương với `/api/ai` (`action: 'companion-chat'`) để giải thích từ vựng, ngữ pháp và dịch câu thông minh.

---

## 🧭 5. HƯỚNG MỞ RỘNG / NÂNG CẤP TIẾP THEO (NẾU CẦN)

Khi tiếp tục ở phiên làm việc mới, bạn có thể yêu cầu AI thực hiện thêm các nâng cấp tùy chọn sau:
1. **Mở rộng ngân hàng bài học chi tiết trong `/hoc/bai/:slug`** cho toàn bộ các bài từ HSK 2 đến HSK 6 (hiện tại đã có sẵn toàn bộ dữ liệu JSON trong `/data/curriculums/new-hsk/lessons/`).
2. **Tích hợp nhận diện giọng nói thực tế (Web Speech API `webkitSpeechRecognition` `zh-CN`)** vào nút Giữ để nói trên `/hoc` để chấm điểm chính xác từng âm tiết người dùng đọc qua micro thật.
3. **Đồng bộ tài khoản người dùng (Đăng ký / Đăng nhập qua Supabase Auth)** để lưu tiến độ học tập xuyên suốt giữa điện thoại và máy tính.
