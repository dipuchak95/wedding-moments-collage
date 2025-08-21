import { useCallback } from "react";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import floral from "@/assets/floral-spray.svg";
import { supabase } from "@/lib/supabase";

const Login = () => {
	const handleGoogleSignIn = useCallback(async () => {
		const redirectTo = `${window.location.origin}/auth/callback`;
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo },
		});
	}, []);

	return (
		<Box component="main" sx={{ py: { xs: 6, md: 10 } }}>
			<Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
				<img src={floral} alt="" aria-hidden="true" style={{ position: "absolute", top: -10, left: -10, width: 160, opacity: 0.35, pointerEvents: "none", zIndex: 0, transform: "rotate(-10deg)" }} />
				<img src={floral} alt="" aria-hidden="true" style={{ position: "absolute", bottom: -12, right: -12, width: 180, opacity: 0.35, pointerEvents: "none", zIndex: 0, transform: "rotate(160deg)" }} />
				<Box sx={{ display: "flex", justifyContent: "center", px: 2, position: "relative", zIndex: 1 }}>
					<Card sx={{ p: 4, maxWidth: 480, width: "100%", borderRadius: 3, boxShadow: "var(--shadow-elegant)" }}>
					<Stack spacing={3}>
						<Typography variant="h5" sx={{ fontWeight: 700, textAlign: "center" }}>
							Sign in to Wedding Moments
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
							Use your Google account to continue.
						</Typography>
						<Button
							variant="contained"
							size="large"
							onClick={handleGoogleSignIn}
							sx={{ fontWeight: 600 }}
						>
							Continue with Google
						</Button>
						<Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
							By continuing, you agree to our terms and privacy policy.
						</Typography>
					</Stack>
					</Card>
				</Box>
			</Box>
		</Box>
	);
};

export default Login;


