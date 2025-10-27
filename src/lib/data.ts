import type { User, MeditationSession } from '@/lib/types';

// Note: This in-memory data will reset on every server restart.
// It's a mock for demonstration purposes.

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Aisha Sharma',
    email: 'aisha@example.com',
    password: 'pass',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    role: 'user',
  },
  {
    id: 'user-2',
    name: 'Ben Carter',
    email: 'ben@example.com',
    password: 'pass',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    role: 'user',
  },
  {
    id: 'admin-1',
    name: 'Charles Davis (Admin)',
    email: 'charles@example.com',
    password: 'pass',
    avatar: 'https://picsum.photos/seed/admin/100/100',
    role: 'admin',
  },
];

const generatePastSessions = (userId: string, numDays: number, dailyAverageMinutes: number): MeditationSession[] => {
  const sessions: MeditationSession[] = [];
  const now = new Date();
  for (let i = 1; i <= numDays; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Add some variability
    const durationInSeconds = (dailyAverageMinutes + Math.random() * 10 - 5) * 60;
    if (durationInSeconds < 0) continue;

    const endTime = new Date(date);
    endTime.setHours(8, Math.floor(Math.random() * 60), 0, 0); // Random time in the morning
    
    const startTime = new Date(endTime.getTime() - durationInSeconds * 1000);

    sessions.push({
      id: `session-${userId}-${i}`,
      userId: userId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: Math.floor(durationInSeconds),
    });
  }
  return sessions;
};

export const meditationSessions: MeditationSession[] = [
  ...generatePastSessions('user-1', 10, 15),
  ...generatePastSessions('user-2', 10, 25),
  ...generatePastSessions('admin-1', 10, 5),
];
