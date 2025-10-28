'use client';
import { useState, useMemo } from 'react';
import type { UserProfile, MeditationSession } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeditationChart } from '../dashboard/meditation-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  users: UserProfile[];
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  const { user: adminUser } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const firestore = useFirestore();

  const otherUsers = useMemo(() => {
    if (!adminUser) return [];
    return users.filter(u => u.id !== adminUser.uid);
  }, [users, adminUser]);

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
          {otherUsers.length > 0 ? (
            <Select onValueChange={setSelectedUserId} value={selectedUserId || ''}>
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {otherUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} (@{user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
             <p className="text-sm text-muted-foreground">No other users found.</p>
          )}
        </CardContent>
      </Card>
      
      {selectedUserId && sessionsLoading && (
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

      {!selectedUserId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a user to view their progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
