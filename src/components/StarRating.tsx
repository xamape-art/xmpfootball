import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 20, readonly = false }: Props) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
        >
          <Star
            size={size}
            className={star <= value ? 'fill-[#D67D2E] text-[#D67D2E]' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
