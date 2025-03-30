import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface UserProfile {
  name: string;
  title: string;
  companyName: string;
  companySize: string;
}

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    title: '',
    companyName: '',
    companySize: ''
  });
  const [error, setError] = useState('');
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await signUp(email, password);
      if (!user) throw new Error('Failed to create account');

      // Save additional user profile data
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: profile.name,
        title: profile.title,
        companyName: profile.companyName,
        companySize: profile.companySize,
        created_at: new Date().toISOString(),
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial'
      });
      
      // Show success popup
      setShowVerificationPopup(true);
      
    } catch (err) {
      if (err instanceof Error) {
        // Handle Firebase specific errors
        if (err.message.includes('email-already-in-use')) {
          setError('This email is already registered. Please try logging in.');
        } else if (err.message.includes('weak-password')) {
          setError('Password should be at least 6 characters long.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Registration failed. Please try again.');
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
            Start your 14-day free trial
          </h2>
          <div className="mt-2 flex justify-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  s === step ? 'bg-brand' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          {showVerificationPopup ? (
            <div className="mt-8 p-6 bg-brand/10 rounded-lg border border-brand/20">
              <h3 className="text-xl font-medium text-brand mb-2">
                Verification Email Sent
              </h3>
              <p className="text-gray-300 mb-4">
                We've sent a verification email to <span className="text-brand">{email}</span>
                <br /><br />
                Please check your inbox (and spam folder) and click the verification link to activate your account.
                Once verified, you can log in to start using Chatti.Bot.
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-brand text-black rounded-md hover:bg-brand/90 transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
          <p className="mt-2 text-gray-400">
            No credit card required
          </p>
          )}
        </div>

        {!showVerificationPopup && (
        <form className="mt-8 space-y-6" onSubmit={step === 3 ? handleSubmit : handleNextStep}>
          <div className="space-y-4">
            {step === 1 && (
            <>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                  text-gray-100 placeholder-gray-500
                  focus:outline-none focus:ring-brand focus:border-brand"
              />
            </div>
            </>
            )}

            {step === 2 && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                    text-gray-100 placeholder-gray-500
                    focus:outline-none focus:ring-brand focus:border-brand"
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                  Your Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                    text-gray-100 placeholder-gray-500
                    focus:outline-none focus:ring-brand focus:border-brand"
                  placeholder="e.g. CEO, Marketing Manager"
                />
              </div>
            </>
            )}

            {step === 3 && (
            <>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                    text-gray-100 placeholder-gray-500
                    focus:outline-none focus:ring-brand focus:border-brand"
                />
              </div>
              <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-300">
                  Company Size
                </label>
                <select
                  id="companySize"
                  required
                  value={profile.companySize}
                  onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-dark-800 border border-gray-700 rounded-md 
                    text-gray-100 focus:outline-none focus:ring-brand focus:border-brand"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>
            </>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Back
              </button>
            )}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center py-2 px-4 border border-transparent rounded-md 
              shadow-sm text-sm font-medium text-black bg-brand hover:bg-brand/90 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              step === 3 ? 'Start Free Trial' : 'Next'
            )}
          </button>
          </div>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand hover:text-brand/90">
              Sign in
            </Link>
          </p>
        </form>
        )}
      </div>
    </div>
  );
}