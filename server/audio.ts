import { Readable } from "stream";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });

/**
 * Transcribes audio data using OpenAI's Whisper API
 * @param audioBuffer - Buffer containing audio data
 * @returns Transcription text
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a readable stream from the buffer
    const stream = new Readable();
    stream.push(audioBuffer);
    stream.push(null);
    
    // Convert the buffer to a Blob-like object that OpenAI's API can handle
    const fileObj = {
      name: `recording-${Date.now()}.webm`,
      data: stream,
      type: "audio/webm"
    };

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fileObj as any,
      model: "whisper-1",
      response_format: "text",
      language: "en"
    });

    return transcription.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}
