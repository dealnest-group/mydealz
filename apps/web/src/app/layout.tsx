import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Header, SplashScreen } from '@mydealz/ui'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'MyDealz — Your Personal AI Savings Companion',
  description: 'Save Smarter. Every Time. AI-verified deals from top UK retailers, personalised to what you love.',
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
    <html lang="en" className={font.variable}>
      <body>
        <SplashScreen />
        <Header user={user ? { email: user.email } : null} />
        {children}
      </body>
    </html>
  )
}
