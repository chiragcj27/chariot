'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 px-4 py-3 shadow-md flex items-center justify-between transition-colors duration-300 ${
          isOpen ? 'bg-black' : 'bg-white'
        }`}
      >
        {/* Logo + Brand Text */}
        <div className="flex items-center relative overflow-hidden h-10">
          {/* Dot Logo */}
          <Image src="/chariot.svg" alt="The Chariot Logo" width={70} height={70}/>

          {/* Slide-in Brand Text
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="ml-3 text-xl font-semibold whitespace-nowrap text-white"
              >
                The Chariot
              </motion.span>
            )}
          </AnimatePresence> */}
        </div>

        
        
        {/* Hamburger / Cross Button */}
        <button
          className="relative w-8 h-8 z-[100] flex flex-col justify-center items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`absolute w-6 h-0.5 transition-all duration-300 ${
              isOpen ? 'rotate-45 bg-white' : '-translate-y-1.5 bg-black'
            }`}
          />
          <span
            className={`absolute w-6 h-0.5 transition-all duration-300 ${
              isOpen ? '-rotate-45 bg-white' : 'translate-y-1.5 bg-black'
            }`}
          />
        </button>
      </nav>

      {/* Curtain Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              borderBottomLeftRadius: '50% 10%',
              borderBottomRightRadius: '50% 10%',
            }}
            animate={{
              height: '100vh',
              borderBottomLeftRadius: '0%',
              borderBottomRightRadius: '0%',
            }}
            exit={{
              height: 0,
              borderBottomLeftRadius: '50% 10%',
              borderBottomRightRadius: '50% 10%',
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed top-0 left-0 w-full bg-black text-white flex flex-col items-center justify-center space-y-6 text-2xl font-semibold overflow-hidden"
          >
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Projects</a>
            <a href="#">Contact</a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
