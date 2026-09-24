import React, { useState, useEffect } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useAuth } from '../../controllers/AuthController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { 
  Ban, 
  User, 
  FileText
} from 'lucide-react';

export const OrderCancelModal = () => {
  const { 
    orderCancelModalState, 
    closeOrderCancelModal, 
    cancelOrder 
  } = useOrder();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const { isOpen, order } = orderCancelModalState;

  const [reason, setReason] = useState('');
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
      setReason('');
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

    if (!reason.trim()) {
      setErrorMsg('Silakan isi alasan pembatalan transaksi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await cancelOrder({
        orderId: order.id,
        reason: reason.trim(),
        note: '',
        restoreStock: true, // Otomatis mengembalikan stok bahan baku ke dapur
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

        {/* Alasan Pembatalan Input (Single Clean Input) */}
        <div className="blue-input-group">
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} color="var(--blue-600)" />
            <span>Alasan Pembatalan <span style={{ color: 'var(--red-500)' }}>*</span></span>
          </label>
          <input
            type="text"
            className="blue-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Kesalahan input kasir / pelanggan batal beli / salah menu..."
            style={{ height: '40px', fontSize: '0.844rem' }}
            required
            autoFocus
          />
        </div>
      </form>
    </Modal>
  );
};

const styles = {
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
  }
};
