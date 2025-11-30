-- Cubetive Database Schema (Simplified)
-- PostgreSQL database schema for Rubik's Cube timing application
-- Using Supabase with Row Level Security (RLS)

-- =============================================
-- PROFILES TABLE (extends auth.users for public data)
-- =============================================
-- Only stores additional profile data not in auth.users
CREATE TABLE public.profiles (
    -- Primary key references Supabase auth
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile information
    username TEXT UNIQUE NOT NULL,
    profile_visibility BOOLEAN DEFAULT false,

    -- Denormalized statistics for performance
    total_solves INTEGER DEFAULT 0,
    pb_single INTEGER, -- Personal best single time in milliseconds
    pb_single_date TIMESTAMPTZ,
    pb_single_scramble TEXT,
    pb_ao5 INTEGER, -- Best average of 5 in milliseconds
    pb_ao5_date TIMESTAMPTZ,
    pb_ao12 INTEGER, -- Best average of 12 in milliseconds
    pb_ao12_date TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- =============================================
-- SOLVES TABLE
-- =============================================
CREATE TABLE public.solves (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to auth.users (not profiles)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Solve data
    time_ms INTEGER NOT NULL, -- Time in milliseconds
    scramble TEXT NOT NULL, -- WCA notation scramble
    penalty_type TEXT, -- NULL, '+2', or 'DNF'

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_time CHECK (time_ms > 0),
    CONSTRAINT valid_penalty CHECK (penalty_type IN ('+2', 'DNF') OR penalty_type IS NULL),
    CONSTRAINT scramble_not_empty CHECK (scramble != '')
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles table indexes
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_visibility ON public.profiles(profile_visibility) WHERE deleted_at IS NULL AND profile_visibility = true;

-- Solves table indexes
CREATE INDEX idx_solves_user_id ON public.solves(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_solves_user_created ON public.solves(user_id, created_at DESC) WHERE deleted_at IS NULL;

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        -- Generate initial username from email (user can change later)
        LOWER(SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Anyone can view public profiles
CREATE POLICY "Anyone can view public profiles" ON public.profiles
    FOR SELECT
    USING (profile_visibility = true AND deleted_at IS NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (for the trigger)
CREATE POLICY "Service role can insert profiles" ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- Solves table policies
-- Users can view their own solves
CREATE POLICY "Users can view own solves" ON public.solves
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own solves
CREATE POLICY "Users can insert own solves" ON public.solves
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own solves (for penalties and soft delete)
CREATE POLICY "Users can update own solves" ON public.solves
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own solves
CREATE POLICY "Users can delete own solves" ON public.solves
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.profiles IS 'User profiles with statistics, extends auth.users';
COMMENT ON TABLE public.solves IS 'Individual solve records with times and scrambles';
COMMENT ON COLUMN public.profiles.pb_single IS 'Personal best single time in milliseconds';
COMMENT ON COLUMN public.profiles.profile_visibility IS 'Whether profile is publicly viewable';
COMMENT ON COLUMN public.solves.time_ms IS 'Raw solve time in milliseconds before penalties';
COMMENT ON COLUMN public.solves.penalty_type IS 'Penalty applied: +2 for 2-second penalty, DNF for Did Not Finish';