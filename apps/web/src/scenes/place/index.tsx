import React, { Suspense } from "react";

const LazyPlace = React.lazy(
	() => import(/* webpackChunkName: "place" */ "./Place"),
);

const Dashboard = (props) => (
	<Suspense>
		<LazyPlace {...props} />
	</Suspense>
);

export default Dashboard;
