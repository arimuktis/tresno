import { create } from 'zustand';
import { Gender } from '@tresno/shared';
import { authService, AuthSession, AuthUser } from '../services/authService';
import { socketService } from '../../../shared/services/socketService';
import { supabaseRealtimeService } from '../../../shared/services/supabaseRealtimeService';
import { toast } from '../../../shared/stores/useToastStore';

interface AuthState {
  currentStep: 'splash' | 'login' | 'onboarding' | 'main';
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  errorMessage: string | null;

  // Phone Modal Flow (ala Tigo)
  isPhoneModalOpen: boolean;
  phoneStep: 'phone' | 'otp';
  pendingPhone: string;
  otpCountdown: number;

  // Email Modal Flow (ala Tigo)
  isEmailModalOpen: boolean;
  openEmailModal: () => void;
  closeEmailModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<{ success: boolean; needsConfirmation?: boolean }>;
  resetPassword: (email: string) => Promise<boolean>;

  setStep: (step: 'splash' | 'login' | 'onboarding' | 'main') => void;
  openPhoneModal: () => void;
  closePhoneModal: () => void;

  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<boolean>;

  completeOnboarding: (data: {
    nickname: string;
    gender: Gender;
    age: number;
    isHost: boolean;
    agencyCode?: string;
  }) => Promise<void>;

  refreshSession: () => Promise<boolean>;
  checkAuthSession: () => Promise<void>;
  logout: () => Promise<void>;

  // Profile Preview & Edit Modals (ala Tigo)
  isMyProfilePreviewOpen: boolean;
  openMyProfilePreview: () => void;
  closeMyProfilePreview: () => void;

  isEditProfileOpen: boolean;
  openEditProfile: () => void;
  closeEditProfile: () => void;

  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentStep: 'splash',
  user: null,
  session: null,
  isLoading: false,
  errorMessage: null,

  isPhoneModalOpen: false,
  phoneStep: 'phone',
  pendingPhone: '',
  otpCountdown: 0,

  isEmailModalOpen: false,
  openEmailModal: () => set({ isEmailModalOpen: true, errorMessage: null }),
  closeEmailModal: () => set({ isEmailModalOpen: false, errorMessage: null }),

  setStep: (step) => set({ currentStep: step }),

  openPhoneModal: () =>
    set({
      isPhoneModalOpen: true,
      phoneStep: 'phone',
      pendingPhone: '',
      errorMessage: null,
      otpCountdown: 0,
    }),

  closePhoneModal: () =>
    set({
      isPhoneModalOpen: false,
      phoneStep: 'phone',
      pendingPhone: '',
      errorMessage: null,
      otpCountdown: 0,
    }),

  /**
   * 1. Login Google OAuth dengan Refresh Token
   */
  loginWithGoogle: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { session, user } = await authService.signInWithGoogle();

      // Sambungkan WebSocket & Supabase Realtime dengan user token baru
      socketService.connect(user.id, user.nickname);
      supabaseRealtimeService.init(user);

