"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ShuffleIcon } from "lucide-react"
import { useImperativeHandle, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@boops/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@boops/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@boops/ui/components/field"
import { Input } from "@boops/ui/components/input"
import { Spinner } from "@boops/ui/components/spinner"
import { Textarea } from "@boops/ui/components/textarea"

import { createBot } from "@/actions/bot"
import { ChatAvatar } from "@/components/chat-avatar"
import { createBotSchema, type CreateBotInput } from "@/lib/bot"

const FORM_ID = "bot-form"

const presets = [
  {
    job: "Research assistant",
    instructions:
      "Answer briefly, cite sources, and say so when you aren't sure.",
  },
  {
    job: "Code reviewer",
    instructions:
      "Review for correctness first, then clarity. Point to the exact line and suggest a fix.",
  },
  {
    job: "Writing editor",
    instructions:
      "Tighten the prose without changing the voice. Explain each significant edit.",
  },
  {
    job: "Tutor",
    instructions:
      "Teach step by step, check understanding with questions, and never just hand over the answer.",
  },
]

export type BotDialogHandle = { open: () => void }

export function BotDialog({
  children,
  ref,
}: {
  children?: React.ReactElement
  ref?: React.Ref<BotDialogHandle>
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<CreateBotInput>({
    resolver: zodResolver(createBotSchema),
    defaultValues: { name: "", avatar: "", job: "", instructions: "" },
  })
  const avatar = useWatch({ control: form.control, name: "avatar" })
  const { isSubmitting, errors } = form.formState

  function shuffle() {
    form.setValue("avatar", crypto.randomUUID())
  }

  function onOpenChange(nextOpen: boolean) {
    // Every new bot starts from a blank form and a fresh face
    if (nextOpen) {
      form.reset()
      shuffle()
    }
    setOpen(nextOpen)
  }

  // Lets a caller without a trigger element (a menu item) open the dialog
  useImperativeHandle(ref, () => ({ open: () => onOpenChange(true) }))

  async function onSubmit(data: CreateBotInput) {
    try {
      const bot = await createBot(data)
      toast.success(`${bot.name} is ready.`)
      setOpen(false)
    } catch {
      form.setError("root", {
        message: "Couldn't create the bot. Try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger render={children} />}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New bot</DialogTitle>
          <DialogDescription>
            Give it a face, a name, and a job to do.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.job}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                form.setValue("job", preset.job, { shouldValidate: true })
                form.setValue("instructions", preset.instructions)
              }}
            >
              {preset.job}
            </Button>
          ))}
        </div>
        <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field orientation="horizontal">
              {avatar && <ChatAvatar seed={avatar} className="size-12" />}
              <FieldContent>
                <FieldTitle>Face</FieldTitle>
                <FieldDescription>
                  Shuffle until you find one you like.
                </FieldDescription>
              </FieldContent>
              <Button type="button" variant="outline" onClick={shuffle}>
                <ShuffleIcon data-icon="inline-start" />
                Shuffle
              </Button>
            </Field>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-name`}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={`${FORM_ID}-name`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Ada"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="job"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-job`}>Job</FieldLabel>
                  <Input
                    {...field}
                    id={`${FORM_ID}-job`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Research assistant"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="instructions"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-instructions`}>
                    How it should work
                  </FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id={`${FORM_ID}-instructions`}
                    aria-invalid={fieldState.invalid}
                    placeholder="Answer briefly, cite sources, and ask before running anything destructive."
                    className="min-h-28"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {errors.root && <FieldError errors={[errors.root]} />}
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            Create bot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
