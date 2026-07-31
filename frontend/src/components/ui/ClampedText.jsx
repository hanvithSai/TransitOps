import { cn } from '../../lib/utils';

/**
 * ClampedText — truncates overflowing copy with ellipsis and exposes full text via title.
 */
export const ClampedText = ({
  as: Tag = 'span',
  lines = 2,
  text,
  title,
  className,
  children,
}) => {
  const label = text ?? (typeof children === 'string' ? children : undefined);
  const clampClass = lines === 1 ? 'app-clamp-text--1' : `app-clamp-text--${Math.min(Math.max(lines, 2), 4)}`;

  return (
    <Tag
      className={cn('app-clamp-text', clampClass, className)}
      title={title ?? label}
    >
      {children ?? text}
    </Tag>
  );
};
