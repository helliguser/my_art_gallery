import Icon from './Icon';

interface AvatarProps {
  url?: string | null;
  size?: number;
  name?: string;
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
          background: 'rgba(79, 156, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          color: '#4f9cff',
          fontWeight: 'bold',
        }}
      >
        <Icon name="User_01" folder="user" size={size * 0.6} />
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