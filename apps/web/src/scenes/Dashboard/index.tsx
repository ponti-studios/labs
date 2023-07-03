import React, { Suspense } from "react";

const LazyDashboard = React.lazy(
  () => import(/* webpackChunkName: "acount" */ "./Dashboard")
);

const Dashboard = (props) => (
  <Suspense>
    <LazyDashboard {...props} />
  </Suspense>
);

export default Dashboard;
