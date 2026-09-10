import React from 'react';
import { useProductMenu } from '../../../controllers/ProductMenuController';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { AlertTriangle } from 'lucide-react';

export const ProductMenuDeleteModal = () => {
  const { deleteModalState, closeDeleteModal, deleteMenu } = useProductMenu();
  const { isOpen, item } = deleteModalState;

  if (!isOpen) return null;

  const handleDelete = () => {
    if (item) {
      deleteMenu(item.id);
    }
    closeDeleteModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDeleteModal}
      title="Hapus Menu Produk"
      size="sm"
    >
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <AlertTriangle size={32} color="var(--red-600)" />
        </div>
        
        <div style={styles.textContainer}>
          <h4 style={styles.warningTitle}>Anda yakin ingin menghapus data ini?</h4>
          <p style={styles.warningText}>
            Menu <strong>{item?.name}</strong> akan dihapus permanen dari sistem. 
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>

      <div style={styles.actions}>
        <Button
          variant="secondary"
          onClick={closeDeleteModal}
          style={{ flex: 1 }}
        >
          Batal
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          style={{ flex: 1 }}
        >
          Ya, Hapus
        </Button>
      </div>
    </Modal>
  );
};

const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    padding: '16px 0 24px 0'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--red-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid var(--red-100)'
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  warningTitle: {
    margin: 0,
    fontSize: '1.063rem',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  warningText: {
    margin: 0,
    fontSize: '0.875rem',
    color: 'var(--neutral-500)',
    lineHeight: 1.5
  },
  actions: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)'
  }
};