      set({
        session,
        user,
        isLoading: false,
        currentStep: user.isOnboarded ? 'main' : 'onboarding',
      });
      toast.success(`Berhasil login via Google OAuth: ${user.nickname}`);
    } catch (err: any) {
      set({
        isLoading: false,
        errorMessage: err?.message || 'Gagal masuk dengan akun Google',
      });
      toast.error(err?.message || 'Gagal masuk dengan Google OAuth');
    }
  },

  /**
   * 2. Quick Guest Login (Device ID binding ala Tigo)
   */
  loginAsGuest: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { session, user } = await authService.signInAsGuest();
      socketService.connect(user.id, user.nickname);

      set({
        session,
        user,
        isLoading: false,
        currentStep: 'onboarding',
      });
    } catch (err: any) {
      set({
        isLoading: false,
        errorMessage: err?.message || 'Gagal masuk sebagai tamu',
      });
    }
  },

  /**
   * 3. Kirim OTP ke Nomor HP / WhatsApp
   */
  sendPhoneOtp: async (phone: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      await authService.sendPhoneOtp(phone);
      set({
        isLoading: false,
        pendingPhone: phone,
        phoneStep: 'otp',
        otpCountdown: 60,
      });

      // Mulai timer mundur 60 detik ala Tigo
      const timer = setInterval(() => {
        const current = get().otpCountdown;
        if (current <= 1) {
          clearInterval(timer);
          set({ otpCountdown: 0 });
        } else {
          set({ otpCountdown: current - 1 });
        }
      }, 1000);

      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        errorMessage: err?.message || 'Gagal mengirim kode verifikasi',
      });
      return false;
    }
  },

  /**
   * 4. Verifikasi Kode OTP (6 Digit)
   */
  verifyPhoneOtp: async (code: string) => {
    const { pendingPhone } = get();
    if (!pendingPhone) return false;

    set({ isLoading: true, errorMessage: null });
    try {
      const { session, user } = await authService.verifyPhoneOtp(pendingPhone, code);
      socketService.connect(user.id, user.nickname);

      set({
        session,
        user,
        isLoading: false,
        isPhoneModalOpen: false,
        currentStep: user.isOnboarded ? 'main' : 'onboarding',
      });
      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        errorMessage: err?.message || 'Kode OTP salah atau kedaluwarsa',
      });
      return false;
    }
  },

  /**
   * 5. Login dengan Email & Sandi (ala Tigo)
   */
  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { session, user } = await authService.signInWithEmail(email, password);
      socketService.connect(user.id, user.nickname);

      set({
        session,
        user,
        isLoading: false,
        isEmailModalOpen: false,
        currentStep: user.isOnboarded ? 'main' : 'onboarding',
      });

      toast.success(`Selamat datang kembali, ${user.nickname}!`);
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Email atau kata sandi tidak valid';
      set({
        isLoading: false,
        errorMessage: msg,
      });
      toast.error(msg);
      return false;
    }
  },

  /**
   * 6. Daftar Akun Baru dengan Email & Sandi
   */
  registerWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const result = await authService.signUpWithEmail(email, password);
      set({ isLoading: false });

      if (result.needsEmailConfirmation) {
        toast.info('Tautan aktivasi telah dikirim ke email kamu. Silakan verifikasi email Anda.');
        return { success: true, needsConfirmation: true };
      }

      if (result.session && result.user) {
        socketService.connect(result.user.id, result.user.nickname);
        set({
          session: result.session,
          user: result.user,
          isEmailModalOpen: false,
          currentStep: 'onboarding',
        });
        toast.success('Pendaftaran berhasil! Lengkapi profil kamu sekarang.');
        return { success: true, needsConfirmation: false };
      }

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Gagal mendaftar akun baru';
      set({
        isLoading: false,
        errorMessage: msg,
      });
      toast.error(msg);
      return { success: false };
    }
  },

  /**
   * 7. Reset Kata Sandi via Email
   */
  resetPassword: async (email: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const res = await authService.resetPassword(email);
      set({ isLoading: false });
      toast.success(res.message);
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Gagal mengirim tautan reset sandi';
      set({
        isLoading: false,
        errorMessage: msg,
      });
      toast.error(msg);
      return false;
    }
  },

  /**
   * 8. Selesai Onboarding (Update profil & arahkan ke main)
   */
  completeOnboarding: async (data) => {
    const { user, session } = get();
    if (!user) return;

    const updatedUser: AuthUser = {
      ...user,
      nickname: data.nickname,
      gender: data.gender,
      age: data.age,
      isHost: data.isHost,
      agencyCode: data.agencyCode,
      isOnboarded: true,
    };

    if (session) {
      authService.saveSession(session, updatedUser);
    }

    socketService.connect(updatedUser.id, updatedUser.nickname);

    set({
      user: updatedUser,
      currentStep: 'main',
    });
  },

  /**
   * 6. Silent Token Refresh (Auto refresh saat token expired)
   */
  refreshSession: async () => {
    try {
      const newSession = await authService.refreshSession();
      set({ session: newSession });
      return true;
    } catch (err) {
      console.warn('Failed to refresh token:', err);
      get().logout();
      return false;
    }
  },

  /**
   * 7. App Bootstrap Check Session (Saat aplikasi pertama dibuka)
   */
  checkAuthSession: async () => {
    try {
      // 1. Cek apakah ada Supabase OAuth redirect session di URL browser
      const oauthResult = await authService.checkSupabaseOAuthCallback();
      if (oauthResult) {
        const { session, user } = oauthResult;
        socketService.connect(user.id, user.nickname);
        supabaseRealtimeService.init(user);

        set({
          session,
          user,
          currentStep: user.isOnboarded ? 'main' : 'onboarding',
        });
        toast.success(`Selamat datang via Supabase OAuth: ${user.nickname}`);
        return;
      }

      // 2. Cek session tersimpan lokal
      const result = await authService.checkSession();
      if (result) {
        const { session, user } = result;
        socketService.connect(user.id, user.nickname);
        supabaseRealtimeService.init(user);

        set({
          session,
          user,
          currentStep: user.isOnboarded ? 'main' : 'onboarding',
        });
        return;
      }
    } catch (err: any) {
      console.warn('Session check failed or user banned:', err?.message);
    }
    set({ currentStep: 'login' });
  },

  /**
   * 8. Logout
   */
  logout: async () => {
    try {
      await authService.signOut();
    } finally {
      // 1. Putus koneksi WebSocket & Supabase Realtime
      socketService.disconnect();
      supabaseRealtimeService.disconnect();

      // 2. Bersihkan session storage jika ada
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('tresno_user_id');
      }

      // 3. Reset state auth dan modal terkait
      set({
        user: null,
        session: null,
        currentStep: 'login',
        errorMessage: null,
        isPhoneModalOpen: false,
        isEmailModalOpen: false,
        pendingPhone: '',
        otpCountdown: 0,
      });

      toast.info('Sesi Anda telah berhasil diakhiri.');
    }
  },

  // Profile Preview & Edit Modals (ala Tigo)
  isMyProfilePreviewOpen: false,
  openMyProfilePreview: () => set({ isMyProfilePreviewOpen: true }),
  closeMyProfilePreview: () => set({ isMyProfilePreviewOpen: false }),

  isEditProfileOpen: false,
  openEditProfile: () => set({ isEditProfileOpen: true }),
  closeEditProfile: () => set({ isEditProfileOpen: false }),

  updateProfile: async (data: Partial<AuthUser>) => {
    const { user, session } = get();
    if (!user) return;
    const updatedUser: AuthUser = {
      ...user,
      ...data,
    };
    if (session) {
      authService.saveSession(session, updatedUser);
    }
    set({ user: updatedUser });
    toast.success('Profil berhasil diperbarui!');
  },
}));
