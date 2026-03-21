'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import '../store.css'

type Step = 'details' | 'pay' | 'confirm'

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('details')
  const [dbOrderId, setDbOrderId] = useState('')
  const [utrNumber, setUtrNumber] = useState('')
  const [utrError, setUtrError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', pincode: '', address: '' })

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('daisy_cart') || '[]'))
    setMounted(true)
  }, [])

  const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)

  // Step 1: Save order to DB → move to QR payment step
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, customerDetails: formData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDbOrderId(data.dbOrderId)
      setStep('pay')
    } catch (err: any) {
      alert('Error placing order: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Customer submits UTR after paying via UPI
  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const utr = utrNumber.trim()
    if (utr.length < 6) {
      setUtrError('Please enter a valid UTR / Transaction ID')
      return
    }
    setUtrError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/checkout/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: dbOrderId, utrNumber: utr })
      })
      if (!res.ok) throw new Error('Failed to confirm payment')
      localStorage.removeItem('daisy_cart')
      window.dispatchEvent(new Event('cartUpdated'))
      setStep('confirm')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (cart.length === 0 && step === 'details') {
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

  // ─── Step 3: Success Screen ───────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <>
        <Header />
        <main className="main-content container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="glass-card" style={{ maxWidth: 500, margin: '0 auto', padding: '50px 40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '15px' }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
              Your payment is under verification. We'll confirm your order shortly.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>
              Order ID: <strong>{dbOrderId.slice(0, 8).toUpperCase()}</strong>
            </p>
            <button className="btn" style={{ width: '100%' }} onClick={() => router.push('/')}>
              Back to Home
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="page-header" style={{ padding: '40px 20px' }}>
        <h1>Checkout</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ─── Left: Details or QR Payment ────────────────────────────────── */}
        <div style={{ flex: '2 1 500px' }}>
          
          {step === 'details' && (
            <div className="glass-card" style={{ padding: '30px' }}>
              <h2 style={{ marginBottom: '25px' }}>Delivery Details</h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input required type="text" className="input-field" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input required type="email" className="input-field" value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label className="input-label">Phone Number</label>
                    <input required type="tel" className="input-field" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Pincode</label>
                    <input required type="text" className="input-field" value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Full Shipping Address</label>
                  <textarea required rows={4} className="input-field" style={{ resize: 'vertical' }}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                </div>
              </form>
            </div>
          )}

          {step === 'pay' && (
            <div className="glass-card" style={{ padding: '30px' }}>
              <h2 style={{ marginBottom: '8px' }}>Pay via UPI</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
                Scan the QR code below using any UPI app (Google Pay, PhonePe, Paytm, etc.)
              </p>

              {/* QR Code */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  display: 'inline-block', padding: '16px',
                  background: '#fff', borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '2px solid var(--primary)'
                }}>
                  <img
                    src="/upi-qr.png"
                    alt="UPI QR Code"
                    style={{ width: 220, height: 220, display: 'block', objectFit: 'contain' }}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      t.parentElement!.innerHTML = '<div style="width:220px;height:220px;display:flex;align-items:center;justify-content:center;background:#f9f0f5;border-radius:8px;color:#c97db5;font-size:0.9rem;text-align:center;padding:20px;">Add your UPI QR image as<br/><strong>/public/upi-qr.png</strong></div>'
                    }}
                  />
                </div>
                <p style={{ marginTop: '12px', fontWeight: 600, color: 'var(--primary-dark)', fontSize: '1.1rem' }}>
                  Amount: ₹{total}
                </p>
              </div>

              {/* UTR Entry */}
              <form onSubmit={handleUtrSubmit}>
                <div className="input-group">
                  <label className="input-label">Enter UTR / Transaction ID after payment</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    placeholder="e.g. 123456789012 or T2503211234"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                  />
                  {utrError && <p className="error-message">{utrError}</p>}
                </div>
                <button type="submit" className="btn" style={{ width: '100%', fontSize: '1.05rem', padding: '15px' }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Confirm Payment ✓'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary ─────────────────────────────────────────── */}
        <aside className="glass-card" style={{ flex: '1 1 300px', padding: '30px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
            Order Summary
          </h3>
          <div style={{ marginBottom: '20px', maxHeight: '260px', overflowY: 'auto' }}>
            {(step === 'details' ? cart : cart).map((item: any) => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity}× {item.title}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '28px', fontSize: '1.3rem' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₹{total}</span>
          </div>

          {step === 'details' && (
            <button type="submit" form="checkout-form" className="btn"
              style={{ width: '100%', fontSize: '1.05rem', padding: '15px' }} disabled={loading}>
              {loading ? 'Processing...' : 'Place Order →'}
            </button>
          )}
          {step === 'pay' && (
            <div style={{ textAlign: 'center', padding: '12px', background: '#fff8fd', borderRadius: '10px', border: '1px solid var(--primary)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                ✅ Order saved. Complete your UPI payment and enter the transaction ID.
              </p>
            </div>
          )}
        </aside>

      </main>
      <Footer />
    </>
  )
}
