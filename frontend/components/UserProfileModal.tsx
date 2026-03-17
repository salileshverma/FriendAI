"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { userProfileApi, UserProfile } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Save, Loader2, Sparkles } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  enforcementMessage?: string;
}

export function UserProfileModal({ 
  isOpen, 
  onClose, 
  enforcementMessage 
}: UserProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    gender: "",
    age: null,
    location: "",
    profession: "",
    interests: "",
    communication_style: "Casual",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      setError(null);
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await userProfileApi.getProfile();
      if (data) {
        setProfile(data);
        localStorage.setItem("userProfile", JSON.stringify(data));
      } else {
        const localData = localStorage.getItem("userProfile");
        if (localData) {
          setProfile(JSON.parse(localData));
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!profile.name?.trim()) return "Name is required.";
    if (!profile.gender?.trim()) return "Gender is required.";
    if (!profile.age) return "Age is required.";
    if (profile.age < 0 || profile.age > 150) return "Please enter a valid age.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      console.log("Attempting to save profile:", profile);
      const result = await userProfileApi.updateProfile(profile);
      console.log("Profile save response:", result);
      
      if (result.success) {
        localStorage.setItem("userProfile", JSON.stringify(profile));
        onClose();
      } else {
        setError(result.message || "Failed to save profile. Please try again.");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Please try again.";
      const responseDetail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(`Failed to save profile. ${responseDetail || errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setError(null);
    setProfile((prev) => ({
      ...prev,
      [name]: name === "age" ? (value ? parseInt(value) : null) : value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              User Profile
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            This information helps AI personas personalize their responses to you.
          </DialogDescription>
          
          <AnimatePresence mode="wait">
            {enforcementMessage && !error && (
              <motion.div 
                key="enforcement"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-xl bg-primary/20 border border-primary/30 text-primary flex items-center gap-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {enforcementMessage}
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center gap-2 text-sm font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        ) : (
          <div className="grid gap-6 py-4 relative z-10 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Salilesh"
                  value={profile.name}
                  onChange={handleChange}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all ${error && !profile.name ? 'border-red-500/50' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white/80">Gender *</Label>
                <Input
                  id="gender"
                  name="gender"
                  placeholder="Male / Female / Other"
                  value={profile.gender}
                  onChange={handleChange}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all ${error && !profile.gender ? 'border-red-500/50' : ''}`}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white/80">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="25"
                  value={profile.age || ""}
                  onChange={handleChange}
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all ${error && !profile.age ? 'border-red-500/50' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white/80">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, Country"
                  value={profile.location}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession" className="text-white/80">Profession</Label>
              <Input
                id="profession"
                name="profession"
                placeholder="Student, Engineer, Designer"
                value={profile.profession}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests" className="text-white/80">Interests</Label>
              <Textarea
                id="interests"
                name="interests"
                placeholder="Coding, music, sci-fi movies, hiking..."
                value={profile.interests}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="communication_style" className="text-white/80">Communication Style</Label>
              <Input
                id="communication_style"
                name="communication_style"
                placeholder="Casual, Formal, Funny, Sarcastic..."
                value={profile.communication_style}
                onChange={handleChange}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        )}

        <DialogFooter className="relative z-10 pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 font-bold min-w-[120px]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
