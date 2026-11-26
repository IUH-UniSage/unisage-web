# Lời thoại lồng tiếng: video demo tổng hợp UniSage

Video: `output/demo/unisage-demo-day-du.mp4` (hình: `unisage-demo-hinh-v2.mp4`), dài **18:53**, gồm slide "Nội dung video", 8 phần nối liền và một slide tổng quan ở đầu mỗi phần 1–7: video 0–6 không có thẻ kết, video 7 giữ thẻ "Tóm tắt".

Cách dùng:

- **Mốc thời gian** tính trên video ghép, lệch khoảng ±1 giây. Mỗi mốc là lúc một thẻ, nhãn tình huống, khung chú thích hay tooltip xuất hiện, nên có thể căn theo hình.
- **Tốc độ đọc:** mỗi câu được viết vừa khung, khoảng 3 từ/giây. Lời thoại theo giọng kể tự nhiên; mỗi lần đổi tài khoản đều nói rõ bộ môn, cấp truy cập và điều sắp thử.
- **Tên trên màn hình:** tên tài khoản và tên bộ môn được đọc đúng như trên màn hình. Mã gói và mã vai trò demo (`Demo hạn mức 1220`, `GIANG_VIEN_DEMO_1220`) không cần đọc.
- **Chữ in nghiêng:** chỉ mô tả hình đang hiện để tiện căn, không đọc.
- **⏸:** dừng 0,5 giây giữa hai ý trong cùng một dòng. Trước slide mở đầu mỗi phần luôn có ít nhất 0,6 giây im lặng.

---

## Slide mở đầu từng phần

Đầu mỗi phần (1–7) là một slide tổng quan thay cho thẻ tiêu đề cũ: số phần, tên phần, các tình huống và tài khoản dùng cho từng tình huống. Lời thoại nói phần có bao nhiêu tình huống, dừng 2 giây để người xem đọc bảng, rồi "Đi vào tình huống một: …". Ảnh: `docs/demo/lib/slide-phan-<n>.png`.

### Phần 1 · Hỏi đáp

_Hiểu câu hỏi tự nhiên, dẫn nguồn, hỏi lại khi thiếu thông tin_

| #   | Tình huống                                         | Tài khoản                        |
| --- | -------------------------------------------------- | -------------------------------- |
| 1   | Câu hỏi viết tắt, không dấu; mở nguồn để đối chiếu | GV BM Công nghệ Phần mềm · cấp 0 |
| 2   | Hỏi tiếp trong cùng đoạn chat                      | GV BM Công nghệ Phần mềm · cấp 0 |
| 3   | Chatbot hỏi lại khi thiếu thông tin                | GV BM Công nghệ Phần mềm · cấp 0 |
| 4   | Dùng lại thông tin đã có trong hồ sơ               | GV BM Công nghệ Phần mềm · cấp 0 |
| 5   | Không có dữ liệu cho đúng khóa được hỏi            | GV BM Công nghệ Phần mềm · cấp 0 |

### Phần 2 · Phân quyền tài liệu

_Cùng một câu hỏi, mỗi tài khoản nhận kết quả theo quyền của mình_

| #   | Tình huống                     | Tài khoản                        |
| --- | ------------------------------ | -------------------------------- |
| 1   | Khách hỏi về tài liệu nội bộ   | Khách · chưa đăng nhập           |
| 2   | Đúng bộ môn, đủ cấp            | GV BM Công nghệ Phần mềm · cấp 0 |
| 3   | Đúng bộ môn, chưa đủ cấp       | GV BM Công nghệ Phần mềm · cấp 0 |
| 4   | Đủ cấp                         | GV BM Công nghệ Phần mềm · cấp 2 |
| 5   | Cấp cao nhất nhưng khác bộ môn | GV BM Kế toán · cấp 5            |
| 6   | Tài liệu của chính đơn vị      | GV BM Kế toán · cấp 5            |

### Phần 3 · Yêu cầu hỗ trợ

_Từ câu trả lời chưa đáp ứng đến phản hồi của cán bộ_

| #   | Tình huống                                 | Tài khoản                        |
| --- | ------------------------------------------ | -------------------------------- |
| 1   | Người dùng gửi yêu cầu từ ngay câu trả lời | GV BM Công nghệ Phần mềm · cấp 0 |
| 2   | Cán bộ xác định nguyên nhân và phản hồi    | Quản trị viên                    |
| 3   | Người gửi nhận phản hồi                    | GV BM Công nghệ Phần mềm · cấp 0 |

### Phần 4 · Người dùng và vai trò

_Tạo tài khoản và gán quyền; quyền mới có hiệu lực ngay_

| #   | Tình huống                                                 | Tài khoản                             |
| --- | ---------------------------------------------------------- | ------------------------------------- |
| 1   | Tạo tài khoản giảng viên mới: BM Công nghệ Phần mềm, cấp 1 | Quản trị viên                         |
| 2   | Phạm vi tài liệu của tài khoản mới                         | Tài khoản mới · cấp 1                 |
| 3   | Nâng cấp truy cập lên cấp 2 rồi hỏi lại                    | Quản trị viên → tài khoản mới · cấp 2 |

