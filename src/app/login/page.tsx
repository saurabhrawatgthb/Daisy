'use client'
import React, { useState, Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useRouter, useSearchParams } from 'next/navigation'
import '../store.css'

function CustomerAuthContent() {
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/my-orders'
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
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
        router.push(redirectTarget)
        router.refresh()
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Registration failed')

        window.dispatchEvent(new Event('authChanged'))
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => {
          router.push(redirectTarget)
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
      <div className="page-header">
        <h1>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h1>
      </div>

      <main className="main-content container" style={{ padding: '50px 20px', minHeight: '60vh' }}>
        <div className="glass-card" style={{ maxWidth: 460, margin: '0 auto', padding: '40px' }}>
          
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
            <div style={{ background: '#fdedec', color: '#e74c3c', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #fadbd8' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#eafaf1', color: '#27ae60', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #a9dfbf' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. priya@example.com"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', marginTop: '10px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In 🌸' : 'Create Account 🌸')}
            </button>
          </form>

        </div>
      </main>
    </>
  )
}

export default function CustomerAuthPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>}>
        <CustomerAuthContent />
      </Suspense>
      <Footer />
    </>
  )
}
