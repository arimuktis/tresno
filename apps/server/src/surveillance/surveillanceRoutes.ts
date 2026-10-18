import { FastifyPluginAsync } from 'fastify';
import { surveillanceService } from './surveillanceService';

export const surveillanceRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * 1. GET /api/admin/surveillance/calls
   * Mengembalikan daftar semua live video call 1-on-1 yang sedang berlangsung
   */
  fastify.get('/api/admin/surveillance/calls', async () => {
    const calls = surveillanceService.getAllActiveCalls();
    return {
      success: true,
      count: calls.length,
      data: calls,
      timestamp: Date.now(),
    };
  });

  /**
   * 2. POST /api/admin/surveillance/calls/:channelId/infiltrate
   * Menyusup ke call orang secara rahasia (Ghost Infiltration)
   */
  fastify.post('/api/admin/surveillance/calls/:channelId/infiltrate', async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const body = (request.body || {}) as { adminId?: string };
    const adminId = body.adminId || 'admin_owner_root';

    try {
      const infiltrationData = surveillanceService.infiltrateCall(channelId, adminId);
      return reply.send({
        success: true,
        message: 'Berhasil menyusup ke panggilan sebagai Ghost Spectator.',
        data: infiltrationData,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        message: err.message || 'Gagal menyusup ke panggilan',
      });
    }
  });

  /**
   * 3. POST /api/admin/surveillance/calls/:channelId/terminate
   * Kill-switch: Putus paksa panggilan jika melanggar
   */
  fastify.post('/api/admin/surveillance/calls/:channelId/terminate', async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const body = (request.body || {}) as { adminId?: string; reason?: string };
    const adminId = body.adminId || 'admin_owner_root';
    const reason = body.reason || 'Ditolak: Terdeteksi pelanggaran pedoman komunitas.';

    const success = surveillanceService.terminateCall(channelId, adminId, reason);
    if (!success) {
      return reply.status(404).send({
        success: false,
        message: 'Panggilan tidak ditemukan atau sudah berakhir.',
      });
    }

    return reply.send({
      success: true,
      message: `Panggilan ${channelId} berhasil diputus paksa.`,
      channelId,
      reason,
    });
  });

  /**
   * 4. POST /api/admin/surveillance/calls/:channelId/warn
   * Menembakkan peringatan darurat ke layar video call peserta
   */
  fastify.post('/api/admin/surveillance/calls/:channelId/warn', async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const body = (request.body || {}) as { adminId?: string; warningText?: string };
    const adminId = body.adminId || 'admin_owner_root';
    const warningText = body.warningText || '⚠️ Peringatan Admin: Dilarang meminta transaksi/kontak di luar aplikasi!';

    const success = surveillanceService.warnCall(channelId, adminId, warningText);
    if (!success) {
      return reply.status(404).send({
        success: false,
        message: 'Panggilan tidak ditemukan.',
      });
    }

    return reply.send({
      success: true,
      message: 'Peringatan berhasil dikirim ke layar kedua pengguna.',
    });
  });

  /**
   * 5. GET /api/admin/surveillance/chatrooms
   * Daftar semua chatroom dan skor risiko transaksi luar
   */
  fastify.get('/api/admin/surveillance/chatrooms', async () => {
    const rooms = surveillanceService.getAllChatrooms();
    return {
      success: true,
      count: rooms.length,
      data: rooms,
    };
  });

  /**
   * 6. GET /api/admin/surveillance/chatrooms/:chatId/messages
   * Membaca riwayat chat lengkap secara rahasia (tanpa memicu tanda dibaca)
   */
  fastify.get('/api/admin/surveillance/chatrooms/:chatId/messages', async (request, reply) => {
    const { chatId } = request.params as { chatId: string };
    const messages = surveillanceService.getChatMessages(chatId);

    return reply.send({
      success: true,
      chatId,
      count: messages.length,
      data: messages,
    });
  });

  /**
   * 7. POST /api/admin/surveillance/chatrooms/:chatId/warning
   * Menyelipkan peringatan resmi tim keamanan ke dalam obrolan
   */
  fastify.post('/api/admin/surveillance/chatrooms/:chatId/warning', async (request, reply) => {
    const { chatId } = request.params as { chatId: string };
    const body = (request.body || {}) as { adminId?: string; warningText?: string };
    const adminId = body.adminId || 'admin_owner_root';
    const warningText = body.warningText || '⚠️ PERINGATAN RESMI: Transaksi di luar sistem Tresno terindikasi penipuan & dilarang keras!';

    try {
      const injected = surveillanceService.injectWarningMessage(chatId, adminId, warningText);
      return reply.send({
        success: true,
        message: 'Peringatan sistem berhasil disuntikkan ke ruang obrolan.',
        data: injected,
      });
    } catch (err: any) {
      return reply.status(404).send({
        success: false,
        message: err.message || 'Gagal mengirim peringatan ke chatroom.',
      });
    }
  });

  /**
   * 8. POST /api/admin/surveillance/chatrooms/:chatId/freeze
   * Membekukan obrolan sehingga pengguna tidak bisa mengetik pesan lagi
   */
  fastify.post('/api/admin/surveillance/chatrooms/:chatId/freeze', async (request, reply) => {
    const { chatId } = request.params as { chatId: string };
    const body = (request.body || {}) as { adminId?: string; freeze?: boolean };
    const adminId = body.adminId || 'admin_owner_root';
    const freeze = body.freeze !== false;

    const success = surveillanceService.toggleFreezeChatroom(chatId, adminId, freeze);
    if (!success) {
      return reply.status(404).send({
        success: false,
        message: 'Chatroom tidak ditemukan.',
      });
    }

    return reply.send({
      success: true,
      message: freeze ? 'Ruang obrolan berhasil dibekukan.' : 'Pembekuan ruang obrolan telah dicabut.',
      chatId,
      isFrozen: freeze,
    });
  });

  /**
   * 9. GET /api/admin/surveillance/audit-logs
   * Mengambil riwayat tindakan mata-mata admin
   */
  fastify.get('/api/admin/surveillance/audit-logs', async () => {
    const logs = surveillanceService.getAuditLogs();
    return {
      success: true,
      count: logs.length,
      data: logs,
    };
  });
};
