"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        setError(result.error)
      } else {
        // Redirect to dashboard on successful login
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-[#111111]/50 border-[#374151]/30 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-slate-100">Welcome back</CardTitle>
        <p className="text-muted-foreground text-center">Sign in to your account</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="relative p-4 text-sm bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-500 font-medium">Authentication Error</p>
                  <p className="text-red-400 mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-slate-200" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-200" htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1A1A1A] border-[#374151] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
              required
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#374151]/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-[#374151] text-slate-200 hover:bg-[#1A1A1A] flex items-center justify-center gap-3"
          onClick={async () => {
            setIsLoading(true)
            setError(null)
            const result = await signInWithGoogle()
            if (result.error) {
              setError(result.error)
              setIsLoading(false)
            } else {
              setIsLoading(false)
              router.push('/dashboard')
            }
          }}
          disabled={isLoading}
        >
          <Image
            src="/google-logo.svg"
            alt="Google"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="text-[#8B5CF6] hover:text-[#A855F7] font-medium">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
