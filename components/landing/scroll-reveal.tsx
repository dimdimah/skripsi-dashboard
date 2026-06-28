'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
}

export function ScrollReveal({ children, className = '', delay = 0, y = 32, duration = 700 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1), transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
