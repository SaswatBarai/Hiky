import React from 'react';
import { HikyLogo } from '@/components/hiky-logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';
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

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-green-50/30 dark:from-background dark:via-background dark:to-muted/20 text-foreground">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.03),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.02),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.02),transparent_30%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.08),transparent_20%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.06),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.05),transparent_30%)] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <HikyLogo 
          onClick={() => navigate("/")}
          width={48} height={48} className="rounded-lg" />
          <h1 className="text-xl font-bold text-green-600 dark:text-green-500">Hiky</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors" href="#features">Features</a>
          <a className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors" href="#how-it-works">Getting Started</a>
          <a className="text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-500 transition-colors" href="#about">About</a>
          
          <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
          onClick={() => navigate("/login")}
          >Get Started</Button>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
          onClick={()=> navigate("/login")}
          >Get Startedii</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-600/20 border border-green-200 dark:border-green-600/30 mb-8">
            <Star className="w-4 h-4 text-green-600 dark:text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-400">Built with modern web technologies</span>
          </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-green-700 to-green-800 dark:from-green-400 dark:via-green-500 dark:to-green-600">
              Real-time Chat
            </span>
            <br />
            <span className="text-foreground dark:text-white">Made Simple</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time chat application built for seamless communication. Connect with friends through private messages, 
            create group chats, share files, and stay connected with instant presence indicators and typing notifications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
            onClick={() => navigate("/login")}
            size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-4 text-lg">
              Try Hiky Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20 px-8 py-4 text-lg">
              <Play className="w-5 h-5 mr-2" />
              View Features
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>Open source</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span>Modern & fast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground dark:text-white mb-4">Features That Matter</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with modern technologies to deliver fast, reliable, and secure messaging experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Real-time Messaging</h3>
            <p className="text-muted-foreground leading-relaxed">
              Instant message delivery with WebSocket technology. See typing indicators and online presence in real-time.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">File Sharing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Share images, videos, audio files, and documents seamlessly with integrated Cloudinary storage.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors">
              <Users className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Private & Group Chats</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create private conversations with friends or group chats for team collaboration with up to multiple participants.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Redis-Powered Performance</h3>
            <p className="text-muted-foreground leading-relaxed">
              Built with Redis for lightning-fast message delivery, online presence tracking, and scalable real-time features.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors">
              <Smartphone className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Modern Web App</h3>
            <p className="text-muted-foreground leading-relaxed">
              Responsive design built with React and Tailwind CSS. Works seamlessly across desktop and mobile browsers.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-card/50 border border-green-100 dark:border-green-900/20 hover:border-green-300 dark:hover:border-green-600/40 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-600/30 transition-colors">
              <HeadphonesIcon className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Read Receipts & Status</h3>
            <p className="text-muted-foreground leading-relaxed">
              Know when your messages are delivered and read. See who's online, typing, or away with real-time presence indicators.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground dark:text-white mb-4">Get Started in Minutes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Hiky and start chatting with friends instantly. No complex setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200 dark:border-green-600/20">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">1</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Create Account</h3>
            <p className="text-muted-foreground">
              Sign up with your email and choose a unique username. Verify your email and you're ready to go.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200 dark:border-green-600/20">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Find Friends</h3>
            <p className="text-muted-foreground">
              Search for friends by username or email. Start private conversations or create group chats.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200 dark:border-green-600/20">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white mb-3">Start Chatting</h3>
            <p className="text-muted-foreground">
              Send messages, share files, and enjoy real-time conversations with read receipts and online presence.
            </p>
          </div>
        </div>
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
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center bg-gradient-to-r from-green-100/80 via-green-50/50 to-green-100/80 dark:from-green-600/20 dark:via-green-500/10 dark:to-green-600/20 rounded-3xl p-12 border border-green-200 dark:border-green-600/30">
          <h2 className="text-4xl font-bold text-foreground dark:text-white mb-4">Ready to Connect?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Hiky today and experience modern real-time messaging. Connect with friends, share moments, and chat instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-8 py-4 text-lg">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-green-300 dark:border-green-600/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-600/20 px-8 py-4 text-lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-900/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <HikyLogo width={40} height={40} />
                <h3 className="text-lg font-semibold text-green-400">Hiky</h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Modern real-time chat application built with React, Node.js, MongoDB, and Redis. 
                Connect with friends through instant messaging, file sharing, and group conversations.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="outline" className="border-green-600/30 text-green-300">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-green-600/30 text-green-300">
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground dark:text-white mb-4">Features</h4>
              <div className="space-y-2">
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Real-time Messaging</a>
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">File Sharing</a>
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Group Chats</a>
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Online Presence</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground dark:text-white mb-4">Technology</h4>
              <div className="space-y-2">
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">React & Vite</a>
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Node.js & Express</a>
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">MongoDB</a>
                <a className="block text-sm text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors">Redis & WebSocket</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border dark:border-green-900/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Hiky. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Privacy Policy</a>
              <a className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Terms of Service</a>
              <a className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
