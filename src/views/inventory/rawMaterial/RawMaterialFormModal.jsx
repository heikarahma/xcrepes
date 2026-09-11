import React, { useState, useEffect, useRef } from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Package, Save, Plus, Ruler, Search, ChevronDown, Check, X } from 'lucide-react';

export const RawMaterialFormModal = () => {
  const { formModalState, closeFormModal, addRawMaterial, updateRawMaterial, availableUnits } = useRawMaterial();
  const { isOpen, mode, item } = formModalState;

  const [formData, setFormData] = useState({
    name: '',
    unitName: '',
    stock: '',
    pricePerUnit: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Searchable Select State
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && item) {
        setFormData({
          name: item.name || '',
          unitName: item.unitName || '',
          stock: String(Number(item.stock ?? item.currentStock ?? 0) || 0),
          pricePerUnit: String(Number(item.pricePerUnit ?? 0) || 0)
        });
      } else {
        setFormData({
          name: '',
          unitName: '',
          stock: '',
          pricePerUnit: ''
        });
      }
      setErrors({});
      setIsSubmitting(false);
      setIsUnitDropdownOpen(false);
      setUnitSearchQuery('');
    }
  }, [isOpen, mode, item, availableUnits]);

  // Click outside listener to close searchable select
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUnitDropdownOpen(false);
      }
    };
    if (isUnitDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUnitDropdownOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectUnit = (unitName) => {
    setFormData(prev => ({ ...prev, unitName }));
    if (errors.unitName) {
      setErrors(prev => ({ ...prev, unitName: '' }));
    }
    setIsUnitDropdownOpen(false);
    setUnitSearchQuery('');
  };

  // Filter units based on search query
  const filteredUnits = availableUnits.filter(u =>
    u.name.toLowerCase().includes(unitSearchQuery.toLowerCase().trim())
  );

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) {
      err.name = 'Nama bahan baku wajib diisi!';
    }
    if (!formData.unitName) {
      err.unitName = 'Silakan pilih jenis satuan ukur!';
    }
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      err.stock = 'Jumlah stok harus angka valid minimal 0!';
    }
    if (formData.pricePerUnit === '' || isNaN(Number(formData.pricePerUnit)) || Number(formData.pricePerUnit) < 0) {
      err.pricePerUnit = 'Harga per unit harus angka valid minimal 0!';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    let result;
    const payload = {
      name: formData.name.trim(),
      unitName: formData.unitName,
      stock: Number(formData.stock) || 0,
      pricePerUnit: Number(formData.pricePerUnit) || 0
    };

    try {
      if (mode === 'edit' && item) {
        result = await updateRawMaterial(item.id, payload);
      } else {
        result = await addRawMaterial(payload);
      }
    } catch (err) {
      result = { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }

    if (result && result.success) {
      setFormData({
        name: '',
        unitName: '',
        stock: '',
        pricePerUnit: ''
      });
      setErrors({});
      setIsUnitDropdownOpen(false);
      setUnitSearchQuery('');
      closeFormModal();
    } else {
      setErrors({ form: result?.error || 'Gagal menyimpan bahan baku.' });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      unitName: '',
      stock: '',
      pricePerUnit: ''
    });
    setErrors({});
    setIsUnitDropdownOpen(false);
    setUnitSearchQuery('');
    closeFormModal();
  };

  const isEdit = mode === 'edit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Ubah Bahan Baku' : 'Tambah Bahan Baku'}
      subtitle={isEdit ? 'Perbarui stok atau harga beli bahan.' : 'Catat stok fisik dan harga beli bahan baku.'}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            icon={isEdit ? Save : Plus}
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim() || !formData.unitName}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Bahan'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Error Alert */}
        {errors.form && (
          <div style={styles.errorAlert}>
            {errors.form}
          </div>
        )}

        {/* 1. Input: Nama Bahan Baku */}
        <Input
          label="Nama Bahan Baku"
          placeholder="Contoh: Tepung Terigu Segitiga Biru"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          autoFocus
          icon={Package}
          helperText="Nama bahan baku untuk resep produk."
        />

        {/* 2. Search & Select: Jenis Satuan Ukur (Diambil dari Master Satuan Ukur) */}
        <div className="blue-input-group" ref={dropdownRef}>
          <label className="blue-label">
            Satuan Ukur <span style={{ color: 'var(--red-500)' }}>*</span>
          </label>
          
          <div style={{ position: 'relative' }}>
            {/* Custom Trigger Box dengan Posisi Icon Presisi */}
            <div
              onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
              className={`blue-input ${errors.unitName ? 'has-error' : ''}`}
              style={{
                ...styles.selectTrigger,
                borderColor: isUnitDropdownOpen ? 'var(--blue-500)' : errors.unitName ? 'var(--red-500)' : 'var(--border-color)',
                boxShadow: isUnitDropdownOpen ? 'var(--shadow-focus-ring)' : 'none'
              }}
            >
              {/* Icon Ruler rata kiri persis seperti field input lainnya */}
              <div style={styles.triggerIconWrapper}>
                <Ruler size={18} color="var(--neutral-400)" />
              </div>

              <span style={{ 
                color: formData.unitName ? 'var(--neutral-900)' : 'var(--neutral-400)',
                fontWeight: formData.unitName ? 600 : 400,
                fontSize: '0.938rem',
                flex: 1
              }}>
                {formData.unitName || 'Pilih atau cari satuan ukur...'}
              </span>

              <ChevronDown
                size={16}
                color="var(--neutral-400)"
                style={{
                  transform: isUnitDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-fast)',
                  flexShrink: 0
                }}
              />
            </div>

            {/* Dropdown Popup Menu dengan Search Box Rapi */}
            {isUnitDropdownOpen && (
              <div style={styles.dropdownPopup}>
                {/* Search Input inside Dropdown */}
                <div style={styles.dropdownSearchWrapper}>
                  <div style={styles.dropdownSearchRelative}>
                    <Search size={15} color="var(--neutral-400)" style={styles.dropdownSearchIcon} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Ketik untuk mencari satuan..."
                      value={unitSearchQuery}
                      onChange={(e) => setUnitSearchQuery(e.target.value)}
                      style={styles.dropdownSearchInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {unitSearchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnitSearchQuery('');
                        }}
                        style={styles.clearSearchBtn}
                        aria-label="Hapus teks pencarian"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* List of Filtered Units */}
                <div style={styles.dropdownList}>
                  {filteredUnits.length === 0 ? (
                    <div style={styles.dropdownEmptyState}>
                      Satuan ukur "{unitSearchQuery}" tidak ditemukan.
                    </div>
                  ) : (
                    filteredUnits.map((u) => {
                      const isSelected = formData.unitName === u.name;
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUnit(u.name)}
                          className="unit-option-item"
                          style={{
                            ...styles.optionItem,
                            backgroundColor: isSelected ? 'var(--blue-50)' : 'transparent',
                            color: isSelected ? 'var(--blue-700)' : 'var(--neutral-800)',
                            fontWeight: isSelected ? 700 : 500
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Ruler size={14} color={isSelected ? 'var(--blue-500)' : 'var(--neutral-400)'} />
                            <span>{u.name}</span>
                          </div>
                          {isSelected && <Check size={15} color="var(--blue-600)" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {errors.unitName ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--red-500)' }}>{errors.unitName}</span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
              Takaran yang dipakai untuk bahan baku ini.
            </span>
          )}
        </div>

        {/* 3. Input Group: Stok & Harga Satuan (2 Kolom) */}
        <div className="raw-material-grid" style={styles.twoColumnGrid}>
          {/* Jumlah Stok Saat Ini */}
          <Input
            label={`Jumlah Stok (${formData.unitName || 'Unit'})`}
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={formData.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            error={errors.stock}
            required
            helperText="Jumlah fisik yang tersedia."
          />

          {/* Harga per Unit Satuan */}
          <Input
            label={`Harga Beli per ${formData.unitName || 'Unit'} (Rp)`}
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={formData.pricePerUnit}
            onChange={(e) => handleChange('pricePerUnit', e.target.value)}
            error={errors.pricePerUnit}
            required
            helperText="Harga modal per 1 satuan."
          />
        </div>
      </form>

      <style>{`
        .unit-option-item:hover {
          background-color: var(--blue-50) !important;
          color: var(--blue-700) !important;
        }
        @media (max-width: 480px) {
          .raw-material-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Modal>
  );
};

const styles = {
  errorAlert: {
    padding: '10px 14px',
    backgroundColor: 'var(--red-50)',
    border: '1px solid var(--red-200)',
    color: 'var(--red-600)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.813rem',
    fontWeight: 600
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  selectTrigger: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '2.5rem',
    paddingRight: '14px',
    height: '42px',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: 'var(--bg-surface)'
  },
  triggerIconWrapper: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  dropdownPopup: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
    overflow: 'hidden',
    animation: 'fadeIn 0.15s ease forwards'
  },
  dropdownSearchWrapper: {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--neutral-50)'
  },
  dropdownSearchRelative: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  dropdownSearchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2
  },
  dropdownSearchInput: {
    width: '100%',
    paddingLeft: '36px',
    paddingRight: '32px',
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '0.813rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--neutral-white)',
    outline: 'none',
    color: 'var(--neutral-800)',
    boxSizing: 'border-box'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--neutral-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '2px',
    zIndex: 2
  },
  dropdownList: {
    maxHeight: '180px',
    overflowY: 'auto',
    padding: '4px'
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.813rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  dropdownEmptyState: {
    padding: '16px 12px',
    textAlign: 'center',
    fontSize: '0.813rem',
    color: 'var(--neutral-400)'
  }
};
