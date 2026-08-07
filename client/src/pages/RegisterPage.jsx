import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { getApiErrorMessage } from '../utils/apiError.js';
import PasswordInput from '../components/PasswordInput.jsx';

function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/login', { replace: true, state: { registered: true, email: form.email } });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">Start here</p>
        <h1>Create your guest account.</h1>
        <p>One secure account will keep your future bookings and hotel activity together.</p>
      </section>

      <section className="auth-card" aria-labelledby="register-title">
        <div className="card-heading">
          <p className="eyebrow">Guest registration</p>
          <h2 id="register-title">Your account details</h2>
        </div>

        {error && <div className="form-alert" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input autoComplete="name" id="name" minLength="2" name="name" onChange={updateField} required value={form.name} />

          <label htmlFor="email">Email address</label>
          <input autoComplete="email" id="email" name="email" onChange={updateField} required type="email" value={form.email} />

          <label htmlFor="password">Password</label>
          <PasswordInput
            autoComplete="new-password"
            id="password"
            minLength="8"
            name="password"
            onChange={updateField}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,72}"
            required
            title="Use at least 8 characters with an uppercase letter, lowercase letter, and number."
            value={form.password}
          />
          <p className="field-hint">At least 8 characters with uppercase, lowercase, and a number.</p>

          <label htmlFor="confirmPassword">Confirm password</label>
          <PasswordInput autoComplete="new-password" id="confirmPassword" name="confirmPassword" onChange={updateField} required value={form.confirmPassword} />

          <button className="button button-primary button-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
