'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect_to') || '/';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else router.push(redirectTo);
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Furline</h1>
        <UserMenu />
      </header>
      <div style={{ maxWidth: '450px', margin: '2rem auto' }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Sign In
            </button>
            {message && <p style={{ color: '#f44336', marginTop: '1rem', fontSize: '0.9rem' }}>{message}</p>}
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            New to Furline? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}