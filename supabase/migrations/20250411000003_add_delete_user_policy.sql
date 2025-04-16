-- Add a policy to allow users to delete their own data

-- Enable RLS for our tables (if not already enabled)
alter table flashcards enable row level security;
alter table ai_candidates enable row level security;
alter table generation_stats enable row level security;

-- Add delete policies
create policy "Users can delete their own flashcards"
  on flashcards
  for delete
  using (auth.uid() = user_id);

create policy "Users can delete their own AI candidates"
  on ai_candidates
  for delete
  using (auth.uid() = user_id);

create policy "Users can delete their own generation stats"
  on generation_stats
  for delete
  using (auth.uid() = user_id);

-- Create a function to delete user data
create or replace function public.delete_user_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete user's data
  delete from generation_stats where user_id = auth.uid();
  delete from ai_candidates where user_id = auth.uid();
  delete from flashcards where user_id = auth.uid();

  -- Delete the user's auth account
  delete from auth.users where id = auth.uid();
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.delete_user_data to authenticated;
