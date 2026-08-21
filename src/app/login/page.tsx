'use client'
import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../store.css'

export default function CustomerAuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed')

        window.dispatchEvent(new Event('authChanged'))
        router.push('/my-orders')
        router.refresh()
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, address, pincode })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Registration failed')

        window.dispatchEvent(new Event('authChanged'))
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => {
          router.push('/my-orders')
          router.refresh()
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="page-header">
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h1>
      </div>

      <main className="main-content container" style={{ padding: '50px 20px', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: 500, margin: '0 auto', padding: '40px' }}>
          
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-light)',
            padding: '5px',
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: mode === 'login' ? 'var(--primary)' : 'transparent',
                color: mode === 'login' ? '#fff' : 'var(--text-muted)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: mode === 'register' ? 'var(--primary)' : 'transparent',
                color: mode === 'register' ? '#fff' : 'var(--text-muted)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{
              background: '#fdedec',
              color: '#e74c3c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              border: '1px solid #fadbd8'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#eafaf1',
              color: '#27ae60',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              border: '1px solid #a9dfbf'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {mode === 'register' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  At least 6 characters
                </span>
              )}
            </div>

            {mode === 'register' && (
              <>
                <div className="input-group">
                  <label className="input-label">Default Shipping Address (Optional)</label>
                  <textarea
                    rows={2}
                    className="input-field"
                    placeholder="House, Street, Locality"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Pincode (Optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 248001"
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating Account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
