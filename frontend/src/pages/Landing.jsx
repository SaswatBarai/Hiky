import React, { useEffect, useRef } from 'react';
import { HikyLogo } from '@/components/hiky-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Globe,
  Lock,
  Smartphone,
  HeadphonesIcon
} from 'lucide-react';
import {useNavigate} from "react-router-dom"

// Reusable scroll-triggered animation component
function ScrollReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  // Scroll-triggered container variants
  const scrollContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.15
      }
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30 dark:from-background dark:via-background dark:to-muted/20 text-foreground"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.03),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.02),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.02),transparent_30%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.08),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.06),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.05),transparent_30%)] pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between z-10 relative"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HikyLogo 
            onClick={() => navigate("/")}
            width={40} height={40} className="sm:w-12 sm:h-12 rounded-lg cursor-pointer" />
          </motion.div>
          <h1 className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-500">Hiky</h1>
        </motion.div>
        <motion.nav 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden md:flex items-center gap-6 lg:gap-8"
        >
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors" 
            href="#features"
          >
            Features
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors" 
            href="#how-it-works"
          >
            Getting Started
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors" 
            href="#about"
          >
            About
          </motion.a>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            onClick={() => navigate("/login")}
            >Get Started</Button>
          </motion.div>
        </motion.nav>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:hidden flex items-center gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-xs px-3"
            onClick={()=> navigate("/login")}
            >Get Started</Button>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-green-100 dark:bg-green-600/20 border border-green-200 dark:border-green-600/30 mb-6 sm:mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-4 h-4 text-green-600 dark:text-green-500" />
            </motion.div>
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-400">Built with modern web technologies</span>
          </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-4 sm:mb-6"
            >
            <motion.span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-green-700 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Real-time Chat
            </motion.span>
            <br />
            <motion.span 
              className="text-foreground dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Made Simple
            </motion.span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4 sm:px-0"
          >
            Real-time chat application built for seamless communication. Connect with friends through private messages, 
            create group chats, share files, and stay connected with instant presence indicators and typing notifications.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-4 sm:px-0"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
              onClick={() => navigate("/login")}
              size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto shadow-lg">
                Try Hiky Now
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" variant="outline" className="border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                View Features
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground px-4 sm:px-0"
          >
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              </motion.div>
              <span>Free to use</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              </motion.div>
              <span>Open source</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              </motion.div>
              <span>Modern & fast</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <ScrollReveal className="text-center mb-12 sm:mb-16">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-foreground dark:text-white mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Features That Matter
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Built with modern technologies to deliver fast, reliable, and secure messaging experience.
          </motion.p>
        </ScrollReveal>

        <motion.div 
          variants={scrollContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <motion.div 
            variants={itemVariants}
            className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Real-time Messaging</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Instant message delivery with WebSocket technology. See typing indicators and online presence in real-time.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">File Sharing</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Share images, videos, audio files, and documents seamlessly with integrated Cloudinary storage.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Private & Group Chats</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Create private conversations with friends or group chats for team collaboration with up to multiple participants.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Globe className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Redis-Powered Performance</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Built with Redis for lightning-fast message delivery, online presence tracking, and scalable real-time features.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Smartphone className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Modern Web App</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Responsive design built with React and Tailwind CSS. Works seamlessly across desktop and mobile browsers.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300"
            whileHover={{ 
              scale: 1.03,
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <HeadphonesIcon className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 dark:text-green-500" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Read Receipts & Status</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Know when your messages are delivered and read. See who's online, typing, or away with real-time presence indicators.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <ScrollReveal className="text-center mb-12 sm:mb-16">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-foreground dark:text-white mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Get Started in Minutes
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join Hiky and start chatting with friends instantly. No complex setup required.
          </motion.p>
        </ScrollReveal>

        <motion.div 
          variants={scrollContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          <motion.div 
            variants={itemVariants}
            className="text-center"
            whileHover={{ y: -5 }}
          >
            <motion.div 
              className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-green-200 dark:border-green-600/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">1</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Create Account</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
              Sign up with your email and choose a unique username. Verify your email and you're ready to go.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="text-center"
            whileHover={{ y: -5 }}
          >
            <motion.div 
              className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-green-200 dark:border-green-600/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">2</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Find Friends</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
              Search for friends by username or email. Start private conversations or create group chats.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="text-center"
            whileHover={{ y: -5 }}
          >
            <motion.div 
              className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-green-200 dark:border-green-600/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">3</span>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground dark:text-white mb-2 sm:mb-3">Start Chatting</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
              Send messages, share files, and enjoy real-time conversations with read receipts and online presence.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground dark:text-white mb-4">About Hiky</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A modern real-time chat application built with cutting-edge web technologies to bring people closer together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-semibold text-foreground dark:text-white mb-6">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Hiky was created to make real-time communication simple, fast, and accessible. We believe that staying connected
              with friends and loved ones should be effortless, whether you're sharing a quick message or collaborating on a project.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Built as a full-stack application, Hiky showcases modern web development practices using React for the frontend,
              Node.js and Express for the backend, MongoDB for data persistence, and Redis for real-time features and performance.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                Real-time WebSocket
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                Modern React
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                Scalable Architecture
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white/70 dark:bg-card/50 rounded-2xl border border-green-100 dark:border-green-900/20">
              <h4 className="text-lg font-semibold text-foreground dark:text-white mb-3">Technology Stack</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-600 dark:text-green-500">Frontend:</span>
                  <p className="text-muted-foreground">React, Vite, Tailwind CSS</p>
                </div>
                <div>
                  <span className="font-medium text-green-600 dark:text-green-500">Backend:</span>
                  <p className="text-muted-foreground">Node.js, Express</p>
                </div>
                <div>
                  <span className="font-medium text-green-600 dark:text-green-500">Database:</span>
                  <p className="text-muted-foreground">MongoDB, Redis</p>
                </div>
                <div>
                  <span className="font-medium text-green-600 dark:text-green-500">Real-time:</span>
                  <p className="text-muted-foreground">WebSocket, Socket.io</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/70 dark:bg-card/50 rounded-2xl border border-green-100 dark:border-green-900/20">
              <h4 className="text-lg font-semibold text-foreground dark:text-white mb-3">Key Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                  Instant messaging with typing indicators
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                  File sharing with Cloudinary integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                  Private and group chat rooms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                  Real-time online presence tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                  Message read receipts and delivery status
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 p-8 bg-white/70 dark:bg-card/50 rounded-2xl border border-green-100 dark:border-green-900/20">
            <div className="text-left">
              <h4 className="text-lg font-semibold text-foreground dark:text-white mb-2">Open Source Project</h4>
              <p className="text-muted-foreground text-sm">
                Hiky is an open-source project built to demonstrate modern full-stack development practices.
                Feel free to explore the codebase and contribute to its development.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button variant="outline" className="border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20">
                <Globe className="w-4 h-4 mr-2" />
                View Source
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <ScrollReveal>
          <motion.div 
            className="text-center bg-gradient-to-r from-green-100/80 via-green-50/50 to-green-100/80 dark:from-green-600/20 dark:via-green-500/10 dark:to-green-600/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-green-200 dark:border-green-600/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground dark:text-white mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to Connect?
            </motion.h2>
            <motion.p 
              className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join Hiky today and experience modern real-time messaging. Connect with friends, share moments, and chat instantly.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate("/login")}
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto shadow-lg"
                >
                  Get Started Now
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline" className="border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  View Demo
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-900/10 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="sm:col-span-2 md:col-span-2">
              <motion.div 
                className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <HikyLogo width={36} height={36} className="sm:w-10 sm:h-10" />
                <h3 className="text-base sm:text-lg font-semibold text-green-400">Hiky</h3>
              </motion.div>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 max-w-md">
                Modern real-time chat application built with React, Node.js, MongoDB, and Redis. 
                Connect with friends through instant messaging, file sharing, and group conversations.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="sm" variant="outline" className="border-green-600/30 text-green-300 p-2">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="sm" variant="outline" className="border-green-600/30 text-green-300 p-2">
                    <Globe className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Features</h4>
              <div className="space-y-2">
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>Real-time Messaging</motion.a>
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>File Sharing</motion.a>
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>Group Chats</motion.a>
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>Online Presence</motion.a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">Technology</h4>
              <div className="space-y-2">
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>React & Vite</motion.a>
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>Node.js & Express</motion.a>
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>MongoDB</motion.a>
                <motion.a className="block text-xs sm:text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ x: 2 }}>Redis & WebSocket</motion.a>
              </div>
            </div>
          </div>

          <div className="border-t border-border dark:border-green-900/10 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              © 2025 Hiky. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <motion.a className="hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ scale: 1.05 }}>Privacy Policy</motion.a>
              <motion.a className="hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ scale: 1.05 }}>Terms of Service</motion.a>
              <motion.a className="hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer" whileHover={{ scale: 1.05 }}>Cookie Policy</motion.a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
