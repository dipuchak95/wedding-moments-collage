import { useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import floral from "@/assets/floral-spray.svg";
import { supabase } from "@/lib/supabase";

const CollageFrame = ({ photos, loading = false, size = 640 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssSize = size;

    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    canvas.style.width = cssSize + "px";
    canvas.style.height = cssSize + "px";

    ctx.scale(dpr, dpr);

    const drawImageCover = (img, x, y, w, h) => {
      const scale = Math.max(w / img.width, h / img.height);
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      const offsetX = (w - newWidth) / 2;
      const offsetY = (h - newHeight) / 2;

      ctx.drawImage(img, x + offsetX, y + offsetY, newWidth, newHeight);
    };

    ctx.fillStyle = "hsl(var(--card))";
    ctx.fillRect(0, 0, cssSize, cssSize);

    if (loading) {
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Loading photos...", cssSize / 2, cssSize / 2);
      return;
    }

    if (photos.length === 0) {
      // Empty state
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Upload photos to see your collage", cssSize / 2, cssSize / 2);
      return;
    }

    const cols = Math.ceil(Math.sqrt(photos.length));
    const rows = Math.ceil(photos.length / cols);
    const cellW = cssSize / cols;
    const cellH = cssSize / rows;

    photos.forEach((photo, i) => {
      const { data } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(photo.storage_path);
      
      const img = new Image();
      img.onload = () => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = Math.round(c * cellW);
        const y = Math.round(r * cellH);
        drawImageCover(img, x, y, Math.ceil(cellW), Math.ceil(cellH));
      };
      img.onerror = () => {
        // Skip failed image
      };
      img.src = data.publicUrl;
    });
  }, [photos, loading, size]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "wedding-collage.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "var(--shadow-elegant)" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Live Wedding Collage
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={handleDownload}>
          Download Collage
        </Button>
      </Box>
      <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
        <img
          src={floral}
          alt=""
          aria-hidden="true"
          className="animate-fade-in"
          style={{ position: "absolute", top: -10, left: -10, width: 140, opacity: 0.35, pointerEvents: "none", zIndex: 0, transform: "rotate(-10deg)" }}
        />
        <img
          src={floral}
          alt=""
          aria-hidden="true"
          className="animate-fade-in"
          style={{ position: "absolute", bottom: -12, right: -12, width: 160, opacity: 0.35, pointerEvents: "none", zIndex: 0, transform: "rotate(160deg)" }}
        />
        <canvas ref={canvasRef} style={{ position: "relative", zIndex: 1 }} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            Loading photos from all guests...
          </Box>
        ) : (
          `Live collage with ${photos.length} photos from all guests`
        )}
      </Typography>
    </Paper>
  );
};

export default CollageFrame;