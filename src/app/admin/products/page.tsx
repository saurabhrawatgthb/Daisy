'use client'
import React, { useEffect, useState } from 'react'
import { Product } from '@prisma/client'
import Link from 'next/link'
import '../dashboard.css'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete product')
      
      setProducts(prev => prev.filter((p) => p.id !== id))
      alert('Product deleted successfully!')
    } catch (e: any) {
      alert(e.message || 'Failed to delete product')
      fetchProducts()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="page-title">Products Inventory</h1>
        <Link href="/admin/products/new" className="btn">Add New Product</Link>
      </div>

      <div className="glass-card" style={{ padding: '30px', overflowX: 'auto' }}>
        {loading ? (
          <p className="empty-state">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-state">No products found. Add your first product!</p>
        ) : (
          <table className="daisy-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '8px' }}></div>
                    )}
                  </td>
                  <td>{product.title}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      disabled={deletingId === product.id}
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#e74c3c', borderColor: '#e74c3c' }}
                    >
                      {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
