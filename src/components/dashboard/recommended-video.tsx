'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Film } from "lucide-react";

interface RecommendedVideoProps {
    videoUrl: string;
}

export function RecommendedVideo({ videoUrl }: RecommendedVideoProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Film className="h-6 w-6 text-primary" />
                    <CardTitle>A Message For You</CardTitle>
                </div>
                <CardDescription>Your guide has sent you a special video message.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                     <video
                        src={videoUrl}
                        controls
                        className="h-full w-full object-cover"
                        preload="metadata"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </CardContent>
        </Card>
    );
}
