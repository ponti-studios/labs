import { useCallback } from "react";

import { useAcceptInviteMutation } from "src/services/api";
import { ListInvite } from "src/services/types";

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
    <li className="card shadow-md p-4 text-lg flex flex-row items-center justify-between border border-red-100">
      <p className="text-lg font-semibod text-gray-400">{list.name}</p>
      {accepted ? (
        <span className="text-sm">✅ Accepted</span>
      ) : (
        <span className="text-sm">⏳ Pending</span>
      )}
      <button
        className="btn btn-primary btn-sm"
        disabled={isLoading}
        onClick={onAcceptClick}
      >
        Accept
      </button>
    </li>
  );
};

export default InviteListItem;
