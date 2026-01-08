'use client';
import { useState, useMemo } from 'react';
import type { UserProfile, MeditationSession } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeditationChart } from '../dashboard/meditation-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Loader2, Upload, Send } from 'lucide-react';
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
  const [isPushing, setIsPushing] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
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

  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId)
  }, [users, selectedUserId]);
  
  const handleVideoUpload = async () => {
    if (!videoFile) {
        toast({
            title: 'Upload Failed',
            description: 'Please select a video file.',
            variant: 'destructive'
        });
        return;
    }

    setIsUploading(true);
    setUploadedVideoUrl(null);

    try {
        const storage = getStorage();
        const videoId = uuidv4();
        const storageRef = ref(storage, `global_recommended_videos/${videoId}`);

        await uploadBytes(storageRef, videoFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        setUploadedVideoUrl(downloadURL);

        toast({
            title: 'Upload Successful',
            description: `Video is now ready to be pushed to all users.`,
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

  const handlePushToAll = async () => {
    if (!uploadedVideoUrl) {
      toast({
        title: 'Push Failed',
        description: 'No video has been uploaded to push.',
        variant: 'destructive',
      });
      return;
    }

    setIsPushing(true);

    try {
      const batch = writeBatch(firestore);
      users.forEach(user => {
        const userDocRef = doc(firestore, 'users', user.id);
        batch.update(userDocRef, { recommendedVideoUrl: uploadedVideoUrl });
      });
      await batch.commit();

      toast({
        title: 'Push Successful!',
        description: 'The video has been assigned to all users.',
      });
      setUploadedVideoUrl(null); // Clear after successful push

    } catch (error) {
      console.error('Error pushing video to all users:', error);
      toast({
        title: 'Push Error',
        description: 'There was a problem pushing the video to users.',
        variant: 'destructive',
      });
    } finally {
      setIsPushing(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Recommended Video</CardTitle>
          <CardDescription>Upload a video once and push it to all users' dashboards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2 rounded-md border p-4">
              <h4 className="font-medium">Step 1: Upload Video</h4>
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
           </div>
           {uploadedVideoUrl && (
             <div className="space-y-3 rounded-md border p-4">
                <h4 className="font-medium">Step 2: Push to Users</h4>
                <p className="text-sm text-muted-foreground">The following video is uploaded and ready to be sent:</p>
                <a href={uploadedVideoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">
                  {uploadedVideoUrl}
                </a>
                <Button onClick={handlePushToAll} disabled={isPushing} className="w-full sm:w-auto">
                    {isPushing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isPushing ? 'Pushing...' : 'Push to All Users'}
                </Button>
             </div>
           )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>View User Progress</CardTitle>
            <CardDescription>Select a user to view their meditation data and personal details.</CardDescription>
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

      {selectedUserId && (sessionsLoading || !selectedUser) && (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {selectedUser && !sessionsLoading && (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>Personal and contact information for {selectedUser.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                            <dd className="mt-1 text-sm font-semibold">{selectedUser.name}</dd>
                        </div>
                         <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                            <dd className="mt-1 text-sm font-semibold">{selectedUser.email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-muted-foreground">Mobile Number</dt>
                            <dd className="mt-1 text-sm font-semibold">{selectedUser.mobileNumber || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-muted-foreground">Age</dt>
                            <dd className="mt-1 text-sm font-semibold">{selectedUser.age || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-muted-foreground">Profession</dt>
                            <dd className="mt-1 text-sm font-semibold">{selectedUser.profession || 'N/A'}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <MeditationChart 
                sessions={selectedUserSessions || []} 
                title={`${selectedUser.name}'s Progress`}
                description={`Meditation data for ${selectedUser.email}.`}
            />
        </div>
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
