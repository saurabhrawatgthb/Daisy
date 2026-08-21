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
