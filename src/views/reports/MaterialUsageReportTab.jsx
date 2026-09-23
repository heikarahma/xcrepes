import React, { useState } from 'react';
import { useReport } from '../../controllers/ReportController';
import { useOrder } from '../../controllers/OrderController';
import { EmptyState } from '../components/EmptyState';
import { SearchSelect } from '../components/SearchSelect';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowRight, 
  Receipt, 
  Coins, 
  TrendingDown, 
  AlertCircle, 
  ShoppingBag, 
  Sparkles,
  User,
  Calendar
} from 'lucide-react';

export const MaterialUsageReportTab = () => {
  const {
    materialDeductionLogs,
    materialSummary,
    materialSearchTerm,
    setMaterialSearchTerm,
    materialIdFilter,
    setMaterialIdFilter,
    materialEventTypeFilter,
    setMaterialEventTypeFilter,
    availableRawMaterials
  } = useReport();

  const { orders, openReceiptModal } = useOrder();

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const handleViewInvoice = (invoiceNumber) => {
    if (!invoiceNumber) return;
    const matchedOrder = orders.find(o => o.invoiceNumber === invoiceNumber);
    if (matchedOrder) {
      openReceiptModal(matchedOrder);
    }
  };

  return (
    <div className="material-report-tab" style={styles.container}>
      {/* 1. KPI SUMMARY CARDS */}
      <div className="reports-kpi-grid" style={styles.kpiGrid}>
        {/* Total Pengurangan */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Frekuensi Pemakaian Bahan</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--red-50)', color: 'var(--red-500)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={styles.kpiValue}>
            {materialSummary.totalDeductionsCount}{' '}
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--neutral-500)' }}>kali mutasi keluar</span>
          </div>
          <div style={styles.kpiMeta}>
            <span>Otomatis terpotong saat pesanan kasir & dapur</span>
          </div>
        </div>

        {/* Nilai Nominal Bahan Keluar */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Biaya Bahan Terpakai</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--amber-50)', color: 'var(--amber-600)' }}>
              <Coins size={18} />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: 'var(--neutral-900)' }}>
            {formatIDR(materialSummary.totalCostDeducted)}
          </div>
          <div style={styles.kpiMeta}>
            <span>Dihitung dari harga modal beli per satuan</span>
          </div>
        </div>

        {/* Bahan Paling Banyak Berkurang */}
        <div style={{ ...styles.kpiCard, borderLeft: '4px solid var(--blue-500)' }}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Bahan Paling Banyak Digunakan</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--blue-50)', color: 'var(--blue-500)' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ ...styles.kpiValue, fontSize: '18px', color: 'var(--blue-600)' }}>
            {materialSummary.topMaterial.name}
          </div>
          <div style={styles.kpiMeta}>
            <span style={styles.badgeBlue}>
              Total berkurang: {materialSummary.topMaterial.amount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="reports-filter-bar" style={styles.filterBar}>
        <div className="reports-search-wrapper" style={styles.searchWrapper}>
          <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama bahan, menu, atau No. Invoice (INV-...)"
            value={materialSearchTerm}
            onChange={(e) => setMaterialSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div className="reports-filter-group" style={{ ...styles.filterGroup, flexWrap: 'wrap' }}>
          {/* Filter Bahan Baku */}
          <div style={{ minWidth: '220px', flex: '1 1 200px' }}>
            <SearchSelect
              options={[
                { value: 'ALL', label: 'Semua Bahan Baku' },
                ...availableRawMaterials.map(m => ({
                  value: m.id,
                  label: m.name,
                  sublabel: `Satuan: ${m.unitName || 'Unit'}`
                }))
              ]}
              value={materialIdFilter}
              onChange={(val) => setMaterialIdFilter(val)}
              placeholder="Semua Bahan Baku"
              searchPlaceholder="Cari bahan baku..."
              icon={Package}
              clearable={false}
            />
          </div>

          {/* Filter Tipe Penyebab */}
          <div style={{ minWidth: '220px', flex: '1 1 200px' }}>
            <SearchSelect
              options={[
                { value: 'ALL', label: 'Semua Penyebab Mutasi' },
                { value: 'SALE', label: 'Hanya Penjualan Kasir POS' },
                { value: 'WASTE', label: 'Bahan Rusak / Expired / Retur' },
                { value: 'MANUAL_OUT', label: 'Pemakaian Manual Dapur' },
                { value: 'ADJUST', label: 'Penyesuaian Stok Opname' }
              ]}
              value={materialEventTypeFilter}
              onChange={(val) => setMaterialEventTypeFilter(val)}
              placeholder="Semua Penyebab"
              searchPlaceholder="Cari tipe mutasi..."
              icon={Filter}
              clearable={false}
            />
          </div>
        </div>
      </div>

      {/* 3. AUDIT TRAIL TABLE */}
      <div style={styles.tableCard}>
        {materialDeductionLogs.length === 0 ? (
          <EmptyState
            title="Tidak ada riwayat pengurangan bahan baku"
            description="Belum ada catatan mutasi pengurangan bahan baku pada filter atau periode waktu yang dipilih."
            icon={Package}
          />
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{ ...styles.th, width: '130px' }}>Waktu & Tanggal</th>
                  <th style={styles.th}>Bahan Baku</th>
                  <th style={styles.th}>Penyebab & Tipe</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Perubahan Stok (Awal ➔ Akhir)</th>
                  <th style={styles.th}>Digunakan Ke Mana (Menu / Topping)</th>
                  <th style={styles.th}>Transaksi Kasir (Invoice)</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Nilai Biaya</th>
                </tr>
              </thead>
              <tbody>
                {materialDeductionLogs.map((log) => {
                  const isSale = Boolean(log.referenceInvoice || log.orderId);

                  return (
                    <tr key={log.id} style={styles.tableRow}>
                      {/* Waktu */}
                      <td style={{ ...styles.td, fontSize: '12px', color: 'var(--neutral-600)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="var(--neutral-400)" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: '2px' }}>
                          Oleh: {log.user || 'Sistem'}
                        </div>
                      </td>

                      {/* Bahan Baku */}
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '14px' }}>
                          {log.rawMaterialName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                          Satuan: {log.unitName}
                        </div>
                      </td>

                      {/* Tipe / Penyebab */}
                      <td style={styles.td}>
                        <span style={{
                          ...styles.eventTypeBadge,
                          backgroundColor: log.badgeColor === 'blue' ? 'var(--blue-50)' : log.badgeColor === 'green' ? 'var(--green-50)' : log.badgeColor === 'purple' ? '#f3e8ff' : log.badgeColor === 'red' ? '#fef2f2' : 'var(--amber-50)',
                          color: log.badgeColor === 'blue' ? 'var(--blue-600)' : log.badgeColor === 'green' ? 'var(--green-600)' : log.badgeColor === 'purple' ? '#7e22ce' : log.badgeColor === 'red' ? '#b91c1c' : 'var(--amber-700)',
                          border: log.badgeColor === 'red' ? '1px solid #fecaca' : undefined
                        }}>
                          {log.eventBadgeText}
                        </span>
                      </td>

                      {/* Perubahan Stok */}
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.stockTransitionWrapper}>
                          <span style={styles.prevStockBadge}>
                            {log.previousStock} {log.unitName}
                          </span>
                          <ArrowRight size={13} color="var(--neutral-400)" />
                          <span style={styles.currentStockBadge}>
                            {log.currentStock} {log.unitName}
                          </span>
                        </div>
                        <div style={styles.deltaStockText}>
                          {log.type === 'OUT' ? '-' : log.type === 'IN' ? '+' : 'Δ '}{log.amount} {log.unitName}
                        </div>
                      </td>

                      {/* Digunakan ke mana */}
                      <td style={styles.td}>
                        {log.sourceMenu ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={styles.menuIconBadge}>
                              {log.sourceType === 'TOPPING' ? <Sparkles size={12} color="var(--orange-600)" /> : <ShoppingBag size={12} color="var(--blue-600)" />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: '13px' }}>
                                {log.sourceMenu}
                              </div>
                              {log.toppingName && (
                                <div style={{ fontSize: '11px', color: 'var(--orange-600)', fontWeight: 500 }}>
                                  Topping: {log.toppingName}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: 'var(--neutral-600)', fontStyle: 'italic' }}>
                            {log.note || 'Penyesuaian stok langsung'}
                          </div>
                        )}
                      </td>

                      {/* Transaksi Penjualan yang mana */}
                      <td style={styles.td}>
                        {log.referenceInvoice ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <button
                              onClick={() => handleViewInvoice(log.referenceInvoice)}
                              style={styles.invoiceButton}
                              title="Klik untuk lihat struk transaksi"
                            >
                              <Receipt size={13} />
                              <span>{log.referenceInvoice}</span>
                            </button>
                            {log.customerName && (
                              <span style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                                {log.customerName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--neutral-400)' }}>
                            - Non-Kasir -
                          </span>
                        )}
                      </td>

                      {/* Nilai Biaya Keluar */}
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>
                          {formatIDR(log.totalEstimatedValue)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                          @{formatIDR(log.pricePerUnit)}/{log.unitName}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .material-report-tab {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .reports-kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .reports-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 14px !important;
            gap: 12px !important;
          }
          .reports-search-wrapper {
            width: 100% !important;
            min-width: 100% !important;
          }
          .reports-filter-group {
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .reports-select-wrapper {
            width: 100% !important;
            min-width: 100% !important;
          }
          .reports-select-wrapper select {
            width: 100% !important;
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
    gap: '20px'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '18px 20px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: '13px',
    color: 'var(--neutral-500)',
    fontWeight: 500
  },
  kpiIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em'
  },
  kpiMeta: {
    fontSize: '12px',
    color: 'var(--neutral-500)'
  },
  badgeBlue: {
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '11px'
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  searchWrapper: {
    position: 'relative',
    minWidth: '280px',
    flex: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    height: '42px',
    padding: '0 14px 0 36px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '42px',
    boxSizing: 'border-box',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF'
  },
  filterSelect: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    height: '100%',
    padding: '0 4px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--neutral-700)'
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    backgroundColor: 'var(--neutral-50)',
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-fast)'
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },
  eventTypeBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  stockTransitionWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px'
  },
  prevStockBadge: {
    color: 'var(--neutral-500)',
    fontWeight: 500
  },
  currentStockBadge: {
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  deltaStockText: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--red-500)',
    marginTop: '3px'
  },
  menuIconBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: 'var(--neutral-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  invoiceButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    border: '1px solid var(--blue-200)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'monospace',
    cursor: 'pointer',
    width: 'fit-content'
  }
};
