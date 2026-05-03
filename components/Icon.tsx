import Image from 'next/image';

interface IconProps {
  name: string;      // относительный путь от public/icons, например "arrow/Arrow_Left_MD"
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 20, className = '' }: IconProps) {
  // если имя уже начинается с icons/, не добавляем, иначе добавляем /icons/
  const src = name.startsWith('/') ? name : `/icons/${name}.svg`;
  return (
    <img
      src={src}
      alt={name.split('/').pop()}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}