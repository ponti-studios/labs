import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import React, { type SyntheticEvent, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthWrap from "src/components/AuthenticationWrap";
import api from "src/lib/api";
import type { AuthState } from "src/lib/auth";
import { DASHBOARD, LOGIN } from "src/lib/routes";

export type AuthenticatePayload = {
	email: string;
	emailToken: string;
};

function Authenticate({
	loginEmail,
	setAuthState,
}: { loginEmail: string; setAuthState: AuthState["setAuthState"] }) {
	const navigate = useNavigate();
	const authenticate = useMutation<
		void,
		AxiosError,
		AuthenticatePayload,
		unknown
	>({
		mutationFn: async ({ emailToken }) =>
			api.post("/authenticate", {
				email: loginEmail,
				emailToken,
			}),
		onSuccess: () => {
			navigate(DASHBOARD);
		},
	});

	const { error, isError, mutateAsync, status } = authenticate;

	const onSubmit = useCallback(
		async (e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const emailToken = formData.get("emailToken") as string;
			mutateAsync({ email: loginEmail, emailToken });
		},
		[mutateAsync, loginEmail],
	);

	if (!loginEmail) {
		return null;
	}

	return (
		<AuthWrap>
			<h2 className="text-2xl font-semibold mb-6">Authenticate</h2>
			{isError && error.response?.status !== 401 && (
				<Alert className="mt-2" type="error">
					There was an issue validating your code.
					<Link
						to={LOGIN}
						className="text-blue-500 block"
						onClick={(e) => {
							e.preventDefault();
							navigate(LOGIN);
						}}
					>
						Try logging in again.
					</Link>
				</Alert>
			)}
			<form className="w-full" onSubmit={onSubmit}>
				<div className="form-control w-full">
					<label className="label" htmlFor="emailToken">
						<span className="label-text">Enter code sent to your email.</span>
					</label>
					<input
						type="string"
						name="emailToken"
						className="input input-bordered"
						placeholder="Code"
					/>
					{isError && error.response?.status === 401 && (
						<Alert className="mt-2" type="error">
							<div className="flex flex-col gap-2 text-white">
								<p>Invalid code.</p>
								<p>
									<Link
										to={LOGIN}
										className="underline"
										onClick={(e) => e.preventDefault()}
									>
										Request a new one.
									</Link>
								</p>
							</div>
						</Alert>
					)}
				</div>
				<Button
					type="submit"
					isLoading={status === "pending"}
					className="w-full mt-4"
				>
					Login
				</Button>
			</form>
			<div className="mt-4 text-center">
				<button
					type="button"
					className="underline"
					onClick={() => setAuthState(null)}
				>
					Get new code
				</button>
			</div>
		</AuthWrap>
	);
}

export default Authenticate;
