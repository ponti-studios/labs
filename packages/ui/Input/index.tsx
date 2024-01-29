import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  altLabel?: string;
  bottomRightLabel?: string;
  error?: string;
  label: string;
  name: string;
} & (
    | { value: string; type: "text" }
    | { value: string; type: "password" }
    | { value: string; type: "email" }
    | { value: string; type: "number" }
    | { value: string; type: "search" }
    | { value: string; type: "tel" }
    | { value: string; type: "url" }
    | { value: string; type: "date" }
    | { value: string; type: "datetime-local" }
    | { value: string; type: "month" }
    | { value: string; type: "week" }
    | { value: string; type: "time" }
    | { value: string; type: "color" }
  );

function Input({
  altLabel,
  bottomRightLabel,
  error,
  label,
  name,
  ...props
}: Props) {
  return (
    <>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">{label}</span>
          {altLabel ? <span className="label-text-alt">Alt label</span> : null}
        </div>
        <input
          name={name}
          className="input input-bordered w-full"
          {...props}
          type={props.type || "text"}
          value={props.value}
        />
        <div className="label">
          {error ? (
            <span className="label-text-alt text-error">{error}</span>
          ) : null}
          {bottomRightLabel ? (
            <span className="label-text-alt">Bottom Right label</span>
          ) : null}
        </div>
      </label>
    </>
  );
}

export default Input;
