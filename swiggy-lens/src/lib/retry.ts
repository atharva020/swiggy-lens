interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { attempts = 3, baseDelayMs = 500, timeoutMs = 30_000 } = options;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await withTimeout(fn(), timeoutMs);
      return result;
    } catch (err) {
      const isLast = attempt === attempts;
      const isRetryable = isRetryableError(err);

      if (isLast || !isRetryable) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw new Error("Retry exhausted");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms
    );
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  if (msg.includes("timeout")) return true;
  if (msg.includes("econnreset")) return true;
  if (msg.includes("econnrefused")) return true;
  if (msg.includes("socket hang up")) return true;
  if (msg.includes("429")) return true;
  if (msg.includes("rate limit")) return true;
  if (msg.includes("503")) return true;
  if (msg.includes("502")) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
