export const assistantConfig = {
  name: "TradeSource Assistant",
  shortName: "Assistant",
  version: "0.1.0",
  enabled: process.env.ASSISTANT_ENABLED === "true",
  debug: process.env.ASSISTANT_DEBUG === "true",

  // MVP: contractor-only mode. Homeowner capability is parked for later activation.
  mode: "contractor" as const,

  // MiniMax model. Override via ASSISTANT_MODEL env var if needed.
  model: process.env.ASSISTANT_MODEL || "MiniMax-Text-01",

  ui: {
    title: "TradeSource Assistant",
    welcomeMessage:
      "Hi — I'm the TradeSource Assistant. I help contractors with platform questions, navigation, job posting, vetting, scope, and rough materials or pricing guidance.",
    placeholder:
      "Ask about posting a job, vetting, scope, rough pricing, materials, or navigating the platform...",
    maxInputLength: 4000,
    maxConversationMessages: 20,
  },

  behavior: {
    temperature: 0.4,
    maxOutputTokens: 1200,
    supportPageAwareness: true,
    supportRoleAwareness: true,
    supportKnowledgeFiles: true,
    supportToolCalls: false,
    supportStreaming: false,
  },

  safety: {
    allowLegalAdvice: false,
    allowTaxAdvice: false,
    allowPermitAuthority: false,
    allowInsuranceAuthority: false,
    allowExactEstimatesWithoutTools: false,
    allowLiveStatusClaimsWithoutBackend: false,
  },

  // MVP: only contractor-relevant knowledge files are active.
  // HOMEOWNER_FLOW.md is parked — excluded from active behavior.
  // HOMEOWNER_FLOW.md is kept at rest for future homeowner activation.
  knowledge: {
    activeFiles: [
      "IDENTITY.md",
      "TRADESOURCE_OVERVIEW.md",
      "APP_NAVIGATION.md",
      "CONTRACTOR_FLOW.md",
      "VETTING_RULES.md",
      "MESSAGING_RULES.md",
      "PAINT_WIZARD_SCOPE.md",
      "DISCLAIMERS.md",
    ] as string[],
    parkedFiles: [
      "HOMEOWNER_FLOW.md",
    ] as string[],
  },

  routes: {
    testPage: "/admin/assistant-test",
    testApi: "/api/assistant/test",
  },
} as const;

export type AssistantConfig = typeof assistantConfig;
