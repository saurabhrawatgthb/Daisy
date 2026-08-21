import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'
import { hashPassword, createSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema()

    const { name, email, password, adminSecretCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!adminSecretCode) {
      return NextResponse.json({
        error: 'Admin Secret Code is required to register as an Administrator.'
      }, { status: 400 })
    }

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'daisy_admin_secret_2026'

    if (adminSecretCode.trim() !== expectedSecret.trim()) {
      return NextResponse.json({
        error: 'Invalid Admin Secret Code. You are not authorized to create an Admin account.'
      }, { status: 403 })
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

    const newAdmin = await prisma.user.create({
      data: {
        name: name?.trim() || 'Store Admin',
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin'
      }
    })

    const token = await createSession(newAdmin.id)

    const response = NextResponse.json({
      success: true,
      message: 'Admin account created successfully!',
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    })

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return response
  } catch (error: unknown) {
    console.error('[Admin Register Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to register admin account'
    }, { status: 500 })
  }
}
