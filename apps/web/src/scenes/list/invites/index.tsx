import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AlertError from "ui/AlertError";
import LoadingScene from "ui/Loading";

import { useGetList, useGetListInvites } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import ListInviteForm from "../ListInviteForm";
import DashboardWrap from "src/components/DashboardWrap";

const ListInvites = () => {
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
    <DashboardWrap>
      <div className="flex flex-col px-0.5">
        <h1 className="text-2xl">
          <Link to={`/list/${userList.id}`}>
            <span className="font-extrabold text-4xl mr-4">
              {userList.name}
            </span>
          </Link>
          <span className="text-primary-focus">Invites</span>
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
          <p className="text-lg flex justify-center p-4 font-semibold text-primary-focus">
            You haven&apos;t invited anyone to this list yet.
          </p>
        ))}
    </DashboardWrap>
  );
};

export default ListInvites;
