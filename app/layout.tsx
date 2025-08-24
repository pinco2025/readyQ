import type React from "react"
import { Geist } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="bg-[#1A1A1A] text-[#E5E7EB] font-sans">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'ReadyQueue - Task Management',
  description: 'Reduce cognitive overload through intuitive Kanban organization',
  generator: 'ReadyQueue'
};
