"use client"

import { UserButton } from "@clerk/nextjs"
import { formatDistanceToNowStrict } from "date-fns"
import { PlusIcon, UsersIcon } from "lucide-react"
import { useRef } from "react"

import { Button } from "@boops/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@boops/ui/components/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
} from "@boops/ui/components/sidebar"

import { BotDialog, type BotDialogHandle } from "@/components/bot-dialog"
import { ChatAvatar } from "@/components/chat-avatar"
import type { ChatListItem } from "@/queries/bots"

export function AppSidebar({
  chats,
  ...props
}: React.ComponentProps<typeof Sidebar> & { chats: ChatListItem[] }) {
  const botDialog = useRef<BotDialogHandle>(null)

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex-row justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="secondary" size="icon" aria-label="Create" />
            }
          >
            <PlusIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => botDialog.current?.open()}>
                <PlusIcon />
                Create new bot
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UsersIcon />
                Create group chat
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <BotDialog ref={botDialog} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton size="lg">
                    <ChatAvatar seed={chat.avatar} />
                    <div className="grid flex-1 leading-tight">
                      <div className="flex items-baseline gap-2">
                        <span className="flex-1 truncate font-medium">
                          {chat.name}
                        </span>
                        {/* Relative to now, so server and client can differ */}
                        <time
                          dateTime={chat.lastMessageAt.toISOString()}
                          className="text-xs text-muted-foreground"
                          suppressHydrationWarning
                        >
                          {formatDistanceToNowStrict(chat.lastMessageAt)}
                        </time>
                      </div>
                      {chat.lastMessagePreview && (
                        <span className="truncate text-xs text-muted-foreground">
                          {chat.lastMessagePreview}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
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
