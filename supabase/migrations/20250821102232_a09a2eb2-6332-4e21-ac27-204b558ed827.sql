-- Create photos table for storing photo metadata
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view photos (public wedding gallery)
CREATE POLICY "Photos are viewable by everyone" 
ON public.photos 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to upload photos (guest uploads)
CREATE POLICY "Anyone can upload photos" 
ON public.photos 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to delete photos (for photo management)
CREATE POLICY "Anyone can delete photos" 
ON public.photos 
FOR DELETE 
USING (true);

-- Create wedding-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-photos', 
  'wedding-photos', 
  true, 
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for wedding-photos bucket
CREATE POLICY "Wedding photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Anyone can upload wedding photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "Anyone can delete wedding photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'wedding-photos');

-- Enable realtime for photos table
ALTER TABLE public.photos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;