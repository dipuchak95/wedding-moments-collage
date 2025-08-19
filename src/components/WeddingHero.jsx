import { useRef } from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import floral from "@/assets/floral-spray.svg";
const WeddingHero = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty("--x", `${x}px`);
    ref.current.style.setProperty("--y", `${y}px`);
  };

  return (
    <Box
      ref={ref}
      onMouseMove={handleMouseMove}
      className="interactive-gradient"
      sx={{
        position: "relative",
        py: { xs: 8, md: 12 },
        textAlign: "center",
        borderRadius: "24px",
        boxShadow: "var(--shadow-elegant)",
        background: "var(--gradient-subtle)",
        overflow: "hidden",
      }}
    >
      <img
        src={floral}
        alt=""
        aria-hidden="true"
        className="animate-fade-in"
        style={{ position: "absolute", top: -20, right: -10, width: 180, opacity: 0.5, pointerEvents: "none", transform: "rotate(12deg)" }}
      />
      <img
        src={floral}
        alt=""
        aria-hidden="true"
        className="animate-fade-in"
        style={{ position: "absolute", bottom: -24, left: -18, width: 200, opacity: 0.5, pointerEvents: "none", transform: "rotate(-150deg)" }}
      />
      <Container maxWidth="md">
        <Stack spacing={3} alignItems="center">
          <Typography component="h1" variant="h2" sx={{ fontWeight: 700 }}>
            Welcome to Our Wedding
          </Typography>
          <Typography variant="h6" color="text.secondary">
            We’re so happy you’re here. Enjoy our favorite moments and mark your
            presence with a photo that will join our live collage below.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
            <Button variant="contained" color="primary" href="#upload" className="hover-scale">
              Share Your Photo
            </Button>
            <Button variant="outlined" color="primary" href="#gallery" className="hover-scale">
              View Gallery
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default WeddingHero;
