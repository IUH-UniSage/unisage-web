# Spec: clarification-panel-ui (unisage-web)

> **Status: Implemented** (UNISAGE-99, nhánh `feature/huydh-unisage-99-calculation-flow`). Rủi ro còn
> lại nằm ở `unisage-agent/docs/specs/known-gaps.md`.

Module id `clarification-panel-ui` trong capability map
(`unisage-agent/changes/09-10-2026-calculation-flow/capability-map.md`). Contract server-side nằm ở
`unisage-agent/docs/specs/SPEC-clarification-panel.md` (§1 data model, §3 SSE) và
`unisage-agent/contracts/chat-sse.md` (**canonical**: nếu spec này khác contract thì contract đúng).

## Objective

Bỏ `AskUserFormCard` (form chip nằm trong tin nhắn). Thay bằng:

1. **Panel câu hỏi** ghim phía trên `ChatComposer`, có một tab cho mỗi câu hỏi, theo mẫu UI của Claude
   Code:
   - Mỗi lựa chọn có tiêu đề, dòng mô tả và nhãn "(Đề xuất)".
   - Dòng "Khác" để nhập tự do.
   - Ô nhập số, danh sách số, và bảng môn học.
   - Nút "Gửi câu trả lời" chỉ bấm được khi **mọi tab** đã có câu trả lời hợp lệ.
   - Nút ⌄ để thu gọn, nút ✕ hoặc phím Esc để Huỷ.
2. **Composer bị khoá** khi panel đang mở. Sinh viên phải trả lời hoặc huỷ.
3. **Card có border** thay cho bong bóng của lượt USER đã trả lời panel, liệt kê từng cặp câu hỏi → câu
   trả lời. Câu trả lời dạng bảng môn thì hiện thành bảng nhỏ.
4. **Reload hoặc vào lại cuộc chat** thì panel còn đang mở vẫn hiện ra, card vẫn hiện y hệt.
5. **Lịch sử cũ** vẫn hiển thị đúng: message có fence `ask_user_form` không lộ JSON.
6. **Nút Đúng/Sai** dưới mỗi kết quả "Kết quả do AI tự tính, có thể sai" (mọi phép tính ngoài 3 công thức cài sẵn). Chọn Sai thì phải chọn lý do.

## Contract client dùng

```ts
// src/features/chat/schemas/clarification-schemas.ts (zod, .strict())
type QuestionKind =
  | "choice"
  | "number"
  | "number_list"
  | "number_or_list"
  | "text"
  | "course_table"
type ChoiceOption = {
  id: string
  label: string
  description: string | null
  recommended: boolean
}
type Question = {
  id: string
  tab_label: string
  prompt: string
  kind: QuestionKind
  options: ChoiceOption[]
  allow_other: boolean
  number: { min: string; max: string; step: string; unit: string | null } | null // Decimal được serialize thành string
  max_items: number | null
  max_length: number | null
}
type ClarificationPanel = {
  schema_version: 1
  panel_id: string
  questions: Question[] // id q1..q99; hiện đủ mọi câu, không cắt ở 12 (server chặn ở 50)
}

type Answer =
  | { question_id: string; option_id: string }
  | { question_id: string; other_text: string }
  | { question_id: string; number: string } // number; number_or_list khi nhập trực tiếp giá trị tổng hợp
  | { question_id: string; numbers: string[] } // number_list; number_or_list ở chế độ "Nhập từng cột"
  | { question_id: string; text: string }
  | {
      question_id: string
      rows: { name: string | null; credits: number; score: string }[]
    }

// metadata.clarification trên message ASSISTANT
type ClarificationMetadata = {
  schema_version: 1
  status: "open" | "cancelled"
  panel: ClarificationPanel
}

// metadata.clarification_answers trên message USER của lượt submit (dữ liệu card)
type AnsweredItem = {
  question_id: string
  tab_label: string
  prompt: string
  kind: QuestionKind
  display: string | null
  rows?: { name: string | null; credits: number; score: string }[]
}
type ClarificationAnswers = {
  schema_version: 1
  panel_id: string
  items: AnsweredItem[]
}
```

