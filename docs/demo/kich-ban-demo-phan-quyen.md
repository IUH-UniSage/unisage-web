> **Đã thay thế:** nội dung video Phân quyền nay nằm ở mục "Video 3" trong [kich-ban-demo-tong-the.md](kich-ban-demo-tong-the.md). File này chỉ giữ lại để tham khảo.

# Kịch bản demo: Phân quyền tài liệu trong UniSage

> Bản nháp để duyệt trước khi quay. Sau khi chốt, kịch bản này được dùng để viết script Playwright quay màn hình và chèn tooltip.

## 1. Tổng quan

| Mục        | Nội dung                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Người xem  | Người dùng cuối: sinh viên, giảng viên, cán bộ, khách                                                                              |
| Thông điệp | "UniSage chỉ trả lời từ những tài liệu bạn được phép xem."                                                                         |
| Thời lượng | Khoảng 4 phút (bản đầy đủ có cảnh tùy chọn: khoảng 5 phút)                                                                         |
| Hình thức  | Quay màn hình 1440×900, không thuyết minh. Lời dẫn nằm trong **tooltip** hiện cạnh đúng phần tử đang thao tác, kèm số bước "n/10". |
| Dữ liệu    | Bộ test `unisage-gateway/dataset/access-control`: tài liệu và tài khoản đều là dữ liệu giả lập                                     |

### 3 quy tắc video cần truyền tải

1. **Tài liệu công khai**: ai cũng xem được, kể cả khách chưa đăng nhập.
2. **Tài liệu nội bộ**: chỉ người thuộc **đúng phòng ban, bộ môn** của tài liệu mới xem được.
3. Trong bộ môn đó, người xem còn phải có **cấp truy cập lớn hơn hoặc bằng cấp tối thiểu** của tài liệu (cấp 0 đến 5).

Khi không có quyền, UniSage **không dùng** tài liệu đó để trả lời và không để lộ nội dung của nó.

## 2. Nhân vật và tài liệu dùng trong video

| Tài khoản     | Mật khẩu          | Đơn vị                    | Cấp        | Vai trò trong video                 |
| ------------- | ----------------- | ------------------------- | ---------- | ----------------------------------- |
| Khách         | (không đăng nhập) | –                         | –          | Chỉ xem được tài liệu công khai     |
| `TST-CNPM-L0` | `Test@2026`       | Bộ môn Công nghệ Phần mềm | 0          | Giảng viên mới của bộ môn           |
| `TST-CNPM-L2` | `Test@2026`       | Bộ môn Công nghệ Phần mềm | 2          | Giảng viên được giao chấm khóa luận |
| `TST-KT-L5`   | `Test@2026`       | Bộ môn Kế toán            | 5          | Cấp cao nhất nhưng ở bộ môn khác    |
| `SA-001`      | `123123`          | Tất cả                    | Toàn quyền | Chỉ dùng ở cảnh 9 (tùy chọn)        |

| Mã  | Tài liệu                                                   | Đơn vị                   | Công khai | Cấp tối thiểu |
| --- | ---------------------------------------------------------- | ------------------------ | --------- | ------------- |
| P3  | Quy định xét học bổng khuyến khích học tập 2026-2027       | Phòng Công tác Sinh viên | Có        | –             |
| A0  | Quy định sinh hoạt học thuật (seminar) BM CNPM 2026-2027   | BM Công nghệ Phần mềm    | Không     | 0             |
| A2  | Quy chế chấm khóa luận, hội đồng phản biện BM CNPM         | BM Công nghệ Phần mềm    | Không     | 2             |
| B0  | Quy định sinh hoạt chuyên môn, dự giờ BM Kế toán 2026-2027 | BM Kế toán               | Không     | 0             |

## 3. Kịch bản từng cảnh

Ký hiệu cột Tooltip: **[neo]** là phần tử tooltip trỏ vào (selector `data-tour`, id hoặc aria-label có sẵn trong giao diện), sau đó là nội dung tooltip.

### Cảnh 0: Mở đầu (0:00–0:10)

- **Màn hình:** khung tiêu đề phủ lên trang chủ `/`.
- **Chữ trên khung:** "Phân quyền tài liệu trong UniSage". Dòng phụ: "Mỗi người chỉ nhận câu trả lời từ tài liệu mình được phép xem."
- **Tooltip:** không có.

### Cảnh 1: Khách hỏi về quy định chung (0:10–0:45)

- **Tài khoản:** Khách.
- **Thao tác:** ở trang chủ, gõ vào ô "Đặt câu hỏi về học vụ..." câu: `hoc bong loai gioi can gpa hk va drl bao nhieu`, rồi gửi.
- **Kết quả kỳ vọng:** "Điểm trung bình học kỳ từ 3,30 đến dưới 3,65 (thang 4) và điểm rèn luyện từ 80 trở lên", dưới câu trả lời có dòng "Nguồn:" trỏ tới tài liệu P3.
- **Tooltip:**
  1. [neo `home-ask`] "Chưa đăng nhập bạn vẫn hỏi được về các quy định chung của Trường."
  2. [neo `chat-reply-citations`] "Câu trả lời lấy từ một tài liệu **công khai**. Ai cũng xem được."

