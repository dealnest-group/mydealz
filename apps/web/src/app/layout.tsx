import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyDealz',
  description: 'AI-native personalised deals aggregator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}