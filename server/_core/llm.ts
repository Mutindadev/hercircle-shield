import { ENV } from "./env";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string; // Allow model override
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient && ENV.geminiApiKey) {
    geminiClient = new GoogleGenerativeAI(ENV.geminiApiKey);
  }
  if (!geminiClient) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return geminiClient;
}

/**
 * Invoke Google Gemini API directly
 * Uses latest model: gemini-2.0-flash-exp (December 2024)
 */
export async function invokeGemini(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = getGeminiClient();

  // Use latest Gemini model (December 2024)
  const modelName = params.model || "gemini-2.0-flash-exp";
  const model = client.getGenerativeModel({ model: modelName });

  // Convert messages to Gemini format
  const contents = params.messages
    .filter(msg => msg.role !== "system") // Gemini handles system via systemInstruction
    .map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content) }],
    }));

  // Extract system message
  const systemMessage = params.messages.find(msg => msg.role === "system");
  const systemInstruction = systemMessage
    ? typeof systemMessage.content === "string"
      ? systemMessage.content
      : JSON.stringify(systemMessage.content)
    : undefined;

  // Handle JSON schema response format
  const generationConfig: any = {
    maxOutputTokens: params.maxTokens || params.max_tokens || 8192,
  };

  if (params.response_format?.type === "json_schema" || params.responseFormat?.type === "json_schema") {
    const format = params.response_format || params.responseFormat;
    if (format && format.type === "json_schema") {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = format.json_schema.schema;
    }
  } else if (params.response_format?.type === "json_object" || params.responseFormat?.type === "json_object") {
    generationConfig.responseMimeType = "application/json";
  }

  try {
    const chat = model.startChat({
      history: contents.slice(0, -1),
      generationConfig,
      systemInstruction,
    });

    const lastMessage = contents[contents.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    const text = response.text();

    return {
      id: `gemini-${Date.now()}`,
      created: Math.floor(Date.now() / 1000),
      model: modelName,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: text,
        },
        finish_reason: "stop",
      }],
      usage: {
        prompt_tokens: 0, // Gemini doesn't provide token counts in response
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  } catch (error) {
    console.error("[Gemini] API error:", error);
    throw new Error(`Gemini API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Invoke OpenAI API directly
 * Uses latest model: gpt-4o (December 2024)
 */
export async function invokeOpenAI(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  // Use latest OpenAI model (December 2024)
  const model = params.model || "gpt-4o";

  const normalizedMessages = params.messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === "string"
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.map(part =>
          typeof part === "string" ? part : part.type === "text" ? part.text : JSON.stringify(part)
        ).join("\n")
        : JSON.stringify(msg.content),
  }));

  const payload: any = {
    model,
    messages: normalizedMessages,
    max_tokens: params.maxTokens || params.max_tokens || 4096,
  };

  // Handle response format
  const responseFormat = params.response_format || params.responseFormat;
  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ENV.openaiApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json() as InvokeResult;
  } catch (error) {
    console.error("[OpenAI] API error:", error);
    throw new Error(`OpenAI API failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Legacy wrapper for backward compatibility
 * Tries Gemini first, falls back to OpenAI
 * @deprecated Use invokeGemini() or invokeOpenAI() directly
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // Try Gemini first if API key is available
  if (ENV.geminiApiKey) {
    try {
      return await invokeGemini(params);
    } catch (error) {
      console.warn("[LLM] Gemini failed, trying OpenAI:", error);
    }
  }

  // Fallback to OpenAI
  if (ENV.openaiApiKey) {
    return await invokeOpenAI(params);
  }

  throw new Error("No AI API keys configured. Set GEMINI_API_KEY or OPENAI_API_KEY");
}
