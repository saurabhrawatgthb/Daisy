'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import '../dashboard.css'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      setProducts(products.filter((p: any) => p.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="dashboard-wrapper">
      <div className="section-header">
        <h1 className="page-title">Products Inventory</h1>
        <Link href="/admin/products/new" className="btn">Add New Product</Link>
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
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
              {products.map((product: any) => (
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
                    <button onClick={() => handleDelete(product.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Delete</button>
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
