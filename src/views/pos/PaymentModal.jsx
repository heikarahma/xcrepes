import React, { useState, useEffect } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  Coins, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const PaymentModal = () => {
  const { 
    isPaymentModalOpen, 
    closePaymentModal, 
    cart, 
    grossSubtotal,
    itemsDiscountTotal,
    orderDiscountType,
    orderDiscountValue,
    orderDiscountAmount,
    discount, 
    totalAmount, 
    customerName, 
    tableNumber,
    completeOrder 
  } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'qris' | 'card'
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaymentMethod('cash');
      setCashReceived('');
      setIsProcessing(false);
    }
  }, [isPaymentModalOpen, totalAmount]);

  if (!isPaymentModalOpen) return null;

  const numericCash = Number(cashReceived) || 0;
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, numericCash - totalAmount) : 0;
  const isCashSufficient = paymentMethod !== 'cash' || numericCash >= totalAmount;

  // Preset cash suggestions
  const presetAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 10000) * 10000,
    Math.ceil(totalAmount / 50000) * 50000,
    100000
  ].filter((amt, idx, self) => amt >= totalAmount && self.indexOf(amt) === idx).slice(0, 4);

  const handleProcessPayment = () => {
    if (!isCashSufficient) return;

    setIsProcessing(true);
    setTimeout(() => {
      completeOrder({
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? numericCash : totalAmount,
        changeAmount
      });
      setIsProcessing(false);
    }, 400);
  };

  return (
    <Modal
      isOpen={isPaymentModalOpen}
      onClose={closePaymentModal}
      title="Pembayaran Pesanan"
      subtitle={`Total tagihan untuk ${customerName || 'Pelanggan'} (${cart.length} jenis item)`}
      size="md"
    >
      <div style={styles.container}>
        {/* Total Bill Display Card */}
        <div style={styles.totalCard}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '0.5px' }}>
              TOTAL PEMBAYARAN
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              {formatIDR(totalAmount)}
            </span>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {discount > 0 && (
              <span style={{ fontSize: '0.813rem', color: '#fef08a', fontWeight: 800 }}>
                Hemat {formatIDR(discount)}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>
              {tableNumber !== '-' && tableNumber ? `Meja ${tableNumber}` : 'Takeaway / Umum'}
            </span>
          </div>
        </div>

        {/* Discount Breakdown strip if any discount exists */}
        {discount > 0 && (
          <div style={{
            backgroundColor: 'var(--emerald-50)',
            borderRadius: '8px',
            border: '1px solid var(--emerald-200)',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-600)' }}>
              <span>Subtotal Asli:</span>
              <span>{formatIDR(grossSubtotal)}</span>
            </div>
            {itemsDiscountTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald-700)', fontWeight: 600 }}>
                <span>Potongan Diskon Item:</span>
                <span>-{formatIDR(itemsDiscountTotal)}</span>
              </div>
            )}
            {orderDiscountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald-700)', fontWeight: 600 }}>
                <span>
                  Diskon Pesanan {orderDiscountType === 'percent' ? `(${orderDiscountValue}%)` : ''}:
                </span>
                <span>-{formatIDR(orderDiscountAmount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Selection */}
        <div style={styles.section}>
          <label style={styles.label}>PILIH METODE PEMBAYARAN</label>
          <div style={styles.methodGrid}>
            <div
              onClick={() => setPaymentMethod('cash')}
              style={{
                ...styles.methodCard,
                ...(paymentMethod === 'cash' ? styles.methodCardActive : styles.methodCardInactive)
              }}
            >
              <Banknote size={20} color={paymentMethod === 'cash' ? 'var(--blue-600)' : 'var(--neutral-600)'} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Tunai (Cash)</span>
            </div>

            <div
              onClick={() => setPaymentMethod('qris')}
              style={{
                ...styles.methodCard,
                ...(paymentMethod === 'qris' ? styles.methodCardActive : styles.methodCardInactive)
              }}
            >
              <QrCode size={20} color={paymentMethod === 'qris' ? 'var(--blue-600)' : 'var(--neutral-600)'} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>QRIS</span>
            </div>

            <div
              onClick={() => setPaymentMethod('card')}
              style={{
                ...styles.methodCard,
                ...(paymentMethod === 'card' ? styles.methodCardActive : styles.methodCardInactive)
              }}
            >
              <CreditCard size={20} color={paymentMethod === 'card' ? 'var(--blue-600)' : 'var(--neutral-600)'} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Debit / Kartu</span>
            </div>
          </div>
        </div>

        {/* Cash Payment Specific Inputs */}
        {paymentMethod === 'cash' ? (
          <div style={styles.cashSection}>
            <div style={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={styles.label}>UANG DITERIMA (TUNAI)</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Ketik atau pilih nominal cepat</span>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={styles.prefix}>Rp</span>
                <input
                  type="number"
                  className={`blue-input ${numericCash > 0 && !isCashSufficient ? 'has-error' : ''}`}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  autoFocus
                  style={{ width: '100%', height: '48px', paddingLeft: '48px', fontSize: '1.125rem', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashReceived(String(amt))}
                  style={{
                    ...styles.presetBtn,
                    backgroundColor: numericCash === amt ? 'var(--blue-100)' : 'var(--neutral-100)',
                    borderColor: numericCash === amt ? 'var(--blue-500)' : 'var(--border-color)',
                    color: numericCash === amt ? 'var(--blue-800)' : 'var(--neutral-800)'
                  }}
                >
                  {amt === totalAmount ? `Uang Pas (${formatIDR(amt)})` : formatIDR(amt)}
                </button>
              ))}
            </div>

            {/* Change Result Card */}
            <div style={{
              ...styles.changeCard,
              backgroundColor: isCashSufficient && numericCash > 0 ? 'var(--emerald-50)' : 'var(--neutral-50)',
              borderColor: isCashSufficient && numericCash > 0 ? 'var(--emerald-200)' : 'var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={20} color={isCashSufficient && numericCash > 0 ? 'var(--emerald-600)' : 'var(--neutral-400)'} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                  Kembalian Pelanggan:
                </span>
              </div>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: isCashSufficient && numericCash > 0 ? 'var(--emerald-700)' : 'var(--neutral-900)'
              }}>
                {formatIDR(changeAmount)}
              </span>
            </div>

            {numericCash > 0 && !isCashSufficient && (
              <div style={styles.errorBanner}>
                <AlertCircle size={15} />
                <span>Uang yang diterima kurang {formatIDR(totalAmount - numericCash)}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.nonCashNotice}>
            <CheckCircle2 size={32} color="var(--blue-600)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.938rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                Pembayaran Non-Tunai ({paymentMethod.toUpperCase()})
              </span>
              <span style={{ fontSize: '0.813rem', color: 'var(--neutral-500)' }}>
                Arahkan pelanggan scan kode QRIS atau gesek kartu debit pada mesin EDC kasir sebesar {formatIDR(totalAmount)}.
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="payment-footer-actions" style={styles.footerActions}>
          <Button
            type="button"
            variant="outline"
            onClick={closePaymentModal}
            disabled={isProcessing}
            style={{ flex: 1, padding: '10px 0', fontSize: '0.875rem' }}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={ArrowRight}
            onClick={handleProcessPayment}
            disabled={isProcessing || !isCashSufficient}
            style={{ flex: 1.5, padding: '10px 0', fontSize: '0.875rem' }}
          >
            {isProcessing ? 'Memproses...' : 'Selesaikan & Cetak Struk'}
          </Button>
        </div>

        <style>{`
          @media (max-width: 480px) {
            .payment-total-card {
              padding: 12px 14px !important;
            }
            .payment-method-grid {
              gap: 6px !important;
            }
            .payment-method-grid > div {
              padding: 10px 6px !important;
              font-size: 0.75rem !important;
            }
          }
          @media (max-width: 390px) {
            .payment-footer-actions {
              flex-direction: column-reverse !important;
            }
            .payment-footer-actions button {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 4px 8px 4px'
  },
  totalCard: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
  },
  section: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    marginBottom: '8px',
    letterSpacing: '0.5px'
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  methodCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1.5px solid',
    transition: 'all 0.15s ease',
    userSelect: 'none'
  },
  methodCardActive: {
    backgroundColor: 'var(--blue-50)',
    borderColor: 'var(--blue-500)',
    color: 'var(--blue-900)'
  },
  methodCardInactive: {
    backgroundColor: '#ffffff',
    borderColor: 'var(--border-color)',
    color: 'var(--neutral-700)'
  },
  cashSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  prefix: {
    position: 'absolute',
    left: '1px',
    top: '1px',
    bottom: '1px',
    width: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--neutral-50)',
    borderRight: '1px solid var(--border-color)',
    borderTopLeftRadius: '7px',
    borderBottomLeftRadius: '7px',
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-500)'
  },
  presetBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  changeCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'var(--red-50)',
    color: 'var(--red-600)',
    borderRadius: '6px',
    fontSize: '0.813rem',
    fontWeight: 500
  },
  nonCashNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    backgroundColor: 'var(--blue-50)',
    borderRadius: '10px',
    border: '1px solid var(--blue-100)'
  },
  footerActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px'
  }
};
