import { forwardRef } from "react";
import { cn } from "../../utils/classNames";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="input-group">
        {label && (
          <label className="input-group__label" htmlFor={id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn("input", error && "input--error", className)}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && (
          <span id={`${id}-error`} className="input-group__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
