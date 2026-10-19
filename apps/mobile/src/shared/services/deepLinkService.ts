import { Linking, Platform } from 'react-native';
import { useDeepLinkStore } from '../stores/useDeepLinkStore';
import { useChatStore } from '../../features/messages/stores/useChatStore';
import { useWalletStore } from '../../features/wallet/stores/useWalletStore';
import { useStoryStore } from '../../features/stories/stores/useStoryStore';
import { useMissionStore } from '../../features/missions/stores/useMissionStore';
import { useThemeStore } from '../../theme/useThemeStore';
import { useAdminCmsStore } from '../../features/admin/stores/useAdminCmsStore';
import { usePresenceStore } from '../stores/usePresenceStore';
import { toast } from '../stores/useToastStore';
import { posthog } from './posthogService';

export type MainTabKey = 'match' | 'destiny' | 'messages' | 'mine';

export interface ParsedDeepLink {
  originalUrl: string;
  scheme: string;
  path: string;
  segments: string[];
  params: Record<string, string>;
}

class DeepLinkService {
  private tabNavigator: ((tab: MainTabKey) => void) | null = null;
  private supabaseHubOpener: (() => void) | null = null;
  private isInitialized = false;

  public registerTabNavigator(navigator: (tab: MainTabKey) => void) {
    this.tabNavigator = navigator;
  }

