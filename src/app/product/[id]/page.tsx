import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCartButton from './AddToCartButton'
import ProductReviews from './ProductReviews'
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
      <main className="main-content container" style={{ padding: '40px 20px 70px' }}>
        <div style={{ marginBottom: '25px' }}>
          <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            &larr; Back to Shop Collection
          </Link>
        </div>

        <div className="product-detail-grid">
          
          {/* Product Image Box */}
          <div className="product-image-large glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fff' }}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '480px' }}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontStyle: 'italic' }}>No Image Available</div>
            )}
          </div>

          {/* Product Info & Actions */}
          <div className="product-info-large" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700 }}>
                {product.category}
              </span>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'var(--primary-dark)', margin: '6px 0 10px', lineHeight: 1.25 }}>
                {product.title}
              </h1>
            </div>

            {/* Price Tag */}
            <div style={{ background: 'var(--primary-soft)', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border-pink)' }}>
              <p style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'var(--primary-dark)', fontWeight: 700, margin: 0, lineHeight: 1 }}>
                ₹{product.price}
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Inclusive of all taxes • Handcrafted with love 🌸
              </span>
            </div>

            {/* Product Details Box */}
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.9)' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1rem', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
                About this piece
              </h3>
              <p style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '0.95rem', margin: 0 }}>
                {product.description || 'Experience the elegant touch of Daisy with this premium accessory.'}
              </p>
            </div>

            {/* Add to Cart Button */}
            <AddToCartButton product={product} />

            {/* Quality and Delivery Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginTop: '10px' }}>
              <div style={{ background: 'var(--bg-light)', padding: '12px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🚚</div>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                  Free Delivery<br />in Dehradun
                </span>
              </div>
              <div style={{ background: 'var(--bg-light)', padding: '12px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🛡️</div>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                  Anti-Tarnish<br />Guaranteed
                </span>
              </div>
              <div style={{ background: 'var(--bg-light)', padding: '12px 8px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>✨</div>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                  Premium<br />Packaging
                </span>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: '10px', fontSize: '0.88rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ margin: 0 }}><strong>Dispatch:</strong> Dispatched in 24-48 hours from Dehradun.</p>
              <p style={{ margin: 0, color: 'var(--primary-dark)', fontWeight: 600 }}>🎊 Free delivery on all orders in Dehradun!</p>
            </div>
          </div>

        </div>

        {/* Customer Reviews & Ratings */}
        <ProductReviews productId={product.id} />
      </main>
      <Footer />
    </>
  )
}
