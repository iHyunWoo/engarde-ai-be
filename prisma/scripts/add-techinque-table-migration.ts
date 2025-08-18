// import { PrismaClient, MarkingType } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function main() {
//   const users = await prisma.user.findMany();
//
//   // 1. 각 사용자별로 MarkingType 기반 Technique 삽입
//   for (const user of users) {
//     for (const type of Object.values(MarkingType)) {
//       const existing = await prisma.technique.findFirst({
//         where: {
//           user_id: user.id,
//           name: type,
//         },
//       });
//
//       if (!existing) {
//         await prisma.technique.create({
//           data: {
//             user_id: user.id,
//             name: type,
//           },
//         });
//       }
//     }
//   }
//
//   // 2. 모든 Marking 순회하며 my/opponent_type → Technique 연결
//   const allMarkings = await prisma.marking.findMany();
//
//   for (const marking of allMarkings) {
//     const [myTechnique, opponentTechnique] = await Promise.all([
//       prisma.technique.findFirst({
//         where: {
//           user_id: marking.user_id,
//           name: marking.my_type,
//         },
//       }),
//       prisma.technique.findFirst({
//         where: {
//           user_id: marking.user_id,
//           name: marking.opponent_type,
//         },
//       }),
//     ]);
//
//     await prisma.marking.update({
//       where: { id: marking.id },
//       data: {
//         my_techinque_id: myTechnique?.id ?? null,
//         opponent_techinque_id: opponentTechnique?.id ?? null,
//       },
//     });
//   }
//
//   console.log('Markings updated with Technique IDs.');
// }
//
// main()
//   .catch((e) => {
//     console.error('Migration failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });