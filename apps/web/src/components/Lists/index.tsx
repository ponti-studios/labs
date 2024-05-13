import Alert from "@hominem/components/Alert";
import { LoadingScreen } from "@hominem/components/Loading";

import type { List, User } from "src/lib/types";
import ListItem from "./list-item";

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
		return <LoadingScreen />;
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
				<ListItem
					key={list.id}
					list={list}
					isOwnList={list.createdBy.email === currentUserEmail}
				/>
			))}
		</ul>
	);
}
