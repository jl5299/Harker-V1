import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { AudioVisualizer } from './audio-visualizer';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  className?: string;
}

export function AudioRecorder({ onTranscriptionComplete, className = '' }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Stop and cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create new MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Reset timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        // Process the audio
        processAudio(audioBlob);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Send to server for transcription
        try {
          const response = await apiRequest('POST', '/api/transcribe', { audio: base64data });
          const data = await response.json();
          
          // Call callback with transcription
          onTranscriptionComplete(data.transcription);
          
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: 'Transcription Failed',
            description: 'Could not process audio recording.',
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      toast({
        title: 'Processing Error',
        description: 'Failed to process audio recording.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!isRecording && !isProcessing && (
        <div className="bg-gray-100 rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-xl mb-6 text-center">
            Click the button below to start recording your group's discussion. This will be transcribed and stored securely.
          </p>
          <Button 
            variant="default" 
            size="lg" 
            onClick={startRecording}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl py-4 px-8"
          >
            <Mic className="mr-2 h-5 w-5" /> Start Recording
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="animate-pulse bg-red-500 w-4 h-4 rounded-full mr-3"></div>
              <span className="text-xl font-semibold">Recording in progress</span>
            </div>
            <div className="text-xl" id="recording-timer">
              {formatTime(recordingTime)}
            </div>
          </div>
          
          <div className="mb-6 h-24 bg-white rounded-lg flex items-center justify-center p-4">
            <AudioVisualizer isRecording={isRecording} />
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="destructive" 
              size="lg" 
              onClick={stopRecording}
              className="text-white text-xl py-4 px-8"
            >
              <Square className="mr-2 h-5 w-5" /> Stop Recording
            </Button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-gray-100 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="mb-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <p className="text-xl text-center">
            Processing recording and generating transcription...<br />
            This may take a few moments.
          </p>
        </div>
      )}
    </div>
  );
}
