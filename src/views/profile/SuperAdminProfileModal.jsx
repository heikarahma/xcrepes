import React, { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/AuthController';
import { useUnit } from '../../controllers/UnitController';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { 
  ShieldCheck, 
  User, 
  AtSign, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle, 
  Check,
  KeyRound
} from 'lucide-react';

export const SuperAdminProfileModal = () => {
  const { 
    superAdminProfile, 
    updateSuperAdminProfile, 
    isProfileModalOpen, 
    closeProfileModal 
  } = useAuth();
  const { showToast } = useUnit();

  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isProfileModalOpen && superAdminProfile) {
      setNama(superAdminProfile.nama || 'Super Admin');
      setUsername(superAdminProfile.username || 'superadmin');
      setPassword(superAdminProfile.password || '');
      setConfirmPassword(superAdminProfile.password || '');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isProfileModalOpen, superAdminProfile]);

  const validate = () => {
    const errs = {};
    const trimmedNama = nama.trim();
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedNama) {
      errs.nama = 'Nama Super Admin wajib diisi';
    }

    if (!trimmedUser) {
      errs.username = 'Username wajib diisi';
    } else if (/\s/.test(trimmedUser)) {
      errs.username = 'Username tidak boleh mengandung spasi';
    } else if (trimmedUser.length < 3) {
      errs.username = 'Username minimal 3 karakter';
    }

    if (!trimmedPass) {
      errs.password = 'Kata sandi wajib diisi';
    } else if (trimmedPass.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter';
    }

    if (trimmedPass !== trimmedConfirm) {
      errs.confirmPassword = 'Konfirmasi kata sandi tidak cocok';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const res = updateSuperAdminProfile({
      nama: nama.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim()
    });

    if (!res.success) {
      setErrors({ form: res.error || 'Gagal memperbarui profil Super Admin' });
      setIsSubmitting(false);
      return;
    }

    showToast(
      'Kredensial Super Admin berhasil diperbarui!',
      'success',
      'Profil Disimpan'
    );
    setIsSubmitting(false);
    closeProfileModal();
  };

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      title="Konfigurasi Profil Super Admin"
      subtitle="Kelola nama akun, username login, dan kata sandi Super Admin"
      size="md"
      footer={
        <div className="profile-modal-footer">
          <Button
            variant="secondary"
            onClick={closeProfileModal}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            leftIcon={isSubmitting ? undefined : <Save size={16} />}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="superadmin-profile-form">
        {/* Info Callout */}
        <div className="profile-info-callout">
          <div className="callout-icon-box">
            <ShieldCheck size={20} color="var(--blue-600)" />
          </div>
          <div className="callout-text-box">
            <div className="callout-title">Hak Akses Tertinggi Sistem</div>
            <div className="callout-desc">
              Akun Super Admin memiliki akses 100% penuh ke seluruh modul, pengaturan, dan manajemen kasir. Pastikan Anda mengingat kredensial baru ini.
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errors.form && (
          <div className="profile-error-banner">
            <AlertCircle size={16} color="var(--red-600)" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Nama Lengkap / Display Name */}
        <div className="form-group-custom">
          <Input
            label="Nama Super Admin"
            placeholder="Contoh: Super Admin / Administrator"
            value={nama}
            onChange={(e) => {
              setNama(e.target.value);
              if (errors.nama) setErrors(prev => ({ ...prev, nama: null }));
            }}
            error={errors.nama}
            icon={User}
            required
          />
          <span className="field-hint">Nama ini akan tampil di navbar dan kartu profil sidebar.</span>
        </div>

        {/* Username Login */}
        <div className="form-group-custom">
          <Input
            label="Username Login"
            placeholder="Contoh: superadmin"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
              if (errors.username) setErrors(prev => ({ ...prev, username: null }));
            }}
            error={errors.username}
            icon={AtSign}
            required
          />
          <span className="field-hint">Digunakan untuk login ke sistem (otomatis huruf kecil, tanpa spasi).</span>
        </div>

        {/* Kata Sandi Baru */}
        <div className="form-group-custom">
          <label className="custom-input-label">
            Kata Sandi Baru <span className="req-star">*</span>
          </label>
          <div className={`custom-password-wrapper ${errors.password ? 'has-error' : ''}`}>
            <span className="input-prefix-icon">
              <KeyRound size={17} color={errors.password ? 'var(--red-500)' : 'var(--neutral-400)'} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="custom-pw-input"
              placeholder="Masukkan kata sandi baru (minimal 6 karakter)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: null }));
              }}
            />
            <button
              type="button"
              className="btn-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
              title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPassword ? <EyeOff size={16} color="var(--blue-600)" /> : <Eye size={16} color="var(--neutral-400)" />}
            </button>
          </div>
          {errors.password && <span className="custom-error-text">{errors.password}</span>}
          <span className="field-hint">Gunakan kombinasi yang kuat (huruf, angka, atau simbol).</span>
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div className="form-group-custom">
          <label className="custom-input-label">
            Konfirmasi Kata Sandi Baru <span className="req-star">*</span>
          </label>
          <div className={`custom-password-wrapper ${errors.confirmPassword ? 'has-error' : ''}`}>
            <span className="input-prefix-icon">
              <Lock size={17} color={errors.confirmPassword ? 'var(--red-500)' : 'var(--neutral-400)'} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="custom-pw-input"
              placeholder="Ulangi kata sandi baru untuk verifikasi"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
              }}
            />
            <button
              type="button"
              className="btn-toggle-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex="-1"
              title={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showConfirmPassword ? <EyeOff size={16} color="var(--blue-600)" /> : <Eye size={16} color="var(--neutral-400)" />}
            </button>
          </div>
          {errors.confirmPassword && <span className="custom-error-text">{errors.confirmPassword}</span>}
          {password && confirmPassword && password === confirmPassword && !errors.confirmPassword && (
            <span className="match-success-text">
              <Check size={13} color="var(--green-600)" />
              <span>Kata sandi cocok dan terverifikasi</span>
            </span>
          )}
        </div>
      </form>

      <style>{`
        .superadmin-profile-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .profile-info-callout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background-color: var(--blue-50);
          border: 1px solid var(--blue-200);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }

        .callout-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #FFFFFF;
          border: 1px solid var(--blue-200);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .callout-text-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .callout-title {
          font-size: 0.813rem;
          font-weight: 700;
          color: var(--blue-700);
        }

        .callout-desc {
          font-size: 0.75rem;
          color: var(--neutral-600);
          line-height: 1.4;
        }

        .profile-error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: var(--red-50);
          border: 1px solid var(--red-200);
          border-radius: var(--radius-md);
          font-size: 0.813rem;
          color: var(--red-700);
          font-weight: 600;
        }

        .form-group-custom {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .field-hint {
          font-size: 0.688rem;
          color: var(--neutral-400);
          margin-top: 2px;
          padding-left: 2px;
        }

        .custom-input-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--neutral-700);
          letter-spacing: 0.02em;
        }

        .req-star {
          color: var(--red-500);
        }

        .custom-password-wrapper {
          display: flex;
          align-items: center;
          height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: #FFFFFF;
          padding: 0 10px;
          transition: all var(--transition-fast);
        }

        .custom-password-wrapper:focus-within {
          border-color: var(--blue-500);
          box-shadow: var(--shadow-focus-ring);
        }

        .custom-password-wrapper.has-error {
          border-color: var(--red-500);
          background-color: var(--red-50);
        }

        .input-prefix-icon {
          display: flex;
          align-items: center;
          margin-right: 8px;
        }

        .custom-pw-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.844rem;
          color: var(--neutral-900);
          outline: none;
        }

        .btn-toggle-eye {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .btn-toggle-eye:hover {
          background-color: var(--neutral-100);
        }

        .custom-error-text {
          font-size: 0.688rem;
          color: var(--red-600);
          font-weight: 600;
          margin-top: 2px;
        }

        .match-success-text {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.688rem;
          color: var(--green-600);
          font-weight: 600;
          margin-top: 3px;
        }

        .profile-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          width: 100%;
        }
      `}</style>
    </Modal>
  );
};
