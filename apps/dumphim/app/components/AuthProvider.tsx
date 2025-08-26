import type { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { supabase } from "~/lib/supabaseClient";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	signInWithPassword: typeof supabase.auth.signInWithPassword;
	signUp: typeof supabase.auth.signUp;
	signOut: typeof supabase.auth.signOut;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);

		supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
			setUser(currentUser);
			setIsLoading(false);
		});

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (_event, newSession) => {
				setSession(newSession);
				if (newSession?.user) {
					// Verify the user data by calling getUser
					const {
						data: { user: verifiedUser },
					} = await supabase.auth.getUser();
					setUser(verifiedUser);
				} else {
					setUser(null);
				}
				setIsLoading(false);
			},
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, []);

	const value = {
		user,
		session,
		isLoading,
		signInWithPassword: supabase.auth.signInWithPassword,
		signUp: supabase.auth.signUp,
		signOut: supabase.auth.signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
