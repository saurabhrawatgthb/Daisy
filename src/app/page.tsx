import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import './store.css'

export const revalidate = 60; // Revalidate every minute for fast updates

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <>
      <Header />
      <main className="main-content">
        
        {/* Elegant Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Elevate Your Everyday Elegance</h1>
            <p className="hero-subtitle">Discover our exclusive collection of premium anti-tarnish jewellery and handcrafted scrunchies.</p>
            <div className="hero-actions">
              <Link href="/shop" className="btn hero-btn">Shop Collection</Link>
            </div>
          </div>
          <div className="hero-overlay"></div>
        </section>

        {/* Categories Showcase */}
        <section className="categories-section container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            <Link href="/shop?category=Jewellery" className="category-card">
              <div className="category-image placeholder-image jewellry"></div>
              <div className="category-info">
                <h3>Anti-tarnish Jewellery</h3>
                <span className="shop-link">Explore &rarr;</span>
              </div>
            </Link>
            <Link href="/shop?category=Scrunchies" className="category-card">
              <div className="category-image placeholder-image scrunchie"></div>
              <div className="category-info">
                <h3>Silk Scrunchies</h3>
                <span className="shop-link">Explore &rarr;</span>
              </div>
            </Link>
            <Link href="/shop?category=Claws" className="category-card">
              <div className="category-image placeholder-image decor"></div>
              <div className="category-info">
                <h3>Hair Claws</h3>
                <span className="shop-link">Explore &rarr;</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-section container">
          <h2 className="section-title">New Arrivals</h2>
          <div className="product-grid">
            {featuredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>More products coming soon.</p>
            ) : (
              featuredProducts.map((product: any) => (
                <Link href={`/product/${product.id}`} className="product-card" key={product.id}>
                  <div className="product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} />
                    ) : (
                      <div className="placeholder">No Image</div>
                    )}
                  </div>
                  <div className="product-details">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-price">₹{product.price}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
             <Link href="/shop" className="btn-outline">View All Accessories</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
