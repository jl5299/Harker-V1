import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Bell, Users } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface UserActivity {
  id: number;
  eventId: number;
  eventType: 'live' | 'video';
  activityType: 'rsvp' | 'reminder';
  createdAt: string;
  event?: {
    title: string;
    date?: string;
  };
}

export default function UserActivityPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/user-activities');
        if (!response.ok) throw new Error('Failed to fetch activities');
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, setLocation]);

  const activitiesForSelectedDate = activities.filter(activity => 
    selectedDate && activity.event?.date && isSameDay(parseISO(activity.event.date), selectedDate)
  );

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'rsvp':
        return <Users className="h-5 w-5" />;
      case 'reminder':
        return <Bell className="h-5 w-5" />;
      default:
        return <CalendarIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">Your Activity</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar View */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </Card>

          {/* Activities List */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Activities for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
            </h2>
            
            {loading ? (
              <p className="text-gray-600">Loading activities...</p>
            ) : activitiesForSelectedDate.length === 0 ? (
              <p className="text-gray-600">No activities for this date</p>
            ) : (
              <div className="space-y-4">
                {activitiesForSelectedDate.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border bg-white"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{activity.event?.title}</h3>
                      <p className="text-sm text-gray-600">
                        {activity.activityType === 'rsvp' ? 'RSVP\'d for' : 'Set reminder for'} this event
                      </p>
                      {activity.event?.date && (
                        <p className="text-sm text-gray-500 mt-1">
                          {format(parseISO(activity.event.date), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
} 