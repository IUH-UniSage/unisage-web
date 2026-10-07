import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TOUR_ANCHORS,
  tabPanelTourAnchor,
  tabTourAnchor,
  tourAnchor,
} from "@/constants/tour-anchors"

type TabbedListPageTab = {
  content: ReactNode
  icon: ReactNode
  label: string
  value: string
}

type TabbedListPageProps = {
  actions?: ReactNode
  description: string
  kicker: string
  onTabChange: (value: string) => void
  tabs: TabbedListPageTab[]
  title: string
  value: string
}

export function TabbedListPage({
  actions,
  description,
  kicker,
  onTabChange,
  tabs,
  title,
  value,
}: TabbedListPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div {...tourAnchor(TOUR_ANCHORS.pageHeader)}>
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {kicker}
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {actions}
      </div>

      <Tabs onValueChange={onTabChange} value={value}>
        <TabsList
          {...tourAnchor(TOUR_ANCHORS.pageTabs)}
          className="w-full justify-start gap-1.5 bg-transparent p-0 md:w-auto"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              {...tabTourAnchor(tab.value)}
              className="flex-none px-1.5 md:px-3"
              key={tab.value}
              value={tab.value}
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            {...tabPanelTourAnchor(tab.value)}
            className="mt-2"
            key={tab.value}
            value={tab.value}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
