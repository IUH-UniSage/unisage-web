# Bộ kịch bản demo UniSage (bản 2: tập trung vào chức năng)

> Bản nháp để duyệt. Video hướng dẫn tổng quan nộp cho giảng viên.
> **Nguyên tắc bản 2:** mỗi video chứng minh một chức năng qua các **tình huống** (đầu vào → kết quả hệ thống trả về). Không giới thiệu từng nút hay từng vùng của giao diện (nút Dừng, ô tìm kiếm, menu xóa, dòng chú thích…). Thao tác giao diện chỉ xuất hiện khi nó là một phần của tình huống.

## Quy ước chung

- **Văn phong:** trang trọng, trung tính, ngôi thứ ba ("người dùng", "hệ thống"). Không xưng "mình/bạn", không dùng từ cảm thán.
- **Nhãn tình huống:** đầu mỗi tình huống, góc trên màn hình hiện nhãn ngắn, ví dụ "Tình huống 2 · Đúng bộ môn, chưa đủ cấp". Kèm dòng phụ ghi tài khoản đang dùng, ví dụ "TST-CNPM-L0 · BM Công nghệ Phần mềm · cấp 0".
- **Tooltip:** chỉ đặt cạnh **kết quả** (câu trả lời, nguồn, thông báo của hệ thống) để giải thích hệ thống đã làm gì và vì sao. Mỗi video khoảng 4–7 tooltip, mỗi tooltip tối đa khoảng 30 từ.
- **Intro** (5 giây): logo, tên video, một dòng mục tiêu. **Outro** (7 giây): 2–3 dòng kết luận về chức năng.
- **Câu trả lời do AI sinh:** mỗi lần quay có thể khác chữ. Cột "Kết quả cần thấy" chỉ ghi ý và số liệu bắt buộc phải có. Đáp án đúng lấy từ `unisage-gateway/dataset/access-control/questions.jsonl`.

## Danh sách video

| #   | Video                          | Chức năng chứng minh                                                                                                                                                           | Thời lượng |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 0   | Giới thiệu                     | 3 nguyên tắc: trả lời từ văn bản, có nguồn, phạm vi theo tài khoản                                                                                                             | 1'         |
| 1   | Hỏi đáp                        | Hiểu câu hỏi tự nhiên, dẫn nguồn mở được văn bản gốc, giữ ngữ cảnh khi hỏi nối tiếp, hỏi lại khi thiếu thông tin và ghi nhớ lựa chọn, nói rõ khi không có dữ liệu đúng phạm vi | 4'         |
| 2   | Phân quyền tài liệu            | Cùng câu hỏi, kết quả khác nhau theo phòng ban và cấp truy cập                                                                                                                 | 3'30       |
| 3   | Yêu cầu hỗ trợ                 | Luồng đầy đủ: người dùng báo câu trả lời chưa đạt → cán bộ xác định nguyên nhân, phản hồi → người gửi nhận phản hồi                                                            | 3'30       |
| 4   | Người dùng và vai trò          | Tài khoản mới có ngay phạm vi tài liệu theo phòng ban và cấp được gán; đổi cấp thì đổi kết quả                                                                                 | 3'         |
| 5   | Phòng ban                      | Cơ cấu đơn vị nhiều cấp; quyền gán theo từng đơn vị                                                                                                                            | 2'         |
| 6   | Nạp tài liệu (ingest–chunking) | Tài liệu mới: trước khi nạp chưa trả lời được; chỉnh sửa đoạn trước khi nạp; sau khi nạp trả lời được và chỉ đúng người có quyền                                               | 4'30       |
| 7   | Gói hạn mức                    | Người dùng dùng hết hạn mức thì bị tạm chặn, có thời điểm được dùng lại                                                                                                        | 2'         |

Tổng cộng khoảng 21 phút. Video 1 gộp phần nguồn trích dẫn và phần hỏi lại để làm rõ. Video 3 gộp phần gửi yêu cầu (người dùng) và phần xử lý (cán bộ) để thể hiện trọn một luồng.

### Tài khoản và tài liệu

| Tài khoản                                            | Mật khẩu    | Vai trò     | Phòng ban · cấp                                |
| ---------------------------------------------------- | ----------- | ----------- | ---------------------------------------------- |
| `SA-001`                                             | `123123`    | SUPER_ADMIN | Toàn quyền                                     |
| `TST-CNPM-L0`, `TST-CNPM-L1`, `TST-CNPM-L2`          | `Test@2026` | USER        | BM Công nghệ Phần mềm · cấp 0 / 1 / 2          |
| `TST-KT-L5`                                          | `Test@2026` | USER        | BM Kế toán · cấp 5                             |
| `DEMO-GV-01` (tạo trong video 4, dùng lại ở video 7) | đặt lúc tạo | USER        | BM Công nghệ Phần mềm · cấp 1, sau đổi thành 2 |

