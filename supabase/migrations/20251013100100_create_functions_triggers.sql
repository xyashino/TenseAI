-- =====================================================================
-- Migration: Functions and Triggers
-- =====================================================================
-- Description: Creates database functions and triggers for:
--   - Automatic profile creation when user signs up
--   - Automatic timestamp updates on record modifications
--
-- Affected Tables: profiles, training_sessions, rounds
-- Dependencies: Requires migration 20251013100000_create_schema.sql
-- Safety: Creates functions and triggers only, no data modification
-- =====================================================================

-- =====================================================================
-- Section 1: Profile Management Functions and Triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- Function: handle_new_user
-- ---------------------------------------------------------------------
-- Purpose: Automatically creates a profile entry when a new user registers
-- Trigger: Fires after INSERT on auth.users
-- Security: Uses SECURITY DEFINER to allow insertion into profiles table
--           search_path set to empty string to prevent search_path injection attacks
-- Business Logic:
--   - Extracts name from user metadata if available
--   - Sets default difficulty to 'Basic'
--   - Sets onboarding_completed to FALSE
--   - New users will be directed to onboarding flow on first login
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Insert a new profile for the newly created user
  -- COALESCE ensures we have a fallback if name is not in metadata
  -- Note: All object references must be fully qualified due to empty search_path
  insert into public.profiles (user_id, name, default_difficulty, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    'Basic'::public.difficulty_level,
    false
  );

  return new;
end;
$$;

-- Trigger to execute handle_new_user function after user creation
-- This ensures every auth.users record has a corresponding profiles record
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================================================================
-- Section 2: Timestamp Management Functions and Triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- Function: handle_updated_at
-- ---------------------------------------------------------------------
-- Purpose: Automatically updates the updated_at timestamp on record modification
-- Trigger: Fires before UPDATE on tables with updated_at column
-- Business Logic: Sets updated_at to current timestamp whenever row is updated
-- Performance: Lightweight function, minimal overhead on updates
-- ---------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- Set updated_at to current timestamp
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Triggers for updated_at timestamp management
-- ---------------------------------------------------------------------

-- Trigger for profiles table
-- Fires whenever a profile is updated (e.g., name change, difficulty preference)
create trigger set_updated_at_profiles
  before update on profiles
  for each row
  execute function public.handle_updated_at();

-- Trigger for training_sessions table
-- Fires when session is updated (e.g., status change, final_feedback added)
create trigger set_updated_at_training_sessions
  before update on training_sessions
  for each row
  execute function public.handle_updated_at();

-- Trigger for rounds table
-- Fires when round is updated (e.g., score recorded, round_feedback added)
create trigger set_updated_at_rounds
  before update on rounds
  for each row
  execute function public.handle_updated_at();

-- =====================================================================
-- End of Migration
-- =====================================================================
-- Next Steps:
--   - Run migration: 20251013100200_enable_rls_policies.sql
-- Notes:
--   - Test profile creation by registering a new user
--   - Verify updated_at timestamps change on record updates
-- =====================================================================
