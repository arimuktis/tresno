import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useLegalModalStore } from '../../stores/useLegalModalStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Button } from '../atoms/Button';
import { X, FileText, Shield, AlertTriangle, ShieldCheck } from 'lucide-react-native';

export interface LegalModalProps {
  onAgree?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onAgree }) => {
  const { isOpen, activeDoc, close, setActiveDoc } = useLegalModalStore();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();

  const handleAgree = () => {
    if (onAgree) {
      onAgree();
    }
    close();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('legal.modalTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('legal.lastUpdated')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={close}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceCard }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View
            style={[
              styles.tabBar,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveDoc('terms')}
              style={[
                styles.tabItem,
                activeDoc === 'terms' && [styles.tabItemActive, { backgroundColor: colors.primary }],
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <FileText
                size={14}
                color={activeDoc === 'terms' ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabItemText,
                  { color: activeDoc === 'terms' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('legal.tabTerms')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveDoc('privacy')}
              style={[
                styles.tabItem,
                activeDoc === 'privacy' && [styles.tabItemActive, { backgroundColor: colors.primary }],
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Shield
                size={14}
                color={activeDoc === 'privacy' ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabItemText,
                  { color: activeDoc === 'privacy' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {t('legal.tabPrivacy')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Document Content ScrollView */}
          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.contentContainer}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {activeDoc === 'terms' ? (
              <>
                {/* 18+ Warning Banner */}
                <View
                  style={[
                    styles.alertBox,
                    {
                      backgroundColor: `${colors.danger}15`,
                      borderColor: colors.danger,
                    },
                  ]}
                >
                  <View style={{ marginRight: 10 }}>
                    <AlertTriangle size={22} color={colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertTitle, { color: colors.danger }]}>
                      {t('legal.termsBannerTitle')}
                    </Text>
                    <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>
                      {t('legal.termsBannerDesc')}
                    </Text>
                  </View>
                </View>

                {/* Section 1 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.termsSection1Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.termsSection1Body')}
                  </Text>
                </View>

                {/* Section 2 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.termsSection2Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.termsSection2Body')}
                  </Text>
                </View>

                {/* Section 3 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.termsSection3Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.termsSection3Body')}
                  </Text>
                </View>

                {/* Section 4 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.termsSection4Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.termsSection4Body')}
                  </Text>
                </View>

                {/* Section 5 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.termsSection5Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.termsSection5Body')}
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* Privacy Shield Banner */}
                <View
                  style={[
                    styles.alertBox,
                    {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <View style={{ marginRight: 10 }}>
                    <ShieldCheck size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertTitle, { color: colors.primary }]}>
                      {t('legal.privacyBannerTitle')}
                    </Text>
                    <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>
                      {t('legal.privacyBannerDesc')}
                    </Text>
                  </View>
                </View>

                {/* Section 1 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.privacySection1Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.privacySection1Body')}
                  </Text>
                </View>

                {/* Section 2 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.privacySection2Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.privacySection2Body')}
                  </Text>
                </View>

                {/* Section 3 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.privacySection3Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.privacySection3Body')}
                  </Text>
                </View>

                {/* Section 4 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.privacySection4Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.privacySection4Body')}
                  </Text>
                </View>

                {/* Section 5 */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('legal.privacySection5Title')}
                  </Text>
                  <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                    {t('legal.privacySection5Body')}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <Button
              title={t('legal.btnAgree')}
              variant="primary"
              size="lg"
              onPress={handleAgree}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18.5,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  contentScroll: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 12,
    lineHeight: 16.5,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 18,
  },
  sectionBody: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});
