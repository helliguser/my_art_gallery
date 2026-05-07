import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '6rem' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist.</p>
      <Link href="/" className="btn btn-primary">Back to Gallery</Link>
    </div>
  );
}