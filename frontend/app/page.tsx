"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  UserCircle,
  LogOut,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { UserProfileModal } from "@/components/UserProfileModal";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { userProfileApi } from "@/services/api";

export default function LandingPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [enforcementMessage, setEnforcementMessage] = useState<string | undefined>();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      checkProfileCompletion();
    }
  }, [session]);

  // Effect to trigger popup ONLY when profile is explicitly confirmed as incomplete
  useEffect(() => {
    if (status === "authenticated" && isProfileComplete === false) {
      const timer = setTimeout(() => {
        setIsProfileOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, isProfileComplete]);

  const checkProfileCompletion = async () => {
    try {
      const profileData = await userProfileApi.getProfile();
      // If profileData is null or missing key fields, mark as incomplete
      if (profileData && profileData.name && profileData.gender && profileData.age) {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error("Failed to check profile:", error);
      setIsProfileComplete(false);
    }
  };

  const handleCreatePersonaClick = (e: React.MouseEvent) => {
    if (isProfileComplete === false) {
      e.preventDefault();
      setEnforcementMessage("You must complete your profile before creating a persona.");
      setIsProfileOpen(true);
    }
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
    setEnforcementMessage(undefined);
    // Re-check profile after closing the modal in case they saved
    checkProfileCompletion();
  };

  const handleEditProfile = () => {
    setIsProfileOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight">
          <Bot className="w-6 h-6 text-primary" />
          <span>Persona AI</span>
        </div>
        <div className="flex items-center gap-6">
          {status === "loading" ? (
            <div className="h-11 w-32 bg-white/5 animate-pulse rounded-full" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-white font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 hidden sm:block">
                Hi, {session.user?.name?.split(" ")[0]}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="p-0 h-auto rounded-full hover:bg-transparent group outline-none border-none bg-transparent">
                  <div className="flex items-center gap-2">
                    <Avatar className="ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-white/50 group-data-[state=open]:rotate-180 transition-transform" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/10 w-48 p-2 mt-2">
                  <DropdownMenuItem 
                    onClick={handleEditProfile}
                    className="gap-2 focus:bg-white/10 rounded-lg cursor-pointer py-3"
                  >
                    <UserCircle className="w-4 h-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="gap-2 focus:bg-red-500/10 text-red-400 focus:text-red-400 rounded-lg cursor-pointer py-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              variant="default" 
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="gap-2 bg-white text-black hover:bg-white/90 rounded-full px-8 font-bold h-11"
            >
              Login
            </Button>
          )}
        </div>
      </nav>

      {session && (
        <UserProfileModal 
          isOpen={isProfileOpen} 
          onClose={handleProfileClose}
          enforcementMessage={enforcementMessage}
        />
      )}

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center justify-center text-center relative z-10 min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Breathe life into your AI companions</span>
        </motion.div>

        <motion.h1 
          className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Create intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">personas</span> that feel truly alive.
        </motion.h1>

        <motion.p 
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Design custom AI personalities with unique backgrounds, memories, and speech styles. Chat with them using advanced memory retention and dynamic conversational awareness.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {session ? (
            <>
              <Link href="/create" className="w-full sm:w-auto" onClick={handleCreatePersonaClick}>
                <Button size="lg" className="h-14 px-8 text-base w-full sm:w-auto gap-2 group">
                  Get Started
                  <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto gap-2">
                  View Personas
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Button 
              size="lg" 
              className="h-14 px-8 text-base w-full sm:w-auto gap-3 group bg-white text-black hover:bg-white/90 rounded-xl"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          )}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-32 max-w-5xl text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Deep Personalities</h3>
            <p className="text-blue-100/70 leading-relaxed">Craft intricate backgrounds, habits, and speech patterns that shape every response with soulful depth.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Bot className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Vector Memory</h3>
            <p className="text-blue-100/70 leading-relaxed">Powered by ChromaDB, your personas maintain eternal context, remembering every whisper of your shared history.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Real-time Chat</h3>
            <p className="text-blue-100/70 leading-relaxed">Immerse yourself in dynamic, state-of-the-art chat interfaces designed for intimate and fluid connection.</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
