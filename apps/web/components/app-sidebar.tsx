"use client"

import { UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
} from "@boops/ui/components/sidebar"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton
              showName
              appearance={{
                elements: {
                  rootBox: "flex w-full",
                  userButtonTrigger: sidebarMenuButtonVariants(),
                  userButtonBox: "w-full flex-row-reverse justify-end gap-2",
                  userButtonAvatarBox: "size-6",
                  userButtonOuterIdentifier:
                    "truncate pl-0 text-sm font-normal text-inherit",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
