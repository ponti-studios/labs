import styled, { StyledComponent } from "@emotion/styled";
import { Form } from "formik";

const Wrap = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 24px;

  & > * {
    flex: 1;
  }
`;

const StyledForm = ({ children }) => {
  return <Wrap>{children}</Wrap>;
};

export default StyledForm;
