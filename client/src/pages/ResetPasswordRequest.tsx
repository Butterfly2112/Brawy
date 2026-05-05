import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ResetPasswordRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    if (!tokenFromUrl) {
      return;
    }

    navigate(`/reset-password?token=${encodeURIComponent(tokenFromUrl)}`, {
      replace: true,
    });
  }, [navigate, tokenFromUrl]);

  const mutation = useMutation({
    mutationFn: () => requestPasswordReset(email),
    onSuccess: (data) => {
      setMessage(data.message || 'Check your email for the reset link.');
      setError('');
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'Request failed');
      setMessage('');
    },
  });

  return (
      <div className="app">
        <Header />

        <main className="login-page">
          {/* ЛІВА ЧАСТИНА */}
          <div className="login-left">
            <div className="welcome-content">
              <h1>Forgot Password?</h1>
              <p>Don't worry! Enter your email address and we'll send you a link to reset your password and get you back to creating.</p>
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА: Форма запиту */}
          <div className="login-right">
            <form
                className="login-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setError('');
                  mutation.mutate();
                }}
            >
              <h2>Reset Password</h2>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Enter the email associated with your account.
              </p>

              <div className="input-group">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
              </div>

              <button type="submit" className="button-agree" disabled={mutation.isPending}>
                {mutation.isPending ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="form-footer">
                <Link to="/login">Back to Sign In</Link>
              </div>

              {/* Повідомлення про успіх */}
              {message && (
                  <div className="status-msg" style={{ color: '#28a745', background: '#e6ffed', padding: '10px', borderRadius: '5px', textAlign: 'center', marginTop: '10px' }}>
                    {message}
                  </div>
              )}

              {/* Повідомлення про помилку */}
              {error && <div className="error-msg" style={{ marginTop: '10px' }}>{error}</div>}
            </form>
          </div>
        </main>

        <Footer />
      </div>
  );
}