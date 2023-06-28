import { Field, Form, Formik } from "formik";
import { useCallback, useMemo, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import * as Yup from "yup";

import api from "src/services/api";
import { authSelectors, setCurrentEmail } from "src/services/auth";
import FeedbackBlock from "src/components/FeedbackBlock";
import AuthWrap from "src/components/AuthenticationWrap";
import { User } from "src/services/auth/auth.types";
import { LANDING_PATH } from "src/constants/routes";
import { RootState } from "src/services/store";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email(),
});

type LoginProps = {
  user?: User;
  setCurrentEmail: (value: string) => void; // eslint-disable-line
};
function Login({ setCurrentEmail, user }: LoginProps) {
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => ({
      email: "",
    }),
    []
  );

  useEffect(() => {
    if (user) {
      navigate(LANDING_PATH);
    }
  }, []);

  const onSubmit = useCallback(async ({ email }) => {
    try {
      // We don't use credentials for login because the user is not logged in
      await api.post("/login", { email }, { withCredentials: false });
      setCurrentEmail(email);
      navigate("/authenticate");
    } catch (err) {
      setError(true);
    }
  }, []);

  return (
    <AuthWrap>
      <h2 className="text-2xl font-semibold mb-6">Log in</h2>
      {error && (
        <FeedbackBlock>There was a problem! Try again, homie.</FeedbackBlock>
      )}
      <Formik
        validationSchema={LoginSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ errors }) => (
          <Form>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">What is your email?</span>
              </label>
              <Field
                className="input input-bordered"
                name="email"
                type="email"
                placeholder="Email"
              />
            </div>
            <button
              className="btn bg-blue-600 text-white border-none w-full"
              type="submit"
            >
              Get code
            </button>
          </Form>
        )}
      </Formik>
    </AuthWrap>
  );
}

const mapStateToProps = (state: RootState) => ({
  user: authSelectors.getUser(state),
});

const mapDispatchToProps = {
  setCurrentEmail,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
