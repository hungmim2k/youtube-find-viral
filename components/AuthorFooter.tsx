import React from 'react';

const QR_MB = 'https://img.vietqr.io/image/970422-0869842687-compact2.png?accountName=TRAN%20MANH%20HUNG';

const AuthorFooter: React.FC<{ onDonate: () => void }> = ({ onDonate }) => (
  <footer style={{
    marginTop: 40,
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 15,
    letterSpacing: 0.2,
  }}>
    <div style={{marginBottom: 8}}>
      Tác giả: <a href="https://www.facebook.com/huaoakley" target="_blank" rel="noopener noreferrer" style={{color:'#38bdf8', fontWeight:600}}>Trần Hùng Oakley</a>
    </div>
    <button
      onClick={onDonate}
      style={{
        background: 'linear-gradient(90deg,#00e0d3,#009efd)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 20px',
        fontWeight: 700,
        fontSize: 15,
        cursor: 'pointer',
        marginTop: 4,
        boxShadow: '0 2px 8px #00e0d355',
      }}
    >
      Ủng hộ tác giả
    </button>
  </footer>
);

export const DonateQR: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
      textAlign: 'center',
      minWidth: 320,
      maxWidth: 360,
      position: 'relative',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 10,
          right: 18,
          background: 'none',
          border: 'none',
          fontSize: 28,
          color: '#888',
          cursor: 'pointer',
        }}
        aria-label="Đóng"
      >×</button>
      <h3 style={{color:'#0ea5e9', fontWeight:800, fontSize:22, marginBottom:10}}>Ủng hộ tác giả</h3>
      <img src={QR_MB} alt="QR MB Bank 0869842687" style={{width:220, height:220, borderRadius:12, marginBottom:10}} />
      <div style={{color:'#222', fontWeight:600, marginBottom:4}}>MB Bank - 0869842687</div>
      <div style={{color:'#666', fontSize:14}}>Chủ tài khoản: Trần Mạnh Hùng</div>
    </div>
  </div>
);

export default AuthorFooter;
