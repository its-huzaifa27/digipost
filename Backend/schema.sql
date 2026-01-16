-- Run this in Supabase SQL Editor if the backend cannot sync automatically due to connection issues.

CREATE TABLE IF NOT EXISTS "Users" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) DEFAULT 'user', -- 'moderator' or 'user'
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create unique index explicitly if not covered by constraint
-- INCREASED COMPATIBILITY
