import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth-provider';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  youtubeUrl: string;
}

export function RSVPPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/live-events/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent({
          ...data,
          date: data.eventDate // Map eventDate to date for consistency
        });
      } catch (err) {
        setError('Failed to load event details');
      }
    };

    fetchEvent();
  }, [eventId, user, setLocation]);

  const handleRSVP = async () => {
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

      if (!activityResponse.ok) throw new Error('Failed to record RSVP');

      setShowSuccessDialog(true);
      // Redirect to activity page after 2 seconds
      setTimeout(() => {
        setLocation('/activity');
      }, 2000);
    } catch (err) {
      setError('Failed to RSVP');
    }
  };

  const formatEventDate = (date: string) => {
    return format(new Date(date), "EEEE, MMMM d, h:mm a");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">RSVP for Event</h1>
          
          {error ? (
            <Card className="p-6">
              <p className="text-red-500">{error}</p>
            </Card>
          ) : event ? (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <p className="text-lg mb-6">
                <span className="font-semibold">Date:</span> {formatEventDate(event.date)}
              </p>
              
              <Button 
                onClick={handleRSVP}
                className="w-full"
              >
                Confirm RSVP
              </Button>
            </Card>
          ) : (
            <Card className="p-6">
              <p className="text-gray-600">Loading event details...</p>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSVP Confirmed!</DialogTitle>
            <DialogDescription>
              You're all set to attend this event. Redirecting to your activity page...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
} 