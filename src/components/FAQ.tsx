import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import bgImage from './templetes/faqimage.png'

const faqData = [
  {
    question: "What is Pilates and how is it different from yoga?",
    answer: "Pilates is a system of exercises that focuses on strengthening the core, improving posture, and enhancing body awareness. While both Pilates and yoga can improve flexibility and strength, Pilates places more emphasis on core strength and precise, controlled movements, whereas yoga often incorporates spiritual elements and has a stronger focus on flexibility and meditation."
  },
  {
    question: "Do I need to be fit to start Pilates?",
    answer: "No, Pilates is suitable for all fitness levels. Our instructors can modify exercises to accommodate beginners and those with physical limitations, gradually building your strength and capabilities over time. Pilates is actually an excellent starting point for those new to fitness as it focuses on proper alignment and controlled movement."
  },
  {
    question: "How often should I practice Pilates to see results?",
    answer: "For optimal results, we recommend practicing Pilates 2-3 times per week. Many clients report feeling changes in their posture and body awareness after just a few sessions, while more visible physical changes typically occur after 10-12 consistent sessions. Remember that consistency is more important than frequency."
  },
  {
    question: "What should I wear to a Pilates class?",
    answer: "Wear comfortable, form-fitting clothing that allows you to move freely and lets instructors see your body alignment. Avoid loose t-shirts that might fall over your head during inverted positions. Pilates is typically done barefoot or with special Pilates socks that have grips on the bottom."
  },
  {
    question: "What's the difference between mat and reformer Pilates?",
    answer: "Mat Pilates is performed on the floor with minimal or no equipment, using your body weight as resistance. Reformer Pilates uses a specialized machine that provides adjustable spring resistance and a sliding carriage, allowing for a greater variety of exercises and more targeted resistance training. Both methods focus on the same Pilates principles but offer different experiences and benefits."
  },
  {
    question: "Is Pilates safe during pregnancy?",
    answer: "Yes, when modified appropriately, Pilates can be very beneficial during pregnancy. Our prenatal Pilates classes are specifically designed for expectant mothers and focus on maintaining core strength, pelvic stability, and overall fitness in a safe manner. Always consult with your healthcare provider before beginning any exercise program during pregnancy."
  }
];

const FAQ: React.FC = () => {
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
      {/* Overlay to darken */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left */}
        <div data-aos="fade-right" data-aos-duration="1000">
          <h4 className="uppercase text-sm tracking-wider mb-2">FAQs</h4>
          <h2 className="text-5xl md:text-6xl font-serif leading-tight">
            you’ve got<br />
            <span className="italic">questions.</span> I’ve<br />
            got <span className="italic">answers.</span>
          </h2>
        </div>

        {/* Right FAQ */}
        <div className="space-y-4" data-aos="fade-left" data-aos-duration="1000">
          {faqData.map((faq, i) => (
            <div key={i} className="border-t border-white/70 pt-4">
              <button
                onClick={() => toggleQuestion(i)}
                className="w-full flex justify-between items-center text-left font-medium text-lg focus:outline-none"
              >
                {faq.question}
                {openIndex === i
                  ? <ChevronUp size={20}/>
                  : <ChevronDown size={20}/>}
              </button>
              <div
                className={[
                  'overflow-hidden transition-all duration-300 text-sm text-white/80',
                  openIndex === i ? 'max-h-40 mt-2' : 'max-h-0'
                ].join(' ')}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="col-span-full flex justify-center mt-16" data-aos="fade-up" data-aos-duration="1000">
          <button className="px-8 py-3 border border-white rounded-full text-sm hover:bg-white hover:text-black transition">
            BOOK A CALL TO GET STARTED
          </button>
        </div>
      </div>

      {/* Sliding ticker */}
      <div className="relative z-10 overflow-hidden whitespace-nowrap py-4 bg-black/30">
        <div className="inline-block animate-marquee text-white text-sm font-medium">
          {Array(8).fill('work with me ✿   ').join('')}
        </div>
      </div>
    </section>
  );
};

export default FAQ;