import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * NOTE:
 * - DesktopView is the exact, verbatim desktop JSX you provided. I did NOT modify it.
 * - MobileView contains the responsive tweaks you requested (bigger numbers, moved up, larger gaps).
 * - The component renders DesktopView when window.innerWidth >= 1024 and MobileView otherwise.
 */

/* ---------- original motion variants (kept as you had) ---------- */
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

/* ---------- DesktopView (VERBATIM from your original post) ---------- */
const DesktopView: React.FC = () => {
  return (
    <motion.div
      className="max-w-2xl mx-auto py-20 px-6 flex flex-col items-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Section Header */}
      <motion.h3
        className=" relative mb-52 text-lg uppercase text-gray-500 mb-12 font-bold text-center"
        variants={itemVariants}
      >
        How it works
      </motion.h3>

      {/* Step 1 */}
      <motion.section
        className="relative mb-52 w-full text-left px-4"
        variants={itemVariants}
      >
        <span className="absolute top-[-110%] left-[-20%] text-[300px] leading-none font-serif font-size-130px text-gray-200 select-none">
          01
        </span>
        <h2 className="relative z-10 right-[16%] text-6xl font-serif">
          We&apos;ll start <span className="italic">where you are</span>
        </h2>
        <p className="relative z-10 right-[16%] mt-4 text-base leading-relaxed text-gray-700 font-bold">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
      </motion.section>

      {/* Step 2 */}
      <motion.section
        className="relative mb-52 w-full text-right px-4"
        variants={itemVariants}
      >
        <span className="absolute top-[-110%] right-[-20%] text-[300px] leading-none font-serif text-gray-200 select-none">
          02
        </span>
        <h2 className="relative z-10 left-[16%] text-6xl font-serif">
          We&apos;ll make a <span className="italic">plan of action</span>
        </h2>
        <p className="relative z-10 left-[16%] mt-4 text-base leading-relaxed text-gray-700 font-bold">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
      </motion.section>

      {/* Step 3 */}
      <motion.section
        className="relative mb-52 w-full text-left px-4"
        variants={itemVariants}
      >
        <span className="absolute top-[-110%] left-[-20%] text-[300px] leading-none font-serif text-gray-200 select-none">
          03
        </span>
        <h2 className="relative z-10 right-[16%] text-6xl font-serif">
          We&apos;ll take it <span className="italic">one step at a time</span>
        </h2>
        <p className="relative z-10 right-[16%] mt-4 text-base leading-relaxed text-gray-700 font-bold">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
      </motion.section>

      {/* Call to Action */}
      <motion.button
        className="mt-8 border border-gray-800 rounded-full px-10 py-5 text-sm uppercase font-bold hover:bg-gray-800 hover:text-white transition"
        variants={itemVariants}
      >
        Book a call to get started
      </motion.button>
    </motion.div>
  );
};

/* ---------- MobileView (responsive improvements only) ---------- */
const MobileView: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: (
        <>
          We&apos;ll start <span className="italic">where you are</span>
        </>
      ),
      text:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
    {
      num: '02',
      title: (
        <>
          We&apos;ll make a <span className="italic">plan of action</span>
        </>
      ),
      text:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
    {
      num: '03',
      title: (
        <>
          We&apos;ll take it <span className="italic">one step at a time</span>
        </>
      ),
      text:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
  ];

  return (
    <motion.div
      className="max-w-xl mx-auto py-16 px-6 flex flex-col items-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h3
        className="mb-32 text-sm uppercase text-gray font-bold text-center"
        variants={itemVariants}
      >
        How it works
      </motion.h3>

      {steps.map((s) => (
        <motion.section
          key={s.num}
          // ADJUSTMENT #1: Increased bottom margin from mb-16 to mb-24
          className="relative w-full mb-24 px-2" 
          variants={itemVariants}
        >
          {/* bigger number, moved upward so it barely touches the heading */}
          <span
            aria-hidden
            className="pointer-events-none select-none font-serif text-gray-200 absolute -top-24 left-2 z-0 leading-none"
            style={{
              // ADJUSTMENT #2: Increased font size from 88px to 120px
              fontSize: '150px', 
              lineHeight: 0.78,
            }}
          >
            {s.num}
          </span>

          <div className="relative z-10 w-full pt-2">
            <h2 className="text-2xl sm:text-3xl font-serif">
              {s.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-700 font-bold">
              {s.text}
            </p>
          </div>
        </motion.section>
      ))}

      <motion.div className="flex justify-center mt-6" variants={itemVariants}>
        <button className="border border-gray-800 rounded-full px-8 sm:px-10 py-3 sm:py-4 text-sm uppercase font-bold hover:bg-gray-800 hover:text-white transition">
          Book a call to get started
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ---------- Main component chooses which view to render ---------- */
const InstructorsResponsive: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isDesktop ? <DesktopView /> : <MobileView />;
};

export default InstructorsResponsive;
