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
  warnSoft: "#FEFAF3",
  warnBorder: "#F5E6C8",
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
  { id: "franchises", label: "Şubeler", icon: "ti-building-store" },
  { id: "staff", label: "Personel", icon: "ti-users" },
  { id: "inventory", label: "Envanter", icon: "ti-box" },
  { id: "payroll", label: "Bordro", icon: "ti-receipt" },
  { id: "finance", label: "Finans", icon: "ti-cash" },
  { id: "reports", label: "Raporlar", icon: "ti-chart-bar" },
  { id: "announcements", label: "Duyurular", icon: "ti-bell" },
  { id: "settings", label: "Ayarlar", icon: "ti-settings" },
];

const PAGE_TITLE: Record<string, string> = {
  overview: "Genel Bakış",
  company: "Şirketim",
  franchises: "Şubeler",
  staff: "Personel",
  inventory: "Envanter",
  payroll: "Bordro",
  finance: "Finans",
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
  const [jumpBranch, setJumpBranch] = useState<string | null>(null);
  const goToBranch = (branchId: string, target: string) => { setJumpBranch(branchId); setPage(target); };
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
          {page === "franchises" && <BranchesPage token={token} companyId={user.company_id || ""} goToBranch={goToBranch} />}
          {page === "staff" && <StaffPage token={token} companyId={user.company_id || ""} jumpBranch={jumpBranch} clearJump={() => setJumpBranch(null)} />}
          {page === "inventory" && <InventoryPage token={token} companyId={user.company_id || ""} jumpBranch={jumpBranch} clearJump={() => setJumpBranch(null)} />}
          {page === "payroll" && <PayrollPage token={token} companyId={user.company_id || ""} jumpBranch={jumpBranch} clearJump={() => setJumpBranch(null)} />}
          {page !== "overview" && page !== "company" && page !== "franchises" && page !== "staff" && page !== "inventory" && page !== "payroll" && <Placeholder title={PAGE_TITLE[page]} />}
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
// Bordro — donem bazli sube bordrosu. /payroll/branch + /payroll/run-branch
// ============================================================================
type PayBranch = { id: string; name: string; address?: string };
type Payslip = {
  id: string; employee_id: string; year: number; month: number; sgk_days: number;
  full_monthly_gross: number; gross: number; sgk_base: number;
  sgk_employee: number; unemployment_employee: number;
  income_tax_base: number; cumulative_base_before: number; cumulative_base_after: number;
  income_tax_gross: number; income_tax_exemption: number; income_tax_net: number;
  stamp_tax_gross: number; stamp_tax_exemption: number; stamp_tax_net: number;
  net_salary: number; sgk_employer: number; unemployment_employer: number; employer_cost: number;
};
type PayRow = {
  employee_id: string; first_name: string; last_name: string;
  position?: string | null; base_salary?: number | null; payslip?: Payslip | null;
};
const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const fmtTL2 = (n: number) => "₺" + (n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PayrollPage({ token, companyId, jumpBranch, clearJump }: { token: string; companyId: string; jumpBranch?: string | null; clearJump?: () => void }) {
  const headers = { Authorization: `Bearer ${token}` };
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [branches, setBranches] = useState<PayBranch[]>([]);
  const [branchesLoaded, setBranchesLoaded] = useState(false);
  const [counts, setCounts] = useState<Record<string, { total: number; done: number }>>({});
  const [selected, setSelected] = useState<PayBranch | null>(null);
  const [rows, setRows] = useState<PayRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [runErr, setRunErr] = useState("");
  const [slip, setSlip] = useState<{ row: PayRow; p: Payslip } | null>(null);

  const loadBranches = async () => {
    try {
      const r = await axios.get(`${API_URL}/companies/${companyId}/branches?t=${Date.now()}`, { headers });
      setBranches(r.data.map((b: any) => ({ id: b.id, name: b.name, address: b.address })));
    } catch { setBranches([]); }
    setBranchesLoaded(true);
  };
  useEffect(() => { loadBranches(); /* eslint-disable-next-line */ }, [companyId]);

  const loadCounts = async (y: number, m: number, list: PayBranch[]) => {
    const c: Record<string, { total: number; done: number }> = {};
    await Promise.all(list.map(async (b) => {
      try {
        const r = await axios.get(`${API_URL}/payroll/branch/${b.id}/${y}/${m}?t=${Date.now()}`, { headers });
        c[b.id] = { total: r.data.length, done: r.data.filter((x: PayRow) => x.payslip).length };
      } catch { c[b.id] = { total: 0, done: 0 }; }
    }));
    setCounts(c);
  };
  useEffect(() => { if (branchesLoaded && branches.length) loadCounts(year, month, branches); /* eslint-disable-next-line */ }, [branchesLoaded, branches.length, year, month]);

  const loadRows = async (b: PayBranch, y: number, m: number) => {
    setRowsLoading(true); setRunErr("");
    try { const r = await axios.get(`${API_URL}/payroll/branch/${b.id}/${y}/${m}?t=${Date.now()}`, { headers }); setRows(r.data); }
    catch { setRows([]); }
    setRowsLoading(false);
  };
  const selectBranch = (b: PayBranch) => { setSelected(b); loadRows(b, year, month); };
  useEffect(() => { if (selected) loadRows(selected, year, month); /* eslint-disable-next-line */ }, [year, month]);

  useEffect(() => {
    if (jumpBranch && branchesLoaded && branches.length) {
      const t = branches.find((b) => b.id === jumpBranch);
      if (t) selectBranch(t);
      if (clearJump) clearJump();
    }
    /* eslint-disable-next-line */
  }, [jumpBranch, branchesLoaded, branches.length]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => {
    const isCurrent = year === today.getFullYear() && month === today.getMonth() + 1;
    if (isCurrent) return; // gelecek ay yok
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };
  const atCurrent = year === today.getFullYear() && month === today.getMonth() + 1;

  const runBranch = async () => {
    if (!selected || running) return;
    setRunning(true); setRunErr("");
    try {
      const r = await axios.post(`${API_URL}/payroll/run-branch`, { branch_id: selected.id, year, month }, { headers });
      const fails = r.data.filter((x: any) => !x.ok);
      if (fails.length) setRunErr(`${fails.length} çalışan hesaplanamadı (maaş tanımsız olabilir).`);
      await loadRows(selected, year, month);
      loadCounts(year, month, branches);
    } catch (e: any) { const d = e.response?.data?.detail; setRunErr(typeof d === "string" ? d : "Dönem çalıştırılamadı."); }
    setRunning(false);
  };
  const runOne = async (employee_id: string) => {
    if (!selected) return;
    setRunErr("");
    try {
      await axios.post(`${API_URL}/payroll/run-through`, { employee_id, year, month }, { headers });
      await loadRows(selected, year, month);
      loadCounts(year, month, branches);
    } catch (e: any) { const d = e.response?.data?.detail; setRunErr(typeof d === "string" ? d : "Hesaplanamadı."); }
  };

  const done = rows.filter((r) => r.payslip);
  const totGross = done.reduce((a, r) => a + (r.payslip!.gross), 0);
  const totNet = done.reduce((a, r) => a + (r.payslip!.net_salary), 0);
  const totCost = done.reduce((a, r) => a + (r.payslip!.employer_cost), 0);
  const totState = totCost - totNet;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Bordro</div>
          <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 2 }}>Dönem bordrosunu hesapla, fişleri incele. Yeniden çalıştırma düzeltmedir.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", background: C.surface, border: "0.5px solid #E6E4DD", borderRadius: 10, overflow: "hidden" }}>
            <button onClick={prevMonth} aria-label="Önceki ay" style={{ border: "none", background: "transparent", padding: "8px 11px", cursor: "pointer", color: C.textFaint, display: "flex" }}><i className="ti ti-chevron-left" style={{ fontSize: 15 }} aria-hidden="true" /></button>
            <span style={{ fontSize: 13, fontWeight: 600, padding: "0 6px", minWidth: 110, textAlign: "center" }}>{AYLAR[month - 1]} {year}</span>
            <button onClick={nextMonth} aria-label="Sonraki ay" style={{ border: "none", background: "transparent", padding: "8px 11px", cursor: atCurrent ? "not-allowed" : "pointer", color: atCurrent ? "#E0DDD6" : C.textFaint, display: "flex" }}><i className="ti ti-chevron-right" style={{ fontSize: 15 }} aria-hidden="true" /></button>
          </div>
          <button onClick={runBranch} disabled={!selected || running} style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: !selected || running ? "#8A867F" : C.ink, border: "none", padding: "9px 16px", borderRadius: 10, cursor: !selected || running ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <i className={`ti ${running ? "ti-loader-2" : "ti-bolt"}`} style={{ fontSize: 15, color: "#2EE06A" }} aria-hidden="true" />{running ? "Hesaplanıyor…" : "Dönemi Çalıştır"}
          </button>
        </div>
      </div>
      <div style={{ height: 14 }} />

      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.7fr", gap: 18 }}>
        {/* SOL: markaya ait subeler */}
        <div>
          <div style={{ fontSize: 11, color: C.textHint, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Şubeler</div>
          {!branchesLoaded ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : branches.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
              <i className="ti ti-building-off" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Henüz şube yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {branches.map((b) => {
                const isSel = selected?.id === b.id;
                const cnt = counts[b.id];
                const pct = cnt && cnt.total > 0 ? Math.round((cnt.done / cnt.total) * 100) : 0;
                const full = cnt && cnt.total > 0 && cnt.done === cnt.total;
                return (
                  <div key={b.id} onClick={() => selectBranch(b)} style={{ background: isSel ? C.bg : C.surface, border: isSel ? `1.5px solid ${C.green}` : `0.5px solid ${C.border}`, borderRadius: 13, padding: "13px 15px", cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{b.name}</div>
                    <div style={{ height: 4, background: "#EFEFEC", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: full ? C.green : "#E0A82E", borderRadius: 3 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: cnt && cnt.done > 0 ? C.greenDark : C.warnInk, fontWeight: 600 }}>{cnt ? (cnt.total === 0 ? "Personel yok" : `${cnt.done}/${cnt.total} hesaplandı`) : "—"}</span>
                      <span style={{ fontSize: 11, color: C.textFaint }}>{cnt?.total ?? "—"} personel</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 8, padding: "11px 13px", background: C.surface, borderRadius: 11 }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 15, color: C.franchise, marginTop: 1 }} aria-hidden="true" />
            <span style={{ fontSize: 10.5, color: C.textFaint, lineHeight: 1.5 }}>Franchise bordroları işletmenin özelidir — bu ekranda yalnızca markaya ait şubeler yer alır.</span>
          </div>
        </div>

        {/* SAG */}
        <div>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.textHint, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Bordro için bir şube seçin.</span>
            </div>
          ) : (
            <>
              {/* hero */}
              <div style={{ background: C.ink, borderRadius: 14, padding: "16px 19px", marginBottom: 13, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "#7C7A75", marginBottom: 4 }}>{AYLAR[month - 1]} {year} · {selected.name} · İşveren Toplam Maliyeti</div>
                  <div style={{ fontSize: 25, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{rowsLoading ? "—" : fmtTL2(totCost)}</div>
                </div>
                <div style={{ display: "flex", gap: 22, textAlign: "right" }}>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{rowsLoading ? "—" : fmtTL2(totGross)}</div><div style={{ fontSize: 9.5, color: "#7C7A75", marginTop: 2 }}>toplam brüt</div></div>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: "#2EE06A" }}>{rowsLoading ? "—" : fmtTL2(totNet)}</div><div style={{ fontSize: 9.5, color: "#7C7A75", marginTop: 2 }}>çalışana net</div></div>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: "#E0A82E" }}>{rowsLoading ? "—" : fmtTL2(totState)}</div><div style={{ fontSize: 9.5, color: "#7C7A75", marginTop: 2 }}>devlete giden</div></div>
                </div>
              </div>

              {runErr && <div style={{ fontSize: 12, color: C.warnInk, background: C.warnBg, border: `0.5px solid ${C.warnBorder}`, borderRadius: 9, padding: "8px 12px", marginBottom: 11 }}>⚠ {runErr}</div>}

              {rowsLoading ? (
                <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
              ) : rows.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
                  <i className="ti ti-users" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Bu şubede aktif personel yok.</span>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr 1fr 0.95fr 36px", gap: 10, padding: "0 15px 7px", fontSize: 10, color: C.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    <span>çalışan</span><span style={{ textAlign: "right" }}>brüt</span><span style={{ textAlign: "right" }}>net</span><span style={{ textAlign: "center" }}>durum</span><span></span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {rows.map((r) => {
                      const p = r.payslip;
                      const noSalary = r.base_salary == null;
                      const initials = (r.first_name?.[0] || "") + (r.last_name?.[0] || "");
                      return (
                        <div key={r.employee_id} onClick={() => { if (p) setSlip({ row: r, p }); }} style={{ background: C.bg, border: p ? `0.5px solid ${C.border}` : `0.5px dashed #E0DACE`, borderRadius: 11, padding: "11px 15px", cursor: p ? "pointer" : "default", display: "grid", gridTemplateColumns: "1.9fr 1fr 1fr 0.95fr 36px", gap: 10, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: p ? C.greenSoft : C.neutralBg, color: p ? C.greenDark : C.textFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: p ? C.ink : C.textMuted }}>{r.first_name} {r.last_name}</div>
                              <div style={{ fontSize: 10.5, color: C.textFaint }}>{r.position || "—"}{p ? ` · ${p.sgk_days} gün` : ""}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 12.5, textAlign: "right", color: p ? "#3C3A36" : "#C9C5BD" }}>{p ? fmtTL2(p.gross) : "—"}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, textAlign: "right", color: p ? C.greenDark : "#C9C5BD" }}>{p ? fmtTL2(p.net_salary) : "—"}</div>
                          <div style={{ textAlign: "center" }}>
                            {p ? (
                              <span style={{ fontSize: 10, color: C.greenDark, background: C.greenSoft, padding: "4px 10px", borderRadius: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><i className="ti ti-check" style={{ fontSize: 11 }} aria-hidden="true" />Hesaplandı</span>
                            ) : noSalary ? (
                              <span style={{ fontSize: 10, color: C.warnInk, background: C.warnBg, padding: "4px 10px", borderRadius: 12, fontWeight: 600 }}>Maaş Tanımsız</span>
                            ) : (
                              <span style={{ fontSize: 10, color: C.warnInk, background: C.warnBg, padding: "4px 10px", borderRadius: 12, fontWeight: 600 }}>Bekliyor</span>
                            )}
                          </div>
                          {p ? (
                            <i className="ti ti-chevron-right" style={{ fontSize: 15, color: "#D4D0C8", margin: "0 auto" }} aria-hidden="true" />
                          ) : noSalary ? (
                            <i className="ti ti-lock" style={{ fontSize: 14, color: C.textHint, margin: "0 auto" }} aria-hidden="true" />
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); runOne(r.employee_id); }} aria-label="Bordroyu çalıştır" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: C.green, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><i className="ti ti-player-play" style={{ fontSize: 13, color: "#fff" }} aria-hidden="true" /></button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* FIS MODALI */}
      {slip && (
        <Modal title={`${slip.row.first_name} ${slip.row.last_name} — ${AYLAR[slip.p.month - 1]} ${slip.p.year}`} onClose={() => setSlip(null)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11.5, color: C.textFaint }}>{slip.row.position || "—"} · {selected?.name}</span>
            <span style={{ fontSize: 10.5, color: C.textFaint }}>SGK {slip.p.sgk_days} gün</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "0.5px solid #F0EEE8" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Brüt Ücret</span>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fmtTL2(slip.p.gross)}</span>
          </div>

          <div style={{ fontSize: 10, color: C.textHint, fontWeight: 600, margin: "11px 0 7px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Kesintiler</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: C.textMuted }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>SGK İşçi Payı</span><span>− {fmtTL2(slip.p.sgk_employee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>İşsizlik Sigortası</span><span>− {fmtTL2(slip.p.unemployment_employee)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Gelir Vergisi <span style={{ color: "#C9C5BD" }}>istisna sonrası</span></span><span>− {fmtTL2(slip.p.income_tax_net)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Damga Vergisi <span style={{ color: "#C9C5BD" }}>istisna sonrası</span></span><span>− {fmtTL2(slip.p.stamp_tax_net)}</span></div>
          </div>

          <div style={{ marginTop: 13, padding: "12px 15px", background: C.greenSoft, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.greenDark }}>NET MAAŞ</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: C.greenDark }}>{fmtTL2(slip.p.net_salary)}</span>
          </div>

          <div style={{ marginTop: 9, padding: "11px 15px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.textMuted, marginBottom: 5 }}><span>SGK İşveren</span><span>{fmtTL2(slip.p.sgk_employer)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.textMuted, marginBottom: 8 }}><span>İşsizlik İşveren</span><span>{fmtTL2(slip.p.unemployment_employer)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `0.5px solid ${C.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>İşveren Toplam Maliyeti</span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{fmtTL2(slip.p.employer_cost)}</span>
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: C.textHint }}>
            <span>Kümülatif matrah {fmtTL2(slip.p.cumulative_base_before)} → {fmtTL2(slip.p.cumulative_base_after)}</span>
            <span onClick={() => { runOne(slip.row.employee_id); setSlip(null); }} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: C.greenDark }}><i className="ti ti-rotate" style={{ fontSize: 11 }} aria-hidden="true" />Yeniden çalıştır</span>
          </div>
        </Modal>
      )}
    </>
  );
}

