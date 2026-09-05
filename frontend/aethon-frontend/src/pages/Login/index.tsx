import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Zap } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);
    try {
      const res = await login(data);
      setAuth(res.token, res.user);
      navigate("/");
    } catch {
      setServerError("Login failed — check your credentials and try again.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card" role="main">
        <div className="login-card__logo" aria-label="AETHON AI">
          <div className="login-card__logo-icon">
            <Zap size={24} />
          </div>
          <span className="login-card__logo-text">AETHON</span>
        </div>

        <h1 className="login-card__title">Threat Intelligence Console</h1>
        <p className="login-card__subtitle">Sign in to your SOC analyst account</p>

        <form
          id="login-form"
          onSubmit={handleSubmit(onSubmit)}
          className="login-card__form"
          noValidate
          aria-label="Login form"
        >
          <Input
            id="login-email"
            label="Email address"
            type="email"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <p className="login-card__error" role="alert">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="login-card__submit"
          >
            Sign in
          </Button>
        </form>

        <p className="login-card__footer">
          AETHON AI · SIH 2026 · PS ID 26106
        </p>
      </div>
    </div>
  );
}