### Phần 5 · Phòng ban

_Cơ cấu đơn vị là cơ sở để gán tài liệu và người dùng_

| #   | Tình huống                                   | Tài khoản     |
| --- | -------------------------------------------- | ------------- |
| 1   | Xem cơ cấu tổ chức: Trường, khoa, bộ môn     | Quản trị viên |
| 2   | Thêm bộ môn mới vào Khoa Công nghệ Thông tin | Quản trị viên |

### Phần 6 · Nạp tài liệu

_Trước và sau khi nạp; phân quyền áp dụng ngay_

| #   | Tình huống                                 | Tài khoản                        |
| --- | ------------------------------------------ | -------------------------------- |
| 1   | Hỏi trước khi nạp tài liệu                 | GV BM Công nghệ Phần mềm · cấp 3 |
| 2   | Tải lên, đặt phạm vi, chia đoạn, embedding | Quản trị viên                    |
| 3   | Hỏi lại sau khi nạp                        | GV BM Công nghệ Phần mềm · cấp 3 |
| 4   | Tài khoản chưa đủ cấp hỏi cùng câu         | GV BM Công nghệ Phần mềm · cấp 2 |

### Phần 7 · Gói hạn mức

_Giới hạn lượng sử dụng theo vai trò_

| #   | Tình huống                         | Tài khoản                        |
| --- | ---------------------------------- | -------------------------------- |
| 1   | Tạo gói hạn mức và gán cho vai trò | Quản trị viên                    |
| 2   | Hỏi đến khi hết hạn mức            | Giảng viên dùng gói demo · cấp 2 |
| 3   | Theo dõi mức sử dụng               | Quản trị viên                    |

---

## Phần 0 · Giới thiệu (0:00 – 0:57)

Sau thẻ mở đầu là slide "Nội dung video" (0:05 – 0:21):

> **Nội dung video**
>
> **Giới thiệu chung**: cách chatbot trả lời và hệ thống phân quyền
>
> _Dành cho người dùng_
>
> 1. **Hỏi đáp**: hỏi tự nhiên, xem nguồn, hỏi tiếp trong đoạn chat, chatbot hỏi lại khi thiếu thông tin
> 2. **Phân quyền tài liệu**: cùng một câu hỏi, mỗi tài khoản nhận kết quả theo quyền của mình
> 3. **Yêu cầu hỗ trợ**: gửi yêu cầu, cán bộ xử lý và phản hồi
>
> _Dành cho quản trị viên_ 4. **Người dùng và vai trò**: tạo tài khoản, gán phòng ban và cấp truy cập 5. **Phòng ban**: cơ cấu đơn vị, thêm bộ môn mới 6. **Nạp tài liệu**: tải lên, chia đoạn, đặt phạm vi truy cập 7. **Gói hạn mức**: giới hạn lượng sử dụng theo vai trò

| Thời điểm   | Trên màn hình                                                 | Lời thoại                                                                                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00 – 0:05 | _Thẻ "UniSage – Trợ lý học vụ"_                               | Hôm nay em xin giới thiệu chatbot UniSage, trợ lý học vụ của Trường.                                                                                                                                                                                               |
| 0:05 – 0:21 | _Slide "Nội dung video" (`docs/demo/lib/slide-noi-dung.png`)_ | Video gồm bảy phần: ba phần cho người dùng là hỏi đáp, phân quyền tài liệu và yêu cầu hỗ trợ; bốn phần cho quản trị viên là người dùng và vai trò, phòng ban, nạp tài liệu và gói hạn mức. ⏸ Trước tiên, chúng ta xem qua cách chatbot trả lời và cách phân quyền. |
| 0:21 – 0:28 | _Khách gõ câu hỏi về học bổng, viết tắt, không dấu_           | Người dùng có thể hỏi như nhắn tin thường ngày, viết tắt hay không dấu đều được. Ví dụ, một câu hỏi về học bổng.                                                                                                                                                   |
| 0:28 – 0:37 | _Câu trả lời hiện ra; tooltip "Bước 1/1"_                     | Chatbot tìm đúng quy định học bổng và trả lời: điểm học kỳ từ 3,30, điểm rèn luyện từ 80 trở lên.                                                                                                                                                                  |
| 0:37 – 0:43 | _Thẻ "Nguyên tắc trả lời"_                                    | Chatbot chỉ trả lời từ văn bản của Trường, và câu nào cũng ghi rõ nguồn.                                                                                                                                                                                           |
| 0:43 – 0:57 | _Thẻ sơ đồ "Hệ thống phân quyền"_                             | Mỗi người được xem những tài liệu nào là do phân quyền. Vai trò quyết định người dùng được dùng những chức năng gì. Còn phòng ban và cấp truy cập quyết định chatbot được đọc những tài liệu nội bộ nào để trả lời.                                                |

