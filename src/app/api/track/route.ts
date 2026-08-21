import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await ensureDatabaseSchema()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    // Check if user is logged in
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')
    let currentUser: { id: string; email: string; name?: string | null } | null = null

    if (sessionCookie) {
      const session = await getSession(sessionCookie.value)
      if (session?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId as string },
          select: { id: true, email: true, name: true }
        })
        if (user) currentUser = user
      }
    }

    // 1. If specific order ID requested
    if (id) {
      const order = await prisma.order.findFirst({
        where: {
          id: id.trim(),
          ...(email ? { customerEmail: email.trim().toLowerCase() } : (currentUser ? {
            OR: [
              { userId: currentUser.id },
              { customerEmail: currentUser.email.toLowerCase() }
            ]
          } : {}))
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found. Please check your Order ID and Email.' }, { status: 404 })
      }

      return NextResponse.json({ order, isSession: !!currentUser })
    }

    // 2. If user is logged in and didn't specify an ID, return all user's active/recent orders
    if (currentUser) {
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: currentUser.id },
            { customerEmail: currentUser.email.toLowerCase() }
          ]
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

      return NextResponse.json({ orders, user: currentUser, isSession: true })
    }

    // 3. Guest without ID
    if (!id || !email) {
      return NextResponse.json({ error: 'Order ID and Email are required for guest lookup' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  } catch (error: unknown) {
    console.error('[Track API Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch tracking info'
    }, { status: 500 })
  }
}

