import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  delay?: number;
  type?: "success" | "error";
}

const ToastMessage: React.FC<ToastProps> = ({
  message,
  show,
  onClose,
  delay = 3000,
  type = "success",
}) => {
  const toastClass = type === "success" ? "bg-success" : "bg-danger";
  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={show}
        onClose={onClose}
        delay={delay}
        autohide
        className={toastClass}
      >

        <Toast.Body>
          <div className="d-flex position-relative justify-content-start align-items-center">
            <div className="d-flex justify-content-end align-items-center position-absolute w-100">
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <p className="text-white mb-0">{message}</p>
          </div>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastMessage;
