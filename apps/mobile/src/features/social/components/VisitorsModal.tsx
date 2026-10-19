import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronLeft, MessageSquare } from 'lucide-react-native';
import { useSocialStore } from '../stores/useSocialStore';
import { useChatStore } from '../../messages/stores/useChatStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { VerifiedBadge } from '../../../shared/components/atoms/VerifiedBadge';
import { VisitorItem } from '@tresno/shared';

export const VisitorsModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { isVisitorsModalOpen, closeVisitorsModal, visitors } = useSocialStore();
  const { openChat } = useChatStore();

  if (!isVisitorsModalOpen) return null;

  const handleChat = (visitor: VisitorItem) => {
    closeVisitorsModal();
    openChat({
      id: visitor.userId,
      name: visitor.nickname,
      avatar: visitor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isOnline: true,
      isHost: false,
    });
  };

  return (
    <Modal
      visible={isVisitorsModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={closeVisitorsModal}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header ala Tigo */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={closeVisitorsModal}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('visitors.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Visitors List */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {visitors.map((visitor) => (
            <View
              key={visitor.id}
              style={[
                styles.visitorRow,
                { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              {/* Avatar */}
              <Image
                source={{
                  uri:
                    visitor.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                }}
                style={styles.avatar}
              />

              {/* Info Column */}
              <View style={styles.infoCol}>
                <View style={styles.nameRow}>
                  <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
                    {visitor.nickname}
                  </Text>
                  {visitor.isVerified && <VerifiedBadge size="sm" />}
                </View>

                <View style={styles.subRow}>
                  <Text
                    style={[
                      styles.genderAgeText,
                      { color: visitor.gender === 'female' ? '#FF2D55' : '#007AFF' },
                    ]}
                  >
                    {visitor.gender === 'female' ? '♀' : '♂'} {visitor.age}
                  </Text>
                  <Text style={styles.flagText}>{visitor.countryFlag}</Text>
                  <Text style={[styles.countryText, { color: colors.textSecondary }]}>
                    {visitor.country}
                  </Text>
                </View>
              </View>

              {/* Chat Action Button ala Tigo */}
              <TouchableOpacity
                style={[
                  styles.chatBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleChat(visitor)}
                activeOpacity={0.7}
              >
                <MessageSquare size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5EA',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  genderAgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  flagText: {
    fontSize: 13,
  },
  countryText: {
    fontSize: 12,
  },
  chatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
