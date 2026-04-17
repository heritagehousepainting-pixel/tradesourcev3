import { assistantConfig } from "./assistant-config";
import { systemPrompt } from "../prompts/system-prompt";
import type {
  AssistantRequest,
  AssistantResponse,
  AssistantMessage,
} from "../types/assistant";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE_URL = "https://api.minimax.io/v1";

function formatConversation(conversation?: AssistantMessage[]): string {
  if (!conversation || conversation.length === 0) {
    return "No prior conversation.";
  }

  return conversation
    .slice(-assistantConfig.ui.maxConversationMessages)
    .map((message) => {
      const role = message.role.toUpperCase();
      return `[${role}] ${message.content}`;
    })
    .join("\n");
}

function buildContextBlock(request: AssistantRequest): string {
  const route = request.pageContext?.route || "unknown";
  const pageTitle = request.pageContext?.pageTitle || "unknown";
  const pageDescription = request.pageContext?.pageDescription || "unknown";
  const pageStateSummary = request.pageContext?.pageStateSummary || "unknown";

  const role = request.userContext?.role || "unknown";
  const isLoggedIn =
    typeof request.userContext?.isLoggedIn === "boolean"
      ? String(request.userContext.isLoggedIn)
      : "unknown";
  const displayName = request.userContext?.displayName || "unknown";
  const companyName = request.userContext?.companyName || "unknown";

  return `
CURRENT APP CONTEXT
Route: ${route}
Page title: ${pageTitle}
Page description: ${pageDescription}
Page state summary: ${pageStateSummary}

CURRENT USER CONTEXT
Role: ${role}
Logged in: ${isLoggedIn}
Display name: ${displayName}
Company name: ${companyName}
`.trim();
}

export async function getAssistantReply(
  request: AssistantRequest
): Promise<AssistantResponse> {
  try {
    if (!assistantConfig.enabled) {
      return {
        reply:
          "The assistant is currently disabled in this environment.",
      };
    }

    if (!MINIMAX_API_KEY) {
      console.error("Assistant service: MINIMAX_API_KEY is not set.");
      return {
        reply: "Sorry — the assistant is not configured correctly.",
        error: "MISSING_API_KEY",
      };
    }

    const contextBlock = buildContextBlock(request);
    const conversationBlock = formatConversation(request.conversation);
    // Note: HOMEOWNER_FLOW.md is intentionally excluded from the knowledge stub.
    // Homeowner features are not active in this MVP. Listing them here would
    // create confusion about active capabilities.
    const activeFiles = assistantConfig.knowledge.activeFiles.filter(
      (f) => f !== "HOMEOWNER_FLOW.md"
    );

    const knowledgeBlock = `
MVP ACTIVE KNOWLEDGE FILES (CONTRACTOR MODE)
${activeFiles.map((f) => `- ${f}`).join("\n")}

IMPORTANT
These knowledge files are not live-retrieved in this first version.
They are represented in the system prompt and app behavior design.
Do not claim to quote or fetch them dynamically unless retrieval is actually implemented.
`.trim();

    // MiniMax-Text-01 only supports ONE system message.
    // Merge all system content into a single block.
    const combinedSystemContent = [
      systemPrompt,
      "",
      contextBlock,
      "",
      knowledgeBlock,
      "",
      `RECENT CONVERSATION\n${conversationBlock}`,
    ].filter(Boolean).join("\n");

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: combinedSystemContent },
      { role: "user", content: request.message },
    ];

    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: assistantConfig.model,
        messages,
        temperature: assistantConfig.behavior.temperature,
        max_tokens: assistantConfig.behavior.maxOutputTokens,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `MiniMax API error ${response.status}: ${errorBody}`;

      // Try to extract MiniMax's error message field for cleaner logs
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error?.message) errorMessage = parsed.error.message;
      } catch { /* ignore parse failures */ }

      console.error(`[assistant] ${errorMessage}`);

      return {
        reply:
          "Sorry — the assistant ran into an error while generating a response.",
        error: `MINIMAX_API_ERROR_${response.status}`,
      };
    }

    const data = await response.json();

    console.log('[assistant] MiniMax raw response:', JSON.stringify(data));

    // MiniMax's response shape mirrors OpenAI's chat completions
    const rawContent = data.choices?.[0]?.message?.content;
    const reply = (rawContent && typeof rawContent === 'string' && rawContent.trim().length > 0)
      ? rawContent.trim()
      : "I'm sorry, but I couldn't generate a reply.";

    return {
      reply,
      debug: assistantConfig.debug
        ? {
            model: assistantConfig.model,
            usedKnowledgeFiles: assistantConfig.knowledge.activeFiles,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Assistant service error:", error);

    return {
      reply:
        "Sorry — the assistant ran into an error while generating a response.",
      error: "ASSISTANT_SERVICE_ERROR",
      debug: assistantConfig.debug
        ? {
            model: assistantConfig.model,
            usedKnowledgeFiles: assistantConfig.knowledge.activeFiles,
          }
        : undefined,
    };
  }
}