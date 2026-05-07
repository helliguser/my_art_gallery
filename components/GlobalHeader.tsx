import Logo from './Logo';
import UserMenu from './UserMenu';
import Link from 'next/link';

export default function GlobalHeader() {
  return (
    <div className="glass-header">
      <Logo />
      <div className="navbar-actions">
        <Link href="/upload" className="glass-small-btn">
          <Icon name="Download" folder="interface" size={14} /> Upload
        </Link>
        <Link href="/trending" className="glass-small-btn">
          <Icon name="Trending_Up" folder="interface" size={14} /> Trending
        </Link>
      </div>
      <UserMenu />
    </div>
  );
}