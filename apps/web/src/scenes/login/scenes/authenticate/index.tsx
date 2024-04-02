import Button from "@hominem/components/Button";
import FeedbackBlock from "@hominem/components/FeedbackBlock";
import { Field, Formik } from "formik";
import React, { useEffect, useMemo } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import Form from "src/components/Form";
import { DASHBOARD } from "src/constants/routes";
import { loadAuth, setCurrentEmail } from "src/services/auth";
import { authenticate } from "src/services/auth/auth.api";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import { getLoginEmail } from "src/services/store";

const AuthenticateSchema = Yup.object().shape({
	emailToken: Yup.string().length(8),
});

function Authenticate() {
	const loginEmail = useAppSelector(getLoginEmail);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const initialValues = useMemo(
		() => ({
			emailToken: "",
		}),
		[],
	);
	const { mutateAsync, isLoading, isError, error } = useMutation<
		void,
		{ response: { message: string; status: number } },
		{ emailToken: string }
	>({
		mutationFn: async ({ emailToken }) => {
			await authenticate({ email: loginEmail, emailToken });
		},
		onSuccess: () => {
			dispatch(loadAuth());
			dispatch(setCurrentEmail(null));
			navigate(DASHBOARD);
		},
	});

	const onSubmit = useMemo(
		() => (values) => {
			mutateAsync(values);
		},
		[mutateAsync],
	);

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
			{isError && error.response?.status === 401 && (
				<FeedbackBlock type="error">
					Invalid code.
					<Link to="login"> Request a new one.</Link>
				</FeedbackBlock>
			)}
			{isError && error.response?.status !== 401 && (
				<FeedbackBlock type="error">{error.response.message}</FeedbackBlock>
			)}
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
					</div>
					<Button isLoading={isLoading}>Login</Button>
				</Form>
			</Formik>
		</AuthWrap>
	);
}

export default Authenticate;
