import React from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

export const RawMaterialDeleteModal = () => {
  const { 
    deleteModalState, 
    closeDeleteModal, 
    deleteRawMaterial, 
    deleteBatchRawMaterials,
    selectedIds 
  } = useRawMaterial();

  const { isOpen, item, isBatch } = deleteModalState;

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (isBatch) {
      deleteBatchRawMaterials(selectedIds);
    } else if (item) {
      deleteRawMaterial(item.id);
    }
    closeDeleteModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDeleteModal}
      title={isBatch ? 'Hapus Beberapa Bahan?' : 'Hapus Bahan Baku?'}
      subtitle={isBatch ? `Menghapus ${selectedIds.length} bahan terpilih.` : 'Konfirmasi penghapusan bahan baku.'}
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
                <>Yakin ingin menghapus <strong>{selectedIds.length} bahan terpilih</strong> dari inventori?</>
              ) : (
                <>Yakin ingin menghapus bahan <strong>"{item?.name}"</strong> ({Number(item?.stock ?? item?.currentStock ?? 0)} {item?.unitName})?</>
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
