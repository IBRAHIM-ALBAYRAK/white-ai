import { useState, useEffect } from "react";
import axios from "axios";

// ============================================================================
// WHITE.AI — Marka Sahibi Paneli (Panel 2)
// Beyaz agirlikli + yesil accent + siyah metin. Onaylanan UI birebir.
// Genel Bakis: gercek API (/oversight/overview). Diger 8 sayfa placeholder.
// ============================================================================

const API_URL = "http://127.0.0.1:8000/api/v1";

type BrandUser = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id?: string;
};

// --- Renk paleti (tek kaynak) ---
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
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", padding: "2px 10px 22px" }}>
          WHITE<span style={{ color: C.green }}>.AI</span>
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
        {/* Topbar */}
        <div style={{ padding: "16px 26px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>{brandName}</span>
            <span style={{ fontSize: 11, color: C.textHint, marginTop: 1 }}>{PAGE_TITLE[page]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.green, background: C.greenSoft, padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />Canlı
          </div>
        </div>

        {/* Sayfa govdesi */}
        <div style={{ padding: "24px 26px", overflow: "auto" }}>
          {page === "overview" ? <OverviewPage firstName={user.first_name} token={token} /> : <Placeholder title={PAGE_TITLE[page]} />}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// Genel Bakis sayfasi — gercek API (/oversight/overview)
// ============================================================================
type Overview = {
  branches: number;
  franchises: number;
  staff: number;
  on_duty: number;
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

      {error && (
        <div style={{ fontSize: 13, color: C.warnInk, background: C.warnBg, padding: "10px 14px", borderRadius: 10, marginBottom: 16 }}>{error}</div>
      )}

      {/* Metrik kartlari */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 22 }}>
        <MetricCard icon="ti-building-store" label="Şube" value={loading ? "—" : stats.branches} />
        <MetricCard icon="ti-link" label="Franchise" value={loading ? "—" : stats.franchises} />
        <MetricCard icon="ti-users" label="Personel" value={loading ? "—" : stats.staff} />
        {/* Canli metrik — siyah kart */}
        <div style={{ background: C.ink, border: `1px solid ${C.ink}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "#9DE8BE", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-activity" style={{ fontSize: 14 }} aria-hidden="true" />Bugün mesaide
          </div>
          <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: "-0.02em", color: "#fff" }}>
            {loading ? "—" : stats.onDuty}<span style={{ fontSize: 13, color: "#9DE8BE", fontWeight: 400, marginLeft: 4 }}>/{loading ? "—" : stats.staff}</span>
          </div>
        </div>
      </div>

      {/* Alt iki kart */}
      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 14 }}>
        {/* Dikkat gerektirenler */}
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

        {/* En yogun subeler */}
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
// Placeholder — henuz yapilmamis sayfalar
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
