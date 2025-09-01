import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('supplier');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) { alert('Please enter your name.'); return; }
    login({ name, role });
    navigate(role === 'supplier' ? '/inventory' : '/', { replace: true });
  };

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Sign in</h2>
      <form onSubmit={submit} className="form-grid mt-8">
        <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        <select className="select" value={role} onChange={e => setRole(e.target.value)}>
          <option value="supplier">Supplier</option>
          <option value="provider">Healthcare Provider</option>
        </select>
        <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="button primary">Continue</button>
        </div>
      </form>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
        (Demo login only)
      </div>
    </div>
  );
};

export default Login;