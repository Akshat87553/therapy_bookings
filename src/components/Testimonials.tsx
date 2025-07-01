import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface Testimonial {
  name: string
  quote: string
  image: string
}

// ─── your five testimonials ─────────────────────────────────────
const data: Testimonial[] = [
  { name: 'Marina Lopez', quote: '“PurePilates gave me a way to rediscover my strength—both physical and mental.”', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { name: 'Jonas Schmidt', quote: '“I never thought a gym could feel like home, until I walked into PurePilates.”', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
  { name: 'Aaliyah Carter', quote: '“My posture, my mood, my entire outlook—changed for the better.”', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
  { name: 'Samuel Reed', quote: '“Five stars for the instructors, the vibe, and that post-class stretch!”', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
  { name: 'Priya Singh', quote: '“From day one I felt supported—and I’m stronger than ever.”', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
]

// ─── constants ───────────────────────────────────────────────────
const CARD_WIDTH_REM = 18
const GAP_REM = 2
const VISIBLE = 5

export default function FiveBoxTestimonials() {
  // clone first/last for seamless looping
  const slides = [data[data.length - 1], ...data, data[0]]
  const [index, setIndex] = useState(1)
  const trackRef = useRef<HTMLDivElement>(null)

  // trigger slide (with smooth transition)
  const slideTo = (newIndex: number) => {
    const track = trackRef.current!
    track.style.transition = 'transform 0.5s ease-in-out'
    setIndex(newIndex)
  }

  const handleNext = () => slideTo(index + 1)
  const handlePrev = () => slideTo(index - 1)

  // after the transition, snap back if we're on a clone
  useEffect(() => {
    const track = trackRef.current!
    const onEnd = () => {
      track.style.transition = 'none'
      if (index === slides.length - 1) {
        setIndex(1)
      } else if (index === 0) {
        setIndex(slides.length - 2)
      }
    }
    track.addEventListener('transitionend', onEnd)
    return () => track.removeEventListener('transitionend', onEnd)
  }, [index, slides.length])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex"
            style={{
              // track width = total slides × (card + gap)
              width: `${slides.length * (CARD_WIDTH_REM + GAP_REM)}rem`,
              // shift = index × (card + gap)
              transform: `translateX(-${index * (CARD_WIDTH_REM + GAP_REM)}rem)`,
            }}
          >
            {slides.map((t, i) => (
              <div
                key={i}
                className="bg-[#F2F7FA] rounded-lg p-8 text-center flex-shrink-0"
                style={{
                  width: `${CARD_WIDTH_REM}rem`,
                  marginRight: i < slides.length - 1 ? `${GAP_REM}rem` : 0,
                }}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-serif text-2xl text-gray-800 mb-4 leading-snug">
                  {t.quote}
                </p>
                <p className="text-sm uppercase tracking-wide text-gray-700">
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12 space-x-6">
          <button
            onClick={handlePrev}
            className="w-12 h-12 bg-[#ABC7D6] rounded-full flex items-center justify-center hover:bg-[#95AEC1] transition"
          >
            <ArrowLeft size={24} color="white" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-[#ABC7D6] rounded-full flex items-center justify-center hover:bg-[#95AEC1] transition"
          >
            <ArrowRight size={24} color="white" />
          </button>
        </div>
      </div>
    </section>
  )
}
