import { useState, useEffect } from "react";
import axios from "axios";
import EmployeePortal from "./EmployeePortal";
import { FranchisesPage } from "./FranchisesPage";


const API_URL = "http://127.0.0.1:8000/api/v1";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  company_id: string | null;
  branch_id: string | null;
  is_active: boolean;
};

const appStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600&display=swap');

  .app-wrap { display: flex; min-height: 100vh; background: #f8f7f4; font-family: 'Inter', sans-serif; color: #0a0a0a; }

  .app-sidebar { width: 240px; min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; flex-shrink: 0; position: fixed; top: 0; left: 0; bottom: 0; }
  .app-sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 800; color: white; letter-spacing: -0.03em; }
  .app-sidebar-logo span { color: #00c853; }
  .app-sidebar-nav { flex: 1; padding: 12px 8px; }
  .app-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; width: 100%; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; background: none; text-align: left; transition: background 0.15s, color 0.15s; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
  .app-nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
  .app-nav-item.active { background: rgba(255,255,255,0.1); color: white; }
  .nav-icon { font-size: 15px; opacity: 0.6; }
  .app-nav-item.active .nav-icon { opacity: 1; }
  .app-sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.06); position: relative; }
  .app-user-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; width: 100%; border: none; background: none; cursor: pointer; transition: background 0.15s; }
  .app-user-btn:hover { background: rgba(255,255,255,0.06); }
  .app-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #00c853, #00897b); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: 700; flex-shrink: 0; }
  .app-user-name { font-size: 13px; font-weight: 600; color: white; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .app-user-role { font-size: 11px; color: rgba(255,255,255,0.3); text-align: left; text-transform: capitalize; }
  .app-user-menu { position: absolute; bottom: 68px; left: 8px; right: 8px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px; z-index: 50; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
  .app-menu-item { width: 100%; text-align: left; padding: 9px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; border: none; background: none; color: rgba(255,255,255,0.7); font-family: 'Inter', sans-serif; transition: background 0.15s, color 0.15s; }
  .app-menu-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .app-menu-item.danger { color: #f87171; }
  .app-menu-item.danger:hover { background: rgba(248,113,113,0.1); }
  .app-menu-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 4px 0; }

  .app-main { flex: 1; margin-left: 240px; min-height: 100vh; display: flex; flex-direction: column; background: #f8f7f4; }
  .app-topbar { height: 60px; background: white; border-bottom: 1px solid #e5e4e0; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 40; }
  .app-topbar-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 17px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.025em; }
  .app-topbar-right { display: flex; align-items: center; gap: 12px; }
  .app-content { flex: 1; padding: 32px; background: #f8f7f4; }

  .page-header { margin-bottom: 28px; }
  .page-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.03em; margin-bottom: 6px; }
  .page-subtitle { font-size: 14px; color: #9b9b93; font-weight: 400; }

  .app-card { background: white; border: 1px solid #e5e4e0; border-radius: 16px; }
  .app-card-hover { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; cursor: pointer; }
  .app-card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); border-color: #0a0a0a; }

  .stat-card { background: white; border: 1px solid #e5e4e0; border-radius: 16px; padding: 24px; }
  .stat-card-icon { width: 44px; height: 44px; border-radius: 12px; background: #f2f1ee; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
  .stat-card-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; color: #0a0a0a; margin-bottom: 6px; letter-spacing: -0.02em; }
  .stat-card-desc { font-size: 13px; color: #9b9b93; margin-bottom: 16px; line-height: 1.5; }
  .stat-card-badge { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; display: inline-block; }

  .btn-primary { background: #0a0a0a; color: white; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; padding: 10px 20px; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s, transform 0.2s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; transform: none; }
  .btn-secondary { background: white; color: #0a0a0a; border: 1px solid #e5e4e0; border-radius: 10px; font-size: 13.5px; font-weight: 500; padding: 10px 16px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s, border-color 0.2s; }
  .btn-secondary:hover { background: #f8f7f4; border-color: #c5c4c0; }
  .btn-danger { background: #fff5f5; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; font-weight: 600; padding: 6px 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s; }
  .btn-danger:hover { background: #fee2e2; }
  .btn-success { background: rgba(0,200,83,0.08); color: #00a843; border: 1px solid rgba(0,200,83,0.2); border-radius: 8px; font-size: 12px; font-weight: 600; padding: 6px 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s; }
  .btn-success:hover { background: rgba(0,200,83,0.15); }
  .btn-ghost-sm { background: white; color: #5a5a54; border: 1px solid #e5e4e0; border-radius: 8px; font-size: 12px; font-weight: 500; padding: 6px 12px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s, border-color 0.2s; }
  .btn-ghost-sm:hover { background: #f8f7f4; border-color: #c5c4c0; color: #0a0a0a; }

  .app-input { width: 100%; background: #f8f7f4; border: 1.5px solid #e5e4e0; color: #0a0a0a; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .app-input:focus { border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); background: white; }
  .app-input::placeholder { color: #c5c4c0; }
  .app-label { font-size: 11px; font-weight: 700; color: #5a5a54; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; display: block; }

  .app-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .app-modal { background: white; border-radius: 20px; padding: 32px; width: 100%; max-width: 480px; box-shadow: 0 24px 80px rgba(0,0,0,0.16); max-height: 90vh; overflow-y: auto; }
  .app-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .app-modal-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.025em; }
  .app-modal-close { width: 32px; height: 32px; border-radius: 8px; background: #f2f1ee; border: none; cursor: pointer; font-size: 14px; color: #5a5a54; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
  .app-modal-close:hover { background: #e5e4e0; color: #0a0a0a; }

  .badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; display: inline-block; }
  .badge-green { background: rgba(0,200,83,0.1); color: #00a843; }
  .badge-yellow { background: rgba(255,167,0,0.1); color: #b36a00; }
  .badge-grey { background: #f2f1ee; color: #9b9b93; border: 1px solid #e5e4e0; }
  .badge-red { background: rgba(220,38,38,0.08); color: #dc2626; }
  .badge-blue { background: rgba(59,130,246,0.08); color: #1d4ed8; }

  .status-draft { background: #f2f1ee; color: #6b6b63; border: 1px solid #e5e4e0; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
  .status-published { background: rgba(0,200,83,0.08); color: #00a843; border: 1px solid rgba(0,200,83,0.2); font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
  .status-cancelled { background: rgba(220,38,38,0.06); color: #dc2626; border: 1px solid rgba(220,38,38,0.15); font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 100px; }

  .list-item { background: white; border: 1px solid #e5e4e0; border-radius: 12px; padding: 14px 16px; cursor: pointer; width: 100%; text-align: left; transition: border-color 0.15s, box-shadow 0.15s; display: block; }
  .list-item:hover { border-color: #0a0a0a; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .list-item.selected { border-color: #0a0a0a; box-shadow: 0 0 0 2px rgba(10,10,10,0.08); }
  .list-item-title { font-size: 14px; font-weight: 600; color: #0a0a0a; margin-bottom: 2px; }
  .list-item-sub { font-size: 12px; color: #9b9b93; }

  .section-label { font-size: 11px; font-weight: 700; color: #9b9b93; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }

  .empty-state { background: white; border: 1px solid #e5e4e0; border-radius: 16px; padding: 56px; text-align: center; }
  .empty-state-text { font-size: 14px; color: #9b9b93; }

  .shift-card { background: white; border: 1px solid #e5e4e0; border-radius: 14px; padding: 18px 20px; }
  .shift-card-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; color: #0a0a0a; margin-bottom: 4px; letter-spacing: -0.02em; }
  .shift-card-meta { font-size: 13px; color: #9b9b93; }
  .shift-card-actions { display: flex; gap: 8px; margin-top: 14px; }

  .tc-record { background: white; border: 1px solid #e5e4e0; border-radius: 14px; padding: 16px 18px; }
  .tc-record.open { border-color: rgba(0,200,83,0.3); background: rgba(0,200,83,0.02); }
  .tc-record.missing { border-color: rgba(220,38,38,0.2); background: rgba(220,38,38,0.02); }

  .inline-error { background: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #dc2626; }
  
  .form-section-divider { font-size: 10px; font-weight: 700; color: #c5c4c0; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 2px; padding-top: 8px; border-top: 1px solid #f2f1ee; }
`;

// --- Login Page ---
function LoginPage({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      onLogin(res.data.access_token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@300;400;500&display=swap');
        .login-wrap { display: flex; min-height: 100vh; background: #fff; font-family: 'Inter', sans-serif; }
        .login-left { width: 50%; background: #0a0a0a; display: flex; flex-direction: column; justify-content: space-between; padding: 48px; position: relative; overflow: hidden; }
        .login-left-glow { position: absolute; top: -150px; left: -150px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%); pointer-events: none; }
        .login-left-glow2 { position: absolute; bottom: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,214,0,0.06) 0%, transparent 70%); pointer-events: none; }
        .login-logo { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800; color: white; letter-spacing: -0.03em; position: relative; z-index: 1; }
        .login-logo span { color: #00c853; }
        .login-left-content { position: relative; z-index: 1; }
        .login-left-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 10px 18px; font-size: 16px; color: rgba(255,255,255,0.8); margin-bottom: 32px; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 700; }
        .login-left-tag span { width: 6px; height: 6px; background: #00c853; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .login-left-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(32px, 3vw, 48px); font-weight: 800; color: white; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 20px; }
        .login-left-title em { font-style: normal; color: #00c853; }
        .login-left-desc { font-size: 15px; color: rgba(255,255,255,0.45); font-weight: 300; line-height: 1.7; max-width: 400px; margin-bottom: 48px; }
        .login-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .login-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
        .login-stat-num { font-family: 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.03em; margin-bottom: 4px; }
        .login-stat-num em { font-style: normal; color: #00c853; }
        .login-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 300; }
        .login-quote { position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; }
        .login-quote-text { font-size: 14px; color: rgba(255,255,255,0.5); font-style: italic; line-height: 1.6; margin-bottom: 8px; }
        .login-quote-attr { font-size: 12px; color: rgba(255,255,255,0.25); }
        .login-right { width: 50%; display: flex; align-items: center; justify-content: center; padding: 48px; background: #fafaf8; }
        .login-form-wrap { width: 100%; max-width: 400px; }
        .login-form-header { margin-bottom: 40px; }
        .login-form-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 32px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.025em; margin-bottom: 8px; }
        .login-form-sub { font-size: 15px; color: #6b6b63; font-weight: 400; }
        .login-field { margin-bottom: 20px; }
        .login-field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .login-field-label { font-size: 12px; font-weight: 600; color: #0a0a0a; text-transform: uppercase; letter-spacing: 0.06em; }
        .login-field-link { font-size: 12px; color: #6b6b63; cursor: pointer; font-weight: 500; transition: color 0.2s; }
        .login-field-link:hover { color: #0a0a0a; }
        .login-input { width: 100%; background: #ffffff; border: 1.5px solid #d4d3cf; color: #0a0a0a; border-radius: 12px; padding: 14px 16px; font-size: 15px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .login-input:focus { border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.08); background: white; }
        .login-input::placeholder { color: #b0afab; }
        .login-error { background: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #dc2626; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .login-btn { width: 100%; background: #0a0a0a; color: white; border: none; font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; padding: 16px; border-radius: 12px; cursor: pointer; transition: opacity 0.2s, transform 0.2s; letter-spacing: -0.01em; }
        .login-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.4; transform: none; }
        .login-footer { margin-top: 32px; text-align: center; font-size: 13px; color: #9b9b93; }
        .login-footer a { color: #00c853; cursor: pointer; font-weight: 500; }
        @media (max-width: 768px) { .login-left { display: none; } .login-right { width: 100%; } }
      `}</style>
      <div className="login-wrap">
        <div className="login-left">
          <div className="login-left-glow"></div>
          <div className="login-left-glow2"></div>
          <div className="login-logo">WHITE<span>.</span>AI</div>
          <div className="login-left-content">
            <div className="login-left-tag"><span></span>AI-Powered Operations Platform</div>
            <h2 className="login-left-title">Run every team.<br/>Every branch.<br/><em>Effortlessly.</em></h2>
            <p className="login-left-desc">WHITE.AI unifies workforce, inventory, and AI forecasting for businesses that run on people.</p>
            <div className="login-stats">
              <div className="login-stat"><div className="login-stat-num">8<em>+</em></div><div className="login-stat-label">Integrated modules</div></div>
              <div className="login-stat"><div className="login-stat-num"><em>AI</em></div><div className="login-stat-label">Powered forecasting</div></div>
              <div className="login-stat"><div className="login-stat-num">1<em>x</em></div><div className="login-stat-label">Platform for everything</div></div>
              <div className="login-stat"><div className="login-stat-num">TR<em>+</em></div><div className="login-stat-label">Built for Türkiye</div></div>
            </div>
          </div>
          <div className="login-quote">
            <p className="login-quote-text">"Managing 12 branches used to take my entire week. Now it takes an hour."</p>
            <p className="login-quote-attr">— Operations Manager · Georgia Coffee & Chocolate, Istanbul</p>
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-wrap">
            <div className="login-form-header">
              <h1 className="login-form-title">Welcome back</h1>
              <p className="login-form-sub">Sign in to your workspace</p>
            </div>
            <div className="login-field">
              <div className="login-field-header"><label className="login-field-label">Email address</label></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" placeholder="you@company.com" />
            </div>
            <div className="login-field">
              <div className="login-field-header">
                <label className="login-field-label">Password</label>
                <span className="login-field-link">Forgot password?</span>
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="login-input" placeholder="••••••••••••" />
            </div>
            {error && <div className="login-error">⚠ {error}</div>}
            <button onClick={handleLogin} disabled={loading} className="login-btn">{loading ? "Signing in..." : "Sign in →"}</button>
            <div className="login-footer">Access is by invitation only. <a>Contact your administrator.</a></div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- Change Password Modal ---
function ChangePasswordModal({ onClose, token }: { onClose: () => void; token: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/change-password`, { current_password: current, new_password: next }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to change password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal">
        <div className="app-modal-header">
          <span className="app-modal-title">Change Password</span>
          <button className="app-modal-close" onClick={onClose}>✕</button>
        </div>
        {success ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(0,200,83,0.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>✓</div>
            <p style={{fontWeight:600,color:"#0a0a0a",marginBottom:8}}>Password updated</p>
            <p style={{fontSize:13,color:"#9b9b93",marginBottom:20}}>Your password has been changed successfully.</p>
            <button className="btn-primary" onClick={onClose} style={{width:"100%",justifyContent:"center",padding:"13px"}}>Done</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[["Current Password",current,setCurrent],["New Password",next,setNext],["Confirm New Password",confirm,setConfirm]].map(([label,val,setter]: any) => (
              <div key={label as string}>
                <label className="app-label">{label as string}</label>
                <input type="password" value={val} onChange={(e) => setter(e.target.value)} className="app-input" placeholder="••••••••" />
              </div>
            ))}
            {error && <div className="inline-error">⚠ {error}</div>}
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{width:"100%",justifyContent:"center",padding:"13px"}}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sidebar ---
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "companies", label: "Companies", icon: "🏢" },
  { id: "workforce", label: "Workforce", icon: "👥" },
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "timeclock", label: "Time Clock", icon: "⏱️" },
  { id: "payroll", label: "Bordro", icon: "💰" },
];

function Sidebar({ active, onNavigate, user, onLogout, onChangePassword, items }: {
  active: string; onNavigate: (page: string) => void; user: User; onLogout: () => void; onChangePassword: () => void;
  items?: { id: string; label: string; icon: string }[];
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuItems = items ?? navItems;
  return (
    <div className="app-sidebar">
      <div className="app-sidebar-logo">WHITE<span>.</span>AI</div>
      <nav className="app-sidebar-nav">
        {menuItems.map((item) => (
          <button key={item.id} className={`app-nav-item ${active === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="app-sidebar-footer">
        <button className="app-user-btn" onClick={() => setShowMenu(!showMenu)}>
          <div className="app-avatar">{user.first_name[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="app-user-name">{user.first_name} {user.last_name}</div>
            <div className="app-user-role">{user.role}</div>
          </div>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>⌄</span>
        </button>
        {showMenu && (
          <div className="app-user-menu">
            <button className="app-menu-item" onClick={() => { onChangePassword(); setShowMenu(false); }}>Change Password</button>
            <div className="app-menu-divider" />
            <button className="app-menu-item danger" onClick={onLogout}>Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Dashboard Page ---
function DashboardPage({ user }: { user: User }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{greeting}, {user.first_name}.</h1>
        <p className="page-subtitle">Here's an overview of your operations.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          {icon:"👥",label:"Workforce Management",desc:"Shift planning, scheduling & overtime management.",status:"live",statusLabel:"● Live"},
          {icon:"📦",label:"Inventory Control",desc:"Stock tracking, recipe costs & supplier orders.",status:"live",statusLabel:"● Live"},
          {icon:"⏱️",label:"Time Clock",desc:"Employee check-in/out tracking & attendance.",status:"live",statusLabel:"● Live"},
          {icon:"💰",label:"HR & Payroll",desc:"SGK compliance, automated payroll & payslips.",status:"soon",statusLabel:"Coming Soon"},
          {icon:"💳",label:"Earned Wage Access",desc:"Let staff access earned wages before payday.",status:"soon",statusLabel:"Coming Soon"},
          {icon:"🤖",label:"AI Forecasting",desc:"Sales & staffing predictions powered by machine learning.",status:"soon",statusLabel:"Roadmap"},
        ].map((m) => (
          <div key={m.label} className="stat-card app-card-hover">
            <div className="stat-card-icon">{m.icon}</div>
            <div className="stat-card-title">{m.label}</div>
            <div className="stat-card-desc">{m.desc}</div>
            <span className={`stat-card-badge ${m.status==="live"?"badge-green":"badge-grey"}`}>{m.statusLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


/*
  EmployeeDetailModal — paste this component into App.tsx, just ABOVE the
  `function CompaniesPage(...)` definition. It shows full employee detail with a
  read mode and an edit mode (PUT /employees/{id}).

  It uses the same CSS classes already defined in appStyles (app-modal, app-input,
  btn-primary, etc.), so no new styles are needed.
*/
function EmployeeDetailModal({
  employee, token, onClose, onUpdated,
}: {
  employee: any; token: string; onClose: () => void; onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: employee.first_name || "",
    last_name: employee.last_name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    position: employee.position || "",
    department: employee.department || "",
    contract_type: employee.contract_type || "full_time",
    hire_date: employee.hire_date || "",
    base_salary: employee.base_salary != null ? String(employee.base_salary) : "",
    tc_no: employee.tc_no || "",
    sgk_no: employee.sgk_no || "",
    bank_iban: employee.bank_iban || "",
  });
  const headers = { Authorization: `Bearer ${token}` };

  const contractLabel = (ct: string) =>
    ({ full_time: "Tam Zamanlı", part_time: "Yarı Zamanlı", temporary: "Geçici", intern: "Stajyer" } as any)[ct] || ct;
  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const save = async () => {
    setError("");
    if (!form.first_name || !form.last_name) { setError("Ad ve soyad zorunlu."); return; }
    setSaving(true);
    try {
      await axios.put(`${API_URL}/employees/${employee.id}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        position: form.position || null,
        department: form.department || null,
        contract_type: form.contract_type,
        hire_date: form.hire_date || null,
        base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
        tc_no: form.tc_no || null,
        sgk_no: form.sgk_no || null,
        bank_iban: form.bank_iban || null,
      }, { headers });
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Güncelleme başarısız.");
    } finally { setSaving(false); }
  };

  // --- Read-mode field row ---
  const Field = ({ label, value }: { label: string; value: any }) => (
    <div style={{ background: "#f8f7f4", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9b93", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#0a0a0a", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div className="app-modal-overlay">
      <div className="app-modal">
        <div className="app-modal-header">
          <span className="app-modal-title">{employee.first_name} {employee.last_name}</span>
          <button className="app-modal-close" onClick={onClose}>✕</button>
        </div>

        {!editing ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span className="badge badge-grey">{contractLabel(employee.contract_type)}</span>
              {employee.user_id && <span className="badge badge-blue">Sistem Erişimi Var</span>}
              {employee.is_active ? <span className="badge badge-green">Aktif</span> : <span className="badge badge-red">Ayrıldı</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="E-posta" value={employee.email} />
              <Field label="Telefon" value={employee.phone} />
              <Field label="Pozisyon" value={employee.position} />
              <Field label="Departman" value={employee.department} />
              <Field label="İşe Giriş" value={fmtDate(employee.hire_date)} />
              <Field label="Maaş (Brüt)" value={employee.base_salary != null ? `₺${Number(employee.base_salary).toLocaleString("tr-TR")}` : null} />
              <Field label="TC Kimlik No" value={employee.tc_no} />
              <Field label="SGK No" value={employee.sgk_no} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Field label="IBAN" value={employee.bank_iban} />
            </div>
            {!employee.is_active && employee.termination_date && (
              <div style={{ marginTop: 12 }}>
                <Field label="Ayrılma Tarihi" value={fmtDate(employee.termination_date)} />
              </div>
            )}

            <button className="btn-primary" onClick={() => setEditing(true)} style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 20 }}>
              Düzenle
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="app-label">Ad *</label><input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">Soyad *</label><input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="app-input" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="app-label">E-posta</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">Telefon</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="app-input" /></div>
            </div>

            <div className="form-section-divider">İstihdam</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="app-label">Pozisyon</label><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">Departman</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="app-input" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="app-label">Sözleşme Türü</label>
                <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })} className="app-input">
                  <option value="full_time">Tam Zamanlı</option>
                  <option value="part_time">Yarı Zamanlı</option>
                  <option value="temporary">Geçici</option>
                  <option value="intern">Stajyer</option>
                </select>
              </div>
              <div><label className="app-label">İşe Giriş</label><input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} className="app-input" /></div>
            </div>
            <div><label className="app-label">Maaş (Brüt ₺/ay)</label><input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} className="app-input" placeholder="0.00" /></div>

            <div className="form-section-divider">Yasal / Bordro Bilgileri</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="app-label">TC Kimlik No</label><input value={form.tc_no} onChange={(e) => setForm({ ...form, tc_no: e.target.value })} className="app-input" placeholder="11 haneli" /></div>
              <div><label className="app-label">SGK No</label><input value={form.sgk_no} onChange={(e) => setForm({ ...form, sgk_no: e.target.value })} className="app-input" /></div>
            </div>
            <div><label className="app-label">IBAN</label><input value={form.bank_iban} onChange={(e) => setForm({ ...form, bank_iban: e.target.value })} className="app-input" placeholder="TR..." /></div>

            {error && <div className="inline-error">⚠ {error}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button className="btn-primary" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: "center", padding: "13px" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button className="btn-secondary" onClick={() => { setEditing(false); setError(""); }} style={{ flex: 1 }}>Vazgeç</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// --- Companies Page ---
function CompaniesPage({ token, isBrand }: { token: string; isBrand?: boolean }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"" });
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchForm, setBranchForm] = useState({ name:"", address:"", phone:"" });
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    first_name:"", last_name:"", email:"", phone:"",
    position:"", department:"", contract_type:"full_time",
    hire_date:"", base_salary:"",
    create_user_account: false, password:"", role:"employee",
  });
  const [employeeError, setEmployeeError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };
  const [inactiveEmployees, setInactiveEmployees] = useState<any[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState<any>(null);

  const [suspendedCompanies, setSuspendedCompanies] = useState<any[]>([]);
  const [companyAction, setCompanyAction] = useState<{ company: any; mode: "suspend" | "delete" | "reactivate" } | null>(null);
  const [suspendedBranches, setSuspendedBranches] = useState<any[]>([]);
  const [branchAction, setBranchAction] = useState<{ branch: any; mode: "suspend" | "delete" | "reactivate" } | null>(null);
  const [branchAdminPassword, setBranchAdminPassword] = useState("");
  const [branchActionError, setBranchActionError] = useState("");
  const [branchActionLoading, setBranchActionLoading] = useState(false);
  const [companyAdminPassword, setCompanyAdminPassword] = useState("");
  const [companyActionError, setCompanyActionError] = useState("");
  const [companyActionLoading, setCompanyActionLoading] = useState(false);
  
  const loadCompanies = async () => {
    setLoading(true);
    try { const res = await axios.get(`${API_URL}/companies`, { headers }); setCompanies(isBrand ? res.data.filter((c: any) => c.company_type === "brand") : res.data); }
    catch { } finally { setLoading(false); }
  };
  const loadBranches = async (id: string) => {
    try { const res = await axios.get(`${API_URL}/companies/${id}/branches`, { headers }); setBranches(res.data); }
    catch { }
  };
  const loadEmployees = async (branchId: string) => {
    try { const res = await axios.get(`${API_URL}/employees/branch/${branchId}`, { headers }); setEmployees(res.data); }
    catch { }
  };
  const loadInactiveEmployees = async (branchId: string) => {
    try { const res = await axios.get(`${API_URL}/employees/branch/${branchId}/inactive`, { headers }); setInactiveEmployees(res.data); }
    catch { }
  };
  const reactivateEmployee = async (employeeId: string) => {
    if (!selectedBranch) return;
    try {
      await axios.put(`${API_URL}/employees/${employeeId}/reactivate`, {}, { headers });
      loadEmployees(selectedBranch.id);
      loadInactiveEmployees(selectedBranch.id);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Tekrar işe alma başarısız.");
    }
  };
  const loadSuspendedCompanies = async () => {
    try { const res = await axios.get(`${API_URL}/companies/suspended`, { headers }); setSuspendedCompanies(res.data); }
    catch { }
  };
  const runCompanyAction = async () => {
    if (!companyAction || !companyAdminPassword) { setCompanyActionError("Admin şifresi gerekli."); return; }
    setCompanyActionLoading(true); setCompanyActionError("");
    const { company, mode } = companyAction;
    try {
      if (mode === "suspend") {
        await axios.put(`${API_URL}/companies/${company.id}/suspend`, { admin_password: companyAdminPassword }, { headers });
      } else if (mode === "reactivate") {
        await axios.put(`${API_URL}/companies/${company.id}/reactivate`, { admin_password: companyAdminPassword }, { headers });
      } else if (mode === "delete") {
        await axios.delete(`${API_URL}/companies/${company.id}`, { headers, data: { admin_password: companyAdminPassword } });
      }
      setCompanyAction(null);
      setCompanyAdminPassword("");
      if (selectedCompany?.id === company.id) { setSelectedCompany(null); setSelectedBranch(null); setBranches([]); setEmployees([]); }
      loadCompanies();
      loadSuspendedCompanies();
    } catch (err: any) {
      setCompanyActionError(err.response?.data?.detail || "İşlem başarısız.");
    } finally { setCompanyActionLoading(false); }
  };

  const loadSuspendedBranches = async (companyId: string) => {
    try { const res = await axios.get(`${API_URL}/companies/${companyId}/branches/suspended`, { headers }); setSuspendedBranches(res.data); }
    catch { }
  };
  const runBranchAction = async () => {
    if (!branchAction || !branchAdminPassword) { setBranchActionError("Admin şifresi gerekli."); return; }
    setBranchActionLoading(true); setBranchActionError("");
    const { branch, mode } = branchAction;
    try {
      if (mode === "suspend") {
        await axios.put(`${API_URL}/branches/${branch.id}/suspend`, { admin_password: branchAdminPassword }, { headers });
      } else if (mode === "reactivate") {
        await axios.put(`${API_URL}/branches/${branch.id}/reactivate`, { admin_password: branchAdminPassword }, { headers });
      } else if (mode === "delete") {
        await axios.delete(`${API_URL}/branches/${branch.id}`, { headers, data: { admin_password: branchAdminPassword } });
      }
      setBranchAction(null);
      setBranchAdminPassword("");
      if (selectedBranch?.id === branch.id) { setSelectedBranch(null); setEmployees([]); }
      if (selectedCompany) { loadBranches(selectedCompany.id); loadSuspendedBranches(selectedCompany.id); }
    } catch (err: any) {
      setBranchActionError(err.response?.data?.detail || "İşlem başarısız.");
    } finally { setBranchActionLoading(false); }
  };

  useState(() => { loadCompanies(); loadSuspendedCompanies(); });

  const createCompany = async () => {
    setError("");
    try {
      await axios.post(`${API_URL}/companies`, form, { headers });
      setShowForm(false); setForm({ name:"", email:"", phone:"", address:"" }); loadCompanies();
    } catch (err: any) { setError(err.response?.data?.detail || "Failed to create company."); }
  };
  const createBranch = async () => {
    if (!selectedCompany) return;
    try {
      await axios.post(`${API_URL}/companies/${selectedCompany.id}/branches`, { ...branchForm, company_id: selectedCompany.id }, { headers });
      setShowBranchForm(false); setBranchForm({ name:"", address:"", phone:"" }); loadBranches(selectedCompany.id);
    } catch { }
  };
  const createEmployee = async () => {
    if (!selectedBranch || !selectedCompany) return;
    setEmployeeError("");
    try {
      await axios.post(`${API_URL}/employees`, {
        first_name: employeeForm.first_name,
        last_name: employeeForm.last_name,
        email: employeeForm.email || null,
        phone: employeeForm.phone || null,
        position: employeeForm.position || null,
        department: employeeForm.department || null,
        contract_type: employeeForm.contract_type,
        hire_date: employeeForm.hire_date || null,
        base_salary: employeeForm.base_salary ? parseFloat(employeeForm.base_salary) : null,
        company_id: selectedCompany.id,
        branch_id: selectedBranch.id,
        create_user_account: employeeForm.create_user_account,
        password: employeeForm.create_user_account ? employeeForm.password : null,
        role: employeeForm.role,
      }, { headers });
      setShowEmployeeForm(false);
      setEmployeeForm({
        first_name:"", last_name:"", email:"", phone:"",
        position:"", department:"", contract_type:"full_time",
        hire_date:"", base_salary:"",
        create_user_account: false, password:"", role:"employee",
      });
      loadEmployees(selectedBranch.id);
    } catch (err: any) { setEmployeeError(err.response?.data?.detail || "Failed to create employee."); }
  };
  const terminateEmployee = async () => {
    if (!employeeToDelete || !adminPassword) { setDeleteError("Password is required."); return; }
    setDeleteLoading(true); setDeleteError("");
    try {
      await axios.delete(`${API_URL}/employees/${employeeToDelete.id}/terminate`, {
        headers,
        data: { admin_password: adminPassword },
      });
      setShowDeleteModal(false);
      setAdminPassword("");
      setEmployeeToDelete(null);
      loadEmployees(selectedBranch.id);
    } catch (err: any) {
      setDeleteError(err.response?.data?.detail || "Failed to terminate employee.");
    } finally { setDeleteLoading(false); }
  };
  const selectCompany = (c: any) => { setSelectedCompany(c); setSelectedBranch(null); setEmployees([]); loadBranches(c.id); loadSuspendedBranches(c.id); };
  const selectBranch = (b: any) => { setSelectedBranch(b); loadEmployees(b.id); loadInactiveEmployees(b.id); };

  const contractLabel = (ct: string) => ({ full_time:"Full Time", part_time:"Part Time", temporary:"Temporary", intern:"Intern" }[ct] || ct);

  return (
    <div>
      <div className="page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
      <div>
          <h1 className="page-title">{isBrand ? "Şirketim" : "Companies"}</h1>
          <p className="page-subtitle">{isBrand ? "Ana şirketinizi ve şubelerinizi yönetin." : "Manage your companies, branches and employees."}</p>
        </div>
        {!isBrand && <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Company</button>}
      </div>
      
      {detailEmployee && (
        <EmployeeDetailModal
          employee={detailEmployee}
          token={token}
          onClose={() => setDetailEmployee(null)}
          onUpdated={() => { loadEmployees(selectedBranch.id); setDetailEmployee(null); }}
        />
      )}
      
      {showForm && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">New Company</span>
              <button className="app-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[["Company Name","name","text"],["Email","email","email"],["Phone","phone","text"],["Address","address","text"]].map(([label,key,type]) => (
                <div key={key as string}>
                  <label className="app-label">{label as string}</label>
                  <input type={type as string} value={(form as any)[key as string]} onChange={(e) => setForm({...form,[key as string]:e.target.value})} className="app-input" />
                </div>
              ))}
              {error && <div className="inline-error">⚠ {error}</div>}
              <button className="btn-primary" onClick={createCompany} style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>Create Company</button>
            </div>
          </div>
        </div>
      )}

      {showEmployeeForm && selectedBranch && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">New Employee</span>
              <button className="app-modal-close" onClick={() => { setShowEmployeeForm(false); setEmployeeError(""); }}>✕</button>
            </div>
            <div style={{marginBottom:16,padding:"12px 16px",background:"#f8f7f4",borderRadius:10,border:"1px solid #e5e4e0"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#0a0a0a"}}>{selectedBranch.name}</div>
              <div style={{fontSize:12,color:"#9b9b93",marginTop:2}}>{selectedCompany?.name}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* Personal */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="app-label">First Name *</label><input value={employeeForm.first_name} onChange={(e) => setEmployeeForm({...employeeForm,first_name:e.target.value})} className="app-input" placeholder="Ali" /></div>
                <div><label className="app-label">Last Name *</label><input value={employeeForm.last_name} onChange={(e) => setEmployeeForm({...employeeForm,last_name:e.target.value})} className="app-input" placeholder="Yılmaz" /></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="app-label">Email</label><input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({...employeeForm,email:e.target.value})} className="app-input" placeholder="ali@georgia.com" /></div>
                <div><label className="app-label">Phone</label><input value={employeeForm.phone} onChange={(e) => setEmployeeForm({...employeeForm,phone:e.target.value})} className="app-input" placeholder="05xx..." /></div>
              </div>

              {/* Employment */}
              <div className="form-section-divider">Employment</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="app-label">Position</label><input value={employeeForm.position} onChange={(e) => setEmployeeForm({...employeeForm,position:e.target.value})} className="app-input" placeholder="Barista" /></div>
                <div><label className="app-label">Department</label><input value={employeeForm.department} onChange={(e) => setEmployeeForm({...employeeForm,department:e.target.value})} className="app-input" placeholder="Service" /></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label className="app-label">Contract Type</label>
                  <select value={employeeForm.contract_type} onChange={(e) => setEmployeeForm({...employeeForm,contract_type:e.target.value})} className="app-input">
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="temporary">Temporary</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div><label className="app-label">Hire Date</label><input type="date" value={employeeForm.hire_date} onChange={(e) => setEmployeeForm({...employeeForm,hire_date:e.target.value})} className="app-input" /></div>
              </div>
              <div><label className="app-label">Base Salary (₺/month)</label><input type="number" value={employeeForm.base_salary} onChange={(e) => setEmployeeForm({...employeeForm,base_salary:e.target.value})} className="app-input" placeholder="0.00" /></div>

              {/* System Access */}
              <div className="form-section-divider">System Access</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" id="create_user" checked={employeeForm.create_user_account} onChange={(e) => setEmployeeForm({...employeeForm,create_user_account:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}} />
                <label htmlFor="create_user" style={{fontSize:14,color:"#5a5a54",cursor:"pointer"}}>Create system login account</label>
              </div>
              {employeeForm.create_user_account && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label className="app-label">Password *</label><input type="password" value={employeeForm.password} onChange={(e) => setEmployeeForm({...employeeForm,password:e.target.value})} className="app-input" placeholder="Min. 8 chars" /></div>
                  <div>
                    <label className="app-label">Role</label>
                    <select value={employeeForm.role} onChange={(e) => setEmployeeForm({...employeeForm,role:e.target.value})} className="app-input">
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>
              )}

              {employeeError && <div className="inline-error">⚠ {employeeError}</div>}
              <button className="btn-primary" onClick={createEmployee} style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>Create Employee</button>
            </div>
          </div>
        </div>
      )}


{branchAction && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">
                {branchAction.mode === "suspend" ? "Şubeyi Askıya Al" : branchAction.mode === "reactivate" ? "Şubeyi Yeniden Aktifleştir" : "Şubeyi Sil"}
              </span>
              <button className="app-modal-close" onClick={() => { setBranchAction(null); setBranchActionError(""); setBranchAdminPassword(""); }}>✕</button>
            </div>
            <div style={{marginBottom:20,padding:"14px 16px",borderRadius:10,background: branchAction.mode === "reactivate" ? "rgba(0,200,83,0.06)" : "#fff5f5", border: branchAction.mode === "reactivate" ? "1px solid rgba(0,200,83,0.2)" : "1px solid #fecaca"}}>
              {branchAction.mode === "suspend" && (
                <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{branchAction.branch.name}</strong> askıya alınacak. Bu şubedeki tüm aktif çalışanların sisteme girişi kesilecek. Veriler korunur.</div>
              )}
              {branchAction.mode === "reactivate" && (
                <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{branchAction.branch.name}</strong> yeniden aktifleştirilecek. Aktif çalışanların girişi geri açılacak (manuel çıkarılanlar hariç).</div>
              )}
              {branchAction.mode === "delete" && (
                <>
                  <div style={{fontSize:13,fontWeight:600,color:"#dc2626",marginBottom:4}}>⚠ Bu işlem geri alınamaz.</div>
                  <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{branchAction.branch.name}</strong> kalıcı olarak silinecek. Sadece çalışan içermeyen şubeler silinebilir.</div>
                </>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="app-label">Admin Şifresi</label>
                <input type="password" value={branchAdminPassword} onChange={(e) => setBranchAdminPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runBranchAction()} className="app-input" placeholder="Onaylamak için admin şifreni gir" autoFocus />
              </div>
              {branchActionError && <div className="inline-error">⚠ {branchActionError}</div>}
              <button className="btn-primary" onClick={runBranchAction} disabled={branchActionLoading} style={{width:"100%",justifyContent:"center",padding:"13px", background: branchAction.mode === "reactivate" ? "#00a843" : "#dc2626"}}>
                {branchActionLoading ? "İşleniyor..." : branchAction.mode === "suspend" ? "Askıya Al" : branchAction.mode === "reactivate" ? "Yeniden Aktifleştir" : "Kalıcı Olarak Sil"}
              </button>
            </div>
          </div>
        </div>
      )}


      {companyAction && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">
                {companyAction.mode === "suspend" ? "Şirketi Askıya Al" : companyAction.mode === "reactivate" ? "Şirketi Yeniden Aktifleştir" : "Şirketi Sil"}
              </span>
              <button className="app-modal-close" onClick={() => { setCompanyAction(null); setCompanyActionError(""); setCompanyAdminPassword(""); }}>✕</button>
            </div>
            <div style={{marginBottom:20,padding:"14px 16px",borderRadius:10,background: companyAction.mode === "reactivate" ? "rgba(0,200,83,0.06)" : "#fff5f5", border: companyAction.mode === "reactivate" ? "1px solid rgba(0,200,83,0.2)" : "1px solid #fecaca"}}>
              {companyAction.mode === "suspend" && (
                <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{companyAction.company.name}</strong> askıya alınacak. Bu şirketteki tüm aktif çalışanların sisteme girişi kesilecek. Veriler korunur, daha sonra yeniden aktifleştirebilirsin.</div>
              )}
              {companyAction.mode === "reactivate" && (
                <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{companyAction.company.name}</strong> yeniden aktifleştirilecek. Aktif çalışanların girişi geri açılacak (manuel çıkarılan çalışanlar hariç).</div>
              )}
              {companyAction.mode === "delete" && (
                <>
                  <div style={{fontSize:13,fontWeight:600,color:"#dc2626",marginBottom:4}}>⚠ Bu işlem geri alınamaz.</div>
                  <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{companyAction.company.name}</strong> kalıcı olarak silinecek. Sadece şube ve çalışan içermeyen şirketler silinebilir.</div>
                </>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="app-label">Admin Şifresi</label>
                <input type="password" value={companyAdminPassword} onChange={(e) => setCompanyAdminPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCompanyAction()} className="app-input" placeholder="Onaylamak için admin şifreni gir" autoFocus />
              </div>
              {companyActionError && <div className="inline-error">⚠ {companyActionError}</div>}
              <button className="btn-primary" onClick={runCompanyAction} disabled={companyActionLoading} style={{width:"100%",justifyContent:"center",padding:"13px", background: companyAction.mode === "reactivate" ? "#00a843" : "#dc2626"}}>
                {companyActionLoading ? "İşleniyor..." : companyAction.mode === "suspend" ? "Askıya Al" : companyAction.mode === "reactivate" ? "Yeniden Aktifleştir" : "Kalıcı Olarak Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && employeeToDelete && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">Terminate Employee</span>
              <button className="app-modal-close" onClick={() => { setShowDeleteModal(false); setDeleteError(""); setAdminPassword(""); }}>✕</button>
            </div>
            <div style={{marginBottom:20,padding:"14px 16px",background:"#fff5f5",borderRadius:10,border:"1px solid #fecaca"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#dc2626",marginBottom:4}}>⚠ This action cannot be undone.</div>
              <div style={{fontSize:13,color:"#0a0a0a"}}><strong>{employeeToDelete.first_name} {employeeToDelete.last_name}</strong> will be terminated. Historical records are preserved.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="app-label">Admin Password</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && terminateEmployee()} className="app-input" placeholder="Enter your admin password to confirm" autoFocus />
              </div>
              {deleteError && <div className="inline-error">⚠ {deleteError}</div>}
              <button className="btn-primary" onClick={terminateEmployee} disabled={deleteLoading} style={{width:"100%",justifyContent:"center",padding:"13px",background:"#dc2626"}}>
                {deleteLoading ? "Terminating..." : "Confirm Termination"}
              </button>
            </div>
          </div>
        </div>
      )}
 
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
        {/* Companies */}
        <div>
          <div className="section-label">{isBrand ? "Ana Şirket" : "All Companies"}</div>
          {loading ? <p style={{fontSize:14,color:"#9b9b93"}}>Loading...</p>
          : companies.length === 0 ? <div className="empty-state"><p className="empty-state-text">No companies yet.</p></div>
          : <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {companies.map(c => (
                <div key={c.id} className={`list-item ${selectedCompany?.id===c.id?"selected":""}`} style={{cursor:"pointer"}} onClick={() => selectCompany(c)}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="list-item-title">{c.name}</div>
                      <div className="list-item-sub">{c.email}</div>
                    </div>
                    {!isBrand && <button className="btn-danger" onClick={(ev) => { ev.stopPropagation(); setCompanyAction({ company: c, mode: "suspend" }); setCompanyActionError(""); setCompanyAdminPassword(""); }} style={{flexShrink:0,marginLeft:8,padding:"4px 10px",fontSize:11}}>
                      Askıya Al
                    </button>}
                  </div>
                </div>
              ))}
            </div>}

          {/* Suspended companies */}
          {suspendedCompanies.length > 0 && (
            <div style={{marginTop:24}}>
              <div className="section-label">Askıya Alınan Şirketler ({suspendedCompanies.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {suspendedCompanies.map(c => (
                  <div key={c.id} className="app-card" style={{padding:"14px 16px",opacity:0.85}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="list-item-title">{c.name}</div>
                        <div className="list-item-sub">{c.email}</div>
                        <span className="badge badge-red" style={{marginTop:4,display:"inline-block"}}>Askıda</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,marginLeft:8}}>
                        <button className="btn-success" onClick={() => { setCompanyAction({ company: c, mode: "reactivate" }); setCompanyActionError(""); setCompanyAdminPassword(""); }} style={{padding:"4px 10px",fontSize:11}}>
                          Yeniden Aktifleştir
                        </button>
                        <button className="btn-danger" onClick={() => { setCompanyAction({ company: c, mode: "delete" }); setCompanyActionError(""); setCompanyAdminPassword(""); }} style={{padding:"4px 10px",fontSize:11}}>
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Branches */}
        <div>
          {selectedCompany ? (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div className="section-label" style={{marginBottom:0}}>Branches — {selectedCompany.name}</div>
                <button className="btn-ghost-sm" onClick={() => setShowBranchForm(true)}>+ Add</button>
              </div>
              {showBranchForm && (
                <div className="app-card" style={{padding:16,marginBottom:12}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[["Branch Name","name"],["Address","address"],["Phone","phone"]].map(([label,key]) => (
                      <div key={key as string}>
                        <label className="app-label">{label as string}</label>
                        <input value={(branchForm as any)[key as string]} onChange={(e) => setBranchForm({...branchForm,[key as string]:e.target.value})} className="app-input" />
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:4}}>
                      <button className="btn-primary" onClick={createBranch} style={{flex:1,justifyContent:"center"}}>Create</button>
                      <button className="btn-secondary" onClick={() => setShowBranchForm(false)} style={{flex:1}}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            {branches.length === 0 ? <div className="empty-state"><p className="empty-state-text">No branches yet.</p></div>
              : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {branches.map(b => (
                    <div key={b.id} className={`list-item ${selectedBranch?.id===b.id?"selected":""}`} style={{cursor:"pointer"}} onClick={() => selectBranch(b)}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="list-item-title">{b.name}</div>
                          <div className="list-item-sub">{b.address || "No address"}</div>
                        </div>
                        <button className="btn-danger" onClick={(ev) => { ev.stopPropagation(); setBranchAction({ branch: b, mode: "suspend" }); setBranchActionError(""); setBranchAdminPassword(""); }} style={{flexShrink:0,marginLeft:8,padding:"4px 10px",fontSize:11}}>
                          Askıya Al
                        </button>
                      </div>
                    </div>
                  ))}
                </div>}

              {/* Suspended branches */}
              {suspendedBranches.length > 0 && (
                <div style={{marginTop:20}}>
                  <div className="section-label">Askıya Alınan Şubeler ({suspendedBranches.length})</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {suspendedBranches.map(b => (
                      <div key={b.id} className="app-card" style={{padding:"14px 16px",opacity:0.85}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div className="list-item-title">{b.name}</div>
                            <div className="list-item-sub">{b.address || "No address"}</div>
                            <span className="badge badge-red" style={{marginTop:4,display:"inline-block"}}>Askıda</span>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0,marginLeft:8}}>
                            <button className="btn-success" onClick={() => { setBranchAction({ branch: b, mode: "reactivate" }); setBranchActionError(""); setBranchAdminPassword(""); }} style={{padding:"4px 10px",fontSize:11}}>
                              Yeniden Aktifleştir
                            </button>
                            <button className="btn-danger" onClick={() => { setBranchAction({ branch: b, mode: "delete" }); setBranchActionError(""); setBranchAdminPassword(""); }} style={{padding:"4px 10px",fontSize:11}}>
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <div className="empty-state"><p className="empty-state-text">Select a company.</p></div>}
        </div>

        {/* Employees */}
        <div>
          {selectedBranch ? (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div className="section-label" style={{marginBottom:0}}>Employees — {selectedBranch.name}</div>
                <button className="btn-ghost-sm" onClick={() => setShowEmployeeForm(true)}>+ Add</button>
              </div>
              {employees.length === 0 ? <div className="empty-state"><p className="empty-state-text">No employees yet.</p></div>
              : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {employees.map(e => (
                    <div key={e.id} className="app-card" style={{padding:"14px 16px",cursor:"pointer"}} onClick={() => setDetailEmployee(e)}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="list-item-title">{e.first_name} {e.last_name}</div>
                          <div className="list-item-sub">{e.position || e.email || "—"}</div>
                          {e.contract_type && <span className="badge badge-grey" style={{marginTop:4,display:"inline-block"}}>{contractLabel(e.contract_type)}</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                          {e.user_id && <span className="badge badge-blue" style={{fontSize:10}}>Login</span>}
                          <button className="btn-danger" onClick={(ev) => { ev.stopPropagation(); setEmployeeToDelete(e); setShowDeleteModal(true); setDeleteError(""); setAdminPassword(""); }} style={{padding:"4px 10px",fontSize:11}}>                            Terminate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}

              {/* Inactive / rehire section */}
              {inactiveEmployees.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#9b9b93", textTransform: "uppercase", letterSpacing: "0.1em", padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {showInactive ? "▾" : "▸"} Eski Çalışanlar ({inactiveEmployees.length})
                  </button>
                  {showInactive && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {inactiveEmployees.map(e => (
                        <div key={e.id} className="app-card" style={{ padding: "14px 16px", opacity: 0.85 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="list-item-title">{e.first_name} {e.last_name}</div>
                              <div className="list-item-sub">{e.position || e.email || "—"}</div>
                              {e.termination_date && <span className="badge badge-red" style={{ marginTop: 4, display: "inline-block" }}>Ayrıldı: {new Date(e.termination_date).toLocaleDateString("tr-TR")}</span>}
                            </div>
                            <button className="btn-success" onClick={() => reactivateEmployee(e.id)} style={{ flexShrink: 0, marginLeft: 8 }}>
                              Tekrar İşe Al
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : <div className="empty-state"><p className="empty-state-text">Select a branch.</p></div>}
        </div>
      </div>
    </div>
  );
}

// --- Workforce Page ---
function WorkforcePage({ token }: { token: string }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [form, setForm] = useState({ title:"", start_time:"", end_time:"", notes:"" });
  const [loading, setLoading] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const loadBranches = async () => {
    setLoading(true);
    try {
      const cr = await axios.get(`${API_URL}/companies`, { headers });
      const all: any[] = [];
      for (const c of cr.data) {
        const br = await axios.get(`${API_URL}/companies/${c.id}/branches`, { headers });
        br.data.forEach((b: any) => all.push({ ...b, company_name: c.name }));
      }
      setBranches(all);
    } catch { } finally { setLoading(false); }
  };
  const loadShifts = async (id: string) => {
    try { const res = await axios.get(`${API_URL}/shifts/branch/${id}`, { headers }); setShifts(res.data); }
    catch { }
  };
  useState(() => { loadBranches(); });

  const selectBranch = (b: any) => { setSelectedBranch(b); loadShifts(b.id); };
  const createShift = async () => {
    if (!selectedBranch) return;
    try {
      await axios.post(`${API_URL}/shifts`, {
        branch_id: selectedBranch.id, title: form.title,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time + "T23:59:00").toISOString(),
        notes: form.notes || null,
      }, { headers });
      setShowShiftForm(false); setForm({ title:"", start_time:"", end_time:"", notes:"" }); loadShifts(selectedBranch.id);
    } catch { }
  };
  const publishShift = async (id: string) => { try { await axios.put(`${API_URL}/shifts/${id}`, { status:"published" }, { headers }); loadShifts(selectedBranch.id); } catch { } };
  const cancelShift = async (id: string) => { try { await axios.put(`${API_URL}/shifts/${id}`, { status:"cancelled" }, { headers }); loadShifts(selectedBranch.id); } catch { } };
  const deleteShift = async (id: string) => { try { await axios.delete(`${API_URL}/shifts/${id}`, { headers }); loadShifts(selectedBranch.id); } catch { } };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
  const calcHours = (s: string, e: string) => `${((new Date(e).getTime()-new Date(s).getTime())/3600000).toFixed(1)}h`;

  return (
    <div>
      <div className="page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">Workforce Management</h1>
          <p className="page-subtitle">Manage shifts and team schedules.</p>
        </div>
        {selectedBranch && <button className="btn-primary" onClick={() => setShowShiftForm(true)}>+ New Shift</button>}
      </div>
      {showShiftForm && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">New Shift</span>
              <button className="app-modal-close" onClick={() => setShowShiftForm(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="app-label">Shift Title</label><input value={form.title} onChange={(e) => setForm({...form,title:e.target.value})} className="app-input" placeholder="Morning Shift" /></div>
              <div><label className="app-label">Start Date</label><input type="date" value={form.start_time} onChange={(e) => setForm({...form,start_time:e.target.value})} className="app-input" /></div>
              <div><label className="app-label">End Date</label><input type="date" value={form.end_time} onChange={(e) => setForm({...form,end_time:e.target.value})} className="app-input" /></div>
              <div><label className="app-label">Notes (optional)</label><input value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} className="app-input" placeholder="Any notes..." /></div>
              <button className="btn-primary" onClick={createShift} style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>Create Shift</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:24}}>
        <div>
          <div className="section-label">Branches</div>
          {loading ? <p style={{fontSize:14,color:"#9b9b93"}}>Loading...</p>
          : branches.length === 0 ? <div className="empty-state" style={{padding:32}}><p className="empty-state-text">No branches found.</p></div>
          : <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {branches.map(b => (
                <button key={b.id} className={`list-item ${selectedBranch?.id===b.id?"selected":""}`} onClick={() => selectBranch(b)}>
                  <div className="list-item-title">{b.name}</div>
                  <div className="list-item-sub">{b.company_name}</div>
                </button>
              ))}
            </div>}
        </div>
        <div>
          {selectedBranch ? (
            <>
              <div className="section-label">Shifts — {selectedBranch.name}</div>
              {shifts.length === 0 ? <div className="empty-state"><p className="empty-state-text">No shifts yet. Create the first one.</p></div>
              : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {shifts.map(s => (
                    <div key={s.id} className="shift-card">
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                        <div>
                          <div className="shift-card-title">{s.title}</div>
                          <div className="shift-card-meta">{formatDate(s.start_time)} → {formatDate(s.end_time)} <span style={{color:"#c5c4c0"}}>({calcHours(s.start_time,s.end_time)})</span></div>
                          {s.notes && <div style={{fontSize:12,color:"#9b9b93",marginTop:4}}>{s.notes}</div>}
                        </div>
                        <span className={`status-${s.status}`}>{s.status}</span>
                      </div>
                      <div className="shift-card-actions">
                        {s.status==="draft" && <>
                          <button className="btn-success" onClick={() => publishShift(s.id)}>Publish</button>
                          <button className="btn-ghost-sm" onClick={() => cancelShift(s.id)}>Cancel</button>
                        </>}
                        {s.status==="cancelled" && <button className="btn-danger" onClick={() => deleteShift(s.id)}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>}
            </>
          ) : <div className="empty-state"><p className="empty-state-text">Select a branch to view shifts.</p></div>}
        </div>
      </div>
    </div>
  );
}

// --- Inventory Page ---
function InventoryPage({ token }: { token: string }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({ name:"", unit:"", unit_cost:"", current_stock:"", min_stock_level:"" });
  const [movementForm, setMovementForm] = useState({ type:"purchase", quantity:"", unit_cost:"", notes:"" });
  const headers = { Authorization: `Bearer ${token}` };

  const loadBranches = async () => {
    setLoading(true);
    try {
      const cr = await axios.get(`${API_URL}/companies`, { headers });
      const all: any[] = [];
      for (const c of cr.data) {
        const br = await axios.get(`${API_URL}/companies/${c.id}/branches`, { headers });
        br.data.forEach((b: any) => all.push({ ...b, company_name: c.name }));
      }
      setBranches(all);
    } catch { } finally { setLoading(false); }
  };
  const loadProducts = async (branchId: string) => {
    try { const res = await axios.get(`${API_URL}/inventory/products/branch/${branchId}`, { headers }); setProducts(res.data); }
    catch { }
  };
  const loadMovements = async (productId: string) => {
    try { const res = await axios.get(`${API_URL}/inventory/movements/${productId}`, { headers }); setMovements(res.data); }
    catch { }
  };
  useState(() => { loadBranches(); });

  const selectBranch = (b: any) => { setSelectedBranch(b); setSelectedProduct(null); setMovements([]); loadProducts(b.id); };
  const selectProduct = (p: any) => { setSelectedProduct(p); loadMovements(p.id); };

  const createProduct = async () => {
    if (!selectedBranch) return;
    try {
      await axios.post(`${API_URL}/inventory/products`, {
        branch_id: selectedBranch.id, name: productForm.name, unit: productForm.unit,
        unit_cost: parseFloat(productForm.unit_cost) || 0,
        current_stock: parseFloat(productForm.current_stock) || 0,
        min_stock_level: parseFloat(productForm.min_stock_level) || 0,
      }, { headers });
      setShowProductForm(false);
      setProductForm({ name:"", unit:"", unit_cost:"", current_stock:"", min_stock_level:"" });
      loadProducts(selectedBranch.id);
    } catch { }
  };

  const addMovement = async () => {
    if (!selectedProduct || !selectedBranch) return;
    try {
      await axios.post(`${API_URL}/inventory/movements`, {
        product_id: selectedProduct.id, branch_id: selectedBranch.id,
        type: movementForm.type, quantity: parseFloat(movementForm.quantity),
        unit_cost: movementForm.unit_cost ? parseFloat(movementForm.unit_cost) : null,
        notes: movementForm.notes || null,
      }, { headers });
      setShowMovementForm(false);
      setMovementForm({ type:"purchase", quantity:"", unit_cost:"", notes:"" });
      loadProducts(selectedBranch.id);
      loadMovements(selectedProduct.id);
      const res = await axios.get(`${API_URL}/inventory/products/${selectedProduct.id}`, { headers });
      setSelectedProduct(res.data);
    } catch { }
  };

  const movementTypeColor = (type: string) => ({ purchase:"badge-green", usage:"badge-yellow", waste:"badge-red" }[type] || "badge-grey");
  const movementTypeLabel = (type: string) => ({ purchase:"+ Purchase", usage:"− Usage", waste:"− Waste" }[type] || "± Adjustment");
  const stockStatus = (p: any) => p.min_stock_level > 0 && p.current_stock <= p.min_stock_level
    ? <span className="badge badge-red">Low Stock</span>
    : <span className="badge badge-green">OK</span>;

  return (
    <div>
      <div className="page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div><h1 className="page-title">Inventory</h1><p className="page-subtitle">Track stock levels and movements.</p></div>
        {selectedBranch && <button className="btn-primary" onClick={() => setShowProductForm(true)}>+ New Product</button>}
      </div>
      {showProductForm && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header"><span className="app-modal-title">New Product</span><button className="app-modal-close" onClick={() => setShowProductForm(false)}>✕</button></div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label className="app-label">Product Name</label><input value={productForm.name} onChange={(e) => setProductForm({...productForm,name:e.target.value})} className="app-input" placeholder="e.g. Arabica Coffee Beans" /></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="app-label">Unit</label><input value={productForm.unit} onChange={(e) => setProductForm({...productForm,unit:e.target.value})} className="app-input" placeholder="kg, litre, adet" /></div>
                <div><label className="app-label">Unit Cost (₺)</label><input type="number" value={productForm.unit_cost} onChange={(e) => setProductForm({...productForm,unit_cost:e.target.value})} className="app-input" placeholder="0.00" /></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="app-label">Current Stock</label><input type="number" value={productForm.current_stock} onChange={(e) => setProductForm({...productForm,current_stock:e.target.value})} className="app-input" placeholder="0" /></div>
                <div><label className="app-label">Min Stock Level</label><input type="number" value={productForm.min_stock_level} onChange={(e) => setProductForm({...productForm,min_stock_level:e.target.value})} className="app-input" placeholder="0" /></div>
              </div>
              <button className="btn-primary" onClick={createProduct} style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>Create Product</button>
            </div>
          </div>
        </div>
      )}
      {showMovementForm && selectedProduct && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header"><span className="app-modal-title">Add Movement</span><button className="app-modal-close" onClick={() => setShowMovementForm(false)}>✕</button></div>
            <div style={{marginBottom:16,padding:"12px 16px",background:"#f8f7f4",borderRadius:10,border:"1px solid #e5e4e0"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#0a0a0a"}}>{selectedProduct.name}</div>
              <div style={{fontSize:12,color:"#9b9b93",marginTop:2}}>Current stock: {selectedProduct.current_stock} {selectedProduct.unit}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="app-label">Movement Type</label>
                <select value={movementForm.type} onChange={(e) => setMovementForm({...movementForm,type:e.target.value})} className="app-input">
                  <option value="purchase">Purchase — stock in</option>
                  <option value="usage">Usage — stock out</option>
                  <option value="waste">Waste — stock out</option>
                  <option value="adjustment">Adjustment — manual fix</option>
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label className="app-label">Quantity</label><input type="number" value={movementForm.quantity} onChange={(e) => setMovementForm({...movementForm,quantity:e.target.value})} className="app-input" placeholder="0" /></div>
                {movementForm.type === "purchase" && <div><label className="app-label">Unit Cost (₺)</label><input type="number" value={movementForm.unit_cost} onChange={(e) => setMovementForm({...movementForm,unit_cost:e.target.value})} className="app-input" placeholder="0.00" /></div>}
              </div>
              <div><label className="app-label">Notes (optional)</label><input value={movementForm.notes} onChange={(e) => setMovementForm({...movementForm,notes:e.target.value})} className="app-input" placeholder="Any notes..." /></div>
              <button className="btn-primary" onClick={addMovement} style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>Add Movement</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr 1fr",gap:20}}>
        <div>
          <div className="section-label">Branches</div>
          {loading ? <p style={{fontSize:14,color:"#9b9b93"}}>Loading...</p>
          : branches.length === 0 ? <div className="empty-state" style={{padding:24}}><p className="empty-state-text">No branches.</p></div>
          : <div style={{display:"flex",flexDirection:"column",gap:8}}>{branches.map(b => (
              <button key={b.id} className={`list-item ${selectedBranch?.id===b.id?"selected":""}`} onClick={() => selectBranch(b)}>
                <div className="list-item-title">{b.name}</div><div className="list-item-sub">{b.company_name}</div>
              </button>
            ))}</div>}
        </div>
        <div>
          <div className="section-label">{selectedBranch ? `Products — ${selectedBranch.name}` : "Products"}</div>
          {!selectedBranch ? <div className="empty-state"><p className="empty-state-text">Select a branch to view products.</p></div>
          : products.length === 0 ? <div className="empty-state"><p className="empty-state-text">No products yet.</p></div>
          : <div style={{display:"flex",flexDirection:"column",gap:8}}>{products.map(p => (
              <button key={p.id} className={`list-item ${selectedProduct?.id===p.id?"selected":""}`} onClick={() => selectProduct(p)}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><div className="list-item-title">{p.name}</div>{stockStatus(p)}</div>
                <div className="list-item-sub">{p.current_stock} {p.unit} · ₺{p.unit_cost}/{p.unit}</div>
              </button>
            ))}</div>}
        </div>
        <div>
          {selectedProduct ? (
            <>
              <div className="app-card" style={{padding:"20px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                  <div>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:800,color:"#0a0a0a",letterSpacing:"-0.02em",marginBottom:4}}>{selectedProduct.name}</div>
                    <div style={{fontSize:13,color:"#9b9b93"}}>Unit: {selectedProduct.unit} · Cost: ₺{selectedProduct.unit_cost}</div>
                  </div>
                  {stockStatus(selectedProduct)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div style={{background:"#f8f7f4",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#9b9b93",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Current Stock</div>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"#0a0a0a"}}>{selectedProduct.current_stock} <span style={{fontSize:13,fontWeight:400,color:"#9b9b93"}}>{selectedProduct.unit}</span></div>
                  </div>
                  <div style={{background:"#f8f7f4",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#9b9b93",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Min Level</div>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"#0a0a0a"}}>{selectedProduct.min_stock_level} <span style={{fontSize:13,fontWeight:400,color:"#9b9b93"}}>{selectedProduct.unit}</span></div>
                  </div>
                </div>
                <button className="btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={() => setShowMovementForm(true)}>+ Add Movement</button>
              </div>
              <div className="section-label">Movement History</div>
              {movements.length === 0 ? <div className="empty-state" style={{padding:32}}><p className="empty-state-text">No movements yet.</p></div>
              : <div style={{display:"flex",flexDirection:"column",gap:8}}>{movements.map(m => (
                  <div key={m.id} className="app-card" style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span className={`badge ${movementTypeColor(m.type)}`}>{movementTypeLabel(m.type)}</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#0a0a0a"}}>{m.quantity} {selectedProduct.unit}</span>
                      </div>
                      {m.notes && <div style={{fontSize:12,color:"#9b9b93"}}>{m.notes}</div>}
                    </div>
                    <div style={{fontSize:11,color:"#c5c4c0"}}>{new Date(m.created_at).toLocaleString("tr-TR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                ))}</div>}
            </>
          ) : <div className="empty-state"><p className="empty-state-text">Select a product to view details.</p></div>}
        </div>
      </div>
    </div>
  );
}

// --- Time Clock Page ---
function TimeClockPage({ token }: { token: string }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInForm, setCheckInForm] = useState({ employee_id:"", is_late: false });
  const [error, setError] = useState("");
  const headers = { Authorization: `Bearer ${token}` };

  const loadBranches = async () => {
    setLoading(true);
    try {
      const cr = await axios.get(`${API_URL}/companies`, { headers });
      const all: any[] = [];
      for (const c of cr.data) {
        const br = await axios.get(`${API_URL}/companies/${c.id}/branches`, { headers });
        br.data.forEach((b: any) => all.push({ ...b, company_name: c.name }));
      }
      setBranches(all);
    } catch { } finally { setLoading(false); }
  };
  const loadRecords = async (branchId: string) => {
    try { const res = await axios.get(`${API_URL}/timeclock/branch/${branchId}`, { headers }); setRecords(res.data); }
    catch { }
  };
  const loadEmployees = async (branchId: string) => {
    try { const res = await axios.get(`${API_URL}/employees/branch/${branchId}`, { headers }); setEmployees(res.data); }
    catch { }
  };
  useState(() => { loadBranches(); });

  const selectBranch = (b: any) => { setSelectedBranch(b); loadRecords(b.id); loadEmployees(b.id); };
  const checkIn = async () => {
    if (!selectedBranch || !checkInForm.employee_id) { setError("Please select an employee."); return; }
    setError("");
    try {
      await axios.post(`${API_URL}/timeclock/checkin`, {
        branch_id: selectedBranch.id,
        employee_id: checkInForm.employee_id,
        is_late: checkInForm.is_late,
      }, { headers });
      setShowCheckInForm(false);
      setCheckInForm({ employee_id:"", is_late: false });
      loadRecords(selectedBranch.id);
    } catch (err: any) { setError(err.response?.data?.detail || "Check-in failed."); }
  };
  const checkOut = async (recordId: string) => {
    try { await axios.post(`${API_URL}/timeclock/checkout/${recordId}`, {}, { headers }); loadRecords(selectedBranch.id); }
    catch { }
  };
  const flagMissing = async (recordId: string) => {
    try { await axios.put(`${API_URL}/timeclock/flag/${recordId}`, {}, { headers }); loadRecords(selectedBranch.id); }
    catch { }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : employeeId.slice(0,8) + "...";
  };
  const statusBadge = (status: string) => {
    const map: Record<string, [string, string]> = {
      open: ["badge-green", "● Open"],
      completed: ["badge-grey", "Completed"],
      missing_checkout: ["badge-red", "Missing Checkout"],
      adjusted: ["badge-blue", "Adjusted"],
    };
    const [cls, label] = map[status] || ["badge-grey", status];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const openRecords = records.filter(r => r.status === "open");
  const otherRecords = records.filter(r => r.status !== "open");

  return (
    <div>
      <div className="page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">Time Clock</h1>
          <p className="page-subtitle">Track employee check-ins and attendance.</p>
        </div>
        {selectedBranch && <button className="btn-primary" onClick={() => setShowCheckInForm(true)}>+ Check In</button>}
      </div>

      {showCheckInForm && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">New Check-In</span>
              <button className="app-modal-close" onClick={() => { setShowCheckInForm(false); setError(""); }}>✕</button>
            </div>
            <div style={{marginBottom:16,padding:"12px 16px",background:"#f8f7f4",borderRadius:10,border:"1px solid #e5e4e0"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#0a0a0a"}}>{selectedBranch.name}</div>
              <div style={{fontSize:12,color:"#9b9b93",marginTop:2}}>Check-in time: {new Date().toLocaleString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="app-label">Employee</label>
                {employees.length === 0 ? (
                  <div style={{fontSize:13,color:"#9b9b93",padding:"10px 0"}}>No employees found in this branch. Add employees first.</div>
                ) : (
                  <select value={checkInForm.employee_id} onChange={(e) => setCheckInForm({...checkInForm,employee_id:e.target.value})} className="app-input">
                    <option value="">Select employee...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name}{e.position ? ` — ${e.position}` : ""}</option>
                    ))}
                  </select>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="checkbox" id="is_late" checked={checkInForm.is_late} onChange={(e) => setCheckInForm({...checkInForm,is_late:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}} />
                <label htmlFor="is_late" style={{fontSize:14,color:"#5a5a54",cursor:"pointer"}}>Mark as late arrival</label>
              </div>
              {error && <div className="inline-error">⚠ {error}</div>}
              <button className="btn-primary" onClick={checkIn} style={{width:"100%",justifyContent:"center",padding:"13px",marginTop:4}}>Confirm Check-In</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:20}}>
        <div>
          <div className="section-label">Branches</div>
          {loading ? <p style={{fontSize:14,color:"#9b9b93"}}>Loading...</p>
          : branches.length === 0 ? <div className="empty-state" style={{padding:24}}><p className="empty-state-text">No branches.</p></div>
          : <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {branches.map(b => (
                <button key={b.id} className={`list-item ${selectedBranch?.id===b.id?"selected":""}`} onClick={() => selectBranch(b)}>
                  <div className="list-item-title">{b.name}</div>
                  <div className="list-item-sub">{b.company_name}</div>
                </button>
              ))}
            </div>}
        </div>
        <div>
          {!selectedBranch ? (
            <div className="empty-state"><p className="empty-state-text">Select a branch to view records.</p></div>
          ) : (
            <>
              {openRecords.length > 0 && (
                <>
                  <div className="section-label">Currently Checked In ({openRecords.length})</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                    {openRecords.map(r => (
                      <div key={r.id} className="tc-record open">
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                          <div>
                            <div style={{fontSize:14,fontWeight:600,color:"#0a0a0a",marginBottom:4}}>{getEmployeeName(r.employee_id)}</div>
                            <div style={{fontSize:12,color:"#9b9b93"}}>Checked in: {formatTime(r.checked_in_at)}</div>
                            {r.is_late && <span className="badge badge-yellow" style={{marginTop:6,display:"inline-block"}}>Late</span>}
                          </div>
                          {statusBadge(r.status)}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button className="btn-success" onClick={() => checkOut(r.id)}>Check Out</button>
                          <button className="btn-ghost-sm" onClick={() => flagMissing(r.id)}>Flag Missing</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="section-label">All Records — {selectedBranch.name}</div>
              {records.length === 0 ? (
                <div className="empty-state"><p className="empty-state-text">No records yet. Start by checking in an employee.</p></div>
              ) : otherRecords.length === 0 ? (
                <div style={{fontSize:13,color:"#9b9b93",padding:"8px 0"}}>All employees are currently checked in.</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {otherRecords.map(r => (
                    <div key={r.id} className={`tc-record ${r.status==="missing_checkout"?"missing":""}`}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:"#0a0a0a",marginBottom:4}}>{getEmployeeName(r.employee_id)}</div>
                          <div style={{fontSize:12,color:"#9b9b93"}}>
                            {formatTime(r.checked_in_at)}
                            {r.checked_out_at && ` → ${formatTime(r.checked_out_at)}`}
                            {r.total_minutes && <span style={{color:"#c5c4c0",marginLeft:6}}>({formatDuration(r.total_minutes)})</span>}
                          </div>
                          {r.is_late && <span className="badge badge-yellow" style={{marginTop:6,display:"inline-block"}}>Late</span>}
                          {r.notes && <div style={{fontSize:12,color:"#9b9b93",marginTop:4}}>{r.notes}</div>}
                        </div>
                        {statusBadge(r.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Placeholder ---
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:320}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>🚧</div>
        <p style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:22,fontWeight:800,color:"#0a0a0a",marginBottom:8,letterSpacing:"-0.02em"}}>{title}</p>
        <p style={{fontSize:14,color:"#9b9b93"}}>This module is coming soon.</p>
      </div>
    </div>
  );
}



// --- Payroll Page ---
const AYLAR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

function PayrollPage({ token }: { token: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; kind: "error" | "success" } | null>(null);

  const showToast = (msg: string, kind: "error" | "success" = "error") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4000);
  };

  // Backend hata mesajlarını Türkçeleştir + ay adıyla göster.
  const trError = (detail: string): string => {
    if (!detail) return "Bordro çalıştırılamadı.";
    const m = detail.match(/Missing prior months \[([\d,\s]+)\]/);
    if (m) {
      const months = m[1].split(",").map(s => AYLAR[parseInt(s.trim()) - 1]).filter(Boolean);
      return `Önce şu ayları çalıştır: ${months.join(", ")} (aylar sırayla çalıştırılmalı).`;
    }
    if (detail.includes("not employed")) return "Çalışan bu ay henüz işe başlamamış.";
    if (detail.includes("no base_salary")) return "Çalışanın brüt maaşı tanımlı değil.";
    return detail;
  };

  // Bugünün ayı (2026 sabit yıl varsayımıyla; ileride yıl da parametre olur).
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  // Bu yıl için çalıştırılabilir en son ay (gelecek aylar kapalı).
  const maxRunnableMonth = (yr: number) => (yr < currentYear ? 12 : yr > currentYear ? 0 : currentMonth);

  // Bir sonraki çalıştırılması gereken ay — kayıtlı son ayın bir sonrası, ama bugünü aşmaz.
  const nextMonthToRun = (existing: any[], hireDate: string | null): number => {
    const hireMonth = hireDate ? new Date(hireDate).getMonth() + 1 : 1;
    const start = hireMonth;
    const cap = maxRunnableMonth(year);
    if (existing.length === 0) return Math.min(start, cap || start);
    const maxMonth = Math.max(...existing.map(s => s.month));
    return Math.min(maxMonth + 1, 12, cap || 12);
  };

  const loadBranches = async () => {
    setLoading(true);
    try {
      const cr = await axios.get(`${API_URL}/companies`, { headers });
      const all: any[] = [];
      for (const c of cr.data) {
        const br = await axios.get(`${API_URL}/companies/${c.id}/branches`, { headers });
        br.data.forEach((b: any) => all.push({ ...b, company_name: c.name }));
      }
      setBranches(all);
    } catch { } finally { setLoading(false); }
  };
  const loadEmployees = async (branchId: string) => {
    try { const res = await axios.get(`${API_URL}/employees/branch/${branchId}`, { headers }); setEmployees(res.data); }
    catch { }
  };
  const loadSlips = async (empId: string, yr: number, emp?: any) => {
    try {
      const res = await axios.get(`${API_URL}/payroll/employee/${empId}/${yr}`, { headers });
      setSlips(res.data);
      const e = emp || selectedEmp;
      if (e) setMonth(nextMonthToRun(res.data, e.hire_date));
    } catch { setSlips([]); }
  };
  useState(() => { loadBranches(); });

  const selectBranch = (b: any) => { setSelectedBranch(b); setSelectedEmp(null); setSlips([]); loadEmployees(b.id); };
  const selectEmp = (e: any) => { setSelectedEmp(e); setSlips([]); loadSlips(e.id, year, e); };

  // İşe girişten bugüne kadar çalıştırılabilecek son ay (gelecek aylar hariç).
  const targetMonth = (): number => {
    if (!selectedEmp) return 0;
    const cap = maxRunnableMonth(year);          // bu yıl: bugünün ayı; geçmiş yıl: 12
    return cap; // her zaman bugüne kadar hesapla
  };

  // En son hesaplanmış ay (kayıt varsa).
  const lastDoneMonth = (): number => (slips.length ? Math.max(...slips.map(s => s.month)) : 0);

  // Çalıştırılacak bir şey var mı? (bugüne kadar eksik ay varsa)
  // Çalışanın bu yıl içindeki ilk bordro ayı (işe giriş ayı; sonraki yılsa 99 = bu yıl yok).
  const empStartMonth = (): number => {
    if (!selectedEmp || !selectedEmp.hire_date) return 1;
    const hd = new Date(selectedEmp.hire_date);
    return hd.getFullYear() === year ? hd.getMonth() + 1 : (hd.getFullYear() > year ? 99 : 1);
  };

  // Çalışan bugüne kadar işe başlamış mı?
  const hasStarted = (): boolean => {
    if (!selectedEmp) return false;
    return empStartMonth() <= targetMonth();
  };

  // Çalıştırılacak bir şey var mı? (işe başlamış VE bugüne kadar eksik ay varsa)
  const hasPending = (): boolean => {
    if (!selectedEmp || !hasStarted()) return false;
    return lastDoneMonth() < targetMonth();
  };

  const runMonth = async () => {
    if (!selectedEmp) return;
    const tgt = targetMonth();
    setRunning(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/payroll/run-through`, { employee_id: selectedEmp.id, year, month: tgt }, { headers });
      setSlips(res.data);
      showToast(`Bordrolar ${AYLAR[tgt-1]} ayına kadar güncel.`, "success");
    } catch (err: any) {
      showToast(trError(err.response?.data?.detail), "error");
    } finally { setRunning(false); }
  };

  const fmt = (n: any) => Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cols: [string, string][] = [
    ["Brüt", "gross"],
    ["SSK İşçi", "sgk_employee"],
    ["İşsizlik İşçi", "unemployment_employee"],
    ["Gelir Vergisi", "income_tax_gross"],
    ["Damga Vergisi", "stamp_tax_gross"],
    ["Kümülatif Matrah", "cumulative_base_after"],
    ["Net", "net_salary"],
    ["AÜ Gelir V. İstisnası", "income_tax_exemption"],
    ["AÜ Damga İstisnası", "stamp_tax_exemption"],
    ["SSK İşveren", "sgk_employer"],
    ["İşsizlik İşveren", "unemployment_employer"],
    ["Toplam Maliyet", "employer_cost"],
  ];

  return (
    <div>
      {toast && (
        <div style={{
          position:"fixed", top:24, right:24, zIndex:1000,
          background: toast.kind==="success" ? "#0a0a0a" : "#dc2626",
          color:"white", padding:"14px 20px", borderRadius:12,
          fontSize:14, fontWeight:600, maxWidth:380,
          boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span>{toast.kind==="success" ? "✓" : "⚠"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Bordro</h1>
        <p className="page-subtitle">Brütten nete maaş hesabı — SGK & vergi uyumlu, aylık.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:24}}>
        <div>
          <div className="section-label">Şubeler</div>
          {loading ? <p style={{fontSize:14,color:"#9b9b93"}}>Yükleniyor...</p>
          : branches.length === 0 ? <div className="empty-state" style={{padding:24}}><p className="empty-state-text">Şube yok.</p></div>
          : <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {branches.map(b => (
                <button key={b.id} className={`list-item ${selectedBranch?.id===b.id?"selected":""}`} onClick={() => selectBranch(b)}>
                  <div className="list-item-title">{b.name}</div>
                  <div className="list-item-sub">{b.company_name}</div>
                </button>
              ))}
            </div>}

          {selectedBranch && (
            <>
              <div className="section-label">Çalışanlar</div>
              {employees.length === 0 ? <div className="empty-state" style={{padding:24}}><p className="empty-state-text">Çalışan yok.</p></div>
              : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {employees.map(e => (
                    <button key={e.id} className={`list-item ${selectedEmp?.id===e.id?"selected":""}`} onClick={() => selectEmp(e)}>
                      <div className="list-item-title">{e.first_name} {e.last_name}</div>
                      <div className="list-item-sub">{e.base_salary != null ? `₺${fmt(e.base_salary)} brüt` : "Maaş tanımsız"}</div>
                    </button>
                  ))}
                </div>}
            </>
          )}
        </div>

        <div>
          {!selectedEmp ? (
            <div className="empty-state"><p className="empty-state-text">Bordro için bir çalışan seç.</p></div>
          ) : (
            <>
              <div className="app-card" style={{padding:20,marginBottom:20}}>
                <div style={{display:"flex",alignItems:"flex-end",gap:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:800,color:"#0a0a0a",letterSpacing:"-0.02em",marginBottom:4}}>{selectedEmp.first_name} {selectedEmp.last_name}</div>
                    <div style={{fontSize:13,color:"#9b9b93"}}>
                      {selectedEmp.base_salary != null ? `₺${fmt(selectedEmp.base_salary)} brüt/ay` : "Maaş tanımsız"}
                      {selectedEmp.hire_date && ` · İşe giriş: ${new Date(selectedEmp.hire_date).toLocaleDateString("tr-TR")}`}
                    </div>
                  </div>
                  <div style={{flex:1}} />
                  <div>
                    <label className="app-label">Yıl</label>
                    <select value={year} onChange={(e) => { const y = parseInt(e.target.value); setYear(y); loadSlips(selectedEmp.id, y); }} className="app-input" style={{width:100}}>
                      <option value={2026}>2026</option>
                    </select>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={runMonth}
                    disabled={running || selectedEmp.base_salary == null || !hasPending()}
                    style={{padding:"11px 20px"}}
                  >
                    {running
                      ? "Çalışıyor..."
                      : !hasStarted()
                        ? "Henüz işe başlamadı"
                        : !hasPending()
                          ? `${AYLAR[targetMonth()-1]} ayına kadar güncel`
                          : lastDoneMonth() === 0
                            ? `Bordro Çalıştır (→ ${AYLAR[targetMonth()-1]})`
                            : `${AYLAR[lastDoneMonth()]} – ${AYLAR[targetMonth()-1]} Çalıştır`}
                  </button>
                </div>
                {selectedEmp.base_salary == null && <div className="inline-error" style={{marginTop:14}}>Bu çalışanın brüt maaşı tanımlı değil. Önce Companies'ten maaş gir.</div>}
              </div>

              <div className="section-label">{year} Bordroları</div>
              {slips.length === 0 ? (
                <div className="empty-state"><p className="empty-state-text">Henüz bordro yok. Bir ay seçip "Bordro Çalıştır"a bas. Aylar sırayla çalıştırılmalı (Ocak → Şubat → ...).</p></div>
              ) : (
                <div className="app-card" style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",fontSize:12.5,whiteSpace:"nowrap"}}>
                    <thead>
                      <tr style={{borderBottom:"2px solid #e5e4e0"}}>
                        <th style={{textAlign:"left",padding:"12px 14px",fontWeight:700,color:"#5a5a54",position:"sticky",left:0,background:"white"}}>Ay</th>
                        <th style={{textAlign:"right",padding:"12px 10px",fontWeight:700,color:"#5a5a54"}}>Gün</th>
                        {cols.map(([label]) => (
                          <th key={label} style={{textAlign:"right",padding:"12px 10px",fontWeight:700,color:"#5a5a54"}}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slips.map(s => (
                        <tr key={s.id} style={{borderBottom:"1px solid #f2f1ee"}}>
                          <td style={{padding:"11px 14px",fontWeight:600,color:"#0a0a0a",position:"sticky",left:0,background:"white"}}>{AYLAR[s.month-1]}</td>
                          <td style={{padding:"11px 10px",textAlign:"right",color:"#9b9b93"}}>{s.sgk_days}</td>
                          {cols.map(([label, key]) => (
                            <td key={label} style={{padding:"11px 10px",textAlign:"right",color: key==="net_salary" ? "#00a843" : "#0a0a0a", fontWeight: key==="net_salary"?700:400}}>{fmt(s[key])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



// --- Main App ---
function MainApp({ user, token, onLogout }: { user: User; token: string; onLogout: () => void }) {
  const [page, setPage] = useState("dashboard");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [companyType, setCompanyType] = useState<string | null>(null);

  // Kullanıcının company_type'ını çek (brand/sub/standalone) → panel dallanması için.
  useEffect(() => {
    if (!user.company_id) return;
    axios.get(`${API_URL}/companies/${user.company_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCompanyType(res.data.company_type))
      .catch(() => setCompanyType(null));
  }, [user.company_id, token]);

  const isBrand = companyType === "brand";

  const pageTitle: Record<string,string> = {
    dashboard:"Dashboard", companies:"Companies",
    workforce:"Workforce", inventory:"Inventory", timeclock:"Time Clock", payroll:"Bordro",
    franchises:"Franchise'larım"
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage user={user} />;
      case "companies": return <CompaniesPage token={token} isBrand={isBrand} />;
      case "workforce": return <WorkforcePage token={token} />;
      case "inventory": return <InventoryPage token={token} />;
      case "timeclock": return <TimeClockPage token={token} />;
      case "payroll": return <PayrollPage token={token} />;
      case "franchises": return <FranchisesPage token={token} />;
      default: return <DashboardPage user={user} />;
    }
  };

  return (
    <>
      <style>{appStyles}</style>
      <div className="app-wrap">
      {showChangePassword && <ChangePasswordModal token={token} onClose={() => setShowChangePassword(false)} />}
      <Sidebar active={page} onNavigate={setPage} user={user} onLogout={onLogout} onChangePassword={() => setShowChangePassword(true)} items={isBrand ? [...navItems, { id: "franchises", label: "Franchise'larım", icon: "🔗" }] : navItems} />
        <div className="app-main">
          <div className="app-topbar">
            <span className="app-topbar-title">{pageTitle[page]}</span>
            <div className="app-topbar-right">
              <span style={{fontSize:13,color:"#9b9b93",fontWeight:500}}>{user.first_name} {user.last_name}</span>
              <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#00c853,#00897b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",fontWeight:700}}>{user.first_name[0]}</div>
            </div>
          </div>
          <div className="app-content">{renderPage()}</div>
        </div>
      </div>
    </>
  );
}



// --- Root ---
export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  const handleLogin = async (tok: string, usr: User) => {
    setToken(tok);
    setUser(usr);
    // If the logged-in user is an employee, resolve their employee profile
    if (usr.role === "employee") {
      setResolving(true);
      setResolveError("");
      try {
        const res = await axios.get(`${API_URL}/employees/by-user/${usr.id}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        setEmployee(res.data);
      } catch (err: any) {
        setResolveError(
          err.response?.data?.detail || "Çalışan profilin bulunamadı. Yöneticinle iletişime geç."
        );
      } finally {
        setResolving(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
    setEmployee(null);
  };

  if (!token || !user) return <LoginPage onLogin={handleLogin} />;

  // Employee role → Employee Portal
  if (user.role === "employee") {
    if (resolving) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter, sans-serif", color: "#9b9b93" }}>
          Profil yükleniyor...
        </div>
      );
    }
    if (resolveError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter, sans-serif", gap: 16 }}>
          <div style={{ color: "#dc2626", fontSize: 14 }}>⚠ {resolveError}</div>
          <button onClick={handleLogout} style={{ background: "#0a0a0a", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>Çıkış Yap</button>
        </div>
      );
    }
    if (employee) {
      return <EmployeePortal user={user as any} employee={employee} token={token} onLogout={handleLogout} />;
    }
    return null;
  }

  // Admin roles → Admin Panel
  return <MainApp user={user} token={token} onLogout={handleLogout} />;
}