### Cảnh 2: Khách hỏi về tài liệu nội bộ (0:45–1:15)

- **Tài khoản:** Khách.
- **Thao tác:** trong cùng đoạn chat, hỏi `seminar bo mon cnpm nam 26-27 to chuc luc may gio, phong nao vay`.
- **Kết quả kỳ vọng:** UniSage báo chưa có thông tin hoặc đề nghị liên hệ đơn vị, và **không** nêu giờ hay phòng họp.
- **Tooltip:** 3. [neo khung câu trả lời] "Lịch seminar là tài liệu **nội bộ** của Bộ môn Công nghệ Phần mềm. Khách không xem được, nên UniSage không dùng nó để trả lời." 4. [neo `chat-guest-sign-in`] "Đăng nhập để xem tài liệu của đơn vị bạn."

### Cảnh 3: Đăng nhập và xem cấp truy cập của mình (1:15–1:40)

- **Tài khoản:** `TST-CNPM-L0`.
- **Thao tác:**
  - Bấm "Đăng nhập", điền `#code`, `#password`, rồi bấm nút "Đăng nhập".
  - Mở menu "Tài khoản", chọn "Thông tin cá nhân" (`/profile`).
- **Kết quả kỳ vọng:** thẻ "Tài khoản" hiện "Vai trò" là USER và "Cấp truy cập" là "Cấp 0".
- **Tooltip:** 5. [neo `#code`] "Đăng nhập bằng mã giảng viên hoặc mã sinh viên do Trường cấp." 6. [neo `profile-account`] "Đây là **cấp truy cập** của bạn. Tài khoản này thuộc Bộ môn Công nghệ Phần mềm, cấp 0."

### Cảnh 4: Đúng bộ môn, đủ cấp thì xem được (1:40–2:05)

- **Tài khoản:** `TST-CNPM-L0`.
- **Thao tác:** mở "Đoạn chat mới", hỏi lại câu seminar ở cảnh 2.
- **Kết quả kỳ vọng:** "Chiều thứ Năm tuần thứ hai và tuần thứ tư hằng tháng, 14h00–16h30, tại phòng H5.0214", kèm nguồn là tài liệu A0.
- **Tooltip:** 7. [neo `chat-reply-citations`] "Cùng bộ môn, cấp của bạn (0) lớn hơn hoặc bằng cấp tối thiểu của tài liệu (0), nên **xem được**."

### Cảnh 5: Đúng bộ môn nhưng chưa đủ cấp (2:05–2:30)

- **Tài khoản:** `TST-CNPM-L0`.
- **Thao tác:** hỏi `diem khoa luan ktpm tinh trong so gvhd, phan bien, hoi dong the nao`.
- **Kết quả kỳ vọng:** UniSage báo chưa có thông tin, và **không** nêu các tỷ lệ 20/30/50.
- **Tooltip:** 8. [neo khung câu trả lời] "Quy chế chấm khóa luận yêu cầu **cấp 2**. Bạn đang ở cấp 0 nên chưa xem được, dù cùng bộ môn."

### Cảnh 6: Cấp cao hơn thì xem được (2:30–3:00)

- **Tài khoản:** `TST-CNPM-L2` (đăng xuất rồi đăng nhập lại).
- **Thao tác:** mở đoạn chat mới, hỏi lại câu ở cảnh 5.
- **Kết quả kỳ vọng:** "20% điểm GVHD + 30% điểm phản biện + 50% điểm trung bình hội đồng", kèm nguồn là tài liệu A2.
- **Tooltip:** 9. [neo `chat-reply-citations`] "Ở cấp 2, bạn xem được tài liệu cấp 0, 1 và 2 của bộ môn mình."

### Cảnh 7: Cấp cao nhất nhưng khác bộ môn (3:00–3:40)

- **Tài khoản:** `TST-KT-L5`.
- **Thao tác:**
  1. Hỏi câu seminar của Bộ môn CNPM.
  2. Hỏi `gv moi bm ke toan phai duoc du gio it nhat may tiet nam 26-27`.
- **Kết quả kỳ vọng:**
  1. Câu seminar: báo chưa có thông tin.
  2. Câu dự giờ: "Tối thiểu 7 tiết trong năm học", kèm nguồn là tài liệu B0.
- **Tooltip:** 10. [neo câu trả lời 1] "Cấp 5 là cấp cao nhất, nhưng lịch seminar thuộc **Bộ môn Công nghệ Phần mềm**. Khác đơn vị thì vẫn không xem được." 11. [neo câu trả lời 2] "Tài liệu của chính Bộ môn Kế toán thì xem được ngay."