| Mã  | Tài liệu                                                                                                           | Phạm vi            | Trạng thái (kiểm tra Qdrant 24/11)                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------- |
| P3  | Quy định xét học bổng khuyến khích học tập 2026–2027                                                               | Công khai          | Đã nạp (29 chunk)                                                                                         |
| A0  | Quy định seminar BM CNPM 2026–2027                                                                                 | BM CNPM · cấp 0    | Đã nạp (30)                                                                                               |
| A1  | Hướng dẫn phân công GVHD tốt nghiệp HK1 2026–2027 KTPM                                                             | BM CNPM · cấp 1    | Đã nạp (38)                                                                                               |
| A2  | Quy chế chấm khóa luận, hội đồng phản biện BM CNPM                                                                 | BM CNPM · cấp 2    | Đã nạp (34)                                                                                               |
| D1  | Quy định sử dụng phòng thực hành và máy chủ GPU BM CNPM 2026–2027 (tài liệu demo riêng, 2 trang, nội dung giả lập) | BM CNPM · cấp 3    | **Chưa nạp**, không có trong Qdrant: nạp trực tiếp trong video 6. Tệp và spec: `docs/demo/tai-lieu-demo/` |
| B0  | Quy định sinh hoạt chuyên môn, dự giờ BM Kế toán                                                                   | BM Kế toán · cấp 0 | Đã nạp (33)                                                                                               |

### Không quay

- "Thư viện tri thức", "Thông báo", "Kiểm tra chất lượng": trang placeholder.
- Trang tổng quan `/ingester`: số liệu giả cứng trong code.
- Khách hỏi tiếp trong cùng đoạn chat: ô nhập bị khóa sau câu trả lời đầu tiên (lỗi app). Khách chỉ hỏi một câu mỗi đoạn chat.
- Link chia sẻ đoạn chat: hiện để lộ nội dung câu trả lời cho người không có quyền với tài liệu nguồn, nên không đưa vào video phân quyền.

---

## Video 0: Giới thiệu

**Mục tiêu:** người xem nắm nguyên tắc trả lời và mô hình phân quyền trước khi vào từng chức năng. Video 0 chỉ nêu mô hình; video 2 chứng minh bằng tình huống, video 4–6 là nơi cấu hình mô hình này.

1. Khung chữ "UniSage – Trợ lý học vụ": "Hệ thống hỏi đáp học vụ dựa trên văn bản của Trường Đại học Công nghiệp TP.HCM."
2. Khách hỏi `hoc bong kkht loai gioi can diem hk va drl bao nhieu` (P3, công khai).
   - **Kết quả cần thấy:** ĐTB học kỳ từ 3,30 đến dưới 3,65 (thang 4), điểm rèn luyện từ 80; nguồn là P3.
   - Tooltip [câu trả lời]: "Hệ thống tìm các văn bản liên quan của Trường và tạo câu trả lời từ nội dung các văn bản đó, kèm nguồn để đối chiếu."
3. Khung chữ "Nguyên tắc trả lời":
   - "Câu trả lời chỉ dựa trên văn bản đã được nạp vào hệ thống."
   - "Mỗi câu trả lời kèm nguồn trích dẫn."
4. Khung sơ đồ "Hệ thống phân quyền" (khoảng 16 giây, không có logo):

   ```
   Người dùng ──► Vai trò ─────────────────► Chức năng được sử dụng
        │                                    (hỏi đáp, quản trị người dùng, nạp tài liệu…)
        └──────► Phòng ban + cấp truy cập ──► Tài liệu được dùng để trả lời
                 (cấp 0–5)
   ```

   | Tài liệu                                | Ai xem được                                                                   |
   | --------------------------------------- | ----------------------------------------------------------------------------- |
   | Công khai                               | Mọi người dùng, kể cả khách                                                   |
   | Nội bộ (gắn phòng ban và cấp tối thiểu) | Người dùng đúng phòng ban **và** có cấp truy cập ≥ cấp tối thiểu của tài liệu |

   Dòng cuối: "Quản trị viên gán quyền cho người dùng; người nạp tài liệu gán phạm vi cho tài liệu."
   Sơ đồ cố ý không nói về đơn vị cấp trên/cấp dưới (xem "Cần chốt", điểm 2).

5. Khung kết "Nội dung các video tiếp theo": liệt kê video 1–7.

---

## Video 1: Hỏi đáp

**Mục tiêu:** hệ thống hiểu câu hỏi viết tự nhiên, dẫn nguồn để người dùng mở văn bản gốc đối chiếu, giữ ngữ cảnh khi hỏi nối tiếp, hỏi lại khi câu trả lời phụ thuộc thông tin người hỏi chưa cung cấp (và ghi nhớ lựa chọn), và nói rõ khi không có dữ liệu đúng phạm vi được hỏi thay vì tự suy diễn.

Tài khoản `TST-CNPM-L1` (BM Công nghệ Phần mềm, cấp 1; hồ sơ học vụ để trống trước khi quay). Chỉ dùng tài liệu công khai để video không phụ thuộc phân quyền.

