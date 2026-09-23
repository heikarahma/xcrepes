import React, { useState } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { 
  ArrowLeft, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Check, 
  Calendar, 
  User, 
  Store,
  Layers,
  Search,
  X
} from 'lucide-react';
import { formatDateIndonesian } from '../../../utils/dateUtils';

export const KasirOpnameReview = ({ onBackToEdit, onFocusUncounted }) => {
  const { 
    activeDate, 
    draftSummary, 
    submitOpnameReport, 
    isSubmitting 
  } = useStockOpname();

  const { currentUser, storeName = 'XCrepes POS' } = useAuth();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const discrepancyCount = draftSummary.deficitCount + draftSummary.surplusCount;

  const filteredItems = (draftSummary.items || []).filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (item.name || '').toLowerCase().includes(q) ||
           (item.categoryName || '').toLowerCase().includes(q) ||
           (item.unitName || '').toLowerCase().includes(q);
  });

  const handleConfirmSubmit = async () => {
    const res = await submitOpnameReport();
    if (res?.success) {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="kasir-opname-review animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Review Stock Opname</h1>
          <div style={styles.metaRow}>
            <span>{formatDateIndonesian(activeDate)}</span>
            <span>•</span>
            <span>{storeName}</span>
            <span>•</span>
            <span>Petugas: {currentUser?.nama || 'Kasir'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={onBackToEdit}
            disabled={isSubmitting}
          >
            Kembali Edit
          </Button>

          <Button
            variant="primary"
            icon={Send}
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={!draftSummary.isComplete || isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
          </Button>
        </div>
      </div>

      {/* Actionable Missing Items Banner (Section 13) */}
      {!draftSummary.isComplete ? (
        <div style={styles.missingAlertBox}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.938rem', color: '#991b1b', display: 'block' }}>
                Belum bisa dikirim
              </strong>
              <p style={{ margin: '3px 0 10px', fontSize: '0.813rem', color: '#b91c1c' }}>
                Masih ada {draftSummary.uncountedCount} bahan yang belum diisi. Lengkapi seluruh stok fisik aktual sebelum mengirim laporan.
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowLeft}
                onClick={onFocusUncounted}
                style={{ borderColor: '#f87171', color: '#991b1b', backgroundColor: '#ffffff', fontWeight: 700 }}
              >
                Lihat {draftSummary.uncountedCount} bahan yang belum diisi
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.completeAlertBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#059669" />
            <strong style={{ fontSize: '0.875rem', color: '#065f46' }}>
              ✓ Semua {draftSummary.totalMaterials} bahan sudah diisi lengkap.
            </strong>
          </div>
        </div>
      )}

      {/* Simple Summary Box (Section 14) */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>TANGGAL</span>
            <strong style={styles.summaryValue}>{formatDateIndonesian(activeDate)}</strong>
          </div>

          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>KELENGKAPAN BAHAN</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ ...styles.summaryValue, color: draftSummary.isComplete ? '#059669' : '#b45309' }}>
                {draftSummary.countedCount} / {draftSummary.totalMaterials}
              </strong>
              {draftSummary.isComplete && <Check size={16} color="#059669" />}
            </div>
          </div>

          <div style={styles.summaryCol}>
            <span style={styles.summaryLabel}>TOTAL SELISIH</span>
            <strong style={{ 
              ...styles.summaryValue, 
              color: discrepancyCount > 0 ? '#dc2626' : '#059669' 
            }}>
              {discrepancyCount > 0 ? `${discrepancyCount} item memiliki selisih` : 'Semua item cocok (0 selisih)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Comparison List Card (Section 14) */}
      <div className="blue-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {/* Search header */}
        <div style={styles.searchBarWrap}>
          <div style={styles.searchBox}>
            <Search size={14} color="var(--neutral-400)" />
            <input
              type="text"
              placeholder="Cari pada ringkasan review..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} color="var(--neutral-400)" />
              </button>
            )}
          </div>
        </div>

        <div style={styles.reviewList}>
          {filteredItems.map((item, idx) => {
            const hasActual = item.actualStock !== null && item.actualStock !== undefined;
            const diff = item.difference;

            return (
              <div key={item.rawMaterialId} style={styles.reviewRow}>
                {/* Left: Name & Category */}
                <div style={{ minWidth: '180px' }}>
                  <span style={styles.rowName}>{item.name}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{item.categoryName}</div>
                </div>

                {/* Middle: Comparison 15 kg → 12 kg */}
                <div style={styles.comparisonBox}>
                  <span style={styles.sysStock}>{item.systemStock} {item.unitName}</span>
                  <span style={styles.arrow}>→</span>
                  <span style={{ 
                    ...styles.actStock, 
                    color: hasActual ? 'var(--neutral-900)' : '#dc2626' 
                  }}>
                    {hasActual ? `${item.actualStock} ${item.unitName}` : 'Belum diisi'}
                  </span>
                </div>

                {/* Right: Variance */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  {hasActual ? (
                    diff === 0 ? (
                      <span style={styles.pillMatch}>0 {item.unitName}</span>
                    ) : diff < 0 ? (
                      <span style={styles.pillDeficit}>{diff} {item.unitName}</span>
                    ) : (
                      <span style={styles.pillSurplus}>+{diff} {item.unitName}</span>
                    )
                  ) : (
                    <span style={styles.pillUncounted}>Kosong</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal (Section 15) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Kirim Stock Opname?"
        maxWidth="440px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '0.938rem', color: 'var(--neutral-700)', lineHeight: '1.5' }}>
            Pastikan semua stok aktual sudah sesuai dengan hasil pengecekan fisik di outlet.
          </p>
          <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--neutral-500)', lineHeight: '1.4' }}>
            Setelah dikirim, laporan tetap dapat diedit oleh Kasir dalam batas waktu 1 hari.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              icon={Send}
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '850px',
    margin: '0 auto',
    paddingBottom: '32px'
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  title: {
    margin: 0,
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    marginTop: '3px'
  },
  missingAlertBox: {
    backgroundColor: '#fef2f2',
    border: '1.5px solid #fecaca',
    borderRadius: '10px',
    padding: '14px 16px'
  },
  completeAlertBox: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '10px',
    padding: '10px 14px'
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '14px 18px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px'
  },
  summaryCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  summaryLabel: {
    fontSize: '0.688rem',
    fontWeight: 800,
    color: 'var(--neutral-500)',
    letterSpacing: '0.04em'
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  searchBarWrap: {
    padding: '10px 16px',
    borderBottom: '1px solid var(--border-color)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 12px',
    maxWidth: '280px'
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.813rem',
    flex: 1
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column'
  },
  reviewRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    borderBottom: '1px solid var(--border-color)',
    gap: '12px',
    flexWrap: 'wrap'
  },
  rowName: {
    fontWeight: 700,
    fontSize: '0.938rem',
    color: 'var(--neutral-900)'
  },
  comparisonBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.875rem'
  },
  sysStock: {
    color: 'var(--neutral-500)'
  },
  arrow: {
    color: 'var(--neutral-400)',
    fontWeight: 700
  },
  actStock: {
    fontWeight: 800
  },
  pillMatch: {
    display: 'inline-block',
    fontSize: '0.813rem',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  pillDeficit: {
    display: 'inline-block',
    fontSize: '0.813rem',
    fontWeight: 700,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  pillSurplus: {
    display: 'inline-block',
    fontSize: '0.813rem',
    fontWeight: 700,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  pillUncounted: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '6px'
  }
};
