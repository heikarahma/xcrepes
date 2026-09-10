import React from 'react';
import { useCategory } from '../../../controllers/CategoryController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

export const CategoryDeleteModal = () => {
  const { 
    deleteModalState, 
    closeDeleteModal, 
    deleteCategory, 
    deleteBatchCategories,
    selectedIds 
  } = useCategory();

  const { isOpen, category, isBatch } = deleteModalState;

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (isBatch) {
      deleteBatchCategories(selectedIds);
    } else if (category) {
      deleteCategory(category.id);
    }
    closeDeleteModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDeleteModal}
      title={isBatch ? 'Hapus Beberapa Kategori?' : 'Hapus Kategori?'}
      subtitle={isBatch ? `Menghapus ${selectedIds.length} kategori terpilih.` : 'Konfirmasi penghapusan kategori.'}
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={closeDeleteModal}>
            Batal
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleConfirmDelete}
          >
            {isBatch ? `Ya, Hapus (${selectedIds.length})` : 'Ya, Hapus'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={styles.warningBox}>
          <AlertTriangle size={24} color="var(--red-500)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--red-600)' }}>
              Tindakan ini tidak dapat dibatalkan
            </div>
            <div style={{ fontSize: '0.813rem', color: 'var(--neutral-600)', marginTop: '4px' }}>
              {isBatch ? (
                <>Yakin ingin menghapus <strong>{selectedIds.length} kategori terpilih</strong> dari sistem?</>
              ) : (
                <>Yakin ingin menghapus kategori <strong>"{category?.name}"</strong>?</>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: 'var(--red-50)',
    border: '1px solid var(--red-100)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px'
  }
};
