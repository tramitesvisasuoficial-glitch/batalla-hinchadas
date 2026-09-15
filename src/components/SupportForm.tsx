"use client";

import { useState } from "react";
import { Battle, Support } from "@prisma/client";

interface SupportFormProps {
  battle: Battle & { supports: Support[] };
  initialTeamATotal: number;
  initialTeamBTotal: number;
}

export default function SupportForm({ battle, initialTeamATotal, initialTeamBTotal }: SupportFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B">("A");
  const [amount, setAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // Used only as fallback if no URL is returned

  const total = initialTeamATotal + initialTeamBTotal;
  const progressA = total === 0 ? 50 : (initialTeamATotal / total) * 100;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) return alert("Ingresa un monto válido");
    
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/supports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId: battle.id,
          team: selectedTeam,
          amount: currentAmount,
          supporterName,
          message
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          setSuccess(true);
        }
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="battle-header">
        <div className="team-score team-a">
          <div className="team-name" style={{ color: battle.teamAColor }}>{battle.teamAName}</div>
          <div className="score">${initialTeamATotal.toFixed(2)}</div>
        </div>
        <div className="vs">VS</div>
        <div className="team-score team-b">
          <div className="team-name" style={{ color: battle.teamBColor }}>{battle.teamBName}</div>
          <div className="score">${initialTeamBTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="progress-container" style={{ background: battle.teamBColor }}>
        <div 
          className="progress-a" 
          style={{ width: `${progressA}%`, background: battle.teamAColor }}
        ></div>
      </div>

      <div className="action-area">
        <h2 className="section-title">ELIGE TU EQUIPO</h2>
        
        <div className="team-selector">
          <button 
            onClick={() => setSelectedTeam("A")}
            className={`team-btn ${selectedTeam === "A" ? "active" : ""}`} 
            style={{ 
              borderColor: battle.teamAColor, 
              color: selectedTeam === "A" ? "#000" : battle.teamAColor,
              background: selectedTeam === "A" ? battle.teamAColor : "transparent"
            }}
          >
            {battle.teamAName}
          </button>
          <button 
            onClick={() => setSelectedTeam("B")}
            className={`team-btn ${selectedTeam === "B" ? "active" : ""}`} 
            style={{ 
              borderColor: battle.teamBColor, 
              color: selectedTeam === "B" ? "#000" : battle.teamBColor,
              background: selectedTeam === "B" ? battle.teamBColor : "transparent"
            }}
          >
            {battle.teamBName}
          </button>
        </div>

        <div className="amounts">
          {[2, 5, 10].map(val => (
            <button 
              key={val}
              onClick={() => { setAmount(val); setCustomAmount(""); }}
              className={`amount-btn ${amount === val && !customAmount ? "active" : ""}`}
            >
              ${val}
            </button>
          ))}
        </div>
        
        <div className="form-group" style={{ marginBottom: "24px" }}>
          <label>Valor de tu participación ($)</label>
          <input 
            type="number" 
            placeholder="Otro monto" 
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            max="1000"
            step="1"
          />
        </div>

        <div className="form-group">
          <label>Nombre o apodo (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ej: Hincha123" 
            value={supporterName}
            maxLength={50}
            onChange={e => setSupporterName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Mensaje (Opcional)</label>
          <input 
            type="text" 
            placeholder="Deja un mensaje corto..." 
            maxLength={80} 
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {success && (
          <div style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "12px", borderRadius: "8px", margin: "16px 0", textAlign: "center", border: "1px solid #10b981" }}>
            Estamos esperando la confirmación del pago. El marcador se actualizará automáticamente cuando la transacción sea confirmada.
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "16px", marginTop: "16px" }}>
          La participación adquirida representa una experiencia digital en este ranking. <br/>
          <strong>No es una apuesta.</strong> No otorga premios financieros ni retiros de dinero.
        </div>

        <button 
          onClick={handleSubmit}
          className="submit-btn" 
          style={{ background: "#ffffff", color: "#000" }}
          disabled={loading || currentAmount <= 0 || currentAmount > 1000}
        >
          {loading ? "PROCESANDO..." : `ADQUIRIR PARTICIPACIÓN ($${currentAmount})`}
        </button>
        
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#94a3b8", marginTop: "12px" }}>
          *Serás redirigido de forma segura a Dodo Payments.
        </p>
      </div>
    </>
  );
}
