import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import PasswordInput from '../components/PasswordInput.jsx';

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>Continue your stay planning.</h1>
        <p>Log in to access your guest profile and future reservations.</p>
      </section>

      <section className="auth-card" aria-labelledby="login-title">
        <div className="card-heading">
          <p className="eyebrow">Guest access</p>
          <h2 id="login-title">Log in to your account</h2>
        </div>

        {error && <div className="form-alert" role="alert">{error}</div>}
        {location.state?.registered && <div className="success-alert" role="status">Account created successfully. Enter your password to log in.</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            autoComplete="email"
            id="email"
            name="email"
            onChange={updateField}
            placeholder="you@example.com"
            required
            type="email"
            value={form.email}
          />

          <label htmlFor="password">Password</label>
          <PasswordInput
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={updateField}
            required
            value={form.password}
          />

          <button className="button button-primary button-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New to HavenStay? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
