import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')

    if (!sessionCookie) {
      return NextResponse.json({ user: null })
    }

    const session = await getSession(sessionCookie.value)
    if (!session || !session.userId) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        pincode: true,
        role: true
      }
    })

    return NextResponse.json({ user })
  } catch (error: unknown) {
    return NextResponse.json({ user: null })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSession(sessionCookie.value)
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { confirmPassword } = await request.json()
    if (!confirmPassword) {
      return NextResponse.json({ error: 'Password confirmation is required to delete your account' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { verifyPassword } = await import('@/lib/auth')
    const isValid = await verifyPassword(confirmPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
    }

    // Delete user (associated addresses cascade, orders have userId set to null)
    await prisma.user.delete({
      where: { id: user.id }
    })

    const response = NextResponse.json({ success: true, message: 'Account deleted successfully' })
    response.cookies.set('customer_session', '', { maxAge: 0, path: '/' })
    return response
  } catch (error: unknown) {
    console.error('[Delete Customer Account Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete account'
    }, { status: 500 })
  }
}

