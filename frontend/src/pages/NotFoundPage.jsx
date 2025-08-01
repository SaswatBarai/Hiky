import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import {useNavigate} from "react-router-dom"
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    }
  };

  const robotVariants = {
    float: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    wobble: {
      rotate: [0, 2, -2, 2, -2, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const glitchVariants = {
    glitch: {
      x: [0, 2, -2, 1, -1, 0],
      opacity: [1, 0.5, 0.8, 0.3, 0.7, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 2
      }
    }
  };

  const GlitchText = ({ text }) => {
    const chars = text.split('');
    const controls = useAnimation();

    useEffect(() => {
      controls.start('glitch');
    }, [controls]);

    return (
      <motion.div
        className="inline-block relative text-foreground/70 font-mono"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {chars.map((char, index) => (
          <motion.span
            key={index}
            variants={itemVariants}
            className="inline-block"
            style={{ filter: char === ' ' ? 'none' : 'url(#glitch)' }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    );
  };
  
  const ButtonGroup = () => (
    <div className="flex gap-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button onClick={() => navigate("/") }>
          Go Back
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button variant="outline">
          Contact Support
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[url('https://placehold.co/10x10/0a0a0a/1a1a1a')] opacity-10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-transparent to-background opacity-80" />

      <svg className="filter-svg">
        <filter id="glitch">
          <feTurbulence baseFrequency="0.05 0.05" numOctaves="2" result="turbulence" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      
      <main className="flex-1 flex items-center justify-center p-8 relative z-20">
        <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl w-full gap-16 md:gap-24">
          <motion.div
            className="flex-1 max-w-lg text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <GlitchText text="404" />
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {"Page not found".split(" ").map((word, index) => (
                <span key={index} className="inline-block mr-2">
                  <motion.span variants={itemVariants}>{word}</motion.span>
                </span>
              ))}
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <ButtonGroup />
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative">
              <motion.svg
                width="320"
                height="320"
                viewBox="0 0 320 320"
                className="text-muted-foreground"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                variants={robotVariants}
                animate={["float", "wobble"]}
              >
                <motion.g variants={glitchVariants} animate="glitch">
                  <text x="60" y="110" fontSize="30" fontWeight="bold" fill="currentColor" className="opacity-70">
                    4
                  </text>
                  <text x="110" y="100" fontSize="25" fontWeight="bold" fill="currentColor" className="opacity-50">
                    ?
                  </text>
                  <text x="210" y="250" fontSize="30" fontWeight="bold" fill="currentColor" className="opacity-70">
                    0
                  </text>
                  <text x="260" y="240" fontSize="25" fontWeight="bold" fill="currentColor" className="opacity-50">
                    !
                  </text>
                </motion.g>

                <motion.rect
                  x="110"
                  y="80"
                  width="100"
                  height="80"
                  rx="20"
                  stroke="currentColor"
                  strokeWidth="3"
                />

                <motion.g
                  variants={{
                    wiggle: { rotate: [0, -5, 5, -5, 0], transition: { duration: 4, repeat: Infinity } }
                  }}
                  animate="wiggle"
                  style={{ transformOrigin: 'center bottom' }}
                >
                  <line x1="160" y1="80" x2="160" y2="60" stroke="currentColor" strokeWidth="2" />
                  <motion.circle
                    cx="160"
                    cy="55"
                    r="4"
                    fill="currentColor"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.g>

                <motion.g
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  variants={{
                    blink: { opacity: [1, 1, 0, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.95, 0.98, 1] } }
                  }}
                  animate="blink"
                >
                  <line x1="135" y1="105" x2="145" y2="115" />
                  <line x1="145" y1="105" x2="135" y2="115" />
                  <line x1="175" y1="105" x2="185" y2="115" />
                  <line x1="185" y1="105" x2="175" y2="115" />
                </motion.g>

                <path
                  d="M145 135 Q160 145 175 135"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />

                <motion.rect
                  x="125"
                  y="160"
                  width="70"
                  height="100"
                  rx="15"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <motion.rect
                  x="140"
                  y="180"
                  width="40"
                  height="20"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />

                <motion.g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="125" y1="190" x2="90" y2="190" />
                  <line x1="200" y1="190" x2="235" y2="190" />
                  <line x1="90" y1="190" x2="90" y2="210" />
                  <line x1="235" y1="190" x2="235" y2="210" />
                </motion.g>

                <motion.g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="140" y1="260" x2="140" y2="285" />
                  <line x1="180" y1="260" x2="180" y2="285" />
                </motion.g>
              </motion.svg>
            </div>
          </motion.div>
        </div>
      </main>
      <footer className="relative z-20 text-center text-muted-foreground text-sm p-4">
        © 2024 Your Company. All Rights Reserved.
      </footer>
    </div>
  );
};

export default NotFoundPage;
