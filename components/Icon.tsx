interface IconProps {
  name: string;      // имя файла без расширения, например "User_01"
  folder?: 'interface' | 'arrow' | 'user' | 'menu'; // по умолчанию 'interface'
  size?: number;
  className?: string;
}

export default function Icon({ name, folder = 'interface', size = 20, className = '' }: IconProps) {
  const src = `/icons/${folder}/${name}.svg`;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}