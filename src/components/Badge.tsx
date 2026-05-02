interface Props {
  children: React.ReactNode;
  variant?: 'navy' | 'orange' | 'green' | 'yellow' | 'red' | 'gray' | 'trial';
  size?: 'sm' | 'md';
}

const variants = {
  navy: 'bg-[#1A3A5C] text-white',
  orange: 'bg-[#D67D2E] text-white',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  trial: 'bg-amber-100 text-amber-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({ children, variant = 'gray', size = 'sm' }: Props) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
