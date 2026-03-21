import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h2 style={{ textAlign: 'center' }}>Daisy</h2>
          <p style={{ textAlign: 'center' }}>Premium anti-tarnish jewellery and elegant accessories for women.</p>
        </div>
        <div className="footer-links">
          <h3>Shop</h3>
          <Link href="/shop?category=Jewellery">Jewellery</Link>
          <Link href="/shop?category=Scrunchies">Scrunchies</Link>
          <Link href="/shop">All Products</Link>
        </div>
        <div className="footer-links">
          <h3>Help</h3>
          <Link href="/my-orders">My Orders</Link>
          <Link href="/track">Track Order</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/shipping-policy">Shipping Policy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          &copy; {new Date().getFullYear()} Daisy Accessories. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
