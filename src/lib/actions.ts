'use server';

import { revalidatePath } from 'next/cache';
import { meditationSessions } from './data';
import type { MeditationSession } from './types';

// NOTE: This is a mock implementation. 
// In a real application, you would interact with a database.
// The data is in-memory and will reset on server restart.

export async function logMeditationSession(
  userId: string,
  duration: number
): Promise<{ success: boolean; message: string }> {
  if (!userId || duration <= 0) {
    return { success: false, message: 'Invalid session data.' };
  }

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - duration * 1000);

  const newSession: MeditationSession = {
    id: `session-${userId}-${Date.now()}`,
    userId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: Math.floor(duration),
  };

  meditationSessions.push(newSession);

  // Revalidate paths to show the new data
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  
  return { success: true, message: 'Meditation session logged successfully.' };
}