// ============================================================================
// Subeler — birlesik liste (markaya ait + franchise) + iki modlu kopru
// ============================================================================
type BItem = {
  id: string;            // branch_id (drill-down hedefi)
  companyId: string;     // sahip company (markaya ait=brand, franchise=ayri)
  name: string;
  legalName?: string;
  address?: string;
  email?: string;
  kind: "brand" | "franchise";
  isActive: boolean;
};
type BSummary = { staff: number; on_duty: number; critical_stock: number };

function BranchesPage({ token, companyId, goToBranch }: { token: string; companyId: string; goToBranch: (branchId: string, target: string) => void }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [items, setItems] = useState<BItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BItem | null>(null);
  const [summary, setSummary] = useState<BSummary | null>(null);
  const [sumLoading, setSumLoading] = useState(false);
  // yeni ekle modal
  const [showAdd, setShowAdd] = useState(false);
  const [addKind, setAddKind] = useState<"brand" | "franchise">("brand");

  const loadAll = async () => {
    const list: BItem[] = [];
    // 1) markaya ait subeler
    try {
      const r = await axios.get(`${API_URL}/companies/${companyId}/branches?t=${Date.now()}`, { headers });
      r.data.forEach((b: any) => list.push({ id: b.id, companyId, name: b.name, address: b.address, kind: "brand", isActive: b.is_active !== false }));
    } catch {}
    // 2) franchise'lar (her biri ayri company → ilk branch'i drill-down hedefi)
    try {
      const r = await axios.get(`${API_URL}/oversight/subs?t=${Date.now()}`, { headers });
      const fr = r.data.filter((s: any) => s.link_type === "franchise");
      await Promise.all(fr.map(async (f: any) => {
        try {
          const br = await axios.get(`${API_URL}/companies/${f.id}/branches`, { headers });
          const b = br.data.length ? br.data[0] : null;
          if (b) list.push({ id: b.id, companyId: f.id, name: f.name, legalName: f.legal_name, address: b.address || f.address, email: f.email, kind: "franchise", isActive: f.is_active !== false });
        } catch {}
      }));
    } catch {}
    setItems(list);
    setLoading(false);
  };
  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [companyId]);

  const selectItem = async (it: BItem) => {
    setSelected(it); setSummary(null); setSumLoading(true);
    if (it.kind === "franchise") {
      try { const r = await axios.get(`${API_URL}/oversight/franchises/${it.companyId}/summary`, { headers }); setSummary(r.data); }
      catch { setSummary(null); }
    } else {
      // markaya ait: kendi endpoint'lerinden ozet kur
      try {
        const emp = await axios.get(`${API_URL}/employees/branch/${it.id}`, { headers });
        const prod = await axios.get(`${API_URL}/inventory/products/branch/${it.id}`, { headers });
        const crit = prod.data.filter((p: any) => p.current_stock < p.min_stock_level).length;
        setSummary({ staff: emp.data.length, on_duty: 0, critical_stock: crit });
      } catch { setSummary(null); }
    }
    setSumLoading(false);
  };

  const isFr = selected?.kind === "franchise";

  // kisayol satiri helper
  const ShortcutRow = ({ icon, label, hint, target, locked }: { icon: string; label: string; hint?: string; target?: string; locked?: boolean }) => (
    <div
      onClick={() => { if (!locked && target && selected) goToBranch(selected.id, target); }}
      style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", background: locked ? C.neutralBg : "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.6 : 1 }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 17, color: locked ? C.textHint : (isFr ? C.franchise : C.greenDark) }} aria-hidden="true" />
      <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>{label}</span>
      {hint && <span style={{ fontSize: 11, color: C.textFaint }}>{hint}</span>}
      {locked ? <i className="ti ti-lock" style={{ fontSize: 14, color: C.textHint }} aria-hidden="true" /> : <i className="ti ti-arrow-right" style={{ fontSize: 15, color: C.textFaint }} aria-hidden="true" />}
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Şubeler</div>
        <button onClick={() => { setShowAdd(true); setAddKind("brand"); }} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.green, border: "none", padding: "7px 13px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Yeni Ekle</button>
      </div>
      <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 18 }}>Markaya ait şubelerin ve franchise lokasyonların. Birine tıkla, içine gir.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 18 }}>
        {/* SOL: birlesik liste */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Tüm Lokasyonlar</div>
          {loading ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
              <i className="ti ti-building-off" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Henüz lokasyon yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((it) => {
                const isSel = selected?.id === it.id; const fr = it.kind === "franchise";
                return (
                  <div key={it.id} onClick={() => selectItem(it)} style={{ background: isSel ? C.bg : C.surface, border: isSel ? `1.5px solid ${C.green}` : `0.5px solid ${C.border}`, borderRadius: 11, padding: "13px 15px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: isSel ? (fr ? C.franchiseSoft : C.greenSoft) : C.neutralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className="ti ti-building-store" style={{ fontSize: 18, color: isSel ? (fr ? C.franchise : C.greenDark) : C.textFaint }} aria-hidden="true" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: isSel ? 600 : 500, display: "flex", alignItems: "center", gap: 7 }}>
                          {it.name}
                          <span style={{ fontSize: 9, color: fr ? C.franchise : C.greenDark, background: fr ? C.franchiseSoft : C.greenSoft, padding: "2px 7px", borderRadius: 8, fontWeight: 600 }}>{fr ? "Franchise" : "Markaya Ait"}</span>
                        </div>
                        {it.address && <div style={{ fontSize: 11.5, color: C.textFaint, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><i className="ti ti-map-pin" style={{ fontSize: 12 }} aria-hidden="true" />{it.address}</div>}
                      </div>
                      {isSel && <i className="ti ti-chevron-right" style={{ fontSize: 16, color: C.green, flexShrink: 0 }} aria-hidden="true" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAG: kopru */}
        <div>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.textHint, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5 }}>Detay için bir lokasyon seçin.</span>
            </div>
          ) : (
            <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 13, padding: 18, background: C.surface }}>
              {/* kunye */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: isFr ? C.franchiseSoft : C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="ti ti-building-store" style={{ fontSize: 22, color: isFr ? C.franchise : C.green }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{selected.name}</div>
                  <div style={{ fontSize: 11.5, color: C.textFaint }}>{selected.legalName ? selected.legalName + " · " : ""}{isFr ? "Franchise" : "Markaya Ait"}</div>
                </div>
                <span style={{ fontSize: 10, color: isFr ? C.franchise : C.greenDark, background: isFr ? C.franchiseSoft : C.greenSoft, padding: "3px 9px", borderRadius: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  {isFr ? <><i className="ti ti-eye" style={{ fontSize: 12 }} aria-hidden="true" />Gözetim</> : "Tam Yetki"}
                </span>
              </div>

              {/* ozet */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 16 }}>
                <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, padding: "11px 12px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600 }}>{sumLoading ? "—" : (summary?.staff ?? 0)}</div><div style={{ fontSize: 10, color: C.textHint, marginTop: 1 }}>personel</div></div>
                <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, padding: "11px 12px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600, color: C.greenDark }}>{sumLoading ? "—" : (summary?.on_duty ?? 0)}</div><div style={{ fontSize: 10, color: C.textHint, marginTop: 1 }}>mesaide</div></div>
                <div style={{ background: (summary?.critical_stock ?? 0) > 0 ? C.warnBg : "#fff", border: `0.5px solid ${(summary?.critical_stock ?? 0) > 0 ? C.warnBorder : C.border}`, borderRadius: 9, padding: "11px 12px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600, color: (summary?.critical_stock ?? 0) > 0 ? C.warnInk : C.ink }}>{sumLoading ? "—" : (summary?.critical_stock ?? 0)}</div><div style={{ fontSize: 10, color: (summary?.critical_stock ?? 0) > 0 ? C.warnInk : C.textHint, marginTop: 1 }}>kritik stok</div></div>
              </div>

              {/* kisayollar */}
              <div style={{ fontSize: 11, color: C.textHint, fontWeight: 600, marginBottom: 9, textTransform: "uppercase", letterSpacing: "0.03em" }}>{isFr ? "Bu franchise'ı izle" : "Bu şubede yönet"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <ShortcutRow icon="ti-users" label="Personel" hint={`${summary?.staff ?? 0} kişi`} target="staff" />
                <ShortcutRow icon="ti-box" label="Envanter" target="inventory" />
                <ShortcutRow icon="ti-cash" label="Finans" target="finance" />
                {!isFr && <ShortcutRow icon="ti-receipt" label="Bordro" target="payroll" />}
                {isFr && <ShortcutRow icon="ti-receipt" label="Bordro" locked />}
              </div>

              {isFr && (
                <div style={{ marginTop: 12, padding: "10px 13px", background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ti ti-info-circle" style={{ fontSize: 14, color: C.franchise }} aria-hidden="true" />
                  <span style={{ fontSize: 11, color: C.textMuted }}>Franchise ayrı bir işletmedir — personel ve envanteri izlersin, bordrosu kendisine özeldir.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Yeni Lokasyon Ekle" onClose={() => setShowAdd(false)}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>Ne eklemek istersin?</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div onClick={() => setAddKind("brand")} style={{ flex: 1, border: addKind === "brand" ? `1.5px solid ${C.green}` : `0.5px solid ${C.border}`, borderRadius: 11, padding: "14px 13px", cursor: "pointer", background: addKind === "brand" ? C.greenSoft : "#fff" }}>
              <i className="ti ti-building-store" style={{ fontSize: 19, color: C.greenDark }} aria-hidden="true" />
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 7 }}>Markaya Ait Şube</div>
              <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>Senin işletmen, tam yetki.</div>
            </div>
            <div onClick={() => setAddKind("franchise")} style={{ flex: 1, border: addKind === "franchise" ? `1.5px solid ${C.franchise}` : `0.5px solid ${C.border}`, borderRadius: 11, padding: "14px 13px", cursor: "pointer", background: addKind === "franchise" ? C.franchiseSoft : "#fff" }}>
              <i className="ti ti-link" style={{ fontSize: 19, color: C.franchise }} aria-hidden="true" />
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 7 }}>Franchise</div>
              <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>Ayrı işletme, gözetim.</div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: C.textHint, lineHeight: 1.5 }}>
            {addKind === "brand"
              ? "Markaya ait şube ekleme akışı Şirketim sayfasından yapılır (yakında buraya taşınacak)."
              : "Franchise ekleme akışı yakında bu modale gelecek — şimdilik mevcut franchise oluşturma akışını kullan."}
          </div>
        </Modal>
      )}
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

function StaffPage({ token, companyId, jumpBranch, clearJump }: { token: string; companyId: string; jumpBranch?: string | null; clearJump?: () => void }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [branches, setBranches] = useState<StaffBranch[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StaffBranch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  // ekleme modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", position: "", department: "", contract_type: "full_time", base_salary: "", bank_iban: "" });
  const [formErr, setFormErr] = useState("");
  // detay modal
  const [detail, setDetail] = useState<Employee | null>(null);
  const [edit, setEdit] = useState({ first_name: "", last_name: "", phone: "", position: "", department: "", base_salary: "", bank_iban: "" });
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
  useEffect(() => {
    if (jumpBranch && branches.length) {
      const t = branches.find((b) => b.id === jumpBranch);
      if (t) { setSelected(t); loadEmployees(t.id); }
      if (clearJump) clearJump();
    }
    /* eslint-disable-next-line */
  }, [jumpBranch, branches.length]);

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
      if (form.base_salary) payload.base_salary = parseFloat(form.base_salary) || 0;
      if (form.bank_iban) payload.bank_iban = form.bank_iban.trim();
      await axios.post(`${API_URL}/employees`, payload, { headers });
      setShowForm(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", position: "", department: "", contract_type: "full_time", base_salary: "", bank_iban: "" });
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
    try {
      const epayload: any = { first_name: edit.first_name, last_name: edit.last_name, phone: edit.phone, position: edit.position, department: edit.department, bank_iban: edit.bank_iban.trim() };
      epayload.base_salary = edit.base_salary ? (parseFloat(edit.base_salary) || 0) : null;
      await axios.put(`${API_URL}/employees/${detail!.id}`, epayload, { headers }); setEditing(false); if (selected) loadEmployees(selected.id); setDetail({ ...detail!, ...epayload });
    }
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
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Brüt Maaş (₺/ay)</label><input style={inputStyle} type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} placeholder="Bordro için" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>IBAN</label><input style={inputStyle} value={form.bank_iban} onChange={(e) => setForm({ ...form, bank_iban: e.target.value })} placeholder="TR.." /></div>
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
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Brüt Maaş (₺/ay)</label><input style={inputStyle} type="number" value={edit.base_salary} onChange={(e) => setEdit({ ...edit, base_salary: e.target.value })} placeholder="Bordro için" /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>IBAN</label><input style={inputStyle} value={edit.bank_iban} onChange={(e) => setEdit({ ...edit, bank_iban: e.target.value })} placeholder="TR.." /></div>
              </div>
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
// Envanter — Merkez Depo + Sube Stoklari (tedarik zinciri)
// ============================================================================
type WHItem = {
  id: string; company_id: string; name: string; unit: string; unit_cost: number;
  dispatch_price: number; current_stock: number; min_stock_level: number; is_active: boolean;
};
type InvBranch = { id: string; name: string; address?: string; kind: "brand" | "franchise" };
type Product = {
  id: string; branch_id: string; name: string; unit: string; unit_cost: number;
  current_stock: number; min_stock_level: number; is_active: boolean;
  category_id?: string | null;
};
type Category = { id: string; branch_id: string; name: string };

const fmtNum = (n: number) => (n ?? 0).toLocaleString("tr-TR");
const fmtTL = (n: number) => "₺" + (n ?? 0).toLocaleString("tr-TR", { maximumFractionDigits: 0 });

function InventoryPage({ token, companyId, jumpBranch, clearJump }: { token: string; companyId: string; jumpBranch?: string | null; clearJump?: () => void }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [view, setView] = useState<"gate" | "warehouse" | "branches">("gate");
  const [initialBranchId, setInitialBranchId] = useState<string | null>(null);

  // ── ortak: sube listesi (kendi + franchise) ──
  const [branches, setBranches] = useState<InvBranch[]>([]);
  const [branchesLoaded, setBranchesLoaded] = useState(false);

  const firstBranchOf = async (cid: string) => {
    try { const r = await axios.get(`${API_URL}/companies/${cid}/branches`, { headers }); return r.data.length ? r.data[0] : null; }
    catch { return null; }
  };
  const loadBranches = async () => {
    const list: InvBranch[] = [];
    try {
      const r = await axios.get(`${API_URL}/companies/${companyId}/branches`, { headers });
      r.data.forEach((b: any) => list.push({ id: b.id, name: b.name, address: b.address, kind: "brand" }));
    } catch {}
    try {
      const r = await axios.get(`${API_URL}/oversight/subs`, { headers });
      const fr = r.data.filter((s: any) => s.link_type === "franchise");
      await Promise.all(fr.map(async (f: any) => {
        const b = await firstBranchOf(f.id);
        if (b) list.push({ id: b.id, name: f.name, address: b.address || f.address, kind: "franchise" });
      }));
    } catch {}
    setBranches(list); setBranchesLoaded(true);
    if (jumpBranch && list.some((b) => b.id === jumpBranch)) {
      setInitialBranchId(jumpBranch); setView("branches");
      if (clearJump) clearJump();
    }
  };
  useEffect(() => { loadBranches(); /* eslint-disable-next-line */ }, [companyId]);
  useEffect(() => {
    if (jumpBranch && branchesLoaded && branches.some((b) => b.id === jumpBranch)) {
      setInitialBranchId(jumpBranch); setView("branches");
      if (clearJump) clearJump();
    }
    /* eslint-disable-next-line */
  }, [jumpBranch, branchesLoaded, branches.length]);

  // ════════════════════ KAPI ════════════════════
  if (view === "gate") {
    return (
      <>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>Envanter</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 20 }}>Nereyi yönetmek istersin? Ana depo havuzu ya da şube stokları.</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {/* Merkez Depo */}
          <div onClick={() => setView("warehouse")} style={{ background: C.ink, borderRadius: 16, padding: "20px 22px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(46,224,106,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-building-warehouse" style={{ fontSize: 25, color: "#2EE06A" }} aria-hidden="true" />
              </div>
              <span style={{ fontSize: 9.5, color: "#2EE06A", border: "1px solid rgba(46,224,106,0.4)", padding: "3px 8px", borderRadius: 7, fontWeight: 600 }}>ANA HAVUZ</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Merkez Depo</div>
            <div style={{ fontSize: 12, color: "#A8A6A0", lineHeight: 1.5, marginBottom: 18 }}>Markanın ana stoğu. Ürün ekle, şubelere ve franchise'lara sevk et.</div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#2EE06A", fontSize: 12.5, fontWeight: 600 }}>Aç <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" /></span>
            </div>
          </div>
          {/* Sube Stoklari */}
          <div onClick={() => setView("branches")} style={{ background: C.bg, border: "0.5px solid #E6E4DD", borderRadius: 16, padding: "20px 22px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.green }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-building-store" style={{ fontSize: 25, color: C.greenDark }} aria-hidden="true" />
              </div>
              <span style={{ fontSize: 9.5, color: C.greenDark, background: C.greenSoft, padding: "3px 8px", borderRadius: 7, fontWeight: 600 }}>{branchesLoaded ? `${branches.length} ŞUBE` : "—"}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Şube Stokları</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, marginBottom: 18 }}>Her şubenin kendi envanteri. Stok durumunu ve kritik seviyeleri izle.</div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.green, fontSize: 12.5, fontWeight: 600 }}>Aç <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" /></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 15px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 11 }}>
          <i className="ti ti-arrow-ramp-right-2" style={{ fontSize: 17, color: C.franchise }} aria-hidden="true" />
          <span style={{ fontSize: 12, color: C.textMuted }}>Merkez depodan sevk edilen ürün, varış şubesinin stoğuna otomatik eklenir ve depodan düşülür.</span>
        </div>
      </>
    );
  }

  // ════════════════════ MERKEZ DEPO ════════════════════
  if (view === "warehouse") {
    return <WarehouseView token={token} companyId={companyId} branches={branches} onBack={() => setView("gate")} />;
  }

  // ════════════════════ SUBE STOKLARI ════════════════════
  return <BranchStockView token={token} branches={branches} branchesLoaded={branchesLoaded} initialBranchId={initialBranchId} onBack={() => { setInitialBranchId(null); setView("gate"); }} />;
}

// ───────────────────────── MERKEZ DEPO görünümü ─────────────────────────
function WarehouseView({ token, companyId, branches, onBack }: { token: string; companyId: string; branches: InvBranch[]; onBack: () => void }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [items, setItems] = useState<WHItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "kg", unit_cost: "", dispatch_price: "", current_stock: "", min_stock_level: "" });
  const [addErr, setAddErr] = useState("");

  const [dispatchItem, setDispatchItem] = useState<WHItem | null>(null);
  const [destBranchId, setDestBranchId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [dispErr, setDispErr] = useState("");

  const load = async () => {
    try { const r = await axios.get(`${API_URL}/inventory/warehouse/items`, { headers }); setItems(r.data); }
    catch { setItems([]); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const depoValue = items.reduce((a, b) => a + (b.current_stock * b.unit_cost), 0);
  const lowCount = items.filter((i) => i.current_stock < i.min_stock_level).length;

  const addItem = async () => {
    setAddErr("");
    if (!form.name || !form.unit) { setAddErr("Ürün adı ve birim zorunlu."); return; }
    try {
      await axios.post(`${API_URL}/inventory/warehouse/items`, {
        name: form.name, unit: form.unit,
        unit_cost: parseFloat(form.unit_cost) || 0,
        dispatch_price: parseFloat(form.dispatch_price) || 0,
        current_stock: parseFloat(form.current_stock) || 0,
        min_stock_level: parseFloat(form.min_stock_level) || 0,
      }, { headers });
      setShowAdd(false);
      setForm({ name: "", unit: "kg", unit_cost: "", dispatch_price: "", current_stock: "", min_stock_level: "" });
      load();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setAddErr(typeof d === "string" ? d : "Ürün eklenemedi.");
    }
  };

  const openDispatch = (it: WHItem) => { setDispatchItem(it); setDestBranchId(branches[0]?.id || ""); setQty(""); setNote(""); setDispErr(""); };
  const doDispatch = async () => {
    setDispErr("");
    const q = parseFloat(qty);
    if (!destBranchId) { setDispErr("Hedef şube seç."); return; }
    if (!q || q <= 0) { setDispErr("Geçerli miktar gir."); return; }
    if (q > dispatchItem!.current_stock) { setDispErr("Merkez depoda yeterli stok yok."); return; }
    try {
      await axios.post(`${API_URL}/inventory/warehouse/dispatch`, {
        warehouse_stock_id: dispatchItem!.id, dest_branch_id: destBranchId, quantity: q, note: note || null,
      }, { headers });
      setDispatchItem(null); load();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setDispErr(typeof d === "string" ? d : "Sevk başarısız.");
    }
  };

  const inputStyle = { width: "100%", padding: "9px 11px", border: `0.5px solid #E0DACE`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 11, color: C.textFaint, fontWeight: 600, display: "block", marginBottom: 6 };
  const greenBtn = { fontSize: 12, fontWeight: 600, color: "#fff", background: C.green, border: "none", padding: "7px 13px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 } as const;
  const softBtn = { fontSize: 12, fontWeight: 600, color: C.greenDark, background: C.greenSoft, border: "none", padding: "7px 13px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 } as const;

  const dispUnitPrice = dispatchItem?.dispatch_price || 0;
  const dispTotal = (parseFloat(qty) || 0) * dispUnitPrice;
  const destBranch = branches.find((b) => b.id === destBranchId);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
        <button onClick={onBack} aria-label="Geri" style={{ width: 30, height: 30, borderRadius: 8, border: "0.5px solid #E6E4DD", background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-arrow-left" style={{ fontSize: 16, color: C.textMuted }} aria-hidden="true" /></button>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Merkez Depo</div>
        <span style={{ fontSize: 9.5, color: "#fff", background: C.ink, padding: "3px 9px", borderRadius: 8, fontWeight: 600 }}>ANA HAVUZ</span>
      </div>
      <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 18, paddingLeft: 39 }}>Markanın ana stoğu. Buradan şubelere ve franchise'lara ürün sevk edilir.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 11, marginBottom: 20 }}>
        <div style={{ background: C.ink, borderRadius: 11, padding: "13px 15px" }}><div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>{loading ? "—" : fmtTL(depoValue)}</div><div style={{ fontSize: 10, color: "#7C7A75", marginTop: 2 }}>depo değeri</div></div>
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 11, padding: "13px 15px" }}><div style={{ fontSize: 18, fontWeight: 600 }}>{loading ? "—" : items.length}</div><div style={{ fontSize: 10, color: C.textHint, marginTop: 2 }}>ürün çeşidi</div></div>
        <div style={{ background: lowCount > 0 ? C.warnBg : C.surface, border: `0.5px solid ${lowCount > 0 ? C.warnBorder : C.border}`, borderRadius: 11, padding: "13px 15px" }}><div style={{ fontSize: 18, fontWeight: 600, color: lowCount > 0 ? C.warnInk : C.ink }}>{loading ? "—" : lowCount}</div><div style={{ fontSize: 10, color: lowCount > 0 ? C.warnInk : C.textHint, marginTop: 2 }}>azalan</div></div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Depo Stoğu</span>
        <button style={softBtn} onClick={() => { setShowAdd(true); setAddErr(""); }}><i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Ürün Ekle</button>
      </div>

      {loading ? (
        <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "40px 0", color: C.textHint }}>
          <i className="ti ti-package-off" style={{ fontSize: 24 }} aria-hidden="true" />
          <span style={{ fontSize: 12.5 }}>Merkez depo boş. İlk ürünü ekle.</span>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1.3fr 1fr 40px", gap: 10, padding: "0 14px 8px", fontSize: 10, color: C.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
            <span>ürün</span><span style={{ textAlign: "right" }}>depo stoğu</span><span style={{ textAlign: "right" }}>sevk fiyatı</span><span style={{ textAlign: "center" }}>durum</span><span />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {items.map((it) => {
              const low = it.current_stock < it.min_stock_level;
              return (
                <div key={it.id} style={{ background: low ? C.warnSoft : C.bg, border: `0.5px solid ${low ? C.warnBorder : C.border}`, borderRadius: 10, padding: "11px 14px", display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1.3fr 1fr 40px", gap: 10, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: low ? "#FBF0DA" : C.neutralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-package" style={{ fontSize: 16, color: low ? C.warnInk : C.textMuted }} aria-hidden="true" /></div>
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div><div style={{ fontSize: 10.5, color: C.textFaint }}>{it.unit}</div></div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, textAlign: "right", color: low ? C.warnInk : C.ink }}>{fmtNum(it.current_stock)}<span style={{ fontSize: 11, color: C.textHint, fontWeight: 400 }}> {it.unit}</span></span>
                  <span style={{ fontSize: 13, textAlign: "right", color: "#3C3A36" }}>{fmtTL(it.dispatch_price)} / {it.unit}</span>
                  <div style={{ textAlign: "center" }}><span style={{ fontSize: 10, color: low ? C.warnInk : C.greenDark, background: low ? C.warnBg : C.greenSoft, padding: "3px 9px", borderRadius: 10, fontWeight: 600 }}>{low ? "Azalıyor" : "Yeterli"}</span></div>
                  <button onClick={() => openDispatch(it)} aria-label="Sevk et" style={{ width: 30, height: 30, borderRadius: 7, border: "0.5px solid #E0DACE", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><i className="ti ti-send" style={{ fontSize: 15, color: C.green }} aria-hidden="true" /></button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal: Urun Ekle */}
      {showAdd && (
        <Modal title="Merkez Depoya Ürün Ekle" onClose={() => setShowAdd(false)}>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Ürün Adı *</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Çekirdek Kahve" /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim *</label>
              <select style={inputStyle} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option><option value="litre">litre</option><option value="adet">adet</option><option value="kutu">kutu</option>
              </select>
            </div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Başlangıç Stoğu</label><input style={inputStyle} type="number" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} placeholder="0" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Alış Maliyeti (₺)</label><input style={inputStyle} type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} placeholder="0" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Sevk Fiyatı (₺)</label><input style={inputStyle} type="number" value={form.dispatch_price} onChange={(e) => setForm({ ...form, dispatch_price: e.target.value })} placeholder="0" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Min. Stok Seviyesi</label><input style={inputStyle} type="number" value={form.min_stock_level} onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })} placeholder="0" /></div>
          {addErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {addErr}</div>}
          <button style={{ ...greenBtn, width: "100%", justifyContent: "center", padding: 11 }} onClick={addItem}>Ürünü Ekle</button>
        </Modal>
      )}

      {/* Modal: Sevk Et */}
      {dispatchItem && (
        <Modal title={`${dispatchItem.name} — Sevk Et`} onClose={() => setDispatchItem(null)}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Nereye?</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {branches.map((b) => {
                const sel = destBranchId === b.id; const fr = b.kind === "franchise";
                return (
                  <span key={b.id} onClick={() => setDestBranchId(b.id)} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, background: sel ? C.greenSoft : "#fff", color: sel ? C.greenDark : C.textMuted, border: sel ? `1.5px solid ${C.green}` : "0.5px solid #E0DACE" }}>
                    {b.name} <span style={{ fontSize: 9, color: fr ? C.franchise : C.greenDark, opacity: fr ? 1 : 0.75 }}>{fr ? "Franchise" : "Markaya Ait"}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Miktar ({dispatchItem.unit})</label><input style={inputStyle} type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Bedel (otomatik)</label><div style={{ ...inputStyle, background: C.surface, color: C.textFaint, border: `0.5px solid ${C.border}` }}>{fmtTL(dispTotal)}</div></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Not (opsiyonel)</label><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} /></div>
          {qty && parseFloat(qty) > 0 && (
            <div style={{ fontSize: 11, color: C.warnInk, background: C.warnBg, padding: "9px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <i className="ti ti-info-circle" style={{ fontSize: 13 }} aria-hidden="true" />
              Depo: {fmtNum(dispatchItem.current_stock)} → {fmtNum(dispatchItem.current_stock - parseFloat(qty))} {dispatchItem.unit} · {destBranch?.name || "şube"}'ye +{fmtNum(parseFloat(qty))} {dispatchItem.unit}
            </div>
          )}
          {dispErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {dispErr}</div>}
          <button style={{ ...greenBtn, width: "100%", justifyContent: "center", padding: 11 }} onClick={doDispatch}>Sevkiyatı Onayla</button>
        </Modal>
      )}
    </>
  );
}

// ───────────────────────── SUBE STOKLARI görünümü ─────────────────────────
function BranchStockView({ token, branches, branchesLoaded, initialBranchId, onBack }: { token: string; branches: InvBranch[]; branchesLoaded: boolean; initialBranchId?: string | null; onBack: () => void }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [counts, setCounts] = useState<Record<string, { total: number; critical: number }>>({});
  const [selected, setSelected] = useState<InvBranch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "kg", unit_cost: "", current_stock: "", min_stock_level: "", category_id: "" });
  const [addErr, setAddErr] = useState("");
  const [detail, setDetail] = useState<Product | null>(null);
  const [edit, setEdit] = useState({ name: "", unit_cost: "", current_stock: "", min_stock_level: "", category_id: "" });
  const [editErr, setEditErr] = useState("");
  const [delMode, setDelMode] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [catErr, setCatErr] = useState("");

  const loadCats = async (bid: string) => {
    try { const r = await axios.get(`${API_URL}/inventory/categories/branch/${bid}?t=${Date.now()}`, { headers }); setCats(r.data); } catch { setCats([]); }
  };
  const addCat = async () => {
    setCatErr("");
    if (!newCat.trim() || !selected) return;
    try { await axios.post(`${API_URL}/inventory/categories`, { branch_id: selected.id, name: newCat.trim() }, { headers }); setNewCat(""); await loadCats(selected.id); }
    catch (e: any) { const d = e.response?.data?.detail; setCatErr(typeof d === "string" ? d : "Kategori eklenemedi."); }
  };
  const delCat = async (cid: string) => {
    if (!selected) return;
    try { await axios.delete(`${API_URL}/inventory/categories/${cid}`, { headers }); if (activeCat === cid) setActiveCat("all"); await loadCats(selected.id); await reloadProducts(selected.id); }
    catch {}
  };
  const catName = (cid?: string | null) => cats.find((c) => c.id === cid)?.name;

  const reloadProducts = async (bid: string) => {
    try { const r = await axios.get(`${API_URL}/inventory/products/branch/${bid}?t=${Date.now()}`, { headers }); setProducts(r.data); } catch {}
    loadCounts();
  };
  const addProduct = async () => {
    setAddErr("");
    if (!form.name) { setAddErr("Ürün adı zorunlu."); return; }
    if (!selected) return;
    try {
      await axios.post(`${API_URL}/inventory/products`, {
        branch_id: selected.id, name: form.name, unit: form.unit,
        unit_cost: parseFloat(form.unit_cost) || 0,
        current_stock: parseFloat(form.current_stock) || 0,
        min_stock_level: parseFloat(form.min_stock_level) || 0,
        category_id: form.category_id || null,
      }, { headers });
      setShowAdd(false);
      setForm({ name: "", unit: "kg", unit_cost: "", current_stock: "", min_stock_level: "", category_id: "" });
      await reloadProducts(selected.id);
    } catch (e: any) { const d = e.response?.data?.detail; setAddErr(typeof d === "string" ? d : "Ürün eklenemedi."); }
  };
  const openDetail = (pr: Product) => {
    setDetail(pr);
    setEdit({ name: pr.name, unit_cost: String(pr.unit_cost), current_stock: String(pr.current_stock), min_stock_level: String(pr.min_stock_level), category_id: pr.category_id || "" });
    setEditErr(""); setDelMode(false);
  };
  const saveEdit = async () => {
    setEditErr("");
    try {
      await axios.put(`${API_URL}/inventory/products/${detail!.id}`, {
        name: edit.name, unit_cost: parseFloat(edit.unit_cost) || 0,
        current_stock: parseFloat(edit.current_stock) || 0, min_stock_level: parseFloat(edit.min_stock_level) || 0,
        category_id: edit.category_id || null,
      }, { headers });
      setDetail(null); if (selected) await reloadProducts(selected.id);
    } catch (e: any) { const d = e.response?.data?.detail; setEditErr(typeof d === "string" ? d : "Güncellenemedi."); }
  };
  const delProduct = async () => {
    setEditErr("");
    try { await axios.delete(`${API_URL}/inventory/products/${detail!.id}`, { headers }); setDetail(null); if (selected) await reloadProducts(selected.id); }
    catch (e: any) { const d = e.response?.data?.detail; setEditErr(typeof d === "string" ? d : "Silinemedi."); }
  };

  const inputStyle = { width: "100%", padding: "9px 11px", border: "0.5px solid #E0DACE", borderRadius: 8, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 11, color: C.textFaint, fontWeight: 600, display: "block", marginBottom: 6 };
  const greenBtn = { fontSize: 12, fontWeight: 600, color: "#fff", background: C.green, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 } as const;

  const loadCounts = async () => {
    const c: Record<string, { total: number; critical: number }> = {};
    await Promise.all(branches.map(async (b) => {
      try {
        const r = await axios.get(`${API_URL}/inventory/products/branch/${b.id}`, { headers });
        const crit = r.data.filter((p: Product) => p.current_stock < p.min_stock_level).length;
        c[b.id] = { total: r.data.length, critical: crit };
      } catch { c[b.id] = { total: 0, critical: 0 }; }
    }));
    setCounts(c);
  };
  useEffect(() => { if (branchesLoaded && branches.length) loadCounts(); /* eslint-disable-next-line */ }, [branchesLoaded, branches.length]);
  useEffect(() => {
    if (initialBranchId && branchesLoaded && branches.length && !selected) {
      const t = branches.find((b) => b.id === initialBranchId);
      if (t) selectBranch(t);
    }
    /* eslint-disable-next-line */
  }, [initialBranchId, branchesLoaded, branches.length]);

  const selectBranch = async (b: InvBranch) => {
    setSelected(b); setProdLoading(true); setActiveCat("all"); setSearch("");
    loadCats(b.id);
    try { const r = await axios.get(`${API_URL}/inventory/products/branch/${b.id}?t=${Date.now()}`, { headers }); setProducts(r.data); }
    catch { setProducts([]); }
    setProdLoading(false);
  };

  const isFranchise = selected?.kind === "franchise";
  const stockValue = products.reduce((a, p) => a + (p.current_stock * p.unit_cost), 0);
  const critProducts = products.filter((p) => p.current_stock < p.min_stock_level);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
        <button onClick={onBack} aria-label="Geri" style={{ width: 30, height: 30, borderRadius: 8, border: "0.5px solid #E6E4DD", background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-arrow-left" style={{ fontSize: 16, color: C.textMuted }} aria-hidden="true" /></button>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Şube Stokları</div>
      </div>
      <div style={{ fontSize: 12.5, color: C.textMuted, marginBottom: 18, paddingLeft: 39 }}>Her şubenin stok durumu. Bir şube seç, envanterine in.</div>

      <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.5fr", gap: 18 }}>
        {/* SOL: sube listesi */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Şubeler</div>
          {!branchesLoaded ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : branches.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
              <i className="ti ti-building-off" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Henüz şube yok.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {branches.map((b) => {
                const isSel = selected?.id === b.id; const fr = b.kind === "franchise";
                const cnt = counts[b.id]; const crit = cnt?.critical ?? 0;
                return (
                  <div key={b.id} onClick={() => selectBranch(b)} style={{ background: isSel ? C.bg : C.surface, border: isSel ? `1.5px solid ${C.green}` : `0.5px solid ${C.border}`, borderRadius: 12, padding: "13px 15px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
                      <span style={{ fontSize: 9, color: fr ? C.franchise : C.greenDark, background: fr ? C.franchiseSoft : C.greenSoft, padding: "2px 7px", borderRadius: 8, fontWeight: 600 }}>{fr ? "Franchise" : "Markaya Ait"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {crit > 0 ? (
                        <span style={{ fontSize: 11, color: C.warnInk, background: C.warnBg, padding: "3px 9px", borderRadius: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><i className="ti ti-alert-triangle" style={{ fontSize: 12 }} aria-hidden="true" />Kritik · {crit}</span>
                      ) : (
                        <span style={{ fontSize: 11, color: C.greenDark, background: C.greenSoft, padding: "3px 9px", borderRadius: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><i className="ti ti-circle-check" style={{ fontSize: 12 }} aria-hidden="true" />Normal</span>
                      )}
                      <span style={{ fontSize: 11, color: isSel ? C.greenDark : C.textFaint, display: "flex", alignItems: "center", gap: 3 }}>{cnt?.total ?? "—"} ürün{isSel && <i className="ti ti-chevron-right" style={{ fontSize: 13 }} aria-hidden="true" />}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAG: secili sube detay */}
        <div>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: C.textHint, border: `1px dashed ${C.border}`, borderRadius: 14 }}>
              <i className="ti ti-arrow-left" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Stoğu görmek için bir şube seçin.</span>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 14 }}>
                <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "11px 13px" }}><div style={{ fontSize: 17, fontWeight: 600 }}>{prodLoading ? "—" : products.length}</div><div style={{ fontSize: 10, color: C.textHint, marginTop: 1 }}>toplam ürün</div></div>
                <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "11px 13px" }}><div style={{ fontSize: 17, fontWeight: 600 }}>{prodLoading ? "—" : fmtTL(stockValue)}</div><div style={{ fontSize: 10, color: C.textHint, marginTop: 1 }}>stok değeri</div></div>
                <div style={{ background: critProducts.length > 0 ? C.warnBg : C.surface, border: `0.5px solid ${critProducts.length > 0 ? C.warnBorder : C.border}`, borderRadius: 10, padding: "11px 13px" }}><div style={{ fontSize: 17, fontWeight: 600, color: critProducts.length > 0 ? C.warnInk : C.ink }}>{prodLoading ? "—" : critProducts.length}</div><div style={{ fontSize: 10, color: critProducts.length > 0 ? C.warnInk : C.textHint, marginTop: 1 }}>kritik</div></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name} — Ürünler</span>
                {isFranchise ? (
                  <span style={{ fontSize: 10.5, color: C.franchise, background: C.franchiseSoft, padding: "4px 10px", borderRadius: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-eye" style={{ fontSize: 13 }} aria-hidden="true" />Gözetim</span>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ fontSize: 12, fontWeight: 600, color: C.greenDark, background: C.greenSoft, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }} onClick={() => { setShowCatMgr(true); setCatErr(""); }}><i className="ti ti-folder-plus" style={{ fontSize: 14 }} aria-hidden="true" />Kategori</button>
                    <button style={greenBtn} onClick={() => { setShowAdd(true); setAddErr(""); }}><i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Ürün Ekle</button>
                  </div>
                )}
              </div>

              {!prodLoading && products.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `0.5px solid #E6E4DD`, borderRadius: 9, padding: "8px 12px", marginBottom: 11 }}>
                    <i className="ti ti-search" style={{ fontSize: 15, color: C.textHint }} aria-hidden="true" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün ara…" style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, fontFamily: "inherit", flex: 1, color: C.ink }} />
                    {search && <i className="ti ti-x" onClick={() => setSearch("")} style={{ fontSize: 14, color: C.textHint, cursor: "pointer" }} aria-hidden="true" />}
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 13 }}>
                    {(() => { const allActive = activeCat === "all"; return (
                      <span onClick={() => setActiveCat("all")} style={{ fontSize: 11.5, padding: "5px 13px", borderRadius: 20, background: allActive ? C.ink : C.surface, color: allActive ? "#fff" : C.textMuted, border: allActive ? "none" : `0.5px solid #E6E4DD`, fontWeight: 600, cursor: "pointer" }}>Tümü <span style={{ opacity: 0.6 }}>{products.length}</span></span>
                    ); })()}
                    {cats.map((c) => { const act = activeCat === c.id; const cnt = products.filter((p) => p.category_id === c.id).length; return (
                      <span key={c.id} onClick={() => setActiveCat(c.id)} style={{ fontSize: 11.5, padding: "5px 13px", borderRadius: 20, background: act ? C.ink : C.surface, color: act ? "#fff" : C.textMuted, border: act ? "none" : `0.5px solid #E6E4DD`, fontWeight: act ? 600 : 500, cursor: "pointer" }}>{c.name} <span style={{ color: act ? "rgba(255,255,255,0.6)" : C.textHint }}>{cnt}</span></span>
                    ); })}
                  </div>
                </>
              )}
              {prodLoading ? (
                <div style={{ fontSize: 12.5, color: C.textHint, padding: "20px 0", textAlign: "center" }}>Yükleniyor…</div>
              ) : products.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
                  <i className="ti ti-package-off" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Bu şubede henüz ürün yok.</span>
                </div>
              ) : (
                (() => {
                  const filtered = products.filter((p) => (activeCat === "all" || p.category_id === activeCat) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));
                  if (filtered.length === 0) return (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "30px 0", color: C.textHint }}>
                      <i className="ti ti-search-off" style={{ fontSize: 22 }} aria-hidden="true" /><span style={{ fontSize: 12.5 }}>Eşleşen ürün yok.</span>
                    </div>
                  );
                  return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {filtered.map((p) => {
                    const low = p.current_stock < p.min_stock_level;
                    const cn = catName(p.category_id);
                    return (
                      <div key={p.id} onClick={() => { if (!isFranchise) openDetail(p); }} style={{ background: low ? C.warnSoft : C.bg, border: `0.5px solid ${low ? C.warnBorder : C.border}`, borderRadius: 10, padding: "10px 13px", display: "flex", alignItems: "center", gap: 11, cursor: isFranchise ? "default" : "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: low ? "#FBF0DA" : C.neutralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-package" style={{ fontSize: 16, color: low ? C.warnInk : C.textMuted }} aria-hidden="true" /></div>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>{p.name}{cn && <span style={{ fontSize: 9, color: C.textFaint, background: C.neutralBg, padding: "1px 7px", borderRadius: 7, fontWeight: 500 }}>{cn}</span>}</div><div style={{ fontSize: 10.5, color: C.textFaint }}>{fmtTL(p.unit_cost)} / {p.unit}</div></div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: low ? C.warnInk : C.ink }}>{fmtNum(p.current_stock)} {p.unit}</div>
                          {low ? <div style={{ fontSize: 9.5, color: C.warnInk, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}><i className="ti ti-alert-triangle" style={{ fontSize: 10 }} aria-hidden="true" />min {fmtNum(p.min_stock_level)}</div> : <div style={{ fontSize: 9.5, color: C.textHint }}>min {fmtNum(p.min_stock_level)}</div>}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  ); })()
              )}

              <div style={{ marginTop: 12, padding: "10px 13px", background: "#F4F1FB", border: "0.5px solid #E4DDF6", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <i className="ti ti-info-circle" style={{ fontSize: 14, color: C.franchise }} aria-hidden="true" />
                <span style={{ fontSize: 11, color: "#5B4A99" }}>Şube stoğu merkez depodan sevkle artar. Kritik ürünler için Merkez Depo'dan sevk et.</span>
              </div>
            </>
          )}
        </div>
      </div>

      {showAdd && selected && (
        <Modal title={`${selected.name} — Ürün Ekle`} onClose={() => setShowAdd(false)}>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Ürün Adı *</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Süt" /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim</label>
              <select style={inputStyle} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option><option value="litre">litre</option><option value="adet">adet</option><option value="kutu">kutu</option>
              </select>
            </div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Başlangıç Stoğu</label><input style={inputStyle} type="number" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} placeholder="0" /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim Maliyet (₺)</label><input style={inputStyle} type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} placeholder="0" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Min. Stok Seviyesi</label><input style={inputStyle} type="number" value={form.min_stock_level} onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })} placeholder="0" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Kategori</label>
            <select style={inputStyle} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Kategorisiz</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {addErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {addErr}</div>}
          <button style={{ ...greenBtn, width: "100%", justifyContent: "center", padding: 11 }} onClick={addProduct}>Ürünü Ekle</button>
        </Modal>
      )}

      {detail && (
        <Modal title={`${detail.name} — Düzenle`} onClose={() => setDetail(null)}>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Ürün Adı</label><input style={inputStyle} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Mevcut Stok ({detail.unit})</label><input style={inputStyle} type="number" value={edit.current_stock} onChange={(e) => setEdit({ ...edit, current_stock: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Min. Stok</label><input style={inputStyle} type="number" value={edit.min_stock_level} onChange={(e) => setEdit({ ...edit, min_stock_level: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Birim Maliyet (₺)</label><input style={inputStyle} type="number" value={edit.unit_cost} onChange={(e) => setEdit({ ...edit, unit_cost: e.target.value })} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Kategori</label>
            <select style={inputStyle} value={edit.category_id} onChange={(e) => setEdit({ ...edit, category_id: e.target.value })}>
              <option value="">Kategorisiz</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {delMode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", background: C.dangerBg, borderRadius: 10, border: `0.5px solid ${C.dangerBorder}`, marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, color: C.dangerInk }}>Bu ürünü stoktan kaldırmak istediğine emin misin?</div>
              <button style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: C.dangerInk, border: "none", padding: 10, borderRadius: 8, cursor: "pointer" }} onClick={delProduct}>Kaldırmayı Onayla</button>
            </div>
          )}
          {editErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {editErr}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...greenBtn, flex: 1, justifyContent: "center", padding: 10 }} onClick={saveEdit}>Kaydet</button>
            <button style={{ fontSize: 12, fontWeight: 600, color: C.dangerInk, background: C.dangerBg, border: `0.5px solid ${C.dangerBorder}`, padding: "10px 14px", borderRadius: 8, cursor: "pointer" }} onClick={() => setDelMode(!delMode)}>Kaldır</button>
          </div>
        </Modal>
      )}

      {showCatMgr && selected && (
        <Modal title={`${selected.name} — Kategoriler`} onClose={() => setShowCatMgr(false)}>
          <label style={labelStyle}>Yeni Kategori</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="örn. İçecek, Ambalaj…" onKeyDown={(e) => { if (e.key === "Enter") addCat(); }} />
            <button style={{ ...greenBtn, padding: "9px 16px" }} onClick={addCat}>Ekle</button>
          </div>
          {catErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>⚠ {catErr}</div>}
          {cats.length === 0 ? (
            <div style={{ fontSize: 12.5, color: C.textHint, padding: "16px 0", textAlign: "center" }}>Henüz kategori yok.</div>
          ) : (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {cats.map((c) => (
                <span key={c.id} style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 16, background: C.neutralBg, color: C.textMuted, display: "flex", alignItems: "center", gap: 7 }}>
                  {c.name}
                  <i className="ti ti-x" onClick={() => delCat(c.id)} style={{ fontSize: 12, cursor: "pointer", color: C.textHint }} aria-hidden="true" />
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 14, fontSize: 11, color: C.textHint, lineHeight: 1.5 }}>Kategori silinince o kategorideki ürünler silinmez, sadece kategorisiz kalır.</div>
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
