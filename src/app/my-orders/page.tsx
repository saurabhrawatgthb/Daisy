'use client'
import React, { useState, useEffect } from 'react'
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
  paymentMethod?: string
  totalAmount: number
  createdAt: string
  customerName: string
  orderItems: OrderItem[]
}

export default function MyOrders() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<OrderStatus[] | null>(null)
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null)

  // Fetch logged-in user's orders automatically
  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await fetch('/api/my-orders')
        if (res.ok) {
          const data = await res.json()
          if (data.orders) {
            setOrders(data.orders)
            if (data.user) {
              setUser(data.user)
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchUserOrders()
  }, [])

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
        <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto', padding: '40px' }}>
          
          {user ? (
            <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', marginBottom: '6px' }}>
                Welcome, {user.name || user.email}! 👋
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Showing order history connected to your account (<strong>{user.email}</strong>)
              </p>
            </div>
          ) : (
            <>
              <div style={{
                background: '#fdf5fc',
                border: '1px solid #f2d6ea',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <strong style={{ color: 'var(--primary-dark)', display: 'block' }}>Have a Daisy account?</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sign in to view all your connected orders instantly.</span>
                </div>
                <Link href="/login" className="btn" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Sign In
                </Link>
              </div>

              <form onSubmit={handleSearch}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center', fontSize: '0.95rem' }}>
                  Or lookup orders with your <strong>Email Address</strong> and <strong>Phone Number</strong>:
                </p>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input required type="email" className="input-field" placeholder="Used during checkout" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input required type="text" className="input-field" placeholder="Used during checkout" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                {error && <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center', color: '#e74c3c' }}>{error}</div>}

                <button type="submit" className="btn" style={{ width: '100%', padding: '15px' }} disabled={loading}>
                  {loading ? 'Searching Orders...' : 'Find My Orders'}
                </button>
              </form>
            </>
          )}

          {initialLoading && user ? (
            <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading your orders...</p>
          ) : orders && (
            <div style={{ marginTop: user ? '0' : '40px', paddingTop: user ? '0' : '30px', borderTop: user ? 'none' : '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary-dark)', textAlign: 'center' }}>
                {orders.length > 0 ? `Found ${orders.length} Order(s)` : 'No orders found.'}
              </h3>
              
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                  <Link href="/shop" className="btn" style={{ display: 'inline-block' }}>
                    Start Shopping 🛍️
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID</p>
                          <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-dark)' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date</p>
                          <p style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total & Method</p>
                          <p style={{ fontWeight: 700 }}>
                            ₹{order.totalAmount}{' '}
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: order.paymentMethod === 'COD' ? '#fdf2e9' : '#ebf5fb',
                              color: order.paymentMethod === 'COD' ? '#d35400' : '#2980b9',
                              border: `1px solid ${order.paymentMethod === 'COD' ? '#f5cba7' : '#aed6f1'}`
                            }}>
                              {order.paymentMethod === 'COD' ? '💵 COD' : '💳 UPI'}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</p>
                          <span style={{
                            background: `${STATUS_COLORS[order.status] || '#999'}22`,
                            color: STATUS_COLORS[order.status] || '#999',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                        <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items in this order:</p>
                        {order.orderItems.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                            <span>{item.quantity}× {item.product.title}</span>
                            <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px dashed var(--border)', textAlign: 'right' }}>
                        <Link href={`/track`} style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                          Track Live Delivery →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

