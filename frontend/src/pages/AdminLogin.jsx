import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_role', res.data.role);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, border: '2px solid var(--color-primary)' }}>
        <div className="card-body" style={{ padding: 40 }}>
          <div className="text-center mb-8">
            <div style={{ fontSize: 48, marginBottom: 16 }}></div>
            <h1 className="text-2xl">تسجيل دخول الإدارة</h1>
            <p className="text-secondary mt-2">مرحباً بك مجدداً في نظام إدارة الكافيه</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: 'var(--color-error)', padding: 12, marginBottom: 20, borderRight: '4px solid var(--color-error)', fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@cafe.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg mt-4"
              disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#fff' }}></div> : 'دخول للنظام'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
