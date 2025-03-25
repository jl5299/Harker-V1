import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { Video } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/lib/auth-provider";
import ReactMarkdown from 'react-markdown';

export default function VideoPage() {
  const [, params] = useRoute<{ id: string }>("/video/:id");
  const [, navigate] = useLocation();
  const videoId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();

  // Fetch video details
  const { data: video, isLoading, error } = useQuery<Video>({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-6 py-8 flex-grow">
          <div className="flex items-center justify-center h-96">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-6 py-8 flex-grow">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Video</h2>
            <p className="mb-6">The requested video could not be found or there was an error loading it.</p>
            <Button onClick={() => navigate("/")} variant="default">
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center text-lg font-semibold mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Videos
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
              <YouTubeEmbed videoId={video.youtubeUrl} title={video.title} />
              
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
                <p className="text-lg mb-4">{video.description}</p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => navigate(`/discussion/${video.id}`)}
                    variant="default" 
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" /> Start Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Discussion Guide */}
          <div>
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold">Discussion Guide</h3>
              </div>
              <div className="p-6 overflow-y-auto max-h-[600px]">
                <div className="prose max-w-none">
                  <ReactMarkdown>
                    {video.discussionGuide}
                  </ReactMarkdown>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
