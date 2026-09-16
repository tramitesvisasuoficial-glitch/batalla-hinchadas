import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Actividad — Batalla de Hinchadas",
  description: "Descubre la actividad en tiempo real de las batallas.",
};

export const revalidate = 0;

export default async function ActivityPage() {
  const supports = await prisma.support.findMany({
    where: { paymentStatus: "paid" },
    orderBy: { createdAt: "desc" },
    include: {
      team: true,
      battle: true,
    }
  });

  return (
    <main className="container page-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
      <h1 className="section-title" style={{ textAlign: "center", marginBottom: "40px" }}>ACTIVIDAD RECIENTE</h1>

      {supports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "16px" }}>LA ACTIVIDAD ESTÁ POR COMENZAR</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Cuando se registren nuevas participaciones, aquí podrás ver cómo se mueve la comunidad.</p>
        </div>
      ) : (
        <div className="activity-feed">
          {supports.map(support => (
            <div key={support.id} className="activity-item" style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "1.1rem", margin: 0 }}>
                  <strong>{support.supporterName}</strong> se unió a <strong style={{ color: support.team?.color || '#fff' }}>{support.team?.name}</strong> en <Link href={`/b/${support.battleId}`} style={{ color: "#94a3b8", textDecoration: "underline" }}>{support.battle.title}</Link>
                </p>
                {support.message && <p style={{ color: "#94a3b8", marginTop: "8px", fontStyle: "italic" }}>"{support.message}"</p>}
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ fontSize: "1.2rem", color: "#f59e0b" }}>US${support.amount.toFixed(2)}</strong>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>
                  {new Date(support.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
