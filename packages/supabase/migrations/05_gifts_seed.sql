-- ==========================================================
-- 05_GIFTS CATALOG & SEED DATA
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.gifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    coin_price INT NOT NULL,
    diamond_value INT NOT NULL,
    icon_url TEXT NOT NULL,
    lottie_url TEXT,
    category VARCHAR(20) DEFAULT 'romantic'
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gifts" ON public.gifts FOR SELECT USING (TRUE);

-- Seed hadiah khas lokal & romantis
INSERT INTO public.gifts (id, name, coin_price, diamond_value, icon_url, category) VALUES
(1, 'Mawar Tresno', 10, 7, 'https://cdn.tresno.app/gifts/rose.png', 'romantic'),
(2, 'Kopi Kenangan', 25, 18, 'https://cdn.tresno.app/gifts/coffee.png', 'fun'),
(3, 'Cokelat Asmara', 50, 35, 'https://cdn.tresno.app/gifts/chocolate.png', 'romantic'),
(4, 'Buket Melati', 100, 70, 'https://cdn.tresno.app/gifts/flowers.png', 'romantic'),
(5, 'Cincin Berlian', 300, 210, 'https://cdn.tresno.app/gifts/diamond_ring.png', 'luxury'),
(6, 'Kapal Tresno', 1000, 750, 'https://cdn.tresno.app/gifts/yacht.png', 'luxury')
ON CONFLICT (id) DO NOTHING;
