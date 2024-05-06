import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { useMutation } from "@tanstack/react-query";
import { Field, Formik } from "formik";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import Form from "src/components/Form";
import api from "src/lib/api";
import { setCurrentEmail } from "src/lib/auth";
import { useAuth } from "src/lib/hooks";
import { useAppDispatch } from "src/lib/store";
import { LANDING } from "src/lib/utils/routes";

const LoginSchema = Yup.object().shape({
	email: Yup.string().email(),
});

function Login() {
	const dispatch = useAppDispatch();
	const { user } = useAuth();
	const navigate = useNavigate();
	const initialValues = useMemo(
		() => ({
			email: "",
		}),
		[],
	);

	const { mutateAsync, status, isError } = useMutation({
		mutationFn: async ({ email }: { email: string }) => {
			await api.post("/login", { email }, { withCredentials: false });
			dispatch(setCurrentEmail(email));
		},
		onSuccess: () => {
			navigate("/authenticate");
		},
	});

	const onSubmit = useCallback(
		(values) => {
			mutateAsync(values);
		},
		[mutateAsync],
	);

	useEffect(() => {
		if (user) {
			navigate(LANDING);
		}
	});

	return (
		<AuthWrap data-testid="login-page">
			<div className="flex justify-center text-primary font-extrabold mb-4 mt-24">
				<Globe size={150} className="animate-pulse" />
			</div>
			<h2 className="text-2xl font-semibold mb-6">Log in</h2>
			<Formik
				validationSchema={LoginSchema}
				initialValues={initialValues}
				onSubmit={onSubmit}
			>
				<Form>
					<div className="form-control w-full">
						<label className="label pl-0" htmlFor="email">
							<span className="label-text">What is your email?</span>
						</label>
						<Field
							className="input input-bordered w-full font-semibold"
							name="email"
							type="email"
							placeholder="Email"
						/>
					</div>
					<Button isLoading={status === "pending"}>Get code</Button>
					{isError && (
						<Alert type="error">
							<p className="mb-1">
								We ran into an issue finding or creating your account.
							</p>
							<p>Please, try again later</p>
						</Alert>
					)}
				</Form>
			</Formik>
		</AuthWrap>
	);
}

export default Login;
