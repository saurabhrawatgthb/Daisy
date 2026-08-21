import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, verifyPassword, hashPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSession(sessionCookie.value)
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized or session expired' }, { status: 401 })
    }

    const { currentPassword, newEmail, newPassword } = await request.json()

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to make changes' }, { status: 400 })
    }

    if (!newEmail && !newPassword) {
      return NextResponse.json({ error: 'Please provide either a new email or new password' }, { status: 400 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.userId as string }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 })
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, adminUser.password)
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    // Check if new email is already taken by another user
    if (newEmail && newEmail.toLowerCase() !== adminUser.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: newEmail.trim().toLowerCase() }
      })
      if (existing) {
        return NextResponse.json({ error: 'Email address is already in use' }, { status: 400 })
      }
    }

    const updateData: { email?: string; password?: string } = {}

    if (newEmail && newEmail.trim().length > 0) {
      updateData.email = newEmail.trim().toLowerCase()
    }

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }
      updateData.password = await hashPassword(newPassword.trim())
    }

    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully!',
      user: updatedUser
    })
  } catch (error: unknown) {
    console.error('[Change Credentials Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update credentials'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await getSession(sessionCookie.value)
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        email: true,
        role: true,
        name: true
      }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json({ user: adminUser })
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch admin profile' }, { status: 500 })
  }
}

// DELETE — Permanently delete admin account
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

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

    const adminUser = await prisma.user.findUnique({
      where: { id: session.userId as string }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    const isValid = await verifyPassword(confirmPassword, adminUser.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
    }

    // Delete admin account
    await prisma.user.delete({
      where: { id: adminUser.id }
    })

    const response = NextResponse.json({ success: true, message: 'Admin account deleted successfully' })
    response.cookies.set('session', '', { maxAge: 0, path: '/' })
    return response
  } catch (error: unknown) {
    console.error('[Delete Admin Account Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete account'
    }, { status: 500 })
  }
}

