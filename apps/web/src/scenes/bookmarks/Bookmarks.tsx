import Loading from "@hominem/components/Loading";
import { useNavigate } from "react-router-dom";

import BookmarkForm from "src/components/BookmarkForm";
import BookmarkListItem from "src/components/BookmarkListItem";
import { useGetBookmarks } from "src/lib/api/bookmarks";
import { useAuth } from "src/lib/auth";

const Bookmarks = () => {
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
				{bookmarksStatus === "pending" && <Loading />}
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

export default Bookmarks;
