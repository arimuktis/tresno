import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { X, Sparkles, Compass, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { EgoAtmosphere } from './EgoAtmosphere';
import { EgoCard } from './EgoCard';
import { EgoCarousel } from './EgoCarousel';
import { EgoOrganicRibbons } from './EgoOrganicRibbons';
import { EgoPillSelector } from './EgoPillSelector';
import { EgoTerminalSnippet } from './EgoTerminalSnippet';
import { useThemeStore } from '../../../theme/useThemeStore';
import { toast } from '../../stores/useToastStore';

export interface EgoWelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EgoWelcomeModal: React.FC<EgoWelcomeModalProps> = ({ visible, onClose }) => {
  const { setAccentKey, setThemeMode, accentKey } = useThemeStore();

  const handleApplyEgoTheme = () => {
    setAccentKey('ego');
    setThemeMode('light');
    toast.success('Tema Ego Sapphire & Liquid Glass berhasil diterapkan!');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        {/* Floating Close Button */}
        <TouchableOpacity
          style={styles.floatingCloseBtn}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Floating Apply Theme Action */}
        <TouchableOpacity
          style={styles.floatingThemeBtn}
          onPress={handleApplyEgoTheme}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color="#104ECB" style={{ marginRight: 6 }} />
          <Text style={styles.floatingThemeBtnText}>
            {accentKey === 'ego' ? 'Tema Ego Aktif' : 'Terapkan Tema Ego'}
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
        >
          <EgoAtmosphere
            title="Welcome aboard!"
            subtitle="Follow the guides below to get started"
          >
            {/* Gesture-optimized Snapping Carousel with Peeking Affordance */}
            <EgoCarousel gap={16} horizontalPadding={20} showIndicators={true} showChevrons={true}>
              {/* CARD 1: ego(lite) is ready to work with your agents */}
              <EgoCard
                title="ego"
                titleItalicPart="lite"
                titleSuffix="is ready to work with your agents"
                subtitle="Your agent now runs browser tasks faster, reuses past successes, and uses fewer tokens."
                minHeight={470}
                footerPillContent={
                  <View style={styles.card1FooterContent}>
                    <Text style={styles.bulletItem}>
                      • To start using ego, <Text style={{ fontWeight: '700' }}>restart your agent.</Text>
                    </Text>
                    <Text style={[styles.bulletItem, { marginTop: 6 }]}>
                      • If ego(<Text style={{ fontStyle: 'italic' }}>lite</Text>) is unavailable or the skill is missing, manually install it by running{' '}
                      <Text style={styles.inlineCodeSnippet}>`npx skills add citrolabs/ego-lite`</Text> in your agent.
                    </Text>
                  </View>
                }
              >
                {/* Colorful Organic Overlapping Ribbon Loops */}
                <View style={styles.ribbonContainer}>
                  <EgoOrganicRibbons height={130} />
                </View>
              </EgoCard>

              {/* CARD 2: Try ego(lite) with your agent */}
              <EgoCard
                title="Try ego"
                titleItalicPart="lite"
                titleSuffix="with your 🤖 agent"
                minHeight={470}
              >
                <View style={{ marginTop: 4 }}>
                  {/* Step 1: Set up in Codex pill selector */}
                  <EgoPillSelector
                    stepNumber={1}
                    stepTitle="Set up your agent"
                    label="Set up in"
                    currentOption="Codex"
                    options={['Codex', 'Claude Desktop', 'Gemini CLI', 'Tresno Agent']}
                    onSelectOption={(opt) => toast.info(`Agent target diubah ke ${opt}`)}
                    onPressAction={() => toast.info('Membuka dokumentasi setup agent...')}
                  />

                  {/* Step 2: Paste terminal example */}
                  <EgoTerminalSnippet
                    stepNumber={2}
                    stepInstruction="Type /ego-browser followed by your task in the agent, or specify using ego browser in your prompt."
                    headerLabel="Paste example to your agent"
                    commandText="/ego-browser OpenAI & Anthropic blogs, summarize latest noteworthy updates"
                    previewBulletText="I'll use ego-browser to explore OpenAI's main page and discover today's interesting articles — featured article, 'Did you know', 'In the news', etc."
                  />
                </View>
              </EgoCard>

              {/* CARD 3: Discover enhancements */}
              <EgoCard
                title="Discover"
                titleSuffix="enhancements"
                subtitle="Explore powerful agent capabilities designed to speed up your workflow."
                minHeight={470}
              >
                <View style={styles.discoverList}>
                  {/* Tutorial Item 1 */}
                  <View style={styles.tutorialCard}>
                    <Image
                      source={{
                        uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
                      }}
                      style={styles.tutorialImage}
                    />
                    <View style={styles.tutorialBadge}>
                      <Text style={styles.tutorialBadgeText}>Tutorial</Text>
                    </View>
                  </View>

                  {/* Tutorial Item 2 */}
                  <View style={styles.featureRow}>
                    <View style={styles.featureIconBox}>
                      <Compass size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureTitle}>Analyze Competitor Products</Text>
                      <Text style={styles.featureSub}>
                        Find yourself the best market data and track trends automatically.
                      </Text>
                    </View>
                  </View>
                </View>
              </EgoCard>
            </EgoCarousel>
          </EgoAtmosphere>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#104ECB',
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 50,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
      default: {},
    }),
  },
  floatingThemeBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 24 : 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 100,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  floatingThemeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#104ECB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  cardsRow: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card1FooterContent: {
    gap: 4,
  },
  bulletItem: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  inlineCodeSnippet: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    color: '#0F172A',
    fontWeight: '600',
  },
  ribbonContainer: {
    marginTop: 'auto',
    marginBottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverList: {
    marginTop: 8,
    gap: 14,
  },
  tutorialCard: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  tutorialImage: {
    width: '100%',
    height: '100%',
  },
  tutorialBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tutorialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
});
