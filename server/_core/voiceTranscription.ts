/**
 * Voice transcription using Google Speech-to-Text API
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage (e.g., S3) to get URL
 * 3. Call transcription with the URL
 * 
 * Example usage:
 * ```tsx
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *   }
 * });
 * 
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 * });
 * ```
 */
import { ENV } from "./env";

export type TranscribeOptions = {
  audioUrl: string; // URL to the audio file (e.g., S3 URL)
  language?: string; // Optional: specify language code (e.g., "en-US", "es-ES")
  prompt?: string; // Optional: context for better transcription
};

export type TranscriptionSegment = {
  text: string;
  start: number;
  end: number;
  confidence: number;
};

export type TranscriptionResponse = {
  text: string;
  language: string;
  confidence: number;
  segments?: TranscriptionSegment[];
};

export type TranscriptionError = {
  error: string;
  code: "FILE_TOO_LARGE" | "INVALID_FORMAT" | "TRANSCRIPTION_FAILED" | "SERVICE_ERROR";
  details?: string;
};

/**
 * Transcribe audio using Google Speech-to-Text API
 * Supports multiple audio formats and languages
 */
export async function transcribeAudio(
  options: TranscribeOptions
): Promise<TranscriptionResponse | TranscriptionError> {
  if (!ENV.geminiApiKey) {
    return {
      error: "Voice transcription service is not configured",
      code: "SERVICE_ERROR",
      details: "GEMINI_API_KEY is not set"
    };
  }

  try {
    // Step 1: Download audio from URL
    const audioResponse = await fetch(options.audioUrl);
    if (!audioResponse.ok) {
      return {
        error: "Failed to download audio file",
        code: "INVALID_FORMAT",
        details: `HTTP ${audioResponse.status}: ${audioResponse.statusText}`
      };
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const mimeType = audioResponse.headers.get('content-type') || 'audio/mpeg';

    // Check file size (10MB limit for Google Speech-to-Text)
    const sizeMB = audioBuffer.length / (1024 * 1024);
    if (sizeMB > 10) {
      return {
        error: "Audio file exceeds maximum size limit",
        code: "FILE_TOO_LARGE",
        details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 10MB`
      };
    }

    // Step 2: Convert audio to base64
    const audioContent = audioBuffer.toString('base64');

    // Step 3: Determine language code
    const languageCode = options.language || "en-US";

    // Step 4: Call Google Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${ENV.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: getAudioEncoding(mimeType),
            sampleRateHertz: 16000, // Standard sample rate
            languageCode: languageCode,
            enableAutomaticPunctuation: true,
            enableWordTimeOffsets: true,
            model: "latest_long", // Use latest long-form model
            useEnhanced: true,
          },
          audio: {
            content: audioContent,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}: ${errorText}`
      };
    }

    const result = await response.json();

    // Step 5: Parse response
    if (!result.results || result.results.length === 0) {
      return {
        error: "No transcription results",
        code: "TRANSCRIPTION_FAILED",
        details: "Audio may be too short or unclear"
      };
    }

    // Combine all transcription alternatives
    const transcripts = result.results.map((r: any) =>
      r.alternatives[0]?.transcript || ""
    );
    const fullText = transcripts.join(" ");

    // Extract segments with timestamps
    const segments: TranscriptionSegment[] = [];
    result.results.forEach((r: any) => {
      const alternative = r.alternatives[0];
      if (alternative?.words) {
        alternative.words.forEach((word: any) => {
          segments.push({
            text: word.word,
            start: parseFloat(word.startTime?.seconds || 0),
            end: parseFloat(word.endTime?.seconds || 0),
            confidence: word.confidence || 0,
          });
        });
      }
    });

    // Calculate average confidence
    const avgConfidence = result.results.reduce(
      (sum: number, r: any) => sum + (r.alternatives[0]?.confidence || 0),
      0
    ) / result.results.length;

    return {
      text: fullText,
      language: languageCode,
      confidence: avgConfidence,
      segments: segments.length > 0 ? segments : undefined,
    };

  } catch (error) {
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

/**
 * Helper function to determine audio encoding from MIME type
 */
function getAudioEncoding(mimeType: string): string {
  const encodingMap: Record<string, string> = {
    'audio/webm': 'WEBM_OPUS',
    'audio/mp3': 'MP3',
    'audio/mpeg': 'MP3',
    'audio/wav': 'LINEAR16',
    'audio/wave': 'LINEAR16',
    'audio/ogg': 'OGG_OPUS',
    'audio/flac': 'FLAC',
    'audio/amr': 'AMR',
  };

  return encodingMap[mimeType] || 'LINEAR16';
}

/**
 * Example tRPC procedure implementation:
 * 
 * ```ts
 * // In server/routers.ts
 * import { transcribeAudio } from "./_core/voiceTranscription";
 * 
 * export const voiceRouter = router({
 *   transcribe: protectedProcedure
 *     .input(z.object({
 *       audioUrl: z.string(),
 *       language: z.string().optional(),
 *     }))
 *     .mutation(async ({ input, ctx }) => {
 *       const result = await transcribeAudio(input);
 *       
 *       if ('error' in result) {
 *         throw new TRPCError({
 *           code: 'BAD_REQUEST',
 *           message: result.error,
 *           cause: result,
 *         });
 *       }
 *       
 *       return result;
 *     }),
 * });
 * ```
 */
