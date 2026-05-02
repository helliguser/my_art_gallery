import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default async function SavedSearchesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login?redirect_to=/saved-searches');

  const { data: searches, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="container">Error loading saved searches</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Saved Searches</h1>
        <UserMenu />
      </header>
      {searches.length === 0 ? (
        <p>You haven't saved any searches yet. Use the "Save this search" button on the gallery page.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {searches.map(search => (
            <li key={search.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <Link href={`/?search=${encodeURIComponent(search.query)}`} style={{ fontWeight: 'bold' }}>
                {search.name}
              </Link>
              <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#888' }}>({search.query})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}