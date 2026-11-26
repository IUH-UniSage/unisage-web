# Lỗi phát hiện khi quay video demo (23–25/11/2026)

> Danh sách các chỗ hệ thống chạy khác kết quả mong đợi, gặp trong lúc quay bộ video demo (`docs/demo/kich-ban-demo-tong-the.md`).
> Môi trường: eval (`unisage-official-chunks`, backend profile `eval`), web `localhost:5173`, gateway `:8400`, backend `:8401`, agent `:8402`.
> Mỗi mục ghi: cách tái hiện, kết quả mong đợi, kết quả thực tế, chỗ cần xem (nếu đã xác định).

## Tóm tắt

| #   | Lỗi                                                                            | Thành phần     | Mức                         |
| --- | ------------------------------------------------------------------------------ | -------------- | --------------------------- |
| 1   | Retrieval cache của SUPER_ADMIN không được làm mới sau khi nạp tài liệu        | agent          | Cao                         |
| 2   | Gán nhầm ngành: số liệu ngành QTDL trình bày như của KTPM                      | agent          | Cao                         |
| 3   | Hồ sơ học vụ bị ghi từ câu hỏi về người khác                                   | agent          | Cao                         |
| 4   | Không có tài liệu đúng khóa: lúc từ chối hẳn, lúc mới nói rõ                   | agent          | Cao                         |
| 5   | Chọn chương trình đào tạo nhưng trả lời sai chương trình và sai học phần       | agent          | Cao                         |
| 6   | Hai văn bản học phí mâu thuẫn, bot không nêu                                   | agent          | Cao                         |
| 7   | Hỏi lại để làm rõ không ổn định                                                | agent          | Trung bình                  |
| 8   | Tạo người dùng để trống số điện thoại bị báo trùng                             | backend        | Trung bình                  |
| 9   | Tiến độ embedding treo ở "Đang kết nối… 0%" khi không có worker                | web, agent     | Trung bình                  |
| 10  | Trạng thái tài liệu ở backend không khớp với Qdrant                            | backend, agent | Trung bình                  |
| 11  | Tài liệu P2 nạp sai phạm vi truy cập                                           | dữ liệu        | Trung bình                  |
| 12  | Đĩa đầy làm Celery worker chết, không có cảnh báo; tác vụ định kỳ dồn hàng đợi | vận hành       | Cao                         |
| 13  | Có thể hạn mức sử dụng bị tính thiếu                                           | agent, backend | Cần kiểm tra                |
| 14  | LLM chậm 60–145 giây, câu trả lời bị gián đoạn                                 | vận hành       | Đã hết sau khi xử lý mục 12 |
| 15  | Xem trước PDF đi qua dev tunnel, hiện trang cảnh báo của Microsoft             | cấu hình       | Trung bình                  |
| 16  | Form sửa người dùng có lúc hiện UUID phòng ban, vai trò trống                  | web            | Thấp                        |
| 17  | Phím Escape không đóng ngăn "Tài liệu tham chiếu"                              | web            | Thấp                        |
| 18  | Giao diện hiển thị mã phòng ban thay vì tên                                    | web            | Thấp                        |
| 19  | Câu trả lời chèn câu thời gian không liên quan                                 | agent          | Thấp                        |
| 20  | Không xóa được người dùng, vai trò, phòng ban, ticket; mã không dùng lại được  | backend        | Thấp                        |

Lỗi đã báo trước đó, vẫn còn: xem cuối file. Trạng thái xử lý ngày 25/11: xem mục "Trạng thái xử lý" ngay dưới.

## Trạng thái xử lý (25/11/2026)

Code chưa commit. Phần agent nằm trên nhánh `fix/huydh-unisage-108-eval-judge-coverage`, phần backend trên `main` (working tree), phần web trong working tree của `unisage-web`.

