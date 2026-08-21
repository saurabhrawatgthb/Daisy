'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../dashboard.css'

export default function AdminSettings() {
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Account deletion state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const router = useRouter()

  useEffect(() => {
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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError('')

    if (!deletePassword) {
      setDeleteError('Password is required to delete your account')
      return
    }

    setDeletingAccount(true)
    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPassword: deletePassword })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete account')

      alert('Admin account deleted. Redirecting to login page...')
      router.push('/admin/login')
      router.refresh()
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account')
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <h1 className="page-title">Admin Account Settings</h1>

      <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

        {/* Credentials Card */}
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

        {/* Danger Zone: Delete Admin Account */}
        <div className="glass-card" style={{ padding: '30px', border: '1px solid #fadbd8', background: '#fffcfc' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#c0392b', marginBottom: '8px' }}>
            ⚠️ Danger Zone
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px' }}>
            Permanently delete your admin account and revoke dashboard access.
          </p>

          <button
            type="button"
            onClick={() => { setDeleteModalOpen(true); setDeleteError(''); }}
            className="btn"
            style={{ background: '#e74c3c', padding: '10px 20px', fontSize: '0.9rem' }}
          >
            🗑️ Delete My Admin Account
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
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
          <div className="glass-card modal-card-animated" style={{ maxWidth: '450px', width: '100%', background: '#fff', padding: '30px', borderRadius: '18px', border: '1px solid #fadbd8', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <h3 style={{ color: '#c0392b', margin: '0 0 10px' }}>Confirm Account Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete your administrator account? You will immediately lose access to this admin dashboard.
            </p>

            {deleteError && (
              <div style={{ background: '#fdedec', color: '#e74c3c', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount}>
              <div className="input-group">
                <label className="input-label">Enter Password to Confirm</label>
                <input
                  required
                  type="password"
                  className="input-field"
                  placeholder="Your current password"
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
  )
}
