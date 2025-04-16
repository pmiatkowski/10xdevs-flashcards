-- Add INSERT policies for authenticated users
create policy "Users can insert their own AI candidates"
  on ai_candidates
  for insert
  with check (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
  on flashcards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can insert their own generation stats"
  on generation_stats
  for insert
  with check (auth.uid() = user_id);

-- Add SELECT policies for authenticated users to view their own data
create policy "Users can view their own AI candidates"
  on ai_candidates
  for select
  using (auth.uid() = user_id);

create policy "Users can view their own flashcards"
  on flashcards
  for select
  using (auth.uid() = user_id);

create policy "Users can view their own generation stats"
  on generation_stats
  for select
  using (auth.uid() = user_id);

-- Add UPDATE policies for authenticated users
create policy "Users can update their own AI candidates"
  on ai_candidates
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
  on flashcards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
