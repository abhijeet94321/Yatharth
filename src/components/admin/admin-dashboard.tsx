'use client';
import { useState } from 'react';
import type { UserProfile, MeditationSession } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeditationChart } from '../dashboard/meditation-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  users: UserProfile[];
  sessions: MeditationSession[]; // This will not be used directly anymore
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(users[0]?.id || null);
  const firestore = useFirestore();

  const selectedUserSessionsQuery = useMemoFirebase(() => {
    if (!selectedUserId) return null;
    return collection(firestore, 'users', selectedUserId, 'meditationSessions');
  }, [firestore, selectedUserId]);

  const { data: selectedUserSessions, isLoading: sessionsLoading } = useCollection<MeditationSession>(selectedUserSessionsQuery);

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Progress</CardTitle>
          <CardDescription>Select a user to view their meditation data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedUserId} value={selectedUserId || ''}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} (@{user.username})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {sessionsLoading && (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!sessionsLoading && selectedUser && (
        <MeditationChart 
          sessions={selectedUserSessions || []} 
          title={`${selectedUser.name}'s Progress`}
          description={`Meditation data for ${selectedUser.email}.`}
        />
      )}
    </div>
  );
}
