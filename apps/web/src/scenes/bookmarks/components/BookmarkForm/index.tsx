import Button from "@hominem/components/Button";
import FeedbackBlock from "@hominem/components/FeedbackBlock";
import { type SyntheticEvent, useCallback, useState } from "react";

import { useCreateBookmark } from "src/services/api/bookmarks";

type BookmarksFormProps = {
	onCreate: () => void;
};
export default function BookmarksForm({ onCreate }: BookmarksFormProps) {
	const { mutateAsync, error, isLoading } = useCreateBookmark();
	const [url, setUrl] = useState("");

	const onUrlChange = useCallback((e: SyntheticEvent<HTMLInputElement>) => {
		setUrl(e.currentTarget.value);
	}, []);

	const onFormSubmit = useCallback(
		async (e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			await mutateAsync(url);
			setUrl("");
			onCreate();
		},
		[mutateAsync, onCreate, url],
	);

	return (
		<>
			{error && <FeedbackBlock type="error">{error as string}</FeedbackBlock>}

			<form onSubmit={onFormSubmit}>
				<div className="form-control w-full mb-2">
					<label className="label hidden" htmlFor="url">
						<span className="label-text">URL</span>
					</label>
					<input
						id="url"
						type="url"
						placeholder="Add bookmark url"
						className="input w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
						value={url}
						onChange={onUrlChange}
					/>
				</div>
				{!!url.length && <Button isLoading={isLoading}>Submit</Button>}
			</form>
		</>
	);
}
