-- Migration: Initial Schema for Fiszki AI
-- Description: Creates the initial database schema for the flashcard application
-- Tables: flashcards, ai_candidates, generation_stats
-- Author: System
-- Date: 2025-04-11

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Create updated_at trigger function that will be used by tables
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create tables
create table "flashcards" (
    "id" uuid primary key default gen_random_uuid(),
    "user_id" uuid not null references auth.users on delete cascade,
    "front_text" varchar(200) not null check (length(front_text) <= 200),
    "back_text" varchar(500) not null check (length(back_text) <= 500),
    "source" text not null,
    "source_text_hash" text,
    "created_at" timestamptz default now(),
    "updated_at" timestamptz default now()
);

create table "ai_candidates" (
    "id" uuid primary key default gen_random_uuid(),
    "user_id" uuid not null references auth.users on delete cascade,
    "front_text" varchar(200) not null check (length(front_text) <= 200),
    "back_text" varchar(500) not null check (length(back_text) <= 500),
    "source_text_hash" text not null,
    "created_at" timestamptz default now(),
    "updated_at" timestamptz default now()
);

create table "generation_stats" (
    "id" uuid primary key default gen_random_uuid(),
    "user_id" uuid not null references auth.users on delete cascade,
    "event_type" text not null,
    "timestamp" timestamptz default now(),
    "candidate_id" uuid references ai_candidates(id) on delete set null,
    "candidate_count" integer,
    "source_text_hash" text
);

-- Create indexes
create index "idx_flashcards_user_id" on flashcards (user_id);
create index "idx_ai_candidates_user_id" on ai_candidates (user_id);
create index "idx_ai_candidates_source_text_hash" on ai_candidates (source_text_hash);
create index "idx_generation_stats_user_id" on generation_stats (user_id);
create index "idx_generation_stats_candidate_id" on generation_stats (candidate_id);
create index "idx_generation_stats_timestamp" on generation_stats ("timestamp");

-- Create updated_at trigger function
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger set_timestamp_flashcards
    before update on flashcards
    for each row
    execute function trigger_set_timestamp();

create trigger set_timestamp_ai_candidates
    before update on ai_candidates
    for each row
    execute function trigger_set_timestamp();

-- Enable Row Level Security
alter table flashcards enable row level security;
alter table ai_candidates enable row level security;
alter table generation_stats enable row level security;

-- RLS Policies for flashcards
-- Note: Separate policies for anon and authenticated users as per guidelines
create policy "flashcards_select_anon" on flashcards
    for select to anon
    using (false);
comment on policy "flashcards_select_anon" on flashcards is 'Anon users cannot view any flashcards';

create policy "flashcards_select_auth" on flashcards
    for select to authenticated
    using (auth.uid() = user_id);
comment on policy "flashcards_select_auth" on flashcards is 'Users can view their own flashcards';

create policy "flashcards_insert_anon" on flashcards
    for insert to anon
    with check (false);
comment on policy "flashcards_insert_anon" on flashcards is 'Anon users cannot insert flashcards';

create policy "flashcards_insert_auth" on flashcards
    for insert to authenticated
    with check (auth.uid() = user_id);
comment on policy "flashcards_insert_auth" on flashcards is 'Users can insert their own flashcards';

create policy "flashcards_update_anon" on flashcards
    for update to anon
    using (false);
comment on policy "flashcards_update_anon" on flashcards is 'Anon users cannot update flashcards';

create policy "flashcards_update_auth" on flashcards
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
comment on policy "flashcards_update_auth" on flashcards is 'Users can update their own flashcards';

create policy "flashcards_delete_anon" on flashcards
    for delete to anon
    using (false);
comment on policy "flashcards_delete_anon" on flashcards is 'Anon users cannot delete flashcards';

create policy "flashcards_delete_auth" on flashcards
    for delete to authenticated
    using (auth.uid() = user_id);
comment on policy "flashcards_delete_auth" on flashcards is 'Users can delete their own flashcards';

-- RLS Policies for ai_candidates
create policy "ai_candidates_select_anon" on ai_candidates
    for select to anon
    using (false);
comment on policy "ai_candidates_select_anon" on ai_candidates is 'Anon users cannot view any AI candidates';

create policy "ai_candidates_select_auth" on ai_candidates
    for select to authenticated
    using (auth.uid() = user_id);
comment on policy "ai_candidates_select_auth" on ai_candidates is 'Users can view their own AI candidates';

create policy "ai_candidates_insert_anon" on ai_candidates
    for insert to anon
    with check (false);
comment on policy "ai_candidates_insert_anon" on ai_candidates is 'Anon users cannot insert AI candidates';

create policy "ai_candidates_insert_auth" on ai_candidates
    for insert to authenticated
    with check (auth.uid() = user_id);
comment on policy "ai_candidates_insert_auth" on ai_candidates is 'Users can insert their own AI candidates';

create policy "ai_candidates_delete_anon" on ai_candidates
    for delete to anon
    using (false);
comment on policy "ai_candidates_delete_anon" on ai_candidates is 'Anon users cannot delete AI candidates';

create policy "ai_candidates_delete_auth" on ai_candidates
    for delete to authenticated
    using (auth.uid() = user_id);
comment on policy "ai_candidates_delete_auth" on ai_candidates is 'Users can delete their own AI candidates';

-- RLS Policies for generation_stats
create policy "generation_stats_select_anon" on generation_stats
    for select to anon
    using (false);
comment on policy "generation_stats_select_anon" on generation_stats is 'Anon users cannot view generation stats';

create policy "generation_stats_select_auth" on generation_stats
    for select to authenticated
    using (auth.uid() = user_id);
comment on policy "generation_stats_select_auth" on generation_stats is 'Users can view their own generation stats';

create policy "generation_stats_insert_anon" on generation_stats
    for insert to anon
    with check (false);
comment on policy "generation_stats_insert_anon" on generation_stats is 'Anon users cannot insert generation stats';

create policy "generation_stats_insert_auth" on generation_stats
    for insert to authenticated
    with check (auth.uid() = user_id);
comment on policy "generation_stats_insert_auth" on generation_stats is 'Users can insert their own generation stats';
