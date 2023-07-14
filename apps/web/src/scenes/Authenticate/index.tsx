import { Field, Formik } from "formik";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import FeedbackBlock from "src/components/FeedbackBlock";
import Form from "src/components/Form";
import { DASHBOARD_PATH, LOGIN_PATH } from "src/constants/routes";
import { authSelectors, setCurrentEmail, setUser } from "src/services/auth";
import { authenticate, getUser } from "src/services/auth/auth.api";
import { RootState } from "src/services/store";
import { FormButton } from "src/components/Form/components";

const AuthenticateSchema = Yup.object().shape({
  emailToken: Yup.string().length(8),
});

type AuthenticateProps = {
  loginEmail?: string;
};
function Authenticate({ loginEmail = "" }: AuthenticateProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const initialValues = useMemo(
    () => ({
      emailToken: "",
    }),
    []
  );

  const onSubmit = useCallback(
    async ({ emailToken }) => {
      if (loginEmail) {
        try {
          await authenticate({ email: loginEmail, emailToken });
          const response = await getUser();
          dispatch(setUser(response.data));
          dispatch(setCurrentEmail(null));
          navigate(DASHBOARD_PATH);
        } catch (err) {
          console.log({ err });
          setError(true);
          navigate(LOGIN_PATH);
        }
      }
    },
    [dispatch, navigate, loginEmail]
  );

  useEffect(() => {
    // If loginEmail is not set, user will need to request a new email token
    if (!loginEmail) {
      navigate("/login");
    }
  });

  return (
    loginEmail && (
      <AuthWrap>
        <h2 className="text-2xl font-semibold mb-6">Authenticate</h2>
        {error && <FeedbackBlock>There was a problem, boo boo.</FeedbackBlock>}
        <Formik
          validationSchema={AuthenticateSchema}
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          <Form>
            <div className="form-control w-full">
              <label className="label" htmlFor="emailToken">
                <span className="label-text">
                  Enter code sent to your email.
                </span>
              </label>
              <Field
                type="string"
                name="emailToken"
                label="Code"
                className="input input-bordered"
                placeholder="Code"
              />
            </div>
            <FormButton>Login</FormButton>
          </Form>
        </Formik>
      </AuthWrap>
    )
  );
}

const mapStateToProps = (state: RootState) => ({
  loginEmail: authSelectors.getLoginEmail(state),
  user: authSelectors.getUser(state),
});

export default connect(mapStateToProps)(Authenticate as React.FC);
