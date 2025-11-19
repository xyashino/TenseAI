interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
}

interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimitService {
  private cache: Map<string, RateLimitRecord>;

  constructor() {
    this.cache = new Map();
    setInterval(() => this.cleanup(), 60000);
  }

  async checkLimit(userId: string, action: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const key = `${action}:${userId}`;
    const now = Date.now();
    const windowMs = options.windowSeconds * 1000;

    let record = this.cache.get(key);

    if (!record || now >= record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      this.cache.set(key, record);
    }

    if (record.count >= options.limit) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfter, remaining: 0 };
    }

    record.count++;
    this.cache.set(key, record);

    return {
      allowed: true,
      retryAfter: 0,
      remaining: options.limit - record.count,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now >= record.resetAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const rateLimitService = new RateLimitService();
