'use client'
import { useEffect } from 'react'

export default function AnimationObserver() {
  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-on-scroll, .reveal-fade-up, .reveal-scale-in, .reveal-stagger').forEach(el => {
        el.classList.add('is-revealed')
      })
      return
    }

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    })

    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-fade-up, .reveal-scale-in, .reveal-stagger, .product-card, .category-card, .stat-card')
      elements.forEach((el, index) => {
        if (!el.classList.contains('is-revealed')) {
          // Set automatic stagger delay for sibling cards
          if (el.parentElement?.classList.contains('reveal-stagger') || el.parentElement?.classList.contains('product-grid') || el.parentElement?.classList.contains('shop-product-grid')) {
            const childIndex = Array.from(el.parentElement.children).indexOf(el)
            const delay = Math.min((childIndex % 6) * 75, 450)
            ;(el as HTMLElement).style.setProperty('--reveal-delay', `${delay}ms`)
          }
          observer.observe(el)
        }
      })
    }

    observeElements()

    // Re-observe if DOM content updates
    const mutationObserver = new MutationObserver(() => {
      observeElements()
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return null
}
