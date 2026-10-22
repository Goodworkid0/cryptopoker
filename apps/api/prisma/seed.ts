import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Delete existing tables first
  await prisma.table.deleteMany({});
  console.log('  ✓ Cleared existing tables');

  // Create sample tables
  const tables = [
    {
      name: '🤖 Bot Practice',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 5,
      bigBlind: 10,
      minBuyIn: 200,
      maxBuyIn: 2000,
      maxPlayers: 6,
      status: 'ACTIVE' as const,
      currentPlayers: 0,
    },
    {
      name: 'Beginners Paradise',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 1,
      bigBlind: 2,
      minBuyIn: 40,
      maxBuyIn: 200,
      maxPlayers: 9,
      status: 'ACTIVE' as const,
      currentPlayers: 3,
    },
    {
      name: 'Quick Fire',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 5,
      bigBlind: 10,
      minBuyIn: 200,
      maxBuyIn: 1000,
      maxPlayers: 6,
      status: 'ACTIVE' as const,
      currentPlayers: 5,
    },
    {
      name: 'High Roller',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 25,
      bigBlind: 50,
      minBuyIn: 1000,
      maxBuyIn: 5000,
      maxPlayers: 9,
      status: 'ACTIVE' as const,
      currentPlayers: 2,
    },
    {
      name: 'Whale Table',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 100,
      bigBlind: 200,
      minBuyIn: 4000,
      maxBuyIn: 20000,
      maxPlayers: 6,
      status: 'ACTIVE' as const,
      currentPlayers: 0,
    },
    {
      name: 'Omaha Madness',
      type: 'OMAHA' as const,
      smallBlind: 5,
      bigBlind: 10,
      minBuyIn: 200,
      maxBuyIn: 1000,
      maxPlayers: 6,
      status: 'ACTIVE' as const,
      currentPlayers: 4,
    },
    {
      name: 'Turbo Tables',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 2,
      bigBlind: 5,
      minBuyIn: 100,
      maxBuyIn: 500,
      maxPlayers: 6,
      status: 'ACTIVE' as const,
      currentPlayers: 6,
    },
    {
      name: 'Micro Stakes',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 0.5,
      bigBlind: 1,
      minBuyIn: 20,
      maxBuyIn: 100,
      maxPlayers: 9,
      status: 'ACTIVE' as const,
      currentPlayers: 7,
    },
    {
      name: 'VIP Lounge',
      type: 'TEXAS_HOLDEM' as const,
      smallBlind: 50,
      bigBlind: 100,
      minBuyIn: 2000,
      maxBuyIn: 10000,
      maxPlayers: 6,
      status: 'ACTIVE' as const,
      currentPlayers: 1,
    },
  ];

  for (const table of tables) {
    await prisma.table.create({
      data: table,
    });
    console.log(`  ✓ Created table: ${table.name}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
