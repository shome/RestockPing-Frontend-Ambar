import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { slug: 'paris-office' },
      update: {},
      create: {
        name: 'Paris Office',
        slug: 'paris-office',
        timezone: 'Europe/Paris',
      },
    }),
    prisma.location.upsert({
      where: { slug: 'london-office' },
      update: {},
      create: {
        name: 'London Office',
        slug: 'london-office',
        timezone: 'Europe/London',
      },
    }),
    prisma.location.upsert({
      where: { slug: 'new-york-office' },
      update: {},
      create: {
        name: 'New York Office',
        slug: 'new-york-office',
        timezone: 'America/New_York',
      },
    }),
  ]);

  console.log('📍 Created locations:', locations.map(l => l.name));

  // Create sample labels for each location
  const labels = [];
  for (const location of locations) {
    const locationLabels = await Promise.all([
      prisma.label.upsert({
        where: { code_locationId: { code: 'PHONE', locationId: location.id } },
        update: {},
        create: {
          code: 'PHONE',
          name: 'Smartphones',
          synonyms: 'mobile, cell phone, iPhone, Android',
          active: true,
          locationId: location.id,
        },
      }),
      prisma.label.upsert({
        where: { code_locationId: { code: 'LAPTOP', locationId: location.id } },
        update: {},
        create: {
          code: 'LAPTOP',
          name: 'Laptops',
          synonyms: 'notebook, computer, MacBook, ThinkPad',
          active: true,
          locationId: location.id,
        },
      }),
      prisma.label.upsert({
        where: { code_locationId: { code: 'TABLET', locationId: location.id } },
        update: {},
        create: {
          code: 'TABLET',
          name: 'Tablets',
          synonyms: 'iPad, Android tablet, Surface',
          active: true,
          locationId: location.id,
        },
      }),
    ]);
    labels.push(...locationLabels);
  }

  console.log('🏷️ Created labels:', labels.length);

  // Create sample team PIN for Paris office
  const samplePin = await prisma.teamPin.upsert({
    where: { pin_locationId: { pin: '1234', locationId: locations[0].id } },
    update: {},
    create: {
      pin: '1234',
      status: 'ACTIVE',
      locationId: locations[0].id,
    },
  });

  console.log('🔑 Created sample team PIN: 1234 for', locations[0].name);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n🚀 You can now:');
  console.log('1. Login as admin with: admin / admin123');
  console.log('2. Login as team member with PIN: 1234 (Paris Office)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
