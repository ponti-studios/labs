import { Field, Formik } from "formik";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import FeedbackBlock from "src/components/FeedbackBlock";
import Form from "src/components/Form";
import { FormButton } from "src/components/Form/components";
import { LANDING } from "src/constants/routes";
import api from "src/services/api";
import { setCurrentEmail } from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email(),
});

function Login() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(getUser);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => ({
      email: "",
    }),
    [],
  );

  const onSubmit = useCallback(
    async ({ email }) => {
      try {
        // We don't use credentials for login because the user is not logged in
        await api.post("/login", { email }, { withCredentials: false });
        dispatch(setCurrentEmail(email));
        navigate("/authenticate");
      } catch (err) {
        setError(true);
      }
    },
    [dispatch, navigate],
  );

  useEffect(() => {
    if (user) {
      navigate(LANDING);
    }
  });

  return (
    <AuthWrap>
      {error && (
        <FeedbackBlock>There was a problem! Try again, homie.</FeedbackBlock>
      )}
      <h2 className="text-primary-focus text-2xl font-semibold mb-6">Log in</h2>
      <Formik
        validationSchema={LoginSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        <Form>
          <div className="form-control w-full">
            <label className="label pl-0" htmlFor="email">
              <span className="label-text text-primary-focus">
                What is your email?
              </span>
            </label>
            <Field
              className="input input-bordered text-primary w-full"
              name="email"
              type="email"
              placeholder="Email"
            />
          </div>
          <FormButton>Get code</FormButton>
        </Form>
      </Formik>
    </AuthWrap>
  );
}

export default Login;
