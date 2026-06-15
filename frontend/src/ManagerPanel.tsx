import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// ============================================================================
// WHITE.AI — Şube Yöneticisi Paneli (Panel: Manager)
// Tek şube odaklı. Manager sadece kendi şubesinin verisini görür.
// Beyaz ağırlıklı + yeşil accent + siyah metin (BrandPanel ile aynı dil).
// ============================================================================

type ManagerUser = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id?: string | null;
  branch_id?: string | null;
};

const API_URL = "http://127.0.0.1:8000/api/v1";

const C = {
  green: "#1FA85A",
  greenDark: "#15803D",
  greenSoft: "#EEF8F2",
  ink: "#111110",
  bg: "#FFFFFF",
  surface: "#FBFBFA",
  border: "#EFEFEC",
  textMuted: "#6B6862",
  textFaint: "#8A867F",
  textHint: "#A6A29B",
  neutralBg: "#F2F1ED",
  warnBg: "#FEF6E7",
  warnInk: "#C68A12",
  dangerInk: "#C0564B",
  dangerBorder: "#F3D9D6",
  dangerBg: "#FDF3F2",
};

const NAV_ITEMS: { id: string; label: string; icon: string }[] = [
  { id: "overview", label: "Genel Bakış", icon: "ti-layout-dashboard" },
  { id: "staff", label: "Personel", icon: "ti-users" },
  { id: "inventory", label: "Envanter", icon: "ti-box" },
  { id: "shifts", label: "Vardiya", icon: "ti-calendar-clock" },
  { id: "payroll", label: "Bordro", icon: "ti-receipt" },
  { id: "finance", label: "Finans", icon: "ti-cash" },
  { id: "ledger", label: "Gelir / Gider", icon: "ti-arrows-exchange" },
  { id: "reports", label: "Raporlar", icon: "ti-chart-bar" },
  { id: "announcements", label: "Duyurular", icon: "ti-bell" },
  { id: "settings", label: "Ayarlar", icon: "ti-settings" },
];

const PAGE_TITLE: Record<string, string> = {
  overview: "Genel Bakış",
  staff: "Personel",
  inventory: "Envanter",
  shifts: "Vardiya",
  payroll: "Bordro",
  finance: "Finans",
  ledger: "Gelir / Gider",
  reports: "Raporlar",
  announcements: "Duyurular",
  settings: "Ayarlar",
};

