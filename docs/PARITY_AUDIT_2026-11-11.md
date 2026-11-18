# Đối chiếu và sửa lỗi v10.1 — 11/11/2026

## Phạm vi và nguồn đối chiếu

Bản nền là `58e9a9e` trên `main`, đã đồng bộ 10 commit mới của chủ dự án trước khi sửa. Giữ các thay đổi v10 về lesson runner, dữ liệu learning track, giao diện giáo trình/ngữ pháp và `/api/ai.js`.

Đối chiếu giao diện công khai trên `https://xiehanzi.com/` với production `https://hoctiengtrungquoc.vercel.app/`, sau đó thử thao tác trên Chrome thật với bản local. Không chỉnh dữ liệu hay làm bài thi trên web gốc. Kiểm kê tĩnh bao phủ 192 HTML / 98 URL chuẩn; đây là kiểm tra tuyến, liên kết và hợp đồng API, không phải bằng chứng đã thử mọi thao tác trên mọi dữ liệu.

## Lỗi đã sửa

| Khu vực | Lỗi tái hiện / bằng chứng | Hành vi sau sửa |
| --- | --- | --- |
| Tài khoản | Login email tạo user cục bộ khi chưa xác thực; callback tin dữ liệu chưa kiểm chứng; thiếu refresh; logout xóa tiến độ | Dùng Supabase Auth thật, xác minh user, refresh token có kiểm tra chủ phiên, đăng ký chờ email xác nhận, giữ dữ liệu khi logout |
| Gói tài khoản | Runtime gán mọi user vào “Pro trọn đời” không có giao dịch tương ứng | Hiển thị gói miễn phí của bản web; bỏ quyền `unlimited_ai` giả |
| Đồng bộ | JWT nội bộ không dùng được với RLS; lỗi lưu vẫn được báo thành công; phản hồi cũ có thể đến sau khi đổi tài khoản | Dùng JWT Supabase đã kiểm chứng/làm mới; bảng và metadata đều cần thành công; từ chối phản hồi sai chủ; lỗi mạng vẫn giữ bản local |
| Dữ liệu học | Các kho cố định dùng chung giữa khách và tài khoản | Namespace theo chủ tài khoản cho tiến độ, chat, hàng đợi ôn, sổ tay, lịch sử pinyin và dictation; dữ liệu khách cũ vẫn giữ trong phạm vi khách |
| Hán tự theo cấp/bộ | Trang chi tiết dùng renderer giáo trình, không phải bộ lọc chữ Hán | Lọc đúng chỉ mục; tìm kiếm, sắp xếp và phân trang; HSK 1–6 lần lượt 174/173/270/447/621/977 chữ, bộ 一 28 chữ |
| Bố cục trang động | Root trong flex co hẹp và đặt chữ đen trên nền tối | Chiều rộng 100%, giới hạn 1024px và kế thừa màu; bộ lọc chữ có màu sáng/tối rõ ràng |
| Luyện ngữ pháp | `/ngu-phap/luyen-tap/hsk1_1` hiển thị trang lý thuyết | Renderer luyện tập riêng, đúng chủ điểm, ví dụ thực trong dữ liệu, không bù câu từ chủ điểm khác; liên kết quay lại lý thuyết |
| Thêm pinyin | POST `/v1/pinyin-lookup` trả danh sách chữ thay vì `annotations`, gây lỗi `.filter` và trang lỗi | Chú thích từng chữ/từ từ kho cục bộ; giữ dấu câu, xuống dòng, ký tự khác; lưu và mở lại trong sổ tay; sửa liên kết “Thư viện đã lưu” |
| Lưu trữ | Một số API library/lists/worksheets/notes/sync trả thành công nhưng không ghi | CRUD có lưu bền cục bộ, kiểm tra quota và chủ tài khoản, hàng đợi ghi tuần tự, merge có tombstone để không phục hồi mục đã xóa |
| Ôn tập SRS | Bộ đếm ước lượng, lỗi mẫu, phiên ôn không phản ánh lịch sử thật | Tạo thẻ từ các từ thực đã học và tín hiệu luyện; lịch 1 phút/10 phút/1 ngày/4 ngày theo lựa chọn; tín hiệu có id chống lặp và replay theo thời gian |
| Đề HSK | Thiếu answer key nhưng mặc định A, bài viết có chữ được coi là đúng | Chọn thi thử/luyện tập, tự lưu/tiếp tục, bộ đếm giờ và phát nghe; thiếu đáp án ghi rõ chưa chấm, API chặn chấm giả bằng 409 |
| Dictation | `blankCharIdx` là mảng nhưng chỉ lấy ô đầu; nhận mọi chữ hoặc âm tiết có trong câu | Hiển thị đủ ô, lưu từng ô, đối chiếu chính xác chữ/âm tiết tại từng vị trí; 3 đoạn không căn được pinyin yêu cầu chữ Hán |
| Lỗi đường dẫn | Liên kết `/tu-dien`, JSON fallback đề không có và round thiếu ID có thể lỗi JS | Dẫn tới `/tra-chu`, bỏ JSON không tồn tại, trả 404 cho ID vòng chơi rỗng |

## Kiểm tra thực tế trên Chrome

