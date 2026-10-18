/**
 * Telegram-Style Micro-Batching Read Receipt Manager
 *
 * Mengatasi masalah "40 request dalam 2 detik saat scrolling":
 * 1. Menghindari spam network request untuk setiap baris chat yang terlihat di viewport.
 * 2. Mengumpulkan (batch) message IDs yang dibaca dalam jendela waktu 500ms (flush window).
 * 3. Mendukung 2 strategi kelas dunia:
 *    - Strategi A (Telegram Native): Mengirimkan `maxReadId` (sekuensial), menandai seluruh pesan <= maxReadId.
 *    - Strategi B (ID List Batching): Mengirimkan array ID unik sekaligus saat jendela 500ms habis atau kapasitas penuh.
 */

export interface BatchReadCallback {
  (chatId: string, messageIds: string[], maxReadSequenceId?: number): void;
}

export class ReadReceiptBatcher {
  private chatId: string;
  private pendingIds: Set<string> = new Set();
  private maxSequenceSeen: number = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly flushWindowMs: number;
  private readonly maxBatchSize: number;
  private onFlush: BatchReadCallback;

  constructor(
    chatId: string,
    onFlush: BatchReadCallback,
    flushWindowMs: number = 500,
    maxBatchSize: number = 30
  ) {
    this.chatId = chatId;
    this.onFlush = onFlush;
    this.flushWindowMs = flushWindowMs;
    this.maxBatchSize = maxBatchSize;
  }

  /**
   * Dipanggil saat pesan masuk ke viewport pengguna saat scrolling.
   */
  public markVisible(messageId: string, sequenceId?: number) {
    this.pendingIds.add(messageId);

    if (sequenceId !== undefined && sequenceId > this.maxSequenceSeen) {
      this.maxSequenceSeen = sequenceId;
    }

    // Jika ukuran batch sudah mencapai kapasitas maksimal, flush seketika
    if (this.pendingIds.size >= this.maxBatchSize) {
      this.flush();
      return;
    }

    // Jika belum ada timer window berjalan, pasang timer untuk flush 500ms setelah pesan pertama masuk
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, this.flushWindowMs);
    }
  }

  /**
   * Mengirimkan batch secara atomik dan membersihkan antrean.
   */
  public flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.pendingIds.size === 0) return;

    const idsToFlush = Array.from(this.pendingIds);
    const maxSeq = this.maxSequenceSeen;

    this.pendingIds.clear();

    // Kirim batch tunggal ke backend WebSocket
    this.onFlush(this.chatId, idsToFlush, maxSeq > 0 ? maxSeq : undefined);
  }

  /**
   * Bersihkan saat komponen unmount atau chat ditutup
   */
  public destroy() {
    this.flush();
  }
}
