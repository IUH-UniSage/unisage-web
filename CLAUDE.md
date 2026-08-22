# unisage-web

Frontend cho hệ thống UniSage (React 19 + Vite + TanStack Query + Zod + shadcn/ui).

## Commands

- Dev server: `npm run dev` (mặc định port 5173; nếu bị chiếm, Vite tự nhảy sang port khác — nhớ cập nhật lại CORS whitelist ở gateway nếu vậy)
- **Typecheck: `npm run typecheck`** (chạy `tsc -b`). KHÔNG dùng `npx tsc --noEmit` trực tiếp — project dùng TypeScript project references, `tsc --noEmit` ở root đọc `tsconfig.json` (chỉ có `references`, không có `include`) nên type-check **0 file** và luôn báo sạch giả.
- Lint: `npm run lint` / tự fix: `npx eslint --fix <file>`
- Test: `npm test` (Vitest) — chạy `npx vitest run` cho CI-style, không watch
- E2E: `npm run test:e2e` (Playwright)

Pre-commit hook (husky + lint-staged) tự chạy eslint --fix + prettier trên file staged.

## Kết nối Backend

`.env`: `VITE_API_BASE_URL` phải trỏ vào **API Gateway** (`unisage-gateway`, port 8400) với prefix `/api/v1/master`, KHÔNG gọi thẳng `unisage-backend` (port 8401). Gateway forward `/api/v1/master/**` → backend `/api/v1/**`.

## Cấu trúc thư mục — quy ước `lib/` vs `utils/`

- `lib/` (cả root `src/lib/` và trong từng feature `features/*/lib/`): chỉ chứa **cấu hình/wrapper thư viện ngoài** (axios client, react-query client, `cn()` từ clsx+tailwind-merge — bị shadcn hardcode path này, không được dời).
- `utils/`: **logic tự viết**, không phụ thuộc thư viện ngoài (permissions, api-response parsing, formatters, date/uuid/local-storage helpers).
- `types/`: KHÔNG dùng nữa — types dùng chung ít nên đã gộp vào file utils liên quan (vd `ApiResponse`/`PageResponse` nằm trong `utils/api-response.ts`).

## RBAC / Permission — nguồn sự thật là backend

`src/utils/permissions.ts` (hằng số `PERMISSIONS`) PHẢI khớp chính xác với `PredefinedPermissions.java` bên `unisage-backend` (format `<RESOURCE>_<ACTION>`, toàn chữ hoa gạch dưới). Trước khi thêm/sửa permission nào, kiểm tra file đó bên backend trước — đừng tự bịa tên permission cho tính năng chưa có API thật (dễ tạo permission "ảo" không bao giờ khớp).

`src/constants/api-endpoints.ts`: mọi endpoint gọi API tập trung ở đây theo namespace (vd `API_ENDPOINTS.rbac.roles`), không viết string endpoint rải rác trong từng file `*-api.ts`.

`src/constants/error-codes.ts`: map error code backend trả (`ErrorCode.java`) sang message tiếng Việt do FE tự viết — không hiển thị thẳng message backend trả (thường cứng/không tự nhiên). Thêm code mới vào đây khi backend thêm `ErrorCode` mới.

## Git

Nhánh đặt tên theo Epic Jira đang làm khi công việc trải dài nhiều ticket con của epic đó: `feature/<tên>-unisage-<epic-id>-<slug>` (vd `feature/huyen-unisage-45-auth-access-control`). Không tạo nhánh mới cho từng ticket con nếu chúng thuộc cùng epic đang active.