- Request của `POST /chat/stream`:
  - Lượt thường: `{conversation_id, message}`.
  - Gửi câu trả lời: `{conversation_id, clarification: {action: "submit", panel_id, answers}}`.
  - Huỷ: `{conversation_id, clarification: {action: "cancel", panel_id}}`.
- SSE mới cần xử lý trong `use-chat-stream.ts`:
  - `clarification` (data là `ClarificationPanel`) → `onClarification`.
  - `clarification_closed` → `onClarificationClosed`.
  - Event lạ thì bỏ qua như hiện nay.
- Lỗi HTTP mới:
  - `400` mã `4010`: hiện lỗi dưới đúng tab theo `errors[].question_id`, panel vẫn mở.
  - `409` mã `4091`: đóng panel, toast "Câu hỏi đã được trả lời hoặc huỷ", refetch messages.
  - `409` mã `4092`: refetch messages, sau đó panel tự hiện lại.
  - `409` mã `4093`: toast "Mình đang xử lý câu trả lời trước", composer giữ khoá.
  - `503` khi huỷ: panel giữ nguyên, toast "Chưa huỷ được, thử lại nhé".

## Trạng thái panel (dẫn xuất, không lưu riêng)

```ts
// utils/clarification-state.ts, hàm thuần
function deriveOpenPanel(
  messages: Message[]
): { panel: ClarificationPanel; assistantMessageId: string } | null
// panel mở khi và chỉ khi message cuối cùng là ASSISTANT, COMPLETED, có metadata.clarification.status === "open"

function readAnsweredCard(message: Message): ClarificationAnswers | null
// message USER có metadata.clarification_answers hợp lệ (zod) thì hiện thành card; không thì bong bóng thường
```

- Sau khi gửi câu trả lời, message USER lạc quan (optimistic) đã mang sẵn `metadata.clarification_answers`
  do client dựng (cùng shape), nên card hiện ngay; `onDone` refetch về đúng bản server lưu.
- Trong lúc stream: khi nhận event `clarification`, set `metadata.clarification = {status: "open", panel}`
  vào message ASSISTANT đang stream trong query cache. Nhờ vậy `deriveOpenPanel` chạy đúng mà không
  phải đợi refetch. Khi `onDone`, invalidate như hiện nay, server trả về đúng metadata đó.
- Bản nháp câu trả lời (các tab đã chọn hoặc nhập) giữ trong state của component, và lưu thêm vào
  `sessionStorage` theo `panel_id` (bọc try/catch) để reload không mất những gì đã nhập. Đây là tiện
  ích phía client, không phải source of truth.

## Component

```
src/features/chat/components/clarification/
├── clarification-panel.tsx          # khung panel: Tabs (variant "line"), ⌄ thu gọn, ✕ huỷ, Esc, nút gửi + số tab chưa trả lời
├── question-choice.tsx              # radio-style list: label, description, "(Đề xuất)", dòng "Khác" + input
├── question-number.tsx              # một ô Input inputMode="decimal" (đơn vị nằm trong ô), không hiện chip "Từ … đến …"; lỗi hiện dưới ô
├── question-number-list.tsx         # các ô số trên một hàng, nút "+" ở cuối hàng, "×" xoá khi hover; không có bộ đếm
├── question-number-or-list.tsx      # mặc định danh sách cột (→ numbers); link bên dưới đổi sang một ô giá trị tổng hợp (→ number)
├── question-text.tsx                # Textarea 1–3 dòng, max_length
├── question-course-table.tsx        # bảng: tên môn | tín chỉ | điểm (số hoặc chữ), "+ thêm môn", tối đa 30 dòng
└── answered-clarification-card.tsx  # card có border thay cho bong bóng USER
src/features/chat/utils/
├── clarification-state.ts           # deriveOpenPanel, readAnsweredCard
├── clarification-answers.ts         # validate phía client (cùng quy tắc với server), build Answer[]
└── legacy-ask-user-form.ts          # đổi tên từ ask-user-form.ts, chỉ còn stripLegacyAskUserForm + parse để hiện read-only
```

