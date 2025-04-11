-- Migration: Disable Row Level Security
-- Description: Disables RLS on all tables in addition to dropping their policies
-- Author: System
-- Date: 2025-04-11

-- Disable RLS on all tables
alter table flashcards disable row level security;
alter table ai_candidates disable row level security;
alter table generation_stats disable row level security;
