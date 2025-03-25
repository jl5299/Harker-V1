import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { insertLiveEventSchema, insertVideoSchema, LiveEvent, Video, Discussion } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Edit, Trash, Eye, Download } from "lucide-react";
import { format } from "date-fns";

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("live-events-tab");
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);

  // Fetch live event
  const { data: liveEvent, isLoading: loadingLiveEvent } = useQuery<LiveEvent>({
    queryKey: ["/api/live-events"],
  });

  // Fetch all videos
  const { data: videos, isLoading: loadingVideos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  // Fetch all discussions
  const { data: discussions, isLoading: loadingDiscussions } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });

  // ======== Live Event Form ========
  const liveEventForm = useForm<z.infer<typeof insertLiveEventSchema>>({
    resolver: zodResolver(insertLiveEventSchema),
    defaultValues: {
      title: liveEvent?.title || "",
      description: liveEvent?.description || "",
      youtubeUrl: liveEvent?.youtubeUrl || "",
      eventDate: liveEvent?.eventDate ? new Date(liveEvent.eventDate) : new Date(),
      discussionGuide: liveEvent?.discussionGuide || "",
    },
  });

  // Update form when liveEvent data is loaded
  useState(() => {
    if (liveEvent) {
      liveEventForm.reset({
        title: liveEvent.title,
        description: liveEvent.description,
        youtubeUrl: liveEvent.youtubeUrl,
        eventDate: new Date(liveEvent.eventDate),
        discussionGuide: liveEvent.discussionGuide,
      });
    }
  });

  // Live Event update mutation
  const updateLiveEventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertLiveEventSchema>) => {
      if (liveEvent?.id) {
        const res = await apiRequest("PUT", `/api/live-events/${liveEvent.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/live-events", data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Live event has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/live-events"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update live event. " + error.message,
        variant: "destructive",
      });
    },
  });

  const onLiveEventSubmit = (data: z.infer<typeof insertLiveEventSchema>) => {
    updateLiveEventMutation.mutate(data);
  };

  // ======== Video Form ========
  const videoForm = useForm<z.infer<typeof insertVideoSchema>>({
    resolver: zodResolver(insertVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeUrl: "",
      duration: 0,
      thumbnailUrl: "",
      discussionGuide: "",
      active: true,
    },
  });

  // Video create/update mutation
  const videoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertVideoSchema>) => {
      if (editingVideoId) {
        const res = await apiRequest("PUT", `/api/videos/${editingVideoId}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/videos", data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingVideoId ? "Video has been updated." : "New video has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      videoForm.reset();
      setEditingVideoId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save video. " + error.message,
        variant: "destructive",
      });
    },
  });

  // Video delete mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/videos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete video. " + error.message,
        variant: "destructive",
      });
    },
  });

  // Discussion delete mutation
  const deleteDiscussionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/discussions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Discussion has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete discussion. " + error.message,
        variant: "destructive",
      });
    },
  });

  const onVideoSubmit = (data: z.infer<typeof insertVideoSchema>) => {
    videoMutation.mutate(data);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideoId(video.id);
    videoForm.reset({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      duration: video.duration || 0,
      thumbnailUrl: video.thumbnailUrl || "",
      discussionGuide: video.discussionGuide,
      active: video.active,
    });
    setActiveTab("on-demand-tab");
  };

  const handleDeleteVideo = (id: number) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      deleteVideoMutation.mutate(id);
    }
  };

  const handleDeleteDiscussion = (id: number) => {
    if (window.confirm("Are you sure you want to delete this discussion?")) {
      deleteDiscussionMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 flex-grow">
        <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="text-2xl font-bold">Admin Controls</CardTitle>
            <p className="mt-2">Manage videos, livestreams, and discussion guides</p>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <ul className="flex -mb-px">
                <li className="mr-2">
                  <button 
                    className={`inline-block py-3 px-4 text-xl font-medium ${activeTab === "live-events-tab" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("live-events-tab")}
                  >
                    Live Events
                  </button>
                </li>
                <li className="mr-2">
                  <button 
                    className={`inline-block py-3 px-4 text-xl font-medium ${activeTab === "on-demand-tab" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("on-demand-tab")}
                  >
                    On-Demand Videos
                  </button>
                </li>
                <li>
                  <button 
                    className={`inline-block py-3 px-4 text-xl font-medium ${activeTab === "discussions-tab" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("discussions-tab")}
                  >
                    Discussions
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Live Events Tab Content */}
            <div className={activeTab === "live-events-tab" ? "" : "hidden"}>
              <h3 className="text-xl font-semibold mb-6">Update Live Event</h3>
              
              <Form {...liveEventForm}>
                <form onSubmit={liveEventForm.handleSubmit(onLiveEventSubmit)} className="space-y-6">
                  <FormField
                    control={liveEventForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={liveEventForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Event Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter event description" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={liveEventForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">YouTube Live Stream URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter YouTube video ID (e.g. dQw4w9WgXcQ)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={liveEventForm.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Event Date & Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                            onChange={e => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={liveEventForm.control}
                    name="discussionGuide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Discussion Guide</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter discussion questions and additional information..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={updateLiveEventMutation.isPending}
                    >
                      {updateLiveEventMutation.isPending ? "Updating..." : "Update Live Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            
            {/* On-Demand Videos Tab Content */}
            <div className={activeTab === "on-demand-tab" ? "" : "hidden"}>
              <h3 className="text-xl font-semibold mb-6">Manage On-Demand Videos</h3>
              
              <div className="space-y-6 mb-8">
                {loadingVideos ? (
                  <div className="py-8 text-center">Loading videos...</div>
                ) : videos && videos.length > 0 ? (
                  videos.map((video) => (
                    <div key={video.id} className="border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex flex-wrap justify-between mb-4">
                        <h4 className="text-xl font-bold">{video.title}</h4>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditVideo(video)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-lg mb-4">
                        YouTube URL: {video.youtubeUrl}
                      </p>
                      <p className="text-lg mb-4 text-gray-600">
                        {video.description.substring(0, 100)}...
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">No videos available.</div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-6">
                {editingVideoId ? "Edit Video" : "Add New Video"}
              </h3>
              
              <Form {...videoForm}>
                <form onSubmit={videoForm.handleSubmit(onVideoSubmit)} className="space-y-6">
                  <FormField
                    control={videoForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Video Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter video title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={videoForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Video Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter video description"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={videoForm.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">YouTube Video URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter YouTube video ID (e.g. dQw4w9WgXcQ)" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={videoForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="Enter duration in minutes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={videoForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 space-y-0 py-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-5 w-5"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-lg font-normal">Active (visible to users)</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={videoForm.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Custom Thumbnail URL (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter custom thumbnail URL (leave empty to use YouTube default)" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={videoForm.control}
                    name="discussionGuide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Discussion Guide</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter discussion questions and additional information..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    {editingVideoId && (
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingVideoId(null);
                          videoForm.reset({
                            title: "",
                            description: "",
                            youtubeUrl: "",
                            duration: 0,
                            thumbnailUrl: "",
                            discussionGuide: "",
                            active: true,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit"
                      disabled={videoMutation.isPending}
                    >
                      {videoMutation.isPending 
                        ? "Saving..." 
                        : editingVideoId ? "Update Video" : "Add New Video"
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            
            {/* Discussions Tab Content */}
            <div className={activeTab === "discussions-tab" ? "" : "hidden"}>
              <h3 className="text-xl font-semibold mb-6">Manage Recorded Discussions</h3>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Discussion Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingDiscussions ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading discussions...
                        </TableCell>
                      </TableRow>
                    ) : discussions && discussions.length > 0 ? (
                      discussions.map((discussion) => (
                        <TableRow key={discussion.id} className="hover:bg-gray-50">
                          <TableCell className="py-4 text-lg">{discussion.title}</TableCell>
                          <TableCell className="py-4 text-lg">{format(new Date(discussion.date), "PP")}</TableCell>
                          <TableCell className="py-4 text-lg">{discussion.participants}</TableCell>
                          <TableCell className="py-4 text-lg">
                            <div className="flex space-x-3">
                              <button className="text-primary hover:text-blue-700">
                                <Eye className="h-5 w-5" />
                              </button>
                              <button className="text-primary hover:text-blue-700">
                                <Download className="h-5 w-5" />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteDiscussion(discussion.id)}
                              >
                                <Trash className="h-5 w-5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No discussions available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6">Research Access</h3>
                <p className="text-lg mb-6">
                  Manage access to discussion transcriptions for research purposes. All data is stored in compliance with HIPAA regulations.
                </p>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium mb-2">Researcher Email</label>
                    <Input 
                      type="email" 
                      placeholder="researcher@institution.edu"
                      className="max-w-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-2">Access Level</label>
                    <select className="w-full max-w-lg px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none text-lg">
                      <option>Read Only - Anonymized</option>
                      <option>Read Only - Full Data</option>
                      <option>Download - Anonymized</option>
                      <option>Download - Full Data</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-2">Access Duration</label>
                    <select className="w-full max-w-lg px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary focus:outline-none text-lg">
                      <option>30 Days</option>
                      <option>90 Days</option>
                      <option>6 Months</option>
                      <option>1 Year</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Grant Access
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
