import { useNavigate } from "react-router-dom";

import { useGetInvites } from "src/services/api";
import { useAuth } from "src/services/hooks";
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
			<h1 className="text-4xl mb-4">Invites</h1>
			{invites && (
				<ul className="space-y-4">
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
