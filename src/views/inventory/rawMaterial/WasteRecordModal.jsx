import React, { useState, useEffect, useRef } from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { useAuth } from '../../../controllers/AuthController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { 
  AlertTriangle, 
  Save, 
  Package, 
  Search, 
  ChevronDown, 
  Check, 
  X 
} from 'lucide-react';

export const WasteRecordModal = () => {
  const { 
    wasteModalState, 
    closeWasteModal, 
    recordMaterialWaste, 
    rawMaterials 
  } = useRawMaterial();
  const { currentUser } = useAuth();

  const { isOpen, item } = wasteModalState;

  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [amount, setAmount] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [searchMaterialQuery, setSearchMaterialQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setSelectedMaterialId(item.id);
      } else if (rawMaterials.length > 0) {
        setSelectedMaterialId(rawMaterials[0].id);
      }
      setAmount('');
      setReasonText('');
      setSearchMaterialQuery('');
      setIsDropdownOpen(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, item, rawMaterials]);

  // Handle click outside to close dropdown
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

  // Focus search input on dropdown open
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  const currentMaterial = rawMaterials.find(m => m.id === selectedMaterialId);
  const currentStock = Number(currentMaterial?.stock ?? currentMaterial?.currentStock ?? 0) || 0;
  const unitName = currentMaterial ? currentMaterial.unitName : 'Unit';
  const currentUserName = currentUser?.nama || currentUser?.name || currentUser?.username || 'Kasir';

  // Filter materials for search select
  const filteredMaterials = rawMaterials.filter(m => {
    const q = searchMaterialQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.unitName || '').toLowerCase().includes(q) ||
      (m.id || '').toLowerCase().includes(q)
    );
  });

  const validate = () => {
    const err = {};
    if (!selectedMaterialId) {
      err.material = 'Pilih bahan baku terlebih dahulu.';
    }
    const numAmount = Number(amount);
    if (amount === '' || isNaN(numAmount) || numAmount <= 0) {
      err.amount = 'Jumlah bahan terbuang harus berupa angka lebih dari 0.';
    } else if (numAmount > currentStock) {
      err.amount = `Jumlah (${numAmount}) melebihi stok saat ini (${currentStock} ${unitName}).`;
    }
    if (!reasonText.trim()) {
      err.reason = 'Alasan pengurangan / kerusakan bahan baku wajib diisi.';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    let result;
    try {
      result = await recordMaterialWaste({
        rawMaterialId: selectedMaterialId,
        amount: Number(amount),
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
      setAmount('');
      setReasonText('');
      setSearchMaterialQuery('');
      setErrors({});
      closeWasteModal();
    } else {
      setErrors({ form: result?.error || 'Gagal mencatat bahan rusak.' });
    }
  };

  const handleClose = () => {
    setAmount('');
    setReasonText('');
    setSearchMaterialQuery('');
    setIsDropdownOpen(false);
    setErrors({});
    closeWasteModal();
  };

  const projectedRemaining = Math.max(0, currentStock - (Number(amount) || 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Catat Bahan Baku Rusak / Expired (Waste)"
      subtitle="Dokumentasikan pengurangan bahan baku karena terbuang, rusak, atau kedaluwarsa."
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="danger"
            icon={Save}
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pencatatan Waste'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <AlertTriangle size={18} color="var(--red-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.813rem', color: '#991b1b', lineHeight: 1.4 }}>
            Stok bahan baku akan <strong>langsung berkurang</strong> dari sistem inventori dan riwayat mutasi akan tercatat secara permanen di audit trail.
          </div>
        </div>

        {errors.form && (
          <div style={styles.errorAlert}>
            {errors.form}
          </div>
        )}

        {/* 1. SEARCH AND SELECT: NAMA BAHAN BAKU */}
        <div className="blue-input-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="blue-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={14} color="var(--blue-600)" />
              <span>Nama Bahan Baku <span style={{ color: 'var(--red-500)' }}>*</span></span>
            </span>
            <span style={{ fontSize: '0.719rem', color: 'var(--neutral-500)' }}>
              {rawMaterials.length} bahan terdaftar
            </span>
          </label>

          {/* Trigger Button */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsDropdownOpen(prev => !prev)}
            style={{
              ...styles.dropdownTrigger,
              borderColor: errors.material ? 'var(--red-500)' : isDropdownOpen ? 'var(--blue-500)' : 'var(--border-color)',
              boxShadow: isDropdownOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none'
            }}
          >
            {currentMaterial ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0, gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentMaterial.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    ...styles.stockBadge,
                    backgroundColor: currentStock <= 5 ? '#fef2f2' : '#f0fdf4',
                    color: currentStock <= 5 ? '#b91c1c' : '#15803d',
                    borderColor: currentStock <= 5 ? '#fecaca' : '#bbf7d0'
                  }}>
                    Sisa: {currentStock} {currentMaterial.unitName}
                  </span>
                  <ChevronDown size={16} color="var(--neutral-400)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ color: 'var(--neutral-400)', fontSize: '0.844rem' }}>
                  Cari dan pilih bahan baku...
                </span>
                <ChevronDown size={16} color="var(--neutral-400)" />
              </div>
            )}
          </div>

          {/* Search & Select Menu Dropdown */}
          {isDropdownOpen && (
            <div style={styles.dropdownMenu}>
              {/* Search Box Input */}
              <div style={styles.searchBoxWrapper}>
                <div style={styles.searchInputInnerWrap}>
                  <Search size={15} color="var(--neutral-400)" style={styles.searchIconInside} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Ketik nama bahan baku atau satuan..."
                    value={searchMaterialQuery}
                    onChange={(e) => setSearchMaterialQuery(e.target.value)}
                    style={styles.dropdownSearchInput}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchMaterialQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchMaterialQuery('')}
                      style={styles.clearSearchBtn}
                      title="Hapus pencarian"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={styles.materialsListContainer}>
                {filteredMaterials.length === 0 ? (
                  <div style={styles.emptySearchResult}>
                    <Search size={20} color="var(--neutral-300)" />
                    <span>Tidak ada bahan baku yang cocok dengan "{searchMaterialQuery}"</span>
                  </div>
                ) : (
                  filteredMaterials.map((mat) => {
                    const isSelected = selectedMaterialId === mat.id;
                    const stockNum = Number(mat.stock ?? mat.currentStock ?? 0) || 0;
                    return (
                      <div
                        key={mat.id}
                        onClick={() => {
                          setSelectedMaterialId(mat.id);
                          setIsDropdownOpen(false);
                          if (errors.material) setErrors(prev => ({ ...prev, material: '', amount: '' }));
                        }}
                        style={{
                          ...styles.materialOptionItem,
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          borderColor: isSelected ? '#bfdbfe' : '#f8fafc'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            {isSelected ? (
                              <Check size={16} color="var(--blue-600)" style={{ flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: '0.875rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--blue-700)' : 'var(--neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {mat.name}
                            </span>
                          </div>
                          <span style={{
                            ...styles.stockBadgeSmall,
                            backgroundColor: stockNum <= 5 ? '#fef2f2' : '#f0fdf4',
                            color: stockNum <= 5 ? '#b91c1c' : '#15803d',
                            borderColor: stockNum <= 5 ? '#fecaca' : '#bbf7d0'
                          }}>
                            {stockNum} {mat.unitName}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {errors.material && <span style={styles.errorText}>{errors.material}</span>}
        </div>

        {/* 2. JUMLAH TERBUANG / BERKURANG & PROYEKSI SISA */}
        <div style={styles.amountBox}>
          <div className="blue-input-group">
            <label className="blue-label">
              Jumlah Berkurang / Terbuang ({unitName}) <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
              }}
              className="blue-input"
              style={{
                height: '42px',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--red-600)',
                borderColor: errors.amount ? 'var(--red-500)' : undefined
              }}
              required
              autoFocus
            />
            {errors.amount && <span style={styles.errorText}>{errors.amount}</span>}
          </div>

          {/* Sisa Proyeksi */}
          {currentMaterial && amount !== '' && !isNaN(Number(amount)) && (
            <div style={styles.projectionBox}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.813rem' }}>
                <span style={{ color: 'var(--neutral-600)' }}>Perubahan Stok:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--neutral-500)', fontWeight: 600 }}>
                    {currentStock} {unitName}
                  </span>
                  <span style={{ color: 'var(--neutral-400)' }}>➔</span>
                  <span style={{ 
                    fontWeight: 800, 
                    color: projectedRemaining <= 5 ? 'var(--red-600)' : 'var(--blue-700)' 
                  }}>
                    {projectedRemaining} {unitName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. ALASAN KERUSAKAN / PENGURANGAN (Input Field Manual) */}
        <div className="blue-input-group">
          <label className="blue-label">
            Alasan Kerusakan / Pengurangan <span style={{ color: 'var(--red-500)' }}>*</span>
          </label>
          <input
            type="text"
            className="blue-input"
            value={reasonText}
            onChange={(e) => {
              setReasonText(e.target.value);
              if (errors.reason) setErrors(prev => ({ ...prev, reason: '' }));
            }}
            placeholder="Ketik alasan (cth: Kemasan bocor, berjamur, expired)..."
            style={{ 
              height: '42px',
              borderColor: errors.reason ? 'var(--red-500)' : undefined 
            }}
            required
          />
          {errors.reason && <span style={styles.errorText}>{errors.reason}</span>}
        </div>
      </form>
    </Modal>
  );
};

const styles = {
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 12px'
  },
  errorAlert: {
    padding: '10px 14px',
    backgroundColor: 'var(--red-50)',
    border: '1px solid var(--red-200)',
    color: 'var(--red-600)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.813rem',
    fontWeight: 600
  },
  errorText: {
    fontSize: '0.75rem',
    color: 'var(--red-500)',
    marginTop: '4px',
    fontWeight: 600
  },
  amountBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  projectionBox: {
    backgroundColor: '#fff1f2',
    border: '1px solid #ffe4e6',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px'
  },
  dropdownTrigger: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    height: '42px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease'
  },
  stockBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid'
  },
  stockBadgeSmall: {
    fontSize: '0.719rem',
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '4px',
    border: '1px solid',
    flexShrink: 0
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  searchBoxWrapper: {
    padding: '8px 10px',
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
    left: '10px',
    pointerEvents: 'none'
  },
  dropdownSearchInput: {
    width: '100%',
    height: '34px',
    paddingLeft: '32px',
    paddingRight: '28px',
    fontSize: '0.813rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: 'var(--neutral-900)'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  materialsListContainer: {
    maxHeight: '210px',
    overflowY: 'auto',
    padding: '4px'
  },
  materialOptionItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    border: '1px solid transparent',
    marginBottom: '2px'
  },
  emptySearchResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 12px',
    gap: '6px',
    color: 'var(--neutral-400)',
    fontSize: '0.813rem',
    textAlign: 'center'
  }
};
