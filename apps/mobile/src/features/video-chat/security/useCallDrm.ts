import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useCallStore } from '../stores/useCallStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { toast } from '../../../shared/stores/useToastStore';

import { nativeDrmBridge } from './nativeDrmBridge';

export interface DrmViolationEvent {
  type: 'screenshot_shortcut' | 'screen_record' | 'window_blur' | 'devtools_inspect';
  timestamp: number;
  userId: string;
}

export const useCallDrm = () => {
  const { stage, endCall } = useCallStore();
  const { user } = useAuthStore();
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationReason, setLastViolationReason] = useState<string | null>(null);

  const violationCountRef = useRef(0);

  const triggerViolation = useCallback(
    (reason: string, violationType: DrmViolationEvent['type']) => {
      violationCountRef.current += 1;
      const count = violationCountRef.current;
      setViolationCount(count);
      setLastViolationReason(reason);
      setIsShieldActive(true);

      console.warn(`[DRM SHIELD] Pelanggaran terdeteksi (#${count}): ${reason}`);

      // Jika mencoba screenshot berulang kali (misal >= 2 kali), langsung putus panggilan
      if (count >= 2) {
        setTimeout(() => {
          endCall('drm_violation_repeated');
          toast.show('Panggilan diakhiri demi perlindungan privasi.', 'error');
        }, 1200);
      }
    },
    [endCall]
  );

  const dismissShield = useCallback(() => {
    setIsShieldActive(false);
    setLastViolationReason(null);
  }, []);

  useEffect(() => {
    if (stage !== 'in_call') {
      setIsShieldActive(false);
      violationCountRef.current = 0;
      setViolationCount(0);
      nativeDrmBridge.disableCallProtection();
      return;
    }

    // Aktifkan Hardware-level DRM (Android FLAG_SECURE / iOS isCaptured)
    nativeDrmBridge.enableCallProtection();

    if (Platform.OS === 'web') {
      // 1. Deteksi Tombol Shortcut Screenshot & Snipping Tool
      const handleKeyDown = (e: KeyboardEvent) => {
        // PrintScreen key
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          triggerViolation('Tombol PrintScreen terdeteksi', 'screenshot_shortcut');
          return;
        }

        // Mac: Cmd + Shift + 3 / 4 / 5 (Screenshot shortcut)
        if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
          e.preventDefault();
          triggerViolation('Shortcut tangkapan layar Mac terdeteksi', 'screenshot_shortcut');
          return;
        }

        // Windows: Win + Shift + S (Snipping Tool)
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          triggerViolation('Shortcut Snipping Tool terdeteksi', 'screenshot_shortcut');
          return;
        }

        // F12 or Ctrl+Shift+I (DevTools Inspect)
        if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
          e.preventDefault();
          triggerViolation('Inspeksi Developer Tools terdeteksi', 'devtools_inspect');
          return;
        }
      };

      // 2. Deteksi Tab Unfocus / Window Blur (saat screen capture tool overlay aktif)
      const handleWindowBlur = () => {
        // Saat call aktif, jika window blur (misal membuka OBS/Snipping Tool overlay)
        setIsShieldActive(true);
        setLastViolationReason('Layar disamarkan karena jendela tidak aktif (Anti Screen-Grab)');
      };

      const handleWindowFocus = () => {
        // Kembalikan shield jika bukan pelanggaran berat
        if (violationCountRef.current < 2) {
          setIsShieldActive(false);
          setLastViolationReason(null);
        }
      };

      // 3. Deteksi Visibility Change
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setIsShieldActive(true);
          setLastViolationReason('Panggilan disamarkan saat aplikasi berada di latar belakang');
        } else if (violationCountRef.current < 2) {
          setIsShieldActive(false);
        }
      };

      // 4. Disable Context Menu (Right Click)
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('contextmenu', handleContextMenu);

      return () => {
        nativeDrmBridge.disableCallProtection();
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('contextmenu', handleContextMenu);
      };
    } else {
      return () => {
        nativeDrmBridge.disableCallProtection();
      };
    }
  }, [stage, triggerViolation]);

  return {
    isShieldActive,
    violationCount,
    lastViolationReason,
    dismissShield,
  };
};
