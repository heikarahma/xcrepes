import React, { useState } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { AuditTrailViewer } from './AuditTrailViewer';
import { AdminCorrectionModal } from './AdminCorrectionModal';
import { 
  ArrowLeft, 
  Edit3, 
  Download, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Layers, 
  Search, 
  X,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { formatDateTimeIndonesian } from '../../../utils/dateUtils';
import { 
  exportStockOpnameToPDF, 
  exportStockOpnameToExcel 
} from '../../../utils/reportExportUtils';

const formatIDR = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const AdminOpnameDetail = ({ report, onBack, isCashierView = false }) => {
  const { 
    submitAdminCorrection, 
    voidReport, 
    isSubmitting 
  } = useStockOpname();

  const { currentUser, storeName = 'XCrepes POS' } = useAuth();
  const isSuperAdmin = (currentUser?.role === 'superadmin' || currentUser?.role === 'admin' || currentUser?.role === 'kepala_toko') && !isCashierView;

  // Active Tab: 'TABLE' | 'AUDIT_TRAIL' | 'VERSIONS'
  const [activeTab, setActiveTab] = useState('TABLE');
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState('');

  // Table filter inside detail
  const [tableFilter, setTableFilter] = useState('ALL'); // 'ALL' | 'DISCREPANCY' | 'MATCH'
  const [tableSearch, setTableSearch] = useState('');

  if (!report) return null;

  const isVoid = report.status === 'VOID';
  const totalMaterials = report.summary?.totalMaterials || report.items?.length || 0;
  const matchCount = report.summary?.matchCount || 0;
  const deficitCount = report.summary?.deficitCount || 0;
  const surplusCount = report.summary?.surplusCount || 0;
  const discrepancyCount = deficitCount + surplusCount;
  const totalDiffVal = report.summary?.totalDifferenceValue || 0;

  // Filter items in table
  const displayedItems = (report.items || []).filter(item => {
    if (tableFilter === 'DISCREPANCY') {
      if (item.status !== 'DEFICIT' && item.status !== 'SURPLUS') return false;
    } else if (tableFilter === 'MATCH') {
      if (item.status !== 'MATCH') return false;
    }

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      return (item.name || '').toLowerCase().includes(q) ||
             (item.categoryName || '').toLowerCase().includes(q) ||
             (item.unitName || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportPDF = () => {
    exportStockOpnameToPDF({
      items: report.items || [],
      summary: report.summary || {},
      storeName,
      conductedBy: report.submittedBy?.name || report.createdBy?.name || 'Kasir',
      isCashier: isCashierView
    });
  };

  const handleExportExcel = () => {
    exportStockOpnameToExcel({
      items: report.items || [],
      summary: report.summary || {},
      storeName,
      conductedBy: report.submittedBy?.name || report.createdBy?.name || 'Kasir',
      isCashier: isCashierView
    });
  };

  const handleConfirmVoid = async () => {
    if (!voidReason.trim()) {
      setVoidError('Alasan pembatalan wajib diisi!');
      return;
    }
    setVoidError('');
    const res = await voidReport(report.id, voidReason.trim());
    if (res?.success) {
      setIsVoidModalOpen(false);
    }
  };

  return (
    <div className="admin-opname-detail animate-fade-in" style={styles.container}>
      {/* Top Header */}
      <div style={styles.topHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={onBack}
            >
              Kembali
            </Button>
            <h1 style={styles.title}>Laporan Stock Opname</h1>
            {isVoid ? (
              <span style={styles.badgeVoid}>
                <XCircle size={13} /> Dibatalkan (VOID)
              </span>
            ) : (
              <span style={styles.badgeSubmitted}>
                <CheckCircle2 size={13} /> Terkirim (v{report.version || 1})
              </span>
            )}
            <span style={styles.idBadge}>{report.id}</span>
          </div>

          <p style={styles.subtitle}>
            Audit pencatatan stok fisik aktual tanggal <strong>{report.displayDate || report.opnameDate}</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isSuperAdmin && !isVoid && (
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={() => setIsCorrectionModalOpen(true)}
              style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Koreksi Stok
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={handleExportPDF}
          >
            Ekspor PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
          >
            Ekspor Excel
          </Button>

          {isSuperAdmin && !isVoid && (
            <Button
              variant="outline"
              size="sm"
              icon={XCircle}
              onClick={() => setIsVoidModalOpen(true)}
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
            >
              Batalkan Laporan
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Overview Card */}
      <div style={styles.metaCard}>
        <div style={styles.metaGrid}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>TANGGAL OPNAME</span>
            <div style={styles.metaVal}>
              <Calendar size={14} color="var(--neutral-500)" />
              <strong>{report.displayDate || report.opnameDate}</strong>
            </div>
          </div>

          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>DIBUAT OLEH (KASIR)</span>
            <div style={styles.metaVal}>
              <User size={14} color="var(--neutral-500)" />
              <span>{report.createdBy?.name || 'Kasir'}</span>
            </div>
            <span style={styles.metaSub}>
              {formatDateTimeIndonesian(report.createdAt)}
            </span>
          </div>

          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>TERAKHIR DIUBAH</span>
            <div style={styles.metaVal}>
              {report.lastModifiedBy?.role === 'superadmin' ? (
                <ShieldCheck size={14} color="#7c3aed" />
              ) : (
                <User size={14} color="var(--neutral-500)" />
              )}
              <span>{report.lastModifiedBy?.name || report.createdBy?.name || '-'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                ({report.lastModifiedBy?.role === 'superadmin' ? 'Super Admin' : 'Kasir'})
              </span>
            </div>
            <span style={styles.metaSub}>
              {formatDateTimeIndonesian(report.lastModifiedAt || report.createdAt)}
            </span>
          </div>

          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>STATUS & VERSI</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={styles.versionPill}>Versi {report.version || 1}</span>
              {report.auditTrail?.some(a => a.action === 'ADMIN_CORRECTION') && (
                <span style={styles.correctedPill}>Ada Koreksi Admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Void notice if voided */}
        {isVoid && (
          <div style={styles.voidAlert}>
            <AlertTriangle size={18} color="#dc2626" />
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                Laporan ini telah dibatalkan (VOID) oleh {report.voidedBy?.name || 'Admin'} pada {formatDateTimeIndonesian(report.voidedAt)}.
              </strong>
              {report.voidReason && (
                <p style={{ margin: '2px 0 0', fontSize: '0.813rem', color: '#b91c1c' }}>
                  Alasan pembatalan: <em>"{report.voidReason}"</em>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KPI Mini Cards */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiBox}>
          <span style={styles.kpiLabel}>TOTAL BAHAN</span>
          <span style={styles.kpiNum}>{totalMaterials}</span>
        </div>
        <div style={{ ...styles.kpiBox, borderColor: '#a7f3d0' }}>
          <span style={{ ...styles.kpiLabel, color: '#059669' }}>COCOK</span>
          <span style={{ ...styles.kpiNum, color: '#059669' }}>{matchCount}</span>
        </div>
        <div style={{ ...styles.kpiBox, borderColor: deficitCount > 0 ? '#fecaca' : 'var(--border-color)' }}>
          <span style={{ ...styles.kpiLabel, color: deficitCount > 0 ? '#dc2626' : 'var(--neutral-500)' }}>KURANG</span>
          <span style={{ ...styles.kpiNum, color: deficitCount > 0 ? '#dc2626' : 'var(--neutral-700)' }}>{deficitCount}</span>
        </div>
        <div style={{ ...styles.kpiBox, borderColor: surplusCount > 0 ? '#bfdbfe' : 'var(--border-color)' }}>
          <span style={{ ...styles.kpiLabel, color: surplusCount > 0 ? '#2563eb' : 'var(--neutral-500)' }}>LEBIH</span>
          <span style={{ ...styles.kpiNum, color: surplusCount > 0 ? '#2563eb' : 'var(--neutral-700)' }}>{surplusCount}</span>
        </div>
        <div style={styles.kpiBox}>
          <span style={styles.kpiLabel}>VALUASI SELISIH</span>
          <span style={{ ...styles.kpiNum, fontSize: '1.125rem', color: totalDiffVal < 0 ? '#dc2626' : (totalDiffVal > 0 ? '#2563eb' : 'var(--neutral-700)') }}>
            {formatIDR(totalDiffVal)}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          type="button"
          style={{ ...styles.tabBtn, ...(activeTab === 'TABLE' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('TABLE')}
        >
          <FileText size={15} /> Tabel Perbandingan Stok ({totalMaterials})
        </button>

        <button
          type="button"
          style={{ ...styles.tabBtn, ...(activeTab === 'AUDIT_TRAIL' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('AUDIT_TRAIL')}
        >
          <History size={15} /> Riwayat Perubahan (Audit Trail)
          {report.auditTrail?.length > 0 && (
            <span style={styles.tabBadge}>{report.auditTrail.length}</span>
          )}
        </button>

        <button
          type="button"
          style={{ ...styles.tabBtn, ...(activeTab === 'VERSIONS' ? styles.tabBtnActive : {}) }}
          onClick={() => setActiveTab('VERSIONS')}
        >
          <Layers size={15} /> Riwayat Versi
          {report.versions?.length > 0 && (
            <span style={styles.tabBadge}>{report.versions.length}</span>
          )}
        </button>
      </div>

      {/* Tab 1: Table Content */}
      {activeTab === 'TABLE' && (
        <div className="blue-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table Filters & Search */}
          <div style={styles.tableToolbar}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{ ...styles.pillBtn, ...(tableFilter === 'ALL' ? styles.pillBtnActive : {}) }}
                onClick={() => setTableFilter('ALL')}
              >
                Semua ({totalMaterials})
              </button>
              <button
                type="button"
                style={{ ...styles.pillBtn, ...(tableFilter === 'DISCREPANCY' ? styles.pillBtnActive : {}) }}
                onClick={() => setTableFilter('DISCREPANCY')}
              >
                Ada Selisih ({discrepancyCount})
              </button>
              <button
                type="button"
                style={{ ...styles.pillBtn, ...(tableFilter === 'MATCH' ? styles.pillBtnActive : {}) }}
                onClick={() => setTableFilter('MATCH')}
              >
                Cocok ({matchCount})
              </button>
            </div>

            <div style={styles.searchWrap}>
              <Search size={14} color="var(--neutral-400)" />
              <input
                type="text"
                placeholder="Cari bahan pada tabel..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={styles.searchInput}
              />
              {tableSearch && (
                <button
                  type="button"
                  onClick={() => setTableSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="blue-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '750px' }}>
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                  <th>Nama Bahan Baku</th>
                  <th>Kategori</th>
                  <th style={{ textAlign: 'center' }}>Satuan</th>
                  <th style={{ textAlign: 'right' }}>Stok Sistem</th>
                  <th style={{ textAlign: 'right' }}>Stok Fisik Aktual</th>
                  <th style={{ textAlign: 'right' }}>Selisih</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Valuasi Selisih</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, idx) => {
                  const diff = item.difference;
                  const price = item.pricePerUnit || 0;
                  const diffVal = diff !== null ? (diff * price) : 0;

                  let statusBadge = (
                    <span style={styles.badgeUncounted}>Belum Diisi</span>
                  );
                  if (item.status === 'MATCH') {
                    statusBadge = <span style={styles.badgeMatch}>Cocok (0)</span>;
                  } else if (item.status === 'DEFICIT') {
                    statusBadge = <span style={styles.badgeDeficit}>Kurang ({diff})</span>;
                  } else if (item.status === 'SURPLUS') {
                    statusBadge = <span style={styles.badgeSurplus}>Lebih (+{diff})</span>;
                  }

                  return (
                    <tr key={item.rawMaterialId || idx}>
                      <td style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{item.name}</div>
                      </td>
                      <td style={{ color: 'var(--neutral-600)', fontSize: '0.813rem' }}>{item.categoryName}</td>
                      <td style={{ textAlign: 'center', color: 'var(--neutral-700)', fontWeight: 600 }}>{item.unitName}</td>
                      <td style={{ textAlign: 'right', color: 'var(--neutral-500)' }}>{item.systemStock}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--neutral-900)' }}>
                        {item.actualStock !== null ? item.actualStock : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {diff !== null ? (diff > 0 ? `+${diff}` : diff) : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {statusBadge}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.813rem', fontWeight: 600 }}>
                        {diffVal !== 0 ? (
                          <span style={{ color: diffVal < 0 ? '#dc2626' : '#2563eb' }}>
                            {formatIDR(diffVal)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--neutral-400)' }}>Rp 0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Trail */}
      {activeTab === 'AUDIT_TRAIL' && (
        <div className="blue-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--neutral-900)' }}>
              Riwayat Perubahan & Audit Trail Permanen
            </h3>
            <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--neutral-500)' }}>
              Seluruh catatan perubahan terhadap laporan ini disimpan secara permanen dan tidak dapat dimanipulasi atau dihapus.
            </p>
          </div>

          <AuditTrailViewer auditTrail={report.auditTrail || []} />
        </div>
      )}

      {/* Tab 3: Version History */}
      {activeTab === 'VERSIONS' && (
        <div className="blue-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--neutral-900)' }}>
              Riwayat Snapshot Versi Laporan
            </h3>
            <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--neutral-500)' }}>
              Setiap kali laporan dikoreksi oleh Super Admin atau diperbarui oleh Kasir, nomor versi bertambah secara berurutan.
            </p>
          </div>

          {(report.versions || []).length === 0 ? (
            <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
              Belum ada riwayat revisi versi (Laporan versi awal v1).
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...report.versions].reverse().map((v, idx) => (
                <div key={idx} style={styles.versionCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.versionPillBig}>Versi {v.versionNumber}</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--neutral-900)' }}>{v.user}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>({v.role})</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                      {formatDateTimeIndonesian(v.timestamp)}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 6px', fontSize: '0.813rem', color: 'var(--neutral-700)' }}>
                    <strong>Ringkasan:</strong> {v.summaryChanges}
                  </p>

                  {v.reason && (
                    <div style={styles.versionReasonBox}>
                      <span style={{ fontWeight: 700, color: '#92400e' }}>Alasan: </span>
                      <span style={{ color: '#78350f' }}>{v.reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin Correction Modal */}
      <AdminCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        report={report}
        onSaveCorrection={submitAdminCorrection}
        isSubmitting={isSubmitting}
      />

      {/* Modal Batalkan Laporan (VOID) */}
      <Modal
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        title="Batalkan Laporan (VOID)"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#991b1b' }}>
                Apakah Anda yakin ingin membatalkan laporan ini?
              </h3>
              <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--neutral-600)', lineHeight: '1.4' }}>
                Laporan akan berstatus <strong>VOID</strong>. Data dan histori audit trail tidak akan dihapus dan tetap tersimpan untuk keperluan audit.
              </p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '6px', color: 'var(--neutral-900)' }}>
              Alasan Pembatalan <span style={{ color: '#dc2626' }}>* Wajib Diisi</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Laporan dibuat ganda secara tidak sengaja oleh kasir pengganti..."
              value={voidReason}
              onChange={(e) => {
                setVoidReason(e.target.value);
                if (e.target.value.trim()) setVoidError('');
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${voidError ? '#dc2626' : 'var(--border-color)'}`,
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {voidError && (
              <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                {voidError}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              variant="outline"
              onClick={() => setIsVoidModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmVoid}
              disabled={isSubmitting}
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
            >
              {isSubmitting ? 'Membatalkan...' : 'Ya, Batalkan Laporan (VOID)'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '32px'
  },
  topHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '0.875rem',
    color: 'var(--neutral-600)'
  },
  badgeSubmitted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  badgeVoid: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '0.75rem',
    fontWeight: 700
  },
  idBadge: {
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-600)',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '0.75rem',
    fontFamily: 'monospace'
  },
  metaCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '16px 20px'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  metaCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  metaLabel: {
    fontSize: '0.688rem',
    fontWeight: 800,
    color: 'var(--neutral-500)',
    letterSpacing: '0.05em'
  },
  metaVal: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    color: 'var(--neutral-900)'
  },
  metaSub: {
    fontSize: '0.75rem',
    color: 'var(--neutral-500)'
  },
  versionPill: {
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '999px',
    padding: '1px 8px'
  },
  correctedPill: {
    fontSize: '0.688rem',
    fontWeight: 700,
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe',
    borderRadius: '999px',
    padding: '1px 6px'
  },
  voidAlert: {
    marginTop: '12px',
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '10px'
  },
  kpiBox: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px 14px'
  },
  kpiLabel: {
    fontSize: '0.688rem',
    fontWeight: 800,
    color: 'var(--neutral-500)',
    display: 'block'
  },
  kpiNum: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    marginTop: '2px',
    display: 'block'
  },
  tabNav: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
    overflowX: 'auto'
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--neutral-600)',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    whiteSpace: 'nowrap'
  },
  tabBtnActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
    fontWeight: 700
  },
  tabBadge: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderRadius: '999px',
    padding: '1px 6px',
    fontSize: '0.688rem',
    fontWeight: 700
  },
  tableToolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border-color)',
    gap: '10px',
    flexWrap: 'wrap'
  },
  pillBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    cursor: 'pointer'
  },
  pillBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#1d4ed8',
    fontWeight: 700
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '4px 10px',
    maxWidth: '240px'
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.75rem',
    flex: 1
  },
  badgeMatch: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #a7f3d0'
  },
  badgeDeficit: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #fecaca'
  },
  badgeSurplus: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '999px',
    border: '1px solid #bfdbfe'
  },
  badgeUncounted: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  versionCard: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px 16px',
    backgroundColor: '#fafafa'
  },
  versionPillBig: {
    fontSize: '0.813rem',
    fontWeight: 700,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '999px',
    padding: '2px 10px'
  },
  versionReasonBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '0.813rem'
  }
};
