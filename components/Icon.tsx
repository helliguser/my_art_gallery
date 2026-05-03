import Image from 'next/image';

type IconProps = {
  name: string;      // имя файла без расширения, например "Arrow_Left_MD"
  size?: number;
  className?: string;
};

export default function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <img
      src={`/icons/arrow/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}