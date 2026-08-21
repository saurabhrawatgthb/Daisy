import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, address, pincode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: cleanEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        pincode: pincode?.trim() || null,
        role: 'customer'
      }
    })

    // Create session token
    const token = await createSession(newUser.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        pincode: newUser.pincode,
        role: newUser.role
      }
    })

    response.cookies.set('customer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response
  } catch (error: unknown) {
    console.error('[Register Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to register account'
    }, { status: 500 })
  }
}
