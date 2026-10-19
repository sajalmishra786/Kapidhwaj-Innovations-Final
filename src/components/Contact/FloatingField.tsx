import { useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface FloatingFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  textarea?: boolean;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Floating-label input with a focus glow and inline validation animation.
 * Label lifts when focused or filled. Border + glow react via opacity.
 */
export function FloatingField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  textarea = false,
  required,
  disabled = false,
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(e.target.value);

  const sharedClass = cn(
    'peer w-full rounded-2xl border bg-white/[0.04] px-4 pb-3 pt-6 text-cream-100 outline-none transition-colors duration-300 placeholder-transparent',
    'disabled:cursor-not-allowed disabled:opacity-60',
    error
      ? 'border-accent-ember/70'
      : focused
        ? 'border-accent-coral/70'
        : 'border-white/10 hover:border-white/25',
  );

  return (
    <div className="relative">
      {/* focus glow */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl blur-md transition-opacity duration-300',
          focused ? 'opacity-100' : 'opacity-0',
        )}
        style={{ boxShadow: '0 0 30px -6px rgba(224,121,94,0.5)' }}
      />

      {textarea ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={handle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          disabled={disabled}
          placeholder={label}
          className={cn(sharedClass, 'relative resize-none')}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          disabled={disabled}
          placeholder={label}
          className={cn(sharedClass, 'relative')}
        />
      )}

      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-4 origin-left text-cream-100/50 transition-all duration-200',
          floated ? 'top-2.5 text-xs text-accent-coral' : 'top-4 text-base',
        )}
      >
        {label}
      </label>

      {error && (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-2 px-1 text-xs text-accent-ember"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
