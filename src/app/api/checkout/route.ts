import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
})

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

    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    }

    const order = await razorpay.orders.create(options)

    // Save order to Database with Pending status
    const dbOrder = await prisma.order.create({
      data: {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerAddress: customerDetails.address,
        totalAmount,
        paymentIntentId: order.id,
        status: 'Pending',
        orderItems: {
          create: orderItemsData
        }
      }
    })

    return NextResponse.json({ 
      orderId: order.id, 
      currency: order.currency, 
      amount: order.amount,
      dbOrderId: dbOrder.id
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 })
  }
}
