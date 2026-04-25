'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect_to=/upload');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });
  }, [router]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    const fileName = `${Date.now()}_${file.name}`;
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
      { title, image_url: publicUrl, user_id: user.id },
    ]);

    if (insertError) {
      alert('Database error: ' + insertError.message);
      setUploading(false);
      return;
    }

    setImageUrl(publicUrl);
    setUploading(false);
    alert('Artwork published!');
    setTitle('');
    setFile(null);
    // Если хотите сразу перенаправлять на страницу поста, нужно получить id,
    // но проще оставить так, чтобы можно было загружать несколько.
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return null; // редирект уже выполнен

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Upload New Artwork</h1>
        <Link href="/" className="btn btn-outline">
          ← Back to Gallery
        </Link>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Title of your work"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="file">Image file</label>
          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: 'block', marginBottom: '1rem' }}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !title || !file}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {uploading ? 'Uploading...' : 'Publish'}
        </button>

        {imageUrl && (
          <div style={{ marginTop: '1rem' }}>
            <p>Preview:</p>
            <img
              src={imageUrl}
              alt="uploaded"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}