import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Shield, UserRound } from 'lucide-react';
import { login, loginWithGoogle, register, syncAuthSession } from '@/services/authService';

const authSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type AuthForm = z.infer<typeof authSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    (location.state as { message?: string } | null)?.message ?? '',
  );
  const [loading, setLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({ resolver: zodResolver(authSchema), defaultValues: { name: '', email: '', password: '' } });

  useEffect(() => {
    syncAuthSession().then((authenticated) => {
      if (authenticated) navigate('/', { replace: true });
    }).catch(() => undefined);
  }, [navigate]);

  const onSubmit = async (data: AuthForm) => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (isRegister) {
        const hasSession = await register(data.email, data.password, data.name ?? '');
        if (hasSession) navigate('/');
        else {
          navigate('/login', {
            replace: true,
            state: { message: 'Account created. Check your email to confirm your account, then sign in.' },
          });
        }
      } else {
        await login(data.email, data.password);
        navigate('/');
      }
    } catch {
      setError(isRegister ? 'Unable to create your account. Please try again.' : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      setError('Google sign-in is unavailable. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        position: 'relative',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(35, 43, 61, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(35, 43, 61, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: 400,
          maxWidth: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius)',
          padding: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--accent-signal)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Shield size={24} style={{ color: 'var(--bg-base)' }} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
              marginBottom: 6,
            }}
          >
            AETHON
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {isRegister ? 'Create your analyst account' : 'Email Threat Intelligence Platform'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <UserRound size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...registerField('name')} type="text" placeholder="Alex Morgan" className="input" style={{ paddingLeft: 36 }} autoComplete="name" />
              </div>
              {errors.name && <p style={{ fontSize: 12, color: 'var(--risk-critical)', marginTop: 4 }}>{errors.name.message}</p>}
            </div>
          )}

          {/* Email field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                {...registerField('email')}
                type="email"
                placeholder="analyst@company.com"
                className="input"
                style={{ paddingLeft: 36 }}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p style={{ fontSize: 12, color: 'var(--risk-critical)', marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                {...registerField('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p style={{ fontSize: 12, color: 'var(--risk-critical)', marginTop: 4 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(229, 72, 77, 0.1)',
                border: '1px solid rgba(229, 72, 77, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                marginBottom: 16,
                fontSize: 13,
                color: 'var(--risk-critical)',
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div style={{ backgroundColor: 'rgba(54, 179, 126, 0.1)', border: '1px solid rgba(54, 179, 126, 0.2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 16, fontSize: 13, color: 'var(--risk-low)' }}>
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px 16px', fontSize: 14 }}
          >
            {loading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create account' : 'Sign in')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
            <span style={{ height: 1, flex: 1, backgroundColor: 'var(--border-subtle)' }} />
            OR
            <span style={{ height: 1, flex: 1, backgroundColor: 'var(--border-subtle)' }} />
          </div>

          <button type="button" className="btn" onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', padding: '11px 16px', fontSize: 14 }}>
            Continue with Google
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to={isRegister ? '/login' : '/register'} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </Link>
        </div>
      </div>
    </div>
  );
}
