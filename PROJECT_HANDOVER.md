# 📋 TÀI LIỆU BÀN GIAO & ĐỊNH HƯỚNG DỰ ÁN (`PROJECT_HANDOVER.md`)

> **Mục đích**: Tài liệu này ghi lại đầy đủ 100% những gì đã hoàn thành, cấu trúc kỹ thuật, những phần còn thiếu cần làm tiếp và lộ trình phát triển tiếp theo để bất kỳ phiên làm việc (đoạn chat) mới nào cũng có thể đọc và tiếp tục ngay lập tức.

---

## 1. Kiến Trúc Tổng Thể & Thông Tin Hạ Tầng

```text
GitHub (hungktkthd/saochepweb)
       │
       ▼  (Tự động triển khai CI/CD)
Vercel (https://hoctiengtrungquoc.vercel.app)
       │
       ├──► Supabase (https://xcthntcgenzfybefaphh.supabase.co) — Tài khoản, dữ liệu, tiến độ học
       └──► AI APIs (Gemini / Web Speech / Serverless API)      — Chấm nói, chấm viết, dịch, gia sư AI
```

| Thành phần | Giá trị / Đường dẫn |
| :--- | :--- |
| **Kho GitHub duy nhất** | [`https://github.com/hungktkthd/saochepweb`](https://github.com/hungktkthd/saochepweb) |
| **Tên miền chính thức (Vercel)** | **[`https://hoctiengtrungquoc.vercel.app`](https://hoctiengtrungquoc.vercel.app)** (Project: `hungktkthd-7816/hoctiengtrungquoc`) |
| **Tên miền phụ (GitHub Pages)** | [`https://hungktkthd.github.io/saochepweb/`](https://hungktkthd.github.io/saochepweb/) |
| **Thư mục làm việc trên máy (Local)** | `C:\Users\MCC\.gemini\antigravity\scratch\saochepweb` |
| **Công cụ CLI cài sẵn trên máy** | - Git: `C:\Users\MCC\.gemini\antigravity\scratch\tools\mingit\cmd\git.exe`<br>- GitHub CLI: `C:\Users\MCC\.gemini\antigravity\scratch\tools\gh\bin\gh.exe` (đã đăng nhập `hungktkthd`)<br>- Node.js: `C:\Users\MCC\.gemini\antigravity\scratch\tools\node\node.exe` (`v22.14.0`)<br>- Vercel CLI: `C:\Users\MCC\.gemini\antigravity\scratch\tools\node\vercel.cmd` (`v65.12.1`, đã đăng nhập & link project `hoctiengtrungquoc`) |
| **Supabase Project** | - Project ID: `xcthntcgenzfybefaphh`<br>- URL: `https://xcthntcgenzfybefaphh.supabase.co`<br>- Bảng đã tạo (có RLS): `public.study_profiles` (workspace `hoctiengtrungquoc`), `public.exam_results` |

---

## 2. Tất Cả Những Gì ĐÃ LÀM ĐƯỢC (100% Dữ Liệu, Media & Giao Diện 1:1)

### 2.1. Sao chép & Gộp 100% Dữ liệu + Media (`96.860 tệp — 3,27 GB`) vào 1 Repo GitHub duy nhất
Toàn bộ dữ liệu và media của `https://xiehanzi.com/` đã được tải về đầy đủ 100% và lưu trong duy nhất kho `hungktkthd/saochepweb` trên 7 nhánh (để giữ nhánh `main` nhẹ `~250 MB` giúp Vercel triển khai trong vài giây):

| Nhánh (Branch) | Số tệp | Dung lượng | Nội dung chi tiết |
| :--- | ---: | ---: | :--- |
| **`main`** | **2.400+ tệp** | **~250 MB** | Toàn bộ 94 tuyến trang HTML gốc, 231/231 gói JS/CSS/WOFF2 (`_next/static/`), 280/280 ảnh giao diện (`images/`, `thay-do/`, `level_images/`, `sounds/`, `hanzi-lookup/`), toàn bộ kho dữ liệu JSON (`data/`), `xiehanzi-runtime.js`, `vercel.json`. |
| **`media-visuals`** | **9.231 tệp** | **592,74 MB** | 7.751 ảnh động GIF bút thuận (`gif/`), 1.045 ảnh đề thi HSK (`hsk-tests/`), 414 ảnh minh họa từ vựng (`word-illustration/`), 21 ảnh cấp độ (`level_images/`). |
| **`media-etymology`** | **13.434 tệp** | **52,06 MB** | Toàn bộ 13.434 hình ảnh tự nguyên chữ Hán cổ (Giáp cốt, Kim văn, Triện thư, Lệ thư) trong `etymology/`. |
| **`media-audios`** | **30.781 tệp** | **281,73 MB** | 17.760 file MP3 phát âm chữ Hán (`audios/`) và 13.021 file MP3 phát âm từ vựng (`word_audios/`). |
| **`media-hsk-audio`** | **1.562 tệp** | **1.097,62 MB** | Toàn bộ 1.562 file MP3 bài nghe của 66 bộ đề thi thử HSK 1–6 (`hsk-audio/`). |
| **`media-sentences-1`** | **20.035 tệp** | **514,80 MB** | Nửa đầu (mã hash `0`–`7`) file MP3 phát âm câu ví dụ (`sentence-audio/`). |
| **`media-sentences-2`** | **19.612 tệp** | **504,32 MB** | Nửa sau (mã hash `8`–`f`) file MP3 phát âm câu ví dụ (`sentence-audio/`). |

### 2.2. Kho Dữ Liệu JSON Trong Thư Mục `data/` Trên Nhánh `main`
1. **`data/characters/`**: Đủ **9.931/9.931 chữ Hán** (`characters-01.json` .. `characters-20.json` + `index.json`).
2. **`data/vocabulary/`**: Đủ **11.534/11.534 từ vựng** (`vocabulary-01.json` .. `vocabulary-12.json` + `index.json`).
3. **`data/han-viet/`**: Đủ **6.704/6.704 mục âm Hán Việt** (`han-viet-01.json` .. `han-viet-07.json` + `index.json`).
4. **`data/curriculums/`**: Đủ **5 bộ giáo trình / 33 cấp độ / 1.145 tệp JSON** (`hsk`, `new-hsk`, `yct`, `boya`, `hanyu-jiaocheng` — gồm `overview.json`, `levels/`, `lessons/`, `topics/`).
5. **`data/speaking/`**: Đủ **36 tệp** hội thoại luyện nói theo cấp độ & chủ đề.
6. **`data/grammar/`**: Đủ **489 chủ điểm ngữ pháp** (`hsk-level-1..6.json`, `new-hsk-level-1..3.json`) + **9.780 câu hỏi trắc nghiệm ngữ pháp** (`quiz-hsk1..6.json`, `quiz-new-hsk1..3.json`, `quiz-tracks.json`).
7. **`data/tests/`**: Đủ **66/66 bộ đề thi thử HSK 1–6** (`data/tests/papers/level-{1..6}-{testId}.json` + `papers-hsk.json`, `levels-hsk.json`, `levels-yct.json`, `generated-tests-options.json`).
8. **`data/dictation/`**: Đủ **91/91 video luyện nghe chép chính tả** (`videos-all.json` + 182 tệp `*-detail.json` và `*-segments.json`).
9. **`data/misc/`**: Dữ liệu Trường Thầy Đồ (`thay-do-hi-vien-danh-muc.json`, `thay-do-bang-vang.json`), Trò chơi hàng ngày (`daily-ghep-chu.json`, `daily-tim-chu-trong-chu.json`), Bảng xếp hạng, cài đặt chung.

### 2.3. Giao Diện Gốc 1:1 `xiehanzi.com` & Bộ Cầu Nối Runtime (`xiehanzi-runtime.js`)
- Đã đưa toàn bộ **94 tuyến đường HTML gốc** ra thư mục gốc (kèm cả `<route>.html` và `<route>/index.html`) sử dụng đường dẫn gốc tuyệt đối (`/_next/...`, `/images/...`, `/thay-do/...`, `/level_images/...`, `/xiehanzi-runtime.js`).
- Đã kiểm tra tự động: **231/231 gói Webpack động** và **181/181 tệp tĩnh** trong `_next/static/` đều tồn tại đầy đủ (`0` tệp thiếu, `0` tệp rỗng).
- Đã gỡ lớp bọc `/_next/image/?url=...` trên toàn bộ 94 trang HTML và chuyển `unoptimized:!1` → `unoptimized:!0` trong 25 gói JS để React không làm hỏng ảnh khi hydrate.
- Đã xây dựng [`xiehanzi-runtime.js`](xiehanzi-runtime.js) tự động chuyển hướng mọi URL media từ `static.xiehanzi.com` sang 6 nhánh `media-*` trên GitHub và bắt các lệnh gọi API `/v1/...` (`fetch` & `XMLHttpRequest`) để trả về từ `/data/` + **Supabase**.
- Giữ nguyên bảng tra cứu dữ liệu độc lập tại `/kho-du-lieu.html`.

---

## 3. Những Gì CHƯA HOÀN THIỆN / CẦN LÀM TIẾP (To-Do Cho Đoạn Chat Mới)

Mặc dù 100% dữ liệu, hình ảnh, âm thanh và 94 trang giao diện chính đã lên sóng tại `https://hoctiengtrungquoc.vercel.app`, do `xiehanzi.com` là ứng dụng Next.js gọi nhiều API động về máy chủ `api.xiehanzi.com`, các phần tương tác sâu dưới đây cần được hoàn thiện tiếp trong [`xiehanzi-runtime.js`](xiehanzi-runtime.js) và/hoặc **Vercel Serverless Functions (`/api/...`)**:

### Hạng mục 1: Xử lý Hydrate các Trang Chi Tiết Động (Dynamic Slug Routes)
- **Hiện trạng**:
  - Chúng ta có 94 trang HTML tĩnh cho tất cả các trang danh mục chính (`/`, `/tra-chu/`, `/kiem-tra-hsk/`, `/ngu-phap/`, `/luyen-chep-chinh-ta/`, `/thu-vien-hsk/hsk-1..6/`, `/thay-do/`, `/tro-choi/*`, v.v.).
  - Tuy nhiên, với hàng chục nghìn đường dẫn chi tiết động như:
    - `/han-tu/<chữ>` (9.931 trang chữ Hán)
    - `/tu-vung/<từ>` (11.534 trang từ vựng)
    - `/han-viet/<âm>` (6.704 trang Hán Việt)
    - `/ngu-phap/<cấp>/<mã-ngữ-pháp>` (489 trang chi tiết ngữ pháp)
    - `/luyen-chep-chinh-ta/<slug-video>` (91 trang chi tiết video chép chính tả)
    - `/thu-vien-<giáo-trình>/<cấp>/bai-hoc/<slug-bài-học>` (1.145 trang bài học/chủ đề)
  - Hiện tại khi bấm vào `/han-tu/...` hoặc `/tu-vung/...`, `xiehanzi-runtime.js` mở cửa sổ Modal tra cứu nhanh; còn nếu truy cập thẳng URL `/han-tu/<chữ>` thì `vercel.json` rewrite về mẫu `han-tu.html` (nhưng dữ liệu RSC cứng bên trong `han-tu.html` đang là chữ mẫu `好`).
- **Việc cần làm tiếp**:
  - Viết một **Vercel Serverless Function** (ví dụ `api/render-page.js` hoặc cập nhật `xiehanzi-runtime.js`) để khi truy cập bất kỳ đường dẫn động nào (`/han-tu/:slug`, `/tu-vung/:slug`, `/han-viet/:slug`, `/ngu-phap/:level/:slug`, `/luyen-chep-chinh-ta/:slug`, `/thu-vien-*/:level/:lesson`), hệ thống tự động nạp dữ liệu JSON tương ứng từ `/data/` và thay thế vào payload RSC / DOM của trang để hiển thị trang chi tiết chuẩn 1:1.

### Hạng mục 2: Hoàn thiện các API Tương tác (`POST` / Tạo đề động) trong `xiehanzi-runtime.js`
Cần bổ sung đầy đủ logic xử lý cho các API sau trong [`xiehanzi-runtime.js`](xiehanzi-runtime.js):
1. **Chấm điểm đề thi HSK (`POST /v1/hsk-tests/:testId/grade`)**:
   - Đọc đáp án người dùng gửi lên (`body.answers`), đối chiếu với đáp án đúng trong tệp `/data/tests/papers/level-:lvl-:testId.json`, tính điểm Nghe / Đọc / Viết, lưu vào bảng `public.exam_results` trên Supabase và trả về JSON kết quả chấm điểm đúng cấu trúc mà gói `3815-cb17538a50293888.js` yêu cầu.
2. **Sinh bộ câu hỏi cho Luyện nghe (`/luyen-nghe/`) & Luyện gõ (`/luyen-go/`, `/luyen-go-han-tu/`)**:
   - Bắt các API:
     - `GET /v1/listening/lessons/:curr/:lvl/:lesson/set` và `GET /v1/listening/topics/:curr/:lvl/:topic/set`
     - `GET /v1/typing-set`, `GET /v1/typing-word-set`, `GET /v1/typing-sentence-set`
   - Trích xuất từ vựng/câu ví dụ có sẵn audio trong `/data/curriculums/`, `/data/characters/`, `/data/vocabulary/` để trả về bộ câu hỏi luyện nghe và luyện gõ.
3. **Lưu Sổ tay từ vựng (`/so-tay/`), Vở tập viết (`/tao-vo-tap-viet/`) & Tiến độ Ôn tập (`/hoc/`, `/on-tap/`)**:
   - Bắt các API `/v1/user-lists`, `/v1/user-worksheets`, `/v1/library`, `/v1/practice-progress/sync`, `/v2/review/signals` để đọc/ghi trực tiếp vào `localStorage` kết hợp đồng bộ đám mây lên bảng `public.study_profiles` của **Supabase**.
4. **Trường Thầy Đồ tương tác (`/thay-do/`, `/truong-thay-do/lop/`)**:
   - Bắt các API `/v1/thay-do/xin-do`, `/v1/thay-do/lop`, `/v1/thay-do/khoa`, `/v1/thay-do/dau-luyen` để chấm nét viết trên Canvas và trả về lời phê của Thầy Đồ.

### Hạng mục 3: Tích hợp AI APIs Thực Tế (Chấm phát âm, Dịch thuật, Gia sư AI)
- Kết nối các API trên giao diện gốc:
  - `POST /v1/translate` (trang `/dich-tieng-trung/`) → Gọi Gemini API / AI Gateway qua Vercel Serverless Function để dịch Trung - Việt kèm phân tích ngữ pháp & Hán Việt.
  - `POST /v1/speaking/assess` (trang `/luyen-noi/`) → Chấm điểm phát âm từng âm tiết/thanh điệu và trả về điểm số.
  - `POST /v1/practice/result-ai-readout` → Gia sư AI nhận xét kết quả bài làm.

### Hạng mục 4: Dọn dẹp 6 kho GitHub phụ cũ (Tùy chọn)
- 6 kho phụ tạo ở giai đoạn đầu (`saochepweb-visuals`, `saochepweb-etymology`, `saochepweb-audios`, `saochepweb-hsk-audio`, `saochepweb-sentences-1`, `saochepweb-sentences-2`) hiện không còn dùng tới vì toàn bộ 6 nhánh `media-*` đã nằm gọn bên trong `hungktkthd/saochepweb`. Có thể xóa đi cho gọn tài khoản GitHub.

---

## 4. Hướng Dẫn Khởi Động Nhanh Cho Đoạn Chat Mới

Khi mở đoạn chat mới, bạn chỉ cần nhắn câu sau cho AI:

> *"Hãy đọc tệp `C:\Users\MCC\.gemini\antigravity\scratch\saochepweb\PROJECT_HANDOVER.md` trong dự án `hungktkthd/saochepweb` (`https://hoctiengtrungquoc.vercel.app`) và tiếp tục hoàn thiện lần lượt các Hạng mục 1, 2, 3 trong phần 'Những Gì Chưa Hoàn Thiện / Cần Làm Tiếp'."*

### Các lệnh triển khai nhanh cho AI trong đoạn chat mới:
```powershell
# Đẩy code lên GitHub và cập nhật trực tiếp lên https://hoctiengtrungquoc.vercel.app
$git = "C:\Users\MCC\.gemini\antigravity\scratch\tools\mingit\cmd\git.exe"
$vercel = "C:\Users\MCC\.gemini\antigravity\scratch\tools\node\vercel.cmd"
$env:PATH = "C:\Users\MCC\.gemini\antigravity\scratch\tools\node;C:\Users\MCC\.gemini\antigravity\scratch\tools\mingit\cmd;$env:PATH"
Set-Location "C:\Users\MCC\.gemini\antigravity\scratch\saochepweb"

& $git add -A
& $git commit -m "Update features"
& $git push origin main
& $vercel deploy --prod --yes
```
