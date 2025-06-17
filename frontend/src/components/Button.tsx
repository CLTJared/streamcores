import { type ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

const Button = ({ children, className = "", onClick, type = "button" }: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;