import { useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import floral from "@/assets/floral-spray.svg";
import { supabase } from "@/lib/supabase";

const CollageFrame = ({ photos, loading = false, size }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;

    const render = async () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      const cssSize = Math.max(1, Math.floor(size || (parent ? parent.clientWidth : 640)));

      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      canvas.style.width = cssSize + "px";
      canvas.style.height = cssSize + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const drawImageCover = (img, x, y, w, h) => {
        const scale = Math.max(w / img.width, h / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const offsetX = (w - newWidth) / 2;
        const offsetY = (h - newHeight) / 2;
        ctx.drawImage(img, Math.round(x + offsetX), Math.round(y + offsetY), Math.round(newWidth), Math.round(newHeight));
      };

      const drawLoveBackground = (width) => {
        // Soft romantic gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, width);
        gradient.addColorStop(0, 'hsla(340, 70%, 99%, 1)');
        gradient.addColorStop(1, 'hsla(35, 100%, 97%, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, width);

        // Subtle hearts pattern
        const drawHeart = (cx, cy, size) => {
          const s = size;
          ctx.beginPath();
          ctx.moveTo(cx, cy + s * 0.25);
          ctx.bezierCurveTo(cx + s * 0.5, cy - s * 0.2, cx + s, cy + s * 0.3, cx, cy + s);
          ctx.bezierCurveTo(cx - s, cy + s * 0.3, cx - s * 0.5, cy - s * 0.2, cx, cy + s * 0.25);
          ctx.closePath();
          ctx.fill();
        };

        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = 'hsl(340 70% 50%)';

        const step = Math.max(60, Math.floor(width * 0.1));
        for (let y = step; y < width; y += step) {
          for (let x = step; x < width; x += step) {
            const jitterX = ((x + y) % 13) - 6;
            const jitterY = ((x * y) % 11) - 5;
            drawHeart(x + jitterX, y + jitterY, Math.max(10, Math.floor(step * 0.35)));
          }
        }
        ctx.restore();
      };

      drawLoveBackground(cssSize);

      if (loading) {
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.fillText("Loading photos...", cssSize / 2, cssSize / 2);
        return;
      }

      if (photos.length === 0) {
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.fillText("Upload photos to see your collage", cssSize / 2, cssSize / 2);
        return;
      }

      // Preload all images first for consistent layout
      const urls = photos.map((p) => supabase.storage.from('wedding-photos').getPublicUrl(p.storage_path).data.publicUrl);
      const loadedImages = await Promise.all(
        urls.map((src) => new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        }))
      );

      if (isCancelled) return;

      const validImages = loadedImages.filter(Boolean);
      const n = validImages.length;
      // Base tile side from requested formula: tile^2 ≈ canvasArea / n
      const targetTile = Math.max(1, Math.floor(Math.sqrt((cssSize * cssSize) / n)));
      // Initial columns from target tile
      let cols = Math.max(1, Math.floor(cssSize / targetTile));
      let rows = Math.max(1, Math.ceil(n / cols));
      // Final square tile size ensuring everything fits
      const tile = Math.max(1, Math.floor(Math.min(cssSize / cols, cssSize / rows)));
      // Center the grid within the canvas
      const totalW = cols * tile;
      const totalH = rows * tile;
      const offsetGridX = Math.floor((cssSize - totalW) / 2);
      const offsetGridY = Math.floor((cssSize - totalH) / 2);

      // Repaint background before final draw to ensure a clean base
      drawLoveBackground(cssSize);

      // Rounded clipping helper
      const clipRoundedRect = (x, y, w, h, radius) => {
        const r = Math.min(radius, Math.floor(Math.min(w, h) / 2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      validImages.forEach((img, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = offsetGridX + c * tile;
        const y = offsetGridY + r * tile;
        const radius = Math.max(6, Math.round(tile * 0.08));
        ctx.save();
        clipRoundedRect(x, y, tile, tile, radius);
        ctx.clip();
        drawImageCover(img, x, y, tile, tile);
        ctx.restore();
      });
    };

    render();
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => {
      isCancelled = true;
      window.removeEventListener('resize', onResize);
    };
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
      <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", border: "1px solid hsl(var(--border))", width: '100%' }}>
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