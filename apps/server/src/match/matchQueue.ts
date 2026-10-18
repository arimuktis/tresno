import Redis from 'ioredis';
import { MatchFilter, UserSummary } from '@tresno/shared';

export interface QueuedUser {
  userId: string;
  socketId: string;
  filter: MatchFilter;
  userSummary: UserSummary;
  joinedAt: number;
}

export class MatchQueueManager {
  private redis: Redis | null = null;
  private localQueue: Map<string, QueuedUser> = new Map();

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      this.redis = new Redis(redisUrl, { lazyConnect: true });
      this.redis.connect().catch((err) => {
        console.warn('⚠️ Redis not available, using in-memory queue fallback:', err.message);
        this.redis = null;
      });
    } else {
      console.log('ℹ️ No REDIS_URL provided, using high-speed in-memory Matchmaking Queue.');
    }
  }

  async enqueue(queuedUser: QueuedUser): Promise<void> {
    this.localQueue.set(queuedUser.userId, queuedUser);
  }

  async dequeue(userId: string): Promise<void> {
    this.localQueue.delete(userId);
  }

  hasUser(userId: string): boolean {
    return this.localQueue.has(userId);
  }

  /**
   * Cari pasangan match acak berdasarkan filter gender
   */
  async findMatch(current: QueuedUser): Promise<QueuedUser | null> {
    for (const [candidateId, candidate] of this.localQueue.entries()) {
      if (candidateId === current.userId) continue;

      // Heterosexual matchmaking ala Tigo: Pria otomatis match dengan Wanita, Wanita dengan Pria
      const isHeteroMatch = 
        (current.userSummary.gender === 'male' && candidate.userSummary.gender === 'female') ||
        (current.userSummary.gender === 'female' && candidate.userSummary.gender === 'male');

      if (isHeteroMatch) {
        // Match found! Dequeue both
        this.localQueue.delete(current.userId);
        this.localQueue.delete(candidateId);
        return candidate;
      }
    }
    return null;
  }
}
