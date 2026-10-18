export interface GiftItem {
  id: string;
  name: string;
  coinPrice: number;
  diamondValue: number;
  iconUrl: string;
  lottieUrl?: string;
  category: 'romantic' | 'fun' | 'luxury';
}

export interface SendGiftPayload {
  channelId: string;
  senderId: string;
  receiverId: string;
  giftId: string;
  quantity: number;
}

export interface GiftBroadcastEvent {
  channelId: string;
  senderId: string;
  senderNickname: string;
  gift: GiftItem;
  quantity: number;
  timestamp: number;
}
