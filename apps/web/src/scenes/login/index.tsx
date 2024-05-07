import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { Field, Formik } from "formik";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import Form from "src/components/Form";
import { useAuth } from "src/lib/auth";
import { LANDING } from "src/lib/utils/routes";

const LoginSchema = Yup.object().shape({
	email: Yup.string().email(),
});

function Login() {
	const { login, user } = useAuth();
	const navigate = useNavigate();
	const initialValues = useMemo(
		() => ({
			email: "",
		}),
		[],
	);

	useEffect(() => {
		if (login.status === "success") {
			navigate("/authenticate");
		}
	}, [login.status, navigate]);

	const onSubmit = useCallback(
		(values) => {
			login.mutateAsync(values);
		},
		[login.mutateAsync],
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
					{login.error && (
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
