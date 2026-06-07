import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

/**
 * EmployeePortal.tsx
 *
 * The employee-facing self-service panel. Rendered when a user with role
 * "employee" logs in (App.tsx decides this and resolves their employee profile
 * via GET /employees/by-user/{user_id}).
 *
 * Sections (Phase 1):
 *   - Schedule     : upcoming shifts (placeholder until per-employee assignments)
 *   - Attendance   : the employee's own check-in/out history + monthly hours
 *   - Payslip      : monthly net pay summary (placeholder until HR & Payroll)
 *   - Leaves       : request leave + see status of past requests
 *   - Announcements: company/branch news feed
 *   - Documents    : documents HR has shared with this employee
 *   - Profile       : the employee's own profile info
 *
 * Everything keys off `employee.id` (NOT user.id), consistent with the backend.
 */

type EmployeeProfile = {
  id: string;
  user_id: string | null;
  company_id: string;
  branch_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  tc_no: string | null;
  sgk_no: string | null;
  hire_date: string | null;
  contract_type: string;
  position: string | null;
  department: string | null;
  base_salary: number | null;
  bank_iban: string | null;
  is_active: boolean;
};

type AuthUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

const portalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600&display=swap');

  .ep-wrap { display: flex; min-height: 100vh; background: #f8f7f4; font-family: 'Inter', sans-serif; color: #0a0a0a; }

  .ep-sidebar { width: 248px; min-height: 100vh; background: #0a0a0a; display: flex; flex-direction: column; flex-shrink: 0; position: fixed; top: 0; left: 0; bottom: 0; }
  .ep-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 800; color: white; letter-spacing: -0.03em; }
  .ep-logo span { color: #00c853; }
  .ep-logo-sub { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px; }
  .ep-nav { flex: 1; padding: 12px 8px; }
  .ep-nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px; width: 100%; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; background: none; text-align: left; transition: background 0.15s, color 0.15s; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
  .ep-nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
  .ep-nav-item.active { background: rgba(255,255,255,0.1); color: white; }
  .ep-nav-icon { font-size: 15px; opacity: 0.7; width: 18px; text-align: center; }
  .ep-nav-item.active .ep-nav-icon { opacity: 1; }
  .ep-sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.06); position: relative; }
  .ep-user-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; width: 100%; border: none; background: none; cursor: pointer; transition: background 0.15s; }
  .ep-user-btn:hover { background: rgba(255,255,255,0.06); }
  .ep-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00c853, #00897b); display: flex; align-items: center; justify-content: center; font-size: 13px; color: white; font-weight: 700; flex-shrink: 0; }
  .ep-user-name { font-size: 13px; font-weight: 600; color: white; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ep-user-role { font-size: 11px; color: rgba(255,255,255,0.3); text-align: left; }
  .ep-user-menu { position: absolute; bottom: 70px; left: 8px; right: 8px; background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 6px; z-index: 50; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
  .ep-menu-item { width: 100%; text-align: left; padding: 9px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; border: none; background: none; color: rgba(255,255,255,0.7); font-family: 'Inter', sans-serif; transition: background 0.15s, color 0.15s; }
  .ep-menu-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .ep-menu-item.danger { color: #f87171; }
  .ep-menu-item.danger:hover { background: rgba(248,113,113,0.1); }

  .ep-main { flex: 1; margin-left: 248px; min-height: 100vh; display: flex; flex-direction: column; }
  .ep-topbar { height: 60px; background: white; border-bottom: 1px solid #e5e4e0; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 40; }
  .ep-topbar-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 17px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.025em; }
  .ep-content { flex: 1; padding: 32px; max-width: 1100px; }

  .ep-page-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.03em; margin-bottom: 6px; }
  .ep-page-sub { font-size: 14px; color: #9b9b93; font-weight: 400; margin-bottom: 28px; }

  .ep-card { background: white; border: 1px solid #e5e4e0; border-radius: 16px; padding: 24px; }
  .ep-section-label { font-size: 11px; font-weight: 700; color: #9b9b93; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }

  .ep-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .ep-stat { background: white; border: 1px solid #e5e4e0; border-radius: 14px; padding: 20px; }
  .ep-stat-label { font-size: 11px; font-weight: 700; color: #9b9b93; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .ep-stat-value { font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.02em; }
  .ep-stat-value small { font-size: 13px; font-weight: 400; color: #9b9b93; }

  .ep-btn { background: #0a0a0a; color: white; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; padding: 11px 20px; cursor: pointer; font-family: 'Inter', sans-serif; transition: opacity 0.2s, transform 0.2s; display: inline-flex; align-items: center; gap: 6px; }
  .ep-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .ep-btn:disabled { opacity: 0.4; transform: none; }
  .ep-btn-ghost { background: white; color: #5a5a54; border: 1px solid #e5e4e0; border-radius: 8px; font-size: 12px; font-weight: 600; padding: 6px 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.2s; }
  .ep-btn-ghost:hover { background: #f8f7f4; }

  .ep-input { width: 100%; background: #f8f7f4; border: 1.5px solid #e5e4e0; color: #0a0a0a; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .ep-input:focus { border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); background: white; }
  .ep-label { font-size: 11px; font-weight: 700; color: #5a5a54; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; display: block; }

  .ep-row { background: white; border: 1px solid #e5e4e0; border-radius: 12px; padding: 16px 18px; margin-bottom: 8px; }
  .ep-row-title { font-size: 14px; font-weight: 600; color: #0a0a0a; margin-bottom: 3px; }
  .ep-row-sub { font-size: 12px; color: #9b9b93; }

  .ep-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; display: inline-block; }
  .ep-badge-green { background: rgba(0,200,83,0.1); color: #00a843; }
  .ep-badge-yellow { background: rgba(255,167,0,0.1); color: #b36a00; }
  .ep-badge-red { background: rgba(220,38,38,0.08); color: #dc2626; }
  .ep-badge-grey { background: #f2f1ee; color: #9b9b93; border: 1px solid #e5e4e0; }
  .ep-badge-blue { background: rgba(59,130,246,0.08); color: #1d4ed8; }

  .ep-empty { background: white; border: 1px solid #e5e4e0; border-radius: 16px; padding: 48px; text-align: center; }
  .ep-empty-text { font-size: 14px; color: #9b9b93; }

  .ep-placeholder { background: white; border: 1px dashed #d4d3cf; border-radius: 16px; padding: 48px; text-align: center; }
  .ep-placeholder-icon { font-size: 36px; margin-bottom: 14px; }
  .ep-placeholder-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 800; color: #0a0a0a; margin-bottom: 6px; }
  .ep-placeholder-text { font-size: 13px; color: #9b9b93; max-width: 360px; margin: 0 auto; line-height: 1.5; }

  .ep-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .ep-modal { background: white; border-radius: 20px; padding: 32px; width: 100%; max-width: 460px; box-shadow: 0 24px 80px rgba(0,0,0,0.16); }
  .ep-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .ep-modal-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.025em; }
  .ep-modal-close { width: 32px; height: 32px; border-radius: 8px; background: #f2f1ee; border: none; cursor: pointer; font-size: 14px; color: #5a5a54; display: flex; align-items: center; justify-content: center; }
  .ep-modal-close:hover { background: #e5e4e0; }

  .ep-inline-error { background: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #dc2626; }

  .ep-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .ep-profile-field { background: #f8f7f4; border-radius: 10px; padding: 14px 16px; }
  .ep-profile-field-label { font-size: 11px; font-weight: 700; color: #9b9b93; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .ep-profile-field-value { font-size: 14px; font-weight: 500; color: #0a0a0a; }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtDuration = (minutes: number | null) => {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}s ${m}d` : `${m}d`;
};
const contractLabel = (ct: string) =>
  ({ full_time: "Tam Zamanlı", part_time: "Yarı Zamanlı", temporary: "Geçici", intern: "Stajyer" } as any)[ct] || ct;
const leaveTypeLabel = (lt: string) =>
  ({ annual: "Yıllık İzin", sick: "Hastalık", unpaid: "Ücretsiz", maternity: "Doğum", excuse: "Mazeret", other: "Diğer" } as any)[lt] || lt;
const leaveStatusBadge = (status: string) => {
  const map: Record<string, [string, string]> = {
    pending: ["ep-badge-yellow", "Bekliyor"],
    approved: ["ep-badge-green", "Onaylandı"],
    rejected: ["ep-badge-red", "Reddedildi"],
    cancelled: ["ep-badge-grey", "İptal"],
  };
  const [cls, label] = map[status] || ["ep-badge-grey", status];
  return <span className={`ep-badge ${cls}`}>{label}</span>;
};

// ── Schedule (placeholder) ─────────────────────────────────────────────────────

function ScheduleTab() {
  return (
    <div>
      <h1 className="ep-page-title">Vardiya Takvimim</h1>
      <p className="ep-page-sub">Yaklaşan vardiyalarını buradan takip edebilirsin.</p>
      <div className="ep-placeholder">
        <div className="ep-placeholder-icon">📅</div>
        <div className="ep-placeholder-title">Yakında</div>
        <p className="ep-placeholder-text">
          Vardiya atama sistemi tamamlandığında, sana atanan vardiyalar burada
          gün gün görünecek.
        </p>
      </div>
    </div>
  );
}

// ── Attendance ─────────────────────────────────────────────────────────────────

function AttendanceTab({ employee, token }: { employee: EmployeeProfile; token: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      if (!employee.branch_id) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_URL}/timeclock/branch/${employee.branch_id}`, { headers });
        // Only this employee's own records
        setRecords(res.data.filter((r: any) => r.employee_id === employee.id));
      } catch { } finally { setLoading(false); }
    })();
  }, [employee.id]);

  // This-month total minutes
  const now = new Date();
  const thisMonth = records.filter((r) => {
    const d = new Date(r.checked_in_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalMinutes = thisMonth.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const daysWorked = thisMonth.filter((r) => r.total_minutes).length;

  return (
    <div>
      <h1 className="ep-page-title">Devam Geçmişim</h1>
      <p className="ep-page-sub">Giriş-çıkış kayıtların ve bu ayki toplam çalışma süren.</p>

      <div className="ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-label">Bu Ay Toplam</div>
          <div className="ep-stat-value">{totalHours} <small>saat</small></div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-label">Çalışılan Gün</div>
          <div className="ep-stat-value">{daysWorked} <small>gün</small></div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-label">Toplam Kayıt</div>
          <div className="ep-stat-value">{records.length}</div>
        </div>
      </div>

      <div className="ep-section-label">Kayıtlar</div>
      {loading ? (
        <p style={{ fontSize: 14, color: "#9b9b93" }}>Yükleniyor...</p>
      ) : records.length === 0 ? (
        <div className="ep-empty"><p className="ep-empty-text">Henüz devam kaydın yok.</p></div>
      ) : (
        <div>
          {records.map((r) => (
            <div key={r.id} className="ep-row">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="ep-row-title">
                    {fmtDateTime(r.checked_in_at)}
                    {r.checked_out_at && ` → ${fmtDateTime(r.checked_out_at)}`}
                  </div>
                  <div className="ep-row-sub">
                    Süre: {fmtDuration(r.total_minutes)}
                    {r.is_late && " · Geç giriş"}
                  </div>
                </div>
                {r.status === "open" ? (
                  <span className="ep-badge ep-badge-green">● Açık</span>
                ) : r.status === "missing_checkout" ? (
                  <span className="ep-badge ep-badge-red">Çıkış yok</span>
                ) : (
                  <span className="ep-badge ep-badge-grey">Tamamlandı</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Payslip (placeholder) ───────────────────────────────────────────────────────

function PayslipTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div>
      <h1 className="ep-page-title">Bordro Özetim</h1>
      <p className="ep-page-sub">Aylık net maaşın, kesintilerin ve bordro detayların.</p>
      <div className="ep-placeholder">
        <div className="ep-placeholder-icon">💰</div>
        <div className="ep-placeholder-title">Yakında</div>
        <p className="ep-placeholder-text">
          HR &amp; Payroll modülü tamamlandığında, aylık bordro özetin — brüt, net,
          SGK ve vergi kesintilerinle birlikte — burada görünecek.
        </p>
      </div>
    </div>
  );
}

// ── Leaves ───────────────────────────────────────────────────────────────────────

function LeavesTab({ employee, token }: { employee: EmployeeProfile; token: string }) {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leave_type: "annual", start_date: "", end_date: "", reason: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/leaves/employee/${employee.id}`, { headers });
      setLeaves(res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [employee.id]);

  const submit = async () => {
    setError("");
    if (!form.start_date || !form.end_date) { setError("Başlangıç ve bitiş tarihi gerekli."); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/leaves`, {
        employee_id: employee.id,
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || null,
      }, { headers });
      setShowForm(false);
      setForm({ leave_type: "annual", start_date: "", end_date: "", reason: "" });
      load();
    } catch (err: any) {
      setError(err.response?.data?.detail || "İzin talebi oluşturulamadı.");
    } finally { setSubmitting(false); }
  };

  const cancel = async (leaveId: string) => {
    try {
      await axios.put(`${API_URL}/leaves/${leaveId}/cancel`, { employee_id: employee.id }, { headers });
      load();
    } catch { }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="ep-page-title">İzinlerim</h1>
          <p className="ep-page-sub">İzin talebi oluştur ve geçmiş taleplerinin durumunu gör.</p>
        </div>
        <button className="ep-btn" onClick={() => setShowForm(true)}>+ İzin Talebi</button>
      </div>

      {showForm && (
        <div className="ep-modal-overlay">
          <div className="ep-modal">
            <div className="ep-modal-header">
              <span className="ep-modal-title">Yeni İzin Talebi</span>
              <button className="ep-modal-close" onClick={() => { setShowForm(false); setError(""); }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="ep-label">İzin Türü</label>
                <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} className="ep-input">
                  <option value="annual">Yıllık İzin</option>
                  <option value="sick">Hastalık</option>
                  <option value="unpaid">Ücretsiz İzin</option>
                  <option value="maternity">Doğum İzni</option>
                  <option value="excuse">Mazeret İzni</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label className="ep-label">Başlangıç</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="ep-input" /></div>
                <div><label className="ep-label">Bitiş</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="ep-input" /></div>
              </div>
              <div><label className="ep-label">Açıklama (opsiyonel)</label><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="ep-input" placeholder="Kısa bir açıklama..." /></div>
              {error && <div className="ep-inline-error">⚠ {error}</div>}
              <button className="ep-btn" onClick={submit} disabled={submitting} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
                {submitting ? "Gönderiliyor..." : "Talep Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: "#9b9b93" }}>Yükleniyor...</p>
      ) : leaves.length === 0 ? (
        <div className="ep-empty"><p className="ep-empty-text">Henüz izin talebin yok.</p></div>
      ) : (
        <div>
          {leaves.map((l) => (
            <div key={l.id} className="ep-row">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div className="ep-row-title">{leaveTypeLabel(l.leave_type)} · {l.days_count} gün</div>
                  <div className="ep-row-sub">{fmtDate(l.start_date)} → {fmtDate(l.end_date)}</div>
                  {l.reason && <div className="ep-row-sub" style={{ marginTop: 4 }}>{l.reason}</div>}
                  {l.review_note && <div className="ep-row-sub" style={{ marginTop: 4, color: "#dc2626" }}>Not: {l.review_note}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  {leaveStatusBadge(l.status)}
                  {l.status === "pending" && <button className="ep-btn-ghost" onClick={() => cancel(l.id)}>İptal Et</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Announcements ─────────────────────────────────────────────────────────────────

function AnnouncementsTab({ employee, token }: { employee: EmployeeProfile; token: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/announcements/feed/${employee.id}`, { headers });
        setItems(res.data);
      } catch { } finally { setLoading(false); }
    })();
  }, [employee.id]);

  return (
    <div>
      <h1 className="ep-page-title">Duyurular</h1>
      <p className="ep-page-sub">Şirketinden ve şubenden gelen güncel duyurular.</p>
      {loading ? (
        <p style={{ fontSize: 14, color: "#9b9b93" }}>Yükleniyor...</p>
      ) : items.length === 0 ? (
        <div className="ep-empty"><p className="ep-empty-text">Henüz duyuru yok.</p></div>
      ) : (
        <div>
          {items.map((a) => (
            <div key={a.id} className="ep-card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16, fontWeight: 700, color: "#0a0a0a" }}>{a.title}</div>
                <span className="ep-badge ep-badge-grey">{fmtDate(a.published_at)}</span>
              </div>
              <div style={{ fontSize: 14, color: "#5a5a54", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{a.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Documents ─────────────────────────────────────────────────────────────────────

function DocumentsTab({ employee, token }: { employee: EmployeeProfile; token: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/documents/employee/${employee.id}/visible`, { headers });
        setDocs(res.data);
      } catch { } finally { setLoading(false); }
    })();
  }, [employee.id]);

  const docTypeLabel = (dt: string) =>
    ({ contract: "Sözleşme", payslip: "Bordro", certificate: "Sertifika", id_document: "Kimlik/SGK", other: "Diğer" } as any)[dt] || dt;

  return (
    <div>
      <h1 className="ep-page-title">Dokümanlarım</h1>
      <p className="ep-page-sub">Sözleşmen, bordroların ve diğer belgelerin.</p>
      {loading ? (
        <p style={{ fontSize: 14, color: "#9b9b93" }}>Yükleniyor...</p>
      ) : docs.length === 0 ? (
        <div className="ep-empty"><p className="ep-empty-text">Henüz paylaşılan bir dokümanın yok.</p></div>
      ) : (
        <div>
          {docs.map((d) => (
            <div key={d.id} className="ep-row">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="ep-row-title">{d.title}</div>
                  <div className="ep-row-sub">{docTypeLabel(d.doc_type)}{d.file_size ? ` · ${d.file_size}` : ""}</div>
                </div>
                <a className="ep-btn-ghost" href={d.file_url} target="_blank" rel="noreferrer">İndir</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────────────

function ProfileTab({ employee }: { employee: EmployeeProfile }) {
  const fields: [string, string | null][] = [
    ["Ad Soyad", `${employee.first_name} ${employee.last_name}`],
    ["E-posta", employee.email],
    ["Telefon", employee.phone],
    ["Pozisyon", employee.position],
    ["Departman", employee.department],
    ["Sözleşme Türü", contractLabel(employee.contract_type)],
    ["İşe Giriş", employee.hire_date ? fmtDate(employee.hire_date) : null],
    ["IBAN", employee.bank_iban],
  ];
  return (
    <div>
      <h1 className="ep-page-title">Profilim</h1>
      <p className="ep-page-sub">Kişisel ve iş bilgilerin.</p>
      <div className="ep-card">
        <div className="ep-profile-grid">
          {fields.map(([label, value]) => (
            <div key={label} className="ep-profile-field">
              <div className="ep-profile-field-label">{label}</div>
              <div className="ep-profile-field-value">{value || "—"}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#9b9b93", marginTop: 16 }}>
          Bilgilerinde bir hata varsa yöneticinle iletişime geç.
        </p>
      </div>
    </div>
  );
}

// ── Main Portal Shell ─────────────────────────────────────────────────────────────

const navItems = [
  { id: "schedule", label: "Vardiya Takvimi", icon: "📅" },
  { id: "attendance", label: "Devam Geçmişi", icon: "⏱️" },
  { id: "payslip", label: "Bordro", icon: "💰" },
  { id: "leaves", label: "İzinler", icon: "🌴" },
  { id: "announcements", label: "Duyurular", icon: "📢" },
  { id: "documents", label: "Dokümanlar", icon: "📁" },
  { id: "profile", label: "Profil", icon: "👤" },
];

export default function EmployeePortal({
  user, employee, token, onLogout,
}: {
  user: AuthUser; employee: EmployeeProfile; token: string; onLogout: () => void;
}) {
  const [tab, setTab] = useState("attendance");
  const [showMenu, setShowMenu] = useState(false);

  const titleMap: Record<string, string> = {
    schedule: "Vardiya Takvimi", attendance: "Devam Geçmişi", payslip: "Bordro",
    leaves: "İzinler", announcements: "Duyurular", documents: "Dokümanlar", profile: "Profil",
  };

  const renderTab = () => {
    switch (tab) {
      case "schedule": return <ScheduleTab />;
      case "attendance": return <AttendanceTab employee={employee} token={token} />;
      case "payslip": return <PayslipTab employee={employee} />;
      case "leaves": return <LeavesTab employee={employee} token={token} />;
      case "announcements": return <AnnouncementsTab employee={employee} token={token} />;
      case "documents": return <DocumentsTab employee={employee} token={token} />;
      case "profile": return <ProfileTab employee={employee} />;
      default: return <AttendanceTab employee={employee} token={token} />;
    }
  };

  return (
    <>
      <style>{portalStyles}</style>
      <div className="ep-wrap">
        <div className="ep-sidebar">
          <div className="ep-logo">
            WHITE<span>.</span>AI
            <div className="ep-logo-sub">Çalışan Paneli</div>
          </div>
          <nav className="ep-nav">
            {navItems.map((item) => (
              <button key={item.id} className={`ep-nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
                <span className="ep-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="ep-sidebar-footer">
            <button className="ep-user-btn" onClick={() => setShowMenu(!showMenu)}>
              <div className="ep-avatar">{employee.first_name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ep-user-name">{employee.first_name} {employee.last_name}</div>
                <div className="ep-user-role">{employee.position || "Çalışan"}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>⌄</span>
            </button>
            {showMenu && (
              <div className="ep-user-menu">
                <button className="ep-menu-item danger" onClick={onLogout}>Çıkış Yap</button>
              </div>
            )}
          </div>
        </div>
        <div className="ep-main">
          <div className="ep-topbar">
            <span className="ep-topbar-title">{titleMap[tab]}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#9b9b93", fontWeight: 500 }}>{employee.first_name} {employee.last_name}</span>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#00c853,#00897b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 700 }}>{employee.first_name[0]}</div>
            </div>
          </div>
          <div className="ep-content">{renderTab()}</div>
        </div>
      </div>
    </>
  );
}
