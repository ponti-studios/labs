import { PropsWithChildren } from "react";

function FeedbackBlock({ children }: PropsWithChildren<object>) {
  return (
    <div className="rounded-md bg-[#e83333] text-white p-4 text-center text-md font-semibold mb-4">
      {children}
    </div>
  );
}

export default FeedbackBlock;
