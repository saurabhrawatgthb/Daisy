import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import './store.css'

export const dynamic = 'force-dynamic';

export default async function Home() {
  let featuredProducts: any[] = []
  let jewelleryProducts: any[] = []
  let scrunchiesProducts: any[] = []
  let clawsProducts: any[] = []
  try {
    featuredProducts = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
    jewelleryProducts = await prisma.product.findMany({
      where: { category: 'Jewellery' },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
    scrunchiesProducts = await prisma.product.findMany({
      where: { category: 'Scrunchies' },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
    clawsProducts = await prisma.product.findMany({
      where: { category: 'Hair Claws' },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
  } catch {
    // DB unavailable
  }

  const renderProductGrid = (products: any[], emptyMessage: string) => {
    if (products.length === 0) {
      return <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)' }}>{emptyMessage}</p>
    }
    return (
      <div className="product-grid">
        {products.map((product: any) => (
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
        ))}
      </div>
    )
  }

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
                <h3>Scrunchies</h3>
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
          {renderProductGrid(featuredProducts, 'More products coming soon.')}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/shop" className="btn-outline">View All Accessories</Link>
          </div>
        </section>

        <section className="featured-section container">
          <h2 className="section-title">Premium Jewellery</h2>
          {renderProductGrid(jewelleryProducts, 'New jewellery coming soon.')}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/shop?category=Jewellery" className="btn-outline">Shop Jewellery</Link>
          </div>
        </section>

        <section className="featured-section container">
          <h2 className="section-title">Scrunchies</h2>
          {renderProductGrid(scrunchiesProducts, 'New scrunchies coming soon.')}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/shop?category=Scrunchies" className="btn-outline">Shop Scrunchies</Link>
          </div>
        </section>

        <section className="featured-section container">
          <h2 className="section-title">Hair Claws</h2>
          {renderProductGrid(clawsProducts, 'New hair claws coming soon.')}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/shop?category=Hair Claws" className="btn-outline">Shop Hair Claws</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
