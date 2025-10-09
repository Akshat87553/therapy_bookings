import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import bgImage from './templetes/Untitled design.png';

const Hero: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);
  const { isAuthenticated, logout } = useAuth();

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

        {/* Mobile: larger overlapping title; desktop unchanged */}
        <motion.h1
          className="text-[5.5rem] sm:text-[6.5rem] md:text-8xl font-light italic font-serif leading-none -mt-2"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          custom={1.0}
        >
          individual
        </motion.h1>

        {/* Smaller circular image on mobile; original size on desktop */}
        <motion.div
          className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-[24rem] md:h-[32rem] rounded-full overflow-hidden shadow-xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          custom={1.4}
        >
          <img
            src="https://images.squarespace-cdn.com/content/v1/6410c406068e884b306dfd98/d7d1c09b-f59a-4f34-88e1-a654d77a681c/pexels-spring-toan-4075508.jpg?format=1500w"
            alt="Therapist smiling"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Overlapping text (consultation) */}
        <motion.h2
          className="
            -mt-6 text-[4.2rem] sm:text-[5.2rem] font-serif leading-[0.95]
            md:absolute md:top-[18%] md:left-[-10%] md:transform md:-translate-x-1/2 md:text-8xl md:leading-none
          "
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.2}
        >
          consultation
        </motion.h2>

        {/* Supporting text */}
        <motion.h3
          className="
            -mt-1 text-[3.2rem] sm:text-[4rem] italic font-serif leading-tight
            md:absolute md:bottom-[3%] md:left-[7%] md:transform md:-translate-x-1/2 md:text-7xl
          "
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.6}
        >
          for therapists
        </motion.h3>

        {/* CTA button */}
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
  to={isAuthenticated ? '/book' : '/register'}
  className="border border-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-white hover:text-blue-900 transition"
>
  Book a session
</Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
