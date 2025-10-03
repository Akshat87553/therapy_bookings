import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start gap-16">
          {/* LEFT: Heading + Flower */}
          <div className="relative lg:w-1/3">
            {/* Flower SVG */}
            <svg
              fill="#CBD5E1"
              style={{ opacity: 0.3 }}
              className="absolute -left-20 top-1/2 w-96 h-96 transform -translate-y-1/2 z-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
            >
              <circle cx="32" cy="32" r="6" />
              <path d="M32 12c-4 0-8 4-8 8s4 8 8 8 8-4 8-8-4-8-8-8z" />
              <path d="M12 32c0-4 4-8 8-8s8 4 8 8-4 8-8 8-8-4-8-8z" />
              <path d="M32 52c-4 0-8-4-8-8s4-8 8-8 8 4 8 8-4 8-8 8z" />
              <path d="M52 32c0-4-4-8-8-8s-8 4-8 8 4 8 8 8 8-4 8-8z" />
              
            </svg>

            {/* Animated Heading */}
            <motion.h2
              className="relative z-10 pl-24 text-6xl font-light italic font-serif leading-snug text-neutral-800"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              You’re <br />
              <em className="mt-4 italic font-medium text-black">ready</em> to <br />
              level up.
            </motion.h2>
          </div>

          {/* RIGHT: Two columns of body text */}
          <div className=" mt-4 lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12 text-neutral-800 font-bold">
            <p className="text-base leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p className="text-base leading-relaxed">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </section>
  );
};

export default About;
