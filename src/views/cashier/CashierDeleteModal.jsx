import React from 'react';
import { useAuth } from '../../controllers/AuthController';
import { useUnit } from '../../controllers/UnitController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

export const CashierDeleteModal = () => {
  const { deleteModalState, closeDeleteCashierModal, deleteCashier } = useAuth();
  const { showToast } = useUnit();
  const { isOpen, cashier } = deleteModalState;

  if (!isOpen || !cashier) return null;

  const handleConfirmDelete = () => {
    deleteCashier(cashier.id);
    showToast(`Akun kasir "${cashier.nama}" telah dihapus.`, 'info', 'Kasir Dihapus');
    closeDeleteCashierModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDeleteCashierModal}
      title="Hapus Akun Kasir?"
      subtitle="Konfirmasi penghapusan akun kasir dari sistem."
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={closeDeleteCashierModal}>
            Batal
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleConfirmDelete}
          >
            Ya, Hapus
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={styles.warningBox}>
          <AlertTriangle size={24} color="var(--red-500)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--red-600)' }}>
              Tindakan ini permanen
            </div>
            <div style={{ fontSize: '0.813rem', color: 'var(--neutral-600)', marginTop: '4px', lineHeight: '1.4' }}>
              Yakin ingin menghapus akun kasir <strong>"{cashier.nama}"</strong> (<code>@{cashier.username}</code>)? Kasir ini tidak akan dapat login lagi ke sistem.
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
    border: '1px solid var(--red-200)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px'
  }
};
