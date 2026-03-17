"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ArrowLeft, Loader2, Upload, X, FileText } from "lucide-react";
import Link from "next/link";
import { personaApi, PersonaCreate, userProfileApi } from "@/services/api";
import { RefreshCw } from "lucide-react";
import { UserProfileModal } from "@/components/UserProfileModal";

const AVATAR_OPTIONS = [
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'avataaars', label: 'Avataaars' },
  { id: 'bottts', label: 'Bottts' },
  { id: 'notionists', label: 'Notionists' },
  { id: 'pixel-art', label: 'Pixel Art' },
];

export default function CreatePersonaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PersonaCreate>({
    name: "",
    relationship: "",
    appearance: "",
    personality: "",
    habits: "",
    speech_style: "",
    memories: "",
    interests: "",
    tone: "",
    avatar_image: "lorelei",
    avatar_seed: Math.random().toString(36).substring(7),
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkProfile();
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
    // If they still haven't completed it, send them back to dashboard or home
    if (!isProfileComplete) {
      router.push("/");
    } else {
      checkProfile();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatarId: string) => {
    setFormData(prev => ({ ...prev, avatar_image: avatarId }));
  };

  const handleRandomizeSeed = () => {
    setFormData(prev => ({ ...prev, avatar_seed: Math.random().toString(36).substring(7) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const removeFile = () => {
    setPdfFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          submissionData.append(key, String(value));
        }
      });
      
      if (pdfFile) {
        submissionData.append("file", pdfFile);
      }

      const result = await personaApi.create(submissionData);
      
      if (result.success) {
        router.push("/dashboard");
      } else {
        alert(`Failed to create persona: ${result.message}`);
      }
    } catch (error: any) {
      console.error("Failed to create persona:", error);
      const detail = error.response?.data?.detail;
      let errorMessage = "Unknown error";
      
      if (Array.isArray(detail)) {
        errorMessage = detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else {
        errorMessage = error.message || "Unknown error";
      }
      
      alert(`Failed to create persona:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <nav className="w-full border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mr-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-foreground font-bold tracking-tight">
            <Bot className="w-5 h-5 text-primary" />
            <span>New Persona</span>
          </div>
        </div>
      </nav>

      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={handleProfileClose}
        enforcementMessage="You must complete your profile before creating a persona."
      />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl relative overflow-hidden group">
            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <CardHeader className="border-b border-white/10 bg-white/5 pb-8 pt-8 relative z-10">
              <CardTitle className="text-2xl text-white">Design Your Companion</CardTitle>
              <CardDescription className="text-blue-100/70">
                Fill out these details to give your AI persona a unique identity. The more detail you provide, the more lifelike they will become.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Avatar Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-white">Choose Avatar Style</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRandomizeSeed}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2 font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Randomize Appearance
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {AVATAR_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAvatarSelect(option.id)}
                        className={`relative group transition-all duration-300 rounded-2xl p-1 border-2 ${
                          formData.avatar_image === option.id 
                            ? 'border-primary ring-2 ring-primary/20 scale-105' 
                            : 'border-transparent hover:border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                          <img 
                            src={`https://api.dicebear.com/7.x/${option.id}/svg?seed=${formData.avatar_seed}`} 
                            alt={option.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`mt-2 text-[10px] font-black uppercase tracking-tighter text-center transition-colors ${
                          formData.avatar_image === option.id ? 'text-primary' : 'text-white/40 group-hover:text-white/60'
                        }`}>
                          {option.label}
                        </div>
                        {formData.avatar_image === option.id && (
                          <motion.div 
                            layoutId="avatar-glow"
                            className="absolute inset-0 bg-primary/10 blur-xl -z-10 rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="e.g. Alex, Dr. Smith, Jarvis" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship to You</Label>
                    <Input 
                      id="relationship" 
                      name="relationship" 
                      placeholder="e.g. Mentor, Friend, Assistant" 
                      value={formData.relationship}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-6 mt-6">
                  <Label htmlFor="personality">Personality Core</Label>
                  <Textarea 
                    id="personality" 
                    name="personality" 
                    placeholder="Describe their main traits. Are they cynical but caring? Hyper-energetic? Calm and analytical?" 
                    className="min-h-[100px]"
                    value={formData.personality}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appearance">Appearance & Presentation</Label>
                  <Textarea 
                    id="appearance" 
                    name="appearance" 
                    placeholder="How do they carry themselves? What do they look like?" 
                    className="min-h-[80px]"
                    value={formData.appearance}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="speech_style">Speech Style</Label>
                    <Textarea 
                      id="speech_style" 
                      name="speech_style" 
                      placeholder="e.g. Uses big words, stutters when nervous, uses lots of emojis" 
                      value={formData.speech_style}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Default Tone</Label>
                    <Input 
                      id="tone" 
                      name="tone" 
                      placeholder="e.g. Sarcastic, Professional, Warm" 
                      value={formData.tone}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-6 mt-6">
                  <Label htmlFor="habits">Habits & Quirks</Label>
                  <Input 
                    id="habits" 
                    name="habits" 
                    placeholder="e.g. Always mentions coffee, deflects compliments" 
                    value={formData.habits}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & Hobbies</Label>
                  <Input 
                    id="interests" 
                    name="interests" 
                    placeholder="e.g. Quantum physics, 80s rock music, baking" 
                    value={formData.interests}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memories">Shared or Core Memories</Label>
                  <Textarea 
                    id="memories" 
                    name="memories" 
                    placeholder="What defining past events shape them? Any shared history with you?" 
                    className="min-h-[100px]"
                    value={formData.memories}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="space-y-4 border-t border-border pt-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-semibold">Persona Knowledge Document</Label>
                    <p className="text-sm text-muted-foreground">
                      You can upload a document containing detailed information about this person such as birthday, life events, stories, education history, important dates, or personality details. This helps the AI simulate the person more accurately.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {!pdfFile ? (
                      <div className="relative group cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium">Click to upload PDF</p>
                            <p className="text-xs text-muted-foreground mt-1">Accepts .pdf files (Max 10MB)</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm truncate max-w-[200px] md:max-w-xs">{pdfFile.name}</span>
                            <span className="text-xs text-muted-foreground">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={removeFile}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto px-8">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Forging Persona...
                      </>
                    ) : (
                      "Create Persona"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