| #                                                  | Kết quả                  | Thay đổi                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1                                                  | Đã sửa                   | agent: `invalidate_visibility_change` tăng phiên bản cache cả `dept:*` (SUPER_ADMIN) sau khi embed và khi đổi phạm vi tài liệu (`app/services/retrieval_cache_invalidation.py`, `document_index_service.py`); có test                                                                                                                                                                                         |
| 2                                                  | Đã sửa                   | agent: thêm `app/graph/major_scope.py` (ngành trong câu hỏi gồm cả tên viết tắt như KTPM, CNTT; ngành trong tiêu đề tài liệu), gọi sau cohort và program scope; ưu tiên ngành nêu trong tin nhắn gốc. Không có tài liệu đúng ngành thì câu đầu nói "chưa có văn bản cho ngành X" và ghi ngành cho từng số liệu; có test                                                                                       |
| 3                                                  | Đổi hành vi theo yêu cầu | agent: vẫn lưu hồ sơ, không hiện dòng "Em đã cập nhật thông tin…" (`streaming_graph.py`)                                                                                                                                                                                                                                                                                                                      |
| 4                                                  | Đã sửa                   | agent: `document_cohort` đọc được "K15", "khóa K22" trong tiêu đề. Câu K18: "chưa có văn bản cho K18; có K15, K16, K17" rồi trình bày theo từng khóa; có test                                                                                                                                                                                                                                                 |
| 5                                                  | Đã sửa (phần chính)      | agent: khi chương trình được hỏi hoặc vừa chọn không có tài liệu trong kết quả, chạy retrieval lần hai, loại các tài liệu của chương trình khác (`exclude_document_ids` từ `retrieve_chunks` xuống filter Qdrant). Sau khi chọn "chương trình chuẩn": "Tiếng Anh 2 (4203015254) học trước 015253 – Tiếng Anh 1", đúng. Còn lại: câu trả lời trước khi chọn chương trình vẫn đọc nhầm bảng của CTĐT tăng cường |
| 6                                                  | Đã thêm quy tắc          | agent: `academic_domain_rules.yaml` có quy tắc "CÁC VĂN BẢN NÊU GIÁ TRỊ KHÁC NHAU CHO CÙNG MỘT MỤC". Ghi chú: mức 892.000 đồng nằm trong P1, là tài liệu **giả lập** của bộ test phân quyền, nên "mâu thuẫn" ở đây là giữa dữ liệu test và QĐ 1035 thật                                                                                                                                                       |
| 7                                                  | Đề xuất (chưa sửa)       | xem mục "Đề xuất cho mục 7" bên dưới                                                                                                                                                                                                                                                                                                                                                                          |
| 8                                                  | Đã sửa                   | backend: chuỗi rỗng ở số điện thoại, mã GV/SV được lưu là null, không kiểm tra trùng; khi sửa người dùng, "" là xóa số điện thoại (`UserServiceImpl`); có test                                                                                                                                                                                                                                                |
| 9                                                  | Đã xử lý                 | Worker đã chạy lại; video 6 quay lại với embedding thật; đã xóa các bản D1 cũ                                                                                                                                                                                                                                                                                                                                 |
| 10                                                 | Đã cập nhật dữ liệu      | 914 tài liệu `PENDING` có chunk trong Qdrant được chuyển sang `COMPLETED` (DB `assistant_eval`). Trạng thái cũ lưu trong scratchpad của phiên (`stale_docs_backup.txt`). Còn 47 tài liệu `PENDING` thật sự chưa có chunk                                                                                                                                                                                      |
| 11                                                 | Đã sửa                   | P2 chuyển sang công khai qua API (DB và 8 chunk trong Qdrant). Khi làm phát hiện **lỗi mới**: mọi thao tác đổi phạm vi của tài liệu đã nạp đều thất bại (2313) vì JDK HttpClient của `AgentIndexClient` xin nâng cấp h2c, uvicorn từ chối và PATCH tới agent bị mất body. Đã sửa: ép HTTP/1.1                                                                                                                 |
| 12, 13                                             | Đã xử lý                 | Dọn đĩa (từ 785M lên 16G trống), xóa khoảng 35.000 tác vụ dồn, khởi động lại toàn bộ `sct`; quay lại video 7 với worker đang chạy                                                                                                                                                                                                                                                                             |
| 14                                                 | Đã đổi                   | `.env.eval`: `LLM_MODEL_DENYLIST=gemini` (trước là `gpt`); hệ thống dùng `gpt-5-mini` (Chat-Fallback, Extraction-100, đã kiểm tra key ngày 25/11)                                                                                                                                                                                                                                                             |
| 15                                                 | Đã khôi phục             | Trong lúc quay để `MINIO_PUBLIC_BASE_URL=` (link tài liệu qua localhost); quay xong đã trả về `https://tpjjtlpq-9100.asse.devtunnels.ms` và khởi động lại backend                                                                                                                                                                                                                                             |
| 16, 17, 18                                         | Đã sửa                   | web: form người dùng chờ dữ liệu rồi mới hiện; Escape đóng ngăn tài liệu; `departmentLabel()` và `useDepartmentLabels()` hiển thị tên phòng ban ở sơ đồ, bảng, form người dùng, chi tiết người dùng, form và danh sách tài liệu, hàng đợi nạp liệu. Các đơn vị nhóm chưa có mô tả ("Khoa", "DoanThe", "PhanHieu", "TrungTam", "Vien", "phong giao vu") vẫn hiện mã: cần bổ sung mô tả trong dữ liệu           |
| 19                                                 | Đã sửa                   | agent: quy tắc câu lưu ý học kỳ chỉ đưa vào prompt khi câu hỏi có cụm thời gian tương đối (`mentions_relative_time`); có test                                                                                                                                                                                                                                                                                 |
| 20                                                 | Không sửa                | Đúng thiết kế: không xóa cứng thực thể                                                                                                                                                                                                                                                                                                                                                                        |
| Ô nhập chat của khách                              | Đã sửa                   | web: trạng thái "đang tạo hội thoại" bị kẹt vì React StrictMode tách mutation observer; giờ hook tự quản trạng thái. Khi tải lại tin nhắn lỗi thì giữ nguyên hội thoại và ô nhập                                                                                                                                                                                                                              |
| `GET /messages/conversation/:id` của khách lỗi 500 | Không tái hiện được      | Chạy lại đều trả 200 (đường dẫn công khai)                                                                                                                                                                                                                                                                                                                                                                    |
| Link chia sẻ                                       | Không sửa                | Quyết định thiết kế từ đầu                                                                                                                                                                                                                                                                                                                                                                                    |

Test: agent 2963 test qua (1 test hỏng có sẵn trong `calculation.py` do thay đổi chưa commit khác; `tests/e2e` lỗi import `ClarificationStateRepository` từ trước). Lưu ý: `.env` của agent đặt `CHAT_RERANK_MODE=cross_encoder` làm 13 test graph hỏng nếu chạy với `.env` này; chạy với `CHAT_RERANK_MODE=llm` thì qua. Web: lint, typecheck sạch; 304/305 test qua (`src/lib/axios-client.test.ts` hỏng sẵn, `src/lib` không bị sửa). Backend: `UserServiceImplTest` 3/3.

### Đề xuất cho mục 7 (hỏi lại để làm rõ không ổn định)

Hiện câu hỏi bổ sung của phần tra cứu do LLM tự quyết định qua block `ask_user_form`, nên cùng một câu có lúc hiện panel, lúc hỏi bằng chữ, lúc trả lời luôn. Phần tính toán thì đã dựng panel bằng code (`ParamSpec`).

1. **Quyết định hỏi lại bằng code, không để LLM quyết.** Sau retrieval đã có sẵn các cơ chế cohort, program và major scope. Khi:
   - câu hỏi nói về chính người hỏi ("của mình/tôi/em", hoặc không nêu đối tượng mà người hỏi là sinh viên),
   - hồ sơ thiếu trường tương ứng (`khoa_nhap_hoc`, `he_dao_tao`, `nganh_hoc`),
   - và các tài liệu tìm được **khác nhau theo đúng trường đó** (nhiều khóa, nhiều chương trình, nhiều ngành),

   thì code tự dựng panel, lấy lựa chọn từ giá trị có trong tài liệu, kèm "Khác". Program scope đã làm như vậy cho `he_dao_tao`; mở rộng cho khóa và ngành.

