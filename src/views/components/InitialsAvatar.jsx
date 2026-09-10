import React from 'react';

/**
 * Palettes for generating harmonious, vibrant gradient backgrounds
 */
const GRADIENTS = [
  'linear-gradient(135deg, #2563eb, #1d4ed8)', // Royal Blue
  'linear-gradient(135deg, #0284c7, #0369a1)', // Sky Blue
  'linear-gradient(135deg, #0d9488, #0f766e)', // Teal
  'linear-gradient(135deg, #16a34a, #15803d)', // Emerald
  'linear-gradient(135deg, #ea580c, #c2410c)', // Warm Amber/Orange
  'linear-gradient(135deg, #db2777, #be185d)', // Berry Rose
  'linear-gradient(135deg, #7c3aed, #6d28d9)', // Violet
  'linear-gradient(135deg, #4f46e5, #4338ca)', // Indigo
  'linear-gradient(135deg, #e11d48, #9f1239)'  // Crimson
];

/**
 * Extracts 1 or 2 character initials from name
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) return '?';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * Deterministic gradient based on string name
 */
export const getAvatarGradient = (name) => {
  if (!name || typeof name !== 'string') return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

/**
 * InitialsAvatar Component
 * Displays clean modern initials avatar with subtle gradient and backdrop effects
 */
export const InitialsAvatar = ({
  name = '',
  size = 48,
  fontSize,
  borderRadius = '10px',
  className = '',
  style = {}
}) => {
  const initials = getInitials(name);
  const background = getAvatarGradient(name);

  // Compute responsive font size if not provided
  const computedFontSize = fontSize || (typeof size === 'number' ? `${Math.round(size * 0.4)}px` : '1.25rem');

  return (
    <div
      className={`initials-avatar ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        minWidth: typeof size === 'number' ? `${size}px` : undefined,
        background,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 800,
        fontSize: computedFontSize,
        letterSpacing: '0.5px',
        userSelect: 'none',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        ...style
      }}
    >
      {initials}
    </div>
  );
};
