import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { items, customerDetails } = data

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (product) {
        totalAmount += product.price * item.quantity
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        })
      }
    }

    if (totalAmount === 0) {
      return NextResponse.json({ error: 'Invalid products in cart' }, { status: 400 })
    }

    // Save order with Pending status (no payment gateway needed)
    const dbOrder = await prisma.order.create({
      data: {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerAddress: customerDetails.address,
        totalAmount,
        status: 'Pending',
        orderItems: { create: orderItemsData }
      }
    })

    return NextResponse.json({ dbOrderId: dbOrder.id, totalAmount })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Order creation failed'
    }, { status: 500 })
  }
}
