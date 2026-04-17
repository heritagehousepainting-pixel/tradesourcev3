export type AssistantUserRole =
  | "guest"
  | "homeowner"
  | "contractor"
  | "admin"
  | "unknown";

export type AssistantMessageRole =
  | "system"
  | "user"
  | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
}

export interface AssistantPageContext {
  route?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageStateSummary?: string;
}

export interface AssistantUserContext {
  userId?: string;
  role: AssistantUserRole;
  isLoggedIn?: boolean;
  displayName?: string;
  companyName?: string;
}

export interface AssistantRequest {
  message: string;
  conversation?: AssistantMessage[];
  pageContext?: AssistantPageContext;
  userContext?: AssistantUserContext;
}

export interface AssistantResponse {
  reply: string;
  error?: string;
  debug?: {
    model?: string;
    usedKnowledgeFiles?: string[];
  };
}