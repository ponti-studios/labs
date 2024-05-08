import Alert from "@hominem/components/Alert";
import Loading from "@hominem/components/Loading";
import { Link } from "react-router-dom";

import type { List, User } from "src/lib/types";

const NoResults = () => {
	return (
		<div className="flex flex-col items-center justify-center text-center py-6">
			<p className="text-2xl font-bold">No lists found.</p>
			<p className="text-gray-400">
				Your lists will appear here once you create them.
			</p>
		</div>
	);
};

export default function Lists({
	status,
	lists,
	error,
	currentUserEmail,
}: {
	status: string;
	lists: (List & { createdBy: User })[];
	error: any;
	currentUserEmail: string;
}) {
	if (status === "loading") {
		return <Loading />;
	}

	if (error) {
		return <Alert type="error">{error.message}</Alert>;
	}

	if (lists?.length === 0) {
		return <NoResults />;
	}

	if (!lists) {
		return null;
	}

	return (
		<ul data-testid="lists" className="space-y-2">
			{lists.map((list) => (
				<li key={list.id} className="flex">
					<Link
						className="flex justify-between items-center p-3 text-lg border rounded-md w-full"
						to={`/list/${list.id}`}
					>
						{list.name}
						{/* Only display list owner if the list does not belong to current user */}
						{list.createdBy && list.createdBy.email !== currentUserEmail ? (
							<p className="text-xs text-gray-400">{list.createdBy.email}</p>
						) : null}
					</Link>
				</li>
			))}
		</ul>
	);
}
