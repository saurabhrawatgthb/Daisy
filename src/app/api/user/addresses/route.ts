import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getAuthenticatedUserId() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('customer_session')
  if (!sessionCookie) return null

  const session = await getSession(sessionCookie.value)
  return (session?.userId as string) || null
}

export async function GET() {
  try {
    await ensureDatabaseSchema()
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json({ addresses: [] })
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ addresses })
  } catch (error: unknown) {
    console.error('[Get Addresses Error]:', error)
    return NextResponse.json({ addresses: [] })
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema()
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Please log in to save addresses' }, { status: 401 })
    }

    const { label = 'Home', name, phone, address, pincode, isDefault = false } = await request.json()

    if (!name || !phone || !address || !pincode) {
      return NextResponse.json({ error: 'Name, Phone, Address, and Pincode are required' }, { status: 400 })
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label: label.trim() || 'Home',
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        isDefault: Boolean(isDefault)
      }
    })

    return NextResponse.json({ success: true, address: newAddress })
  } catch (error: unknown) {
    console.error('[Add Address Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to save address'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDatabaseSchema()
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('id')

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    await prisma.address.deleteMany({
      where: {
        id: addressId,
        userId
      }
    })

    return NextResponse.json({ success: true, message: 'Address deleted' })
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete address'
    }, { status: 500 })
  }
}