2. **Không cho hỏi lại bằng chữ thường.** Khi câu trả lời kết thúc bằng một câu hỏi xin thông tin hồ sơ mà không có `ask_user_form`, dùng cơ chế sửa sẵn có (`_repair_missing_ask_form`) để chuyển thành panel, hoặc bỏ câu hỏi đó.
3. **Ưu tiên lựa chọn liên quan tới người hỏi.** Có bảng ánh xạ phòng ban → ngành (BM CNPM → KTPM, CNTT…) để đưa ngành của đơn vị người hỏi lên đầu danh sách, thay vì các ngành tình cờ có trong tài liệu.
4. **Eval riêng:** thêm khoảng 10 ca cho từng trường (khóa, chương trình, ngành), mỗi ca chạy nhiều lần, đo tỉ lệ hiện panel và tỉ lệ đúng trường được hỏi.

---

## Ưu tiên cao: sai nội dung trả lời hoặc sai phân quyền

### 1. Retrieval cache của SUPER_ADMIN không được làm mới sau khi nạp tài liệu

- **Tái hiện:**
  1. `SA-001` hỏi `nhóm khóa luận được dùng tối đa bao nhiêu giờ GPU mỗi tháng trên máy chủ của bộ môn cnpm`.
  2. Nạp tài liệu demo D1 (BM CNPM, cấp 3) tới trạng thái `COMPLETED`.
  3. `SA-001` hỏi lại đúng câu đó.
- **Mong đợi:** 36 giờ GPU mỗi tháng, nguồn D1.
- **Thực tế:** log `retrieval_cache layer=l1 outcome=hit` và câu trả lời vẫn là "chưa có thông tin". Câu diễn đạt khác (không trúng cache) thì trả lời đúng 36 giờ. Tài khoản `TST-CNPM-L3` hỏi đúng câu gốc thì cũng ra đúng.
- **Nguyên nhân:**
  - `scope_of` (`app/graph/nodes/retrieval_cache.py`) gắn khóa cache của SA (quyền `("*", 100)`) với phiên bản cache `public` và `dept:*`.
  - `invalidate_after_embed` (`app/services/retrieval_cache_invalidation.py`) chỉ tăng phiên bản `dept:<phòng ban của tài liệu>` hoặc `public`, nên `dept:*` không bao giờ đổi.
  - `purge_document` không giúp được, vì câu trả lời "chưa có thông tin" không tham chiếu tới tài liệu nào.
- **Hướng sửa:**
  - Tăng thêm phiên bản `department_scope(WILDCARD_DEPARTMENT_ID)` khi embed tài liệu nội bộ.
  - Áp dụng tương tự cho mọi thao tác mở rộng phạm vi xem của tài liệu (đổi phòng ban, hạ cấp tối thiểu, chuyển sang công khai): tăng phiên bản cả phạm vi cũ lẫn phạm vi mới, thay vì chỉ gọi `invalidate_document`.
- **Ảnh hưởng tới video:** video 6 dùng `TST-CNPM-L3` để hỏi thay cho `SA-001`.

### 2. Gán nhầm ngành: số liệu ngành QTDL được trình bày như của KTPM

- **Tái hiện:** tài khoản BM CNPM cấp 0 hoặc 1 (chưa đủ quyền xem A2) hỏi `diem khoa luan ktpm tinh trong so gvhd, phan bien, hoi dong the nao`.
- **Mong đợi:** báo chưa có thông tin cho ngành KTPM, hoặc nói rõ số liệu tìm được thuộc ngành khác.
- **Thực tế:** bot trả lời "Điểm khóa luận tốt nghiệp ngành **Kỹ thuật phần mềm**: GVHD 20%, phản biện 30%, hội đồng 50%", nhưng nguồn trích dẫn là _Kế hoạch khóa luận tốt nghiệp khóa 18 (2022–2026) ngành **Quản trị du lịch, khách sạn, nhà hàng**_, trang 9 (công khai).
  - Lặp lại 3/3 lần ngày 25/11. Ngày 24/11 cùng câu hỏi lại ra "chưa có thông tin".
  - Đã kiểm tra: **không lộ A2**. Văn bản QTDL tình cờ có cùng trọng số.
- **Nguyên nhân:**
  - Đã có cơ chế giới hạn theo khóa (`app/graph/cohort_scope.py`) và theo chương trình (`app/graph/program_scope.py`), nhưng chưa có cho ngành.
  - Grounding chỉ kiểm tra câu trả lời có trích dẫn, không kiểm tra trích dẫn có đúng thực thể được nêu không.
- **Hướng sửa:**
  - Thêm `app/graph/major_scope.py` theo khuôn `cohort_scope.py`:
    - Tách ngành trong câu hỏi bằng bảng tên kèm viết tắt (KTPM, CNTT, QTKD, QTDL…) và tách ngành trong tiêu đề tài liệu.
    - Có tài liệu đúng ngành thì loại tài liệu ngành khác.
    - Không có thì báo "chưa có văn bản cho ngành X", rồi trình bày kèm tên ngành của từng số liệu.
  - Mở rộng `miscited_sources` (`app/graph/grounding.py`): câu nêu ngành X mà trích dẫn tài liệu ghi ngành Y thì đánh dấu lỗi.
  - Bổ sung vào prompt sinh câu trả lời: "Số liệu thuộc ngành nào phải ghi đúng ngành của văn bản nguồn."
- **Ảnh hưởng tới video:** video 4 đổi sang câu hỏi về điểm chênh lệch GVHD và phản biện, nội dung chỉ có trong A2.

### 3. Hồ sơ học vụ bị ghi từ câu hỏi về người khác

