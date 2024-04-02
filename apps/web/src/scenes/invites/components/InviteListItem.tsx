import { Link2 } from "lucide-react";
import { useCallback } from "react";
import { Link } from "react-router-dom";

import Button from "@hominem/components/Button";
import { useAcceptInviteMutation } from "src/services/api";
import type { ListInvite } from "src/services/types";

type InviteListItemProps = {
	listInvite: ListInvite;
	onAccept: () => void;
};
const InviteListItem = ({ listInvite, onAccept }: InviteListItemProps) => {
	const { accepted, list } = listInvite;
	const { mutate, isLoading } = useAcceptInviteMutation({
		onSuccess: onAccept,
	});

	const onAcceptClick = useCallback(() => {
		mutate(listInvite.listId);
	}, [listInvite.listId, mutate]);

	return (
		<li className="card p-4 text-lg flex flex-row items-center justify-between border min-h-[82px]">
			<p className="text-lg font-semibold">{list.name}</p>
			{accepted ? (
				<Link
					to={`/list/${list.id}`}
					className="flex items-center gap-2 text-md normal-case font-medium btn btn-outline"
				>
					View list
					<Link2 size={24} />
				</Link>
			) : (
				<Button
					className="normal-case"
					disabled={isLoading}
					onClick={onAcceptClick}
				>
					Accept invite
				</Button>
			)}
		</li>
	);
};

export default InviteListItem;
