import React, { useState } from 'react';
import { useReport } from '../../controllers/ReportController';
import { useOrder } from '../../controllers/OrderController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
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
  PieChart
} from 'lucide-react';

export const SalesReportTab = () => {
  const {
    salesSummary,
    productPerformanceList,
    menuSalesWithToppings,
    enrichedOrders,
    salesSearchTerm,
    setSalesSearchTerm,
    salesPaymentFilter,
    setSalesPaymentFilter,
    salesItemTypeFilter,
    setSalesItemTypeFilter,
    activeSalesSection: activeSection,
    setActiveSalesSection: setActiveSection
  } = useReport();

  const { openReceiptModal, openOrderReturnModal } = useOrder();
  const { openPhotoPreviewModal } = useRawMaterial();

  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
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

  const combinedList = menuSalesWithToppings?.list || [];
  const topMenu = menuSalesWithToppings?.topSellingMenu;
  const topTopping = menuSalesWithToppings?.topSellingTopping;
  const attachRate = menuSalesWithToppings?.toppingAttachRate || 0;
  const totalToppingRev = menuSalesWithToppings?.totalToppingRevenue || 0;
  const toppingShare = menuSalesWithToppings?.toppingRevenueShare || 0;

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

        {/* Total Estimasi HPP */}
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

        {/* Total Laba Bersih */}
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

      {/* 2. SECTION TOGGLE (Performa Produk & Topping vs Riwayat Transaksi) */}
      <div className="reports-section-toggle-card" style={styles.sectionToggleCard}>
        <div className="reports-section-tabs" style={styles.sectionTabs}>
          <button
            className={`reports-section-tab-btn ${activeSection === 'products' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('products')}
            style={{
              ...styles.sectionTabBtn,
              ...(activeSection === 'products' ? styles.sectionTabBtnActive : {})
            }}
          >
            <Cookie size={16} />
            <span>Summary Penjualan Menu & Topping ({combinedList.length} Menu)</span>
          </button>
          <button
            className={`reports-section-tab-btn ${activeSection === 'transactions' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('transactions')}
            style={{
              ...styles.sectionTabBtn,
              ...(activeSection === 'transactions' ? styles.sectionTabBtnActive : {})
            }}
          >
            <Receipt size={16} />
            <span>Riwayat Transaksi Penjualan ({enrichedOrders.length})</span>
          </button>
        </div>

        {/* Controls / Filter Bar */}
        <div className="reports-filter-controls" style={styles.filterControls}>
          {/* Search Input */}
          <div className="reports-search-wrapper" style={styles.searchWrapper}>
            <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
            <input
              type="text"
              placeholder={activeSection === 'products' ? "Cari menu / topping..." : "Cari no invoice, pelanggan..."}
              value={salesSearchTerm}
              onChange={(e) => setSalesSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Contextual Filter */}
          {activeSection === 'products' ? (
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
                className={`reports-pill-btn ${salesItemTypeFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setSalesItemTypeFilter('ALL')}
                style={{
                  ...styles.pillBtn,
                  ...(salesItemTypeFilter === 'ALL' ? styles.pillBtnActive : {})
                }}
                title="Daftar seluruh menu dan topping secara terpisah"
              >
                Semua Item Terpisah
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
          ) : (
            <div className="reports-select-wrapper" style={styles.selectWrapper}>
              <Filter size={14} color="var(--neutral-500)" />
              <select
                value={salesPaymentFilter}
                onChange={(e) => setSalesPaymentFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="ALL">Semua Pembayaran</option>
                <option value="cash">Tunai (Cash)</option>
                <option value="qris">QRIS</option>
                <option value="card">Kartu Debit/Kredit</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. MENU & TOPPING INSIGHTS BANNER (Hanya di tab Performa Produk) */}
      {activeSection === 'products' && (
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
      )}

      {/* 4. CONTENT VIEW BASED ON ACTIVE SECTION */}
      {activeSection === 'products' ? (
        salesItemTypeFilter === 'COMBINED' ? (
          /* TAMPILAN 1: RINGKASAN MENU & TOPPING (KOMBINASI BERIKUT TOPPING) */
          <div style={styles.tableCard}>
            <div style={styles.tableCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cookie size={18} color="var(--blue-600)" />
                <h3 style={styles.cardHeaderTitle}>Ringkasan Penjualan Menu & Rincian Topping Terpasang</h3>
              </div>
              <Badge variant="primary">
                {combinedList.length} Menu Terjual
              </Badge>
            </div>

            {combinedList.length === 0 ? (
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
                      <th style={{ ...styles.th, textAlign: 'right' }}>Laba Bersih</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Margin</th>
                      <th style={{ ...styles.th, textAlign: 'center', width: '85px' }}>Rincian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedList.map((item, index) => {
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
                                <span style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>HPP: {formatIDR(item.unitHpp)}/porsi</span>
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
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: item.totalCombinedNetProfit >= 0 ? 'var(--green-600)' : 'var(--red-600)' }}>
                            {formatIDR(item.totalCombinedNetProfit)}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={{
                              ...styles.marginBadge,
                              backgroundColor: item.combinedMargin >= 40 ? 'var(--green-50)' : 'var(--amber-50)',
                              color: item.combinedMargin >= 40 ? 'var(--green-600)' : 'var(--amber-600)'
                            }}>
                              {item.combinedMargin.toFixed(1)}%
                            </span>
                          </td>
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
            {productPerformanceList.length === 0 ? (
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
                      <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi HPP</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Laba Bersih</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPerformanceList.map((item, index) => (
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
                        <td style={{ ...styles.td, textAlign: 'right', color: 'var(--neutral-600)' }}>
                          {formatIDR(item.totalHpp)}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: item.netProfit >= 0 ? 'var(--green-600)' : 'var(--red-600)' }}>
                          {formatIDR(item.netProfit)}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={{
                            ...styles.marginBadge,
                            backgroundColor: item.margin >= 40 ? 'var(--green-50)' : 'var(--amber-50)',
                            color: item.margin >= 40 ? 'var(--green-600)' : 'var(--amber-600)'
                          }}>
                            {item.margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      ) : (
        /* TABLE: RIWAYAT TRANSAKSI PENJUALAN */
        <div style={styles.tableCard}>
          {enrichedOrders.length === 0 ? (
            <EmptyState
              title="Tidak ada riwayat transaksi"
              description="Belum ada transaksi kasir pada periode waktu atau filter yang dipilih."
              icon={Receipt}
            />
          ) : (
            <div style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>No. Invoice</th>
                    <th style={styles.th}>Waktu</th>
                    <th style={styles.th}>Pelanggan & Meja</th>
                    <th style={styles.th}>Rincian Menu & Topping</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Metode</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Total Bayar</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi Laba</th>
                    <th style={{ ...styles.th, textAlign: 'center', width: '90px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedOrders.map((order) => {
                    const isReturned = order.status === 'returned';
                    return (
                      <tr key={order.id} style={{ ...styles.tableRow, backgroundColor: isReturned ? '#fff5f5' : undefined }}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={styles.invoiceBadge}>{order.invoiceNumber}</span>
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
                        </td>
                        <td style={{ ...styles.td, fontSize: '13px', color: 'var(--neutral-600)' }}>
                          {formatDate(order.date)}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{order.customerName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>{order.tableNumber}</div>
                        </td>
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
                            {isReturned && order.returnReason && (
                              <div style={{ fontSize: '0.688rem', color: '#dc2626', fontWeight: 600, marginTop: '2px', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                                Alasan: {order.returnReason} {order.returnNote ? `("${order.returnNote}")` : ''}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={{
                            ...styles.paymentBadge,
                            backgroundColor: order.paymentMethod === 'cash' ? 'var(--green-50)' : order.paymentMethod === 'qris' ? 'var(--blue-50)' : 'var(--purple-50, #f3e8ff)',
                            color: order.paymentMethod === 'cash' ? 'var(--green-600)' : order.paymentMethod === 'qris' ? 'var(--blue-600)' : '#7e22ce'
                          }}>
                            {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: isReturned ? '#9ca3af' : 'var(--neutral-900)' }}>
                          <span style={{ textDecoration: isReturned ? 'line-through' : 'none' }}>
                            {formatIDR(order.grossRevenue)}
                          </span>
                          {order.discount > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--red-500)', fontWeight: 400 }}>
                              Diskon: -{formatIDR(order.discount)}
                            </div>
                          )}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: isReturned ? '#9ca3af' : 'var(--green-600)' }}>
                            {isReturned ? 'Rp 0' : formatIDR(order.netProfit)}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                            HPP: {formatIDR(order.orderTotalHPP)} {isReturned && '(Terpakai)'}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {order.returnPhoto && (
                              <button
                                onClick={() => openPhotoPreviewModal(order.returnPhoto, `Bukti Retur: #${order.invoiceNumber}`, {
                                  orderInvoice: order.invoiceNumber,
                                  reason: order.returnReason,
                                  note: order.returnNote,
                                  user: order.returnBy,
                                  createdAt: formatDate(order.returnedAt || order.date)
                                })}
                                style={{
                                  ...styles.actionBtn,
                                  color: '#dc2626',
                                  borderColor: '#fca5a5',
                                  backgroundColor: '#fef2f2'
                                }}
                                title="Lihat Bukti Foto Retur"
                              >
                                <Camera size={13} />
                                <span>Foto</span>
                              </button>
                            )}

                            {!isReturned && (
                              <button
                                onClick={() => openOrderReturnModal(order)}
                                style={{
                                  ...styles.actionBtn,
                                  color: '#b91c1c',
                                  borderColor: '#fecdd3',
                                  backgroundColor: '#fff1f2'
                                }}
                                title="Catat Retur / Gagal Pembuatan"
                              >
                                <RotateCcw size={13} />
                                <span>Retur</span>
                              </button>
                            )}

                            <button
                              onClick={() => openReceiptModal(order)}
                              style={styles.actionBtn}
                              title="Lihat & Cetak Struk"
                            >
                              <Receipt size={14} />
                              <span>Struk</span>
                            </button>
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
      )}

      {/* 5. MODAL DETAIL TOPPING PADA MENU */}
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

                <div style={{ ...styles.modalKpiBox, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div style={{ ...styles.modalKpiLabel, color: 'var(--green-700)' }}>Laba Bersih & Margin</div>
                  <div style={{ ...styles.modalKpiVal, color: 'var(--green-600)' }}>
                    {formatIDR(selectedMenuForToppingDetail.totalCombinedNetProfit)}
                  </div>
                  <div style={styles.modalKpiSub}>Margin: {selectedMenuForToppingDetail.combinedMargin.toFixed(1)}%</div>
                </div>
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
                        <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi HPP</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Laba Bersih</th>
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
                          <td style={{ ...styles.td, textAlign: 'right', color: 'var(--neutral-600)' }}>
                            {formatIDR(top.totalHpp)}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--green-600)' }}>
                            {formatIDR(top.netProfit)}
                          </td>
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
        @media (max-width: 1024px) {
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
          .reports-section-toggle-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 14px !important;
            gap: 12px !important;
          }
          .reports-section-tabs {
            width: 100% !important;
          }
          .reports-section-tab-btn {
            flex: 1 !important;
            text-align: center !important;
            justify-content: center !important;
            padding: 10px !important;
            font-size: 0.813rem !important;
          }
          .reports-filter-controls {
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

  // Insights Panel Styles
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px'
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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

  // Section Toggle & Controls
  sectionToggleCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionTabs: {
    display: 'flex',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '8px',
    padding: '3px'
  },
  sectionTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--neutral-600)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  sectionTabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: 'var(--blue-600)',
    boxShadow: 'var(--shadow-sm)'
  },
  filterControls: {
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
    padding: '8px 10px 8px 32px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#FFFFFF'
  },
  pillGroup: {
    display: 'flex',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '8px',
    padding: '3px',
    gap: '2px'
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
    backgroundColor: '#f8fafc'
  },
  cardHeaderTitle: {
    fontSize: '14px',
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
