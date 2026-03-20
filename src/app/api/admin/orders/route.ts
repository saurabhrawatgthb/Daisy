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

// PATCH — update order status (Mark Paid / Reject)
export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json()
    const allowed = ['Pending', 'Payment Submitted', 'Paid', 'Rejected', 'Shipped']
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