## Phần 1 · Hỏi đáp (0:57 – 3:08)

| Thời điểm   | Trên màn hình                                                                                               | Lời thoại                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 0:57 – 1:03 | _Slide "Phần 1 / 7 · Hỏi đáp" (`docs/demo/lib/slide-phan-1.png`)_; sau câu này dừng 2 giây để người xem đọc | Bắt đầu với phần một: hỏi đáp, gồm năm tình huống.                                                                              |
| 1:03 – 1:07 | _Slide (tiếp)_                                                                                              | Đi vào tình huống một: câu hỏi viết tắt, không dấu.                                                                             |
| 1:07 – 1:10 | _Thẻ "Hỏi đáp"; đăng nhập TST-CNPM-L0_                                                                      | Đăng nhập bằng giảng viên Công nghệ Phần mềm, cấp 0.                                                                            |
| 1:10 – 1:23 | _Tình huống 1: gõ "hp dai hoc chinh quy khoa 2025…"_                                                        | Câu đầu tiên được gõ rất tắt, không dấu: học phí đại học chính quy, khóa 2025, khối công nghệ, một tín chỉ lý thuyết bao nhiêu. |
| 1:23 – 1:32 | _Câu trả lời 980.000 đồng; tooltip 1/7_                                                                     | Chatbot vẫn hiểu đúng từng ý và trả lời: 980.000 đồng một tín chỉ.                                                              |
| 1:32 – 1:40 | _Mở nguồn: văn bản gốc hiện bên phải; tooltip 2/7_                                                          | Muốn kiểm tra lại, chỉ cần bấm vào nguồn. Văn bản gốc mở ra đúng trang có con số này.                                           |
| 1:40 – 1:48 | _Tình huống 2: gõ "còn khóa 2024 thì sao"_                                                                  | Giờ hỏi tiếp trong cùng đoạn chat, chỉ cần gõ: còn khóa 2024 thì sao?                                                           |
| 1:48 – 1:54 | _Câu trả lời 930.000 đồng; tooltip 3/7_                                                                     | Chatbot hiểu vẫn đang nói về học phí, và trả lời: 930.000 đồng.                                                                 |
| 1:54 – 2:07 | _Tình huống 3: hỏi "ngành của mình phải tích lũy bao nhiêu tín chỉ…"_                                       | Có những câu mà câu trả lời tùy vào người hỏi. Ví dụ: ngành của mình phải tích lũy bao nhiêu tín chỉ để tốt nghiệp?             |
| 2:07 – 2:14 | _Bảng hỏi lại hiện ra; tooltip 4/7_                                                                         | Chatbot chưa biết người dùng học ngành nào, nên hỏi lại thay vì đoán.                                                           |
| 2:14 – 2:21 | _Chọn ngành, gửi; câu trả lời hiện ra_                                                                      | Chọn ngành trong danh sách và gửi đi.                                                                                           |
| 2:21 – 2:28 | _Tooltip 5/7_                                                                                               | Câu trả lời đúng theo ngành vừa chọn, và chatbot ghi nhớ thông tin này cho lần sau.                                             |
| 2:28 – 2:39 | _Tình huống 4: hỏi số tín chỉ thực tập tốt nghiệp_                                                          | Thử ngay một câu khác cũng liên quan đến ngành: ngành của mình có bao nhiêu tín chỉ thực tập tốt nghiệp?                        |
| 2:39 – 2:44 | _Câu trả lời; tooltip 6/7_                                                                                  | Lần này chatbot không hỏi lại nữa, mà trả lời luôn.                                                                             |
| 2:44 – 2:59 | _Tình huống 5: hỏi học phần Kinh tế chính trị Mác – Lênin, ngành cơ khí khóa 22_                            | Cuối cùng, hỏi về một học phần của ngành cơ khí khóa 22. Kho văn bản hiện chưa có chương trình đào tạo của khóa này.            |
| 2:59 – 3:08 | _Câu trả lời liệt kê khóa 21, 18, 16; tooltip 7/7_                                                          | Chatbot nói rõ là chưa có khóa 22, rồi mới đưa thông tin của các khóa trước, ghi rõ từng khóa.                                  |

## Phần 2 · Phân quyền tài liệu (3:08 – 5:41)

