# 🏮 Dự Án Học Tiếng Trung Toàn Diện (`hoctiengtrungquoc.vercel.app`)

> 🌐 **Website chính thức đang hoạt động**: **[https://hoctiengtrungquoc.vercel.app](https://hoctiengtrungquoc.vercel.app)**  
> 📄 **Tài liệu bàn giao chi tiết**: **[`PROJECT_HANDOVER.md`](PROJECT_HANDOVER.md)**

---

## 🚀 CÂU LỆNH TIẾP TỤC DỰ ÁN KHI ĐỔI SANG MÁY TÍNH MỚI (CHƯA CÓ DỮ LIỆU GÌ)

Nếu bạn mở dự án này trên **một máy tính mới hoàn toàn trống**, chỉ cần mở công cụ AI (Antigravity, Cursor, Claude Code...) và **copy-paste nguyên văn đoạn dưới đây**:

```text
Tôi đang tiếp tục phát triển dự án web học tiếng Trung (bản sao 1:1 của https://xiehanzi.com/) trên một máy tính mới chưa có dữ liệu cục bộ.
Toàn bộ 100% mã nguồn, giao diện và 96.860 tệp dữ liệu (3,27 GB) đã được lưu trên kho GitHub: https://github.com/hungktkthd/saochepweb và đang triển khai tại https://hoctiengtrungquoc.vercel.app.

Hãy thực hiện các bước sau:
1. Clone nhánh `main` của kho lưu trữ về máy:
   git clone --branch main --single-branch https://github.com/hungktkthd/saochepweb.git
2. Đọc kỹ file `PROJECT_HANDOVER.md` ở thư mục gốc của repo để nắm toàn bộ kiến trúc (GitHub -> Vercel `hoctiengtrungquoc.vercel.app` -> Supabase `xcthntcgenzfybefaphh` + AI APIs), những gì đã làm xong và những gì cần làm tiếp.
3. Tiếp tục thực hiện lần lượt các hạng mục trong mục "5. NHỮNG GÌ CHƯA HOÀN THIỆN / CẦN LÀM TIẾP" của `PROJECT_HANDOVER.md` (bắt đầu từ Hạng mục 1: Xử lý Hydrate các Trang Chi Tiết Động, sau đó tới Hạng mục 2: Hoàn thiện API tương tác chấm điểm/luyện nghe/luyện gõ trong `xiehanzi-runtime.js`, và Hạng mục 3: Tích hợp AI APIs).
4. Mỗi khi sửa xong, push lên nhánh `main` của `https://github.com/hungktkthd/saochepweb` và deploy lên `https://hoctiengtrungquoc.vercel.app`.
```

---

## 📊 Tóm Tắt Tiến Độ Dự Án Hiện Tại

### ✅ 1. Những gì ĐÃ LÀM XONG (100% Dữ Liệu, Media & Giao Diện Chính)
- **Gộp 100% dữ liệu & đa phương tiện (`96.860 tệp — 3,27 GB`) vào duy nhất 1 kho GitHub (`hungktkthd/saochepweb`)** trên 7 nhánh:
  - `main` (`~250 MB`): Toàn bộ 94 tuyến trang HTML gốc `xiehanzi.com`, 231/231 gói Webpack JS, 181/181 tệp tĩnh CSS/WOFF2/PNG (`_next/static/`), 280/280 ảnh UI (`images/`, `thay-do/`, `level_images/`, `sounds/`, `hanzi-lookup/`), toàn bộ kho dữ liệu JSON (`data/`), `xiehanzi-runtime.js`, `vercel.json`.
  - `media-visuals` (`592,74 MB`): 7.751 GIF thứ tự nét viết, 1.045 ảnh đề thi HSK, 414 ảnh minh họa từ vựng, 21 ảnh cấp độ.
  - `media-etymology` (`52,06 MB`): 13.434 ảnh nguồn gốc chữ Hán cổ.
  - `media-audios` (`281,73 MB`): 30.781 file MP3 phát âm chữ Hán & từ vựng.
  - `media-hsk-audio` (`1.097,62 MB`): 1.562 file MP3 nghe đề thi thử HSK 1–6.
  - `media-sentences-1` & `media-sentences-2` (`1.019,12 MB`): 39.647 file MP3 phát âm câu ví dụ.
- **Sửa triệt để lỗi mất CSS / mất ảnh trên mọi trang con (`/kiem-tra-hsk/`, `/tra-chu/`, `/thay-do/`, `/thu-vien/`, ...)**:
  - Chuyển toàn bộ 94 trang HTML sang đường dẫn tuyệt đối gốc (`/_next/...`, `/images/...`, `/xiehanzi-runtime.js`).
  - Gỡ bọc `/_next/image/?url=...` và vá `unoptimized:!0` trong 25 gói JS.
- **Triển khai trực tiếp theo kiến trúc `GitHub → Vercel (hoctiengtrungquoc.vercel.app) → Supabase + AI APIs`**:
  - Đã kết nối project Vercel `hoctiengtrungquoc` với tên miền `https://hoctiengtrungquoc.vercel.app` và cơ sở dữ liệu Supabase `https://xcthntcgenzfybefaphh.supabase.co`.

### 🔧 2. Những gì CẦN LÀM TIẾP (Xem chi tiết tại [`PROJECT_HANDOVER.md`](PROJECT_HANDOVER.md))
1. **Hạng mục 1 — Hydrate các Trang Chi Tiết Động (Dynamic Slug Routes)**: Nạp dữ liệu động cho các đường dẫn sâu `/han-tu/:slug`, `/tu-vung/:slug`, `/han-viet/:slug`, `/ngu-phap/:level/:slug`, `/luyen-chep-chinh-ta/:slug`, `/thu-vien-*/:level/:lesson`.
2. **Hạng mục 2 — Hoàn thiện các API Tương tác (`POST` / Sinh đề động) trong `xiehanzi-runtime.js`**:
   - Chấm điểm bài thi HSK (`POST /v1/hsk-tests/:testId/grade`) và lưu điểm vào Supabase.
   - Sinh câu hỏi động cho Luyện nghe (`/luyen-nghe/`) và Luyện gõ (`/luyen-go/`).
   - Đồng bộ Sổ tay từ vựng (`/so-tay/`), Vở tập viết (`/tao-vo-tap-viet/`) và Ôn tập (`/on-tap/`) với Supabase.
   - Tương tác chấm nét viết Trường Thầy Đồ (`/thay-do/`).
3. **Hạng mục 3 — Tích hợp AI APIs thật (Chấm nói, chấm viết, dịch thuật, gia sư AI)** qua Vercel Serverless Functions (`/api/...`).

---

## 📊 Thống Kê Chi Tiết Kho Dữ Liệu Trong `data/`

| Phân mục | Số lượng | Đường dẫn lưu trữ | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| **1. Chữ Hán (`han-tu`)** | **9,931 chữ** | [`data/characters/`](data/characters/) | Chia thành 20 tệp `characters-01.json` .. `characters-20.json` + `index.json`. Đầy đủ Pinyin, âm Hán Việt, nghĩa Việt/Anh, bộ thủ, số nét, cấp HSK, chiết tự, mẹo nhớ, từ ghép, câu ví dụ, GIF thứ tự nét, audio, hình ảnh nguồn gốc chữ. |
| **2. Từ vựng (`tu-vung`)** | **11,534 từ** | [`data/vocabulary/`](data/vocabulary/) | Chia thành 12 tệp `vocabulary-01.json` .. `vocabulary-12.json` + `index.json`. Đầy đủ chữ Hán, Pinyin, âm Hán Việt, nghĩa tiếng Việt, từ loại, kết hợp từ, ví dụ câu, ghi chú cách dùng, mẹo nhớ, audio. |
| **3. Tra cứu Hán Việt (`han-viet`)** | **6,704 mục** | [`data/han-viet/`](data/han-viet/) | Chia thành 7 tệp `han-viet-01.json` .. `han-viet-07.json` + `index.json`. Toàn bộ âm đọc Hán Việt, danh sách chữ Hán đồng âm và từ ghép Hán Việt tương ứng. |
| **4. Năm bộ Giáo trình (`thu-vien-*`)** | **5 bộ / 33 cấp / 1,145 tệp** | [`data/curriculums/`](data/curriculums/) | Toàn bộ 5 giáo trình: **HSK 2.0** (`hsk-1..6`), **New HSK 3.0** (`new-hsk-1..9`), **YCT** (`yct-1..6`), **Boya** (`boya`), **Hán Ngữ / Hanyu Jiaocheng** (`hanyu-jiaocheng`). |
| **5. Hội thoại Luyện nói (`luyen-noi`)** | **36 tệp** | [`data/speaking/`](data/speaking/) | Toàn bộ kịch bản hội thoại luyện nói theo từng cấp độ và chủ đề. |
| **6. Ngữ pháp & Trắc nghiệm (`ngu-phap`)** | **489 chủ điểm + 9,780 câu quiz** | [`data/grammar/`](data/grammar/) | Toàn bộ 341 chủ điểm ngữ pháp HSK 1–6, 148 chủ điểm New HSK 1–3, và 9,780 câu hỏi trắc nghiệm ngữ pháp. |
| **7. Đề thi thử HSK & CTI (`kiem-tra-hsk`)** | **66 bộ đề thi đầy đủ** | [`data/tests/`](data/tests/) | Toàn bộ 66 đề thi thử HSK 1–6 (đề mẫu chính thức CTI `hsk30-1..6` và 60 đề luyện XieHanzi `xh30-{1..6}-{01..10}`) trong `data/tests/papers/`. |
| **8. Luyện nghe chép chính tả (`luyen-chep-chinh-ta`)** | **91 video + 91 bộ phụ đề** | [`data/dictation/`](data/dictation/) | Danh sách toàn bộ 91 video (`videos-all.json`) cùng thông tin chi tiết (`*-detail.json`) và toàn bộ câu thoại phân đoạn (`*-segments.json`). |
| **9. Trường Thầy Đồ & Trò chơi** | **9 tệp API + 280 tệp media** | [`data/misc/`](data/misc/), [`thay-do/`](thay-do/) | 15 bối cảnh & 31 vở kịch nhập vai Hí Viện, dữ liệu thứ tự nét viết Make Me A Hanzi (`hanzi-lookup/mmah.json`), nét viết Trường Thầy Đồ, nhân vật Live2D & hình ảnh minh họa. |
