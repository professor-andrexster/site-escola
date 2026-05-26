'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4
}

export default function AnimateOnScroll({ children, className, delay = 0 }: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('reveal', delay > 0 && `reveal-delay-${delay}`, className)}
    >
      {children}
    </div>
  )
}
