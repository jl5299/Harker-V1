import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Search, ArrowRight } from "lucide-react";
import { format } from "date-fns";

// Define types that were imported from @shared/schema
interface Discussion {
  id: number;
  title: string;
  transcription: string;
  date: string | Date;
  videoId: number;
  participants: number;
}

interface Video {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  duration?: number;
}

export default function DiscussionsPage() {
  const [] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [videoFilter, setVideoFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fetch all discussions
  const { data: discussions, isLoading: loadingDiscussions } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });

  // Fetch all videos for filter dropdown
  const { data: videos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Filter discussions based on search and filters
  const filteredDiscussions = discussions?.filter((discussion) => {
    // Filter by search term
    const matchesSearch = !searchTerm || 
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.transcription.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by video
    const matchesVideo = videoFilter === "all" || discussion.videoId === parseInt(videoFilter);
    
    // Filter by date
    let matchesDate = true;
    if (dateFilter !== "all") {
      const discussionDate = new Date(discussion.date);
      const now = new Date();
      if (dateFilter === "last-week") {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = discussionDate >= oneWeekAgo;
      } else if (dateFilter === "last-month") {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesDate = discussionDate >= oneMonthAgo;
      } else if (dateFilter === "last-3-months") {
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        matchesDate = discussionDate >= threeMonthsAgo;
      }
    }
    
    return matchesSearch && matchesVideo && matchesDate;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <h2 className="text-3xl font-bold mb-8">Previous Discussions</h2>
        
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="mb-8">
              <p className="text-xl">
                Access transcriptions from your community's previous discussions. These are stored securely in compliance with HIPAA regulations.
              </p>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-grow max-w-lg">
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Search discussions..." 
                    className="pl-10 pr-4 py-3 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                </div>
              </div>
              <Select value={videoFilter} onValueChange={setVideoFilter}>
                <SelectTrigger className="w-[220px] text-lg">
                  <SelectValue placeholder="All Videos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Videos</SelectItem>
                  {videos?.map((video) => (
                    <SelectItem key={video.id} value={video.id.toString()}>
                      {video.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px] text-lg">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Discussion List */}
            <div className="space-y-6">
              {loadingDiscussions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-lg">Loading discussions...</p>
                </div>
              ) : filteredDiscussions && filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((discussion) => (
                  <div 
                    key={discussion.id} 
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition-colors duration-200"
                  >
                    <div className="flex flex-wrap justify-between mb-4">
                      <h3 className="text-xl font-bold mb-2">{discussion.title}</h3>
                      <span className="text-gray-600">{format(new Date(discussion.date), "PP")}</span>
                    </div>
                    <p className="text-lg mb-4">
                      {discussion.participants > 0 
                        ? `Discussion with ${discussion.participants} participants.` 
                        : "Discussion transcription available."}
                    </p>
                    <div className="flex items-center mt-4">
                      <button 
                        onClick={() => {/* View transcription logic */}}
                        className="text-primary hover:text-blue-700 font-semibold text-lg flex items-center"
                      >
                        View Transcription <ArrowRight className="ml-2 h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg">No discussions found matching your criteria.</p>
                </div>
              )}
            </div>
            
            {/* Pagination - simplified for MVP */}
            {filteredDiscussions && filteredDiscussions.length > 0 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <Button variant="outline" className="rounded-l-md">
                    Previous
                  </Button>
                  <Button variant="outline" className="border-x-0 text-primary font-medium">
                    1
                  </Button>
                  <Button variant="outline" className="rounded-r-md">
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
