import styled from "@emotion/styled";
import { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";

import { LANDING_PATH } from "src/constants/routes";
import { authSelectors } from "src/services/auth";
import { RootState } from "src/services/store";
import { User } from "src/services/utils/propTypes";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
`;

function Account({ user }: { user: User }) {
  const navigate = useNavigate();
  const memberSince = new Date(user.createdAt);
  const timeDiff = new Date().getTime() - memberSince.getTime();

  // Convert milliseconds to years
  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));

  useEffect(() => {
    if (!user) {
      navigate(LANDING_PATH);
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <Wrap>
      {/* {user.avatar && (
        <img
          src={user.avatar}
          alt="user avatar"
          className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
        />
      )} */}

      {user.name && <h2>{user.name}</h2>}
      <p className="font-semibold">{user.email}</p>
      <p>{`Member since ${memberSince.getFullYear() + years}`}</p>
    </Wrap>
  );
}

const mapStateToProps = (state: RootState) => ({
  user: authSelectors.getUser(state),
});

export default connect(mapStateToProps)(Account);