| Thời điểm   | Trên màn hình                                                                                                           | Lời thoại                                                                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3:08 – 3:15 | _Slide "Phần 2 / 7 · Phân quyền tài liệu" (`docs/demo/lib/slide-phan-2.png`)_; sau câu này dừng 2 giây để người xem đọc | Xong phần hỏi đáp, chúng ta sang phần hai: phân quyền tài liệu, gồm sáu tình huống.                                                                                               |
| 3:15 – 3:19 | _Slide (tiếp)_                                                                                                          | Đi vào tình huống một: khách hỏi về tài liệu nội bộ.                                                                                                                              |
| 3:19 – 3:31 | _Tình huống 1: khách hỏi lịch seminar Bộ môn CNPM_                                                                      | Trước hết là khách, chưa đăng nhập. Khách hỏi lịch seminar của Bộ môn Công nghệ Phần mềm, một tài liệu nội bộ của bộ môn.                                                         |
| 3:31 – 3:38 | _Trả lời "chưa có thông tin"; tooltip 1/6_                                                                              | Khách không có quyền xem, nên chatbot không dùng tài liệu này để trả lời.                                                                                                         |
| 3:38 – 3:55 | _Tình huống 2: TST-CNPM-L0, cấp 0, hỏi lại_                                                                             | Bây giờ đăng nhập bằng một giảng viên của chính bộ môn đó, cấp truy cập 0. Tài liệu seminar chỉ yêu cầu cấp 0, nên tài khoản này đủ điều kiện. Chúng ta hỏi lại đúng câu lúc nãy. |
| 3:55 – 4:01 | _Trả lời: chiều thứ Năm, 14 giờ đến 16 giờ 30, phòng H5.0214; tooltip 2/6_                                              | Lần này có câu trả lời: chiều thứ Năm, tại phòng H5.0214.                                                                                                                         |
| 4:01 – 4:16 | _Tình huống 3: cùng tài khoản cấp 0 hỏi về điểm khóa luận chênh lệch_                                                   | Cũng tài khoản này, thử hỏi một nội dung cần cấp cao hơn: quy chế chấm khóa luận, xử lý thế nào khi điểm hướng dẫn và điểm phản biện lệch nhau.                                   |
| 4:16 – 4:22 | _Trả lời "chưa có thông tin"; tooltip 3/6_                                                                              | Quy chế này yêu cầu cấp 2, nên giảng viên cấp 0 chưa xem được.                                                                                                                    |
| 4:22 – 4:41 | _Tình huống 4: đăng nhập TST-CNPM-L2, cấp 2, hỏi lại_                                                                   | Để so sánh, chúng ta đăng nhập một giảng viên khác cùng bộ môn, nhưng có cấp truy cập 2, và hỏi đúng câu đó.                                                                      |
| 4:41 – 4:48 | _Câu trả lời nêu quy định; tooltip 4/6_                                                                                 | Đủ cấp 2, nên tài khoản này nhận được câu trả lời từ quy chế.                                                                                                                     |
| 4:48 – 5:06 | _Tình huống 5: TST-KT-L5, Bộ môn Kế toán, cấp 5, hỏi lịch seminar CNPM_                                                 | Tiếp theo là một trường hợp khác: tài khoản của Bộ môn Kế toán, có cấp truy cập cao nhất là cấp 5. Tài khoản này hỏi lịch seminar của Bộ môn Công nghệ Phần mềm.                  |
| 5:06 – 5:13 | _Trả lời "chưa có thông tin"; tooltip 5/6_                                                                              | Dù cấp cao nhất, nhưng khác bộ môn thì vẫn không xem được tài liệu nội bộ của bộ môn khác.                                                                                        |
| 5:13 – 5:26 | _Tình huống 6: hỏi quy định dự giờ của Bộ môn Kế toán_                                                                  | Còn khi hỏi về tài liệu của chính Bộ môn Kế toán, ví dụ quy định dự giờ cho giảng viên mới,                                                                                       |
| 5:26 – 5:32 | _Trả lời: tối thiểu 7 tiết; tooltip 6/6_                                                                                | thì tài khoản này trả lời được: tối thiểu 7 tiết.                                                                                                                                 |
| 5:32 – 5:41 | _Bảng "Kết quả theo tài khoản"_                                                                                         | Bảng này tóm tắt lại: mỗi tài khoản chỉ nhận được nội dung trong đúng phạm vi quyền của mình.                                                                                     |

> Bảng "Kết quả theo tài khoản" (5:26–5:35) là thẻ kết của phần 2 được giữ lại vì có nội dung. Nếu muốn bỏ thì báo để ghép lại.

## Phần 3 · Yêu cầu hỗ trợ (5:41 – 7:45)

