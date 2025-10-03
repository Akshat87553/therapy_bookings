import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Testimonial {
  name: string;
  quote: string;
  image: string;
}

const data: Testimonial[] = [
  { name: 'Marina Lopez', quote: '“PurePilates gave me a way to rediscover my strength—both physical and mental.”', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { name: 'Jonas Schmidt', quote: '“I never thought a gym could feel like home, until I walked into PurePilates.”', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
  { name: 'Aaliyah Carter', quote: '“My posture, my mood, my entire outlook—changed for the better.”', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
  { name: 'Samuel Reed', quote: '“Five stars for the instructors, the vibe, and that post-class stretch!”', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
  { name: 'Priya Singh', quote: '“From day one I felt supported—and I’m stronger than ever.”', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
];

const CARD_WIDTH_REM = 18;
const GAP_REM = 2;
const DESKTOP_BREAKPOINT = 1024; // Tailwind's 'lg' breakpoint

export default function FiveBoxTestimonials() {
  const [isMobile, setIsMobile] = useState(false);
  const [index, setIndex] = useState(1); // Start at the first "real" slide
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Clone the first and last slides to create the infinite loop effect
  const slides = [data[data.length - 1], ...data, data[0]];

  // --- HOOKS ---

  // Check for mobile screen size on mount and on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The core logic for the seamless loop
  useEffect(() => {
    if (!trackRef.current) return;

    const handleTransitionEnd = () => {
      if (trackRef.current) {
        // When the transition to a cloned slide ends, disable animations
        trackRef.current.style.transition = 'none';
        
        // If we are on the cloned "first" slide (at the end of the array)
        if (index === slides.length - 1) {
          setIndex(1); // Snap back to the real first slide
        }
        
        // If we are on the cloned "last" slide (at the beginning of the array)
        if (index === 0) {
          setIndex(slides.length - 2); // Snap back to the real last slide
        }
      }
    };

    const track = trackRef.current;
    track.addEventListener('transitionend', handleTransitionEnd);
    return () => track.removeEventListener('transitionend', handleTransitionEnd);
  }, [index, slides.length]);

  // --- HANDLERS ---

  const slideTo = (newIndex: number) => {
    if (trackRef.current) {
      // Re-enable transitions before moving
      trackRef.current.style.transition = 'transform 0.5s ease-in-out';
      setIndex(newIndex);
    }
  };

  const handleNext = () => slideTo(index + 1);
  const handlePrev = () => slideTo(index - 1);

  // --- DYNAMIC STYLES ---

  // Calculate the transform value based on screen size
  const transformStyle = {
    transform: isMobile
      ? `translateX(-${index * 100}%)`
      : `translateX(-${index * (CARD_WIDTH_REM + GAP_REM)}rem)`,
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex"
            style={transformStyle}
          >
            {slides.map((testimonial, i) => (
              <div
                key={i}
                // Use responsive classes for mobile and desktop styling
                className={`flex-shrink-0 rounded-lg bg-[#F2F7FA] ${
                  isMobile ? 'w-full p-6' : 'p-8'
                }`}
                style={!isMobile ? {
                  width: `${CARD_WIDTH_REM}rem`,
                  marginRight: `${GAP_REM}rem`,
                } : {}}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-serif text-xl md:text-2xl text-gray-800 mb-4 leading-snug">
                  {testimonial.quote}
                </p>
                <p className="text-sm uppercase tracking-wide text-gray-700">
                  {testimonial.name}
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
  );
}