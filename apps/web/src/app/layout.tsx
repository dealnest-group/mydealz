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
  title: 'MyDealz — AI-Verified UK Deals',
  description: 'AI-curated deals from top UK retailers. Every discount verified for authenticity.',
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
