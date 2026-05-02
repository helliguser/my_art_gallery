'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SaveSearchButton({ currentSearch }: { currentSearch: string }) {
  const [name, setName] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!currentSearch) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to save searches');
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from('saved_searches')
      .insert({ user_id: session.user.id, name: name.trim(), query: currentSearch });
    if (error) alert('Error: ' + error.message);
    else {
      alert('Search saved!');
      setShowDialog(false);
      setName('');
    }
    setSaving(false);
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="btn btn-outline"
        style={{ fontSize: '0.8rem' }}
      >
        💾 Save this search
      </button>
      {showDialog && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '1rem', zIndex: 1000, width: '300px'
        }}>
          <h3>Save search</h3>
          <input
            type="text"
            placeholder="Name (e.g., Cute cats)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">Save</button>
            <button onClick={() => setShowDialog(false)} className="btn btn-outline">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}