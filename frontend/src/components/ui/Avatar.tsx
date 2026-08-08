/**
 * Avatar component — user photo with UI Avatars fallback.
 */

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getUIAvatarUrl(name: string, size: number = 128): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=6c5ce7&color=fff&bold=true`;
}

const sizeMap = { sm: 32, md: 40, lg: 56, xl: 80 };

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const pixels = sizeMap[size];
  const imgSrc = src || getUIAvatarUrl(name, pixels);

  return (
    <img
      className={`avatar avatar--${size}`}
      src={imgSrc}
      alt={`Avatar de ${name}`}
      width={pixels}
      height={pixels}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}
