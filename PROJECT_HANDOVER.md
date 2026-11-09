# 📋 TÀI LIỆU BÀN GIAO, TIẾN ĐỘ & CÂU LỆNH TIẾP TỤC TRÊN MÁY MỚI (`PROJECT_HANDOVER.md`)

---

## 🚀 1. CÂU LỆNH COPY-PASTE ĐỂ TIẾP TỤC TRÊN MÁY TÍNH MỚI (KHÔNG CÓ DỮ LIỆU CŨ)

Khi bạn chuyển sang **một máy tính mới hoàn toàn trắng dữ liệu**, bạn chỉ cần mở AI (Antigravity / Cursor / Claude / ChatGPT...) và **dán nguyên văn đoạn lệnh dưới đây**:

```text
Tôi đang tiếp tục phát triển dự án web học tiếng Trung (bản sao 1:1 của https://xiehanzi.com/) trên một máy tính mới chưa có dữ liệu cục bộ.
Toàn bộ 100% mã nguồn, giao diện và 96.860 tệp dữ liệu (3,27 GB) đã được lưu trên kho GitHub: https://github.com/hungktkthd/saochepweb và đang triển khai tại https://hoctiengtrungquoc.vercel.app.

Hãy thực hiện các bước sau:
1. Clone nhánh `main` của kho lưu trữ về máy:
   git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git
2. Đọc kỹ file `PROJECT_HANDOVER.md` ở thư mục gốc của repo để nắm toàn bộ kiến trúc (GitHub -> Vercel `hoctiengtrungquoc.vercel.app` -> Supabase `xcthntcgenzfybefaphh` + AI APIs), những gì đã làm xong và những gì cần làm tiếp.
3. Tiếp tục thực hiện lần lượt các hạng mục trong mục "4. NHỮNG GÌ CHƯA HOÀN THIỆN / CẦN LÀM TIẾP" của `PROJECT_HANDOVER.md` (bắt đầu từ Hạng mục 1: Xử lý Hydrate các Trang Chi Tiết Động, sau đó tới Hạng mục 2: Hoàn thiện API tương tác chấm điểm/luyện nghe/luyện gõ trong `xiehanzi-runtime.js`, và Hạng mục 3: Tích hợp AI APIs).
4. Mỗi khi sửa xong, push lên nhánh `main` của `https://github.com/hungktkthd/saochepweb` và deploy lên `https://hoctiengtrungquoc.vercel.app`.
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

