import Button from "@hominem/components/Button";
import { PlusCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetLists } from "src/lib/api";
import { useAuth } from "src/lib/hooks";

import ListForm from "./components/ListForm";
import Lists from "./components/Lists";

const ListsRoute = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isListFormOpen, setIsListFormOpen] = useState(false);
	const { data, error, refetch, status: listsStatus } = useGetLists();

	const onAddListClick = useCallback(() => {
		setIsListFormOpen(true);
	}, []);

	const onListCreate = useCallback(() => {
		setIsListFormOpen(false);
		refetch();
	}, [refetch]);

	const onListFormCancel = useCallback(() => {
		setIsListFormOpen(false);
	}, []);

	if (!user) {
		navigate("/");
	}

	return (
		<>
			<div className="flex items-center justify-between pb-4">
				<h1 className="text-3xl font-bold">Lists</h1>
				{!isListFormOpen ? (
					<Button
						className="bg-transparent"
						onClick={onAddListClick}
						disabled={isListFormOpen}
					>
						<PlusCircle size={24} className="text-primary" />
					</Button>
				) : null}
			</div>
			{isListFormOpen ? (
				<div className="mb-4">
					<ListForm onCancel={onListFormCancel} onCreate={onListCreate} />
				</div>
			) : null}
			<div>
				<Lists
					status={listsStatus}
					lists={data}
					error={error}
					currentUserEmail={user?.email}
				/>
			</div>
		</>
	);
};

export default ListsRoute;
