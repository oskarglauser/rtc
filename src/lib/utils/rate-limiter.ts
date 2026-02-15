interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

const windows = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  options: RateLimiterOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const window = windows.get(key);

  if (!window || now > window.resetAt) {
    windows.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetAt: now + options.windowMs,
    };
  }

  if (window.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: window.resetAt,
    };
  }

  window.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - window.count,
    resetAt: window.resetAt,
  };
}
