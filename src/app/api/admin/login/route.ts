import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'
import { verifyPassword, createSession, hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Ensure database columns exist
    await ensureDatabaseSchema()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Seed the default admin user if none exists
    const userCount = await prisma.user.count().catch(() => 0)
    if (userCount === 0 && cleanEmail === 'admin@daisy.com') {
      const hashedPassword = await hashPassword('daisy123')
      await prisma.user.create({
        data: {
          name: 'Daisy Admin',
          email: 'admin@daisy.com',
          password: hashedPassword,
          role: 'admin'
        }
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // If default admin or existing user without role, ensure role is admin
    if (cleanEmail === 'admin@daisy.com' && user.role !== 'admin') {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' }
      })
      user.role = 'admin'
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Only allow admin role to access admin dashboard
    if (user.role !== 'admin') {
      return NextResponse.json({
        error: 'Access denied. This account does not have administrator privileges.'
      }, { status: 403 })
    }

    const token = await createSession(user.id)

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
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
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[Admin Login Error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

