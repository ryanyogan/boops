"use client"

import { UserButton } from "@clerk/nextjs"
import { formatDistanceToNowStrict } from "date-fns"
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Button } from "@boops/ui/components/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@boops/ui/components/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@boops/ui/components/dropdown-menu"
import { Kbd } from "@boops/ui/components/kbd"
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
  SidebarRail,
  sidebarMenuButtonVariants,
  useSidebar,
} from "@boops/ui/components/sidebar"
import { cn } from "@boops/ui/lib/utils"

import { BotDialog, type BotDialogHandle } from "@/components/bot-dialog"
import { ChatAvatar } from "@/components/chat-avatar"
import type { ChatListItem } from "@/queries/bots"

export function AppSidebar({
  chats,
  ...props
}: React.ComponentProps<typeof Sidebar> & { chats: ChatListItem[] }) {
  const botDialog = useRef<BotDialogHandle>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  // The mobile sheet always shows the expanded sidebar
  const collapsed = state === "collapsed" && !isMobile

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="secondary"
                size="icon"
                aria-label="Create"
                className="self-end"
              />
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
        {collapsed ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full min-w-0 justify-start border-input bg-transparent px-2.5 py-1 text-base font-normal text-muted-foreground md:text-sm dark:bg-input/30"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon data-icon="inline-start" />
            Search
            <Kbd className="ml-auto">⌘K</Kbd>
          </Button>
        )}
        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search chats"
          description="Search for a chat to open"
        >
          {/* Match on the name only; ids are the values so that chats
              sharing a name stay distinct */}
          <Command
            filter={(_value, search, keywords = []) =>
              keywords.join(" ").toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0
            }
          >
            <CommandInput placeholder="Search chats..." />
            <CommandList>
              <CommandEmpty>No chats found.</CommandEmpty>
              <CommandGroup heading="Chats">
                {chats.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    value={chat.id}
                    keywords={[chat.name]}
                    onSelect={() => {
                      setSearchOpen(false)
                      router.push(`/chats/${chat.id}`)
                    }}
                  >
                    <ChatAvatar seed={chat.avatar} className="size-6" />
                    <span className="truncate">{chat.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={chat.name}
                    render={<Link href={`/chats/${chat.id}`} />}
                  >
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
                  // Leave room for the avatar inside the collapsed button
                  userButtonTrigger: cn(
                    sidebarMenuButtonVariants(),
                    "group-data-[collapsible=icon]:p-1!"
                  ),
                  userButtonBox: "w-full flex-row-reverse justify-end gap-2",
                  userButtonAvatarBox: "size-6",
                  userButtonOuterIdentifier:
                    "truncate pl-0 text-sm font-normal text-inherit group-data-[collapsible=icon]:hidden",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
