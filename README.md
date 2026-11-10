# 🏮 Dự Án Học Tiếng Trung Toàn Diện (`hoctiengtrungquoc.vercel.app`)

> 🌐 **Website chính thức đang hoạt động**: **[https://hoctiengtrungquoc.vercel.app](https://hoctiengtrungquoc.vercel.app)**  
> 📄 **Tài liệu bàn giao & Tiến độ chi tiết (v8.0)**: **[`PROJECT_HANDOVER.md`](PROJECT_HANDOVER.md)**

---

## 🚀 CÂU LỆNH (PROMPT) ĐỂ DÁN VÀO TRÌNH DUYỆT KHÁC / ĐOẠN CHAT MỚI / MÁY TÍNH MỚI

Khi bạn chuyển sang **trình duyệt khác, đoạn chat mới hoặc máy tính mới hoàn toàn trống**, chỉ cần mở công cụ AI (Antigravity, Cursor, Claude...) và **copy-paste nguyên văn đoạn lệnh dưới đây**:

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

## 📊 Tóm Tắt Tiến Độ Dự Án Hiện Tại (v8.0)

### ✅ 1. Đã hoàn thành 100% Dữ Liệu, Media, Giao Diện 1:1 & Các Tính Năng Tương Tác
- **Gộp 100% dữ liệu & đa phương tiện (`96.860 tệp — 3,27 GB`) vào duy nhất 1 kho GitHub (`hungktkthd/saochepweb`)** trên 7 nhánh (`main`, `media-visuals`, `media-etymology`, `media-audios`, `media-hsk-audio`, `media-sentences-1`, `media-sentences-2`).
- **Trang `/hoc` & `/hoc/bat-dau`**:
  - Hoàn thiện luồng chọn mục tiêu & bạn đồng hành vào thẳng bài học (`/hoc/bai/bai-1-hello-ai-xiaoyu`).
  - Sửa triệt để tính năng **Gọi điện / Nói chuyện Voice** (`POST /v2/companion/voice/turn` trả luồng SSE `text/event-stream` + cơ chế Microphone Fallback) và **Chat với Bạn đồng hành** (`/v2/companion/chat/stream`), không còn báo lỗi *"Không có kết nối mạng"*.
- **Trang `/luyen-chep-chinh-ta` & `/luyen-chep-chinh-ta/:slug`**:
  - Khôi phục giao diện chuẩn 1:1 bản gốc với trình phát **YouTube IFrame API** tự tua/dừng theo từng câu `[startMs, endMs]`, chỉnh tốc độ `0.5×..1.5×`, **Ẩn phụ đề**, 4 chế độ (**Gõ hết, Điền chỗ trống, Chỉ nghe, Gõ pinyin**) và cột **Danh sách câu** cho phép bấm chọn bất kỳ đoạn nào để chép.
- **Trang `/on-tap` (`/hoc/on-tap`)**:
  - Hoạt động đầy đủ cả **Ôn bài đến hạn** (`/hoc/bai/on-tap-den-han` — Thẻ lật SRS + Trắc nghiệm + Tự gõ), **Ôn lỗi sai** (`/hoc/bai/on-tap-loi-sai` — 4 cặp lỗi hay nhầm), **Luyện thẻ câu** (`/hoc/bai/on-tap-the-cau`), **Sổ lỗi** (`/hoc/so-loi`), **Từ đã học** (`/hoc/tu-da-hoc`) và cài đặt ôn tập.
- **Thư viện Giáo trình, Đề thi thử HSK 3.0, Từ điển Chữ Hán / Từ vựng / Hán Việt / Ngữ pháp & Trò chơi**:
  - Hiển thị đầy đủ hình ảnh đề thi, âm thanh phát âm, thứ tự nét viết và chấm điểm trực tiếp.

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
