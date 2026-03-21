'use client'
import React, { useState } from 'react'
import Link from 'next/link'

export default function AddToCartButton({ product }: { product: any }) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('daisy_cart') || '[]')
    const existing = currentCart.find((item: any) => item.productId === product.id)
    
    if (existing) {
      existing.quantity += 1
    } else {
      currentCart.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1
      })
    }
    
    localStorage.setItem('daisy_cart', JSON.stringify(currentCart))
    
    // Dispatch event to update Header cart count
    window.dispatchEvent(new Event('cartUpdated'))
    
    
    setAdded(true)
  }

  return (
    <div style={{ display: 'flex', gap: '15px' }}>
      <button 
        onClick={handleAddToCart} 
        className={added ? "btn-outline" : "btn"} 
        style={{ flex: 1, padding: '20px', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}
      >
        {added ? '✓ Added' : 'Add to Cart'}
      </button>
      {added && (
        <Link 
          href="/cart" 
          className="btn" 
          style={{ flex: 1, padding: '20px', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px', textAlign: 'center', background: '#27ae60' }}
        >
          Go to Cart 🛒
        </Link>
      )}
    </div>
  )
}
