import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema()
    const { code, subtotal = 0 } = await request.json()

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Please enter a coupon code' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, error: `Invalid coupon code "${cleanCode}"` }, { status: 404 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: `Promo code "${cleanCode}" is no longer active` }, { status: 400 })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: `Promo code "${cleanCode}" has expired` }, { status: 400 })
    }

    if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum cart value of ₹${coupon.minOrder} required for code "${cleanCode}"`
      }, { status: 400 })
    }

    let discount = 0
    if (coupon.discountType === 'percent') {
      discount = Math.round((subtotal * coupon.discountValue) / 100)
    } else {
      discount = Math.min(subtotal, coupon.discountValue)
    }

    const label = coupon.discountType === 'percent'
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} Flat OFF`

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      label
    })
  } catch (error: unknown) {
    console.error('[Validate Coupon Error]:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate promo code' }, { status: 500 })
  }
}
