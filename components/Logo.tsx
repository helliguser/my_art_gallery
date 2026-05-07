export default function Logo({ width = 160, height = 45 }: { width?: number; height?: number }) {
  return (
    <div className="logo">
      <img src="/logo.png" alt="Furline" width={width} height={height} />
    </div>
  );
}