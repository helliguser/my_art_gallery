'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  }

  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="logo">Furline</h1>
          <UserMenu />
        </header>
      </div>
      <div className="register-wrapper">
        <div className="register-card">
          <h2 className="register-title">Welcome back</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="register-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="register-input"
              />
            </div>
            {error && <div className="register-error">{error}</div>}
            <button type="submit" disabled={loading} className="register-button">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="register-footer">
            Don't have an account? <Link href="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </>
  );
}