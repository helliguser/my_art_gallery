interface IconProps {
  name: string;
  folder?: 'arrow' | 'interface';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Icon({ name, folder = 'interface', size = 20, className = '', style = {} }: IconProps) {
  const src = `/icons/${folder}/${name}.svg`;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    />
  );
}