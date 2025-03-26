import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Bell } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

// Local interface to replace the imported one
interface LiveEvent {
  id: number;
  title: string;
  description: string;
  eventDate: Date;
  youtubeUrl?: string;
  imageUrl?: string;
}

async function fetchLatestLiveEvent() {
  const response = await fetch('/api/live-events');
  if (!response.ok) {
    throw new Error('Failed to fetch latest live event');
  }
  return response.json();
}

export default function LiveEventsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showRSVPDialog, setShowRSVPDialog] = useState(false);
  const [, setError] = useState<string | null>(null);

  const { data: liveEvent, isLoading } = useQuery<LiveEvent>({
    queryKey: ["/api/live-events"],
    queryFn: fetchLatestLiveEvent
  });

  const formatEventDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, h:mm a");
  };

  const handleSetReminder = async (eventId: number) => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    try {
      const activityResponse = await fetch('/api/user-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
          eventType: 'live',
          activityType: 'reminder'
        }),
      });

      if (!activityResponse.ok) throw new Error('Failed to set reminder');

      setShowReminderDialog(true);
    } catch (err) {
      setError('Failed to set reminder');
    }
  };

  const handleRSVP = async (eventId: number) => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    try {
      const activityResponse = await fetch('/api/user-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
          eventType: 'live',
          activityType: 'rsvp'
        }),
      });

      if (!activityResponse.ok) throw new Error('Failed to RSVP');

      setShowRSVPDialog(true);
    } catch (err) {
      setError('Failed to RSVP');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Live Events</h1>
          
          {isLoading ? (
            <Card className="w-full h-[600px] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : liveEvent ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Player Placeholder */}
              <Card className="bg-black rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-semibold mb-4">Live Stream Coming Soon</div>
                    <div className="text-xl text-gray-300">
                      {formatEventDate(liveEvent.eventDate)}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Event Information */}
              <Card className="bg-white rounded-xl shadow-lg">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex-grow">
                    <h2 className="text-3xl font-bold mb-4">{liveEvent.title}</h2>
                    <p className="text-xl text-gray-600">
                      {liveEvent.description}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button 
                      variant="default" 
                      size="lg" 
                      className="flex items-center"
                      onClick={() => handleSetReminder(liveEvent.id)}
                    >
                      <Bell className="mr-2 h-5 w-5" />
                      Set Reminder
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="flex items-center border-2 border-primary text-primary"
                      onClick={() => handleRSVP(liveEvent.id)}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      RSVP
                    </Button>
                  </div>

                  <div className="mt-8 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full w-fit">
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
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-xl">No upcoming live events at this time.</p>
            </Card>
          )}
        </div>
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
          <DialogFooter>
            <Button onClick={() => setShowReminderDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRSVPDialog} onOpenChange={setShowRSVPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSVP Confirmed!</DialogTitle>
            <DialogDescription>
              You're all set for the event.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setShowRSVPDialog(false);
              setLocation('/activity');
            }}>View Your Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 