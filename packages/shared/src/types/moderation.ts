export type ModerationCategory = 'clean' | 'sara' | 'pornography' | 'harassment' | 'other';
export type ModerationStatus = 'approved' | 'pending_review' | 'rejected';

export interface ModerationResult {
  isSafe: boolean;
  status: ModerationStatus;
  category: ModerationCategory;
  flaggedKeywords: string[];
  reason?: string;
  confidence: number; // 0 to 1
  timestamp: number;
  reviewedBy: 'automated_heuristic_ai' | 'admin_curator' | 'community_shield';
}

export interface ModerationPolicyRule {
  id: string;
  category: ModerationCategory;
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}
