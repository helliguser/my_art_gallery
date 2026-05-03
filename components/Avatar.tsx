interface AvatarProps {
  url?: string | null;
  size?: number;
  name?: string; // ← добавляем
}

export default function Avatar({ url, size = 40, name }: AvatarProps) {
  if (!url) {
    const initial = name ? name[0].toUpperCase() : '?';
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0070f3, #00c6ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {initial}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Avatar"
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}