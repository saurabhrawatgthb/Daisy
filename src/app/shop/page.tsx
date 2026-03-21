import React from 'react'
import Header from '@/components/Header'
export const dynamic = 'force-dynamic';
import Footer from '@/components/Footer'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import '../store.css'

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  
  const where = category ? { category } : {}
  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
  } catch {
    // DB unavailable — render page with empty products
  }


  return (
    <>
      <Header />
      <div className="page-header">
        <h1>{category ? `${category} Collection` : 'All Accessories'}</h1>
      </div>
      
      <main className="main-content container" style={{ padding: '60px 20px', display: 'flex', gap: '40px' }}>
        
        {/* Sticky Filters Sidebar */}
        <aside className="shop-filters" style={{ width: '250px', flexShrink: 0 }}>
          <div className="glass-card" style={{ padding: '30px', position: 'sticky', top: '120px' }}>
            <h3 style={{ marginBottom: '25px', color: 'var(--primary-dark)', fontSize: '1.3rem' }}>Categories</h3>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '15px' }}>
                <Link href="/shop" style={{ fontWeight: !category ? 600 : 400, color: !category ? 'var(--primary-dark)' : 'var(--text-main)', display: 'block' }}>All Products</Link>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <Link href="/shop?category=Jewellery" style={{ fontWeight: category === 'Jewellery' ? 600 : 400, color: category === 'Jewellery' ? 'var(--primary-dark)' : 'var(--text-main)', display: 'block' }}>Anti-tarnish Jewellery</Link>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <Link href="/shop?category=Scrunchies" style={{ fontWeight: category === 'Scrunchies' ? 600 : 400, color: category === 'Scrunchies' ? 'var(--primary-dark)' : 'var(--text-main)', display: 'block' }}>Scrunchies</Link>
              </li>
              <li>
                <Link href="/shop?category=Claws" style={{ fontWeight: category === 'Claws' ? 600 : 400, color: category === 'Claws' ? 'var(--primary-dark)' : 'var(--text-main)', display: 'block' }}>Hair Claws</Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Dynamic Product Grid */}
        <div className="shop-content" style={{ flex: 1 }}>
          {products.length === 0 ? (
            <div className="empty-state glass-card" style={{ padding: '50px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No products found in this category.</h2>
              <p style={{ color: 'var(--text-muted)' }}>Check back later for new arrivals.</p>
            </div>
          ) : (
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
          )}
        </div>

      </main>
      <Footer />
    </>
  )
}
