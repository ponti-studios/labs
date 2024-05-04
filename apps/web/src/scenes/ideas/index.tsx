import Loading from "@hominem/components/Loading";
import { useNavigate } from "react-router-dom";

import { useGetIdeas } from "src/services/api/ideas";
import { useAuth } from "src/services/hooks";
import IdeaForm from "./IdeaForm";
import IdeaListItem from "./IdeaListItem";

const Ideas = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data, refetch, status: ideasStatus } = useGetIdeas();

	if (!user) {
		navigate("/");
	}

	return (
		<>
			<IdeaForm onCreate={refetch} />
			<div>
				{ideasStatus === "loading" && <Loading />}
				{data?.length === 0 && "your thoughts will appear here"}
				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((idea) => (
							<IdeaListItem key={idea.id} idea={idea} onDelete={refetch} />
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export default Ideas;
