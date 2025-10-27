export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Adding password field for auth
  avatar: string;
  role: 'user' | 'admin';
};

export type MeditationSession = {
  id: string;
  userId: string;
  startTime: string; // Storing as ISO string for serialization
  endTime: string;   // Storing as ISO string for serialization
  duration: number; // in seconds
};
