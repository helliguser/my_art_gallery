'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [rating, setRating] = useState('safe');
  const [sources, setSources] = useState<string[]>(['']);
  const [artists, setArtists] = useState('');
  const [characters, setCharacters] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [species, setSpecies] = useState('');
  const [contentious, setContentious] = useState('');
  const [description, setDescription] = useState('');
  const [parentPostId, setParentPostId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login?redirect_to=/upload');
      else setUser(session.user);
      setLoading(false);
    });
  }, [router]);

  const addSourceField = () => setSources([...sources, '']);
  const removeSourceField = (idx: number) => setSources(sources.filter((_, i) => i !== idx));
  const updateSource = (idx: number, value: string) => {
    const newSources = [...sources];
    newSources[idx] = value;
    setSources(newSources);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    // 1. Загрузка изображения в Storage
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

    // 2. Подготовка данных для вставки
    const cleanSources = sources.filter(s => s.trim() !== '');
    const cleanArtists = artists.split(',').map(a => a.trim()).filter(a => a);
    const cleanContentious = contentious.split(',').map(c => c.trim()).filter(c => c);

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        title,
        image_url: publicUrl,
        user_id: user.id,
        rating,
        sources: cleanSources,
        artists: cleanArtists,
        characters: characters.trim() || null,
        body_type: bodyType || null,
        species: species.trim() || null,
        contentious_content: cleanContentious,
        description: description.trim() || null,
        parent_post_id: parentPostId ? parseInt(parentPostId) : null,
      })
      .select()
      .single();

    if (insertError || !post) {
      alert('Database error: ' + (insertError?.message || 'Unknown'));
      setUploading(false);
      return;
    }

    // 3. Обработка тегов (как раньше)
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
          await supabase.from('post_tags').insert({ post_id: post.id, tag_id: tagId });
        }
      }
    }

    setImageUrl(publicUrl);
    setUploading(false);
    alert('Artwork published!');
    // Сброс формы после успеха
    setTitle('');
    setFile(null);
    setTags('');
    setRating('safe');
    setSources(['']);
    setArtists('');
    setCharacters('');
    setBodyType('');
    setSpecies('');
    setContentious('');
    setDescription('');
    setParentPostId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <div className="container">
        <header className="header">
          <h1 className="logo">Furline</h1>
          <UserMenu />
        </header>
      </div>
      <div className="upload-wrapper">
        <div className="upload-card">
          <h2 className="upload-title">Upload New Artwork</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="upload-form">
            
            {/* Файл */}
            <div className="upload-section">
              <label className="upload-label">📁 File</label>
              <div className="file-drop-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file-input"
                />
                <p className="file-hint">Supported formats: JPG, PNG, GIF, WebP</p>
              </div>
            </div>

            {/* Источники (динамические) */}
            <div className="upload-section">
              <label className="upload-label">🔗 Sources</label>
              {sources.map((src, idx) => (
                <div key={idx} className="source-row">
                  <input
                    type="text"
                    value={src}
                    onChange={(e) => updateSource(idx, e.target.value)}
                    placeholder="https://..."
                    className="upload-input source-input"
                  />
                  {sources.length > 1 && (
                    <button type="button" onClick={() => removeSourceField(idx)} className="source-remove">✖</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSourceField} className="source-add">+ Add another source</button>
            </div>

            {/* Художники и соавторы */}
            <div className="upload-section">
              <label className="upload-label">🎨 Artists and Contributors</label>
              <input
                type="text"
                value={artists}
                onChange={(e) => setArtists(e.target.value)}
                placeholder="artist_name1, artist_name2 (comma separated)"
                className="upload-input"
              />
            </div>

            {/* Персонажи */}
            <div className="upload-section">
              <label className="upload-label">🐾 Characters</label>
              <input
                type="text"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="e.g. Krystal, Fox McCloud"
                className="upload-input"
              />
            </div>

            {/* Body Type и Species в два столбца */}
            <div className="upload-row">
              <div className="upload-section half">
                <label className="upload-label">🏋️ Body Type</label>
                <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="upload-select">
                  <option value="">Select</option>
                  <option value="thin">Thin</option>
                  <option value="average">Average</option>
                  <option value="muscular">Muscular</option>
                  <option value="curvy">Curvy</option>
                  <option value="overweight">Overweight</option>
                </select>
              </div>
              <div className="upload-section half">
                <label className="upload-label">🐉 Species</label>
                <input
                  type="text"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="e.g. wolf, dragon, cat"
                  className="upload-input"
                />
              </div>
            </div>

            {/* Contentious Content */}
            <div className="upload-section">
              <label className="upload-label">⚠️ Contentious Content (fetishes / extreme)</label>
              <input
                type="text"
                value={contentious}
                onChange={(e) => setContentious(e.target.value)}
                placeholder="e.g. cub, scat, gore (comma separated)"
                className="upload-input"
              />
            </div>

            {/* Rating */}
            <div className="upload-section">
              <label className="upload-label">🔞 Rating</label>
              <div className="rating-group">
                <label className={`rating-label ${rating === 'safe' ? 'active' : ''}`}>
                  <input type="radio" name="rating" value="safe" checked={rating === 'safe'} onChange={() => setRating('safe')} /> Safe
                </label>
                <label className={`rating-label ${rating === 'questionable' ? 'active' : ''}`}>
                  <input type="radio" name="rating" value="questionable" checked={rating === 'questionable'} onChange={() => setRating('questionable')} /> Questionable
                </label>
                <label className={`rating-label ${rating === 'explicit' ? 'active' : ''}`}>
                  <input type="radio" name="rating" value="explicit" checked={rating === 'explicit'} onChange={() => setRating('explicit')} /> Explicit
                </label>
              </div>
            </div>

            {/* Other Tags */}
            <div className="upload-section">
              <label className="upload-label">🏷️ Other Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="cat, digital, portrait (comma separated)"
                className="upload-input"
              />
            </div>

            {/* Parent Post ID */}
            <div className="upload-section">
              <label className="upload-label">🔗 Parent Post ID (optional)</label>
              <input
                type="number"
                value={parentPostId}
                onChange={(e) => setParentPostId(e.target.value)}
                placeholder="e.g. 12345"
                className="upload-input"
              />
            </div>

            {/* Description */}
            <div className="upload-section">
              <label className="upload-label">📝 Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Write something about your artwork..."
                className="upload-textarea"
              />
            </div>

            {/* Кнопка отправки */}
            <button type="submit" disabled={uploading || !title || !file} className="upload-button">
              {uploading ? 'Uploading...' : 'Publish Artwork'}
            </button>
          </form>
          {imageUrl && (
            <div className="preview-section">
              <p>Preview:</p>
              <img src={imageUrl} alt="preview" className="preview-image" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}