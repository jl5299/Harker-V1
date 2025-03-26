import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CalendarIcon } from "lucide-react";
import { YouTubePreview } from "@/components/ui/youtube-embed";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";

// Define types that were imported from @shared/schema
interface LiveEvent {
  id: number;
  title: string;
  description: string;
  eventDate: Date;
  youtubeUrl?: string;
  imageUrl?: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  duration?: number;
  createdAt?: Date;
  thumbnailUrl?: string;
}

async function fetchLatestLiveEvent() {
  const response = await fetch('/api/live-events');
  if (!response.ok) {
    throw new Error('Failed to fetch latest live event');
  }
  return response.json();
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [, setReminderError] = useState<string | null>(null);

  // Fetch live event
  const { data: liveEvent, isLoading: isLoadingLiveEvent } = useQuery<LiveEvent>({
    queryKey: ["/api/live-events"],
    queryFn: fetchLatestLiveEvent
  });

  // Fetch on-demand videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Format event date
  const formatEventDate = (date: Date) => {
    return format(new Date(date), "EEEE, h:mm a");
  };

  const handleSetReminder = async (eventId: number) => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    try {
      // Record reminder activity
      const activityResponse = await fetch('/api/user-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventType: 'live',
          activityType: 'reminder'
        }),
      });

      if (!activityResponse.ok) throw new Error('Failed to set reminder');

      setShowReminderDialog(true);
      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowReminderDialog(false);
      }, 2000);
    } catch (err) {
      setReminderError('Failed to set reminder');
    }
  };

  const handleRSVP = async (eventId: number) => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    try {
      // Record RSVP activity
      const activityResponse = await fetch('/api/user-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventType: 'live',
          activityType: 'rsvp'
        }),
      });

      if (!activityResponse.ok) throw new Error('Failed to RSVP');

      setLocation('/activity');
    } catch (err) {
      setReminderError('Failed to RSVP');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Harker</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Gathering the community together to learn, grow, and connect
          </p>
        </section>

        {/* Live Events Section */}
        <section id="live-events" className="mb-16">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="text-3xl font-bold">This Week's Live Event</h2>
            {liveEvent && (
              <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-xl font-semibold">
                <CalendarIcon className="inline-block mr-2 h-5 w-5" />
                {formatEventDate(liveEvent.eventDate)}
              </div>
            )}
          </div>
          
          {isLoadingLiveEvent ? (
            <Card className="w-full h-96 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : liveEvent ? (
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              {/* Video Player */}
              <div className="aspect-w-16 aspect-h-9 bg-black relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-20 w-20 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM10.622 8.415a.4.4 0 01.589-.354l5.6 3.231a.4.4 0 010 .707l-5.6 3.231a.4.4 0 01-.589-.354V8.415z"></path>
                  </svg>
                </div>
              </div>
              
              {/* Video Information */}
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{liveEvent.title}</h3>
                    <p className="text-xl">
                      {liveEvent.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                        +1734
                      </div>
                    </div>
                    <span className="text-gray-600">attending</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="flex items-center"
                    onClick={() => {
                      if (liveEvent && typeof liveEvent.id === 'number') {
                        handleSetReminder(liveEvent.id);
                      }
                    }}
                    disabled={!liveEvent || typeof liveEvent.id !== 'number'}
                  >
                    <Bell className="mr-2 h-5 w-5" />
                    Set Reminder
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex items-center border-2 border-primary text-primary"
                    onClick={() => {
                      if (liveEvent && typeof liveEvent.id === 'number') {
                        handleRSVP(liveEvent.id);
                      }
                    }}
                    disabled={!liveEvent || typeof liveEvent.id !== 'number'}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    RSVP
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-xl">No upcoming live events at this time.</p>
            </Card>
          )}
        </section>

        {/* On-Demand Videos Section */}
        <section id="on-demand" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">On-Demand Videos</h2>
          
          {isLoadingVideos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-96">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : videos && videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <YouTubePreview 
                    videoId={video.youtubeUrl} 
                    title={video.title}
                    description={video.description}
                    duration={video.duration ?? undefined}
                    onClick={() => {
                      if (video.id) {
                        setLocation(`/video/${video.id}`);
                      }
                    }}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-xl">No on-demand videos available.</p>
            </Card>
          )}
        </section>
      </main>

      <Footer />

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reminder Set!</DialogTitle>
            <DialogDescription>
              You'll be notified when the event starts.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
