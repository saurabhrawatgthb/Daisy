'use client'
import React, { useState, useEffect } from 'react'
import '../dashboard.css'

export default function AdminSettings() {
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Fetch current admin profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/admin/change-credentials')
        const data = await res.json()
        if (data.user) {
          setCurrentEmail(data.user.email)
          setNewEmail(data.user.email)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!currentPassword) {
      setMessage({ text: 'Current password is required to save changes', type: 'error' })
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' })
      return
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail !== currentEmail ? newEmail : undefined,
          newPassword: newPassword || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials')
      }

      setMessage({ text: '✅ Credentials updated successfully!', type: 'success' })
      if (data.user?.email) {
        setCurrentEmail(data.user.email)
        setNewEmail(data.user.email)
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Admin Account Settings</h1>

      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div className="glass-card" style={{ padding: '35px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--primary-dark)' }}>
            🔒 Change Admin Credentials
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '25px' }}>
            Update your admin login email address or change your password.
          </p>

          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: 500,
              background: message.type === 'success' ? '#eafaf1' : '#fdedec',
              color: message.type === 'success' ? '#27ae60' : '#e74c3c',
              border: `1px solid ${message.type === 'success' ? '#a9dfbf' : '#fadbd8'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Current Admin Email</label>
              <input
                type="email"
                className="input-field"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="admin@daisy.com"
                required
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                You can change this email to any valid email address you want to use for admin login.
              </span>
            </div>

            <div style={{ margin: '25px 0', borderTop: '1px solid var(--border)' }}></div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--primary-dark)' }}>
              Change Password (Optional)
            </h3>

            <div className="input-group">
              <label className="input-label">New Password (leave empty to keep current)</label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                autoComplete="new-password"
              />
            </div>

            {newPassword && (
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            <div style={{ margin: '25px 0', borderTop: '1px solid var(--border)' }}></div>

            <div className="input-group" style={{ background: '#fdf7fc', padding: '16px', borderRadius: '10px', border: '1px solid #f2d6ea' }}>
              <label className="input-label" style={{ color: '#822765', fontWeight: 600 }}>
                Current Password <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="password"
                className="input-field"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password to confirm changes"
                required
                autoComplete="current-password"
              />
              <span style={{ fontSize: '0.8rem', color: '#822765', marginTop: '4px', display: 'block' }}>
                Required for security verification before saving any changes.
              </span>
            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Updated Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
