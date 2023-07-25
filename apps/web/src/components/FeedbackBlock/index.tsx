import styled from "@emotion/styled";
import { ReactNode } from "react";

const Wrap = styled.div`
  border-radius: 4px;
  border: 1px solid grey;
  padding: 16px;
  font-size: 1.3rem;
  font-weight: 500;
`;

type FeedbackBlockProps = {
  className?: string;
  children: ReactNode;
};
function FeedbackBlock({ className, children }: FeedbackBlockProps) {
  return <Wrap className={className}>{children}</Wrap>;
}

export default FeedbackBlock;
