import type { Metadata } from 'next'
import './globals.css'
import SocialIcons from '@/components/SocialIcons'

export const metadata: Metadata = {
  title: 'Daisy | Premium Accessories',
  description: 'Anti-tarnish jewellery, scrunchies, and beautiful accessories for women.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SocialIcons />
      </body>
    </html>
  )
}
