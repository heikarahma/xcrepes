import React, { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/AuthController';
import { useUnit } from '../../controllers/UnitController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  User, 
  Lock, 
  AtSign, 
  Eye, 
  EyeOff, 
  Save, 
  Plus, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Ruler,
  Layers,
  Sparkles,
  Cookie,
  TrendingUp,
  Sliders,
  CheckCheck,
  XCircle,
  RotateCcw
} from 'lucide-react';

export const CashierFormModal = () => {
  const { 
    formModalState, 
    closeFormCashierModal, 
    addCashier, 
    updateCashier, 
    navFeatures 
  } = useAuth();
  const { showToast } = useUnit();

  const { isOpen, mode, cashier } = formModalState;

  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState(['kasir', 'raw-material', 'returns']);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && cashier) {
        setNama(cashier.nama || '');
        setUsername(cashier.username || '');
        setPassword(cashier.password || '');
        setPermissions(Array.isArray(cashier.permissions) ? cashier.permissions : ['kasir', 'raw-material', 'returns']);
        setIsActive(cashier.isActive !== false);
      } else {
        setNama('');
        setUsername('');
        setPassword('');
        setPermissions(['kasir', 'raw-material', 'returns']);
        setIsActive(true);
      }
      setShowPassword(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, mode, cashier]);

  if (!isOpen) return null;

  const isEdit = mode === 'edit';

  const handleTogglePermission = (featureKey) => {
    setPermissions(prev => {
      if (prev.includes(featureKey)) {
        return prev.filter(k => k !== featureKey);
      } else {
        return [...prev, featureKey];
      }
    });
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  const validate = () => {
    const err = {};
    if (!nama.trim()) {
      err.nama = 'Nama lengkap kasir wajib diisi!';
    }
    if (!username.trim()) {
      err.username = 'Username login wajib diisi!';
    } else if (username.trim().toLowerCase() === 'superadmin') {
      err.username = 'Username "superadmin" khusus untuk Super Admin!';
    }
    if (!password.trim()) {
      err.password = 'Kata sandi wajib diisi!';
    } else if (password.trim().length < 4) {
      err.password = 'Kata sandi minimal 4 karakter!';
    }
    if (permissions.length === 0) {
      err.permissions = 'Pilih minimal 1 fitur yang dapat diakses oleh kasir!';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    let res;
    try {
      if (isEdit) {
        res = await updateCashier(cashier.id, {
          nama: nama.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          permissions,
          isActive
        });
      } else {
        res = await addCashier({
          nama: nama.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim(),
          permissions,
          isActive
        });
      }
    } catch (err) {
      res = { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }

    if (res && res.success) {
      if (isEdit) {
        showToast(`Akun kasir "${nama}" berhasil diperbarui.`, 'success', 'Perubahan Disimpan');
      } else {
        showToast(`Akun kasir "${nama}" berhasil ditambahkan.`, 'success', 'Kasir Ditambahkan');
      }
      setNama('');
      setUsername('');
      setPassword('');
      setPermissions(['kasir', 'raw-material', 'returns']);
      setIsActive(true);
      setShowPassword(false);
      setErrors({});
      closeFormCashierModal();
    } else {
      setErrors({ form: res?.error || 'Terjadi kesalahan saat menyimpan data.' });
    }
  };

  const handleSelectAll = () => {
    setPermissions(navFeatures.map(f => f.key));
    if (errors.permissions) setErrors(prev => ({ ...prev, permissions: '' }));
  };

  const handleDeselectAll = () => {
    setPermissions([]);
  };

  // Helper get feature icon
  const getFeatureIcon = (key) => {
    switch (key) {
      case 'kasir': return <ShoppingBag size={18} color="var(--blue-500)" />;
      case 'unit': return <Ruler size={18} color="var(--blue-500)" />;
      case 'category': return <Layers size={18} color="var(--blue-500)" />;
      case 'topping': return <Sparkles size={18} color="var(--blue-500)" />;
      case 'product-menu': return <Cookie size={18} color="var(--blue-500)" />;
      case 'raw-material': return <Package size={18} color="var(--blue-500)" />;
      case 'returns': return <RotateCcw size={18} color="var(--blue-500)" />;
      case 'reports-sales': return <TrendingUp size={18} color="var(--blue-500)" />;
      case 'reports-materials': return <Package size={18} color="var(--blue-500)" />;
      case 'settings': return <Sliders size={18} color="var(--blue-500)" />;
      default: return <ShieldCheck size={18} color="var(--blue-500)" />;
    }
  };

  const handleClose = () => {
    setNama('');
    setUsername('');
    setPassword('');
    setPermissions(['kasir', 'raw-material', 'returns']);
    setIsActive(true);
    setShowPassword(false);
    setErrors({});
    closeFormCashierModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Ubah Akun Kasir' : 'Tambah Kasir Baru'}
      subtitle={isEdit ? 'Perbarui informasi profil dan hak akses menu kasir.' : 'Buat kredensial kasir dan atur hak akses fitur menu.'}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            icon={isEdit ? Save : Plus}
            onClick={handleSubmit}
            disabled={isSubmitting || !nama.trim() || !username.trim() || !password.trim()}
          >
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Kasir'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Info Callout Box (Sama persis seperti Form Modal lainnya) */}
        <div style={styles.infoCallout}>
          <ShieldCheck size={20} color="var(--blue-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.813rem', color: 'var(--blue-900)', lineHeight: '1.4' }}>
            Kasir hanya dapat melihat dan mengakses menu yang Anda berikan izin (saklar <strong>ON</strong>) di bawah ini.
          </div>
        </div>

        {/* Global Error Form Alert */}
        {errors.form && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} color="var(--red-600)" style={{ flexShrink: 0 }} />
            <span>{errors.form}</span>
          </div>
        )}

        {/* 1. Input: Nama Lengkap Kasir */}
        <Input
          label="Nama Lengkap Kasir"
          placeholder="Contoh: Siti Rahma"
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            if (errors.nama) setErrors(prev => ({ ...prev, nama: '' }));
          }}
          error={errors.nama}
          required
          autoFocus
          icon={User}
          helperText="Nama yang akan ditampilkan pada struk dan sistem POS."
        />

        {/* 2. Grid Baris: Username & Password */}
        <div style={styles.grid2}>
          {/* Username */}
          <Input
            label="Username Login"
            placeholder="Contoh: kasir1"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
              if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
            }}
            error={errors.username}
            required
            icon={AtSign}
            helperText="Gunakan huruf kecil tanpa spasi."
          />

          {/* Password with Eye Button */}
          <div className="blue-input-group">
            <label className="blue-label">
              Kata Sandi <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div className="blue-input-wrapper" style={{ position: 'relative' }}>
              <div className="blue-input-icon">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="Masukkan kata sandi"
                className={`blue-input with-icon ${errors.password ? 'has-error' : ''}`}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? (
                  <EyeOff size={16} color="var(--neutral-500)" />
                ) : (
                  <Eye size={16} color="var(--neutral-500)" />
                )}
              </button>
            </div>
            {errors.password ? (
              <span className="text-xs text-danger font-medium" style={{ marginTop: '2px' }}>
                {errors.password}
              </span>
            ) : (
              <span className="text-xs text-secondary">Minimal 4 karakter.</span>
            )}
          </div>
        </div>

        {/* 3. Status Akun Kasir (Aktif / Nonaktif) */}
        <div style={styles.statusSection}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={styles.sectionLabel}>Status Akun Kasir</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '2px' }}>
              {isActive ? 'Akun aktif dan dapat masuk ke sistem POS' : 'Akun dinonaktifkan sementara (tidak bisa login)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            style={{
              ...styles.statusToggleButton,
              backgroundColor: isActive ? 'var(--green-50)' : 'var(--neutral-100)',
              borderColor: isActive ? 'var(--green-200)' : 'var(--border-color)',
              color: isActive ? 'var(--green-700)' : 'var(--neutral-600)'
            }}
          >
            <div className={`form-mini-switch ${isActive ? 'mini-switch-on' : ''}`}>
              <div className="mini-switch-handle" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.813rem' }}>
              {isActive ? 'Akun Aktif' : 'Nonaktif'}
            </span>
          </button>
        </div>

        {/* 4. Section: Hak Akses Fitur Menu (Toggle On/Off) */}
        <div style={styles.permissionSection}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={styles.sectionLabel}>Hak Akses Fitur Kasir</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', margin: '2px 0 0 0' }}>
                Aktifkan menu yang diizinkan untuk kasir ({permissions.length} dari {navFeatures.length} aktif)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={styles.bulkBtn}
              >
                <CheckCheck size={13} />
                <span>Pilih Semua</span>
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                style={styles.bulkBtn}
              >
                <XCircle size={13} />
                <span>Kosongkan</span>
              </button>
            </div>
          </div>

          {errors.permissions && (
            <span className="text-xs text-danger font-medium" style={{ display: 'block', marginBottom: '8px' }}>
              {errors.permissions}
            </span>
          )}

          {/* Cards Saklar Toggle Fitur */}
          <div style={styles.featuresStack}>
            {navFeatures.map((feat) => {
              const isEnabled = permissions.includes(feat.key);
              return (
                <div
                  key={feat.key}
                  onClick={() => handleTogglePermission(feat.key)}
                  style={{
                    ...styles.featureCard,
                    borderColor: isEnabled ? 'var(--blue-400)' : 'var(--border-color)',
                    backgroundColor: isEnabled ? 'var(--blue-50)' : 'var(--bg-surface)'
                  }}
                >
                  <div style={styles.featureIconBox}>
                    {getFeatureIcon(feat.key)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--neutral-900)' }}>
                        {feat.label}
                      </span>
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: isEnabled ? 'var(--blue-200)' : 'var(--neutral-150)',
                        color: isEnabled ? 'var(--blue-800)' : 'var(--neutral-600)'
                      }}>
                        {feat.group}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', margin: '3px 0 0 0', lineHeight: 1.3 }}>
                      {feat.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.688rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isEnabled ? 'var(--blue-500)' : 'var(--neutral-200)',
                      color: isEnabled ? '#FFFFFF' : 'var(--neutral-500)'
                    }}>
                      {isEnabled ? 'ON' : 'OFF'}
                    </span>
                    <div className={`form-modal-switch ${isEnabled ? 'switch-checked' : ''}`}>
                      <div className="switch-knob" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>

      <style>{`
        .form-modal-switch {
          width: 38px;
          height: 22px;
          border-radius: 999px;
          background-color: var(--neutral-300);
          position: relative;
          transition: background-color var(--transition-fast);
        }
        .switch-knob {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #FFFFFF;
          position: absolute;
          top: 3px;
          left: 3px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: transform var(--transition-fast);
        }
        .form-modal-switch.switch-checked {
          background-color: var(--blue-500) !important;
        }
        .form-modal-switch.switch-checked .switch-knob {
          transform: translateX(16px);
        }

        .form-mini-switch {
          width: 32px;
          height: 18px;
          border-radius: 999px;
          background-color: var(--neutral-300);
          position: relative;
          transition: background-color var(--transition-fast);
        }
        .mini-switch-handle {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #FFFFFF;
          position: absolute;
          top: 2px;
          left: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          transition: transform var(--transition-fast);
        }
        .mini-switch-on {
          background-color: var(--green-500) !important;
        }
        .mini-switch-on .mini-switch-handle {
          transform: translateX(14px);
        }
      `}</style>
    </Modal>
  );
};

const styles = {
  infoCallout: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--red-50)',
    border: '1px solid var(--red-200)',
    color: 'var(--red-600)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.813rem',
    fontWeight: 600
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  },
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-subtle)'
  },
  sectionLabel: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-800)'
  },
  statusToggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  },
  permissionSection: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '4px'
  },
  featuresStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all var(--transition-fast)'
  },
  featureIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: 'var(--shadow-xs)'
  },
  bulkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.688rem',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    color: 'var(--neutral-700)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  }
};
