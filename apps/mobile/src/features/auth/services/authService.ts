import { supabase, isRealSupabaseConfigured } from '../../../shared/services/supabaseClient';
import { Gender } from '@tresno/shared';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
  tokenType: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  nickname: string;
  gender: Gender;
  age: number;
  avatarUrl?: string;
  isHost: boolean;
  agencyCode?: string;
  coinBalance: number;
  diamondBalance: number;
  isBanned: boolean;
  isOnboarded: boolean;
  provider: 'google' | 'phone' | 'guest' | 'email';
}

const STORAGE_SESSION_KEY = 'tresno_auth_session';
const STORAGE_USER_KEY = 'tresno_auth_user';
const STORAGE_DEVICE_KEY = 'tresno_device_id';

export const getOrCreateDeviceId = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    let deviceId = window.localStorage.getItem(STORAGE_DEVICE_KEY);
    if (!deviceId) {
      deviceId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      window.localStorage.setItem(STORAGE_DEVICE_KEY, deviceId);
    }
    return deviceId;
  }
  return `dev_${Date.now().toString(36)}`;
};

export const normalizeIndoPhoneNumber = (raw: string): string => {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return `+${cleaned}`;
};

export const authService = {
  /**
   * Simpan Session & User ke persistent storage
   */
  saveSession(session: AuthSession, user: AuthUser): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Ambil Session aktif dari storage
   */
  getStoredSession(): { session: AuthSession | null; user: AuthUser | null } {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawSession = window.localStorage.getItem(STORAGE_SESSION_KEY);
      const rawUser = window.localStorage.getItem(STORAGE_USER_KEY);
      if (rawSession && rawUser) {
        try {
          const session = JSON.parse(rawSession);
          const user = JSON.parse(rawUser);
          if (user && user.nickname && user.nickname.includes('_')) {
            user.nickname = user.nickname.replace(/_/g, ' ');
            window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
          }
          return {
            session,
            user,
          };
        } catch {
          this.clearSession();
        }
      }
    }
    return { session: null, user: null };
  },

  /**
   * Bersihkan Session saat logout
   */
  clearSession(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_SESSION_KEY);
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
  },

  /**
   * 1. Google OAuth Flow (Supabase dengan refresh token)
   */
  async signInWithGoogle(): Promise<{ session: AuthSession; user: AuthUser }> {
    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          queryParams: {
            access_type: 'offline', // Minta refresh token dari Google
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    // Mock/Demo Google OAuth yang aman untuk dev & web preview:
    // Menghasilkan JWT Access Token & Refresh Token terstruktur
    const id = `g_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + 3600 * 1000; // 1 Jam

    const session: AuthSession = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user_${id}_token`,
      refreshToken: `rf_google_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`,
      expiresAt,
      tokenType: 'bearer',
    };

    const user: AuthUser = {
      id,
      email: `user.${id.substring(2)}@gmail.com`,
      nickname: 'Google Friend',
      gender: 'male',
      age: 22,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isHost: false,
      coinBalance: 50,
      diamondBalance: 0,
      isBanned: false,
      isOnboarded: false,
      provider: 'google',
    };

    this.saveSession(session, user);
    return { session, user };
  },

  /**
   * 2. Phone / WhatsApp OTP Login (Khas Tigo Indonesia)
   */
  async sendPhoneOtp(rawPhone: string): Promise<{ success: boolean; message: string; demoCode?: string }> {
    const phone = normalizeIndoPhoneNumber(rawPhone);
    if (phone.length < 11) {
      throw new Error('Nomor HP tidak valid. Masukkan nomor minimal 10 digit.');
    }

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) {
        throw new Error(error.message);
      }
      return { success: true, message: `Kode OTP terkirim ke ${phone}` };
    }

    // Mode demo / sandbox: OTP 123456
    const demoCode = '123456';
    console.log(`[DEMO OTP TRESNO] Kode verifikasi untuk ${phone}: ${demoCode}`);
    return {
      success: true,
      message: `Kode OTP simulasi dikirim ke ${phone} (Kode: ${demoCode})`,
      demoCode,
    };
  },

  async verifyPhoneOtp(rawPhone: string, token: string): Promise<{ session: AuthSession; user: AuthUser }> {
    const phone = normalizeIndoPhoneNumber(rawPhone);

    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        const session: AuthSession = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: (data.session.expires_at || 0) * 1000,
          tokenType: data.session.token_type,
        };

        const user: AuthUser = {
          id: data.user?.id || `phone_${Date.now()}`,
          phone,
          nickname: `User ${phone.slice(-4)}`,
          gender: 'male',
          age: 21,
          isHost: false,
          coinBalance: 50,
          diamondBalance: 0,
          isBanned: false,
          isOnboarded: false,
          provider: 'phone',
        };

        this.saveSession(session, user);
        return { session, user };
      }
    }

    // Demo Mode Verification (Kunci 123456)
    if (token.trim() !== '123456') {
      throw new Error('Kode verifikasi OTP salah. Silakan coba lagi (Gunakan: 123456).');
    }

    const id = `p_${phone.replace(/\D/g, '').slice(-8)}`;
    const expiresAt = Date.now() + 3600 * 1000;

    const session: AuthSession = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.phone_${id}_token`,
      refreshToken: `rf_phone_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`,
      expiresAt,
      tokenType: 'bearer',
    };

    const user: AuthUser = {
      id,
      phone,
      nickname: `Member ${phone.slice(-4)}`,
      gender: 'male',
      age: 21,
      isHost: false,
      coinBalance: 50,
      diamondBalance: 0,
      isBanned: false,
      isOnboarded: false,
      provider: 'phone',
    };

    this.saveSession(session, user);
    return { session, user };
  },

  /**
   * 3. Email & Password Authentication (Masuk / Sign In)
   */
  async signInWithEmail(email: string, password: string): Promise<{ session: AuthSession; user: AuthUser }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }
    if (!password || password.length < 6) {
      throw new Error('Kata sandi harus minimal 6 karakter.');
    }

    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user || !data.session) {
        throw new Error(error?.message || 'Email atau kata sandi tidak valid');
      }

      const session: AuthSession = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: (data.session.expires_at || 0) * 1000,
        tokenType: data.session.token_type,
      };

      const nickname = data.user.user_metadata?.nickname || cleanEmail.split('@')[0] || 'User Tresno';
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        nickname,
        gender: data.user.user_metadata?.gender || 'male',
        age: data.user.user_metadata?.age || 21,
        avatarUrl: data.user.user_metadata?.avatarUrl,
        isHost: Boolean(data.user.user_metadata?.isHost),
        agencyCode: data.user.user_metadata?.agencyCode,
        coinBalance: data.user.user_metadata?.coinBalance ?? 50,
        diamondBalance: data.user.user_metadata?.diamondBalance ?? 0,
        isBanned: false,
        isOnboarded: Boolean(data.user.user_metadata?.isOnboarded),
        provider: 'email',
      };

      this.saveSession(session, user);
      return { session, user };
    }

    // Demo Mode / Sandbox Fallback
    const id = `email_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + 24 * 3600 * 1000;
    const nickname = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'User Tresno';

    const session: AuthSession = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.email_${id}_token`,
      refreshToken: `rf_email_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`,
      expiresAt,
      tokenType: 'bearer',
    };

    const user: AuthUser = {
      id,
      email: cleanEmail,
      nickname,
      gender: 'male',
      age: 22,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isHost: false,
      coinBalance: 50,
      diamondBalance: 0,
      isBanned: false,
      isOnboarded: false,
      provider: 'email',
    };

    this.saveSession(session, user);
    return { session, user };
  },

  /**
   * 4. Email & Password Registration (Daftar Akun Baru)
   */
  async signUpWithEmail(
    email: string,
    password: string
  ): Promise<{ session: AuthSession | null; user: AuthUser | null; needsEmailConfirmation: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }
    if (!password || password.length < 6) {
      throw new Error('Kata sandi harus minimal 6 karakter.');
    }

    if (isRealSupabaseConfigured()) {
      const defaultNickname = cleanEmail.split('@')[0];
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            nickname: defaultNickname,
            isOnboarded: false,
            coinBalance: 50,
            diamondBalance: 0,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session && data.user) {
        const session: AuthSession = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: (data.session.expires_at || 0) * 1000,
          tokenType: data.session.token_type,
        };

        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          nickname: defaultNickname,
          gender: 'male',
          age: 21,
          isHost: false,
          coinBalance: 50,
          diamondBalance: 0,
          isBanned: false,
          isOnboarded: false,
          provider: 'email',
        };

        this.saveSession(session, user);
        return { session, user, needsEmailConfirmation: false };
      }

      return { session: null, user: null, needsEmailConfirmation: true };
    }

    // Demo Mode: Otomatis terdaftar dan login
    const id = `email_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = Date.now() + 24 * 3600 * 1000;
    const nickname = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'User Tresno';

    const session: AuthSession = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.email_${id}_token`,
      refreshToken: `rf_email_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`,
      expiresAt,
      tokenType: 'bearer',
    };

    const user: AuthUser = {
      id,
      email: cleanEmail,
      nickname,
      gender: 'male',
      age: 21,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isHost: false,
      coinBalance: 50,
      diamondBalance: 0,
      isBanned: false,
      isOnboarded: false,
      provider: 'email',
    };

    this.saveSession(session, user);
    return { session, user, needsEmailConfirmation: false };
  },

  /**
   * 5. Reset Password via Email
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }

    if (isRealSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    return {
      success: true,
      message: `Tautan pemulihan kata sandi telah dikirim ke ${cleanEmail}`,
    };
  },

  /**
   * 6. Quick Guest Login (Device ID binding ala Tigo)
   */
  async signInAsGuest(): Promise<{ session: AuthSession; user: AuthUser }> {
    const deviceId = getOrCreateDeviceId();
    const id = `guest_${deviceId.substring(4, 12)}`;
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000; // Guest token 7 hari

    const session: AuthSession = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.guest_${id}_token`,
      refreshToken: `rf_guest_${deviceId}_${Date.now()}`,
      expiresAt,
      tokenType: 'bearer',
    };

    const user: AuthUser = {
      id,
      nickname: `Tamu ${id.slice(-4)}`,
      gender: 'male',
      age: 21,
      isHost: false,
      coinBalance: 50, // Bonus awal tamu coba 1-on-1 match
      diamondBalance: 0,
      isBanned: false,
      isOnboarded: false,
      provider: 'guest',
    };

    this.saveSession(session, user);
    return { session, user };
  },

  /**
   * 4. Refresh Token Mechanism (Rotasi Token Otomatis)
   */
  async refreshSession(): Promise<AuthSession> {
    const { session, user } = this.getStoredSession();
    if (!session || !session.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (isRealSupabaseConfigured()) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refreshToken,
      });

      if (error || !data.session) {
        this.clearSession();
        throw new Error(error?.message || 'Token refresh failed');
      }

      const newSession: AuthSession = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: (data.session.expires_at || 0) * 1000,
        tokenType: data.session.token_type,
      };

      if (user) {
        this.saveSession(newSession, user);
      }
      return newSession;
    }

    // Rotasi Token Demo/Lokal yang aman
    const newSession: AuthSession = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.rot_${Date.now()}`,
      refreshToken: `rf_rot_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000,
      tokenType: 'bearer',
    };

    if (user) {
      this.saveSession(newSession, user);
    }
    return newSession;
  },

  /**
   * 5. Bootstrap Check Session saat App Startup (Di SplashScreen)
   */
  async checkSession(): Promise<{ session: AuthSession; user: AuthUser } | null> {
    const { session, user } = this.getStoredSession();
    if (!session || !user) {
      return null;
    }

    // Cek apakah akun terblokir (Security policy Anbu/WorkWise)
    if (user.isBanned) {
      this.clearSession();
      throw new Error('Akun Anda telah dinonaktifkan karena melanggar ketentuan layanan.');
    }

    // Jika token sudah kedaluwarsa atau sisa < 5 menit, lakukan refresh otomatis
    const timeUntilExpiry = session.expiresAt - Date.now();
    if (timeUntilExpiry < 5 * 60 * 1000) {
      try {
        const refreshed = await this.refreshSession();
        return { session: refreshed, user };
      } catch (err) {
        console.warn('Auto refresh session failed, redirecting to login:', err);
        this.clearSession();
        return null;
      }
    }

    return { session, user };
  },

  /**
   * Helper untuk mengonversi session Supabase asli ke model AuthSession & AuthUser Tresno
   */
  mapSupabaseUserToAuth(session: any, existingUser?: AuthUser | null): { session: AuthSession; user: AuthUser } {
    const sbUser = session.user;
    const metadata = sbUser.user_metadata || {};
    const nickname = metadata.full_name || metadata.name || sbUser.email?.split('@')[0] || 'Member Google';
    const avatarUrl = metadata.avatar_url || metadata.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    const authSession: AuthSession = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: (session.expires_at || 0) * 1000,
      tokenType: session.token_type || 'bearer',
    };

    const authUser: AuthUser = {
      id: sbUser.id,
      email: sbUser.email,
      nickname,
      gender: existingUser?.gender || 'male',
      age: existingUser?.age || 22,
      avatarUrl,
      isHost: existingUser?.isHost || false,
      coinBalance: existingUser?.coinBalance || 50,
      diamondBalance: existingUser?.diamondBalance || 0,
      isBanned: false,
      isOnboarded: existingUser?.isOnboarded ?? true,
      provider: (sbUser.app_metadata?.provider as any) || 'google',
    };

    return { session: authSession, user: authUser };
  },

  /**
   * Inisialisasi Auth State Change Listener dari Supabase
   */
  initSupabaseAuthListener(onAuthUpdate: (user: AuthUser, session: AuthSession) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      console.log(`[Supabase Auth] Event: ${event}`);
      if (sbSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        const stored = this.getStoredSession();
        const { session, user } = this.mapSupabaseUserToAuth(sbSession, stored.user);
        this.saveSession(session, user);
        onAuthUpdate(user, session);
      } else if (event === 'SIGNED_OUT') {
        this.clearSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Cek apakah ada Supabase OAuth callback session yang tersimpan setelah redirect
   */
  async checkSupabaseOAuthCallback(): Promise<{ session: AuthSession; user: AuthUser } | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session?.user) {
        const stored = this.getStoredSession();
        const mapped = this.mapSupabaseUserToAuth(data.session, stored.user);
        this.saveSession(mapped.session, mapped.user);
        return mapped;
      }
    } catch (e) {
      console.warn('[Supabase OAuth] Failed to check OAuth session:', e);
    }
    return null;
  },

  /**
   * 6. Sign Out
   */
  async signOut(): Promise<void> {
    try {
      if (isRealSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Error signing out from Supabase:', e);
    } finally {
      this.clearSession();
    }
  },
};

