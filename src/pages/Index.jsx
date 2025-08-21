import { useEffect, useMemo, useState } from "react";
import { Box, Container, Stack, Typography, Paper, Button } from "@mui/material";
import WeddingHero from "@/components/WeddingHero";
import AutoScrollCanvas from "@/components/AutoScrollCanvas";
import GuestUpload from "@/components/GuestUpload";
import CollageFrame from "@/components/CollageFrame";
import { supabase } from "@/lib/supabase";

import img1 from "@/assets/wedding-01.jpg";
import img2 from "@/assets/wedding-02.jpg";
import img3 from "@/assets/wedding-03.jpg";
import img4 from "@/assets/wedding-04.jpg";
import img5 from "@/assets/wedding-05.jpg";

const Index = () => {
  const galleryImages = useMemo(() => [img1, img2, img3, img4, img5], []);
  const [photos, setPhotos] = useState([]);
  const [bucketPhotos, setBucketPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, photos: 0 });
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = '/login';
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          users!photos_uploaded_by_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      // Map the photos data to include user information
      const mapped = data.map((photo) => ({
        ...photo,
        uploaded_by: photo.users?.full_name || photo.users?.email?.split('@')[0] || 'Anonymous Guest'
      }));

      setPhotos(mapped || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBucketPhotos = async () => {
    try {
      // First get photos from the database with user information
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select(`
          *,
          users!photos_uploaded_by_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Error fetching photos with user data:', photosError);
        return;
      }

      // Map the photos data to include user information
      const mapped = photosData.map((photo) => ({
        id: photo.id,
        storage_path: photo.storage_path,
        created_at: photo.created_at,
        filename: photo.filename,
        uploaded_by: photo.users?.full_name || photo.users?.email?.split('@')[0] || 'Anonymous Guest',
        user_email: photo.users?.email,
        user_full_name: photo.users?.full_name
      }));

      setBucketPhotos(mapped);
    } catch (err) {
      console.error('Unexpected error fetching bucket photos:', err);
    }
  };

  const fetchCounts = async () => {
    try {
      const [{ count: usersCount }, { count: photosCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ users: usersCount || 0, photos: photosCount || 0 });
    } catch (error) {
      // Non-blocking: ignore count failures
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchBucketPhotos();
    fetchCounts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('photos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos' },
        () => {
          fetchPhotos();
          fetchBucketPhotos();
          fetchCounts();
        }
      )
      .subscribe();

    const usersSub = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      usersSub.unsubscribe();
    };
  }, []);

  const autoImages = useMemo(() => {
    // Prefer bucket photos (complete set), fall back to bundled images if empty
    if (bucketPhotos.length > 0) {
      return bucketPhotos.map((p) => {
        const { data } = supabase.storage
          .from('wedding-photos')
          .getPublicUrl(p.storage_path);
        return data.publicUrl;
      });
    }
    return galleryImages;
  }, [bucketPhotos, galleryImages]);

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Hero */}
      <Container sx={{ mb: { xs: 6, md: 8 } }}>
        <WeddingHero />
      </Container>

      {/* Auto-scrolling canvas gallery */}
      <Container sx={{ mb: { xs: 6, md: 8 } }}>
        <Typography component="h2" variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Our Moments
        </Typography>
        <AutoScrollCanvas images={autoImages} />
      </Container>

      {/* Upload */}
      <Container id="upload" sx={{ mb: { xs: 6, md: 8 } }}>
        <GuestUpload photos={photos} onPhotosChange={fetchPhotos} />
      </Container>

      {/* Collage */}
      <Container id="gallery" sx={{ mb: { xs: 6, md: 10 } }}>
        <CollageFrame photos={bucketPhotos.length ? bucketPhotos : photos} loading={loading} />
      </Container>

      {/* Stats Section */}
      <Container sx={{ mb: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 'var(--shadow-elegant)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="center">
            <Box>
              <Typography variant="overline" color="text.secondary">Guests Joined</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.users}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">Photos Posted</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.photos}</Typography>
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Thank you for celebrating with us — your moments make this day unforgettable.
          </Typography>
        </Paper>
      </Container>

      {/* Logout Button */}
      <Container sx={{ mb: { xs: 4, md: 8 }, textAlign: 'center' }}>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Log out
        </Button>
      </Container>
    </Box>
  );
};

export default Index;