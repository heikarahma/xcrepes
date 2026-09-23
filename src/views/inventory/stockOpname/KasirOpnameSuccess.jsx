import React from 'react';
import { Button } from '../../components/Button';
import { 
  CheckCircle2, 
  Calendar, 
  User, 
  FileText, 
  RotateCcw, 
  Check, 
  Store,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDateTimeIndonesian } from '../../../utils/dateUtils';

export const KasirOpnameSuccess = ({ report, onViewDetail, onOpenHistory, onResetFlow }) => {
  if (!report) return null;

  const totalMaterials = report.summary?.totalMaterials || report.items?.length || 0;
  const matchCount = report.summary?.matchCount || 0;
  const deficitCount = report.summary?.deficitCount || 0;
  const surplusCount = report.summary?.surplusCount || 0;
  const discrepancyCount = deficitCount + surplusCount;

  return (
    <div className="kasir-opname-success animate-fade-in" style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <CheckCircle2 size={52} color="#059669" />
        </div>

        <span style={styles.statusBadge}>
          <Check size={13} /> Terkirim ke Sistem
        </span>

        <h1 style={styles.title}>Stock Opname Berhasil Dikirim</h1>
        
        <p style={styles.desc}>
          Laporan stok aktual tanggal <strong>{report.displayDate || report.opnameDate}</strong> telah tersimpan dan siap direview oleh Super Admin.
        </p>

        {/* Metadata Details */}
        <div style={styles.metaRow}>
          <span style={styles.metaItem}>
            <Calendar size={13} /> {report.displayDate || report.opnameDate}
          </span>
          <span style={styles.metaItem}>
            <User size={13} /> {report.submittedBy?.name || report.createdBy?.name || 'Kasir'}
          </span>
          <span style={styles.metaItem}>
            <Clock size={13} /> {formatDateTimeIndonesian(report.submittedAt || report.createdAt)}
          </span>
          <span style={styles.versionBadge}>
            Versi {report.version || 1}
          </span>
        </div>

        {/* KPI Mini Grid */}
        <div style={styles.grid}>
          <div style={styles.gridBox}>
            <span style={styles.gridVal}>{totalMaterials}</span>
            <span style={styles.gridLabel}>Total Bahan Baku</span>
          </div>

          <div style={{ ...styles.gridBox, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }}>
            <span style={{ ...styles.gridVal, color: '#059669' }}>{matchCount}</span>
            <span style={styles.gridLabel}>Stok Sesuai</span>
          </div>

          <div style={{ 
            ...styles.gridBox, 
            borderColor: discrepancyCount > 0 ? '#fecaca' : 'var(--border-color)',
            backgroundColor: discrepancyCount > 0 ? '#fff5f5' : '#ffffff'
          }}>
            <span style={{ ...styles.gridVal, color: discrepancyCount > 0 ? '#dc2626' : 'var(--neutral-700)' }}>
              {discrepancyCount}
            </span>
            <span style={styles.gridLabel}>Ada Selisih</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={styles.actions}>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => onViewDetail && onViewDetail(report)}
          >
            Lihat Detail Laporan
          </Button>

          <Button
            variant="outline"
            icon={Clock}
            onClick={onOpenHistory}
          >
            Riwayat Opname
          </Button>

          <Button
            variant="outline"
            onClick={onResetFlow}
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    padding: '24px 16px'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '36px 32px',
    maxWidth: '560px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconWrap: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '0.75rem',
    fontWeight: 700,
    marginBottom: '12px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  desc: {
    margin: '0 0 20px',
    fontSize: '0.938rem',
    color: 'var(--neutral-600)',
    lineHeight: '1.5'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '0.75rem',
    fontWeight: 600
  },
  versionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    width: '100%',
    marginBottom: '24px'
  },
  gridBox: {
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 8px',
    textAlign: 'center'
  },
  gridVal: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  gridLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    marginTop: '2px',
    fontWeight: 600
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    width: '100%'
  }
};
