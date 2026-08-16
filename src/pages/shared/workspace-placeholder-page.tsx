import { Construction } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type WorkspacePlaceholderPageProps = {
  title: string
}

export function WorkspacePlaceholderPage({
  title,
}: WorkspacePlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-5 grid size-14 place-items-center rounded-xl bg-secondary">
            <Construction aria-hidden="true" className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Nền tảng định tuyến và không gian làm việc đã sẵn sàng. Tính năng
            này sẽ được hoàn thiện trong giai đoạn tương ứng.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
