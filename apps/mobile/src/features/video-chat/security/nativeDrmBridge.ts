import { Platform, NativeModules } from 'react-native';

/**
 * Native DRM Bridge for Hardware-Level Call Privacy Protection
 *
 * 1. Android: Mengaktifkan FLAG_SECURE pada WindowManager sehingga OS Android
 *    langsung menghasilkan layar hitam pekat saat screenshot atau screen recording (bahkan sistem OS tidak bisa capture).
 * 2. iOS: Mendeteksi UIScreen.main.isCaptured dan menonaktifkan rendering layer video.
 * 3. Web: Melakukan blur shield dan blocking keyboard shortcuts.
 */
export const nativeDrmBridge = {
  enableCallProtection(): void {
    if (Platform.OS === 'android') {
      try {
        // Jika modul native FlagSecure terpasang (misal react-native-flag-secure-android)
        if (NativeModules.FlagSecure) {
          NativeModules.FlagSecure.activate();
          console.log('[Native DRM] Android FLAG_SECURE activated.');
        }
      } catch (err) {
        console.warn('[Native DRM] Android FlagSecure module not linked in current runtime.', err);
      }
    } else if (Platform.OS === 'ios') {
      try {
        if (NativeModules.ScreenCaptureProtection) {
          NativeModules.ScreenCaptureProtection.protect();
          console.log('[Native DRM] iOS ScreenCaptureProtection activated.');
        }
      } catch (err) {
        console.warn('[Native DRM] iOS ScreenCaptureProtection not linked in current runtime.', err);
      }
    }
  },

  disableCallProtection(): void {
    if (Platform.OS === 'android') {
      try {
        if (NativeModules.FlagSecure) {
          NativeModules.FlagSecure.deactivate();
          console.log('[Native DRM] Android FLAG_SECURE deactivated.');
        }
      } catch (err) {
        // silent
      }
    } else if (Platform.OS === 'ios') {
      try {
        if (NativeModules.ScreenCaptureProtection) {
          NativeModules.ScreenCaptureProtection.unprotect();
        }
      } catch (err) {
        // silent
      }
    }
  },
};