| Thời điểm   | Trên màn hình                                                                                                      | Lời thoại                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5:41 – 5:47 | _Slide "Phần 3 / 7 · Yêu cầu hỗ trợ" (`docs/demo/lib/slide-phan-3.png`)_; sau câu này dừng 2 giây để người xem đọc | Tiếp theo là phần ba: yêu cầu hỗ trợ, gồm ba tình huống.                                                                                               |
| 5:47 – 5:52 | _Slide (tiếp)_                                                                                                     | Đi vào tình huống một: người dùng gửi yêu cầu ngay từ câu trả lời.                                                                                     |
| 5:52 – 5:55 | _Thẻ "Yêu cầu hỗ trợ"; đăng nhập TST-CNPM-L0_                                                                      | Chúng ta dùng lại tài khoản giảng viên cấp 0 lúc nãy.                                                                                                  |
| 5:55 – 6:08 | _Hỏi về điểm khóa luận lệch nhau; trả lời "chưa có thông tin"_                                                     | Giảng viên này hỏi về cách xử lý điểm khóa luận, nhưng vì chưa đủ cấp nên không nhận được câu trả lời.                                                 |
| 6:08 – 6:23 | _Bấm Báo cáo, chọn loại "AI không trả lời được", nhập mô tả_                                                       | Ngay dưới câu trả lời có nút báo cáo. Giảng viên chọn loại yêu cầu là AI không trả lời được, và ghi thêm vài dòng mô tả.                               |
| 6:23 – 6:35 | _Tooltip 1/5; bấm Gửi yêu cầu_                                                                                     | Câu hỏi và câu trả lời được tự động đính kèm, nên không cần chép lại. Bấm gửi là xong.                                                                 |
| 6:35 – 6:50 | _Đăng nhập SA-001; mở Yêu cầu hỗ trợ; mở yêu cầu mới nhất_                                                         | Bây giờ chuyển sang phía người xử lý. Đăng nhập bằng tài khoản quản trị viên, vào mục Yêu cầu hỗ trợ và mở yêu cầu vừa gửi.                            |
| 6:50 – 6:55 | _Tooltip 2/5: nội dung yêu cầu_                                                                                    | Đầy đủ câu hỏi, câu trả lời và mô tả.                                                                                                                  |
| 6:55 – 7:04 | _Tooltip 3/5: khung "Chunks đã dùng"_                                                                              | Danh sách tài liệu đã dùng không có quy chế chấm khóa luận. Vậy nguyên nhân là cấp truy cập chưa đủ, không phải hệ thống trả lời sai.                  |
| 7:04 – 7:20 | _Đổi trạng thái "Đã giải quyết", viết phản hồi; tooltip 4/5_                                                       | Người xử lý chuyển trạng thái sang Đã giải quyết, và viết phản hồi: quy chế dành cho giảng viên từ cấp 2, cần liên hệ Trưởng bộ môn để được cấp quyền. |
| 7:20 – 7:25 | _Bấm Lưu thay đổi_                                                                                                 | Lưu lại.                                                                                                                                               |
| 7:25 – 7:38 | _Đăng nhập lại TST-CNPM-L0; mở Yêu cầu hỗ trợ của tôi_                                                             | Quay lại tài khoản của giảng viên đã gửi yêu cầu, mở mục Yêu cầu hỗ trợ,                                                                               |
| 7:38 – 7:45 | _Tooltip 5/5: phản hồi của cán bộ_                                                                                 | giảng viên thấy ngay yêu cầu đã được giải quyết, kèm phản hồi của người xử lý.                                                                         |

## Phần 4 · Người dùng và vai trò (7:45 – 10:50)

