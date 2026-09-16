import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BattlePitch from "@/components/BattlePitch";

export const revalidate = 0; // Ensure data is dynamic for the homepage

export default async function HomePage() {
  // 1. Fetch active battles
  const activeBattles = await prisma.battle.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      teamA: true,
      teamB: true,
      supports: {
        where: { paymentStatus: "paid" },
      }
    }
  });

  // Calculate totals for active battles
  const battlesWithTotals = activeBattles.map(battle => {
    const totalA = battle.supports
      .filter(s => s.teamId === battle.teamAId)
      .reduce((sum, s) => sum + s.amount, 0);
    const totalB = battle.supports
      .filter(s => s.teamId === battle.teamBId)
      .reduce((sum, s) => sum + s.amount, 0);
    return { ...battle, totalA, totalB };
  });

  // 2. Fetch latest activity (Global)
  const latestActivity = await prisma.support.findMany({
    where: { paymentStatus: "paid" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { team: true }
  });

  // 3. Fetch global ranking (Top amounts overall)
  // NOTE: Not grouped by user, per user's requirement to not invent identity
  const topSupports = await prisma.support.findMany({
    where: { paymentStatus: "paid" },
    orderBy: { amount: "desc" },
    take: 3,
    include: { team: true }
  });

  return (
    <main style={{ padding: 0 }}>
      {/* 1. HERO PRINCIPAL */}
      <section className="hero-section">
        <h1 className="hero-title">NO MIRES LA BATALLA.<br/>FORMA PARTE DE ELLA.</h1>
        <p className="hero-subtitle">
          Elige tu equipo, adquiere tu participación y sube posiciones dentro del marcador público.
        </p>
        <div className="hero-ctas">
          {battlesWithTotals.length > 0 ? (
            <Link href={`/b/${battlesWithTotals[0].id}`} className="btn-primary">
              ⚔️ ENTRAR A UNA BATALLA
            </Link>
          ) : (
            <button className="btn-primary" disabled style={{ opacity: 0.5 }}>
              ⚔️ ENTRAR A UNA BATALLA
            </button>
          )}
          <a href="#batallas" className="btn-secondary">VER BATALLAS</a>
        </div>
      </section>

      {/* 2. BATALLAS EN MARCHA */}
      <section id="batallas" className="home-section" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="container">
          <h2 className="home-section-title">🔥 BATALLAS EN MARCHA</h2>
          
          {battlesWithTotals.length === 0 ? (
            <div className="empty-state">
              <h2>No hay batallas activas</h2>
              <p>Las próximas batallas se anunciarán pronto. ¡Prepárate!</p>
            </div>
          ) : (
            <div>
              {battlesWithTotals.map((battle) => (
                <Link href={`/b/${battle.id}`} key={battle.id} className="battle-card">
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "1.5rem", color: "#fff", textTransform: "uppercase" }}>{battle.title}</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "4px" }}>Entra y apoya a tu equipo</p>
                  </div>
                  
                  {battle.teamA && battle.teamB && (
                    <BattlePitch 
                      teamA={battle.teamA}
                      teamB={battle.teamB}
                      totalA={battle.totalA}
                      totalB={battle.totalB}
                      compact={true}
                    />
                  )}
                  
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <span style={{ color: "#fff", fontWeight: "800", textDecoration: "underline", textUnderlineOffset: "4px" }}>ENTRAR EN LA BATALLA →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="home-section">
        <div className="container">
          <h2 className="home-section-title">¿CÓMO FUNCIONA?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">⚔️</div>
              <h3 className="step-title">01 — ELIGE BATALLA</h3>
              <p className="step-desc">Encuentra el enfrentamiento que quieres apoyar.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🛡️</div>
              <h3 className="step-title">02 — ELIGE EQUIPO</h3>
              <p className="step-desc">Ponte de un lado de la batalla.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🪙</div>
              <h3 className="step-title">03 — PARTICIPA</h3>
              <p className="step-desc">Elige el valor de tu participación.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">👑</div>
              <h3 className="step-title">04 — SUBE POSICIÓN</h3>
              <p className="step-desc">Aparece entre los seguidores destacados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SISTEMA DE ESTATUS */}
      <section className="home-section" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="container">
          <h2 className="home-section-title">TU PARTICIPACIÓN DETERMINA TU POSICIÓN</h2>
          <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "40px", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 40px" }}>
            Cuanto mayor sea tu participación, más arriba puedes aparecer dentro del marcador de tu equipo. Consigue el mayor reconocimiento.
          </p>
          
          <div className="status-grid">
            <div className="status-card" style={{ borderColor: "#cd7f32" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🥉</div>
              <h3 style={{ color: "#cd7f32", fontWeight: "900" }}>BRONCE</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px" }}>El comienzo de la gloria.</p>
            </div>
            <div className="status-card" style={{ borderColor: "#c0c0c0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🥈</div>
              <h3 style={{ color: "#c0c0c0", fontWeight: "900" }}>PLATA</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px" }}>Avanzando posiciones.</p>
            </div>
            <div className="status-card" style={{ borderColor: "#ffd700" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🥇</div>
              <h3 style={{ color: "#ffd700", fontWeight: "900" }}>ORO</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px" }}>Entre los mejores.</p>
            </div>
            <div className="status-card" style={{ borderColor: "#fff", background: "rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👑</div>
              <h3 style={{ color: "#fff", fontWeight: "900" }}>REY DE LA BATALLA</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px" }}>Liderando a tu equipo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACTIVIDAD DE LA BATALLA */}
      <section className="home-section">
        <div className="container">
          <h2 className="home-section-title">⚡ LA BATALLA SE ESTÁ MOVIENDO</h2>
          
          <div className="activity-feed">
            {latestActivity.length === 0 ? (
              <div className="empty-state">
                <p>Las hinchadas apenas se están preparando...</p>
              </div>
            ) : (
              <div style={{ background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)", padding: "16px" }}>
                {latestActivity.map((activity, index) => (
                  <div key={activity.id} className="activity-item">
                    <div style={{ fontSize: "2rem" }}>🔥</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "700" }}>{activity.supporterName} apoyó con US${activity.amount.toFixed(2)}</p>
                      <p className="latest-team" style={{ color: activity.team?.color || "#94a3b8" }}>
                        {activity.team?.name || "Equipo Desconocido"}
                      </p>
                    </div>
                    <div className="activity-time">
                      Hace {Math.floor((new Date().getTime() - new Date(activity.createdAt).getTime()) / 60000)} min
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. RANKING GLOBAL */}
      <section className="home-section" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="container">
          <h2 className="home-section-title">👑 LOS REYES DE LA BATALLA</h2>
          
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            {topSupports.length === 0 ? (
              <div className="empty-state">
                <p>Aún no hay Reyes. ¡El trono te espera!</p>
              </div>
            ) : (
              <div className="ranking-list">
                {topSupports.map((support, index) => (
                  <div key={support.id} className="ranking-card" style={{ borderColor: support.team?.color || "var(--border)", borderLeft: `4px solid ${support.team?.color || "var(--border)"}` }}>
                    <div className="ranking-pos">#{index + 1}</div>
                    <div className="ranking-avatar" style={{ background: support.team?.color || "#333", color: "#000" }}>
                      {support.supporterName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ranking-info">
                      <div className="ranking-name">{support.supporterName}</div>
                      <div className="ranking-badge" style={{ color: support.team?.color || "#fff" }}>
                        {support.team?.name || "Hinchada"}
                      </div>
                    </div>
                    <div className="ranking-amount" style={{ color: support.team?.color || "#fff" }}>
                      US${support.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="home-section" style={{ paddingBottom: "100px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "16px", textTransform: "uppercase" }}>¿DE QUÉ LADO ESTÁS?</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.2rem", marginBottom: "40px" }}>Elige tu equipo y entra en la batalla.</p>
          
          {battlesWithTotals.length > 0 ? (
            <Link href={`/b/${battlesWithTotals[0].id}`} className="btn-primary" style={{ padding: "20px 48px", fontSize: "1.25rem" }}>
              ⚔️ ENTRAR A UNA BATALLA
            </Link>
          ) : (
            <button className="btn-primary" disabled style={{ opacity: 0.5, padding: "20px 48px", fontSize: "1.25rem" }}>
              NO HAY BATALLAS ACTIVAS
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
