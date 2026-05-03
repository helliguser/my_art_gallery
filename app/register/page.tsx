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
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Only letters, numbers and underscores allowed';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
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

    // 1. Создаём пользователя
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Создаём профиль в таблице profiles
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
      setError(`Profile creation failed: ${profileError.message}`);
      // Здесь можно удалить созданного пользователя, но для простоты оставим так
      setLoading(false);
      return;
    }

    // Успех – перенаправляем на главную
    router.push('/');
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Furline</h1>
        <UserMenu />
      </header>
      <div style={{ maxWidth: '450px', margin: '2rem auto' }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Join Furline</h2>
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
              <label>Username (public)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="letters, numbers, underscores"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Password (min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Date of birth (optional)</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            {error && <p style={{ color: '#f44336', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Already a member? <Link href="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}