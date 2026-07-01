import { useEffect, useRef, useState } from 'react'
import './ScrollQuote.css'

export function ScrollQuote() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true)
        })
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className={`scroll-quote ${isVisible ? 'is-visible' : ''}`}
    >
      <p className="scroll-quote__text">
        thankful for every silly, sweet,
        <br />
        and happy moment together.
      </p>
    </section>
  )
}
