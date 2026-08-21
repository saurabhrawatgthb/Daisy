'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  imageUrl: string
  createdAt: string
}

export default function ShopClient({ initialProducts, initialCategory }: { initialProducts: Product[]; initialCategory?: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured')
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('daisy_wishlist') || '[]')
      setWishlistIds(saved.map((i: any) => i.id))
    } catch {
      setWishlistIds([])
    }

    const handleWishlistChange = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('daisy_wishlist') || '[]')
        setWishlistIds(saved.map((i: any) => i.id))
      } catch {}
    }

    window.addEventListener('wishlistUpdated', handleWishlistChange)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistChange)
  }, [])

  const toggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      let saved = JSON.parse(localStorage.getItem('daisy_wishlist') || '[]')
      const exists = saved.some((i: any) => i.id === product.id)

      if (exists) {
        saved = saved.filter((i: any) => i.id !== product.id)
      } else {
        saved.push({
          id: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category
        })
      }

      localStorage.setItem('daisy_wishlist', JSON.stringify(saved))
      setWishlistIds(saved.map((i: any) => i.id))
      window.dispatchEvent(new Event('wishlistUpdated'))
    } catch (err) {
      console.error(err)
    }
  }

  const quickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const cart = JSON.parse(localStorage.getItem('daisy_cart') || '[]')
      const existing = cart.find((i: any) => i.productId === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1
        })
      }
      localStorage.setItem('daisy_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      alert(`"${product.title}" added to cart! 🛍️`)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchesSearch = !searchTerm ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCat && matchesSearch
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return 0
    })
  }, [initialProducts, selectedCategory, searchTerm, sortBy])

  const categories = ['All', 'Jewellery', 'Scrunchies', 'Claws']

  return (
    <main className="main-content container" style={{ padding: '40px 20px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>

      {/* Sidebar Filters */}
      <aside className="shop-filters" style={{ width: '250px', flexShrink: 0 }}>
        <div className="glass-card" style={{ padding: '25px', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--primary-dark)', fontSize: '1.2rem' }}>Categories</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categories.map(cat => (
              <li key={cat} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: selectedCategory === cat ? 700 : 400,
                    color: selectedCategory === cat ? 'var(--primary-dark)' : 'var(--text-main)',
                    backgroundColor: selectedCategory === cat ? 'var(--bg-light)' : 'transparent',
                    fontSize: '0.95rem'
                  }}
                >
                  {cat === 'All' ? '🌸 All Products' : cat === 'Jewellery' ? '💍 Anti-tarnish Jewellery' : cat === 'Scrunchies' ? '🎀 Scrunchies' : '✨ Hair Claws'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="shop-content" style={{ flex: 1 }}>

        {/* Search and Sort Toolbar */}
        <div className="glass-card" style={{
          padding: '16px 20px',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search jewellery, scrunchies, claws..."
              className="input-field"
              style={{ margin: 0, padding: '10px 14px', fontSize: '0.9rem' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="input-field"
              style={{ margin: 0, padding: '8px 12px', fontSize: '0.88rem', width: 'auto' }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length === 1 ? '' : 's'}
          {searchTerm && <span> matching "<strong>{searchTerm}</strong>"</span>}
        </div>

        {/* Dynamic Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--primary-dark)' }}>No products found</h2>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search keyword or selected category filter.</p>
          </div>
        ) : (
          <div className="shop-product-grid">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id)
              return (
                <div className="product-card" key={product.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={e => toggleWishlist(e, product)}
                    className="wishlist-btn-interactive"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      zIndex: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      boxShadow: '0 2px 8px rgba(212, 67, 139, 0.15)'
                    }}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>

                  <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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

                  <div style={{ padding: '0 15px 15px', marginTop: 'auto' }}>
                    <button
                      onClick={e => quickAddToCart(e, product)}
                      className="btn btn-outline"
                      style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                    >
                      + Quick Add 🛍️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
