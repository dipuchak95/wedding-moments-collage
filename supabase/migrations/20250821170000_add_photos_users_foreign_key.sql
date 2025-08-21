-- Add foreign key relationship between photos and users tables
-- This will allow us to join photos with user information

-- First, we need to handle the type mismatch
-- photos.uploaded_by is TEXT, but users.id is UUID

-- Step 1: Drop existing RLS policies that depend on uploaded_by column
DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON public.photos;
DROP POLICY IF EXISTS "Photos are viewable by everyone" ON public.photos;
DROP POLICY IF EXISTS "Anyone can upload photos" ON public.photos;
DROP POLICY IF EXISTS "Anyone can delete photos" ON public.photos;

-- Step 2: Create a temporary column with UUID type
ALTER TABLE public.photos ADD COLUMN uploaded_by_uuid UUID;

-- Step 3: Convert existing TEXT values to UUID (if they are valid UUIDs)
UPDATE public.photos 
SET uploaded_by_uuid = uploaded_by::UUID 
WHERE uploaded_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4: Drop the old TEXT column (now safe since policies are dropped)
ALTER TABLE public.photos DROP COLUMN uploaded_by;

-- Step 5: Rename the UUID column to uploaded_by
ALTER TABLE public.photos RENAME COLUMN uploaded_by_uuid TO uploaded_by;

-- Step 6: Make the column NOT NULL (since it's a foreign key)
ALTER TABLE public.photos ALTER COLUMN uploaded_by SET NOT NULL;

-- Step 7: Add foreign key constraint
ALTER TABLE public.photos 
ADD CONSTRAINT photos_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 8: Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);

-- Step 9: Recreate RLS policies with the new UUID column
CREATE POLICY "Photos are viewable by everyone" 
ON public.photos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own photos" 
ON public.photos 
FOR INSERT 
WITH CHECK (uploaded_by = auth.uid()::text);

CREATE POLICY "Users can delete own photos" 
ON public.photos 
FOR DELETE 
USING (uploaded_by = auth.uid()::text);

-- Note: If any photos had invalid UUIDs in uploaded_by, they will now have NULL values
-- You may want to clean these up or handle them appropriately
