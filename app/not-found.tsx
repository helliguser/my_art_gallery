import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '6rem', marginBottom: '1rem' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
        ← Back to Gallery
      </Link>
    </div>
  );
}