  public registerSupabaseHubOpener(opener: () => void) {
    this.supabaseHubOpener = opener;
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Native Linking Listener
    try {
      Linking.addEventListener('url', (event) => {
        if (event?.url) {
          this.handleUrl(event.url, 'external_url');
        }
      });

      Linking.getInitialURL().then((initialUrl) => {
        if (initialUrl) {
          this.handleUrl(initialUrl, 'initial_launch');
        }
      });
    } catch (_) {}

    // 2. Web Browser Hash & Popstate Listener
    if (typeof window !== 'undefined') {
      const handleWebUrl = () => {
        const hash = window.location.hash; // e.g. #/destiny or #/chat/anchor_dewi
        if (hash && hash.length > 1) {
          const cleanPath = hash.replace(/^#\/?/, '');
          this.handleUrl(`tresno://${cleanPath}`, 'web_hash');
        }
      };

      window.addEventListener('hashchange', handleWebUrl);

      // Check initial hash on page load if present
      if (window.location.hash && window.location.hash.length > 1) {
        handleWebUrl();
      }
    }
  }

  public parseUrl(rawUrl: string): ParsedDeepLink {
    const trimmed = (rawUrl || '').trim();
    let scheme = 'tresno';
    let urlWithoutScheme = trimmed;

    // Detect schemes: tresno://, https://tresno.app/, http://localhost...
    if (trimmed.startsWith('tresno://')) {
      scheme = 'tresno';
      urlWithoutScheme = trimmed.replace(/^tresno:\/\//, '');
    } else if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      try {
        const parsed = new URL(trimmed);
        scheme = parsed.protocol.replace(':', '');
        // Check if there is a hash like #/chat/anchor_1
        if (parsed.hash && parsed.hash.length > 1) {
          urlWithoutScheme = parsed.hash.replace(/^#\/?/, '');
        } else {
          urlWithoutScheme = parsed.pathname.replace(/^\//, '') + parsed.search;
        }
      } catch (_) {
        urlWithoutScheme = trimmed;
      }
    } else if (trimmed.startsWith('#')) {
      urlWithoutScheme = trimmed.replace(/^#\/?/, '');
    }

    const [pathPart, queryPart] = urlWithoutScheme.split('?');
    const path = pathPart.replace(/\/+$/, '').toLowerCase();
    const segments = path.split('/').filter(Boolean);

    const params: Record<string, string> = {};
    if (queryPart) {
      const queryParams = new URLSearchParams(queryPart);
      queryParams.forEach((val, key) => {
        params[key] = val;
      });
    }

    return {
      originalUrl: rawUrl,
      scheme,
      path,
      segments,
      params,
    };
  }

  public handleUrl(
    rawUrl: string,
    source: 'notification' | 'external_url' | 'web_hash' | 'simulator' | 'initial_launch' = 'external_url'
  ): boolean {
    if (!rawUrl) return false;

    const parsed = this.parseUrl(rawUrl);
    const { path, segments, params } = parsed;
    const rootRoute = segments[0] || '';

    let success = false;
    let description = '';

    console.log(`[DeepLinkService] 🧭 Processing deep link: "${rawUrl}" from [${source}] (route: ${rootRoute})`);

    switch (rootRoute) {
      // 1. DESTINY / EXPLORE (dengan filter opsional ?filter=online|popular|nearby)
      case 'destiny':
      case 'explore': {
        this.tabNavigator?.('destiny');
        description = 'Beralih ke Tab Destiny';
        if (params.filter) {
          description += ` (Filter: ${params.filter})`;
        }
        toast.info(description);
        success = true;
        break;
      }

      // 2. MATCHMAKING RADAR
      case 'match':
      case 'radar': {
        this.tabNavigator?.('match');
        description = 'Beralih ke Radar Match';
        toast.info(description);
        success = true;
        break;
      }

      // 3. CHAT ROOM (tresno://chat/:id)
      case 'chat':
      case 'messages': {
        const peerId = segments[1];
        if (peerId) {
          const presence = usePresenceStore.getState().presences[peerId];
          const peerName = presence?.nickname || (peerId.includes('dewi') ? 'Dewi Lestari' : peerId.includes('bella') ? 'Bella Putri' : `User ${peerId.substring(0, 8)}`);
          const peerAvatar = presence?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

          useChatStore.getState().openChat({
            id: peerId,
            name: peerName,
            avatar: peerAvatar,
            isOnline: presence ? presence.status !== 'offline' : true,
          });
          description = `Membuka ruang obrolan dengan ${peerName}`;
        } else {
          this.tabNavigator?.('messages');
          description = 'Beralih ke Tab Pesan';
        }
        toast.info(description);
        success = true;
        break;
      }

      // 4. ANCHOR PROFILE / CALL (tresno://anchor/:id)
      case 'anchor':
      case 'host': {
        const hostId = segments[1];
        this.tabNavigator?.('destiny');
        if (hostId) {
          const presence = usePresenceStore.getState().presences[hostId];
          const hostName = presence?.nickname || 'Host Favorit';
          description = `Membuka profil host: ${hostName}`;
          toast.info(description);
        } else {
          description = 'Menampilkan daftar Host di Destiny';
        }
        success = true;
        break;
      }

      // 5. STORIES (tresno://story/:id)
      case 'story':
      case 'stories': {
        const storyId = segments[1];
        if (storyId) {
          useStoryStore.getState().openStoryById(storyId);
          description = `Membuka cerita ephemera #${storyId}`;
        } else {
          useStoryStore.getState().openStory(0, 0);
          description = 'Membuka cerita ephemera terbaru';
        }
        toast.info(description);
        success = true;
        break;
      }

      // 6. WALLET / TOPUP (tresno://topup atau tresno://wallet)
      case 'wallet':
      case 'topup': {
        useWalletStore.getState().openTopupModal();
        description = 'Membuka Modal Top-Up Koin QRIS';
        toast.info(description);
        success = true;
        break;
      }

      // 7. CASHOUT / WITHDRAWAL (tresno://cashout)
      case 'cashout':
      case 'withdraw': {
        useWalletStore.getState().openCashoutModal();
        description = 'Membuka Modal Penarikan Dana Host';
        toast.info(description);
        success = true;
        break;
      }

      // 8. MISSIONS CENTER (tresno://missions atau tresno://tasks)
      case 'missions':
      case 'tasks':
      case 'rewards': {
        useMissionStore.getState().openMissionModal();
        description = 'Membuka Pusat Misi & Hadiah Koin';
        toast.info(description);
        success = true;
        break;
      }

      // 9. GENTLEMAN VIP STARTER PACK (tresno://starter-pack atau tresno://gentleman)
      case 'gentleman':
      case 'starter-pack':
      case 'promo': {
        useWalletStore.getState().openStarterPackModal();
        description = 'Membuka Paket Perdana Gentleman VIP Rp 9.900';
        toast.info(description);
        success = true;
        break;
      }

      // 10. MINE / PROFIL SAYA (tresno://profile atau tresno://mine)
      case 'profile':
      case 'mine': {
        this.tabNavigator?.('mine');
        description = 'Beralih ke Tab Profil Saya';
        toast.info(description);
        success = true;
        break;
      }

      // 11. THEME SWITCHER (tresno://theme atau tresno://settings)
      case 'theme':
      case 'settings': {
        useThemeStore.getState().openThemeModal();
        description = 'Membuka Pengaturan Tema & Bahasa';
        toast.info(description);
        success = true;
        break;
      }

      // 12. ADMIN CMS PANEL (tresno://admin atau tresno://cms)
      case 'admin':
      case 'cms': {
        useAdminCmsStore.getState().openCms();
        description = 'Membuka Panel Kontrol Admin CMS';
        toast.info(description);
        success = true;
        break;
      }

      // 13. SUPABASE CLOUD HUB (tresno://supabase atau tresno://cloud)
      case 'supabase':
      case 'cloud': {
        this.supabaseHubOpener?.();
        description = 'Membuka Supabase Realtime & Cloud Hub';
        toast.info(description);
        success = true;
        break;
      }

      default: {
        description = `Rute deep link tidak dikenal: "${rootRoute}"`;
        toast.warning(description);
        success = false;
        break;
      }
    }

    // Record in history store
    useDeepLinkStore.getState().recordDeepLink({
      url: rawUrl,
      path,
      params,
      source,
      success,
      targetDescription: description,
    });

    // Capture telemetry in PostHog
    posthog.capture('deep_link_resolved', {
      rawUrl,
      rootRoute,
      source,
      success,
    });

    return success;
  }
}

export const deepLinkService = new DeepLinkService();
