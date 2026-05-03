'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import Icon from '@/components/Icon';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [artistName, setArtistName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<{ id: number; name: string }[]>([]);
  const [rating, setRating] = useState('safe');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!tagInput.trim()) {
        setTagSuggestions([]);
        return;
      }
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .ilike('name', `%${tagInput}%`)
        .limit(10);
      if (!error && data) setTagSuggestions(data);
      else setTagSuggestions([]);
    };
    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [tagInput]);

  const addTag = (tagName: string) => {
    const normalized = tagName.trim().toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
      setTagInput('');
      setTagSuggestions([]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

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
      .insert({
        image_url: publicUrl,
        user_id: user.id,
        rating,
        source_url: sourceUrl.trim() || null,
        artist_name: artistName.trim() || null,
        description: description.trim() || null,
      })
      .select()
      .single();

    if (insertError || !post) {
      alert('Database error: ' + (insertError?.message || 'Unknown'));
      setUploading(false);
      return;
    }

    for (const tagName of tags) {
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

    setUploading(false);
    alert('Artwork published!');
    setFile(null);
    setSourceUrl('');
    setArtistName('');
    setTags([]);
    setTagInput('');
    setRating('safe');
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    router.push('/');
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
          <h2 className="upload-title">Share your artwork</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="upload-form">
            
            {/* File */}
            <div className="upload-group">
              <label className="upload-label"><Icon name="Download" folder="interface" size={16} /> File *</label>
              <div className="file-drop-zone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file-input"
                  required
                />
                <p className="file-hint">JPG, PNG, GIF, WebP (max 20MB)</p>
              </div>
            </div>

            {/* Source URL */}
            <div className="upload-group">
              <label className="upload-label"><Icon name="Link_Horizontal" folder="interface" size={16} /> Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="upload-input"
              />
            </div>

            {/* Artist Name */}
            <div className="upload-group">
              <label className="upload-label"><Icon name="User" folder="interface" size={16} /> Artist</label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name (if not you)"
                className="upload-input"
              />
            </div>

            {/* Tags */}
            <div className="upload-group">
              <label className="upload-label"><Icon name="Tag" folder="interface" size={16} /> Tags *</label>
              <div className="tags-input-wrapper">
                <div className="tags-list">
                  {tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="tag-remove">×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. cat, digital, portrait"
                    className="tags-input"
                  />
                </div>
                {tagSuggestions.length > 0 && (
                  <div className="tag-suggestions">
                    {tagSuggestions.map(sug => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => addTag(sug.name)}
                        className="suggestion-item"
                      >
                        {sug.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="upload-group">
              <label className="upload-label"><Icon name="Star" folder="interface" size={16} /> Rating</label>
              <div className="rating-group">
                <label className={`rating-chip ${rating === 'safe' ? 'active' : ''}`}>
                  <input type="radio" name="rating" value="safe" checked={rating === 'safe'} onChange={() => setRating('safe')} /> Safe
                </label>
                <label className={`rating-chip ${rating === 'questionable' ? 'active' : ''}`}>
                  <input type="radio" name="rating" value="questionable" checked={rating === 'questionable'} onChange={() => setRating('questionable')} /> Questionable
                </label>
                <label className={`rating-chip ${rating === 'explicit' ? 'active' : ''}`}>
                  <input type="radio" name="rating" value="explicit" checked={rating === 'explicit'} onChange={() => setRating('explicit')} /> Explicit
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="upload-group">
              <label className="upload-label"><Icon name="Book_Open" folder="interface" size={16} /> Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell something about this artwork..."
                className="upload-textarea"
              />
            </div>

            <button type="submit" disabled={uploading || !file} className="upload-button">
              {uploading ? 'Uploading...' : 'Publish Artwork'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}