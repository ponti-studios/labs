import React, { Suspense } from "react";

const LazyBookmarks = React.lazy(
	() => import(/* webpackChunkName: "bookmarks" */ "./Bookmarks"),
);

const Dashboard = (props) => (
	<Suspense>
		<LazyBookmarks {...props} />
	</Suspense>
);

export default Dashboard;
