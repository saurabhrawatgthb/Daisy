'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

type OrderStatus = {
  id: string
  status: string
  paymentMethod?: string
  totalAmount: number
  createdAt: string
  customerName: string
  customerEmail: string
  customerAddress?: string
  customerPincode?: string
  orderItems: OrderItem[]
}

type SavedAddress = {
  id: string
  label: string
  name: string
  phone: string
  address: string
  pincode: string
  isDefault?: boolean
}

export default function MyOrders() {
  const [tab, setTab] = useState<'orders' | 'addresses' | 'settings'>('orders')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<OrderStatus[] | null>(null)
  const [user, setUser] = useState<{ id?: string; name?: string; email: string } | null>(null)
  const router = useRouter()

  // Address Book state
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    name: '',
    phone: '',
    address: '',
    pincode: ''
  })

  // Account deletion state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch logged-in user's orders & addresses automatically
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
              fetchAddresses()
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

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressLoading(true)
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add address')

      setNewAddr({ label: 'Home', name: '', phone: '', address: '', pincode: '' })
      setShowAddAddress(false)
      fetchAddresses()
      alert('Address added successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAddressLoading(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' })
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteUserAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError('')

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm')
      return
    }

    setDeletingAccount(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPassword: deletePassword })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to delete account')

      alert('Your account has been deleted successfully.')
      window.dispatchEvent(new Event('authChanged'))
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account')
    } finally {
      setDeletingAccount(false)
    }
  }

  const printInvoice = (order: OrderStatus) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = (order.orderItems || []).map(i => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${i.product?.title || i.productTitle || 'Product Item'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${i.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${i.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${i.price * i.quantity}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Daisy Invoice - #${order.id.slice(0, 8).toUpperCase()}</title>
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
            <p>Official Order Tax Invoice / Receipt</p>
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
        <h1>My Account & Orders</h1>
      </div>
      <main className="main-content container" style={{ padding: '50px 20px', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '35px' }}>

          {/* Account Profile Header */}
          {user && (
            <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', margin: '0 0 4px' }}>
                    Welcome, {user.name || user.email}! 🌸
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Account email: <strong>{user.email}</strong>
                  </p>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '6px', background: '#f5e8f3', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setTab('orders')}
                    style={{
                      padding: '7px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      background: tab === 'orders' ? 'var(--primary, #b2589a)' : 'transparent',
                      color: tab === 'orders' ? '#fff' : 'inherit'
                    }}
                  >
                    📦 Orders
                  </button>
                  <button
                    onClick={() => setTab('addresses')}
                    style={{
                      padding: '7px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      background: tab === 'addresses' ? 'var(--primary, #b2589a)' : 'transparent',
                      color: tab === 'addresses' ? '#fff' : 'inherit'
                    }}
                  >
                    📍 Addresses ({addresses.length})
                  </button>
                  <button
                    onClick={() => setTab('settings')}
                    style={{
                      padding: '7px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      background: tab === 'settings' ? 'var(--primary, #b2589a)' : 'transparent',
                      color: tab === 'settings' ? '#fff' : 'inherit'
                    }}
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: ORDERS */}
          {tab === 'orders' && (
            <div>
              {!user && (
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sign in to view all your connected orders and saved addresses.</span>
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

                    <button type="submit" className="btn" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                      {loading ? 'Searching Orders...' : 'Find My Orders'}
                    </button>
                  </form>
                </>
              )}

              {initialLoading && user ? (
                <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading your orders...</p>
              ) : orders && (
                <div style={{ marginTop: user ? '0' : '35px' }}>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🛍️</div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1.05rem' }}>You haven't placed any orders yet.</p>
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
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>Order ID</p>
                              <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-dark)', margin: '2px 0' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{
                                background: `${STATUS_COLORS[order.status] || '#999'}22`,
                                color: STATUS_COLORS[order.status] || '#999',
                                padding: '4px 14px',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                display: 'inline-block',
                                marginBottom: '6px'
                              }}>
                                {order.status}
                              </span>
                              <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                                ₹{order.totalAmount}{' '}
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                  ({order.paymentMethod === 'COD' ? '💵 COD' : '💳 UPI'})
                                </span>
                              </p>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>Items:</p>
                            {(order.orderItems || []).map(item => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.92rem' }}>
                                <span>{item.quantity}× {item.product?.title || item.productTitle || 'Product Item'}</span>
                                <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <button
                              onClick={() => printInvoice(order)}
                              style={{ background: 'none', border: 'none', color: '#4a2040', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              🖨️ Print Invoice
                            </button>
                            <Link href={`/track`} style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                              Track Live Delivery Status →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESS BOOK */}
          {tab === 'addresses' && user && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>
                  Manage Delivery Addresses
                </h3>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="btn"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  {showAddAddress ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {/* Add New Address Form */}
              {showAddAddress && (
                <div style={{ background: '#fff9fd', padding: '24px', borderRadius: '12px', border: '1px solid #f2d6ea', marginBottom: '25px' }}>
                  <h4 style={{ margin: '0 0 15px', color: 'var(--primary-dark)' }}>Add a New Delivery Address</h4>
                  <form onSubmit={handleAddAddress}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label className="input-label">Address Tag</label>
                        <select
                          className="input-field"
                          value={newAddr.label}
                          onChange={e => setNewAddr({ ...newAddr, label: e.target.value })}
                        >
                          <option value="Home">🏠 Home</option>
                          <option value="Work">🏢 Work / Office</option>
                          <option value="Other">📍 Other / Friend</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label className="input-label">Recipient Name</label>
                        <input
                          required
                          type="text"
                          className="input-field"
                          placeholder="e.g. Rahul Verma"
                          value={newAddr.name}
                          onChange={e => setNewAddr({ ...newAddr, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <input
                          required
                          type="tel"
                          className="input-field"
                          placeholder="e.g. 9876543210"
                          value={newAddr.phone}
                          onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Pincode</label>
                        <input
                          required
                          type="text"
                          className="input-field"
                          placeholder="e.g. 248001"
                          value={newAddr.pincode}
                          onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Complete Address Details</label>
                      <textarea
                        required
                        rows={2}
                        className="input-field"
                        placeholder="House / Flat No., Street, Landmark, City, State"
                        value={newAddr.address}
                        onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn" disabled={addressLoading} style={{ padding: '10px 22px' }}>
                      {addressLoading ? 'Saving...' : 'Save Address'}
                    </button>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 10px' }}>No saved addresses found.</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--primary-dark)', margin: 0 }}>Add multiple addresses to quickly choose where your orders are delivered!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                  {addresses.map(addr => (
                    <div key={addr.id} style={{ padding: '18px', borderRadius: '12px', border: '1px solid var(--border)', background: '#ffffff', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', background: '#f5e8f3', color: 'var(--primary-dark)', fontWeight: 700 }}>
                          {addr.label}
                        </span>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '1rem', margin: '4px 0' }}>{addr.name}</p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0', lineHeight: 1.4 }}>{addr.address}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0' }}>PIN: <strong>{addr.pincode}</strong> • 📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SETTINGS & PRIVACY (DELETE ACCOUNT) */}
          {tab === 'settings' && user && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', marginBottom: '15px' }}>
                Account Settings & Privacy
              </h3>

              <div style={{ background: '#faf4f9', padding: '20px', borderRadius: '12px', border: '1px solid #f2d6ea', marginBottom: '25px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>
                  <strong>Account Name:</strong> {user.name || 'Not provided'}
                </p>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>
                  <strong>Registered Email:</strong> {user.email}
                </p>
              </div>

              {/* Danger Zone: Delete User Account */}
              <div style={{ padding: '25px', borderRadius: '12px', border: '1px solid #fadbd8', background: '#fffcfc' }}>
                <h4 style={{ color: '#c0392b', margin: '0 0 8px', fontSize: '1.1rem' }}>
                  ⚠️ Delete Account
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.5 }}>
                  Once you delete your account, your profile and saved addresses will be permanently removed.
                </p>
                <button
                  onClick={() => { setDeleteModalOpen(true); setDeleteError(''); }}
                  className="btn"
                  style={{ background: '#e74c3c', padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  🗑️ Delete My Account
                </button>
              </div>

              {/* User Account Deletion Modal */}
              {deleteModalOpen && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '20px'
                }}>
                  <div className="glass-card" style={{ maxWidth: '450px', width: '100%', background: '#fff', padding: '30px', borderRadius: '16px' }}>
                    <h3 style={{ color: '#c0392b', margin: '0 0 10px' }}>Delete Your Account?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                      Please enter your password to confirm account deletion. This action cannot be undone.
                    </p>

                    {deleteError && (
                      <div style={{ background: '#fdedec', color: '#e74c3c', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                        {deleteError}
                      </div>
                    )}

                    <form onSubmit={handleDeleteUserAccount}>
                      <div className="input-group">
                        <label className="input-label">Confirm Your Password</label>
                        <input
                          required
                          type="password"
                          className="input-field"
                          placeholder="••••••••"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                          type="submit"
                          className="btn"
                          style={{ background: '#e74c3c', flex: 1, padding: '10px' }}
                          disabled={deletingAccount}
                        >
                          {deletingAccount ? 'Deleting...' : 'Yes, Delete Account'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalOpen(false)}
                          className="btn btn-outline"
                          style={{ flex: 1, padding: '10px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
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