| Thời điểm     | Trên màn hình                                                                                                             | Lời thoại                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7:45 – 7:54   | _Slide "Phần 4 / 7 · Người dùng và vai trò" (`docs/demo/lib/slide-phan-4.png`)_; sau câu này dừng 2 giây để người xem đọc | Bốn phần tiếp theo dành cho quản trị viên. ⏸ Mở đầu là phần bốn: người dùng và vai trò, gồm ba tình huống.                                                                                             |
| 7:54 – 7:58   | _Slide (tiếp)_                                                                                                            | Đi vào tình huống một: tạo tài khoản giảng viên mới.                                                                                                                                                   |
| 7:58 – 8:09   | _Đăng nhập SA-001; mở Quản lý người dùng; bấm Thêm người dùng_                                                            | Đăng nhập bằng tài khoản quản trị, vào mục Quản lý người dùng và bấm Thêm người dùng.                                                                                                                  |
| 8:09 – 8:24   | _Nhập họ tên, email, số điện thoại, mã đăng nhập, mật khẩu_                                                               | Điền họ tên, email, số điện thoại, rồi đến mã đăng nhập, thường là mã giảng viên, và mật khẩu ban đầu.                                                                                                 |
| 8:24 – 8:30   | _Chọn vai trò USER_                                                                                                       | Chọn vai trò người dùng thông thường, đủ để hỏi đáp và gửi yêu cầu hỗ trợ.                                                                                                                             |
| 8:30 – 8:45   | _Thêm phòng ban: tìm và tích Bộ môn Công nghệ Phần mềm, Cập nhật danh sách_                                               | Tiếp theo là phòng ban. Tìm Bộ môn Công nghệ Phần mềm, đánh dấu chọn, rồi cập nhật danh sách.                                                                                                          |
| 8:45 – 8:50   | _Chọn cấp 1_                                                                                                              | Cấp truy cập tại bộ môn: cấp 1.                                                                                                                                                                        |
| 8:50 – 8:59   | _Tooltip 1/5_                                                                                                             | Như vậy, vai trò quyết định chức năng, còn phòng ban và cấp quyết định tài liệu nào được dùng để trả lời.                                                                                              |
| 8:59 – 9:02   | _Bấm Tạo người dùng_                                                                                                      | Lưu tài khoản.                                                                                                                                                                                         |
| 9:02 – 9:22   | _Đăng nhập tài khoản mới (cấp 1); hỏi hạn chót đổi giảng viên hướng dẫn_                                                  | Giờ đăng nhập bằng tài khoản vừa tạo: giảng viên Bộ môn Công nghệ Phần mềm, cấp 1. Chúng ta thử hai câu hỏi. Câu thứ nhất là hạn chót nộp đơn đổi giảng viên hướng dẫn, nằm trong một hướng dẫn cấp 1. |
| 9:22 – 9:31   | _Câu trả lời: 06/11/2026, mẫu TN-KTPM-05; tooltip 2/5_                                                                    | Tài khoản mới tạo đã đọc được ngay: có cả hạn chót và mẫu đơn.                                                                                                                                         |
| 9:31 – 9:40   | _Hỏi về điểm khóa luận lệch nhau_                                                                                         | Câu thứ hai là về điểm khóa luận, nằm trong quy chế cấp 2.                                                                                                                                             |
| 9:40 – 9:48   | _Trả lời "chưa có thông tin"; tooltip 3/5_                                                                                | Tài khoản cấp 1 chưa đọc được, đúng như phân quyền vừa gán.                                                                                                                                            |
| 9:48 – 10:10  | _Đăng nhập SA-001; tìm tài khoản; Chỉnh sửa_                                                                              | Giờ chúng ta nâng quyền cho giảng viên này. Quay lại tài khoản quản trị, tìm tài khoản vừa tạo và mở phần chỉnh sửa.                                                                                   |
| 10:10 – 10:20 | _Đổi cấp 1 thành cấp 2; Lưu thay đổi_                                                                                     | Đổi cấp truy cập tại Bộ môn Công nghệ Phần mềm từ cấp 1 lên cấp 2, rồi lưu lại.                                                                                                                        |
| 10:20 – 10:24 | _Tooltip 4/5: trang chi tiết tài khoản_                                                                                   | Tài khoản đã lên cấp 2.                                                                                                                                                                                |
| 10:24 – 10:43 | _Đăng nhập lại tài khoản demo; hỏi lại câu điểm khóa luận_                                                                | Giảng viên đăng nhập lại, lần này với cấp 2, và hỏi lại đúng câu về điểm khóa luận lúc nãy.                                                                                                            |
| 10:43 – 10:50 | _Câu trả lời có quy định chênh lệch 2,5 điểm; tooltip 5/5_                                                                | Lần này đã có câu trả lời. Quyền mới có hiệu lực từ lần đăng nhập tiếp theo.                                                                                                                           |

## Phần 5 · Phòng ban (10:50 – 12:05)

| Thời điểm     | Trên màn hình                                                                                                 | Lời thoại                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 10:50 – 10:55 | _Slide "Phần 5 / 7 · Phòng ban" (`docs/demo/lib/slide-phan-5.png`)_; sau câu này dừng 2 giây để người xem đọc | Sang phần năm: phòng ban, gồm hai tình huống.                                                                                           |
| 10:55 – 10:59 | _Slide (tiếp)_                                                                                                | Đi vào tình huống một: xem cơ cấu tổ chức của Trường.                                                                                   |
| 10:59 – 11:03 | _Thẻ "Phòng ban"; đăng nhập SA-001_                                                                           | Chúng ta đăng nhập bằng tài khoản quản trị.                                                                                             |
| 11:03 – 11:12 | _Mở mục Phòng ban: sơ đồ tổ chức_                                                                             | Mở mục Phòng ban, chúng ta thấy sơ đồ tổ chức: Trường, rồi đến khoa, rồi đến bộ môn.                                                    |
| 11:12 – 11:19 | _Tooltip 1/3_                                                                                                 | Mỗi tài liệu nội bộ và mỗi quyền của người dùng đều gắn với một đơn vị ở đây.                                                           |
| 11:19 – 11:35 | _Chuyển sang danh sách; tìm Khoa Công nghệ Thông tin; "Thêm đơn vị trực thuộc"_                               | Giả sử Khoa Công nghệ Thông tin mở thêm một bộ môn. Chúng ta chuyển sang dạng danh sách, tìm đến khoa, rồi chọn Thêm đơn vị trực thuộc. |
| 11:35 – 11:45 | _Nhập mã đơn vị và tên đầy đủ_                                                                                | Nhập mã đơn vị và tên đầy đủ: Bộ môn Khoa học Dữ liệu.                                                                                  |
| 11:45 – 11:50 | _Tooltip 2/3: ô "Trực thuộc"_                                                                                 | Bộ môn mới nằm ngay dưới khoa.                                                                                                          |
| 11:50 – 12:00 | _Bấm Tạo đơn vị; tìm lại đơn vị vừa tạo_                                                                      | Tạo đơn vị, rồi tìm lại để kiểm tra.                                                                                                    |
| 12:00 – 12:05 | _Tooltip 3/3_                                                                                                 | Đơn vị mới đã dùng được ngay.                                                                                                           |

