import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AlertError from "ui/AlertError";
import LinkButton from "ui/LinkButton";
import LoadingScene from "ui/Loading";

import { useGetList, useGetListInvites } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import ListInviteForm from "./ListInviteForm";

const List = () => {
  const params = useParams();
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const listId = params.id;
  const { data: userList, status: listStatus } = useGetList(listId);
  const {
    data: listInvites,
    status: invitesStatus,
    refetch: getInvites,
  } = useGetListInvites(listId);
  const onInviteSuccess = useCallback(() => getInvites(), [getInvites]);

  if (!user) {
    navigate("/");
  }

  if ([listStatus, invitesStatus].indexOf("loading") >= 0) {
    return <LoadingScene />;
  }

  if (!userList) {
    return <AlertError error="We could not find this list." />;
  }

  return (
    <>
      <div className="flex mb-8">
        <LinkButton href={`/list/${userList.id}`}>
          <span className="mr-1">⬅️</span> Back to list
        </LinkButton>
      </div>
      <div className="flex flex-col px-0.5">
        <h1>
          <span className="text-gray-600">{userList.name}</span> Invites
        </h1>
      </div>
      <ListInviteForm listId={listId} onCreate={onInviteSuccess} />
      {listInvites &&
        (listInvites.length > 0 ? (
          <ul className="space-y-2">
            {listInvites.map(({ accepted, invitedUserEmail }) => (
              <li
                key={invitedUserEmail}
                className="card shadow-md p-4 text-lg flex flex-row justify-between"
              >
                <p className="text-sm text-gray-400">{invitedUserEmail}</p>
                {accepted ? (
                  <span className="text-sm">✅ Accepted</span>
                ) : (
                  <span className="text-sm">⏳ Pending</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg flex justify-center p-4 font-semibold">
            You haven&apos;t invited anyone to this list yet.
          </p>
        ))}
    </>
  );
};

export default List;