| Tình huống                                    | Câu hỏi                                                                                                                                                                                                                                                                                                                              | Kết quả cần thấy                                                                                                                                                                             | Tooltip                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 · Câu hỏi viết tắt, không dấu               | `hp dai hoc chinh quy khoa 2025 khoi cong nghe 1 tin chi ly thuyet bao nhieu`                                                                                                                                                                                                                                                        | 980.000 đồng/tín chỉ, nguồn QĐ 1035                                                                                                                                                          | [câu trả lời] "Câu hỏi viết tắt, không dấu vẫn được hiểu đúng: học phí, đại học chính quy, khóa 2025, khối công nghệ, tín chỉ lý thuyết."                                                                                                                                                   |
| 1 (tiếp) · Mở nguồn                           | Bấm nguồn QĐ 1035 dưới câu trả lời                                                                                                                                                                                                                                                                                                   | Văn bản gốc mở ra đúng trang đã trích dẫn                                                                                                                                                    | [văn bản gốc] "Mỗi câu trả lời kèm nguồn. Mở nguồn để xem văn bản gốc đúng trang đã trích dẫn và đối chiếu con số trong câu trả lời."                                                                                                                                                       |
| 2 · Hỏi nối tiếp                              | `còn khóa 2024 thì sao`                                                                                                                                                                                                                                                                                                              | 930.000 đồng, vẫn là khối công nghệ, tín chỉ lý thuyết                                                                                                                                       | [câu trả lời] "Câu hỏi nối tiếp chỉ nêu tiêu chí thay đổi (khóa 2024). Hệ thống giữ các tiêu chí còn lại từ câu hỏi trước."                                                                                                                                                                 |
| 3 · Câu hỏi phụ thuộc thông tin của người hỏi | (đoạn chat mới) `ngành của mình phải tích lũy bao nhiêu tín chỉ để tốt nghiệp`                                                                                                                                                                                                                                                       | Hiện câu hỏi bổ sung; các mục do hệ thống tự quyết (các lần chạy thử: "Ngành đào tạo", hoặc "Hệ đào tạo" và "Ngành học"). Chọn từng mục rồi gửi: số tín chỉ của đúng ngành đã chọn, có nguồn | [câu hỏi bổ sung] "Số tín chỉ phải tích lũy khác nhau theo ngành và chương trình đào tạo. Hồ sơ chưa có các thông tin này nên hệ thống hỏi lại thay vì đoán." · [câu trả lời] "Câu trả lời áp dụng đúng lựa chọn của người dùng. Các thông tin này được lưu vào hồ sơ cho các lần hỏi sau." |
| 4 · Thông tin đã có trong hồ sơ               | (đoạn chat mới) `ngành của mình có bao nhiêu tín chỉ thực tập tốt nghiệp`                                                                                                                                                                                                                                                            | Không hiện câu hỏi bổ sung; trả lời theo ngành đã lưu                                                                                                                                        | [câu trả lời] "Thông tin đã có trong hồ sơ nên hệ thống dùng lại, không hỏi lại."                                                                                                                                                                                                           |
| 5 · Không có dữ liệu đúng phạm vi             | (đoạn chat mới) `chương trình đào tạo ngành công nghệ kỹ thuật cơ khí khóa 22: học phần kinh tế chính trị mác - lênin có mã học phần là gì, bao nhiêu tín chỉ` (K21: chuẩn 4203014165, tăng cường 4297013802, đều 2(2,0,4); không dùng Tiếng Anh 1/2 vì CTĐT tăng cường gọi là "Anh văn" và retrieval xếp CTĐT tăng cường lên trước) | Câu mở đầu nói rõ chưa có CTĐT cho khóa 22; sau đó trình bày theo CTĐT khóa đang có, ghi rõ từng khóa                                                                                        | [câu trả lời] "Không có văn bản cho đúng khóa được hỏi (khóa 22), hệ thống nêu rõ điều này trước, rồi mới trình bày thông tin của các khóa đang có, ghi rõ từng khóa."                                                                                                                      |

Outro: "Hiểu câu hỏi viết tự nhiên · Mỗi câu trả lời kèm nguồn, mở được văn bản gốc · Giữ ngữ cảnh khi hỏi nối tiếp · Thiếu thông tin thì hỏi lại, thông tin đã chọn được ghi nhớ · Nói rõ khi dữ liệu không đúng phạm vi được hỏi."

**Bỏ so với bản 1:** khách hỏi, nút Dừng, lịch sử, tìm kiếm, xóa đoạn chat, tình huống đổi thêm khối ngành, câu hỏi hai ý hai nguồn, giải thích nhãn "(Đề xuất)", nút Huỷ câu hỏi, tình huống chọn chương trình đào tạo. Lần chạy thử 24/11, tình huống chọn chương trình bị bỏ vì: chọn "chương trình chuẩn" cho Tiếng Anh 2 cơ khí K21 nhưng câu trả lời lại lấy từ CTĐT tăng cường tiếng Anh và nói về một học phần khác. Câu học phí "của mình" cũng không còn kích hoạt hỏi lại, vì Quy định đăng ký học phần 2026–2027 có một mức học phí chung.

