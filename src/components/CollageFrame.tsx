import { useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import floral from "@/assets/floral-spray.svg";
import { supabase, type Photo } from "@/lib/supabase";

interface CollageFrameProps {
  photos: Photo[];
  loading?: boolean;
  size?: number;
}

const CollageFrame = ({ photos, loading = false, size = 640 }: CollageFrameProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssSize = Math.min(size, canvas.parentElement?.clientWidth || size);

    canvas.width = Math.floor(cssSize * dpr);
    canvas.height = Math.floor(cssSize * dpr);
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

    const drawImageCover = (
      image: HTMLImageElement,
      dx: number,
      dy: number,
      dWidth: number,
      dHeight: number
    ) => {
      const ar = image.width / image.height;
      const targetAR = dWidth / dHeight;

      let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
      if (ar > targetAR) {
        // source is wider
        sWidth = image.height * targetAR;
        sx = (image.width - sWidth) / 2;
      } else {
        // source is taller
        sHeight = image.width / targetAR;
        sy = (image.height - sHeight) / 2;
      }
      ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    };

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
    link.download = `wedding-collage-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid hsl(var(--border))" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">Live Guest Collage</Typography>
        <Button variant="outlined" color="primary" onClick={handleDownload} className="hover-scale" aria-label="Download live collage">
          Download
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
