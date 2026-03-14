import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCartButton from './AddToCartButton'
import '../../store.css'

export const dynamic = 'force-dynamic';

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="main-content container" style={{ padding: '60px 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <Link href="/shop" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}>&larr; Back to Shop</Link>
        </div>

        <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
          
          <div className="product-image-large glass-card" style={{ height: '600px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="placeholder" style={{ color: 'var(--text-muted)' }}>No Image Available</div>
            )}
          </div>

          <div className="product-info-large">
            <span style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--primary-dark)', fontSize: '0.85rem', fontWeight: 700 }}>{product.category}</span>
            <h1 style={{ fontSize: '3rem', margin: '15px 0', lineHeight: 1.1 }}>{product.title}</h1>
            <p style={{ fontSize: '2.5rem', color: 'var(--text-main)', fontWeight: 400, marginBottom: '30px', fontFamily: 'var(--font-heading)' }}>₹{product.price}</p>
            
            <div style={{ background: '#fff', padding: '30px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h3>
              <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{product.description || 'Experience the elegant touch of Daisy with this premium accessory.'}</p>
            </div>

            <AddToCartButton product={product} />

            <div style={{ marginTop: '40px', fontSize: '0.95rem', color: 'var(--text-muted)', display: 'grid', gap: '15px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> Free shipping on orders over ₹1000
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> Premium anti-tarnish guarantee
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> Secure payments via Razorpay
              </p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
