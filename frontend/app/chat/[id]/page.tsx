"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, ArrowLeft, Send, User, LogOut } from "lucide-react";
import Link from "next/link";
import { personaApi, chatApi, Persona, Conversation, userProfileApi } from "@/services/api";
import { AIAvatar } from "@/components/AIAvatar";
import { ChatBackground } from "@/components/ChatBackground";
import Image from "next/image";

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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [inputStr, setInputStr] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionEnded = useRef(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await userProfileApi.getProfile();
        if (!profile) {
          router.push("/profile/setup");
        }
      } catch (error) {
        console.error("Failed to check profile:", error);
      }
    };
    checkProfile();
  }, [router]);

  useEffect(() => {
    if (!id) return;
    
    const fetchPersona = async () => {
      try {
        const data = await personaApi.get(id);
        setPersona(data);
      } catch (error) {
        console.error("Failed to load persona:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersona();

    return () => {
      if (!sessionEnded.current && id) {
        chatApi.endSession(id).catch(console.error);
      }
    };
  }, [id, router]);

  const handleEndChat = async () => {
    if (ending) return;
    setEnding(true);
    try {
      await chatApi.endSession(id);
      sessionEnded.current = true;
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to end session:", error);
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputStr.trim() || sending) return;

    const userMsg = inputStr.trim();
    setInputStr("");
    setSending(true);

    // Add user message to UI immediately for perceived performance
    const fakeId = Date.now();
    setMessages(prev => [...prev, {
      id: fakeId,
      persona_id: id,
      sender: 'user',
      message: userMsg,
      timestamp: new Date().toISOString()
    }]);

    try {
      const aiResponse = await chatApi.sendMessage(id, userMsg);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: show a toast error here
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans">
        <Bot className="w-12 h-12 text-muted-foreground animate-pulse mb-4" />
        <p className="text-muted-foreground animate-pulse">Initializing Neural Link...</p>
      </div>
    );
  }

  if (!persona) return null;

  const relStyle = getRelationshipStyle(persona.relationship, persona.name, persona.avatar_image, persona.avatar_seed);

  return (
    <ChatBackground>
      <div className="fixed inset-0 flex flex-col h-[100dvh] overflow-hidden font-sans">
        {/* Header - Fixed height, no shrink */}
        <nav className="w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl shrink-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-white/30 hover:text-white transition-all p-2.5 -ml-3 rounded-2xl hover:bg-white/5 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-5">
                <div className="relative">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-14 h-14 rounded-2xl border border-white/10 shadow-2xl relative z-10 overflow-hidden bg-white/5 pt-1"
                    >
                      <Image 
                        src={relStyle.avatarUrl} 
                        alt={persona.name} 
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0a0a1a] rounded-full shadow-lg z-20" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight tracking-tight mb-1">{persona.name}</h2>
                  <div className={`px-2 py-0.5 rounded-md text-[9px] font-black border inline-block ${relStyle.badge} uppercase tracking-[0.2em] shadow-lg`}>
                    {persona.relationship}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEndChat}
              disabled={ending}
              className="text-white/20 hover:text-destructive hover:bg-destructive/5 gap-2 rounded-xl px-4 h-11 border border-transparent hover:border-destructive/10 transition-all group"
            >
              <LogOut className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              <span className="hidden sm:inline font-black text-[10px] uppercase tracking-[0.2em]">Close Tunnel</span>
            </Button>
          </div>
        </nav>

        {/* Chat Area - Flexible height, scrollable */}
        <div className="flex-1 overflow-y-auto w-full z-10 custom-scrollbar overscroll-contain">
          <div className="max-w-4xl mx-auto p-6 sm:p-10">
            
            {/* Premium AI Avatar - Reacts to states */}
            <div className="mb-0 overflow-hidden">
              <AIAvatar status={sending ? 'thinking' : 'idle'} />
            </div>

            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-3">
                  Neural Link Active
                </h1>
                <p className="text-indigo-200/40 font-medium text-sm tracking-wide uppercase">
                  Connected to {persona.name}&apos;s consciousness
                </p>
              </motion.div>
            )}

            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, scale: 0.98, y: 20, originX: isUser ? 1 : 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`flex items-end gap-3 max-w-[90%] sm:max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xl border ${isUser 
                        ? 'bg-white/10 text-white border-white/10' 
                        : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20'}`}>
                        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      
                      <div className="relative group">
                        <div className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-2xl backdrop-blur-2xl transition-all duration-300 ${isUser 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none hover:shadow-indigo-500/20 hover:-translate-y-0.5' 
                          : 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-bl-none hover:bg-white/[0.05]'}`}
                        >
                          {msg.message}
                        </div>
                        <p className={`text-[10px] font-bold text-white/10 absolute -bottom-5 ${isUser ? 'right-0' : 'left-0'} uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing Indicator */}
              {sending && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-end gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <Bot className="w-4 h-4 text-indigo-400/50" />
                  </div>
                  <div className="px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/5 rounded-bl-none flex gap-1.5 items-center h-[52px]">
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  </div>
                </motion.div>
              )}

              <div ref={scrollRef} className="h-4" />
            </div>
          </div>
        </div>

        {/* Input Area - Fixed height at bottom, no shrink */}
        <div className="p-6 bg-black/40 shrink-0 w-full z-20 border-t border-white/5 backdrop-blur-2xl">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
            <div className="relative flex-grow">
              <Input 
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder={`Type a message to ${persona.name}...`}
                className="rounded-2xl bg-white/[0.03] border-white/10 h-14 pl-6 pr-16 text-white placeholder:text-white/20 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-xl shadow-2xl text-[15px]"
                disabled={sending}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button 
                  type="submit" 
                  size="icon" 
                  className={`rounded-xl h-10 w-10 transition-all duration-300 ${inputStr.trim() ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/20'}`}
                  disabled={!inputStr.trim() || sending}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </div>
            </div>
          </form>
          <p className="text-center mt-4 text-[10px] text-white/10 font-bold uppercase tracking-[0.3em]">
            Secured Neural Connection
          </p>
        </div>
      </div>
    </ChatBackground>
  );
}