# 3. Kết nối và triển khai lên Vercel (https://hoctiengtrungquoc.vercel.app)
npx vercel login
npx vercel link --project hoctiengtrungquoc --yes
npx vercel deploy --prod --yes
```

---

## 🏗️ 3. KIẾN TRÚC HẠ TẦNG & THÔNG TIN KẾT NỐI ĐẦY ĐỦ

```text
GitHub (https://github.com/hungktkthd/saochepweb)
       │
       ▼  (Tự động triển khai / Vercel CLI)
Vercel (https://hoctiengtrungquoc.vercel.app)
       │
       ├──► Supabase (https://xcthntcgenzfybefaphh.supabase.co) — Tài khoản, dữ liệu, tiến độ học, kết quả thi
       └──► AI APIs (Gemini / Web Speech / Serverless API)      — Chấm nói, chấm viết, dịch, gia sư AI
```

| Thành phần | Thông số / Giá trị chi tiết |
| :--- | :--- |
| **Kho GitHub duy nhất** | [`https://github.com/hungktkthd/saochepweb`](https://github.com/hungktkthd/saochepweb) |
| **Tên miền chính thức (Vercel)** | **[`https://hoctiengtrungquoc.vercel.app`](https://hoctiengtrungquoc.vercel.app)** |
| **Vercel Project** | Scope: `hungktkthd-7816` / Project Name: `hoctiengtrungquoc` (đã tắt SSO Protection, gán domain `hoctiengtrungquoc.vercel.app`) |
| **Tên miền phụ (GitHub Pages)** | [`https://hungktkthd.github.io/saochepweb/`](https://hungktkthd.github.io/saochepweb/) |
| **Supabase Project ID** | `xcthntcgenzfybefaphh` |
| **Supabase URL** | `https://xcthntcgenzfybefaphh.supabase.co` |
| **Supabase Publishable Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdGhudGNnZW56ZnliZWZhcGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2NDE0NjQsImV4cCI6MjEwOTIxNzQ2NH0.0L3BZslXqmIkiH3kuKSL0HJeo_gmZ15E614xqnxhbdM` |
| **Các bảng Supabase đã tạo (có RLS)** | `public.study_profiles` (lưu tiến độ, từ vựng đã lưu, streak cho workspace `hoctiengtrungquoc`), `public.exam_results` (lưu lịch sử làm đề thi HSK) |

---

## ✅ 4. TẤT CẢ NHỮNG GÌ ĐÃ HOÀN THÀNH (100% DỮ LIỆU, MEDIA & GIAO DIỆN 1:1)

### 4.1. Sao chép & Gộp 100% Dữ liệu + Media (`96.860 tệp — 3,27 GB`) vào 1 Repo GitHub duy nhất
Toàn bộ dữ liệu và media của `https://xiehanzi.com/` đã được tải về 100% và lưu trong duy nhất kho `hungktkthd/saochepweb` chia làm **7 nhánh (branches)** để nhánh `main` luôn nhẹ (`~250 MB`) giúp clone trên máy mới và deploy lên Vercel chỉ mất vài giây:

| Nhánh (Branch) | Số tệp | Dung lượng | Nội dung chi tiết |
| :--- | ---: | ---: | :--- |
| **`main`** | **2.400+ tệp** | **~250 MB** | Toàn bộ 94 tuyến trang HTML gốc, 231/231 gói Webpack JS và 181/181 tệp CSS/WOFF2/PNG (`_next/static/`), 280/280 ảnh giao diện (`images/`, `thay-do/`, `level_images/`, `sounds/`, `hanzi-lookup/`), toàn bộ kho dữ liệu JSON (`data/`), `xiehanzi-runtime.js`, `vercel.json`. |
| **`media-visuals`** | **9.231 tệp** | **592,74 MB** | 7.751 ảnh động GIF bút thuận (`gif/`), 1.045 ảnh đề thi HSK (`hsk-tests/`), 414 ảnh minh họa từ vựng (`word-illustration/`), 21 ảnh cấp độ (`level_images/`). |
| **`media-etymology`** | **13.434 tệp** | **52,06 MB** | Toàn bộ 13.434 hình ảnh tự nguyên chữ Hán cổ (Giáp cốt, Kim văn, Triện thư, Lệ thư) trong `etymology/`. |
| **`media-audios`** | **30.781 tệp** | **281,73 MB** | 17.760 file MP3 phát âm chữ Hán (`audios/`) và 13.021 file MP3 phát âm từ vựng (`word_audios/`). |
| **`media-hsk-audio`** | **1.562 tệp** | **1.097,62 MB** | Toàn bộ 1.562 file MP3 bài nghe của 66 bộ đề thi thử HSK 1–6 (`hsk-audio/`). |
| **`media-sentences-1`** | **20.035 tệp** | **514,80 MB** | Nửa đầu (mã hash `0`–`7`) file MP3 phát âm câu ví dụ (`sentence-audio/`). |
| **`media-sentences-2`** | **19.612 tệp** | **504,32 MB** | Nửa sau (mã hash `8`–`f`) file MP3 phát âm câu ví dụ (`sentence-audio/`). |

### 4.2. Kho Dữ Liệu JSON Trong Thư Mục `data/` Trên Nhánh `main`
1. **`data/characters/`**: Đủ **9.931/9.931 chữ Hán** (`characters-01.json` .. `characters-20.json` + `index.json`).
2. **`data/vocabulary/`**: Đủ **11.534/11.534 từ vựng** (`vocabulary-01.json` .. `vocabulary-12.json` + `index.json`).
3. **`data/han-viet/`**: Đủ **6.704/6.704 mục âm Hán Việt** (`han-viet-01.json` .. `han-viet-07.json` + `index.json`).
4. **`data/curriculums/`**: Đủ **5 bộ giáo trình / 33 cấp độ / 1.145 tệp JSON** (`hsk`, `new-hsk`, `yct`, `boya`, `hanyu-jiaocheng` — gồm `overview.json`, `levels/`, `lessons/`, `topics/`).
5. **`data/speaking/`**: Đủ **36 tệp** hội thoại luyện nói theo cấp độ & chủ đề.
6. **`data/grammar/`**: Đủ **489 chủ điểm ngữ pháp** (`hsk-level-1..6.json`, `new-hsk-level-1..3.json`) + **9.780 câu hỏi trắc nghiệm ngữ pháp** (`quiz-hsk1..6.json`, `quiz-new-hsk1..3.json`, `quiz-tracks.json`).
7. **`data/tests/`**: Đủ **66/66 bộ đề thi thử HSK 1–6** (`data/tests/papers/level-{1..6}-{testId}.json` + `papers-hsk.json`, `levels-hsk.json`, `levels-yct.json`, `generated-tests-options.json`).
8. **`data/dictation/`**: Đủ **91/91 video luyện nghe chép chính tả** (`videos-all.json` + 182 tệp `*-detail.json` và `*-segments.json`).
9. **`data/misc/`**: Dữ liệu Trường Thầy Đồ (`thay-do-hi-vien-danh-muc.json`, `thay-do-bang-vang.json`), Trò chơi hàng ngày (`daily-ghep-chu.json`, `daily-tim-chu-trong-chu.json`), Bảng xếp hạng, cài đặt chung.

### 4.3. Giao Diện Gốc 1:1 `xiehanzi.com` & Bộ Cầu Nối Runtime (`xiehanzi-runtime.js`)
- Đã đưa toàn bộ **94 tuyến đường HTML gốc** ra thư mục gốc (kèm cả `/<route>.html` và `/<route>/index.html`) sử dụng đường dẫn gốc tuyệt đối (`/_next/...`, `/images/...`, `/thay-do/...`, `/level_images/...`, `/xiehanzi-runtime.js`) để không bao giờ bị lỗi mất CSS khi URL có dấu `/` ở cuối (ví dụ `/kiem-tra-hsk/`).
- Đã kiểm tra tự động: **231/231 gói Webpack động** và **181/181 tệp tĩnh** trong `_next/static/` đều tồn tại đầy đủ (`0` tệp thiếu, `0` tệp rỗng).
- Đã gỡ lớp bọc `/_next/image/?url=...` trên toàn bộ 94 trang HTML và chuyển `unoptimized:!1` → `unoptimized:!0` trong 25 gói JS để React không làm hỏng ảnh khi hydrate.
- Đã xây dựng [`xiehanzi-runtime.js`](xiehanzi-runtime.js) tự động chuyển hướng mọi URL media từ `static.xiehanzi.com` sang 6 nhánh `media-*` trên GitHub và bắt các lệnh gọi API `/v1/...` (`fetch` & `XMLHttpRequest`) để trả về từ `/data/` + **Supabase**.
- Giữ nguyên bảng tra cứu dữ liệu độc lập tại `/kho-du-lieu.html`.

---

## ✅ 5. TRẠNG THÁI HOÀN THIỆN CÁC HẠNG MỤC NÂNG CAO (v4.0)

Toàn bộ 3 hạng mục trong lộ trình tiếp theo đã được triển khai hoàn chỉnh trong [xiehanzi-runtime.js](xiehanzi-runtime.js), [ercel.json](vercel.json) và Vercel Serverless Function [pi/ai.js](api/ai.js):

### ✅ Hạng mục 1: Xử lý Hydrate & Render các Trang Chi Tiết Động (Dynamic Slug Routes) — ĐÃ HOÀN THÀNH
- **Rewrite ercel.json**: Đã cấu hình đầy đủ rewrite cho mọi đường dẫn chi tiết động (/han-tu/:slug*, /tu-vung/:slug*, /han-viet/:slug*, /ngu-phap/:slug*, /luyen-chep-chinh-ta/:slug*, /thu-vien-*/:level/:slug+, /kiem-tra-hsk/:slug*, /de-kiem-tra/:slug*, /so-tay/:slug*).
- **Hydrate RSC Flight Payload (/han-tu/:slug & /tu-vung/:slug)**: Tự động can thiệp self.__next_f.push ngay từ <head> để thay thế chữ mẫu 好 / 你好 bằng chữ Hán / từ vựng động trên URL, xóa cache cứng và kích hoạt React Query nạp dữ liệu trực tiếp từ 20 shard characters-XX.json & 12 shard ocabulary-XX.json (kèm đồ thị chiết tự /v1/hanzi-character/:lookup/graph).
- **Render động trực tiếp vào <main id=noi-dung-chinh>**: Hỗ trợ hiển thị đầy đủ giao diện chi tiết cho /han-viet/:slug, /ngu-phap/:level/:pointId, /luyen-chep-chinh-ta/:slug, /thu-vien-:curr/:level/bai-hoc/:lessonSlug, /thu-vien-:curr/:level/:topicSlug và trình làm bài thi /kiem-tra-hsk/:level/test/:testId.

### ✅ Hạng mục 2: Hoàn thiện các API Tương tác (POST / Tạo đề động) trong xiehanzi-runtime.js — ĐÃ HOÀN THÀNH
1. **Chấm điểm đề thi HSK (POST /v1/hsk-tests/:testId/grade & POST /v1/generated-tests/:id/grade)**: Chấm điểm tự động theo từng phần, giải thích chi tiết từng câu, lưu lịch sử vào localStorage và đồng bộ tự động lên bảng public.exam_results trên **Supabase**.
2. **Sinh bộ câu hỏi cho Luyện nghe (/luyen-nghe/) & Luyện gõ (/luyen-go/, /luyen-go-han-tu/)**: Hoàn thiện GET /v1/listening/(lessons|topics)/:curr/:lvl/:slug/set (cả 3 chế độ word, ill, sentence) và GET /v1/typing-set, GET /v1/typing-word-set, GET /v1/typing-sentence-set.
3. **Lưu Sổ tay từ vựng (/so-tay/), Vở tập viết (/tao-vo-tap-viet/) & Tiến độ Ôn tập (/hoc/, /on-tap/)**: Hoàn thiện CRUD /v1/user-lists*, /v1/user-worksheets*, /v1/grammar-progress*, /v1/pinyin-annotations*, /v1/practice-progress/sync, /v2/review/* kết hợp đồng bộ tự động lên bảng public.study_profiles của **Supabase**.
4. **Trường Thầy Đồ tương tác (/thay-do/, /truong-thay-do/)**: Hoàn thiện /v1/thay-do/xin-do*, /v1/thay-do/lop*, /v1/thay-do/khoa*, /v1/thay-do/bang-vang*, /v1/thay-do/dau-luyen*, /v1/thay-do/dong-y*.

### ✅ Hạng mục 3: Tích hợp AI APIs Thực Tế (Chấm phát âm, Dịch thuật, Gia sư AI) — ĐÃ HOÀN THÀNH
- Đã xây dựng Vercel Serverless Function [pi/ai.js](api/ai.js) kết hợp bộ xử lý tại [xiehanzi-runtime.js](xiehanzi-runtime.js) cho POST /v1/translate, POST /v1/speaking/assess, POST /v1/practice/result-ai-readout & /reply.
