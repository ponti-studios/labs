import styled from "@emotion/styled";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { LANDING_PATH } from "src/constants/routes";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";
import AlertError from "ui/AlertError";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
`;

function useDeleteUserMutation() {
  return {
    mutateAsync: () => Promise.resolve({ error: Error }),
    error: null,
  };
}

function Account() {
  const user = useAppSelector(getUser);
  const navigate = useNavigate();
  const memberSince = new Date(user.createdAt);
  const timeDiff = new Date().getTime() - memberSince.getTime();
  const { mutateAsync: deleteUser, error } = useDeleteUserMutation();

  // Convert milliseconds to years
  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));

  const onDelectAccount = async () => {
    await deleteUser();
  };

  useEffect(() => {
    if (!user) {
      navigate(LANDING_PATH);
    }
  }, [navigate, user]);

  if (!user) {
    return null;
  }

  return (
    <Wrap>
      {user.name && <h2>{user.name}</h2>}
      <div className="col-span-12">
        <h1>Account</h1>

        <div className="card shadow-md md:max-w-sm">
          <div className="card-body place-items-center">
            {user.avatar && (
              <img
                src={user.avatar}
                alt="user avatar"
                className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
              />
            )}
            <p className="text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="flex flex-col mb-12"></div>

        <div className="divider" />

        {error && <AlertError error={error.message} />}

        <button className="btn btn-ghost text-error" onClick={onDelectAccount}>
          Delete account
        </button>
      </div>
      <p className="font-semibold">{user.email}</p>
      <p>{`Member since ${memberSince.getFullYear() + years}`}</p>
    </Wrap>
  );
}

export default Account;
