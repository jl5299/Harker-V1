import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { YouTubePreview } from "@/components/ui/youtube-embed";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

// Define Video interface to match Supabase table
interface Video {
  id: number;
  title: string;
  description: string | null;
  youtubeurl: string;
  duration: number | null;
  thumbnailurl: string | null;
  createdat: string;
  updatedat: string;
  ispublished: boolean;
  orderindex: number;
  category: string | null;
  tags: string[] | null;
}

export default function OnDemandPage() {
  const [, setLocation] = useLocation();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('on_demand_videos')
        .select('*')
        .eq('ispublished', true)
        .order('orderindex', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <h1 className="text-4xl font-bold mb-8">On-Demand Videos</h1>
        
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[400px]">
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
          <div className="space-y-8">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <YouTubePreview 
                  videoId={video.youtubeurl} 
                  title={video.title}
                  description={video.description ?? ''}
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
      </main>

      <Footer />
    </div>
  );
} 