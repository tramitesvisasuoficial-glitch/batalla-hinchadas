import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SupportForm from "@/components/SupportForm";

export default async function BattlePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams?.success === "true";

  const battle = await prisma.battle.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      supports: true,
      teamA: true,
      teamB: true
    }
  });

  if (!battle || !battle.teamA || !battle.teamB) {
    notFound();
  }

  // Calculate totals ONLY from confirmed payments using teamId
  const teamATotal = battle.supports.filter(s => s.teamId === battle.teamAId && s.paymentStatus === "paid").reduce((acc, curr) => acc + curr.amount, 0);
  const teamBTotal = battle.supports.filter(s => s.teamId === battle.teamBId && s.paymentStatus === "paid").reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <main className="container">
      {isSuccess && (
        <div style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "16px", borderRadius: "8px", marginBottom: "24px", textAlign: "center", border: "1px solid #10b981", fontWeight: "bold" }}>
          Tu participación ha sido registrada para confirmación de pago.
        </div>
      )}

      <h1 className="title">BATALLA: {battle.teamA.name} VS {battle.teamB.name}</h1>
      
      <p style={{ textAlign: "center", marginBottom: "16px", color: "#e2e8f0" }}>
        Elige tu equipo y adquiere una participación digital para aparecer dentro de esta batalla.
      </p>

      <p className="subtitle" style={{ fontSize: "0.9rem" }}>
        {battle.endsAt ? `Finaliza el: ${new Date(battle.endsAt).toLocaleString()}` : "Batalla sin límite de tiempo definido."}
      </p>

      <SupportForm 
        battle={battle as any} 
        initialTeamATotal={teamATotal} 
        initialTeamBTotal={teamBTotal} 
      />
    </main>
  );
}
