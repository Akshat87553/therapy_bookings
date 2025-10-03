import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import bgImage from './templetes/faqimage.png';

const faqData = [
  { question: "What is Pilates and how is it different from yoga?", answer: "Pilates is a system..." },
  { question: "Do I need to be fit to start Pilates?", answer: "No, Pilates is suitable..." },
  { question: "How often should I practice Pilates to see results?", answer: "For optimal results..." },
  { question: "What should I wear to a Pilates class?", answer: "Wear comfortable..." },
  { question: "What's the difference between mat and reformer Pilates?", answer: "Mat Pilates is performed..." },
  { question: "Is Pilates safe during pregnancy?", answer: "Yes, when modified appropriately..." }
];

const TickerContent = () => (
  <span className="flex-shrink-0 text-white text-base font-bold">
    {Array(8).fill(null).map((_, index) => (
      <span key={index} className="px-4">work with me {'\u00A0\u00A0\u00A0'} ✿</span>
    ))}
  </span>
);

/* ---------------------------
   DESKTOP VIEW - VERBATIM (unchanged)
   --------------------------- */
const DesktopView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const toggleQuestion = (i: number) => setOpenIndex(openIndex === i ? null : i);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="faq"
      className="relative min-h-screen flex flex-col justify-between text-white overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        // shift BG up at 30% of scroll speed
        backgroundPosition: `center ${-offsetY * 0.3}px`,
        clipPath: 'ellipse(100% 92% at 50% 0%)',
      }}
    >
      {/* Top Ticker */}
      <div className="relative z-10 overflow-hidden whitespace-nowrap py-4">
        <div className="flex animate-marquee">
          <TickerContent /><TickerContent />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div data-aos="fade-right" data-aos-duration="1000">
          <h4 className="uppercase text-sm tracking-wider mb-2">FAQs</h4>
          <h2 className="text-5xl md:text-6xl font-serif leading-tight">
            you’ve got<br />
            <span className="italic">questions.</span> I’ve<br />
            got <span className="italic">answers.</span>
          </h2>
        </div>

        <div className="space-y-4" data-aos="fade-left" data-aos-duration="1000">
          {faqData.map((faq, i) => (
            <div key={i} className="border-t border-white/70 pt-4">
              <button
                onClick={() => toggleQuestion(i)}
                className="w-full flex justify-between items-center text-left font-bold text-lg focus:outline-none"
              >
                {faq.question}
                {openIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <div className={[
                'overflow-hidden transition-all duration-300 text-sm text-white/80',
                openIndex === i ? 'max-h-40 mt-2' : 'max-h-0'
              ].join(' ')}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="col-span-full flex justify-center mt-16" data-aos="fade-up" data-aos-duration="1000">
          <button className="px-8 py-3 border border-white rounded-full text-sm hover:bg-white hover:text-black transition font-bold">
            BOOK A CALL TO GET STARTED
          </button>
        </div>
      </div>

      {/* Bottom ticker */}
      <div className="relative z-10 overflow-hidden whitespace-nowrap py-4 bg-black/30">
        <div className="inline-block animate-marquee text-white text-sm font-medium">
          {Array(8).fill('work with me ✿   ').join('')}
        </div>
      </div>
    </section>
  );
};

/* ---------------------------
   MOBILE VIEW - TUNED (only mobile changes)
   --------------------------- */
/* ---------- MobileView (REPLACE THIS ONLY) ---------- */
/* ---------- MobileView (SAFE REPLACEMENT) ---------- */
/* ---------- MobileView (UPDATED) ---------- */
const MobileView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState<number>(0);
  const marqueeSpeed = 12; // seconds, increase = slower, decrease = faster
  const toggleQuestion = (i: number) => setOpenIndex(openIndex === i ? null : i);

  // safe scroll listener for parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setOffsetY(window.pageYOffset || 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // inject keyframes once
  useEffect(() => {
    const id = 'marquee-mobile-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      @keyframes marqueeMobile {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
    // keep it — harmless to keep after unmount
  }, []);

  const bgPosition = `center ${-offsetY * 0.3}px`; // parallax factor matches desktop

  return (
    <section
      id="faq"
      className="relative min-h-screen flex flex-col justify-between text-white"
      style={{
        WebkitOverflowScrolling: 'touch',
        // ensure enough bottom spacing so CTA isn't clipped by curve
        paddingBottom: `calc(5.5rem + env(safe-area-inset-bottom, 0px))`,
        backgroundColor: 'transparent',
        overflow: 'visible',
      }}
    >
      {/* BACKGROUND LAYER: clipped ellipse + parallax */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: bgPosition,
          // curve visible at the bottom (only on the background)
          clipPath: 'ellipse(110% 88% at 50% -18%)',
        }}
      />

      {/* overlay for legibility (lighter so image shows through) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'rgba(0,0,0,0.18)',
          pointerEvents: 'none',
        }}
      />

      {/* CONTENT (above bg & overlay) */}
      <div style={{ position: 'relative', zIndex: 10 }} className="relative mx-auto px-5 pt-12 w-full max-w-xl">
        {/* Top marquee (no bottom ticker) */}
        <div className="relative overflow-hidden whitespace-nowrap py-3">
          <div style={{ width: '200%', display: 'inline-block' }}>
            <div
              style={{
                display: 'inline-flex',
                animation: `marqueeMobile ${marqueeSpeed}s linear infinite`,
                willChange: 'transform',
              }}
            >
              {Array.from({ length: 2 }).map((_, blockIndex) => (
                <div key={blockIndex} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {Array.from({ length: 6 }).map((__, idx) => (
                    <span key={idx} className="flex-shrink-0 text-white text-sm font-semibold px-3">
                      work with me &nbsp;&nbsp;&nbsp; ✿
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-4" data-aos="fade-right" data-aos-duration="700">
          <h4 className="uppercase text-xs tracking-wider mb-2 text-gray-200">FAQs</h4>
          <h2 className="text-3xl sm:text-4xl font-serif leading-tight text-white">
            <span className="block">you've got</span>
            <span className="block italic">questions.</span>
            <span className="block">i've got <span className="italic">answers.</span></span>
          </h2>
        </div>

        {/* Accordion */}
        <ul className="w-full" data-aos="fade-left" data-aos-duration="700">
          {faqData.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={i} className="w-full">
                <div className="flex items-center justify-between py-4">
                  <button
                    onClick={() => toggleQuestion(i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="flex items-start gap-4 w-full text-left focus:outline-none"
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.9)',
                        transform: isOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform .18s',
                        flexShrink: 0,
                      }}
                      aria-hidden
                    >
                      <span style={{ color: '#fff', fontWeight: 700, lineHeight: 1 }}>+</span>
                    </div>

                    <span className="flex-1 text-base font-semibold text-white">
                      {faq.question}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleQuestion(i)}
                    className="ml-3 p-1 -mr-2 text-white/90 focus:outline-none"
                    aria-hidden
                  >
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.28)' }} />

                <div
                  id={`faq-${i}`}
                  style={{
                    overflow: 'hidden',
                    transition: 'max-height .28s ease, opacity .24s ease',
                    maxHeight: isOpen ? '320px' : '0px',
                    marginTop: isOpen ? 12 : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p style={{ paddingBottom: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
                    {faq.answer}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="mt-6 flex justify-center" data-aos="fade-up" data-aos-duration="700">
          <button className="mx-auto block w-full max-w-xs text-center px-6 py-3 border border-white rounded-full text-sm font-bold uppercase bg-transparent hover:bg-white/90 hover:text-black transition">
            BOOK A CALL TO GET STARTED
          </button>
        </div>
      </div>
    </section>
  );
};



/* ---------------------------
   Main: show/hide via CSS (desktop unchanged)
   --------------------------- */
const FAQResponsive: React.FC = () => {
  return (
    <>
      <div className="hidden lg:block"><DesktopView /></div>
      <div className="block lg:hidden"><MobileView /></div>
    </>
  );
};

export default FAQResponsive;
