import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (username: string, password: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setError('');
    onRegister(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng ký</h2>
      <div>
        <label>Tên đăng nhập:</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Mật khẩu:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Đăng ký</button>
    </form>
  );
};

export default RegisterForm;
