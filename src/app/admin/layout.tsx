'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './adminLayout.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    // A quick way to clear the session cookie would be an API call, or just document.cookie
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/admin/login')
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-card">
        <div className="admin-brand">
          <h2>Daisy Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
          <Link href="/admin/products" className={`nav-link ${pathname.includes('/admin/products') ? 'active' : ''}`}>Products</Link>
          <Link href="/admin/orders" className={`nav-link ${pathname.includes('/admin/orders') ? 'active' : ''}`}>Orders</Link>
        </nav>
        <div className="admin-footer">
          <button onClick={handleLogout} className="btn logout-btn">Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <h3>Welcome back, Daisy</h3>
          <Link href="/" className="btn btn-outline" target="_blank">View Store</Link>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
