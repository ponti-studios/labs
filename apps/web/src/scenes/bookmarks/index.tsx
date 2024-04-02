import { useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import { useGetBookmarks } from "src/services/api/bookmarks";
import { useAuth } from "src/services/store";

import BookmarkForm from "./components/BookmarkForm";
import BookmarkListItem from "./components/BookmarkListItem";

const Recommendations = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data, refetch, status: bookmarksStatus } = useGetBookmarks();

	if (!user) {
		navigate("/");
	} else {
		refetch();
	}

	return (
		<>
			<BookmarkForm onCreate={refetch} />
			<div>
				{bookmarksStatus === "loading" && <LoadingScene />}
				{data?.length === 0 && "your bookmarks will appear here"}
				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((bookmark) => (
							<BookmarkListItem
								key={bookmark.id}
								bookmark={bookmark}
								onDelete={refetch}
							/>
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export default Recommendations;
