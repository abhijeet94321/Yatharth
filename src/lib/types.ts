import type { User as FirebaseUser } from 'firebase/auth';

export type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  fcmTokens?: string[];
  recommendedVideoUrl?: string;
};

// Combine Firebase User with our app-specific profile
export type User = FirebaseUser & UserProfile;


export type MeditationSession = {
  id: string;
  userId: string;
  startTime: string; // Storing as ISO string for serialization
  endTime: string;   // Storing as ISO string for serialization
  duration: number; // in seconds
};
