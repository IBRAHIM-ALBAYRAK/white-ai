import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll reveal
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

  return (
    <>
      <style>{`
        .landing * { box-sizing: border-box; }
        .landing { font-family: 'Inter', sans-serif; color: #0a0a0a; background: white; overflow-x: hidden; }
        .landing a { text-decoration: none; }

        /* NAV */
        .l-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 68px;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid #e5e4e0;
        }
        .l-logo { font-family: 'Bricolage Grotesque', 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.03em; }
        .l-logo span { color: #00c853; }
        .l-nav-links { display: flex; gap: 4px; }
        .l-nav-links a { color: #5a5a54; font-size: 14px; padding: 8px 14px; border-radius: 8px; transition: background 0.2s, color 0.2s; }
        .l-nav-links a:hover { background: #f2f1ee; color: #0a0a0a; }
        .l-nav-right { display: flex; gap: 12px; align-items: center; }
        .l-btn-ghost { color: #5a5a54; font-size: 14px; padding: 8px 16px; border-radius: 8px; transition: background 0.2s; cursor: pointer; background: none; border: none; font-family: inherit; }
        .l-btn-ghost:hover { background: #f2f1ee; color: #0a0a0a; }
        .l-btn-primary { background: #0a0a0a; color: white; font-size: 14px; font-weight: 500; padding: 10px 22px; border-radius: 10px; cursor: pointer; transition: opacity 0.2s, transform 0.2s; border: none; font-family: inherit; }
        .l-btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ANNOUNCEMENT */
        .l-announce {
          background: #0a0a0a; color: white; text-align: center;
          padding: 10px 20px; font-size: 13px;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          margin-top: 68px;
        }
        .l-announce a { color: #ffd600; font-weight: 500; cursor: pointer; }
        .l-announce a:hover { text-decoration: underline; }

        /* HERO */
        .l-hero {
          position: relative; min-height: calc(100vh - 100px);
          display: flex; align-items: center; overflow: hidden; background: white;
        }
        .l-hero-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 70% 50%, rgba(0,200,83,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse 50% 80% at 90% 20%, rgba(255,214,0,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .l-hero-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; width: 100%; max-width: 1280px;
          margin: 0 auto; padding: -100px 48px 80px; gap: 60px;
        }
        .l-hero-tag {
          display: inline-flex; align-items: center; gap: 10px;
          background: #f2f1ee; border: 1px solid #e5e4e0; border-radius: 100px;
          padding: 10px 20px 10px 12px; font-size: 15px; color: #3a3a34; font-weight: 500;
          margin-bottom: 20px; margin-left: -80px;
          animation: fadeInUp 0.6s ease both;
        }
        .l-tag-dot { width: 20px; height: 20px; background: #00c853; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        .l-hero-title {
          font-family: 'Bricolage Grotesque', 'Syne', sans-serif;
          margin-left: -80px;
          font-size: clamp(44px, 5.5vw, 72px); font-weight: 800;
          line-height: 1.0; letter-spacing: -0.035em; margin-bottom: 24px;
          margin-left: -80px;
          animation: fadeInUp 0.6s ease 0.1s both;
        }
        .l-highlight { color: #00c853; position: relative; display: inline-block; }
        .l-hero-desc {
          font-size: 18px; color: #5a5a54; font-weight: 300;
          line-height: 1.7; max-width: 480px; margin-bottom: 40px;
          margin-left: -80px;
          animation: fadeInUp 0.6s ease 0.2s both;
        }
        .l-hero-actions { 
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap; 
          margin-left: -80px;
}
        .l-btn-hero-primary {
          background: #0a0a0a; color: white; font-size: 15px; font-weight: 500;
          padding: 14px 32px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px;
          transition: transform 0.2s, opacity 0.2s; cursor: pointer; border: none; font-family: inherit;
        }
        .l-btn-hero-primary:hover { transform: translateY(-2px); opacity: 0.88; }
        .l-btn-hero-secondary {
          background: #f2f1ee; color: #0a0a0a; font-size: 15px; font-weight: 500;
          padding: 14px 28px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid #e5e4e0; transition: background 0.2s, transform 0.2s; cursor: pointer; font-family: inherit;
        }
        .l-btn-hero-secondary:hover { background: #e5e4e0; transform: translateY(-2px); }
        .l-hero-bullets { 
          display: flex; flex-direction: column; gap: 10px; margin-top: 36px; 
          margin-left: -80px;
          animation: fadeInUp 0.6s ease 0.4s both; 
        }
        .l-bullet { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #5a5a54; }
        .l-bullet-check { width: 20px; height: 20px; background: rgba(0,200,83,0.12); color: #00c853; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }

        /* HERO RIGHT */
        .l-hero-right { position: relative; height: 560px; animation: fadeInRight 0.8s ease 0.3s both; }
        .l-hero-img { position: absolute; inset: 0; border-radius: 24px; overflow: hidden; background: linear-gradient(135deg, #e8f5e9 0%, #f3e5f5 50%, #e3f2fd 100%); }
        .l-person-svg { position: absolute; bottom: 0; right: 10%; width: 75%; height: 95%; }

        /* FLOATING CARDS */
        .l-fc { position: absolute; background: white; border-radius: 16px; padding: 16px 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); z-index: 10; }
        .l-fc-1 { top: 60px; left: -20px; min-width: 220px; animation: float 4s ease-in-out infinite; }
        .l-fc-2 { bottom: 100px; left: -30px; min-width: 200px; animation: float 4s ease-in-out 1.5s infinite; }
        .l-fc-3 { top: 180px; right: -10px; min-width: 180px; animation: float 4s ease-in-out 0.8s infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .l-fc-label { font-size: 11px; color: #9b9b93; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .l-fc-value { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.02em; }
        .l-fc-green { color: #00c853; }
        .l-fc-sub { font-size: 12px; color: #9b9b93; margin-top: 2px; }
        .l-shift-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .l-shift-item { display: flex; align-items: center; justify-content: space-between; font-size: 12px; padding: 6px 10px; background: #f2f1ee; border-radius: 8px; }
        .l-badge { font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 600; }
        .l-badge-green { background: rgba(0,200,83,0.12); color: #00a843; }
        .l-badge-yellow { background: rgba(255,214,0,0.2); color: #b38600; }
        .l-fc-row { display: flex; align-items: center; gap: 10px; }
        .l-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: 700; }

        /* TRUSTED */
        .l-trusted { border-top: 1px solid #e5e4e0; border-bottom: 1px solid #e5e4e0; padding: 32px 48px; display: flex; align-items: center; gap: 48px; overflow: hidden; }
        .l-trusted-label { font-size: 13px; color: #9b9b93; white-space: nowrap; }
        .l-logos { display: flex; gap: 48px; align-items: center; animation: scrollLogos 20s linear infinite; }
        .l-logo-item { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; color: #9b9b93; white-space: nowrap; }
        @keyframes scrollLogos { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* MODULES */
        .l-modules { padding: 100px 48px; max-width: 1280px; margin: 0 auto; }
        .l-section-header { text-align: center; margin-bottom: 64px; }
        .l-section-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,200,83,0.1); color: #00a843; border-radius: 100px; padding: 5px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 16px; }
        .l-section-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(32px, 4vw, 52px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 16px; }
        .l-section-desc { font-size: 17px; color: #5a5a54; max-width: 520px; margin: 0 auto; font-weight: 300; }
        .l-modules-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .l-module-card { border: 1px solid #e5e4e0; border-radius: 20px; padding: 32px; background: white; transition: transform 0.3s, box-shadow 0.3s; }
        .l-module-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .l-module-card.featured { background: #0a0a0a; color: white; border-color: #0a0a0a; }
        .l-module-card.featured .l-module-desc { color: rgba(255,255,255,0.55); }
        .l-module-icon { width: 48px; height: 48px; border-radius: 14px; background: #f2f1ee; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .l-module-card.featured .l-module-icon { background: rgba(255,255,255,0.12); }
        .l-module-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.01em; }
        .l-module-desc { font-size: 14px; color: #5a5a54; line-height: 1.6; font-weight: 300; margin-bottom: 20px; }
        .l-status { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 100px; display: inline-block; }
        .l-status-live { background: rgba(0,200,83,0.1); color: #00a843; }
        .l-status-dev { background: rgba(255,214,0,0.15); color: #b38600; }
        .l-status-soon { background: #f2f1ee; color: #5a5a54; }

        /* QUOTE */
        .l-quote { padding: 80px 48px; text-align: center; border-top: 1px solid #e5e4e0; }
        .l-quote-text { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(24px, 3vw, 40px); font-weight: 700; letter-spacing: -0.025em; line-height: 1.25; max-width: 800px; margin: 0 auto 24px; }
        .l-quote-text em { font-style: normal; color: #00c853; }
        .l-quote-attr { font-size: 14px; color: #9b9b93; }

        /* CTA */
        .l-cta { background: #0a0a0a; padding: 100px 48px; text-align: center; position: relative; overflow: hidden; }
        .l-cta-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%); pointer-events: none; }
        .l-cta-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(36px, 5vw, 64px); font-weight: 800; letter-spacing: -0.03em; color: white; margin-bottom: 20px; position: relative; }
        .l-cta-title em { font-style: normal; color: #00c853; }
        .l-cta-desc { font-size: 17px; color: rgba(255,255,255,0.5); max-width: 480px; margin: 0 auto 40px; font-weight: 300; }
        .l-cta-actions { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .l-btn-cta-primary { background: #00c853; color: white; font-size: 15px; font-weight: 600; padding: 16px 40px; border-radius: 12px; cursor: pointer; border: none; font-family: inherit; transition: opacity 0.2s, transform 0.2s; }
        .l-btn-cta-primary:hover { opacity: 0.88; transform: translateY(-2px); }
        .l-btn-cta-ghost { color: rgba(255,255,255,0.6); font-size: 14px; padding: 16px 24px; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; background: none; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .l-btn-cta-ghost:hover { background: rgba(255,255,255,0.08); color: white; }

        /* FOOTER */
        .l-footer { border-top: 1px solid #e5e4e0; padding: 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px; }
        .l-footer-logo { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.02em; }
        .l-footer-logo span { color: #00c853; }
        .l-footer-copy { font-size: 13px; color: #9b9b93; }
        .l-footer-links { display: flex; gap: 24px; }
        .l-footer-links a { font-size: 13px; color: #9b9b93; transition: color 0.2s; }
        .l-footer-links a:hover { color: #0a0a0a; }

        /* ANIMATIONS */
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />

      <div className="landing">
        {/* NAV */}
        <nav className="l-nav">
          <div className="l-logo">WHITE<span>.</span>AI</div>
          <div className="l-nav-links">
            <a href="#modules">Platform</a>
            <a href="#features">Features</a>
          </div>
          <div className="l-nav-right">
            <button className="l-btn-ghost" onClick={() => navigate("/app")}>Log In</button>
            <button className="l-btn-primary" onClick={() => navigate("/app")}>Book a Demo</button>
          </div>
        </nav>

        {/* ANNOUNCEMENT */}
        <div className="l-announce">
        ✦ Run every team. Every branch. Every operation.
          <a onClick={() => navigate("/app")}>Get early access →</a>
        </div>

        {/* HERO */}
        <section className="l-hero">
          <div className="l-hero-bg"></div>
          <div className="l-hero-inner">
            <div>
              <div className="l-hero-tag">
                <div className="l-tag-dot">✦</div>
                AI-Powered Operating System for Businesses That Run on People.
              </div>
              <h1 className="l-hero-title">
                Smarter shifts.<br/>
                Leaner costs.<br/>
                <span className="l-highlight">Powered by AI.</span>
              </h1>
              <p className="l-hero-desc">
                From first hire to final pay — WHITE.AI unifies workforce, inventory, and analytics for restaurants and hospitality chains across Türkiye.
              </p>
              <div className="l-hero-actions">
                <button className="l-btn-hero-primary" onClick={() => navigate("/app")}>
                  Book a Demo →
                </button>
                <button className="l-btn-hero-secondary" onClick={() => document.getElementById("modules")?.scrollIntoView({behavior:"smooth"})}>
                  See how it works
                </button>
              </div>
              <div className="l-hero-bullets">
                <div className="l-bullet"><div className="l-bullet-check">✓</div> SGK & Turkish labor law compliance built-in</div>
                <div className="l-bullet"><div className="l-bullet-check">✓</div> Multi-branch from day one — 1 or 50 locations</div>
                <div className="l-bullet"><div className="l-bullet-check">✓</div> AI forecasting for staffing and inventory</div>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="l-hero-right">
              <div className="l-hero-img">
                <svg className="l-person-svg" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="200" cy="480" rx="120" ry="30" fill="rgba(0,0,0,0.06)"/>
                  <rect x="155" y="320" width="40" height="160" rx="20" fill="#1a1a2e"/>
                  <rect x="205" y="320" width="40" height="160" rx="20" fill="#16213e"/>
                  <ellipse cx="175" cy="480" rx="28" ry="10" fill="#0a0a0a"/>
                  <ellipse cx="225" cy="480" rx="28" ry="10" fill="#0a0a0a"/>
                  <rect x="130" y="180" width="140" height="160" rx="20" fill="white"/>
                  <rect x="190" y="190" width="20" height="140" rx="4" fill="#f0f0f0"/>
                  <circle cx="200" cy="210" r="5" fill="#e0e0e0"/>
                  <circle cx="200" cy="230" r="5" fill="#e0e0e0"/>
                  <circle cx="200" cy="250" r="5" fill="#e0e0e0"/>
                  <rect x="85" y="185" width="50" height="120" rx="25" fill="#f5c5a3"/>
                  <rect x="265" y="185" width="50" height="100" rx="25" fill="#f5c5a3"/>
                  <rect x="260" y="265" width="70" height="50" rx="10" fill="#333"/>
                  <rect x="263" y="268" width="64" height="44" rx="8" fill="#4a90e2"/>
                  <rect x="268" y="273" width="54" height="6" rx="3" fill="rgba(255,255,255,0.7)"/>
                  <rect x="268" y="283" width="40" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
                  <rect x="268" y="291" width="48" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
                  <rect x="268" y="299" width="35" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
                  <rect x="183" y="155" width="34" height="35" rx="8" fill="#f5c5a3"/>
                  <ellipse cx="200" cy="130" rx="52" ry="58" fill="#f5c5a3"/>
                  <ellipse cx="200" cy="88" rx="52" ry="22" fill="#2c1810"/>
                  <rect x="148" y="88" width="20" height="30" rx="10" fill="#2c1810"/>
                  <rect x="232" y="88" width="20" height="30" rx="10" fill="#2c1810"/>
                  <ellipse cx="183" cy="128" rx="7" ry="8" fill="white"/>
                  <ellipse cx="217" cy="128" rx="7" ry="8" fill="white"/>
                  <circle cx="185" cy="129" r="4" fill="#2c1810"/>
                  <circle cx="219" cy="129" r="4" fill="#2c1810"/>
                  <circle cx="186" cy="127" r="1.5" fill="white"/>
                  <circle cx="220" cy="127" r="1.5" fill="white"/>
                  <path d="M185 148 Q200 160 215 148" stroke="#c4836a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <path d="M176 118 Q183 114 190 118" stroke="#2c1810" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M210 118 Q217 114 224 118" stroke="#2c1810" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="60" cy="100" r="40" fill="rgba(0,200,83,0.06)"/>
                  <circle cx="350" cy="350" r="60" fill="rgba(255,214,0,0.06)"/>
                </svg>
              </div>
              <div className="l-fc l-fc-1">
                <div className="l-fc-label">This week's shifts</div>
                <div className="l-shift-list">
                  <div className="l-shift-item"><span>Ali K. — Morning</span><span className="l-badge l-badge-green">Confirmed</span></div>
                  <div className="l-shift-item"><span>Zeynep A. — Evening</span><span className="l-badge l-badge-yellow">Pending</span></div>
                  <div className="l-shift-item"><span>Mehmet S. — Morning</span><span className="l-badge l-badge-green">Confirmed</span></div>
                </div>
              </div>
              <div className="l-fc l-fc-2">
                <div className="l-fc-label">Labor cost ratio</div>
                <div className="l-fc-value l-fc-green">28.4%</div>
                <div className="l-fc-sub">↓ 3.2% vs last week</div>
              </div>
              <div className="l-fc l-fc-3">
                <div className="l-fc-label">Overtime alert</div>
                <div className="l-fc-row">
                  <div className="l-avatar" style={{background:"linear-gradient(135deg,#ffd600,#ff9800)"}}>⚠</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>Ali is at 43h</div>
                    <div className="l-fc-sub" style={{fontSize:11}}>2h until overtime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUSTED */}
        <div className="l-trusted">
          <div className="l-trusted-label">Designed for</div>
          <div style={{overflow:"hidden", flex:1}}>
            <div className="l-logos">
              {["Georgia Coffee & Chocolate","Restoran Zincirleri","Kafe İşletmeleri","Otel Grupları","Fast Casual Chains","Fine Dining Groups",
                "Georgia Coffee & Chocolate","Restoran Zincirleri","Kafe İşletmeleri","Otel Grupları","Fast Casual Chains","Fine Dining Groups"
              ].map((l,i) => <span key={i} className="l-logo-item">{l}</span>)}
            </div>
          </div>
        </div>

        {/* MODULES */}
        <div className="l-modules" id="modules">
          <div className="l-section-header reveal">
            <div className="l-section-tag">✦ The Platform</div>
            <h2 className="l-section-title">Everything your operation needs.<br/>Nothing it doesn't.</h2>
            <p className="l-section-desc">8 integrated modules — from scheduling to AI forecasting — built for hospitality.</p>
          </div>
          <div className="l-modules-grid">
            {[
              {icon:"👥", title:"Workforce Management", desc:"Drag-and-drop scheduling, overtime alerts, and instant shift notifications.", status:"live", featured:true},
              {icon:"📦", title:"Inventory Control", desc:"Real-time stock levels, recipe cost analysis, and automatic reorder triggers.", status:"dev"},
              {icon:"⏱️", title:"Time Clock", desc:"Biometric check-in, GPS verification, and anti-fraud detection.", status:"dev"},
              {icon:"💰", title:"HR & Payroll", desc:"Automated payroll with SGK compliance and Turkish labor law.", status:"soon"},
              {icon:"💳", title:"Earned Wage Access", desc:"Let staff access earned pay before payday. Manager-approved.", status:"soon"},
              {icon:"🤖", title:"AI Forecasting", desc:"Sales predictions using 2 years of data, weather, and local events.", status:"soon"},
            ].map((m, i) => (
              <div key={i} className={`l-module-card reveal reveal-d${i%3} ${m.featured?"featured":""}`}>
                <div className="l-module-icon">{m.icon}</div>
                <div className="l-module-title">{m.title}</div>
                <div className="l-module-desc">{m.desc}</div>
                <span className={`l-status l-status-${m.status}`}>
                  {m.status==="live"?"● Live Now": m.status==="dev"?"In Development":"Coming Soon"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUOTE */}
        <div className="l-quote reveal" id="features">
          <p className="l-quote-text">
            "Managing 12 branches used to take<br/>my entire week. Now it takes <em>an hour.</em>"
          </p>
          <p className="l-quote-attr">— Operations Manager · Georgia Coffee & Chocolate, Istanbul</p>
        </div>

        {/* CTA */}
        <div className="l-cta">
          <div className="l-cta-glow"></div>
          <div className="l-cta-title reveal">Ready to see<br/><em>WHITE.AI</em> in action?</div>
          <p className="l-cta-desc reveal">We're onboarding early partners in Türkiye. Get a live demo and shape the product with us.</p>
          <div className="l-cta-actions reveal">
            <button className="l-btn-cta-primary" onClick={() => navigate("/app")}>Book a Demo →</button>
            <button className="l-btn-cta-ghost" onClick={() => navigate("/app")}>Sign In</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="l-footer">
          <div className="l-footer-logo">WHITE<span>.</span>AI</div>
          <div className="l-footer-copy">© 2026 WHITE.AI. All rights reserved.</div>
          <div className="l-footer-links">
            <a href="#">Platform</a>
            <a href="#">Privacy</a>
            <a onClick={() => navigate("/app")} style={{cursor:"pointer"}}>Sign In</a>
          </div>
        </footer>
      </div>
    </>
  );
}