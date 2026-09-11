import React, { useState, useEffect, useRef } from 'react';
import { useTopping } from '../../../controllers/ToppingController';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Package, 
  Coins, 
  AlertCircle, 
  Search, 
  ChevronDown, 
  Check, 
  X 
} from 'lucide-react';

export const ToppingFormModal = () => {
  const { 
    formModalState, 
    closeFormModal, 
    addTopping, 
    updateTopping, 
    availableRawMaterials: toppingMaterials 
  } = useTopping();
  const { rawMaterials = [] } = useRawMaterial();
  const availableRawMaterials = toppingMaterials || rawMaterials || [];

  const { isOpen, mode, item } = formModalState;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Select states
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownIndex(null);
      }
    };
    if (openDropdownIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownIndex]);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && item) {
        setName(item.name || '');
        setPrice(item.price || '');
        setIngredients(
          item.ingredients && item.ingredients.length > 0
            ? item.ingredients.map(ing => ({ ...ing }))
            : [createDefaultIngredient()]
        );
      } else {
        setName('');
        setPrice('');
        setIngredients([createDefaultIngredient()]);
      }
      setErrors({});
      setIsSubmitting(false);
      setOpenDropdownIndex(null);
      setSearchQuery('');
    }
  }, [isOpen, mode, item, availableRawMaterials]);

  // Auto-fill or adjust price based on HPP
  useEffect(() => {
    const list = Array.isArray(availableRawMaterials) ? availableRawMaterials : [];
    if (isOpen && ingredients && ingredients.length > 0) {
      const currentCost = ingredients.reduce((total, ing) => {
        const mat = list.find(m => m.id === ing.rawMaterialId || m.name === ing.rawMaterialName);
        const pricePerUnit = mat ? mat.pricePerUnit : 0;
        const qty = Number(ing.quantity) || 0;
        return total + (pricePerUnit * qty);
      }, 0);
      
      if (price === '' || Number(price) < currentCost) {
        setPrice(currentCost > 0 ? currentCost : '');
      }
    }
  }, [ingredients, isOpen, availableRawMaterials]); // price omitted intentionally

  // Create default ingredient row
  function createDefaultIngredient() {
    return {
      rawMaterialId: '',
      rawMaterialName: '',
      unitName: 'Unit',
      quantity: ''
    };
  }

  if (!isOpen) return null;

  // Handle change for an ingredient row
  const handleIngredientChange = (index, field, value) => {
    const list = Array.isArray(availableRawMaterials) ? availableRawMaterials : [];
    setIngredients(prev => {
      const updated = [...prev];
      if (field === 'rawMaterialId') {
        const selectedMat = list.find(m => m.id === value);
        if (selectedMat) {
          updated[index] = {
            ...updated[index],
            rawMaterialId: selectedMat.id,
            rawMaterialName: selectedMat.name,
            unitName: selectedMat.unitName
          };
        }
      } else if (field === 'quantity') {
        updated[index] = {
          ...updated[index],
          quantity: value
        };
      }
      return updated;
    });

    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }));
    }
  };

  // Add new ingredient row
  const handleAddIngredientRow = () => {
    setIngredients(prev => [...prev, createDefaultIngredient()]);
  };

  // Remove ingredient row
  const handleRemoveIngredientRow = (index) => {
    if (ingredients.length <= 1) {
      setErrors(prev => ({ ...prev, ingredients: 'Topping minimal membutuhkan 1 bahan baku.' }));
      return;
    }
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Helper calculate total estimated recipe cost (HPP)
  const calculateTotalCost = () => {
    const list = Array.isArray(availableRawMaterials) ? availableRawMaterials : [];
    return (ingredients || []).reduce((total, ing) => {
      const mat = list.find(m => m.id === ing.rawMaterialId || m.name === ing.rawMaterialName);
      const pricePerUnit = mat ? mat.pricePerUnit : 0;
      const qty = Number(ing.quantity) || 0;
      return total + (pricePerUnit * qty);
    }, 0);
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Validation
  const validate = () => {
    const err = {};
    if (!name.trim()) {
      err.name = 'Nama topping wajib diisi.';
    }
    
    const currentCost = calculateTotalCost();
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      err.price = 'Harga jual topping tidak valid.';
    } else if (Number(price) < currentCost) {
      err.price = `Harga jual tidak boleh di bawah estimasi modal (${formatIDR(currentCost)}).`;
    }

    if (!ingredients || ingredients.length === 0) {
      err.ingredients = 'Tambahkan minimal 1 bahan baku.';
    } else {
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        if (!ing.rawMaterialId) {
          err.ingredients = `Pilih bahan baku pada baris ke-${i + 1}.`;
          break;
        }
        if (ing.quantity === '' || isNaN(Number(ing.quantity)) || Number(ing.quantity) <= 0) {
          err.ingredients = `Jumlah pemakaian pada baris ke-${i + 1} harus lebih dari 0.`;
          break;
        }
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    let result;
    try {
      if (mode === 'edit' && item) {
        result = await updateTopping(item.id, {
          name,
          price,
          ingredients
        });
      } else {
        result = await addTopping({
          name,
          price,
          ingredients
        });
      }
    } catch (err) {
      result = { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }

    if (result && result.success) {
      setName('');
      setPrice('');
      setIngredients([createDefaultIngredient()]);
      setErrors({});
      setOpenDropdownIndex(null);
      setSearchQuery('');
      closeFormModal();
    } else {
      setErrors(prev => ({ ...prev, form: result?.error || 'Gagal menyimpan data.' }));
    }
  };

  const handleClose = () => {
    setName('');
    setPrice('');
    setIngredients([createDefaultIngredient()]);
    setErrors({});
    setOpenDropdownIndex(null);
    setSearchQuery('');
    closeFormModal();
  };

  const isEdit = mode === 'edit';
  const totalCost = calculateTotalCost();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Ubah Data Topping' : 'Tambah Topping Baru'}
      subtitle={isEdit ? 'Perbarui nama dan takaran resep bahan baku.' : 'Buat varian topping baru dan racikan takaran bahannya.'}
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            icon={isEdit ? Save : Plus}
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Topping'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Error Global */}
        {errors.form && (
          <div style={styles.errorAlert}>
            {errors.form}
          </div>
        )}

        {/* 1. Nama Topping */}
        <Input
          label="Nama Topping"
          placeholder="Contoh: Choco Banana Delight, Keju Oreo Supreme"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          required
          autoFocus
          icon={Sparkles}
          helperText="Nama varian menu topping yang tampil di POS kasir."
        />

        {/* 2. SECTION: KOMPOSISI BAHAN BAKU (RESEP PER PORSI) */}
        <div style={styles.compositionBox}>
          {/* Header Section */}
          <div style={styles.compositionHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="var(--blue-600)" />
                <span style={{ fontWeight: 700, fontSize: '0.938rem', color: 'var(--neutral-900)' }}>
                  Komposisi Resep <span style={{ color: 'var(--red-500)' }}>*</span>
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '4px' }}>
                Pilih bahan baku dan takaran yang digunakan untuk 1 porsi topping ini.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddIngredientRow}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Tambah Bahan
            </Button>
          </div>

          {/* Validation Alert */}
          {errors.ingredients && (
            <div style={styles.ingredientError}>
              <AlertCircle size={14} />
              <span>{errors.ingredients}</span>
            </div>
          )}

          {/* Ingredient Rows */}
          <div style={styles.rowsList} ref={dropdownRef}>
            {ingredients.map((ing, index) => {
              const list = Array.isArray(availableRawMaterials) ? availableRawMaterials : [];
              const currentMat = list.find(m => m.id === ing.rawMaterialId);
              const pricePerUnit = currentMat ? currentMat.pricePerUnit : 0;
              const subtotalCost = pricePerUnit * (Number(ing.quantity) || 0);
              
              const isDropdownOpen = openDropdownIndex === index;
              const filteredMaterials = list.filter(m => 
                (m.name || '').toLowerCase().includes((isDropdownOpen ? searchQuery : '').toLowerCase().trim())
              );

              return (
                <div key={index} className="ingredient-row-item" style={styles.rowItem}>
                  {/* Header Baris (Mobile & Desktop) */}
                  <div style={styles.rowHeader}>
                    <div style={styles.rowTitle}>
                      <div style={styles.indexBadge}>{index + 1}</div>
                      <span style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--neutral-700)' }}>Komposisi Bahan</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredientRow(index)}
                      style={{
                        ...styles.removeBtnText,
                        visibility: ingredients.length > 1 ? 'visible' : 'hidden'
                      }}
                      title="Hapus bahan ini"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="ingredient-grid" style={styles.ingredientGrid}>
                    {/* Search & Select Bahan Baku */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)' }}>Pilih Bahan Baku</label>
                      <div style={{ position: 'relative' }}>
                        <div
                          onClick={() => {
                            setOpenDropdownIndex(isDropdownOpen ? null : index);
                            setSearchQuery('');
                          }}
                          className={`blue-input ${errors.ingredients && !ing.rawMaterialId ? 'has-error' : ''}`}
                          style={{
                            ...styles.selectTrigger,
                            borderColor: isDropdownOpen ? 'var(--blue-500)' : 'var(--border-color)',
                            boxShadow: isDropdownOpen ? 'var(--shadow-focus-ring)' : 'none'
                          }}
                        >
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            color: currentMat ? 'var(--neutral-900)' : 'var(--neutral-400)',
                            fontWeight: currentMat ? 600 : 400
                          }}>
                            {currentMat ? `${currentMat.name} (${formatIDR(currentMat.pricePerUnit)}/${currentMat.unitName})` : 'Pilih atau cari bahan...'}
                          </span>
                          <ChevronDown 
                            size={16} 
                            color="var(--neutral-400)" 
                            style={{ 
                              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform var(--transition-fast)',
                              flexShrink: 0
                            }} 
                          />
                        </div>

                        {/* Dropdown Popup */}
                        {isDropdownOpen && (
                          <div style={styles.dropdownPopup}>
                            <div style={styles.dropdownSearchWrapper}>
                              <div style={styles.dropdownSearchRelative}>
                                <Search size={14} color="var(--neutral-400)" style={styles.dropdownSearchIcon} />
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Ketik nama bahan..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  style={styles.dropdownSearchInput}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                {searchQuery && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearchQuery('');
                                    }}
                                    style={styles.clearSearchBtn}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div style={styles.dropdownList}>
                              {filteredMaterials.length === 0 ? (
                                <div style={styles.dropdownEmptyState}>Bahan "{searchQuery}" tidak ditemukan.</div>
                              ) : (
                                filteredMaterials.map(m => {
                                  const isSelected = currentMat && currentMat.id === m.id;
                                  return (
                                    <div
                                      key={m.id}
                                      onClick={() => {
                                        handleIngredientChange(index, 'rawMaterialId', m.id);
                                        setOpenDropdownIndex(null);
                                        setSearchQuery('');
                                      }}
                                      className="mat-option-item"
                                      style={{
                                        ...styles.optionItem,
                                        backgroundColor: isSelected ? 'var(--blue-50)' : 'transparent',
                                        color: isSelected ? 'var(--blue-700)' : 'var(--neutral-800)'
                                      }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: '8px' }}>
                                        <span style={{ fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                        <span style={{ fontSize: '0.688rem', color: isSelected ? 'var(--blue-600)' : 'var(--neutral-500)', fontWeight: 500 }}>
                                          {formatIDR(m.pricePerUnit)}/{m.unitName}
                                        </span>
                                      </div>
                                      {isSelected && <Check size={16} color="var(--blue-600)" />}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input Takaran Qty */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)' }}>Jumlah Pemakaian</label>
                      <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="0"
                          value={ing.quantity}
                          onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                          className="blue-input"
                          style={{
                            ...styles.qtyInput,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            borderRight: 'none'
                          }}
                        />
                        <div style={styles.unitTagAddon}>
                          {ing.unitName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal Footer */}
                  <div style={styles.subtotalFooter}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Subtotal Estimasi:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                      {formatIDR(subtotalCost)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            
            {/* Info Card: Suggested Selling Price based on HPP */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#F0F9FF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #BAE6FD'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E0F2FE' }}>
                  <Coins size={14} color="#0284C7" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1' }}>Estimasi Modal (HPP)</span>
                  <span style={{ fontSize: '0.688rem', color: '#075985' }}>Saran harga jual di atas nilai ini</span>
                </div>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0369A1' }}>
                {formatIDR(totalCost)}
              </span>
            </div>

            {/* Manual Price Input */}
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Harga Jual Topping <span className="text-red-500">*</span></span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--neutral-500)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}>
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="Contoh: 15000"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: '' });
                  }}
                  className={`blue-input ${errors.price ? 'has-error' : ''}`}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
              {errors.price && <span className="form-error">{errors.price}</span>}
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '6px' }}>
                Masukkan nominal harga jual akhir (sebaiknya lebih besar dari <strong>{formatIDR(totalCost)}</strong>).
              </p>
            </div>
          </div>
      </div>
    </form>

      <style>{`
        @media (max-width: 640px) {
          .ingredient-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
        .mat-option-item:hover {
          background-color: var(--blue-50) !important;
          color: var(--blue-700) !important;
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
  compositionBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  compositionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  ingredientError: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--red-600)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--red-50)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)'
  },
  rowsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  rowItem: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '12px',
    boxShadow: 'var(--shadow-xs)',
    transition: 'border-color var(--transition-fast)'
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  rowTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  indexBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    backgroundColor: 'var(--blue-50)',
    color: 'var(--blue-700)',
    fontSize: '0.688rem',
    fontWeight: 700,
    borderRadius: 'var(--radius-full)'
  },
  removeBtnText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: 'var(--red-500)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)'
  },
  ingredientGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginBottom: '10px'
  },
  selectInput: {
    height: '40px',
    fontSize: '0.813rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%'
  },
  qtyInput: {
    flex: 1,
    height: '100%',
    fontSize: '0.813rem',
    width: '100%',
    minWidth: '50px',
    fontWeight: 600,
    boxShadow: 'none'
  },
  unitTagAddon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    height: '100%',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderLeft: 'none',
    borderTopRightRadius: 'var(--radius-md)',
    borderBottomRightRadius: 'var(--radius-md)',
    fontSize: '0.75rem',
    color: 'var(--neutral-600)',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  subtotalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '1px dashed var(--border-subtle)'
  },
  selectTrigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '14px',
    paddingRight: '14px',
    height: '40px',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: 'var(--bg-surface)',
    fontSize: '0.813rem'
  },
  dropdownPopup: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    width: '100%',
    minWidth: '220px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
    overflow: 'hidden',
    animation: 'fadeIn 0.15s ease forwards'
  },
  dropdownSearchWrapper: {
    padding: '8px',
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
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 2
  },
  dropdownSearchInput: {
    width: '100%',
    paddingLeft: '32px',
    paddingRight: '28px',
    paddingTop: '6px',
    paddingBottom: '6px',
    fontSize: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--neutral-white)',
    outline: 'none',
    color: 'var(--neutral-800)',
    boxSizing: 'border-box'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '8px',
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
    maxHeight: '160px',
    overflowY: 'auto',
    padding: '4px'
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.813rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  dropdownEmptyState: {
    padding: '12px 10px',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'var(--neutral-400)'
  }
};
