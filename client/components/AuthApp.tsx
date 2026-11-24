'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, SafeUser } from '../lib/api';

type AuthResponse = { user: SafeUser; token: string };
type UsersResponse = { users: SafeUser[] };
const TOKEN_KEY = 'gatehouse_token';

export default function AuthApp() {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<SafeUser|null>(null);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [fields, setFields] = useState({ name: '', email: '', password: '' });

  const loadAdminUsers = useCallback(async (authToken: string) => {
    try { const result = await api<UsersResponse>('/api/users', {}, authToken); setUsers(result.users); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load user list.'); }
  }, []);
  const loadProfile = useCallback(async (authToken: string) => {
    try {
      const result = await api<{user:SafeUser}>('/api/auth/me', {}, authToken);
      setUser(result.user);
      if (result.user.role === 'admin') await loadAdminUsers(authToken);
    } catch { localStorage.removeItem(TOKEN_KEY); setToken(''); setUser(null); }
  }, [loadAdminUsers]);
  useEffect(() => { const saved = localStorage.getItem(TOKEN_KEY); if (saved) { setToken(saved); void loadProfile(saved); } }, [loadProfile]);

  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email: fields.email, password: fields.password } : fields;
      const result = await api<AuthResponse>(endpoint, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem(TOKEN_KEY, result.token); setToken(result.token); setUser(result.user); setNotice(mode === 'login' ? 'Signed in successfully.' : 'Account created successfully.');
      if (result.user.role === 'admin') await loadAdminUsers(result.token);
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem(TOKEN_KEY); setToken(''); setUser(null); setUsers([]); setFields({name:'',email:'',password:''}); setNotice('You have signed out.'); setError(''); }
  async function deleteUser(id: string) {
    if (!window.confirm('Delete this account permanently?')) return;
    setError(''); setNotice('');
    try { await api<{message:string}>(`/api/users/${id}`, { method: 'DELETE' }, token); setNotice('Account deleted.'); await loadAdminUsers(token); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not delete account.'); }
  }
  const initials = user?.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() || 'GS';

  return <main className="page-wrap">
    <header className="topline"><a className="brand" href="#"><span className="brand-mark">G</span> gatehouse<span className="brand-dot">.</span></a><div className="top-meta"><span className="secure-dot"/> SECURE ACCESS PORTAL <span className="version">V1.0</span></div></header>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">IDENTITY · ACCESS · CONTROL</p><h1>Your space.<br/><span>Your identity.</span></h1><p className="hero-sub">A simple, secure gateway to your account and the tools you’re authorized to use.</p><div className="hero-pills"><span>01 / Authentication</span><span>02 / Permissions</span><span>03 / Session</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="shield"><div className="shield-inner"><span className="shield-g">G</span><span className="shield-check">✓</span></div></div><span className="art-caption cap-top">ACCESS VERIFIED</span><span className="art-caption cap-bottom">IDENTITY LAYER / 001</span></div></section>
    <section className="content-grid"><div className="side-note"><span className="side-number">01</span><h2>Identity<br/>starts here.</h2><p>Register for a new account or sign in to pick up where you left off.</p><div className="side-rule"/><p className="side-small">SECURITY NOTE<br/>Passwords are hashed before storage. Sessions use signed access tokens.</p></div>
    <div className="auth-panel"><div className="panel-heading"><div><p className="eyebrow">ACCOUNT PORTAL</p><h2>{user ? 'Your dashboard' : 'Welcome back'}</h2></div><span className="panel-code">GH—AUTH</span></div>
      {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success" role="status">{notice}</div>}
      {!user ? <><div className="tabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');}}>Sign in <span>↗</span></button><button className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('');}}>Create account <span>↗</span></button></div><form onSubmit={submitAuth} className="auth-form">{mode==='register' && <label>FULL NAME<input autoComplete="name" value={fields.name} onChange={e=>setFields({...fields,name:e.target.value})} placeholder="Your name" minLength={2} maxLength={60} required/></label>}<label>EMAIL ADDRESS<input type="email" autoComplete="email" value={fields.email} onChange={e=>setFields({...fields,email:e.target.value})} placeholder="you@example.com" required/></label><label>PASSWORD<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={fields.password} onChange={e=>setFields({...fields,password:e.target.value})} placeholder={mode==='register'?'At least 8 characters':'Your password'} minLength={mode==='register'?8:1} required/></label><button className="primary-btn" type="submit" disabled={busy}>{busy?(mode==='login'?'Signing in…':'Creating…'):(mode==='login'?'Sign in securely':'Create account')}<span>↗</span></button></form><div className="demo-box"><div className="demo-title">DEMO ACCESS <span>LOCAL TESTING</span></div><div className="demo-account"><span className="demo-role">ADMIN</span><code>admin@gatehouse.demo</code><code>AdminPass123!</code></div><div className="demo-account"><span className="demo-role member">USER</span><code>user@gatehouse.demo</code><code>UserPass123!</code></div><p>Demo accounts are created when the API connects to MongoDB.</p></div></> : <div className="profile-card"><div className="profile-top"><div className="avatar">{initials}</div><div><h3>{user.name}</h3><p>{user.email}</p></div><span className={`role-tag ${user.role}`}>{user.role.toUpperCase()}</span></div><div className="profile-details"><div><span>ACCOUNT ID</span><code>{user.id.slice(-12).toUpperCase()}</code></div><div><span>ACCESS LEVEL</span><strong>{user.role==='admin'?'Administrator':'Member'}</strong></div></div><button className="primary-btn" onClick={logout}>Sign out <span>↗</span></button></div>}
      {user?.role==='admin' && <div className="admin-section"><div className="admin-heading"><div><p className="eyebrow">ADMINISTRATOR</p><h3>User directory</h3></div><span className="count-badge">{users.length} ACCOUNTS</span></div><div className="user-table"><div className="table-head"><span>USER</span><span>ROLE</span><span>ACTION</span></div>{users.map(u=><div className="table-row" key={u.id}><div className="user-cell"><div className="mini-avatar">{u.name.split(' ').map(v=>v[0]).slice(0,2).join('')}</div><div><strong>{u.name}</strong><small>{u.email}</small></div></div><span className={`table-role ${u.role}`}>{u.role}</span><button className="delete-btn" disabled={u.id===user.id} onClick={()=>deleteUser(u.id)} title={u.id===user.id?'Cannot delete yourself':'Delete user'}>{u.id===user.id?'YOU':'REMOVE'}</button></div>)}</div><p className="admin-footnote">Admin-only route · protected by role middleware</p></div>}
    </div></section>
    <footer className="footer"><div><span className="footer-brand">gatehouse<span>.</span></span><p>Authentication & authorization demo</p></div><div className="footer-right"><span>BUILT FOR WEB DEVELOPMENT LAB</span><span>© 2026 GATEHOUSE / EXPERIMENT 06</span></div></footer>
  </main>;
}
