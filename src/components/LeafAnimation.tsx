// LeafAnimation.tsx
import React from 'react';
import { motion, Variants } from 'framer-motion';

// SVG path for a simple leaf
const LeafSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6 text-green-600"
  >
    <path d="M12 2C8 6 4 7 2 12c4 0 6-3 10-5 4 2 6 5 10 5-2-5-6-6-10-10z" />
  </svg>
);

// Framer Motion variants for each leaf
const leafVariants: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scale: [0, 1],
    rotate: 360,
    x: [0, Math.cos((i / 8) * 2 * Math.PI) * 40],
    y: [0, Math.sin((i / 8) * 2 * Math.PI) * 40],
    transition: {
      delay: i * 0.1,
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  }),
};

/**
 * LeafAnimation
 * 
 * A compact divider animation component that radiates small leaves from the center line.
 * Usage: Import and render <LeafAnimation /> between two horizontal lines.
 */
const LeafAnimation: React.FC = () => {
  const leaves = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {leaves.map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={leafVariants}
          initial="hidden"
          animate="visible"
          className="absolute"
        >
          <LeafSVG />
        </motion.div>
      ))}
    </div>
  );
};

export default LeafAnimation;

/*
  Example Integration in Classes.tsx:

  import LeafAnimation from './LeafAnimation';
  
  // ... inside your JSX, at the point you want the divider:
  <div className="mt-16 flex items-center justify-center">
    <div className="flex-grow border-t border-gray-300" />
    <LeafAnimation />
    <div className="flex-grow border-t border-gray-300" />
  </div>
*/
