import { PropsWithChildren } from "react";

function FeedbackBlock({ children }: PropsWithChildren<object>) {
  return (
    <div className="rounded-md bg-red-400 text-error-content p-4 text-md mb-4">
      {children}
    </div>
  );
}

export default FeedbackBlock;
