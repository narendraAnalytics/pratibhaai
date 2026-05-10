export interface AgentMeta {
  confidenceScore: number
  evidenceQuality: 'high' | 'medium' | 'low'
  reasoningSummary: string
  missingEvidence: string[]
  warnings: string[]
}

export interface AgentExecutionState {
  status: 'success' | 'partial' | 'failed'
  fallbackUsed: boolean
  retryCount: number
  executionTimeMs: number
  error?: string
}

export type WithMeta<T> = T & { meta: AgentMeta; exec: AgentExecutionState }
