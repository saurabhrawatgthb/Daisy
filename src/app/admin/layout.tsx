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
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
    router.push('/admin/login')
    router.refresh()
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
          <Link href="/admin/coupons" className={`nav-link ${pathname.includes('/admin/coupons') ? 'active' : ''}`}>
            🎟️ Promo Coupons
          </Link>
          <Link href="/admin/settings" className={`nav-link ${pathname === '/admin/settings' ? 'active' : ''}`}>
            ⚙️ Settings
          </Link>
        </nav>
        <div className="admin-footer">
          <button
            onClick={handleLogout}
            className="btn admin-sidebar-logout-btn"
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: '#e74c3c',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(231, 76, 60, 0.3)'
            }}
          >
            🚪 Logout Admin
          </button>
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
            <Link href="/" className="btn btn-outline" target="_blank" style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
              View Store ↗
            </Link>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                padding: '7px 16px',
                fontSize: '0.85rem',
                background: '#e74c3c',
                borderColor: '#c0392b',
                boxShadow: '0 2px 10px rgba(231, 76, 60, 0.35)',
                color: '#ffffff'
              }}
              title="Sign out of Admin Dashboard"
            >
              🚪 Logout
            </button>
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
