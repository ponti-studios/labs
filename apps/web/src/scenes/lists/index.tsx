import React, { Suspense } from "react";

const LazyLists = React.lazy(
	() => import(/* webpackChunkName: "lists" */ "./lists"),
);

const Dashboard = (props) => (
	<Suspense>
		<LazyLists {...props} />
	</Suspense>
);

export default Dashboard;
