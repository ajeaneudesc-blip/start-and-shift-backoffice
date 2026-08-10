import { Colors, Radius } from '@/theme/tokens';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Largeur minimale avant que la barre ne cède la place aux selects. */
  minWidth?: number;
}

export default function SearchInput({ value, onChange, placeholder, minWidth = 220 }: Props) {
  return (
    <input
      className="sas-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1,
        minWidth,
        height: 34,
        border: '1px solid rgba(255,255,255,.11)',
        borderRadius: Radius.md,
        background: Colors.surface,
        color: Colors.textPrimary,
        fontSize: 13,
        padding: '0 12px',
        outline: 'none',
      }}
    />
  );
}
