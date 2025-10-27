'use client';
import { useState } from 'react';
import type { User, MeditationSession } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeditationChart } from '../dashboard/meditation-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AdminDashboardProps {
  users: User[];
  sessions: MeditationSession[];
}

export function AdminDashboard({ users, sessions }: AdminDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(users[0]?.id || null);

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedUserSessions = sessions.filter(s => s.userId === selectedUserId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Progress</CardTitle>
          <CardDescription>Select a user to view their meditation data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedUserId} defaultValue={selectedUserId || undefined}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser && (
        <MeditationChart 
          sessions={selectedUserSessions} 
          title={`${selectedUser.name}'s Progress`}
          description={`Meditation data for ${selectedUser.email}.`}
        />
      )}
    </div>
  );
}
