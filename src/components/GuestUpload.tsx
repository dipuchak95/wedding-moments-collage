import { ChangeEvent, useRef } from "react";
import { Box, Button, Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";

interface GuestUploadProps {
  onAdd: (photos: string[]) => void;
  current: string[];
}

const GuestUpload = ({ onAdd, current }: GuestUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = () => inputRef.current?.click();

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    const data = await Promise.all(readers);
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
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img
                    src={src}
                    alt={`Guest photo ${idx + 1}`}
                    loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
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
