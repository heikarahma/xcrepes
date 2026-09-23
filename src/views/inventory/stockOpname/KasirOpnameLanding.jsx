import React, { useState, useMemo } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Eye, 
  Lock, 
  ArrowRight,
  Store,
  User,
  History,
  AlertTriangle,
  Search,
  X,
  Check,
  Ban
} from 'lucide-react';
import { getLocalDateStr, formatDateIndonesian, formatDateTimeIndonesian } from '../../../utils/dateUtils';

export const KasirOpnameLanding = ({ 
  onCreateOpname, 
  onContinueDraft, 
  onViewReport, 
  onEditReport 
}) => {
  const { 
    reports, 
    todayReport, 
    draftSummary, 
    canKasirEdit 
  } = useStockOpname();

  const { currentUser, storeName = 'XCrepes POS' } = useAuth();
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [discrepancyPillFilter, setDiscrepancyPillFilter] = useState('ALL'); // 'ALL' | 'DISCREPANCY' | 'MATCH'

  // Check if today has a local draft in progress (user typed some values but not submitted yet)
  const isDraftInProgress = !todayReport && draftSummary.countedCount > 0;

  // Filter history (exclude today if already in hero card, or show all past)
  const displayedHistoryReports = useMemo(() => {
    let list = reports.filter(r => (r.opnameDate || r.date) !== todayStr);

    if (discrepancyPillFilter === 'DISCREPANCY') {
      list = list.filter(r => {
        const diffCount = (r.summary?.deficitCount || 0) + (r.summary?.surplusCount || 0);
        return diffCount > 0 && r.status !== 'VOID';
      });
    } else if (discrepancyPillFilter === 'MATCH') {
      list = list.filter(r => {
        const diffCount = (r.summary?.deficitCount || 0) + (r.summary?.surplusCount || 0);
        return diffCount === 0 && r.status !== 'VOID';
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => {
        const idMatch = (r.id || '').toLowerCase().includes(q);
        const dateMatch = (r.displayDate || r.opnameDate || '').toLowerCase().includes(q);
        const userMatch = (r.createdBy?.name || '').toLowerCase().includes(q) || (r.submittedBy?.name || '').toLowerCase().includes(q);
        return idMatch || dateMatch || userMatch;
      });
    }

    return list.sort((a, b) => (b.opnameDate || b.date || '').localeCompare(a.opnameDate || a.date || ''));
  }, [reports, todayStr, discrepancyPillFilter, searchQuery]);

  return (
    <div className="kasir-opname-landing animate-fade-in" style={styles.container}>
      {/* 1. TOP HEADER SECTION (Matches Riwayat Transaksi Penjualan Header) */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={styles.title}>Stock Opname</h1>
            <Badge variant="primary" withDot>
              Kasir Outlet
            </Badge>
            <span style={styles.outletBadge}>
              <Store size={12} /> {storeName}
            </span>
            <span style={styles.userBadge}>
              <User size={12} /> {currentUser?.nama || 'Kasir'}
            </span>
          </div>
          <p style={styles.subtitle}>
            Pencatatan stok fisik aktual harian seluruh bahan baku outlet sebelum closing toko.
          </p>
        </div>
      </div>

      {/* 2. HERO SECTION: Stock Opname Hari Ini */}
      <div style={styles.heroCard}>
        <div style={styles.heroHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.calendarIconWrap}>
              <Calendar size={18} color="#2563eb" />
            </div>
            <div>
              <span style={styles.heroCardLabel}>STOCK OPNAME HARI INI</span>
              <h2 style={styles.heroCardDate}>{formatDateIndonesian(todayStr)}</h2>
            </div>
          </div>

          {/* Status Badge */}
          {todayReport ? (
            <span style={styles.badgeSubmitted}>
              <CheckCircle2 size={13} /> Status: Terkirim
            </span>
          ) : isDraftInProgress ? (
            <span style={styles.badgeDraft}>
              <Clock size={13} /> Status: Draft (Sedang Dikerjakan)
            </span>
          ) : (
            <span style={styles.badgeNotStarted}>
              Belum Dibuat
            </span>
          )}
        </div>

        {/* Hero Card Body */}
        {todayReport ? (
          /* Case 1: Today is already SUBMITTED */
          <div style={styles.heroBody}>
            <div style={styles.submittedInfoBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} color="#059669" />
                <strong style={{ fontSize: '0.938rem', color: '#065f46' }}>
                  ✓ {todayReport.summary?.totalMaterials || draftSummary.totalMaterials} / {todayReport.summary?.totalMaterials || draftSummary.totalMaterials} bahan sudah diisi
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.813rem', color: '#047857' }}>
                Terkirim oleh <strong>{todayReport.submittedBy?.name || todayReport.createdBy?.name || 'Kasir'}</strong> pada {formatDateTimeIndonesian(todayReport.submittedAt || todayReport.createdAt)}.
              </p>
            </div>

            <div style={styles.heroActions}>
              <Button
                variant="primary"
                icon={Eye}
                onClick={() => onViewReport(todayReport)}
              >
                Lihat Laporan
              </Button>

              {canKasirEdit(todayStr) && todayReport.status !== 'VOID' && (
                <Button
                  variant="outline"
                  icon={Edit3}
                  onClick={() => onEditReport(todayReport)}
                >
                  Edit Stock Opname
                </Button>
              )}
            </div>
          </div>
        ) : isDraftInProgress ? (
          /* Case 2: Today is in DRAFT (in progress) */
          <div style={styles.heroBody}>
            <div style={styles.progressRow}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-800)' }}>
                {draftSummary.countedCount} / {draftSummary.totalMaterials} bahan sudah diisi
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#2563eb' }}>
                {draftSummary.progressPercent}%
              </span>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
              <span style={{ fontSize: '0.813rem', color: '#b45309' }}>
                Tersimpan di perangkat • Sisa {draftSummary.uncountedCount} bahan belum dihitung
              </span>

              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={onContinueDraft}
              >
                Lanjutkan Pengisian
              </Button>
            </div>
          </div>
        ) : (
          /* Case 3: Today is NOT YET STARTED */
          <div style={styles.heroBodyEmpty}>
            <p style={styles.emptyPrompt}>
              Belum ada Stock Opname untuk hari ini. Mulai pencatatan fisik stok bahan baku sebelum closing toko.
            </p>

            <Button
              variant="primary"
              icon={Plus}
              size="md"
              onClick={onCreateOpname}
            >
              + Buat Stock Opname
            </Button>
          </div>
        )}
      </div>

      {/* 3. SECTION: Riwayat Stock Opname (Matches Riwayat Transaksi Penjualan Box) */}
      <div className="reports-section-box animate-fade-in" style={styles.sectionBox}>
        <div className="reports-section-box-header" style={styles.sectionBoxHeader}>
          <div style={styles.sectionHeaderLeft}>
            <div style={styles.sectionIconBadge}>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={styles.sectionMainTitle}>Riwayat Stock Opname</h2>
                <span style={styles.sectionCounterBadge}>
                  {displayedHistoryReports.length} Laporan
                </span>
              </div>
              <p style={styles.sectionSubtitle}>
                Daftar lengkap seluruh pencatatan stok fisik harian hari sebelumnya di outlet ini
              </p>
            </div>
          </div>

          {/* Section Controls: Pill filters & Search Input */}
          <div className="reports-section-controls" style={styles.sectionHeaderRight}>
            <div className="reports-search-wrapper" style={styles.searchWrapper}>
              <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari ID, tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={styles.clearSearchBtn}
                  title="Hapus kata kunci pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Pill Filters */}
            <div className="reports-pill-group" style={styles.pillGroup}>
              <button
                className={`reports-pill-btn ${discrepancyPillFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setDiscrepancyPillFilter('ALL')}
                style={{
                  ...styles.pillBtn,
                  ...(discrepancyPillFilter === 'ALL' ? styles.pillBtnActive : {})
                }}
              >
                Semua
              </button>
              <button
                className={`reports-pill-btn ${discrepancyPillFilter === 'DISCREPANCY' ? 'is-active' : ''}`}
                onClick={() => setDiscrepancyPillFilter('DISCREPANCY')}
                style={{
                  ...styles.pillBtn,
                  ...(discrepancyPillFilter === 'DISCREPANCY' ? styles.pillBtnActive : {})
                }}
              >
                Ada Selisih
              </button>
              <button
                className={`reports-pill-btn ${discrepancyPillFilter === 'MATCH' ? 'is-active' : ''}`}
                onClick={() => setDiscrepancyPillFilter('MATCH')}
                style={{
                  ...styles.pillBtn,
                  ...(discrepancyPillFilter === 'MATCH' ? styles.pillBtnActive : {})
                }}
              >
                Sesuai
              </button>
            </div>
          </div>
        </div>

        {/* Table Card (Matches Summary Penjualan Table Card) */}
        <div className="transaction-table-card" style={styles.tableCard}>
          <div style={styles.tableCardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck size={18} color="var(--blue-600)" />
              <h3 style={styles.cardHeaderTitle}>Histori Pencatatan Fisik Hari Sebelumnya</h3>
            </div>
            <Badge variant="primary">
              {displayedHistoryReports.length} Laporan
            </Badge>
          </div>

          {displayedHistoryReports.length === 0 ? (
            <EmptyState
              title="Tidak ada riwayat stock opname"
              description={searchQuery ? "Tidak ditemukan laporan yang sesuai dengan kata kunci pencarian." : "Belum ada riwayat stock opname hari sebelumnya."}
              icon={ClipboardCheck}
            />
          ) : (
            <>
              {/* 1. Desktop Table View */}
              <div className="transaction-desktop-table" style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.th, width: '38px', textAlign: 'center' }}>#</th>
                      <th style={styles.th}>No. Laporan & Waktu</th>
                      <th style={styles.th}>Petugas</th>
                      <th style={styles.th}>Bahan Baku</th>
                      <th style={styles.th}>Status Selisih</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Status Edit</th>
                      <th style={{ ...styles.th, textAlign: 'center', width: '150px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedHistoryReports.map((report, index) => {
                      const isEditable = canKasirEdit(report.opnameDate || report.date);
                      const isVoid = report.status === 'VOID';
                      const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);

                      return (
                        <tr 
                          key={report.id} 
                          style={{
                            ...styles.tableRow,
                            backgroundColor: isVoid ? '#fff1f2' : undefined
                          }}
                        >
                          {/* 0. Index # */}
                          <td style={{ ...styles.td, textAlign: 'center', color: 'var(--neutral-400)', fontWeight: 600 }}>
                            {index + 1}
                          </td>

                          {/* 1. No. Laporan & Waktu */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={styles.invoiceBadge}>{report.id}</span>
                                {isVoid ? (
                                  <span style={styles.statusVoidBadge}>
                                    <Ban size={10} /> DIBATALKAN
                                  </span>
                                ) : (
                                  <span style={styles.statusSubmittedBadge}>
                                    <Check size={10} /> TERKIRIM
                                  </span>
                                )}
                              </div>
                              <div style={styles.timeSubtext}>
                                <Clock size={11} color="var(--neutral-400)" />
                                <span>{formatDateIndonesian(report.opnameDate || report.date)}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Petugas */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={styles.userAvatar}>
                                <User size={13} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                                  {report.submittedBy?.name || report.createdBy?.name || 'Kasir'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>
                                  Petugas Kasir
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Bahan Baku */}
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                              {report.summary?.totalMaterials || report.items?.length || 0} Bahan Baku
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: '2px' }}>
                              Katalog Master Aktif
                            </div>
                          </td>

                          {/* 4. Status Selisih */}
                          <td style={styles.td}>
                            {discrepancyCount > 0 ? (
                              <span style={styles.badgeDiscrepancy}>
                                {discrepancyCount} Ada Selisih
                              </span>
                            ) : (
                              <span style={styles.badgeMatch}>
                                Cocok (0 Selisih)
                              </span>
                            )}
                          </td>

                          {/* 5. Status Edit */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            {isVoid ? (
                              <span style={styles.statusVoidBadge}>
                                <Ban size={10} /> Dibatalkan
                              </span>
                            ) : isEditable ? (
                              <span style={styles.statusEditableBadge}>
                                <Clock size={10} /> Dapat Diedit
                              </span>
                            ) : (
                              <span style={styles.statusLockedBadge}>
                                <Lock size={10} /> Terkunci
                              </span>
                            )}
                          </td>

                          {/* 6. Aksi */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => onViewReport(report)}
                                style={styles.actionBtn}
                                title="Lihat Detail Laporan"
                              >
                                <Eye size={13} />
                                <span>Lihat</span>
                              </button>

                              {isEditable && !isVoid && (
                                <button
                                  type="button"
                                  onClick={() => onEditReport(report)}
                                  style={{
                                    ...styles.actionBtn,
                                    borderColor: '#93c5fd',
                                    color: '#1d4ed8',
                                    backgroundColor: '#eff6ff'
                                  }}
                                  title="Edit Laporan"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. Mobile Cards View */}
              <div className="transaction-mobile-cards">
                {displayedHistoryReports.map((report) => {
                  const isEditable = canKasirEdit(report.opnameDate || report.date);
                  const isVoid = report.status === 'VOID';
                  const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);
                  const borderLeftColor = isVoid ? '#ef4444' : discrepancyCount > 0 ? '#f59e0b' : 'var(--blue-600)';

                  return (
                    <div
                      key={`mob-${report.id}`}
                      className="transaction-mobile-card"
                      style={{
                        ...styles.mobileCard,
                        borderLeft: `4px solid ${borderLeftColor}`
                      }}
                    >
                      {/* Header Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={styles.invoiceBadge}>{report.id}</span>
                          {isVoid ? (
                            <span style={styles.statusVoidBadge}>
                              <Ban size={10} /> DIBATALKAN
                            </span>
                          ) : (
                            <span style={styles.statusSubmittedBadge}>
                              <Check size={10} /> TERKIRIM
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--neutral-400)" />
                          <span>{formatDateIndonesian(report.opnameDate || report.date)}</span>
                        </div>
                      </div>

                      {/* Middle Row */}
                      <div style={styles.mobileMiddleBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} color="var(--neutral-500)" />
                          <span>Petugas: <strong>{report.submittedBy?.name || report.createdBy?.name || 'Kasir'}</strong></span>
                        </div>
                        <div>
                          <span><strong>{report.summary?.totalMaterials || report.items?.length || 0}</strong> Bahan</span>
                        </div>
                      </div>

                      {/* Status Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          {discrepancyCount > 0 ? (
                            <span style={styles.badgeDiscrepancy}>
                              {discrepancyCount} Ada Selisih
                            </span>
                          ) : (
                            <span style={styles.badgeMatch}>
                              Cocok (0 Selisih)
                            </span>
                          )}
                        </div>
                        <div>
                          {isVoid ? (
                            <span style={styles.statusVoidBadge}>Dibatalkan</span>
                          ) : isEditable ? (
                            <span style={styles.statusEditableBadge}><Clock size={10} /> Dapat Diedit</span>
                          ) : (
                            <span style={styles.statusLockedBadge}><Lock size={10} /> Terkunci</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={styles.mobileCardActions}>
                        <button
                          type="button"
                          onClick={() => onViewReport(report)}
                          style={{ ...styles.actionBtn, flex: 1, justifyContent: 'center' }}
                        >
                          <Eye size={13} />
                          <span>Lihat</span>
                        </button>
                        {isEditable && !isVoid && (
                          <button
                            type="button"
                            onClick={() => onEditReport(report)}
                            style={{
                              ...styles.actionBtn,
                              flex: 1,
                              justifyContent: 'center',
                              borderColor: '#93c5fd',
                              color: '#1d4ed8',
                              backgroundColor: '#eff6ff'
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .transaction-desktop-table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
        .transaction-mobile-cards {
          display: none;
        }

        @media (max-width: 1024px) {
          .transaction-desktop-table {
            display: none !important;
          }
          .transaction-table-card {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .transaction-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    paddingBottom: '40px'
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
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: 'var(--neutral-500)'
  },
  outletBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 600
  },
  userBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 600
  },
  heroCard: {
    backgroundColor: '#ffffff',
    border: '1.5px solid #bfdbfe',
    borderRadius: '14px',
    padding: '20px 24px',
    boxShadow: '0 2px 10px rgba(37,99,235,0.06)'
  },
  heroHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap'
  },
  calendarIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  heroCardLabel: {
    fontSize: '0.688rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    color: '#2563eb',
    display: 'block'
  },
  heroCardDate: {
    margin: '2px 0 0',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  badgeSubmitted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '0.813rem',
    fontWeight: 700
  },
  badgeDraft: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '0.813rem',
    fontWeight: 700
  },
  badgeNotStarted: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-600)',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '0.813rem',
    fontWeight: 600
  },
  heroBody: {
    paddingTop: '16px'
  },
  heroBodyEmpty: {
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px'
  },
  emptyPrompt: {
    margin: 0,
    fontSize: '0.938rem',
    color: 'var(--neutral-600)',
    lineHeight: '1.5'
  },
  submittedInfoBox: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  progressTrack: {
    height: '10px',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.3s ease'
  },

  // Section Box Card Container (Matches Riwayat Transaksi Penjualan Box)
  sectionBox: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '18px 20px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  sectionBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '14px'
  },
  sectionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionIconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    color: 'var(--blue-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  sectionMainTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0,
    letterSpacing: '-0.01em'
  },
  sectionCounterBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    color: 'var(--blue-600)',
    border: '1px solid #bfdbfe'
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: 'var(--neutral-500)',
    margin: '3px 0 0 0'
  },
  sectionHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '240px'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px'
  },
  searchInput: {
    width: '100%',
    padding: '8px 28px 8px 32px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: 'var(--neutral-900)'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px'
  },
  pillGroup: {
    display: 'flex',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '8px',
    padding: '3px',
    gap: '2px',
    flexWrap: 'wrap'
  },
  pillBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  pillBtnActive: {
    backgroundColor: '#FFFFFF',
    color: 'var(--blue-600)',
    boxShadow: 'var(--shadow-sm)'
  },

  // Table Card
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  tableCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF'
  },
  cardHeaderTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },
  invoiceBadge: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '12px',
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  timeSubtext: {
    fontSize: '11.5px',
    color: 'var(--neutral-500)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px'
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: 'var(--blue-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statusSubmittedBadge: {
    fontSize: '0.656rem',
    fontWeight: 800,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    padding: '1px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  statusVoidBadge: {
    fontSize: '0.656rem',
    fontWeight: 800,
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    border: '1px solid #f87171',
    padding: '1px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  statusEditableBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 8px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  statusLockedBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 8px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  badgeMatch: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  badgeDiscrepancy: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-700)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },

  // Mobile Cards
  mobileCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box'
  },
  mobileMiddleBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.813rem'
  },
  mobileCardActions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '6px',
    borderTop: '1px solid var(--neutral-100)'
  }
};
