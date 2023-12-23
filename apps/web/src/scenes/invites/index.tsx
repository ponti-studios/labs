import { useNavigate } from "react-router-dom";
import Typography from "ui/Typography";

import DashboardWrap from "src/components/DashboardWrap";
import { useGetInvites } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";
import InviteListItem from "./components/InviteListItem";

const Invites = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data: invites, refetch } = useGetInvites();
  if (!user) {
    navigate("/");
  }

  return (
    <DashboardWrap>
      <Typography className="mb-4" variant="h1">
        Invites
      </Typography>
      {invites && (
        <ul>
          {invites.map((listInvite) => (
            <InviteListItem
              key={listInvite.listId}
              listInvite={listInvite}
              onAccept={refetch}
            />
          ))}
        </ul>
      )}
    </DashboardWrap>
  );
};

export default Invites;
