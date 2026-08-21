import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id }
    })
    
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const product = await prisma.product.update({
      where: { id },
      data
    })
    return NextResponse.json({ product, success: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // 1. Delete associated reviews
    await prisma.review.deleteMany({
      where: { productId: id }
    }).catch(() => {})

    // 2. Set productTitle on orderItems before deleting reference if needed
    const product = await prisma.product.findUnique({ where: { id } })
    if (product) {
      await prisma.orderItem.updateMany({
        where: { productId: id },
        data: {
          productTitle: product.title,
          productId: null
        }
      }).catch(() => {})
    }

    // 3. Delete the product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error: unknown) {
    console.error('[Delete Product Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete product'
    }, { status: 500 })
  }
}

