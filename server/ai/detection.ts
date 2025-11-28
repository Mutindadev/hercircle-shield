import { invokeGemini, invokeOpenAI } from "../_core/llm";

export interface DetectionResult {
  isHarmful: boolean;
  detectionType: string[];
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  explanation: string;
  aiModel: string;
}

const DETECTION_SYSTEM_PROMPT = `You are an AI safety assistant specialized in detecting gender-based violence (GBV) and online harassment targeting women, particularly in African contexts.

Analyze the provided content for the following types of harmful behavior:
1. Harassment and cyberbullying
2. African language GBV slang and coded language
3. Coercion and gaslighting
4. Financial control and economic abuse
5. Doxxing (sharing personal information: ID numbers, phone numbers, addresses, locations)
6. Deepfake indicators and manipulated media references
7. Audio spoofing mentions
8. Stalking and surveillance patterns
9. Threats and intimidation
10. Sexual harassment and NCII (non-consensual intimate images)

Consider cultural context, local slang, and indirect language patterns common in African communities.

Respond with a JSON object:
{
  "isHarmful": boolean,
  "detectionType": string[], // array of detected types
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": number, // 0-100
  "explanation": string // brief explanation
}`;

export async function detectWithGemini(textContent: string): Promise<DetectionResult> {
  try {
    const response = await invokeGemini({
      messages: [
        { role: "system", content: DETECTION_SYSTEM_PROMPT },
        {
          role: "user", content: `Analyze this content:

${textContent}`
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "detection_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isHarmful: { type: "boolean" },
              detectionType: {
                type: "array",
                items: { type: "string" },
              },
              severity: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
              },
              confidence: { type: "number" },
              explanation: { type: "string" },
            },
            required: ["isHarmful", "detectionType", "severity", "confidence", "explanation"],
            additionalProperties: false,
          },
        },
      },
    });

    const responseContent = response.choices[0].message.content;
    const result = JSON.parse(typeof responseContent === "string" ? responseContent : JSON.stringify(responseContent));
    return {
      ...result,
      aiModel: "gemini-2.0-flash-exp",
    };
  } catch (error) {
    console.error("Gemini detection error:", error);
    throw error;
  }
}

export async function detectWithOpenAI(textContent: string): Promise<DetectionResult> {
  try {
    // Use OpenAI with latest model
    const response = await invokeOpenAI({
      messages: [
        { role: "system", content: DETECTION_SYSTEM_PROMPT },
        { role: "user", content: `Analyze this content:\n\n${textContent}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "detection_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isHarmful: { type: "boolean" },
              detectionType: {
                type: "array",
                items: { type: "string" },
              },
              severity: {
                type: "string",
                enum: ["low", "medium", "high", "critical"],
              },
              confidence: { type: "number" },
              explanation: { type: "string" },
            },
            required: ["isHarmful", "detectionType", "severity", "confidence", "explanation"],
            additionalProperties: false,
          },
        },
      },
    });

    const responseContent = response.choices[0].message.content;
    const result = JSON.parse(typeof responseContent === "string" ? responseContent : JSON.stringify(responseContent));
    return {
      ...result,
      aiModel: "gpt-4o",
    };
  } catch (error) {
    console.error("OpenAI detection error:", error);
    throw error;
  }
}

export async function detectContent(content: string): Promise<DetectionResult> {
  try {
    // Try Gemini first (primary)
    return await detectWithGemini(content);
  } catch (geminiError) {
    console.warn("Gemini failed, falling back to OpenAI:", geminiError);
    try {
      // Fallback to OpenAI
      return await detectWithOpenAI(content);
    } catch (openaiError) {
      console.error("Both AI models failed:", openaiError);
      // Return offline/rule-based detection as last resort
      return detectOffline(content);
    }
  }
}

// Offline rule-based detection for when AI services are unavailable
export function detectOffline(content: string): DetectionResult {
  const lowerContent = content.toLowerCase();
  const detectionTypes: string[] = [];
  let severity: "low" | "medium" | "high" | "critical" = "low";
  let confidence = 0;

  // Keywords for different types of GBV
  const harassmentKeywords = ["bitch", "whore", "slut", "stupid woman", "useless", "worthless"];
  const threatKeywords = ["kill", "hurt", "beat", "rape", "attack", "destroy"];
  const doxxingKeywords = ["address", "phone number", "id number", "location", "home", "workplace"];
  const financialKeywords = ["money", "pay me", "owe", "debt", "control your money"];
  const coercionKeywords = ["you must", "you have to", "or else", "if you don't"];

  // Check for harassment
  if (harassmentKeywords.some(keyword => lowerContent.includes(keyword))) {
    detectionTypes.push("harassment");
    confidence += 20;
    severity = "medium";
  }

  // Check for threats
  if (threatKeywords.some(keyword => lowerContent.includes(keyword))) {
    detectionTypes.push("threats");
    confidence += 30;
    severity = "critical";
  }

  // Check for doxxing
  if (doxxingKeywords.some(keyword => lowerContent.includes(keyword))) {
    detectionTypes.push("doxxing");
    confidence += 25;
    if (severity === "low") severity = "high";
  }

  // Check for financial control
  if (financialKeywords.some(keyword => lowerContent.includes(keyword))) {
    detectionTypes.push("financial_control");
    confidence += 15;
    if (severity === "low") severity = "medium";
  }

  // Check for coercion
  if (coercionKeywords.some(keyword => lowerContent.includes(keyword))) {
    detectionTypes.push("coercion");
    confidence += 20;
    if (severity === "low") severity = "medium";
  }

  const isHarmful = detectionTypes.length > 0;
  confidence = Math.min(confidence, 85); // Offline detection max 85% confidence

  return {
    isHarmful,
    detectionType: detectionTypes,
    severity,
    confidence,
    explanation: isHarmful
      ? `Offline detection identified potential ${detectionTypes.join(", ")} based on keyword matching.`
      : "No harmful patterns detected in offline analysis.",
    aiModel: "offline",
  };
}

// Batch detection for multiple content items
export async function detectBatch(contents: string[]): Promise<DetectionResult[]> {
  return Promise.all(contents.map(content => detectContent(content)));
}
