# Kho Dữ Liệu & Ứng Dụng Học Tiếng Trung (`hoctiengtrungquoc.vercel.app`)

> 📌 **TÀI LIỆU BÀN GIAO CHO ĐOẠN CHAT MỚI**: Xem chi tiết toàn bộ những gì đã làm được, chưa làm được và lộ trình phát triển tiếp theo tại **[`PROJECT_HANDOVER.md`](PROJECT_HANDOVER.md)**.

Bản sao lưu toàn diện toàn bộ cơ sở dữ liệu, giáo trình, ngữ pháp, đề thi, bài luyện nghe chép chính tả, tài nguyên tĩnh và giao diện 1:1 của website **[https://xiehanzi.com/](https://xiehanzi.com/)**, triển khai tại **[https://hoctiengtrungquoc.vercel.app](https://hoctiengtrungquoc.vercel.app)**.

---

## 🌐 Toàn Bộ Dữ Liệu & Media Gộp Trong 1 Dự Án GitHub Duy Nhất (`hungktkthd/saochepweb`)

Toàn bộ **96.860 tệp (`3,27 GB`)** đã được gộp gọn gàng vào **1 kho lưu trữ GitHub duy nhất**: **[`https://github.com/hungktkthd/saochepweb`](https://github.com/hungktkthd/saochepweb)** (triển khai tự động lên **Vercel `hoctiengtrungquoc.vercel.app` → Supabase + AI APIs**):

| Nhánh (Branch) trong `hungktkthd/saochepweb` | Thư mục gắn trong `main` | Số lượng tệp | Dung lượng | Nội dung |
| :--- | :--- | :--- | :--- | :--- |
| **[`main`](https://github.com/hungktkthd/saochepweb/tree/main)** | *(Thư mục gốc)* | **2,205 tệp** | **232 MB** | Mã nguồn ứng dụng Web (`index.html`, `vercel.json`), toàn bộ JSON (`data/`), bundles (`assets/`), HTML (`pages/`) & Sitemaps (`sitemaps/`). |
| **[`media-visuals`](https://github.com/hungktkthd/saochepweb/tree/media-visuals)** | `media/visuals` | **9,231 tệp** | **593 MB** | 7.751 ảnh động GIF nét chữ (`gif/`), 1.045 ảnh đề thi HSK (`hsk-tests/`), 414 ảnh từ vựng (`word-illustration/`) & 21 ảnh cấp độ (`level_images/`). |
| **[`media-etymology`](https://github.com/hungktkthd/saochepweb/tree/media-etymology)** | `media/etymology` | **13,434 tệp** | **52 MB** | Toàn bộ 13.434 ảnh nguồn gốc chữ Hán cổ (Giáp cốt, Kim văn, Triện thư, Lệ thư) trong `etymology/`. |
| **[`media-audios`](https://github.com/hungktkthd/saochepweb/tree/media-audios)** | `media/audios` | **30,781 tệp** | **282 MB** | 17.760 file MP3 phát âm chữ Hán (`audios/`) và 13.021 file MP3 phát âm từ vựng (`word_audios/`). |
| **[`media-hsk-audio`](https://github.com/hungktkthd/saochepweb/tree/media-hsk-audio)** | `media/hsk-audio` | **1,562 tệp** | **1,098 MB** | Toàn bộ 1.562 file MP3 bài nghe của 66 bộ đề thi thử HSK 1–6 (`hsk-audio/`). |
| **[`media-sentences-1`](https://github.com/hungktkthd/saochepweb/tree/media-sentences-1)** | `media/sentences-1` | **20,035 tệp** | **515 MB** | Nửa đầu (mã hash `0`–`7`) file MP3 phát âm câu ví dụ tiếng Trung (`sentence-audio/`). |
| **[`media-sentences-2`](https://github.com/hungktkthd/saochepweb/tree/media-sentences-2)** | `media/sentences-2` | **19,612 tệp** | **504 MB** | Nửa sau (mã hash `8`–`f`) file MP3 phát âm câu ví dụ tiếng Trung (`sentence-audio/`). |

---

## 📊 Thống Kê Toàn Bộ Dữ Liệu Đã Sao Chép

| Phân mục | Số lượng | Đường dẫn lưu trữ | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| **1. Chữ Hán (`han-tu`)** | **9,931 chữ** | [`data/characters/`](data/characters/) | Chia thành 20 tệp `characters-01.json` .. `characters-20.json` + `index.json`. Đầy đủ Pinyin, âm Hán Việt, nghĩa Việt/Anh, bộ thủ, số nét, cấp HSK, chiết tự (`components`, `componentNarrative`), mẹo nhớ (`memoryHook`), từ ghép phổ biến (`commonWords`), câu ví dụ (`examples`), GIF thứ tự nét (`gif`), audio (`audios`), hình ảnh nguồn gốc chữ (`etymologyImages`). |
| **2. Từ vựng (`tu-vung`)** | **11,534 từ** | [`data/vocabulary/`](data/vocabulary/) | Chia thành 12 tệp `vocabulary-01.json` .. `vocabulary-12.json` + `index.json`. Đầy đủ chữ Hán, Pinyin, âm Hán Việt, nghĩa tiếng Việt, từ loại (`wordClasses`), kết hợp từ (`collocations`), ví dụ câu (`examples`), ghi chú cách dùng (`usageNote`), mẹo nhớ (`memoryTips`), audio. |
| **3. Tra cứu Hán Việt (`han-viet`)** | **6,704 mục** | [`data/han-viet/`](data/han-viet/) | Chia thành 7 tệp `han-viet-01.json` .. `han-viet-07.json` + `index.json`. Toàn bộ âm đọc Hán Việt, danh sách chữ Hán đồng âm và từ ghép Hán Việt tương ứng. |
| **4. Năm bộ Giáo trình (`thu-vien-*`)** | **5 bộ / 33 cấp / 1,145 tệp** | [`data/curriculums/`](data/curriculums/) | Toàn bộ 5 giáo trình: **HSK 2.0** (`hsk-1..6`), **New HSK 3.0** (`new-hsk-1..9`), **YCT** (`yct-1..6`), **Boya** (`boya`), **Hán Ngữ / Hanyu Jiaocheng** (`hanyu-jiaocheng`). Gồm tổng quan cấp độ (`levels/`), danh sách và chi tiết từng bài học (`lessons/`) và chủ đề (`topics/`). |
| **5. Hội thoại Luyện nói (`luyen-noi`)** | **36 tệp** | [`data/speaking/`](data/speaking/) | Toàn bộ kịch bản hội thoại luyện nói theo từng cấp độ và chủ đề. |
| **6. Ngữ pháp & Trắc nghiệm (`ngu-phap`)** | **489 chủ điểm + 9,780 câu quiz** | [`data/grammar/`](data/grammar/) | Toàn bộ 341 chủ điểm ngữ pháp HSK 1–6 (`hsk-level-1..6.json`), 148 chủ điểm New HSK 1–3 (`new-hsk-level-1..3.json`), và 9,780 câu hỏi trắc nghiệm ngữ pháp (`quiz-hsk1..6.json`, `quiz-new-hsk1..3.json`). |
| **7. Đề thi thử HSK & CTI (`kiem-tra-hsk`)** | **66 bộ đề thi đầy đủ** | [`data/tests/`](data/tests/) | Toàn bộ 66 đề thi thử HSK 1–6 (đề mẫu chính thức CTI `hsk30-1..6` và 60 đề luyện XieHanzi `xh30-{1..6}-{01..10}`) trong `data/tests/papers/` kèm cấu hình sinh đề (`generated-tests-options.json`). |
| **8. Luyện nghe chép chính tả (`luyen-chep-chinh-ta`)** | **91 video + 91 bộ phụ đề** | [`data/dictation/`](data/dictation/) | Danh sách toàn bộ 91 video (`videos-all.json`) cùng thông tin chi tiết (`*-detail.json`) và toàn bộ câu thoại phân đoạn (`*-segments.json`) trong `data/dictation/videos/`. |
| **9. Trường Thầy Đồ & Trò chơi** | **9 tệp API + 259 tệp media** | [`data/misc/`](data/misc/), [`assets/public/`](assets/public/) | 15 bối cảnh & 31 vở kịch nhập vai Hí Viện (`thay-do-hi-vien-danh-muc.json`), dữ liệu thứ tự nét viết Make Me A Hanzi (`assets/public/hanzi-lookup/mmah.json`), nét viết Trường Thầy Đồ (`assets/public/thay-do/strokes/`), nhân vật Live2D & hình ảnh minh họa. |
| **10. Frontend Bundles, HTML & Sitemaps** | **298 JS/CSS/Font + 71 HTML + 24 XML** | [`assets/_next/`](assets/_next/), [`pages/`](pages/), [`sitemaps/`](sitemaps/) | Toàn bộ 298 tệp mã nguồn giao diện Next.js (`assets/_next/`), 71 trang HTML gốc (`pages/`), và 24 tệp Sitemap XML (`sitemaps/`). |

---

## 🗂️ Cấu Trúc Thư Mục

```text
saochepweb/
├── index.html                  # Ứng dụng Web tra cứu toàn bộ dữ liệu trực tiếp (chạy offline / GitHub Pages)
├── README.md                   # Tài liệu tổng quan & hướng dẫn sử dụng kho dữ liệu
├── data/
│   ├── characters/             # 9,931 chữ Hán (characters-01..20.json + index.json)
│   ├── vocabulary/             # 11,534 từ vựng (vocabulary-01..12.json + index.json)
│   ├── han-viet/               # 6,704 mục tra cứu Hán Việt (han-viet-01..07.json + index.json)
│   ├── curriculums/            # 5 bộ giáo trình: hsk, new-hsk, yct, boya, hanyu-jiaocheng
│   ├── speaking/               # Các bài hội thoại luyện nói theo cấp độ & chủ đề
│   ├── grammar/                # 489 chủ điểm ngữ pháp & 9,780 câu hỏi quiz
│   ├── tests/                  # 66 bộ đề thi thử HSK đầy đủ câu hỏi & đáp án
│   ├── dictation/              # 91 bài luyện nghe chép chính tả video & phụ đề từng câu
│   └── misc/                   # Trường Thầy Đồ (Hí Viện), Trò chơi hàng ngày, Bảng xếp hạng
├── assets/
│   ├── _next/                  # 298 tệp JS chunks, CSS và WOFF2 fonts của ứng dụng Next.js
│   └── public/                 # 259 tệp tĩnh: mmah.json, hình ảnh, strokes JSON, Live2D, icons
├── pages/                      # 71 bản chụp HTML SSR gốc của các trang chính, công cụ & cấp độ
└── sitemaps/                   # 24 tệp robots.txt và toàn bộ sitemap XML của xiehanzi.com
```

---

## 🚀 Cách Sử Dụng Giao Diện Tra Cứu (`index.html`)

Bạn có thể mở trực tiếp qua **GitHub Pages** hoặc chạy máy chủ tĩnh cục bộ tại thư mục gốc của kho lưu trữ:

```bash
# Sử dụng Python
python -m http.server 8080

# Hoặc sử dụng Node.js
npx serve .
```

Sau đó truy cập `http://localhost:8080` để tra cứu tức thì toàn bộ 9,931 chữ Hán, 11,534 từ vựng, 6,704 âm Hán Việt, 5 bộ giáo trình, 489 chủ điểm ngữ pháp, 66 đề thi HSK và 91 video chép chính tả.
