import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Okei Agency',
  description: 'Management system for digital marketing agencies',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} dark h-full antialiased`}>
      <body className="min-h-full">
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
