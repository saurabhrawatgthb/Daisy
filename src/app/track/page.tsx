'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import '../store.css'

type OrderItem = {
  id: string
  quantity: number
  price: number
  product?: {
    title: string
    imageUrl: string
  } | null
  productTitle?: string | null
}

type TrackedOrder = {
  id: string
  status: string
  paymentMethod?: string
  totalAmount: number
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  customerPincode?: string
  orderItems: OrderItem[]
}

const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Payment / COD Confirmed', icon: '💳' },
  { key: 'shipped', label: 'Shipped & In Transit', icon: '📦' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' }
]

function getStepProgress(status: string, paymentMethod?: string) {
  switch (status) {
    case 'Pending':
      return paymentMethod === 'COD' ? 1 : 0
    case 'Payment Submitted':
      return 1
    case 'Paid':
      return 2
    case 'Shipped':
      return 3
    case 'Delivered':
      return 4
    case 'Rejected':
      return -1
    default:
      return 1
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

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [guestOrder, setGuestOrder] = useState<TrackedOrder | null>(null)
  const [userOrders, setUserOrders] = useState<TrackedOrder[] | null>(null)
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null)
  const [showGuestLookup, setShowGuestLookup] = useState(false)

  // Auto-fetch logged-in user orders on mount
  useEffect(() => {
    const checkSessionAndFetch = async () => {
      try {
        const res = await fetch('/api/track')
        if (res.ok) {
          const data = await res.json()
          if (data.isSession && data.orders) {
            setUserOrders(data.orders)
            if (data.user) setUser(data.user)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setInitialLoading(false)
      }
    }

    checkSessionAndFetch()
  }, [])

  const handleGuestTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setGuestOrder(null)

    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to track order')
      setGuestOrder(data.order)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const printInvoice = (order: TrackedOrder) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = (order.orderItems || []).map(i => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${i.product?.title || i.productTitle || 'Product'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${i.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${i.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${i.price * i.quantity}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #b2589a; font-size: 28px; }
            .meta-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .items-table th { background: #fdf5fc; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daisy Store</h1>
            <p>Order Tax Invoice / Receipt</p>
          </div>
          <table class="meta-table">
            <tr>
              <td><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</td>
              <td style="text-align: right;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</td>
              <td style="text-align: right;"><strong>Payment:</strong> ${order.paymentMethod || 'UPI'}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Shipping Address:</strong> ${order.customerAddress || 'N/A'}, PIN: ${order.customerPincode || ''}</td>
            </tr>
          </table>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="3" style="padding: 12px; font-weight: bold; text-align: right;">Grand Total:</td>
                <td style="padding: 12px; font-weight: bold; text-align: right; color: #b2589a; font-size: 18px;">₹${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: center; font-size: 12px; color: #888; margin-top: 40px;">Thank you for shopping with Daisy! 🌸</p>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const renderTimeline = (order: TrackedOrder) => {
    const currentStep = getStepProgress(order.status, order.paymentMethod)
    const isRejected = order.status === 'Rejected'

    if (isRejected) {
      return (
        <div style={{ padding: '15px', background: '#fdedec', borderRadius: '10px', color: '#e74c3c', marginTop: '15px' }}>
          <strong>Order Status: Cancelled / Rejected</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>This order was cancelled or payment verification was not approved.</p>
        </div>
      )
    }

    return (
      <div style={{ marginTop: '25px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          marginBottom: '10px'
        }}>
          {/* Timeline background bar */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            right: '30px',
            height: '4px',
            background: '#ebd5e6',
            zIndex: 1
          }}>
            <div style={{
              height: '100%',
              background: 'var(--primary, #b2589a)',
              width: `${Math.min(100, Math.max(0, (currentStep / (ORDER_STEPS.length - 1)) * 100))}%`,
              transition: 'width 0.4s ease'
            }}></div>
          </div>

          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = currentStep >= idx
            const isCurrent = currentStep === idx
            return (
              <div key={step.key} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                position: 'relative',
                width: '75px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--primary, #b2589a)' : '#f5e8f3',
                  color: isCompleted ? '#fff' : '#888',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  border: isCurrent ? '3px solid #6b1e56' : 'none',
                  boxShadow: isCompleted ? '0 2px 8px rgba(178,88,154,0.3)' : 'none'
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isCompleted ? 700 : 500,
                  marginTop: '8px',
                  color: isCompleted ? 'var(--primary-dark, #4a2040)' : 'var(--text-muted)'
                }}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="page-header">
        <h1>Live Order Tracking</h1>
      </div>

      <main className="main-content container" style={{ padding: '50px 20px', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Signed-in user view */}
          {userOrders && userOrders.length > 0 && !showGuestLookup ? (
            <div>
              <div className="glass-card" style={{ padding: '30px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)' }}>
                      Welcome, {user?.name || user?.email}! 📍
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Here is the live delivery tracking for your recent orders:
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGuestLookup(true)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      color: 'var(--primary-dark)'
                    }}
                  >
                    🔍 Track Another Order ID
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {userOrders.map(order => (
                    <div key={order.id} style={{
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-light, #faf4f9)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Order ID</span>
                          <p style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--primary-dark)', margin: '2px 0' }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            background: `${STATUS_COLORS[order.status] || '#999'}22`,
                            color: STATUS_COLORS[order.status] || '#999',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            display: 'inline-block',
                            marginBottom: '6px'
                          }}>
                            {order.status}
                          </span>
                          <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0' }}>₹{order.totalAmount}</p>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 UPI Payment'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Progress Timeline */}
                      {renderTimeline(order)}

                      {/* Order Items & Details */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <strong>Items:</strong> {(order.orderItems || []).map(i => `${i.quantity}x ${i.product?.title || i.productTitle || 'Item'}`).join(', ')}
                        </div>
                        <button
                          onClick={() => printInvoice(order)}
                          className="btn"
                          style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#4a2040' }}
                        >
                          🖨️ Print Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Guest / Manual Lookup View */
            <div className="glass-card" style={{ maxWidth: 540, margin: '0 auto', padding: '40px' }}>
              {user && (
                <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                  <button
                    onClick={() => setShowGuestLookup(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    ← Back to My Orders Tracking
                  </button>
                </div>
              )}

              {!user && (
                <div style={{
                  background: '#fdf5fc',
                  border: '1px solid #f2d6ea',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '25px',
                  fontSize: '0.9rem'
                }}>
                  <strong style={{ color: 'var(--primary-dark)', display: 'block', marginBottom: '4px' }}>Have an account?</strong>
                  <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Sign In here
                  </Link> to view live tracking automatically without entering Order IDs.
                </div>
              )}

              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--primary-dark)', textAlign: 'center' }}>
                Track Specific Order
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '25px', textAlign: 'center', fontSize: '0.92rem' }}>
                Enter your <strong>Order ID</strong> and <strong>Email Address</strong> to view real-time delivery status:
              </p>

              <form onSubmit={handleGuestTrack}>
                <div className="input-group">
                  <label className="input-label">Order ID</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    placeholder="e.g. cmgxt7a..."
                    value={orderId}
                    onChange={e => setOrderId(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address used at checkout</label>
                  <input
                    required
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                {error && <div className="error-message" style={{ marginBottom: '20px', color: '#e74c3c' }}>{error}</div>}

                <button type="submit" className="btn" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={loading}>
                  {loading ? 'Searching Order...' : 'Track Live Status →'}
                </button>
              </form>

              {/* Guest Result Display */}
              {guestOrder && (
                <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: 'var(--primary-dark)' }}>Hi, {guestOrder.customerName}! 👋</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Order #{guestOrder.id.slice(0, 8).toUpperCase()} • ₹{guestOrder.totalAmount}
                      </p>
                    </div>
                    <button onClick={() => printInvoice(guestOrder)} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#4a2040' }}>
                      🖨️ Invoice
                    </button>
                  </div>

                  {renderTimeline(guestOrder)}
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
