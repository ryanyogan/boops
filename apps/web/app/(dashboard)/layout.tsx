import { cookies } from "next/headers"

import { SidebarInset, SidebarProvider } from "@boops/ui/components/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { getChats } from "@/queries/bots"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [chats, cookieStore] = await Promise.all([getChats(), cookies()])
  // Written by SidebarProvider on every toggle; open unless collapsed before
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar chats={chats} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
