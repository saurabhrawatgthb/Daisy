import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactUs() {
  return (
    <>
      <Header />
      <div className="page-header">
        <h1>Contact Us</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', minHeight: '50vh' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>We're here to help!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            If you have any questions, concerns, or need assistance, please reach out to us using the numbers below.
          </p>
          
          <div style={{ marginBottom: '25px', padding: '20px', background: 'var(--bg-light)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '10px' }}>Product Related Issues</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>📞 9286749037</p>
          </div>

          <div style={{ padding: '20px', background: 'var(--bg-light)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '10px' }}>Website Related Issues</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>📞 6395982464</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