## Phần 6 · Nạp tài liệu (12:05 – 15:20)

| Thời điểm     | Trên màn hình                                                                                                    | Lời thoại                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 12:05 – 12:10 | _Slide "Phần 6 / 7 · Nạp tài liệu" (`docs/demo/lib/slide-phan-6.png`)_; sau câu này dừng 2 giây để người xem đọc | Phần sáu là nạp tài liệu, gồm bốn tình huống.                                                                                             |
| 12:10 – 12:14 | _Slide (tiếp)_                                                                                                   | Đi vào tình huống một: hỏi trước khi nạp tài liệu.                                                                                        |
| 12:15 – 12:30 | _TST-CNPM-L3, cấp 3: hỏi số giờ GPU tối đa của nhóm khóa luận_                                                   | Chúng ta đăng nhập bằng giảng viên Bộ môn Công nghệ Phần mềm, cấp 3, và hỏi: nhóm khóa luận được dùng tối đa bao nhiêu giờ GPU mỗi tháng? |
| 12:30 – 12:37 | _Trả lời "chưa có thông tin"; tooltip 1/8_                                                                       | Quy định này chưa được nạp vào hệ thống, nên chưa có câu trả lời.                                                                         |
| 12:37 – 12:50 | _Đăng nhập SA-001; Quản trị tài liệu; Thêm tài liệu mới_                                                         | Chuyển sang tài khoản quản trị để nạp quy định đó. Vào mục Quản trị tài liệu, bấm Thêm tài liệu mới.                                      |
| 12:50 – 13:00 | _Chọn tệp PDF; nhập tiêu đề_                                                                                     | Chọn tệp PDF và đặt tiêu đề. Tiêu đề này sẽ hiện ở phần nguồn khi trích dẫn.                                                              |
| 13:00 – 13:11 | _Chọn phòng ban BM Công nghệ Phần mềm, cấp tối thiểu 3_                                                          | Tài liệu thuộc Bộ môn Công nghệ Phần mềm, và chỉ dành cho giảng viên từ cấp 3 trở lên.                                                    |
| 13:11 – 13:19 | _Tooltip 2/8_                                                                                                    | Phân quyền này được gắn vào từng đoạn của tài liệu ngay khi nạp.                                                                          |
| 13:19 – 13:30 | _Tạo tài liệu; Xử lý nạp liệu ngay; Tiếp tục_                                                                    | Tạo tài liệu và bắt đầu xử lý. Khi hệ thống đọc xong, bấm Tiếp tục.                                                                       |
| 13:30 – 13:38 | _Bấm Áp dụng; danh sách đoạn hiện ra_                                                                            | Tài liệu được chia thành từng đoạn nhỏ để tìm kiếm.                                                                                       |
| 13:38 – 13:46 | _Tooltip 3/8: một đoạn chứa bảng_                                                                                | Các bảng được giữ nguyên hàng và cột, nên con số không bị tách khỏi tiêu đề của nó.                                                       |
| 13:46 – 13:53 | _Chọn đoạn ngắn nhất; tooltip 4/8_                                                                               | Trước khi nạp, chúng ta có thể chỉnh lại các đoạn. Đoạn này quá ngắn, khó được tìm thấy.                                                  |
| 13:53 – 14:03 | _Dán nội dung vào đoạn liền trên; Lưu; Xóa đoạn ngắn_                                                            | Chúng ta gộp nó vào đoạn ngay phía trên, lưu lại, rồi xóa đoạn thừa.                                                                      |
| 14:03 – 14:10 | _Tooltip 5/8_                                                                                                    | Giờ hai đoạn đã thành một, đầy đủ ngữ cảnh hơn.                                                                                           |
| 14:10 – 14:25 | _Bắt đầu embedding; tooltip 6/8; tiến trình chạy đến "Hoàn tất embedding"_                                       | Cuối cùng là bước embedding: mỗi đoạn được chuyển sang dạng mà hệ thống tìm được theo ý nghĩa, kèm tóm tắt và câu hỏi gợi ý.              |
| 14:25 – 14:48 | _Đăng nhập lại TST-CNPM-L3; hỏi lại câu giờ GPU_                                                                 | Nạp xong. Chúng ta quay lại tài khoản giảng viên cấp 3 của Bộ môn Công nghệ Phần mềm, và hỏi lại đúng câu lúc đầu về giờ GPU.             |
| 14:48 – 14:55 | _Câu trả lời: 36 giờ, có nguồn; tooltip 7/8_                                                                     | Lần này đã có câu trả lời: 36 giờ mỗi tháng, kèm nguồn là văn bản vừa nạp.                                                                |
| 14:55 – 15:13 | _TST-CNPM-L2, cấp 2, hỏi cùng câu_                                                                               | Để kiểm tra phân quyền, chúng ta thử thêm một giảng viên cùng bộ môn nhưng chỉ có cấp 2, hỏi đúng câu đó.                                 |
| 15:13 – 15:20 | _Trả lời "chưa có thông tin"; tooltip 8/8_                                                                       | Tài liệu yêu cầu cấp 3, nên tài khoản cấp 2 không nhận được.                                                                              |

