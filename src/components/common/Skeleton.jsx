// Simple skeleton loader for cards and sections
export default function Skeleton({ className = "", style = {}, lines = 1 }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-5 my-2 bg-gray-200 rounded w-full" />
      ))}
    </div>
  );
}
