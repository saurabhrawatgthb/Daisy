'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '../store.css'

type CartItem = {
  productId: string
  quantity: number
  title: string
  price: number
  imageUrl?: string
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('daisy_cart') || '[]')
    }
    return []
  })
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    const newCart = [...cart]
    const item = newCart.find((i) => i.productId === id)
    if (item) {
      item.quantity += delta
      if (item.quantity <= 0) {
        newCart.splice(newCart.indexOf(item), 1)
      }
      setCart(newCart)
      localStorage.setItem('daisy_cart', JSON.stringify(newCart))
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  if (!mounted) return null

  return (
    <>
      <Header />
      <div className="page-header" style={{ padding: '40px 20px' }}>
        <h1>Your Shopping Cart</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 600px' }}>
          {cart.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <h2 style={{ marginBottom: '15px' }}>Your cart is empty.</h2>
              <Link href="/shop" className="btn">Continue Shopping</Link>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '0 30px' }}>
              {cart.map((item) => (
                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '25px', padding: '30px 0', borderBottom: '1px solid var(--border)' }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.title}</h3>
                    <p style={{ color: 'var(--primary-dark)', fontWeight: 600, fontSize: '1.1rem' }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid var(--border)', borderRadius: '30px', padding: '5px 15px' }}>
                    <button onClick={() => updateQuantity(item.productId, -1)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>-</button>
                    <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-main)' }}>+</button>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', width: '80px', textAlign: 'right' }}>₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <aside className="glass-card" style={{ flex: '1 1 300px', padding: '30px', position: 'sticky', top: '120px' }}>
            <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '30px', fontSize: '1.3rem' }}>
              <span style={{ fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₹{total}</span>
            </div>
            <button onClick={handleCheckout} className="btn" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}>Proceed to Checkout</button>
          </aside>
        )}
      </main>
      <Footer />
    </>
  )
}
