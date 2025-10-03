import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import leftImg from './templetes/leftimage.jpg';
import rightImg from './templetes/rightimage.jpeg';

/**
 * DesktopView: verbatim desktop layout (unchanged)
 * MobileView: compact curved shapes that do NOT scale images up or overlap text
 */

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6 }
  }),
};

const DesktopView: React.FC<{ offsetY: number }> = ({ offsetY }) => {
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
      <div className="relative z-10 w-full max-w-3xl px-6 transform -translate-x-32 -translate-y-24 text-center lg:text-left">
        <motion.span
          className="text-sm uppercase font-bold text-gray-500 font-bold"
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
          className="mt-20 text-base text-gray-700 lg:text-left max-w-md font-bold"
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
          backgroundPosition: `center ${-offsetY * 0.1 + 150}px`,
        }}
      />
    </section>
  );
};

const MobileView: React.FC = () => {
  return (
    <section className="relative w-full bg-white overflow-hidden py-10 px-6 flex flex-col items-center">
      {/* Top Left Image (Left on mobile, part of the layout flow) */}
      <div
        className="absolute top-0 left-0 w-[150px] h-[180px] overflow-hidden rounded-br-[100px] z-0"
        style={{
          backgroundImage: `url(${leftImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />

      {/* Main Content Container - adjusted for left alignment and width */}
      <div className="relative z-10 w-full max-w-sm ml-auto mr-0 pr-0 pt-[100px] text-left"> {/* Added pt-[100px] to push content down */}
        <motion.span
          className="text-sm uppercase font-bold text-gray-500 block" // block to ensure it takes full width
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{ marginLeft: '120px' }} // Pushing "Work with me" to the right
        >
          Work with me
        </motion.span>

        <motion.h1
          className="mt-2 text-4xl font-light italic font-serif leading-tight text-gray-900"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={1}
          style={{ marginLeft: '120px' }} // Pushing heading to the right
        >
          I can help you build a{' '}
          <em className="italic">sustainable</em> private practice
        </motion.h1>

        <motion.p
          className="mt-8 text-base text-gray-700 max-w-[calc(100%-20px)] mx-auto pr-4" // Adjusted max-width and right padding
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={2}
          style={{ marginLeft: '20px' }} // Pushing paragraph to the right, aligning with "Get Started"
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
          mollit anim id est laborum.
        </motion.p>

        <div className="mt-12 text-left" style={{ marginLeft: '20px' }}> {/* Align button left and apply left margin */}
          <button className="px-10 py-5 border-2 border-gray-900 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Bottom Right Image (Right on mobile) */}
      <div
        className="absolute bottom-0 right-0 w-[120px] h-[160px] overflow-hidden rounded-tl-[80px] z-0"
        style={{
          backgroundImage: `url(${rightImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      />
    </section>
  );
};

const classes: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // parallax scroll listener
  useEffect(() => {
    const onScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // resize listener to pick Desktop vs Mobile rendering
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    // initial
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isDesktop ? <DesktopView offsetY={offsetY} /> : <MobileView />;
};

export default classes;