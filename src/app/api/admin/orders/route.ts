import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true }
    })
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
