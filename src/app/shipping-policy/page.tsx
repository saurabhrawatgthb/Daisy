import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ShippingPolicy() {
  return (
    <>
      <Header />
      <div className="page-header">
        <h1>Shipping Policy</h1>
      </div>
      <main className="main-content container" style={{ padding: '60px 20px', minHeight: '50vh' }}>
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
          <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>Order Processing Time</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
            All orders are processed within 1 to 3 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
          </p>

          <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)', marginTop: '30px' }}>Shipping Rates & Estimates</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
            Shipping charges for your order will be calculated and displayed at checkout. We offer standard and express shipping options across India. Delivery typically takes 3-7 business days depending on your location.
          </p>

          <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)', marginTop: '30px' }}>How do I check the status of my order?</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            You can also check your order status on our <a href="/my-orders" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>My Orders</a> page or the Track Order page using your Order ID.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
