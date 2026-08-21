'use client'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import '../store.css'

type Step = 'details' | 'pay' | 'confirm'
type PaymentMethod = 'UPI' | 'COD'

type SavedAddress = {
  id: string
  label: string
  name: string
  phone: string
  address: string
  pincode: string
  isDefault?: boolean
}

const PROMO_CODES: Record<string, { type: 'percent' | 'flat'; value: number; label: string }> = {
  'DAISY10': { type: 'percent', value: 10, label: '10% OFF Special' },
  'WELCOME50': { type: 'flat', value: 50, label: '₹50 Flat OFF' },
  'FESTIVE20': { type: 'percent', value: 20, label: '20% Festive Savings' }
}

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('details')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [dbOrderId, setDbOrderId] = useState('')
  const [utrNumber, setUtrNumber] = useState('')
  const [utrError, setUtrError] = useState('')
  const router = useRouter()

  // User & Address Management
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  // Current Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '',
    address: '',
    label: 'Home'
  })

  // Coupon / Promo Code
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('daisy_cart') || '[]'))

    const loadUserAndAddresses = async () => {
      try {
        const userRes = await fetch('/api/auth/me')
        const userData = await userRes.json()

        if (userData.user) {
          setIsLoggedIn(true)
          setFormData(prev => ({
            ...prev,
            name: userData.user.name || '',
            email: userData.user.email || '',
            phone: userData.user.phone || '',
            pincode: userData.user.pincode || '',
            address: userData.user.address || ''
          }))

          // Fetch saved addresses
          const addrRes = await fetch('/api/user/addresses')
          if (addrRes.ok) {
            const addrData = await addrRes.json()
            if (addrData.addresses && addrData.addresses.length > 0) {
              setSavedAddresses(addrData.addresses)
              const defaultAddr = addrData.addresses.find((a: SavedAddress) => a.isDefault) || addrData.addresses[0]
              setSelectedAddressId(defaultAddr.id)
              setFormData(prev => ({
                ...prev,
                name: defaultAddr.name,
                phone: defaultAddr.phone,
                address: defaultAddr.address,
                pincode: defaultAddr.pincode
              }))
            }
          }
        }
      } catch (e) {
        /* guest fallback */
      } finally {
        setMounted(true)
      }
    }

    loadUserAndAddresses()
  }, [])

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)

  // Calculate discount
  let discountAmount = 0
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discount
  }

  // Shipping calculation
  const isDehradun = formData.address.toLowerCase().includes('dehradun')
  const shippingFee = (subtotal === 0 || isDehradun) ? 0 : 30
  const discountedSubtotal = Math.max(0, subtotal - discountAmount)
  const total = discountedSubtotal + shippingFee

  // Handle Coupon Application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError('')
    const code = couponInput.trim().toUpperCase()

    if (!code) return

    if (PROMO_CODES[code]) {
      const promo = PROMO_CODES[code]
      let calcDiscount = 0
      if (promo.type === 'percent') {
        calcDiscount = Math.round((subtotal * promo.value) / 100)
      } else {
        calcDiscount = Math.min(subtotal, promo.value)
      }
      setAppliedCoupon({ code, discount: calcDiscount, label: promo.label })
      setCouponInput('')
    } else {
      setCouponError('Invalid coupon code. Try DAISY10 or WELCOME50')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }

  // Handle selecting a saved address
  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id)
    setShowNewAddressForm(false)
    setFormData(prev => ({
      ...prev,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      pincode: addr.pincode
    }))
  }

  // Save new address to Address Book
  const handleSaveNewAddress = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      alert('Please fill out all address fields')
      return
    }

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: formData.label || 'Other',
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          pincode: formData.pincode,
          isDefault: savedAddresses.length === 0
        })
      })
      const data = await res.json()
      if (res.ok && data.address) {
        setSavedAddresses(prev => [data.address, ...prev])
        setSelectedAddressId(data.address.id)
        setShowNewAddressForm(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerDetails: formData,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          discountAmount
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      setDbOrderId(data.dbOrderId)

      if (paymentMethod === 'COD') {
        localStorage.removeItem('daisy_cart')
        window.dispatchEvent(new Event('cartUpdated'))
        setStep('confirm')
      } else {
        setStep('pay')
      }
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
          <button className="btn" style={{ marginTop: '20px' }} onClick={() => router.push('/shop')}>
            Explore Shop 🛍️
          </button>
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
          <div className="glass-card" style={{ maxWidth: 540, margin: '0 auto', padding: '50px 40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '15px' }}>
              Order Confirmed!
            </h2>

            {paymentMethod === 'COD' ? (
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px', lineHeight: 1.6 }}>
                Your <strong>Cash on Delivery</strong> order has been placed successfully. Please keep ₹{total} cash ready at the time of delivery.
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', marginBottom: '15px', lineHeight: 1.6 }}>
                Your payment is under verification. We will dispatch your order shortly.
              </p>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '25px', background: '#fdf5fc', padding: '12px', borderRadius: '8px' }}>
              Order ID: <strong style={{ fontFamily: 'monospace', color: 'var(--primary-dark)' }}>#{dbOrderId.slice(0, 8).toUpperCase()}</strong>
            </p>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button className="btn" style={{ width: '100%' }} onClick={() => router.push('/track')}>
                Track Order Status Live 📍
              </button>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => router.push('/my-orders')}>
                View My Orders History
              </button>
            </div>
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
      <main className="main-content container" style={{ padding: '50px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ─── Left: Delivery Details & Payment ────────────────────────────── */}
        <div style={{ flex: '2 1 500px' }}>

          {step === 'details' && (
            <div className="glass-card" style={{ padding: '35px' }}>

              {/* Saved Address Selector for logged-in users */}
              {isLoggedIn && savedAddresses.length > 0 && !showNewAddressForm && (
                <div style={{ marginBottom: '30px', paddingBottom: '25px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>
                      Select Delivery Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      + Add New Address
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                    {savedAddresses.map(addr => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            background: isSelected ? '#fff4fc' : '#ffffff',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: isSelected ? 'var(--primary)' : '#eee',
                            color: isSelected ? '#fff' : '#555',
                            fontWeight: 700,
                            display: 'inline-block',
                            marginBottom: '6px'
                          }}>
                            {addr.label}
                          </span>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '2px 0' }}>{addr.name}</p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0' }}>{addr.address}</p>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0' }}>PIN: {addr.pincode} • {addr.phone}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Address Form */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                  {showNewAddressForm ? 'New Delivery Address' : (isLoggedIn && savedAddresses.length > 0 ? 'Selected Delivery Details' : 'Delivery Details')}
                </h2>
                {showNewAddressForm && savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form id="checkout-form" onSubmit={handlePlaceOrder}>
                {showNewAddressForm && (
                  <div className="input-group">
                    <label className="input-label">Address Label</label>
                    <select
                      className="input-field"
                      value={formData.label}
                      onChange={e => setFormData({ ...formData, label: e.target.value })}
                    >
                      <option value="Home">🏠 Home</option>
                      <option value="Work">🏢 Work / Office</option>
                      <option value="Other">📍 Other / Friend</option>
                    </select>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    required
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="input-group">
                    <label className="input-label">Phone Number</label>
                    <input
                      required
                      type="tel"
                      className="input-field"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Pincode</label>
                    <input
                      required
                      type="text"
                      className="input-field"
                      value={formData.pincode}
                      onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Full Shipping Address</label>
                  <textarea
                    required
                    rows={3}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>

                {showNewAddressForm && isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleSaveNewAddress}
                    className="btn btn-outline"
                    style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    💾 Save this address to Address Book
                  </button>
                )}

                {/* Payment Method Selector */}
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--primary-dark)' }}>
                    Choose Payment Method
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div
                      onClick={() => setPaymentMethod('UPI')}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === 'UPI' ? '#fff4fc' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📱</div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>UPI / QR Code</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GPay, PhonePe, Paytm</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('COD')}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === 'COD' ? '#fff4fc' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>💵</div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>Cash on Delivery</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay cash upon arrival</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 'pay' && (
            <div className="glass-card" style={{ padding: '35px' }}>
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
                  Total Amount to Pay: ₹{total}
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

        {/* ─── Right: Order Summary & Coupon ─────────────────────────────────── */}
        <aside className="glass-card" style={{ flex: '1 1 320px', padding: '30px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>
            Order Summary
          </h3>

          <div style={{ marginBottom: '15px', maxHeight: '220px', overflowY: 'auto' }}>
            {cart.map((item: any) => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.92rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity}× {item.title}</span>
                <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Coupon Code Input */}
          <div style={{ padding: '15px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', display: 'block', marginBottom: '8px' }}>
              🎟️ Have a Promo Code?
            </label>
            {appliedCoupon ? (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#eafaf1',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #a9dfbf'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#27ae60', fontWeight: 700 }}>
                  ✓ {appliedCoupon.code} applied (-₹{appliedCoupon.discount})
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. DAISY10"
                  className="input-field"
                  style={{ textTransform: 'uppercase', padding: '8px 12px', fontSize: '0.85rem' }}
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: '6px' }}>{couponError}</p>}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Available: <strong>DAISY10</strong> (10% off), <strong>WELCOME50</strong> (₹50 off)
            </p>
          </div>

          <div style={{ paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', color: '#27ae60', fontWeight: 600 }}>
                <span>Coupon Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: isDehradun ? 'var(--success)' : 'var(--text-muted)' }}>
              <span>Shipping {isDehradun && '(Dehradun)'}</span>
              <span>{isDehradun ? 'Free' : `₹${shippingFee}`}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.3rem' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>₹{total}</span>
          </div>

          <div style={{ marginBottom: '20px', padding: '8px 12px', background: '#faf3f8', borderRadius: '8px', fontSize: '0.82rem' }}>
            <strong>Payment Method:</strong> {paymentMethod === 'COD' ? '💵 Cash on Delivery' : '📱 UPI / Online'}
          </div>

          {step === 'details' && (
            <button type="submit" form="checkout-form" className="btn"
              style={{ width: '100%', fontSize: '1.05rem', padding: '14px' }} disabled={loading}>
              {loading ? 'Processing...' : (paymentMethod === 'COD' ? 'Place Order (Cash on Delivery) →' : 'Proceed to Payment →')}
            </button>
          )}
        </aside>

      </main>
      <Footer />
    </>
  )
}
