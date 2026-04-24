'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    
    const fileName = Date.now() + '_' + file.name;
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file);
    
    if (error) {
      alert('Upload error: ' + error.message);
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    
    await supabase.from('posts').insert([
      { title: title, image_url: publicUrl }
    ]);
    
    setImageUrl(publicUrl);
    setUploading(false);
    alert('Artwork published!');
  }
  
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