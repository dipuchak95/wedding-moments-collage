import { useEffect, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface CollageFrameProps {
  images: string[];
  size?: number; // canvas size in CSS pixels (square)
}

const CollageFrame = ({ images, size = 640 }: CollageFrameProps) => {
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

    if (images.length === 0) {
      // Empty state
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 18px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Your photos will appear here", cssSize / 2, cssSize / 2);
      return;
    }

    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / cols);
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

    let loaded = 0;
    const imageEls: HTMLImageElement[] = [];

    images.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === images.length) {
          // draw all
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const idx = r * cols + c;
              if (!imageEls[idx]) continue;
              const x = Math.round(c * cellW);
              const y = Math.round(r * cellH);
              drawImageCover(imageEls[idx], x, y, Math.ceil(cellW), Math.ceil(cellH));
            }
          }
        }
      };
      imageEls[i] = img;
    });
  }, [images, size]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid hsl(var(--border))" }}>
      <Typography variant="h6" gutterBottom>
        Live Guest Collage
      </Typography>
      <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
        <canvas ref={canvasRef} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        New photos are added automatically.
      </Typography>
    </Paper>
  );
};

export default CollageFrame;
