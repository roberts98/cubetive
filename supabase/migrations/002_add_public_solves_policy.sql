-- Add RLS policy to allow viewing solves for public profiles
-- This allows anyone to view recent solves on public profile pages

-- Drop the policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Anyone can view solves for public profiles" ON public.solves;

-- Create policy to allow viewing solves for users with public profiles
CREATE POLICY "Anyone can view solves for public profiles" ON public.solves
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = solves.user_id
            AND profiles.profile_visibility = true
            AND profiles.deleted_at IS NULL
        )
    );

-- Comment for documentation
COMMENT ON POLICY "Anyone can view solves for public profiles" ON public.solves IS
    'Allows anyone (including unauthenticated users) to view solves for users who have set their profile to public';
