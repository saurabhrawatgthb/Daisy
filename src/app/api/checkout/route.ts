import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { sendOrderNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { items, customerDetails, paymentMethod = 'UPI' } = data

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    let totalAmount = 0
    const orderItemsData = []
    const notificationItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (product) {
        totalAmount += product.price * item.quantity
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        })
        notificationItems.push({
          title: product.title,
          quantity: item.quantity,
          price: product.price
        })
      }
    }

    if (totalAmount === 0) {
      return NextResponse.json({ error: 'Invalid products in cart' }, { status: 400 })
    }

    // Shipping calculation (Free for Dehradun, ₹30 otherwise)
    const isDehradun = customerDetails.address?.toLowerCase().includes('dehradun')
    const shippingFee = (totalAmount === 0 || isDehradun) ? 0 : 30
    const finalAmount = totalAmount + shippingFee

    // Check if user is logged in via customer_session cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')
    let userId: string | null = null

    if (sessionCookie) {
      const session = await getSession(sessionCookie.value)
      if (session?.userId) {
        userId = session.userId as string
      }
    }

    // Save order in DB
    const dbOrder = await prisma.order.create({
      data: {
        userId: userId || undefined,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email.trim().toLowerCase(),
        customerPhone: customerDetails.phone,
        customerPincode: customerDetails.pincode,
        customerAddress: customerDetails.address,
        totalAmount: finalAmount,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'UPI',
        status: 'Pending',
        orderItems: { create: orderItemsData }
      }
    })

    // Trigger Email and SMS notifications for both Customer and Admin
    try {
      await sendOrderNotifications({
        orderId: dbOrder.id,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerAddress: customerDetails.address,
        customerPincode: customerDetails.pincode,
        totalAmount: finalAmount,
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'UPI',
        items: notificationItems
      })
    } catch (notifyErr) {
      console.error('[Notification Dispatch Error]:', notifyErr)
      // Do not fail order creation if notification encounters an issue
    }

    return NextResponse.json({
      dbOrderId: dbOrder.id,
      totalAmount: finalAmount,
      paymentMethod: dbOrder.paymentMethod
    })
  } catch (error: unknown) {
    console.error('[Order Creation Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Order creation failed'
    }, { status: 500 })
  }
}

