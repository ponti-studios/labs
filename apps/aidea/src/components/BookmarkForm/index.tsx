import classNames from "classnames";
import { type SyntheticEvent, useCallback } from "react";
import FeedbackBlock from "ui/FeedbackBlock";

import useBookmarksForm from "./useBookmarkForm";

type BookmarksFormProps = {
	onCreate: () => void;
};
export default function BookmarksForm({ onCreate }: BookmarksFormProps) {
	const { error, isLoading, url, createBookmark, onUrlChange } =
		useBookmarksForm({
			onCreate,
		});
	const onFormSubmit = useCallback(
		(e: SyntheticEvent<HTMLFormElement>) => {
			e.preventDefault();
			createBookmark();
		},
		[createBookmark],
	);

	return (
		<>
			{error && <FeedbackBlock type="error">{error}</FeedbackBlock>}

			<form onSubmit={onFormSubmit}>
				<div className="form-control w-full mb-2">
					<label className="label hidden">
						<span className="label-text">URL</span>
					</label>
					<input
						type="url"
						placeholder="Add bookmark url"
						className="input w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
						value={url}
						onChange={onUrlChange}
					/>
				</div>
				{!!url.length && (
					<button
						type="submit"
						className={classNames(
							"btn btn-primary float-right min-w-full mb-4 rounded text-white",
							isLoading && "loading",
						)}
					>
						Submit
					</button>
				)}
			</form>
		</>
	);
}
