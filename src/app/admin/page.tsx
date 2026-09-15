"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Team = { id: string; name: string; color: string; logo: string | null };
type Battle = { id: string; title: string; teamAId: string; teamBId: string; teamA: Team; teamB: Team; _count: { supports: number } };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"teams" | "battles">("battles");
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [teamForm, setTeamForm] = useState({ name: "", color: "#ffffff", logo: "" });
  const [battleForm, setBattleForm] = useState({ title: "", teamAId: "", teamBId: "", endsAt: "" });

  useEffect(() => {
    fetchTeams();
    fetchBattles();
  }, []);

  const fetchTeams = async () => {
    const res = await fetch("/api/teams");
    if (res.ok) setTeams(await res.json());
  };

  const fetchBattles = async () => {
    const res = await fetch("/api/battles");
    if (res.ok) setBattles(await res.json());
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      if (res.ok) {
        setTeamForm({ name: "", color: "#ffffff", logo: "" });
        fetchTeams();
        alert("Equipo creado");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (battleForm.teamAId === battleForm.teamBId) {
      return alert("El Equipo A y el Equipo B no pueden ser el mismo");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(battleForm),
      });
      if (res.ok) {
        setBattleForm({ title: "", teamAId: "", teamBId: "", endsAt: "" });
        fetchBattles();
        alert("Batalla creada");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "24px" }}>
      <h1 className="title">PANEL DE ADMINISTRACIÓN</h1>
      
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        <button 
          onClick={() => setActiveTab("battles")} 
          className="team-btn" 
          style={{ background: activeTab === "battles" ? "#333" : "transparent" }}
        >
          Batallas
        </button>
        <button 
          onClick={() => setActiveTab("teams")} 
          className="team-btn" 
          style={{ background: activeTab === "teams" ? "#333" : "transparent" }}
        >
          Equipos
        </button>
      </div>

      {activeTab === "teams" && (
        <div className="action-area">
          <h2 className="section-title">CREAR EQUIPO</h2>
          <form onSubmit={handleCreateTeam}>
            <div className="form-group">
              <label>Nombre del Equipo</label>
              <input required value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Color representativo (Hex)</label>
              <input type="color" required value={teamForm.color} onChange={e => setTeamForm({...teamForm, color: e.target.value})} style={{ width: "100%", height: "48px" }} />
            </div>
            <div className="form-group">
              <label>URL Logo (Opcional)</label>
              <input value={teamForm.logo} onChange={e => setTeamForm({...teamForm, logo: e.target.value})} />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>CREAR EQUIPO</button>
          </form>

          <h2 className="section-title" style={{ marginTop: "40px" }}>EQUIPOS EXISTENTES</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {teams.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#1a1a24", padding: "12px", borderRadius: "8px" }}>
                <div style={{ width: 24, height: 24, background: t.color, borderRadius: "50%" }}></div>
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "battles" && (
        <div className="action-area">
          <h2 className="section-title">CREAR BATALLA</h2>
          <form onSubmit={handleCreateBattle}>
            <div className="form-group">
              <label>Título de la Batalla</label>
              <input required value={battleForm.title} onChange={e => setBattleForm({...battleForm, title: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Equipo A</label>
                <select required value={battleForm.teamAId} onChange={e => setBattleForm({...battleForm, teamAId: e.target.value})} style={{ width: "100%", padding: "12px", background: "#0f1115", border: "1px solid #2d3340", color: "#fff" }}>
                  <option value="">Selecciona...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Equipo B</label>
                <select required value={battleForm.teamBId} onChange={e => setBattleForm({...battleForm, teamBId: e.target.value})} style={{ width: "100%", padding: "12px", background: "#0f1115", border: "1px solid #2d3340", color: "#fff" }}>
                  <option value="">Selecciona...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Fecha de Finalización (Opcional)</label>
              <input type="datetime-local" value={battleForm.endsAt} onChange={e => setBattleForm({...battleForm, endsAt: e.target.value})} />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>CREAR BATALLA</button>
          </form>

          <h2 className="section-title" style={{ marginTop: "40px" }}>BATALLAS EXISTENTES</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {battles.map(b => (
              <div key={b.id} style={{ background: "#1a1a24", padding: "16px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.2rem", margin: 0 }}>{b.title}</h3>
                  <Link href={`/b/${b.id}`} style={{ color: "#3b82f6" }}>Ver pública</Link>
                </div>
                <div style={{ margin: "12px 0", color: "#94a3b8" }}>
                  <span style={{ color: b.teamA?.color }}>{b.teamA?.name}</span> vs <span style={{ color: b.teamB?.color }}>{b.teamB?.name}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Participaciones registradas: {b._count?.supports || 0}
                  {b._count?.supports > 0 && (
                    <span style={{ color: "#ef4444", display: "block", marginTop: "4px" }}>
                      ⚠️ Esta batalla ya tiene pagos registrados. No se pueden modificar sus equipos.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
