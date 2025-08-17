import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    where: {
      opponent_id: null,
    },
  });

  for (const match of matches) {
    const existing = await prisma.opponent.findFirst({
      where: {
        name: match.opponent_name,
        team: match.opponent_team,
        user_id: match.user_id,
      },
    });

    const opponent =
      existing ??
      (await prisma.opponent.create({
        data: {
          name: match.opponent_name,
          team: match.opponent_team,
          user_id: match.user_id,
        },
      }));

    await prisma.match.update({
      where: { id: match.id },
      data: {
        opponent_id: opponent.id,
      },
    });
  }

  console.log(`Migrated ${matches.length} matches`);
}

main().finally(() => prisma.$disconnect());