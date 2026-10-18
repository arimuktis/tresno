-- ==========================================================
-- 04_ATOMIC BILLING & DEDUCTION FUNCTIONS (ZERO-LEAK)
-- ==========================================================

-- Fungsi pemotongan koin interval panggilan video secara ATOMIK
CREATE OR REPLACE FUNCTION public.deduct_call_coins(
    p_caller_id UUID,
    p_host_id UUID,
    p_channel_id VARCHAR,
    p_coins_to_deduct BIGINT,
    p_diamonds_to_award BIGINT
)
RETURNS JSONB AS $$
DECLARE
    v_current_coins BIGINT;
    v_new_coins BIGINT;
    v_current_diamonds BIGINT;
BEGIN
    -- 1. Kunci baris user pemanggil (Row-Level Lock) untuk mencegah race condition
    SELECT coin_balance INTO v_current_coins
    FROM public.profiles
    WHERE id = p_caller_id
    FOR UPDATE;

    -- Validasi saldo: apakah cukup?
    IF v_current_coins IS NULL OR v_current_coins < p_coins_to_deduct THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'reason', 'INSUFFICIENT_BALANCE',
            'current_balance', COALESCE(v_current_coins, 0)
        );
    END IF;

    -- 2. Potong saldo caller
    v_new_coins := v_current_coins - p_coins_to_deduct;
    UPDATE public.profiles
    SET coin_balance = v_new_coins,
        updated_at = NOW()
    WHERE id = p_caller_id;

    -- 3. Tambahkan diamonds ke host
    UPDATE public.profiles
    SET diamond_balance = diamond_balance + p_diamonds_to_award,
        updated_at = NOW()
    WHERE id = p_host_id;

    -- 4. Catat transaksi di Ledger untuk Caller
    INSERT INTO public.coin_transactions (
        user_id, amount, balance_before, balance_after, transaction_type, reference_id, description
    ) VALUES (
        p_caller_id, -p_coins_to_deduct, v_current_coins, v_new_coins, 'video_chat', p_channel_id, 'Biaya video chat per menit'
    );

    -- 5. Perbarui total biaya di session call
    UPDATE public.call_sessions
    SET coins_spent = coins_spent + p_coins_to_deduct,
        diamonds_earned = diamonds_earned + p_diamonds_to_award,
        duration_seconds = duration_seconds + 60
    WHERE channel_id = p_channel_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'new_balance', v_new_coins,
        'deducted', p_coins_to_deduct
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Fungsi pengiriman Virtual Gift secara ATOMIK
CREATE OR REPLACE FUNCTION public.send_gift(
    p_sender_id UUID,
    p_receiver_id UUID,
    p_gift_id INT,
    p_coin_price BIGINT,
    p_diamond_value BIGINT,
    p_channel_id VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    v_sender_coins BIGINT;
    v_new_coins BIGINT;
BEGIN
    SELECT coin_balance INTO v_sender_coins
    FROM public.profiles
    WHERE id = p_sender_id
    FOR UPDATE;

    IF v_sender_coins IS NULL OR v_sender_coins < p_coin_price THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'reason', 'INSUFFICIENT_BALANCE',
            'current_balance', COALESCE(v_sender_coins, 0)
        );
    END IF;

    v_new_coins := v_sender_coins - p_coin_price;

    UPDATE public.profiles
    SET coin_balance = v_new_coins,
        updated_at = NOW()
    WHERE id = p_sender_id;

    UPDATE public.profiles
    SET diamond_balance = diamond_balance + p_diamond_value,
        updated_at = NOW()
    WHERE id = p_receiver_id;

    INSERT INTO public.coin_transactions (
        user_id, amount, balance_before, balance_after, transaction_type, reference_id, description
    ) VALUES (
        p_sender_id, -p_coin_price, v_sender_coins, v_new_coins, 'gift_sent', p_channel_id, 'Mengirim hadiah in-call'
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'new_balance', v_new_coins,
        'gift_id', p_gift_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
