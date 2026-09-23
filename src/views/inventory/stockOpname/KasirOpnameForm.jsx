import React, { useState, useMemo, useRef } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check, 
  Clock, 
  AlertTriangle, 
  Search, 
  X, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  Store
} from 'lucide-react';
import { formatDateIndonesian } from '../../../utils/dateUtils';
import { toast } from '../../components/Toast';

export const KasirOpnameForm = ({ onBack, onProceedToReview, initialFilter = 'ALL' }) => {
  const { 
    activeDate, 
    editingReportId,
    cancelEditMode,
    draftStocks, 
    updateDraftStock, 
    draftSummary 
  } = useStockOpname();

  const { currentUser, storeName = 'XCrepes POS' } = useAuth();
  const [filterMode, setFilterMode] = useState(initialFilter); // 'ALL' | 'UNCOUNTED' | 'COUNTED' | 'DISCREPANCY'
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  });

  const inputRefs = useRef({});

  // Handle stock change with autosave timestamp update
  const handleStockInputChange = (matId, val) => {
    updateDraftStock(matId, val);
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Move to next input field on Enter keypress
  const handleKeyDown = (e, currentIdx, displayedList) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIdx = currentIdx + 1;
      if (nextIdx < displayedList.length) {
        const nextMatId = displayedList[nextIdx].rawMaterialId;
        inputRefs.current[nextMatId]?.focus();
      }
    }
  };

  // Filter materials based on search and status
  const displayedItems = useMemo(() => {
    let list = draftSummary.items || [];

    if (filterMode === 'UNCOUNTED') {
      list = list.filter(i => i.status === 'UNCOUNTED');
    } else if (filterMode === 'COUNTED') {
      list = list.filter(i => i.status !== 'UNCOUNTED');
    } else if (filterMode === 'DISCREPANCY') {
      list = list.filter(i => i.status === 'DEFICIT' || i.status === 'SURPLUS');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i => 
        (i.name || '').toLowerCase().includes(q) ||
        (i.categoryName || '').toLowerCase().includes(q) ||
        (i.unitName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [draftSummary.items, filterMode, searchQuery]);

  const discrepancyCount = draftSummary.deficitCount + draftSummary.surplusCount;

  return (
    <div className="kasir-opname-form animate-fade-in" style={styles.container}>
      {/* Top Header */}
      <div style={styles.topHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onBack}
            style={styles.backBtn}
            title="Kembali ke Daftar Stock Opname"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={styles.title}>
                {editingReportId ? 'Edit Stock Opname' : 'Stock Opname Fisik'}
              </h1>
              {editingReportId && (
                <span style={styles.editBadge}>Mode Edit</span>
              )}
            </div>
            <div style={styles.dateSub}>
              <span>{formatDateIndonesian(activeDate)}</span>
              <span>•</span>
              <span>{storeName}</span>
              <span>•</span>
              <span>Petugas: {currentUser?.nama || 'Kasir'}</span>
            </div>
          </div>
        </div>

        {/* Lightweight autosave feedback */}
        <div style={styles.autosaveBadge}>
          <CheckCircle2 size={13} color="#059669" />
          <span>Tersimpan otomatis {lastSavedTime}</span>
        </div>
      </div>

      {/* Progress Bar Card (Section 7 & 12) */}
      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <div>
            <span style={styles.progressLabel}>PROGRESS PENGECEKAN</span>
            <div style={styles.progressCounter}>
              <strong>{draftSummary.countedCount} / {draftSummary.totalMaterials}</strong> bahan sudah diisi
              <span style={{ marginLeft: '8px', color: draftSummary.isComplete ? '#059669' : '#2563eb', fontWeight: 800 }}>
                {draftSummary.progressPercent}%
              </span>
            </div>
          </div>

          <div>
            {draftSummary.isComplete ? (
              <span style={styles.completeTag}>
                <Check size={14} /> 20 / 20 Selesai (Semua bahan sudah diisi)
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setFilterMode('UNCOUNTED')}
                style={styles.incompleteTagBtn}
                title="Klik untuk melihat hanya bahan yang belum diisi"
              >
                <AlertTriangle size={13} /> {draftSummary.uncountedCount} bahan belum diisi
              </button>
            )}
          </div>
        </div>

        <div style={styles.progressTrack}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${draftSummary.progressPercent}%`,
              backgroundColor: draftSummary.isComplete ? '#059669' : '#2563eb'
            }}
          />
        </div>
      </div>

      {/* Toolbar: Filters & Search (Section 9) */}
      <div style={styles.toolbar}>
        <div style={styles.filterPills}>
          <button
            type="button"
            style={{ ...styles.pillBtn, ...(filterMode === 'ALL' ? styles.pillBtnActive : {}) }}
            onClick={() => setFilterMode('ALL')}
          >
            Semua ({draftSummary.totalMaterials})
          </button>

          <button
            type="button"
            style={{ 
              ...styles.pillBtn, 
              ...(filterMode === 'UNCOUNTED' ? styles.pillBtnActiveAmber : {}),
              borderColor: draftSummary.uncountedCount > 0 ? '#f59e0b' : 'var(--border-color)',
              fontWeight: draftSummary.uncountedCount > 0 ? 700 : 500
            }}
            onClick={() => setFilterMode('UNCOUNTED')}
          >
            Belum diisi ({draftSummary.uncountedCount})
          </button>

          <button
            type="button"
            style={{ ...styles.pillBtn, ...(filterMode === 'COUNTED' ? styles.pillBtnActiveGreen : {}) }}
            onClick={() => setFilterMode('COUNTED')}
          >
            Sudah diisi ({draftSummary.countedCount})
          </button>

          <button
            type="button"
            style={{ ...styles.pillBtn, ...(filterMode === 'DISCREPANCY' ? styles.pillBtnActiveRed : {}) }}
            onClick={() => setFilterMode('DISCREPANCY')}
          >
            Ada selisih ({discrepancyCount})
          </button>
        </div>

        <div style={styles.searchBox}>
          <Search size={14} color="var(--neutral-400)" />
          <input
            type="text"
            placeholder="Cari bahan..."
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

      {/* CARD LIST OF MATERIALS (Section 7, 8, 27, 29) */}
      <div style={styles.itemsListContainer}>
        {displayedItems.length === 0 ? (
          <div style={styles.emptyItemsBox}>
            <p style={{ margin: 0, color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
              Tidak ada bahan yang sesuai dengan filter atau kata kunci pencarian.
            </p>
            {filterMode !== 'ALL' && (
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                style={styles.resetFilterLink}
              >
                Tampilkan semua bahan
              </button>
            )}
          </div>
        ) : (
          displayedItems.map((item, idx) => {
            const rawVal = draftStocks[item.rawMaterialId] ?? '';
            const hasActual = rawVal !== '' && rawVal !== null && rawVal !== undefined;
            const diff = item.difference;

            return (
              <div 
                key={item.rawMaterialId} 
                style={{
                  ...styles.materialCard,
                  borderColor: hasActual ? 'var(--border-color)' : '#fde68a',
                  backgroundColor: hasActual ? '#ffffff' : '#fffdf5'
                }}
              >
                {/* Left Side: Material Info & System Stock */}
                <div style={styles.cardInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={styles.materialName}>{item.name}</h3>
                    {item.categoryName && (
                      <span style={styles.categoryBadge}>{item.categoryName}</span>
                    )}
                  </div>

                  <div style={styles.systemStockRef}>
                    Stok sistem: <strong>{item.systemStock} {item.unitName}</strong>
                  </div>

                  {/* Live Variance Label (Section 21) */}
                  {hasActual && (
                    <div style={styles.varianceRow}>
                      {diff === 0 ? (
                        <span style={styles.varMatch}>
                          <Check size={12} /> Selisih: 0 {item.unitName} (Cocok)
                        </span>
                      ) : diff < 0 ? (
                        <span style={styles.varDeficit}>
                          Selisih: {diff} {item.unitName} (Kurang)
                        </span>
                      ) : (
                        <span style={styles.varSurplus}>
                          Selisih: +{diff} {item.unitName} (Lebih)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Big Touch-Friendly Actual Input (Section 8) */}
                <div style={styles.cardInputWrapper}>
                  <label style={styles.inputLabel}>Stok aktual</label>
                  <div style={styles.inputBoxWithUnit}>
                    <input
                      ref={(el) => (inputRefs.current[item.rawMaterialId] = el)}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={rawVal}
                      onChange={(e) => handleStockInputChange(item.rawMaterialId, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, displayedItems)}
                      style={{
                        ...styles.numericInput,
                        borderColor: hasActual ? '#059669' : '#d97706',
                        backgroundColor: hasActual ? '#ffffff' : '#fefce8'
                      }}
                    />
                    <span style={styles.unitSuffix}>{item.unitName}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Action Bar (Section 28) */}
      <div style={styles.stickyBottomBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '0.938rem', color: draftSummary.isComplete ? '#059669' : 'var(--neutral-900)' }}>
            {draftSummary.countedCount} / {draftSummary.totalMaterials} sudah diisi
          </strong>
          {!draftSummary.isComplete && (
            <span style={{ fontSize: '0.813rem', color: '#b45309' }}>
              ({draftSummary.uncountedCount} belum diisi)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            icon={Save}
            onClick={() => {
              toast.success('Draft stok tersimpan di perangkat.');
              setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
            }}
          >
            Simpan Draft
          </Button>

          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={onProceedToReview}
          >
            Lanjut Review
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto',
    paddingBottom: '80px' // Space for sticky bottom bar
  },
  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    color: 'var(--neutral-700)',
    cursor: 'pointer'
  },
  title: {
    margin: 0,
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  dateSub: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    marginTop: '2px'
  },
  editBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    backgroundColor: '#fffbeb',
    color: '#b45309',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #fde68a'
  },
  autosaveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #a7f3d0'
  },
  progressCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  progressLabel: {
    fontSize: '0.688rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: 'var(--neutral-500)',
    display: 'block'
  },
  progressCounter: {
    fontSize: '0.938rem',
    color: 'var(--neutral-800)',
    marginTop: '2px'
  },
  completeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '0.813rem',
    fontWeight: 700
  },
  incompleteTagBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '0.813rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  progressTrack: {
    height: '8px',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.25s ease'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterPills: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  pillBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '999px',
    padding: '5px 12px',
    fontSize: '0.813rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  pillBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#1d4ed8',
    fontWeight: 700
  },
  pillBtnActiveAmber: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    color: '#b45309',
    fontWeight: 700
  },
  pillBtnActiveGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    color: '#059669',
    fontWeight: 700
  },
  pillBtnActiveRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    color: '#dc2626',
    fontWeight: 700
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '6px 12px',
    minWidth: '220px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.813rem',
    flex: 1
  },
  itemsListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  materialCard: {
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    flexWrap: 'wrap'
  },
  cardInfo: {
    flex: 1,
    minWidth: '200px'
  },
  materialName: {
    margin: 0,
    fontSize: '1.063rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  categoryBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-100)',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  systemStockRef: {
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    marginTop: '4px'
  },
  varianceRow: {
    marginTop: '6px'
  },
  varMatch: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  varDeficit: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  varSurplus: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  cardInputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  inputLabel: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  inputBoxWithUnit: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  numericInput: {
    width: '110px',
    padding: '8px 12px',
    textAlign: 'right',
    fontSize: '1.125rem',
    fontWeight: 800,
    borderRadius: '8px',
    border: '2px solid',
    outline: 'none',
    color: 'var(--neutral-900)',
    transition: 'border-color 0.2s'
  },
  unitSuffix: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    minWidth: '28px'
  },
  emptyItemsBox: {
    textAlign: 'center',
    padding: '40px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px'
  },
  resetFilterLink: {
    marginTop: '8px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '0.813rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  stickyBottomBar: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border-color)',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
    zIndex: 40,
    flexWrap: 'wrap',
    gap: '12px'
  }
};