- **Tái hiện:**
  - `TST-CNPM-L0` hỏi `sinh viên ngành công nghệ kỹ thuật cơ khí khóa 18 muốn đăng ký tiếng anh 2…`: hồ sơ bị ghi `nganh_hoc: Công nghệ kỹ thuật cơ khí`, `khoa_nhap_hoc: 2022`.
  - Tài khoản giảng viên hỏi `giảng viên tiến sĩ được hướng dẫn tối đa bao nhiêu sinh viên…`: câu trả lời mở đầu bằng "Em đã cập nhật thông tin của Thầy/Cô – học vị (của giảng viên, cán bộ): Tiến sĩ".
- **Mong đợi:** chỉ lưu khi người dùng tự khai về bản thân ("em là sinh viên khóa 2023…", "tôi là tiến sĩ…").
- **Nguyên nhân:** prompt `message_classification.yaml` đã cấm ghi khi hỏi về người khác, nhưng classifier vẫn trả về `metadata_updates`. `streaming_graph.py` gọi `apply_updates(...)` lưu ngay và in thông báo, không có bước kiểm tra nào trong code.
- **Hướng sửa:**
  - Chặn trước `apply_updates`: chỉ nhận khi đủ cả hai điều kiện:
    - (a) tin nhắn có câu tự khai ở ngôi thứ nhất (tôi/em/mình/tớ + là/học/thuộc/khóa/nhầm/sửa, hoặc "của tôi/em/mình");
    - (b) giá trị cần lưu xuất hiện trong tin nhắn (`khoa_nhap_hoc` nhận cả dạng K-số lẫn năm).
  - Bị loại thì ghi log `profile.update_rejected`.
  - Chắc chắn hơn: bắt classifier trả kèm `metadata_evidence` là nguyên văn đoạn tự khai, code kiểm tra lại đoạn đó.
  - Giao diện (tùy chọn): nút "Hoàn tác" cạnh dòng "Em đã cập nhật thông tin…".
- **Dữ liệu cần dọn:** hồ sơ của `TST-CNPM-L0` và `TST-CNPM-L1` đã được đặt lại. Các tài khoản demo `DEMO-*` có thể còn dữ liệu sai.

### 4. Không có tài liệu đúng khóa: lúc từ chối hẳn, lúc mới nói rõ

- **Tái hiện:** `kế hoạch thực hiện khóa luận tốt nghiệp ngành công nghệ thực phẩm K18`. Kho đang có tài liệu công khai của K15, K16, K17.
- **Mong đợi:** giống câu "CTĐT cơ khí khóa 22" (câu này chạy đúng): nói rõ chưa có văn bản cho K18, rồi trình bày khóa gần nhất và ghi tên khóa.
- **Thực tế:** bot từ chối hẳn ("chưa có thông tin cụ thể… liên hệ Phòng Đào tạo"), không có nguồn.
- **Cần xem:** câu hỏi không lấy được tài liệu K15–K17 (vấn đề retrieval), hay lấy được nhưng `check_cohort_scope` không tạo chỉ dẫn. Tiêu đề tài liệu dùng dạng "K17" chứ không phải "khóa 17".

### 5. Chọn chương trình đào tạo nhưng trả lời sai chương trình và sai học phần

- **Tái hiện:** `Tiếng Anh 2 khóa 21 cơ khí học trước môn gì`, rồi chọn "Đại học chính quy (chương trình chuẩn)" trong panel hỏi lại.
- **Mong đợi:** học phần học trước của Tiếng Anh 2 theo CTĐT cơ khí K21 **chương trình chuẩn**. Tài liệu này có trong Qdrant (công khai).
- **Thực tế:**
  - Câu trả lời dùng CTĐT **tăng cường tiếng Anh** và nói về học phần **Tư tưởng Hồ Chí Minh**.
  - Câu trả lời đầu tiên (trước khi chọn) còn nói chưa có thông tin về học phần học trước của Tiếng Anh 2.

### 6. Hai văn bản học phí mâu thuẫn, bot không nêu

- **Tái hiện:** `học phí 1 tín chỉ lý thuyết của mình là bao nhiêu`, hoặc các câu học phí 2025–2026.
- **Thực tế:** QĐ 1035 tính theo khóa (khối công nghệ: 980.000 đồng khóa 2025, 930.000 đồng khóa 2024), còn _Quy định đăng ký học phần… áp dụng từ HK1 2026–2027_ ghi một mức chung 892.000 đồng/tín chỉ "chương trình đại trà". Bot trả một con số tùy văn bản tìm được.
- **Mong đợi:** nêu phạm vi áp dụng của từng văn bản (năm học, khóa) hoặc nói rõ các văn bản khác nhau.
- **Ảnh hưởng phụ:** câu "học phí … của mình" không còn kích hoạt hỏi lại khóa nhập học.

## Ưu tiên trung bình: chức năng

### 7. Hỏi lại để làm rõ không ổn định

- **Tái hiện:** hồ sơ trống, hỏi `ngành của mình phải tích lũy bao nhiêu tín chỉ để tốt nghiệp` nhiều lần.
- **Thực tế:**
  - Câu trả lời lúc hiện panel, lúc chỉ hỏi bằng chữ ("Bạn cho mình biết tên ngành học và hệ đào tạo nhé?"), lúc trả lời luôn bằng cách liệt kê theo từng ngành.
  - Số tab trong panel thay đổi (chỉ "Ngành đào tạo", hoặc "Hệ đào tạo" và "Ngành học").
  - Danh sách ngành lấy từ tài liệu tìm được (Tài chính doanh nghiệp, Dệt may, IoT…), không có ngành của người hỏi (BM CNPM → KTPM).
- **Mong đợi:** câu hỏi phụ thuộc thông tin chưa có trong hồ sơ thì luôn hiện panel; danh sách lựa chọn ưu tiên ngành liên quan tới phòng ban của người hỏi.

### 8. Tạo người dùng để trống số điện thoại bị báo trùng

