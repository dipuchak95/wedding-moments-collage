import { useRef, useEffect, useState } from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import floral from "@/assets/floral-spray.svg";
import { supabase } from "@/lib/supabase";

const WeddingHero = () => {
	const ref = useRef(null);
	const [displayName, setDisplayName] = useState("");

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
			if (mounted) setDisplayName(name || "");
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

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.8,
				staggerChildren: 0.2,
				ease: "easeOut"
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.6,
				ease: "easeOut"
			}
		}
	};

	const titleVariants = {
		hidden: { opacity: 0, y: 40, scale: 0.9 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.8,
				ease: "easeOut"
			}
		}
	};

	const buttonVariants = {
		hidden: { opacity: 0, y: 20, scale: 0.9 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: "easeOut"
			}
		},
		hover: {
			scale: 1.05,
			transition: {
				duration: 0.2,
				ease: "easeInOut"
			}
		},
		tap: {
			scale: 0.98,
			transition: {
				duration: 0.1
			}
		}
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			className="interactive-gradient"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			style={{
				position: "relative",
				padding: "var(--py, 2rem)",
				textAlign: "center",
				borderRadius: "24px",
				boxShadow: "var(--shadow-elegant)",
				background: "var(--gradient-subtle)",
				overflow: "hidden",
			}}
		>
			<motion.img
				src={floral}
				alt=""
				aria-hidden="true"
				className="animate-fade-in"
				initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
				animate={{ opacity: 0.5, rotate: 12, scale: 1 }}
				transition={{ duration: 1.2, ease: "easeOut" }}
				style={{ position: "absolute", top: -20, right: -10, width: 180, pointerEvents: "none" }}
			/>
			<motion.img
				src={floral}
				alt=""
				aria-hidden="true"
				className="animate-fade-in"
				initial={{ opacity: 0, rotate: 20, scale: 0.8 }}
				animate={{ opacity: 0.5, rotate: -150, scale: 1 }}
				transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
				style={{ position: "absolute", bottom: -24, left: -18, width: 200, pointerEvents: "none" }}
			/>
			<Container maxWidth="md">
				<Stack spacing={3} alignItems="center">
					<motion.div variants={titleVariants}>
						<Typography component="h1" variant="h2" sx={{ fontWeight: 700 }}>
							{displayName ? (
								<>
									Welcome <span className="hero-name-italic">{displayName}</span> to Our Wedding
								</>
							) : (
								"Welcome to Our Wedding"
							)}
						</Typography>
					</motion.div>
					
					<motion.div variants={itemVariants}>
						<Typography variant="h6" color="text.secondary">
							We're so happy you're here. Enjoy our favorite moments and mark your
							presence with a photo that will join our live collage below.
						</Typography>
					</motion.div>
					
					<motion.div
						variants={itemVariants}
						style={{ paddingTop: "0.5rem" }}
					>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
								<Button 
									variant="contained" 
									color="primary" 
									onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })} 
									className="hover-scale"
								>
									Share Your Photo
								</Button>
							</motion.div>
							<motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
								<Button 
									variant="outlined" 
									color="primary" 
									onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} 
									className="hover-scale"
								>
									View Gallery
								</Button>
							</motion.div>
						</Stack>
					</motion.div>
				</Stack>
			</Container>
		</motion.div>
	);
};

export default WeddingHero;