- **Vị trí:** trong `ActiveConversation`, giữa `{usageWarning}` và `<ChatComposer>`, trong cùng khung
  `max-w-3xl`. Khi panel mở, `ChatComposer` nhận `disabled` và placeholder "Trả lời câu hỏi phía trên
  để tiếp tục".
- **Bàn phím:**
  - ←/→ hoặc Tab chuyển tab; ↑/↓ chọn option; Enter chọn rồi sang tab chưa trả lời kế tiếp.
  - Esc mở dialog xác nhận huỷ. Huỷ thì không hỏi lại lần hai; nếu đã có câu trả lời nháp thì mới xác
    nhận.
- **`number_or_list`** (ví dụ "Điểm thường xuyên"): cùng ràng buộc `number` và `max_items` như
  `number_list`. Mặc định là danh sách cột; một dòng link "Đã có điểm trung bình? Nhập trực tiếp" (và
  ngược lại) đổi chế độ - không có khung lồng hay công tắc. Chỉ gửi giá trị của chế độ đang chọn (`number` hoặc
  `numbers`), nháp giữ cả hai ô và chế độ đã chọn. `display` của card: `"Nhập sẵn: 7.3"` hoặc
  `"Từng cột: 8, 7, 7"` (message USER lạc quan dựng y hệt).
- **Nhiều tab:** panel hiện đủ mọi câu hỏi của lượt; thanh tab cuộn ngang bên trong panel, trang không
  bị cuộn ngang ở 375px.
- **Tab:** có dấu ✓ khi đã có câu trả lời hợp lệ, dấu chấm đỏ khi server trả lỗi cho tab đó.
- **Nút gửi:** "Gửi câu trả lời" kèm số tab còn thiếu ("Còn 2 câu"), bị disable cho đến khi đủ.
- **Card có border** (`answered-clarification-card.tsx`): `rounded-2xl border border-border`, căn phải
  như bong bóng USER, mỗi dòng gồm `tab_label` (muted) và câu trả lời. Bảng môn dùng `ui/table`. Lượt
  huỷ không tạo message USER nên không có card.
- **Mobile 375px:** panel chiếm full width, `max-h-[60vh]` và cuộn bên trong. Tab list cuộn ngang
  trong chính nó (không làm trang cuộn ngang). Bảng môn chuyển thành dạng thẻ trên mỗi dòng.
- **Màu:** chỉ dùng token có trong `src/styles/index.css` (`.claude/rules/styling.md`). Dùng icon
  `lucide-react`.
- Giữ nguyên các product tour anchor (`TOUR_ANCHORS.chatComposer`...).
- Cần component `radio-group` của shadcn. Thêm bằng `pnpm dlx shadcn@latest add radio-group`, không
  thêm dependency mới vì `radix-ui` đã có.

## Lịch sử cũ (legacy read path)

- `AssistantReply` vẫn gọi `stripLegacyAskUserForm(content)` để bỏ fence khỏi phần text hiển thị.
- Nếu tìm thấy form cũ thì hiện một khối **read-only** "Câu hỏi bổ sung (phiên bản cũ)" liệt kê các
  field. Khối này không bấm được, và không bao giờ mở panel.
- Bong bóng USER cũ (text dạng `"Khoa: CNTT. Khoá: K20"`) vẫn là bong bóng thường.
- Xoá `AskUserFormCard`, `formatAskUserFormAnswer`, `resolveAnsweredSelections`, và quy tắc "≤ 3 option
  thì dùng chip".

## Phản hồi Đúng/Sai cho kết quả tính theo quy chế

Contract ở `unisage-agent/contracts/chat-sse.md` §5b.

- `components/calculation-feedback.tsx`: gắn dưới mỗi phần tử `metadata.calculation.items` có
  `mode == "llm"` và `status == "computed"` trong `AssistantReply`.
- Có hai nút **Đúng** (`ThumbsUp`) và **Sai** (`ThumbsDown`). Bấm **Sai** thì mở `Popover` gồm:
  - radio 5 lý do: Sai công thức · Sai kết quả · Sai nguồn/quy chế · Thiếu thông tin · Khác;
  - textarea ghi chú (≤ 500 ký tự, bắt buộc khi chọn "Khác");
  - dòng thông báo "Câu hỏi và các số bạn đã nhập sẽ được gửi cho bộ phận hỗ trợ để kiểm tra.";
  - nút Gửi.
