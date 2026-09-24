import React from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  Printer, 
  Edit3, 
  RotateCcw, 
  Ban, 
  Camera, 
  User, 
  Clock, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export const TransactionDetailPage = ({
  order,
  onBack,
  onOpenReceipt,
  onOpenRevision,
  onOpenReturn,
  onOpenCancel,
  onOpenPhoto,
  isSuperAdmin,
  formatIDR,
  formatDate
}) => {
  if (!order) return null;

  const isReturned = order.status === 'returned';
  const isCancelled = order.status === 'cancelled';
  const isCompleted = !isReturned && !isCancelled;

  // Calculate total items count
  const totalItemsCount = (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

  return (
    <div className="transaction-detail-page animate-fade-in" style={styles.container}>
      {/* 1. Top Navigation Bar */}
      <div className="transaction-detail-top-nav" style={styles.topNavRow}>
        <button
          type="button"
          onClick={onBack}
          className="transaction-detail-back-btn"
          style={styles.backBtn}
          title="Kembali ke Riwayat Transaksi"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Riwayat Transaksi</span>
        </button>

        <div className="transaction-detail-breadcrumb" style={styles.breadcrumbText}>
          Riwayat Transaksi <span style={{ color: 'var(--neutral-300)' }}>/</span> Invoice #{order.invoiceNumber}
        </div>
      </div>

      {/* 2. Main Order Header Card */}
      <div className="transaction-detail-header-card" style={styles.headerCard}>
        <div className="transaction-detail-header-left" style={styles.headerCardLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="transaction-detail-invoice-title" style={styles.invoiceTitle}>#{order.invoiceNumber}</span>
            {isCancelled ? (
              <span style={styles.statusBadgeCancelled}>
                <Ban size={12} /> Dibatalkan
              </span>
            ) : isReturned ? (
              <span style={styles.statusBadgeReturned}>
                <RotateCcw size={12} /> Diretur
              </span>
            ) : (
              <span style={styles.statusBadgeCompleted}>
                <CheckCircle2 size={12} /> Selesai / Lunas
              </span>
            )}
          </div>

          <div className="transaction-detail-header-meta" style={styles.headerMetaRow}>
            <span style={styles.headerMetaItem}>
              <Clock size={14} color="var(--neutral-400)" />
              {formatDate(order.date)}
            </span>
            <span className="transaction-detail-header-meta-dot" style={styles.headerMetaDot}>•</span>
            <span style={styles.headerMetaItem}>
              <User size={14} color="var(--neutral-400)" />
              Kasir: <strong>{order.cashierName || 'admin'}</strong>
            </span>
            <span className="transaction-detail-header-meta-dot" style={styles.headerMetaDot}>•</span>
            <span style={styles.headerMetaItem}>
              Pelanggan: <strong>{order.customerName || 'Pelanggan Umum'}</strong> ({order.tableNumber || 'Takeaway'})
            </span>
          </div>
        </div>

        {/* Action Buttons: Semua Aksi Transaksi Terpusat di Sini */}
        <div className="transaction-detail-actions" style={styles.headerActionsGroup}>
          {/* Cetak Struk */}
          <Button
            variant="outline"
            icon={Printer}
            onClick={() => onOpenReceipt(order)}
            className={`transaction-detail-act-btn act-receipt ${!isCompleted && !order.returnPhoto ? 'act-fullwidth-mobile' : ''}`}
            style={styles.actionButtonOutline}
            title="Cetak Ulang Struk Thermal"
          >
            Cetak Struk
          </Button>

          {/* Revisi Pesanan (Aktif hanya jika belum batal & belum retur) */}
          {isCompleted && (
            <Button
              variant="primary"
              icon={Edit3}
              onClick={() => onOpenRevision(order)}
              className="transaction-detail-act-btn act-revision"
              style={styles.actionButtonPrimary}
              title="Ubah Menu, Topping, atau Porsi & Cetak Struk Baru"
            >
              Revisi Pesanan
            </Button>
          )}

          {/* Retur Pesanan (Super Admin) */}
          {isCompleted && isSuperAdmin && (
            <button
              type="button"
              onClick={() => onOpenReturn(order)}
              className="transaction-detail-act-btn act-return"
              style={styles.actionButtonReturn}
              title="Catat Retur / Gagal Masak (Super Admin)"
            >
              <RotateCcw size={14} />
              <span>Retur</span>
            </button>
          )}

          {/* Batalkan Transaksi (Super Admin) */}
          {isCompleted && isSuperAdmin && (
            <button
              type="button"
              onClick={() => onOpenCancel(order)}
              className="transaction-detail-act-btn act-cancel"
              style={styles.actionButtonCancel}
              title="Batalkan Transaksi & Kembalikan Stok (Super Admin)"
            >
              <Ban size={14} />
              <span>Batalkan</span>
            </button>
          )}

          {/* Foto Bukti Retur jika ada */}
          {order.returnPhoto && (
            <button
              type="button"
              onClick={() => onOpenPhoto(order.returnPhoto, `Bukti Retur: #${order.invoiceNumber}`, {
                orderInvoice: order.invoiceNumber,
                reason: order.returnReason,
                note: order.returnNote,
                user: order.returnBy,
                createdAt: formatDate(order.returnedAt || order.date)
              })}
              className="transaction-detail-act-btn act-photo"
              style={styles.actionButtonPhoto}
              title="Lihat Foto Bukti Retur"
            >
              <Camera size={14} />
              <span>Lihat Foto Retur</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Status Alert Banners (If Cancelled, Returned, or Revised) */}
      {isCancelled && (
        <div className="transaction-detail-alert-banner" style={styles.cancelAlertBanner}>
          <div style={styles.alertIconCircleRed}>
            <Ban size={18} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#991b1b' }}>
              Transaksi Ini Telah Dibatalkan
            </div>
            <div style={{ fontSize: '0.781rem', color: '#b91c1c', marginTop: '2px' }}>
              Alasan: <strong>{order.cancelReason || 'Pembatalan Transaksi'}</strong> • Oleh: <strong>{order.cancelBy || 'Super Admin'}</strong> • Waktu: {formatDate(order.cancelledAt || order.date)}
            </div>
            <div style={{ fontSize: '0.719rem', color: '#7f1d1d', marginTop: '4px', fontStyle: 'italic' }}>
              ✓ Bahan baku telah otomatis dikembalikan ke inventori stok dapur dan transaksi dikecualikan dari omset penjualan.
            </div>
          </div>
        </div>
      )}

      {isReturned && (
        <div className="transaction-detail-alert-banner" style={styles.returnAlertBanner}>
          <div style={styles.alertIconCircleOrange}>
            <RotateCcw size={18} color="#d97706" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#92400e' }}>
              Transaksi Ini Tercatat Diretur / Gagal Pembuatan
            </div>
            <div style={{ fontSize: '0.781rem', color: '#b45309', marginTop: '2px' }}>
              Alasan: <strong>{order.returnReason || 'Retur Pesanan'}</strong> • Oleh: <strong>{order.returnBy || 'Kasir'}</strong> • Waktu: {formatDate(order.returnedAt || order.date)}
            </div>
            {order.returnNote && (
              <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '2px' }}>
                Catatan: "{order.returnNote}"
              </div>
            )}
          </div>
        </div>
      )}

      {order.isRevised && !isCancelled && (
        <div className="transaction-detail-alert-banner" style={styles.revisedAlertBanner}>
          <div style={styles.alertIconCircleBlue}>
            <Edit3 size={16} color="var(--blue-600)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.844rem', color: 'var(--blue-800)' }}>
              Transaksi Ini Pernah Direvisi
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-700)', marginTop: '2px' }}>
              Alasan: <strong>{order.revisionReason || 'Penyesuaian menu/topping kasir'}</strong> • Oleh: <strong>{order.revisedBy || 'Kasir'}</strong> • Terakhir Diubah: {formatDate(order.revisedAt)}
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Content Grid */}
      <div style={styles.contentGrid} className="transaction-detail-grid">
        {/* Left Column: Daftar Item Pesanan & Topping */}
        <div style={styles.leftCol} className="transaction-detail-left-col">
          <div className="transaction-detail-card" style={styles.sectionCard}>
            <div className="transaction-detail-card-header" style={styles.sectionCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} color="var(--blue-600)" />
                <h3 style={styles.sectionCardTitle}>
                  Rincian Menu yang Dipesan
                </h3>
              </div>
              <span style={styles.itemCountBadge}>
                {order.items?.length || 0} Menu • {totalItemsCount} Porsi
              </span>
            </div>

            {/* Desktop Table View (Hidden on <= 768px) */}
            <div className="transaction-detail-desktop-table" style={{ overflowX: 'auto' }}>
              <table style={styles.itemsTable}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.thCell, width: '40px' }}>#</th>
                    <th style={styles.thCell}>Menu & Extra Topping</th>
                    <th style={{ ...styles.thCell, textAlign: 'center', width: '70px' }}>Qty</th>
                    <th style={{ ...styles.thCell, textAlign: 'right', width: '100px' }}>Harga Satuan</th>
                    <th style={{ ...styles.thCell, textAlign: 'right', width: '110px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => {
                    const qty = Number(item.quantity) || 1;
                    const unitPrice = Number(item.unitPrice) || 0;
                    const itemSubtotal = unitPrice * qty;
                    const discAmount = Number(item.itemDiscountAmount) || 0;
                    const netSubtotal = Math.max(0, itemSubtotal - discAmount);

                    return (
                      <tr key={idx} style={styles.tableBodyRow}>
                        <td style={{ ...styles.tdCell, color: 'var(--neutral-400)', fontWeight: 600 }}>
                          #{idx + 1}
                        </td>
                        <td style={styles.tdCell}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--neutral-900)' }}>
                            {item.name}
                          </div>
                          {item.categoryName && (
                            <div style={{ fontSize: '0.719rem', color: 'var(--neutral-500)', marginTop: '1px' }}>
                              Kategori: {item.categoryName}
                            </div>
                          )}

                          {/* Extra Toppings Badges */}
                          {Array.isArray(item.toppings) && item.toppings.length > 0 ? (
                            <div style={styles.toppingsPillsList}>
                              {item.toppings.map((top, tIdx) => {
                                const topQty = Number(top.quantity) || 1;
                                const topPrice = Number(top.price) || 0;
                                return (
                                  <span key={tIdx} style={styles.toppingBadgePill}>
                                    + {top.name} {topQty > 1 ? `(${topQty}x)` : ''} ({formatIDR(topPrice)})
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.719rem', color: 'var(--neutral-400)', fontStyle: 'italic', marginTop: '2px' }}>
                              Tanpa extra topping
                            </div>
                          )}

                          {/* Item Note */}
                          {item.note && (
                            <div style={styles.itemNoteBadge}>
                              "{item.note}"
                            </div>
                          )}
                        </td>

                        <td style={{ ...styles.tdCell, textAlign: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'var(--neutral-800)' }}>
                          {qty}
                        </td>

                        <td style={{ ...styles.tdCell, textAlign: 'right', fontSize: '0.813rem', color: 'var(--neutral-600)' }}>
                          {formatIDR(unitPrice)}
                        </td>

                        <td style={{ ...styles.tdCell, textAlign: 'right' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--neutral-900)' }}>
                            {formatIDR(netSubtotal)}
                          </span>
                          {discAmount > 0 && (
                            <div style={{ fontSize: '0.688rem', color: '#059669', fontWeight: 600 }}>
                              Hemat -{formatIDR(discAmount)}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Item Cards View (Shown on screens <= 768px) */}
            <div className="transaction-detail-mobile-items">
              {(order.items || []).map((item, idx) => {
                const qty = Number(item.quantity) || 1;
                const unitPrice = Number(item.unitPrice) || 0;
                const itemSubtotal = unitPrice * qty;
                const discAmount = Number(item.itemDiscountAmount) || 0;
                const netSubtotal = Math.max(0, itemSubtotal - discAmount);

                return (
                  <div key={idx} className="transaction-detail-mobile-item-card">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={styles.mobileItemIndex}>#{idx + 1}</span>
                          <span style={styles.mobileItemName}>{item.name}</span>
                        </div>
                        {item.categoryName && (
                          <span style={styles.mobileItemCategory}>Kategori: {item.categoryName}</span>
                        )}
                      </div>
                      <span style={styles.mobileItemQtyBadge}>
                        {qty}x
                      </span>
                    </div>

                    {/* Extra Toppings */}
                    {Array.isArray(item.toppings) && item.toppings.length > 0 ? (
                      <div style={styles.toppingsPillsList}>
                        {item.toppings.map((top, tIdx) => {
                          const topQty = Number(top.quantity) || 1;
                          const topPrice = Number(top.price) || 0;
                          return (
                            <span key={tIdx} style={styles.toppingBadgePill}>
                              + {top.name} {topQty > 1 ? `(${topQty}x)` : ''} ({formatIDR(topPrice)})
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.719rem', color: 'var(--neutral-400)', fontStyle: 'italic' }}>
                        Tanpa extra topping
                      </div>
                    )}

                    {/* Item Note */}
                    {item.note && (
                      <div style={styles.itemNoteBadge}>
                        "{item.note}"
                      </div>
                    )}

                    {/* Pricing Row */}
                    <div style={styles.mobileItemPriceRow}>
                      <div style={{ fontSize: '0.781rem', color: 'var(--neutral-500)' }}>
                        @{formatIDR(unitPrice)} × {qty}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.938rem', color: 'var(--neutral-900)' }}>
                          {formatIDR(netSubtotal)}
                        </span>
                        {discAmount > 0 && (
                          <div style={{ fontSize: '0.688rem', color: '#059669', fontWeight: 600 }}>
                            Hemat -{formatIDR(discAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ringkasan Finansial, Pembayaran & Detail Kasir */}
        <div style={styles.rightCol} className="transaction-detail-right-col">
          {/* Card 1: Rincian Pembayaran */}
          <div className="transaction-detail-card" style={styles.sectionCard}>
            <div className="transaction-detail-card-header" style={styles.sectionCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="var(--blue-600)" />
                <h3 style={styles.sectionCardTitle}>Rincian Pembayaran</h3>
              </div>
              <Badge variant={order.paymentMethod === 'qris' ? 'purple' : 'success'}>
                {(order.paymentMethod || 'CASH').toUpperCase()}
              </Badge>
            </div>

            <div style={styles.paymentSummaryList}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal Item</span>
                <span style={styles.summaryValue}>{formatIDR(order.subtotal || order.totalAmount)}</span>
              </div>

              {Number(order.orderDiscountAmount) > 0 && (
                <div style={styles.summaryRow}>
                  <span style={{ ...styles.summaryLabel, color: '#059669' }}>Diskon Transaksi</span>
                  <span style={{ ...styles.summaryValue, color: '#059669', fontWeight: 700 }}>
                    -{formatIDR(order.orderDiscountAmount)}
                  </span>
                </div>
              )}

              <div style={styles.summaryDivider} />

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total Pembayaran</span>
                <span style={styles.totalValue}>{formatIDR(order.totalAmount)}</span>
              </div>

              {order.cashPaid != null && order.cashPaid > 0 && (
                <>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Uang Diterima</span>
                    <span style={styles.summaryValue}>{formatIDR(order.cashPaid)}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Kembalian</span>
                    <span style={styles.summaryValue}>{formatIDR(order.cashChange || 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Informasi Tambahan & Kasir */}
          <div className="transaction-detail-card" style={styles.sectionCard}>
            <div className="transaction-detail-card-header" style={styles.sectionCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--blue-600)" />
                <h3 style={styles.sectionCardTitle}>Informasi Layanan</h3>
              </div>
            </div>

            <div style={styles.infoMetaList}>
              <div style={styles.infoMetaItem}>
                <span style={styles.infoMetaLabel}>Kasir Bertugas:</span>
                <span style={styles.infoMetaValue}>{order.cashierName || 'admin'}</span>
              </div>
              <div style={styles.infoMetaItem}>
                <span style={styles.infoMetaLabel}>Nama Pelanggan:</span>
                <span style={styles.infoMetaValue}>{order.customerName || 'Pelanggan Umum'}</span>
              </div>
              <div style={styles.infoMetaItem}>
                <span style={styles.infoMetaLabel}>Tipe / Meja:</span>
                <span style={styles.infoMetaValue}>{order.tableNumber || 'Takeaway'}</span>
              </div>
              <div style={styles.infoMetaItem}>
                <span style={styles.infoMetaLabel}>Status Pesanan:</span>
                <span style={{ fontWeight: 700, color: isCancelled ? '#dc2626' : isReturned ? '#d97706' : '#059669' }}>
                  {isCancelled ? 'Dibatalkan' : isReturned ? 'Diretur' : 'Lunas & Selesai'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Khusus Super Admin - Estimasi HPP & Laba */}
          {isSuperAdmin && (
            <div className="transaction-detail-card" style={{ ...styles.sectionCard, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
              <div className="transaction-detail-card-header" style={styles.sectionCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="var(--green-600)" />
                  <h3 style={{ ...styles.sectionCardTitle, color: 'var(--neutral-900)' }}>
                    Analisis Laba & HPP (Admin)
                  </h3>
                </div>
              </div>

              <div style={styles.paymentSummaryList}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Estimasi HPP Bahan Baku</span>
                  <span style={{ ...styles.summaryValue, color: 'var(--neutral-700)' }}>
                    {formatIDR(order.orderTotalHPP || 0)}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Estimasi Laba Kotor</span>
                  <span style={{ ...styles.summaryValue, color: 'var(--green-600)', fontWeight: 800 }}>
                    {formatIDR(order.orderNetProfit || 0)}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Margin Keuntungan</span>
                  <span style={{ ...styles.summaryValue, color: 'var(--green-700)', fontWeight: 800 }}>
                    {(order.orderMargin || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Responsive Stylesheet */}
      <style>{`
        .transaction-detail-page {
          width: 100%;
          box-sizing: border-box;
        }

        .transaction-detail-mobile-items {
          display: none;
        }

        /* 1. Tablet & Medium Screens <= 1024px */
        @media (max-width: 1024px) {
          .transaction-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }

        /* 2. Mobile Screens <= 768px */
        @media (max-width: 768px) {
          .transaction-detail-page {
            padding-bottom: 24px !important;
            gap: 12px !important;
          }

          .transaction-detail-top-nav {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }

          .transaction-detail-back-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 10px 16px !important;
            font-size: 0.875rem !important;
          }

          .transaction-detail-breadcrumb {
            font-size: 0.75rem !important;
            text-align: center !important;
          }

          .transaction-detail-header-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 14px 16px !important;
            gap: 14px !important;
          }

          .transaction-detail-header-left {
            width: 100% !important;
          }

          .transaction-detail-invoice-title {
            font-size: 1.125rem !important;
          }

          .transaction-detail-header-meta {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
            margin-top: 6px !important;
          }

          .transaction-detail-header-meta-dot {
            display: none !important;
          }

          /* Actions Grid: 2 columns thumb-friendly on mobile */
          .transaction-detail-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }

          .transaction-detail-act-btn {
            width: 100% !important;
            min-height: 42px !important;
            justify-content: center !important;
            padding: 8px 10px !important;
            font-size: 0.813rem !important;
            box-sizing: border-box !important;
          }

          .transaction-detail-actions .act-fullwidth-mobile {
            grid-column: 1 / -1 !important;
          }

          .transaction-detail-card {
            padding: 14px !important;
            border-radius: 10px !important;
          }

          .transaction-detail-card-header {
            padding-bottom: 10px !important;
            margin-bottom: 10px !important;
          }

          /* Switch desktop table to touch-friendly card list */
          .transaction-detail-desktop-table {
            display: none !important;
          }

          .transaction-detail-mobile-items {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }

          .transaction-detail-mobile-item-card {
            background-color: #f8fafc;
            border: 1px solid var(--neutral-200);
            border-radius: 10px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-sizing: border-box;
          }

          .transaction-detail-alert-banner {
            padding: 10px 12px !important;
            gap: 10px !important;
          }
        }

        /* 3. Small Mobile Screens <= 480px */
        @media (max-width: 480px) {
          .transaction-detail-actions {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }

          .transaction-detail-act-btn {
            padding: 7px 6px !important;
            font-size: 0.75rem !important;
            min-height: 40px !important;
            gap: 5px !important;
          }

          .transaction-detail-act-btn svg {
            width: 14px !important;
            height: 14px !important;
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
    gap: '16px',
    width: '100%',
    paddingBottom: '24px'
  },
  topNavRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px'
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid var(--neutral-300)',
    backgroundColor: '#ffffff',
    color: 'var(--neutral-800)',
    fontSize: '0.844rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
  },
  breadcrumbText: {
    fontSize: '0.781rem',
    color: 'var(--neutral-500)',
    fontWeight: 500
  },
  headerCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px 20px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--neutral-200)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  headerCardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  invoiceTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.3px'
  },
  statusBadgeCompleted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  statusBadgeCancelled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  statusBadgeReturned: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: '#fffbeb',
    color: '#d97706',
    border: '1px solid #fde68a',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  headerMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    fontSize: '0.781rem',
    color: 'var(--neutral-600)'
  },
  headerMetaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px'
  },
  headerMetaDot: {
    color: 'var(--neutral-300)'
  },
  headerActionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionButtonOutline: {
    height: '38px',
    fontSize: '0.813rem',
    fontWeight: 600
  },
  actionButtonPrimary: {
    height: '38px',
    fontSize: '0.813rem',
    fontWeight: 700
  },
  actionButtonReturn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '38px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '1px solid #fecdd3',
    backgroundColor: '#fff1f2',
    color: '#b91c1c',
    fontSize: '0.813rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  actionButtonCancel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '38px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '1px solid #fca5a5',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.813rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  actionButtonPhoto: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '38px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '1px solid #fca5a5',
    backgroundColor: '#fff1f2',
    color: '#b91c1c',
    fontSize: '0.813rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  cancelAlertBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca'
  },
  returnAlertBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a'
  },
  revisedAlertBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)'
  },
  alertIconCircleRed: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  alertIconCircleOrange: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  alertIconCircleBlue: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '16px',
    alignItems: 'start'
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid var(--neutral-200)',
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  sectionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--neutral-200)',
    marginBottom: '12px'
  },
  sectionCardTitle: {
    margin: 0,
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  itemCountBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    backgroundColor: 'var(--neutral-100)',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--neutral-200)'
  },
  thCell: {
    padding: '8px 10px',
    fontSize: '0.719rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    textAlign: 'left'
  },
  tableBodyRow: {
    borderBottom: '1px dashed var(--neutral-200)'
  },
  tdCell: {
    padding: '12px 10px',
    verticalAlign: 'top',
    fontSize: '0.813rem'
  },
  toppingsPillsList: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px'
  },
  toppingBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '9999px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    color: 'var(--blue-700)',
    fontSize: '0.719rem',
    fontWeight: 600
  },
  itemNoteBadge: {
    fontSize: '0.719rem',
    fontStyle: 'italic',
    color: 'var(--neutral-500)',
    marginTop: '4px',
    backgroundColor: 'var(--neutral-50)',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block'
  },
  mobileItemIndex: {
    fontSize: '0.719rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-200)',
    padding: '1px 6px',
    borderRadius: '4px'
  },
  mobileItemName: {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'var(--neutral-900)'
  },
  mobileItemCategory: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    display: 'block',
    marginTop: '2px'
  },
  mobileItemQtyBadge: {
    fontSize: '0.813rem',
    fontWeight: 800,
    color: 'var(--blue-700)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    padding: '2px 8px',
    borderRadius: '6px',
    flexShrink: 0
  },
  mobileItemPriceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTop: '1px dashed var(--neutral-200)',
    paddingTop: '8px',
    marginTop: '2px'
  },
  paymentSummaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.813rem'
  },
  summaryLabel: {
    color: 'var(--neutral-600)'
  },
  summaryValue: {
    color: 'var(--neutral-900)',
    fontWeight: 600
  },
  summaryDivider: {
    height: '1px',
    borderTop: '1px dashed var(--neutral-200)',
    margin: '4px 0'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '0.938rem'
  },
  totalLabel: {
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  totalValue: {
    fontWeight: 800,
    fontSize: '1.125rem',
    color: 'var(--blue-600)'
  },
  infoMetaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoMetaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.813rem'
  },
  infoMetaLabel: {
    color: 'var(--neutral-500)'
  },
  infoMetaValue: {
    fontWeight: 600,
    color: 'var(--neutral-900)'
  }
};
