import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { HikyLogo } from '@/components/hiky-logo';
import { useTheme } from '@/components/theme-provider';
import { Home, MessageCircle, ArrowLeft, Search, Quote, RefreshCw } from 'lucide-react';
import randomQuotes from 'random-quotes';

const NotFoundPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [quote, setQuote] = useState({ body: '', author: '' });
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Function to fetch a random quote
  const fetchRandomQuote = async () => {
    setIsLoadingQuote(true);
    try {
      const randomQuote = randomQuotes();
      console.log("Random quote:", randomQuote);
      setQuote(randomQuote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote({ 
        body: 'Every great journey begins with a single step.', 
        author: 'Anonymous' 
      });
    } finally {
      setIsLoadingQuote(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    fetchRandomQuote(); // Fetch initial quote
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatVariants = {
    float: {
      y: [0, -8, 0],
      transition: { 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  };

  const glitchVariants = {
    glitch: {
      x: [0, 2, -2, 1, -1, 0],
      opacity: [1, 0.8, 0.9, 0.7, 0.95, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 3
      }
    }
  };

  const GlitchText = ({ text, className = "" }) => {
    const chars = text.split('');

    return (
      <motion.div
        className={`inline-block ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {chars.map((char, index) => (
          <motion.span
            key={index}
            variants={itemVariants}
            className="inline-block"
            animate={index % 2 === 0 ? glitchVariants.glitch : {}}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    );
  };
  
  const ActionButtons = () => (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Button 
          onClick={() => navigate("/")} 
          className="group w-full sm:w-auto h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
          Go Home
        </Button>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="group w-full sm:w-auto h-12 px-6 border-2 border-green-600/20 hover:border-green-600/40 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Go Back
        </Button>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Button 
          variant="outline"
          className="group w-full sm:w-auto h-12 px-6 border-2 border-muted-foreground/20 hover:border-green-600/40 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-medium transition-all duration-300 transform hover:-translate-y-1"
        >
          <MessageCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
          Contact Support
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Green gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-background to-emerald-50/30 dark:from-green-950/20 dark:via-background dark:to-emerald-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08),transparent_40%)]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col lg:flex-row items-center justify-center max-w-6xl mx-auto gap-12 lg:gap-16">
          
          {/* Left side - Text content */}
          <div className="flex-1 text-center lg:text-left max-w-lg">
            
            {/* Logo Section */}
            <motion.div
              className="flex justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              variants={floatVariants}
              whileInView="float"
            >
              <div className="relative">
                {/* Custom green Hiky logo */}
                <svg 
                  width={120} 
                  height={120} 
                  viewBox="0 0 100 100" 
                  xmlns="http://www.w3.org/2000/svg" 
                  role="img" 
                  aria-labelledby="logoTitle"
                  className="drop-shadow-lg"
                >
                  <title id="logoTitle">Hiky Chat App Logo</title>

                  <defs>
                    {/* Green gradient for background */}
                    <radialGradient id="greenLogoGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#15803D" />
                    </radialGradient>

                    {/* Drop shadow filter */}
                    <filter id="greenShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.2"/>
                    </filter>
                  </defs>

                  {/* Rounded square background with green gradient and shadow */}
                  <rect 
                    x="10" 
                    y="10" 
                    width="80" 
                    height="80" 
                    rx="20" 
                    ry="20"
                    fill="url(#greenLogoGradient)" 
                    filter="url(#greenShadow)" 
                  />

                  {/* Chat tail */}
                  <path d="M35,85 L48,95 L53,85 Z" fill="url(#greenLogoGradient)" />

                  {/* Chat bubble icon and text */}
                  <g transform="translate(0, 5)">
                    {/* Chat icon above text */}
                    <path
                      d="M38 33 H62 A4 4 0 0 1 66 37 V47 A4 4 0 0 1 62 51 H38 A4 4 0 0 1 34 47 V37 A4 4 0 0 1 38 33 Z 
                         M42 40 H58 M42 44 H58"
                      stroke="white" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round"
                    />

                    {/* App name */}
                    <text
                      x="50" 
                      y="65"
                      fontFamily="Segoe UI, Arial, sans-serif"
                      fontSize="16"
                      fontWeight="600"
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      Hiky
                    </text>
                  </g>
                </svg>
                <motion.div
                  className="absolute -inset-4 bg-green-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {/* 404 Error */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <GlitchText 
                text="404" 
                className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 bg-clip-text text-transparent drop-shadow-lg" 
              />
            </motion.div>

            {/* Main Heading */}
            <motion.div
              className="mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              >
                Oops! Page Not Found
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                The page you're looking for seems to have wandered off into the digital void.
              </motion.p>
            </motion.div>

            {/* Inspirational Quote Section */}
            <motion.div
              className="mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={itemVariants}
                className="relative p-6 bg-gradient-to-r from-green-50/50 via-emerald-50/30 to-green-50/50 dark:from-green-950/20 dark:via-emerald-900/10 dark:to-green-950/20 rounded-xl border border-green-200/30 dark:border-green-800/30 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  >
                    <Quote className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.p 
                      className="text-base md:text-lg text-foreground/90 italic leading-relaxed font-medium"
                      key={quote.body} // This will trigger re-animation when quote changes
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      "{quote.body || 'Loading inspiration...'}"
                    </motion.p>
                    {quote.author && (
                      <motion.p 
                        className="text-sm text-green-600 dark:text-green-400 font-medium mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        — {quote.author}
                      </motion.p>
                    )}
                    <motion.div 
                      className="flex items-center justify-between mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✨ Daily Inspiration
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchRandomQuote}
                        disabled={isLoadingQuote}
                        className="h-8 px-3 text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-all duration-200"
                      >
                        <motion.div
                          animate={isLoadingQuote ? { rotate: 360 } : {}}
                          transition={{ 
                            duration: 1, 
                            repeat: isLoadingQuote ? Infinity : 0,
                            ease: "linear" 
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        <span className="ml-2 text-xs">New Quote</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-xl" />
                <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-green-300/10 to-emerald-300/10 rounded-full blur-lg" />
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <ActionButtons />

            {/* Help Text */}
            <motion.div
              className="mt-8 text-center lg:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 0.7 : 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <p className="text-sm text-muted-foreground">
                Need help? Check our{" "}
                <a href="#" className="text-green-500 hover:text-green-600 transition-colors duration-200 underline">
                  documentation
                </a>{" "}
                or{" "}
                <a href="#" className="text-green-500 hover:text-green-600 transition-colors duration-200 underline">
                  contact support
                </a>
              </p>
            </motion.div>
          </div>

          {/* Right side - Robot illustration */}
          <motion.div
            className="flex-1 flex justify-center items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            <div className="relative">
              <motion.svg
                width="400"
                height="400"
                viewBox="0 0 320 320"
                className="text-muted-foreground/70 drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                variants={floatVariants}
                animate="float"
              >
                {/* Robot gradient definitions */}
                <defs>
                  <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.1"/>
                  </linearGradient>
                  <linearGradient id="robotStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6"/>
                  </linearGradient>
                </defs>

                {/* Glitch elements with green theme */}
                <motion.g 
                  animate={{
                    x: [0, 2, -2, 1, -1, 0],
                    opacity: [1, 0.8, 0.9, 0.7, 0.95, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 3
                  }}
                >
                  <text x="60" y="110" fontSize="28" fontWeight="bold" fill="rgb(34, 197, 94)" className="opacity-70 font-mono">
                    4
                  </text>
                  <text x="110" y="100" fontSize="24" fontWeight="bold" fill="rgb(16, 185, 129)" className="opacity-50 font-mono">
                    ?
                  </text>
                  <text x="210" y="250" fontSize="28" fontWeight="bold" fill="rgb(34, 197, 94)" className="opacity-70 font-mono">
                    0
                  </text>
                  <text x="260" y="240" fontSize="24" fontWeight="bold" fill="rgb(16, 185, 129)" className="opacity-50 font-mono">
                    !
                  </text>
                </motion.g>

                {/* Robot head */}
                <motion.rect
                  x="110"
                  y="80"
                  width="100"
                  height="80"
                  rx="20"
                  stroke="url(#robotStroke)"
                  strokeWidth="3"
                  fill="url(#robotGradient)"
                />

                {/* Antenna with green glow */}
                <motion.g
                  animate={{
                    rotate: [0, -8, 8, -8, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  style={{ transformOrigin: '160px 80px' }}
                >
                  <line x1="160" y1="80" x2="160" y2="60" stroke="rgb(34, 197, 94)" strokeWidth="3" />
                  <motion.circle
                    cx="160"
                    cy="55"
                    r="5"
                    fill="rgb(34, 197, 94)"
                    animate={{ 
                      scale: [1, 1.4, 1], 
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.g>

                {/* Eyes with blink animation */}
                <motion.g
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{
                    opacity: [1, 1, 0.2, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    times: [0, 0.95, 0.98, 1] 
                  }}
                >
                  <line x1="135" y1="105" x2="145" y2="115" />
                  <line x1="145" y1="105" x2="135" y2="115" />
                  <line x1="175" y1="105" x2="185" y2="115" />
                  <line x1="185" y1="105" x2="175" y2="115" />
                </motion.g>

                {/* Animated mouth */}
                <motion.path
                  d="M145 135 Q160 148 175 135"
                  stroke="rgb(34, 197, 94)"
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

                {/* Robot body */}
                <motion.rect
                  x="125"
                  y="160"
                  width="70"
                  height="100"
                  rx="15"
                  stroke="url(#robotStroke)"
                  strokeWidth="3"
                  fill="url(#robotGradient)"
                />
                
                {/* Chest panel with green glow */}
                <motion.rect
                  x="140"
                  y="180"
                  width="40"
                  height="20"
                  rx="5"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                  fill="rgb(34, 197, 94)"
                  fillOpacity="0.2"
                  animate={{ 
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Arms with subtle animation */}
                <motion.g 
                  stroke="rgb(34, 197, 94)" 
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

                {/* Legs */}
                <motion.g 
                  stroke="rgb(34, 197, 94)" 
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

      {/* Footer */}
      <footer className="relative z-10 text-center p-6 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          © 2024 Hiky Chat. Made with ❤️ for seamless conversations.
        </motion.p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