### Cảnh 8 (tùy chọn): Chia sẻ đoạn chat không làm lộ tài liệu (3:40–4:05)

- **Tài khoản:** `TST-CNPM-L2` chia sẻ đoạn chat ở cảnh 6; sau đó `TST-KT-L5` mở link chia sẻ.
- **Thao tác:** `TST-KT-L5` bấm vào nguồn trích dẫn trong đoạn chat được chia sẻ.
- **Kết quả kỳ vọng:** ngăn kéo "Tài liệu tham chiếu" hiện "Bạn không có quyền xem tài liệu này."
- **Tooltip:** 12. [neo ngăn kéo] "Người được chia sẻ vẫn bị kiểm tra quyền khi mở tài liệu gốc."

### Cảnh 9 (tùy chọn, rất ngắn): Ai cấp quyền cho bạn? (4:05–4:25)

- **Tài khoản:** `SA-001`.
- **Thao tác:**
  - Vào "Quản lý người dùng", mở `TST-CNPM-L2`, xem mục "Quyền truy cập phòng ban".
  - Vào "Quản trị tài liệu", mở tài liệu A2, xem mục "Phân loại & Cấp độ truy cập".
- **Tooltip:** 13. [neo `user-detail-departments`] "Quản trị viên gán cho mỗi người: phòng ban và cấp truy cập." 14. [neo `document-form-classification`] "Mỗi tài liệu nội bộ có phòng ban và **cấp độ truy cập tối thiểu**. Tài liệu công khai thì không cần."

### Cảnh 10: Tổng kết (cuối video, khoảng 15 giây)

- **Khung tổng kết:**
  - Công khai: ai cũng xem được.
  - Nội bộ: đúng đơn vị **và** đủ cấp.
  - Thiếu thông tin cần thiết? Liên hệ đơn vị để được cấp quyền, hoặc bấm "Báo cáo câu trả lời này" dưới câu trả lời.

## 4. Chuẩn bị trước khi quay

- [ ] **Ingest đủ 4 tài liệu P3, A0, A2, B0, trạng thái "Hoàn tất".** Kiểm tra ngày 23/11/2026 trên collection `unisage-official-chunks`: A0 có 30 chunk, còn **A2, B0, P3 có 0 chunk**. Phải nạp xong trước khi quay. Phòng ban, cấp và chế độ công khai đặt theo `catalog.json`.
- [ ] Các service đang chạy: web `localhost:5173` (bắt buộc đúng cổng này vì CORS), gateway `:8400`, backend `:8401` (profile `eval`), agent `:8402`.
- [ ] Đã thử đăng nhập được `SA-001`, `TST-CNPM-L0`, `TST-CNPM-L2`, `TST-KT-L5`, và `department_access` trong JWT khớp bảng ở mục 2.
- [ ] Chạy thử từng câu hỏi một lần trước khi quay. Câu trả lời do AI sinh nên mỗi lần có thể khác chữ. Cần chắc các câu "được xem" ra đúng số liệu, các câu "bị chặn" không lộ số liệu.
- [ ] Tắt product tour: đặt localStorage `unisage_product_tour_seen` (giống `e2e/support/auth.ts`).
- [ ] Mỗi cảnh dùng một đoạn chat mới, để câu trả lời trước không ảnh hưởng câu sau.

## 5. Ghi chú kỹ thuật cho lúc quay

- Quay bằng Playwright (`recordVideo`, 1440×900). Gõ phím có độ trễ cho tự nhiên, và dừng 1–2 giây sau mỗi câu trả lời.
- Tooltip là lớp phủ do script chèn vào trang lúc quay, **không sửa code của app**. Mỗi tooltip có mũi tên, nội dung tối đa khoảng 25 từ, số bước, và hiện 3–4 giây.
- Neo tooltip dùng `data-tour` có sẵn (`home-ask`, `chat-reply-citations`, `chat-guest-sign-in`, `profile-account`, `user-detail-departments`, `document-form-classification`…), id của ô nhập (`#code`, `#password`), hoặc aria-label (`Tin nhắn gửi UniSage`, `Gửi tin nhắn`, `Tài khoản`).
- Giao diện không có chỗ nào cho người dùng cuối xem phòng ban của mình (trang `/profile` chỉ hiện vai trò và cấp). Vì vậy phần phòng ban được nói qua tooltip.

## 6. Cần chốt trước khi quay

1. Giữ hay bỏ **cảnh 8** (chia sẻ) và **cảnh 9** (góc quản trị)? Cả hai đều tùy chọn vì người xem là người dùng cuối.
2. Cách bot từ chối ở cảnh 2, 5 và 7 phụ thuộc vào câu trả lời thật lúc quay. Có cần thống nhất trước một câu từ chối mẫu không?
3. Có cần thêm intro hoặc outro mang nhận diện Trường (logo, màu) không?
