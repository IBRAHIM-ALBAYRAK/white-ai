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