## Phần 7 · Gói hạn mức (15:20 – 18:52)

| Thời điểm     | Trên màn hình                                                                                                   | Lời thoại                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 15:20 – 15:25 | _Slide "Phần 7 / 7 · Gói hạn mức" (`docs/demo/lib/slide-phan-7.png`)_; sau câu này dừng 2 giây để người xem đọc | Phần cuối là gói hạn mức, gồm ba tình huống.                                                                                             |
| 15:25 – 15:30 | _Slide (tiếp)_                                                                                                  | Đi vào tình huống một: tạo gói hạn mức và gán cho vai trò.                                                                               |
| 15:30 – 15:46 | _Đăng nhập SA-001; Cấu hình hạn mức; Thêm gói mới; đặt tên gói_                                                 | Đăng nhập bằng tài khoản quản trị, vào mục Cấu hình hạn mức, bấm Thêm gói mới và đặt tên cho gói.                                        |
| 15:46 – 15:57 | _Nhập token 24 giờ; tooltip 1/6_                                                                                | Gói giới hạn số token dùng trong 24 giờ và trong 7 ngày; để trống là không giới hạn. Gói demo đặt mức rất nhỏ để thấy kết quả ngay.      |
| 15:57 – 16:01 | _Bấm Tạo gói_                                                                                                   | Tạo gói.                                                                                                                                 |
| 16:01 – 16:15 | _Vai trò & phân quyền; dòng vai trò demo; Chỉnh sửa_                                                            | Hạn mức được gán theo vai trò. Vào mục Vai trò và phân quyền, chọn vai trò giảng viên dùng cho demo, rồi chỉnh sửa.                      |
| 16:15 – 16:27 | _Chọn gói vừa tạo ở ô Gói hạn mức; tooltip 2/6_                                                                 | Ở ô Gói hạn mức, chọn gói vừa tạo. Vai trò nào chưa được gán gói thì dùng gói mặc định.                                                  |
| 16:27 – 16:32 | _Lưu thay đổi_                                                                                                  | Lưu lại.                                                                                                                                 |
| 16:32 – 16:53 | _Quản lý người dùng; tìm tài khoản DEMO-HM; Chỉnh sửa; chọn vai trò_                                            | Tiếp theo, gán vai trò này cho một tài khoản giảng viên Bộ môn Công nghệ Phần mềm, cấp 2. Tìm tài khoản, mở chỉnh sửa, rồi chọn vai trò. |
| 16:53 – 17:03 | _Tooltip 3/6; Lưu thay đổi_                                                                                     | Từ giờ, tài khoản này dùng gói hạn mức vừa tạo.                                                                                          |
| 17:03 – 17:27 | _Đăng nhập tài khoản demo; hỏi lịch seminar_                                                                    | Giờ đăng nhập bằng chính tài khoản giảng viên đó, và đặt câu hỏi như bình thường. Mỗi câu hỏi sẽ dùng một ít token trong hạn mức.        |
| 17:27 – 17:48 | _Hỏi tiếp hạn chót đổi giảng viên hướng dẫn, rồi trọng số điểm khóa luận; dải cảnh báo vàng hiện ra_            | Giảng viên hỏi thêm vài câu nữa, về hạn chót đổi giảng viên hướng dẫn và cách tính điểm khóa luận.                                       |
| 17:48 – 17:56 | _Tooltip 4/6: dải "Sắp hết hạn mức sử dụng"_                                                                    | Khi đã dùng đến 80% hạn mức, một dòng cảnh báo hiện ra để người dùng biết trước.                                                         |
| 17:56 – 18:04 | _Hỏi câu học phí; bị chặn ngay_                                                                                 | Đến câu hỏi tiếp theo, hạn mức đã hết.                                                                                                   |
| 18:04 – 18:12 | _Thông báo hết hạn mức; tooltip 5/6_                                                                            | Yêu cầu bị tạm chặn, và chatbot cho biết khi nào được dùng lại.                                                                          |
| 18:12 – 18:33 | _Đăng nhập SA-001; tìm tài khoản; Xem chi tiết_                                                                 | Về phía quản trị, quản trị viên mở chi tiết tài khoản của giảng viên này,                                                                |
| 18:33 – 18:40 | _Khung "Hạn mức sử dụng" 100%; tooltip 6/6_                                                                     | và theo dõi được mức đã dùng, cùng thời điểm hạn mức được làm mới.                                                                       |
| 18:40 – 18:52 | _Thẻ "Tóm tắt"_                                                                                                 | Tóm lại, hạn mức được gán theo vai trò, có cảnh báo trước và tạm chặn khi hết. Cảm ơn quý thầy cô đã theo dõi.                           |
