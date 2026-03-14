'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import '../store.css'

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('daisy_cart') || '[]'))
    setMounted(true)
  }, [])

  const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerDetails: formData
        })
      })

      const checkoutData = await res.json()
      if (!res.ok) throw new Error(checkoutData.error)

      const options = {
        key: 'rzp_test_dummy', // Using a placeholder for dummy testing
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'Daisy Accessories',
        description: 'Premium Accessory Purchase',
        order_id: checkoutData.orderId,
        handler: async function (response: any) {
          alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id)
          localStorage.removeItem('daisy_cart')
          window.dispatchEvent(new Event('cartUpdated'))
          router.push('/') 
        },
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: '#f0a0c0'
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any){
        alert('Payment failed: ' + response.error.description)
      })
      rzp.open()
      
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>Your cart is empty.</h2>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />
      <div className="page-header" style={{ padding: '40px 20px' }}>
        <h1>Secure Checkout</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '2 1 500px' }}>
          <div className="glass-card" style={{ padding: '30px' }}>
            <h2 style={{ marginBottom: '25px' }}>Delivery Details</h2>
            <form id="checkout-form" onSubmit={handlePayment}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Full Shipping Address</label>
                <textarea required rows={4} className="input-field" style={{resize: 'vertical'}} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
            </form>
          </div>
        </div>

        <aside className="glass-card" style={{ flex: '1 1 350px', padding: '30px', position: 'sticky', top: '120px' }}>
          <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>Order summary</h3>
          <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
            {cart.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.title}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '30px', fontSize: '1.3rem' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₹{total}</span>
          </div>
          <button type="submit" form="checkout-form" className="btn" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }} disabled={loading}>
            {loading ? 'Processing...' : 'Pay Securely'}
          </button>
        </aside>

      </main>
      <Footer />
    </>
  )
}
