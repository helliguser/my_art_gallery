export default function Logo({ width = 140, height = 40 }: { width?: number; height?: number }) {
  return (
    <div className="logo">
      <img src="/logo.png" alt="Furline" width={width} height={height} />
    </div>
  );
}