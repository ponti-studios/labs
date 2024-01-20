import { Field, Formik } from "formik";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import * as Yup from "yup";

import AuthWrap from "src/components/AuthenticationWrap";
import FeedbackBlock from "src/components/FeedbackBlock";
import Form from "src/components/Form";
import { LANDING } from "src/constants/routes";
import api from "src/services/api";
import { setCurrentEmail } from "src/services/auth";
import { useAppDispatch } from "src/services/hooks";
import { useAuth } from "src/services/store";
import Button from "ui/Button";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email(),
});

function Login() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialValues = useMemo(
    () => ({
      email: "",
    }),
    [],
  );

  const { mutateAsync, isLoading, isError } = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      await api.post("/login", { email }, { withCredentials: false });
      dispatch(setCurrentEmail(email));
    },
    onSuccess: () => {
      navigate("/authenticate");
    },
  });

  const onSubmit = useCallback(
    (values) => {
      mutateAsync(values);
    },
    [mutateAsync],
  );

  useEffect(() => {
    if (user) {
      navigate(LANDING);
    }
  });

  return (
    <AuthWrap>
      {isError && (
        <FeedbackBlock>
          There was a problem submitting your email. Try again later.
        </FeedbackBlock>
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
          <Button isLoading={isLoading}>Get code</Button>
        </Form>
      </Formik>
    </AuthWrap>
  );
}

export default Login;
