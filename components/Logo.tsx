interface LogoProps {
  width?: number;
  height?: number;
}

export default function Logo({ width = 140, height = 40 }: LogoProps) {
  return (
    <div className="logo">
      <img src="/logo.png" alt="Furline" width={width} height={height} />
    </div>
  );
}