import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-ui">
      {/* Decorative background blobs */}
      <div className="absolute top-4 left-6 w-[45vw] h-[45vw] bg-gradient-to-br from-teal-600/6 to-transparent rounded-full filter blur-3xl pointer-events-none" />

      <div className="login-card">
        <div className="login-brand">
          <div className="logo">FOCUS<span style={{ color: 'var(--accent-2)' }}>SPHERE</span></div>
          <div className="tag">Student Productivity Hub // Edition 02</div>

          <div style={{ marginTop: 20 }} className="text-slate-400">
            Welcome back — sign in to continue to your focus workspace.
          </div>
        </div>

        <div className="login-form-wrap">
          <form onSubmit={handleAuth} className="login-form">
            <div className="mb-4">
              <label htmlFor="email">01 / Email</label>
              <input
                id="email"
                type="email"
                className="login-input mt-2"
                placeholder="your@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label htmlFor="password">02 / Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input mt-2"
                  placeholder="Enter your secure key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-rose-400 text-sm font-mono mt-3">Error: {error}</p>
            )}

            <div className="login-actions">
              <button type="submit" disabled={loading} className="login-cta primary">
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>

              <div className="mt-2 text-center">
                {isLogin ? (
                  <button type="button" onClick={() => setIsLogin(false)} className="text-sm text-teal-400 hover:underline">Create account</button>
                ) : (
                  <button type="button" onClick={() => setIsLogin(true)} className="text-sm text-teal-400 hover:underline">Have an account? Sign in</button>
                )}
              </div>
            </div>

            <div className="login-footer">By signing in you agree to the terms and ensure device is secure.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
