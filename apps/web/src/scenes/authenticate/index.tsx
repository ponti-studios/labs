import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { Field, Formik } from "formik";
import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import Form from "src/components/Form";
import { useAuth } from "src/lib/auth";
import { DASHBOARD, LOGIN } from "src/lib/routes";

const AuthenticateSchema = Yup.object().shape({
	emailToken: Yup.string().length(8),
});

function Authenticate() {
	const { authenticate, loginEmail } = useAuth();
	const navigate = useNavigate();
	const initialValues = useMemo(
		() => ({
			emailToken: "",
		}),
		[],
	);
	const { error, isError, mutateAsync, status } = authenticate;

	const onSubmit = useMemo(
		() =>
			async ({ emailToken }: typeof initialValues) => {
				mutateAsync({ email: loginEmail, emailToken });
			},
		[mutateAsync, loginEmail],
	);

	useEffect(() => {
		if (status === "success") {
			navigate(DASHBOARD);
		}
	}, [status, navigate]);

	useEffect(() => {
		// If loginEmail is not set, user will need to request a new email token
		if (!loginEmail) {
			navigate("/login");
		}
	});

	if (!loginEmail) {
		return null;
	}

	return (
		<AuthWrap>
			<h2 className="text-2xl font-semibold mb-6">Authenticate</h2>
			<Formik
				validationSchema={AuthenticateSchema}
				initialValues={initialValues}
				onSubmit={onSubmit}
			>
				<Form>
					<div className="form-control w-full">
						<label className="label" htmlFor="emailToken">
							<span className="label-text">Enter code sent to your email.</span>
						</label>
						<Field
							type="string"
							name="emailToken"
							label="Code"
							className="input input-bordered"
							placeholder="Code"
						/>
						{isError && error.response?.status !== 401 && (
							<Alert className="mt-2" type="error">
								There was an issue validating your code.
								<Link to={LOGIN} className="text-blue-500">
									Try logging in again.
								</Link>
							</Alert>
						)}
						{isError && error.response?.status === 401 && (
							<Alert className="mt-2" type="error">
								<div className="flex flex-col gap-2 text-white">
									<p>Invalid code.</p>
									<p>
									<Link to={LOGIN} className="underline">
										Request a new one.
									</Link>
									</p>
								</div>
							</Alert>
						)}
					</div>
					<Button isLoading={status === "pending"}>Login</Button>
				</Form>
			</Formik>
		</AuthWrap>
	);
}

export default Authenticate;
