import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma, ensureDatabaseSchema } from '@/lib/db'
import ShopClient from './ShopClient'
import '../store.css'

export const dynamic = 'force-dynamic'

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await ensureDatabaseSchema()
  const { category } = await searchParams

  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (e) {
    console.error('Failed to load products:', e)
  }

  return (
    <>
      <Header />
      <div className="page-header">
        <h1>{category ? `${category} Collection` : 'All Accessories'}</h1>
      </div>
      <ShopClient
        initialProducts={JSON.parse(JSON.stringify(products))}
        initialCategory={category || 'All'}
      />
      <Footer />
    </>
  )
}

