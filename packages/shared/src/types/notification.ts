export type NotificationType =
  | 'incoming_call'
  | 'chat_message'
  | 'system_promo'
  | 'gift_received'
  | 'match_found'
  | 'wallet_topup';

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  avatarUrl?: string;
  senderId?: string;
  senderName?: string;
  channelId?: string;
  agoraToken?: string;
  agoraUid?: number;
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface IncomingCallRequestPayload {
  callId: string;
  channelId: string;
  caller: {
    id: string;
    nickname: string;
    avatarUrl: string;
    gender: 'male' | 'female';
    level: number;
    ratePerMin?: number;
  };
  agoraUid: number;
  agoraToken: string;
  freeChatSeconds: number;
  billingIntervalSeconds: number;
  costPerInterval: number;
  timestamp: number;
}

export interface IncomingCallResponsePayload {
  callId: string;
  channelId: string;
  accepted: boolean;
  reason?: 'user_declined' | 'busy' | 'timeout';
}
