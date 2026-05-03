'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateUsername = (name: string) => {
    if (name.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Username can only contain letters, numbers and underscores';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const usernameErr = validateUsername(username);
    if (usernameErr) {
      setError(usernameErr);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, full_name: username } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Failed to create account. Please try again.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        full_name: username,
        birth_date: birthDate || null,
      });

    if (profileError) {
      console.error('Profile insert error:', profileError);
      setError('Account created, but profile setup failed. Please contact support.');
      // Пользователь уже создан в auth, но профиль не сохранён. Можно попробовать создать профиль позже через другую форму.
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Furline</h1>
        <UserMenu />
      </header>
      <div style={{ maxWidth: '500px', margin: '2rem auto', background: 'var(--card-bg)', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-playwrite), cursive' }}>Join Furline</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Username (public)</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="input" placeholder="e.g. FurArtist" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Confirm password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Date of birth (optional)</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="input" />
          </div>
          {error && <p style={{ color: '#f44336', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already a member? <Link href="/login" style={{ color: '#0070f3' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}