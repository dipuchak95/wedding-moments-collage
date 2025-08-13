import { useEffect, useMemo, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import WeddingHero from "@/components/WeddingHero";
import AutoScrollCanvas from "@/components/AutoScrollCanvas";
import GuestUpload from "@/components/GuestUpload";
import CollageFrame from "@/components/CollageFrame";

import img1 from "@/assets/wedding-01.jpg";
import img2 from "@/assets/wedding-02.jpg";
import img3 from "@/assets/wedding-03.jpg";
import img4 from "@/assets/wedding-04.jpg";
import img5 from "@/assets/wedding-05.jpg";

const STORAGE_KEY = "guest_photos_v1";

const Index = () => {
  const galleryImages = useMemo(() => [img1, img2, img3, img4, img5], []);

  const [guestPhotos, setGuestPhotos] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestPhotos));
    } catch (err) {
      console.warn("Failed to persist guest photos. Consider reducing file size.", err);
    }
  }, [guestPhotos]);

  const handleAddPhotos = (photos: string[]) => {
    setGuestPhotos((prev) => [...prev, ...photos]);
  };

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
      <Container sx={{ mb: { xs: 6, md: 8 } }}>
        <GuestUpload onAdd={handleAddPhotos} current={guestPhotos} />
      </Container>

      {/* Collage */}
      <Container sx={{ mb: { xs: 6, md: 10 } }}>
        <CollageFrame images={guestPhotos} />
      </Container>
    </Box>
  );
};

export default Index;
