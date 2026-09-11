import React, { useState } from 'react';
import { useAuth } from '../../controllers/AuthController';
import { useSettings } from '../../controllers/SettingsController';
import { 
  Sparkles, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

export const LoginView = () => {
  const { login } = useAuth();
  const { settings } = useSettings();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const appDisplayName = settings.appName || settings.storeName || 'XCrepes POS';
  const appTagline = settings.storeTagline || 'Sistem Kasir & Point of Sale Modern';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Login gagal. Periksa username dan kata sandi.');
        setIsLoading(false);
      } else {
        setUsername('');
        setPassword('');
        setIsLoading(false);
      }
    }, 350); // micro-delay for smooth transition
  };

  return (
    <div className="login-root-container">
      {/* Background Decor Shapes */}
      <div className="bg-glow-orb bg-glow-1" />
      <div className="bg-glow-orb bg-glow-2" />

      <div className="login-wrapper">
        {/* Main Card */}
        <div className="login-card">
          {/* Card Header with Brand Logo */}
          <div className="login-header">
            <div className="login-logo-box">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="login-logo-img" />
              ) : (
                <Sparkles size={28} color="#FFFFFF" />
              )}
            </div>
            <h1 className="login-title">{appDisplayName}</h1>
            <p className="login-subtitle">{appTagline}</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="login-error-alert animate-shake">
              <AlertCircle size={18} color="var(--red-600)" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Input Username */}
            <div className="login-field-group">
              <label className="login-label">Username Pengguna</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <User size={18} color="var(--neutral-400)" />
                </span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="login-field-group">
              <div className="login-label-row">
                <label className="login-label">Kata Sandi</label>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Lock size={18} color="var(--neutral-400)" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="var(--neutral-500)" />
                  ) : (
                    <Eye size={18} color="var(--neutral-500)" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner-loader" />
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <span>&copy; {new Date().getFullYear()} {appDisplayName}</span>
        </div>
      </div>

      <style>{`
        .login-root-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F0F7FF 0%, #E8F2FF 50%, #F4F7FB 100%);
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
        }

        .bg-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .bg-glow-1 {
          width: 380px;
          height: 380px;
          background: rgba(0, 114, 255, 0.15);
          top: -80px;
          right: -80px;
        }
        .bg-glow-2 {
          width: 320px;
          height: 320px;
          background: rgba(0, 155, 76, 0.1);
          bottom: -60px;
          left: -60px;
        }

        .login-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .login-card {
          background: #FFFFFF;
          width: 100%;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 16px 40px rgba(0, 72, 153, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(186, 224, 255, 0.6);
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 24px;
        }

        .login-logo-box {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-700) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0, 114, 255, 0.35);
          margin-bottom: 14px;
          overflow: hidden;
          padding: 4px;
        }

        .login-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 12px;
          background: #ffffff;
        }

        .login-title {
          font-size: 1.375rem;
          font-weight: 800;
          color: var(--neutral-900);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .login-subtitle {
          font-size: 0.813rem;
          color: var(--neutral-500);
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: var(--red-50);
          border: 1px solid var(--red-200);
          color: var(--red-600);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 0.813rem;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .animate-shake {
          animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .login-label {
          font-size: 0.813rem;
          font-weight: 700;
          color: var(--neutral-700);
        }

        .login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 14px;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          height: 44px;
          padding: 0 42px 0 42px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--neutral-50);
          font-size: 0.875rem;
          color: var(--neutral-900);
          outline: none;
          transition: all var(--transition-fast);
        }

        .login-input:focus {
          border-color: var(--blue-500);
          background-color: #FFFFFF;
          box-shadow: var(--shadow-focus-ring);
        }

        .login-eye-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-submit-btn {
          height: 46px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--blue-500) 0%, var(--blue-600) 100%);
          color: #FFFFFF;
          border: none;
          font-weight: 700;
          font-size: 0.938rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: var(--shadow-primary-btn);
          transition: all var(--transition-fast);
          margin-top: 6px;
        }

        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--blue-600) 0%, var(--blue-700) 100%);
          transform: translateY(-1px);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner-loader {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          font-size: 0.75rem;
          color: var(--neutral-500);
          text-align: center;
        }
      `}</style>
    </div>
  );
};
