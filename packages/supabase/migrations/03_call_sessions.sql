-- ==========================================================
-- 03_CALL SESSIONS
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(100) UNIQUE NOT NULL,
    caller_id UUID NOT NULL REFERENCES public.profiles(id),
    callee_id UUID NOT NULL REFERENCES public.profiles(id),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    coins_spent BIGINT NOT NULL DEFAULT 0,
    diamonds_earned BIGINT NOT NULL DEFAULT 0,
    end_reason VARCHAR(50) DEFAULT 'in_progress', -- 'caller_ended', 'callee_ended', 'insufficient_balance', 'nsfw_detected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_sessions_caller ON public.call_sessions(caller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_sessions_callee ON public.call_sessions(callee_id, created_at DESC);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own call sessions" 
ON public.call_sessions FOR SELECT 
USING (auth.uid() = caller_id OR auth.uid() = callee_id);
