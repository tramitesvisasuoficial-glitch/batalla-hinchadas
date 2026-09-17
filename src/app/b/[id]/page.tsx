import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SupportForm from "@/components/SupportForm";
import type { Metadata, ResolvingMetadata } from 'next';
import { Support } from "@prisma/client";
import { Avatar } from "@/components/Avatar";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const battle = await prisma.battle.findUnique({
    where: { id: resolvedParams.id },
    include: { teamA: true, teamB: true }
  });

  if (!battle || !battle.teamA || !battle.teamB) {
    return { title: 'Batalla no encontrada' };
  }

  const title = `${battle.teamA.name} vs ${battle.teamB.name} — Batalla de Hinchadas`;
  const description = `¿De qué lado estás? Participa y aparece en el ranking de hinchas. Apoya a tu equipo.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// Helper to get initials
function getInitials(name: string) {
  return (name.substring(0, 2) || "H").toUpperCase();
}

export default async function BattlePage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  
  const battle = await prisma.battle.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      supports: {
        where: { paymentStatus: "paid" }, // ONLY CONFIRMED
        orderBy: { createdAt: "asc" } // To find the first one easily
      },
      teamA: true,
      teamB: true
    }
  });

  if (!battle || !battle.teamA || !battle.teamB) {
    notFound();
  }

  const paidSupports = battle.supports;
  
  // Calculate totals
  const teamATotal = paidSupports.filter(s => s.teamId === battle.teamAId).reduce((acc, curr) => acc + curr.amount, 0);
  const teamBTotal = paidSupports.filter(s => s.teamId === battle.teamBId).reduce((acc, curr) => acc + curr.amount, 0);

  // Determine First Supporter (Primer Hincha) across the whole battle
  const firstSupportId = paidSupports.length > 0 ? paidSupports[0].id : null;

  // Process Rankings (separated by team, ordered by amount DESC)
  const processRanking = (teamId: string) => {
    const teamSupports = paidSupports.filter(s => s.teamId === teamId);
    // Sort by amount DESC, then by createdAt ASC for tie-breakers
    teamSupports.sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return teamSupports.map((s, index) => {
      const position = index + 1;
      let badge = "Hincha Activo";
      let badgeEmoji = "🔥";
      
      if (s.id === firstSupportId) {
        badge = "Primer Hincha";
        badgeEmoji = "🏅";
      } else if (position === 1) {
        badge = "Leyenda";
        badgeEmoji = "👑";
      } else if (position <= 3) {
        badge = "Hincha Destacado";
        badgeEmoji = "⭐";
      }

      return { ...s, position, badge, badgeEmoji };
    });
  };

  const rankingA = processRanking(battle.teamAId!);
  const rankingB = processRanking(battle.teamBId!);

  // Últimos Hinchas (Global, limit 5, order by createdAt DESC)
  const latestSupports = [...paidSupports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  
  const lastSupportTime = latestSupports.length > 0 ? latestSupports[0].createdAt : null;
  let timeAgo = "";
  if (lastSupportTime) {
    const diffMs = Date.now() - lastSupportTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins === 0) timeAgo = "hace un momento";
    else if (diffMins < 60) timeAgo = `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    else {
      const diffHours = Math.floor(diffMins / 60);
      timeAgo = `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
  }

  return (
    <main className="container social-battle">
      <div className="battle-header-main">
        <h1 className="battle-title-main">BATALLA DE HINCHADAS</h1>
        <h2 className="match-title-main">
          <span style={{ color: battle.teamA.color || '#fff' }}>{battle.teamA.name.toUpperCase()}</span>
          <span className="vs-main"> VS </span>
          <span style={{ color: battle.teamB.color || '#fff' }}>{battle.teamB.name.toUpperCase()}</span>
        </h2>
      </div>
      
      {paidSupports.length > 0 ? (
        <div className="activity-indicator">
          <strong>🔥 LA HINCHADA ESTÁ ACTIVA</strong>
          <div>Última participación {timeAgo}</div>
        </div>
      ) : (
        <div className="empty-state">
          <h2>¿QUIÉN SERÁ EL PRIMER HINCHA?</h2>
          <p>Sé el primero en aparecer en esta batalla.</p>
        </div>
      )}

      {/* Client component for Support Form & Share Card */}
      <SupportForm 
        battle={battle as any} 
        initialTeamATotal={teamATotal} 
        initialTeamBTotal={teamBTotal} 
      />

      {/* Rankings Section */}
      {paidSupports.length > 0 ? (
        <div className="rankings-container">
          <div className="ranking-col" style={{ borderColor: battle.teamA!.color || '#333' }}>
            <h3 className="ranking-title" style={{ color: battle.teamA!.color || '#fff' }}>
              🏆 TOP HINCHAS<br/>{battle.teamA!.name.toUpperCase()}
            </h3>
            <div className="ranking-list">
              {rankingA.map(s => (
                <div key={s.id} className="ranking-card">
                  <div className="ranking-pos">#{s.position}</div>
                  <div className="ranking-avatar" style={{ background: 'transparent' }}>
                    <Avatar name={s.supporterName} handle={s.handle} avatarUrl={s.avatarUrl} size={40} />
                  </div>
                  <div className="ranking-info">
                    <div className="ranking-name" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold' }}>{s.supporterName}</span>
                      {s.handle && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.handle}</span>}
                    </div>
                    {s.channelUrl && (
                      <a href={s.channelUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', marginTop: '2px', display: 'inline-block' }}>
                        🔗 {s.channelName || 'Ver Canal'}
                      </a>
                    )}
                    <div className="ranking-badge">{s.badgeEmoji} {s.badge}</div>
                  </div>
                  <div className="ranking-amount">US${s.amount.toFixed(2)}</div>
                </div>
              ))}
              {rankingA.length === 0 && <p className="no-supports">Sé el primero en apoyar al {battle.teamA!.name}</p>}
            </div>
          </div>

          <div className="ranking-col" style={{ borderColor: battle.teamB!.color || '#333' }}>
            <h3 className="ranking-title" style={{ color: battle.teamB!.color || '#fff' }}>
              🏆 TOP HINCHAS<br/>{battle.teamB!.name.toUpperCase()}
            </h3>
            <div className="ranking-list">
              {rankingB.map(s => (
                <div key={s.id} className="ranking-card">
                  <div className="ranking-pos">#{s.position}</div>
                  <div className="ranking-avatar" style={{ background: 'transparent' }}>
                    <Avatar name={s.supporterName} handle={s.handle} avatarUrl={s.avatarUrl} size={40} />
                  </div>
                  <div className="ranking-info">
                    <div className="ranking-name" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold' }}>{s.supporterName}</span>
                      {s.handle && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.handle}</span>}
                    </div>
                    {s.channelUrl && (
                      <a href={s.channelUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', marginTop: '2px', display: 'inline-block' }}>
                        🔗 {s.channelName || 'Ver Canal'}
                      </a>
                    )}
                    <div className="ranking-badge">{s.badgeEmoji} {s.badge}</div>
                  </div>
                  <div className="ranking-amount">US${s.amount.toFixed(2)}</div>
                </div>
              ))}
              {rankingB.length === 0 && <p className="no-supports">Sé el primero en apoyar al {battle.teamB!.name}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="rankings-empty-state" style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", margin: "24px 0" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginBottom: "16px" }}>SÉ EL PRIMERO EN APARECER EN EL RANKING DE ESTA BATALLA</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
            <div style={{ padding: "12px 24px", borderRadius: "12px", border: `1px solid ${battle.teamA!.color || '#fff'}`, color: battle.teamA!.color || '#fff', fontWeight: "bold" }}>{battle.teamA!.name}</div>
            <div style={{ padding: "12px 24px", borderRadius: "12px", border: `1px solid ${battle.teamB!.color || '#fff'}`, color: battle.teamB!.color || '#fff', fontWeight: "bold" }}>{battle.teamB!.name}</div>
          </div>
        </div>
      )}

      {/* Últimos Hinchas */}
      {latestSupports.length > 0 && (
        <div className="latest-supports">
          <h2 className="section-title">🔥 ÚLTIMOS HINCHAS</h2>
          <div className="latest-list">
            {latestSupports.map(s => {
              const team = s.teamId === battle.teamAId ? battle.teamA : battle.teamB;
              const teamColor = team?.color || "#333";
              return (
                <div key={s.id} className="ranking-card latest-card">
                  <div className="ranking-avatar" style={{ background: 'transparent' }}>
                    <Avatar name={s.supporterName} handle={s.handle} avatarUrl={s.avatarUrl} size={40} />
                  </div>
                  <div className="ranking-info">
                    <div className="ranking-name">{s.supporterName}</div>
                    <div className="latest-team" style={{ color: teamColor, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <span className="dot" style={{ backgroundColor: teamColor, width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }}></span>
                      {team?.name}
                    </div>
                  </div>
                  <div className="ranking-amount">US${s.amount.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
