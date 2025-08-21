import { useEffect, useMemo, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
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
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();

    // Set up real-time subscription
    const subscription = supabase
      .channel('photos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos' },
        () => {
          fetchPhotos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        <AutoScrollCanvas images={galleryImages} />
      </Container>

      {/* Upload */}
      <Container id="upload" sx={{ mb: { xs: 6, md: 8 } }}>
        <GuestUpload photos={photos} onPhotosChange={fetchPhotos} />
      </Container>

      {/* Collage */}
      <Container id="gallery" sx={{ mb: { xs: 6, md: 10 } }}>
        <CollageFrame photos={photos} loading={loading} />
      </Container>
    </Box>
  );
};

export default Index;