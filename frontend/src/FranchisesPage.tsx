// --- Franchises Page (brand-owner only) ---
// Marka sahibi franchise'larını yönetir: listeler, yeni ekler (link_type seçer),
// ve her franchise'a owner atar (iki adım: önce franchise, sonra owner).
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

export function FranchisesPage({ token }: { token: string }) {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", link_type: "franchise" });
  const [error, setError] = useState("");

  // Owner atama modalı
  const [assignFor, setAssignFor] = useState<any>(null);
  const [ownerForm, setOwnerForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [ownerError, setOwnerError] = useState("");
  const [ownerSaving, setOwnerSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/oversight/subs`, { headers });
      setSubs(res.data);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createSub = async () => {
    setError("");
    if (!form.name || !form.email) { setError("Ad ve e-posta zorunlu."); return; }
    try {
      await axios.post(`${API_URL}/oversight/subs`, form, { headers });
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", address: "", link_type: "franchise" });
      await load();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Franchise eklenemedi.");
    }
  };

  const assignOwner = async () => {
    setOwnerError("");
    if (!ownerForm.first_name || !ownerForm.email || !ownerForm.password) {
      setOwnerError("Ad, e-posta ve şifre zorunlu."); return;
    }
    setOwnerSaving(true);
    try {
      await axios.post(`${API_URL}/users`, {
        first_name: ownerForm.first_name,
        last_name: ownerForm.last_name,
        email: ownerForm.email,
        password: ownerForm.password,
        company_id: assignFor.id,
        role: "owner",
      }, { headers });
      setAssignFor(null);
      setOwnerForm({ first_name: "", last_name: "", email: "", password: "" });
    } catch (e: any) {
      setOwnerError(e.response?.data?.detail || "Owner atanamadı.");
    } finally {
      setOwnerSaving(false);
    }
  };

  const badge = (linkType: string) => (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
      textTransform: "uppercase", letterSpacing: "0.05em",
      background: linkType === "full" ? "#e0f2fe" : "#fef3c7",
      color: linkType === "full" ? "#0369a1" : "#92400e",
    }}>{linkType === "full" ? "Tam Şube" : "Franchise"}</span>
  );

  return (
    <div>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Franchise'larım</h1>
          <p className="page-subtitle">Markanıza bağlı şirketleri yönetin, yeni franchise ekleyin ve yönetici atayın.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Franchise Ekle</button>
      </div>

      {loading ? (
        <div style={{ color: "#9b9b93", fontSize: 14 }}>Yükleniyor...</div>
      ) : subs.length === 0 ? (
        <div style={{ color: "#9b9b93", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
          Henüz franchise eklenmemiş. "+ Franchise Ekle" ile başlayın.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subs.map((s) => (
            <div key={s.id} className="list-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0a0a0a" }}>{s.name}</div>
                {badge(s.link_type)}
                {!s.is_active && <span style={{ fontSize: 11, color: "#dc2626" }}>askıda</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 12.5, color: "#9b9b93" }}>{s.email}</span>
                <button className="btn-primary" style={{ padding: "7px 14px", fontSize: 12.5 }}
                  onClick={() => { setAssignFor(s); setOwnerError(""); }}>
                  Yönetici Ata
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Franchise ekleme modalı */}
      {showForm && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">Yeni Franchise</span>
              <button className="app-modal-close" onClick={() => { setShowForm(false); setError(""); }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label className="app-label">Şirket Adı *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">E-posta *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">Telefon</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">Adres</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="app-input" /></div>
              <div>
                <label className="app-label">Bağ Tipi</label>
                <select value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value })} className="app-input">
                  <option value="franchise">Franchise (ayrı tüzel kişilik — bordro gizli, öneri-only)</option>
                  <option value="full">Tam Şube (kendi şubeniz — tam yetki, bordro dahil)</option>
                </select>
              </div>
              {error && <div className="inline-error">⚠ {error}</div>}
              <button className="btn-primary" onClick={createSub} style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 4 }}>Franchise Oluştur</button>
            </div>
          </div>
        </div>
      )}

      {/* Owner atama modalı */}
      {assignFor && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-header">
              <span className="app-modal-title">Yönetici Ata</span>
              <button className="app-modal-close" onClick={() => { setAssignFor(null); setOwnerError(""); }}>✕</button>
            </div>
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f8f7f4", borderRadius: 10, border: "1px solid #e5e4e0" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>{assignFor.name}</div>
              <div style={{ fontSize: 12, color: "#9b9b93" }}>Bu şirkete owner (franchise sahibi) hesabı oluşturulacak.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}><label className="app-label">Ad *</label><input value={ownerForm.first_name} onChange={(e) => setOwnerForm({ ...ownerForm, first_name: e.target.value })} className="app-input" /></div>
                <div style={{ flex: 1 }}><label className="app-label">Soyad</label><input value={ownerForm.last_name} onChange={(e) => setOwnerForm({ ...ownerForm, last_name: e.target.value })} className="app-input" /></div>
              </div>
              <div><label className="app-label">E-posta *</label><input type="email" value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} className="app-input" /></div>
              <div><label className="app-label">Geçici Şifre *</label><input value={ownerForm.password} onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })} className="app-input" placeholder="Franchise sahibi sonra değiştirir" /></div>
              {ownerError && <div className="inline-error">⚠ {ownerError}</div>}
              <button className="btn-primary" onClick={assignOwner} disabled={ownerSaving} style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 4 }}>
                {ownerSaving ? "Atanıyor..." : "Yönetici Oluştur ve Ata"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
