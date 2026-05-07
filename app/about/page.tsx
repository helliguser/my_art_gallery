import Link from 'next/link';
import Logo from '@/components/Logo';
import UserMenu from '@/components/UserMenu';

export default function AboutPage() {
  return (
    <div className="container">
      <header className="header">
        <Logo />
        <UserMenu />
      </header>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
        <h1>About Furline</h1>
        <p style={{ marginTop: '1rem' }}>
          Furline is a community platform for artists and art lovers. Share your artwork, discover new creations,
          and connect with like-minded people.
        </p>
        <h2 style={{ marginTop: '2rem' }}>Features</h2>
        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
          <li>Upload and share your artwork</li>
          <li>Like and comment on posts</li>
          <li>Follow your favorite artists</li>
          <li>Save searches and get personalized feed</li>
          <li>Dark mode, glassmorphism UI</li>
        </ul>
        <p style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Explore Gallery</Link>
        </p>
      </div>
    </div>
  );
}