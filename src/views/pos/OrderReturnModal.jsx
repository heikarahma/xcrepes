import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '../../controllers/OrderController';
import { useAuth } from '../../controllers/AuthController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { 
  RotateCcw, 
  AlertOctagon, 
  Search, 
  ChevronDown, 
  Check, 
  X, 
  ShoppingBag, 
  Clock, 
  Edit3, 
  User,
  Receipt,
  FileText
} from 'lucide-react';

export const OrderReturnModal = () => {
  const { 
    orderReturnModalState, 
    closeOrderReturnModal, 
    recordOrderReturn,
    orders = []
  } = useOrder();
  const { currentUser } = useAuth();

  const { isOpen, order: initialOrder } = orderReturnModalState;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter completed non-returned orders for selection
  const eligibleOrders = orders.filter(o => o.status !== 'returned');

  useEffect(() => {
    if (isOpen) {
      if (initialOrder && initialOrder.status !== 'returned') {
        setSelectedOrder(initialOrder);
      } else if (eligibleOrders.length > 0) {
        setSelectedOrder(eligibleOrders[0]);
      } else {
        setSelectedOrder(null);
      }

      setReasonText('');
      setSearchOrderQuery('');
      setIsDropdownOpen(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialOrder, orders]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  if (!isOpen) return null;

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

  // Filtered eligible orders for dropdown
  const filteredEligible = eligibleOrders.filter(o => {
    if (!searchOrderQuery.trim()) return true;
    const q = searchOrderQuery.toLowerCase().trim();
    const matchInv = (o.invoiceNumber || '').toLowerCase().includes(q);
    const matchCust = (o.customerName || '').toLowerCase().includes(q);
    const matchTable = (o.tableNumber || '').toLowerCase().includes(q);
    const matchItems = (o.items || []).some(it => 
      (it.name || '').toLowerCase().includes(q) ||
      (it.toppings || []).some(t => (t.name || '').toLowerCase().includes(q))
    );
    return matchInv || matchCust || matchTable || matchItems;
  });

  const validate = () => {
    const err = {};
    if (!selectedOrder) {
      err.order = 'Pilih pesanan yang akan diretur terlebih dahulu.';
    }
    if (!reasonText.trim()) {
      err.reason = 'Alasan retur pesanan wajib diisi secara manual.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    // Otomatis merekam data akun pengguna yang sedang aktif login
    const currentUserName = currentUser?.nama || currentUser?.name || currentUser?.username || 'Kasir';

    setIsSubmitting(true);
    let result;
    try {
      result = await recordOrderReturn({
        orderId: selectedOrder.id,
        reasonCategory: reasonText.trim(),
        note: '',
        photo: null,
        user: currentUserName
      });
    } catch (err) {
      result = { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }

    if (result && result.success) {
      setSelectedOrder(null);
      setReasonText('');
      setSearchOrderQuery('');
      setIsDropdownOpen(false);
      setErrors({});
      closeOrderReturnModal();
    } else {
      setErrors({ form: result?.error || 'Gagal memproses retur pesanan.' });
    }
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setReasonText('');
    setSearchOrderQuery('');
    setIsDropdownOpen(false);
    setErrors({});
    closeOrderReturnModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Form Retur Pesanan Gagal Buat"
      subtitle="Catat pesanan crepes yang gagal dimasak, gosong, robek, atau salah racikan."
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="danger"
            icon={RotateCcw}
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedOrder}
          >
            {isSubmitting ? 'Memproses Retur...' : 'Konfirmasi Retur Pesanan'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Warning Banner Kebijakan Bahan Terpakai */}
        <div style={styles.warningBanner}>
          <AlertOctagon size={18} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.813rem', color: '#7f1d1d', lineHeight: 1.4 }}>
            <strong>Kebijakan Bahan Terpakai:</strong> Bahan baku yang telah digunakan untuk membuat pesanan ini <strong>tetap berkurang</strong> dari stok dapur dan tercatat sebagai pemakaian/waste bahan.
          </div>
        </div>

        {errors.form && (
          <div style={styles.errorAlert}>
            {errors.form}
          </div>
        )}

        {/* 1. SEARCHABLE DROPDOWN: PILIH PESANAN TRANSAKSI */}
        <div className="blue-input-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Receipt size={14} color="var(--blue-600)" />
              <span>Pilih Pesanan Transaksi <span style={{ color: 'var(--red-500)' }}>*</span></span>
            </span>
            <span style={{ fontSize: '0.719rem', color: 'var(--neutral-500)' }}>
              {eligibleOrders.length} transaksi aktif
            </span>
          </label>

          {eligibleOrders.length === 0 ? (
            <div style={styles.emptyOrdersNotice}>
              Tidak ada pesanan aktif yang dapat diretur saat ini.
            </div>
          ) : (
            <>
              {/* Trigger Button */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsDropdownOpen(prev => !prev)}
                style={{
                  ...styles.dropdownTrigger,
                  borderColor: errors.order ? 'var(--red-500)' : isDropdownOpen ? 'var(--blue-500)' : 'var(--border-color)',
                  boxShadow: isDropdownOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                {selectedOrder ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0, gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <span style={styles.selectedInvoiceBadge}>
                        #{selectedOrder.invoiceNumber}
                      </span>
                      <span style={{ fontSize: '0.844rem', fontWeight: 600, color: 'var(--neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedOrder.customerName || 'Pelanggan Walk-In'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        • {(selectedOrder.items || []).map(it => `${it.quantity}x ${it.name}`).join(', ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={styles.selectedPriceBadge}>
                        {formatIDR(selectedOrder.totalAmount)}
                      </span>
                      <ChevronDown size={16} color="var(--neutral-400)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ color: 'var(--neutral-400)', fontSize: '0.844rem' }}>
                      Cari no. invoice, nama pelanggan, atau menu pesanan...
                    </span>
                    <ChevronDown size={16} color="var(--neutral-400)" />
                  </div>
                )}
              </div>

              {/* Dropdown Menu with Live Search */}
              {isDropdownOpen && (
                <div style={styles.dropdownMenu}>
                  {/* Search Input Box */}
                  <div style={styles.searchBoxWrapper}>
                    <div style={styles.searchInputInnerWrap}>
                      <Search size={15} color="var(--neutral-400)" style={styles.searchIconInside} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Ketik invoice (#INV...), nama pelanggan, meja, atau nama menu..."
                        value={searchOrderQuery}
                        onChange={(e) => setSearchOrderQuery(e.target.value)}
                        style={styles.dropdownSearchInput}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchOrderQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchOrderQuery('')}
                          style={styles.clearSearchBtn}
                          title="Hapus pencarian"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of Orders */}
                  <div style={styles.ordersListContainer}>
                    {filteredEligible.length === 0 ? (
                      <div style={styles.emptySearchResult}>
                        <Search size={20} color="var(--neutral-300)" />
                        <span>Tidak ditemukan transaksi yang cocok dengan "{searchOrderQuery}"</span>
                      </div>
                    ) : (
                      filteredEligible.map((order) => {
                        const isSelected = selectedOrder?.id === order.id;
                        return (
                          <div
                            key={order.id}
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDropdownOpen(false);
                              if (errors.order) setErrors(prev => ({ ...prev, order: '' }));
                            }}
                            style={{
                              ...styles.orderOptionItem,
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              borderColor: isSelected ? '#bfdbfe' : '#f1f5f9'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={styles.optionInvoiceBadge}>
                                  #{order.invoiceNumber}
                                </span>
                                <span style={{ fontSize: '0.844rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                                  {order.customerName || 'Pelanggan Walk-In'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                                  ({order.tableNumber || 'Takeaway'})
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={styles.optionPriceBadge}>
                                  {formatIDR(order.totalAmount)}
                                </span>
                                {isSelected && <Check size={16} color="var(--blue-600)" />}
                              </div>
                            </div>

                            {/* Item Menu Summary */}
                            <div style={styles.optionItemsList}>
                              {(order.items || []).map((it, idx) => (
                                <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--neutral-700)' }}>
                                  <strong style={{ color: 'var(--neutral-900)' }}>{it.quantity}x</strong> {it.name}
                                  {it.toppings && it.toppings.length > 0 && (
                                    <span style={{ fontSize: '0.688rem', color: 'var(--orange-600)', marginLeft: '3px' }}>
                                      (+{it.toppings.map(t => t.name).join(', ')})
                                    </span>
                                  )}
                                  {idx < (order.items.length - 1) && <span style={{ color: 'var(--neutral-300)', margin: '0 4px' }}>•</span>}
                                </span>
                              ))}
                            </div>

                            {/* Time & Cashier */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.688rem', color: 'var(--neutral-400)', marginTop: '2px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={10} /> {formatDate(order.date)}
                              </span>
                              <span>•</span>
                              <span>Kasir: {order.cashierName || 'Kasir'}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {errors.order && <span style={styles.errorText}>{errors.order}</span>}
        </div>

        {/* Selected Order Summary Card (Jika sudah dipilih) */}
        {selectedOrder && (
          <div style={styles.selectedOrderCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={15} color="var(--blue-600)" />
                <span style={{ fontSize: '0.844rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  Rincian Item yang Dibatalkan / Diretur:
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                {formatDate(selectedOrder.date)}
              </span>
            </div>

            <div style={styles.selectedItemsDetailList}>
              {(selectedOrder.items || []).map((item, idx) => (
                <div key={idx} style={styles.selectedItemRow}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
                      {item.quantity}x {item.name}
                    </span>
                    {item.toppings && item.toppings.length > 0 && (
                      <div style={{ fontSize: '0.719rem', color: 'var(--orange-600)', marginTop: '1px' }}>
                        Topping: + {item.toppings.map(t => t.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--neutral-700)', fontSize: '0.813rem' }}>
                    {formatIDR((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.selectedOrderTotalRow}>
              <span style={{ fontSize: '0.781rem', color: 'var(--neutral-600)' }}>
                Total Transaksi yang Dibatalkan:
              </span>
              <span style={{ fontSize: '0.938rem', fontWeight: 800, color: 'var(--blue-700)' }}>
                {formatIDR(selectedOrder.totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* 2. ALASAN RETUR (INPUT TEXT MANUAL) */}
        <div className="blue-input-group">
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={14} color="var(--blue-600)" />
            <span>Alasan Retur / Kegagalan Pembuatan <span style={{ color: 'var(--red-500)' }}>*</span></span>
          </label>
          <input
            type="text"
            className="blue-input"
            value={reasonText}
            onChange={(e) => {
              setReasonText(e.target.value);
              if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
            }}
            placeholder="Ketik alasan retur (contoh: Adonan crepes gosong, robek saat dilipat, salah topping, dll)..."
            style={{ height: '42px', fontSize: '0.875rem' }}
            required
            autoFocus
          />
          {errors.reason && <span style={styles.errorText}>{errors.reason}</span>}
          <div style={{ fontSize: '0.719rem', color: 'var(--neutral-500)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} color="var(--neutral-400)" />
            <span>
              Petugas pencatat otomatis: <strong>{currentUser?.nama || currentUser?.name || currentUser?.username || 'Kasir Aktif'}</strong>
            </span>
          </div>
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
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2'
  },
  errorAlert: {
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '0.813rem',
    border: '1px solid #fecaca'
  },
  emptyOrdersNotice: {
    padding: '12px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.813rem',
    color: 'var(--neutral-500)'
  },
  dropdownTrigger: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    minHeight: '46px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    userSelect: 'none'
  },
  selectedInvoiceBadge: {
    fontSize: '0.75rem',
    fontWeight: 800,
    backgroundColor: '#eff6ff',
    color: 'var(--blue-700)',
    border: '1px solid #bfdbfe',
    padding: '2px 6px',
    borderRadius: '4px',
    flexShrink: 0
  },
  selectedPriceBadge: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--blue-700)',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    zIndex: 99,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  searchBoxWrapper: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc'
  },
  searchInputInnerWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  searchIconInside: {
    position: 'absolute',
    left: '11px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2
  },
  dropdownSearchInput: {
    width: '100%',
    height: '38px',
    padding: '0 32px 0 34px',
    borderRadius: '7px',
    border: '1px solid #cbd5e1',
    fontSize: '0.813rem',
    backgroundColor: '#ffffff',
    outline: 'none',
    color: 'var(--neutral-900)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    backgroundColor: '#f1f5f9',
    color: 'var(--neutral-500)',
    cursor: 'pointer',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    zIndex: 2,
    transition: 'background-color 0.15s ease'
  },
  ordersListContainer: {
    maxHeight: '260px',
    overflowY: 'auto',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  emptySearchResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '24px 12px',
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    textAlign: 'center'
  },
  orderOptionItem: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  optionInvoiceBadge: {
    fontSize: '0.719rem',
    fontWeight: 800,
    backgroundColor: '#f1f5f9',
    color: 'var(--neutral-800)',
    padding: '1px 5px',
    borderRadius: '4px'
  },
  optionPriceBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--blue-700)',
    backgroundColor: '#eff6ff',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  optionItemsList: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: '2px'
  },
  selectedOrderCard: {
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  selectedItemsDetailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '120px',
    overflowY: 'auto',
    borderTop: '1px dashed #e2e8f0',
    borderBottom: '1px dashed #e2e8f0',
    padding: '8px 0'
  },
  selectedItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.813rem'
  },
  selectedOrderTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '2px'
  },
  errorText: {
    fontSize: '0.75rem',
    color: 'var(--red-500)',
    marginTop: '3px',
    display: 'block'
  }
};
