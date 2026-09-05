import { forwardRef } from "react";
import { cn } from "../../utils/classNames";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          `btn--${variant}`,
          `btn--${size}`,
          loading && "btn--loading",
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="btn__spinner" aria-hidden="true" />
        ) : null}
        <span className={cn(loading && "btn__content--loading")}>{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
