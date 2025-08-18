// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function main() {
//   const allMarkings = await prisma.marking.findMany({
//     select: {
//       id: true,
//       my_techinque_id: true,
//       opponent_techinque_id: true,
//     },
//   });
//
//   for (const m of allMarkings) {
//     await prisma.marking.update({
//       where: { id: m.id },
//       data: {
//         my_technique_id: m.my_techinque_id,
//         opponent_technique_id: m.opponent_techinque_id,
//       },
//     });
//   }
//
//   console.log('Technique ID 복사 완료');
// }
//
// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());