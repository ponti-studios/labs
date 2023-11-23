import { useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import { useGetInboundInvites } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import ListInviteItem from "./components/ListInviteItem";

const ListInvites = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data, refetch, status } = useGetInboundInvites();

  if (!user) {
    navigate("/");
  }

  return (
    <DashboardWrap>
      <h1>List Invites</h1>
      {status === "loading" && <LoadingScene />}
      {status === "success" && (
        <div>
          {data?.length === 0 &&
            "Invites others have sent you will appear here."}
          {data && data.length > 0 && (
            <ul className="space-y-2">
              {data.map((invite) => (
                <ListInviteItem
                  key={invite.listId}
                  invite={invite}
                  onAcceptInvite={refetch}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </DashboardWrap>
  );
};

export default ListInvites;
