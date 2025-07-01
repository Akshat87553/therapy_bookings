import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import bgImage from './templetes/Untitled design.png'

const Hero: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);

  // 1) Scroll listener for parallax
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // ← empty array so it only mounts/unmounts once

  // 2) Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.8, ease: 'easeOut' }
    })
  };
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (delay: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay, duration: 0.7, ease: 'backOut' }
    })
  };

  return (
    <section
      id="hero"
      className="relative min-h-[125vh] w-full max-w-screen overflow-x-hidden bg-cover bg-center flex items-start justify-center pt-52"
      style={{
        backgroundImage: `url(${bgImage})`,
        // shift BG up at 30% of scroll speed
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

        <motion.h1
          className="text-7xl md:text-8xl font-light italic font-serif"
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
            src="https://images.squarespace-cdn.com/content/v1/6410c406068e884b306dfd98/d7d1c09b-f59a-4f34-88e1-a654d77a681c/pexels-spring-toan-4075508.jpg?format=2500w"
            alt="Therapist smiling"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.h2
          className="absolute top-[18%] left-[-10%] transform -translate-x-1/2 text-center text-9xl md:text-8xl font-serif"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.2}
        >
          consultation
        </motion.h2>

        <motion.h3
          className="absolute bottom-[3%] left-[7%] transform -translate-x-1/2 text-center text-7xl md:text-7xl italic font-serif"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.6}
        >
          for therapists
        </motion.h3>

        <motion.div
          className="absolute bottom-[-14%] left-[29%] transform -translate-x-1/2 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1.8}
        >
          <Link to="/register" className="border border-white px-10 py-5 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition">
                          Book a session
                        </Link>
        </motion.div>

      </div>

    </section>
  );
};

export default Hero;
