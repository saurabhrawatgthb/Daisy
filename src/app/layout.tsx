import type { Metadata, Viewport } from 'next'
import './globals.css'
import SocialIcons from '@/components/SocialIcons'

export const metadata: Metadata = {
  title: 'Daisy | Premium Accessories & Jewellery',
  description: 'Handcrafted anti-tarnish jewellery, satin scrunchies, and beautiful accessories for women.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f8c8dc',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Ambient Floating Gradient Orbs for Frosted Glass Effect */}
        <div className="ambient-background-container" aria-hidden="true">
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          <div className="ambient-orb orb-3"></div>
          <div className="ambient-orb orb-4"></div>
        </div>
        <div className="app-content-wrapper">
          {children}
        </div>
        <SocialIcons />
      </body>
    </html>
  )
}
