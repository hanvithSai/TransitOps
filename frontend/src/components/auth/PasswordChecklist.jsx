import { Check, X } from 'lucide-react';
import { validatePasswordStrength } from '../../lib/passwordPolicy';
import { cn } from '../../lib/utils';

const PasswordChecklist = ({ password, className }) => {
  const { results } = validatePasswordStrength(password);

  if (!password) return null;

  return (
    <ul className={cn('space-y-1.5 text-xs', className)} aria-live="polite">
      {results.map((rule) => (
        <li
          key={rule.id}
          className={cn(
            'flex items-center gap-2',
            rule.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]',
          )}
        >
          {rule.passed ? (
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
          )}
          <span>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
};

export default PasswordChecklist;