**Lưu ý khi quay:** việc hỏi lại do LLM quyết định nên không ổn định. Có lần chạy hệ thống trả lời luôn (liệt kê theo từng ngành). Nếu không hiện câu hỏi bổ sung thì đặt lại hồ sơ của `TST-CNPM-L1` và quay lại.

---

## Video 2: Phân quyền tài liệu

**Mục tiêu:** cùng một câu hỏi, mỗi tài khoản nhận kết quả khác nhau theo 2 điều kiện: **đúng phòng ban** của tài liệu và **cấp truy cập lớn hơn hoặc bằng** cấp tối thiểu của tài liệu. Khi không có quyền, hệ thống không dùng và không để lộ nội dung tài liệu.

Mở đầu bằng khung chữ nêu quy tắc: "Tài liệu công khai: mọi người dùng. Tài liệu nội bộ: đúng phòng ban **và** cấp truy cập ≥ cấp tối thiểu của tài liệu (0–5)."

Hai câu hỏi dùng xuyên suốt:

- **Q-seminar** (A0, BM CNPM, cấp 0): `seminar bo mon cnpm nam 26-27 to chuc luc may gio, phong nao vay`. Đáp án: chiều thứ Năm tuần 2 và tuần 4, 14h00–16h30, phòng H5.0214.
- **Q-khóa luận** (A2, BM CNPM, cấp 2): `khi điểm gvhd và điểm phản biện khóa luận ktpm lệch nhau nhiều thì bộ môn cnpm xử lý ra sao`. Đáp án: chênh từ 2,5 điểm trở lên thì Trưởng Bộ môn chỉ định phản biện thứ hai chấm độc lập. (Từ 25/11 không dùng câu trọng số 20/30/50: văn bản công khai "Kế hoạch KLTN khóa 18 ngành QTDL" có cùng trọng số, nên câu đó không minh họa được việc bị chặn.)

| Tình huống                    | Tài khoản     | Câu hỏi                                                         | Kết quả cần thấy                                           | Tooltip [neo: câu trả lời]                                                                                              |
| ----------------------------- | ------------- | --------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1 · Khách hỏi tài liệu nội bộ | Khách         | Q-seminar                                                       | Báo chưa có thông tin, **không** nêu giờ hay phòng         | "Lịch seminar là tài liệu nội bộ của BM Công nghệ Phần mềm. Khách không có quyền nên hệ thống không dùng tài liệu này." |
| 2 · Đúng bộ môn, đủ cấp       | `TST-CNPM-L0` | Q-seminar                                                       | Đúng giờ, phòng H5.0214, nguồn A0                          | "Cùng bộ môn; cấp của tài khoản (0) ≥ cấp tối thiểu của tài liệu (0) nên tài liệu được dùng."                           |
| 3 · Đúng bộ môn, chưa đủ cấp  | `TST-CNPM-L0` | Q-khóa luận                                                     | Báo chưa có thông tin, **không** nêu quy tắc 2,5 điểm      | "Quy chế chấm khóa luận yêu cầu cấp 2. Tài khoản cấp 0 chưa đủ điều kiện dù cùng bộ môn."                               |
| 4 · Đủ cấp                    | `TST-CNPM-L2` | Q-khóa luận                                                     | Chênh từ 2,5 điểm thì chỉ định phản biện thứ hai, nguồn A2 | "Cấp 2 xem được tài liệu cấp 0, 1, 2 của bộ môn mình."                                                                  |
| 5 · Cấp cao nhất, khác bộ môn | `TST-KT-L5`   | Q-seminar                                                       | Báo chưa có thông tin                                      | "Cấp 5 là cấp cao nhất nhưng thuộc BM Kế toán. Khác phòng ban thì không xem được tài liệu nội bộ của BM CNPM."          |
| 6 · Tài liệu của chính đơn vị | `TST-KT-L5`   | `gv moi bm ke toan phai duoc du gio it nhat may tiet nam 26-27` | Tối thiểu 7 tiết, nguồn B0                                 | "Tài liệu của chính BM Kế toán thì tài khoản này xem được."                                                             |

Mỗi tình huống dùng một đoạn chat mới. Đổi tài khoản bằng đăng xuất/đăng nhập, không cần tooltip cho thao tác đăng nhập.

Khung tổng kết (bảng kết quả):

|                             | Khách | CNPM cấp 0 | CNPM cấp 2 | Kế toán cấp 5 |
| --------------------------- | ----- | ---------- | ---------- | ------------- |
| Seminar CNPM (cấp 0)        | ✗     | ✓          | ✓          | ✗             |
| Chấm khóa luận CNPM (cấp 2) | ✗     | ✗          | ✓          | ✗             |
| Dự giờ Kế toán (cấp 0)      | ✗     | ✗          | ✗          | ✓             |

