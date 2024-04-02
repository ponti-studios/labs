import styled from "@emotion/styled";
import Button from "@hominem/components/Button";
import Input from "@hominem/components/Input";
import { validateYupSchema } from "formik";
import { type SyntheticEvent, useCallback, useState } from "react";
import * as Yup from "yup";

import FeedbackBlock from "@hominem/components/FeedbackBlock";
import { useCreateListInvite } from "src/services/api";
import { useToast } from "src/services/toast/toast.slice";
import type { ListInvite } from "src/services/types";

const Form = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;

const InviteSchema = Yup.object().shape({
	email: Yup.string().email(),
});

type ListInviteFormProps = {
	listId: string;
	onCreate: (invite: ListInvite) => void;
};
export default function ListInviteForm({
	listId,
	onCreate,
}: ListInviteFormProps) {
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const { openToast } = useToast();
	const { isLoading, mutateAsync: createListInvite } = useCreateListInvite({
		onSuccess: (data) => {
			onCreate(data);
			openToast({
				type: "success",
				text: "Invite sent.",
			});
			setEmail("");
		},
		onError: (err) => {
			console.log(err);
			if (err.response?.status === 409) {
				setError("Invite already sent to this address.");
				return;
			}

			setError(err.message);
		},
	});

	const onFormSubmit = useCallback(
		async (e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			setError(null);
			validateYupSchema({ email }, InviteSchema)
				.catch((err) => {
					setError(err.errors[0]);
				})
				.then(() => {
					createListInvite({ email, id: listId });
				});
		},
		[createListInvite, email, listId],
	);

	const onEmailChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
		setError(null);
		setEmail(e.currentTarget.value);
	}, []);

	return (
		<div className="mb-4">
			{error && <FeedbackBlock type="error">{error}</FeedbackBlock>}
			<Form onSubmit={onFormSubmit}>
				<Input
					id="email"
					type="email"
					name="email"
					label="Email address"
					value={email}
					onChange={onEmailChange}
				/>

				<Button
					className="float-right mt-4"
					disabled={email.length === 0}
					isLoading={isLoading}
				>
					Submit
				</Button>
			</Form>
		</div>
	);
}
