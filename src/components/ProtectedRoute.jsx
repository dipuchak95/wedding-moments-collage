import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase";

const ProtectedRoute = ({ children }) => {
	const navigate = useNavigate();
	const [checking, setChecking] = useState(true);
	const [allowed, setAllowed] = useState(false);
	const [userLoaded, setUserLoaded] = useState(false);

	useEffect(() => {
		let mounted = true;
		const check = async () => {
			console.log('ProtectedRoute: Checking session...');
			const { data } = await supabase.auth.getSession();
			console.log('ProtectedRoute: Session check result:', data);
			if (!mounted) return;
			if (data?.session) {
				console.log('ProtectedRoute: Session found, allowing access');
				setAllowed(true);
				
				// Wait for user metadata to be fully loaded
				const user = data.session.user;
				if (user) {
					// Check if we have the user's display name
					const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
					
					if (displayName) {
						console.log('ProtectedRoute: User display name loaded:', displayName);
						setUserLoaded(true);
					} else {
						// Wait a bit more for metadata to load
						console.log('ProtectedRoute: Waiting for user metadata...');
						setTimeout(() => {
							if (mounted) {
								const updatedUser = supabase.auth.getUser();
								console.log('ProtectedRoute: User metadata check after delay:', updatedUser);
								setUserLoaded(true);
							}
						}, 1000);
					}
					
					// Best-effort user upsert
					const profile = {
						id: user.id,
						email: user.email,
						full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
						avatar_url: user.user_metadata?.avatar_url || null,
						last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
					};
					supabase.from('users').upsert(profile, { onConflict: 'id' }).then(() => {}).catch(() => {});
				}
			} else {
				console.log('ProtectedRoute: No session found, redirecting to login');
				navigate("/login", { replace: true });
			}
			setChecking(false);
		};
		check();

		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			console.log('ProtectedRoute: Auth state change:', _event, session ? 'session exists' : 'no session');
			if (!mounted) return;
			if (session) {
				console.log('ProtectedRoute: Session in auth state change, allowing access');
				setAllowed(true);
				const user = session.user;
				if (user) {
					// Check if we have the user's display name
					const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
					if (displayName) {
						console.log('ProtectedRoute: User display name loaded in auth change:', displayName);
						setUserLoaded(true);
					}
					
					const profile = {
						id: user.id,
						email: user.email,
						full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
						avatar_url: user.user_metadata?.avatar_url || null,
						last_sign_in_at: user.last_sign_in_at || new Date().toISOString(),
					};
					supabase.from('users').upsert(profile, { onConflict: 'id' }).then(() => {}).catch(() => {});
				}
			} else {
				console.log('ProtectedRoute: No session in auth state change, redirecting to login');
				setAllowed(false);
				setUserLoaded(false);
				navigate("/login", { replace: true });
			}
		});

		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, [navigate]);

	if (checking || !userLoaded) {
		return (
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
				<CircularProgress />
			</Box>
		);
	}

	return allowed ? children : null;
};

export default ProtectedRoute;


