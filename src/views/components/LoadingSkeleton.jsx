import React from 'react';
import { Loader2 } from 'lucide-react';

export const InlineSpinner = ({ text = 'Memuat data...', size = 18 }) => {
  return (
    <div style={styles.spinnerContainer}>
      <Loader2 size={size} className="animate-spin" color="var(--blue-500)" />
      {text && <span style={styles.spinnerText}>{text}</span>}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div style={styles.tableSkeletonWrapper}>
      <div style={styles.tableHeaderSkeleton}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`th-${i}`} style={styles.skeletonBarTh} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={`tr-${rIdx}`} style={styles.tableRowSkeleton}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div 
              key={`td-${rIdx}-${cIdx}`} 
              style={{
                ...styles.skeletonBarTd,
                width: cIdx === 0 ? '40px' : cIdx === 1 ? '55%' : '75%'
              }} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 6 }) => {
  return (
    <div style={styles.cardGridSkeleton}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`card-${i}`} style={styles.cardSkeletonItem}>
          <div style={styles.cardImageSkeleton} />
          <div style={{ ...styles.skeletonBarTd, width: '80%', marginTop: '12px' }} />
          <div style={{ ...styles.skeletonBarTd, width: '50%', marginTop: '8px' }} />
          <div style={{ ...styles.skeletonBarTd, width: '60%', marginTop: '12px', height: '24px' }} />
        </div>
      ))}
    </div>
  );
};

const styles = {
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '32px',
    color: 'var(--neutral-600)',
    fontSize: '0.875rem',
    fontWeight: 500
  },
  spinnerText: {
    color: 'var(--neutral-600)'
  },
  tableSkeletonWrapper: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--neutral-200)',
    padding: '16px'
  },
  tableHeaderSkeleton: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--neutral-200)',
    marginBottom: '12px'
  },
  tableRowSkeleton: {
    display: 'flex',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid var(--neutral-100)',
    alignItems: 'center'
  },
  skeletonBarTh: {
    height: '14px',
    backgroundColor: 'var(--neutral-200)',
    borderRadius: '4px',
    flex: 1,
    animation: 'pulse 1.5s infinite'
  },
  skeletonBarTd: {
    height: '16px',
    backgroundColor: 'var(--neutral-150)',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite'
  },
  cardGridSkeleton: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    padding: '16px'
  },
  cardSkeletonItem: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid var(--neutral-200)'
  },
  cardImageSkeleton: {
    width: '100%',
    height: '120px',
    borderRadius: '8px',
    backgroundColor: 'var(--neutral-150)',
    animation: 'pulse 1.5s infinite'
  }
};
