import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Download, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Video, InsertDiscussion } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

export default function DiscussionPage() {
  const [, params] = useRoute<{ id: string }>("/discussion/:id");
  const [, navigate] = useLocation();
  const videoId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [participants, setParticipants] = useState(0);
  const [questionsList, setQuestionsList] = useState<string[]>([]);

  // Fetch video details
  const { data: video, isLoading } = useQuery<Video>({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });

  // Parse discussion guide to extract questions when video data is loaded
  useEffect(() => {
    if (video && video.discussionGuide) {
      // Extract questions from the discussion guide
      const lines = video.discussionGuide.split('\n');
      const questions: string[] = [];
      
      for (const line of lines) {
        // Look for numbered questions (e.g., "1. What ecosystem...")
        if (/^\d+\.\s+.+\?$/.test(line.trim())) {
          questions.push(line.trim());
        }
      }
      
      setQuestionsList(questions);
    }
  }, [video]);

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async (data: InsertDiscussion) => {
      const res = await apiRequest("POST", "/api/discussions", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Discussion Saved",
        description: "Your discussion has been recorded and transcribed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Discussion",
        description: "There was a problem saving your discussion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTranscriptionComplete = (transcription: string) => {
    setTranscription(transcription);
  };

  const handleSaveDiscussion = () => {
    if (!video || !transcription) return;
    
    createDiscussionMutation.mutate({
      title: video.title,
      videoId: video.id,
      date: new Date(),
      participants: participants || 0,
      duration: 0, // We would calculate this from the recording if we had actual duration
      transcription: transcription,
      audioUrl: "", // In a real implementation, we would store the audio file
    });
  };

  const handleDownloadTranscription = () => {
    if (!transcription) return;
    
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `discussion-${video?.title.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNewRecording = () => {
    setTranscription(null);
  };

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

  if (!video) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-6 py-8 flex-grow">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Video Not Found</h2>
            <p className="mb-6">The requested video could not be found.</p>
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
          onClick={() => navigate(`/video/${video.id}`)} 
          className="flex items-center text-lg font-semibold mb-6 hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Video
        </button>
        
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Group Discussion</h2>
            <p className="text-xl mb-8">
              Use this space to record and transcribe your community's discussion about the video.
            </p>
            
            {/* Discussion Guide Container */}
            <div className="mb-8 border-l-4 border-primary pl-6 py-2">
              <h3 className="text-2xl font-semibold mb-3">Current Discussion Topic</h3>
              <p className="text-xl mb-2">
                {questionsList.length > 0 
                  ? questionsList[currentQuestion] 
                  : "No discussion questions available."}
              </p>
              {questionsList.length > 0 && (
                <div className="flex mt-4">
                  <button 
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className={`text-gray-600 hover:text-gray-800 mr-4 ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowLeft className="inline mr-1 h-4 w-4" /> Previous
                  </button>
                  <button 
                    onClick={() => setCurrentQuestion(prev => Math.min(questionsList.length - 1, prev + 1))}
                    disabled={currentQuestion === questionsList.length - 1}
                    className={`text-primary hover:text-blue-700 ${currentQuestion === questionsList.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next <ArrowRight className="inline ml-1 h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Number of Participants</label>
              <input
                type="number"
                min="0"
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value) || 0)}
                className="w-full max-w-xs px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none text-lg"
              />
            </div>
            
            {/* Recording Controls */}
            {!transcription ? (
              <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
            ) : (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Discussion Transcription</h3>
                <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-lg">
                    {transcription}
                  </pre>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button 
                    onClick={handleSaveDiscussion}
                    disabled={createDiscussionMutation.isPending}
                    variant="default"
                    className="text-white"
                  >
                    {createDiscussionMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>Save Discussion</>
                    )}
                  </Button>
                  <Button 
                    onClick={handleDownloadTranscription}
                    variant="outline"
                    className="border-2 border-primary text-primary"
                  >
                    <Download className="mr-2 h-5 w-5" /> Download Transcription
                  </Button>
                  <Button 
                    onClick={handleNewRecording}
                    variant="outline"
                    className="border-2 border-gray-300"
                  >
                    <Mic className="mr-2 h-5 w-5" /> New Recording
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
