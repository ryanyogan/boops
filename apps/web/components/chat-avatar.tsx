import { Avatar, Style, type StyleOptions } from "@dicebear/core"
import gaze from "@dicebear/styles/gaze.json" with { type: "json" }
import Image from "next/image"

import { cn } from "@workspace/ui/lib/utils"

const style = new Style(gaze)

type ChatAvatarProps = {
  seed: string
  animation?: StyleOptions<typeof gaze>["animationVariant"]
  className?: string
}

export function ChatAvatar({ seed, animation, className }: ChatAvatarProps) {
  // The options validator rejects an explicit undefined variant
  const src = new Avatar(style, {
    seed,
    ...(animation && { animationVariant: animation }),
  }).toDataUri()

  return (
    <Image
      src={src}
      alt=""
      width={32}
      height={32}
      unoptimized
      className={cn("size-8 shrink-0 rounded-full", className)}
    />
  )
}