- **Tái hiện:** quản trị viên tạo người dùng mới, để trống "Số điện thoại", bấm "Tạo người dùng".
- **Mong đợi:** tạo thành công (số điện thoại không bắt buộc).
- **Thực tế:** `POST /users` trả 400, mã 2116 "Số điện thoại này đã được sử dụng!". Có lẽ chuỗi rỗng bị so trùng với tài khoản khác cũng không có số điện thoại.
- **Hướng sửa:** chuẩn hóa chuỗi rỗng thành `null` (web hoặc backend), chỉ kiểm tra trùng khi có giá trị.

### 9. Tiến độ embedding treo ở "Đang kết nối… 0%" khi không có worker

- **Tái hiện:** worker ingest không chạy, bấm "Bắt đầu embedding".
- **Thực tế:** màn hình đứng ở "Đang kết nối… 0%" suốt 15 phút, không có thông báo.
- **Mong đợi:** báo tác vụ đang chờ trong hàng đợi hoặc worker không phản hồi, sau một thời gian chờ tối đa.

### 10. Trạng thái tài liệu ở backend không khớp với Qdrant

- Nhiều tài liệu đã có chunk trong Qdrant và được dùng để trả lời, nhưng backend vẫn ghi `PENDING`. Ví dụ: Quy định đăng ký học phần 2026–2027, Quy định xét tốt nghiệp, Quy định tạm dừng học, Quy định dạy học trực tuyến.

### 11. Tài liệu P2 nạp sai phạm vi truy cập

- _Quy định đánh giá kết quả rèn luyện sinh viên (2026)_ (P2) đang ở chế độ nội bộ cấp 3. `unisage-gateway/dataset/access-control/catalog.json` ghi P2 là công khai.
- Lỗi này làm lệch eval phân quyền.

## Vận hành

### 12. Đĩa đầy làm Celery worker chết, không có cảnh báo; tác vụ định kỳ dồn hàng đợi

- **Thực tế:**
  - Đĩa đầy 100% làm Redis lỗi `MISCONF Errors writing to the AOF file: No space left on device`, cả worker `default` lẫn `ingest` thoát.
  - `celery beat` (chạy từ 20/11) vẫn tiếp tục đẩy tác vụ, dồn **29.788** tác vụ ở `unisage_eval-default` (`drain_usage_outbox`, `beat_heartbeat`, `verify_pending_credentials`, các tác vụ ngân sách) và **5.178** ở `unisage_eval-ingestion` (5.116 lượt `run_embedding_reindex`).
- **Đã xử lý 25/11:** dọn đĩa (từ 785M trống lên 16G), xóa các tác vụ bị dồn, khởi động lại toàn bộ `sct`.
- **Hướng sửa:**
  - Đặt `expires` cho tác vụ định kỳ, để tác vụ quá hạn bị bỏ thay vì dồn lại.
  - Có cơ chế tự khởi động lại worker (supervisor hoặc systemd).
  - Cảnh báo khi đĩa sắp đầy, cảnh báo khi worker không có heartbeat.

### 13. Có thể hạn mức sử dụng bị tính thiếu

- `drain_usage_outbox` không chạy trong thời gian worker chết.
- Đo thực tế: mỗi câu hỏi chỉ làm hạn mức giảm khoảng 170 token, trong khi `usage-logs` ghi hàng chục nghìn token input và output mỗi lượt.
- Cần kiểm tra lại cách tính token cho hạn mức, và xem hạn mức có bị tính thiếu khi outbox không được xử lý không.

### 14. LLM chậm 60–145 giây, câu trả lời bị gián đoạn

- Ngày 24/11 mỗi câu trả lời mất 60–145 giây, kèm lỗi "Câu trả lời bị gián đoạn giữa chừng. Trợ lý AI đang bận hoặc tạm thời gián đoạn… (Mã tham chiếu: 7957310b, 5c563fb8)".
- Sau khi xử lý mục 12 và khởi động lại, chỉ còn khoảng 4–6 giây. Nhiều khả năng cùng nguyên nhân.

## Giao diện, cấu hình

### 15. Xem trước PDF đi qua dev tunnel, hiện trang cảnh báo của Microsoft

- **Tái hiện:** bấm nguồn trích dẫn dưới câu trả lời.
- **Thực tế:** khung xem PDF tải link `https://*.devtunnels.ms/...` (MinIO cổng 9100) và hiện trang "You are about to connect to a developer tunnel" thay cho tài liệu.
- **Hướng sửa:** cấu hình lại địa chỉ public của MinIO cho link tải tài liệu, hoặc phục vụ file qua proxy cùng origin với web.

### 16. Form sửa người dùng có lúc hiện UUID phòng ban, vai trò trống

- Mở "Chỉnh sửa" một người dùng: có lúc các dòng phòng ban hiện UUID thay vì tên, và ô "Vai trò hệ thống" trống. Gặp một lần khi đang tải trang. Nhiều khả năng do form hiển thị trước khi danh sách phòng ban và vai trò tải xong.

### 17. Phím Escape không đóng ngăn "Tài liệu tham chiếu"

- Phải bấm nút "Đóng tài liệu xem trước".

### 18. Giao diện hiển thị mã phòng ban thay vì tên

- Sơ đồ tổ chức, chọn phòng ban, chi tiết người dùng đều hiện `BM_CONG_NGHE_PHAN_MEM`, `KHOA_CNTT`… thay vì tên đầy đủ (đang nằm ở mô tả).

### 19. Câu trả lời chèn câu thời gian không liên quan

- Ví dụ: "Theo lịch dự kiến của Trường, hiện là Học kỳ I năm học 2026–2027; lịch của khoa bạn có thể khác…" xuất hiện ở đầu câu trả lời về điểm khóa luận, dù câu hỏi không hỏi về thời gian.

### 20. Không xóa được người dùng, vai trò, phòng ban, ticket; mã không dùng lại được

