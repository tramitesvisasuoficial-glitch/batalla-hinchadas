import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const rm = await prisma.team.upsert({
    where: { name: "Real Madrid" },
    update: {},
    create: { name: "Real Madrid", color: "#FFFFFF" }
  });
  const barca = await prisma.team.upsert({
    where: { name: "Barcelona" },
    update: {},
    create: { name: "Barcelona", color: "#004D98" }
  });
  const liv = await prisma.team.upsert({
    where: { name: "Liverpool" },
    update: {},
    create: { name: "Liverpool", color: "#C8102E" }
  });
  const city = await prisma.team.upsert({
    where: { name: "Manchester City" },
    update: {},
    create: { name: "Manchester City", color: "#6CABDD" }
  });

  const battle1 = await prisma.battle.create({
    data: {
      title: "El Clásico",
      teamAId: rm.id,
      teamBId: barca.id,
      status: "active",
    },
  });
  
  const battle2 = await prisma.battle.create({
    data: {
      title: "Premier League Showdown",
      teamAId: liv.id,
      teamBId: city.id,
      status: "active",
    },
  });

  console.log("Created Battles:", battle1.id, battle2.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