export default function ManagerPanel({
  user,
  token,
  onLogout,
  branchName,
}: {
  user: ManagerUser;
  token: string;
  onLogout: () => void;
  branchName?: string | null;
}) {
  const [page, setPage] = useState("overview");
  const initials = (user.first_name?.[0] || "") + (user.last_name?.[0] || "");
  const branchId = user.branch_id || "";
  const [subeAdi, setSubeAdi] = useState<string>(branchName || "Şubem");

  useEffect(() => {
    if (!branchId) return;
    axios.get(`${API_URL}/branches/${branchId}?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (r.data?.name) setSubeAdi(r.data.name); })
      .catch(() => {});
  }, [branchId, token]);

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
            <div style={{ fontSize: 11, color: C.textHint }}>Şube Yöneticisi</div>
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
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>{subeAdi}</span>
            <span style={{ fontSize: 11, color: C.textHint, marginTop: 1 }}>{PAGE_TITLE[page]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.green, background: C.greenSoft, padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />Canlı
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
          {page === "overview"
            ? <ManagerOverview token={token} branchId={branchId} firstName={user.first_name} />
            : page === "staff"
            ? <ManagerStaff token={token} branchId={branchId} companyId={user.company_id || ""} branchName={subeAdi} />
            : page === "payroll"
            ? <ManagerBordro token={token} branchId={branchId} branchName={subeAdi} />
            : page === "inventory"
            ? <ManagerEnvanter token={token} branchId={branchId} branchName={subeAdi} />
            : page === "shifts"
            ? <ManagerVardiya token={token} branchId={branchId} branchName={subeAdi} />
            : <Placeholder title={PAGE_TITLE[page]} branchId={branchId} />}
        </div>
      </main>
    </div>
  );
}

// Gecici placeholder — her sayfa ADIM 4'te gercek icerikle doldurulacak.
function Placeholder({ title, branchId }: { title: string; branchId: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", color: C.textHint, gap: 10 }}>
      <i className="ti ti-tools" style={{ fontSize: 32 }} aria-hidden="true" />
      <div style={{ fontSize: 15, fontWeight: 600, color: C.textMuted }}>{title}</div>
      <div style={{ fontSize: 13 }}>Bu sayfa yakında hazır olacak.</div>
      <div style={{ fontSize: 10, color: C.textHint, marginTop: 4 }}>Şube: {branchId ? branchId.slice(0, 8) + "…" : "tanımsız"}</div>
    </div>
  );
}

// ============================================================================
// Manager Genel Bakis — sube nabzi. Tum veriler branch-filtreli endpoint'lerden.
// ============================================================================
function ManagerOverview({ token, branchId, firstName }: { token: string; branchId: string; firstName: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [onDuty, setOnDuty] = useState<{ name: string; sub: string; initials: string }[]>([]);
  const [lowStock, setLowStock] = useState<{ name: string; current: number; min: number }[]>([]);
  const [payrollCost, setPayrollCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Günaydın";
    if (h < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  useEffect(() => {
    if (!branchId) { setLoading(false); return; }
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;

    const tasks = [
      axios.get(`${API_URL}/employees/branch/${branchId}?t=${Date.now()}`, { headers })
        .then((r) => setStaffCount(Array.isArray(r.data) ? r.data.filter((e: any) => e.is_active !== false).length : 0))
        .catch(() => setStaffCount(0)),
      axios.get(`${API_URL}/timeclock/branch/${branchId}/open?t=${Date.now()}`, { headers })
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          setOnDuty(list.slice(0, 5).map((rec: any) => {
            const nm = rec.employee_name || rec.name || "Çalışan";
            const parts = String(nm).split(" ");
            const ini = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
            const t = rec.check_in || rec.clock_in || rec.started_at;
            let saat = "";
            try { if (t) { const d = new Date(t); saat = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} başladı`; } } catch { /* */ }
            return { name: nm, sub: saat || "mesaide", initials: ini.toUpperCase() };
          }));
        })
        .catch(() => setOnDuty([])),
      axios.get(`${API_URL}/inventory/products/branch/${branchId}/low?t=${Date.now()}`, { headers })
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          setLowStock(list.slice(0, 6).map((p: any) => ({
            name: p.name || "Ürün",
            current: p.current_stock ?? p.stock ?? 0,
            min: p.min_stock ?? p.reorder_level ?? 0,
          })));
        })
        .catch(() => setLowStock([])),
      axios.get(`${API_URL}/payroll/branch/${branchId}/${y}/${m}?t=${Date.now()}`, { headers })
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          const total = list.reduce((a: number, row: any) => a + (row.employer_cost || row.employerCost || 0), 0);
          setPayrollCost(total);
        })
        .catch(() => setPayrollCost(null)),
    ];
    Promise.allSettled(tasks).finally(() => setLoading(false));
  }, [branchId, token]);

  const fmtCompact = (n: number) => {
    const a = Math.abs(n);
    if (a >= 1_000_000) return "₺" + (n / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) + "M";
    if (a >= 1_000) return "₺" + Math.round(n / 1_000) + "B";
    return "₺" + Math.round(n);
  };

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: C.ink }}>{greeting()}, {firstName}.</div>
        <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 2 }}>Şubenin bugünü, özetle.</div>
      </div>

      {/* 4 nabiz kart */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11, marginBottom: 14 }}>
        <NabizKart icon="ti-users" iconBg={C.greenSoft} iconColor={C.greenDark} label="Personel" value={loading ? "…" : String(staffCount ?? 0)} sub="aktif çalışan" />
        <NabizKart icon="ti-clock-play" iconBg={C.greenSoft} iconColor={C.greenDark} label="Şu an mesaide" value={loading ? "…" : String(onDuty.length)} sub="açık mesai" />
        <NabizKart icon="ti-alert-triangle" iconBg={C.warnBg} iconColor={C.warnInk} label="Kritik stok" value={loading ? "…" : String(lowStock.length)} sub="düşük seviye ürün" valueColor={lowStock.length > 0 ? C.warnInk : C.ink} />
        <NabizKart icon="ti-receipt" iconBg={C.neutralBg} iconColor="#3C3A36" label="Bu ay bordro" value={loading ? "…" : (payrollCost != null ? fmtCompact(payrollCost) : "—")} sub="işveren maliyeti" />
      </div>

      {/* alt 2 kolon */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* su an mesaide */}
        <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 13, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 13 }}>Şu An Mesaide</div>
          {loading ? (
            <div style={{ fontSize: 12, color: C.textHint, padding: "12px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : onDuty.length === 0 ? (
            <div style={{ fontSize: 12, color: C.textHint, padding: "16px 0", textAlign: "center" }}>Şu an açık mesai yok.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {onDuty.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: C.greenDark }}>{p.initials || "–"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{p.name}</div><div style={{ fontSize: 9.5, color: C.textHint }}>{p.sub}</div></div>
                  <span style={{ fontSize: 9, color: C.greenDark, background: C.greenSoft, padding: "2px 8px", borderRadius: 6 }}>aktif</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* kritik stok */}
        <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 13, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 13 }}>Kritik Stok</div>
          {loading ? (
            <div style={{ fontSize: 12, color: C.textHint, padding: "12px 0", textAlign: "center" }}>Yükleniyor…</div>
          ) : lowStock.length === 0 ? (
            <div style={{ fontSize: 12, color: C.textHint, padding: "16px 0", textAlign: "center" }}>Kritik stok yok, her şey yolunda.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {lowStock.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><i className="ti ti-package" style={{ fontSize: 15, color: C.warnInk }} aria-hidden="true" /><span style={{ fontSize: 12, color: "#3C3A36" }}>{s.name}</span></div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.warnInk }}>{s.current} / {s.min} ↓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function NabizKart({ icon, iconBg, iconColor, label, value, sub, valueColor }: { icon: string; iconBg: string; iconColor: string; label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 13, padding: "15px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}><i className={`ti ${icon}`} style={{ fontSize: 15, color: iconColor }} aria-hidden="true" /></div>
        <span style={{ fontSize: 11, color: C.textFaint }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: valueColor || C.ink }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textHint, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ============================================================================
// Manager Personel — dark hero + gomulu istatistik + departman filtresi +
// mesaide gostergesi + giris sutunu. Tam yetki (ekle/duzenle/cikar), tek sube.
// ============================================================================
type Emp = {
  id: string; first_name: string; last_name: string; email?: string | null;
  phone?: string | null; position?: string | null; department?: string | null;
  base_salary?: number | null; bank_iban?: string | null; contract_type?: string | null;
  is_active: boolean; user_id?: string | null;
};

function ManagerStaff({ token, branchId, companyId, branchName }: { token: string; branchId: string; companyId: string; branchName: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [onDutyIds, setOnDutyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [dept, setDept] = useState<string>("__all__");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  // ekle modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", position: "", department: "", contract_type: "full_time", base_salary: "", bank_iban: "", create_user_account: false, password: "" });
  const [formErr, setFormErr] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const [showNewDept, setShowNewDept] = useState(false);
  const [newDept, setNewDept] = useState("");
  const [extraDepts, setExtraDepts] = useState<string[]>([]);

  // detay/duzenle modal
  const [detail, setDetail] = useState<Emp | null>(null);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ first_name: "", last_name: "", phone: "", position: "", department: "", base_salary: "", bank_iban: "" });
  const [termPw, setTermPw] = useState("");
  const [showTerm, setShowTerm] = useState(false);

  const loadEmployees = async () => {
    if (!branchId) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/employees/branch/${branchId}?t=${Date.now()}`, { headers });
      setEmployees(Array.isArray(r.data) ? r.data : []);
    } catch { setEmployees([]); }
    // mesaide olanlar (acik mesai)
    try {
      const o = await axios.get(`${API_URL}/timeclock/branch/${branchId}/open?t=${Date.now()}`, { headers });
      const ids = new Set<string>((Array.isArray(o.data) ? o.data : []).map((r: any) => r.employee_id).filter(Boolean));
      setOnDutyIds(ids);
    } catch { setOnDutyIds(new Set()); }
    setLoading(false);
  };
  useEffect(() => { loadEmployees(); /* eslint-disable-next-line */ }, [branchId, token]);

  const addEmployee = async () => {
    setFormErr("");
    if (!form.first_name || !form.last_name) { setFormErr("Ad ve soyad zorunlu."); return; }
    if (!form.email) { setFormErr("E-posta zorunlu (çalışan panele giriş için)."); return; }
    if (!form.password || form.password.length < 8) { setFormErr("Şifre en az 8 karakter olmalı."); return; }
    try {
      const payload: any = { first_name: form.first_name, last_name: form.last_name, contract_type: form.contract_type, company_id: companyId, branch_id: branchId, email: form.email, create_user_account: true, password: form.password, role: "employee" };
      if (form.phone) payload.phone = form.phone;
      if (form.position) payload.position = form.position;
      if (form.department) payload.department = form.department;
      if (form.base_salary) payload.base_salary = parseFloat(form.base_salary) || 0;
      if (form.bank_iban) payload.bank_iban = form.bank_iban.trim();
      await axios.post(`${API_URL}/employees`, payload, { headers });
      setShowAdd(false);
      setForm({ first_name: "", last_name: "", email: "", phone: "", position: "", department: "", contract_type: "full_time", base_salary: "", bank_iban: "", create_user_account: false, password: "" });
      await loadEmployees();
    } catch (e: any) { setFormErr(e.response?.data?.detail || "Eklenemedi."); }
  };

  const openDetail = (emp: Emp) => {
    setDetail(emp); setEditing(false); setMsg(""); setShowTerm(false); setTermPw("");
    setEdit({ first_name: emp.first_name || "", last_name: emp.last_name || "", phone: emp.phone || "", position: emp.position || "", department: emp.department || "", base_salary: emp.base_salary != null ? String(emp.base_salary) : "", bank_iban: emp.bank_iban || "" });
  };

  const saveEdit = async () => {
    setMsg("");
    if (!edit.first_name || !edit.last_name) { setMsg("Ad ve soyad zorunlu."); return; }
    try {
      const epayload: any = { first_name: edit.first_name, last_name: edit.last_name };
      if (edit.phone) epayload.phone = edit.phone;
      if (edit.position) epayload.position = edit.position;
      if (edit.department) epayload.department = edit.department;
      if (edit.base_salary) epayload.base_salary = parseFloat(edit.base_salary) || 0;
      if (edit.bank_iban) epayload.bank_iban = edit.bank_iban.trim();
      await axios.put(`${API_URL}/employees/${detail!.id}`, epayload, { headers });
      setEditing(false);
      await loadEmployees();
      setDetail({ ...detail!, ...epayload });
    } catch (e: any) { setMsg(e.response?.data?.detail || "Güncellenemedi."); }
  };

  const terminate = async () => {
    setMsg("");
    if (!termPw) { setMsg("Onaylamak için şifren zorunlu."); return; }
    try {
      await axios.delete(`${API_URL}/employees/${detail!.id}/terminate`, { headers, data: { admin_password: termPw } });
      setDetail(null); setTermPw(""); setShowTerm(false);
      await loadEmployees();
    } catch (e: any) {
      const d = e.response?.data?.detail;
      setMsg(typeof d === "string" ? d : "İşten çıkarılamadı.");
    }
  };

  const reactivate = async (emp: Emp) => {
    try { await axios.put(`${API_URL}/employees/${emp.id}/reactivate`, {}, { headers }); await loadEmployees(); }
    catch { /* */ }
  };

  const fmtMoney = (n?: number | null) => n != null ? "₺" + Number(n).toLocaleString("tr-TR") : "—";
  const hasLogin = (e: Emp) => !!e.user_id;

  // istatistikler
  const activeAll = employees.filter((e) => e.is_active !== false);
  const totalCount = employees.length;
  const activeCount = activeAll.length;
  const onDutyCount = activeAll.filter((e) => onDutyIds.has(e.id)).length;
  const loginCount = activeAll.filter(hasLogin).length;
  const payrollTotal = activeAll.reduce((a, e) => a + (e.base_salary || 0), 0);

  // departman listesi (dinamik)
  const deptMap = new Map<string, number>();
  activeAll.forEach((e) => {
    const d = (e.department && e.department.trim()) ? e.department.trim() : "__none__";
    deptMap.set(d, (deptMap.get(d) || 0) + 1);
  });
  const deptChips = Array.from(deptMap.entries());
  // dropdown icin: mevcut departmanlar (calisanlardan) + bu oturumda eklenenler
  const allDepts = Array.from(new Set([
    ...employees.map((e) => (e.department || "").trim()).filter(Boolean),
    ...extraDepts,
  ]));

  // filtre
  const filtered = employees.filter((e) => {
    const okTab = tab === "active" ? e.is_active !== false : e.is_active === false;
    const eDept = (e.department && e.department.trim()) ? e.department.trim() : "__none__";
    const okDept = dept === "__all__" || eDept === dept;
    const q = search.trim().toLowerCase();
    const okSearch = !q || `${e.first_name} ${e.last_name} ${e.position || ""}`.toLowerCase().includes(q);
    return okTab && okDept && okSearch;
  });

  const labelStyle: any = { display: "block", fontSize: 11, color: C.textMuted, marginBottom: 5, fontWeight: 500 };
  const inputStyle: any = { width: "100%", padding: "8px 11px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff", color: C.ink };
  const cols = "1.6fr 1fr 1fr 0.9fr 0.8fr 56px";

  return (
    <>
      {/* === DARK HERO === */}
      <div style={{ background: "#0A0A0A", borderRadius: 13, padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(34,197,94,0.13)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-users" style={{ fontSize: 22, color: "#2EE06A" }} aria-hidden="true" /></div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Personel</div>
              <div style={{ fontSize: 12.5, color: "#2EE06A", marginTop: 1 }}>{branchName} ekibi</div>
            </div>
          </div>
          <button onClick={() => { setShowAdd(true); setFormErr(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#22C55E", color: "#0A0A0A", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><i className="ti ti-plus" style={{ fontSize: 16 }} aria-hidden="true" />Personel ekle</button>
        </div>
      </div>

      {/* === ISTATISTIK KARTLARI (3 beyaz + 1 siyah bordro) === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        <StatCard label="Toplam" value={String(totalCount)} />
        <StatCard label="Aktif" value={String(activeCount)} green />
        <StatCard label="Şu an mesaide" value={String(onDutyCount)} />
        <StatCard label="Aylık bordro" value={"₺" + payrollTotal.toLocaleString("tr-TR")} dark />
      </div>

      {/* === DEPARTMAN FILTRESI === */}
      <div style={{ display: "flex", gap: 7, marginBottom: 13, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#2EE06A", background: "#0A0A0A", padding: "6px 12px", borderRadius: 20 }}>Departman</span>
        <DeptChip label="Tümü" count={activeAll.length} active={dept === "__all__"} onClick={() => setDept("__all__")} />
        {deptChips.map(([d, n]) => (
          <DeptChip key={d} label={d === "__none__" ? "Atanmamış" : d} count={n} active={dept === d} onClick={() => setDept(d)} />
        ))}
      </div>

      {/* === ARAMA + AKTIF/AYRILAN === */}
      <div style={{ display: "flex", gap: 9, marginBottom: 13 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, padding: "9px 12px" }}>
          <i className="ti ti-search" style={{ fontSize: 15, color: C.textHint }} aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="İsim veya pozisyon ara…" style={{ border: "none", outline: "none", fontSize: 12.5, flex: 1, background: "transparent", color: C.ink }} />
        </div>
        <div style={{ display: "inline-flex", gap: 2, background: C.neutralBg, borderRadius: 9, padding: 3 }}>
          {(["active", "inactive"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 14px", fontSize: 12, fontWeight: tab === t ? 600 : 400, color: tab === t ? C.ink : C.textFaint, background: tab === t ? "#fff" : "transparent", border: "none", borderRadius: 7, cursor: "pointer" }}>{t === "active" ? "Aktif" : "Ayrılan"}</button>
          ))}
        </div>
      </div>

      {/* === TABLO === */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>{tab === "active" ? "Bu filtrede çalışan yok." : "Ayrılan çalışan yok."}</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 11, padding: "0 14px 9px", fontSize: 10, color: C.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <span>çalışan</span><span>pozisyon</span><span>departman</span><span>maaş</span><span>çalışma</span><span style={{ textAlign: "center" }}>işlem</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {filtered.map((e) => {
              const ini = ((e.first_name?.[0] || "") + (e.last_name?.[0] || "")).toUpperCase();
              const onDuty = onDutyIds.has(e.id);
              const inactive = e.is_active === false;
              return (
                <div key={e.id} style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderLeft: onDuty ? "2.5px solid #22C55E" : `0.5px solid ${C.border}`, borderRadius: 11, padding: "11px 14px", display: "grid", gridTemplateColumns: cols, gap: 11, alignItems: "center", opacity: inactive ? 0.6 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: inactive ? C.neutralBg : C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: inactive ? C.textHint : C.greenDark }}>{ini || "–"}</div>
                      {onDuty && <span style={{ position: "absolute", right: -1, bottom: -1, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: "2px solid #fff" }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, textDecoration: inactive ? "line-through" : "none" }}>{e.first_name} {e.last_name}</div>
                      <div style={{ fontSize: 10.5, color: C.textHint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.email || "—"}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, color: inactive ? C.textFaint : "#3C3A36" }}>{e.position || "—"}</span>
                  <span>{e.department ? <span style={{ fontSize: 11, color: "#3C3A36", background: C.neutralBg, padding: "3px 9px", borderRadius: 6 }}>{e.department}</span> : <span style={{ fontSize: 11, color: C.textHint }}>—</span>}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: inactive ? C.textFaint : C.ink }}>{fmtMoney(e.base_salary)}</span>
                  <span>{e.contract_type === "part_time"
                    ? <span style={{ fontSize: 11, color: "#854F0B", background: "#FAEEDA", padding: "3px 10px", borderRadius: 6 }}>Yarı Zamanlı</span>
                    : <span style={{ fontSize: 11, color: C.greenDark, background: C.greenSoft, padding: "3px 10px", borderRadius: 6 }}>Tam Zamanlı</span>}</span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {inactive
                      ? <button onClick={() => reactivate(e)} title="Geri al" style={{ width: 29, height: 29, borderRadius: 7, border: `0.5px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-rotate" style={{ fontSize: 14, color: C.textMuted }} aria-hidden="true" /></button>
                      : <button onClick={() => openDetail(e)} title="Düzenle" style={{ width: 29, height: 29, borderRadius: 7, border: `0.5px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-pencil" style={{ fontSize: 14, color: C.textMuted }} aria-hidden="true" /></button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* bilgi serit */}
      <div style={{ marginTop: 18, padding: "11px 14px", background: C.neutralBg, borderRadius: 9, display: "flex", alignItems: "center", gap: 9 }}>
        <i className="ti ti-circle-filled" style={{ fontSize: 9, color: "#22C55E" }} aria-hidden="true" />
        <span style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>Yeşil nokta <span style={{ color: C.greenDark, fontWeight: 600 }}>şu an mesaide</span> demek. <span style={{ color: C.greenDark, fontWeight: 600 }}>Giriş hesaplı</span> çalışanlar mobil panele girebilir. Çıkarma şifre onayı ister.</span>
      </div>

      {/* === EKLE MODAL === */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Yeni Personel">
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Ad *</label><input style={inputStyle} value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Soyad *</label><input style={inputStyle} value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Telefon</label><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Pozisyon</label><input style={inputStyle} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
            <div style={{ flex: 1, position: "relative" }}>
              <label style={labelStyle}>Departman</label>
              <div onClick={() => setDeptOpen(!deptOpen)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderColor: deptOpen ? C.green : C.border }}>
                <span style={{ color: form.department ? C.ink : C.textHint }}>{form.department || "Seç…"}</span>
                <i className="ti ti-chevron-down" style={{ fontSize: 15, color: C.textMuted }} aria-hidden="true" />
              </div>
              {deptOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: 5, zIndex: 20, maxHeight: 200, overflowY: "auto" }}>
                  {allDepts.length === 0 && !showNewDept && <div style={{ padding: "8px 10px", fontSize: 11.5, color: C.textHint }}>Henüz departman yok.</div>}
                  {allDepts.map((d) => (
                    <div key={d} onClick={() => { setForm({ ...form, department: d }); setDeptOpen(false); }} style={{ padding: "8px 10px", fontSize: 12.5, color: C.ink, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: form.department === d ? C.greenSoft : "transparent" }}>
                      <span>{d}</span>{form.department === d && <i className="ti ti-check" style={{ fontSize: 14, color: C.greenDark }} aria-hidden="true" />}
                    </div>
                  ))}
                  <div style={{ height: "0.5px", background: C.border, margin: "5px 0" }} />
                  <div onClick={() => { setShowNewDept(true); setDeptOpen(false); }} style={{ padding: "8px 10px", fontSize: 12.5, color: C.greenDark, fontWeight: 600, borderRadius: 6, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                    <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Yeni departman ekle
                  </div>
                </div>
              )}
            </div>
          </div>
          {showNewDept && (
            <div style={{ background: C.neutralBg, borderRadius: 9, padding: "11px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 7, fontWeight: 500 }}>Yeni departman adı</div>
              <div style={{ display: "flex", gap: 7 }}>
                <input value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="Örn. Temizlik" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => { const d = newDept.trim(); if (d) { setExtraDepts([...extraDepts, d]); setForm({ ...form, department: d }); setNewDept(""); setShowNewDept(false); } }} style={{ background: "#22C55E", color: "#0A0A0A", border: "none", borderRadius: 8, padding: "0 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Ekle</button>
                <button onClick={() => { setShowNewDept(false); setNewDept(""); }} style={{ background: "#fff", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 12px", fontSize: 12.5, cursor: "pointer" }}>İptal</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Brüt Maaş</label><input style={inputStyle} value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} placeholder="45000" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Çalışma Tipi</label>
              <select style={inputStyle} value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })}>
                <option value="full_time">Tam Zamanlı</option>
                <option value="part_time">Yarı Zamanlı</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>IBAN</label><input style={inputStyle} value={form.bank_iban} onChange={(e) => setForm({ ...form, bank_iban: e.target.value })} placeholder="TR.." /></div>
          <div style={{ marginBottom: 14, padding: 13, background: C.neutralBg, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <i className="ti ti-device-mobile" style={{ fontSize: 15, color: C.greenDark }} aria-hidden="true" />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>Panel giriş bilgileri</span>
            </div>
            <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 12, lineHeight: 1.5 }}>Her çalışan kendi paneline girip vardiya, izin ve check-in işlemlerini yapar. Bu yüzden e-posta ve şifre zorunludur.</div>
            <div style={{ marginBottom: 11 }}><label style={labelStyle}>E-posta (giriş) *</label><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="calisan@ornek.com" /></div>
            <label style={labelStyle}>Geçici Şifre * (en az 8 karakter)</label>
            <input style={inputStyle} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Çalışan sonra değiştirir" />
          </div>
          {formErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{formErr}</div>}
          <button style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={addEmployee}>Personel Ekle</button>
        </Modal>
      )}

      {/* === DETAY / DUZENLE MODAL === */}
      {detail && (
        <Modal onClose={() => { setDetail(null); setEditing(false); }} title={editing ? "Personeli Düzenle" : `${detail.first_name} ${detail.last_name}`}>
          {!editing ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
                <DetailRow label="Pozisyon" value={detail.position || "—"} />
                <DetailRow label="Departman" value={detail.department || "—"} />
                <DetailRow label="Brüt Maaş" value={fmtMoney(detail.base_salary)} />
                <DetailRow label="E-posta" value={detail.email || "—"} />
                <DetailRow label="Telefon" value={detail.phone || "—"} />
                <DetailRow label="IBAN" value={detail.bank_iban || "—"} />
                <DetailRow label="Giriş hesabı" value={hasLogin(detail) ? "Var (mobil panele girebilir)" : "Yok"} />
              </div>
              {msg && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{msg}</div>}
              {!showTerm ? (
                <div style={{ display: "flex", gap: 9 }}>
                  <button style={{ flex: 1, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={() => setEditing(true)}><i className="ti ti-pencil" style={{ fontSize: 14 }} aria-hidden="true" />Düzenle</button>
                  <button style={{ flex: 1, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: C.dangerInk, border: `1px solid ${C.dangerBorder}`, borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={() => setShowTerm(true)}><i className="ti ti-user-off" style={{ fontSize: 14 }} aria-hidden="true" />İşten Çıkar</button>
                </div>
              ) : (
                <div style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.dangerInk, marginBottom: 8 }}>İşten çıkarmayı onayla</div>
                  <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 10 }}>Bu işlem için şifreni gir. Çalışan pasife alınır.</div>
                  <input style={{ ...inputStyle, marginBottom: 10 }} type="password" value={termPw} onChange={(e) => setTermPw(e.target.value)} placeholder="Şifren" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, background: C.dangerInk, color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={terminate}>Onayla ve Çıkar</button>
                    <button style={{ flex: 1, background: "#fff", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px", fontSize: 12.5, cursor: "pointer" }} onClick={() => { setShowTerm(false); setTermPw(""); setMsg(""); }}>Vazgeç</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ad *</label><input style={inputStyle} value={edit.first_name} onChange={(e) => setEdit({ ...edit, first_name: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Soyad *</label><input style={inputStyle} value={edit.last_name} onChange={(e) => setEdit({ ...edit, last_name: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Pozisyon</label><input style={inputStyle} value={edit.position} onChange={(e) => setEdit({ ...edit, position: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Departman</label><input style={inputStyle} value={edit.department} onChange={(e) => setEdit({ ...edit, department: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Brüt Maaş</label><input style={inputStyle} value={edit.base_salary} onChange={(e) => setEdit({ ...edit, base_salary: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Telefon</label><input style={inputStyle} value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>IBAN</label><input style={inputStyle} value={edit.bank_iban} onChange={(e) => setEdit({ ...edit, bank_iban: e.target.value })} /></div>
              {msg && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{msg}</div>}
              <div style={{ display: "flex", gap: 9 }}>
                <button style={{ flex: 1, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={saveEdit}>Kaydet</button>
                <button style={{ flex: 1, justifyContent: "center", background: "#fff", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 16px", fontSize: 12.5, cursor: "pointer" }} onClick={() => { setEditing(false); setMsg(""); }}>Vazgeç</button>
              </div>
            </>
          )}
        </Modal>
      )}

    </>
  );
}

function StatCard({ label, value, green, dark }: { label: string; value: string; green?: boolean; dark?: boolean }) {
  if (dark) {
    return (
      <div style={{ background: "#0A0A0A", borderRadius: 11, padding: "14px 16px" }}>
        <div style={{ fontSize: 11.5, color: "#2EE06A" }}>{label}</div>
        <div style={{ fontSize: 23, fontWeight: 700, color: "#fff", marginTop: 3 }}>{value}</div>
      </div>
    );
  }
  return (
    <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 11, padding: "14px 16px" }}>
      <div style={{ fontSize: 11.5, color: C.textFaint }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 700, color: green ? "#1FA85A" : C.ink, marginTop: 3 }}>{value}</div>
    </div>
  );
}

function DeptChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 13px", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#3C3A36", background: active ? "#1FA85A" : "#fff", border: active ? "none" : `0.5px solid ${C.border}`, borderRadius: 20, cursor: "pointer" }}>
      {label} <span style={{ color: active ? "rgba(255,255,255,0.75)" : C.textHint }}>{count}</span>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
      <span style={{ color: C.textFaint }}>{label}</span>
      <span style={{ color: C.ink, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ============================================================================
// Manager Bordro — ay nav + siyah ozet + tablo (tiklanabilir) +
// sol sube-toplam bar (sabit) + sag secili-kisi donut. Tek sube, izolasyonlu.
// ============================================================================
type Payslip = {
  id: string; employee_id: string; year: number; month: number; sgk_days: number;
  full_monthly_gross: number; gross: number; sgk_base: number; sgk_employee: number;
  unemployment_employee: number; income_tax_base: number; cumulative_base_before: number;
  cumulative_base_after: number; income_tax_gross: number; income_tax_exemption: number;
  income_tax_net: number; stamp_tax_gross: number; stamp_tax_exemption: number;
  stamp_tax_net: number; net_salary: number; sgk_employer: number;
  unemployment_employer: number; employer_cost: number;
};
type Row = {
  employee_id: string; first_name: string; last_name: string;
  position?: string | null; base_salary?: number | null; payslip?: Payslip | null;
};

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function ManagerBordro({ token, branchId, branchName }: { token: string; branchId: string; branchName: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<string | null>(null); // secili employee_id (donut icin)
  const [err, setErr] = useState("");

  const load = async () => {
    if (!branchId) { setLoading(false); return; }
    setLoading(true); setErr("");
    try {
      const r = await axios.get(`${API_URL}/payroll/branch/${branchId}/${year}/${month}?t=${Date.now()}`, { headers });
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (e: any) { setRows([]); setErr(e.response?.data?.detail || "Bordro yüklenemedi."); }
    setLoading(false);
    setSelected(null);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [branchId, token, year, month]);

  const runPayroll = async () => {
    setRunning(true); setErr("");
    try {
      await axios.post(`${API_URL}/payroll/run-branch`, { branch_id: branchId, year, month }, { headers });
      await load();
    } catch (e: any) { setErr(e.response?.data?.detail || "Bordro hesaplanamadı."); }
    setRunning(false);
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextLocked = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
  const nextMonth = () => { if (nextLocked) return; if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const fmt = (n?: number | null) => n != null ? "₺" + Math.round(n).toLocaleString("tr-TR") : "—";

  const slips = rows.map((r) => r.payslip).filter(Boolean) as Payslip[];
  const sumEmployer = slips.reduce((a, p) => a + (p.employer_cost || 0), 0);
  const sumGross = slips.reduce((a, p) => a + (p.gross || 0), 0);
  const sumNet = slips.reduce((a, p) => a + (p.net_salary || 0), 0);
  const sumSgk = slips.reduce((a, p) => a + (p.sgk_employee || 0) + (p.unemployment_employee || 0), 0);
  const sumIncome = slips.reduce((a, p) => a + (p.income_tax_net || 0), 0);
  const sumStamp = slips.reduce((a, p) => a + (p.stamp_tax_net || 0), 0);
  const sumState = sumSgk + sumIncome + sumStamp;

  // sol grafik: sube toplam 5 kalem
  const barData = [
    { name: "Brüt", value: Math.round(sumGross), color: "#0A0A0A" },
    { name: "Net", value: Math.round(sumNet), color: "#22C55E" },
    { name: "SGK+İşsz.", value: Math.round(sumSgk), color: "#185FA5" },
    { name: "Gelir V.", value: Math.round(sumIncome), color: "#C68A12" },
    { name: "Damga V.", value: Math.round(sumStamp), color: "#A6A29B" },
  ];

  // sag grafik: secili kisi varsa onun, yoksa sube geneli
  const selRow = selected ? rows.find((r) => r.employee_id === selected) : null;
  const selSlip = selRow?.payslip || null;
  const donutSource = selSlip
    ? { net: selSlip.net_salary, sgk: (selSlip.sgk_employee + selSlip.unemployment_employee), income: selSlip.income_tax_net, stamp: selSlip.stamp_tax_net, gross: selSlip.gross }
    : { net: sumNet, sgk: sumSgk, income: sumIncome, stamp: sumStamp, gross: sumGross };
  const donutData = [
    { name: "Net maaş", value: Math.round(donutSource.net), color: "#22C55E" },
    { name: "SGK + işsizlik", value: Math.round(donutSource.sgk), color: "#185FA5" },
    { name: "Gelir vergisi", value: Math.round(donutSource.income), color: "#C68A12" },
    { name: "Damga vergisi", value: Math.round(donutSource.stamp), color: "#A6A29B" },
  ].filter((d) => d.value > 0);
  const netPct = donutSource.gross > 0 ? Math.round((donutSource.net / donutSource.gross) * 100) : 0;
  const donutTitle = selRow ? `${selRow.first_name} ${selRow.last_name} · kırılım` : "Brüt nereye gidiyor?";

  const calcCount = slips.length;
  const totalCount = rows.length;

  return (
    <>
      <div style={{ background: "#0A0A0A", borderRadius: 13, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(34,197,94,0.13)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-receipt" style={{ fontSize: 22, color: "#2EE06A" }} aria-hidden="true" /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Bordro</div>
            <div style={{ fontSize: 12.5, color: "#2EE06A", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{branchName} · maaş hesaplaması</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, background: "rgba(255,255,255,0.08)", borderRadius: 9, padding: "6px 12px" }}>
            <i className="ti ti-chevron-left" style={{ fontSize: 16, color: "#fff", cursor: "pointer" }} onClick={prevMonth} aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", minWidth: 96, textAlign: "center" }}>{AYLAR[month - 1]} {year}</span>
            <i className="ti ti-chevron-right" style={{ fontSize: 16, color: nextLocked ? "#5A5A57" : "#fff", cursor: nextLocked ? "not-allowed" : "pointer" }} onClick={nextMonth} aria-hidden="true" />
          </div>
          <button onClick={runPayroll} disabled={running || totalCount === 0} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: running || totalCount === 0 ? "rgba(255,255,255,0.1)" : "#22C55E", color: running || totalCount === 0 ? "#7A7A78" : "#0A0A0A", border: "none", borderRadius: 9, padding: "9px 15px", fontSize: 12.5, fontWeight: 700, cursor: running || totalCount === 0 ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            <i className="ti ti-calculator" style={{ fontSize: 16 }} aria-hidden="true" />{running ? "Hesaplanıyor…" : "Bordroyu hesapla"}
          </button>
        </div>
      </div>

      <div style={{ background: "#0A0A0A", borderRadius: 13, padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
          <OzetHucre label="İşveren maliyeti" value={fmt(sumEmployer)} />
          <OzetHucre label="Toplam brüt" value={fmt(sumGross)} />
          <OzetHucre label="Toplam net" value={fmt(sumNet)} green />
          <OzetHucre label="Devlete giden" value={fmt(sumState)} />
        </div>
      </div>

      {err && <div style={{ fontSize: 12.5, color: C.dangerInk, marginBottom: 12, padding: "10px 14px", background: C.dangerBg, borderRadius: 9 }}>{err}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>Yükleniyor…</div>
      ) : totalCount === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>Bu şubede aktif çalışan yok.</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 0.9fr", gap: 11, padding: "0 14px 9px", fontSize: 10, color: C.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <span>çalışan</span><span>brüt</span><span>kesinti</span><span>net</span><span>durum</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
            {rows.map((r) => {
              const ini = ((r.first_name?.[0] || "") + (r.last_name?.[0] || "")).toUpperCase();
              const p = r.payslip;
              const kesinti = p ? (p.gross - p.net_salary) : null;
              const isSel = selected === r.employee_id;
              return (
                <div key={r.employee_id} onClick={() => p && setSelected(isSel ? null : r.employee_id)} style={{ background: "#fff", border: isSel ? "1.5px solid #22C55E" : `0.5px solid ${C.border}`, borderRadius: 11, padding: "12px 14px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 0.9fr", gap: 11, alignItems: "center", cursor: p ? "pointer" : "default" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: p ? C.greenSoft : C.neutralBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: p ? C.greenDark : C.textHint, flexShrink: 0 }}>{ini || "–"}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{r.first_name} {r.last_name}</div>
                      <div style={{ fontSize: 10.5, color: C.textHint }}>{r.position || "—"}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, color: p ? C.ink : C.textHint }}>{p ? fmt(p.gross) : fmt(r.base_salary)}</span>
                  <span style={{ fontSize: 12.5, color: kesinti != null ? C.dangerInk : C.textHint }}>{kesinti != null ? "−" + fmt(kesinti) : "—"}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: p ? C.greenDark : C.textHint }}>{p ? fmt(p.net_salary) : "—"}</span>
                  <span>{p
                    ? <span style={{ fontSize: 10, fontWeight: 600, color: C.greenDark, background: C.greenSoft, padding: "3px 8px", borderRadius: 6 }}>Hesaplandı</span>
                    : <span style={{ fontSize: 10, fontWeight: 600, color: C.warnInk, background: C.warnBg, padding: "3px 8px", borderRadius: 6 }}>Bekliyor</span>}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* === IKI GRAFIK === */}
      {calcCount > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
          {/* SOL: sube toplam 5 sutun */}
          <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 13, padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 3 }}>Şube toplam kalemler</div>
            <div style={{ fontSize: 11.5, color: C.textFaint, marginBottom: 16 }}>{AYLAR[month - 1]} {year} · tüm ekip toplamı</div>
            <div style={{ width: "100%", height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 6, right: 6, bottom: 6, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F1ED" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#6B6862" }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 9, fill: "#A6A29B" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? (v / 1000) + "B" : String(v)} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SAG: secili kisi / sube donut */}
          <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 13, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{donutTitle}</div>
              {selRow && <span onClick={() => setSelected(null)} style={{ fontSize: 10.5, color: C.greenDark, background: C.greenSoft, padding: "3px 9px", borderRadius: 6, cursor: "pointer" }}>↩ Tüm şube</span>}
            </div>
            <div style={{ fontSize: 11.5, color: C.textFaint, marginBottom: 16 }}>{fmt(donutSource.gross)} brüt</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 128, height: 128 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270} stroke="none">
                      {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.textFaint }}>Net</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>%{netPct}</div>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
                {donutData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                      <span style={{ fontSize: 11.5, color: "#3C3A36" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: C.ink }}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, padding: "11px 14px", background: C.neutralBg, borderRadius: 9, display: "flex", alignItems: "center", gap: 9 }}>
        <i className="ti ti-pointer" style={{ fontSize: 14, color: C.textMuted, flexShrink: 0 }} aria-hidden="true" />
        <span style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>Tablodan bir çalışana tıkla → sağdaki donut o kişinin kırılımı. <span style={{ color: C.greenDark, fontWeight: 600 }}>Tüm şube</span> ile geneli gör. <span style={{ color: C.greenDark, fontWeight: 600 }}>Bordroyu hesapla</span> ile bekleyenleri işle.</span>
      </div>
    </>
  );
}

function OzetHucre({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ background: "#0A0A0A", padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "#7A7A78" }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, color: green ? "#2EE06A" : "#fff", marginTop: 3 }}>{value}</div>
    </div>
  );
}

function BordroBarTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: "#0A0A0A", color: "#fff", borderRadius: 8, padding: "7px 11px", fontSize: 11.5 }}>
      <div style={{ color: "#9CA3AF", marginBottom: 2 }}>{p.payload.name}</div>
      <div style={{ fontWeight: 700 }}>₺{Math.round(p.value).toLocaleString("tr-TR")}</div>
    </div>
  );
}


// ============================================================================
// Manager Envanter — sube stok yonetimi. Urun listesi (stok seviyeli),
// kritik stok uyarisi, urun ekle/duzenle/sil, satir-ici +/- stok hareketi.
// Merkez depo/sevkiyat YOK (o owner isi). Tek sube, izolasyonlu.
// ============================================================================
type Category = { id: string; name: string };
type Product = {
  id: string; branch_id: string; name: string; unit: string;
  unit_cost: number; current_stock: number; min_stock_level: number;
  is_active: boolean; category_id?: string | null; supplier_id?: string | null;
};

const HAREKET = [
  { type: "purchase", label: "Alış / Giriş", dir: "+" },
  { type: "usage", label: "Kullanım / Servis", dir: "−" },
  { type: "waste", label: "Fire / Bozulma", dir: "−" },
  { type: "adjustment", label: "Manuel Düzeltme", dir: "±" },
];

function ManagerEnvanter({ token, branchId, branchName }: { token: string; branchId: string; branchName: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>("__all__");
  const [search, setSearch] = useState("");

  // urun ekle modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "adet", unit_cost: "", current_stock: "", min_stock_level: "", category_id: "" });
  const [formErr, setFormErr] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCat, setNewCat] = useState("");

  // duzenle / hareket modal
  const [edit, setEdit] = useState<Product | null>(null);
  const [move, setMove] = useState<{ product: Product; dir: "+" | "-" } | null>(null);
  const [moveForm, setMoveForm] = useState({ type: "purchase", quantity: "", unit_cost: "", notes: "" });
  const [moveErr, setMoveErr] = useState("");

  const load = async () => {
    if (!branchId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([
        axios.get(`${API_URL}/inventory/products/branch/${branchId}?t=${Date.now()}`, { headers }),
        axios.get(`${API_URL}/inventory/categories/branch/${branchId}?t=${Date.now()}`, { headers }),
      ]);
      setProducts(Array.isArray(pr.data) ? pr.data : []);
      setCategories(Array.isArray(cr.data) ? cr.data : []);
    } catch { setProducts([]); setCategories([]); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [branchId, token]);

  const catName = (id?: string | null) => categories.find((c) => c.id === id)?.name || null;

  const addProduct = async () => {
    setFormErr("");
    if (!form.name.trim()) { setFormErr("Ürün adı zorunlu."); return; }
    try {
      const payload: any = {
        branch_id: branchId, name: form.name.trim(), unit: form.unit,
        unit_cost: parseFloat(form.unit_cost) || 0,
        current_stock: parseFloat(form.current_stock) || 0,
        min_stock_level: parseFloat(form.min_stock_level) || 0,
      };
      if (form.category_id) payload.category_id = form.category_id;
      await axios.post(`${API_URL}/inventory/products`, payload, { headers });
      setShowAdd(false);
      setForm({ name: "", unit: "adet", unit_cost: "", current_stock: "", min_stock_level: "", category_id: "" });
      await load();
    } catch (e: any) { setFormErr(e.response?.data?.detail || "Eklenemedi."); }
  };

  const addCategory = async () => {
    const n = newCat.trim();
    if (!n) return;
    try {
      const r = await axios.post(`${API_URL}/inventory/categories`, { branch_id: branchId, name: n }, { headers });
      setCategories([...categories, r.data]);
      setForm({ ...form, category_id: r.data.id });
      setNewCat(""); setShowNewCat(false);
    } catch { /* */ }
  };

  const saveEdit = async () => {
    if (!edit) return;
    try {
      await axios.put(`${API_URL}/inventory/products/${edit.id}`, {
        name: edit.name, unit: edit.unit, unit_cost: edit.unit_cost,
        min_stock_level: edit.min_stock_level, category_id: edit.category_id || null,
      }, { headers });
      setEdit(null);
      await load();
    } catch { /* */ }
  };

  const deleteProduct = async (p: Product) => {
    try { await axios.delete(`${API_URL}/inventory/products/${p.id}`, { headers }); setEdit(null); await load(); }
    catch { /* */ }
  };

  const submitMove = async () => {
    setMoveErr("");
    if (!move) return;
    const qty = parseFloat(moveForm.quantity);
    if (!qty || qty <= 0) { setMoveErr("Geçerli bir miktar gir."); return; }
    try {
      const payload: any = { product_id: move.product.id, branch_id: branchId, type: moveForm.type, quantity: qty };
      if (moveForm.type === "purchase" && moveForm.unit_cost) payload.unit_cost = parseFloat(moveForm.unit_cost);
      if (moveForm.notes) payload.notes = moveForm.notes;
      await axios.post(`${API_URL}/inventory/movements`, payload, { headers });
      setMove(null); setMoveForm({ type: "purchase", quantity: "", unit_cost: "", notes: "" });
      await load();
    } catch (e: any) { setMoveErr(e.response?.data?.detail || "Hareket kaydedilemedi."); }
  };

  const openMove = (p: Product, dir: "+" | "-") => {
    setMove({ product: p, dir });
    setMoveForm({ type: dir === "+" ? "purchase" : "usage", quantity: "", unit_cost: "", notes: "" });
    setMoveErr("");
  };

  const fmt = (n?: number | null) => n != null ? "₺" + Number(n).toLocaleString("tr-TR") : "—";
  const isLow = (p: Product) => p.min_stock_level > 0 && p.current_stock <= p.min_stock_level;

  // istatistikler
  const active = products.filter((p) => p.is_active !== false);
  const totalProducts = active.length;
  const stockValue = active.reduce((a, p) => a + (p.current_stock || 0) * (p.unit_cost || 0), 0);
  const lowCount = active.filter(isLow).length;

  // kategori cipleri
  const catCount = new Map<string, number>();
  active.forEach((p) => { const id = p.category_id || "__none__"; catCount.set(id, (catCount.get(id) || 0) + 1); });

  // filtre
  const filtered = active.filter((p) => {
    const okCat = cat === "__all__" || (p.category_id || "__none__") === cat;
    const q = search.trim().toLowerCase();
    const okSearch = !q || p.name.toLowerCase().includes(q);
    return okCat && okSearch;
  });

  const labelStyle: any = { display: "block", fontSize: 11, color: C.textMuted, marginBottom: 5, fontWeight: 500 };
  const inputStyle: any = { width: "100%", padding: "8px 11px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff", color: C.ink };
  const cols = "1.7fr 1fr 1.1fr 0.9fr 96px";

  return (
    <>
      {/* === SIYAH BASLIK === */}
      <div style={{ background: "#0A0A0A", borderRadius: 13, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(34,197,94,0.13)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-box" style={{ fontSize: 22, color: "#2EE06A" }} aria-hidden="true" /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Envanter</div>
            <div style={{ fontSize: 12.5, color: "#2EE06A", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{branchName} · stok yönetimi</div>
          </div>
        </div>
        <button onClick={() => { setShowAdd(true); setFormErr(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#22C55E", color: "#0A0A0A", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}><i className="ti ti-plus" style={{ fontSize: 16 }} aria-hidden="true" />Ürün ekle</button>
      </div>

      {/* === STAT KARTLARI === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 11, padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: C.textFaint }}>Toplam ürün</div>
          <div style={{ fontSize: 23, fontWeight: 700, color: C.ink, marginTop: 3 }}>{totalProducts}</div>
        </div>
        <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 11, padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: C.textFaint }}>Stok değeri</div>
          <div style={{ fontSize: 23, fontWeight: 700, color: C.ink, marginTop: 3 }}>{fmt(Math.round(stockValue))}</div>
        </div>
        <div style={{ background: "#0A0A0A", borderRadius: 11, padding: "14px 16px" }}>
          <div style={{ fontSize: 11.5, color: lowCount > 0 ? "#F4C430" : "#7A7A78" }}>Kritik stok</div>
          <div style={{ fontSize: 23, fontWeight: 700, color: "#fff", marginTop: 3 }}>{lowCount}</div>
        </div>
      </div>

      {/* === KATEGORI FILTRESI === */}
      <div style={{ display: "flex", gap: 7, marginBottom: 13, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#2EE06A", background: "#0A0A0A", padding: "6px 12px", borderRadius: 20 }}><i className="ti ti-category" style={{ fontSize: 13 }} aria-hidden="true" />Kategori</span>
        <CatChip label="Tümü" count={active.length} active={cat === "__all__"} onClick={() => setCat("__all__")} />
        {categories.map((c) => (
          <CatChip key={c.id} label={c.name} count={catCount.get(c.id) || 0} active={cat === c.id} onClick={() => setCat(c.id)} />
        ))}
        {catCount.get("__none__") ? <CatChip label="Kategorisiz" count={catCount.get("__none__") || 0} active={cat === "__none__"} onClick={() => setCat("__none__")} /> : null}
      </div>

      {/* === ARAMA === */}
      <div style={{ marginBottom: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, padding: "9px 12px" }}>
          <i className="ti ti-search" style={{ fontSize: 15, color: C.textHint }} aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün ara…" style={{ border: "none", outline: "none", fontSize: 12.5, flex: 1, background: "transparent", color: C.ink }} />
        </div>
      </div>

      {/* === TABLO === */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>{active.length === 0 ? "Henüz ürün yok. İlk ürünü ekle." : "Bu filtrede ürün yok."}</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 11, padding: "0 14px 9px", fontSize: 10, color: C.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <span>ürün</span><span>kategori</span><span>stok</span><span>birim maliyet</span><span style={{ textAlign: "center" }}>hareket</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {filtered.map((p) => {
              const low = isLow(p);
              return (
                <div key={p.id} style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderLeft: low ? "2.5px solid #F4C430" : `0.5px solid ${C.border}`, borderRadius: 11, padding: "11px 14px", display: "grid", gridTemplateColumns: cols, gap: 11, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: C.neutralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-package" style={{ fontSize: 16, color: C.textMuted }} aria-hidden="true" /></div>
                    <div onClick={() => setEdit(p)} style={{ fontSize: 13, fontWeight: 500, color: C.ink, cursor: "pointer" }}>{p.name}</div>
                  </div>
                  <span>{catName(p.category_id) ? <span style={{ fontSize: 11, color: "#3C3A36", background: C.neutralBg, padding: "3px 9px", borderRadius: 6 }}>{catName(p.category_id)}</span> : <span style={{ fontSize: 11, color: C.textHint }}>—</span>}</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: low ? "#C2870B" : C.ink }}>{Number(p.current_stock).toLocaleString("tr-TR")}</span>
                    <span style={{ fontSize: 11, color: C.textHint, marginLeft: 4 }}>{p.unit}</span>
                    {low && <span style={{ fontSize: 9.5, fontWeight: 600, color: "#C2870B", background: "#FBF1DC", padding: "2px 6px", borderRadius: 5, marginLeft: 6 }}>kritik</span>}
                  </div>
                  <span style={{ fontSize: 12.5, color: "#3C3A36" }}>{fmt(p.unit_cost)}</span>
                  <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                    <button onClick={() => openMove(p, "+")} title="Giriş" style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: C.greenSoft, color: C.greenDark, cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    <button onClick={() => openMove(p, "-")} title="Çıkış" style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: C.dangerBg, color: C.dangerInk, cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: 18, padding: "11px 14px", background: C.neutralBg, borderRadius: 9, display: "flex", alignItems: "center", gap: 9 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 15, color: C.textMuted, flexShrink: 0 }} aria-hidden="true" />
        <span style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}><span style={{ color: C.greenDark, fontWeight: 600 }}>+</span> alış/giriş, <span style={{ color: C.dangerInk, fontWeight: 600 }}>−</span> kullanım/fire. Sarı çizgili ürünler <span style={{ color: "#C2870B", fontWeight: 600 }}>kritik seviyede</span>, sipariş zamanı. Ürün adına tıkla → düzenle.</span>
      </div>

      {/* === URUN EKLE MODAL === */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Yeni Ürün">
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Ürün adı *</label><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Espresso çekirdek" /></div>
          <div style={{ marginBottom: 12, position: "relative" }}>
            <label style={labelStyle}>Kategori</label>
            <div onClick={() => setCatOpen(!catOpen)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderColor: catOpen ? C.green : C.border }}>
              <span style={{ color: form.category_id ? C.ink : C.textHint }}>{catName(form.category_id) || "Seç…"}</span>
              <i className="ti ti-chevron-down" style={{ fontSize: 15, color: C.textMuted }} aria-hidden="true" />
            </div>
            {catOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 9, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: 5, zIndex: 20, maxHeight: 180, overflowY: "auto" }}>
                {categories.length === 0 && !showNewCat && <div style={{ padding: "8px 10px", fontSize: 11.5, color: C.textHint }}>Henüz kategori yok.</div>}
                {categories.map((c) => (
                  <div key={c.id} onClick={() => { setForm({ ...form, category_id: c.id }); setCatOpen(false); }} style={{ padding: "8px 10px", fontSize: 12.5, color: C.ink, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: form.category_id === c.id ? C.greenSoft : "transparent" }}>
                    <span>{c.name}</span>{form.category_id === c.id && <i className="ti ti-check" style={{ fontSize: 14, color: C.greenDark }} aria-hidden="true" />}
                  </div>
                ))}
                <div style={{ height: "0.5px", background: C.border, margin: "5px 0" }} />
                <div onClick={() => { setShowNewCat(true); setCatOpen(false); }} style={{ padding: "8px 10px", fontSize: 12.5, color: C.greenDark, fontWeight: 600, borderRadius: 6, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                  <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />Yeni kategori ekle
                </div>
              </div>
            )}
          </div>
          {showNewCat && (
            <div style={{ background: C.neutralBg, borderRadius: 9, padding: "11px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 7, fontWeight: 500 }}>Yeni kategori adı</div>
              <div style={{ display: "flex", gap: 7 }}>
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Örn. Kahve" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addCategory} style={{ background: "#22C55E", color: "#0A0A0A", border: "none", borderRadius: 8, padding: "0 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Ekle</button>
                <button onClick={() => { setShowNewCat(false); setNewCat(""); }} style={{ background: "#fff", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 12px", fontSize: 12.5, cursor: "pointer" }}>İptal</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Başlangıç stoğu</label><input style={inputStyle} value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} placeholder="0" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim</label>
              <select style={inputStyle} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="adet">adet</option><option value="kg">kg</option><option value="gr">gr</option><option value="lt">lt</option><option value="ml">ml</option><option value="paket">paket</option><option value="kutu">kutu</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim maliyet (₺)</label><input style={inputStyle} value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} placeholder="0" /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Kritik seviye</label><input style={inputStyle} value={form.min_stock_level} onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })} placeholder="Örn. 5" /></div>
          </div>
          {formErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{formErr}</div>}
          <button style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "11px", fontSize: 13, fontWeight: 600, cursor: "pointer" }} onClick={addProduct}>Ürün Ekle</button>
        </Modal>
      )}

      {/* === DUZENLE MODAL === */}
      {edit && (
        <Modal onClose={() => setEdit(null)} title="Ürünü Düzenle">
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Ürün adı</label><input style={inputStyle} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim</label>
              <select style={inputStyle} value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })}>
                <option value="adet">adet</option><option value="kg">kg</option><option value="gr">gr</option><option value="lt">lt</option><option value="ml">ml</option><option value="paket">paket</option><option value="kutu">kutu</option>
              </select>
            </div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Birim maliyet (₺)</label><input style={inputStyle} value={String(edit.unit_cost)} onChange={(e) => setEdit({ ...edit, unit_cost: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Kritik seviye</label><input style={inputStyle} value={String(edit.min_stock_level)} onChange={(e) => setEdit({ ...edit, min_stock_level: parseFloat(e.target.value) || 0 })} /></div>
          <div style={{ fontSize: 11, color: C.textHint, marginBottom: 14 }}>Mevcut stok: {Number(edit.current_stock).toLocaleString("tr-TR")} {edit.unit} — stok değişimi için +/− kullan.</div>
          <div style={{ display: "flex", gap: 9 }}>
            <button style={{ flex: 1, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={saveEdit}>Kaydet</button>
            <button style={{ justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: C.dangerInk, border: `1px solid ${C.dangerBorder}`, borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={() => deleteProduct(edit)}><i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />Sil</button>
          </div>
        </Modal>
      )}

      {/* === STOK HAREKET MODAL === */}
      {move && (
        <Modal onClose={() => setMove(null)} title={`${move.product.name} · stok hareketi`}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>Mevcut: <strong style={{ color: C.ink }}>{Number(move.product.current_stock).toLocaleString("tr-TR")} {move.product.unit}</strong></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Hareket tipi</label>
            <select style={inputStyle} value={moveForm.type} onChange={(e) => setMoveForm({ ...moveForm, type: e.target.value })}>
              {HAREKET.filter((h) => move.dir === "+" ? h.dir === "+" || h.dir === "±" : h.dir === "−" || h.dir === "±").map((h) => (
                <option key={h.type} value={h.type}>{h.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Miktar ({move.product.unit}) *</label><input style={inputStyle} value={moveForm.quantity} onChange={(e) => setMoveForm({ ...moveForm, quantity: e.target.value })} placeholder="0" /></div>
          {moveForm.type === "purchase" && (
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Birim maliyet (₺) — opsiyonel</label><input style={inputStyle} value={moveForm.unit_cost} onChange={(e) => setMoveForm({ ...moveForm, unit_cost: e.target.value })} placeholder={String(move.product.unit_cost)} /></div>
          )}
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Not — opsiyonel</label><input style={inputStyle} value={moveForm.notes} onChange={(e) => setMoveForm({ ...moveForm, notes: e.target.value })} placeholder="Örn. Tedarikçi X" /></div>
          {moveErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{moveErr}</div>}
          <button style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: move.dir === "+" ? "#22C55E" : C.dangerInk, color: move.dir === "+" ? "#0A0A0A" : "#fff", border: "none", borderRadius: 9, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={submitMove}>{move.dir === "+" ? "Girişi Kaydet" : "Çıkışı Kaydet"}</button>
        </Modal>
      )}
    </>
  );
}

function CatChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 13px", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#3C3A36", background: active ? "#1FA85A" : "#fff", border: active ? "none" : `0.5px solid ${C.border}`, borderRadius: 20, cursor: "pointer" }}>
      {label} <span style={{ color: active ? "rgba(255,255,255,0.75)" : C.textHint }}>{count}</span>
    </button>
  );
}


// ============================================================================
// Manager Vardiya — calisan x gun matrisi. Sol calisanlar, ust 7 gun,
// kesisimde o kisinin o gunku vardiyasi. Hucreye tikla -> vardiya ata.
// Backend: shift (branch, title, start/end) + assignment (shift, employee).
// ============================================================================

// ============================================================================
// Manager Vardiya v2 — premium calisan x gun matrisi.
// - Vardiya turleri backend'den (shift-templates), duzenlenebilir + ozel renk
// - Izin entegrasyonu (leaves): yillik/hastalik/ucretsiz vs, tarih araligi, onayli
// - Hucreye tikla -> vardiya ata VEYA izin ver
// ============================================================================
type Assignment = { id: string; shift_id: string; employee_id: string; status: string };
type Shift = { id: string; branch_id: string; title: string; start_time: string; end_time: string; status: string; assignments: Assignment[] };
type VEmp = { id: string; first_name: string; last_name: string; position?: string | null; is_active?: boolean };
type Template = { id: string; branch_id: string; name: string; start_label: string; end_label: string; color: string };
type Leave = { id: string; employee_id: string; leave_type: string; start_date: string; end_date: string; status: string };

const GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const AYK = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

// renk anahtari -> hex (vardiya turu rengi)
const COLORS: Record<string, string> = {
  green: "#22C55E", blue: "#3B82F6", amber: "#F59E0B",
  purple: "#7C5CCB", red: "#C0564B", gray: "#6B6862",
};
const PRESET_COLORS = ["green", "blue", "amber", "purple", "red", "gray"];

// izin tipi -> {etiket, kisa, renk, ikon}
const LEAVE_TYPES: Record<string, { label: string; short: string; bg: string; ink: string; border: string; icon: string }> = {
  annual:    { label: "Yıllık ücretli izin", short: "Yıllık",   bg: "#F1ECFB", ink: "#7C5CCB", border: "#E3D9F6", icon: "ti-plane" },
  sick:      { label: "Hastalık / rapor",     short: "Rapor",    bg: "#FCEBEB", ink: "#C0564B", border: "#F6D9D6", icon: "ti-heartbeat" },
  unpaid:    { label: "Ücretsiz izin",        short: "Ücretsiz", bg: "#F4F3F0", ink: "#6B6862", border: "#E8E6E0", icon: "ti-wallet-off" },
  excuse:    { label: "Mazeret izni",         short: "Mazeret",  bg: "#F4F3F0", ink: "#6B6862", border: "#E8E6E0", icon: "ti-info-circle" },
  maternity: { label: "Doğum / analık",       short: "Doğum",    bg: "#FDEEF5", ink: "#C2568F", border: "#F6D9E8", icon: "ti-baby-carriage" },
  other:     { label: "Diğer",                short: "İzin",     bg: "#F4F3F0", ink: "#6B6862", border: "#E8E6E0", icon: "ti-dots" },
};

function pad(n: number) { return n < 10 ? "0" + n : String(n); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseYMD(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }

function ManagerVardiya({ token, branchId, branchName }: { token: string; branchId: string; branchName: string }) {
  const headers = { Authorization: `Bearer ${token}` };
  const errMsg = (e: any, fallback: string) => {
    const d = e?.response?.data?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x: any) => x?.msg || "").filter(Boolean).join(", ") || fallback;
    return fallback;
  };
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<VEmp[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));

  // hucre modal
  const [cell, setCell] = useState<{ emp: VEmp; day: Date } | null>(null);
  const [mode, setMode] = useState<"shift" | "leave">("shift");
  const [selTpl, setSelTpl] = useState<string>("");        // secili sablon id
  const [editTpls, setEditTpls] = useState(false);          // tur duzenleme modu
  const [leaveType, setLeaveType] = useState("annual");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [cellErr, setCellErr] = useState("");
  const [busy, setBusy] = useState(false);

  // tur ekle/duzenle
  const [tplModal, setTplModal] = useState<null | "new" | Template>(null);
  const [tplForm, setTplForm] = useState({ name: "", start: "08:00", end: "16:00", color: "green" });

  function mondayOf(d: Date) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x; }
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const today = new Date();
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const load = async () => {
    if (!branchId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [sh, em, tp, lv] = await Promise.all([
        axios.get(`${API_URL}/shifts/branch/${branchId}?t=${Date.now()}`, { headers }),
        axios.get(`${API_URL}/employees/branch/${branchId}?t=${Date.now()}`, { headers }),
        axios.get(`${API_URL}/shift-templates/branch/${branchId}?t=${Date.now()}`, { headers }),
        axios.get(`${API_URL}/leaves/branch/${branchId}?t=${Date.now()}`, { headers }),
      ]);
      setShifts(Array.isArray(sh.data) ? sh.data : []);
      setEmployees((Array.isArray(em.data) ? em.data : []).filter((e: any) => e.is_active !== false));
      setTemplates(Array.isArray(tp.data) ? tp.data : []);
      setLeaves((Array.isArray(lv.data) ? lv.data : []).filter((l: any) => l.status === "approved"));
    } catch (e) { console.error("[Vardiya load hatası]", e); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [branchId, token]);

  // bir calisanin belli gunku vardiyasi
  const cellShift = (empId: string, day: Date) => {
    for (const sh of shifts) {
      if (!sameDay(new Date(sh.start_time), day)) continue;
      const a = sh.assignments.find((x) => x.employee_id === empId && x.status !== "rejected");
      if (a) return { shift: sh, assignment: a };
    }
    return null;
  };
  // bir calisanin belli gunku izni
  const cellLeave = (empId: string, day: Date): Leave | null => {
    for (const l of leaves) {
      if (l.employee_id !== empId) continue;
      const s = parseYMD(l.start_date), e = parseYMD(l.end_date);
      const d0 = new Date(day); d0.setHours(0, 0, 0, 0);
      if (d0 >= s && d0 <= e) return l;
    }
    return null;
  };

  const colorOf = (sh: Shift) => {
    const t = templates.find((tp) => tp.name === sh.title);
    return t ? (COLORS[t.color] || t.color) : "#22C55E";
  };

  const openCell = (emp: VEmp, day: Date) => {
    setCell({ emp, day }); setCellErr(""); setEditTpls(false); setBusy(false);
    const ex = cellShift(emp.id, day);
    const lv = cellLeave(emp.id, day);
    if (lv) { setMode("leave"); setLeaveType(lv.leave_type); setLeaveStart(lv.start_date); setLeaveEnd(lv.end_date); }
    else if (ex) {
      setMode("shift");
      const t = templates.find((tp) => tp.name === ex.shift.title);
      setSelTpl(t ? t.id : "");
      setLeaveStart(ymd(day)); setLeaveEnd(ymd(day));
    } else {
      setMode("shift"); setSelTpl(templates[0]?.id || "");
      setLeaveType("annual"); setLeaveStart(ymd(day)); setLeaveEnd(ymd(day));
    }
  };

  const assignShift = async () => {
    if (!cell || !selTpl) { setCellErr("Önce vardiya türü seç."); return; }
    const tpl = templates.find((t) => t.id === selTpl);
    if (!tpl) { setCellErr("Tür bulunamadı."); return; }
    setBusy(true); setCellErr("");
    try {
      const [sh, sm] = tpl.start_label.split(":").map(Number);
      const [eh, em] = tpl.end_label.split(":").map(Number);
      const sd = new Date(cell.day); sd.setHours(sh, sm || 0, 0, 0);
      const ed = new Date(cell.day); ed.setHours(eh % 24, em || 0, 0, 0);
      // bitis <= baslangic ise (gece yarisini gecen vardiya) ertesi gune tasi
      if (ed.getTime() <= sd.getTime()) ed.setDate(ed.getDate() + 1);
      // ayni gun + ayni baslik shift var mi
      let target = shifts.find((x) => sameDay(new Date(x.start_time), cell.day) && x.title === tpl.name);
      if (!target) {
        const r = await axios.post(`${API_URL}/shifts`, { branch_id: branchId, title: tpl.name, start_time: sd.toISOString(), end_time: ed.toISOString() }, { headers });
        target = r.data; target!.assignments = [];
      }
      const doAssign = async (sid: string, force: boolean) =>
        axios.post(`${API_URL}/shifts/${sid}/assign`, { employee_ids: [cell.emp.id], ...(force ? { force: true } : {}) }, { headers });
      const recreateShift = async () => {
        const r = await axios.post(`${API_URL}/shifts`, { branch_id: branchId, title: tpl.name, start_time: sd.toISOString(), end_time: ed.toISOString() }, { headers });
        return r.data.id as string;
      };
      let targetId = target!.id;
      try {
        await doAssign(targetId, false);
      } catch (err: any) {
        const st = err?.response?.status;
        const d = err?.response?.data?.detail || "";
        if (st === 404) {
          // BAYAT STATE: shift DB'de yok -> yeniden olustur + tekrar dene
          targetId = await recreateShift();
          try {
            await doAssign(targetId, false);
          } catch (err2: any) {
            if (err2?.response?.status === 400) {
              if (window.confirm("Bu çalışan haftalık 45 saati aşacak.\n\n" + (err2?.response?.data?.detail || "") + "\n\nYine de atamak istiyor musun?")) {
                await doAssign(targetId, true);
              } else { setBusy(false); return; }
            } else { throw err2; }
          }
        } else if (st === 400) {
          // OVERTIME: 45 saat asimi -> onay sor
          if (window.confirm("Bu çalışan haftalık 45 saati aşacak.\n\n" + d + "\n\nYine de atamak istiyor musun?")) {
            await doAssign(targetId, true);
          } else { setBusy(false); return; }
        } else { throw err; }
      }
      setCell(null); await load();
    } catch (e: any) { setCellErr(errMsg(e, "Atanamadı.")); }
    setBusy(false);
  };

  const giveLeave = async () => {
    if (!cell) return;
    if (!leaveStart || !leaveEnd) { setCellErr("Tarih aralığı gir."); return; }
    if (leaveEnd < leaveStart) { setCellErr("Bitiş, başlangıçtan önce olamaz."); return; }
    setBusy(true); setCellErr("");
    try {
      // 1) izin olustur (pending)
      const r = await axios.post(`${API_URL}/leaves`, {
        employee_id: cell.emp.id, leave_type: leaveType, start_date: leaveStart, end_date: leaveEnd,
      }, { headers });
      // 2) direkt onayla
      await axios.put(`${API_URL}/leaves/${r.data.id}/review`, { approve: true }, { headers });
      setCell(null); await load();
    } catch (e: any) { setCellErr(errMsg(e, "İzin verilemedi.")); }
    setBusy(false);
  };

  const removeCellItem = async () => {
    if (!cell) return;
    setBusy(true); setCellErr("");
    try {
      const lv = cellLeave(cell.emp.id, cell.day);
      if (lv) {
        await axios.put(`${API_URL}/leaves/${lv.id}/cancel`, {}, { headers });
      } else {
        const ex = cellShift(cell.emp.id, cell.day);
        if (ex) {
          if (ex.shift.assignments.length <= 1) await axios.delete(`${API_URL}/shifts/${ex.shift.id}`, { headers });
          else await axios.put(`${API_URL}/assignments/${ex.assignment.id}`, { status: "rejected" }, { headers });
        }
      }
      setCell(null); await load();
    } catch (e: any) { setCellErr(errMsg(e, "Kaldırılamadı.")); }
    setBusy(false);
  };

  // --- tur sablonu ekle/duzenle/sil ---
  const openTplNew = () => { setTplForm({ name: "", start: "08:00", end: "16:00", color: "green" }); setTplModal("new"); };
  const openTplEdit = (t: Template) => { setTplForm({ name: t.name, start: t.start_label, end: t.end_label, color: t.color }); setTplModal(t); };
  const saveTpl = async () => {
    if (!tplForm.name.trim()) return;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return (h === 24 ? 1440 : h * 60) + (m || 0); };
    if (toMin(tplForm.end) === toMin(tplForm.start)) { alert("Başlangıç ve bitiş aynı olamaz."); return; }
    try {
      if (tplModal === "new") {
        await axios.post(`${API_URL}/shift-templates`, { branch_id: branchId, name: tplForm.name.trim(), start_label: tplForm.start, end_label: tplForm.end, color: tplForm.color }, { headers });
      } else if (tplModal && typeof tplModal === "object") {
        // backend'de update yok -> sil + yeniden olustur
        await axios.delete(`${API_URL}/shift-templates/${tplModal.id}`, { headers });
        await axios.post(`${API_URL}/shift-templates`, { branch_id: branchId, name: tplForm.name.trim(), start_label: tplForm.start, end_label: tplForm.end, color: tplForm.color }, { headers });
      }
      setTplModal(null);
      const tp = await axios.get(`${API_URL}/shift-templates/branch/${branchId}?t=${Date.now()}`, { headers });
      setTemplates(Array.isArray(tp.data) ? tp.data : []);
    } catch { /* */ }
  };
  const deleteTpl = async (t: Template) => {
    try {
      await axios.delete(`${API_URL}/shift-templates/${t.id}`, { headers });
      setTemplates(templates.filter((x) => x.id !== t.id));
      if (selTpl === t.id) setSelTpl("");
    } catch { /* */ }
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const fmtRange = () => `${weekStart.getDate()}–${weekDays[6].getDate()} ${AYK[weekDays[6].getMonth()]}`;

  const labelStyle: any = { display: "block", fontSize: 10.5, color: C.textMuted, marginBottom: 5, fontWeight: 500 };
  const inputStyle: any = { width: "100%", padding: "8px 11px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", background: "#fff", color: C.ink };
  const gridCols = "128px repeat(7,1fr)";
  const existsItem = cell ? (cellShift(cell.emp.id, cell.day) || cellLeave(cell.emp.id, cell.day)) : null;

  return (
    <>
      {/* === SIYAH BASLIK === */}
      <div style={{ background: "#0A0A0A", borderRadius: 14, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(34,197,94,0.13)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><i className="ti ti-calendar-week" style={{ fontSize: 22, color: "#2EE06A" }} aria-hidden="true" /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Vardiya</div>
            <div style={{ fontSize: 12.5, color: "#2EE06A", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{branchName} · haftalık plan</div>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "5px 6px", flexShrink: 0 }}>
          <button onClick={prevWeek} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-chevron-left" style={{ fontSize: 15, color: "#fff" }} aria-hidden="true" /></button>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", padding: "0 8px", minWidth: 70, textAlign: "center" }}>{fmtRange()}</span>
          <button onClick={nextWeek} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-chevron-right" style={{ fontSize: 15, color: "#fff" }} aria-hidden="true" /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>Yükleniyor…</div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: C.textHint, fontSize: 13 }}>Bu şubede aktif çalışan yok. Önce personel ekle.</div>
      ) : (
        <>
          {/* === PREMIUM MATRIS === */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)", overflowX: "auto" }}>
            {/* baslik */}
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 4, padding: "6px 6px 10px", minWidth: 720 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 2, fontSize: 10, fontWeight: 600, color: C.textHint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ekip</div>
              {weekDays.map((d, i) => {
                const isToday = sameDay(d, today);
                const isSun = i === 6;
                return (
                  <div key={i} style={{ textAlign: "center", padding: "6px 0", borderRadius: 10, background: isToday ? "#0A0A0A" : "transparent" }}>
                    <div style={{ fontSize: 9.5, fontWeight: isToday ? 600 : 500, color: isToday ? "#2EE06A" : (isSun ? "#CFCBC3" : C.textHint), textTransform: "uppercase", letterSpacing: "0.03em" }}>{GUNLER[i]}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: isToday ? "#fff" : (isSun ? "#CFCBC3" : "#3C3A36"), marginTop: 1 }}>{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
            {/* satirlar */}
            {employees.map((emp, ri) => (
              <div key={emp.id} style={{ display: "grid", gridTemplateColumns: gridCols, gap: 4, padding: ri === employees.length - 1 ? "4px 6px 8px" : "4px 6px", minWidth: 720 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#EEF8F2,#D9F0E2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.greenDark, flexShrink: 0 }}>{((emp.first_name?.[0] || "") + (emp.last_name?.[0] || "")).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#1A1A18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.first_name} {emp.last_name?.[0]}.</div>
                    <div style={{ fontSize: 9, color: "#B0ACA4" }}>{emp.position || "—"}</div>
                  </div>
                </div>
                {weekDays.map((d, ci) => {
                  const ex = cellShift(emp.id, d);
                  const lv = cellLeave(emp.id, d);
                  if (lv) {
                    const lt = LEAVE_TYPES[lv.leave_type] || LEAVE_TYPES.other;
                    return (
                      <div key={ci} onClick={() => openCell(emp, d)} style={{ height: 46, background: lt.bg, border: `1px solid ${lt.border}`, borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <i className={`ti ${lt.icon}`} style={{ fontSize: 12, color: lt.ink }} aria-hidden="true" />
                        <span style={{ fontSize: 8.5, fontWeight: 600, color: lt.ink, marginTop: 1 }}>{lt.short}</span>
                      </div>
                    );
                  }
                  if (ex) {
                    const col = colorOf(ex.shift);
                    return (
                      <div key={ci} onClick={() => openCell(emp, d)} style={{ height: 46, background: col, borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 1px 2px ${col}40` }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>{pad(new Date(ex.shift.start_time).getHours())}:00</span>
                        <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)" }}>{pad(new Date(ex.shift.end_time).getHours())}:00</span>
                      </div>
                    );
                  }
                  return (
                    <div key={ci} onClick={() => openCell(emp, d)} style={{ height: 46, background: "#FBFBFA", border: "1px dashed #E2E0DA", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <i className="ti ti-plus" style={{ fontSize: 13, color: "#D6D2CA" }} aria-hidden="true" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* lejant */}
          <div style={{ display: "flex", gap: 13, flexWrap: "wrap", marginTop: 16 }}>
            {templates.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 11, height: 11, borderRadius: 4, background: COLORS[t.color] || t.color }} />
                <span style={{ fontSize: 10.5, color: C.textMuted }}>{t.name}</span>
              </div>
            ))}
            {["annual", "sick", "unpaid"].map((k) => {
              const lt = LEAVE_TYPES[k];
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 4, background: lt.bg, border: `1px solid ${lt.border}` }} />
                  <span style={{ fontSize: 10.5, color: lt.ink, fontWeight: 600 }}>{lt.short}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* === HUCRE MODAL === */}
      {cell && (
        <Modal onClose={() => setCell(null)} title={`${cell.emp.first_name} ${cell.emp.last_name} · ${GUNLER[(cell.day.getDay() + 6) % 7]} ${cell.day.getDate()}`}>
          {/* durum secimi */}
          <div style={{ fontSize: 10.5, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>Durum</div>
          <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
            <button onClick={() => setMode("shift")} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: mode === "shift" ? `1.5px solid ${C.greenDark}` : `1px solid ${C.border}`, background: mode === "shift" ? C.greenSoft : "#fff", cursor: "pointer" }}>
              <i className="ti ti-clock" style={{ fontSize: 14, color: mode === "shift" ? C.greenDark : C.textHint }} aria-hidden="true" />
              <div style={{ fontSize: 11, fontWeight: 600, color: mode === "shift" ? C.greenDark : "#3C3A36", marginTop: 1 }}>Vardiya</div>
            </button>
            <button onClick={() => setMode("leave")} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: mode === "leave" ? "1.5px solid #7C5CCB" : `1px solid ${C.border}`, background: mode === "leave" ? "#F1ECFB" : "#fff", cursor: "pointer" }}>
              <i className="ti ti-beach" style={{ fontSize: 14, color: mode === "leave" ? "#7C5CCB" : C.textHint }} aria-hidden="true" />
              <div style={{ fontSize: 11, fontWeight: 600, color: mode === "leave" ? "#7C5CCB" : "#3C3A36", marginTop: 1 }}>İzin</div>
            </button>
          </div>

          {mode === "shift" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10.5, color: C.textMuted, fontWeight: 500 }}>Vardiya türü</span>
                {templates.length > 0 && <span onClick={() => setEditTpls(!editTpls)} style={{ fontSize: 10, color: C.greenDark, fontWeight: 600, cursor: "pointer" }}>{editTpls ? "Bitti" : "Düzenle"}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {templates.map((t) => {
                  const col = COLORS[t.color] || t.color;
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => !editTpls && setSelTpl(t.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 11px", borderRadius: 8, border: selTpl === t.id && !editTpls ? `1.5px solid ${col}` : `1px solid ${C.border}`, background: selTpl === t.id && !editTpls ? col + "18" : "#fff", cursor: "pointer" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: col }} /><span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{t.name}</span></span>
                        <span style={{ fontSize: 10, color: C.textMuted }}>{t.start_label}–{t.end_label}</span>
                      </button>
                      {editTpls && <>
                        <button onClick={() => openTplEdit(t)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-pencil" style={{ fontSize: 13, color: C.textMuted }} aria-hidden="true" /></button>
                        <button onClick={() => deleteTpl(t)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.dangerBorder}`, background: C.dangerBg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="ti ti-trash" style={{ fontSize: 13, color: C.dangerInk }} aria-hidden="true" /></button>
                      </>}
                    </div>
                  );
                })}
                <button onClick={openTplNew} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 8, border: "1px dashed #C9C5BD", background: "#fff", cursor: "pointer", justifyContent: "center" }}><i className="ti ti-plus" style={{ fontSize: 13, color: C.greenDark }} aria-hidden="true" /><span style={{ fontSize: 11.5, fontWeight: 600, color: C.greenDark }}>Yeni tür ekle</span></button>
              </div>
              {cellErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{cellErr}</div>}
              <div style={{ display: "flex", gap: 9 }}>
                <button disabled={busy} style={{ flex: 1, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 12.5, fontWeight: 600, cursor: busy ? "wait" : "pointer" }} onClick={assignShift}>{existsItem ? "Güncelle" : "Vardiya Ata"}</button>
                {existsItem && <button disabled={busy} style={{ justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: C.dangerInk, border: `1px solid ${C.dangerBorder}`, borderRadius: 9, padding: "10px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={removeCellItem}><i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />Kaldır</button>}
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>İzin türü</label>
                <select style={inputStyle} value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  {Object.entries(LEAVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Başlangıç</label><input style={inputStyle} type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Bitiş</label><input style={inputStyle} type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} /></div>
              </div>
              <div style={{ fontSize: 10, color: "#7C5CCB", background: "#F1ECFB", padding: "7px 10px", borderRadius: 7, marginBottom: 12 }}>Onaylı izin olarak kaydedilecek.</div>
              {cellErr && <div style={{ fontSize: 12, color: C.dangerInk, marginBottom: 10 }}>{cellErr}</div>}
              <div style={{ display: "flex", gap: 9 }}>
                <button disabled={busy} style={{ flex: 1, justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: "#7C5CCB", color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 12.5, fontWeight: 600, cursor: busy ? "wait" : "pointer" }} onClick={giveLeave}>{existsItem && cellLeave(cell.emp.id, cell.day) ? "Güncelle" : "İzni Onayla"}</button>
                {existsItem && <button disabled={busy} style={{ justifyContent: "center", display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: C.dangerInk, border: `1px solid ${C.dangerBorder}`, borderRadius: 9, padding: "10px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={removeCellItem}><i className="ti ti-trash" style={{ fontSize: 14 }} aria-hidden="true" />Kaldır</button>}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* === TUR EKLE/DUZENLE MODAL === */}
      {tplModal && (
        <Modal onClose={() => setTplModal(null)} title={tplModal === "new" ? "Yeni vardiya türü" : "Türü düzenle"}>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Ad</label><input style={inputStyle} value={tplForm.name} onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })} placeholder="Örn. Ara vardiya" /></div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Başlangıç</label><input style={inputStyle} type="time" value={tplForm.start} onChange={(e) => setTplForm({ ...tplForm, start: e.target.value })} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Bitiş</label><input style={inputStyle} type="time" value={tplForm.end} onChange={(e) => setTplForm({ ...tplForm, end: e.target.value })} /></div>
          </div>
          <label style={labelStyle}>Renk</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <span key={c} onClick={() => setTplForm({ ...tplForm, color: c })} style={{ width: 30, height: 30, borderRadius: 8, background: COLORS[c], cursor: "pointer", boxShadow: tplForm.color === c ? `0 0 0 2.5px ${COLORS[c]}55` : "none" }} />
            ))}
            <label style={{ width: 30, height: 30, borderRadius: 8, cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px dashed #C9C5BD", background: "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)", overflow: "hidden" }}>
              <i className="ti ti-plus" style={{ fontSize: 14, color: "#fff", filter: "drop-shadow(0 0 1px rgba(0,0,0,0.6))" }} aria-hidden="true" />
              <input type="color" value={tplForm.color.startsWith("#") ? tplForm.color : "#22C55E"} onChange={(e) => setTplForm({ ...tplForm, color: e.target.value })} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
            </label>
          </div>
          <div style={{ background: (COLORS[tplForm.color] || tplForm.color) + "18", borderRadius: 8, padding: "9px 12px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: COLORS[tplForm.color] || tplForm.color }}>Önizleme</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: COLORS[tplForm.color] || tplForm.color }}>{tplForm.name || "Tür"} · {tplForm.start}–{tplForm.end}</span>
          </div>
          <button style={{ width: "100%", background: C.ink, color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={saveTpl}>Türü Kaydet</button>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, children, onClose }: { title: string; children: any; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17,17,16,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", width: 460, maxWidth: "100%", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textHint, padding: 4, display: "flex" }}><i className="ti ti-x" style={{ fontSize: 18 }} aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