- HSK 1: 174 chữ, hiển thị 60 mục/lượt, tìm 你 trả đúng 1 mục; root rộng 1024px trên màn hình desktop và chữ sáng trên nền tối.
- Luyện `hsk1_1`: 8 câu đúng chủ điểm 什么, có liên kết lý thuyết; trang không còn mở nhầm bài lý thuyết.
- Đề `hsk30-1`: 40 câu / 40 phút như phòng thi gốc. Chọn luyện tập, chọn B câu 1, tải lại, tiếp tục giữ 1/40; nộp ghi “Chưa chấm điểm”.
- Giáo trình HSK 3.0 cấp 1, Món ăn: 25 từ; đánh dấu 菜 đã thuộc, tải lại giữ 1/25. Trung tâm ôn nhận 1 thẻ. Lật thẻ và chọn Tốt 1 ngày đưa đúng thẻ sang Ngày mai, tải lại không trở về hôm nay.
- Pinyin: `你好，我学习中文。` hiện 7 chữ Hán với nhóm từ 你好/学习/中文; lưu, chuyển tới sổ tay tab pinyin, bản văn xuất hiện và có liên kết mở lại.
- Dictation video đầu: 45 câu; câu `今天的视频` có 2 ô ở vị trí 1 và 5. Điền 天/天 bị sai, 今/频 được chấm đúng.
- `/tai-khoan`: hiện lợi ích khách, nút Google và thống kê; không vỡ trang. Khách không được coi là tài khoản Supabase.
- Lesson runner `hsk30.L1.P1.learn.1`: mở intro, Bắt đầu, chọn bā, Tiếp tục sang câu hỏi nghĩa 八; giữ runner v10.

## Hạ tầng xác minh

- GitHub: `hungktkthd/saochepweb`, nhánh triển khai `main`.
- Vercel: project `hoctiengtrungquoc`, liên kết repo trên.
- Supabase: `skxgzzdunqloxxombtuc`, Google và email bật; `public.study_profiles` có RLS và SELECT/INSERT/UPDATE chỉ khi `auth.uid() = user_id`.
- Tiến độ v10 vẫn dùng `auth.users.user_metadata.xhz_progress`; trạng thái sổ tay/ôn tập bổ sung dùng `study_profiles`, workspace `hoctiengtrungquoc`. Không tạo database/project mới.
- Google Cloud authorized redirect URI là `https://skxgzzdunqloxxombtuc.supabase.co/auth/v1/callback`; địa chỉ quay về ứng dụng là `https://hoctiengtrungquoc.vercel.app/tai-khoan`. Hai URL phục vụ hai bước khác nhau.

## Kiểm tra tự động có thể chạy lại

```sh
node --check xiehanzi-runtime.js
node scripts/test-auth-v10.mjs
node scripts/test-cloud-v10.mjs
node scripts/test-persistence.mjs
node scripts/test-scoped-storage.mjs
node scripts/test-dictation-v10.mjs
node scripts/test-content-v10.mjs
node scripts/build-runtime-support.mjs --check
node scripts/audit-routes.mjs docs/parity-route-inventory.json
```

Các bài Auth/cloud dùng transport giả lập để kiểm tra hết hạn phiên, đổi chủ giữa request, thất bại mạng/RLS/quota và merge; không tạo user hay thay đổi dữ liệu thật. Trình duyệt dùng để kiểm tra giao diện và luồng thao tác. AI trả phí và quyền microphone không được gọi trong bộ kiểm tra này.

## Xác minh production sau triển khai

- Commit chức năng `d6e99b49ea6492e54e188d9d818d7111623b2b6b` được Vercel triển khai READY, deployment `dpl_7XjkWkmxBa9ypRFAEAhpDAurnuT9`, alias tên miền chính xác nhận thành công.
- Chrome trên production hiển thị bộ lọc HSK 1 mới với 174 chữ.
- Google đăng nhập bằng tài khoản đã có quyền truy cập, quay về `/tai-khoan` thành công; lần thử này không có `redirect_uri_mismatch` và không yêu cầu cấp thêm quyền.
- Bấm “Đồng bộ ngay” nhận xác nhận thành công; truy vấn Supabase read-only thấy 1 profile của workspace, `updated_at = 2026-11-11 12:59:30.902+00`. Không ghi email hay token vào repo.
- Bộ kiểm tra trước triển khai: 79/79 (Auth 19, cloud 9, persistence 23, Storage 10, dictation 8, content 10); kiểm kê tuyến không có tham chiếu tĩnh/JSON thiếu hoặc lỗi API probe.

## Phần chưa đủ bằng chứng hoặc thiếu dữ liệu

- Kho 66 đề / 4.334 câu chưa có trường đáp án chuẩn. Bản sửa ngăn chấm sai nhưng chưa bổ sung đáp án. Cần nhập answer key có nguồn và kiểm định trước khi bật chấm điểm.
- Chỉ mục bộ 丨 có 7 chữ trong khi web gốc hiển thị 8. Cần đối chiếu bản ghi thiếu; không tăng bộ đếm bằng dữ liệu giả.
- Chưa xác nhận toàn bộ thao tác AI chat/voice, điểm phát âm, SSE và màn bên trong Thầy Đồ theo tài khoản thật. Những fallback mô phỏng còn trong runtime cần được rà riêng trước khi công bố ngang đầy đủ chức năng với web gốc.
- Đăng nhập Google và đồng bộ trên production đã được kiểm chứng như trên. Chưa kiểm chứng trên hai thiết bị thật độc lập.
- Dữ liệu khách cũ giữ riêng trên thiết bị; chưa tự nhập toàn bộ lịch sử khách vào tài khoản mới. Không gộp âm thầm vào tài khoản khác trên máy dùng chung.
- Form đặt mật khẩu cho user chỉ dùng Google chưa có luồng recovery/set-password hoàn chỉnh; không báo thành công nếu chưa được Supabase chấp nhận.
- Không coi số lượng file media hoặc việc URL trả 200 là bằng chứng mọi chức năng hoạt động 1:1. Kiểm kê JSON: 9.931 chữ, 11.534 từ, 6.704 mục Hán Việt, 91 video, 66 đề, 1.132 JSON giáo trình.
