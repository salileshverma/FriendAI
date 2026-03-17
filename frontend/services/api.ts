import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  // Let axios set Content-Type automatically based on the request body (JSON or FormData)
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session && (session as any).jwt) {
    config.headers.Authorization = `Bearer ${(session as any).jwt}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log essential errors in production
    if (process.env.NODE_ENV !== 'production') {
      console.error(`API Error [${error.response?.status}] for: ${error.config?.url}`);
    }
    return Promise.reject(error);
  }
);


// Types
export interface Persona {
  id: number;
  name: string;
  relationship: string;
  appearance: string;
  personality: string;
  habits: string;
  speech_style: string;
  memories: string;
  interests: string;
  tone: string;
  avatar_image?: string;
  avatar_seed?: string;
  created_at: string;
}

export type PersonaCreate = Omit<Persona, 'id' | 'created_at'>;

export interface Conversation {
  id: number;
  persona_id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  gender: string;
  age: number | null;
  location: string;
  profession: string;
  interests: string;
  communication_style: string;
}

// Persona API
export const personaApi = {
  create: async (data: PersonaCreate | FormData): Promise<any> => {
    const response = await api.post('/persona/create', data);
    // Backend returns { success: true, message: "...", data: persona }
    return response.data;
  },
  
  list: async (skip: number = 0, limit: number = 100): Promise<Persona[]> => {
    const response = await api.get('/persona/list', { params: { skip, limit } });
    return response.data?.success ? response.data.data : [];
  },
  
  get: async (id: number): Promise<Persona | null> => {
    const response = await api.get(`/persona/${id}`);
    return response.data?.success ? response.data.data : null;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/persona/delete/${id}`);
  }
};

// Chat API
export const chatApi = {
  sendMessage: async (personaId: number, message: string): Promise<Conversation> => {
    const response = await api.post('/chat', { persona_id: personaId, message });
    return response.data;
  },
  endSession: async (personaId: number): Promise<{message: string, learnings: string[]}> => {
    const response = await api.post(`/chat/end/${personaId}`);
    return response.data;
  }
};

// User Profile API
export const userProfileApi = {
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await api.get('/user/profile');
      // Backend returns { success: true, data: profile }
      return response.data?.success ? response.data.data : null;
    } catch (error) {
      console.error("api.ts: getProfile failed", error);
      return null;
    }
  },
  updateProfile: async (profile: UserProfile): Promise<any> => {
    const response = await api.post('/user/profile', profile);
    // Backend returns { success: true, message: "...", data: profile }
    return response.data;
  }
};
