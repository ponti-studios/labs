import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "src/lib/auth";
import { LANDING } from "src/lib/utils/routes";

function useDeleteUserMutation() {
	return {
		mutateAsync: () => Promise.resolve({ error: Error }),
		error: null,
	};
}

function MemberSince({ createdAt }: { createdAt: string }) {
	const memberSince = new Date(createdAt);
	const timeDiff = new Date().getTime() - memberSince.getTime();
	// Convert milliseconds to years
	const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));

	return (
		<p>{`Member since ${memberSince.getMonth()}/${
			memberSince.getFullYear() + years
		}`}</p>
	);
}

function Account() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { mutateAsync: deleteUser, error } = useDeleteUserMutation();

	const onDelectAccount = async () => {
		await deleteUser();
	};

	useEffect(() => {
		if (!user) {
			navigate(LANDING);
		}
	}, [navigate, user]);

	if (!user) {
		return null;
	}

	return (
		<div className="flex flex-col items-center py-8">
			<div className="col-span-12">
				<h1>Account</h1>
				<div className="card shadow-md md:max-w-sm">
					<div className="card-body">
						{user.avatar && (
							<img
								src={user.avatar}
								alt="user avatar"
								className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
							/>
						)}
						<p className="text-lg">{user?.name}</p>
						<p className="text-sm text-gray-400">{user?.email}</p>
						<MemberSince createdAt={user.createdAt} />
					</div>
				</div>
				<div className="flex flex-col mb-12" />

				<div className="divider" />

				{error && <Alert type="error">{error.message}</Alert>}

				<Button className="btn-ghost text-error" onClick={onDelectAccount}>
					Delete account
				</Button>
			</div>
		</div>
	);
}

export default Account;
