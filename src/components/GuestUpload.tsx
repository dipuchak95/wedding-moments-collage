import { ChangeEvent, useRef } from "react";
import { Box, Button, Card, CardContent, CardHeader, Grid, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
interface GuestUploadProps {
  onAdd: (photos: string[]) => void;
  current: string[];
  onRemove: (index: number) => void;
}

const GuestUpload = ({ onAdd, current, onRemove }: GuestUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = () => inputRef.current?.click();

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readAsDataURL = (file: File) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

    const compressDataUrl = (dataUrl: string) =>
      new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const maxSide = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSide) {
            height = Math.round((maxSide / width) * height);
            width = maxSide;
          } else if (height >= width && height > maxSide) {
            width = Math.round((maxSide / height) * width);
            height = maxSide;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });

    const data = await Promise.all(
      Array.from(files).map(async (file) => {
        const raw = await readAsDataURL(file);
        return await compressDataUrl(raw);
      })
    );

    onAdd(data);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card id="upload" sx={{ borderRadius: 3, boxShadow: "var(--shadow-elegant)" }}>
      <CardHeader title={<Typography variant="h5">Mark Your Presence</Typography>} subheader="Upload a photo to be part of our live collage" />
      <CardContent>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFiles}
            style={{ display: "none" }}
          />
          <Button variant="contained" color="primary" onClick={handleSelect} className="hover-scale">
            Upload Photos
          </Button>
          <Typography variant="body2" color="text.secondary">
            JPG, PNG. Your photo appears instantly in the collage.
          </Typography>
        </Box>
        {current.length > 0 && (
          <Grid container spacing={1}>
            {current.map((src, idx) => (
              <Grid item xs={4} sm={2} md={1.5 as any} key={idx}>
                <Box
                  sx={{
                    position: "relative",
                    paddingTop: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
          <img
            src={src}
            alt={`Guest photo ${idx + 1}`}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Tooltip title="Delete">
            <IconButton
              size="small"
              aria-label={`Delete guest photo ${idx + 1}`}
              onClick={() => onRemove(idx)}
              sx={{ position: "absolute", top: 4, right: 4, bgcolor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", '&:hover': { bgcolor: "hsl(var(--muted))" } }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestUpload;
