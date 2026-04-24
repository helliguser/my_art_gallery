'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });
  }, [router]);

  async function handleUpload() {
    if (!file || !user) return;
    setUploading(true);

    const fileName = Date.now() + '_' + file.name;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      alert('Upload error: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase.from('posts').insert([
      { title, image_url: publicUrl, user_id: user.id }
    ]);

    if (insertError) {
      alert('Database error: ' + insertError.message);
      setUploading(false);
      return;
    }

    setImageUrl(publicUrl);
    setUploading(false);
    alert('Artwork published!');
  }

  if (!user) return <div style={{ padding: '2rem' }}>Loading... or redirecting to login...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <Link href="/">← Back to Gallery</Link>
      <h1>Upload New Artwork</h1>
      <input
        type="text"
        placeholder="Title of your work"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '300px', padding: '0.5rem' }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: '1rem', display: 'block' }}
      />
      <button onClick={handleUpload} disabled={uploading} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
        {uploading ? 'Uploading...' : 'Publish'}
      </button>
      {imageUrl && (
        <div style={{ marginTop: '1rem' }}>
          <p>Preview:</p>
          <img src={imageUrl} alt="uploaded" style={{ maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
}