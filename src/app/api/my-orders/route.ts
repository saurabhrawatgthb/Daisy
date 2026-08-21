import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')

  try {
    // Check if customer is logged in
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')

    if (sessionCookie) {
      const session = await getSession(sessionCookie.value)
      if (session?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId as string }
        })

        if (user) {
          // Fetch orders connected to this user ID OR matching user email
          const orders = await prisma.order.findMany({
            where: {
              OR: [
                { userId: user.id },
                { customerEmail: user.email.trim().toLowerCase() }
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

          return NextResponse.json({ orders, user: { name: user.name, email: user.email } })
        }
      }
    }

    // Guest lookup requiring email and phone
    if (!email || !phone) {
      return NextResponse.json({ error: 'Please log in or enter both Email and Phone number' }, { status: 400 })
    }

    const orders = await prisma.order.findMany({
      where: {
        customerEmail: email.trim().toLowerCase(),
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

