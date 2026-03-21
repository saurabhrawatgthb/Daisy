'use client'
import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

type OrderItem = {
  id: string
  quantity: number
  price: number
  product: {
    title: string
    imageUrl: string
  }
}

type OrderStatus = {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  customerName: string
  orderItems: OrderItem[]
}

export default function MyOrders() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<OrderStatus[] | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrders(null)

    try {
      const res = await fetch(`/api/my-orders?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders')
      setOrders(data.orders)
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
        <h1>My Orders</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', minHeight: '50vh' }}>
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px' }}>
          
          <form onSubmit={handleSearch}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', textAlign: 'center' }}>
              Enter your Email Address and Phone Number to view your order history.
            </p>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input required type="email" className="input-field" placeholder="Used during checkout" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input required type="text" className="input-field" placeholder="Used during checkout" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            {error && <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center', color: 'red' }}>{error}</div>}

            <button type="submit" className="btn" style={{ width: '100%', padding: '15px' }} disabled={loading}>
              {loading ? 'Searching...' : 'Find My Orders'}
            </button>
          </form>

          {orders && (
            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary-dark)', textAlign: 'center' }}>
                {orders.length > 0 ? `Found ${orders.length} Order(s)` : 'No orders found for these details.'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID</p>
                        <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{order.id}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</p>
                        <p style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total</p>
                        <p style={{ fontWeight: 600 }}>₹{order.totalAmount}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</p>
                        <span style={{
                          background: `${STATUS_COLORS[order.status] || '#999'}22`,
                          color: STATUS_COLORS[order.status] || '#999',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                      <p style={{ fontWeight: 600, marginBottom: '10px' }}>Items</p>
                      {order.orderItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                          <span>{item.quantity}x {item.product.title}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
