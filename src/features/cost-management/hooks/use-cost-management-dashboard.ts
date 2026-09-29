import { useSearchParams } from "react-router-dom"

export type CostManagementTab =
  "overview" | "budgets" | "alerts" | "pricing" | "history"

const DEFAULT_TAB: CostManagementTab = "overview"
const TAB_PARAM_KEY = "tab"
const VALID_TABS: readonly CostManagementTab[] = [
  "overview",
  "budgets",
  "alerts",
  "pricing",
  "history",
]

function isCostManagementTab(value: string): value is CostManagementTab {
  return (VALID_TABS as readonly string[]).includes(value)
}

export function useCostManagementDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTab = searchParams.get(TAB_PARAM_KEY) ?? DEFAULT_TAB
  const activeTab = isCostManagementTab(rawTab) ? rawTab : DEFAULT_TAB

  const setActiveTab = (tab: CostManagementTab) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (tab === DEFAULT_TAB) {
          next.delete(TAB_PARAM_KEY)
        } else {
          next.set(TAB_PARAM_KEY, tab)
        }
        return next
      },
      { replace: true }
    )
  }

  return { activeTab, setActiveTab }
}
