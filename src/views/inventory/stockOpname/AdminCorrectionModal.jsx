import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Save, 
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

export const AdminCorrectionModal = ({
  isOpen,
  onClose,
  report,
  onSaveCorrection,
  isSubmitting = false
}) => {
  const [stockInputs, setStockInputs] = useState({});
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmingSave, setIsConfirmingSave] = useState(false);

  // Initialize input state when report changes or modal opens
  useEffect(() => {
    if (report && isOpen) {
      const initial = {};
      (report.items || []).forEach(item => {
        const matId = item.rawMaterialId || item.id;
        initial[matId] = item.actualStock !== null && item.actualStock !== undefined ? String(item.actualStock) : '';
      });
      setStockInputs(initial);
      setReason('');
      setReasonError('');
      setSearchQuery('');
      setIsConfirmingSave(false);
    }
  }, [report, isOpen]);

  const handleStockChange = (matId, val) => {
    setStockInputs(prev => ({
      ...prev,
      [matId]: val
    }));
  };

  // Compute changes / diffs (Section 18)
  const detectedChanges = useMemo(() => {
    if (!report?.items) return [];
    const diffs = [];

    report.items.forEach(item => {
      const matId = item.rawMaterialId || item.id;
      const oldVal = item.actualStock !== null && item.actualStock !== undefined ? Number(item.actualStock) : null;
      const inputVal = stockInputs[matId];
      const newVal = inputVal !== '' && inputVal !== undefined && inputVal !== null ? Number(inputVal) : null;

      if (newVal !== null && newVal !== oldVal) {
        const sysStock = Number(item.systemStock ?? 0);
        const oldDiff = oldVal !== null ? Math.round((oldVal - sysStock) * 1000) / 1000 : null;
        const newDiff = Math.round((newVal - sysStock) * 1000) / 1000;

        diffs.push({
          rawMaterialId: matId,
          name: item.name,
          unitName: item.unitName,
          systemStock: sysStock,
          oldActual: oldVal,
          newActual: newVal,
          oldDiff,
          newDiff
        });
      }
    });

    return diffs;
  }, [report?.items, stockInputs]);

  // Filter items in table by search
  const filteredItems = useMemo(() => {
    let list = report?.items || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i => (i.name || '').toLowerCase().includes(q) || (i.categoryName || '').toLowerCase().includes(q));
    }
    return list;
  }, [report?.items, searchQuery]);

  const handleProceedToConfirm = () => {
    // Validate mandatory reason
    if (!reason || !reason.trim()) {
      setReasonError('Alasan koreksi wajib diisi!');
      return;
    }
    if (detectedChanges.length === 0) {
      alert('Tidak ada nilai stok yang diubah.');
      return;
    }
    setReasonError('');
    setIsConfirmingSave(true);
  };

  const handleFinalSave = async () => {
    const payloadMap = {};
    detectedChanges.forEach(ch => {
      payloadMap[ch.rawMaterialId] = ch.newActual;
    });

    const res = await onSaveCorrection(report.id, payloadMap, reason.trim());
    if (res?.success) {
      setIsConfirmingSave(false);
      onClose();
    }
  };

  if (!report) return null;

  return (
    <>
      <Modal
        isOpen={isOpen && !isConfirmingSave}
        onClose={onClose}
        title="Koreksi Stok (Super Admin)"
        maxWidth="800px"
      >
        <div style={styles.container}>
          {/* Header Banner info */}
          <div style={styles.headerInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#7c3aed" />
              <strong style={{ fontSize: '0.938rem', color: 'var(--neutral-900)' }}>
                {report.displayDate}
              </strong>
              <span style={styles.versionBadge}>
                Versi Sekarang: v{report.version || 1} → Akan menjadi v{(report.version || 1) + 1}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.813rem', color: 'var(--neutral-600)' }}>
              Dibuat oleh <strong>{report.createdBy?.name || 'Kasir'}</strong>. Koreksi akan dicatat permanen di riwayat versi dan audit trail.
            </p>
          </div>

          {/* Search Bar for table */}
          <div style={styles.searchBarWrap}>
            <Search size={14} color="var(--neutral-400)" />
            <input
              type="text"
              placeholder="Cari bahan yang ingin dikoreksi..."
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
                <X size={14} color="var(--neutral-400)" />
              </button>
            )}
          </div>

          {/* Items Card List (Section 18 UX) */}
          <div style={styles.cardListWrapper}>
            {filteredItems.map((item) => {
              const matId = item.rawMaterialId || item.id;
              const currentVal = stockInputs[matId] ?? '';
              const oldVal = item.actualStock !== null && item.actualStock !== undefined ? Number(item.actualStock) : null;
              const isChanged = currentVal !== '' && Number(currentVal) !== oldVal;

              return (
                <div 
                  key={matId}
                  style={{
                    ...styles.correctionItemCard,
                    borderColor: isChanged ? '#7c3aed' : 'var(--border-color)',
                    backgroundColor: isChanged ? '#faf5ff' : '#ffffff'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.938rem', color: 'var(--neutral-900)' }}>{item.name}</strong>
                      {isChanged && <span style={styles.modifiedBadge}>Diubah</span>}
                    </div>
                    <div style={{ fontSize: '0.813rem', color: 'var(--neutral-500)', marginTop: '4px' }}>
                      Stok sistem: {item.systemStock} {item.unitName}
                    </div>
                  </div>

                  <div style={styles.stockColumns}>
                    {/* Stok Sebelumnya */}
                    <div style={styles.stockCol}>
                      <span style={styles.colLabel}>Stok sebelumnya</span>
                      <strong style={{ fontSize: '0.938rem', color: 'var(--neutral-700)' }}>
                        {oldVal !== null ? `${oldVal} ${item.unitName}` : '-'}
                      </strong>
                    </div>

                    {/* Stok Baru Input */}
                    <div style={styles.stockCol}>
                      <span style={styles.colLabel}>Stok baru</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={currentVal}
                          onChange={(e) => handleStockChange(matId, e.target.value)}
                          placeholder="0"
                          style={{
                            ...styles.actualStockInput,
                            borderColor: isChanged ? '#7c3aed' : 'var(--border-color)',
                            backgroundColor: '#ffffff'
                          }}
                        />
                        <span style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--neutral-600)' }}>
                          {item.unitName}
                        </span>
                      </div>
                    </div>

                    {/* Perubahan Diff Indicator */}
                    <div style={styles.stockCol}>
                      <span style={styles.colLabel}>Perubahan</span>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 700, 
                        color: isChanged ? '#7c3aed' : 'var(--neutral-400)' 
                      }}>
                        {isChanged ? `${oldVal} → ${currentVal} ${item.unitName}` : 'Tidak ada'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mandatory Reason Box (Section 18) */}
          <div style={styles.reasonSection}>
            <label style={styles.reasonLabel}>
              Alasan koreksi <span style={{ color: '#dc2626' }}>* Wajib Diisi</span>
            </label>

            <textarea
              rows={2}
              placeholder="Contoh: Koreksi hasil pengecekan fisik di gudang belakang..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setReasonError('');
              }}
              style={{
                ...styles.reasonTextarea,
                borderColor: reasonError ? '#dc2626' : 'var(--border-color)'
              }}
            />

            {reasonError && (
              <span style={{ color: '#dc2626', fontSize: '0.813rem', fontWeight: 600 }}>
                {reasonError}
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <div style={styles.footerActions}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              variant="primary"
              icon={Save}
              onClick={handleProceedToConfirm}
              disabled={isSubmitting || detectedChanges.length === 0}
              style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Lanjut Konfirmasi ({detectedChanges.length} Bahan)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal (Section 19 UX) */}
      <Modal
        isOpen={isConfirmingSave}
        onClose={() => setIsConfirmingSave(false)}
        title="Konfirmasi Perubahan"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase' }}>
              Daftar Perubahan Stok:
            </span>
            <div style={styles.confirmDiffList}>
              {detectedChanges.map(ch => (
                <div key={ch.rawMaterialId} style={styles.confirmDiffRow}>
                  <strong>{ch.name}</strong>
                  <span style={{ color: '#7c3aed', fontWeight: 700 }}>
                    {ch.oldActual} {ch.unitName} → {ch.newActual} {ch.unitName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.confirmReasonBox}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '2px' }}>
              Alasan:
            </span>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#78350f', fontStyle: 'italic' }}>
              "{reason}"
            </p>
          </div>

          <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--neutral-500)', lineHeight: '1.4' }}>
            Perubahan akan tercatat dalam riwayat Stock Opname (Versi {(report.version || 1) + 1}) dan tidak dapat dihapus.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button
              variant="outline"
              onClick={() => setIsConfirmingSave(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              variant="primary"
              onClick={handleFinalSave}
              disabled={isSubmitting}
              style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  headerInfo: {
    backgroundColor: '#f5f3ff',
    border: '1px solid #ddd6fe',
    borderRadius: '8px',
    padding: '10px 14px'
  },
  versionBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #c4b5fd'
  },
  searchBarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: '#ffffff'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.813rem'
  },
  cardListWrapper: {
    maxHeight: '340px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '4px'
  },
  correctionItemCard: {
    border: '1.5px solid',
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  modifiedBadge: {
    fontSize: '0.625rem',
    fontWeight: 700,
    backgroundColor: '#f3e8ff',
    color: '#7e22ce',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  stockColumns: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  stockCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: '90px'
  },
  colLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    fontWeight: 600
  },
  actualStockInput: {
    width: '80px',
    padding: '4px 8px',
    textAlign: 'right',
    fontSize: '0.938rem',
    fontWeight: 800,
    borderRadius: '6px',
    border: '1.5px solid',
    outline: 'none'
  },
  reasonSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  reasonLabel: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  reasonTextarea: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px'
  },
  confirmDiffList: {
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px',
    maxHeight: '160px',
    overflowY: 'auto'
  },
  confirmDiffRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem'
  },
  confirmReasonBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '10px 14px'
  }
};
