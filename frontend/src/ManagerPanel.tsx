import { useState, useEffect } from "react";
import axios from "axios";

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
