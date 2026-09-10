import React, { useState, useEffect } from 'react';
import { useUnit } from '../../../controllers/UnitController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ruler, Save, Plus } from 'lucide-react';

export const UnitFormModal = () => {
  const { formModalState, closeFormModal, addUnit, updateUnit } = useUnit();
  const { isOpen, mode, unit } = formModalState;

  const [unitName, setUnitName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && unit) {
        setUnitName(unit.name);
      } else {
        setUnitName('');
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, mode, unit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!unitName.trim()) {
      setError('Nama satuan ukur wajib diisi!');
      return;
    }

    setIsSubmitting(true);

    let result;
    if (mode === 'edit' && unit) {
      result = updateUnit(unit.id, unitName);
    } else {
      result = addUnit(unitName);
    }

    setIsSubmitting(false);

    if (result.success) {
      closeFormModal();
    } else {
      setError(result.error);
    }
  };

  const isEdit = mode === 'edit';

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeFormModal}
      title={isEdit ? 'Ubah Satuan Ukur' : 'Tambah Satuan Baru'}
      subtitle={isEdit ? 'Perbarui nama satuan ukur.' : 'Tambahkan satuan ukur untuk produk dan bahan.'}
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={closeFormModal} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            icon={isEdit ? Save : Plus}
            onClick={handleSubmit}
            disabled={isSubmitting || !unitName.trim()}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Satuan'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Info Box */}
        <div style={styles.infoCallout}>
          <Ruler size={20} color="var(--blue-500)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.813rem', color: 'var(--blue-900)' }}>
            Contoh satuan: <strong>Kilogram, Gram, Liter, Box, Botol, Pcs, Porsi</strong>.
          </div>
        </div>

        {/* Input Field: Nama Satuan Ukur */}
        <Input
          label="Nama Satuan"
          placeholder="Contoh: Kilogram"
          value={unitName}
          onChange={(e) => {
            setUnitName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
          autoFocus
          icon={Ruler}
          helperText="Gunakan nama takaran yang sering dipakai kasir."
        />
      </form>
    </Modal>
  );
};

const styles = {
  infoCallout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-100)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px'
  }
};
