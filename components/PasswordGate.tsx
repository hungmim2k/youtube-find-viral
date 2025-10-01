import React, { useState } from 'react';


const getTodayPassword = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  // VD: 0210 * 1002
  const val1 = parseInt(dd + mm, 10);
  const val2 = parseInt(mm + dd, 10);
  return (val1 * val2).toString();
};

const PasswordGate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayPassword = getTodayPassword();
    if (password === todayPassword || password === '0968885430') {
      setError('');
      onSuccess();
    } else {
      setError('Sai mật khẩu!');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.95)',
        borderRadius: 16,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: 32,
        minWidth: 340,
        maxWidth: 380,
        color: '#f1f5f9',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 18,
          color: '#00e0d3',
          letterSpacing: 1,
          textShadow: '0 2px 8px #0008',
        }}>
          Find Viral Channel Youtube 2025
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#fbbf24' }}>
          Nhập license thử nghiệm
        </h2>
        <div style={{ fontSize: 15, color: '#cbd5e1', marginBottom: 18 }}>
          Vui lòng liên hệ Admin để cung cấp license thử nghiệm trong ngày.
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nhập license..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: 16,
              marginBottom: 14,
              outline: 'none',
              boxShadow: '0 2px 8px #0002',
              transition: 'border 0.2s',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              background: 'linear-gradient(90deg, #00e0d3 0%, #009efd 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              boxShadow: '0 2px 8px #00e0d355',
              cursor: 'pointer',
              marginBottom: 10,
              marginTop: 2,
              letterSpacing: 1,
              transition: 'background 0.2s',
            }}
          >
            Vào trang
          </button>
        </form>
        <a
          href="https://www.facebook.com/huaoakley"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '10px 0',
            borderRadius: 8,
            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)',
            color: '#232526',
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            boxShadow: '0 2px 8px #fbbf2455',
            cursor: 'pointer',
            marginTop: 2,
            textDecoration: 'none',
            letterSpacing: 1,
            marginBottom: 2,
          }}
        >
          Liên hệ Admin
        </a>
        {error && <div style={{ color: '#f87171', marginTop: 10, fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
};

export default PasswordGate;
