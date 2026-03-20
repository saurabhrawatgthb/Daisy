import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

// Called by customer after paying via UPI — stores UTR and marks Payment Submitted
export async function POST(request: Request) {
  try {
    const { orderId, utrNumber } = await request.json()

    if (!orderId || !utrNumber) {
      return NextResponse.json({ error: 'Order ID and UTR number are required' }, { status: 400 })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'Payment Submitted',
        paymentIntentId: utrNumber  // reusing paymentIntentId field to store UTR
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to confirm payment'
    }, { status: 500 })
  }
}
