'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import './login.css'

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/admin'
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminSecretCode, setAdminSecretCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (tab === 'login') {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Login failed')
        }

        router.push(redirectTarget)
        router.refresh()
      } else {
        const res = await fetch('/api/admin/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, adminSecretCode })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Admin registration failed')
        }

        setSuccess('Admin account created successfully! Redirecting...')
        setTimeout(() => {
          router.push(redirectTarget)
          router.refresh()
        }, 1000)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card" style={{ maxWidth: '460px' }}>
        <div className="login-header">
          <h1>Daisy</h1>
          <p>Admin Dashboard Portal</p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.4)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '25px',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '9px',
              border: 'none',
              borderRadius: '7px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: tab === 'login' ? 'var(--primary, #b2589a)' : 'transparent',
              color: tab === 'login' ? '#fff' : 'inherit',
              transition: 'all 0.2s'
            }}
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '9px',
              border: 'none',
              borderRadius: '7px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: tab === 'register' ? 'var(--primary, #b2589a)' : 'transparent',
              color: tab === 'register' ? '#fff' : 'inherit',
              transition: 'all 0.2s'
            }}
          >
            + Register Admin
          </button>
        </div>
        
        {error && <div className="error-message" style={{ marginBottom: '18px' }}>{error}</div>}
        {success && (
          <div style={{
            background: '#eafaf1',
            color: '#27ae60',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '0.9rem',
            border: '1px solid #a9dfbf'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {tab === 'register' && (
            <div className="input-group">
              <label className="input-label" htmlFor="name">Admin Full Name</label>
              <input 
                id="name"
                type="text" 
                className="input-field" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Daisy Owner"
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email">Admin Email</label>
            <input 
              id="email"
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@daisy.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {tab === 'register' && (
            <div className="input-group" style={{ background: '#fdf5fc', padding: '12px', borderRadius: '8px', border: '1px solid #f2d6ea' }}>
              <label className="input-label" htmlFor="secret" style={{ color: '#822765', fontWeight: 600 }}>
                🔑 Admin Secret Code <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                id="secret"
                type="password" 
                className="input-field" 
                value={adminSecretCode}
                onChange={(e) => setAdminSecretCode(e.target.value)}
                required
                placeholder="Enter admin authorization secret code"
              />
              <span style={{ fontSize: '0.78rem', color: '#822765', marginTop: '4px', display: 'block' }}>
                Required to prevent unauthorized users from registering as administrators.
              </span>
            </div>
          )}
          
          <button type="submit" className="btn login-btn" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Processing...' : (tab === 'login' ? 'Sign In to Dashboard' : 'Register Admin Account')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="login-wrapper"><div className="glass-card login-card" style={{ textAlign: 'center', padding: '40px' }}>Loading portal...</div></div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
