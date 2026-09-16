import React from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useSettings } from '../../controllers/SettingsController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  User, 
  PlusCircle, 
  Receipt
} from 'lucide-react';

export const ReceiptModal = () => {
  const { completedReceipt, isReceiptModalOpen, closeReceiptModal } = useOrder();
  const { settings } = useSettings();

  if (!isReceiptModalOpen || !completedReceipt) return null;

  // Currency formatter
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt');
    if (!printContent) return;

    // Buka jendela/tab baru khusus untuk pratinjau struk PDF
    const printWindow = window.open(
      '',
      '_blank',
      'width=460,height=750,top=80,left=100,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
    );

    if (!printWindow) {
      // Fallback jika popup diblokir browser
      window.print();
      return;
    }

    const paperWidth = settings.paperSize === '80mm' ? '80mm' : '58mm';
    const paperContentWidth = settings.paperSize === '80mm' ? '76mm' : '58mm';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Pratinjau Struk - ${completedReceipt.invoiceNumber}</title>
          <style>
            @page {
              size: ${paperWidth} auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              background-color: #e2e8f0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
              color: #000000;
              padding: 16px 10px 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            .toolbar {
              display: flex;
              gap: 10px;
              margin-bottom: 16px;
              position: sticky;
              top: 10px;
              z-index: 100;
              background: rgba(255, 255, 255, 0.92);
              backdrop-filter: blur(8px);
              padding: 8px 14px;
              border-radius: 30px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.12);
            }
            .btn {
              padding: 8px 18px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 20px;
              cursor: pointer;
              border: none;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              transition: all 0.15s ease;
            }
            .btn-print {
              background-color: #0072FF;
              color: #ffffff;
            }
            .btn-print:hover {
              background-color: #005BC6;
            }
            .btn-close {
              background-color: #f1f5f9;
              color: #475569;
              border: 1px solid #cbd5e1;
            }
            .btn-close:hover {
              background-color: #e2e8f0;
            }
            .receipt-paper {
              background-color: #ffffff;
              width: ${paperContentWidth};
              min-width: ${paperContentWidth};
              max-width: ${paperContentWidth};
              padding: 4mm 3mm 8mm 3mm;
              border-radius: 4px;
              box-shadow: 0 4px 18px rgba(0,0,0,0.12);
              font-family: 'Courier New', Courier, monospace, sans-serif;
              font-size: 8.5pt;
              line-height: 1.3;
              color: #000000;
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            svg {
              display: inline-block;
              vertical-align: middle;
            }
            @media print {
              @page {
                size: ${paperWidth} auto;
                margin: 0;
              }
              body {
                background: #ffffff !important;
                padding: 0 !important;
              }
              .toolbar {
                display: none !important;
              }
              .receipt-paper {
                box-shadow: none !important;
                border-radius: 0 !important;
                padding: 2mm 3mm 6mm 3mm !important;
                width: ${paperContentWidth} !important;
                max-width: ${paperContentWidth} !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <button class="btn btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
            <button class="btn btn-close" onclick="window.close()">Tutup</button>
          </div>

          <div class="receipt-paper">
            ${printContent.innerHTML}
          </div>

          <script>
            // Buka dialog cetak browser / preview PDF otomatis setelah halaman terbuka
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.print();
              }, 350);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const formattedDate = new Date(completedReceipt.date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Modal
      isOpen={isReceiptModalOpen}
      onClose={closeReceiptModal}
      title="Transaksi Berhasil"
      subtitle={`No. Faktur: ${completedReceipt.invoiceNumber}`}
      size="sm"
    >
      <div style={styles.container}>
        {/* Success Banner */}
        <div style={styles.successBanner} className="no-print">
          <CheckCircle2 size={32} color="var(--emerald-600)" />
          <span style={{ fontSize: '0.938rem', fontWeight: 800, color: 'var(--emerald-800)' }}>
            Pembayaran Berhasil!
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-600)' }}>
            Pesanan telah dicatat dan struk siap dicetak.
          </span>
        </div>

        {/* Receipt Paper Card (Ukuran Thermal Printer) */}
        <div 
          style={{
            ...styles.receiptPaper,
            maxWidth: settings.paperSize === '80mm' ? '360px' : 'min(280px, 100%)'
          }} 
          id="printable-receipt"
        >
          {/* Receipt Header */}
          <div style={styles.receiptHeader}>
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Logo Struk"
                style={{
                  maxHeight: '44px',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  marginBottom: '4px',
                  filter: 'grayscale(100%) contrast(140%)'
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {!settings.logo && <Receipt size={15} color="var(--neutral-800)" />}
              <span style={styles.storeName}>{settings.receiptTitle || settings.storeName || 'XCrepes & Cafe'}</span>
            </div>
            {(settings.receiptSubtitle || settings.address) && (
              <span style={styles.receiptMeta}>{settings.receiptSubtitle || settings.address}</span>
            )}
            {(settings.receiptPhone || settings.phone) && (
              <span style={styles.receiptMeta}>{settings.receiptPhone || settings.phone}</span>
            )}
            <div style={styles.headerSeparator} />
            <div style={styles.metaRow}>
              <span>No: <strong>{completedReceipt.invoiceNumber}</strong></span>
              <span>{formattedDate}</span>
            </div>
            {(settings.showCashierName || settings.showTableNumber) && (
              <div style={styles.metaRow}>
                {settings.showCashierName && <span>Kasir: {completedReceipt.cashierName || 'Kasir 1'}</span>}
                {settings.showTableNumber && <span>Meja: <strong>{completedReceipt.tableNumber || 'Takeaway'}</strong></span>}
              </div>
            )}
            {settings.showCustomerName && (
              <div style={styles.metaRow}>
                <span>Pelanggan: <strong>{completedReceipt.customerName || 'Umum'}</strong></span>
              </div>
            )}
          </div>

          <div style={styles.dottedDivider} />

          {/* Items List */}
          <div style={styles.itemsList}>
            {completedReceipt.items.map((item, index) => {
              const lineDisc = item.itemDiscountAmount || item.lineDiscount || 0;
              const lineGross = item.unitPrice * item.quantity;
              const lineNet = Math.max(0, lineGross - lineDisc);
              return (
                <div key={index} style={styles.itemRow}>
                  {/* Item Name */}
                  <span style={styles.itemName}>
                    {item.name}
                  </span>

                  {/* Qty x Price & Line Total */}
                  <div style={styles.itemPriceBreakdown}>
                    <span style={styles.itemQtyPrice}>
                      {item.quantity} x {formatIDR(item.unitPrice)}
                    </span>
                    <span style={styles.itemPrice}>
                      {formatIDR(lineGross)}
                    </span>
                  </div>

                  {/* Toppings indented */}
                  {item.toppings && item.toppings.length > 0 ? (
                    <div style={styles.itemToppingList}>
                      {item.toppings.map((top, tIdx) => {
                        const topQty = Number(top.quantity) || 1;
                        const topPrice = Number(top.price) || 0;
                        const topTotal = topPrice * topQty * (item.quantity || 1);
                        return (
                          <div key={tIdx} style={styles.toppingRow}>
                            <span>
                              + {top.name} {topQty > 1 ? `(${topQty}x)` : ''}
                              {item.quantity > 1 ? ` (${item.quantity}x @${formatIDR(topPrice * topQty)})` : (topQty > 1 ? ` (@${formatIDR(topPrice)})` : '')}
                            </span>
                            <span>{formatIDR(topTotal)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Item Discount Sub-row */}
                  {lineDisc > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.688rem', color: 'var(--emerald-700)', paddingLeft: '8px', fontWeight: 600 }}>
                      <span>
                        * Diskon Item {item.itemDiscountType === 'percent' ? `(${item.itemDiscountValue}%)` : ''}
                      </span>
                      <span>-{formatIDR(lineDisc)}</span>
                    </div>
                  )}

                  {settings.showNotes && item.note && (
                    <span style={styles.itemNote}>*{item.note}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.dottedDivider} />

          {/* Totals & Billing */}
          <div style={styles.totalSection}>
            <div style={styles.summaryRow}>
              <span>Total Item</span>
              <span>{completedReceipt.totalItemsCount || completedReceipt.items.reduce((s, i) => s + i.quantity, 0)} pcs</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatIDR(completedReceipt.subtotal)}</span>
            </div>

            {/* Item Discounts Total if any */}
            {Number(completedReceipt.itemsDiscountTotal) > 0 && (
              <div style={{ ...styles.summaryRow, color: 'var(--emerald-700)', fontWeight: 600 }}>
                <span>Diskon Item</span>
                <span>-{formatIDR(completedReceipt.itemsDiscountTotal)}</span>
              </div>
            )}

            {/* Order Discount: only displayed if > 0 */}
            {Number(completedReceipt.orderDiscountAmount || (completedReceipt.discount && !completedReceipt.itemsDiscountTotal ? completedReceipt.discount : 0)) > 0 && (
              <div style={{ ...styles.summaryRow, color: 'var(--emerald-700)', fontWeight: 600 }}>
                <span>
                  Diskon Pesanan
                  {completedReceipt.orderDiscountType === 'percent' && completedReceipt.orderDiscountValue > 0
                    ? ` (${completedReceipt.orderDiscountValue}%)`
                    : ''}
                </span>
                <span>-{formatIDR(completedReceipt.orderDiscountAmount || completedReceipt.discount)}</span>
              </div>
            )}

            <div style={styles.grandTotalRow}>
              <span>TOTAL</span>
              <span>{formatIDR(completedReceipt.totalAmount)}</span>
            </div>

            <div style={styles.summaryRow}>
              <span>Metode Bayar</span>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                {completedReceipt.paymentMethod}
              </span>
            </div>

            {completedReceipt.paymentMethod === 'cash' ? (
              <>
                <div style={styles.summaryRow}>
                  <span>Tunai Diterima</span>
                  <span>{formatIDR(completedReceipt.cashReceived)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Kembalian</span>
                  <span style={{ fontWeight: 700 }}>{formatIDR(completedReceipt.changeAmount)}</span>
                </div>
              </>
            ) : (
              <div style={styles.summaryRow}>
                <span>Status</span>
                <span style={{ fontWeight: 700, color: 'var(--emerald-700)' }}>LUNAS</span>
              </div>
            )}
          </div>

          <div style={styles.dottedDivider} />

          {/* Footer Note */}
          <div style={styles.receiptFooter}>
            {settings.receiptFooter1 && <span>{settings.receiptFooter1}</span>}
            {settings.receiptFooter2 && <span>{settings.receiptFooter2}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons} className="no-print">
          <Button
            type="button"
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
            style={{ flex: 1, padding: '10px 0', fontSize: '0.875rem' }}
          >
            Cetak
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={PlusCircle}
            onClick={closeReceiptModal}
            style={{ flex: 1.2, padding: '10px 0', fontSize: '0.875rem' }}
          >
            Transaksi Baru
          </Button>
        </div>

        {/* Standard POS Thermal Receipt Print Styling */}
        <style>{`
          @media (max-width: 480px) {
            #printable-receipt {
              padding: 10px 8px !important;
            }
          }
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            html, body {
              width: 58mm !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .blue-modal-backdrop, .blue-modal, .blue-modal-body,
            .app-container, .app-main, .app-content {
              position: static !important;
              display: block !important;
              inset: auto !important;
              width: 100% !important;
              max-width: 58mm !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
              transform: none !important;
              animation: none !important;
            }
            .app-navbar, .app-sidebar, .blue-modal-header, .blue-modal-footer, .no-print {
              display: none !important;
            }
            body * {
              visibility: hidden !important;
            }
            #printable-receipt, #printable-receipt * {
              visibility: visible !important;
            }
            #printable-receipt {
              position: relative !important;
              left: 0 !important;
              top: 0 !important;
              width: 58mm !important;
              max-width: 58mm !important;
              min-width: 58mm !important;
              margin: 0 !important;
              padding: 2mm 3mm 8mm 3mm !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Courier New', Courier, monospace, monospace !important;
              font-size: 8.5pt !important;
              line-height: 1.25 !important;
              box-sizing: border-box !important;
            }
            #printable-receipt * {
              color: #000000 !important;
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
    gap: '14px'
  },
  successBanner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: 'var(--emerald-50)',
    borderRadius: '8px',
    border: '1px solid var(--emerald-200)',
    gap: '4px'
  },
  receiptPaper: {
    backgroundColor: '#ffffff',
    border: '1px dashed var(--neutral-300)',
    borderRadius: '6px',
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    maxWidth: 'min(280px, 100%)',
    margin: '0 auto',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", monospace'
  },
  receiptHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '2px'
  },
  storeName: {
    fontSize: '0.938rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  receiptMeta: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)'
  },
  headerSeparator: {
    width: '100%',
    borderBottom: '1px dashed var(--neutral-300)',
    margin: '4px 0'
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '0.688rem',
    color: 'var(--neutral-700)'
  },
  dottedDivider: {
    borderBottom: '1px dashed var(--neutral-300)',
    margin: '4px 0'
  },
  customerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--neutral-700)'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  itemName: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    wordBreak: 'break-word'
  },
  itemPriceBreakdown: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  itemQtyPrice: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)'
  },
  itemPrice: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  itemToppingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingLeft: '10px',
    marginTop: '1px'
  },
  toppingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.688rem',
    color: 'var(--neutral-600)'
  },
  itemNote: {
    fontSize: '0.688rem',
    fontStyle: 'italic',
    color: 'var(--amber-700)',
    paddingLeft: '10px',
    marginTop: '1px'
  },
  totalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--neutral-600)'
  },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.938rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    padding: '4px 0',
    borderTop: '1px dashed var(--neutral-300)',
    borderBottom: '1px dashed var(--neutral-300)',
    margin: '2px 0'
  },
  receiptFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.688rem',
    color: 'var(--neutral-400)',
    gap: '2px',
    marginTop: '2px'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    boxSizing: 'border-box',
    flexWrap: 'wrap'
  }
};
