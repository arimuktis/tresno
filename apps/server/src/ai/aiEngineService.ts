import {
  IcebreakerSuggestion,
  SemanticMatchResult,
  ModerationVectorScanResult,
} from '@tresno/shared';
import { pgvectorService } from './pgvectorService';

/**
 * AI Intelligence Engine Service
 * Mengelola fitur cerdas: Smart Icebreaker Assistant, Semantic Matchmaking, dan Moderasi Vektor
 */
class AiEngineService {
  /**
   * Menghasilkan rekomendasi kalimat pembuka obrolan (Icebreaker) yang cerdas
   * disesuaikan dengan kepribadian host dan preferensi obrolan.
   */
  public generateIcebreakers(
    hostId: string,
    hostNickname?: string,
    userTopic?: string
  ): IcebreakerSuggestion[] {
    const name = hostNickname || 'Kakak';
    const suggestions: IcebreakerSuggestion[] = [
      {
        id: `ib_${Date.now()}_1`,
        text: `Halo ${name}! Senyummu di story manis banget, lagi asik ngapain nih malam ini? 😊`,
        category: 'CASUAL',
        relevanceScore: 0.95,
        tone: 'Hangat & Ramah',
      },
      {
        id: `ib_${Date.now()}_2`,
        text: `Hai ${name}, kalau lagi capek seharian, biasanya kamu lebih suka dengerin musik apa rebahan santai? 🎧✨`,
        category: 'DEEP',
        relevanceScore: 0.92,
        tone: 'Mendalam & Perhatian',
      },
      {
        id: `ib_${Date.now()}_3`,
        text: `Tebak deh ${name}, ada satu hal yang bikin aku langsung mampir ke profil kamu... penasaran gak? 😉`,
        category: 'FLIRTY',
        relevanceScore: 0.88,
        tone: 'Menggoda Halus',
      },
      {
        id: `ib_${Date.now()}_4`,
        text: `Halo ${name}! Boleh request kamu nyanyi satu reff lagu favorit gak nih? Suaramu pasti merdu banget 🎶`,
        category: 'FUN',
        relevanceScore: 0.91,
        tone: 'Ceria & Aktif',
      },
    ];

    if (userTopic && userTopic.toLowerCase().includes('curhat')) {
      suggestions.unshift({
        id: `ib_${Date.now()}_0`,
        text: `Malam ${name}, lagi butuh temen ngobrol santai buat curhat hari ini yang lumayan padat... boleh kan? ☕`,
        category: 'DEEP',
        relevanceScore: 0.99,
        tone: 'Empatik & Personal',
      });
    }

    return suggestions;
  }

  /**
   * Rekomendasi Host Semantik Berdasarkan Query Bahasa Alami
   */
  public recommendHostsSemantic(
    queryText: string,
    limit: number = 5,
    genderFilter?: 'female' | 'male'
  ): SemanticMatchResult[] {
    return pgvectorService.searchHostsSemantic(queryText, limit, genderFilter);
  }

  /**
   * Pemindaian Moderasi Konten Menggunakan Jarak Vektor Kosinus
   */
  public scanContent(text: string): ModerationVectorScanResult {
    return pgvectorService.scanContentVector(text);
  }

  /**
   * Analisis Risiko Churn Host / User (Retention AI Telemetry)
   */
  public predictRetentionRisk(stats: {
    totalCalls24h: number;
    idleMinutes: number;
    coinsSpent24h: number;
    lastActiveHoursAgo: number;
  }): {
    churnRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    churnProbabilityScore: number;
    recommendedRetentionAction: string;
  } {
    let score = 0.15;

    if (stats.idleMinutes > 120 && stats.totalCalls24h === 0) {
      score += 0.55;
    } else if (stats.idleMinutes > 60) {
      score += 0.3;
    }

    if (stats.lastActiveHoursAgo > 48) {
      score += 0.25;
    }

    const clamped = Math.min(0.99, Math.max(0.05, score));
    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let action = 'Pertahankan interaksi normal';

    if (clamped >= 0.7) {
      level = 'HIGH';
      action = 'Terapkan Traffic Booster otomatis + berikan notifikasi dorongan panggilan';
    } else if (clamped >= 0.4) {
      level = 'MEDIUM';
      action = 'Prioritaskan pada giliran radar berikutnya (Anti-Sepi Boost)';
    }

    return {
      churnRiskLevel: level,
      churnProbabilityScore: Number(clamped.toFixed(2)),
      recommendedRetentionAction: action,
    };
  }
}

export const aiEngineService = new AiEngineService();
