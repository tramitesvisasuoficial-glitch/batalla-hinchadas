"use client";

import { useState, useEffect } from "react";
import { Battle, Support } from "@prisma/client";
import Countdown from "./Countdown";
import { Avatar } from './Avatar';
import { compressImage } from '../lib/image-utils';
import { useRef } from 'react';
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
  const [handle, setHandle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  // Pulse animation on amount change
  useEffect(() => {
    if (currentAmount > 0 && currentAmount !== lastAmount) {
      setPulse(true);
      setLastAmount(currentAmount);
      const t = setTimeout(() => setPulse(false), 400);
      return () => clearTimeout(t);
    }
  }, [currentAmount, lastAmount]);

  const fileInputRefGallery = useRef<HTMLInputElement>(null);
  const fileInputRefCamera = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [timeStatus, setTimeStatus] = useState<"before" | "active" | "ended">("active");

  const [pendingSupportId, setPendingSupportId] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<any>(null);
  const [followEmail, setFollowEmail] = useState("");
  const [followStatus, setFollowStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [currentATotal, setCurrentATotal] = useState(initialTeamATotal);
  const [currentBTotal, setCurrentBTotal] = useState(initialTeamBTotal);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/battles/${battle.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.teamATotal !== undefined && data.teamBTotal !== undefined) {
            setCurrentATotal(data.teamATotal);
            setCurrentBTotal(data.teamBTotal);
          }
        }
      } catch (e) {
        console.error("Error polling battle stats", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [battle.id]);

  const handleFollow = async () => {
    if (!followEmail || !followEmail.includes('@')) return alert("Ingresa un email válido");
    setFollowStatus("loading");
    try {
      const res = await fetch("/api/followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battleId: battle.id, email: followEmail })
      });
      if (res.ok) setFollowStatus("success");
      else setFollowStatus("error");
    } catch {
      setFollowStatus("error");
    }
  };

  const total = currentATotal + currentBTotal;
  const progressA = total === 0 ? 50 : (currentATotal / total) * 100;

  // Definition moved up
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
      let finalAvatarUrl = null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        try {
          const uploadRes = await fetch("/api/upload-avatar", {
            method: "POST",
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalAvatarUrl = uploadData.url;
          }
        } catch (e) {
          console.error("Error al subir el avatar", e);
        }
      }

      const res = await fetch("/api/supports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battleId: battle.id,
          teamId: selectedTeamId,
          amount: currentAmount,
          currency: "USD",
          supporterName: supporterName || "Hincha Anónimo",
          message,
          handle,
          channelName,
          channelUrl,
          avatarUrl: finalAvatarUrl
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
    
    const currentTotal = currentATotal + currentBTotal;
    const progressA = currentTotal === 0 ? 50 : Math.round((currentATotal / currentTotal) * 100);
    const myPercentage = confirmedData.teamId === battle.teamAId ? progressA : (100 - progressA);
    const text = `🔥 Ya estoy en la Batalla de Hinchadas.\n\nAcabo de entrar con ${confirmedData.teamName} (${myPercentage}%)\n\n¿Tú de qué lado estás?\n\n${window.location.origin}/b/${battle.id}`;
    
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
            <div className="sc-avatar" style={{ background: 'transparent' }}>
              <Avatar 
                name={confirmedData.supporterName === "Hincha Anónimo" ? "" : confirmedData.supporterName} 
                handle={confirmedData.handle}
                avatarUrl={confirmedData.avatarUrl}
                size={48}
              />
            </div>
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
        <button onClick={handleShare} className="submit-btn share-btn" style={{ background: confirmedData.teamColor || '#fff', color: '#000', marginBottom: "16px" }}>
          COMPARTIR MI PARTICIPACIÓN
        </button>
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ width: "100%", padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", cursor: "pointer", fontWeight: "bold", marginBottom: "32px" }}>
          VER LA BATALLA
        </button>

        <div style={{ background: "rgba(255,255,255,0.02)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>🔔 SEGUIR ESTA BATALLA</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "16px" }}>Recibe notificaciones cuando haya cambios importantes en la distribución.</p>
          
          {followStatus === "success" ? (
            <div style={{ color: "#10b981", fontWeight: "bold", padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "8px" }}>
              ¡Te hemos anotado! Estás siguiendo la batalla.
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                value={followEmail}
                onChange={e => setFollowEmail(e.target.value)}
                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff", width: "100%" }}
              />
              <button 
                onClick={handleFollow}
                disabled={followStatus === "loading"}
                style={{ padding: "12px", borderRadius: "8px", background: "#f59e0b", color: "#000", fontWeight: "bold", cursor: followStatus === "loading" ? "not-allowed" : "pointer", border: "none" }}
              >
                {followStatus === "loading" ? "Procesando..." : "SEGUIR BATALLA"}
              </button>
            </div>
          )}
        </div>
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
        totalA={currentATotal} 
        totalB={currentBTotal} 
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
              {battle.teamA.logo && <img src={battle.teamA.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />}
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
              {battle.teamB.logo && <img src={battle.teamB.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />}
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

          <details style={{ marginBottom: "24px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#94a3b8", display: "flex", alignItems: "center", outline: "none" }}>
              Personalizar mi participación <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>▼</span>
            </summary>
            <div style={{ marginTop: "16px" }}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Tu Foto (Opcional)</label>
                
                {avatarPreview ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img src={avatarPreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)" }} />
                    <button type="button" onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }} style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer" }}>
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={() => fileInputRefCamera.current?.click()} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        📷 Tomar foto
                      </button>
                      <button type="button" onClick={() => fileInputRefGallery.current?.click()} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        🖼️ De galería
                      </button>
                    </div>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  capture
                  ref={fileInputRefCamera} 
                  style={{ display: "none" }} 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const compressed = await compressImage(file, 800);
                      setAvatarFile(compressed);
                      setAvatarPreview(URL.createObjectURL(compressed));
                    } catch (error: any) {
                      alert(error.message);
                    }
                    e.target.value = '';
                  }}
                />
                
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  ref={fileInputRefGallery} 
                  style={{ display: "none" }} 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const compressed = await compressImage(file, 800);
                      setAvatarFile(compressed);
                      setAvatarPreview(URL.createObjectURL(compressed));
                    } catch (error: any) {
                      alert(error.message);
                    }
                    e.target.value = '';
                  }}
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
                <label>Usuario de Red Social (Ej: @tu_usuario)</label>
                <input 
                  type="text" 
                  placeholder="@handle" 
                  maxLength={30}
                  value={handle}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || val.startsWith("@")) setHandle(val);
                    else setHandle("@" + val);
                  }}
                />
              </div>

              <div className="form-group">
                <label>Canal / Proyecto (Si tienes uno)</label>
                <input 
                  type="text" 
                  placeholder="Nombre de tu canal" 
                  maxLength={50}
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Enlace de tu Canal (URL)</label>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  maxLength={150}
                  value={channelUrl}
                  onChange={e => setChannelUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Mensaje (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Deja un mensaje corto..." 
                  maxLength={80} 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
            </div>
          </details>

          <button 
            onClick={handleSubmit}
            className={`submit-btn ${currentAmount <= 0 || loading ? 'disabled' : ''} ${pulse ? 'pulse-anim' : ''}`}
            style={{ 
              background: selectedTeamId === battle.teamAId ? teamAColor : selectedTeamId === battle.teamBId ? teamBColor : "#ffffff", 
              color: (selectedTeamId === battle.teamAId && teamAColor.toLowerCase() === '#ffffff') || 
                     (selectedTeamId === battle.teamBId && teamBColor.toLowerCase() === '#ffffff') ? "#000" : "#fff",
              fontWeight: 900,
              boxShadow: `0 4px 15px ${selectedTeamId === battle.teamAId ? teamAColor : selectedTeamId === battle.teamBId ? teamBColor : "#fff"}40`
            }}
            disabled={loading || currentAmount <= 0 || currentAmount > 1000}
          >
            {loading ? "PROCESANDO..." : `ENTRA EN LA HINCHADA DE ${selectedTeamId === battle.teamAId ? battle.teamA.name.toUpperCase() : selectedTeamId === battle.teamBId ? battle.teamB.name.toUpperCase() : "TU EQUIPO"} · US$${currentAmount}`}
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
