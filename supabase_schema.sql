-- Enable Row Level Security (RLS) is recommended, but for now we'll allow public access
-- since we want all scouts to read/write without complex auth setup yet.

-- 1. Create 'scout_data' table
create table if not exists scout_data (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  match_number integer not null,
  alliance text not null, -- 'red' or 'blue'
  team_number integer not null,
  position text not null, -- 'red1', 'blue2', etc.
  scout_name text,
  auto_data jsonb default '{}'::jsonb, -- Store complex nested objects as JSONB
  teleop_data jsonb default '{}'::jsonb,
  endgame_data jsonb default '{}'::jsonb
);

-- 2. Create 'teams' table
create table if not exists teams (
  team_number integer primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  team_name text,
  city text,
  state_prov text,
  country text,
  -- Robot characteristics (Pit Scouting)
  feed_from text,
  has_auto_aim text,
  can_climb text,
  cycle_length text,
  robot_photo_url text,
  robot_size text,
  robot_height text,
  robot_weight text,
  drivetrain_style text,
  wheel_type text,
  mechanism_photo_url text,
  photo_captured_at bigint,
  photo_tags jsonb,
  has_auto_program text,
  drivetrain_type text,
  shooter_type text,
  max_fuel_capacity text,
  intake_location text,
  auto_flexibility text,
  avg_cycle_length text,
  basic_strats text,
  can_pass_under_trench text,
  can_get_stuck_on_bump text,
  can_play_defense text,
  general_accuracy text,
  climb_level text,
  most_common_issue text,
  speed_agility_rating text,
  driving_ability_rating text,
  reliability_rating text,
  defense_rating text,
  intake_from jsonb,
  scores_into jsonb,
  role_preference text,
  traffic_footprint text,
  needs_protected_lane text,
  can_pass_handoff text,
  common_failure_mode text,
  failure_mode_notes text,
  average_pit_fix_time text,
  spare_parts_readiness text,
  auto_consistency text,
  auto_partner_requirement text,
  cycle_preference text,
  defensive_tolerance text,
  best_auto_summary text,
  avg_teleop_cycle_time text,
  role_in_playoffs text,
  upgrade_wish text,
  interview_quote text,
  source_of_claims text,
  confidence_level text,
  needs_recheck boolean,
  last_pit_updated_at bigint,
  pit_version integer,
  pit_history jsonb,
  -- Abilities
  auto_tasks text,
  auto_starting_locations text,
  auto_pathing text,
  teleop_scoring text,
  teleop_speed_agility text,
  teleop_driving_ability text,
  teleop_defense_effectiveness text,
  teleop_defense_locations text,
  teleop_fouls text,
  endgame_attempted text,
  endgame_completed text,
  other_reliability text,
  other_communication text,
  solo_score_estimate numeric
);

-- 3. Create 'matches' table (optional, but good for schedule)
create table if not exists matches (
  match_number integer primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  red_1 integer,
  red_2 integer,
  red_3 integer,
  blue_1 integer,
  blue_2 integer,
  blue_3 integer
);

-- 4. Enable RLS (Safe to re-run)
alter table scout_data enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;

-- 5. Create policies to allow ALL access (Drop if exists first to avoid error)
do $$
begin
  if not exists (select from pg_policies where tablename = 'scout_data' and policyname = 'Allow all access') then
    create policy "Allow all access" on scout_data for all using (true) with check (true);
  end if;
  
  if not exists (select from pg_policies where tablename = 'teams' and policyname = 'Allow all access') then
    create policy "Allow all access" on teams for all using (true) with check (true);
  end if;

  if not exists (select from pg_policies where tablename = 'matches' and policyname = 'Allow all access') then
    create policy "Allow all access" on matches for all using (true) with check (true);
  end if;
end
$$;