- Chỉ có "Vô hiệu hóa", không có xóa. Mã người dùng, tên vai trò, tên đơn vị không dùng lại được, nên dữ liệu thử tích lại sau mỗi lần chạy.
- Hiện còn: các tài khoản `DEMO-GV-*` và `DEMO-HM-*`, vai trò `GIANG_VIEN_DEMO_*`, đơn vị `BM_KHOA_HOC_DU_LIEU_*`, gói "Demo hạn mức *", tài liệu D1, vài ticket thử (một ticket có chữ bị rơi "Cần ọng số").

---

## Phát sinh sau khi chuyển sang GPT (25/11/2026)

### 21. `gpt-5-mini` đọc nhầm dòng trong bảng học phí; dòng cảnh báo của grounding hiển thị lạ

- **Tái hiện:** `TST-CNPM-L1` hỏi `hp dai hoc chinh quy khoa 2025 khoi cong nghe 1 tin chi ly thuyet bao nhieu`.
- **Mong đợi:** 980.000 đồng. Ngữ cảnh đưa cho model ghi rõ "Khối Công nghệ: Môn lý thuyết: 980.000".
- **Thực tế:** 4/4 lần trả lời **930.000 đồng** (mức của khóa 2024). Câu nối tiếp "còn khóa 2024" thì ra 840.000 đồng (mức của khóa 2023), tức lệch đúng một dòng. Cùng câu hỏi với `TST-CNPM-L0` thì 3/3 lần ra đúng 980.000 đồng; khác biệt có lẽ nằm ở thứ tự các chunk.
- **Grounding đã phát hiện** (`ungrounded=['930.000']`) nhưng câu trả lời vẫn hiện con số sai, kèm dòng lạ "Nguồn của 930.000:1."
- **Hướng sửa:**
  - Tăng mức suy luận của credential GPT cho bước sinh câu trả lời (đang là `thinking=minimal`).
  - Khi grounding phát hiện con số không có trong nguồn được trích, sinh lại câu trả lời hoặc bỏ con số đó, thay vì in dòng "Nguồn của …".
- **Ảnh hưởng tới video:** video 1 chuyển sang dùng `TST-CNPM-L0`, kèm bước tự kiểm tra con số (980.000 rồi 930.000).
- **Đã xử lý (cấu hình):** `.env.eval` thêm `CHAT_GENERATION_THINKING=low` cho bước sinh câu trả lời. Chạy thử 2/2 lần đúng 980.000 rồi 930.000; video 1 quay lại đạt. Chưa sửa phần dòng cảnh báo "Nguồn của …" của grounding.
- **Đã xử lý (dòng cảnh báo, 25/11/2026):** agent không chèn "> Lưu ý: …" / "> Nguồn của …" vào câu trả lời nữa mà ghi `metadata.grounding` (`ungrounded`, `miscited` kèm nguồn). Web hiện một khung cảnh báo màu cam ngay dưới câu trả lời, nêu con số cần đối chiếu; con số nằm ở nguồn khác thì có nút mở đúng nguồn đó. Câu trả lời cũ trong lịch sử vẫn giữ dòng chữ cũ.

### 22. Kết luận "văn bản không ghi học phần X" khi chỉ thiếu đoạn chứa học phần đó

- **Tái hiện:** `TST-CNPM-L0` hỏi `chương trình đào tạo ngành công nghệ kỹ thuật cơ khí khóa 22: học phần tiếng anh 2 phải học trước môn nào, bao nhiêu tín chỉ`.
- **Mong đợi:** nói chưa có tài liệu K22, rồi nêu theo K21 chuẩn: Tiếng Anh 2, mã 4203015254, 3 tín chỉ, học trước 015253.
- **Thực tế:** "chương trình chuẩn không ghi Tiếng Anh 2". Biến thể hỏi Tiếng Anh 1: "chương trình chuẩn không ghi Anh văn 1" (chương trình chuẩn gọi là Tiếng Anh 1, chương trình tăng cường gọi là Anh văn 1).
- **Nguyên nhân:**
  - Đoạn chứa dòng Tiếng Anh 2 đứng hạng 28 ở bước tìm kiếm và hạng 50 sau cross-encoder (giữ 8). Chữ "tiếng Anh" trong tên "CTĐT tăng cường tiếng Anh" làm các tài liệu này chiếm top đầu ở cả hai bước. Metadata của đoạn đầy đủ, không phải lỗi chunking.
  - HyDE đã ghi đúng "Tiếng Anh 2". Đo thử: dòng HyDE theo đúng mẫu bảng ("Tiếng Anh 2 | English 2 | Mã học phần | …") kéo đoạn lên hạng 10–21 ở bước tìm kiếm nhưng vẫn hạng 12–14 sau cross-encoder, chưa vào top 8.
- **Đã xử lý (prompt):** `academic_domain_rules.yaml` thêm mục "HỌC PHẦN KHÔNG THẤY TRONG ĐOẠN ĐÃ DẪN": không thấy thì nói "các đoạn tra cứu được chưa có dòng học phần X", không khẳng định văn bản không ghi; nêu đúng tên và mã của từng chương trình. Chạy lại 2 lần: không còn câu "văn bản không ghi".
- **Sửa tiếp (25/11/2026):**
  - Ba thông báo phạm vi (khóa, ngành, chương trình) dùng chung quy tắc `ONLY_WHAT_WAS_ASKED` (`app/graph/cohort_scope.py`): trình bày thông tin trả lời câu hỏi từ mọi tài liệu có nó; không viết từng phần "không có"; không nêu học phần khác làm "thông tin liên quan" (một lần chạy đã ghi Tiếng Anh 1 bằng mã 013802 của Kinh tế chính trị).
  - `academic_domain_rules.yaml`: câu hỏi về một học phần trả lời bằng 1-2 câu đầy đủ (chương trình, khóa, tên + mã, tín chỉ, đúng loại điều kiện a/b/c); `response_style.yaml`: không lặp lại thông tin, không cắt thành dòng nhãn cụt.
