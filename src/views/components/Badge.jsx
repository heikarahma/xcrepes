import React from 'react';

/**
 * Reusable Badge / Tag component aligned with Blibli BLUE Design System
 * Variants: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
 */
export const Badge = ({
  children,
  variant = 'primary',
  withDot = true,
  className = '',
  icon: Icon
}) => {
  return (
    <span className={`blue-badge badge-${variant} ${className}`.trim()}>
      {withDot && <span className="badge-dot" />}
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
};
