-- ==========================================================
-- 02_COIN TRANSACTIONS & DOUBLE-ENTRY FINANCIAL LEDGER
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount BIGINT NOT NULL, -- Positif untuk topup/refund, Negatif untuk pemakaian
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'topup_qris', 'video_chat', 'gift_sent', 'gift_received', 'bonus'
    reference_id VARCHAR(100), -- Merujuk ke call_session_id atau order_id Midtrans
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user_created ON public.coin_transactions(user_id, created_at DESC);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
ON public.coin_transactions FOR SELECT 
USING (auth.uid() = user_id);
