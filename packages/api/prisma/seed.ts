/**
 * Seed the Bargain Rent-A-Car tenant with categories, location, sample fleet, and an admin.
 * Run: pnpm --filter @carbooking/api seed
 */
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'bargain' },
    update: {},
    create: {
      slug: 'bargain',
      name: 'Bargain Rent-A-Car of America',
      currency: 'USD',
      timezone: 'America/New_York',
      branding: {
        tagline: 'Hassle-Free Car Rentals at Great Prices',
        primaryColor: '#E11D2E',
        accentColor: '#F5B301',
        darkColor: '#0B0F14',
        fonts: { display: 'Syne', body: 'Inter' },
        phone: '(856) 226-4415',
        email: 'bargainrentacarnj@gmail.com',
        address: '300 N White Horse Pike, Somerdale, NJ 08083',
        hours: {
          mon: '9:00 AM - 6:00 PM',
          tue: '9:00 AM - 6:00 PM',
          wed: '9:00 AM - 6:00 PM',
          thu: '9:00 AM - 6:00 PM',
          fri: '9:00 AM - 7:00 PM',
          sat: '10:00 AM - 2:00 PM',
          sun: 'Closed',
        },
        founded: 1985,
        social: {
          facebook: 'https://www.facebook.com/Bargain-Rent-A-Car-1614244515499155/',
        },
      },
      fees: {
        taxRate: 0.06625,       // NJ 6.625%
        youngDriverFee: 25,
        airportFee: 0,
        cleaningFee: 0,
      },
    },
  });

  const categories = await Promise.all(
    [
      { slug: 'small-car', name: 'Small Car', description: 'Compact & economy cars, great for city driving and fuel economy.', sortOrder: 1 },
      { slug: 'mid-sized-car', name: 'Mid-Sized Car', description: 'Comfortable sedans for longer trips and small families.', sortOrder: 2 },
      { slug: 'full-sized-car', name: 'Full-Sized Car', description: 'Roomy sedans with full trunk space.', sortOrder: 3 },
      { slug: 'mid-sized-suv', name: 'Mid-Sized SUV', description: 'Versatile SUVs with extra cargo and all-weather capability.', sortOrder: 4 },
      { slug: 'full-sized-suv', name: 'Full-Sized SUV', description: 'Big 3-row SUVs for groups and big loads.', sortOrder: 5 },
      { slug: 'minivan', name: 'Minivan', description: '7-seat minivans for families and group travel.', sortOrder: 6 },
    ].map((c) =>
      prisma.category.upsert({
        where: { tenantId_slug: { tenantId: tenant.id, slug: c.slug } },
        update: {},
        create: { ...c, tenantId: tenant.id },
      }),
    ),
  );

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const location = await prisma.location.upsert({
    where: { id: `${tenant.id}-hq` },
    update: {},
    create: {
      id: `${tenant.id}-hq`,
      tenantId: tenant.id,
      name: 'Somerdale HQ',
      address: '300 N White Horse Pike',
      city: 'Somerdale',
      state: 'NJ',
      zip: '08083',
      lat: 39.8415,
      lng: -75.0257,
    },
  });

  // Sample fleet — Unsplash CDN photos keyed to car types.
  // Replace with real fleet photography when the client provides it.
  const img = (q: string) =>
    `https://images.unsplash.com/${q}?auto=format&fit=crop&w=1600&q=80`;

  const fleet: Array<Omit<Prisma.CarCreateInput, 'tenant' | 'category' | 'location'> & { categorySlug: string }> = [
    {
      categorySlug: 'small-car',
      make: 'Nissan', model: 'Versa', year: 2024, trim: 'S',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 35,
      features: ['Bluetooth', 'Backup Camera', 'AUX Input'],
      images: [img('photo-1583121274602-3e2820c69888'), img('photo-1549194822-b9a7a4b4ffba')],
      color: 'Silver',
      dailyRate: new Prisma.Decimal(39), weeklyRate: new Prisma.Decimal(234), monthlyRate: new Prisma.Decimal(900),
      depositAmount: new Prisma.Decimal(150),
    },
    {
      categorySlug: 'small-car',
      make: 'Toyota', model: 'Corolla', year: 2024, trim: 'LE',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 33,
      features: ['Bluetooth', 'Apple CarPlay', 'Backup Camera', 'Lane Assist'],
      images: [img('photo-1621007947382-bb3c3994e3fb'), img('photo-1590362891991-f776e747a588')],
      color: 'White',
      dailyRate: new Prisma.Decimal(45), weeklyRate: new Prisma.Decimal(270), monthlyRate: new Prisma.Decimal(1050),
      depositAmount: new Prisma.Decimal(150),
    },
    {
      categorySlug: 'mid-sized-car',
      make: 'Honda', model: 'Accord', year: 2024, trim: 'Sport',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 32,
      features: ['Bluetooth', 'Apple CarPlay', 'Android Auto', 'Heated Seats', 'Backup Camera'],
      images: [img('photo-1606664515524-ed2f786a0bd6'), img('photo-1552519507-da3b142c6e3d')],
      color: 'Black',
      dailyRate: new Prisma.Decimal(55), weeklyRate: new Prisma.Decimal(330), monthlyRate: new Prisma.Decimal(1250),
      depositAmount: new Prisma.Decimal(200),
    },
    {
      categorySlug: 'mid-sized-car',
      make: 'Toyota', model: 'Camry', year: 2024, trim: 'SE',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'hybrid', mpg: 47,
      features: ['Hybrid', 'Apple CarPlay', 'Android Auto', 'Backup Camera', 'Lane Assist', 'Blind Spot Monitor'],
      images: [img('photo-1621007947382-bb3c3994e3fb'), img('photo-1590362891991-f776e747a588')],
      color: 'Gray',
      dailyRate: new Prisma.Decimal(58), weeklyRate: new Prisma.Decimal(348), monthlyRate: new Prisma.Decimal(1320),
      depositAmount: new Prisma.Decimal(200),
    },
    {
      categorySlug: 'full-sized-car',
      make: 'Chrysler', model: '300', year: 2023, trim: 'Touring',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 23,
      features: ['Leather Seats', 'Heated Seats', 'Premium Audio', 'Apple CarPlay', 'Keyless Entry'],
      images: [img('photo-1549194822-b9a7a4b4ffba')],
      color: 'White',
      dailyRate: new Prisma.Decimal(69), weeklyRate: new Prisma.Decimal(414), monthlyRate: new Prisma.Decimal(1550),
      depositAmount: new Prisma.Decimal(250),
    },
    {
      categorySlug: 'mid-sized-suv',
      make: 'Toyota', model: 'RAV4', year: 2024, trim: 'XLE',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 30,
      features: ['AWD', 'Apple CarPlay', 'Android Auto', 'Lane Assist', 'Blind Spot Monitor', 'Heated Seats'],
      images: [img('photo-1609521263047-f8f205293f24'), img('photo-1520031441872-265e4ff70366')],
      color: 'Blue',
      dailyRate: new Prisma.Decimal(72), weeklyRate: new Prisma.Decimal(432), monthlyRate: new Prisma.Decimal(1650),
      depositAmount: new Prisma.Decimal(250),
    },
    {
      categorySlug: 'mid-sized-suv',
      make: 'Honda', model: 'CR-V', year: 2024, trim: 'EX',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 30,
      features: ['AWD', 'Apple CarPlay', 'Android Auto', 'Sunroof', 'Backup Camera', 'Heated Seats'],
      images: [img('photo-1519440352540-e90b2a88f6d5')],
      color: 'Silver',
      dailyRate: new Prisma.Decimal(75), weeklyRate: new Prisma.Decimal(450), monthlyRate: new Prisma.Decimal(1700),
      depositAmount: new Prisma.Decimal(250),
    },
    {
      categorySlug: 'full-sized-suv',
      make: 'Chevrolet', model: 'Tahoe', year: 2023, trim: 'LT',
      seats: 8, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 18,
      features: ['4WD', '3rd Row Seating', 'Leather Seats', 'Apple CarPlay', 'Backup Camera', 'Tow Package'],
      images: [img('photo-1519752594763-2633d46d2bff'), img('photo-1533473359331-0135ef1b58bf')],
      color: 'Black',
      dailyRate: new Prisma.Decimal(125), weeklyRate: new Prisma.Decimal(750), monthlyRate: new Prisma.Decimal(2800),
      depositAmount: new Prisma.Decimal(400),
    },
    {
      categorySlug: 'full-sized-suv',
      make: 'Ford', model: 'Expedition', year: 2023, trim: 'XLT',
      seats: 8, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 19,
      features: ['4WD', '3rd Row Seating', 'Apple CarPlay', 'Android Auto', 'Tow Package', 'Rear Entertainment'],
      images: [img('photo-1519752594763-2633d46d2bff')],
      color: 'White',
      dailyRate: new Prisma.Decimal(129), weeklyRate: new Prisma.Decimal(774), monthlyRate: new Prisma.Decimal(2900),
      depositAmount: new Prisma.Decimal(400),
    },
    {
      categorySlug: 'minivan',
      make: 'Chrysler', model: 'Pacifica', year: 2024, trim: 'Touring L',
      seats: 7, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 22,
      features: ['Stow N Go Seating', 'Apple CarPlay', 'Android Auto', 'Rear Entertainment', 'Power Sliding Doors'],
      images: [img('photo-1605559424843-9e4c228bf1c2')],
      color: 'Gray',
      dailyRate: new Prisma.Decimal(89), weeklyRate: new Prisma.Decimal(534), monthlyRate: new Prisma.Decimal(2000),
      depositAmount: new Prisma.Decimal(300),
    },
    {
      categorySlug: 'minivan',
      make: 'Honda', model: 'Odyssey', year: 2023, trim: 'EX-L',
      seats: 7, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 22,
      features: ['Leather Seats', 'CabinWatch', 'Apple CarPlay', 'Android Auto', 'Power Sliding Doors', 'Rear Entertainment'],
      images: [img('photo-1605559424843-9e4c228bf1c2')],
      color: 'Silver',
      dailyRate: new Prisma.Decimal(95), weeklyRate: new Prisma.Decimal(570), monthlyRate: new Prisma.Decimal(2100),
      depositAmount: new Prisma.Decimal(300),
    },
    {
      categorySlug: 'small-car',
      make: 'Hyundai', model: 'Elantra', year: 2024, trim: 'SEL',
      seats: 5, doors: 4, transmission: 'automatic', fuelType: 'gas', mpg: 37,
      features: ['Bluetooth', 'Apple CarPlay', 'Android Auto', 'Backup Camera', 'Lane Assist'],
      images: [img('photo-1549194822-b9a7a4b4ffba')],
      color: 'Red',
      dailyRate: new Prisma.Decimal(42), weeklyRate: new Prisma.Decimal(252), monthlyRate: new Prisma.Decimal(980),
      depositAmount: new Prisma.Decimal(150),
    },
  ];

  for (const c of fleet) {
    const { categorySlug, ...carData } = c;
    const cat = catBySlug[categorySlug];
    // Avoid duplicate seed rows by checking exact make/model/year/trim for this tenant
    const existing = await prisma.car.findFirst({
      where: { tenantId: tenant.id, make: carData.make, model: carData.model, year: carData.year, trim: carData.trim ?? null },
    });
    if (existing) continue;
    await prisma.car.create({
      data: {
        ...carData,
        tenant: { connect: { id: tenant.id } },
        category: { connect: { id: cat.id } },
        location: { connect: { id: location.id } },
      },
    });
  }

  // Admin user
  const adminEmail = 'admin@bargainrentacarnj.com';
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: adminEmail,
      passwordHash: await bcrypt.hash('changeme123', 10),
      firstName: 'Bargain',
      lastName: 'Admin',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('Seed complete:');
  console.log('  tenant    :', tenant.slug);
  console.log('  categories:', categories.length);
  console.log('  admin     :', adminEmail, '(password: changeme123 — change immediately)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
