'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CartCount from './CartCount'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; name?: string; email: string } | null>(null)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    fetchUser()
    const handleAuthChange = () => fetchUser()
    window.addEventListener('authChanged', handleAuthChange)
    return () => window.removeEventListener('authChanged', handleAuthChange)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.dispatchEvent(new Event('authChanged'))
      router.push('/')
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">Daisy</Link>

        {/* Desktop nav */}
        <nav className="desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/shop?category=Jewellery">Jewellery</Link>
          <Link href="/shop?category=Scrunchies">Scrunchies</Link>
          <Link href="/shop">All Products</Link>
          <Link href="/my-orders">My Orders</Link>
          <Link href="/track">Track Order</Link>
        </nav>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/my-orders" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)', textDecoration: 'none' }}>
                👤 {user.name ? user.name.split(' ')[0] : 'Account'}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--primary-dark)',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: '15px',
                border: '1px solid var(--border)'
              }}
            >
              Sign In
            </Link>
          )}

          <Link href="/wishlist" title="My Wishlist" style={{ color: 'var(--primary-dark)', fontSize: '1.2rem', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
            ❤️
          </Link>

          <Link href="/cart" className="cart-link">
            Cart <CartCount />
          </Link>

          {/* Hamburger button - mobile only */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`ham-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`ham-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`ham-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <nav className="mobile-nav" onClick={() => setMenuOpen(false)}>
          <Link href="/">Home</Link>
          <Link href="/shop?category=Jewellery">Jewellery</Link>
          <Link href="/shop?category=Scrunchies">Scrunchies</Link>
          <Link href="/shop">All Products</Link>
          <Link href="/wishlist">My Wishlist ❤️</Link>
          <Link href="/my-orders">My Orders</Link>
          <Link href="/track">Track Order</Link>
          {user ? (
            <div style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'block', marginBottom: '8px' }}>
                Logged in as <strong>{user.name || user.email}</strong>
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#fbebf7',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: 'var(--primary-dark)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>Sign In / Register</Link>
          )}
          <Link href="/cart">Cart <CartCount /></Link>
        </nav>
      )}
    </header>
  )
}

