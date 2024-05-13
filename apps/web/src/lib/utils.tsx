import { type ClassValue, clsx } from "clsx";
import { useEffect } from "react";
import { type Navigate, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useAuth } from "./auth";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function withAuth(Component: React.ComponentType) {
	return function AuthComponent(props: any) {
		const { user, status } = useAuth();
		const navigate = useNavigate();

		useEffect(() => {
			if (!user) {
				navigate("/login");
			}
		}, [user, navigate]);

		if (status !== "authenticated") {
			return null;
		}

		return <Component {...props} />;
	};
}
