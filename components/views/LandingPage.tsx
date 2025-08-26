"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouse = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setMousePos({ x, y })
    }
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useRevealOnScroll()

  return (
    <main className="relative min-h-screen bg-[#0B0B0B] text-slate-100 overflow-x-clip">
      <DynamicBackground mousePos={mousePos} scrollY={scrollY} isLoaded={isLoaded} />

      <div className="relative z-10">
        <NavBar />

        <HeroSection isLoaded={isLoaded} />

        <KeyBenefits />

        <HowItWorks />

        <Differentiator />

        <Testimonials />

        <ClosingCTA />

        <Footer />
      </div>
    </main>
  )
}

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 ${className}`}>
      {children}
    </div>
  )
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#06B6D4] bg-clip-text text-transparent">
      {children}
    </span>
  )
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 will-change-transform hover:-translate-y-2 hover:bg-white/8 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)] ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#06B6D4]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {children}
    </div>
  )
}

function DynamicBackground({ mousePos, scrollY, isLoaded }: { mousePos: { x: number; y: number }; scrollY: number; isLoaded: boolean }) {
  const intensity = 80
  const t1 = `translate3d(${(mousePos.x - 0.5) * intensity}px, ${(mousePos.y - 0.5) * intensity}px, 0)`
  const t2 = `translate3d(${(0.5 - mousePos.x) * intensity}px, ${(0.5 - mousePos.y) * intensity}px, 0)`
  const t3 = `translate3d(${(mousePos.x - 0.5) * intensity * 0.7}px, ${(0.5 - mousePos.y) * intensity * 0.7}px, 0)`
  
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Enhanced gradient glows with parallax */}
      <div 
        className={`absolute left-1/2 top-[-15%] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#8B5CF6]/40 via-[#A855F7]/30 to-[#06B6D4]/25 blur-[160px] transition-transform duration-700 ${isLoaded ? 'animate-pulse' : ''}`} 
        style={{ transform: `${t1} translateY(${scrollY * 0.1}px)` }} 
      />
      <div 
        className={`absolute right-[-15%] top-[15%] h-[600px] w-[600px] rounded-full bg-gradient-to-r from-[#06B6D4]/35 via-[#8B5CF6]/25 to-[#A855F7]/20 blur-[140px] transition-transform duration-700 ${isLoaded ? 'animate-pulse' : ''}`} 
        style={{ transform: `${t2} translateY(${scrollY * -0.05}px)` }} 
      />
      <div 
        className={`absolute left-[-15%] bottom-[-15%] h-[700px] w-[700px] rounded-full bg-gradient-to-r from-[#A855F7]/30 via-[#8B5CF6]/25 to-[#06B6D4]/20 blur-[160px] transition-transform duration-700 ${isLoaded ? 'animate-pulse' : ''}`} 
        style={{ transform: `${t3} translateY(${scrollY * 0.08}px)` }} 
      />
      
      {/* Morphing shapes */}
      <div className="absolute left-[10%] top-[20%] w-32 h-32 bg-gradient-to-r from-[#8B5CF6]/20 to-[#A855F7]/20 rounded-full blur-xl animate-morph" />
      <div className="absolute right-[15%] top-[60%] w-24 h-24 bg-gradient-to-r from-[#06B6D4]/20 to-[#8B5CF6]/20 rounded-full blur-xl animate-morph-delayed" />
      <div className="absolute left-[20%] bottom-[30%] w-40 h-40 bg-gradient-to-r from-[#A855F7]/15 to-[#06B6D4]/15 rounded-full blur-xl animate-morph-slow" />
      
      {/* Enhanced floating particles */}
      <div className="absolute left-[20%] top-[30%] h-2 w-2 rounded-full bg-[#8B5CF6]/60 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute right-[25%] top-[40%] h-1.5 w-1.5 rounded-full bg-[#06B6D4]/50 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute left-[30%] bottom-[35%] h-1 w-1 rounded-full bg-[#A855F7]/70 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute right-[35%] bottom-[25%] h-2.5 w-2.5 rounded-full bg-[#8B5CF6]/40 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute left-[45%] top-[60%] h-1.5 w-1.5 rounded-full bg-[#06B6D4]/60 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute right-[10%] top-[80%] h-1 w-1 rounded-full bg-[#A855F7]/80 animate-float" style={{ animationDelay: '2.5s' }} />
      <div className="absolute left-[60%] top-[10%] h-2 w-2 rounded-full bg-[#8B5CF6]/50 animate-float" style={{ animationDelay: '3s' }} />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-fade" />
      
      {/* Radial overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(139,92,246,0.08)_0%,rgba(139,92,246,0)_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(6,182,212,0.06)_0%,rgba(6,182,212,0)_60%)]" />
      
      {/* Animated lines */}
      <div className="absolute top-[30%] left-[5%] w-32 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent animate-line-sweep" />
      <div className="absolute top-[70%] right-[10%] w-24 h-px bg-gradient-to-r from-transparent via-[#06B6D4]/30 to-transparent animate-line-sweep-delayed" />
      <div className="absolute bottom-[20%] left-[20%] w-40 h-px bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent animate-line-sweep-slow" />
    </div>
  )
}

