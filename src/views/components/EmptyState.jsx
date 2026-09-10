import React from 'react';
import { Button } from './Button';
import { SearchX, Plus, Database, RotateCcw } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Database,
  title = 'Tidak Ada Data',
  description = 'Belum ada data satuan ukur yang tersimpan.',
  actionLabel,
  actionIcon,
  onAction
}) => {
  const isResetAction = Boolean(
    actionLabel && (
      actionLabel.toLowerCase().includes('reset') ||
      actionLabel.toLowerCase().includes('ulang')
    )
  );
  const ActionIcon = actionIcon || (isResetAction ? RotateCcw : Plus);

  return (
    <div style={styles.container}>
      <div style={styles.iconCircle}>
        <Icon size={32} color="var(--blue-500)" />
      </div>
      <h4 style={styles.title}>{title}</h4>
      <p style={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          icon={ActionIcon}
          onClick={onAction}
          style={{ marginTop: '16px' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 20px',
    textAlign: 'center'
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--blue-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    border: '1px solid var(--blue-100)'
  },
  title: {
    fontSize: '1.063rem',
    fontWeight: 700,
    color: 'var(--neutral-800)',
    marginBottom: '6px'
  },
  description: {
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    maxWidth: '320px',
    lineHeight: 1.5
  }
};
