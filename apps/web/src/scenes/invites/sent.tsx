import { useNavigate } from "react-router-dom";

import LinkButton from "ui/LinkButton";

import DashboardNav from "src/components/DashboardNav";
import { useGetOutboundInvites } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

const ListInvites = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data } = useGetOutboundInvites();

  if (user) {
    navigate("/");
  }

  return (
    <>
      <DashboardNav />
      <div className="my-4">
        <LinkButton href="/lists/invites">
          <span className="mr-1">⬅️</span> Back to invites
        </LinkButton>
      </div>
      <h1>Sent Invites</h1>
      <div>
        {data?.length === 0 && "Your invites will appear here."}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((invite) => (
              <li key={invite.listId} className="card shadow-md p-4">
                <p>
                  <span className="font-semibold mr-2">List:</span>
                  {invite.list.name}
                </p>
                <p>
                  <span className="font-semibold mr-2">User:</span>
                  {invite.invitedUserEmail}
                </p>
                <p>
                  <span className="font-semibold mr-2">Accepted:</span>
                  {invite.accepted ? "Accepted ✅" : "Awaiting acceptance ⏳"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ListInvites;