function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0B]/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Image src="/placeholder-logo.svg" alt="ReadyQueue" width={28} height={28} className="transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#A855F7]/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-200 group-hover:text-white transition-colors duration-300">ReadyQueue</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-slate-300 sm:flex">
          <a href="#features" className="hover:text-white transition-colors duration-300 relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#how" className="hover:text-white transition-colors duration-300 relative group">
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#why" className="hover:text-white transition-colors duration-300 relative group">
            Why ReadyQueue
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#testimonials" className="hover:text-white transition-colors duration-300 relative group">
            Love
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] transition-all duration-300 group-hover:w-full" />
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors duration-300">Sign in</Link>
          <Link href="/register" className="inline-block">
            <Button className="relative bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_25px_rgba(139,92,246,0.3)] group overflow-hidden">
              <span className="relative z-10">Start Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  )
}

function HeroSection({ isLoaded }: { isLoaded: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center reveal-up">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <GradientText>Instant Productivity.</GradientText>
            <br />
            Zero Fluff.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            No lock-in. No clutter. Just a sleek, powerful Kanban that gets out of your way
            so you can start doing — in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button className="h-11 px-6 text-base font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white shadow-[0_0_0_0_rgba(139,92,246,0.6)] hover:shadow-[0_0_0_8px_rgba(139,92,246,0.15)] transition-all duration-300 hover:scale-105">
                Start Free
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="h-11 px-6 text-base border-white/15 text-slate-200 hover:bg-white/5 transition-all duration-300 hover:scale-105">
                See Features
              </Button>
            </Link>
          </div>
        </div>

        <GlassCard className="mx-auto mt-14 max-w-5xl p-2 shadow-2xl shadow-black/40 reveal-up">
          <div className="group relative overflow-hidden rounded-xl">
            <div className="relative overflow-hidden">
              <Image
                src="/placeholder.jpg"
                alt="ReadyQueue Dashboard"
                width={1200}
                height={700}
                className="w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-transparent to-white/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </GlassCard>
      </Container>
    </section>
  )
}

function Benefit({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <GlassCard className="p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-white/7 group">
      <div className="mb-4 h-10 w-10 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#8B5CF6]">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/5 to-[#A855F7]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </GlassCard>
  )
}

function KeyBenefits() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <Container>
        <div className="mb-10 text-center reveal-up">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Everything you need. <GradientText>Nothing you don't.</GradientText>
          </h2>
          <p className="mt-3 text-slate-300">Get productive fast with a lean, beautiful workflow.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Benefit
            icon={<LightningIcon />}
            title="Instant Onboarding"
            description="Sign up and ship tasks in under a minute. Zero setup, zero friction."
          />
          <Benefit
            icon={<UnlockIcon />}
            title="No Lock‑in"
            description="Your tasks, your flow. No proprietary traps or complicated ecosystems."
          />
          <Benefit
            icon={<SparklesIcon />}
            title="Clean, Dark, Focused"
            description="Modern dark UI with glassmorphism, gradients, and micro-animations — without clutter."
          />
        </div>
      </Container>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="py-16 sm:py-24">
      <Container>
        <div className="mb-10 text-center reveal-up">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Three steps to <GradientText>flow state</GradientText>
          </h2>
          <p className="mt-3 text-slate-300">From zero to productive in seconds.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <GlassCard className="p-6 reveal-up group">
            <div className="mb-3 text-sm font-semibold text-[#A855F7] transition-colors duration-300 group-hover:text-[#8B5CF6]">Step 1</div>
            <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-white">Sign up instantly</h3>
            <p className="mt-2 text-sm text-slate-300">Create your account in seconds — email or Google — and you're in.</p>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#A855F7]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </GlassCard>
          <GlassCard className="p-6 reveal-up [animation-delay:120ms] group">
            <div className="mb-3 text-sm font-semibold text-[#A855F7] transition-colors duration-300 group-hover:text-[#8B5CF6]">Step 2</div>
            <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-white">Add tasks without setup</h3>
            <p className="mt-2 text-sm text-slate-300">No templates to wrangle. Just type, set priority, and go.</p>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#A855F7]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </GlassCard>
          <GlassCard className="p-6 reveal-up [animation-delay:240ms] group">
            <div className="mb-3 text-sm font-semibold text-[#A855F7] transition-colors duration-300 group-hover:text-[#8B5CF6]">Step 3</div>
            <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-white">Start working productively</h3>
            <p className="mt-2 text-sm text-slate-300">Drag, drop, and finish. Real‑time updates keep everything in sync.</p>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#A855F7]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </GlassCard>
        </div>
      </Container>
    </section>
  )
}

