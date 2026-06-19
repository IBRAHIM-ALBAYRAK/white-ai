import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const modules = [
    { icon: "ti-calendar-stats", title: "Workforce", desc: "Drag-and-drop rosters, overtime alerts before they cost you, instant shift notifications.", status: "live", featured: true },
    { icon: "ti-box-seam", title: "Inventory & Supply", desc: "Central warehouse to branch dispatch, recipe costing, reorder triggers before you run out.", status: "dev" },
    { icon: "ti-fingerprint", title: "Time Clock", desc: "Biometric check-in with GPS verification — buddy-punching stops at the door.", status: "dev" },
    { icon: "ti-receipt-2", title: "HR & Payroll", desc: "SGK, income tax, and stamp duty calculated to the kuruş. Compliant by default.", status: "soon" },
    { icon: "ti-wallet", title: "Earned Wage Access", desc: "Staff draw earned pay before payday, manager-approved. Lower turnover, happier teams.", status: "soon" },
    { icon: "ti-chart-dots-3", title: "AI Forecasting", desc: "Two years of sales, weather, and local events predict tomorrow's covers — and your roster.", status: "soon" },
  ];

  const steps = [
    { n: "01", title: "Add your branches", desc: "Brand-owned and franchise locations in one list. Owners see everything, managers see their branch." },
    { n: "02", title: "Add people and stock", desc: "Enter staff and salaries once. The labor-law engine handles SGK, tax, and payroll automatically." },
    { n: "03", title: "Run it from one screen", desc: "Shifts, payroll, finance, income and expense — every branch, every team, one window." },
  ];

  return (
    <>
      <style>{`
        .landing * { box-sizing: border-box; }
        .landing { font-family: 'Inter', sans-serif; color: #0a0a0a; background: #fff; overflow-x: hidden; }
        .landing a { text-decoration: none; }

        /* ============ HERO ============ */
        .l-hero-wrap {
          position: relative; background: #070707; overflow: hidden;
          border-radius: 0 0 28px 28px; min-height: 640px;
        }
        .l-hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(120deg, #0a1f16 0%, #0f3324 52%, #0a0a0a 100%);
        }
        .l-hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 42%, rgba(0,200,83,0.16), transparent 55%);
        }
        /* yuzen pill nav */
        .l-pillnav {
          position: relative; z-index: 10;
          display: flex; justify-content: center; padding: 22px 0 0;
        }
        .l-pillnav-inner {
          display: flex; align-items: center; gap: 24px;
          background: rgba(18,18,18,0.55); backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 100px;
          padding: 10px 12px 10px 22px;
        }
        .l-pn-link { font-size: 13px; color: rgba(255,255,255,0.82); cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
        .l-pn-link:hover { color: #fff; }
        .l-pn-logo { display: flex; align-items: center; gap: 8px; padding: 0 8px; }
        .l-pn-logo-box { width: 27px; height: 27px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.15); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
        .l-pn-logo-text { font-family: 'Bricolage Grotesque', 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
        .l-pn-logo-text span { color: #00c853; }
        .l-pn-cta { font-size: 13px; color: #070707; background: #fff; padding: 9px 18px; border-radius: 100px; font-weight: 600; cursor: pointer; transition: transform 0.2s; border: none; font-family: inherit; }
        .l-pn-cta:hover { transform: translateY(-1px); }

        .l-hero-grid {
          position: relative; z-index: 5;
          display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center;
          padding: 50px 64px 0; max-width: 1280px; margin: 0 auto;
        }
        .l-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 12px; color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px; border-radius: 100px; margin-bottom: 22px;
        }
        .l-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #00c853; box-shadow: 0 0 8px #00c853; }
        .l-hero-title {
          font-family: 'Bricolage Grotesque', 'Syne', sans-serif;
          font-size: clamp(38px, 5vw, 56px); line-height: 1.04; font-weight: 800;
          color: #fff; letter-spacing: -0.035em; margin: 0 0 22px;
        }
        .l-hero-title .hl { color: #00c853; }
        .l-hero-desc { font-size: 15.5px; line-height: 1.6; color: rgba(255,255,255,0.7); margin: 0 0 28px; max-width: 420px; }
        .l-hero-actions { display: flex; gap: 12px; }
        .l-btn-hero-primary {
          font-size: 14px; font-weight: 600; color: #070707; background: #00c853;
          padding: 14px 28px; border-radius: 100px; cursor: pointer; border: none; font-family: inherit;
          box-shadow: 0 6px 22px rgba(0,200,83,0.3); transition: transform 0.2s;
        }
        .l-btn-hero-primary:hover { transform: translateY(-2px); }
        .l-btn-hero-secondary {
          font-size: 14px; font-weight: 500; color: #fff; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18); padding: 14px 26px; border-radius: 100px;
          cursor: pointer; font-family: inherit; transition: background 0.2s;
        }
        .l-btn-hero-secondary:hover { background: rgba(255,255,255,0.14); }

        /* dashboard mockup */
        .l-mockup {
          background: #fff; border-radius: 16px; padding: 16px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.45);
          transform: perspective(1200px) rotateY(-9deg) rotateX(3deg);
          transition: transform 0.5s ease;
        }
        .l-mockup:hover { transform: perspective(1200px) rotateY(-4deg) rotateX(1deg); }
        .l-mockup-dots { display: flex; gap: 5px; margin-bottom: 14px; }
        .l-mockup-dots span { width: 9px; height: 9px; border-radius: 50%; }
        .l-mock-hero { background: #0A0A0A; border-radius: 11px; padding: 13px 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .l-mock-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .l-mock-stat { flex: 1; background: #F2F1ED; border-radius: 9px; padding: 11px; }
        .l-mock-shift { background: #EEF8F2; border-radius: 9px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }

        .l-hero-trust {
          position: relative; z-index: 5;
          display: flex; align-items: center; gap: 22px;
          padding: 36px 64px 30px; max-width: 1280px; margin: 0 auto; flex-wrap: wrap;
        }
        .l-trust-label { font-size: 12px; color: #fff; font-weight: 700; line-height: 1.35; }
        .l-trust-div { width: 1px; height: 32px; background: rgba(255,255,255,0.18); }
        .l-trust-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: rgba(255,255,255,0.72); }

        /* ============ STATS ============ */
        .l-stats { background: #070707; padding: 30px 64px; display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap; }
        .l-stat { text-align: center; }
        .l-stat-num { font-family: 'Bricolage Grotesque','Syne',sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
        .l-stat-label { font-size: 10.5px; color: rgba(255,255,255,0.5); margin-top: 4px; }
        .l-stat-div { width: 1px; height: 38px; background: rgba(255,255,255,0.1); }

        /* ============ SECTIONS ============ */
        .l-section { padding: 72px 64px; max-width: 1280px; margin: 0 auto; }
        .l-eyebrow { display: inline-block; font-size: 11px; font-weight: 600; color: #00a843; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; }
        .l-h2 { font-family: 'Bricolage Grotesque','Syne',sans-serif; font-size: clamp(30px, 4vw, 42px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; margin: 0 0 14px; color: #0a0a0a; }
        .l-lead { font-size: 15.5px; color: #62615c; line-height: 1.6; font-weight: 300; max-width: 540px; margin: 0; }

        /* modules */
        .l-modules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 40px; }
        .l-mod { background: #FBFBFA; border: 0.5px solid #ECECE8; border-radius: 16px; padding: 24px; transition: transform 0.25s, box-shadow 0.25s; }
        .l-mod:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.06); }
        .l-mod.featured { background: linear-gradient(140deg, #0a1f16, #0f3324); color: #fff; }
        .l-mod-icon { width: 42px; height: 42px; border-radius: 12px; background: #F2F1ED; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .l-mod.featured .l-mod-icon { background: rgba(0,200,83,0.16); }
        .l-mod-title { font-size: 16px; font-weight: 700; margin-bottom: 7px; }
        .l-mod-desc { font-size: 12.5px; line-height: 1.55; color: #6B6862; margin-bottom: 16px; }
        .l-mod.featured .l-mod-desc { color: rgba(255,255,255,0.7); }
        .l-status { font-size: 9.5px; padding: 3px 11px; border-radius: 100px; font-weight: 600; }
        .l-status-live { color: #070707; background: #00c853; }
        .l-status-dev { color: #C68A12; background: #FEF6E7; }
        .l-status-soon { color: #8A867F; background: #F2F1ED; }

        /* how */
        .l-how { background: #F7F8FA; }
        .l-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 40px; }
        .l-step { background: #fff; border: 0.5px solid #ECECE8; border-radius: 15px; padding: 28px; }
        .l-step-n { font-size: 11px; font-weight: 700; color: #00a843; letter-spacing: 0.08em; margin-bottom: 14px; }
        .l-step-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #0a0a0a; }
        .l-step-desc { font-size: 12.5px; color: #6B6862; line-height: 1.6; }

        /* quote */
        .l-quote { background: #070707; text-align: center; padding: 76px 48px; }
        .l-quote-stars { font-size: 13px; color: #00c853; letter-spacing: 0.1em; margin-bottom: 20px; }
        .l-quote-text { font-family: 'Bricolage Grotesque','Syne',sans-serif; font-size: clamp(22px, 3.2vw, 32px); font-weight: 700; color: #fff; line-height: 1.32; letter-spacing: -0.025em; margin: 0 auto 20px; max-width: 720px; }
        .l-quote-text em { color: #00c853; font-style: italic; }
        .l-quote-attr { font-size: 12.5px; color: rgba(255,255,255,0.5); }

        /* cta */
        .l-cta { position: relative; overflow: hidden; background: linear-gradient(135deg, #0a1f16, #0f3324); text-align: center; padding: 72px 48px; }
        .l-cta-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(0,200,83,0.2), transparent 58%); }
        .l-cta-inner { position: relative; }
        .l-cta-title { font-family: 'Bricolage Grotesque','Syne',sans-serif; font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #fff; letter-spacing: -0.035em; line-height: 1.08; margin: 0 0 14px; }
        .l-cta-title em { color: #00c853; font-style: italic; }
        .l-cta-desc { font-size: 14.5px; color: rgba(255,255,255,0.7); margin: 0 auto 28px; max-width: 470px; }
        .l-cta-actions { display: flex; gap: 12px; justify-content: center; }

        /* footer */
        .l-footer { background: #070707; border-top: 1px solid rgba(255,255,255,0.06); padding: 30px 64px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .l-footer-logo { font-family: 'Bricolage Grotesque','Syne',sans-serif; font-size: 15px; font-weight: 800; color: #fff; }
        .l-footer-logo span { color: #00c853; }
        .l-footer-copy { font-size: 11px; color: rgba(255,255,255,0.4); }
        .l-footer-links { display: flex; gap: 18px; }
        .l-footer-links a { font-size: 11.5px; color: rgba(255,255,255,0.55); cursor: pointer; }
        .l-footer-links a:hover { color: #fff; }

        /* reveal */
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: none; }
        .reveal-d1 { transition-delay: 0.08s; }
        .reveal-d2 { transition-delay: 0.16s; }

        @media (max-width: 900px) {
          .l-hero-grid { grid-template-columns: 1fr; padding: 40px 28px 0; }
          .l-mockup { display: none; }
          .l-modules, .l-steps { grid-template-columns: 1fr; }
          .l-section, .l-stats, .l-footer, .l-hero-trust { padding-left: 28px; padding-right: 28px; }
          .l-pillnav-inner { gap: 12px; padding: 9px 10px 9px 16px; flex-wrap: wrap; }
        }
      `}</style>

      <div className="landing">
        {/* ============ HERO ============ */}
        <div className="l-hero-wrap">
          <div className="l-hero-bg" />
          <div className="l-hero-glow" />

          {/* pill nav */}
          <nav className="l-pillnav">
            <div className="l-pillnav-inner">
              <span className="l-pn-link">Çözümler <i className="ti ti-chevron-down" style={{ fontSize: 11 }} /></span>
              <span className="l-pn-link">Keşfet <i className="ti ti-chevron-down" style={{ fontSize: 11 }} /></span>
              <span className="l-pn-link">Fiyatlandırma</span>
              <span className="l-pn-logo">
                <span className="l-pn-logo-box"><i className="ti ti-sparkles" style={{ fontSize: 14, color: "#00c853" }} /></span>
                <span className="l-pn-logo-text">WHITE<span>.AI</span></span>
              </span>
              <span className="l-pn-link">Destek</span>
              <span className="l-pn-link">İletişim</span>
              <button className="l-pn-cta" onClick={() => navigate("/app")}>Demo Talep Et</button>
            </div>
          </nav>

          {/* hero grid */}
          <div className="l-hero-grid">
            <div>
              <div className="l-hero-eyebrow"><span className="l-hero-dot" />Çok şubeli hospitality için işletim sistemi</div>
              <h1 className="l-hero-title">Her şubeyi<br /><span className="hl">en iyi şuben</span><br />gibi yönet.</h1>
              <p className="l-hero-desc">Vardiya, bordro, envanter ve finans — restoran ve kafe zincirleri için tek sistemde, ilk günden SGK uyumlu.</p>
              <div className="l-hero-actions">
                <button className="l-btn-hero-primary" onClick={() => navigate("/app")}>Demo Talep Et →</button>
                <button className="l-btn-hero-secondary" onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}>Nasıl çalışır?</button>
              </div>
            </div>

            {/* mockup */}
            <div className="l-mockup">
              <div className="l-mockup-dots"><span style={{ background: "#FF5F57" }} /><span style={{ background: "#FEBC2E" }} /><span style={{ background: "#28C840" }} /></div>
              <div className="l-mock-hero">
                <div>
                  <div style={{ fontSize: 9, color: "#7C7A75" }}>İşveren Maliyeti · Haziran</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>₺55.687</div>
                </div>
                <div style={{ fontSize: 9, color: "#00c853", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00c853" }} />Canlı</div>
              </div>
              <div className="l-mock-row">
                <div className="l-mock-stat"><div style={{ fontSize: 15, fontWeight: 700, color: "#15803D" }}>%28,4</div><div style={{ fontSize: 8, color: "#8A867F" }}>işçilik oranı</div></div>
                <div className="l-mock-stat"><div style={{ fontSize: 15, fontWeight: 700 }}>12</div><div style={{ fontSize: 8, color: "#8A867F" }}>aktif şube</div></div>
                <div className="l-mock-stat"><div style={{ fontSize: 15, fontWeight: 700 }}>48</div><div style={{ fontSize: 8, color: "#8A867F" }}>personel</div></div>
              </div>
              <div className="l-mock-shift"><span style={{ fontSize: 10, color: "#15803D" }}>Dilek — Sabah vardiyası</span><span style={{ fontSize: 8, color: "#15803D", background: "#fff", padding: "1px 7px", borderRadius: 5 }}>Onaylı</span></div>
              <div className="l-mock-shift" style={{ background: "#FEF6E7" }}><span style={{ fontSize: 10, color: "#C68A12" }}>Mert — Akşam vardiyası</span><span style={{ fontSize: 8, color: "#C68A12", background: "#fff", padding: "1px 7px", borderRadius: 5 }}>Bekliyor</span></div>
            </div>
          </div>

          {/* trust */}
          <div className="l-hero-trust">
            <div className="l-trust-label">Sahada<br />test ediliyor</div>
            <div className="l-trust-div" />
            <div className="l-trust-item" style={{ fontWeight: 600, color: "#fff" }}><i className="ti ti-coffee" style={{ fontSize: 16, color: "#00c853" }} />Georgia Coffee & Chocolate</div>
            <div className="l-trust-item"><i className="ti ti-shield-check" style={{ fontSize: 15, color: "#00c853" }} />SGK Uyumlu</div>
            <div className="l-trust-item"><i className="ti ti-lock" style={{ fontSize: 15, color: "#00c853" }} />KVKK</div>
          </div>
        </div>

        {/* ============ STATS ============ */}
        <div className="l-stats">
          <div className="l-stat"><div className="l-stat-num" style={{ color: "#fff" }}>1 → 50</div><div className="l-stat-label">lokasyon, tek panel</div></div>
          <div className="l-stat-div" />
          <div className="l-stat"><div className="l-stat-num" style={{ color: "#fff" }}>6</div><div className="l-stat-label">modül, tek giriş</div></div>
          <div className="l-stat-div" />
          <div className="l-stat"><div className="l-stat-num" style={{ color: "#00c853" }}>0</div><div className="l-stat-label">excel gerekmez</div></div>
          <div className="l-stat-div" />
          <div className="l-stat"><div className="l-stat-num" style={{ color: "#fff" }}>%100</div><div className="l-stat-label">denetim kayıtlı finans</div></div>
        </div>

        {/* ============ MODULES ============ */}
        <div className="l-section" id="modules">
          <div className="reveal" style={{ maxWidth: 560 }}>
            <div className="l-eyebrow">Platform</div>
            <h2 className="l-h2">Tüm operasyon için<br />tek sistem.</h2>
            <p className="l-lead">Aynı veriyi paylaşan altı modül — bir vardiya değişikliği bordroyu, bir sevkiyat finansı güncelliyor. Export yok, çift giriş yok.</p>
          </div>
          <div className="l-modules">
            {modules.map((m, i) => (
              <div key={i} className={`l-mod reveal reveal-d${i % 3} ${m.featured ? "featured" : ""}`}>
                <div className="l-mod-icon"><i className={`ti ${m.icon}`} style={{ fontSize: 20, color: m.featured ? "#00c853" : "#3C3A36" }} /></div>
                <div className="l-mod-title">{m.title}</div>
                <div className="l-mod-desc">{m.desc}</div>
                <span className={`l-status l-status-${m.status}`}>
                  {m.status === "live" ? "● Canlı" : m.status === "dev" ? "Geliştiriliyor" : "Yakında"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ============ HOW ============ */}
        <div className="l-how">
          <div className="l-section">
            <div className="reveal" style={{ maxWidth: 520 }}>
              <div className="l-eyebrow">Nasıl çalışır</div>
              <h2 className="l-h2">Bir öğleden sonrada<br />kurulur, çeyrek dönemde değil.</h2>
            </div>
            <div className="l-steps">
              {steps.map((s, i) => (
                <div key={i} className={`l-step reveal reveal-d${i}`}>
                  <div className="l-step-n">ADIM {s.n}</div>
                  <div className="l-step-title">{s.title}</div>
                  <div className="l-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ QUOTE ============ */}
        <div className="l-quote">
          <div className="l-quote-stars reveal">★★★★★</div>
          <p className="l-quote-text reveal">"12 şubeyi yönetmek tüm haftamı alıyordu.<br />Artık <em>bir saat</em> sürüyor."</p>
          <p className="l-quote-attr reveal">Operasyon Müdürü · Georgia Coffee & Chocolate, İstanbul</p>
        </div>

        {/* ============ CTA ============ */}
        <div className="l-cta">
          <div className="l-cta-glow" />
          <div className="l-cta-inner">
            <h2 className="l-cta-title reveal">Operasyonunu yönetişini<br /><em>canlı</em> gör.</h2>
            <p className="l-cta-desc reveal">Türkiye genelinde erken partnerleri sisteme alıyoruz. Canlı demo al, ürünü bizimle şekillendir.</p>
            <div className="l-cta-actions reveal">
              <button className="l-btn-hero-primary" onClick={() => navigate("/app")}>Demo Talep Et →</button>
              <button className="l-btn-hero-secondary" onClick={() => navigate("/app")}>Giriş Yap</button>
            </div>
          </div>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="l-footer">
          <div className="l-footer-logo">WHITE<span>.</span>AI</div>
          <div className="l-footer-copy">© 2026 WHITE.AI · İstanbul, Türkiye</div>
          <div className="l-footer-links">
            <a>Platform</a>
            <a>Gizlilik</a>
            <a onClick={() => navigate("/app")}>Giriş Yap</a>
          </div>
        </footer>
      </div>
    </>
  );
}
