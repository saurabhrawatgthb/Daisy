import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

// GET: count of Pending / Payment Submitted orders (for notification badge)
export async function GET() {
  try {
    const count = await prisma.order.count({
      where: {
        status: { in: ['Pending', 'Payment Submitted'] }
      }
    })
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
