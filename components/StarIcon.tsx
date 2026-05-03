'use client';

interface StarIconProps {
  filled: boolean;
  size?: number;
}

export default function StarIcon({ filled, size = 18 }: StarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#ffc107' : 'none'}
      stroke={filled ? '#ffc107' : '#999'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}