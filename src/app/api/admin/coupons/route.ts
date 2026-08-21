import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await ensureDatabaseSchema()
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ coupons })
  } catch (error: unknown) {
    return NextResponse.json({ coupons: [] })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema()
    const { code, discountType = 'percent', discountValue, minOrder = 0, isActive = true } = await request.json()

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Coupon code and discount value are required' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode }
    })

    if (existing) {
      return NextResponse.json({ error: `Coupon code "${cleanCode}" already exists` }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType === 'flat' ? 'flat' : 'percent',
        discountValue: Number(discountValue),
        minOrder: Number(minOrder) || 0,
        isActive: Boolean(isActive)
      }
    })

    return NextResponse.json({ success: true, coupon })
  } catch (error: unknown) {
    console.error('[Create Coupon Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create coupon'
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabaseSchema()
    const { id, isActive, discountValue, minOrder } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(typeof discountValue === 'number' ? { discountValue } : {}),
        ...(typeof minOrder === 'number' ? { minOrder } : {})
      }
    })

    return NextResponse.json({ success: true, coupon: updated })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update coupon'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDatabaseSchema()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete coupon'
    }, { status: 500 })
  }
}