- **Đo thêm (không tốn token LLM):**
  - Đoạn Tiếng Anh 2 đã nằm trong ứng viên (hạng 28); cross-encoder hạ xuống 48-50. Chấm không kèm tên tài liệu: 17 (K22) / 8 (K21) nhưng câu q0108 rơi từ 1 xuống 15; trung bình hai điểm: 30 / 14. Không cách nào đưa được vào top 8 mà không hại câu khác.
  - Câu khóa 16 trả lời được vì có đúng tài liệu khóa 16, không có CTĐT tăng cường tiếng Anh K16 cạnh tranh, và dòng Tiếng Anh 2 nằm chung đoạn với Tiếng Anh 1 (hạng 3 sau chấm lại).
- **Tra dòng học phần bằng code (25/11/2026):** `app/graph/course_lookup.py`. Bước phân loại ghi thêm `hoc_phan` (tên đầy đủ theo văn bản, viết tắt không chắc thì để trống). Code đọc toàn bộ đoạn của các CTĐT/KHĐT có trong ứng viên, cộng CTĐT cùng ngành của khóa được hỏi hoặc khóa gần nhất trước đó (chuẩn trước; danh mục tên tài liệu đọc từ Qdrant, giữ 10 phút), tìm dòng có tên học phần (hoặc mã người dùng ghi) và dòng của học phần điều kiện, thêm tối đa 4 đoạn vào ngữ cảnh. Không gọi LLM; không khớp thì không đổi gì. Câu khóa 22 (có dấu và không dấu) đều lấy được dòng Tiếng Anh 2 của CTĐT chuẩn K21.
- **Prompt phân loại:** giữ ngành người dùng viết tắt/không dấu ("co khi khoa 16" không thành "Khoa 16"); viết tắt không chắc thì giữ nguyên (XSTK không phải "xét tốt nghiệp").
- **Còn lại (trước khi tra dòng):** câu khóa 22 lúc lấy được đoạn (trả lời đủ cả chương trình chuẩn lẫn tăng cường), lúc không (nói "chưa tìm thấy", đôi khi tách theo từng chương trình). Một lần chạy viết "khóa 22 (nhập học 2022)" thay vì 2026.
- **Dòng tóm tắt học phần (25/11/2026):** `course_summary` ghi sẵn vào prompt từng học phần được hỏi trong ngữ cảnh cuối: [n] của đoạn, tên, mã môn học, mã học phần, số tín chỉ, từng điều kiện kèm loại (a học trước / b tiên quyết / c song hành) và tên học phần điều kiện; dặn gọi đúng loại kể cả khi người dùng dùng từ khác. Đọc được cả ô gộp có `<br>`. Chạy lại: khóa 22 ra "Tiếng Anh 2 … tiên quyết (b) 015253 Tiếng Anh 1"; Cơ lưu chất K21 ra "học trước Toán cao cấp 1 (003259)" (trước đó gọi nhầm là tiên quyết).
- **Còn lại (trước dòng tóm tắt):** model đôi khi đọc ngược điều kiện ("Tiếng Anh 2 là tiên quyết đối với Tiếng Anh 1") và vẫn có lần viết "khóa K22 (nhập học 2022)".
- **Ảnh hưởng tới video:** video 1 tình huống 5 đổi sang hỏi học phần Kinh tế chính trị Mác - Lênin (K21 chuẩn 4203014165, 2 tín chỉ).

---

### 23. Câu nối tiếp "thế <X> thì sao" mất điều đang hỏi

- **Tái hiện:** `học phần tiên quyết của môn Cơ lưu chất` → `thế khóa luận tốt nghiệp thì sao`.
- **Mong đợi:** học phần tiên quyết của Khóa luận tốt nghiệp.
- **Thực tế:** câu được viết lại thành "Khóa luận tốt nghiệp cần những điều kiện, quy trình và yêu cầu gì?" và bot trả lời về quy trình làm khóa luận. Lịch sử có đưa "Câu hỏi đầy đủ của lượt tra cứu gần nhất" (`retrieval_questions` của tin nhắn trước), nhưng quy tắc câu nối tiếp chỉ biết thay tiêu chí (bậc/hệ, khóa, ngành, cơ sở); "khóa luận tốt nghiệp" không phải tiêu chí nên bị coi là chủ đề mới.
- **Đã sửa (prompt):** `message_classification_retrieval.yaml` và `hyde_generator.yaml`: tin nhắn chỉ nêu MỘT đối tượng mới thì thay đối tượng cùng loại của câu gốc (học phần, ngành, khóa, hệ, cơ sở, văn bản, đơn vị) và giữ điều đang hỏi cùng các đối tượng khác; thêm một ví dụ mẫu đúng trường hợp này. Thử 5 câu: 4/5 đúng (Khóa luận tốt nghiệp, còn khóa 2024, ngành kế toán thì sao, câu chủ đề mới thật). Chạy qua giao diện: "thế khóa luận tốt nghiệp thì sao" → học phần tiên quyết của Khóa luận tốt nghiệp ngành cơ khí K21, đúng với văn bản (015307(b), 015308(b)).
- **Còn lại:** "còn môn vẽ kỹ thuật" (sau câu "cơ lưu chất ngành cơ khí khóa 21 mấy tín chỉ") vẫn mất ngành và khóa, 3/3 lần. Bật `CHAT_AUX_THINKING=low` thì đúng cả, nhưng bước phân loại chậm thêm khoảng 4,7 giây mỗi tin nhắn.
- **Đã sửa tiếp: `retrieval_slots` (25/11/2026).** Cạnh `retrieval_questions`, tin nhắn trả lời lưu thêm `metadata.retrieval_slots` gồm `chu_de`, `hoc_phan`, `nganh_hoc`, `khoa_nhap_hoc`, `he_dao_tao`, `bac_dao_tao`, `co_so_hoc`.
  - Tên trường lấy từ `configs/known_metadata_fields.json` qua `canonical_field` ("nganh", "chuyen_nganh", "nganh_dao_tao" đều là `nganh_hoc`); `hoc_phan`, `chu_de` được đăng ký thêm với scope `retrieval`. Giá trị chỉ lấy từ câu hỏi (kết quả phân loại và câu đầy đủ), không lấy từ câu trả lời.
  - Lượt sau: prompt phân loại có thêm dòng "Ngữ cảnh của lượt đó: học phần: …; ngành: …; khóa: K21 (nhập học 2025)". Nếu tin nhắn là câu nối tiếp ngắn ("còn …", "thế … thì sao", "… á bạn") mà câu viết lại thiếu học phần, ngành hay khóa của lượt trước và người dùng không nêu giá trị mới, code chèn lại vào câu hỏi trước khi tìm kiếm (`app/graph/retrieval_slots.py`). Câu tự nêu điều muốn hỏi thì không kế thừa.
  - Chạy qua giao diện: "còn môn vẽ kỹ thuật" → "Học phần Vẽ kỹ thuật ngành Công nghệ kỹ thuật cơ khí khóa K21 (nhập học 2025) có bao nhiêu tín chỉ?", trả lời đúng cả chương trình chuẩn (003297) lẫn tăng cường (003776). "điều kiện làm khóa luận tốt nghiệp là gì" sau câu hỏi về Cơ lưu chất → chủ đề mới, không kế thừa ngành, khóa.

