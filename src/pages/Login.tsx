import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, emailVerified, sendEmailVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/'); 
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Please verify your email before logging in') {
          setError('Please verify your email before logging in');
          // Show resend verification option
          if (user) {
            try {
              await sendEmailVerification(user);
              setVerificationSent(true);
            } catch (verifyErr) {
              console.error('Failed to send verification email:', verifyErr);
            }
          }
        } else {
          setError('Invalid email or password');
        }
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand" style={{ fontFamily: "'Anta', sans-serif" }}>
            Chatti.Bot
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-100">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                  text-gray-100 placeholder-gray-500
                  focus:outline-none focus:ring-brand focus:border-brand"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                  text-gray-100 placeholder-gray-500
                  focus:outline-none focus:ring-brand focus:border-brand"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          
          {error === 'Please verify your email before logging in' && (
            <div className="text-sm text-center space-y-2">
              <p className="text-red-400">Email not verified</p>
              <button
                onClick={async () => {
                  try {
                    if (user) {
                      await sendEmailVerification(user);
                    }
                    setVerificationSent(true);
                  } catch (err) {
                    setError('Failed to send verification email');
                  }
                }}
                type="button"
                className="text-brand hover:text-brand/90"
              >
                Resend verification email
              </button>
            </div>
          )}
          
          {verificationSent && (
            <div className="text-sm text-center text-green-400">
              Verification email sent! Please check your inbox.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
              shadow-sm text-sm font-medium text-black bg-brand hover:bg-brand/90 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand hover:text-brand/90">
              Start free trial
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}