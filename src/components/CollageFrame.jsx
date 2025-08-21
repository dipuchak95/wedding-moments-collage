import { useState, useEffect } from "react";
import { Box, Typography, ImageList, ImageListItem, ImageListItemBar, CircularProgress } from "@mui/material";

const CollageFrame = ({ photos = [], count = 0 }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (photos.length > 0) {
			setLoading(false);
		}
	}, [photos]);

	if (error) {
		return (
			<Box sx={{ textAlign: 'center', py: 4 }}>
				<Typography color="error" variant="body2">
					Error loading collage: {error}
				</Typography>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box sx={{ py: 4, textAlign: 'center' }}>
				<CircularProgress size={40} />
				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					Creating your wedding collage...
				</Typography>
			</Box>
		);
	}

	if (photos.length === 0) {
		return (
			<Box sx={{ textAlign: 'center', py: 4 }}>
				<Typography variant="body2" color="text.secondary">
					No photos uploaded yet. Be the first to share a moment!
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ textAlign: 'center' }}>
			<Box sx={{ 
				borderRadius: 3, 
				boxShadow: 'var(--shadow-elegant)',
				overflow: 'hidden',
				background: 'linear-gradient(135deg, #fff5f7 0%, #ffeef2 50%, #fff0f5 100%)',
				p: 2
			}}>
				<ImageList 
					variant="masonry" 
					cols={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }} 
					gap={16}
					sx={{ 
						m: 0,
						'& .MuiImageListItem-root': {
							borderRadius: 2,
							overflow: 'hidden',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
							transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
							'&:hover': {
								transform: 'translateY(-4px)',
								boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
							}
						}
					}}
				>
					{photos.map((photo, index) => {
						const imageUrl = photo.storage_path ? 
							`https://wedding-moments-collage.supabase.co/storage/v1/object/public/wedding-photos/${photo.storage_path}` :
							photo.url;
						
						return (
							<ImageListItem 
								key={photo.id || index}
								sx={{
									position: 'relative',
									'& img': {
										width: '100%',
										height: 'auto',
										display: 'block',
										borderRadius: 2,
									}
								}}
							>
								<img
									src={imageUrl}
									alt={`Wedding moment ${index + 1}`}
									loading="lazy"
									onError={(e) => {
										console.warn(`Failed to load image: ${imageUrl}`);
										e.target.style.display = 'none';
									}}
								/>
								<ImageListItemBar
									position="below"
									title={`Moment ${index + 1}`}
									subtitle={photo.uploaded_by ? `Shared by ${photo.uploaded_by}` : 'Guest photo'}
									sx={{
										'& .MuiImageListItemBar-title': {
											fontSize: '0.875rem',
											fontWeight: 600,
											color: 'text.primary'
										},
										'& .MuiImageListItemBar-subtitle': {
											fontSize: '0.75rem',
											color: 'text.secondary'
										}
									}}
								/>
							</ImageListItem>
						);
					})}
				</ImageList>
			</Box>

			<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
				Live collage with {count || photos.length} photos from all guests
			</Typography>
		</Box>
	);
};

export default CollageFrame;