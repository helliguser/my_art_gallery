export default function Logo({ width = 180, height = 50 }: { width?: number; height?: number }) {
  return (
    <div className="logo">
      <img 
        src="/logo.png" 
        alt="Furline" 
        width={width} 
        height={height} 
        style={{ filter: 'drop-shadow(0 0 6px rgba(79,156,255,0.4))' }} 
      />
    </div>
  );
}