Outro: "Nội bộ = đúng phòng ban và đủ cấp · Không có quyền thì nội dung không được dùng, không bị lộ."

**Bỏ so với bản 1:** trang hồ sơ cá nhân, cảnh chia sẻ, cảnh góc quản trị (chuyển sang video 4 và 6).

---

## Video 3: Yêu cầu hỗ trợ (gửi và xử lý)

**Mục tiêu:** trọn một luồng hỗ trợ: người dùng báo câu trả lời chưa đáp ứng ngay từ câu trả lời; cán bộ xem đủ ngữ cảnh, xác định nguyên nhân và phản hồi; người gửi nhận được phản hồi.

**Phần 1 · Người dùng gửi yêu cầu** (`TST-CNPM-L0`)

1. **Tình huống 1 · Không nhận được thông tin cần thiết.** Hỏi Q-khóa luận (video 2). Hệ thống báo chưa có thông tin.
2. Báo cáo câu trả lời: chọn loại vấn đề, mô tả "Cần trọng số điểm khóa luận để hướng dẫn sinh viên", gửi.
   - Tooltip [hộp thoại]: "Câu hỏi và câu trả lời được đính kèm tự động, nên cán bộ xử lý có đủ ngữ cảnh mà người dùng không phải chép lại."
   - Yêu cầu ở trạng thái "Chờ xử lý" trong danh sách yêu cầu của người dùng.

**Phần 2 · Cán bộ xử lý** (`SA-001`) 3. **Tình huống 2 · Xác định nguyên nhân.** Mở yêu cầu vừa gửi.

- Tooltip [nội dung báo cáo]: "Yêu cầu có sẵn câu hỏi, câu trả lời và mô tả của người dùng."
- Tooltip [các đoạn đã dùng]: "Danh sách đoạn tài liệu hệ thống đã dùng không có quy chế chấm khóa luận: tài liệu này nằm ngoài phạm vi quyền của tài khoản. Nguyên nhân là cấp truy cập, không phải lỗi trả lời."

4. **Tình huống 3 · Phản hồi.** Chuyển trạng thái "Đã giải quyết", phản hồi: "Quy chế chấm khóa luận áp dụng cho giảng viên cấp 2 trở lên. Đề nghị liên hệ Trưởng Bộ môn để được cấp quyền." Lưu.
   - Tooltip [phản hồi]: "Chuyển sang Đã giải quyết bắt buộc kèm phản hồi cho người gửi."

**Phần 3 · Người gửi nhận phản hồi** (`TST-CNPM-L0`) 5. **Tình huống 4.** Mở lại yêu cầu: trạng thái "Đã giải quyết" và nội dung phản hồi.

- Tooltip [phản hồi]: "Người gửi xem được trạng thái và phản hồi của cán bộ ngay trong yêu cầu của mình."

Outro: "Gửi yêu cầu từ ngay câu trả lời, ngữ cảnh đính kèm tự động · Cán bộ xác định nguyên nhân từ các đoạn đã dùng · Phản hồi tới đúng người gửi."

---

## Video 4: Người dùng và vai trò

**Mục tiêu:** quản trị viên tạo tài khoản và gán vai trò, phòng ban, cấp truy cập; phạm vi tài liệu của tài khoản thay đổi đúng theo những gì được gán.

Tài khoản demo có hậu tố theo giờ chạy (ví dụ `DEMO-GV-1143`), vì người dùng chỉ vô hiệu hóa được, không xóa được, nên mã không dùng lại được giữa các lần quay. Script lưu tài khoản này vào `output/demo/.demo-state.json` để video 7 dùng lại.

1. **Tình huống 1 · Tạo tài khoản giảng viên mới.** `SA-001` tạo `DEMO-GV-<giờ>`: vai trò USER, BM Công nghệ Phần mềm, **cấp 1** (khoa cha được hệ thống tự thêm).
   - Tooltip [phần phòng ban]: "Vai trò quyết định chức năng được sử dụng. Phòng ban và cấp truy cập quyết định tài liệu nội bộ nào được dùng để trả lời. Tài khoản này: BM Công nghệ Phần mềm, cấp 1."
2. **Tình huống 2 · Phạm vi của tài khoản mới.** Đăng nhập tài khoản mới:
   - Hỏi `hạn chót nộp đơn đổi giảng viên hướng dẫn tốt nghiệp ktpm học kỳ này là ngày nào, dùng mẫu nào` (A1, cấp 1). Kết quả: ngày 06/11/2026, Mẫu TN-KTPM-05. (Không dùng câu "giảng viên tiến sĩ…" vì bot lưu "học vị: Tiến sĩ" vào hồ sơ người hỏi và nói ra trong câu trả lời.)
   - Tooltip: "Hướng dẫn phân công GVHD là tài liệu cấp 1 của bộ môn: tài khoản cấp 1 đọc được."
   - Hỏi `khi điểm gvhd và điểm phản biện khóa luận ktpm lệch nhau nhiều thì bộ môn cnpm xử lý ra sao` (chỉ có trong A2, cấp 2). Kết quả: chưa có thông tin. Không dùng Q-khóa luận ở đây: văn bản công khai "Kế hoạch khóa luận khóa 18 ngành QTDL" cũng có trọng số 20/30/50 và bot trình bày như của KTPM.
   - Tooltip: "Quy chế chấm khóa luận yêu cầu cấp 2: tài khoản mới chưa đọc được. Phạm vi tài liệu có hiệu lực ngay khi tài khoản được tạo."
