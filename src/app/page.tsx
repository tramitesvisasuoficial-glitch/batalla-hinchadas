"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreatorDashboard() {
  const [loading, setLoading] = useState(false);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    teamAName: "",
    teamAColor: "#00d2ff",
    teamBName: "",
    teamBColor: "#ff0055",
    endsAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const battle = await response.json();
        setBattleId(battle.id);
      } else {
        alert("Error al crear la batalla");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/b/${battleId}`;
    navigator.clipboard.writeText(url);
    alert("¡Enlace copiado al portapapeles!");
  };

  if (battleId) {
    return (
      <main className="container">
        <div className="action-area" style={{ textAlign: "center" }}>
          <h1 className="title" style={{ fontSize: "2rem" }}>¡BATALLA CREADA!</h1>
          <p style={{ marginBottom: "24px", color: "#94a3b8" }}>
            Comparte este enlace público con tu audiencia para que empiecen a apoyar.
          </p>
          
          <div style={{ background: "#0f1115", padding: "16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #2d3340", wordBreak: "break-all" }}>
            {`${typeof window !== "undefined" ? window.location.origin : ""}/b/${battleId}`}
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="team-btn" onClick={copyLink} style={{ flex: "none", width: "auto" }}>
              Copiar Enlace
            </button>
            <Link href={`/b/${battleId}`} style={{ textDecoration: "none" }}>
              <button className="submit-btn" style={{ marginTop: 0, padding: "16px 24px" }}>
                Ver Batalla
              </button>
            </Link>
          </div>
          
          <button onClick={() => setBattleId(null)} style={{ marginTop: "32px", color: "#94a3b8", textDecoration: "underline" }}>
            Crear otra batalla
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <h1 className="title">⚽ CREADOR DE BATALLAS</h1>
      <p className="subtitle">Crea una nueva batalla de hinchadas para tu transmisión.</p>

      <div className="action-area">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título de la Batalla</label>
            <input 
              type="text" 
              required 
              placeholder="Ej: El Clásico, Gran Final, etc."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hinchada A (Nombre)</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Madridistas"
                value={formData.teamAName}
                onChange={e => setFormData({...formData, teamAName: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hinchada A (Color Hex)</label>
              <input 
                type="color" 
                required 
                style={{ width: "100%", height: "48px", padding: "4px" }}
                value={formData.teamAColor}
                onChange={e => setFormData({...formData, teamAColor: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hinchada B (Nombre)</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Culés"
                value={formData.teamBName}
                onChange={e => setFormData({...formData, teamBName: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hinchada B (Color Hex)</label>
              <input 
                type="color" 
                required 
                style={{ width: "100%", height: "48px", padding: "4px" }}
                value={formData.teamBColor}
                onChange={e => setFormData({...formData, teamBColor: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label>Fecha y Hora de Finalización (Opcional)</label>
            <input 
              type="datetime-local" 
              value={formData.endsAt}
              onChange={e => setFormData({...formData, endsAt: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            style={{ marginTop: "32px" }}
            disabled={loading}
          >
            {loading ? "CREANDO EN BASE DE DATOS..." : "🔥 GENERAR ENLACES"}
          </button>
        </form>
      </div>
    </main>
  );
}
