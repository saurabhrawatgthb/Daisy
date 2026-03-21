'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './adminLayout.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Poll for new/pending orders every 30 seconds
  useEffect(() => {
    if (pathname === '/admin/login') return

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/admin/orders/count')
        const data = await res.json()
        setPendingCount(data.count || 0)
      } catch { /* silent */ }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [pathname])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/admin/login')
  }

  return (
    <div className="admin-container">
      {mobileMenuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`admin-sidebar glass-card ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Daisy Admin</h2>
          <button className="admin-hamburger" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(false)}>×</button>
        </div>
        <nav className="admin-nav" onClick={() => setMobileMenuOpen(false)}>
          <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>
            📊 Dashboard
          </Link>
          <Link href="/admin/products" className={`nav-link ${pathname.includes('/admin/products') ? 'active' : ''}`}>
            🛍️ Products
          </Link>
          <Link href="/admin/orders" className={`nav-link ${pathname.includes('/admin/orders') ? 'active' : ''}`}>
            📦 Orders
            {pendingCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#e74c3c',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '20px',
                minWidth: '20px',
                textAlign: 'center',
                animation: 'pulse 1.5s infinite'
              }}>
                {pendingCount}
              </span>
            )}
          </Link>
        </nav>
        <div className="admin-footer">
          <button onClick={handleLogout} className="btn logout-btn">Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="admin-hamburger" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(true)}>☰</button>
            <h3>Welcome back, Daisy 👋</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pendingCount > 0 && (
              <Link href="/admin/orders" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#fff3f3', color: '#e74c3c',
                padding: '6px 14px', borderRadius: '20px',
                fontSize: '0.85rem', fontWeight: 600, border: '1px solid #fcc'
              }}>
                🔔 {pendingCount} order{pendingCount > 1 ? 's need' : ' needs'} attention
              </Link>
            )}
            <Link href="/" className="btn btn-outline" target="_blank">View Store</Link>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  )
}