3. **Tình huống 3 · Nâng cấp truy cập.** `SA-001` sửa tài khoản, đổi lên **cấp 2**.
   - Tooltip [quyền truy cập phòng ban trên trang chi tiết]: "Tài khoản được nâng lên cấp 2 tại BM Công nghệ Phần mềm."
   - Tài khoản demo đăng nhập lại, hỏi lại câu điểm chênh lệch. Kết quả: chênh từ 2,5 điểm trở lên thì Trưởng Bộ môn chỉ định phản biện thứ hai, nguồn A2.
   - Tooltip: "Sau khi được nâng lên cấp 2, cùng câu hỏi đã nhận được câu trả lời. Thay đổi quyền có hiệu lực từ lần đăng nhập tiếp theo."

Outro: "Vai trò quyết định chức năng · Phòng ban và cấp quyết định phạm vi tài liệu · Thay đổi quyền có hiệu lực từ lần đăng nhập tiếp theo."

**Bỏ so với bản trước:** tình huống gán vai trò INGEST_ADMIN (tùy chọn). Vai trò được minh họa ở video 7 (gán vai trò mang gói hạn mức).

**Lỗi app gặp khi quay (25/11):** để trống "Số điện thoại" khi tạo người dùng bị backend từ chối với lỗi "Số điện thoại này đã được sử dụng!" (mã 2116), có lẽ vì chuỗi rỗng trùng với tài khoản khác cũng không có số điện thoại. Script điền một số điện thoại riêng cho mỗi lần chạy.

---

## Video 5: Phòng ban

**Mục tiêu:** cơ cấu đơn vị nhiều cấp (Trường, khoa, bộ môn) là cơ sở để gán tài liệu và người dùng.

1. **Tình huống 1 · Cơ cấu tổ chức.** `SA-001` mở sơ đồ tổ chức, chỉ vào nhánh Khoa Công nghệ Thông tin → BM Công nghệ Phần mềm.
   - Tooltip [sơ đồ]: "Mỗi tài liệu nội bộ và mỗi quyền của người dùng đều gắn với một đơn vị trong cơ cấu này."
2. **Tình huống 2 · Thêm đơn vị mới.** Thêm "Bộ môn Khoa học Dữ liệu (demo)" trực thuộc Khoa Công nghệ Thông tin.
   - Tooltip [đơn vị mới]: "Đơn vị mới dùng được ngay khi gán tài liệu và gán quyền cho người dùng."
3. Xóa đơn vị demo.

Outro: "Cơ cấu đơn vị nhiều cấp · Tài liệu và quyền của người dùng gắn với đơn vị trong cơ cấu."

Theo quyết định 24/11 (hướng b), video không nói về quan hệ quyền giữa đơn vị cấp trên và cấp dưới.

---

## Video 6: Nạp tài liệu (ingest–chunking)

**Mục tiêu:** chứng minh vòng đời của một tài liệu: trước khi nạp, hệ thống chưa trả lời được; sau khi nạp (chia đoạn, embedding), câu hỏi được trả lời kèm nguồn, và chỉ đúng người có quyền mới nhận được.

Tài liệu: **D1** `docs/demo/tai-lieu-demo/D1_quy-dinh-phong-thuc-hanh-may-chu-gpu-bm-cnpm-2026-2027.pdf`. Đây là tài liệu demo riêng: 2 trang, có 2 bảng (phòng thực hành, hạn mức GPU), nội dung tự đặt nên không có trên web và không có trong Qdrant (đã kiểm tra 24/11). Nguồn của tệp: `D1.json`, tạo bằng `unisage-gateway/dataset/access-control/tools/render_pdf.py`. Câu hỏi **Q-GPU**: `nhóm khóa luận được dùng tối đa bao nhiêu giờ GPU mỗi tháng trên máy chủ của bộ môn cnpm`. Đáp án: 36 giờ GPU mỗi tháng, tối đa 01 GPU và 12 giờ mỗi tác vụ.

Người hỏi trước và sau khi nạp là `TST-CNPM-L3` (BM CNPM, cấp 3), không phải `SA-001`: sau khi embed, retrieval cache chỉ được vô hiệu hóa theo phòng ban, còn khóa cache của `SA-001` (phạm vi `*`) vẫn trả kết quả "chưa có thông tin" cũ (lỗi phát hiện 25/11).

