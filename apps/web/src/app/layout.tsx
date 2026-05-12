import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Header, SplashScreen } from '@mydealz/ui'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'MyDealz — Your Personal AI Savings Companion',
  description: 'Save Smarter. Every Time. AI-verified deals from top UK retailers, personalised to what you love.',
  icons: {
    icon: '/logos/mydealz-icon.svg',
    apple: '/logos/mydealz-icon.svg',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Record<string, string>
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" className={`${fontDisplay.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SplashScreen />
        <Header user={user ? { email: user.email } : null} />
        {children}
      </body>
    </html>
  )
}
