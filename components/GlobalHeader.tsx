'use client';

import Logo from './Logo';
import UserMenu from './UserMenu';
import Link from 'next/link';
import Icon from './Icon';

export default function GlobalHeader() {
  return (
    <header className="global-header">
      <div className="global-header-inner">
        <div className="global-header-left">
          <Logo width={160} height={45} />
        </div>
        <div className="global-header-center">
          <Link href="/upload" className="nav-action">
            <Icon name="Download" folder="interface" size={18} />
            <span>Upload</span>
          </Link>
          <Link href="/trending" className="nav-action">
            <Icon name="Trending_Up" folder="interface" size={18} />
            <span>Trending</span>
          </Link>
        </div>
        <div className="global-header-right">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}