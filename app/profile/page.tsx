'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', bio: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect_to=/profile');
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        if (error.code === 'PGRST116') {
          // Профиль не найден, создаём
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: session.user.id, username: session.user.email?.split('@')[0] })
            .select()
            .single();
          if (!insertError && newProfile) {
            setProfile(newProfile);
            setForm({ full_name: newProfile.full_name || '', bio: newProfile.bio || '' });
          }
        }
      } else if (data) {
        setProfile(data);
        setForm({ full_name: data.full_name || '', bio: data.bio || '' });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name || null, bio: form.bio || null })
      .eq('id', profile.id);
    if (error) alert('Error: ' + error.message);
    else {
      setProfile({ ...profile, full_name: form.full_name, bio: form.bio });
      setEditing(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;
  if (!profile) return <div style={{ padding: '2rem' }}>Profile not found. Try logging out and back in.</div>;

  if (editing) {
    return (
      <div style={{ padding: '2rem' }}>
        <Link href="/">← Back</Link>
        <h1>Edit Profile</h1>
        <div>
          <label>Username: {profile.username}</label>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={4}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <button onClick={handleSave} style={{ background: '#0070f3', color: 'white', padding: '0.5rem 1rem' }}>Save</button>
        <button onClick={() => setEditing(false)} style={{ marginLeft: '1rem' }}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <Link href="/">← Back to Gallery</Link>
      <h1>My Profile</h1>
      <div><strong>Username:</strong> {profile.username}</div>
      <div><strong>Full name:</strong> {profile.full_name || 'Not set'}</div>
      <div><strong>Bio:</strong> {profile.bio || 'Not set'}</div>
      <button onClick={() => setEditing(true)} style={{ marginTop: '1rem', background: '#0070f3', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>
        Edit Profile
      </button>
    </div>
  );
}