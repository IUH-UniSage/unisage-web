import { createAuthenticatedClient } from "@/lib/axios-client"

const aiBaseURL =
  import.meta.env.VITE_AI_API_BASE_URL ?? "http://localhost:8400/api/v1/ai"

// Points at the Gateway's python-ai-agent-route (/api/v1/ai) instead of the
// Java route (/api/v1/master) - see docs/adr for why this is a second fixed
// client rather than one client with a per-request baseURL.
export const aiHttpClient = createAuthenticatedClient(aiBaseURL)
