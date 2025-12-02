'use client';
import { useState, useMemo } from 'react';
import type { UserProfile, MeditationSession } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeditationChart } from '../dashboard/meditation-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface AdminDashboardProps {
  users: UserProfile[];
}

export function AdminDashboard({ users }: AdminDashboardProps) {
  const { user: adminUser } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

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

  const handleVideoUpload = async () => {
    if (!videoFile || !selectedUserId) {
        toast({
            title: 'Upload Failed',
            description: 'Please select a user and a video file.',
            variant: 'destructive'
        });
        return;
    }

    setIsUploading(true);

    try {
        const storage = getStorage();
        const videoId = uuidv4();
        const storageRef = ref(storage, `recommended_videos/${selectedUserId}/${videoId}`);

        await uploadBytes(storageRef, videoFile);
        const downloadURL = await getDownloadURL(storageRef);

        const userDocRef = doc(firestore, 'users', selectedUserId);
        await updateDoc(userDocRef, {
            recommendedVideoUrl: downloadURL
        });

        toast({
            title: 'Upload Successful',
            description: `Video has been assigned to ${selectedUser?.name}.`,
        });
        setVideoFile(null);

    } catch (error) {
        console.error("Video upload error:", error);
        toast({
            title: 'Upload Error',
            description: 'There was a problem uploading the video.',
            variant: 'destructive'
        });
    } finally {
        setIsUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Select a user to view their progress or assign a recommended video.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {selectedUserId && (
             <div className="space-y-2 rounded-md border p-4">
                 <h4 className="font-medium">Assign Recommended Video</h4>
                <div className="flex items-center gap-4">
                    <Input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                        className="flex-1"
                        disabled={isUploading}
                    />
                    <Button onClick={handleVideoUpload} disabled={!videoFile || isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Uploading...' : 'Upload Video'}
                    </Button>
                </div>
                {selectedUser?.recommendedVideoUrl && (
                    <p className="text-xs text-muted-foreground">
                        Current video: <a href={selectedUser.recommendedVideoUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                    </p>
                )}
             </div>
          )}
        </CardContent>
      </Card>
      
      {selectedUserId && sessionsLoading && (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {selectedUserId && !sessionsLoading && selectedUser && (
        <MeditationChart 
          sessions={selectedUserSessions || []} 
          title={`${selectedUser.name}'s Progress`}
          description={`Meditation data for ${selectedUser.email}.`}
        />
      )}

      {!selectedUserId && !sessionsLoading &&(
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please select a user to view their data.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
