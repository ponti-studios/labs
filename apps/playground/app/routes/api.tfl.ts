import { getCameras } from "~/lib/tfl/service";

export async function loader() {
	try {
		const cameras = await getCameras();
		return Response.json({ cameras });
	} catch (error) {
		console.error("Error fetching TFL cameras:", error);
		return Response.json({ error: "Failed to fetch cameras" }, { status: 500 });
	}
}