1. **Tình huống 1 · Trước khi nạp.** `TST-CNPM-L3` hỏi Q-GPU. Kết quả: chưa có thông tin.
   - Tooltip [câu trả lời]: "Văn bản chưa được nạp nên hệ thống không có dữ liệu để trả lời."
2. **Tình huống 2 · Nạp tài liệu.** Tải lên D1, đặt phòng ban BM Công nghệ Phần mềm, cấp tối thiểu 3, không công khai.
   - Tooltip [phân loại]: "Phòng ban và cấp tối thiểu được gắn vào từng đoạn khi nạp, nên quy tắc phân quyền áp dụng ngay khi tài liệu được dùng để trả lời."
3. **Chia đoạn.** Giữ chiến lược mặc định, áp dụng, mở đoạn chứa bảng hạn mức GPU.
   - Tooltip [đoạn chứa bảng]: "Tài liệu được chia thành các đoạn để tìm kiếm. Bảng được giữ nguyên hàng và cột, để số liệu trong bảng không bị tách rời khỏi tiêu đề cột."
4. **Tình huống · Chỉnh sửa đoạn trước khi nạp.** Trong danh sách đoạn có một đoạn quá ngắn. D1 cố ý có mục "IV. Hiệu lực" chỉ một câu, nhiều khả năng thành một đoạn riêng; xác định đúng đoạn sau khi chia.
   - Mở đoạn phía trên, chép nội dung đoạn ngắn nối vào cuối, lưu.
   - Xóa đoạn ngắn vừa được gộp.
   - Tooltip [đoạn đã gộp]: "Đoạn quá ngắn thiếu ngữ cảnh nên khó được tìm thấy đúng. Người nạp gộp nó vào đoạn liền trên rồi xóa đoạn thừa, trước khi embedding."
5. **Embedding.** Bắt đầu và chờ tới khi hoàn tất (tua nhanh phần chờ).
   - Tooltip [tiến độ]: "Mỗi đoạn được chuyển thành vector để tìm theo ngữ nghĩa, kèm tóm tắt và câu hỏi gợi ý do hệ thống tạo."
6. **Tình huống 3 · Sau khi nạp.** `TST-CNPM-L3` hỏi lại Q-GPU. Kết quả: 36 giờ GPU mỗi tháng, nguồn D1.
   - Tooltip [câu trả lời]: "Cùng câu hỏi, sau khi nạp hệ thống trả lời được và trích dẫn đúng văn bản vừa nạp."
7. **Tình huống 4 · Phân quyền áp dụng ngay.** `TST-CNPM-L2` hỏi Q-GPU. Kết quả: chưa có thông tin, **không** nêu 36 giờ.
   - Tooltip [câu trả lời]: "Tài liệu yêu cầu cấp 3. Tài khoản cấp 2 của cùng bộ môn chưa đủ điều kiện."

Outro: "Tải lên và đặt quyền · Chia đoạn giữ nguyên bảng, chỉnh sửa đoạn trước khi nạp · Embedding · Trả lời được ngay, đúng phạm vi quyền."

**Bỏ so với bản 1:** giải thích từng chiến lược chia đoạn, thay tệp và trạng thái Lỗi thời, hàng đợi.

---

## Video 7: Gói hạn mức

**Mục tiêu:** mỗi vai trò có một gói hạn mức token theo 24 giờ và 7 ngày; khi dùng hết, yêu cầu mới bị tạm chặn và người dùng biết khi nào được dùng lại.

**Chuẩn bị ngoài video:** script tạo qua API vai trò `GIANG_VIEN_DEMO_<giờ>` có đúng 9 quyền của vai trò USER, để chỉ khác USER ở gói hạn mức. Không gán gói nhỏ vào vai trò USER, vì sẽ ảnh hưởng mọi tài khoản thường.

1. **Tình huống 1 · Tạo gói và gán cho vai trò.** `SA-001` tạo gói "Demo hạn mức <giờ>" với Token / 24 giờ = 500 (đặt qua biến `DEMO_DAILY_TOKENS`; đo ngày 24/11: mỗi câu hỏi tốn vài trăm token theo cách tính hạn mức), để trống 7 ngày.
   - Tooltip [hạn mức của gói]: "Mỗi gói quy định số token được dùng trong 24 giờ và 7 ngày; để trống là không giới hạn. Gói demo đặt hạn mức rất nhỏ để thấy ngay kết quả."
   - Sửa vai trò demo, chọn "Gói hạn mức" là gói vừa tạo. Tooltip: "Hạn mức được gán theo vai trò. Gói Mặc định áp dụng cho khách và các vai trò chưa được gán gói."
   - Sửa tài khoản demo của video 4, đổi vai trò sang vai trò demo. Tooltip: "Tài khoản … được gán vai trò …, nên dùng gói …"
