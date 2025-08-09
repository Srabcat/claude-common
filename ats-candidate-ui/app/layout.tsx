import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/layout/navigation'
import { ThemeProvider } from '@/components/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ATS Candidate Platform - World-Class Recruiting Interface',
  description: 'Modern, fast, and intuitive candidate management platform with role-based navigation and advanced filtering.',
  keywords: 'ATS, recruiting, candidates, hiring, talent management',
  authors: [{ name: 'ATS Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}