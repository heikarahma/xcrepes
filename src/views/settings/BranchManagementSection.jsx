import React, { useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Edit3, Plus, Save, Search, XCircle } from 'lucide-react';
import { useAuth } from '../../controllers/AuthController';
import { useUnit } from '../../controllers/UnitController';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

const emptyForm = {
  id: null,
  name: '',
  code: '',
  isActive: true
};

export const BranchManagementSection = () => {
  const { branches, addBranch, updateBranch } = useAuth();
  const { showToast } = useUnit();
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isEdit = Boolean(form.id);
  const totalBranches = (branches || []).length;
  const activeBranches = (branches || []).filter(branch => branch.isActive !== false).length;
  const inactiveBranches = Math.max(0, totalBranches - activeBranches);

  const filteredBranches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return branches || [];
    return (branches || []).filter(branch =>
      (branch.name || '').toLowerCase().includes(q) ||
      (branch.code || '').toLowerCase().includes(q)
    );
  }, [branches, searchTerm]);

  useEffect(() => {
    setError('');
  }, [form]);

  const openAddModal = () => {
    setForm(emptyForm);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (branch) => {
    setForm({
      id: branch.id,
      name: branch.name || '',
      code: branch.code || '',
      isActive: branch.isActive !== false
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = isEdit
      ? await updateBranch(form.id, form)
      : await addBranch(form);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Cabang gagal disimpan.');
      return;
    }

    showToast(
      isEdit ? `Cabang "${form.name}" berhasil diperbarui.` : `Cabang "${form.name}" berhasil ditambahkan.`,
      'success',
      'Cabang Disimpan'
    );
    closeModal();
  };

  const renderStatusBadge = (branch) => (
    <span style={{
      ...styles.statusBadge,
      backgroundColor: branch.isActive !== false ? 'var(--green-50)' : 'var(--neutral-100)',
      color: branch.isActive !== false ? 'var(--green-700)' : 'var(--neutral-500)',
      borderColor: branch.isActive !== false ? 'var(--green-200)' : 'var(--border-color)'
    }}>
      {branch.isActive !== false ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      <span>{branch.isActive !== false ? 'Aktif' : 'Nonaktif'}</span>
    </span>
  );

  return (
    <div className="branch-view-container" style={styles.container}>
      <div className="page-header-flex branch-page-header" style={styles.pageHeader}>
        <div>
          <div className="page-breadcrumb" style={styles.breadcrumb}>
            <span>PENGATURAN & SISTEM</span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>Kelola Cabang</span>
          </div>
          <h1 className="page-main-title" style={styles.pageTitle}>Kelola Cabang Toko</h1>
          <p className="page-main-subtitle" style={styles.pageSubtitle}>
            Atur outlet yang tersedia untuk sesi kerja kasir, kepala toko, dan admin.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary branch-header-add-btn"
          style={styles.headerAddButton}
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Tambah Cabang</span>
        </button>
      </div>

      <div className="branch-stats-grid" style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBlue}>
            <Building2 size={22} color="var(--blue-600)" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>TOTAL CABANG</span>
            <span style={styles.statNumber}>{totalBranches} Cabang</span>
            <span style={styles.statDesc}>Outlet yang terdaftar</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconGreen}>
            <CheckCircle2 size={22} color="var(--green-600)" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>CABANG AKTIF</span>
            <span style={styles.statNumber}>{activeBranches} Aktif</span>
            <span style={styles.statDesc}>Muncul saat login</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIconNeutral}>
            <XCircle size={22} color="var(--neutral-500)" />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>NONAKTIF</span>
            <span style={styles.statNumber}>{inactiveBranches} Cabang</span>
            <span style={styles.statDesc}>Disembunyikan sementara</span>
          </div>
        </div>
      </div>

      <div className="branch-table-card" style={styles.tableCard}>
        <div className="branch-table-header" style={styles.tableHeader}>
          <div>
            <h3 style={styles.cardTitle}>Daftar Cabang</h3>
            <p style={styles.cardSubtitle}>Kelola nama, kode, dan status cabang yang muncul saat login.</p>
          </div>
          <div className="branch-search-wrapper" style={styles.searchWrapper}>
            <Search size={16} color="var(--neutral-400)" style={styles.searchIcon} />
            <input
              type="text"
              className="branch-search-input"
              placeholder="Cari nama atau kode cabang..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div className="branch-desktop-table" style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '120px' }}>KODE</th>
                <th style={styles.th}>NAMA CABANG</th>
                <th style={{ ...styles.th, width: '130px', textAlign: 'center' }}>STATUS</th>
                <th style={{ ...styles.th, width: '90px', textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.emptyCell}>
                    <div style={styles.emptyState}>
                      <Building2 size={36} color="var(--neutral-300)" />
                      <p style={styles.emptyText}>
                        {searchTerm ? `Tidak ada cabang untuk pencarian "${searchTerm}".` : 'Belum ada cabang yang dibuat.'}
                      </p>
                      <Button variant="primary" icon={Plus} size="sm" onClick={openAddModal}>
                        Tambah Cabang
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch.id}>
                    <td style={styles.td}>
                      <span style={styles.codeBadge}>{branch.code || branch.id}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.branchIcon}>
                          <Building2 size={16} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={styles.branchName}>{branch.name}</div>
                          <div style={styles.branchSubtext}>ID: {branch.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {renderStatusBadge(branch)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button type="button" style={styles.rowActionButton} onClick={() => openEditModal(branch)} title="Edit cabang">
                        <Edit3 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="branch-mobile-list" style={styles.mobileList}>
          {filteredBranches.length === 0 ? (
            <div style={styles.mobileEmpty}>
              <Building2 size={34} color="var(--neutral-300)" />
              <p style={styles.emptyText}>
                {searchTerm ? 'Cabang tidak ditemukan.' : 'Belum ada cabang.'}
              </p>
              <Button variant="primary" icon={Plus} onClick={openAddModal} fullWidth>
                Tambah Cabang
              </Button>
            </div>
          ) : (
            filteredBranches.map((branch) => (
              <div key={branch.id} style={styles.mobileCard}>
                <div style={styles.mobileCardHeader}>
                  <div style={styles.nameCell}>
                    <div style={styles.branchIcon}>
                      <Building2 size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.branchName}>{branch.name}</div>
                      <div style={styles.branchSubtext}>{branch.code || branch.id}</div>
                    </div>
                  </div>
                  {renderStatusBadge(branch)}
                </div>

                <button type="button" style={styles.mobileEditButton} onClick={() => openEditModal(branch)}>
                  <Edit3 size={15} />
                  <span>Edit Cabang</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEdit ? 'Edit Cabang' : 'Tambah Cabang Baru'}
        subtitle={isEdit ? 'Perbarui nama, kode, dan status tampil cabang saat login.' : 'Tambahkan cabang baru agar bisa dipilih sebagai sesi kerja.'}
        size="md"
        footer={
          <div className="branch-modal-actions" style={styles.modalActions}>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" form="branch-form" variant="primary" icon={isEdit ? Save : Plus} disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Cabang'}
            </Button>
          </div>
        }
      >
        <form id="branch-form" onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div className="branch-modal-row2" style={styles.formRow2}>
            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>NAMA CABANG</span>
              <input
                className="blue-input branch-modal-input"
                value={form.name}
                onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="Contoh: XCrepes D'Botanica"
                style={styles.input}
                required
                autoFocus
              />
            </label>

            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>KODE CABANG</span>
              <input
                className="blue-input branch-modal-input"
                value={form.code}
                onChange={(event) => setForm(prev => ({ ...prev, code: event.target.value.toUpperCase().replace(/\s+/g, '') }))}
                placeholder="DBOT"
                style={styles.input}
              />
            </label>
          </div>

          <label className="branch-status-toggle" style={styles.statusToggle}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm(prev => ({ ...prev, isActive: event.target.checked }))}
              style={styles.checkbox}
            />
            <span>
              <strong>{form.isActive ? 'Aktif' : 'Nonaktif'}</strong>
              <span style={styles.statusHelp}>
                {form.isActive ? ' Cabang muncul di pilihan login.' : ' Cabang disembunyikan dari pilihan login.'}
              </span>
            </span>
          </label>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 1024px) {
          .branch-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .branch-view-container {
            padding: 0 !important;
            gap: 16px !important;
          }
          .branch-desktop-table {
            display: none !important;
          }
          .branch-mobile-list {
            display: flex !important;
          }
          .branch-table-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .branch-search-wrapper {
            width: 100% !important;
            max-width: none !important;
          }
          .branch-modal-row2 {
            grid-template-columns: 1fr !important;
          }
          .branch-modal-actions {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
          }
          .branch-modal-actions button {
            width: 100% !important;
            min-height: 44px !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 640px) {
          .branch-view-container {
            padding: 0 !important;
            gap: 16px !important;
          }
          .branch-page-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .branch-header-add-btn {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
          }
          .branch-table-card {
            border-radius: 12px !important;
          }
          .branch-table-header {
            padding: 14px 16px !important;
          }
          .branch-mobile-list {
            padding: 14px 16px !important;
          }
          .branch-search-input,
          .branch-modal-input {
            min-height: 46px !important;
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { padding: '24px', width: '100%', maxWidth: '100%', margin: 0, display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.688rem', fontWeight: 700, color: 'var(--neutral-400)', letterSpacing: '0.05em', marginBottom: '6px' },
  breadcrumbSeparator: { color: 'var(--neutral-300)' },
  breadcrumbCurrent: { color: 'var(--blue-600)' },
  pageTitle: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em', margin: '0 0 6px 0', lineHeight: 1.2 },
  pageSubtitle: { fontSize: '0.844rem', color: 'var(--neutral-500)', margin: 0, maxWidth: '700px' },
  headerAddButton: { height: '44px', padding: '0 20px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  statCard: { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-xs)' },
  statIconBlue: { width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--blue-50)', border: '1px solid var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statIconGreen: { width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statIconNeutral: { width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--neutral-100)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  statLabel: { fontSize: '0.688rem', fontWeight: 800, color: 'var(--neutral-400)', letterSpacing: '0.05em' },
  statNumber: { fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)', lineHeight: 1.2 },
  statDesc: { fontSize: '0.75rem', color: 'var(--neutral-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tableCard: { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', overflow: 'hidden' },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#ffffff' },
  cardTitle: { fontSize: '1.063rem', fontWeight: 800, color: 'var(--neutral-900)', margin: 0 },
  cardSubtitle: { fontSize: '0.75rem', color: 'var(--neutral-500)', margin: '2px 0 0 0' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '360px' },
  searchIcon: { position: 'absolute', left: '12px', pointerEvents: 'none' },
  searchInput: { width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--neutral-50)', fontSize: '0.813rem', color: 'var(--neutral-900)', outline: 'none' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.844rem' },
  th: { backgroundColor: 'var(--neutral-50)', color: 'var(--neutral-600)', fontWeight: 700, fontSize: '0.719rem', letterSpacing: '0.04em', padding: '12px 18px', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' },
  td: { padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', verticalAlign: 'middle' },
  codeBadge: { fontFamily: 'var(--font-family-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue-700)', backgroundColor: 'var(--blue-50)', border: '1px solid var(--blue-100)', padding: '3px 7px', borderRadius: '6px' },
  nameCell: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
  branchIcon: { width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--blue-50)', color: 'var(--blue-600)', flexShrink: 0 },
  branchName: { fontSize: '0.875rem', fontWeight: 800, color: 'var(--neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  branchSubtext: { fontSize: '0.719rem', fontWeight: 700, color: 'var(--neutral-500)' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '4px 9px', borderRadius: '999px', border: '1px solid', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' },
  rowActionButton: { width: '32px', height: '32px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', color: 'var(--neutral-700)', cursor: 'pointer' },
  emptyCell: { padding: '44px 24px', textAlign: 'center' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyText: { fontSize: '0.875rem', color: 'var(--neutral-500)', margin: 0 },
  mobileList: { display: 'none', flexDirection: 'column', gap: '12px', padding: '14px 16px', backgroundColor: 'var(--neutral-50)' },
  mobileCard: { backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' },
  mobileCardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' },
  mobileEditButton: { minHeight: '42px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', borderRadius: '8px', border: '1px solid var(--blue-200)', backgroundColor: 'var(--blue-50)', color: 'var(--blue-700)', fontSize: '0.813rem', fontWeight: 800, cursor: 'pointer' },
  mobileEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '28px 12px', backgroundColor: '#ffffff', border: '1px dashed var(--border-color)', borderRadius: '12px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  formRow2: { display: 'grid', gridTemplateColumns: '1fr 0.55fr', gap: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: { fontSize: '0.688rem', fontWeight: 700, color: 'var(--neutral-600)', letterSpacing: '0.5px' },
  input: { width: '100%', height: '42px', fontSize: '0.875rem' },
  statusToggle: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', fontSize: '0.813rem', color: 'var(--neutral-700)' },
  checkbox: { width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--blue-600)', flexShrink: 0 },
  statusHelp: { color: 'var(--neutral-500)', fontWeight: 500 },
  errorBox: { padding: '10px 12px', borderRadius: '8px', color: 'var(--red-700)', backgroundColor: 'var(--red-50)', border: '1px solid var(--red-200)', fontSize: '0.813rem', fontWeight: 700 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }
};
