import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        {/* Brand Column */}
        <div className="footer-col footer-brand">
          <h2 className="footer-brand-title">Daisy 🌸</h2>
          <p className="footer-brand-desc">
            Handcrafted anti-tarnish jewellery, satin scrunchies, and luxury accessories designed to elevate your everyday elegance.
          </p>
          <div className="footer-badges">
            <span className="footer-badge">✨ Anti-Tarnish</span>
            <span className="footer-badge">🚚 Fast Delivery</span>
            <span className="footer-badge">💖 Handcrafted</span>
          </div>
        </div>

        {/* Shop Links Column */}
        <div className="footer-col footer-links-col">
          <h3 className="footer-heading">Shop Collection</h3>
          <div className="footer-links-list">
            <Link href="/shop?category=Jewellery" className="footer-link">💍 Anti-tarnish Jewellery</Link>
            <Link href="/shop?category=Scrunchies" className="footer-link">🎀 Premium Scrunchies</Link>
            <Link href="/shop?category=Claws" className="footer-link">🌸 Hair Claws & Clips</Link>
            <Link href="/shop" className="footer-link">🛍️ All Accessories</Link>
          </div>
        </div>

        {/* Help & Support Column */}
        <div className="footer-col footer-links-col">
          <h3 className="footer-heading">Customer Help</h3>
          <div className="footer-links-list">
            <Link href="/track" className="footer-link">📍 Track My Order</Link>
            <Link href="/my-orders" className="footer-link">📦 My Orders & Addresses</Link>
            <Link href="/shipping-policy" className="footer-link">🚚 Shipping & Delivery Policy</Link>
            <Link href="/contact" className="footer-link">💬 Contact & WhatsApp Support</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Daisy Accessories. Made with 💖 in Dehradun, India.</p>
        </div>
      </div>
    </footer>
  )
}
