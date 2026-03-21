import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')

  if (!email || !phone) {
    return NextResponse.json({ error: 'Email and Phone number are required' }, { status: 400 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: email.trim(),
        customerPhone: phone.trim()
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error finding orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
