import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HikyLogo } from '@/components/hiky-logo';
import { Shield, ArrowLeft, Home, Lock, AlertTriangle } from 'lucide-react';

const Unauthorized = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Minimal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-background to-orange-50/20 dark:from-red-950/10 dark:via-background dark:to-orange-900/5" />
      
      {/* Floating particles - minimal */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 0.5, 0.2],
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
        <motion.div 
          className="text-center max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="relative"
              variants={pulseVariants}
              animate="pulse"
            >
              <HikyLogo width={80} height={80} className="rounded-xl" />
              <motion.div
                className="absolute -inset-2 bg-red-500/10 rounded-full blur-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          {/* Icon and Status */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            variants={itemVariants}
          >
            <motion.div
              className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">401 Unauthorized</p>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <p className="text-muted-foreground leading-relaxed mb-4">
              You don't have permission to access this resource. Please log in with valid credentials or contact support if you believe this is an error.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 justify-center"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto border-border hover:bg-muted"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto border-border hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>
          </motion.div>

          {/* Help text */}
          <motion.div
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <p className="text-sm text-muted-foreground">
              Need help? <a href="#" className="text-red-500 hover:text-red-600 transition-colors underline">Contact Support</a>
            </p>
          </motion.div>

        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 text-center p-6 border-t border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 0.6 : 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-sm text-muted-foreground">
          © 2024 Hiky Chat. Made with ❤️ for secure conversations.
        </p>
      </motion.footer>
    </div>
  );
};

export default Unauthorized;