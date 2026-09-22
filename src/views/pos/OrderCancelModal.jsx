import React, { useState, useEffect } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useAuth } from '../../controllers/AuthController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { 
  Ban, 
  AlertTriangle, 
  ShoppingBag, 
  Clock, 
  User, 
  FileText, 
  RotateCcw,
  Check,
  Calendar,
  Layers
} from 'lucide-react';

const CANCELLATION_PRESETS = [
  'Kesalahan Input Kasir / Salah Menu',
  'Pelanggan Membatalkan Pesanan',
  'Bahan Baku Habis / Kendala Teknis',
  'Pembayaran Gagal / Dibatalkan',
  'Pesanan Duplikat',
  'Lainnya'
];

export const OrderCancelModal = () => {
  const { 
    orderCancelModalState, 
    closeOrderCancelModal, 
    cancelOrder 
  } = useOrder();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const { isOpen, order } = orderCancelModalState;

  const [selectedPreset, setSelectedPreset] = useState(CANCELLATION_PRESETS[0]);
  const [cancelNote, setCancelNote] = useState('');
  const [restoreStock, setRestoreStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-close if not super admin
  useEffect(() => {
    if (isOpen && !isSuperAdmin) {
      closeOrderCancelModal();
    }
  }, [isOpen, isSuperAdmin, closeOrderCancelModal]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(CANCELLATION_PRESETS[0]);
      setCancelNote('');
      setRestoreStock(true);
      setIsSubmitting(false);
      setErrorMsg('');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

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
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!selectedPreset) {
      setErrorMsg('Silakan pilih alasan pembatalan transaksi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await cancelOrder({
        orderId: order.id,
        reason: selectedPreset,
        note: cancelNote.trim(),
        restoreStock,
        user: currentUser?.nama || currentUser?.name || currentUser?.username || 'Super Admin'
      });

      if (!res?.success && res?.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membatalkan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeOrderCancelModal}
      title="Batalkan Transaksi Penjualan"
      subtitle={`Invoice #${order.invoiceNumber} • ${formatDate(order.date)}`}
      size="md"
      footer={
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
          <Button 
            variant="outline" 
            onClick={closeOrderCancelModal} 
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Tutup
          </Button>
          <Button
            variant="danger"
            icon={Ban}
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isSubmitting ? 'Membatalkan...' : 'Batalkan Transaksi'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Warning Alert Banner */}
        <div style={styles.warningBanner}>
          <AlertTriangle size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.813rem', color: '#7f1d1d', lineHeight: 1.45 }}>
            <strong>Perhatian Hak Akses Admin:</strong> Tindakan ini akan menandai transaksi invoice <strong>#{order.invoiceNumber}</strong> sebagai <strong>DIBATALKAN</strong> dan mengecualikannya dari laporan omset/laba penjualan.
          </div>
        </div>

        {errorMsg && (
          <div style={styles.errorAlert}>
            {errorMsg}
          </div>
        )}

        {/* Order Details Card */}
        <div style={styles.orderCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={styles.invoiceBadge}>#{order.invoiceNumber}</span>
              <span style={{ fontSize: '0.844rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                {order.customerName || 'Pelanggan Umum'}
              </span>
              {order.tableNumber && (
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                  ({order.tableNumber})
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={13} color="var(--neutral-400)" />
              <span>Kasir: <strong>{order.cashierName || 'Kasir'}</strong></span>
            </div>
          </div>

          {/* Items breakdown */}
          <div style={styles.itemsListWrapper}>
            {(order.items || []).map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--neutral-800)', fontSize: '0.813rem' }}>
                    {item.quantity}x {item.name}
                  </span>
                  {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                    <div style={{ fontSize: '0.719rem', color: 'var(--orange-600)', marginTop: '1px' }}>
                      Topping: + {item.toppings.map(t => `${t.name}${t.quantity > 1 ? ` (${t.quantity}x)` : ''}`).join(', ')}
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.813rem' }}>
                  {formatIDR((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1))}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.orderTotalRow}>
            <span style={{ fontSize: '0.781rem', color: 'var(--neutral-600)' }}>
              Total Nilai Transaksi:
            </span>
            <span style={{ fontSize: '0.938rem', fontWeight: 800, color: '#dc2626' }}>
              {formatIDR(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Reason Presets */}
        <div className="blue-input-group">
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} color="var(--blue-600)" />
            <span>Alasan Pembatalan <span style={{ color: 'var(--red-500)' }}>*</span></span>
          </label>
          <div style={styles.presetChipsGrid}>
            {CANCELLATION_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset;
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  style={{
                    ...styles.presetChip,
                    borderColor: isSelected ? 'var(--blue-600)' : 'var(--border-color)',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    color: isSelected ? 'var(--blue-700)' : 'var(--neutral-700)',
                    fontWeight: isSelected ? 700 : 500
                  }}
                >
                  {isSelected && <Check size={13} color="var(--blue-600)" />}
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Note */}
        <div className="blue-input-group">
          <label className="blue-label">Catatan Tambahan (Opsional)</label>
          <input
            type="text"
            className="blue-input"
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder="Contoh: Kasir salah klik menu / pelanggan buru-buru keluar..."
            style={{ height: '40px', fontSize: '0.844rem' }}
          />
        </div>

        {/* Restock Raw Materials Checkbox */}
        <div style={styles.restockCard}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={restoreStock}
              onChange={(e) => setRestoreStock(e.target.checked)}
              style={styles.checkboxInput}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={14} color={restoreStock ? 'var(--blue-600)' : 'var(--neutral-400)'} />
                <span style={{ fontSize: '0.844rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  Kembalikan bahan baku ke stok dapur (Restock)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', lineHeight: 1.4 }}>
                Bahan baku adonan & extra topping pada pesanan ini akan otomatis dikembalikan ke inventori serta dicatat pada log mutasi bahan (tipe: IN).
              </span>
            </div>
          </label>
        </div>
      </form>
    </Modal>
  );
};

const styles = {
  warningBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3'
  },
  errorAlert: {
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.813rem',
    border: '1px solid #fecaca'
  },
  orderCard: {
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  invoiceBadge: {
    fontSize: '0.75rem',
    fontWeight: 800,
    backgroundColor: '#f1f5f9',
    color: 'var(--neutral-800)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)'
  },
  itemsListWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '130px',
    overflowY: 'auto',
    borderTop: '1px dashed #e2e8f0',
    borderBottom: '1px dashed #e2e8f0',
    padding: '8px 0'
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },
  orderTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '2px'
  },
  presetChipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '8px',
    marginTop: '4px'
  },
  presetChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '0.781rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    outline: 'none'
  },
  restockCard: {
    padding: '12px 14px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  checkboxInput: {
    marginTop: '3px',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: 'var(--blue-600)'
  }
};
