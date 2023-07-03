const FormButton = ({ children, ...props }) => {
  return (
    <button
      className="btn bg-blue-600 text-white border-none"
      type="submit"
      {...props}
    >
      {children}
    </button>
  );
};

export default FormButton;
