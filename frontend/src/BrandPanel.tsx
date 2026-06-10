import { useState, useEffect } from "react";
import axios from "axios";

// ============================================================================
// WHITE.AI — Marka Sahibi Paneli (Panel 2)
// Beyaz agirlikli + yesil accent + siyah metin.
// Genel Bakis + Sirketim + Franchise'larim gercek API'ye bagli. Diger 6 placeholder.
// ============================================================================

const API_URL = "http://127.0.0.1:8000/api/v1";

type BrandUser = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id?: string;
};

const C = {
  green: "#1FA85A",
  greenDark: "#15803D",
  greenSoft: "#EEF8F2",
  greenBorder: "#BBF7D0",
  ink: "#111110",
  bg: "#FFFFFF",
  surface: "#FBFBFA",
  border: "#EFEFEC",
  borderSoft: "#F4F3F0",
  textMuted: "#6B6862",
  textFaint: "#8A867F",
  textHint: "#A6A29B",
  warnBg: "#FEF6E7",
  warnInk: "#C68A12",
  neutralBg: "#F2F1ED",
  dangerBg: "#FEF2F2",
  dangerInk: "#DC2626",
  dangerBorder: "#FECACA",
  franchise: "#7C5CE6",
  franchiseSoft: "#F1EEFB",
};

const NAV_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: "overview", label: "Genel Bakış", icon: "ti-layout-dashboard" },
  { id: "company", label: "Şirketim", icon: "ti-building-store" },
  { id: "franchises", label: "Franchise'larım", icon: "ti-link" },
  { id: "staff", label: "Personel", icon: "ti-users" },
  { id: "inventory", label: "Envanter", icon: "ti-box" },
  { id: "payroll", label: "Bordro / Finans", icon: "ti-cash" },
  { id: "reports", label: "Raporlar", icon: "ti-chart-bar" },
  { id: "announcements", label: "Duyurular", icon: "ti-bell" },
  { id: "settings", label: "Ayarlar", icon: "ti-settings" },
];

const PAGE_TITLE: Record<string, string> = {
  overview: "Genel Bakış",
  company: "Şirketim",
  franchises: "Franchise'larım",
  staff: "Personel",
  inventory: "Envanter",
  payroll: "Bordro / Finans",
  reports: "Raporlar",
  announcements: "Duyurular",
  settings: "Ayarlar",
};

