import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
	const navigate = useNavigate();
	const [params] = useSearchParams();

	useEffect(() => {
		const run = async () => {
			try {
				const code = params.get("code");
				if (code) {
					await supabase.auth.exchangeCodeForSession({ code });
				}
				// Upsert user in public.users
				const { data: userData } = await supabase.auth.getUser();
				const user = userData?.user;
				if (user) {
					const profile = {
						id: user.id,
						email: user.email,
						full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
						avatar_url: user.user_metadata?.avatar_url || null,
						last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
					};
					await supabase.from('users').upsert(profile, { onConflict: 'id' });
				}
				navigate("/", { replace: true });
			} catch (err) {
				// If anything goes wrong, send user back to login
				navigate("/login", { replace: true });
			}
		};
		run();
	}, [navigate, params]);

	return (
		<Box component="main" sx={{ py: { xs: 6, md: 10 } }}>
			<Stack alignItems="center" spacing={2}>
				<CircularProgress />
				<Typography variant="body2" color="text.secondary">
					Signing you in...
				</Typography>
			</Stack>
		</Box>
	);
};

export default AuthCallback;


