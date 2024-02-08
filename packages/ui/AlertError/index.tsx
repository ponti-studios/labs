type AlertErrorProps = {
  error?: string;
};
function AlertError({ error }: AlertErrorProps) {
  return (
    <div className="flex alert alert-error mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current flex-shrink-0 size-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        <p>{error}</p>
      </span>
    </div>
  );
}

export default AlertError;
