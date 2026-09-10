import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, ZoomIn, Download, Clock, User, FileText, Image as ImageIcon } from 'lucide-react';

export const ImagePreviewModal = ({
  isOpen,
  onClose,
  photoUrl,
  title = 'Pratinjau Bukti Foto',
  meta = {}
}) => {
  if (!isOpen || !photoUrl) return null;

  const handleDownload = () => {
    if (!photoUrl) return;
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `bukti-foto-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={meta.subtitle || 'Lampiran dokumentasi foto fisik'}
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
            {meta.createdAt && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {meta.createdAt}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownload}
            >
              Unduh Foto
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      }
    >
      <div style={styles.container}>
        {/* Main Photo Display */}
        <div style={styles.imageWrapper}>
          <img
            src={photoUrl}
            alt="Bukti Foto"
            style={styles.image}
          />
        </div>

        {/* Metadata Details Card */}
        {(meta.rawMaterialName || meta.reason || meta.user || meta.note || meta.orderInvoice) && (
          <div style={styles.metaCard}>
            <div style={styles.metaGrid}>
              {meta.rawMaterialName && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Bahan Baku:</span>
                  <span style={styles.metaValue}>{meta.rawMaterialName} ({meta.amount ? `${meta.amount} ${meta.unitName || ''}` : ''})</span>
                </div>
              )}
              {meta.orderInvoice && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>No. Faktur:</span>
                  <span style={styles.metaValue}>{meta.orderInvoice}</span>
                </div>
              )}
              {meta.reason && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Alasan / Kategori:</span>
                  <span style={{ ...styles.metaValue, color: 'var(--red-600)', fontWeight: 700 }}>
                    {meta.reason}
                  </span>
                </div>
              )}
              {meta.user && (
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>Dicatat Oleh:</span>
                  <span style={styles.metaValue}>{meta.user}</span>
                </div>
              )}
            </div>

            {meta.note && (
              <div style={styles.noteBox}>
                <FileText size={13} color="var(--neutral-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.813rem', color: 'var(--neutral-700)', fontStyle: 'italic' }}>
                  "{meta.note}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  imageWrapper: {
    width: '100%',
    maxHeight: '400px',
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--neutral-200)'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    display: 'block'
  },
  metaCard: {
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  metaLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metaValue: {
    fontSize: '0.813rem',
    color: 'var(--neutral-900)',
    fontWeight: 600
  },
  noteBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: '#ffffff',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid var(--neutral-200)',
    marginTop: '4px'
  }
};
