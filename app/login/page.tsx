import { AuthLayout } from "@/components/layout/AuthLayout"
import { LoginForm } from "@/components/views/LoginForm"

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
