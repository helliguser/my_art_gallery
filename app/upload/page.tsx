'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [rating, setRating] = useState('safe');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login?redirect_to=/upload');
      else setUser(session.user);
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

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({ title, image_url: publicUrl, user_id: user.id, rating })
      .select()
      .single();

    if (insertError || !post) {
      alert('Database error: ' + (insertError?.message || 'Unknown'));
      setUploading(false);
      return;
    }

    // Обработка тегов
    if (tags.trim()) {
      const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      for (const tagName of tagList) {
        let tagId = null;
        const { data: existing } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle();
        if (existing) {
          tagId = existing.id;
        } else {
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single();
          if (!createError) tagId = newTag.id;
        }
        if (tagId) {
          await supabase
            .from('post_tags')
            .insert({ post_id: post.id, tag_id: tagId });
        }
      }
    }

    setImageUrl(publicUrl);
    setUploading(false);
    alert('Artwork published!');
    setTitle('');
    setFile(null);
    setTags('');
    setRating('safe');
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Upload New Artwork</h1>
        <Link href="/" className="btn btn-outline">← Back</Link>
      </header>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. cat, digital, portrait"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Rating</label>
          <select
            value={rating}
            onChange={e => setRating(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="safe">Safe</option>
            <option value="questionable">Questionable</option>
            <option value="explicit">Explicit</option>
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Image file</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        <button onClick={handleUpload} disabled={uploading || !title || !file} className="btn btn-primary">
          {uploading ? 'Uploading...' : 'Publish'}
        </button>
        {imageUrl && (
          <div style={{ marginTop: '1rem' }}>
            <p>Preview:</p>
            <img src={imageUrl} alt="uploaded" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}
      </div>
    </div>
  );
}