'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import '../store.css'

type WishlistItem = {
  id: string
  title: string
  price: number
  imageUrl: string
  category: string
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  const loadWishlist = () => {
    try {
      const items = JSON.parse(localStorage.getItem('daisy_wishlist') || '[]')
      setWishlist(items)
    } catch (e) {
      setWishlist([])
    }
  }

  useEffect(() => {
    loadWishlist()
    setMounted(false)
    setMounted(true)

    const handleUpdate = () => loadWishlist()
    window.addEventListener('wishlistUpdated', handleUpdate)
    return () => window.removeEventListener('wishlistUpdated', handleUpdate)
  }, [])

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter(item => item.id !== id)
    localStorage.setItem('daisy_wishlist', JSON.stringify(updated))
    setWishlist(updated)
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const moveToCart = (item: WishlistItem) => {
    try {
      const cart = JSON.parse(localStorage.getItem('daisy_cart') || '[]')
      const existing = cart.find((i: any) => i.productId === item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          productId: item.id,
          title: item.title,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: 1
        })
      }
      localStorage.setItem('daisy_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      removeFromWishlist(item.id)
      alert(`"${item.title}" moved to cart! 🛍️`)
    } catch (e) {
      console.error(e)
    }
  }

  if (!mounted) return null

  return (
    <>
      <Header />
      <div className="page-header">
        <h1>My Wishlist ❤️</h1>
      </div>

      <main className="main-content container" style={{ padding: '60px 20px', minHeight: '60vh' }}>
        {wishlist.length === 0 ? (
          <div className="glass-card" style={{ maxWidth: 500, margin: '0 auto', padding: '50px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>💔</div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '10px' }}>Your Wishlist is Empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.95rem' }}>
              Explore our jewellery and scrunchies collections and heart your favorite accessories!
            </p>
            <Link href="/shop" className="btn" style={{ padding: '12px 28px' }}>
              Browse Collection 🛍️
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                You have <strong>{wishlist.length} item{wishlist.length > 1 ? 's' : ''}</strong> in your wishlist:
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('daisy_wishlist')
                  setWishlist([])
                  window.dispatchEvent(new Event('wishlistUpdated'))
                }}
                style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Clear Wishlist
              </button>
            </div>

            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {wishlist.map(item => (
                <div key={item.id} className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="product-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} />
                      ) : (
                        <div className="placeholder">No Image</div>
                      )}
                    </div>
                    <div className="product-details">
                      <span className="product-category">{item.category}</span>
                      <h3 className="product-title">{item.title}</h3>
                      <p className="product-price">₹{item.price}</p>
                    </div>
                  </Link>
                  <div style={{ padding: '0 15px 15px', display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      onClick={() => moveToCart(item)}
                      className="btn"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                    >
                      Move to Cart 🛍️
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.82rem', borderColor: '#ddd', color: '#888' }}
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
