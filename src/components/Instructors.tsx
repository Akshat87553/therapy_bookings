import React from 'react';
import { motion } from 'framer-motion';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

const Instructors: React.FC = () => {
   return (
  <motion.div
    className="max-w-2xl mx-auto py-20 px-6 flex flex-col items-center"
    initial="hidden"
    animate="visible"
    variants={containerVariants}
  >
    {/* Section Header */}
    <motion.h3
      className=" relative mb-52 text-sm uppercase text-gray-500 mb-12"
      variants={itemVariants}
    >
      How it works
    </motion.h3>

    {/* Step 1 */}
    <motion.section
      className="relative mb-52 w-full text-left px-4"
      variants={itemVariants}
    >
      <span className="absolute top-[-99%] left-[-20%] text-[300px] leading-none font-serif text-gray-200 select-none">
        01
      </span>
      <h2 className="relative z-10 right-[16%] text-6xl font-serif">
        We&apos;ll start <span className="italic">where you are</span>
      </h2>
      <p className="relative z-10 right-[16%] mt-4 text-base leading-relaxed text-gray-700">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </motion.section>

    {/* Step 2 */}
    <motion.section
      className="relative mb-52 w-full text-right px-4"
      variants={itemVariants}
    >
      <span className="absolute top-[-99%] right-[-20%] text-[300px] leading-none font-serif text-gray-200 select-none">
        02
      </span>
      <h2 className="relative z-10 left-[16%] text-6xl font-serif">
        We&apos;ll make a <span className="italic">plan of action</span>
      </h2>
      <p className="relative z-10 left-[16%] mt-4 text-base leading-relaxed text-gray-700">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </motion.section>

    {/* Step 3 */}
    <motion.section
      className="relative mb-52 w-full text-left px-4"
      variants={itemVariants}
    >
      <span className="absolute top-[-99%] left-[-20%] text-[300px] leading-none font-serif text-gray-200 select-none">
        03
      </span>
      <h2 className="relative z-10 right-[16%] text-6xl font-serif">
        We&apos;ll take it <span className="italic">one step at a time</span>
      </h2>
      <p className="relative z-10 right-[16%] mt-4 text-base leading-relaxed text-gray-700">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </motion.section>

    {/* Call to Action */}
    <motion.button
      className="mt-8 border border-gray-800 rounded-full px-10 py-5 text-sm uppercase"
      variants={itemVariants}
    >
      Book a call to get started
    </motion.button>
  </motion.div>
);
};

export default Instructors;