function Differentiator() {
  return (
    <section id="why" className="py-16 sm:py-24">
      <Container>
        <div className="mb-10 text-center reveal-up">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Why ReadyQueue, not another <GradientText>productivity app?</GradientText>
          </h2>
          <p className="mt-3 text-slate-300">We focus on outcomes, not features for features' sake.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <GlassCard className="p-6 group">
            <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-red-400">Other Apps</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Feature bloat and complexity
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Ecosystem lock‑in and proprietary formats
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Busy interfaces and distractions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                Slow to start, slower to maintain
              </li>
            </ul>
          </GlassCard>
          <GlassCard className="p-6 reveal-up group">
            <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-green-400">ReadyQueue</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Lean, fast, and focused on doing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                No lock‑in — your workflow, your rules
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Clean dark UI that fades into the background
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Start free, start now
              </li>
            </ul>
          </GlassCard>
        </div>
      </Container>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-24">
      <Container>
        <div className="mb-10 text-center reveal-up">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Users who <GradientText>get it</GradientText>
          </h2>
          <p className="mt-3 text-slate-300">"Finally a productivity tool that doesn't slow me down."</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <GlassCard className="p-6 reveal-up group">
            <p className="text-sm text-slate-200 transition-colors duration-300 group-hover:text-white">"Instantly clicked. I signed up and moved my tasks in minutes."</p>
            <div className="mt-4 text-xs text-slate-400">Student • Early Access</div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </GlassCard>
          <GlassCard className="p-6 reveal-up [animation-delay:120ms] group">
            <p className="text-sm text-slate-200 transition-colors duration-300 group-hover:text-white">"The first app that feels invisible — just lets me work."</p>
            <div className="mt-4 text-xs text-slate-400">Developer • Early Access</div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#A855F7]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </GlassCard>
          <GlassCard className="p-6 reveal-up [animation-delay:240ms] group">
            <p className="text-sm text-slate-200 transition-colors duration-300 group-hover:text-white">"No fluff, no noise. Exactly what I wanted."</p>
            <div className="mt-4 text-xs text-slate-400">Creator • Early Access</div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#06B6D4]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </GlassCard>
        </div>
      </Container>
    </section>
  )
}

function ClosingCTA() {
  return (
    <section className="relative py-16 sm:py-24">
      <Container>
        <GlassCard className="p-10 text-center reveal-up group">
          <h3 className="text-2xl font-bold sm:text-3xl lg:text-4xl transition-colors duration-300 group-hover:text-white">
            Productivity without the <GradientText>baggage</GradientText>
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Get started free today. No credit card. No lock‑in. Just momentum.
          </p>
          <div className="mt-8 relative z-10">
                         <a 
               href="/register" 
               className="inline-block relative h-10 px-4 text-base font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white shadow-[0_0_0_0_rgba(139,92,246,0.6)] hover:shadow-[0_0_0_8px_rgba(139,92,246,0.15)] transition-all duration-300 hover:scale-105 cursor-pointer rounded-md leading-10 text-center"
             >
               Start Free
             </a>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#06B6D4]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </GlassCard>
      </Container>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-slate-400 group">
          <Image src="/placeholder-logo.svg" alt="ReadyQueue" width={20} height={20} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="text-xs transition-colors duration-300 group-hover:text-slate-300">© {new Date().getFullYear()} ReadyQueue</span>
        </div>
        <div className="text-xs text-slate-400">
          Currently free — accessible for everyone
        </div>
      </Container>
    </footer>
  )
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
      <path d="M7 10V7a5 5 0 019.9-1M6 10h12v10H6V10z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
      <path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4zm6 10l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    </svg>
  )
}

function useRevealOnScroll() {
  const refs = useRef<HTMLElement[]>([])
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(`.reveal-up`))
    refs.current = elements
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("show")
        }
      },
      { threshold: 0.12 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}



