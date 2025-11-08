import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateHierarchy() {
  console.log('🔍 Validating learning hierarchy...\n');

  // 1. Check modules
  const modules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
  });
  console.log(`✅ Modules: ${modules.length}`);
  modules.forEach((m) => console.log(`   - ${m.slug}`));

  // 2. Check units per module
  console.log('\n📦 Units per module:');
  for (const module of modules) {
    const units = await prisma.unit.findMany({
      where: { moduleId: module.id },
      orderBy: { orderInModule: 'asc' },
    });
    console.log(`   ${module.slug}: ${units.length} units`);
    units.forEach((u) => console.log(`      - ${u.slug}`));
  }

  // 3. Check levels per unit
  console.log('\n🎮 Total levels:');
  const allUnits = await prisma.unit.findMany({
    include: {
      levels: {
        orderBy: { orderInUnit: 'asc' },
      },
    },
  });

  let totalLevels = 0;
  const levelTypeCount: Record<string, number> = {};

  for (const unit of allUnits) {
    totalLevels += unit.levels.length;
    unit.levels.forEach((level) => {
      levelTypeCount[level.type] = (levelTypeCount[level.type] || 0) + 1;
    });
  }

  console.log(`   Total: ${totalLevels} levels`);
  console.log('\n📊 Levels by type:');
  Object.entries(levelTypeCount).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`);
  });

  // 4. Check challenges connected to levels
  console.log('\n🔗 Challenge connections:');
  const levelChallenges = await prisma.levelChallenge.findMany();
  console.log(`   Total connections: ${levelChallenges.length}`);

  const uniqueChallenges = new Set(levelChallenges.map(lc => lc.challengeId));
  console.log(`   Unique challenges connected: ${uniqueChallenges.size}`);

  // 5. Verify all challenges are connected
  const totalChallenges = await prisma.challenge.count();
  console.log(`   Total challenges in DB: ${totalChallenges}`);

  if (uniqueChallenges.size === totalChallenges) {
    console.log('   ✅ All challenges are connected to levels!');
  } else {
    console.log(`   ⚠️  Warning: ${totalChallenges - uniqueChallenges.size} challenges not connected`);

    const allChallenges = await prisma.challenge.findMany();
    const connectedIds = Array.from(uniqueChallenges);
    const unconnected = allChallenges.filter(c => !connectedIds.includes(c.id));
    console.log('   Unconnected challenges:');
    unconnected.forEach(c => console.log(`      - ${c.slug}`));
  }

  // 6. Verify level type distribution
  console.log('\n📈 Level type distribution validation:');
  const expectedTypes = ['LESSON', 'PRACTICE', 'STORY', 'UNIT_REVIEW', 'MATCH_MADNESS', 'RAPID_REVIEW', 'XP_RAMP_UP'];
  const foundTypes = Object.keys(levelTypeCount);

  console.log(`   Expected types: ${expectedTypes.length}`);
  console.log(`   Found types: ${foundTypes.length}`);

  const missingTypes = expectedTypes.filter(t => !foundTypes.includes(t));
  if (missingTypes.length === 0) {
    console.log('   ✅ All level types are represented!');
  } else {
    console.log(`   ⚠️  Missing types: ${missingTypes.join(', ')}`);
  }

  // 7. Summary
  console.log('\n🎉 Validation Summary:');
  console.log(`   ✅ ${modules.length} modules`);
  console.log(`   ✅ ${allUnits.length} units`);
  console.log(`   ✅ ${totalLevels} levels`);
  console.log(`   ✅ ${foundTypes.length}/${expectedTypes.length} level types`);
  console.log(`   ✅ ${totalChallenges} challenges`);
  console.log(`   ✅ ${uniqueChallenges.size}/${totalChallenges} challenges connected`);

  const validationPassed =
    modules.length === 5 &&
    allUnits.length === 12 &&
    totalLevels === 34 &&
    foundTypes.length === 7 &&
    uniqueChallenges.size === totalChallenges;

  if (validationPassed) {
    console.log('\n✨ All validations passed! Migration is complete and correct.');
  } else {
    console.log('\n⚠️  Some validations failed. Please review the output above.');
  }

  await prisma.$disconnect();
}

validateHierarchy()
  .catch((error) => {
    console.error('❌ Validation error:', error);
    process.exit(1);
  });
