/**
 * Image generation using Google Gemini Imagen
 * 
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 */
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

/**
 * Generate image using Google Gemini Imagen API
 * Uses Gemini's native image generation capabilities
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    // Use Gemini's Imagen API endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${ENV.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: options.prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini Imagen API failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();

    // Extract base64 image from response
    const base64Data = result.predictions[0].bytesBase64Encoded;
    const buffer = Buffer.from(base64Data, "base64");

    // Save to storage
    const { url } = await storagePut(
      `generated/${Date.now()}.png`,
      buffer,
      "image/png"
    );

    return { url };
  } catch (error) {
    console.error("[Gemini Imagen] Generation error:", error);
    throw new Error(
      `Image generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
