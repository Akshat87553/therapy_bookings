// Hero.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import bgImage from './templetes/Untitled design.png';

const Hero: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);

  // Parallax scroll
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animations
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.8, ease: 'easeOut' },
    }),
  };
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay, duration: 0.7, ease: 'backOut' },
    }),
  };

  return (
    <section
      id="hero"
      className="relative min-h-[125vh] w-full max-w-screen overflow-x-hidden bg-cover bg-center flex items-start justify-center pt-52"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: `center ${-offsetY * 0.3}px`,
        clipPath: 'ellipse(100% 92% at 50% 0%)',
      }}
    >
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 text-white space-y-2 mt-34">
        <motion.p
          className="uppercase text-base tracking-widest"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.8}
        >
          Work with me
        </motion.p>

        {/* Mobile font reduced; desktop unchanged */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-light italic font-serif"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          custom={1.0}
        >
          individual
        </motion.h1>

        <motion.div
          className="relative w-96 h-[27rem] md:w-[24rem] md:h-[32rem] rounded-full overflow-hidden shadow-xl"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          custom={1.4}
        >
          <img
            src="https://images.squarespace-cdn.com/content/v1/6410c406068e884b306dfd98/d7d1c09b-f59a-4f34-88e1-a654d77a681c/pexels-spring-toan-4075508.jpg?format=1500w"
            alt="Therapist smiling"
            className="w-full h-full object-cover"
            loading="eager" // Explicitly tell the browser to load this image eagerly
          />
        </motion.div>

        {/* Mobile: in flow; Desktop: original absolute positions restored */}
        <motion.h2
          className="
            mt-4 text-4xl sm:text-5xl font-serif leading-tight
            md:absolute md:top-[18%] md:left-[-10%] md:transform md:-translate-x-1/2 md:text-8xl md:leading-none
          "
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.2}
        >
          consultation
        </motion.h2>

        <motion.h3
          className="
            mt-3 text-3xl sm:text-4xl italic font-serif
            md:absolute md:bottom-[3%] md:left-[7%] md:transform md:-translate-x-1/2 md:text-7xl
          "
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.6}
        >
          for therapists
        </motion.h3>

        {/* CTA: in flow on mobile; absolute on desktop with original coordinates */}
        <motion.div
          className="
            mt-6 md:mt-0
            md:absolute md:bottom-[-14%] md:left-[29%] md:transform md:-translate-x-1/2
            text-center
          "
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.8}
        >
          <Link
            to="/register"
            className="border border-white px-10 py-5 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition"
          >
            Book a session
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
