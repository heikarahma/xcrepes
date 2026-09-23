import React, { useState, useMemo } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { SearchSelect } from '../../components/SearchSelect';
import { EmptyState } from '../../components/EmptyState';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  User, 
  X, 
  Filter,
  Check,
  Ban,
  RotateCcw,
  Package
} from 'lucide-react';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../../../utils/dateUtils';

const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const AdminOpnameDashboard = ({ 
  onOpenReport, 
  onCreateTodayOpname, 
  onOpenTodayOpname 
}) => {
  const { 
    reports = [],
    todayReport 
  } = useStockOpname();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'SUBMITTED' | 'VOID'
  const [discrepancyPillFilter, setDiscrepancyPillFilter] = useState('ALL'); // 'ALL' | 'DISCREPANCY' | 'MATCH'

  // Combined filtered reports by Search, Status, and Pill Filter
  const displayedReports = useMemo(() => {
    let list = [...reports];

    // Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(r => r.status === statusFilter);
    }

    // Discrepancy pill filter
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

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => {
        const idMatch = (r.id || '').toLowerCase().includes(q);
        const dateMatch = (r.displayDate || r.opnameDate || '').toLowerCase().includes(q);
        const userMatch = (r.createdBy?.name || '').toLowerCase().includes(q) || (r.submittedBy?.name || '').toLowerCase().includes(q);
        const itemMatch = (r.items || []).some(i => (i.name || '').toLowerCase().includes(q));
        return idMatch || dateMatch || userMatch || itemMatch;
      });
    }

    return list.sort((a, b) => (b.opnameDate || b.date || '').localeCompare(a.opnameDate || a.date || ''));
  }, [reports, statusFilter, discrepancyPillFilter, searchQuery]);

  return (
    <div className="reports-page stock-opname-dashboard-page animate-fade-in" style={styles.container}>
      {/* 1. TOP HEADER SECTION (Matches ReportsView / Summary Penjualan Menu & Laba HPP) */}
      <div style={styles.headerSection}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={styles.pageTitle}>Stock Opname & Audit Fisik</h1>
            <Badge variant="primary" withDot>
              Audit & Stok Fisik
            </Badge>
          </div>
          <p style={styles.pageSubtitle}>
            Pantau ringkasan hasil stock opname harian, audit selisih fisik vs sistem, serta evaluasi dampak valuasi deviasi bahan baku secara akurat.
          </p>
        </div>
      </div>
      {/* 2. SECTION BOX CONTAINER */}
      <div className="reports-section-box animate-fade-in" style={styles.sectionBox}>
        {/* Section Header */}
        <div className="reports-section-box-header" style={styles.sectionBoxHeader}>
          <div style={styles.sectionHeaderLeft}>
            <div style={{ ...styles.sectionIconBadge, backgroundColor: '#eff6ff', color: 'var(--blue-600)' }}>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={styles.sectionMainTitle}>Stock Opname Bahan Baku</h2>
                <span style={styles.sectionCounterBadge}>
                  {displayedReports.length} Laporan
                </span>
              </div>
              <p style={styles.sectionSubtitle}>
                Ringkasan performa kepatuhan audit fisik bahan baku, perbandingan stok sistem vs fisik, serta histori laporan outlet
              </p>
            </div>
          </div>

          {/* Section Controls: Search, Pill Filters, Status Dropdown & Primary Action */}
          <div className="reports-section-controls" style={styles.sectionHeaderRight}>
            {/* Search Input */}
            <div className="reports-search-wrapper" style={styles.searchWrapper}>
              <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari ID, tanggal, kasir, bahan..."
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

            {/* Contextual Discrepancy Filter Pills */}
            <div className="reports-pill-group" style={styles.pillGroup}>
              <button
                className={`reports-pill-btn ${discrepancyPillFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setDiscrepancyPillFilter('ALL')}
                style={{
                  ...styles.pillBtn,
                  ...(discrepancyPillFilter === 'ALL' ? styles.pillBtnActive : {})
                }}
                title="Tampilkan seluruh riwayat stock opname"
              >
                Semua Laporan
              </button>
              <button
                className={`reports-pill-btn ${discrepancyPillFilter === 'DISCREPANCY' ? 'is-active' : ''}`}
                onClick={() => setDiscrepancyPillFilter('DISCREPANCY')}
                style={{
                  ...styles.pillBtn,
                  ...(discrepancyPillFilter === 'DISCREPANCY' ? styles.pillBtnActive : {})
                }}
                title="Hanya laporan yang memiliki selisih fisik vs sistem"
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
                title="Hanya laporan dengan 100% stok fisik cocok"
              >
                Sesuai (Match)
              </button>
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ minWidth: '150px' }}>
              <SearchSelect
                options={[
                  { value: 'ALL', label: 'Semua Status' },
                  { value: 'SUBMITTED', label: 'Terkirim (Submitted)' },
                  { value: 'VOID', label: 'Dibatalkan (VOID)' }
                ]}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="Semua Status"
                searchPlaceholder="Cari status..."
                icon={Filter}
                clearable={false}
                size="sm"
              />
            </div>

            {/* Primary Action Button */}
            {todayReport ? (
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={() => onOpenTodayOpname(todayReport)}
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                size="sm"
              >
                Buka Stock Opname Hari Ini
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Plus}
                onClick={onCreateTodayOpname}
                size="sm"
              >
                + Buat Stock Opname
              </Button>
            )}
          </div>
        </div>

        {/* 5. TABLE CARD (Matches SalesReportTab) */}
        <div style={styles.tableCard}>
          <div style={styles.tableCardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck size={18} color="var(--blue-600)" />
              <h3 style={styles.cardHeaderTitle}>Ringkasan Laporan Stock Opname & Audit Selisih</h3>
            </div>
            <Badge variant="primary">
              {displayedReports.length} Laporan Terdaftar
            </Badge>
          </div>

          {displayedReports.length === 0 ? (
            <EmptyState
              title="Tidak ada riwayat stock opname"
              description="Belum ada laporan stock opname pada periode waktu atau filter pencarian yang dipilih."
              icon={ClipboardCheck}
              actionLabel={!todayReport ? "+ Buat Stock Opname" : undefined}
              onAction={!todayReport ? onCreateTodayOpname : undefined}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="transaction-desktop-table" style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.th, width: '38px', textAlign: 'center' }}>#</th>
                      <th style={styles.th}>No. Laporan & Waktu</th>
                      <th style={styles.th}>Petugas Kasir</th>
                      <th style={styles.th}>Cakupan Bahan</th>
                      <th style={styles.th}>Status Selisih Fisik</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Valuasi Selisih</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Versi & Status</th>
                      <th style={{ ...styles.th, textAlign: 'center', width: '100px' }}>Rincian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedReports.map((report, index) => {
                      const isVoid = report.status === 'VOID';
                      const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);
                      const totalDiffVal = report.summary?.totalDifferenceValue || 0;
                      const hasAdminCorrection = (report.auditTrail || []).some(a => a.action === 'ADMIN_CORRECTION');

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

                          {/* 2. Petugas (Kasir) */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={styles.userAvatar}>
                                <User size={13} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                                  {report.createdBy?.name || report.submittedBy?.name || 'Kasir'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>
                                  {report.createdBy?.role === 'superadmin' ? 'Super Admin' : 'Petugas Kasir'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Cakupan Bahan */}
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                              {report.summary?.totalMaterials || report.items?.length || 0} Bahan Baku
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: '2px' }}>
                              Audit Fisik Harian
                            </div>
                          </td>

                          {/* 4. Status Selisih */}
                          <td style={styles.td}>
                            {discrepancyCount > 0 ? (
                              <div>
                                <span style={styles.badgeDiscrepancy}>
                                  {discrepancyCount} Ada Selisih
                                </span>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-500)', marginTop: '3px' }}>
                                  <span style={{ color: '#059669', fontWeight: 600 }}>{report.summary?.matchCount || 0} Cocok</span>
                                  {report.summary?.deficitCount > 0 && <span style={{ color: '#dc2626' }}> • {report.summary.deficitCount} Kurang</span>}
                                  {report.summary?.surplusCount > 0 && <span style={{ color: '#2563eb' }}> • {report.summary.surplusCount} Lebih</span>}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span style={styles.badgeMatch}>
                                  100% Sesuai ({report.summary?.matchCount || report.items?.length || 0} Cocok)
                                </span>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: '3px' }}>
                                  0 item selisih
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 5. Valuasi Selisih */}
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                            <div style={{ 
                              fontSize: '13px',
                              color: isVoid ? '#9ca3af' : totalDiffVal < 0 ? '#dc2626' : totalDiffVal > 0 ? '#2563eb' : 'var(--neutral-800)' 
                            }}>
                              {totalDiffVal !== 0 ? formatIDR(totalDiffVal) : 'Rp 0'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--neutral-400)', fontWeight: 400, marginTop: '2px' }}>
                              {totalDiffVal === 0 ? 'Sesuai Saldo' : totalDiffVal < 0 ? 'Defisit Bahan' : 'Surplus Fisik'}
                            </div>
                          </td>

                          {/* 6. Versi & Status */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={styles.versionPill}>
                                v{report.version || 1}
                              </span>
                              {hasAdminCorrection && (
                                <span style={styles.correctedBadge}>
                                  Ada Koreksi Admin
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Aksi */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => onOpenReport(report)}
                              style={styles.actionBtn}
                              title="Lihat Detail Laporan & Audit Trail"
                            >
                              <Eye size={14} />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="transaction-mobile-cards">
                {displayedReports.map((report) => {
                  const isVoid = report.status === 'VOID';
                  const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);
                  const totalDiffVal = report.summary?.totalDifferenceValue || 0;
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
                      {/* Header Row: Invoice Badge, Status & Date */}
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
                          <span style={styles.versionPill}>v{report.version || 1}</span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--neutral-400)" />
                          <span>{formatDateIndonesian(report.opnameDate || report.date)}</span>
                        </div>
                      </div>

                      {/* Middle Row: Petugas & Total Bahan */}
                      <div style={styles.mobileMiddleBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} color="var(--neutral-500)" />
                          <span>Petugas: <strong>{report.createdBy?.name || report.submittedBy?.name || 'Kasir'}</strong></span>
                        </div>
                        <div>
                          <span><strong>{report.summary?.totalMaterials || report.items?.length || 0}</strong> Bahan</span>
                        </div>
                      </div>

                      {/* Variance Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
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

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Valuasi: </span>
                          <strong style={{ fontSize: '0.875rem', color: isVoid ? '#9ca3af' : totalDiffVal < 0 ? '#dc2626' : totalDiffVal > 0 ? '#2563eb' : 'var(--neutral-800)' }}>
                            {totalDiffVal !== 0 ? formatIDR(totalDiffVal) : 'Rp 0'}
                          </strong>
                        </div>
                      </div>

                      {/* Bottom Action Button */}
                      <div style={styles.mobileCardActions}>
                        <button
                          type="button"
                          onClick={() => onOpenReport(report)}
                          style={{ ...styles.actionBtn, width: '100%', justifyContent: 'center', padding: '8px 12px' }}
                        >
                          <Eye size={14} />
                          <span>Lihat Detail Laporan</span>
                        </button>
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
          .reports-page {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .transaction-desktop-table {
            display: none !important;
          }
          .transaction-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '100%',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em',
    margin: 0
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--neutral-600)',
    marginTop: '6px',
    maxWidth: '750px',
    lineHeight: 1.5
  },


  // Section Box Card Container
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
    flexWrap: 'wrap',
    gap: '14px',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--border-color)'
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

  // Search & Filters
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
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
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
  versionPill: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  correctedBadge: {
    fontSize: '9px',
    fontWeight: 700,
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    padding: '2px 5px',
    borderRadius: '4px',
    border: '1px solid #ddd6fe',
    marginTop: '2px',
    display: 'inline-block'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-700)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  mobileCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  mobileMiddleBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.813rem'
  },
  mobileCardActions: {
    paddingTop: '8px',
    borderTop: '1px dashed var(--border-color)'
  }
};
