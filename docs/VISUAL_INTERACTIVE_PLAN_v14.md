# Kế Hoạch Nâng Cấp Ảnh Minh Họa, Hoạt Động Tương Tác & Hiệu Ứng Theo Từng Trang (Hanzi Studio v14.0)

Tài liệu lập danh sách đầy đủ các nâng cấp về **hình ảnh phù hợp**, **hoạt động tương tác hữu ích** và **hiệu ứng chuyển động tinh tế (60fps, hỗ trợ Dark Mode & `prefers-reduced-motion`)** cho toàn bộ các nhóm trang của **[Học Tiếng Trung — Hán Ngữ Studio](https://hoctiengtrungquoc.vercel.app)**.

Nguyên tắc thiết kế bắt buộc:
- **Đồng nhất thẩm mỹ Hanzi Studio v4**: Tông màu Royal Indigo (`#4f46e5`) + Imperial Teal (`#0d9488`) + giấy tuyên ấm (`#f6f5f0`), hỗ trợ đầy đủ giao diện Tối (`#090b14`).
- **Tận dụng 100% kho ảnh WebP sẵn có** (`images/home/*.webp`, `images/home/dark/*.webp`, `images/companion/*/splash/hero.webp`, `images/capy/lesson/*.webp`, `images/games/*.webp`, `images/practice/summary-*.webp`) kết hợp **6 ảnh minh họa biên tập riêng** trong `images/studio/`.
- **Không cản trở luồng học / thi nghiêm túc**: Ẩn banner trên các trang tập trung cao độ (`/hoc/bai/*`, `/de-kiem-tra/lam-bai/*`, `/kiem-tra-ngu-phap/lam-bai`, `/thay-do`, `/truong-thay-do`).
- **An toàn tuyệt đối cho React Hydration & Dữ liệu**: Toàn bộ thành phần chỉ gắn sau `htqHydrationSettled === true`, mọi dữ liệu tương tác ghi qua API/storage tách theo tài khoản (`httq_progress_v2`, `httq_state`, `httq_companion_id`).

---

## 1. Bộ 10 Ảnh Minh Họa Biên Tập & Phong Cách Dễ Thương Mới (`images/studio/`)

| Tệp ảnh | Chủ đề & Ngữ cảnh sử dụng | Nhóm trang áp dụng |
| :--- | :--- | :--- |
| `images/studio/cute-capy-study.jpg` | Capybara đeo kính tròn dễ thương cầm bút lông học chữ Hán cùng trà sữa đường đen & hoa đào | `/`, `/hoc`, `/lo-trinh`, `/bat-dau`, `/dang-nhap`, `/dang-ky` |
| `images/studio/cute-panda-dict.jpg` | Bé Gấu Trúc Đỏ mắt long lanh ló đầu sau cuốn vở tập viết ô Mễ Tự Cách, cánh hoa anh đào & túi lộc đỏ | `/tra-chu`, `/han-tu/*`, `/tu-vung/*`, `/han-viet/*` |
| `images/studio/cute-music-buddy.jpg` | Capybara má hồng đeo tai nghe xanh bạc hà bên micro cổ điển, nốt nhạc pastel & đèn dây ấm áp | `/luyen-nghe`, `/luyen-noi`, `/luyen-chep-chinh-ta` |
| `images/studio/cute-lantern-party.jpg` | Capybara quàng khăn và bé Thỏ trắng vui vẻ dưới lồng đèn pastel cùng đĩa bánh bao nóng & khối chữ gỗ | `/tro-choi`, `/tro-choi/*`, `/tai-khoan` |
| `images/studio/hero-hanzi-studio.jpg` | Bàn học thư pháp hiện đại ánh sáng ban mai, bảng luyện nét, trà ấm & dải sáng Indigo–Teal | `/thu-vien*` |
| `images/studio/banner-dictionary-calligraphy.jpg` | Giấy tuyên kẻ ô chữ điền, nghiên mực, bút lông, triện đỏ & cành mai thủy mặc | `/tao-vo-tap-viet`, `/luyen-viet`, `/tai-gif-but-thuan`, `/flashcard-pdf` |
| `images/studio/banner-listening-speaking.jpg` | Góc phòng thu ngôn ngữ AI với tai nghe, micro & dải sóng âm phát sáng Teal–Indigo | Kho ảnh dự phòng phòng thu |
| `images/studio/banner-exam-hall.jpg` | Thư viện khảo thí cổ kim giao hòa, đồng hồ cát đồng, đèn lồng ấm & vòm cửa Indigo | `/kiem-tra-hsk`, `/de-kiem-tra`, `/kiem-tra-ngu-phap`, `/ngu-phap` |
| `images/studio/banner-review-srs.jpg` | Sổ tay ghi nhớ & các thẻ flashcard phát sáng kết nối như chòm sao trí nhớ SRS | `/on-tap`, `/on-tap/*`, `/so-tay`, `/luyen-go`, `/luyen-go-han-tu` |
| `images/studio/banner-games-arcade.jpg` | Không gian lễ hội đèn lồng với khối ghép chữ gỗ và tia sáng vàng ấm vui tươi | `/cong-cu`, `/dich-tieng-trung`, `/them-pinyin` |

> **Điểm nhấn dễ thương toàn trang (`#htq-buddy-dock`)**: Bạn Học Đồng Hành nổi ở góc trái dưới (tránh hoàn toàn nút chat góc phải & thanh di động), cho phép bấm mở bong bóng cổ vũ tiếng Trung thật (`加油！你真棒！`, `喝杯奶茶休息一下吧！`...), nghe phát âm `🔊`, bắn pháo hoa & xoay vòng đổi giữa **8 nhân vật** (`Capy 🦫`, `Bánh Bao 🥟`, `Tiểu Mãn 🌸`, `Hạ Vũ ☔`, `Lục Thần 🌿`, `Dương Dương ☀️`, `Mai 🌺`, `Mặc Ngôn 🖋️`). Trang `/tai-khoan` bổ sung 4 **Tem Thưởng Dễ Thương** (`🧋 Trà Sữa Chăm Chỉ`, `🐼 Gấu Trúc Từ Vựng`, `🥟 Bánh Bao Ngữ Pháp`, `🏮 Đèn Lồng Khảo Thí`).

---

## 2. Danh Sách Chi Tiết Theo 11 Nhóm Trang

| # | Nhóm trang | Ảnh phù hợp (mới + sẵn có) | Hoạt động tương tác phù hợp | Hiệu ứng hình ảnh phù hợp |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Trang chủ Studio** (`/`) | `images/studio/hero-hanzi-studio.jpg` + 6 thumbnail `images/home/*.webp` (tự chuyển `images/home/dark/*.webp` khi Dark Mode) + avatar Bạn đồng hành (`images/companion/*/splash/hero.webp`) | **Thẻ "Chữ Hán Hôm Nay" 3D Flip** ngay trong Workspace: xoay vòng theo ngày hoặc bấm `🎲 Đổi chữ`, có nút `🔊 Nghe`, lật xem Pinyin/Hán Việt/Nghĩa, `⭐ Lưu sổ tay` (lưu thật vào `/v1/notebook`), và nhảy sang `/tao-vo-tap-viet?text=...`. | Đếm số mượt (`animateCountUp`) cho 4 ô thống kê; hiệu ứng lật thẻ 3D (`rotateY`); hover nổi 3px + ánh viền indigo; mascot nổi nhẹ (`htq-float`). |
| **2** | **Lộ trình & Bài học** (`/hoc`, `/hoc/tien-do`, `/hoc/thoi-quen`, `/lo-trinh`) | `images/studio/hero-hanzi-studio.jpg` + Capybara biểu cảm động theo tiến độ (`celebrate.webp`, `happy.webp`, `encouraging.webp`) + 6 avatar Companion | **Bộ chọn Bạn đồng hành trực tiếp (Companion Switcher)**: chuyển nhanh giữa `Capy`, `Tiểu Mãn`, `Hạ Vũ`, `Lục Thần`, `Dương Dương`, `Mai`, cập nhật ngay câu động viên theo chuỗi ngày & lưu `httq_companion_id`. | Thanh tiến độ quét ánh sáng (`shimmer`), vòng tiến độ SVG hoạt họa, pháo hoa giấy (`confetti`) khi đạt mốc/đổi bạn đồng hành cổ vũ. |
| **3** | **Ôn tập SRS & Sổ tay** (`/on-tap`, `/on-tap/*`, `/so-tay`) | `images/studio/banner-review-srs.jpg` + `images/home/flashcard.webp` | **Khởi động nhanh 1 thẻ nhớ (Lightning 1-Card Flip)** lấy trực tiếp từ danh sách từ đã học/thẻ đến hạn: chạm lật 3D, bấm `🔊`, chấm nhanh `Nhớ rõ ✓` hoặc `Ôn lại ↺` (gửi signal thật vào `/v2/review/signals` + `recordStudyProgress`). | Lật thẻ 3D mượt 0.45s, nhịp thở nhẹ cho badge số thẻ đến hạn (`pulse-soft`), confetti gọn khi chấm "Nhớ rõ". |
| **4** | **Từ điển, Tra chữ & Chiết tự** (`/tra-chu`, `/han-tu/*`, `/tu-vung/*`, `/han-viet/*`) | `images/studio/banner-dictionary-calligraphy.jpg` + `images/home/search.webp` | **Bảng 4 Thanh Điệu Tương Tác & Phím tắt Bộ thủ**: bấm nghe trực tiếp 4 thanh điệu mẫu (`mā 妈` · `má 麻` · `mǎ 马` · `mà 骂`) kèm bộ lọc nhanh `Bộ Nhân 亻`, `Bộ Thủy 氵`, `Bộ Tâm 忄`, `HSK 1`, `Chữ ngẫu nhiên 🎲`. | Hiệu ứng gợn sóng mực (`ink-ripple`), hiển thị chữ Hán trên ô Mễ Tự Cách (米字格), xuất hiện mượt (`fade-up`). |
| **5** | **Kho Giáo trình** (`/thu-vien*`) | `images/studio/hero-hanzi-studio.jpg` + `images/home/app/learning-path.webp` | **Thanh Độ Phủ Từ Vựng Toàn Kho**: hiển thị trực tiếp tỷ lệ % từ HSK 1–3 bạn đã mở khóa, nút nhảy nhanh sang `Luyện nói`, `Gõ Pinyin`, `Tạo vở tập viết`. | Shimmer progress bar động, chuyển màu viền gradient khi hover từng thẻ giáo trình. |
| **6** | **Luyện Nghe, Nói AI & Chép Chính Tả** (`/luyen-nghe`, `/luyen-noi`, `/luyen-chep-chinh-ta`) | `images/studio/banner-listening-speaking.jpg` + `images/home/listening.webp`, `speaking_practice.webp`, `dictation.webp` | **Khởi động Tai Thanh Điệu 4 Cấp (Tone Ear Warm-up)**: phát âm 1 từ mẫu (`playPronunciation`), chọn đúng Thanh 1 / 2 / 3 / 4 ngay lập tức, đếm chuỗi đúng liên tiếp và phát confetti khi đạt chuỗi 3+. | Cột sóng âm Equalizer 5 thanh nhảy nhịp khi âm thanh đang phát (`htq-eq-active`), lóe xanh ngọc khi đúng / rung nhẹ khi sai. |
| **7** | **Luyện Gõ Pinyin & Hán Tự** (`/luyen-go`, `/luyen-go-han-tu`) | `images/studio/banner-review-srs.jpg` + `images/home/type.webp` | **Thử thách Gõ Nhanh Mini (Pinyin Sprint)**: hiện chữ Hán + nghĩa, gõ Pinyin không dấu (`nihao`, `xuexi`, `zhongguo`...), chấm ngay khi khớp, tính combo liên tiếp & tự lưu từ đã luyện qua `recordStudyProgress`. | Hiệu ứng combo badge phát sáng (`x2`, `x3` 🔥), phím bật nảy, flash thành công mượt. |
| **8** | **Phòng Thi HSK / YCT & Ngữ Pháp** (`/kiem-tra-hsk`, `/de-kiem-tra`, `/kiem-tra-ngu-phap`, `/ngu-phap`) | `images/studio/banner-exam-hall.jpg` + `images/home/test.webp`, `grammar.webp` | **Widget Kế Hoạch & Đếm Ngược Kỳ Thi (Exam Plan Countdown)** nối trực tiếp API thật `/v2/me/exam-plan` & `/v2/me/score-prediction`: chọn Cấp thi (HSK 1–6), Ngày thi, Phút/ngày → lưu vào tài khoản + đếm ngược số ngày còn lại & độ sẵn sàng! | Đồng hồ đếm ngược sắc nét, thanh độ sẵn sàng thi có ánh quét, confetti ăn mừng khi lập kế hoạch thi. |
| **9** | **Trò chơi Chữ Hán** (`/tro-choi`, `/tro-choi/*`) | `images/studio/banner-games-arcade.jpg` + `images/games/ghep-thanh-ngu.webp`, `tim-chu-trong-chu.webp` | **Đố Vui Thành Ngữ 4 Chữ Trong Ngày (Daily Chengyu Teaser)**: điền 1 chữ còn thiếu (`一_二鸟`, `画蛇添_`, `半途而_`...), xem giải thích nghĩa Việt + lưu từ vào tiến độ! | Ánh sáng đèn lồng lễ hội tinh tế, confetti nổ ngay vị trí nút khi đoán đúng thành ngữ, huy hiệu kỷ lục điểm cao. |
| **10** | **Công cụ Sáng tạo & Dịch AI** (`/tao-vo-tap-viet`, `/flashcard-pdf`, `/luyen-viet`, `/tai-gif-but-thuan`, `/them-pinyin`, `/dich-tieng-trung`, `/cong-cu`) | `images/studio/banner-dictionary-calligraphy.jpg` / `banner-games-arcade.jpg` + `images/home/write.webp`, `translate.webp`, `pinyin.webp` | **Thanh Nạp Nhanh 1 Chạm (Quick Preset Chips)**: nạp nhanh bộ chữ mẫu (`Chào hỏi`, `Số đếm 1–10`, `Gia đình`, `Từ tôi đã học`) cho vở tập viết/bút thuận hoặc nạp nhanh câu giao tiếp mẫu cho trang Dịch AI & Thêm Pinyin kèm nút `🔊`. | Nền lưới Mễ Tự Cách tinh tế, toast thông báo gọn khi nạp mẫu thành công. |
| **11** | **Tài khoản & Thống kê** (`/tai-khoan`, `/dang-nhap`, `/dang-ky`) | `images/practice/summary-great.webp` / `summary-good.webp` / `summary-keep.webp` (động theo cấp bậc) + `images/brand/auth-tieu-man-welcome.webp` | **Thẻ Cấp Bậc & Huy Hiệu Học Giả (Scholar Rank Card)**: tự động tính hạng (`Tân Học Viên` → `Thư Sinh HSK 1` → `Cử Nhân Hán Ngữ` → `Học Giả Chữ Hán`), thanh XP lên hạng kế tiếp & 4 huy hiệu thực (Chuỗi ngày, Kho từ vựng, Ngữ pháp, Phòng thi). | Hào quang avatar mượt, thanh XP shimmer, thẻ huy hiệu có hiệu ứng nổi khi hover. |

---

## 3. Hệ Thống Hiệu Ứng Toàn Cục (`window.__xhzStudioFx`)

- **Thanh tiến độ đọc/cuộn trang (Top Reading Hairline)**: đường kẻ gradient `2.5px` (`#4f46e5` → `#0d9488` → `#ec4899`) bám sát mép trên trình duyệt.
- **Hiệu ứng Pháo hoa giấy Canvas (`window.__xhzStudioFx.confetti(el)`)**: siêu nhẹ, vẽ trên 1 canvas phủ `pointer-events: none`, tự giải phóng hoàn toàn sau ~1.3s.
- **Hiệu ứng Thông báo Nổi (`window.__xhzStudioFx.toast(msg, tone)`)**: hiển thị góc dưới phải (tự nâng lên trên thanh Mobile Bottom Nav khi màn hình `<= 768px`).
- **Đếm số KPI mượt (`window.__xhzStudioFx.animateCountUp`)**: chạy `requestAnimationFrame` nhẹ nhàng khi bảng thống kê xuất hiện.
- **Tôn trọng `prefers-reduced-motion: reduce`**: tự động tắt toàn bộ hoạt ảnh nổi/confetti/shimmer cho người dùng bật giảm chuyển động.
