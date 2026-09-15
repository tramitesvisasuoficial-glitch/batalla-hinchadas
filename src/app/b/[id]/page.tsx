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
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams?.success === "true";

  const battle = await prisma.battle.findUnique({
    where: { id },
    include: { supports: true }
  });

  if (!battle) {
    notFound();
  }

  // Calculate totals ONLY from confirmed payments
  const teamATotal = battle.supports.filter(s => s.team === "A" && s.paymentStatus === "paid").reduce((acc, curr) => acc + curr.amount, 0);
  const teamBTotal = battle.supports.filter(s => s.team === "B" && s.paymentStatus === "paid").reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <main className="container">
      {isSuccess && (
        <div style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "16px", borderRadius: "8px", marginBottom: "24px", textAlign: "center", border: "1px solid #10b981", fontWeight: "bold" }}>
          ¡Tu apoyo ha sido registrado correctamente! El marcador se actualizará pronto.
        </div>
      )}

      <h1 className="title">{battle.title}</h1>
      <p className="subtitle">
        {battle.endsAt ? `Finaliza el: ${new Date(battle.endsAt).toLocaleString()}` : "Batalla sin límite de tiempo definido."}
      </p>

      <SupportForm 
        battle={battle} 
        initialTeamATotal={teamATotal} 
        initialTeamBTotal={teamBTotal} 
      />
    </main>
  );
}
