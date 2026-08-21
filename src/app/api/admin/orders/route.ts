import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

// GET all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true }
    })
    return NextResponse.json({ orders })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// PATCH — update order status (Mark Paid / Reject / Shipped / Delivered)
export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json()
    const allowed = ['Pending', 'Payment Submitted', 'Paid', 'Rejected', 'Shipped', 'Delivered']
    if (!orderId || !allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
    return NextResponse.json({ order, success: true })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update order'
    }, { status: 500 })
  }
}

// DELETE — permanently delete an order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    let orderId = searchParams.get('id')
    
    if (!orderId) {
      const body = await request.json().catch(() => ({}))
      orderId = body.orderId || body.id
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Delete associated order items first if cascade is not automatic, but schema has onDelete: Cascade
    await prisma.orderItem.deleteMany({
      where: { orderId }
    })

    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({ success: true, message: 'Order deleted successfully' })
  } catch (error: unknown) {
    console.error('[Delete Order Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete order'
    }, { status: 500 })
  }
}

