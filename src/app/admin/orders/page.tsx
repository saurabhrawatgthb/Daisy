'use client'
import React, { useEffect, useState, useCallback } from 'react'
import '../dashboard.css'

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
  couponCode?: string | null
  discountAmount?: number
  createdAt: string
  orderItems: OrderItem[]
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null)
      }
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
      
      setOrders(prev => prev.filter(o => o.id !== orderId))
      if (selectedOrder?.id === orderId) setSelectedOrder(null)
      alert('Order deleted successfully!')
    } catch (e: any) {
      alert(e.message || 'Failed to delete order')
    } finally {
      setDeleting(null)
    }
  }

  const printPackingSlip = (order: Order) => {
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
          <title>Daisy Dispatch & Packing Slip - #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #b2589a; padding-bottom: 15px; }
            .header h1 { margin: 0; color: #b2589a; font-size: 26px; }
            .info-box { background: #fdf5fc; border: 1px solid #f2d6ea; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .items-table th { background: #faf4f9; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌸 Daisy - Order Dispatch Slip</h1>
            <p>Order ID: <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> • Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="info-box">
            <h3 style="margin-top:0; color:#822765;">Delivery Destination</h3>
            <p style="font-size:16px; margin: 4px 0;"><strong>Recipient:</strong> ${order.customerName}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> ${order.customerPhone}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
            <p style="margin: 4px 0;"><strong>Full Address:</strong> ${order.customerAddress}</p>
            <p style="margin: 4px 0;"><strong>Pincode:</strong> ${order.customerPincode}</p>
            <p style="margin: 8px 0 0;"><strong>Payment Mode:</strong> <span style="background:#eee; padding:2px 8px; border-radius:4px; font-weight:bold;">${order.paymentMethod === 'COD' ? '💵 Cash on Delivery (Collect Cash)' : '📱 UPI / Paid Online'}</span> ${order.paymentIntentId ? `(Ref/UTR: ${order.paymentIntentId})` : ''}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="3" style="padding: 12px; font-weight: bold; text-align: right;">Total Payable:</td>
                <td style="padding: 12px; font-weight: bold; text-align: right; color: #b2589a; font-size: 18px;">₹${order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: center; font-size: 12px; color: #888; margin-top: 40px;">Daisy Store Packing & Dispatch Slip</p>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="dashboard-wrapper">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Order Management & Fulfillment</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review customer orders, delivery destinations, payment modes, and update dispatch status.
          </p>
        </div>
      </div>

      {/* Status Legend */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }}></span>
            {s}
          </span>
        ))}
      </div>

      {/* Main Orders Table */}
      <div className="glass-card" style={{ padding: '25px', overflowX: 'auto' }}>
        {loading ? (
          <p className="empty-state">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="empty-state">No orders yet. Share your store link to get your first order! 🛍️</p>
        ) : (
          <table className="daisy-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer & Phone</th>
                <th>Delivery Destination</th>
                <th>Mode of Payment</th>
                <th>Items & Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  {/* Order ID */}
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </td>

                  {/* Customer Info */}
                  <td>
                    <strong style={{ fontSize: '0.95rem' }}>{o.customerName}</strong>
                    <br />
                    <a href={`tel:${o.customerPhone}`} style={{ color: 'var(--primary-dark)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                      📞 {o.customerPhone}
                    </a>
                    <br />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{o.customerEmail}</span>
                  </td>

                  {/* Full Delivery Address */}
                  <td style={{ maxWidth: '240px' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.4, color: '#333' }}>
                      📍 {o.customerAddress}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      background: '#fdf5fc',
                      color: 'var(--primary-dark)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid #f2d6ea'
                    }}>
                      PIN: {o.customerPincode}
                    </span>
                  </td>

                  {/* Mode of Payment */}
                  <td>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: o.paymentMethod === 'COD' ? '#fef5ec' : '#eaf2f8',
                      color: o.paymentMethod === 'COD' ? '#d35400' : '#2471a3',
                      border: `1px solid ${o.paymentMethod === 'COD' ? '#f8c471' : '#aed6f1'}`
                    }}>
                      {o.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '📱 UPI / Online'}
                    </span>
                    {o.paymentIntentId && (
                      <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                        UTR: {o.paymentIntentId}
                      </p>
                    )}
                  </td>

                  {/* Items & Total */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-dark)' }}>₹{o.totalAmount}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {(o.orderItems || []).length} item{(o.orderItems || []).length > 1 ? 's' : ''}
                    </span>
                    {o.couponCode && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#27ae60', fontWeight: 600 }}>
                        🎟️ {o.couponCode} (-₹{o.discountAmount || 0})
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span style={{
                      background: `${STATUS_COLORS[o.status] || '#999'}22`,
                      color: STATUS_COLORS[o.status] || '#999',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}>
                      {o.status}
                    </span>
                  </td>

                  {/* Actions & Details Modal Trigger */}
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="btn"
                        style={{ padding: '5px 10px', fontSize: '0.8rem', background: 'var(--primary-dark)' }}
                      >
                        🔍 Details
                      </button>

                      {o.status === 'Payment Submitted' && (
                        <>
                          <button
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#27ae60' }}
                            disabled={updating === o.id || deleting === o.id}
                            onClick={() => updateStatus(o.id, 'Paid')}
                          >
                            ✓ Mark Paid
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#e74c3c' }}
                            disabled={updating === o.id || deleting === o.id}
                            onClick={() => updateStatus(o.id, 'Rejected')}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {o.paymentMethod === 'COD' && o.status === 'Pending' && (
                        <button
                          className="btn"
                          style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#2980b9' }}
                          disabled={updating === o.id || deleting === o.id}
                          onClick={() => updateStatus(o.id, 'Shipped')}
                        >
                          📦 Ship COD
                        </button>
                      )}

                      {o.status === 'Paid' && (
                        <button
                          className="btn"
                          style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#2980b9' }}
                          disabled={updating === o.id || deleting === o.id}
                          onClick={() => updateStatus(o.id, 'Shipped')}
                        >
                          📦 Ship
                        </button>
                      )}

                      {o.status === 'Shipped' && (
                        <button
                          className="btn"
                          style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#2ecc71' }}
                          disabled={updating === o.id || deleting === o.id}
                          onClick={() => updateStatus(o.id, 'Delivered')}
                        >
                          🎉 Deliver
                        </button>
                      )}

                      <button
                        className="btn"
                        style={{ padding: '5px 8px', fontSize: '0.8rem', background: '#e04a4a', color: '#fff' }}
                        disabled={deleting === o.id || updating === o.id}
                        onClick={() => deleteOrder(o.id)}
                        title="Delete Order"
                      >
                        {deleting === o.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="modal-backdrop-animated" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(74, 28, 56, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card modal-card-animated" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#ffffff',
            padding: '30px',
            borderRadius: '18px',
            border: '1px solid var(--border-pink)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', margin: 0 }}>
                  Order Details #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>

            {/* Delivery Details Card */}
            <div style={{ background: '#fdf5fc', padding: '18px', borderRadius: '12px', border: '1px solid #f2d6ea', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#822765', margin: '0 0 10px' }}>📍 Delivery Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.92rem' }}>
                <div>
                  <strong>Customer Name:</strong> {selectedOrder.customerName}
                </div>
                <div>
                  <strong>Phone:</strong> <a href={`tel:${selectedOrder.customerPhone}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedOrder.customerPhone}</a>
                </div>
                <div>
                  <strong>Email:</strong> {selectedOrder.customerEmail}
                </div>
                <div>
                  <strong>Pincode:</strong> {selectedOrder.customerPincode}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Full Delivery Address:</strong> {selectedOrder.customerAddress}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', color: 'var(--primary-dark)' }}>💳 Payment & Financials</h4>
              <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                <strong>Payment Mode:</strong> {selectedOrder.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '📱 UPI QR / Online'}
              </p>
              {selectedOrder.paymentIntentId && (
                <p style={{ margin: '4px 0', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  <strong>UTR / Reference ID:</strong> {selectedOrder.paymentIntentId}
                </p>
              )}
              {selectedOrder.couponCode && (
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#27ae60' }}>
                  <strong>Promo Code Applied:</strong> {selectedOrder.couponCode} (-₹{selectedOrder.discountAmount || 0})
                </p>
              )}
              <p style={{ margin: '8px 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Total Order Amount: ₹{selectedOrder.totalAmount}
              </p>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 12px', color: 'var(--primary-dark)' }}>🛍️ Items Ordered ({(selectedOrder.orderItems || []).length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(selectedOrder.orderItems || []).map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt="Product" style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: 45, height: 45, background: '#eee', borderRadius: '6px' }} />
                      )}
                      <div>
                        <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.product?.title || item.productTitle || 'Product'}</strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity} × ₹{item.price}</span>
                      </div>
                    </div>
                    <strong style={{ fontSize: '1rem' }}>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
              <button
                onClick={() => printPackingSlip(selectedOrder)}
                className="btn"
                style={{ padding: '8px 18px', background: '#4a2040' }}
              >
                🖨️ Print Dispatch Packing Slip
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-outline"
                style={{ padding: '8px 18px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
