import { CheckCircledIcon } from "@radix-ui/react-icons";
import { ToastMessage, useToast } from "src/services/toast/toast.slice";

const Toast = () => {
  const { messages } = useToast();

  const ToastItem = ({ message }: { message: ToastMessage }) => {
    return (
      <div className={`alert alert-${message.type}`}>
        {message.type === "success" && (
          <CheckCircledIcon className="w-4 h-4 mr-2" />
        )}
        <span>{message.text}</span>
      </div>
    );
  };

  return (
    <div className="toast toast-center z-50 bottom-20">
      {messages.map((message) => (
        <ToastItem key={message.text} message={message} />
      ))}
    </div>
  );
};

export default Toast;
