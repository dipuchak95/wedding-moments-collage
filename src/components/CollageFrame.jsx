import { useState, useEffect } from "react";
import { Box, Typography, ImageList, ImageListItem, ImageListItemBar, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase";

const CollageFrame = ({ photos = [], count = 0 }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filteredPhotos, setFilteredPhotos] = useState([]);

	useEffect(() => {
		if (photos.length > 0) {
			// Filter out any invalid or empty photo entries
			const validPhotos = photos.filter(photo => 
				photo && 
				photo.storage_path && 
				photo.storage_path.trim() !== '' &&
				photo.storage_path !== '.emptyFolderPlaceholder'
			);
			
			console.log('Original photos count:', photos.length);
			console.log('Filtered photos count:', validPhotos.length);
			console.log('Invalid photos:', photos.filter(photo => 
				!photo || !photo.storage_path || photo.storage_path.trim() === '' || photo.storage_path === '.emptyFolderPlaceholder'
			));
			
			setFilteredPhotos(validPhotos);
			setLoading(false);
		}
	}, [photos]);

	// Debug: Log photo data to understand structure
	useEffect(() => {
		if (filteredPhotos.length > 0) {
			console.log('CollageFrame filtered photos:', filteredPhotos);
			console.log('First photo structure:', filteredPhotos[0]);
		}
	}, [filteredPhotos]);

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

	if (filteredPhotos.length === 0) {
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
			{/* Debug info */}
			<Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, fontSize: '0.75rem' }}>
				<Typography variant="caption">
					Debug: {filteredPhotos.length} photos received. First photo keys: {Object.keys(filteredPhotos[0] || {}).join(', ')}
				</Typography>
				<Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
					Original count: {photos.length} | Filtered count: {filteredPhotos.length} | Difference: {photos.length - filteredPhotos.length}
				</Typography>
				{photos.length !== filteredPhotos.length && (
					<Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
						⚠️ {photos.length - filteredPhotos.length} invalid photo(s) filtered out
					</Typography>
				)}
			</Box>

			<Box sx={{ 
				borderRadius: 3, 
				boxShadow: 'var(--shadow-elegant)',
				overflow: 'hidden',
				background: 'linear-gradient(135deg, #fff5f7 0%, #ffeef2 50%, #fff0f5 100%)',
				p: 2,
				maxHeight: '70vh', // Make container scrollable
				overflowY: 'auto' // Enable vertical scrolling
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
						},
						// Ensure proper masonry layout with dynamic heights
						'& .MuiImageListItem-img': {
							width: '100%',
							height: 'auto',
							objectFit: 'cover',
							display: 'block'
						}
					}}
				>
					{filteredPhotos.map((photo, index) => {
						// Use Supabase storage getPublicUrl method for correct URL construction
						let imageUrl = null;
						try {
							if (photo.storage_path) {
								// Use the supabase client to get the correct public URL
								const { data } = supabase.storage
									.from('wedding-photos')
									.getPublicUrl(photo.storage_path);
								imageUrl = data.publicUrl;
								console.log(`Generated URL for ${photo.storage_path}:`, imageUrl);
							}
						} catch (err) {
							console.warn('Error generating Supabase URL:', err);
						}

						// If no URL found, show placeholder
						if (!imageUrl) {
							return (
								<ImageListItem key={photo.id || index}>
									<Box
										sx={{
											width: '100%',
											height: 200,
											bgcolor: 'rgba(255, 182, 193, 0.2)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											borderRadius: 2,
											border: '2px dashed rgba(255, 182, 193, 0.4)'
										}}
									>
										<Typography variant="body2" color="text.secondary">
											No image URL
										</Typography>
									</Box>
									<ImageListItemBar
										position="below"
										title={photo.uploaded_by || 'Anonymous Guest'}
										subtitle=""
									/>
								</ImageListItem>
							);
						}

						return (
							<ImageListItem 
								key={photo.id || index}
								sx={{
									position: 'relative',
									// Let the image determine the height naturally
									height: 'auto',
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
										console.warn('Photo data:', photo);
										e.target.style.display = 'none';
									}}
									style={{
										width: '100%',
										height: 'auto',
										display: 'block',
										borderRadius: 8,
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

			<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
				Live collage with {count || filteredPhotos.length} photos from all guests
			</Typography>
		</Box>
	);
};

export default CollageFrame;