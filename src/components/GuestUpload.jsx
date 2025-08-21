import { useRef, useState } from "react";
import { Box, Card, Typography, Button, Grid, IconButton, CircularProgress } from "@mui/material";
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const GuestUpload = ({ photos, onPhotosChange }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = () => inputRef.current?.click();

  const onFiles = async (files) => {
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Compress image if needed
        const compressedFile = await compressImage(file);
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(filePath, compressedFile);

        if (uploadError) {
          throw uploadError;
        }

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            filename: fileName,
            storage_path: filePath,
            uploaded_by: 'Guest',
            file_size: compressedFile.size,
            mime_type: compressedFile.type,
          });

        if (dbError) {
          throw dbError;
        }

        return filePath;
      });

      await Promise.all(uploadPromises);
      
      toast({
        title: "Photos uploaded successfully!",
        description: `${files.length} photo(s) added to the wedding gallery.`,
      });
      
      onPhotosChange();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again. We'll automatically compress large images for you.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      // If file is already small enough, return as is
      if (file.size < 2 * 1024 * 1024) { // Less than 2MB
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Adaptive compression based on file size
        let maxSize = 2000; // Increased max size
        let quality = 0.7;
        
        if (file.size > 10 * 1024 * 1024) { // > 10MB
          maxSize = 1600;
          quality = 0.6;
        } else if (file.size > 5 * 1024 * 1024) { // > 5MB
          maxSize = 1800;
          quality = 0.65;
        }
        
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.onerror = () => {
        // If image processing fails, return original file
        resolve(file);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDelete = async (photo) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .remove([photo.storage_path]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Photo deleted",
        description: "Photo removed from the gallery.",
      });
      
      onPhotosChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: "var(--shadow-elegant)" }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Share Your Moment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload photos to be part of the live wedding collage that all guests can see
      </Typography>

      <Box sx={{ mb: 3 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && onFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <Button
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          onClick={handleSelect}
          disabled={uploading}
          sx={{ mb: 3 }}
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </Button>
      </Box>

      {photos.length > 0 && (
        <Grid container spacing={2}>
          {photos.map((photo) => {
            const { data } = supabase.storage
              .from('wedding-photos')
              .getPublicUrl(photo.storage_path);
            
            return (
              <Grid item xs={6} sm={4} md={3} key={photo.id}>
                <Box sx={{ position: "relative" }}>
                  <img
                    src={data.publicUrl}
                    alt={`Upload ${photo.filename}`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(photo)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                    }}
                  >
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Card>
  );
};

export default GuestUpload;