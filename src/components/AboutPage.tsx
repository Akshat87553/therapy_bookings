// src/components/Hero.tsx
import React from 'react';
// Adjust these import paths to where you placed your images:
import bgImage from './templetes/leftimage.jpg';
import profilePic from './templetes/pexels-spring-toan-4075508.jpg';

const Hero: React.FC = () => {
  const name = "della flora";
  const title = "business strategist";
  const tagline = (
    <>
      business <span className="italic">strategy</span> that <span className="italic">doesn't feel gross</span>.
    </>
  );
  const description =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const handleBookClick = () => {
    // Replace with your booking logic/navigation
    console.log("Book a call clicked");
  };

  return (
    <section className="w-full">
      {/* ===== 1. Background image section ===== */}
      <div
        className="relative w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
          

        {/* Height: adjust so enough background shows above the curve */}
        <div className="h-80 sm:h-96 md:h-[28rem]" />
     
        {/* Optional semi-transparent overlay for contrast */}
        <div className="absolute inset-0 bg-black/20" />
       

        {/* Text overlay on background (centered) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            

        {/* ===== 2. SVG arc at bottom for smooth curve ===== */}
<div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
  <svg
    className="relative block w-full h-10 sm:h-34 md:h-32"
    viewBox="0 0 100 20"
    preserveAspectRatio="none"
  >
    <path d="M0,20 C16.6,0 33.3,0 50,20 C66.6,0 83.3,0 100,20 Z" fill="#ffffff" />
  </svg>
</div>

        {/* ===== 3. Profile picture centered, overlapping background & white ===== */}
        {/*
          - We position this absolutely relative to the background div.
          - bottom: negative half the profile height minus a bit so it straddles the SVG & white below.
          - Size is larger; adjust as desired.
        */}
        <div
          className="
            absolute left-1/2 transform -translate-x-1/2 
            /* For a 20rem-tall circle, half is 10rem. 
               bottom-[-10rem] positions it so half overlaps into white container. */
            bottom-[-10rem] 
            w-80 h-80 sm:w-88 sm:h-88 md:w-[24rem] md:h-[24rem] 
            rounded-full overflow-hidden 
             shadow-xl
            bg-gray-100
          "
        >
          <img
            src={profilePic}
            alt={`${name} profile`}
            className="object-cover w-full h-full"
          />
       
        </div>
           <h1 className="absolute bottom-[44%] left-[39%] mt-4 text-3xl sm:text-4xl md:text-8xl font-light font-serif text-white text-center">
            {name}
          </h1>
          
          <p className="absolute bottom-[30%] mt-1 text-lg sm:text-xl md:text-6xl font-light italic font-serif text-white text-center">
            {title}
          </p>
        </div>
      </div>

      {/* ===== 4. White container below the SVG arc ===== */}
      <div className=" bg-white pt-44 sm:pt-48 md:pt-56 px-4 sm:px-6 md:px-8 flex flex-col items-center">
        {/* 
          The top of this white container sits just below the SVG arc.
          pt-44 (~11rem) gives space so the overlapping circle’s bottom clears comfortably.
        */}

        {/* “Book a Call” button, positioned below the circle */}
        <button
          onClick={handleBookClick}
          className=" mt-4 px-8 py-3 border-2 border-gray-800 text-gray-800 rounded-full hover:bg-gray-100 transition"
        >
          Book a Call
        </button>

        {/* Tagline */}
        <div className=" mt-12 max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900">
            {tagline}
          </h2>
        </div>

        {/* Description */}
        <div className=" mt-4 max-w-xl text-center">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;