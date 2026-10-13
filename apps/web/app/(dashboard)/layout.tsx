import { SidebarInset, SidebarProvider } from "@boops/ui/components/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { getChats } from "@/queries/bots"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const chats = await getChats()

  return (
    <SidebarProvider>
      <AppSidebar chats={chats} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
