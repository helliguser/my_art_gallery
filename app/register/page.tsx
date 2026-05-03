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

  const validateUsername = (username: string) => {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers and underscores';
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

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes('rate limit')) {
        setError('Too many registration attempts. Please try again later.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Registration failed, please try again');
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
      console.error('Profile creation error:', profileError);
      setError('Profile creation failed, but you may still log in. Contact support.');
      setLoading(false);
      return;
    }

    router.push('/');
  };

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
          <h2 className="register-title">Join Furline</h2>
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
                type="text"
                placeholder="Username (public)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="register-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="register-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="register-input"
              />
            </div>
            <div className="input-group">
              <input
                type="date"
                placeholder="Date of birth (optional)"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="register-input"
              />
            </div>
            {error && <div className="register-error">{error}</div>}
            <button type="submit" disabled={loading} className="register-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="register-footer">
            Already a member? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}