import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Seed the admin user if none exists (for ease of use directly by the user)
    const userCount = await prisma.user.count();
    if (userCount === 0 && email === 'admin@daisy.com') {
      const { hashPassword } = await import('@/lib/auth');
      const hashedPassword = await hashPassword('daisy123'); // Default password
      await prisma.user.create({
        data: {
          email: 'admin@daisy.com',
          password: hashedPassword
        }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createSession(user.id)

    const response = NextResponse.json({ success: true })
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