### 24. "còn ngành cntt" trả lời không có, dù có KHĐT CNTT khóa 16

- **Tái hiện:** `học phần tiên quyết của khóa luận tốt nghiệp ngành cơ khí khóa 21` → `còn ngành cntt`.
- **Mong đợi:** ngành CNTT không có CTĐT; có "Kế hoạch đào tạo ngành Công nghệ thông tin khóa 16": Khóa luận tốt nghiệp 2101700, 8(0,16,16), không ghi điều kiện.
- **Nguyên nhân (2 chỗ):**
  - Bảng KHĐT cũ dùng mã 7 chữ số và ghi tên hai thứ tiếng trong một ô ("Khóa luận tốt nghiệp Capstone project"): code tra dòng đọc ra 0 dòng.
  - Kiểm tra phạm vi chạy khóa → chương trình → ngành: hỏi khóa 21 thì tài liệu khóa 21 của ngành cơ khí giữ lại, tài liệu khóa 16 của CNTT bị loại trước khi xét ngành.
- **Đã sửa (25/11/2026):** `course_lookup.py` đọc mã 6-7 hoặc 10 chữ số và tách phần tên tiếng Anh (từ 2 từ chữ cái trở lên, nên "Tiếng Anh 2", "Lập trình Java" giữ nguyên); ngành được nêu mà ứng viên không có thì tra danh mục theo đúng ngành đó. `streaming_graph.py` lọc theo ngành trước khi kiểm tra khóa. Chạy lại: "Hiện em chưa tìm thấy thông tin cho ngành Công nghệ thông tin khóa K21…; có chương trình ngành CNTT khóa 16: Khóa luận tốt nghiệp (2101700) 8 tín chỉ, không có điều kiện [Kế hoạch đào tạo ngành CNTT khóa 16 tr. 5]".

### 25. Nhịp video: màn hình đứng lâu, thao tác nhập liệu quá nhanh (góp ý 25/11/2026)

- **Video 0, từ giây 36:** trang chat phía sau bị tải lại giữa thẻ "Hệ thống phân quyền", thẻ biến mất và còn lại trang chat đứng yên khoảng 8 giây. Cuối video, thẻ kết bị xoá trước khi dừng quay, nên lộ lại trang chat (có lúc đang tải).
- **Video 7, từ 2:11:** câu hỏi bị chặn vì hết hạn mức không hiện nút "Dừng", nhưng script vẫn chờ nút đó 20 giây rồi chờ thêm 30 giây cho hàng nút của câu trả lời. Phần cắt chỉ cắt giữa, nên còn hơn 10 giây màn hình đứng yên. Sau đó việc đăng xuất tài khoản tạo trong video không tìm thấy menu tài khoản và mất thêm 5 giây.
- **Mọi video quản trị:** các ô được điền tức thì (`fill`), chọn trong danh sách 0,4 giây, chuyển trang bằng URL, nên người xem không thấy đang thao tác gì (tạo tài khoản, gán phòng ban, gán gói hạn mức cho vai trò).
- **Đã sửa (`lib/demo-kit.mjs`):**
  - Thẻ tiêu đề được lưu vào sessionStorage và vẽ lại sau khi trang tải lại. `card(..., { keep: true })` giữ thẻ kết đến hết video.
  - `waitForAnswer` dừng ngay khi thông báo hết hạn mức xuất hiện. `logout` tự lấy tên của tài khoản tạo trong lúc quay.
  - Thêm các bước thao tác có khung vàng và chú thích ngắn (không đánh số như tooltip):
    - `hint`: chỉ vào phần tử;
    - `type`: gõ từng ký tự, tự điền một lần nếu gõ bị rơi dấu;
    - `choose`: mở danh sách, dừng cho thấy các lựa chọn rồi mới chọn;
    - `press`: chú thích rồi bấm;
    - `go`: chuyển trang bằng menu bên trái thay vì nhập URL.
- **Đã áp dụng vào:**
  - video 3: báo cáo, xử lý và phản hồi yêu cầu;
  - video 4: tạo tài khoản, gán phòng ban và cấp, nâng cấp;
  - video 5: thêm đơn vị;
  - video 6: tải lên, chia đoạn, gộp đoạn, embedding;
  - video 7: tạo gói, gán gói cho vai trò, gán vai trò cho người dùng.
  - Video 1 có chú thích khi mở/đóng nguồn và khi trả lời bảng hỏi lại.

## Lỗi đã báo trước đó, vẫn còn

- **Ô nhập của khách bị khóa** sau câu trả lời đầu tiên trong cùng đoạn chat.
- **`GET /messages/conversation/:id` của khách trả lỗi 500.**
- **Link chia sẻ đoạn chat để lộ nội dung câu trả lời** cho người không có quyền xem tài liệu nguồn. Khi mở nguồn thì đúng là bị chặn, nhưng nội dung câu trả lời đã hiện ra.
