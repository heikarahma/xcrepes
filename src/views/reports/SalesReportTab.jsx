import React, { useState, useMemo, useEffect } from 'react';
import { useReport } from '../../controllers/ReportController';
import { useOrder } from '../../controllers/OrderController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { useAuth } from '../../controllers/AuthController';
import { TransactionDetailPage } from './TransactionDetailPage';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { SearchSelect } from '../components/SearchSelect';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Search, 
  Receipt, 
  Percent, 
  Eye, 
  Sparkles, 
  Cookie, 
  CheckCircle2, 
  Filter, 
  ArrowUpRight, 
  RotateCcw, 
  Camera, 
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
  Info,
  X,
  PieChart,
  User,
  Ban,
  Clock,
  Edit3
} from 'lucide-react';

export const SalesReportTab = () => {
  const {
    salesSummary,
    productPerformanceList,
    menuSalesWithToppings,
    enrichedOrders,
    salesPaymentFilter,
    setSalesPaymentFilter,
    salesItemTypeFilter,
    setSalesItemTypeFilter,
    activeSalesSection,
    setActiveSalesSection
  } = useReport();

  const { openReceiptModal, openOrderReturnModal, openOrderCancelModal, openOrderRevisionModal } = useOrder();
  const { openPhotoPreviewModal } = useRawMaterial();
  const { currentUser } = useAuth();

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const showProfitMetrics = isSuperAdmin;

  // Local independent search states for both sub-menus
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');

  // Selected Order for Detail View
  const [selectedOrderDetailId, setSelectedOrderDetailId] = useState(null);

  // Reset detail view when switching between summary and transactions
  useEffect(() => {
    setSelectedOrderDetailId(null);
  }, [activeSalesSection]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderDetailId) return null;
    return (enrichedOrders || []).find(o => o.id === selectedOrderDetailId) || null;
  }, [selectedOrderDetailId, enrichedOrders]);

  // Modal State
  const [selectedMenuForToppingDetail, setSelectedMenuForToppingDetail] = useState(null);

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

  // Insights Data
  const combinedList = menuSalesWithToppings?.list || [];
  const topMenu = menuSalesWithToppings?.topSellingMenu;
  const topTopping = menuSalesWithToppings?.topSellingTopping;
  const attachRate = menuSalesWithToppings?.toppingAttachRate || 0;
  const totalToppingRev = menuSalesWithToppings?.totalToppingRevenue || 0;
  const toppingShare = menuSalesWithToppings?.toppingRevenueShare || 0;

  // Filtered lists by menuSearchTerm
  const filteredCombinedList = useMemo(() => {
    if (!menuSearchTerm.trim()) return combinedList;
    const q = menuSearchTerm.toLowerCase().trim();
    return combinedList.filter(item => 
      (item.name || '').toLowerCase().includes(q) ||
      (item.categoryName || '').toLowerCase().includes(q) ||
      (item.toppingsList || []).some(t => (t.name || '').toLowerCase().includes(q))
    );
  }, [combinedList, menuSearchTerm]);

  const filteredProductPerformanceList = useMemo(() => {
    if (!menuSearchTerm.trim()) return productPerformanceList;
    const q = menuSearchTerm.toLowerCase().trim();
    return productPerformanceList.filter(item => 
      (item.name || '').toLowerCase().includes(q) ||
      (item.categoryName || '').toLowerCase().includes(q)
    );
  }, [productPerformanceList, menuSearchTerm]);

  // Filtered transactions by transactionSearchTerm & salesPaymentFilter
  const filteredTransactionOrders = useMemo(() => {
    return enrichedOrders.filter(order => {
      if (salesPaymentFilter !== 'ALL' && order.paymentMethod !== salesPaymentFilter) {
        return false;
      }
      if (transactionSearchTerm.trim()) {
        const q = transactionSearchTerm.toLowerCase().trim();
        const matchesInv = (order.invoiceNumber || '').toLowerCase().includes(q);
        const matchesCustomer = (order.customerName || '').toLowerCase().includes(q);
        const matchesCashier = (order.cashierName || '').toLowerCase().includes(q);
        const matchesItem = (order.items || []).some(it => 
          (it.name || '').toLowerCase().includes(q) ||
          (it.toppings || []).some(t => (t.name || '').toLowerCase().includes(q))
        );
        if (!matchesInv && !matchesCustomer && !matchesCashier && !matchesItem) return false;
      }
      return true;
    });
  }, [enrichedOrders, salesPaymentFilter, transactionSearchTerm]);

  return (
    <div className="sales-report-tab" style={styles.container}>
      {/* 1. TOP OVERALL KPI SUMMARY CARDS */}
      <div className="reports-kpi-grid" style={styles.kpiGrid}>
        {/* Total Omset */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Omset (Pendapatan Kotor)</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--blue-50)', color: 'var(--blue-500)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={styles.kpiValue}>{formatIDR(salesSummary.totalGrossRevenue)}</div>
          <div style={styles.kpiMeta}>
            <span style={styles.metaHighlight}>{salesSummary.totalTransactions} Transaksi Selesai</span>
          </div>
        </div>

        {/* Khusus Kasir: Tampilkan Total Transaksi sebagai card mandiri */}
        {!showProfitMetrics && (
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Total Transaksi Selesai</span>
              <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--green-50)', color: 'var(--green-600)' }}>
                <Receipt size={18} />
              </div>
            </div>
            <div style={styles.kpiValue}>
              {salesSummary.totalTransactions}{' '}
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--neutral-500)' }}>transaksi</span>
            </div>
            <div style={styles.kpiMeta}>
              <span>Rata-rata: {salesSummary.totalTransactions > 0 ? formatIDR(salesSummary.totalGrossRevenue / salesSummary.totalTransactions) : 'Rp 0'} / order</span>
            </div>
          </div>
        )}

        {/* Total Estimasi HPP - Khusus Super Admin */}
        {showProfitMetrics && (
          <div style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Total Estimasi HPP (Bahan)</span>
              <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--amber-50)', color: 'var(--amber-600)' }}>
                <Receipt size={18} />
              </div>
            </div>
            <div style={{ ...styles.kpiValue, color: 'var(--neutral-800)' }}>
              {formatIDR(salesSummary.totalEstimatedHPP)}
            </div>
            <div style={styles.kpiMeta}>
              <span>Biaya resep menu + topping</span>
            </div>
          </div>
        )}

        {/* Total Laba Bersih - Khusus Super Admin */}
        {showProfitMetrics && (
          <div style={{ ...styles.kpiCard, borderLeft: '4px solid var(--green-500)' }}>
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>Pendapatan Bersih (Laba Kotor)</span>
              <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--green-50)', color: 'var(--green-600)' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ ...styles.kpiValue, color: 'var(--green-600)' }}>
              {formatIDR(salesSummary.totalNetProfit)}
            </div>
            <div style={styles.kpiMeta}>
              <span style={{ ...styles.badgeGreen, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Percent size={11} /> Margin: {salesSummary.grossProfitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Produk Terjual */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiLabel}>Total Produk Terjual</span>
            <div style={{ ...styles.kpiIconWrapper, backgroundColor: 'var(--purple-50, #f3e8ff)', color: '#8b5cf6' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={styles.kpiValue}>
            {salesSummary.totalAllItemsSold}{' '}
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--neutral-500)' }}>porsi/item</span>
          </div>
          <div style={styles.kpiMeta}>
            <span>{salesSummary.totalMenuQtySold} Menu • {salesSummary.totalToppingQtySold} Topping</span>
          </div>
        </div>
      </div>

      {/* 2. TAMPILAN SESUAI SUB-MENU AKTIF DARI SIDEBAR */}
      {activeSalesSection === 'products' ? (
        /* =========================================================================
           SUB-MENU 1: SUMMARY PENJUALAN MENU & TOPPING
           ========================================================================= */
        <div className="reports-section-box animate-fade-in" style={styles.sectionBox}>
          {/* Section 1 Header */}
          <div className="reports-section-box-header" style={styles.sectionBoxHeader}>
            <div style={styles.sectionHeaderLeft}>
              <div style={{ ...styles.sectionIconBadge, backgroundColor: '#fff7ed', color: '#ea580c' }}>
                <Cookie size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={styles.sectionMainTitle}>Summary Penjualan Menu & Topping</h2>
                  <span style={styles.sectionCounterBadge}>
                    {salesItemTypeFilter === 'COMBINED' ? `${filteredCombinedList.length} Menu Terjual` : `${filteredProductPerformanceList.length} Item`}
                  </span>
                </div>
                <p style={styles.sectionSubtitle}>
                  Ringkasan performa porsi menu terjual dan rincian extra topping yang dipesan oleh pelanggan
                </p>
              </div>
            </div>

            {/* Section 1 Controls: Search & Filter Pills & Export Buttons */}
            <div className="reports-section-controls" style={styles.sectionHeaderRight}>
              {/* Search Input for Menu & Topping */}
              <div className="reports-search-wrapper" style={styles.searchWrapper}>
                <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Cari nama menu / topping..."
                  value={menuSearchTerm}
                  onChange={(e) => setMenuSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {menuSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setMenuSearchTerm('')}
                    style={styles.clearSearchBtn}
                    title="Hapus kata kunci pencarian"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Contextual Item Type Filter Pills */}
              <div className="reports-pill-group" style={styles.pillGroup}>
                <button
                  className={`reports-pill-btn ${salesItemTypeFilter === 'COMBINED' ? 'is-active' : ''}`}
                  onClick={() => setSalesItemTypeFilter('COMBINED')}
                  style={{
                    ...styles.pillBtn,
                    ...(salesItemTypeFilter === 'COMBINED' ? styles.pillBtnActive : {})
                  }}
                  title="Tampilan ringkasan menu beserta rincian topping yang dipesan bersamanya"
                >
                  Kombinasi Menu & Topping
                </button>
                <button
                  className={`reports-pill-btn ${salesItemTypeFilter === 'MENU' ? 'is-active' : ''}`}
                  onClick={() => setSalesItemTypeFilter('MENU')}
                  style={{
                    ...styles.pillBtn,
                    ...(salesItemTypeFilter === 'MENU' ? styles.pillBtnActive : {})
                  }}
                >
                  Menu Saja
                </button>
                <button
                  className={`reports-pill-btn ${salesItemTypeFilter === 'TOPPING' ? 'is-active' : ''}`}
                  onClick={() => setSalesItemTypeFilter('TOPPING')}
                  style={{
                    ...styles.pillBtn,
                    ...(salesItemTypeFilter === 'TOPPING' ? styles.pillBtnActive : {})
                  }}
                >
                  Topping Saja
                </button>
              </div>
            </div>
          </div>

          {/* Menu & Topping Insights Banner Grid */}
          <div className="menu-topping-insights-grid" style={styles.insightsGrid}>
            {/* Card 1: Menu Terlaris */}
            <div style={styles.insightCard}>
              <div style={styles.insightHeader}>
                <span style={styles.insightTitle}>Menu Terlaris (Best Seller)</span>
                <div style={{ ...styles.insightIconWrap, backgroundColor: '#eff6ff', color: 'var(--blue-600)' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={styles.insightValue}>
                {topMenu ? topMenu.name : 'Belum Ada Penjualan'}
              </div>
              <div style={styles.insightFooter}>
                {topMenu ? (
                  <>
                    <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>{topMenu.qtySold} Porsi</span>
                    {' • '}
                    <span>Omset: {formatIDR(topMenu.menuGrossRevenue)}</span>
                  </>
                ) : 'Menunggu transaksi kasir'}
              </div>
            </div>

            {/* Card 2: Extra Topping Terfavorit */}
            <div style={styles.insightCard}>
              <div style={styles.insightHeader}>
                <span style={styles.insightTitle}>Topping Terfavorit</span>
                <div style={{ ...styles.insightIconWrap, backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <Sparkles size={16} />
                </div>
              </div>
              <div style={styles.insightValue}>
                {topTopping ? topTopping.name : 'Belum Ada Topping'}
              </div>
              <div style={styles.insightFooter}>
                {topTopping ? (
                  <>
                    <span style={{ fontWeight: 700, color: '#ea580c' }}>{topTopping.qtySold}x Dipesan</span>
                    {' • '}
                    <span>Omset: {formatIDR(topTopping.grossRevenue)}</span>
                  </>
                ) : 'Belum ada extra topping'}
              </div>
            </div>

            {/* Card 3: Rasio Topping (Attach Rate) */}
            <div style={styles.insightCard}>
              <div style={styles.insightHeader}>
                <span style={styles.insightTitle}>Rasio Topping (Attach Rate)</span>
                <div style={{ ...styles.insightIconWrap, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <PieChart size={16} />
                </div>
              </div>
              <div style={{ ...styles.insightValue, color: '#16a34a' }}>
                {attachRate.toFixed(1)}%
              </div>
              <div style={styles.insightFooter}>
                <span>{menuSalesWithToppings?.itemsWithToppingCount || 0} dari {menuSalesWithToppings?.totalOrderItemsCount || 0} pesanan menambahkan extra topping</span>
              </div>
            </div>

            {/* Card 4: Total Omset Topping */}
            <div style={styles.insightCard}>
              <div style={styles.insightHeader}>
                <span style={styles.insightTitle}>Total Omset Extra Topping</span>
                <div style={{ ...styles.insightIconWrap, backgroundColor: '#fdf4ff', color: '#c026d3' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div style={{ ...styles.insightValue, color: '#c026d3' }}>
                {formatIDR(totalToppingRev)}
              </div>
              <div style={styles.insightFooter}>
                <span>Menyumbang {toppingShare.toFixed(1)}% dari total omset kotor</span>
              </div>
            </div>
          </div>

          {/* Table Content: COMBINED vs Standard Products List */}
          {salesItemTypeFilter === 'COMBINED' ? (
            /* TAMPILAN 1: RINGKASAN MENU & TOPPING (KOMBINASI BERIKUT TOPPING) */
            <div style={styles.tableCard}>
              <div style={styles.tableCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cookie size={18} color="var(--blue-600)" />
                  <h3 style={styles.cardHeaderTitle}>Ringkasan Penjualan Menu & Rincian Topping Terpasang</h3>
                </div>
                <Badge variant="primary">
                  {filteredCombinedList.length} Menu Terdaftar
                </Badge>
              </div>

              {filteredCombinedList.length === 0 ? (
                <EmptyState
                  title="Tidak ada data penjualan menu"
                  description="Belum ada transaksi penjualan menu pada periode waktu atau kata kunci yang dipilih."
                  icon={ShoppingBag}
                />
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={{ ...styles.th, width: '35px' }}>#</th>
                        <th style={styles.th}>Menu Produk & Kategori</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Porsi</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Harga Satuan</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Omset Menu</th>
                        <th style={{ ...styles.th, minWidth: '220px' }}>Topping yang Dipilih Pelanggan</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Omset Topping</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Total Omset Gabungan</th>
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'right' }}>Laba Bersih</th>}
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'center' }}>Margin</th>}
                        <th style={{ ...styles.th, textAlign: 'center', width: '85px' }}>Rincian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCombinedList.map((item, index) => {
                        const hasToppings = Array.isArray(item.toppingsList) && item.toppingsList.length > 0;
                        return (
                          <tr key={item.id} style={styles.tableRow}>
                            <td style={{ ...styles.td, color: 'var(--neutral-400)', fontWeight: 500 }}>
                              {index + 1}
                            </td>
                            <td style={styles.td}>
                              <div>
                                <div style={styles.productName}>{item.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                  <span style={styles.categoryBadge}>{item.categoryName}</span>
                                  {showProfitMetrics && (
                                    <span style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>HPP: {formatIDR(item.unitHpp)}/porsi</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              <span style={styles.qtyPill}>{item.qtySold}x</span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', color: 'var(--neutral-700)' }}>
                              {formatIDR(item.basePrice)}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: 'var(--neutral-900)' }}>
                              {formatIDR(item.menuGrossRevenue)}
                            </td>
                            <td style={styles.td}>
                              {hasToppings ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                                  {item.toppingsList.map((top, tIdx) => (
                                    <span
                                      key={tIdx}
                                      style={styles.toppingBadgePill}
                                      title={`${top.name}: Terjual ${top.qtySold}x @ ${formatIDR(top.price)} = ${formatIDR(top.grossRevenue)}`}
                                    >
                                      <Sparkles size={11} color="#ea580c" />
                                      <span>{top.name}</span>
                                      <strong style={{ color: '#c2410c' }}>({top.qtySold}x)</strong>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--neutral-400)', fontStyle: 'italic' }}>
                                  Tanpa extra topping
                                </span>
                              )}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', color: item.totalToppingRevenue > 0 ? '#ea580c' : 'var(--neutral-400)', fontWeight: item.totalToppingRevenue > 0 ? 600 : 400 }}>
                              {formatIDR(item.totalToppingRevenue)}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--blue-600)' }}>
                              {formatIDR(item.totalCombinedRevenue)}
                            </td>
                            {showProfitMetrics && (
                              <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: item.totalCombinedNetProfit >= 0 ? 'var(--green-600)' : 'var(--red-600)' }}>
                                {formatIDR(item.totalCombinedNetProfit)}
                              </td>
                            )}
                            {showProfitMetrics && (
                              <td style={{ ...styles.td, textAlign: 'center' }}>
                                <span style={{
                                  ...styles.marginBadge,
                                  backgroundColor: item.combinedMargin >= 40 ? 'var(--green-50)' : 'var(--amber-50)',
                                  color: item.combinedMargin >= 40 ? 'var(--green-600)' : 'var(--amber-600)'
                                }}>
                                  {item.combinedMargin.toFixed(1)}%
                                </span>
                              </td>
                            )}
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              {hasToppings ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedMenuForToppingDetail(item)}
                                  style={styles.detailToppingBtn}
                                  title="Lihat rincian lengkap penjualan topping pada menu ini"
                                >
                                  <Eye size={13} />
                                  <span>Detail</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* TAMPILAN 2: LIST PRODUK STANDAR (Semua / Menu / Topping Terpisah) */
            <div style={styles.tableCard}>
              <div style={styles.tableCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="var(--blue-600)" />
                  <h3 style={styles.cardHeaderTitle}>
                    {salesItemTypeFilter === 'MENU' ? 'Daftar Penjualan Menu Utama' : salesItemTypeFilter === 'TOPPING' ? 'Daftar Penjualan Extra Topping' : 'Daftar Penjualan Seluruh Item'}
                  </h3>
                </div>
                <Badge variant="primary">
                  {filteredProductPerformanceList.length} Item Terdaftar
                </Badge>
              </div>

              {filteredProductPerformanceList.length === 0 ? (
                <EmptyState
                  title="Tidak ada data penjualan produk"
                  description="Belum ada produk atau extra topping yang terjual pada rentang waktu yang dipilih."
                  icon={ShoppingBag}
                />
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={{ ...styles.th, width: '40px' }}>#</th>
                        <th style={styles.th}>Nama Item & Tipe</th>
                        <th style={styles.th}>Kategori</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Terjual</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Harga Satuan</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Total Omset</th>
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi HPP</th>}
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'right' }}>Laba Bersih</th>}
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'center' }}>Margin</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProductPerformanceList.map((item, index) => (
                        <tr key={`${item.type}-${item.id}`} style={styles.tableRow}>
                          <td style={{ ...styles.td, color: 'var(--neutral-400)', fontWeight: 500 }}>
                            {index + 1}
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                ...styles.typeBadge,
                                backgroundColor: item.type === 'TOPPING' ? 'var(--orange-50)' : 'var(--blue-50)',
                                color: item.type === 'TOPPING' ? 'var(--orange-600)' : 'var(--blue-600)'
                              }}>
                                {item.type === 'TOPPING' ? <Sparkles size={13} /> : <Cookie size={13} />}
                              </div>
                              <div>
                                <div style={styles.productName}>{item.name}</div>
                                <div style={styles.productTypeSub}>
                                  {item.type === 'TOPPING' ? 'Extra Topping' : 'Menu Utama'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.categoryBadge}>{item.categoryName}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center', fontWeight: 700 }}>
                            <span style={styles.qtyPill}>{item.qtySold}x</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            {formatIDR(item.basePrice)}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: 'var(--neutral-900)' }}>
                            {formatIDR(item.grossRevenue)}
                          </td>
                          {showProfitMetrics && (
                            <td style={{ ...styles.td, textAlign: 'right', color: 'var(--neutral-600)' }}>
                              {formatIDR(item.totalHpp)}
                            </td>
                          )}
                          {showProfitMetrics && (
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: item.netProfit >= 0 ? 'var(--green-600)' : 'var(--red-600)' }}>
                              {formatIDR(item.netProfit)}
                            </td>
                          )}
                          {showProfitMetrics && (
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              <span style={{
                                ...styles.marginBadge,
                                backgroundColor: item.margin >= 40 ? 'var(--green-50)' : 'var(--amber-50)',
                                color: item.margin >= 40 ? 'var(--green-600)' : 'var(--amber-600)'
                              }}>
                                {item.margin.toFixed(1)}%
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : selectedOrder ? (
        /* =========================================================================
           SUB-VIEW: DETAIL TRANSAKSI & AKSI TERPUSAT
           ========================================================================= */
        <TransactionDetailPage
          order={selectedOrder}
          onBack={() => setSelectedOrderDetailId(null)}
          onOpenReceipt={openReceiptModal}
          onOpenRevision={openOrderRevisionModal}
          onOpenReturn={openOrderReturnModal}
          onOpenCancel={openOrderCancelModal}
          onOpenPhoto={openPhotoPreviewModal}
          isSuperAdmin={isSuperAdmin}
          formatIDR={formatIDR}
          formatDate={formatDate}
        />
      ) : (
        /* =========================================================================
           SUB-MENU 2: RIWAYAT TRANSAKSI PENJUALAN
           ========================================================================= */
        <div className="reports-section-box animate-fade-in" style={styles.sectionBox}>
          {/* Section 2 Header */}
          <div className="reports-section-box-header" style={styles.sectionBoxHeader}>
            <div style={styles.sectionHeaderLeft}>
              <div style={{ ...styles.sectionIconBadge, backgroundColor: '#eff6ff', color: 'var(--blue-600)' }}>
                <Receipt size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={styles.sectionMainTitle}>Riwayat Transaksi Penjualan</h2>
                  <span style={{ ...styles.sectionCounterBadge, backgroundColor: '#eff6ff', color: 'var(--blue-600)' }}>
                    {filteredTransactionOrders.length} Transaksi
                  </span>
                </div>
                <p style={styles.sectionSubtitle}>
                  Daftar lengkap seluruh transaksi kasir, nomor invoice, kasir yang bertugas, dan status pembayaran
                </p>
              </div>
            </div>

            {/* Section 2 Controls: Search & Payment Filter & Export Buttons */}
            <div className="reports-section-controls" style={styles.sectionHeaderRight}>
              {/* Search Input for Transactions */}
              <div className="reports-search-wrapper" style={{ ...styles.searchWrapper, width: '250px' }}>
                <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Cari invoice, kasir, pelanggan..."
                  value={transactionSearchTerm}
                  onChange={(e) => setTransactionSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                {transactionSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setTransactionSearchTerm('')}
                    style={styles.clearSearchBtn}
                    title="Hapus kata kunci pencarian"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Payment Method Select Filter */}
              <div style={{ minWidth: '180px' }}>
                <SearchSelect
                  options={[
                    { value: 'ALL', label: 'Semua Pembayaran' },
                    { value: 'cash', label: 'Tunai (Cash)' },
                    { value: 'qris', label: 'QRIS' },
                    { value: 'card', label: 'Kartu Debit/Kredit' }
                  ]}
                  value={salesPaymentFilter}
                  onChange={(val) => setSalesPaymentFilter(val)}
                  placeholder="Semua Pembayaran"
                  searchPlaceholder="Cari pembayaran..."
                  icon={Filter}
                  clearable={false}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2 Table: Riwayat Transaksi Kasir */}
          <div className="transaction-table-card" style={styles.tableCard}>
            {filteredTransactionOrders.length === 0 ? (
              <EmptyState
                title="Tidak ada riwayat transaksi"
                description="Belum ada transaksi kasir pada periode waktu atau filter yang dipilih."
                icon={Receipt}
              />
            ) : (
              <>
                {/* 1. Desktop Table View (Hidden on mobile screens <= 1024px) */}
                <div className="transaction-desktop-table" style={styles.tableResponsive}>
                  <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>No. Invoice & Waktu</th>
                      <th style={styles.th}>Kasir</th>
                      <th style={styles.th}>Pelanggan & Meja</th>
                      <th style={styles.th}>Rincian Menu & Topping</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Total Bayar & Metode</th>
                      {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi Laba</th>}
                      <th style={{ ...styles.th, textAlign: 'center', width: '90px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactionOrders.map((order) => {
                      const isReturned = order.status === 'returned';
                      const isCancelled = order.status === 'cancelled';
                      return (
                        <tr key={order.id} style={{ ...styles.tableRow, backgroundColor: isCancelled ? '#fff1f2' : isReturned ? '#fff5f5' : undefined }}>
                          {/* 1. No. Invoice & Waktu */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span 
                                  style={{ ...styles.invoiceBadge, cursor: 'pointer' }}
                                  onClick={() => setSelectedOrderDetailId(order.id)}
                                  title="Klik untuk membuka detail & aksi transaksi"
                                >
                                  {order.invoiceNumber}
                                </span>
                                {isCancelled && (
                                  <span style={{
                                    fontSize: '0.656rem',
                                    fontWeight: 800,
                                    color: '#991b1b',
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #f87171',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    width: 'fit-content'
                                  }}>
                                    <Ban size={10} /> DIBATALKAN
                                  </span>
                                )}
                                {isReturned && (
                                  <span style={{
                                    fontSize: '0.656rem',
                                    fontWeight: 800,
                                    color: '#b91c1c',
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    width: 'fit-content'
                                  }}>
                                    <RotateCcw size={10} /> DIRETUR
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11.5px', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} color="var(--neutral-400)" />
                                <span>{formatDate(order.date)}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Kasir */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                backgroundColor: '#eff6ff',
                                color: 'var(--blue-600)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <User size={13} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                                  {order.cashierName || 'Kasir'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>
                                  Petugas Kasir
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Pelanggan & Meja */}
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{order.customerName || 'Pelanggan Umum'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--neutral-500)', marginTop: '2px' }}>{order.tableNumber || 'Takeaway'}</div>
                          </td>

                          {/* 4. Rincian Menu & Topping */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
                              {(order.items || []).map((it, idx) => (
                                <div key={idx} style={{ fontSize: '13px', lineHeight: 1.3 }}>
                                  <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>
                                     {it.quantity}x {it.name}
                                  </span>
                                  {it.toppings && it.toppings.length > 0 && (
                                    <span style={{ fontSize: '11px', color: 'var(--orange-600)', marginLeft: '4px' }}>
                                      (+{it.toppings.map(t => `${t.name}${it.quantity > 1 ? ` [${it.quantity}x]` : ''}`).join(', ')})
                                    </span>
                                  )}
                                </div>
                              ))}
                              {isCancelled && order.cancelReason && (
                                <div style={{ fontSize: '0.688rem', color: '#991b1b', fontWeight: 600, marginTop: '2px', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                                  Alasan Batal: {order.cancelReason} {order.cancelNote ? `("${order.cancelNote}")` : ''} {order.cancelBy ? `• Oleh: ${order.cancelBy}` : ''}
                                </div>
                              )}
                              {isReturned && order.returnReason && (
                                <div style={{ fontSize: '0.688rem', color: '#dc2626', fontWeight: 600, marginTop: '2px', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                                  Alasan: {order.returnReason} {order.returnNote ? `("${order.returnNote}")` : ''}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Total Bayar dan Metode */}
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: (isReturned || isCancelled) ? '#9ca3af' : 'var(--neutral-900)' }}>
                            <div style={{ textDecoration: (isReturned || isCancelled) ? 'line-through' : 'none', fontSize: '13px' }}>
                              {formatIDR(order.grossRevenue)}
                            </div>
                            {order.discount > 0 && (
                              <div style={{ fontSize: '11px', color: 'var(--red-500)', fontWeight: 400 }}>
                                Diskon: -{formatIDR(order.discount)}
                              </div>
                            )}
                            <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                              <span style={{
                                ...styles.paymentBadge,
                                backgroundColor: order.paymentMethod === 'cash' ? 'var(--green-50)' : order.paymentMethod === 'qris' ? 'var(--blue-50)' : 'var(--purple-50, #f3e8ff)',
                                color: order.paymentMethod === 'cash' ? 'var(--green-600)' : order.paymentMethod === 'qris' ? 'var(--blue-600)' : '#7e22ce',
                                fontSize: '10px',
                                padding: '2px 6px',
                                fontWeight: 700
                              }}>
                                {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}
                              </span>
                            </div>
                          </td>

                          {/* 6. Estimasi Laba */}
                          {showProfitMetrics && (
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: (isReturned || isCancelled) ? '#9ca3af' : 'var(--green-600)', fontSize: '13px' }}>
                                {(isReturned || isCancelled) ? 'Rp 0' : formatIDR(order.netProfit)}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                                HPP: {formatIDR(order.orderTotalHPP)} {isCancelled ? '(Dibatalkan)' : isReturned ? '(Terpakai)' : ''}
                              </div>
                            </td>
                          )}

                          {/* 7. Aksi: Buka Halaman Detail Terpusat */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetailId(order.id)}
                              style={{
                                ...styles.actionBtn,
                                color: 'var(--blue-700)',
                                borderColor: 'var(--blue-200)',
                                backgroundColor: 'var(--blue-50)',
                                fontWeight: 600,
                                padding: '6px 12px',
                                gap: '6px'
                              }}
                              title="Buka Halaman Detail & Aksi Transaksi"
                            >
                              <Eye size={13} />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. Mobile Cards View (Shown on mobile screens <= 1024px) */}
              <div className="transaction-mobile-cards">
                {filteredTransactionOrders.map((order) => {
                  const isReturned = order.status === 'returned';
                  const isCancelled = order.status === 'cancelled';
                  const borderLeftColor = isCancelled ? '#ef4444' : isReturned ? '#f97316' : 'var(--blue-600)';

                  return (
                    <div
                      key={`mob-${order.id}`}
                      className="transaction-mobile-card"
                      style={{
                        ...styles.transactionMobileCard,
                        borderLeft: `4px solid ${borderLeftColor}`
                      }}
                    >
                      {/* 1. Header Row: Invoice Badge & Status, Date on Right */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span 
                            style={{ ...styles.invoiceBadge, cursor: 'pointer' }}
                            onClick={() => setSelectedOrderDetailId(order.id)}
                            title="Klik untuk membuka detail & aksi transaksi"
                          >
                            {order.invoiceNumber}
                          </span>
                          {isCancelled && (
                            <span style={{
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
                            }}>
                              <Ban size={10} /> DIBATALKAN
                            </span>
                          )}
                          {isReturned && (
                            <span style={{
                              fontSize: '0.656rem',
                              fontWeight: 800,
                              color: '#b91c1c',
                              backgroundColor: '#fee2e2',
                              border: '1px solid #fecaca',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <RotateCcw size={10} /> DIRETUR
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--neutral-400)" />
                          <span>{formatDate(order.date)}</span>
                        </div>
                      </div>

                      {/* 2. Pelanggan & Meja & Kasir Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        padding: '8px 10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.813rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                            {order.customerName || 'Pelanggan Umum'}
                          </span>
                          <span style={{
                            fontSize: '0.688rem',
                            color: 'var(--neutral-600)',
                            backgroundColor: '#e2e8f0',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            {order.tableNumber || 'Takeaway'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                          <User size={12} color="var(--neutral-400)" />
                          <span>Kasir: <strong>{order.cashierName || 'Kasir'}</strong></span>
                        </div>
                      </div>

                      {/* 3. Rincian Item Menu & Toppings */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '8px 10px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px dashed #cbd5e1'
                      }}>
                        {(order.items || []).map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.813rem' }}>
                            <div>
                              <span style={{ fontWeight: 700, color: 'var(--neutral-800)' }}>
                                {it.quantity}x {it.name}
                              </span>
                              {it.toppings && it.toppings.length > 0 && (
                                <div style={{ fontSize: '0.719rem', color: 'var(--orange-600)', marginTop: '1px' }}>
                                  (+{it.toppings.map(t => `${t.name}${it.quantity > 1 ? ` [${it.quantity}x]` : ''}`).join(', ')})
                                </div>
                              )}
                            </div>
                            <span style={{ fontSize: '0.781rem', fontWeight: 600, color: 'var(--neutral-600)' }}>
                              {formatIDR((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1))}
                            </span>
                          </div>
                        ))}

                        {isCancelled && order.cancelReason && (
                          <div style={{ fontSize: '0.688rem', color: '#991b1b', fontWeight: 600, marginTop: '2px', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                            Alasan Batal: {order.cancelReason} {order.cancelNote ? `("${order.cancelNote}")` : ''} {order.cancelBy ? `• Oleh: ${order.cancelBy}` : ''}
                          </div>
                        )}
                        {isReturned && order.returnReason && (
                          <div style={{ fontSize: '0.688rem', color: '#dc2626', fontWeight: 600, marginTop: '2px', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}>
                            Alasan: {order.returnReason} {order.returnNote ? `("${order.returnNote}")` : ''}
                          </div>
                        )}
                      </div>

                      {/* 4. Financial Row: Total Bayar + Metode & Estimasi Laba */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        paddingTop: '2px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            ...styles.paymentBadge,
                            backgroundColor: order.paymentMethod === 'cash' ? 'var(--green-50)' : order.paymentMethod === 'qris' ? 'var(--blue-50)' : 'var(--purple-50, #f3e8ff)',
                            color: order.paymentMethod === 'cash' ? 'var(--green-600)' : order.paymentMethod === 'qris' ? 'var(--blue-600)' : '#7e22ce',
                            fontSize: '10px',
                            padding: '2px 7px',
                            fontWeight: 700
                          }}>
                            {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}
                          </span>
                          {order.discount > 0 && (
                            <span style={{ fontSize: '0.688rem', color: 'var(--red-500)', fontWeight: 600 }}>
                              Disc: -{formatIDR(order.discount)}
                            </span>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '0.938rem',
                            fontWeight: 800,
                            color: (isReturned || isCancelled) ? '#9ca3af' : 'var(--blue-700)',
                            textDecoration: (isReturned || isCancelled) ? 'line-through' : 'none'
                          }}>
                            {formatIDR(order.grossRevenue)}
                          </div>
                          {showProfitMetrics && (
                            <div style={{ fontSize: '0.688rem', color: (isReturned || isCancelled) ? '#9ca3af' : 'var(--green-600)', fontWeight: 600 }}>
                              Laba: {(isReturned || isCancelled) ? 'Rp 0' : formatIDR(order.netProfit)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 5. Actions Footer */}
                      <div className="transaction-mobile-card-actions" style={{ paddingTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetailId(order.id)}
                          className="transaction-mobile-action-btn"
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            backgroundColor: 'var(--blue-50)',
                            borderColor: 'var(--blue-200)',
                            color: 'var(--blue-700)',
                            fontWeight: 700,
                            padding: '9px 14px',
                            borderRadius: '8px',
                            gap: '8px'
                          }}
                        >
                          <Eye size={16} />
                          <span>Lihat Detail & Aksi Transaksi</span>
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
      )}

      {/* 4. MODAL DETAIL TOPPING PADA MENU */}
      {selectedMenuForToppingDetail && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMenuForToppingDetail(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cookie size={20} color="var(--blue-600)" />
                  <h3 style={styles.modalTitle}>{selectedMenuForToppingDetail.name}</h3>
                  <Badge variant="primary">{selectedMenuForToppingDetail.categoryName}</Badge>
                </div>
                <p style={styles.modalSubtitle}>
                  Rincian penjualan extra topping yang dipesan khusus bersama menu ini ({selectedMenuForToppingDetail.qtySold} porsi terjual).
                </p>
              </div>
              <button
                type="button"
                style={styles.closeBtn}
                onClick={() => setSelectedMenuForToppingDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Summary Grid */}
            <div style={styles.modalBody}>
              <div style={styles.modalKpiRow}>
                <div style={styles.modalKpiBox}>
                  <div style={styles.modalKpiLabel}>Omset Dasar Menu</div>
                  <div style={{ ...styles.modalKpiVal, color: 'var(--neutral-900)' }}>
                    {formatIDR(selectedMenuForToppingDetail.menuGrossRevenue)}
                  </div>
                  <div style={styles.modalKpiSub}>{selectedMenuForToppingDetail.qtySold} Porsi @ {formatIDR(selectedMenuForToppingDetail.basePrice)}</div>
                </div>

                <div style={styles.modalKpiBox}>
                  <div style={styles.modalKpiLabel}>Omset Extra Topping</div>
                  <div style={{ ...styles.modalKpiVal, color: '#ea580c' }}>
                    {formatIDR(selectedMenuForToppingDetail.totalToppingRevenue)}
                  </div>
                  <div style={styles.modalKpiSub}>{selectedMenuForToppingDetail.totalToppingQty} Extra Topping Dipesan</div>
                </div>

                <div style={{ ...styles.modalKpiBox, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div style={{ ...styles.modalKpiLabel, color: 'var(--blue-700)' }}>Total Omset Gabungan</div>
                  <div style={{ ...styles.modalKpiVal, color: 'var(--blue-600)' }}>
                    {formatIDR(selectedMenuForToppingDetail.totalCombinedRevenue)}
                  </div>
                  <div style={styles.modalKpiSub}>Menu + Extra Topping</div>
                </div>

                {showProfitMetrics && (
                  <div style={{ ...styles.modalKpiBox, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <div style={{ ...styles.modalKpiLabel, color: 'var(--green-700)' }}>Laba Bersih & Margin</div>
                    <div style={{ ...styles.modalKpiVal, color: 'var(--green-600)' }}>
                      {formatIDR(selectedMenuForToppingDetail.totalCombinedNetProfit)}
                    </div>
                    <div style={styles.modalKpiSub}>Margin: {selectedMenuForToppingDetail.combinedMargin.toFixed(1)}%</div>
                  </div>
                )}
              </div>

              {/* Toppings Detail Table */}
              <div style={{ marginTop: '16px' }}>
                <h4 style={styles.sectionHeaderTitle}>Daftar Topping Terpasang:</h4>
                <div style={{ ...styles.tableCard, marginTop: '8px' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={{ ...styles.th, width: '35px' }}>#</th>
                        <th style={styles.th}>Nama Topping</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Qty Dipesan</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Harga Satuan</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Total Omset</th>
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi HPP</th>}
                        {showProfitMetrics && <th style={{ ...styles.th, textAlign: 'right' }}>Laba Bersih</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMenuForToppingDetail.toppingsList.map((top, idx) => (
                        <tr key={top.id} style={styles.tableRow}>
                          <td style={{ ...styles.td, color: 'var(--neutral-400)' }}>{idx + 1}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Sparkles size={14} color="#ea580c" />
                              <span style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{top.name}</span>
                            </div>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center', fontWeight: 700 }}>
                            <span style={{ ...styles.qtyPill, backgroundColor: '#fff7ed', color: '#ea580c' }}>
                              {top.qtySold}x
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', color: 'var(--neutral-600)' }}>
                            {formatIDR(top.price)}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: 'var(--neutral-900)' }}>
                            {formatIDR(top.grossRevenue)}
                          </td>
                          {showProfitMetrics && (
                            <td style={{ ...styles.td, textAlign: 'right', color: 'var(--neutral-600)' }}>
                              {formatIDR(top.totalHpp)}
                            </td>
                          )}
                          {showProfitMetrics && (
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--green-600)' }}>
                              {formatIDR(top.netProfit)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedMenuForToppingDetail(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

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
          .transaction-mobile-card {
            background-color: #ffffff !important;
            border: 1px solid var(--border-color) !important;
            border-radius: 12px !important;
            padding: 14px 16px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            box-sizing: border-box !important;
          }
          .transaction-mobile-card-actions {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding-top: 10px !important;
            border-top: 1px dashed var(--border-color) !important;
            width: 100% !important;
          }
          .transaction-mobile-action-btn {
            flex: 1 !important;
            display: inline-flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            padding: 8px 4px !important;
            font-size: 0.719rem !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            border: 1px solid var(--border-color) !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
            background-color: var(--neutral-50) !important;
            color: var(--neutral-700) !important;
          }
          .transaction-mobile-action-btn svg {
            margin-bottom: 1px !important;
          }

          .sales-report-tab {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .reports-kpi-grid,
          .menu-topping-insights-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .reports-section-box-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .reports-section-controls {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .reports-search-wrapper,
          .reports-pill-group,
          .reports-select-wrapper {
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
    gap: '20px',
    width: '100%'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
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
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  kpiIconWrapper: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em'
  },
  kpiMeta: {
    fontSize: '12px',
    color: 'var(--neutral-500)'
  },
  metaHighlight: {
    color: 'var(--blue-600)',
    fontWeight: 600
  },
  badgeGreen: {
    backgroundColor: 'var(--green-50)',
    color: 'var(--green-600)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 700
  },

  // Section Box Card Container (Separated Sub-Menu Cards)
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
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    border: '1px solid #fed7aa'
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

  // Insights Panel Styles
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px'
  },
  insightCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  insightHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  insightTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  insightIconWrap: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  insightValue: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    lineHeight: 1.3
  },
  insightFooter: {
    fontSize: '11px',
    color: 'var(--neutral-500)'
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
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
    padding: '0 10px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF'
  },
  filterSelect: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    height: '100%',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--neutral-700)'
  },

  // Tables
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
  transactionMobileCard: {
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
  tableCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc'
  },
  cardHeaderTitle: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
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
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-fast)'
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },
  typeBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  productName: {
    fontWeight: 700,
    color: 'var(--neutral-900)',
    fontSize: '13.5px'
  },
  productTypeSub: {
    fontSize: '11px',
    color: 'var(--neutral-500)'
  },
  categoryBadge: {
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500
  },
  toppingBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    color: '#9a3412',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500
  },
  qtyPill: {
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-600)',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700
  },
  marginBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700
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
  paymentBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700
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
    transition: 'var(--transition-fast)'
  },
  detailToppingBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: 'var(--blue-600)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },

  // Modal Detail Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px'
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 20px',
    borderBottom: '1px solid var(--border-color)'
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0
  },
  modalSubtitle: {
    fontSize: '12px',
    color: 'var(--neutral-500)',
    margin: '4px 0 0 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    padding: '4px'
  },
  modalBody: {
    padding: '20px'
  },
  modalKpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
    gap: '10px'
  },
  modalKpiBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px'
  },
  modalKpiLabel: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase'
  },
  modalKpiVal: {
    fontSize: '15px',
    fontWeight: 800,
    marginTop: '3px'
  },
  modalKpiSub: {
    fontSize: '10.5px',
    color: 'var(--neutral-500)',
    marginTop: '2px'
  },
  sectionHeaderTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--neutral-800)',
    margin: 0
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '14px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc'
  }
};
