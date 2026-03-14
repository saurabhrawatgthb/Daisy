'use client'
import React, { useState } from 'react'

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
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button 
      onClick={handleAddToCart} 
      className="btn" 
      style={{ width: '100%', padding: '20px', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}
    >
      {added ? '✓ Added to Cart!' : 'Add to Cart'}
    </button>
  )
}
