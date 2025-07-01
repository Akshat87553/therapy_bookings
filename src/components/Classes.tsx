import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import leftImg from './templetes/leftimage.jpg';
import rightImg from './templetes/rightimage.jpg';

const LandingPage: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);

  // Scroll listener for parallax
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax multiplier (adjust as needed)
  const parallaxFactor = 0.3;
   // Text animation variants
  const textVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 }
    }),
  };

  return (
    <section className="relative flex items-center justify-center h-screen w-full bg-white overflow-hidden">
      {/* Left panel with curved inner edge, using background-image for true parallax */}
      <div
        className="absolute top-0 left-[-13%] w-1/3 h-[90%] overflow-hidden rounded-tr-[350px] rounded-br-[350px]"
        style={{
          backgroundImage: `url(${leftImg})`,
          
        // shift BG up at 30% of scroll speed
        backgroundPosition: `center ${-offsetY * 0.1}px`,
        }}
      />

      
      {/* Center content with text animations */}
      <div className="relative z-10 w-full max-w-xl px-6 transform -translate-x-32 -translate-y-24 text-center lg:text-left">
        <motion.span
          className="text-sm uppercase font-medium text-gray-500"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          Work with me
        </motion.span>

        <motion.h1
          className="mt-2 text-7xl lg:text-6xl left-[-40%] font-light italic font-serif leading-tight text-gray-900"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          I can help you build a{' '}
          <em className="font-light italic font-serif">sustainable</em> private practice
        </motion.h1>

        <motion.p
          className="mt-20 text-base text-gray-700 lg:text-left"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </motion.p>

        <div className="mt-24">
          <button className="px-10 py-5 border-2 border-gray-900 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Right panel with curved inner edge, using background-image for true parallax */}
      <div
        className="absolute top-0 right-0 w-1/2 h-[90%] overflow-hidden rounded-tl-[350px] rounded-bl-[350px]"
        style={{
          backgroundImage: `url(${rightImg})`,
           backgroundSize: 'cover',
           backgroundRepeat: 'no-repeat',
          
        // shift BG up at 30% of scroll speed
        backgroundPosition: `center ${-offsetY * 0.1}px`,
        }}
      />
    </section>
  );
};

export default LandingPage;
