"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { userProfileApi } from "@/services/api";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    location: "",
    profession: "",
    interests: "",
    communication_style: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userProfileApi.getProfile();
        if (profile) {
          setFormData({
            name: profile.name || "",
            gender: profile.gender || "",
            age: profile.age?.toString() || "",
            location: profile.location || "",
            profession: profile.profession || "",
            interests: profile.interests || "",
            communication_style: profile.communication_style || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userProfileApi.updateProfile({
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      });
      router.push("/");
    } catch (error) {
      console.error("Failed to save profile:", error);
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
            <User className="w-5 h-5 text-primary" />
            <span>User Profile</span>
          </div>
        </div>
      </nav>

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
              <CardTitle className="text-2xl text-white">Tell us about yourself</CardTitle>
              <CardDescription className="text-blue-100/70">
                This information helps your AI personas understand who they are speaking to, making their responses more personalized and accurate.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Your name" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input 
                      id="gender" 
                      name="gender" 
                      placeholder="e.g. Male, Female, Other" 
                      value={formData.gender}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      name="age" 
                      type="number"
                      placeholder="Your age" 
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      placeholder="e.g. New York, Tokyo" 
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input 
                    id="profession" 
                    name="profession" 
                    placeholder="What do you do?" 
                    value={formData.profession}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Interests & Hobbies</Label>
                  <Textarea 
                    id="interests" 
                    name="interests" 
                    placeholder="What do you love? Cricket, Coding, Cooking..." 
                    className="min-h-[100px]"
                    value={formData.interests}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communication_style">Communication Style</Label>
                  <Input 
                    id="communication_style" 
                    name="communication_style" 
                    placeholder="e.g. Formal, Casual, Direct, Sarcastic" 
                    value={formData.communication_style}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto px-8">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
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
