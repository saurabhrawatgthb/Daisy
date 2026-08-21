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
  const searchParams = useSearchParams()
  const queryCat = searchParams.get('category')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(queryCat || initialCategory || 'All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured')
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (queryCat) {
      setSelectedCategory(queryCat)
    }
  }, [queryCat])

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

  const filteredProducts = useMemo(() => {
    const normalize = (cat: string) => {
      const c = (cat || '').toLowerCase().trim()
      if (c.includes('jewel')) return 'jewellery'
      if (c.includes('scrunch')) return 'scrunchies'
      if (c.includes('claw')) return 'claws'
      return c
    }

    const target = normalize(selectedCategory)

    return initialProducts.filter(p => {
      const pCat = normalize(p.category)
      const matchesCat = target === 'all' || pCat === target || pCat.includes(target) || target.includes(pCat)
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

  const categories = [
    { key: 'All', label: '🌸 All Products' },
    { key: 'Jewellery', label: '💍 Jewellery' },
    { key: 'Scrunchies', label: '🎀 Scrunchies' },
    { key: 'Claws', label: '✨ Hair Claws' }
  ]

  return (
    <main className="main-content container shop-page-container">

      {/* Sidebar / Mobile Pill Filter */}
      <aside className="shop-filters">
        <div className="glass-card shop-filters-card">
          <h3 className="shop-filters-title">Categories</h3>
          <div className="shop-category-list">
            {categories.map(cat => {
              const isSelected = selectedCategory.toLowerCase().includes(cat.key.toLowerCase()) ||
                (cat.key === 'All' && selectedCategory.toLowerCase() === 'all')
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`shop-category-btn ${isSelected ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Shop Content Area */}
      <div className="shop-content">

        {/* Search and Sort Toolbar */}
        <div className="glass-card shop-toolbar">
          {/* Search Box */}
          <div className="shop-search-wrapper">
            <input
              type="text"
              placeholder="🔍 Search jewellery, scrunchies, claws..."
              className="input-field shop-search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="shop-search-clear"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="shop-sort-wrapper">
            <span className="shop-sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="input-field shop-sort-select"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="shop-results-counter">
          Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length === 1 ? '' : 's'}
          {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
          {searchTerm && <span> matching "<strong>{searchTerm}</strong>"</span>}
        </div>

        {/* Dynamic Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--primary-dark)' }}>No products found</h2>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search keyword or selected category filter.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
              className="btn-outline"
              style={{ marginTop: '20px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="shop-product-grid">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id)
              return (
                <div className="product-card" key={product.id}>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={e => toggleWishlist(e, product)}
                    className="wishlist-btn-interactive"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 3,
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      boxShadow: '0 2px 8px rgba(212, 67, 139, 0.18)'
                    }}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>

                  <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="product-image">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          loading="lazy"
                        />
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

                </div>
              )
            })}
          </div>
        )}

      </div>

    </main>
  )
}
