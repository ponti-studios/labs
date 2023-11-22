import { useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import { useGetIdeas } from "src/services/api/ideas";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import IdeaForm from "./IdeaForm";
import IdeaListItem from "./IdeaListItem";

const Ideas = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data, refetch, status: ideasStatus } = useGetIdeas();

  if (!user) {
    navigate("/");
  }

  return (
    <DashboardWrap>
      <IdeaForm onCreate={refetch} />
      <div>
        {ideasStatus === "loading" && <LoadingScene />}
        {data?.length === 0 && "your thoughts will appear here"}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((idea) => (
              <IdeaListItem key={idea.id} idea={idea} onDelete={refetch} />
            ))}
          </ul>
        )}
      </div>
    </DashboardWrap>
  );
};

export default Ideas;
