type WorkspacePlaceholderPageProps = {
  title: string
  description?: string
}

export function WorkspacePlaceholderPage({
  title,
  description,
}: WorkspacePlaceholderPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 p-10 text-center">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
