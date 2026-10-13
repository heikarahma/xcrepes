import React from 'react';

export const SystemLoadingModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="system-loading-backdrop" role="status" aria-live="polite" aria-label="Memuat sistem">
      <div className="system-loading-modal">
        <div className="system-loading-cook-wrap" aria-hidden="true">
          <img className="system-loading-cook" src="/cook-loading.svg" alt="" />
          <span className="system-loading-steam steam-one" />
          <span className="system-loading-steam steam-two" />
          <span className="system-loading-steam steam-three" />
        </div>
        <p className="system-loading-text">
          Ini mungkin memerlukan waktu... Tunggu hingga proses pemuatan selesai
        </p>
      </div>

      <style>{`
        .system-loading-backdrop {
          position: fixed;
          inset: 0;
          z-index: 12000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.34);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        .system-loading-modal {
          width: 288px;
          min-height: 248px;
          padding: 24px;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          box-sizing: border-box;
        }

        .system-loading-cook-wrap {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .system-loading-cook {
          width: 96px;
          height: 96px;
          object-fit: contain;
          display: block;
          transform-origin: 48% 62%;
          animation: cookStir 1.65s ease-in-out infinite;
        }

        .system-loading-steam {
          position: absolute;
          width: 4px;
          height: 16px;
          border-radius: 999px;
          background: rgba(89, 200, 147, 0.36);
          filter: blur(0.2px);
          opacity: 0;
          transform: translateY(8px) scale(0.75);
          animation: cookSteam 1.8s ease-in-out infinite;
        }

        .steam-one {
          top: 14px;
          left: 48px;
          animation-delay: 0s;
        }

        .steam-two {
          top: 10px;
          left: 58px;
          height: 20px;
          background: rgba(43, 164, 118, 0.3);
          animation-delay: 0.28s;
        }

        .steam-three {
          top: 18px;
          left: 68px;
          height: 14px;
          animation-delay: 0.56s;
        }

        .system-loading-text {
          width: 100%;
          margin: 0;
          color: #222222;
          font-family: Poppins, "Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
          text-align: center;
          word-break: break-word;
        }

        @keyframes cookStir {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          35% {
            transform: translateY(-4px) rotate(4deg);
          }
          65% {
            transform: translateY(2px) rotate(-5deg);
          }
        }

        @keyframes cookSteam {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.72);
          }
          35% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translateY(-18px) scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .system-loading-cook,
          .system-loading-steam {
            animation: none !important;
          }
          .system-loading-steam {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
