import { Colors, Radius } from '@/theme/tokens';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  'aria-label'?: string;
}

export default function Select<T extends string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: Props<T>) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      style={{
        height: 34,
        border: '1px solid rgba(255,255,255,.11)',
        borderRadius: Radius.md,
        background: Colors.surface,
        color: Colors.textPrimary,
        fontSize: 13,
        padding: '0 10px',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
