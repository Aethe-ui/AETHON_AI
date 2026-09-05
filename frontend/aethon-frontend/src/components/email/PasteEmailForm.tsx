import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";

const PasteSchema = z.object({
  rawEmail: z.string().min(20, "Paste the full raw email headers and body (at least 20 characters)."),
});
type PasteFormValues = z.infer<typeof PasteSchema>;

interface PasteEmailFormProps {
  onSubmit: (rawEmail: string) => void;
  disabled?: boolean;
}

export function PasteEmailForm({ onSubmit, disabled }: PasteEmailFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasteFormValues>({ resolver: zodResolver(PasteSchema) });

  return (
    <form
      id="paste-email-form"
      onSubmit={handleSubmit((data) => onSubmit(data.rawEmail))}
      className="paste-form"
      aria-label="Paste raw email for analysis"
    >
      <div className="input-group">
        <label htmlFor="raw-email-input" className="input-group__label">
          Raw email headers and body
        </label>
        <textarea
          id="raw-email-input"
          {...register("rawEmail")}
          className="paste-form__textarea"
          placeholder="Received: from mail.example.com…&#10;From: suspicious@domain.ru&#10;Subject: …"
          rows={14}
          disabled={disabled}
          aria-invalid={Boolean(errors.rawEmail)}
          aria-describedby={errors.rawEmail ? "raw-email-error" : undefined}
          spellCheck={false}
        />
        {errors.rawEmail && (
          <span id="raw-email-error" className="input-group__error" role="alert">
            {errors.rawEmail.message}
          </span>
        )}
      </div>
      <Button type="submit" variant="primary" disabled={disabled}>
        Analyze email
      </Button>
    </form>
  );
}
