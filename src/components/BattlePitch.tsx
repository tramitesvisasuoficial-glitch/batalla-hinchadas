"use client";

import React from 'react';

type TeamInfo = {
  name: string;
  color: string | null;
};

interface BattlePitchProps {
  teamA: TeamInfo;
  teamB: TeamInfo;
  totalA: number;
  totalB: number;
  compact?: boolean;
}

export default function BattlePitch({ teamA, teamB, totalA, totalB, compact = false }: BattlePitchProps) {
  const total = totalA + totalB;
  let percentA = 50;
  let percentB = 50;

  if (total > 0) {
    // Calculamos los porcentajes reales
    percentA = Math.round((totalA / total) * 100);
    percentB = 100 - percentA; // Aseguramos que sumen 100
  }

  // Cálculo de la posición del balón.
  // Si Team A (Izquierda) tiene más participación, el balón se desplaza hacia la Izquierda.
  // Ejemplo: A=90%, B=10%. Posición desde la izquierda = 10% (muy cerca del Team A).
  let ballLeft = 100 - percentA;
  
  // Clampeamos el valor para que el balón nunca se salga de la cancha (entre 5% y 95%)
  ballLeft = Math.max(5, Math.min(95, ballLeft));

  const teamAColor = teamA.color || '#00d2ff';
  const teamBColor = teamB.color || '#ff0055';

  return (
    <div className={`battle-pitch-wrapper ${compact ? 'compact' : ''}`}>
      <div className="bp-header">
        <div className="bp-team bp-team-a">
          <span className="bp-name" style={{ color: teamAColor }}>{teamA.name.toUpperCase()}</span>
          <span className="bp-percent" style={{ background: teamAColor, color: '#000' }}>{percentA}%</span>
        </div>
        
        <div className="bp-team bp-team-b">
          <span className="bp-percent" style={{ background: teamBColor, color: '#000' }}>{percentB}%</span>
          <span className="bp-name" style={{ color: teamBColor }}>{teamB.name.toUpperCase()}</span>
        </div>
      </div>

      <div className="bp-pitch-container">
        <div className="bp-pitch">
          {/* Textura de pasto y líneas */}
          <div className="bp-grass"></div>
          <div className="bp-line bp-line-center"></div>
          <div className="bp-line bp-circle-center"></div>
          <div className="bp-line bp-area bp-area-left">
            <div className="bp-line bp-penalty-arc bp-penalty-arc-left"></div>
          </div>
          <div className="bp-line bp-area bp-area-right">
            <div className="bp-line bp-penalty-arc bp-penalty-arc-right"></div>
          </div>
          <div className="bp-goal bp-goal-left" style={{ borderColor: teamAColor, boxShadow: `0 0 10px ${teamAColor}40` }}></div>
          <div className="bp-goal bp-goal-right" style={{ borderColor: teamBColor, boxShadow: `0 0 10px ${teamBColor}40` }}></div>
          
          {/* El Balón */}
          <div 
            className="bp-ball" 
            style={{ 
              left: `calc(${ballLeft}% - 12px)` // 12px es la mitad del tamaño del balón para centrarlo
            }}
          >
            <div className="bp-ball-inner">⚽</div>
          </div>
        </div>
      </div>
      
      {total === 0 && (
        <div className="bp-empty-state" style={{ color: "#f59e0b", fontWeight: "600", fontSize: "1.05rem" }}>
          La batalla empieza contigo. Sé el primero en mover el balón.
        </div>
      )}
      {total > 0 && (
        <div className="bp-active-state">
          Ventaja de participación actual: <strong>{percentA > percentB ? teamA.name : percentA < percentB ? teamB.name : 'EMPATE'}</strong>
        </div>
      )}
    </div>
  );
}
