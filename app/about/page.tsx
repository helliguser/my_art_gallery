import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function AboutPage() {
  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Art Gallery</h1>
        <UserMenu />
      </header>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
        <h1>About Art Gallery</h1>
        <p style={{ marginTop: '1rem' }}>
          Art Gallery is a platform for artists to share their work, get feedback, and connect with art lovers.
          You can upload your artworks, like and comment on others' pieces, follow your favorite creators, and build your portfolio.
        </p>
        <h2 style={{ marginTop: '2rem' }}>Features</h2>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
          <li>Upload and manage your artworks</li>
          <li>Like and comment on posts</li>
          <li>User profiles with avatars</li>
          <li>Search by title</li>
          <li>Infinite scroll gallery</li>
        </ul>
        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Explore Gallery</Link>
        </p>
      </div>
    </div>
  );
}