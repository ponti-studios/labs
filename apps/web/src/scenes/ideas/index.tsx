import { useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import DashboardNav from "src/components/DashboardNav";
import { useGetIdeas } from "src/services/api/ideas";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import IdeaForm from "./IdeaForm";
import IdeaListItem from "./IdeaListItem";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data, refetch, status: ideasStatus } = useGetIdeas();

  if (!user) {
    navigate("/");
  }

  return (
    <div className="flex flex-col">
      <DashboardNav />
      <div>
        <IdeaForm onCreate={refetch} />
      </div>
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
    </div>
  );
};

export default Dashboard;
