import React, { useState, useMemo } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useRawMaterial } from '../../controllers/RawMaterialController';
import { useAuth } from '../../controllers/AuthController';
import { useUnit } from '../../controllers/UnitController';
import { ORDER_RETURN_REASONS, MATERIAL_WASTE_REASONS } from '../../models/RawMaterialModel';
import { EmptyState } from '../components/EmptyState';
import { 
  RotateCcw, 
  Trash2, 
  AlertOctagon, 
  AlertTriangle, 
  Search, 
  Calendar, 
  Filter, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  Sparkles, 
  Plus, 
  ZoomIn, 
  TrendingDown, 
  Layers, 
  Flame, 
  ShieldAlert,
  ArrowUpRight,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const ReturnsManagementView = () => {
  const { orders = [], openOrderReturnModal } = useOrder();
  const { 
    stockLogs = [], 
    rawMaterials = [], 
    openWasteModal 
  } = useRawMaterial();
  const { currentUser, hasPermission } = useAuth();
  const { showToast } = useUnit();

  // Active Tab: 'orders' | 'materials' | 'audit'
  const [activeTab, setActiveTab] = useState('orders');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [reasonFilter, setReasonFilter] = useState('ALL');

  // Format IDR Helper
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Format Date Helper
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
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  // Helper date filter matcher
  const matchesDateFilter = (isoString) => {
    if (dateFilter === 'ALL' || !isoString) return true;
    const itemDate = new Date(isoString);
    const now = new Date();

    if (dateFilter === 'TODAY') {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === 'WEEK') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return itemDate >= weekAgo;
    }

    if (dateFilter === 'MONTH') {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  };

  // 1. Raw Data Extraction
  const returnedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'returned');
  }, [orders]);

  const wasteLogs = useMemo(() => {
    return stockLogs.filter(l => l.type === 'WASTE');
  }, [stockLogs]);

  const orderReturnLogs = useMemo(() => {
    return stockLogs.filter(l => l.type === 'RETURN_ORDER');
  }, [stockLogs]);

  // 2. Calculations for Stat Cards
  const stats = useMemo(() => {
    const totalReturnedCount = returnedOrders.length;
    const totalCancelledSales = returnedOrders.reduce((sum, o) => sum + (o.grossRevenue || 0), 0);
    const totalWastedHPP = returnedOrders.reduce((sum, o) => sum + (o.orderTotalHPP || 0), 0);

    const totalWasteLogsCount = wasteLogs.length;
    
    // Calculate raw material waste loss (qty * pricePerUnit)
    const totalMaterialWasteCost = wasteLogs.reduce((sum, log) => {
      const mat = rawMaterials.find(m => m.id === log.rawMaterialId || m.name === log.rawMaterialName);
      const unitPrice = mat ? (mat.pricePerUnit || 0) : 0;
      return sum + ((log.amount || 0) * unitPrice);
    }, 0);

    const totalAccumulatedLoss = totalWastedHPP + totalMaterialWasteCost;

    return {
      totalReturnedCount,
      totalCancelledSales,
      totalWastedHPP,
      totalWasteLogsCount,
      totalMaterialWasteCost,
      totalAccumulatedLoss
    };
  }, [returnedOrders, wasteLogs, rawMaterials]);

  // 3. Filtered Lists
  const filteredReturnedOrders = useMemo(() => {
    return returnedOrders.filter(o => {
      const matchesSearch = searchQuery === '' || 
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.returnReason && o.returnReason.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.returnNote && o.returnNote.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.returnBy && o.returnBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.items && o.items.some(it => it.name.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesReason = reasonFilter === 'ALL' || o.returnReason === reasonFilter;
      const matchesDate = matchesDateFilter(o.returnedAt || o.date);

      return matchesSearch && matchesReason && matchesDate;
    });
  }, [returnedOrders, searchQuery, reasonFilter, dateFilter]);

  const filteredWasteLogs = useMemo(() => {
    return wasteLogs.filter(log => {
      const matchesSearch = searchQuery === '' ||
        (log.rawMaterialName && log.rawMaterialName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.note && log.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.user && log.user.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesReason = reasonFilter === 'ALL' || log.reason === reasonFilter;
      const matchesDate = matchesDateFilter(log.createdAt);

      return matchesSearch && matchesReason && matchesDate;
    });
  }, [wasteLogs, searchQuery, reasonFilter, dateFilter]);

  // 4. Combined Audit Timeline
  const combinedAuditLogs = useMemo(() => {
    const list = [
      ...returnedOrders.map(o => ({
        id: `ret_order_${o.id}`,
        category: 'ORDER_RETURN',
        timestamp: o.returnedAt || o.date,
        title: `Retur Pesanan: #${o.invoiceNumber}`,
        subtitle: `${o.customerName || 'Pelanggan'} • ${(o.items || []).map(it => `${it.quantity}x ${it.name}`).join(', ')}`,
        reason: o.returnReason || 'Gagal Masak',
        note: o.returnNote,
        user: o.returnBy || 'Kasir',
        photo: o.returnPhoto,
        impactValue: o.orderTotalHPP || 0,
        originalData: o
      })),
      ...wasteLogs.map(w => {
        const mat = rawMaterials.find(m => m.id === w.rawMaterialId || m.name === w.rawMaterialName);
        const unitPrice = mat ? (mat.pricePerUnit || 0) : 0;
        const lossVal = (w.amount || 0) * unitPrice;

        return {
          id: `waste_log_${w.id}`,
          category: 'MATERIAL_WASTE',
          timestamp: w.createdAt,
          title: `Bahan Rusak: ${w.rawMaterialName}`,
          subtitle: `Pengurangan: ${w.amount} ${w.unit || 'satuan'} (${formatIDR(lossVal)})`,
          reason: w.reason || 'Bahan Rusak / Expired',
          note: w.note,
          user: w.user || 'Staf',
          photo: w.photo,
          impactValue: lossVal,
          originalData: w
        };
      })
    ];

    return list
      .filter(item => {
        const matchesSearch = searchQuery === '' ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.user.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesReason = reasonFilter === 'ALL' || item.reason === reasonFilter;
        const matchesDate = matchesDateFilter(item.timestamp);

        return matchesSearch && matchesReason && matchesDate;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [returnedOrders, wasteLogs, rawMaterials, searchQuery, reasonFilter, dateFilter]);

  return (
    <div className="returns-view-container" style={styles.container}>
      {/* 1. PAGE HEADER */}
      <div className="page-header-flex" style={styles.pageHeader}>
        <div>
          <div style={styles.breadcrumb}>
            <span>RETUR & WASTE</span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>Pusat Manajemen Retur & Kerusakan</span>
          </div>
          <h1 style={{ ...styles.pageTitle, marginTop: '4px' }}>Pusat Retur & Kerusakan (Waste)</h1>
          <p style={styles.pageSubtitle}>
            Pantau, catat, dan audit seluruh insiden pembatalan / gagal masak pesanan crepes serta pencatatan bahan baku rusak, kedaluwarsa, atau tumpah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="header-actions" style={styles.headerActions}>
          <button
            type="button"
            className="btn btn-outline"
            style={styles.btnSecondary}
            onClick={() => openWasteModal()}
            title="Catat bahan baku yang rusak, expired, atau bocor"
          >
            <span>Catat Bahan Rusak / Expired</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={styles.btnPrimary}
            onClick={() => openOrderReturnModal()}
            title="Catat pesanan crepes yang gagal dibuat atau dikomplain"
          >
            <span>Catat Retur Pesanan</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI SUMMARY CARDS */}
      <div className="stats-grid" style={styles.statsGrid}>
        {/* Card 1: Retur Pesanan Gagal */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Pesanan Gagal / Diretur</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <RotateCcw size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{stats.totalReturnedCount} <span style={styles.statUnit}>Pesanan</span></div>
          <div style={styles.statFooter}>
            <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatIDR(stats.totalCancelledSales)}</span>
            <span style={styles.statFooterSub}>omset tagihan dibatalkan</span>
          </div>
        </div>

        {/* Card 2: Bahan Baku Rusak / Expired */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Bahan Rusak / Expired</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#fff7ed', color: '#ea580c' }}>
              <Trash2 size={20} />
            </div>
          </div>
          <div style={styles.statValue}>{stats.totalWasteLogsCount} <span style={styles.statUnit}>Insiden Log</span></div>
          <div style={styles.statFooter}>
            <span style={{ color: '#ea580c', fontWeight: 600 }}>{formatIDR(stats.totalMaterialWasteCost)}</span>
            <span style={styles.statFooterSub}>estimasi nilai bahan terbuang</span>
          </div>
        </div>

        {/* Card 3: Total Kerugian HPP & Bahan */}
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statTitle}>Total Akumulasi Kerugian (HPP)</span>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: '#b91c1c' }}>{formatIDR(stats.totalAccumulatedLoss)}</div>
          <div style={styles.statFooter}>
            <span style={styles.statFooterSub}>Biaya bahan terpakai & bahan terbuang</span>
          </div>
        </div>
      </div>

      {/* 3. TABS SWITCHER & FILTER TOOLBAR */}
      <div style={styles.filterCard}>
        <div className="tab-and-filter-row" style={styles.tabAndFilterRow}>
          {/* Tabs */}
          <div className="tab-buttons-wrapper" style={styles.tabButtonsWrapper}>
            <button
              className={`returns-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'orders' ? styles.tabBtnActive : {})
              }}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={15} />
              <span>Retur Pesanan Dapur</span>
              <span style={activeTab === 'orders' ? styles.tabCounterActive : styles.tabCounterInactive}>
                {stats.totalReturnedCount}
              </span>
            </button>

            <button
              className={`returns-tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'materials' ? styles.tabBtnActive : {})
              }}
              onClick={() => setActiveTab('materials')}
            >
              <Package size={15} />
              <span>Bahan Rusak & Expired</span>
              <span style={activeTab === 'materials' ? styles.tabCounterActive : styles.tabCounterInactive}>
                {stats.totalWasteLogsCount}
              </span>
            </button>

            <button
              className={`returns-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'audit' ? styles.tabBtnActive : {})
              }}
              onClick={() => setActiveTab('audit')}
            >
              <Clock size={15} />
              <span>Log Audit Terpadu</span>
              <span style={activeTab === 'audit' ? styles.tabCounterActive : styles.tabCounterInactive}>
                {combinedAuditLogs.length}
              </span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="filter-controls-row" style={styles.filterControlsRow}>
            {/* Search Input */}
            <div className="search-wrapper" style={styles.searchWrapper}>
              <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
              <input
                type="text"
                placeholder={
                  activeTab === 'orders' 
                    ? "Cari invoice, pelanggan, menu, kasir..." 
                    : activeTab === 'materials' 
                    ? "Cari bahan baku, alasan, pencatat..." 
                    : "Cari semua log audit..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={styles.searchClearBtn}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="select-wrapper" style={styles.selectWrapper}>
              <Calendar size={14} color="var(--neutral-500)" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={styles.selectInput}
              >
                <option value="ALL">Semua Waktu</option>
                <option value="TODAY">Hari Ini</option>
                <option value="WEEK">7 Hari Terakhir</option>
                <option value="MONTH">Bulan Ini</option>
              </select>
            </div>

            {/* Reason Category Filter */}
            <div className="select-wrapper" style={styles.selectWrapper}>
              <Filter size={14} color="var(--neutral-500)" />
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                style={styles.selectInput}
              >
                <option value="ALL">Semua Alasan</option>
                {activeTab === 'orders' && ORDER_RETURN_REASONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
                {activeTab === 'materials' && MATERIAL_WASTE_REASONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
                {activeTab === 'audit' && [
                  ...ORDER_RETURN_REASONS,
                  ...MATERIAL_WASTE_REASONS
                ].filter((val, idx, self) => self.indexOf(val) === idx).map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN TAB CONTENT */}
      <div style={styles.contentContainer}>
        {/* TAB 1: RETUR PESANAN DAPUR */}
        {activeTab === 'orders' && (
          <div style={styles.tableCard}>
            {filteredReturnedOrders.length === 0 ? (
              <EmptyState
                title="Tidak ada data retur pesanan"
                description={
                  searchQuery || reasonFilter !== 'ALL' || dateFilter !== 'ALL'
                    ? "Tidak ditemukan data retur pesanan yang cocok dengan kriteria pencarian / filter Anda."
                    : "Belum ada pesanan yang diretur atau gagal buat. Klik tombol 'Catat Retur Pesanan' untuk mencatat insiden baru."
                }
                icon={RotateCcw}
                actionLabel="Catat Retur Pesanan"
                onAction={() => openOrderReturnModal()}
              />
            ) : (
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.th, width: '40px' }}>#</th>
                      <th style={styles.th}>No. Invoice & Tanggal</th>
                      <th style={styles.th}>Pelanggan & Meja</th>
                      <th style={styles.th}>Menu Crepes yang Gagal</th>
                      <th style={styles.th}>Alasan & Catatan Insiden</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Nilai Order</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>HPP Terpakai</th>
                      <th style={styles.th}>Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturnedOrders.map((order, index) => (
                      <tr key={order.id} style={styles.tableRow}>
                        <td style={{ ...styles.td, color: 'var(--neutral-400)', fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                            #{order.invoiceNumber}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Clock size={11} /> {formatDate(order.returnedAt || order.date)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>
                            {order.customerName || 'Pelanggan Walk-In'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                            {order.tableNumber || 'Take Away'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '280px' }}>
                            {(order.items || []).map((it, i) => (
                              <div key={i} style={{ fontSize: '0.813rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>
                                  {it.quantity}x {it.name}
                                </span>
                                {it.toppings && it.toppings.length > 0 && (
                                  <span style={{ fontSize: '0.688rem', color: 'var(--orange-600)', marginLeft: '4px' }}>
                                    (+{it.toppings.map(t => `${t.name}${it.quantity > 1 ? ` [${it.quantity}x]` : ''}`).join(', ')})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '260px' }}>
                            <span style={styles.reasonBadge}>
                              <AlertOctagon size={11} />
                              {order.returnReason || 'Gagal Masak'}
                            </span>
                            {order.returnNote && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '4px 6px', borderRadius: '4px', border: '1px dashed #e2e8f0' }}>
                                "{order.returnNote}"
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>
                            {formatIDR(order.grossRevenue)}
                          </span>
                          <div style={{ fontSize: '0.688rem', color: '#dc2626', fontWeight: 600 }}>
                            Dibatalkan (Rp 0)
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#dc2626' }}>
                            {formatIDR(order.orderTotalHPP)}
                          </div>
                          <div style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>
                            Bahan Terpakai
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: 'var(--neutral-700)' }}>
                            <User size={13} color="var(--neutral-400)" />
                            <span>{order.returnBy || 'Kasir'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BAHAN BAKU RUSAK & EXPIRED */}
        {activeTab === 'materials' && (
          <div style={styles.tableCard}>
            {filteredWasteLogs.length === 0 ? (
              <EmptyState
                title="Tidak ada data bahan rusak / expired"
                description={
                  searchQuery || reasonFilter !== 'ALL' || dateFilter !== 'ALL'
                    ? "Tidak ditemukan log bahan rusak yang cocok dengan filter pencarian."
                    : "Belum ada pencatatan bahan baku rusak, expired, atau bocor. Klik tombol 'Catat Bahan Rusak / Expired' untuk mencatat insiden baru."
                }
                icon={Trash2}
                actionLabel="Catat Bahan Rusak / Expired"
                onAction={() => openWasteModal()}
              />
            ) : (
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.th, width: '40px' }}>#</th>
                      <th style={styles.th}>Waktu Pencatatan</th>
                      <th style={styles.th}>Nama Bahan Baku</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Jumlah Berkurang</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Estimasi Nilai Rugi</th>
                      <th style={styles.th}>Alasan & Catatan Kerusakan</th>
                      <th style={styles.th}>Petugas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWasteLogs.map((log, index) => {
                      const mat = rawMaterials.find(m => m.id === log.rawMaterialId || m.name === log.rawMaterialName);
                      const unitPrice = mat ? (mat.pricePerUnit || 0) : 0;
                      const lostValue = (log.amount || 0) * unitPrice;

                      return (
                        <tr key={log.id} style={styles.tableRow}>
                          <td style={{ ...styles.td, color: 'var(--neutral-400)', fontWeight: 600 }}>
                            {index + 1}
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>
                              {formatDate(log.createdAt)}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                              {log.rawMaterialName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                              Satuan: {log.unit || mat?.unitName || '-'}
                            </div>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={styles.qtyBadge}>
                              -{log.amount} {log.unit || mat?.unitName || ''}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#ea580c' }}>
                              {formatIDR(lostValue)}
                            </div>
                            <div style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>
                              @{formatIDR(unitPrice)}/{log.unit || 'satuan'}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '280px' }}>
                              <span style={styles.wasteBadge}>
                                <AlertTriangle size={11} />
                                {log.reason || 'Bahan Rusak / Expired'}
                              </span>
                              {log.note && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', fontStyle: 'italic', backgroundColor: '#fffbeb', padding: '4px 6px', borderRadius: '4px', border: '1px dashed #fde68a' }}>
                                  "{log.note}"
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: 'var(--neutral-700)' }}>
                              <User size={13} color="var(--neutral-400)" />
                              <span>{log.user || 'Staf / Dapur'}</span>
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

        {/* TAB 3: LOG AUDIT TERPADU (UNIFIED TIMELINE) */}
        {activeTab === 'audit' && (
          <div style={styles.tableCard}>
            {combinedAuditLogs.length === 0 ? (
              <EmptyState
                title="Tidak ada log audit insiden"
                description="Belum ada insiden retur pesanan atau kerusakan bahan yang tercatat."
                icon={Clock}
              />
            ) : (
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.th, width: '40px' }}>#</th>
                      <th style={styles.th}>Waktu Insiden</th>
                      <th style={styles.th}>Tipe Kejadian</th>
                      <th style={styles.th}>Rincian Insiden</th>
                      <th style={styles.th}>Alasan & Keterangan</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Nilai Kerugian</th>
                      <th style={styles.th}>Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedAuditLogs.map((item, index) => (
                      <tr key={item.id} style={styles.tableRow}>
                        <td style={{ ...styles.td, color: 'var(--neutral-400)', fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>
                            {formatDate(item.timestamp)}
                          </div>
                        </td>
                        <td style={styles.td}>
                          {item.category === 'ORDER_RETURN' ? (
                            <span style={styles.auditOrderBadge}>
                              <RotateCcw size={11} />
                              Retur Pesanan
                            </span>
                          ) : (
                            <span style={styles.auditWasteBadge}>
                              <Trash2 size={11} />
                              Bahan Rusak
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', marginTop: '2px' }}>
                            {item.subtitle}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '260px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: '0.813rem' }}>
                              {item.reason}
                            </span>
                            {item.note && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontStyle: 'italic' }}>
                                "{item.note}"
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#dc2626' }}>
                            {formatIDR(item.impactValue)}
                          </div>
                          <div style={{ fontSize: '0.688rem', color: 'var(--neutral-400)' }}>
                            HPP / Biaya
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.813rem', color: 'var(--neutral-700)' }}>
                            <User size={13} color="var(--neutral-400)" />
                            <span>{item.user}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .returns-view-container {
            padding: 16px 16px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            gap: 14px !important;
          }
          .returns-view-container .page-header-flex {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .returns-view-container .header-actions {
            flex-direction: column !important;
            width: 100% !important;
          }
          .returns-view-container .header-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
          .returns-view-container .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .returns-view-container .tab-and-filter-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .returns-view-container .tab-buttons-wrapper {
            width: 100% !important;
            overflow-x: auto !important;
          }
          .returns-view-container .filter-controls-row {
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .returns-view-container .search-wrapper {
            width: 100% !important;
            min-width: 100% !important;
          }
          .returns-view-container .select-wrapper {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .returns-view-container .select-wrapper select {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// Modern, Clean Design Styles
const styles = {
  container: {
    padding: '24px',
    maxWidth: '100%',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: 'var(--neutral-500)'
  },
  breadcrumbSeparator: {
    color: 'var(--neutral-300)'
  },
  breadcrumbCurrent: {
    color: 'var(--blue-600)'
  },
  pageTitle: {
    fontSize: '1.625rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em',
    margin: 0
  },
  pageSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--neutral-600)',
    marginTop: '6px',
    marginBottom: 0,
    maxWidth: '750px',
    lineHeight: 1.5
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    borderColor: '#fed7aa',
    color: '#c2410c',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statTitle: {
    fontSize: '0.813rem',
    fontWeight: 600,
    color: 'var(--neutral-600)'
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  },
  statUnit: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--neutral-500)'
  },
  statFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--neutral-500)',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '8px'
  },
  statFooterSub: {
    color: 'var(--neutral-500)'
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  tabAndFilterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px'
  },
  tabButtonsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '10px',
    overflowX: 'auto'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--neutral-600)',
    fontSize: '0.844rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    color: 'var(--neutral-900)',
    fontWeight: 700,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  tabCounterActive: {
    fontSize: '0.688rem',
    fontWeight: 800,
    padding: '1px 6px',
    borderRadius: '10px',
    backgroundColor: '#dc2626',
    color: '#ffffff'
  },
  tabCounterInactive: {
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    backgroundColor: '#e2e8f0',
    color: 'var(--neutral-600)'
  },
  filterControlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '240px'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '7px 28px 7px 32px',
    borderRadius: '8px',
    border: '1px solid var(--border-color, #e2e8f0)',
    fontSize: '0.813rem',
    backgroundColor: '#f8fafc',
    color: 'var(--neutral-900)',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  searchClearBtn: {
    position: 'absolute',
    right: '8px',
    border: 'none',
    background: 'none',
    color: 'var(--neutral-400)',
    cursor: 'pointer',
    fontSize: '12px'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: '8px',
    padding: '0 10px'
  },
  selectInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.813rem',
    color: 'var(--neutral-800)',
    padding: '7px 0',
    outline: 'none',
    cursor: 'pointer',
    fontWeight: 500
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.844rem'
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--neutral-500)',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.1s ease'
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
    color: 'var(--neutral-800)'
  },
  reasonBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    padding: '2px 8px',
    borderRadius: '6px',
    width: 'fit-content'
  },
  wasteBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#c2410c',
    backgroundColor: '#ffedd5',
    border: '1px solid #fed7aa',
    padding: '2px 8px',
    borderRadius: '6px',
    width: 'fit-content'
  },
  qtyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#c2410c',
    backgroundColor: '#fff7ed',
    border: '1px solid #ffedd5',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  auditOrderBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  auditWasteBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#c2410c',
    backgroundColor: '#fff7ed',
    border: '1px solid #fed7aa',
    padding: '2px 8px',
    borderRadius: '6px'
  }
};
