import { useNavigate } from "react-router-dom";
import Typography from "ui/Typography";

import { useGetInvites } from "src/services/api";
import { useAuth } from "src/services/store";
import InviteListItem from "./components/InviteListItem";

const Invites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invites, refetch } = useGetInvites();
  if (!user) {
    navigate("/");
  }

  return (
    <>
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
    </>
  );
};

export default Invites;
