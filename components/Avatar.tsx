import Image from 'next/image';

export default function Avatar({ url, size = 40 }: { url?: string | null; size?: number }) {
  if (!url) {
    // Заглушка: иконка пользователя или цветной круг
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          color: '#666',
        }}
      >
        👤
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