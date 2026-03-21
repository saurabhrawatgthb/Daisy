import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id || !email) {
      return NextResponse.json({ error: 'Order ID and Email are required' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        customerEmail: email
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customerName: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found. Please check ID and Email.' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch tracking info'
    }, { status: 500 })
  }
}
