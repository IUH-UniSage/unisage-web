import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, LifeBuoy, Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES, ticketDetailPath } from "@/constants/paths"
import { TOUR_ANCHORS, tourAnchor } from "@/constants/tour-anchors"
import { useCreateTicketMutation } from "@/features/support-tickets/queries/use-mutations"
import {
  createGeneralTicketFormSchema,
  generalTicketTypeSchema,
  TICKET_DESCRIPTION_MAX_LENGTH,
  TICKET_TITLE_MAX_LENGTH,
  TICKET_TYPE_LABELS,
  type CreateGeneralTicketFormValues,
} from "@/features/support-tickets/schemas/ticket-schemas"
import { applyFieldErrors, getErrorMessage } from "@/utils/error-handler"

// "Tạo yêu cầu" (/tickets/new): a request to the school that is not about one chat
// answer - those are reported from the flag under the answer. Students, parents and
// lecturers all use it, so the wording stays neutral.
export function CreateTicketView() {
  const navigate = useNavigate()
  const createTicket = useCreateTicketMutation()
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateGeneralTicketFormValues>({
    defaultValues: { description: "", title: "", type: "GENERAL_QUESTION" },
    resolver: zodResolver(createGeneralTicketFormSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const ticket = await createTicket.mutateAsync(values)
      await navigate(ticketDetailPath(ticket.id), { replace: true })
    } catch (error) {
      if (!applyFieldErrors(error, setError)) {
        setError("root", { message: getErrorMessage(error) })
      }
    }
  })

  return (
    <div className="mx-auto mt-6 mb-8 w-full max-w-[1000px] space-y-6 px-4">
      <div
        {...tourAnchor(TOUR_ANCHORS.pageHeader)}
        className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/75 p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-white/15 text-white sm:size-14">
            <LifeBuoy aria-hidden="true" className="size-6 sm:size-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/80">Hỗ trợ</p>
            <h1 className="text-xl font-bold text-white sm:truncate sm:text-2xl">
              Tạo yêu cầu hỗ trợ
            </h1>
            <p className="text-sm text-white/80">
              Cán bộ nhà trường sẽ phản hồi trong trang chi tiết yêu cầu.
            </p>
          </div>
        </div>

        <Button
          asChild
          className="shrink-0 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          variant="outline"
        >
          <Link to={ROUTES.tickets}>
            <ArrowLeft aria-hidden="true" className="mr-2 size-4" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>

      <Card className="border bg-card shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Nội dung yêu cầu
          </CardTitle>
          <CardDescription>
            Muốn báo một câu trả lời sai của trợ lý? Dùng biểu tượng lá cờ ngay
            dưới câu trả lời đó trong khung chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" noValidate onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="general-ticket-type">Loại yêu cầu</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className="w-full sm:w-80"
                      id="general-ticket-type"
                    >
                      <SelectValue placeholder="Chọn loại yêu cầu" />
                    </SelectTrigger>
                    <SelectContent>
                      {generalTicketTypeSchema.options.map((type) => (
                        <SelectItem key={type} value={type}>
                          {TICKET_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type ? (
                <p className="text-xs text-destructive">
                  {errors.type.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="general-ticket-title">Tiêu đề</Label>
              <Input
                aria-invalid={errors.title ? true : undefined}
                id="general-ticket-title"
                maxLength={TICKET_TITLE_MAX_LENGTH}
                placeholder="Ví dụ: Không đăng nhập được bằng mã số"
                {...register("title")}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="general-ticket-description">Mô tả</Label>
              <Textarea
                aria-invalid={errors.description ? true : undefined}
                id="general-ticket-description"
                maxLength={TICKET_DESCRIPTION_MAX_LENGTH}
                placeholder="Bạn cần hỗ trợ điều gì? Ghi rõ thời điểm, thao tác đã làm và thông báo lỗi (nếu có)."
                rows={6}
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            {errors.root ? (
              <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
                {errors.root.message}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button asChild type="button" variant="outline">
                <Link to={ROUTES.tickets}>Hủy</Link>
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2
                    aria-hidden="true"
                    className="mr-2 size-4 animate-spin"
                  />
                ) : null}
                Gửi yêu cầu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
