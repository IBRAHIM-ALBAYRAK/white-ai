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
];

const PAGE_TITLE: Record<string, string> = {
  overview: "Genel Bakış",
  staff: "Personel",
  inventory: "Envanter",
  shifts: "Vardiya",
  payroll: "Bordro",
  finance: "Finans",
  ledger: "Gelir / Gider",
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
          <Placeholder title={PAGE_TITLE[page]} branchId={branchId} />
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
