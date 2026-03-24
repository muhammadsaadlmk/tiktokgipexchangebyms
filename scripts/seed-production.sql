-- ============================================================
-- TikTok Exchange - Production Seed Data
-- Run this AFTER drizzle-kit push (tables already created)
-- ============================================================

-- Users
INSERT INTO users (id, email, password_hash, tiktok_username, name, points, is_admin, avatar_url, created_at)
VALUES
  (
    1,
    'muhammadsaadlmk@gmail.com',
    '$2b$10$WSZIsYGt1r.w1mxNcorwzutfJFEeyd0RaNHGyVd2OAIKEq9QKYHwu',
    'zerozehan',
    'Zero Zehan',
    1000,
    false,
    'https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0068/a2e0cdae9045aa27cd3470226c38180d~tplv-tiktokx-cropcenter:1080:1080.jpeg',
    '2026-03-24T08:53:19.186Z'
  ),
  (
    2,
    'muhammadsaadlmk@admin.com',
    '$2b$10$Bmkt4b1ckMy8vb5rCbWwrOCw2hwgn1SjeMypIvUIt8/1OiyLHs34C',
    'muhammadsaadlmk',
    NULL,
    999999999,
    true,
    'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
    '2026-03-24T08:56:25.720Z'
  )
ON CONFLICT (email) DO NOTHING;

-- Reset users sequence so new users get correct IDs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Settings
INSERT INTO settings (id, key, value, updated_at)
VALUES
  (
    1,
    'adUrl',
    'https://prototypesorting.com/f25ssv6x?key=cabe21fca8dd672cc7d6c84901688f87',
    '2026-03-24T10:14:39.215Z'
  ),
  (
    2,
    'adLinks',
    '[{"id":"default","url":"https://prototypesorting.com/f25ssv6x?key=cabe21fca8dd672cc7d6c84901688f87","label":"Ad Link 1","isActive":true,"clicks":6}]',
    '2026-03-24T11:32:02.434Z'
  )
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

-- Reset settings sequence
SELECT setval('settings_id_seq', (SELECT MAX(id) FROM settings));
