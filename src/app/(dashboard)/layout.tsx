import { Sidebar } from "@/components/shared/sidebar"
import { Topbar } from "@/components/shared/topbar"
import { CommandPaletteWrapper } from "@/components/shared/command-palette-wrapper"
import { ScrollProgress } from "@/components/shared/scroll-progress"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden lg:flex w-[260px] shrink-0 border-r border-border bg-background">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
          {children}
        </main>
      </div>

      <CommandPaletteWrapper />
      <ScrollProgress />
    </div>
  )
}