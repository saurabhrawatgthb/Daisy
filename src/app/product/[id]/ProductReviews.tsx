'use client'
import React, { useState, useEffect } from 'react'

type Review = {
  id: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number>(5)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Form State
  const [userName, setUserName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 5)
        setTotalReviews(data.totalReviews || 0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()

    // Pre-fill user name if logged in
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user?.name) setUserName(d.user.name)
      })
      .catch(() => {})
  }, [productId])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, rating, comment })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review')

      setMessage('✨ Thank you! Your review has been published.')
      setComment('')
      setFormOpen(false)
      fetchReviews()
    } catch (err: any) {
      setMessage(err.message || 'Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < count ? '#f39c12' : '#ddd', fontSize: '1.1rem' }}>
        ★
      </span>
    ))
  }

  return (
    <div style={{ marginTop: '50px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', margin: '0 0 6px' }}>
            Customer Reviews & Ratings
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>{renderStars(Math.round(averageRating))}</div>
            <strong style={{ fontSize: '1.1rem' }}>{averageRating.toFixed(1)} out of 5</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>({totalReviews} reviews)</span>
          </div>
        </div>

        <button
          onClick={() => setFormOpen(!formOpen)}
          className="btn"
          style={{ padding: '10px 22px', fontSize: '0.9rem' }}
        >
          {formOpen ? 'Close Review Form' : '★ Write a Review'}
        </button>
      </div>

      {message && (
        <div style={{
          background: '#eafaf1',
          color: '#27ae60',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #a9dfbf'
        }}>
          {message}
        </div>
      )}

      {/* Review Form */}
      {formOpen && (
        <div className="glass-card" style={{ padding: '25px', marginBottom: '30px', background: '#fff9fd' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--primary-dark)' }}>
            Share Your Experience
          </h3>
          <form onSubmit={handleSubmitReview}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div className="input-group">
                <label className="input-label">Your Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="e.g. Priya"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Your Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        color: star <= rating ? '#f39c12' : '#ddd',
                        padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Your Review / Comments</label>
              <textarea
                required
                rows={3}
                className="input-field"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="How was the quality, fit, finish, or packaging?"
              />
            </div>

            <button type="submit" className="btn" style={{ padding: '10px 24px' }} disabled={submitting}>
              {submitting ? 'Posting Review...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-light)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 10px' }}>No reviews yet for this product.</p>
          <p style={{ fontSize: '0.88rem', color: 'var(--primary-dark)', margin: 0 }}>Be the first to review and earn customer appreciation! ✨</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              padding: '18px 22px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>{review.userName}</strong>
                  <span style={{ fontSize: '0.75rem', background: '#e8f8f5', color: '#27ae60', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    ✓ Verified Buyer
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div style={{ marginBottom: '6px' }}>{renderStars(review.rating)}</div>
              <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