- Gọi backend qua mutation TanStack Query (`features/chat/queries/use-mutations.ts`), dùng `httpClient`
  (route master). Thành công thì cập nhật `metadata.calculation_feedback` trong cache của messages.
  `ticketCreated` là `true` thì toast "Đã gửi cho bộ phận hỗ trợ", còn không thì toast "Cảm ơn bạn đã
  phản hồi".
- Trạng thái đã chọn được đọc từ `metadata.calculation_feedback`, nên reload vẫn giữ nguyên. Đổi được
  Đúng ↔ Sai; nhận `409` (ticket đã xử lý xong) thì khoá nút và hiện tooltip.
- Test: component test cho popover (lý do bắt buộc, "Khác" bắt buộc ghi chú) và cho trạng thái sau
  reload; e2e mock endpoint feedback.

## ADR

`docs/adr/0003-clarification-panel.md` ghi lại các quyết định sau:

- Panel ghim thay cho form nằm trong tin nhắn.
- **Cho phép nhập tự do** (đảo ngược quyết định cũ chỉ ghi trong comment code), vì tham số tính toán
  là số.
- Trạng thái panel dẫn xuất từ `metadata` của message, không thêm state phía client.

## Commands

```
pnpm test -- src/features/chat
pnpm lint && pnpm format:check && pnpm typecheck && pnpm build
pnpm test:e2e -- e2e/chat-clarification.spec.ts
```

## Testing Strategy

- **Unit (Vitest):**
  - `deriveOpenPanel` / `readAnsweredCard`: các trạng thái open/cancelled, message cuối là
    USER, message ERROR, metadata hỏng (zod parse lỗi thì coi như không có panel).
  - `clarification-answers`: mọi quy tắc validate giống phía server.
  - `stripLegacyAskUserForm` (chuyển các test cũ sang).
- **Component (Testing Library):**
  - `clarification-panel`: nút gửi bị disable khi còn tab trống; chọn "Khác" thì phải nhập text; Esc
    huỷ; hiện lỗi `4010` đúng tab.
  - `question-course-table`: thêm và xoá dòng, giới hạn 30 dòng, nhập điểm chữ.
  - `answered-clarification-card`: hiển thị bảng môn.
- **Stream:** `use-chat-stream.test.ts` thêm các ca event `clarification` và `clarification_closed`.
- **E2E (Playwright, desktop + mobile):** mock SSE có panel 3 tab (choice, number, course_table) → trả
  lời hết → request có đúng `clarification` → card có border hiện ra → reload thì card vẫn còn. Một kịch
  bản khác: panel mở → reload → panel vẫn còn → Huỷ → composer mở lại. Chụp screenshot ở 375px và
  1280px theo `ui-rules.md`.

## Boundaries

- **Always:** validate phía client nhưng vẫn coi server là nơi quyết định cuối cùng; dẫn xuất trạng
  thái từ messages; zod `.strict()` cho metadata.
- **Ask first:** thêm dependency (framer-motion...); đổi vị trí panel; cho phép gửi khi chưa trả lời
  hết.
- **Never:** parse JSON trong text để mở panel; tự gửi kèm `origin` hay `field`; dùng màu hex tuỳ ý.

## Success Criteria

- [ ] Panel 3 tab hoạt động bằng chuột lẫn bàn phím. Nút gửi chỉ bật khi đủ câu trả lời. Esc huỷ được.
- [ ] Composer bị khoá khi panel mở và mở lại ngay sau khi gửi hoặc huỷ.
- [ ] Sau khi gửi, lượt USER hiện thành card có border. Reload vẫn y hệt.
- [ ] Reload khi panel đang mở thì panel hiện lại, kèm bản nháp từ `sessionStorage` nếu có.
- [ ] Message cũ có fence không lộ JSON.
- [ ] `lint`, `format:check`, `typecheck`, `build`, `test`, `test:e2e` đều xanh. Có screenshot ở 375px
      và 1280px.
