import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LiveEvent, Video } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, FileText } from "lucide-react";
import { YouTubePreview } from "@/components/ui/youtube-embed";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { format } from "date-fns";

export default function HomePage() {
  const [location, navigate] = useLocation();

  // Fetch live event
  const { data: liveEvent, isLoading: isLoadingLiveEvent } = useQuery<LiveEvent>({
    queryKey: ["/api/live-events"],
  });

  // Fetch on-demand videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Format event date
  const formatEventDate = (date: Date) => {
    return format(new Date(date), "EEEE, h:mm a");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Harker</h1>
          <p className="text-xl max-w-3xl mx-auto">
            A video streaming platform designed for senior communities to watch, learn, and discuss together.
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
                  <div className="text-white text-center">
                    <svg className="mx-auto h-16 w-16 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM10.622 8.415a.4.4 0 01.589-.354l5.6 3.231a.4.4 0 010 .707l-5.6 3.231a.4.4 0 01-.589-.354V8.415z"></path>
                    </svg>
                    <p className="text-2xl font-semibold">{liveEvent.title}</p>
                    <p className="text-xl mt-2">Starting {formatEventDate(liveEvent.eventDate)}</p>
                  </div>
                </div>
              </div>
              
              {/* Video Information */}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">{liveEvent.title}</h3>
                <p className="text-xl mb-6">
                  {liveEvent.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default" size="lg" className="flex items-center">
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    Set Reminder
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center border-2 border-primary text-primary">
                    <FileText className="mr-2 h-5 w-5" />
                    View Discussion Guide
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos && videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videos.map((video) => (
                <YouTubePreview
                  key={video.id}
                  videoId={video.youtubeUrl}
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  onClick={() => navigate(`/video/${video.id}`)}
                />
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
    </div>
  );
}
