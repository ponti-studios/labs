import React, { Suspense } from "react";

const LazyAccount = React.lazy(
	() => import(/* webpackChunkName: "account" */ "./Account"),
);

const Account = (props) => (
	<Suspense>
		<LazyAccount {...props} />
	</Suspense>
);

export default Account;
