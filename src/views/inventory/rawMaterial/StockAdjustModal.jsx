import React, { useState, useEffect } from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { useAuth } from '../../../controllers/AuthController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SearchSelect } from '../../components/SearchSelect';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Package, 
  Save, 
  Layers,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const StockAdjustModal = () => {
  const { 
    adjustModalState, 
    closeAdjustModal, 
    adjustStock, 
    rawMaterials 
  } = useRawMaterial();
  const { currentUser } = useAuth();
  const isCashier = currentUser?.role === 'kasir';

  const { isOpen, item, type: initialType } = adjustModalState;

  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [adjustType, setAdjustType] = useState('IN'); // 'IN' | 'OUT' | 'ADJUST'
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setSelectedMaterialId(item.id);
      } else if (rawMaterials.length > 0) {
        setSelectedMaterialId(rawMaterials[0].id);
      }
      const type = isCashier ? 'IN' : (initialType || 'IN');
      setAdjustType(type);
      if (type === 'ADJUST' && item) {
        setAmount(String(Number(item.stock ?? item.currentStock ?? 0) || 0));
      } else {
        setAmount('');
      }
      setNote('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, item, initialType, rawMaterials, isCashier]);

  if (!isOpen) return null;

  const currentMaterial = rawMaterials.find(m => m.id === selectedMaterialId);
  const currentStock = currentMaterial ? (Number(currentMaterial.stock ?? currentMaterial.currentStock ?? 0) || 0) : 0;
  const unitName = currentMaterial ? currentMaterial.unitName : 'Unit';

  // Calculate new projected stock
  const numAmount = Number(amount) || 0;
  let projectedStock = currentStock;
  const activeType = isCashier ? 'IN' : adjustType;

  if (activeType === 'IN') {
    projectedStock = currentStock + numAmount;
  } else if (activeType === 'OUT') {
    projectedStock = Math.max(0, currentStock - numAmount);
  } else if (activeType === 'ADJUST') {
    projectedStock = numAmount;
  }

  const validate = () => {
    const err = {};
    if (!selectedMaterialId) {
      err.material = 'Pilih bahan baku terlebih dahulu.';
    }
    const parsed = Number(amount);
    if (amount === '' || isNaN(parsed)) {
      err.amount = 'Jumlah stok harus berupa angka valid.';
    } else if (adjustType === 'ADJUST') {
      if (parsed < 0) {
        err.amount = 'Sisa stok tidak boleh bernilai negatif.';
      }
    } else {
      if (parsed <= 0) {
        err.amount = 'Jumlah perubahan harus lebih dari 0.';
      }
    }
    if (!isCashier && adjustType === 'OUT' && currentStock < parsed) {
      err.amount = `Stok tidak mencukupi. Sisa stok hanya ${currentStock} ${unitName}.`;
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
      result = await adjustStock({
        rawMaterialId: selectedMaterialId,
        type: isCashier ? 'IN' : adjustType,
        amount: Number(amount),
        note,
        user: currentUser?.nama || (isCashier ? 'Kasir' : 'Admin')
      });
    } catch (err) {
      result = { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }

    if (result && result.success) {
      setAmount('');
      setNote('');
      setErrors({});
      closeAdjustModal();
    } else {
      setErrors({ form: result?.error || 'Gagal menyimpan perubahan stok.' });
    }
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setErrors({});
    closeAdjustModal();
  };



  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isCashier ? "Catat Stok Masuk (Restok)" : "Catat Perubahan Stok"}
      subtitle={isCashier ? "Catat penambahan kuantitas bahan baku dari supplier atau pembelian restok." : "Perbarui kuantitas stok bahan masuk, keluar, atau opname fisik."}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Riwayat'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Error form */}
        {errors.form && (
          <div style={styles.errorAlert}>
            {errors.form}
          </div>
        )}

        {/* 1. Pilih Bahan Baku (Search & Select) */}
        <div className="blue-input-group" style={{ position: 'relative', zIndex: 30 }}>
          <label className="blue-label">
            Nama Bahan Baku <span style={{ color: 'var(--red-500)' }}>*</span>
          </label>
          <SearchSelect
            options={rawMaterials.map(m => {
              const sisa = Number(m.stock ?? m.currentStock ?? 0);
              const uName = m.unitName || m.unit_name || 'Unit';
              return {
                value: m.id,
                label: m.name,
                sublabel: `(Sisa: ${sisa} ${uName})`,
                badge: `Sisa: ${sisa} ${uName}`
              };
            })}
            value={selectedMaterialId}
            onChange={(val) => {
              setSelectedMaterialId(val);
              setErrors(prev => ({ ...prev, material: '', amount: '' }));
            }}
            placeholder="Pilih atau cari bahan baku..."
            searchPlaceholder="Ketik nama bahan baku..."
            icon={Package}
            showSublabelInTrigger={true}
            clearable={false}
            error={Boolean(errors.material)}
          />
          {errors.material && (
            <span style={{ color: 'var(--red-500)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>
              {errors.material}
            </span>
          )}
        </div>

        {/* 2. Jenis Perubahan */}
        <div className="blue-input-group">
          <label className="blue-label">
            Jenis Perubahan <span style={{ color: 'var(--red-500)' }}>*</span>
          </label>

          {isCashier ? (
            /* Locked single choice for Cashier */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              backgroundColor: 'var(--green-50)',
              border: '1.5px solid var(--green-400)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--green-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <ArrowDownLeft size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--green-900)' }}>
                  Stok Masuk (+)
                </div>
                <div style={{ fontSize: '0.719rem', color: 'var(--green-700)', marginTop: '1px' }}>
                  Hak akses kasir: Khusus pencatatan penambahan stok masuk / restok barang
                </div>
              </div>
            </div>
          ) : (
            /* 3 Choices for Super Admin */
            <div style={styles.typeButtonGroup}>
              <button
                type="button"
                onClick={() => { setAdjustType('IN'); setErrors(prev => ({ ...prev, amount: '' })); }}
                style={{
                  ...styles.typeBtn,
                  ...(adjustType === 'IN' ? styles.typeBtnInActive : {})
                }}
              >
                <ArrowDownLeft size={16} />
                <span>Stok Masuk (+)</span>
              </button>

              <button
                type="button"
                onClick={() => { setAdjustType('OUT'); setErrors(prev => ({ ...prev, amount: '' })); }}
                style={{
                  ...styles.typeBtn,
                  ...(adjustType === 'OUT' ? styles.typeBtnOutActive : {})
                }}
              >
                <ArrowUpRight size={16} />
                <span>Stok Keluar (-)</span>
              </button>

              <button
                type="button"
                onClick={() => { setAdjustType('ADJUST'); setErrors(prev => ({ ...prev, amount: '' })); }}
                style={{
                  ...styles.typeBtn,
                  ...(adjustType === 'ADJUST' ? styles.typeBtnAdjustActive : {})
                }}
              >
                <RefreshCw size={15} />
                <span>Ubah Sisa Stok (=)</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Jumlah Qty & Proyeksi Alur Stok */}
        <div style={styles.amountBox}>
          <Input
            label={
              (!isCashier && adjustType === 'ADJUST')
                ? `Jumlah Sisa Stok Baru (${unitName})`
                : (!isCashier && adjustType === 'OUT')
                  ? `Jumlah Pengurangan Keluar (${unitName})`
                  : `Jumlah Penambahan Masuk (${unitName})`
            }
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
            }}
            error={errors.amount}
            required
            autoFocus
          />

          {/* Flow Simulation Box */}
          {currentMaterial && amount !== '' && !isNaN(Number(amount)) && (
            <div style={styles.projectionBox}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.813rem' }}>
                <span style={{ color: 'var(--neutral-600)' }}>
                  {adjustType === 'ADJUST' 
                    ? 'Alur Koreksi Sisa Stok:' 
                    : adjustType === 'OUT' 
                      ? 'Alur Pengurangan Stok:' 
                      : 'Alur Penambahan Stok:'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--neutral-500)', fontWeight: 600 }}>
                    {currentStock} {unitName}
                  </span>
                  <span style={{ color: 'var(--neutral-400)' }}>➔</span>
                  <span style={{ 
                    fontWeight: 800, 
                    color: adjustType === 'OUT' 
                      ? '#dc2626' 
                      : adjustType === 'ADJUST' 
                        ? 'var(--blue-600)' 
                        : 'var(--green-700)' 
                  }}>
                    {projectedStock} {unitName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Keterangan / Alasan */}
        <div className="blue-input-group">
          <label className="blue-label">
            Keterangan / Catatan Restok
          </label>
          <input
            type="text"
            className="blue-input"
            placeholder="Contoh: Restok supplier, belanja pasar, bonus agen..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ height: '40px' }}
          />
        </div>
      </form>
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
  typeButtonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
    gap: '8px'
  },
  typeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 8px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--neutral-50)',
    color: 'var(--neutral-600)',
    fontSize: '0.813rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  typeBtnInActive: {
    backgroundColor: 'var(--green-50)',
    borderColor: 'var(--green-500)',
    color: 'var(--green-700)',
    fontWeight: 700
  },
  typeBtnOutActive: {
    backgroundColor: 'var(--red-50)',
    borderColor: 'var(--red-500)',
    color: 'var(--red-600)',
    fontWeight: 700
  },
  typeBtnAdjustActive: {
    backgroundColor: 'var(--blue-50)',
    borderColor: 'var(--blue-500)',
    color: 'var(--blue-700)',
    fontWeight: 700
  },
  amountBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  projectionBox: {
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px'
  }
};
