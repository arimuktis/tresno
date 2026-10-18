-- ==========================================================
-- 01_PROFILES & USERS
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL DEFAULT 'male',
    birthdate DATE,
    bio TEXT,
    coin_balance BIGINT NOT NULL DEFAULT 50 CHECK (coin_balance >= 0), -- Welcome bonus 50 koin
    diamond_balance BIGINT NOT NULL DEFAULT 0 CHECK (diamond_balance >= 0),
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for fast search and matchmaking query
CREATE INDEX IF NOT EXISTS idx_profiles_gender_online ON public.profiles(gender, is_online) WHERE is_banned = FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Publik bisa membaca profil non-sensitif
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (is_banned = FALSE);

-- RLS: User hanya bisa update profil mereka sendiri (kecuali saldo koin/diamond)
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Otomatis buat profil saat user daftar via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nickname, avatar_url, gender)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || SUBSTRING(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'nickname', 'Teman Tresno'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'gender', 'male')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
