// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function main() {
//   const allTechnique = await prisma.technique.findMany({
//     select: {
//       id: true,
//       name: true,
//     },
//   });
//
//   for (const t of allTechnique) {
//     let type: 'attack' | 'defense' | 'etc';
//
//     if (['lunge', 'advanced_lunge', 'fleche', 'push'].includes(t.name)) {
//       type = 'attack';
//     } else if (['parry', 'counter_attack'].includes(t.name)) {
//       type = 'defense';
//     } else {
//       type = 'etc';
//     }
//
//     await prisma.technique.update({
//       where: { id: t.id },
//       data: { type },
//     });
//   }
//
//   console.log('Technique type 대입 완료');
// }
//
// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());