export default function BrandPanel({
  user,
  token,
  onLogout,
  companyName,
}: {
  user: BrandUser;
  token: string;
  onLogout: () => void;
  companyName?: string | null;
}) {
  const [page, setPage] = useState("overview");
  const brandName = companyName || "Markam";
  const initials = (user.first_name?.[0] || "") + (user.last_name?.[0] || "");

  return (
    <div style={{ display: "flex", height: "69vh", minHeight: "69vh", overflow: "hidden", background: C.bg, fontFamily: "Inter, system-ui, sans-serif", color: C.ink, zoom: 1.44 }}>
      {/* ---------- Sol menu ---------- */}
      <aside style={{ width: 248, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 10px 22px" }}>
          <div style={{ width: 34, height: 34, background: C.ink, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-sparkles" style={{ fontSize: 19, color: C.green }} aria-hidden="true" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>WHITE<span style={{ color: C.green }}>.AI</span></span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 14.5 }}>
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  position: "relative", display: "flex", alignItems: "center", gap: 11,
                  padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer",
                  textAlign: "left", width: "100%", font: "inherit",
                  background: active ? C.bg : "transparent",
                  color: active ? C.ink : C.textMuted,
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
                }}
              >
                {active && <span style={{ position: "absolute", left: 0, top: 9, bottom: 9, width: 3, borderRadius: 2, background: C.green }} />}
                <i className={`ti ${item.icon}`} style={{ fontSize: 17, color: active ? C.green : "inherit" }} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 9, padding: "12px 8px 2px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
          <div style={{ lineHeight: 1.25, minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.first_name} {user.last_name}</div>
            <div style={{ fontSize: 11, color: C.textHint }}>Marka Sahibi</div>
          </div>
          <button onClick={onLogout} title="Çıkış" aria-label="Çıkış" style={{ background: "none", border: "none", cursor: "pointer", color: C.textHint, padding: 4, display: "flex" }}>
            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* ---------- Sag icerik ---------- */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: C.bg }}>
        <div style={{ padding: "16px 26px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>{brandName}</span>
            <span style={{ fontSize: 11, color: C.textHint, marginTop: 1 }}>{PAGE_TITLE[page]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.green, background: C.greenSoft, padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />Canlı
          </div>
        </div>

        <div style={{ padding: "24px 26px", overflow: "auto" }}>
          {page === "overview" && <OverviewPage firstName={user.first_name} token={token} />}
          {page === "company" && <CompanyPage token={token} companyId={user.company_id || ""} brandName={brandName} />}
          {page === "franchises" && <FranchisePage token={token} />}
          {page === "staff" && <StaffPage token={token} companyId={user.company_id || ""} />}
          {page !== "overview" && page !== "company" && page !== "franchises" && page !== "staff" && <Placeholder title={PAGE_TITLE[page]} />}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// Genel Bakis — gercek API (/oversight/overview)
// ============================================================================
type Overview = {
  branches: number; franchises: number; staff: number; on_duty: number;
  alerts: { icon: string; tone: string; who: string; text: string }[];
  busy_branches: { name: string; count: number; pct: number }[];
};

function OverviewPage({ firstName, token }: { firstName: string; token: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/oversight/overview`, { headers: { Authorization: `Bearer ${token}` } });
        if (alive) { setData(res.data); setLoading(false); }
      } catch (e: any) {
        if (alive) { setError(e.response?.data?.detail || "Veriler yüklenemedi."); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const toneStyle = (tone: string) => {
    if (tone === "warn") return { bg: C.warnBg, fg: C.warnInk };
    if (tone === "green") return { bg: C.greenSoft, fg: C.green };
    return { bg: C.neutralBg, fg: C.textFaint };
  };

  const stats = { branches: data?.branches ?? 0, franchises: data?.franchises ?? 0, staff: data?.staff ?? 0, onDuty: data?.on_duty ?? 0 };
  const alerts = data?.alerts ?? [];
  const busy = data?.busy_branches ?? [];

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 3 }}>Günaydın, {firstName}.</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 22 }}>Markanın bugünkü nabzı.</div>

      {error && <div style={{ fontSize: 13, color: C.warnInk, background: C.warnBg, padding: "10px 14px", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 22 }}>
        <MetricCard icon="ti-building-store" label="Şube" value={loading ? "—" : stats.branches} />
        <MetricCard icon="ti-link" label="Franchise" value={loading ? "—" : stats.franchises} />
        <MetricCard icon="ti-users" label="Personel" value={loading ? "—" : stats.staff} />
        <div style={{ background: C.ink, border: `1px solid ${C.ink}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "#9DE8BE", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-activity" style={{ fontSize: 14 }} aria-hidden="true" />Bugün mesaide
          </div>
          <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: "-0.02em", color: "#fff" }}>
            {loading ? "—" : stats.onDuty}<span style={{ fontSize: 13, color: "#9DE8BE", fontWeight: 400, marginLeft: 4 }}>/{loading ? "—" : stats.staff}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 14 }}>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Dikkat gerektirenler</span>
            {alerts.length > 0 && <span style={{ fontSize: 11, color: "#fff", background: C.green, padding: "1px 8px", borderRadius: 20, fontWeight: 600 }}>{alerts.length}</span>}
          </div>
          {alerts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0", color: C.textHint }}>
              <i className="ti ti-circle-check" style={{ fontSize: 22, color: C.green }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Şu an dikkat gerektiren bir şey yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12.5 }}>
              {alerts.map((a, i) => {
                const t = toneStyle(a.tone);
                const last = i === alerts.length - 1;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: last ? "none" : `1px solid ${C.borderSoft}` }}>
                    <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`ti ${a.icon}`} style={{ fontSize: 15, color: t.fg }} aria-hidden="true" />
                    </span>
                    <span style={{ color: "#3C3A36" }}><b style={{ fontWeight: 600 }}>{a.who}</b> — {a.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>En yoğun şubeler</div>
          {busy.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0", color: C.textHint }}>
              <i className="ti ti-chart-bar-off" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Henüz veri yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 13, fontSize: 12.5 }}>
              {busy.map((b, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <span style={{ color: C.textFaint }}>{b.count}</span>
                  </div>
                  <div style={{ height: 5, background: C.neutralBg, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${b.pct}%`, height: "100%", background: C.green }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MetricCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} aria-hidden="true" />{label}
      </div>
      <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

// ============================================================================
// Sirketim — sube + yonetici yonetimi (gercek API)
// ============================================================================
type Branch = { id: string; name: string; address?: string; phone?: string };
type Manager = { id: string; first_name: string; last_name: string; email: string; phone?: string; is_active: boolean; role: string };

function CompanyPage({ token, companyId, brandName }: { token: string; companyId: string; brandName: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [legalName, setLegalName] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mgrCounts, setMgrCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Branch | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  // modallar
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "" });
  const [branchErr, setBranchErr] = useState("");
  // sube duzenleme
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [branchEditForm, setBranchEditForm] = useState({ name: "", address: "", phone: "" });
  const [branchEditErr, setBranchEditErr] = useState("");
  const [suspendMode, setSuspendMode] = useState(false);
  const [suspendPw, setSuspendPw] = useState("");
  // yonetici
  const [showMgrForm, setShowMgrForm] = useState(false);
  const [mgrForm, setMgrForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [mgrFormErr, setMgrFormErr] = useState("");
  const [detail, setDetail] = useState<Manager | null>(null);
  const [mgrEdit, setMgrEdit] = useState({ first_name: "", last_name: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<"" | "reset" | "remove">("");
  const [adminPw, setAdminPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");

  const loadCompany = async () => {
    try { const r = await axios.get(`${API_URL}/companies/${companyId}`, { headers }); setLegalName(r.data.legal_name || ""); } catch {}
  };
  const loadBranches = async () => {
    try {
      const r = await axios.get(`${API_URL}/companies/${companyId}/branches`, { headers });
      setBranches(r.data);
      const counts: Record<string, number> = {};
      await Promise.all(r.data.map(async (b: Branch) => {
        try { const u = await axios.get(`${API_URL}/users/branch/${b.id}`, { headers }); counts[b.id] = u.data.filter((x: Manager) => x.role === "manager").length; }
        catch { counts[b.id] = 0; }
      }));
      setMgrCounts(counts);
      setLoading(false);
    } catch { setLoading(false); }
  };
  const loadManagers = async (branchId: string) => {
    try { const r = await axios.get(`${API_URL}/users/branch/${branchId}`, { headers }); setManagers(r.data.filter((u: Manager) => u.role === "manager")); }
    catch { setManagers([]); }
  };

  useEffect(() => { loadCompany(); loadBranches(); /* eslint-disable-next-line */ }, [companyId]);

  const selectBranch = (b: Branch) => { setSelected(b); loadManagers(b.id); };

  const createBranch = async () => {
    setBranchErr("");
    if (!branchForm.name) { setBranchErr("Şube adı zorunlu."); return; }
    try {
      await axios.post(`${API_URL}/companies/${companyId}/branches`, { ...branchForm, company_id: companyId }, { headers });
      setShowBranchForm(false); setBranchForm({ name: "", address: "", phone: "" });
      loadBranches();
    } catch (e: any) { setBranchErr(e.response?.data?.detail || "Şube eklenemedi."); }
  };

  const openEditBranch = (b: Branch) => {
    setEditBranch(b);
    setBranchEditForm({ name: b.name || "", address: b.address || "", phone: b.phone || "" });
    setBranchEditErr(""); setSuspendMode(false); setSuspendPw("");
  };
  const saveBranchEdit = async () => {
    setBranchEditErr("");
    if (!branchEditForm.name) { setBranchEditErr("Şube adı zorunlu."); return; }
    try {
      await axios.put(`${API_URL}/branches/${editBranch!.id}`, branchEditForm, { headers });
      setEditBranch(null);
      loadBranches();
      if (selected?.id === editBranch!.id) setSelected({ ...selected!, ...branchEditForm });
    } catch (e: any) { setBranchEditErr(e.response?.data?.detail || "Şube güncellenemedi."); }
  };
  const suspendBranch = async () => {
    setBranchEditErr("");
    if (!suspendPw) { setBranchEditErr("Onaylamak için şifren zorunlu."); return; }
    try {
      await axios.put(`${API_URL}/branches/${editBranch!.id}/suspend`, { admin_password: suspendPw }, { headers });
      setEditBranch(null); setSuspendPw("");
      if (selected?.id === editBranch!.id) setSelected(null);
      loadBranches();
    } catch (e: any) { setBranchEditErr(e.response?.data?.detail || "Şube askıya alınamadı."); }
  };

  const assignManager = async () => {
    setMgrFormErr("");
    if (!mgrForm.first_name || !mgrForm.email || !mgrForm.password) { setMgrFormErr("Ad, e-posta ve şifre zorunlu."); return; }
    if (!selected) return;
    try {
      await axios.post(`${API_URL}/users`, { ...mgrForm, role: "manager", company_id: companyId, branch_id: selected.id }, { headers });
      setShowMgrForm(false); setMgrForm({ first_name: "", last_name: "", email: "", password: "" });
      loadManagers(selected.id); loadBranches();
    } catch (e: any) { setMgrFormErr(e.response?.data?.detail || "Yönetici atanamadı."); }
  };

  const openDetail = (m: Manager) => {
    setDetail(m); setMgrEdit({ first_name: m.first_name || "", last_name: m.last_name || "", phone: m.phone || "" });
    setEditing(false); setAction(""); setAdminPw(""); setNewPw(""); setMsg("");
  };
  const saveMgrEdit = async () => {
    setMsg("");
    try { await axios.put(`${API_URL}/users/${detail!.id}`, mgrEdit, { headers }); setEditing(false); if (selected) loadManagers(selected.id); setDetail({ ...detail!, ...mgrEdit }); }
    catch (e: any) { setMsg(e.response?.data?.detail || "Güncellenemedi."); }
  };
  const resetPw = async () => {
    setMsg("");
    if (!adminPw || !newPw) { setMsg("Şifren ve yeni şifre zorunlu."); return; }
    try { await axios.put(`${API_URL}/users/${detail!.id}/reset-password`, { admin_password: adminPw, new_password: newPw }, { headers }); setAction(""); setAdminPw(""); setNewPw(""); setMsg("Şifre sıfırlandı."); }
    catch (e: any) { setMsg(e.response?.data?.detail || "Şifre sıfırlanamadı."); }
  };
  const removeMgr = async () => {
    setMsg("");
    if (!adminPw) { setMsg("Şifren zorunlu."); return; }
    try { await axios.delete(`${API_URL}/users/${detail!.id}/verified`, { headers, data: { admin_password: adminPw } }); setDetail(null); setAdminPw(""); if (selected) loadManagers(selected.id); loadBranches(); }
    catch (e: any) { setMsg(e.response?.data?.detail || "Kaldırılamadı."); }
  };

  const greenBtn = { fontSize: 12, fontWeight: 600, color: "#fff", background: C.green, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 } as const;
  const softBtn = { fontSize: 12, fontWeight: 500, color: C.greenDark, background: C.greenSoft, border: "none", padding: "5px 11px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 } as const;
  const inputStyle = { width: "100%", padding: "9px 11px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: C.textFaint, display: "block", marginBottom: 5 };

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 3 }}>Şirketim</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Ana şirketiniz, şubeleriniz ve şube yöneticileri.</div>

      {/* Siyah banner */}
      <div style={{ background: C.ink, borderRadius: 14, padding: "18px 20px", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-building-store" style={{ fontSize: 24, color: "#fff" }} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{brandName}</div>
            {legalName && <div style={{ fontSize: 12.5, color: "#9DE8BE", marginTop: 2 }}>{legalName}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.textHint }}>Şube</div><div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>{branches.length}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: C.textHint }}>Yönetici</div><div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>{Object.values(mgrCounts).reduce((a, b) => a + b, 0)}</div></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 18 }}>
        {/* SOL — Subeler */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Şubeler</span>
            <button style={softBtn} onClick={() => { setShowBranchForm(true); setBranchErr(""); }}><i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Yeni Şube</button>
          </div>
          {loading ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : branches.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
              <i className="ti ti-building-off" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Henüz şube yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {branches.map((b) => {
                const isSel = selected?.id === b.id;
                const cnt = mgrCounts[b.id] ?? 0;
                return (
                  <div key={b.id} onClick={() => selectBranch(b)} style={{ background: isSel ? C.bg : C.surface, border: isSel ? `1.5px solid ${C.green}` : `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: isSel ? 600 : 500 }}>{b.name}</div>
                      {b.address && <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-map-pin" style={{ fontSize: 13 }} aria-hidden="true" />{b.address}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {cnt === 0 ? (
                        <span style={{ fontSize: 11, color: C.warnInk, display: "flex", alignItems: "center", gap: 4 }}><i className="ti ti-alert-circle" style={{ fontSize: 13 }} aria-hidden="true" />yönetici yok</span>
                      ) : (
                        <span style={{ fontSize: 11, color: isSel ? C.greenDark : C.textFaint, fontWeight: isSel ? 500 : 400 }}>{cnt} yönetici</span>
                      )}
                      {isSel && (
                        <button onClick={(e) => { e.stopPropagation(); openEditBranch(b); }} aria-label="Şubeyi düzenle" style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <i className="ti ti-pencil" style={{ fontSize: 14, color: C.textMuted }} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAG — Yoneticiler */}
        <div>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.textHint, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Yöneticileri görmek için bir şube seçin.</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name} — Yöneticiler</span>
                <button style={greenBtn} onClick={() => { setShowMgrForm(true); setMgrFormErr(""); }}><i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Yönetici Ata</button>
              </div>
              {managers.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
                  <i className="ti ti-user-off" style={{ fontSize: 22 }} aria-hidden="true" />
                  <span style={{ fontSize: 12.5 }}>Bu şubede henüz yönetici yok.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {managers.map((m) => (
                    <div key={m.id} onClick={() => openDetail(m)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{(m.first_name?.[0] || "") + (m.last_name?.[0] || "")}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{m.first_name} {m.last_name}</div>
                        <div style={{ fontSize: 11.5, color: C.textFaint, display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}><i className="ti ti-mail" style={{ fontSize: 13 }} aria-hidden="true" />{m.email}</div>
                      </div>
                      <span style={{ fontSize: 10, color: m.is_active ? C.greenDark : C.textFaint, background: m.is_active ? C.greenSoft : C.neutralBg, padding: "3px 9px", borderRadius: 12, fontWeight: 600 }}>{m.is_active ? "Aktif" : "Pasif"}</span>
                      <i className="ti ti-dots-vertical" style={{ fontSize: 17, color: C.textHint }} aria-hidden="true" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---- Modal: Yeni Sube ---- */}
      {showBranchForm && (
        <Modal title="Yeni Şube" onClose={() => setShowBranchForm(false)}>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Şube Adı *</label><input style={inputStyle} value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Adres</label><input style={inputStyle} value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Telefon</label><input style={inputStyle} value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} /></div>
          {branchErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {branchErr}</div>}
          <button style={{ ...greenBtn, width: "100%", justifyContent: "center", padding: "11px" }} onClick={createBranch}>Şube Oluştur</button>
        </Modal>
      )}

      {/* ---- Modal: Sube Duzenle ---- */}
      {editBranch && (
        <Modal title="Şubeyi Düzenle" onClose={() => setEditBranch(null)}>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Şube Adı *</label><input style={inputStyle} value={branchEditForm.name} onChange={(e) => setBranchEditForm({ ...branchEditForm, name: e.target.value })} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Adres</label><input style={inputStyle} value={branchEditForm.address} onChange={(e) => setBranchEditForm({ ...branchEditForm, address: e.target.value })} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Telefon</label><input style={inputStyle} value={branchEditForm.phone} onChange={(e) => setBranchEditForm({ ...branchEditForm, phone: e.target.value })} /></div>
          {branchEditErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {branchEditErr}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...greenBtn, flex: 1, justifyContent: "center", padding: "10px" }} onClick={saveBranchEdit}>Kaydet</button>
            <button style={{ ...softBtn, flex: 1, justifyContent: "center", padding: "10px" }} onClick={() => setEditBranch(null)}>İptal</button>
          </div>
          <div style={{ borderTop: `1px solid ${C.borderSoft}`, marginTop: 16, paddingTop: 14 }}>
            {!suspendMode ? (
              <button style={{ width: "100%", fontSize: 12, fontWeight: 600, color: C.dangerInk, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, padding: "10px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => { setSuspendMode(true); setBranchEditErr(""); setSuspendPw(""); }}>
                <i className="ti ti-archive" style={{ fontSize: 14 }} aria-hidden="true" />Şubeyi Askıya Al
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", background: C.dangerBg, borderRadius: 10, border: `1px solid ${C.dangerBorder}` }}>
                <div style={{ fontSize: 12.5, color: C.dangerInk }}>Şube askıya alınınca personel girişi kapanır. Onaylamak için şifren:</div>
                <input style={inputStyle} type="password" value={suspendPw} onChange={(e) => setSuspendPw(e.target.value)} placeholder="Senin (owner) şifren" />
                <button style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.dangerInk, border: "none", padding: "10px", borderRadius: 8, cursor: "pointer" }} onClick={suspendBranch}>Askıya Almayı Onayla</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ---- Modal: Yonetici Ata ---- */}
      {showMgrForm && selected && (
        <Modal title={`Yönetici Ata — ${selected.name}`} onClose={() => setShowMgrForm(false)}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Ad *</label><input style={inputStyle} value={mgrForm.first_name} onChange={(e) => setMgrForm({ ...mgrForm, first_name: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Soyad</label><input style={inputStyle} value={mgrForm.last_name} onChange={(e) => setMgrForm({ ...mgrForm, last_name: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>E-posta (giriş) *</label><input style={inputStyle} type="email" value={mgrForm.email} onChange={(e) => setMgrForm({ ...mgrForm, email: e.target.value })} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Geçici Şifre *</label><input style={inputStyle} value={mgrForm.password} onChange={(e) => setMgrForm({ ...mgrForm, password: e.target.value })} placeholder="Yönetici sonra değiştirir" /></div>
          {mgrFormErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {mgrFormErr}</div>}
          <button style={{ ...greenBtn, width: "100%", justifyContent: "center", padding: "11px" }} onClick={assignManager}>Yönetici Oluştur ve Ata</button>
        </Modal>
      )}

      {/* ---- Modal: Yonetici Detay ---- */}
      {detail && (
        <Modal title="Yönetici Detayı" onClose={() => setDetail(null)}>
          {!editing ? (
            <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>Ad Soyad</span><div style={{ fontSize: 14, fontWeight: 600 }}>{detail.first_name} {detail.last_name}</div></div>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>E-posta (giriş)</span><div style={{ fontSize: 14 }}>{detail.email}</div></div>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>Telefon</span><div style={{ fontSize: 14 }}>{detail.phone || "—"}</div></div>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>Durum</span><div><span style={{ fontSize: 11, color: detail.is_active ? C.greenDark : C.textFaint, background: detail.is_active ? C.greenSoft : C.neutralBg, padding: "2px 9px", borderRadius: 12, fontWeight: 600 }}>{detail.is_active ? "Aktif" : "Pasif"}</span></div></div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ad</label><input style={inputStyle} value={mgrEdit.first_name} onChange={(e) => setMgrEdit({ ...mgrEdit, first_name: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Soyad</label><input style={inputStyle} value={mgrEdit.last_name} onChange={(e) => setMgrEdit({ ...mgrEdit, last_name: e.target.value })} /></div>
              </div>
              <div><label style={labelStyle}>Telefon</label><input style={inputStyle} value={mgrEdit.phone} onChange={(e) => setMgrEdit({ ...mgrEdit, phone: e.target.value })} /></div>
            </div>
          )}

          {action === "reset" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", background: C.warnBg, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Şifre Sıfırla</div>
              <input style={inputStyle} type="password" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} placeholder="Senin (owner) şifren" />
              <input style={inputStyle} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Yöneticinin yeni şifresi" />
              <button style={{ ...greenBtn, justifyContent: "center", padding: "10px" }} onClick={resetPw}>Şifreyi Sıfırla</button>
            </div>
          )}
          {action === "remove" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", background: C.dangerBg, borderRadius: 10, border: `1px solid ${C.dangerBorder}`, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.dangerInk }}>Yöneticiyi Kaldır</div>
              <input style={inputStyle} type="password" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} placeholder="Onaylamak için senin şifren" />
              <button style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.dangerInk, border: "none", padding: "10px", borderRadius: 8, cursor: "pointer" }} onClick={removeMgr}>Kaldırmayı Onayla</button>
            </div>
          )}
          {msg && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {msg}</div>}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!editing ? (
              <>
                <button style={{ ...greenBtn, flex: 1, justifyContent: "center", padding: "9px" }} onClick={() => { setEditing(true); setAction(""); setMsg(""); }}>Düzenle</button>
                <button style={{ ...softBtn, flex: 1, justifyContent: "center", padding: "9px" }} onClick={() => { setAction(action === "reset" ? "" : "reset"); setMsg(""); setAdminPw(""); setNewPw(""); }}>Şifre Sıfırla</button>
                <button style={{ fontSize: 12, fontWeight: 600, color: C.dangerInk, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, padding: "9px", borderRadius: 8, cursor: "pointer", flex: 1 }} onClick={() => { setAction(action === "remove" ? "" : "remove"); setMsg(""); setAdminPw(""); }}>Kaldır</button>
              </>
            ) : (
              <>
                <button style={{ ...greenBtn, flex: 1, justifyContent: "center", padding: "9px" }} onClick={saveMgrEdit}>Kaydet</button>
                <button style={{ ...softBtn, flex: 1, justifyContent: "center", padding: "9px" }} onClick={() => setEditing(false)}>İptal</button>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// Franchise'larim — gozetim (read-only). /oversight/subs + /franchises/{id}/summary
// ============================================================================
type Franchise = { id: string; name: string; email: string; phone?: string; address?: string; is_active: boolean; link_type: string };
type FranchiseSummary = { staff: number; on_duty: number; critical_stock: number };

function FranchisePage({ token }: { token: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Franchise | null>(null);
  const [summary, setSummary] = useState<FranchiseSummary | null>(null);
  const [sumLoading, setSumLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await axios.get(`${API_URL}/oversight/subs`, { headers });
        if (alive) { setFranchises(r.data.filter((s: Franchise) => s.link_type === "franchise")); setLoading(false); }
      } catch { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [token]);

  const selectFranchise = async (f: Franchise) => {
    setSelected(f); setSummary(null); setSumLoading(true);
    try {
      const r = await axios.get(`${API_URL}/oversight/franchises/${f.id}/summary`, { headers });
      setSummary(r.data);
    } catch { setSummary(null); }
    setSumLoading(false);
  };

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 3 }}>Franchise'larım</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 18 }}>Markanı kullanan franchise lokasyonlarını izle. Her biri ayrı bir işletmedir — görürsün, yönetmezsin.</div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 15px", marginBottom: 20, display: "flex", alignItems: "center", gap: 9 }}>
        <i className="ti ti-eye" style={{ fontSize: 17, color: C.greenDark }} aria-hidden="true" />
        <span style={{ fontSize: 12.5, color: C.textMuted }}>Gözetim modu — franchise verilerini görüntülersin, operasyonlarına müdahale edemezsin.</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 18 }}>
        {/* SOL — franchise listesi */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Franchise Lokasyonları</div>
          {loading ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : franchises.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
              <i className="ti ti-link-off" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Henüz franchise yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {franchises.map((f) => {
                const isSel = selected?.id === f.id;
                return (
                  <div key={f.id} onClick={() => selectFranchise(f)} style={{ background: isSel ? C.bg : C.surface, border: isSel ? `1.5px solid ${C.green}` : `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: isSel ? C.greenSoft : C.neutralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className="ti ti-building-store" style={{ fontSize: 18, color: isSel ? C.greenDark : C.textFaint }} aria-hidden="true" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: isSel ? 600 : 500 }}>{f.name}</div>
                        {f.address && <div style={{ fontSize: 11.5, color: C.textFaint, display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}><i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />{f.address}</div>}
                      </div>
                    </div>
                    {isSel && <i className="ti ti-chevron-right" style={{ fontSize: 16, color: C.green, flexShrink: 0 }} aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAG — gozetim ozeti */}
        <div>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.textHint, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Gözetim özeti için bir franchise seçin.</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{selected.name}</span>
                <span style={{ fontSize: 10.5, color: selected.is_active ? C.greenDark : C.textFaint, background: selected.is_active ? C.greenSoft : C.neutralBg, padding: "3px 9px", borderRadius: 12, fontWeight: 600 }}>{selected.is_active ? "Aktif" : "Pasif"}</span>
              </div>
              <div style={{ fontSize: 11.5, color: C.textFaint, marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-mail" style={{ fontSize: 13 }} aria-hidden="true" />{selected.email}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 14px" }}>
                  <div style={{ fontSize: 11, color: C.textFaint, display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}><i className="ti ti-users" style={{ fontSize: 13 }} aria-hidden="true" />Personel</div>
                  <div style={{ fontSize: 21, fontWeight: 600 }}>{sumLoading ? "—" : (summary?.staff ?? 0)}</div>
                </div>
                <div style={{ background: C.ink, borderRadius: 10, padding: "13px 14px" }}>
                  <div style={{ fontSize: 11, color: "#9DE8BE", display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}><i className="ti ti-activity" style={{ fontSize: 13 }} aria-hidden="true" />Bugün mesaide</div>
                  <div style={{ fontSize: 21, fontWeight: 600, color: "#fff" }}>{sumLoading ? "—" : (summary?.on_duty ?? 0)}<span style={{ fontSize: 12, color: "#9DE8BE", fontWeight: 400 }}>/{sumLoading ? "—" : (summary?.staff ?? 0)}</span></div>
                </div>
              </div>

              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 11, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><i className="ti ti-box" style={{ fontSize: 14, color: C.textMuted }} aria-hidden="true" />Envanter Durumu</div>
                {sumLoading ? (
                  <div style={{ fontSize: 12, color: C.textHint }}>Yükleniyor…</div>
                ) : (summary?.critical_stock ?? 0) > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.warnInk }}><i className="ti ti-alert-triangle" style={{ fontSize: 14 }} aria-hidden="true" />{summary!.critical_stock} üründe kritik stok</div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.green }}><i className="ti ti-circle-check" style={{ fontSize: 14 }} aria-hidden="true" />Stok seviyeleri normal</div>
                )}
              </div>

              <div style={{ background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 11, padding: "13px 16px", display: "flex", alignItems: "center", gap: 9 }}>
                <i className="ti ti-lock" style={{ fontSize: 16, color: C.textHint }} aria-hidden="true" />
                <span style={{ fontSize: 11.5, color: C.textFaint }}>Bordro / finans verileri gözetim kapsamı dışında — franchise'ın özel bilgisi.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Modal (ortak)
// ============================================================================
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: 14, padding: "20px 22px", width: 420, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} aria-label="Kapat" style={{ background: "none", border: "none", cursor: "pointer", color: C.textHint, fontSize: 18, display: "flex" }}><i className="ti ti-x" aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Personel — Fourth modeli (sube filtresi + secili sube personeli)
// ============================================================================
type StaffBranch = { id: string; name: string; address?: string; kind: "brand" | "franchise" };
type Employee = {
  id: string; first_name: string; last_name: string; email?: string; phone?: string;
  position?: string; department?: string; contract_type?: string; is_active: boolean;
  shift_status?: string;
};

const CONTRACT_LABEL: Record<string, string> = {
  full_time: "Tam Zamanlı", part_time: "Yarı Zamanlı", seasonal: "Sezonluk", contract: "Sözleşmeli",
};
const SHIFT_META: Record<string, { label: string; dot: string; fg: string; bg: string }> = {
  mesaide:     { label: "Mesaide",          dot: "#1FA85A", fg: "#15803D", bg: "#EEF8F2" },
  not_started: { label: "Başlamadı",        dot: "#A6A29B", fg: "#6B6862", bg: "#F2F1ED" },
  ended:       { label: "Vardiya bitti",    dot: "#D4D0C8", fg: "#8A867F", bg: "#F4F3F0" },
  leave:       { label: "İzinli",           dot: "#E0A82E", fg: "#9C8A4E", bg: "#FBF6E9" },
};

function StaffPage({ token, companyId }: { token: string; companyId: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [branches, setBranches] = useState<StaffBranch[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StaffBranch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  // ekleme modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", position: "", department: "", contract_type: "full_time" });
  const [formErr, setFormErr] = useState("");
  // detay modal
  const [detail, setDetail] = useState<Employee | null>(null);
  const [edit, setEdit] = useState({ first_name: "", last_name: "", phone: "", position: "", department: "" });
  const [editing, setEditing] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [termPw, setTermPw] = useState("");
  const [msg, setMsg] = useState("");

  // helper: bir company'nin ilk branch'ini bul
  const firstBranchOf = async (cid: string): Promise<{ id: string; name: string; address?: string } | null> => {
    try {
      const r = await axios.get(`${API_URL}/companies/${cid}/branches`, { headers });
      return r.data.length ? r.data[0] : null;
    } catch { return null; }
  };

  const loadBranches = async () => {
    const list: StaffBranch[] = [];
    // 1) kendi subeler
    try {
      const r = await axios.get(`${API_URL}/companies/${companyId}/branches`, { headers });
      r.data.forEach((b: any) => list.push({ id: b.id, name: b.name, address: b.address, kind: "brand" }));
    } catch {}
    // 2) franchise'lar (her biri ayri company → ilk branch'ini al)
    try {
      const r = await axios.get(`${API_URL}/oversight/subs`, { headers });
      const fr = r.data.filter((s: any) => s.link_type === "franchise");
      await Promise.all(fr.map(async (f: any) => {
        const b = await firstBranchOf(f.id);
        if (b) list.push({ id: b.id, name: f.name, address: b.address || f.address, kind: "franchise" });
      }));
    } catch {}
    setBranches(list);
    // personel sayilari
    const c: Record<string, number> = {};
    await Promise.all(list.map(async (b) => {
      try { const r = await axios.get(`${API_URL}/employees/branch/${b.id}`, { headers }); c[b.id] = r.data.length; }
      catch { c[b.id] = 0; }
    }));
    setCounts(c);
    setLoading(false);
  };

  const loadEmployees = async (branchId: string) => {
    setEmpLoading(true);
    try { const r = await axios.get(`${API_URL}/employees/branch/${branchId}`, { headers }); setEmployees(r.data); }
    catch { setEmployees([]); }
    setEmpLoading(false);
  };

  useEffect(() => { loadBranches(); /* eslint-disable-next-line */ }, [companyId]);

  const selectBranch = (b: StaffBranch) => { setSelected(b); loadEmployees(b.id); };

  const totalStaff = Object.values(counts).reduce((a, b) => a + b, 0);

  const addEmployee = async () => {
    setFormErr("");
    if (!form.first_name || !form.last_name) { setFormErr("Ad ve soyad zorunlu."); return; }
    if (!selected) return;
    try {
      const payload: any = { first_name: form.first_name, last_name: form.last_name, contract_type: form.contract_type, company_id: companyId, branch_id: selected.id };
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.position) payload.position = form.position;
      if (form.department) payload.department = form.department;
      await axios.post(`${API_URL}/employees`, payload, { headers });
      setShowForm(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", position: "", department: "", contract_type: "full_time" });
      loadEmployees(selected.id); loadBranches();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setFormErr(typeof d === "string" ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(", ") : "Personel eklenemedi."));
    }
  };

  const openDetail = (em: Employee) => {
    setDetail(em);
    setEdit({ first_name: em.first_name || "", last_name: em.last_name || "", phone: em.phone || "", position: em.position || "", department: em.department || "" });
    setEditing(false); setRemoveMode(false); setMsg("");
  };
  const saveEdit = async () => {
    setMsg("");
    try { await axios.put(`${API_URL}/employees/${detail!.id}`, edit, { headers }); setEditing(false); if (selected) loadEmployees(selected.id); setDetail({ ...detail!, ...edit }); }
    catch (e: any) { setMsg(e.response?.data?.detail || "Güncellenemedi."); }
  };
  const terminate = async () => {
    setMsg("");
    if (!termPw) { setMsg("Onaylamak için şifren zorunlu."); return; }
    try {
      await axios.delete(`${API_URL}/employees/${detail!.id}/terminate`, { headers, data: { admin_password: termPw } });
      setDetail(null); setTermPw(""); if (selected) loadEmployees(selected.id); loadBranches();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setMsg(typeof d === "string" ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(", ") : "İşten çıkarılamadı."));
    }
  };

  const isFranchise = selected?.kind === "franchise";
  const greenBtn = { fontSize: 12, fontWeight: 600, color: "#fff", background: C.green, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 } as const;
  const softBtn = { fontSize: 12, fontWeight: 500, color: C.greenDark, background: C.greenSoft, border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" } as const;
  const inputStyle = { width: "100%", padding: "9px 11px", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: C.textFaint, display: "block", marginBottom: 5 };

  const branchActive = employees.filter((e) => e.is_active).length;

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 3 }}>Personel</div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Tüm şubelerinin personeli. Bir şube seç, detayına in.</div>

      {/* Ozet kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px" }}>
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 5 }}>Toplam Personel</div>
          <div style={{ fontSize: 21, fontWeight: 600 }}>{loading ? "—" : totalStaff}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px" }}>
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 5 }}>Şube Sayısı</div>
          <div style={{ fontSize: 21, fontWeight: 600, color: C.greenDark }}>{loading ? "—" : branches.length}</div>
        </div>
        <div style={{ background: C.ink, borderRadius: 11, padding: "13px 15px" }}>
          <div style={{ fontSize: 11, color: "#9DE8BE", marginBottom: 5 }}>Bugün mesaide</div>
          <div style={{ fontSize: 21, fontWeight: 600, color: "#fff" }}>—</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.4fr", gap: 18 }}>
        {/* SOL — sube filtresi */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Şubeler</div>
          {loading ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : branches.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
              <i className="ti ti-building-off" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Henüz şube yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {branches.map((b) => {
                const isSel = selected?.id === b.id;
                const cnt = counts[b.id] ?? 0;
                const fr = b.kind === "franchise";
                return (
                  <div key={b.id} onClick={() => selectBranch(b)} style={{ background: isSel ? C.bg : C.surface, border: isSel ? `1.5px solid ${C.green}` : `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: isSel ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</span>
                      <span style={{ fontSize: 9, color: fr ? C.franchise : C.greenDark, background: fr ? C.franchiseSoft : C.greenSoft, padding: "2px 7px", borderRadius: 8, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{fr ? "Franchise" : "Markaya Ait"}</span>
                    </div>
                    <span style={{ fontSize: 12, color: isSel ? C.greenDark : C.textFaint, fontWeight: isSel ? 600 : 400, flexShrink: 0, marginLeft: 6 }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAG — secili sube personeli */}
        <div>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.textHint, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Personeli görmek için bir şube seçin.</span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name} — Personel ({employees.length})</span>
                {!isFranchise ? (
                  <button style={greenBtn} onClick={() => { setShowForm(true); setFormErr(""); }}><i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Personel Ekle</button>
                ) : (
                  <span style={{ fontSize: 10.5, color: C.franchise, background: C.franchiseSoft, padding: "4px 10px", borderRadius: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-eye" style={{ fontSize: 13 }} aria-hidden="true" />Gözetim (salt okunur)</span>
                )}
              </div>

              {/* durum lejant */}
              <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                {Object.values(SHIFT_META).map((m) => (
                  <span key={m.label} style={{ fontSize: 10.5, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.dot }} />{m.label}
                  </span>
                ))}
              </div>

              {empLoading ? (
                <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
              ) : employees.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
                  <i className="ti ti-user-off" style={{ fontSize: 22 }} aria-hidden="true" />
                  <span style={{ fontSize: 12.5 }}>Bu şubede henüz personel yok.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {employees.map((em) => {
                    const sm = SHIFT_META[em.shift_status || "not_started"] || SHIFT_META.not_started;
                    const initials = (em.first_name?.[0] || "") + (em.last_name?.[0] || "");
                    return (
                      <div key={em.id} onClick={() => openDetail(em)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{em.first_name} {em.last_name}</div>
                          <div style={{ fontSize: 11, color: C.textFaint }}>{[em.position, em.department].filter(Boolean).join(" · ") || "—"}</div>
                        </div>
                        {em.contract_type && <span style={{ fontSize: 10, color: C.textMuted, background: C.neutralBg, padding: "2px 8px", borderRadius: 10, flexShrink: 0 }}>{CONTRACT_LABEL[em.contract_type] || em.contract_type}</span>}
                        <span style={{ fontSize: 10, color: sm.fg, background: sm.bg, padding: "3px 9px", borderRadius: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: sm.dot }} />{sm.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: Personel Ekle */}
      {showForm && selected && (
        <Modal title={`Personel Ekle — ${selected.name}`} onClose={() => setShowForm(false)}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Ad *</label><input style={inputStyle} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Soyad *</label><input style={inputStyle} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Pozisyon</label><input style={inputStyle} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Barista" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Departman</label><input style={inputStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Servis" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Sözleşme Tipi</label>
            <select style={inputStyle} value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })}>
              <option value="full_time">Tam Zamanlı</option>
              <option value="part_time">Yarı Zamanlı</option>
              <option value="seasonal">Sezonluk</option>
              <option value="contract">Sözleşmeli</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>E-posta</label><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Telefon</label><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          {formErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {formErr}</div>}
          <button style={{ ...greenBtn, width: "100%", justifyContent: "center", padding: "11px" }} onClick={addEmployee}>Personel Ekle</button>
        </Modal>
      )}

      {/* Modal: Personel Detay */}
      {detail && (
        <Modal title="Personel Detayı" onClose={() => setDetail(null)}>
          {!editing ? (
            <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>Ad Soyad</span><div style={{ fontSize: 14, fontWeight: 600 }}>{detail.first_name} {detail.last_name}</div></div>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>Pozisyon / Departman</span><div style={{ fontSize: 14 }}>{[detail.position, detail.department].filter(Boolean).join(" · ") || "—"}</div></div>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>İletişim</span><div style={{ fontSize: 14 }}>{detail.email || "—"}{detail.phone ? ` · ${detail.phone}` : ""}</div></div>
              <div><span style={{ fontSize: 11, color: C.textFaint }}>Sözleşme</span><div style={{ fontSize: 14 }}>{detail.contract_type ? (CONTRACT_LABEL[detail.contract_type] || detail.contract_type) : "—"}</div></div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ad</label><input style={inputStyle} value={edit.first_name} onChange={(e) => setEdit({ ...edit, first_name: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Soyad</label><input style={inputStyle} value={edit.last_name} onChange={(e) => setEdit({ ...edit, last_name: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Pozisyon</label><input style={inputStyle} value={edit.position} onChange={(e) => setEdit({ ...edit, position: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Departman</label><input style={inputStyle} value={edit.department} onChange={(e) => setEdit({ ...edit, department: e.target.value })} /></div>
              </div>
              <div><label style={labelStyle}>Telefon</label><input style={inputStyle} value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
            </div>
          )}

          {removeMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", background: C.dangerBg, borderRadius: 10, border: `1px solid ${C.dangerBorder}`, marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, color: C.dangerInk }}>Bu personeli işten çıkarmak için şifrenle onayla:</div>
              <input style={inputStyle} type="password" value={termPw} onChange={(e) => setTermPw(e.target.value)} placeholder="Senin (owner) şifren" />
              <button style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.dangerInk, border: "none", padding: "10px", borderRadius: 8, cursor: "pointer" }} onClick={terminate}>İşten Çıkarmayı Onayla</button>
            </div>
          )}
          {msg && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {msg}</div>}

          {!isFranchise && (
            <div style={{ display: "flex", gap: 8 }}>
              {!editing ? (
                <>
                  <button style={{ ...greenBtn, flex: 1, justifyContent: "center", padding: "9px" }} onClick={() => { setEditing(true); setRemoveMode(false); setMsg(""); }}>Düzenle</button>
                  <button style={{ fontSize: 12, fontWeight: 600, color: C.dangerInk, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, padding: "9px 14px", borderRadius: 8, cursor: "pointer" }} onClick={() => { setRemoveMode(!removeMode); setTermPw(""); setMsg(""); }}>İşten Çıkar</button>
                </>
              ) : (
                <>
                  <button style={{ ...greenBtn, flex: 1, justifyContent: "center", padding: "9px" }} onClick={saveEdit}>Kaydet</button>
                  <button style={{ ...softBtn, flex: 1 }} onClick={() => setEditing(false)}>İptal</button>
                </>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}


// ============================================================================
// Placeholder
// ============================================================================
function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", color: C.textHint, gap: 10 }}>
      <i className="ti ti-tools" style={{ fontSize: 32 }} aria-hidden="true" />
      <div style={{ fontSize: 15, fontWeight: 600, color: C.textMuted }}>{title}</div>
      <div style={{ fontSize: 13 }}>Bu sayfa yakında hazır olacak.</div>
    </div>
  );
}
