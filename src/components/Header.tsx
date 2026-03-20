'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import CartCount from './CartCount'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

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
        </nav>

        <div className="header-actions">
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
          <Link href="/cart">Cart <CartCount /></Link>
        </nav>
      )}
    </header>
  )
}
