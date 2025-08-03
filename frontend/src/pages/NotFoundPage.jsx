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
    <div className="flex flex-col sm:flex-row gap-4">
      <motion.div 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        className="w-full sm:w-auto"
      >
        <Button 
          onClick={() => navigate("/")} 
          className="w-full sm:w-auto h-12 px-8 rounded-lg font-medium bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </div>
        </Button>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        className="w-full sm:w-auto"
      >
        <Button 
          variant="outline" 
          className="w-full sm:w-auto h-12 px-8 rounded-lg font-medium border-border/60 hover:bg-muted/80 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contact Support
          </div>
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/30 to-background text-foreground font-sans relative overflow-hidden">
      {/* Enhanced background with better gradient */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.08),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,226,0.08),transparent_50%)] opacity-60"></div>
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-transparent via-background/20 to-background/40"></div>

      {/* Enhanced floating particles effect */}
      <div className="absolute inset-0 z-5">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

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
            {/* Enhanced 404 text with better gradient */}
            <motion.div 
              className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent drop-shadow-lg"
              animate={{ 
                scale: [1, 1.02, 1],
                filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(0deg)"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <GlitchText text="404" />
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {"Page not found".split(" ").map((word, index) => (
                <span key={index} className="inline-block mr-3">
                  <motion.span 
                    variants={itemVariants}
                    className="hover:text-primary transition-colors duration-300"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
            
            <motion.p
              className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-md"
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
              {/* Enhanced robot with better styling */}
              <motion.svg
                width="350"
                height="350"
                viewBox="0 0 320 320"
                className="text-muted-foreground drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                variants={robotVariants}
                animate={["float", "wobble"]}
              >
                {/* Enhanced glitch elements */}
                <motion.g variants={glitchVariants} animate="glitch">
                  <text x="60" y="110" fontSize="32" fontWeight="bold" fill="currentColor" className="opacity-70 font-mono">
                    4
                  </text>
                  <text x="110" y="100" fontSize="28" fontWeight="bold" fill="currentColor" className="opacity-50 font-mono">
                    ?
                  </text>
                  <text x="210" y="250" fontSize="32" fontWeight="bold" fill="currentColor" className="opacity-70 font-mono">
                    0
                  </text>
                  <text x="260" y="240" fontSize="28" fontWeight="bold" fill="currentColor" className="opacity-50 font-mono">
                    !
                  </text>
                </motion.g>

                {/* Robot head with gradient */}
                <defs>
                  <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>

                <motion.rect
                  x="110"
                  y="80"
                  width="100"
                  height="80"
                  rx="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="url(#robotGradient)"
                />

                {/* Enhanced antenna with glow effect */}
                <motion.g
                  variants={{
                    wiggle: { rotate: [0, -8, 8, -8, 0], transition: { duration: 4, repeat: Infinity } }
                  }}
                  animate="wiggle"
                  style={{ transformOrigin: 'center bottom' }}
                >
                  <line x1="160" y1="80" x2="160" y2="60" stroke="currentColor" strokeWidth="3" />
                  <motion.circle
                    cx="160"
                    cy="55"
                    r="5"
                    fill="currentColor"
                    animate={{ 
                      scale: [1, 1.4, 1], 
                      opacity: [0.6, 1, 0.6],
                      filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.g>

                {/* Enhanced eyes with better animation */}
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

                {/* Enhanced mouth */}
                <motion.path
                  d="M145 135 Q160 148 175 135"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  animate={{
                    d: [
                      "M145 135 Q160 148 175 135",
                      "M145 138 Q160 145 175 138",
                      "M145 135 Q160 148 175 135"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Enhanced body with gradient */}
                <motion.rect
                  x="125"
                  y="160"
                  width="70"
                  height="100"
                  rx="15"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="url(#robotGradient)"
                />
                
                {/* Enhanced chest panel */}
                <motion.rect
                  x="140"
                  y="180"
                  width="40"
                  height="20"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="currentColor"
                  fillOpacity="0.1"
                  animate={{ 
                    y: [180, 178, 180],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Enhanced arms with better animation */}
                <motion.g 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  animate={{
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "160px 190px" }}
                >
                  <line x1="125" y1="190" x2="90" y2="190" />
                  <line x1="200" y1="190" x2="235" y2="190" />
                  <line x1="90" y1="190" x2="90" y2="210" />
                  <line x1="235" y1="190" x2="235" y2="210" />
                </motion.g>

                {/* Enhanced legs */}
                <motion.g 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  animate={{
                    y: [0, 2, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <line x1="140" y1="260" x2="140" y2="285" />
                  <line x1="180" y1="260" x2="180" y2="285" />
                </motion.g>
              </motion.svg>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="relative z-20 text-center text-muted-foreground text-sm p-6 border-t border-border/30 bg-background/50 backdrop-blur-sm">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          © 2024 Your Company. All Rights Reserved.
        </motion.p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
