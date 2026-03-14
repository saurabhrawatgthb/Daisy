import React from 'react'
import Link from 'next/link'
import CartCount from './CartCount'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">Daisy</Link>
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
        </div>
      </div>
    </header>
  )
}
