'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../../dashboard.css'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Jewellery')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let imageUrl = ''

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed')
        imageUrl = uploadData.url
      }

      const productRes = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, price, category, description, imageUrl
        })
      })

      if (!productRes.ok) {
        const productData = await productRes.json()
        throw new Error(productData.error || 'Failed to create product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-wrapper" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Add New Product</h1>
      
      <div className="glass-card" style={{ padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Product Image</label>
            <input 
              type="file" 
              accept="image/*"
              className="input-field"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Title *</label>
            <input 
              type="text" 
              className="input-field"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Price (₹) *</label>
            <input 
              type="number"
              step="0.01" 
              className="input-field"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Category *</label>
            <select 
              className="input-field"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Jewellery">Jewellery</option>
              <option value="Scrunchies">Scrunchies</option>
              <option value="Hair Claws">Hair Claws</option>
              <option value="Decor">Decor</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              className="input-field"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" className="btn-outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
