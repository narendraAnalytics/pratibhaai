const RETRY_DELAYS_MS = [1000, 3000, 5000]
const TRANSIENT_KEYWORDS = ['timeout', 'rate limit', '429', '500', '503', 'etimedout', 'econnreset', 'enotfound', 'quota']

function isTransientError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return TRANSIENT_KEYWORDS.some(k => msg.includes(k))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<{ result: T; retryCount: number }> {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await fn()
      return { result, retryCount: attempt }
    } catch (err) {
      lastError = err
      const shouldRetry = isTransientError(err) && attempt < maxAttempts - 1
      if (!shouldRetry) throw err
      await new Promise(r => setTimeout(r, RETRY_DELAYS_MS[attempt] ?? 5000))
    }
  }
  throw lastError
}
