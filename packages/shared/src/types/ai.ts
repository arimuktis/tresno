/**
 * AI & PgVector Intelligence Types
 * Mendefinisikan tipe data embedding vektor, hasil pencocokan semantik, dan status PgVector
 */

export const PGVECTOR_DIMENSION = 384;

export interface HostVectorProfile {
  hostId: string;
  nickname: string;
  avatarUrl: string;
  gender: 'female' | 'male';
  vibeDescription: string;
  talkingStyle: string;
  specialties: string[];
  humorLevel: number; // 1 - 10
  energyLevel: number; // 1 - 10
  ratingScore: number;
  embedding?: number[]; // 384 floats
  isActive: boolean;
}

export interface SemanticMatchResult {
  hostId: string;
  nickname: string;
  avatarUrl: string;
  vibeDescription: string;
  talkingStyle: string;
  specialties: string[];
  ratingScore: number;
  similarity: number; // 0.0 - 1.0 (Cosine Similarity)
  matchReason: string;
  vectorPreview?: number[];
}

export interface IcebreakerSuggestion {
  id: string;
  text: string;
  category: 'FUN' | 'FLIRTY' | 'CASUAL' | 'CULTURE' | 'DEEP';
  relevanceScore: number;
  tone: string;
}

export interface ModerationVectorScanResult {
  isViolation: boolean;
  highestSimilarity: number;
  category?: 'SARA' | 'PORNOGRAPHY' | 'TOXICITY' | 'SCAM';
  matchedBenchmarkPattern?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidenceScore: number; // 0 - 100%
  recommendedAction: 'AUTO_REJECT' | 'FLAG_FOR_REVIEW' | 'ALLOW';
}

export interface PgVectorConsoleStats {
  extensionInstalled: boolean;
  extensionVersion: string;
  vectorDimension: number;
  indexType: 'HNSW' | 'IVFFlat';
  totalProfilesIndexed: number;
  totalHostsIndexed: number;
  totalBenchmarksIndexed: number;
  totalKnowledgeChunksIndexed: number;
  avgQueryLatencyMs: number;
  lastReindexedAt: number;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
}

export interface KnowledgeBaseChunk {
  id: string;
  domain: 'faq' | 'billing_rules' | 'community_guidelines' | 'host_tips' | 'icebreakers';
  title: string;
  content: string;
  similarity?: number;
}
