import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const latestBattle = await prisma.battle.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="container">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="title" style={{ fontSize: "2.5rem", marginBottom: "16px" }}>BATALLA DE HINCHADAS</h1>
        
        <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "16px" }}>
          ¿QUÉ HINCHADA DOMINA EL RANKING?
        </h2>
        
        <p className="subtitle" style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", color: "#e2e8f0" }}>
          Participa en batallas digitales entre grandes equipos y haz visible tu posición dentro del marcador público.
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        {latestBattle ? (
          <Link href={`/b/${latestBattle.id}`} style={{ textDecoration: "none" }}>
            <button className="submit-btn" style={{ fontSize: "1.1rem", padding: "16px 32px" }}>
              🔥 VER BATALLAS ACTIVAS
            </button>
          </Link>
        ) : (
          <button className="submit-btn" style={{ fontSize: "1.1rem", padding: "16px 32px", opacity: 0.5, cursor: "not-allowed" }} disabled>
            NO HAY BATALLAS ACTIVAS
          </button>
        )}
      </div>

      <div className="action-area" style={{ marginBottom: "40px" }}>
        <p style={{ marginBottom: "24px", lineHeight: "1.6" }}>
          Cada batalla enfrenta dos equipos. Los aficionados pueden adquirir una participación digital y registrar su posición por el equipo elegido. Las participaciones confirmadas actualizan el marcador público.
        </p>

        <h3 className="section-title">¿CÓMO FUNCIONA?</h3>
        <ol style={{ paddingLeft: "20px", marginBottom: "24px", lineHeight: "1.8" }}>
          <li><strong>Elige una batalla</strong></li>
          <li><strong>Selecciona tu equipo</strong></li>
          <li><strong>Adquiere una participación</strong></li>
          <li><strong>Tu participación aparece en el ranking</strong></li>
          <li><strong>Consulta el marcador en tiempo real</strong></li>
        </ol>

        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
          <h3 style={{ color: "#ef4444", marginBottom: "12px", fontSize: "1rem" }}>IMPORTANTE</h3>
          <p style={{ fontSize: "0.9rem", color: "#f87171", margin: 0, lineHeight: "1.6" }}>
            Batalla de Hinchadas es una plataforma independiente de entretenimiento digital. Las participaciones adquiridas representan una experiencia y posición dentro de nuestros rankings digitales.<br/><br/>
            No ofrecemos apuestas, cuotas, juegos de azar, premios monetarios, ganancias, retiros ni recompensas económicas.<br/><br/>
            El resultado de un partido o competición deportiva real no determina ningún pago, premio o beneficio económico dentro de la plataforma.<br/><br/>
            Batalla de Hinchadas no recauda fondos para clubes, jugadores, ligas o terceros y no está afiliada oficialmente con ellos.
          </p>
        </div>
      </div>
    </main>
  );
}
