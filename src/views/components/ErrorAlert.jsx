import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorAlert = ({ 
  title = 'Gagal Memuat Data', 
  message = 'Terjadi kesalahan saat berkomunikasi dengan server database.', 
  onRetry 
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <AlertTriangle size={24} color="var(--red-500)" />
      </div>
      <div style={styles.content}>
        <h4 style={styles.title}>{title}</h4>
        <p style={styles.message}>{message}</p>
        {onRetry && (
          <div style={{ marginTop: '12px' }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              leftIcon={<RefreshCw size={14} />}
            >
              Coba Lagi
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    backgroundColor: 'var(--red-50)',
    border: '1px solid var(--red-100)',
    borderRadius: '10px',
    padding: '16px 20px',
    margin: '16px 0'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px'
  },
  content: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--red-600)'
  },
  message: {
    margin: '4px 0 0 0',
    fontSize: '0.813rem',
    color: 'var(--neutral-600)',
    lineHeight: 1.4
  }
};