2. **Tình huống 2 · Hỏi đến khi hết hạn mức.** Tài khoản demo hỏi lần lượt các câu demo (mỗi câu một đoạn chat mới) cho tới khi bị chặn.
   - Khi cảnh báo "Sắp hết hạn mức sử dụng" xuất hiện: tooltip "Khi đã dùng từ 80% hạn mức, người dùng được cảnh báo trước." (Nếu một câu đã vượt thẳng hạn mức thì có thể không thấy cảnh báo.)
   - Khi bị chặn ("Bạn đã dùng hết hạn mức 24 giờ. Có thể hỏi tiếp sau …"): tooltip "Khi hết hạn mức, yêu cầu mới bị tạm chặn. Hệ thống cho biết thời điểm hạn mức được làm mới."
3. **Tình huống 3 · Theo dõi phía quản trị.** `SA-001` mở chi tiết tài khoản demo, mục "Hạn mức sử dụng".
   - Tooltip: "Quản trị viên theo dõi mức sử dụng của từng người dùng và thời điểm hạn mức được làm mới."

Outro: "Hạn mức theo 24 giờ và 7 ngày, gán theo vai trò · Cảnh báo khi đã dùng 80%; tạm chặn khi hết, kèm thời điểm làm mới · Quản trị viên theo dõi mức sử dụng."

**Dọn dẹp sau khi quay** (ngoài video): vô hiệu hóa tài khoản demo, vai trò demo, đơn vị demo của video 5; gói hạn mức demo chỉ xóa được sau khi gỡ khỏi vai trò.

---

## Cần chốt trước khi quay

1. ~~Video 6 dùng A3~~ **Đã chốt 24/11:** dùng tài liệu demo riêng D1 (2 trang, không có trong Qdrant, không tìm được trên web). Sau khi quay, D1 sẽ nằm trong collection eval; xóa D1 khỏi hệ thống nếu không muốn giữ.
2. **Video 5, quyền không kế thừa.** Đã chốt 24/11: không nhắc trong video (hướng b). Hành vi hiện tại: token chỉ chứa phòng ban được gán trực tiếp (`AuthServiceImpl.buildDepartmentAccessClaim`), bộ lọc so khớp đúng mã phòng ban; tài khoản cấp khoa không tự xem được tài liệu của bộ môn trực thuộc.
3. **Video 4 và 7 tạo dữ liệu demo** (`DEMO-GV-01`, vai trò `DEMO_HAN_MUC`, gói "Demo hạn mức", đơn vị demo ở video 5). Tất cả được dọn sau khi quay.
4. **Tài liệu P2** (Quy định đánh giá kết quả rèn luyện 2026) đang được nạp ở chế độ **nội bộ, cấp 3**, trong khi `catalog.json` ghi là công khai. Không ảnh hưởng kịch bản này, nhưng sẽ làm lệch eval phân quyền.

## Chuẩn bị ngay trước khi quay

- **Làm ấm cache:** chạy `node docs/demo/warmup.mjs` trong vòng 6 giờ trước khi quay. Script hỏi mỗi câu demo hai lần cho từng tài khoản, không quay video. Retrieval cache của agent chỉ ghi kết quả từ lần thấy thứ hai và giữ 6 giờ. Web search đang tắt (`CHAT_WEB_SEARCH_ENABLED=false`) nên không có cache web để làm ấm. Danh sách câu hỏi dùng chung nằm ở `docs/demo/lib/questions.mjs`.
- **Đặt lại hồ sơ học vụ** (bảng `user_profiles` trong DB của agent) của `TST-CNPM-L1` trước video 1. Đặt lại cả hồ sơ của `TST-CNPM-L0` nếu đã từng hỏi câu có nêu khóa, ngành: hệ thống lưu các thông tin này vào hồ sơ.

## Cần chạy thử trước khi quay

- Video 1, tình huống 5 (câu khóa 22): đã thử đạt (24/11). Hai câu K18 trước đó không dùng được: câu kế hoạch khóa luận ngành công nghệ thực phẩm chỉ nhận lời từ chối; câu CTĐT cơ khí K18 thì nay đã có văn bản đúng khóa 18.
- Video 1, tình huống 3: câu hỏi phải kích hoạt câu hỏi bổ sung (không ổn định, xem lưu ý của video 1).
- Video 4: xác nhận thay đổi cấp có hiệu lực sau khi đăng nhập lại (JWT mang `department_access`).
- Video 7: chọn giá trị hạn mức sao cho câu đầu qua được và câu thứ hai bị chặn.
- Các câu "bị chặn" ở video 2, 3, 4, 6 không được lộ số liệu.
- Video 6: xác định trước đoạn quá ngắn trong D1 để gộp (xem bản đồ đoạn sau khi chia).
- Chạy các script quay qua `xvfb-run -a -s "-screen 0 1440x900x24" node docs/demo/record-….mjs output/demo`: chế độ headless không hiển thị được PDF trong ngăn văn bản gốc.
- Quay trực tiếp trên `http://localhost:5173`, không đi qua tunnel (cloudflared, VS Code port forwarding), để không xuất hiện trang xác nhận của tunnel hay GitHub. Script dừng cảnh nếu trang rời khỏi localhost.
