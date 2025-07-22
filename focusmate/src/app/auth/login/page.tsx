'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const showToast = (msg: string, success = true) => {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${success ? '#22c55e' : '#ef4444'};
      color: white;
      border-radius: 8px;
      z-index: 9999;
      font-weight: bold;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      if (remember) localStorage.setItem('token', data.token);
      showToast('Login successful!', true);
      router.push('/dashboard');
    } else {
      showToast(data.message || 'Login failed', false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', color: 'white' }}>
      {/* TOP NAV */}
      <header style={{
        backgroundColor: '#111827', padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          🎯 <span style={{ color: '#3b82f6' }}>FocusMate</span>
        </div>
        <div>
          <Link href="/auth/login" style={{ marginRight: '1rem', color: '#ccc' }}>Login</Link>
          <Link href="/auth/register" style={{ color: '#ccc' }}>Register</Link>
        </div>
      </header>

      {/* LOGIN FORM */}
      <main style={{ maxWidth: '420px', margin: '5rem auto', padding: '2rem', backgroundColor: '#1f2937', borderRadius: '12px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle} />
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} required
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle} />
            <span onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', top: '30%', right: '12px', cursor: 'pointer', color: '#ccc' }}>
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
            <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
            <label style={{ marginLeft: '8px', fontSize: '0.9rem' }}>Remember Me</label>
          </div>

          <button type="submit" style={buttonStyle}>Login</button>
        </form>

        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
          <Link href="#" style={{ color: '#3b82f6', fontSize: '0.85rem' }}>Forgot Password?</Link>
        </div>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Don’t have an account? <Link href="/auth/register" style={{ color: '#3b82f6' }}>Register</Link>
        </p>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  marginBottom: '1rem',
  borderRadius: '8px',
  border: '1px solid #374151',
  backgroundColor: '#111827',
  color: '#fff',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#3b82f6',
  color: 'white',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};
