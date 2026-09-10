import React, { useState, useEffect } from 'react';
import { useCategory } from '../../../controllers/CategoryController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Layers, Save, Plus } from 'lucide-react';

export const CategoryFormModal = () => {
  const { formModalState, closeFormModal, addCategory, updateCategory } = useCategory();
  const { isOpen, mode, category } = formModalState;

  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setCategoryName(category.name);
      } else {
        setCategoryName('');
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, mode, category]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!categoryName.trim()) {
      setError('Nama kategori wajib diisi!');
      return;
    }

    setIsSubmitting(true);

    let result;
    if (mode === 'edit' && category) {
      result = updateCategory(category.id, categoryName);
    } else {
      result = addCategory(categoryName);
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
      title={isEdit ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
      subtitle={isEdit ? 'Perbarui nama kategori.' : 'Tambahkan kategori menu & produk baru.'}
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={closeFormModal} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            icon={isEdit ? Save : Plus}
            onClick={handleSubmit}
            disabled={isSubmitting || !categoryName.trim()}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Info Box */}
        <div style={styles.infoCallout}>
          <Layers size={20} color="var(--blue-500)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.813rem', color: 'var(--blue-900)' }}>
            Contoh kategori: <strong>Makanan, Minuman, Snack, Topping, Paket Hemat</strong>.
          </div>
        </div>

        {/* Input Field: Nama Kategori */}
        <Input
          label="Nama Kategori"
          placeholder="Contoh: Minuman Segar"
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
          autoFocus
          icon={Layers}
          helperText="Kategori membantu kasir memfilter menu saat transaksi."
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
