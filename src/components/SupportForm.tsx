"use client";

import { useState, useEffect } from "react";
import { Battle, Support } from "@prisma/client";
import Countdown from "./Countdown";
import BattlePitch from "./BattlePitch";

type Team = { id: string; name: string; color: string | null; logo: string | null };

interface SupportFormProps {
  battle: Battle & { teamA: Team, teamB: Team };
  initialTeamATotal: number;
  initialTeamBTotal: number;
}

export default function SupportForm({ battle, initialTeamATotal, initialTeamBTotal }: SupportFormProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(battle.teamAId || "");
  const [amount, setAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeStatus, setTimeStatus] = useState<"before" | "active" | "ended">("active");

  const [pendingSupportId, setPendingSupportId] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<any>(null);

  const total = initialTeamATotal + initialTeamBTotal;
  const progressA = total === 0 ? 50 : (initialTeamATotal / total) * 100;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const isPlayable = battle.status === "active" && timeStatus === "active";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pendingSupportId && !confirmedData) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/supports/${pendingSupportId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.paymentStatus === "paid") {
              setConfirmedData(data);
              setPendingSupportId(null);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [pendingSupportId, confirmedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlayable) return alert("La batalla no está activa");
    if (currentAmount <= 0) return alert("Ingresa un monto válido");
    if (!selectedTeamId) return alert("Selecciona un equipo");
    
    setLoading(true);
    setConfirmedData(null);
    setPendingSupportId(null);

    try {
      const res = await fetch("/api/supports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId: battle.id,
          teamId: selectedTeamId,
          amount: currentAmount,
          currency: "USD",
          supporterName: supporterName || "Hincha Anónimo",
          message
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.support && data.support.id) {
          setPendingSupportId(data.support.id);
        }

        if (data.checkoutData) {
          const epayco = (window as any).ePayco;
          if (epayco) {
            const checkout = epayco.checkout.configure({
              key: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || "",
              test: process.env.NEXT_PUBLIC_EPAYCO_TEST === "true"
            });
            checkout.open(data.checkoutData);
          } else {
            alert("Error cargando la pasarela de pagos. Por favor intenta de nuevo.");
          }
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

  const handleShare = async () => {
    if (!confirmedData) return;
    
    const text = `🔥 Ya estoy en la Batalla de Hinchadas.\n\nEstoy apoyando al ${confirmedData.teamName} ⚪\n\nEstoy en la posición #${confirmedData.position}.\n\n¿De qué lado estás?\n\n${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Batalla de Hinchadas",
          text: text,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("¡Texto copiado al portapapeles!");
    }
  };

  const teamAColor = battle.teamA.color || "#00d2ff";
  const teamBColor = battle.teamB.color || "#ff0055";

  if (confirmedData) {
    return (
      <div className="share-card-container">
        <h2 className="success-title">🔥 ¡YA ESTÁS EN LA BATALLA!</h2>
        <div className="share-card" style={{ borderColor: confirmedData.teamColor || '#fff' }}>
          <div className="sc-header" style={{ backgroundColor: confirmedData.teamColor || '#333' }}>
            <div className="sc-avatar">{confirmedData.supporterName.substring(0,2).toUpperCase()}</div>
            <h3>{confirmedData.supporterName}</h3>
            <p>{confirmedData.teamName}</p>
          </div>
          <div className="sc-body">
            <div className="sc-stat">
              <span>Posición:</span>
              <strong>#{confirmedData.position}</strong>
            </div>
            <div className="sc-stat">
              <span>Participación:</span>
              <strong>US${confirmedData.amount.toFixed(2)}</strong>
            </div>
            <div className="sc-stat">
              <span>Insignia:</span>
              <strong>{confirmedData.badgeEmoji} {confirmedData.badge}</strong>
            </div>
          </div>
        </div>
        <button onClick={handleShare} className="submit-btn share-btn" style={{ background: confirmedData.teamColor || '#fff', color: '#000' }}>
          COMPARTIR MI PARTICIPACIÓN
        </button>
      </div>
    );
  }

  return (
    <>
      <Countdown 
        startsAt={new Date(battle.startsAt)} 
        endsAt={battle.endsAt ? new Date(battle.endsAt) : null} 
        onStatusChange={setTimeStatus} 
      />

      <BattlePitch 
        teamA={battle.teamA} 
        teamB={battle.teamB} 
        totalA={initialTeamATotal} 
        totalB={initialTeamBTotal} 
      />

      {isPlayable && !pendingSupportId && (
        <div className="action-area">
          <h2 className="section-title">APOYA A TU EQUIPO</h2>
          
          <div className="team-selector">
            <button 
              onClick={() => setSelectedTeamId(battle.teamAId || "")}
              className={`team-btn ${selectedTeamId === battle.teamAId ? "active" : ""}`} 
              style={{ 
                borderColor: teamAColor, 
                color: selectedTeamId === battle.teamAId ? "#000" : teamAColor,
                background: selectedTeamId === battle.teamAId ? teamAColor : "transparent"
              }}
            >
              {battle.teamA.name}
            </button>
            <button 
              onClick={() => setSelectedTeamId(battle.teamBId || "")}
              className={`team-btn ${selectedTeamId === battle.teamBId ? "active" : ""}`} 
              style={{ 
                borderColor: teamBColor, 
                color: selectedTeamId === battle.teamBId ? "#000" : teamBColor,
                background: selectedTeamId === battle.teamBId ? teamBColor : "transparent"
              }}
            >
              {battle.teamB.name}
            </button>
          </div>

          <div className="amounts">
            {[1, 2, 5, 10].map(val => (
              <button 
                key={val}
                onClick={() => { setAmount(val); setCustomAmount(""); }}
                className={`amount-btn ${amount === val && !customAmount ? "active" : ""}`}
              >
                US${val}
              </button>
            ))}
          </div>
          
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label>Valor de tu participación (US$)</label>
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

          <button 
            onClick={handleSubmit}
            className="submit-btn" 
            style={{ background: "#ffffff", color: "#000" }}
            disabled={loading || currentAmount <= 0 || currentAmount > 1000}
          >
            {loading ? "PROCESANDO..." : `ENTRA EN LA HINCHADA (US$${currentAmount})`}
          </button>
          
        </div>
      )}

      {pendingSupportId && !confirmedData && (
        <div className="confirming-state" style={{ padding: "40px 20px", textAlign: "center", background: "#1e293b", borderRadius: "12px", marginTop: "24px", border: "1px solid #334155" }}>
          <h3 style={{ color: "#e2e8f0", marginBottom: "16px" }}>⏳ Estamos confirmando tu participación...</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No cierres esta ventana. El ranking se actualizará automáticamente en cuanto recibamos la confirmación del pago.</p>
          <div className="spinner" style={{ margin: "20px auto", width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      )}
    </>
  );
}
