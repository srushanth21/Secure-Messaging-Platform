export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizeClasses[size]} border-2 border-signal-border border-t-signal-blue rounded-full animate-spin`} />
  );
}
