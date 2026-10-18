import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Coins,
  Gem,
  Award,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  ImageIcon,
} from 'lucide-react-native';
import { useThemeStore } from '../../../../theme/useThemeStore';
import { useAdminCmsStore, CmsUserItem } from '../../stores/useAdminCmsStore';

export const CmsUsersView: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    users,
    selectedUser,
    setSelectedUser,
    adjustUserBalance,
    toggleUserBan,
    toggleHostKyc,
  } = useAdminCmsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HOSTS' | 'VIPS' | 'BANNED'>('ALL');
  const [balanceDelta, setBalanceDelta] = useState('100');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'HOSTS') return u.isHost;
    if (activeFilter === 'VIPS') return u.isVip;
    if (activeFilter === 'BANNED') return u.isBanned;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Search & Filter Bar */}
      <View style={styles.topFilterBar}>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <Search size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari user / host berdasarkan nama atau ID..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterChips}>
          {(['ALL', 'HOSTS', 'VIPS', 'BANNED'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && { backgroundColor: '#FF2E63' },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: activeFilter === filter ? '#FFF' : colors.textSecondary },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* User List */}
        <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
          {filteredUsers.map((user) => {
            const isSelected = selectedUser?.id === user.id;
            return (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userCard,
                  { backgroundColor: colors.surfaceCard, borderColor: isSelected ? '#FF2E63' : colors.border },
                ]}
                onPress={() => setSelectedUser(user)}
              >
                <View style={styles.userCardLeft}>
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
                  {user.isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.userCardMeta}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.nickname}</Text>
                    {user.isHost && (
                      <View style={[styles.tagBadge, { backgroundColor: 'rgba(255,46,99,0.15)' }]}>
                        <Text style={[styles.tagText, { color: '#FF2E63' }]}>HOST</Text>
                      </View>
                    )}
                    {user.isVip && (
                      <View style={[styles.tagBadge, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                        <Text style={[styles.tagText, { color: '#F59E0B' }]}>VIP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{user.username}</Text>
                  <View style={styles.balanceRow}>
                    <Coins size={12} color="#FFB800" />
                    <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
                      {user.coinBalance.toLocaleString('id-ID')} koin
                    </Text>
                    {user.isHost && (
                      <>
                        <Gem size={12} color="#00D19D" style={{ marginLeft: 6 }} />
                        <Text style={[styles.balanceText, { color: colors.textSecondary }]}>
                          {user.diamondBalance.toLocaleString('id-ID')} pts
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.userCardRight}>
                  {user.isBanned ? (
                    <View style={styles.bannedBadge}>
                      <Text style={styles.bannedText}>BANNED</Text>
                    </View>
                  ) : (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>AKTIF</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* User Details Drawer / Panel */}
        {selectedUser ? (
          <ScrollView style={[styles.detailPanel, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <View style={styles.detailHeader}>
              <Image source={{ uri: selectedUser.avatarUrl }} style={styles.detailAvatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.detailName, { color: colors.text }]}>
                  {selectedUser.nickname}
                </Text>
                <Text style={[styles.detailHandle, { color: colors.textSecondary }]}>
                  @{selectedUser.username} &bull; ID: {selectedUser.id}
                </Text>
                <View style={styles.badgeRow}>
                  {selectedUser.isKycVerified ? (
                    <View style={[styles.kycBadge, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={[styles.kycText, { color: '#10B981' }]}>KYC Terverifikasi</Text>
                    </View>
                  ) : (
                    <View style={[styles.kycBadge, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                      <XCircle size={12} color="#EF4444" />
                      <Text style={[styles.kycText, { color: '#EF4444' }]}>Belum KYC</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* 8-Photo Album Inspector */}
            <View style={styles.albumSection}>
              <View style={styles.albumTitleRow}>
                <ImageIcon size={16} color="#FF2E63" />
                <Text style={[styles.albumTitle, { color: colors.text }]}>
                  Album Foto Profil ({selectedUser.albumPhotos.length}/8 Foto)
                </Text>
              </View>
              <Text style={[styles.albumSubtitle, { color: colors.textMuted }]}>
                Maksimal 8 foto sesuai standar aturan Tresno (`MAX_ALBUM_PHOTOS = 8`).
              </Text>

              <View style={styles.albumGrid}>
                {selectedUser.albumPhotos.map((photo, pIdx) => (
                  <View key={photo.id} style={styles.albumPhotoBox}>
                    <Image source={{ uri: photo.url }} style={styles.albumImg} />
                    {photo.isCover && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverText}>SAMPUL</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.photoStatusPill,
                        {
                          backgroundColor:
                            photo.status === 'approved'
                              ? 'rgba(16,185,129,0.85)'
                              : photo.status === 'rejected'
                              ? 'rgba(239,68,68,0.85)'
                              : 'rgba(245,158,11,0.85)',
                        },
                      ]}
                    >
                      <Text style={styles.photoStatusText}>{photo.status.toUpperCase()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Balance Adjustment Tool */}
            <View style={styles.balanceToolSection}>
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                Penyesuaian Saldo Koin
              </Text>
              <View style={styles.balanceActionRow}>
                <TouchableOpacity
                  style={[styles.quickAdjBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => adjustUserBalance(selectedUser.id, 100, 'Bonus Event Komunitas')}
                >
                  <Plus size={12} color="#FFF" />
                  <Text style={styles.quickAdjText}>100 Koin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAdjBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => adjustUserBalance(selectedUser.id, 500, 'Top-up Manual Admin')}
                >
                  <Plus size={12} color="#FFF" />
                  <Text style={styles.quickAdjText}>500 Koin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAdjBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => adjustUserBalance(selectedUser.id, -100, 'Koreksi Chargeback')}
                >
                  <Minus size={12} color="#FFF" />
                  <Text style={styles.quickAdjText}>100 Koin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Account Status Actions */}
            <View style={styles.accountActionsSection}>
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>
                Kontrol Status Akun
              </Text>
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: selectedUser.isBanned ? '#10B981' : '#EF4444' },
                  ]}
                  onPress={() => toggleUserBan(selectedUser.id, 'Pelanggaran pedoman')}
                >
                  <Text style={styles.actionBtnText}>
                    {selectedUser.isBanned ? 'Buka Blokir Akun' : 'Blokir Akun (Ban)'}
                  </Text>
                </TouchableOpacity>

                {selectedUser.isHost && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFB800' }]}
                    onPress={() => toggleHostKyc(selectedUser.id)}
                  >
                    <Text style={[styles.actionBtnText, { color: '#000' }]}>
                      {selectedUser.isKycVerified ? 'Batalkan KYC' : 'Verifikasi KYC'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={[styles.emptyDetail, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
            <Users size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Pilih salah satu user di sebelah kiri untuk melihat detail album foto & pengaturan akun.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topFilterBar: {
    marginBottom: 14,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  userCardLeft: {
    position: 'relative',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#000',
  },
  userCardMeta: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
  },
  tagBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  userHandle: {
    fontSize: 11,
    marginTop: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  balanceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  userCardRight: {
    alignItems: 'flex-end',
  },
  bannedBadge: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bannedText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  activeBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  detailPanel: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  detailName: {
    fontSize: 15,
    fontWeight: '800',
  },
  detailHandle: {
    fontSize: 11,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kycText: {
    fontSize: 10,
    fontWeight: '700',
  },
  albumSection: {
    marginBottom: 16,
  },
  albumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  albumTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  albumSubtitle: {
    fontSize: 11,
    marginBottom: 10,
  },
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  albumPhotoBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  albumImg: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#FF2E63',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  coverText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '800',
  },
  photoStatusPill: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  photoStatusText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '800',
  },
  balanceToolSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  balanceActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAdjBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickAdjText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  accountActionsSection: {
    marginBottom: 16,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyDetail: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 240,
  },
});
