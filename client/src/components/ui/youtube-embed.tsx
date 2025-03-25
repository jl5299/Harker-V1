import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  autoplay?: boolean;
  className?: string;
}

export function YouTubeEmbed({
  videoId,
  title = "YouTube video player",
  aspectRatio = "16:9",
  autoplay = false,
  className = "",
}: YouTubeEmbedProps) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Calculate aspect ratio padding
  const aspectRatioPadding = (() => {
    switch (aspectRatio) {
      case "16:9":
        return "pb-[56.25%]";
      case "4:3":
        return "pb-[75%]";
      case "1:1":
        return "pb-[100%]";
      default:
        return "pb-[56.25%]";
    }
  })();

  useEffect(() => {
    // Reset loading state when videoId changes
    setLoading(true);
  }, [videoId]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative w-full ${aspectRatioPadding} bg-black rounded-md overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleIframeLoad}
      ></iframe>
    </div>
  );
}

interface YouTubePreviewProps {
  videoId: string;
  title: string;
  description?: string;
  duration?: number;
  onClick?: () => void;
  className?: string;
}

export function YouTubePreview({
  videoId,
  title,
  description,
  duration,
  onClick,
  className = "",
}: YouTubePreviewProps) {
  return (
    <Card className={`overflow-hidden hover:border-primary transition-colors cursor-pointer ${className}`} onClick={onClick}>
      <div className="relative aspect-video">
        <img 
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
          alt={title}
          className="object-cover w-full h-full"
          onError={(e) => {
            // Fallback to default thumbnail if HD thumbnail fails
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white bg-opacity-80 rounded-full p-4 hover:bg-opacity-100 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-primary">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {description && <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between">
          {duration && <span className="text-gray-600">{Math.floor(duration / 60)} minutes</span>}
          <button className="text-primary hover:text-blue-700 font-semibold flex items-center">
            View Details 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
