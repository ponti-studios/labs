type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};
const FormButton = ({ children, ...props }: FormButtonProps) => {
  return (
    <button className="btn btn-primary border-none" type="submit" {...props}>
      {children}
    </button>
  );
};

export default FormButton;
