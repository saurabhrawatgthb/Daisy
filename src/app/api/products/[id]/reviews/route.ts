import { NextResponse } from 'next/server'
import { prisma, ensureDatabaseSchema } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSchema()
    const { id } = await params

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' }
    })

    const total = reviews.length
    const averageRating = total > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total) : 5

    return NextResponse.json({ reviews, averageRating, totalReviews: total })
  } catch (error: unknown) {
    return NextResponse.json({ reviews: [], averageRating: 5, totalReviews: 0 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseSchema()
    const { id } = await params
    const { userName, rating, comment } = await request.json()

    if (!userName || !rating || !comment) {
      return NextResponse.json({ error: 'Name, rating, and comment are required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('customer_session')
    let userId: string | null = null

    if (sessionCookie) {
      const session = await getSession(sessionCookie.value)
      if (session?.userId) userId = session.userId as string
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId,
        userName: userName.trim(),
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: comment.trim()
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error: unknown) {
    console.error('[Add Review Error]:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to submit review'
    }, { status: 500 })
  }
}
