'use client'
import React, { useEffect, useState } from 'react'
import '../dashboard.css'

type Coupon = {
  id: string
  code: string
  discountType: string
  discountValue: number
  minOrder: number
  isActive: boolean
  createdAt: string
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [newCode, setNewCode] = useState('')
  const [newType, setNewType] = useState<'percent' | 'flat'>('percent')
  const [newValue, setNewValue] = useState<number>(10)
  const [newMinOrder, setNewMinOrder] = useState<number>(0)
  const [error, setError] = useState('')

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      setCoupons(data.coupons || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          discountType: newType,
          discountValue: Number(newValue),
          minOrder: Number(newMinOrder),
          isActive: true
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon')

      setNewCode('')
      setNewValue(10)
      setNewMinOrder(0)
      setShowAddModal(false)
      fetchCoupons()
      alert('Promo coupon created and live!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive
        })
      })

      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id))
        alert('Coupon deleted successfully!')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Promo Discount Coupons</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage discount codes that customers can apply during checkout.
          </p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setError(''); }}
          className="btn"
          style={{ padding: '10px 20px' }}
        >
          + Create New Promo Code
        </button>
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', background: '#fff9fd', border: '1px solid #f2d6ea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)', margin: 0 }}>
              Create New Promo Discount Code
            </h2>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' }}
            >
              ✕
            </button>
          </div>

          {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}

          <form onSubmit={handleCreateCoupon}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div className="input-group">
                <label className="input-label">Coupon Code (Uppercase)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SUMMER15"
                  className="input-field"
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Discount Type</label>
                <select
                  className="input-field"
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                >
                  <option value="percent">Percentage (% OFF)</option>
                  <option value="flat">Flat Amount (₹ OFF)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Discount Value {newType === 'percent' ? '(%)' : '(₹)'}</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={newType === 'percent' ? 100 : 10000}
                  className="input-field"
                  value={newValue}
                  onChange={e => setNewValue(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Min Order Value (₹) (Optional)</label>
                <input
                  type="number"
                  min={0}
                  className="input-field"
                  placeholder="0 = No minimum"
                  value={newMinOrder}
                  onChange={e => setNewMinOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" disabled={submitting} style={{ padding: '10px 24px' }}>
                {submitting ? 'Saving...' : 'Publish Live Coupon'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline"
                style={{ padding: '10px 18px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
        {loading ? (
          <p className="empty-state">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="empty-state">No promo coupons created yet. Create your first coupon to offer customer discounts!</p>
        ) : (
          <table className="daisy-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min Cart Value</th>
                <th>Live Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: '#fdf5fc',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #f2d6ea',
                      color: 'var(--primary-dark)'
                    }}>
                      🎟️ {coupon.code}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} Flat OFF`}
                    </strong>
                  </td>
                  <td>
                    {coupon.minOrder > 0 ? `₹${coupon.minOrder}` : 'No Minimum'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(coupon)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: coupon.isActive ? '#e8f8f5' : '#fdedec',
                        color: coupon.isActive ? '#27ae60' : '#e74c3c'
                      }}
                      title="Click to toggle active status"
                    >
                      {coupon.isActive ? '● Live (Active)' : '○ Inactive (Paused)'}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(coupon.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      className="btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.8rem', color: '#e74c3c', borderColor: '#e74c3c' }}
                    >
                      Delete
                    </button>
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
