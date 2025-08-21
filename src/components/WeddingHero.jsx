import { useRef, useEffect, useState } from "react";
import { Box, Container, Typography, Button, Stack, CircularProgress } from "@mui/material";
import floral from "@/assets/floral-spray.svg";
import { supabase } from "@/lib/supabase";

const WeddingHero = () => {
	const ref = useRef(null);
	const [displayName, setDisplayName] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isVisible, setIsVisible] = useState(false);

	const handleMouseMove = (e) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		ref.current.style.setProperty("--x", `${x}px`);
		ref.current.style.setProperty("--y", `${y}px`);
	};

	useEffect(() => {
		let mounted = true;
		const resolveName = (user) => {
			const name =
				user?.user_metadata?.full_name ||
				user?.user_metadata?.name ||
				(user?.email ? user.email.split("@")[0] : "");
			if (mounted) {
				setDisplayName(name || "");
				setIsLoading(false);
			}
		};

		const loadUser = async () => {
			const { data } = await supabase.auth.getUser();
			resolveName(data?.user);
		};
		loadUser();

		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			resolveName(session?.user);
		});

		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (!isLoading) {
			// Trigger animations after loading is complete
			const timer = setTimeout(() => setIsVisible(true), 100);
			return () => clearTimeout(timer);
		}
	}, [isLoading]);

	// Show loading state until user name is loaded
	if (isLoading) {
		return (
			<Box
				sx={{
					position: "relative",
					py: { xs: 8, md: 12 },
					textAlign: "center",
					borderRadius: "24px",
					boxShadow: "var(--shadow-elegant)",
					background: "var(--gradient-subtle)",
					overflow: "hidden",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "400px"
				}}
			>
				<Box
					src={floral}
					component="img"
					alt=""
					aria-hidden="true"
					sx={{
						position: "absolute",
						top: -20,
						right: -10,
						width: 180,
						pointerEvents: "none",
						opacity: 0.5,
						transform: "rotate(12deg)",
						animation: "fadeInRotate 1.2s ease-out"
					}}
				/>
				<Box
					src={floral}
					component="img"
					alt=""
					aria-hidden="true"
					sx={{
						position: "absolute",
						bottom: -24,
						left: -18,
						width: 200,
						pointerEvents: "none",
						opacity: 0.5,
						transform: "rotate(-150deg)",
						animation: "fadeInRotate 1.2s ease-out 0.3s both"
					}}
				/>
				<Stack alignItems="center" spacing={2}>
					<CircularProgress size={40} />
					<Typography variant="body2" color="text.secondary">
						Loading your welcome message...
					</Typography>
				</Stack>
			</Box>
		);
	}

	return (
		<Box
			ref={ref}
			onMouseMove={handleMouseMove}
			className="interactive-gradient"
			sx={{
				position: "relative",
				padding: "var(--py, 2rem)",
				textAlign: "center",
				borderRadius: "24px",
				boxShadow: "var(--shadow-elegant)",
				background: "var(--gradient-subtle)",
				overflow: "hidden",
				opacity: isVisible ? 1 : 0,
				transform: isVisible ? "translateY(0)" : "translateY(20px)",
				transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
			}}
		>
			<Box
				src={floral}
				component="img"
				alt=""
				aria-hidden="true"
				className="animate-fade-in"
				sx={{
					position: "absolute",
					top: -20,
					right: -10,
					width: 180,
					pointerEvents: "none",
					opacity: isVisible ? 0.5 : 0,
					transform: isVisible ? "rotate(12deg) scale(1)" : "rotate(-20deg) scale(0.8)",
					transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
				}}
			/>
			<Box
				src={floral}
				component="img"
				alt=""
				aria-hidden="true"
				className="animate-fade-in"
				sx={{
					position: "absolute",
					bottom: -24,
					left: -18,
					width: 200,
					pointerEvents: "none",
					opacity: isVisible ? 0.5 : 0,
					transform: isVisible ? "rotate(-150deg) scale(1)" : "rotate(20deg) scale(0.8)",
					transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s"
				}}
			/>
			<Container maxWidth="md">
				<Stack spacing={3} alignItems="center">
					<Box
						sx={{
							opacity: isVisible ? 1 : 0,
							transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
							transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s"
						}}
					>
						<Typography component="h1" variant="h2" sx={{ fontWeight: 700 }}>
							{displayName ? (
								<>
									Welcome <span className="hero-name-italic">{displayName}</span> to Our Wedding
								</>
							) : (
								"Welcome to Our Wedding"
							)}
						</Typography>
					</Box>
					
					<Box
						sx={{
							opacity: isVisible ? 1 : 0,
							transform: isVisible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
							transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s"
						}}
					>
						<Typography variant="h6" color="text.secondary">
							We're so happy you're here. Enjoy our favorite moments and mark your
							presence with a photo that will join our live collage below.
						</Typography>
					</Box>
					
					<Box
						sx={{
							paddingTop: "0.5rem",
							opacity: isVisible ? 1 : 0,
							transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
							transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s"
						}}
					>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<Button 
								variant="contained" 
								color="primary" 
								onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })} 
								className="hover-scale"
								sx={{
									transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
									"&:hover": {
										transform: "scale(1.05)",
										boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
									},
									"&:active": {
										transform: "scale(0.98)"
									}
								}}
							>
								Share Your Photo
							</Button>
							<Button 
								variant="outlined" 
								color="primary" 
								onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} 
								className="hover-scale"
								sx={{
									transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
									"&:hover": {
										transform: "scale(1.05)",
										boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
									},
									"&:active": {
										transform: "scale(0.98)"
									}
								}}
							>
								View Gallery
							</Button>
						</Stack>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default WeddingHero;
