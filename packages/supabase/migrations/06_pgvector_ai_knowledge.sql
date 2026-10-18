-- ==========================================================
-- 06_PGVECTOR_AI_KNOWLEDGE.SQL
-- Tresno AI Intelligence, Semantic Matchmaking & PgVector Knowledge Store
-- ==========================================================

-- 1. Aktifkan ekstensi pgvector untuk pencarian kesamaan semantik
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabel Embedding Profil Pengguna (User Semantic Preferences)
CREATE TABLE IF NOT EXISTS public.profile_embeddings (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    embedding vector(384) NOT NULL, -- 384-dimensional dense vector (MiniLM / Transformer standard)
    vibe_summary TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}',
    personality_traits TEXT[] NOT NULL DEFAULT '{}',
    preferred_language VARCHAR(20) DEFAULT 'id',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Embedding Host & Anchor (Host Persona, Vibe, Topics)
CREATE TABLE IF NOT EXISTS public.host_embeddings (
    host_id VARCHAR(50) PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    gender VARCHAR(10) NOT NULL DEFAULT 'female',
    embedding vector(384) NOT NULL,
    vibe_description TEXT NOT NULL,
    talking_style TEXT NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    humor_level INT NOT NULL DEFAULT 7 CHECK (humor_level BETWEEN 1 AND 10),
    energy_level INT NOT NULL DEFAULT 8 CHECK (energy_level BETWEEN 1 AND 10),
    rating_score NUMERIC(3, 2) NOT NULL DEFAULT 4.95,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel Tolok Ukur Vektor Moderasi Konten (SARA, Pornografi, Toksisitas)
CREATE TABLE IF NOT EXISTS public.moderation_vector_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(30) NOT NULL CHECK (category IN ('SARA', 'PORNOGRAPHY', 'TOXICITY', 'SCAM')),
    pattern_text TEXT NOT NULL,
    embedding vector(384) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM')),
    action_policy VARCHAR(30) NOT NULL DEFAULT 'AUTO_REJECT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Knowledge Chunks AI Assistant (FAQ, Aturan, Tips Panggilan)
CREATE TABLE IF NOT EXISTS public.ai_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(50) NOT NULL CHECK (domain IN ('faq', 'billing_rules', 'community_guidelines', 'host_tips', 'icebreakers')),
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. High-Performance HNSW Vector Indexing (Cosine Distance Operator `<=>`)
CREATE INDEX IF NOT EXISTS idx_profile_embeddings_hnsw 
ON public.profile_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_host_embeddings_hnsw 
ON public.host_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_moderation_vector_benchmarks_hnsw 
ON public.moderation_vector_benchmarks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_ai_knowledge_chunks_hnsw 
ON public.ai_knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 7. Stored Procedure: Pencocokan Host Semantik (Semantic Host Matchmaking)
CREATE OR REPLACE FUNCTION match_hosts_semantic(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.65,
    match_count int DEFAULT 10,
    filter_gender text DEFAULT NULL
)
RETURNS TABLE (
    host_id VARCHAR(50),
    nickname VARCHAR(50),
    avatar_url TEXT,
    vibe_description TEXT,
    talking_style TEXT,
    specialties TEXT[],
    rating_score NUMERIC(3, 2),
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        h.host_id,
        h.nickname,
        h.avatar_url,
        h.vibe_description,
        h.talking_style,
        h.specialties,
        h.rating_score,
        (1 - (h.embedding <=> query_embedding))::float AS similarity
    FROM public.host_embeddings h
    WHERE h.is_active = TRUE
      AND (filter_gender IS NULL OR h.gender = filter_gender)
      AND (1 - (h.embedding <=> query_embedding)) >= match_threshold
    ORDER BY h.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 8. Stored Procedure: Pemindaian Kemiripan Vektor Moderasi (Content Moderation Vector Scan)
CREATE OR REPLACE FUNCTION scan_content_similarity(
    input_embedding vector(384),
    min_similarity float DEFAULT 0.70
)
RETURNS TABLE (
    benchmark_id UUID,
    category VARCHAR(30),
    pattern_text TEXT,
    severity VARCHAR(20),
    action_policy VARCHAR(30),
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS benchmark_id,
        m.category,
        m.pattern_text,
        m.severity,
        m.action_policy,
        (1 - (m.embedding <=> input_embedding))::float AS similarity
    FROM public.moderation_vector_benchmarks m
    WHERE (1 - (m.embedding <=> input_embedding)) >= min_similarity
    ORDER BY m.embedding <=> input_embedding ASC
    LIMIT 5;
END;
$$;

-- 9. Stored Procedure: Pencarian Knowledge Base AI RAG
CREATE OR REPLACE FUNCTION search_knowledge_base(
    query_embedding vector(384),
    filter_domain text DEFAULT NULL,
    match_count int DEFAULT 4
)
RETURNS TABLE (
    id UUID,
    domain VARCHAR(50),
    title VARCHAR(150),
    content TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.id,
        k.domain,
        k.title,
        k.content,
        (1 - (k.embedding <=> query_embedding))::float AS similarity
    FROM public.ai_knowledge_chunks k
    WHERE (filter_domain IS NULL OR k.domain = filter_domain)
    ORDER BY k.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
