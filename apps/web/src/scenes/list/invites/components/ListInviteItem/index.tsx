import React, { useCallback } from "react";

import { useAcceptInviteMutation } from "src/services/api";
import type { ListInvite } from "src/services/types";
import Button from "ui/Button";

type ListInviteItemProps = {
	invite: ListInvite;
	onAcceptInvite: () => void;
};
function ListInviteItem({ invite, onAcceptInvite }: ListInviteItemProps) {
	const mutation = useAcceptInviteMutation();
	const acceptInvite = useCallback(async () => {
		await mutation.mutateAsync(invite.listId);
		onAcceptInvite();
	}, [invite.listId, mutation, onAcceptInvite]);

	return (
		<li className="card shadow-md px-2 py-4 text-primary flex flex-row justify-between">
			<p
				className={`text-lg flex flex-col gap-2${
					invite.accepted ? "" : " text-gray-400"
				}`}
			>
				<span className="text-lg font-semibold">{invite.list.name}</span>
				<span className="text-sm text-gray-400">{invite.user.email}</span>
			</p>
			<div>
				{invite.accepted ? (
					<p className="text-md">✅ Accepted</p>
				) : (
					<Button
						className="btn-success btn-sm rounded-md"
						onClick={acceptInvite}
					>
						Accept
					</Button>
				)}
			</div>
		</li>
	);
}

export default React.memo(ListInviteItem);
