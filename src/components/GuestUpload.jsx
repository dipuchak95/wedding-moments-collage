import { useEffect, useRef, useState } from "react";
import { Box, Card, Typography, Button, Grid, IconButton, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { CloudUpload as UploadIcon, Delete as DeleteIcon, PhotoCamera as CameraIcon, PhotoLibrary as LibraryIcon } from "@mui/icons-material";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const GuestUpload = ({ photos, onPhotosChange }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setCurrentUserId(data?.user?.id || "");
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setCurrentUserId(session?.user?.id || "");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleOpenMenu = (event) => setMenuAnchor(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);
  const handleSelectSource = (source) => {
    handleCloseMenu();
    if (source === 'camera') {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const onFiles = async (files) => {
    setUploading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user;
      if (!authUser) {
        throw new Error('Not authenticated');
      }
      const uploadPromises = Array.from(files).map(async (file) => {
        // Always check and compress if needed
        const processedFile = await compressImage(file);
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('wedding-photos')
          .upload(filePath, processedFile);

        if (uploadError) {
          throw uploadError;
        }

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            filename: fileName,
            storage_path: filePath,
            uploaded_by: authUser.id,
            file_size: processedFile.size,
            mime_type: processedFile.type,
          });

        if (dbError) {
          throw dbError;
        }

        return filePath;
      });

      await Promise.all(uploadPromises);
      
      const hasLargeFiles = Array.from(files).some(file => file.size > 3 * 1024 * 1024);
      
      toast({
        title: "Photos uploaded successfully!",
        description: hasLargeFiles 
          ? `${files.length} photo(s) added to the gallery. Large images were automatically optimized.`
          : `${files.length} photo(s) added to the wedding gallery.`,
      });
      
      onPhotosChange();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      // Check file size - compress if over 3MB
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB < 3) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Aggressive compression for large files
        let maxSize = 1500;
        let quality = 0.7;
        
        if (fileSizeMB > 20) { // > 20MB
          maxSize = 1200;
          quality = 0.5;
        } else if (fileSizeMB > 10) { // > 10MB
          maxSize = 1300;
          quality = 0.6;
        } else if (fileSizeMB > 5) { // > 5MB
          maxSize = 1400;
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

  // Only show images uploaded by the current user in this section
  const myPhotos = currentUserId ? photos.filter((p) => p.users?.id === currentUserId) : [];

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: "var(--shadow-elegant)" }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Share Your Moment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload photos to be part of the live wedding collage that all guests can see
      </Typography>

      <Box sx={{ mb: 3 }}>
        {/* Hidden input for choosing from device (gallery/files) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && onFiles(e.target.files)}
          style={{ display: "none" }}
        />
        {/* Hidden input for taking a photo via camera on mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files && onFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <Button
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          onClick={handleOpenMenu}
          disabled={uploading}
          sx={{ mb: 3 }}
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </Button>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <MenuItem onClick={() => handleSelectSource('camera')}>
            <ListItemIcon>
              <CameraIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Take Photo (Camera)" />
          </MenuItem>
          <MenuItem onClick={() => handleSelectSource('device')}>
            <ListItemIcon>
              <LibraryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Choose from device" />
          </MenuItem>
        </Menu>
      </Box>

      {myPhotos.length > 0 && (
        <Grid container spacing={2}>
          {myPhotos.map((photo) => {
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
                    disabled={currentUserId !== photo.users?.id}
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