import { FeatureComingSoon } from "@/components/shared/feature-coming-soon"
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
        <CardContent className="py-12">
          <FeatureComingSoon
            description="Không gian này đang được hoàn thiện và sẽ sớm có mặt trên UniSage."
            title={title}
          />
        </CardContent>
      </Card>
    </div>
  )
}
