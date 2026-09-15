import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const battle = await prisma.battle.create({
    data: {
      title: "Real Madrid vs Barcelona",
      teamAName: "Real Madrid",
      teamAColor: "#FFFFFF",
      teamBName: "Barcelona",
      teamBColor: "#004D98",
      status: "active",
    },
  });
  console.log("Created Battle:", battle.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
