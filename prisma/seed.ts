import { PrismaClient } from "@prisma/client";
import { seeddata } from "./data";

const prisma = new PrismaClient();

async function main() {
  for (const cadre of seeddata) {
    await prisma.cadre.create({
      data: {
        name: cadre.cadre,
        controllingAdminAuthority:
          cadre.cadreControllingAdministrativeAuthority,
        controllingDepartment: cadre.cadreControllingDepartment || null,
      },
    });
  }

  console.log("Data seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
