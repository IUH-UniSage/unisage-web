import { afterEach, describe, expect, it, vi } from "vitest"

import { TOUR_ANCHORS, tourAnchorSelector } from "@/constants/tour-anchors"
import { buildDriveSteps } from "@/features/product-tour/utils/tour-steps"
import {
  hasSeenTour,
  markToursSeen,
  pageTourKey,
} from "@/features/product-tour/utils/tour-storage"

// jsdom does no layout, so every element reports zero client rects; mark
// the ones a test wants "on screen" explicitly.
function renderAnchors(markup: string, visibleSelectors: string[]) {
  document.body.innerHTML = markup
  const visible = new Set(
    visibleSelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector))
    )
  )

  vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (
    this: Element
  ) {
    return (visible.has(this) ? [{}] : []) as unknown as DOMRectList
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ""
  window.localStorage.clear()
})

describe("buildDriveSteps", () => {
  it("drops steps whose anchor is missing or hidden and keeps centered steps", () => {
    renderAnchors(
      `<div data-tour="page-header"></div>
       <nav data-tour="sidebar-nav" id="hidden-nav"></nav>`,
      [tourAnchorSelector(TOUR_ANCHORS.pageHeader)]
    )

    const steps = buildDriveSteps([
      { description: "intro", title: "Welcome" },
      { anchor: TOUR_ANCHORS.sidebarNav, description: "nav", title: "Nav" },
      { anchor: TOUR_ANCHORS.pageHeader, description: "head", title: "Head" },
      { anchor: TOUR_ANCHORS.dataTable, description: "table", title: "Table" },
    ])

    expect(steps.map((step) => step.popover?.title)).toEqual([
      "Welcome",
      "Head",
    ])
    expect(steps[0].element).toBeUndefined()
    expect(steps[1].element).toBe(
      document.querySelector(tourAnchorSelector(TOUR_ANCHORS.pageHeader))
    )
  })

  it("targets the visible copy when an anchor is rendered more than once", () => {
    renderAnchors(
      `<table data-tour="data-table" id="in-closed-dialog"></table>
       <table data-tour="data-table" id="on-page"></table>`,
      ["#on-page"]
    )

    const [step] = buildDriveSteps([
      { anchor: TOUR_ANCHORS.dataTable, description: "d", title: "t" },
    ])

    expect(step.element).toBe(document.getElementById("on-page"))
  })
})

describe("tour storage", () => {
  it("remembers tours that were shown", () => {
    expect(hasSeenTour(pageTourKey("admin-users"))).toBe(false)

    markToursSeen([pageTourKey("admin-users")])
    markToursSeen([pageTourKey("documents")])

    expect(hasSeenTour(pageTourKey("admin-users"))).toBe(true)
    expect(hasSeenTour(pageTourKey("documents"))).toBe(true)
    expect(hasSeenTour(pageTourKey("categories"))).toBe(false)
  })
})
