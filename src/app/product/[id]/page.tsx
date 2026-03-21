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
              <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }} />
            ) : (
              <div className="placeholder" style={{ color: 'var(--text-muted)' }}>No Image Available</div>
            )}
          </div>

          <div className="product-info-large">
            <span style={{ textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--primary-dark)', fontSize: '0.85rem', fontWeight: 700 }}>{product.category}</span>
            <h1 className="product-header-title" style={{ fontSize: '2.5rem', margin: '10px 0', lineHeight: 1.2 }}>{product.title}</h1>
            
            {/* Price and Ratings (Amazon-like) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <span style={{ color: '#f39c12', fontSize: '1.2rem' }}>★★★★★</span>
              <span style={{ color: '#007185', fontSize: '0.9rem', cursor: 'pointer' }}>124 ratings</span>
            </div>

            <p className="product-header-price" style={{ fontSize: '2.2rem', color: '#B12704', fontWeight: 600, marginBottom: '5px', fontFamily: 'var(--font-heading)' }}>
              <span style={{ fontSize: '1.2rem', verticalAlign: 'top' }}>₹</span>{product.price}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '30px' }}>Inclusive of all taxes</p>
            
            <div style={{ background: '#fff', padding: '25px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontFamily: 'var(--font-body)', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Details</h3>
              <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem' }}>{product.description || 'Experience the elegant touch of Daisy with this premium accessory.'}</p>
            </div>

            <AddToCartButton product={product} />

            {/* Feature Badges */}
            <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 45, height: 45, background: '#fcf8fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', fontSize: '1.5rem' }}>🚚</div>
                <span style={{ fontSize: '0.8rem', color: '#007185', lineHeight: 1.2 }}>Free Delivery<br/>on ₹1000+</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 45, height: 45, background: '#fcf8fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', fontSize: '1.5rem' }}>🔒</div>
                <span style={{ fontSize: '0.8rem', color: '#007185', lineHeight: 1.2 }}>Secure<br/>Transaction</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 45, height: 45, background: '#fcf8fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', fontSize: '1.5rem' }}>✨</div>
                <span style={{ fontSize: '0.8rem', color: '#007185', lineHeight: 1.2 }}>Premium<br/>Quality</span>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #e9ecef' }}>
              <p><strong>Arrives:</strong> Generally in 3-5 business days.</p>
              <p style={{ marginTop: '5px', color: '#007185', fontWeight: 500 }}>In stock and ready to pack.</p>
              <p style={{ marginTop: '5px', color: 'var(--success)', fontWeight: 600 }}>🎊 Free delivery across Dehradun!</p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
