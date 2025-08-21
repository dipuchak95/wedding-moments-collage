import React, { useState, useEffect } from 'react';
import { Box, Typography, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import { supabase } from '../integrations/supabase/client';

const CollageFrame = ({ photos, count }) => {
  const [filteredPhotos, setFilteredPhotos] = useState([]);

  useEffect(() => {
    if (photos.length > 0) {
      const validPhotos = photos.filter(photo => 
        photo && 
        photo.storage_path && 
        photo.storage_path.trim() !== '' &&
        photo.storage_path !== '.emptyFolderPlaceholder' &&
        !photo.storage_path.includes('.emptyFolderPlaceholder') &&
        photo.storage_path.length > 5 && 
        !photo.storage_path.startsWith('.') && 
        photo.storage_path.includes('.') 
      );
      
      setFilteredPhotos(validPhotos);
    } else {
      setFilteredPhotos([]);
    }
  }, [photos]);

  const hideOnError = (e) => {
    if (e?.currentTarget) {
      e.currentTarget.style.display = 'none';
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #ffe6f2 0%, #fff0f5 50%, #f0f8ff 100%)',
      borderRadius: 3,
      p: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          textAlign: 'center', 
          mb: 3, 
          color: '#8B4513',
          fontWeight: 600,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Live Wedding Collage
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          textAlign: 'center', 
          mb: 4, 
          color: '#666',
          fontStyle: 'italic'
        }}
      >
        Live collage with {(count ?? filteredPhotos.length)} photos from all guests
      </Typography>

      <Box sx={{ 
        maxHeight: '70vh', 
        overflowY: 'auto',
        borderRadius: 2,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(139, 69, 19, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(139, 69, 19, 0.5)',
          },
        },
      }}>
        <ImageList 
          variant="masonry" 
          cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          gap={16}
          sx={{
            m: 0,
            p: 2,
            '& .MuiImageListItem-root': {
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              },
            },
          }}
        >
          {filteredPhotos.map((photo, index) => {
            const imageUrl = supabase.storage
              .from('wedding-photos')
              .getPublicUrl(photo.storage_path).data.publicUrl;

            return (
              <ImageListItem 
                key={photo.id || index}
                sx={{
                  height: 'auto',
                  minHeight: 200,
                  '& img': {
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: 2,
                  },
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Wedding moment ${index + 1}`}
                  loading="lazy"
                  onError={hideOnError}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
                <ImageListItemBar
                  position="below"
                  title={photo.uploaded_by || 'Anonymous Guest'}
                  subtitle=""
                  sx={{
                    '& .MuiImageListItemBar-title': {
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.primary'
                    },
                    '& .MuiImageListItemBar-subtitle': {
                      display: 'none'
                    }
                  }}
                />
              </ImageListItem>
            );
          })}
        </ImageList>
      </Box>
    </Box>
  );
};

export default CollageFrame;