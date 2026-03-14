'use client'
import React, { useEffect, useState } from 'react'

export default function CartCount() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const parseCount = () => {
    const items = JSON.parse(localStorage.getItem('daisy_cart') || '[]')
    setCount(items.reduce((acc: number, item: any) => acc + item.quantity, 0))
  }

  useEffect(() => {
    parseCount()
    setMounted(true)
    window.addEventListener('cartUpdated', parseCount)
    window.addEventListener('storage', parseCount)
    return () => {
      window.removeEventListener('cartUpdated', parseCount)
      window.removeEventListener('storage', parseCount)
    }
  }, [])

  if (!mounted) return <span className="cart-count">0</span>

  return <span className="cart-count">{count}</span>
}
