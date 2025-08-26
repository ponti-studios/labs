import { redirect } from "react-router";

export function loader() {
	// Redirect to world data by default
	return redirect("/corona/OWID_WRL");
}
