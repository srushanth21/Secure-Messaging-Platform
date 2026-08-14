import { getAvatarColor, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-8 h-8', text: 'text-xs', dot: 'w-2 h-2', dotPos: '-bottom-0 -right-0' },
  sm: { container: 'w-10 h-10', text: 'text-sm', dot: 'w-2.5 h-2.5', dotPos: '-bottom-0 -right-0' },
  md: { container: 'w-12 h-12', text: 'text-base', dot: 'w-3 h-3', dotPos: '-bottom-0.5 -right-0.5' },
  lg: { container: 'w-16 h-16', text: 'text-lg', dot: 'w-3.5 h-3.5', dotPos: '-bottom-0.5 -right-0.5' },
  xl: { container: 'w-20 h-20', text: 'text-xl', dot: 'w-4 h-4', dotPos: '-bottom-0.5 -right-0.5' },
};

export default function Avatar({ name, avatarUrl, size = 'md', isOnline, className = '' }: AvatarProps) {
  const s = sizeMap[size];
  const bgColor = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${s.container} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${s.container} rounded-full flex items-center justify-center text-white font-medium ${s.text}`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {isOnline !== undefined && isOnline && (
        <span className={`absolute ${s.dotPos} block ${s.dot} rounded-full bg-signal-green ring-2 ring-white`} />
      )}
    </div>
  );
}
