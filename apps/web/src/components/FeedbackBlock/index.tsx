import styled from "@emotion/styled";
import { ReactNode } from "react";

const Wrap = styled.div`
  border-radius: 4px;
  background-color: #e83333;
  color: white;
  padding: 16px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 16px;
`;

type FeedbackBlockProps = {
  className?: string;
  children: ReactNode;
};
function FeedbackBlock({ className, children }: FeedbackBlockProps) {
  return <Wrap className={className}>{children}</Wrap>;
}

export default FeedbackBlock;
