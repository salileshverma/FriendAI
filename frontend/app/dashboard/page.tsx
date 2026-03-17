"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageSquare, Plus, Trash2, User, Heart, Home, Users, Ghost, Briefcase, Sparkles, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { personaApi, Persona, userProfileApi } from "@/services/api";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileModal } from "@/components/UserProfileModal";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const router = useRouter();

  const getRelationshipStyle = (relationship: string, name: string, avatar_image?: string, avatar_seed?: string) => {
    const rel = relationship.toLowerCase();
    const avatarStyle = avatar_image || 'lorelei';
    const seed = avatar_seed || encodeURIComponent(name);
    const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    const baseStyle = {
      avatarUrl,
      color: "text-indigo-400",
      bg: "bg-indigo-500/5",
      border: "border-indigo-500/20",
      badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      accent: "from-indigo-500 to-purple-600"
    };

    if (rel.includes("love") || rel.includes("partner") || rel.includes("spouse") || rel.includes("crush")) {
      return {
        ...baseStyle,
        color: "text-pink-400",
        bg: "bg-pink-500/5",
        border: "border-pink-500/20",
        badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        accent: "from-pink-500 to-rose-500"
      };
    }
    if (rel.includes("friend") || rel.includes("bestie") || rel.includes("buddy")) {
      return {
        ...baseStyle,
        color: "text-cyan-400",
        bg: "bg-cyan-500/5",
        border: "border-cyan-500/20",
        badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        accent: "from-cyan-500 to-blue-600"
      };
    }
    if (rel.includes("family") || rel.includes("mother") || rel.includes("father") || rel.includes("sibling") || rel.includes("parent")) {
      return {
        ...baseStyle,
        color: "text-emerald-400",
        bg: "bg-emerald-500/5",
        border: "border-emerald-500/20",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        accent: "from-emerald-500 to-teal-600"
      };
    }
    if (rel.includes("mentor") || rel.includes("teacher") || rel.includes("boss") || rel.includes("professional") || rel.includes("assistant")) {
      return {
        ...baseStyle,
        color: "text-amber-400",
        bg: "bg-amber-500/5",
        border: "border-amber-500/20",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        accent: "from-amber-400 to-orange-600"
      };
    }
    return baseStyle;
  };

  useEffect(() => {
    checkProfile();
    fetchPersonas();
  }, []);

  const checkProfile = async () => {
    try {
      const profile = await userProfileApi.getProfile();
      if (!profile || !profile.name || !profile.gender || !profile.age) {
        setIsProfileComplete(false);
        setIsProfileOpen(true);
      } else {
        setIsProfileComplete(true);
      }
    } catch (error) {
      console.error("Failed to check profile:", error);
      setIsProfileComplete(false);
      setIsProfileOpen(true);
    }
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
    // If they still haven't completed it, send them back to home
    if (!isProfileComplete) {
      router.push("/");
    } else {
      checkProfile();
    }
  };

  const fetchPersonas = async () => {
    try {
      const data = await personaApi.list();
      setPersonas(data);
    } catch (error) {
      console.error("Failed to load personas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this persona? All memories will be lost.")) {
      try {
        await personaApi.delete(id);
        fetchPersonas();
      } catch (error) {
        console.error("Failed to delete persona:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <nav className="w-full border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground font-bold tracking-tight">
            <Bot className="w-5 h-5 text-primary" />
            <span>Persona AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="flex items-center gap-4">
                <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
                <div className="h-8 w-8 bg-white/5 animate-pulse rounded-full" />
              </div>
            ) : (
              <>
                <Link href="/create">
                  <Button size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
                    <Plus className="w-4 h-4" />
                    New Persona
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-8 w-8 rounded-full p-0 outline-none border-none bg-transparent cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback className="bg-primary/20">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-xl border-white/10" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)} className="cursor-pointer py-3">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </nav>

      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={handleProfileClose}
        enforcementMessage={!isProfileComplete ? "You must complete your profile to access the dashboard." : undefined}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Your Companions</h1>
            <p className="text-muted-foreground">Manage and chat with your custom AI personas.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-card/50 h-64 border-border" />
            ))}
          </div>
        ) : personas.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 px-6 border border-dashed border-border rounded-xl bg-card/30"
          >
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No personas found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven&apos;t created any AI companions yet. Start by defining your first persona.
            </p>
            <Link href="/create">
              <Button>Create Your First Persona</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona, index) => {
              const style = getRelationshipStyle(persona.relationship, persona.name, persona.avatar_image, persona.avatar_seed);
              return (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full flex flex-col bg-[#0f111a]/60 backdrop-blur-3xl border-white/5 overflow-hidden group relative transition-all duration-500 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/[0.02] to-transparent">
                    <CardHeader className="relative z-10 p-8 pb-4">
                      <div className="flex items-start justify-between mb-6">
                        {/* Elite Avatar Frame */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`w-24 h-24 rounded-2xl border border-white/10 shadow-2xl relative z-10 overflow-hidden bg-white/5 group-hover:border-white/20 transition-all duration-500 pt-1`}
                        >
                          <img 
                            src={style.avatarUrl} 
                            alt={persona.name} 
                            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 ease-out"
                          />
                        </motion.div>

                        {/* Professional Relationship Tag */}
                        <div className={`px-3 py-1 rounded-md text-[10px] font-black border backdrop-blur-md ${style.badge} uppercase tracking-[0.2em] shadow-lg`}>
                          {persona.relationship}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <CardTitle className="text-3xl font-extrabold text-white tracking-tight leading-none">{persona.name}</CardTitle>
                        <p className={`text-[12px] font-bold ${style.color} uppercase tracking-[0.15em] opacity-70`}>
                          {persona.relationship}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow relative z-10 px-8 py-4 space-y-4">
                      <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                      
                      <div className="space-y-3">
                        <p className="text-[16px] text-slate-200 leading-relaxed font-semibold line-clamp-2">
                          {persona.personality.split('.')[0]}.
                        </p>
                        <p className="text-[13px] text-slate-500 italic font-medium leading-relaxed opacity-60 line-clamp-3 pl-4 border-l-2 border-white/5">
                          "{persona.personality}"
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="p-8 pt-4 gap-4 relative z-10 flex-col">
                      <Button 
                        className={`w-full h-12 rounded-xl gap-3 bg-gradient-to-r ${style.accent} hover:opacity-90 text-white border-0 font-bold shadow-2xl transition-all duration-300 transform active:scale-[0.98] text-sm tracking-wide`} 
                        onClick={() => router.push(`/chat/${persona.id}`)}
                      >
                        <MessageSquare className="w-5 h-5 opacity-70" />
                        Enter Chat Session
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(persona.id)} 
                        className="w-full text-slate-600 hover:text-destructive hover:bg-destructive/5 font-bold text-[10px] uppercase tracking-widest transition-all"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Companion
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
