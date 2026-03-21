import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'
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

    // Shipping calculation
    const isDehradun = customerDetails.address.toLowerCase().includes('dehradun')
    const finalAmount = totalAmount + (isDehradun ? 0 : 30)

    // Save order with Pending status (no payment gateway needed)
    const dbOrder = await prisma.order.create({
      data: {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerPincode: customerDetails.pincode,
        customerAddress: customerDetails.address,
        totalAmount: finalAmount,
        status: 'Pending',
        orderItems: { create: orderItemsData }
      }
    })

    // --- Send Email Notification ---
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', // You can change this if using another provider
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          }
        });

        const mailOptions = {
          from: `"Daisy Store" <${process.env.SMTP_EMAIL}>`,
          to: customerDetails.email,
          subject: `Order Confirmation - ${dbOrder.id.slice(0, 8).toUpperCase()}`,
          html: `
            <h2>Thank you for your order, ${customerDetails.name}!</h2>
            <p>Your order (<strong>#${dbOrder.id.slice(0, 8).toUpperCase()}</strong>) has been placed successfully.</p>
            <p><strong>Total Amount:</strong> ₹${finalAmount}</p>
            <p>Please complete your UPI payment to confirm the order.</p>
            <p>You can track your order status anytime at <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/track">our tracking page</a>.</p>
            <br/>
            <p>Warm regards,<br/>The Daisy Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent to', customerDetails.email);
      } catch (err) {
        console.error('Failed to send email:', err);
        // We don't throw here; order was still created successfully
      }
    } else {
      console.warn('SMTP_EMAIL and SMTP_PASSWORD not set in .env. Skipping email notification.');
    }

    return NextResponse.json({ dbOrderId: dbOrder.id, totalAmount: finalAmount })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Order creation failed'
    }, { status: 500 })
  }
}
