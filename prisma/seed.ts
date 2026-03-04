import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@deangelo.com" },
    update: {},
    create: {
      email: "admin@deangelo.com",
      name: "DeAngelo",
      hashedPassword,
    },
  });

  // Create default categories
  const categories = [
    { name: "Headshots", slug: "headshots", sortOrder: 0 },
    { name: "Editorial", slug: "editorial", sortOrder: 1 },
    { name: "Commercial", slug: "commercial", sortOrder: 2 },
    { name: "Lifestyle", slug: "lifestyle", sortOrder: 3 },
    { name: "Behind the Scenes", slug: "behind-the-scenes", sortOrder: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create default about
  await prisma.about.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      headline: "Model. Actor. San Francisco.",
      bio: "DeAngelo is a professional model and actor based in San Francisco, bringing energy, authenticity, and versatility to every project. With experience spanning commercial, editorial, film, and runway work, DeAngelo brings a unique presence that captivates audiences and elevates brands.",
      shortBio:
        "Professional model and actor based in San Francisco. Available for commercial, editorial, film, and runway work.",
      stats: JSON.stringify({
        height: "6'1\"",
        hairColor: "Black",
        eyeColor: "Brown",
      }),
    },
  });

  // Create default contact info
  await prisma.contactInfo.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      location: "San Francisco, CA",
      availableForWork: true,
    },
  });

  // Create default site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "DeAngelo",
      siteTagline: "Model & Actor",
      metaDescription:
        "DeAngelo — Professional model and actor based in San Francisco. Available for commercial, editorial, film, and runway work.",
      heroTitle: "DEANGELO",
      heroSubtitle: "Model & Actor | San Francisco",
    },
  });

  console.log("Seed completed successfully");
  console.log("Admin login: admin@deangelo.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
