import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center p-6">
      <SignUp />
    </div>
  )
}
