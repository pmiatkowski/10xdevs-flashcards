-- Migration: Disable all RLS policies
-- Description: Disables all previously created RLS policies for flashcards, ai_candidates, and generation_stats tables
-- Author: System
-- Date: 2025-04-11

-- Drop policies for flashcards table
drop policy if exists "flashcards_select_anon" on flashcards;
drop policy if exists "flashcards_select_auth" on flashcards;
drop policy if exists "flashcards_insert_anon" on flashcards;
drop policy if exists "flashcards_insert_auth" on flashcards;
drop policy if exists "flashcards_update_anon" on flashcards;
drop policy if exists "flashcards_update_auth" on flashcards;
drop policy if exists "flashcards_delete_anon" on flashcards;
drop policy if exists "flashcards_delete_auth" on flashcards;

-- Drop policies for ai_candidates table
drop policy if exists "ai_candidates_select_anon" on ai_candidates;
drop policy if exists "ai_candidates_select_auth" on ai_candidates;
drop policy if exists "ai_candidates_insert_anon" on ai_candidates;
drop policy if exists "ai_candidates_insert_auth" on ai_candidates;
drop policy if exists "ai_candidates_delete_anon" on ai_candidates;
drop policy if exists "ai_candidates_delete_auth" on ai_candidates;

-- Drop policies for generation_stats table
drop policy if exists "generation_stats_select_anon" on generation_stats;
drop policy if exists "generation_stats_select_auth" on generation_stats;
drop policy if exists "generation_stats_insert_anon" on generation_stats;
drop policy if exists "generation_stats_insert_auth" on generation_stats;
