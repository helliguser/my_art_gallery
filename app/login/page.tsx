'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
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
        <Logo />
        <UserMenu />
      </header>
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
        </form>
        {message && <p style={{ color: 'red', marginTop: '1rem' }}>{message}</p>}
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}