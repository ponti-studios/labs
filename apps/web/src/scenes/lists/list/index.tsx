import React, { Suspense } from "react";

const LazyList = React.lazy(
	() => import(/* webpackChunkName: "list" */ "./List"),
);

const Dashboard = (props) => (
	<Suspense>
		<LazyList {...props} />
	</Suspense>
);

export default Dashboard;
