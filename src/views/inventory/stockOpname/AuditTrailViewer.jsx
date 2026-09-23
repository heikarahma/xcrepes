import React from 'react';
import { 
  History, 
  User, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  Edit3,
  XCircle,
  PlusCircle
} from 'lucide-react';
import { formatDateTimeIndonesian } from '../../../utils/dateUtils';

const getActionConfig = (action) => {
  switch (action) {
    case 'CREATE':
      return {
        label: 'Pembuatan Laporan',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        icon: PlusCircle
      };
    case 'SUBMIT':
      return {
        label: 'Laporan Dikirim',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        icon: CheckCircle2
      };
    case 'CASHIER_EDIT':
      return {
        label: 'Revisi oleh Kasir',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        icon: Edit3
      };
    case 'ADMIN_CORRECTION':
      return {
        label: 'Koreksi Super Admin',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        icon: ShieldCheck
      };
    case 'VOID':
      return {
        label: 'Laporan Dibatalkan (VOID)',
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca',
        icon: XCircle
      };
    default:
      return {
        label: action || 'Aktivitas',
        color: '#475569',
        bg: '#f8fafc',
        border: '#e2e8f0',
        icon: History
      };
  }
};

export const AuditTrailViewer = ({ auditTrail = [] }) => {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <History size={36} color="var(--neutral-400)" />
        <p style={{ margin: '8px 0 0', color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
          Belum ada riwayat perubahan yang tercatat.
        </p>
      </div>
    );
  }

  // Sort descending by timestamp (newest first)
  const sortedTrail = [...auditTrail].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="audit-trail-timeline" style={styles.timelineContainer}>
      {sortedTrail.map((entry, idx) => {
        const config = getActionConfig(entry.action);
        const IconComponent = config.icon;
        const isKasir = entry.role === 'kasir';

        return (
          <div key={entry.id || idx} style={styles.timelineItem}>
            {/* Timeline Left Icon & Line */}
            <div style={styles.timelineIconCol}>
              <div 
                style={{
                  ...styles.timelineIconBadge,
                  backgroundColor: config.bg,
                  borderColor: config.border,
                  color: config.color
                }}
              >
                <IconComponent size={16} />
              </div>
              {idx < sortedTrail.length - 1 && <div style={styles.timelineLine} />}
            </div>

            {/* Timeline Content Card */}
            <div style={styles.timelineContentCard}>
              <div style={styles.timelineHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span 
                    style={{
                      ...styles.actionBadge,
                      backgroundColor: config.bg,
                      color: config.color,
                      borderColor: config.border
                    }}
                  >
                    {config.label}
                  </span>

                  <span style={styles.userBadge}>
                    {isKasir ? <User size={12} /> : <ShieldCheck size={12} color="#7c3aed" />}
                    <strong>{entry.user || 'Sistem'}</strong>
                    <span style={{ color: 'var(--neutral-500)', fontSize: '0.75rem' }}>
                      ({entry.role === 'superadmin' ? 'Super Admin' : 'Kasir'})
                    </span>
                  </span>
                </div>

                <span style={styles.timestampBadge}>
                  <Clock size={12} />
                  {formatDateTimeIndonesian(entry.timestamp)}
                </span>
              </div>

              {/* Event Summary Description */}
              {entry.summary && (
                <div style={styles.summaryText}>
                  {entry.summary}
                </div>
              )}

              {/* Value Diff (Old vs New) if available */}
              {entry.oldValue !== undefined && entry.newValue !== undefined && entry.oldValue !== null && (
                <div style={styles.diffBox}>
                  <div style={styles.diffSide}>
                    <span style={styles.diffLabel}>Sebelum:</span>
                    <span style={styles.diffValOld}>{String(entry.oldValue)}</span>
                  </div>
                  <ArrowRight size={14} color="var(--neutral-400)" />
                  <div style={styles.diffSide}>
                    <span style={styles.diffLabel}>Sesudah:</span>
                    <span style={styles.diffValNew}>{String(entry.newValue)}</span>
                  </div>
                </div>
              )}

              {/* Mandatory Reason display if present */}
              {entry.reason && (
                <div style={styles.reasonBox}>
                  <span style={styles.reasonLabel}>Alasan Perubahan:</span>
                  <p style={styles.reasonText}>{entry.reason}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    padding: '8px 0'
  },
  timelineItem: {
    display: 'flex',
    gap: '16px',
    position: 'relative'
  },
  timelineIconCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '32px'
  },
  timelineIconBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    zIndex: 2,
    flexShrink: 0
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    backgroundColor: 'var(--border-color)',
    margin: '4px 0'
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },
  actionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid'
  },
  userBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.813rem',
    color: 'var(--neutral-800)'
  },
  timestampBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: 'var(--neutral-500)'
  },
  summaryText: {
    fontSize: '0.875rem',
    color: 'var(--neutral-800)',
    lineHeight: '1.4',
    marginBottom: '6px'
  },
  diffBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.813rem',
    marginTop: '6px',
    marginBottom: '6px'
  },
  diffSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  diffLabel: {
    color: 'var(--neutral-500)',
    fontSize: '0.75rem'
  },
  diffValOld: {
    fontWeight: 600,
    color: '#dc2626',
    textDecoration: 'line-through'
  },
  diffValNew: {
    fontWeight: 700,
    color: '#059669'
  },
  reasonBox: {
    marginTop: '6px',
    padding: '6px 10px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    fontSize: '0.813rem'
  },
  reasonLabel: {
    fontWeight: 700,
    color: '#92400e',
    marginRight: '6px'
  },
  reasonText: {
    display: 'inline',
    margin: 0,
    color: '#78350f',
    fontStyle: 'italic'
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '32px 16px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    border: '1px dashed var(--border-color)'
  }
};
