interface LogoProps {
  variant?: 'white' | 'color';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ variant = 'color', size = 'md' }: LogoProps) {
  const sizes = { sm: 110, md: 160, lg: 220 };
  const w = sizes[size];
  const h = w * (260 / 600);
  const navy = variant === 'white' ? '#FFFFFF' : '#1A3A5C';
  const orange = '#D67D2E';

  return (
    <svg viewBox="0 0 600 260" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
      <line x1="120" y1="55" x2="180" y2="55" stroke={orange} strokeWidth="3" strokeLinecap="square" />
      <text x="300" y="140" fontFamily="Helvetica, Arial, sans-serif" fontWeight="900" fontSize="110" letterSpacing="-4" textAnchor="middle" fill={navy}>XMP</text>
      <line x1="220" y1="165" x2="380" y2="165" stroke={navy} strokeWidth="2.5" strokeLinecap="square" />
      <text x="300" y="200" fontFamily="Helvetica, Arial, sans-serif" fontWeight="500" fontSize="18" letterSpacing="8" textAnchor="middle" fill={navy}>FOOTBALL ANALYSIS</text>
      <line x1="420" y1="225" x2="480" y2="225" stroke={orange} strokeWidth="3" strokeLinecap="square" />
    </svg>
  );
}
