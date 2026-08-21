'use client'
import React, { useEffect, useState, useCallback } from 'react'
import '../dashboard.css'

type Order = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerPincode: string
  customerAddress: string
  totalAmount: number
  status: string
  paymentMethod?: string
  paymentIntentId?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': '#f39c12',
  'Payment Submitted': '#8e44ad',
  'Paid': '#27ae60',
  'Rejected': '#e74c3c',
  'Shipped': '#2980b9',
  'Delivered': '#2ecc71',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      if (!res.ok) throw new Error('Failed to update')
      await fetchOrders()
    } catch (e) {
      alert('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  const deleteOrder = async (orderId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete order #${orderId.slice(0, 8).toUpperCase()}? This cannot be undone.`)
    if (!confirmDelete) return

    setDeleting(orderId)
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete order')
      
      // Update local state immediately
      setOrders(prev => prev.filter(o => o.id !== orderId))
      alert('Order deleted successfully!')
    } catch (e: any) {
      alert(e.message || 'Failed to delete order')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Order Management</h1>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }}></span>
            {s}
          </span>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
        {loading ? (
          <p className="empty-state">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="empty-state">No orders yet. Share your store link to get your first order! 🛍️</p>
        ) : (
          <table className="daisy-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount & Method</th>
                <th>UTR / Ref</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{o.id.slice(0, 8).toUpperCase()}</td>
                  <td>
                    <strong>{o.customerName}</strong>
                    <br />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{o.customerEmail}</span>
                    <br />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{o.customerPhone} (PIN: {o.customerPincode})</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>₹{o.totalAmount}</div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginTop: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: o.paymentMethod === 'COD' ? '#fdf2e9' : '#ebf5fb',
                      color: o.paymentMethod === 'COD' ? '#d35400' : '#2980b9',
                      border: `1px solid ${o.paymentMethod === 'COD' ? '#f5cba7' : '#aed6f1'}`
                    }}>
                      {o.paymentMethod === 'COD' ? '💵 COD' : '💳 UPI'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {o.paymentIntentId || '—'}
                  </td>
                  <td>
                    <span style={{
                      background: `${STATUS_COLORS[o.status] || '#999'}22`,
                      color: STATUS_COLORS[o.status] || '#999',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {o.status === 'Payment Submitted' && (
                        <>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#27ae60' }}
                            disabled={updating === o.id || deleting === o.id}
                            onClick={() => updateStatus(o.id, 'Paid')}
                          >
                            ✓ Mark Paid
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#e74c3c' }}
                            disabled={updating === o.id || deleting === o.id}
                            onClick={() => updateStatus(o.id, 'Rejected')}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {/* For COD orders in Pending state */}
                      {o.paymentMethod === 'COD' && o.status === 'Pending' && (
                        <>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#2980b9' }}
                            disabled={updating === o.id || deleting === o.id}
                            onClick={() => updateStatus(o.id, 'Shipped')}
                          >
                            📦 Ship COD Order
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#e74c3c' }}
                            disabled={updating === o.id || deleting === o.id}
                            onClick={() => updateStatus(o.id, 'Rejected')}
                          >
                            ✗ Cancel
                          </button>
                        </>
                      )}

                      {o.status === 'Paid' && (
                        <button
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#2980b9' }}
                          disabled={updating === o.id || deleting === o.id}
                          onClick={() => updateStatus(o.id, 'Shipped')}
                        >
                          📦 Mark Shipped
                        </button>
                      )}

                      {o.status === 'Shipped' && (
                        <button
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#2ecc71' }}
                          disabled={updating === o.id || deleting === o.id}
                          onClick={() => updateStatus(o.id, 'Delivered')}
                        >
                          🎉 Mark Delivered
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        className="btn"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#e04a4a', color: '#fff' }}
                        disabled={deleting === o.id || updating === o.id}
                        onClick={() => deleteOrder(o.id)}
                        title="Delete Order"
                      >
                        {deleting === o.id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

