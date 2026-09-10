import React from 'react';

/**
 * Global ErrorBoundary Component
 * Mencegah layar blank putih jika terjadi error runtime di React,
 * serta menampilkan tombol reset data dan muat ulang halaman.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrapper}>
              ⚠️
            </div>
            <h2 style={styles.title}>Terjadi Kesalahan Aplikasi</h2>
            <p style={styles.subtitle}>
              Mohon maaf, terjadi kendala saat memuat halaman. Anda dapat memuat ulang atau mereset data cache lokal.
            </p>

            <div style={styles.errorBox}>
              <code>{this.state.error?.toString() || 'Unknown runtime error'}</code>
            </div>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={this.handleReload}
                style={styles.primaryBtn}
              >
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                style={styles.secondaryBtn}
              >
                Bersihkan Cache & Reset Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7FB',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 28px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    textAlign: 'center',
    border: '1px solid #E2E8F0'
  },
  iconWrapper: {
    fontSize: '3rem',
    marginBottom: '12px'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0F172A',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748B',
    lineHeight: 1.5,
    marginBottom: '16px'
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FEE2E2',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '0.75rem',
    color: '#991B1B',
    textAlign: 'left',
    overflowX: 'auto',
    marginBottom: '20px',
    maxHeight: '120px'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  primaryBtn: {
    backgroundColor: '#0072FF',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    border: '1px solid #CBD5E1',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '0.813rem',
    fontWeight: 600,
    cursor: 'pointer'
  }
};
