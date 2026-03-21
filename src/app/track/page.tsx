'use client'
import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type OrderStatus = {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  customerName: string
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<OrderStatus | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to track order')
      setOrder(data.order)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    'Pending': '#f39c12',
    'Payment Submitted': '#8e44ad',
    'Paid': '#27ae60',
    'Shipped': '#2980b9',
    'Delivered': '#2ecc71',
    'Rejected': '#e74c3c'
  }

  return (
    <>
      <Header />
      <div className="page-header">
        <h1>Track Your Order</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', minHeight: '50vh' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          
          <form onSubmit={handleTrack}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', textAlign: 'center' }}>
              Enter your Order ID and Email Address to view your current order status.
            </p>

            <div className="input-group">
              <label className="input-label">Order ID</label>
              <input required type="text" className="input-field" placeholder="e.g. cmgxt7a..." value={orderId} onChange={e => setOrderId(e.target.value)} />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input required type="email" className="input-field" placeholder="Used during checkout" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {error && <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

            <button type="submit" className="btn" style={{ width: '100%', padding: '15px' }} disabled={loading}>
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {order && (
            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '15px', color: 'var(--primary-dark)' }}>Order Found!</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '1.05rem' }}>
                <p><strong>Hi, {order.customerName}</strong></p>
                <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Amount: ₹{order.totalAmount}</p>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>Status:</strong>
                  <span style={{
                    background: `${STATUS_COLORS[order.status] || '#999'}22`,
                    color: STATUS_COLORS[order.status] || '#999',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: 600
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
