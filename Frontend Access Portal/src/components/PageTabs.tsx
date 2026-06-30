import { Button } from "@/components/ui/button"
import { RefreshCcwIcon, X } from "lucide-react"
import { textVariants } from "./text-variants"

interface Tab {
  id: string
  title: string
  closable?: boolean
}

interface PageTabsProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  isRefreshable: boolean
}

export function PageTabs({ tabs, activeTabId, onTabClick, onTabClose, isRefreshable }: PageTabsProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md border-b-2 cursor-pointer transition-colors group relative ${activeTabId === tab.id
                  ? textVariants.active
                  : textVariants.inactive
                }`}
              onClick={() => onTabClick(tab.id)}
            >
              <span className={textVariants.tab}>
                {tab.title}
              </span>
              {tab.closable && onTabClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabClose(tab.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {isRefreshable && <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="icon" className="hidden sm:flex p-2">
            <RefreshCcwIcon className="opacity-60" />
          </Button>
        </div>}
      </div>
    </header>
  )
}
