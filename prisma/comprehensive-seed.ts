import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Sikkimese names database
const sikkimeseNames = {
  male: [
    "Pema Tshering",
    "Karma Loday",
    "Tenzin Norbu",
    "Phurba Tshering",
    "Sonam Gyatso",
    "Lobzang Tenzin",
    "Karma Wangyal",
    "Pema Norbu",
    "Tashi Namgyal",
    "Dorje Lama",
    "Pemba Sherpa",
    "Nima Tamang",
    "Ang Dorje",
    "Passang Sherpa",
    "Tenzin Norbu",
    "Karma Bhutia",
    "Phintsho Namgyal",
    "Sonam Tshering",
    "Lobzang Gyatso",
    "Tashi Lepcha",
    "Karma Lepcha",
    "Pema Bhutia",
    "Tenzin Sherpa",
    "Norbu Lama",
    "Phurba Lepcha",
    "Sonam Sherpa",
    "Karma Tamang",
    "Pema Lama",
    "Tashi Bhutia",
    "Dorje Sherpa",
    "Karma Norbu",
    "Phintsho Lepcha",
    "Sonam Tamang",
    "Tenzin Lama",
    "Pema Sherpa",
    "Karma Lama",
    "Tashi Sherpa",
    "Norbu Bhutia",
    "Phurba Tamang",
    "Sonam Lepcha",
  ],
  female: [
    "Pema Lhamo",
    "Karma Dolma",
    "Tenzin Dolkar",
    "Phurba Dolma",
    "Sonam Lhamo",
    "Lobzang Dolma",
    "Karma Yangchen",
    "Pema Dolkar",
    "Tashi Lhamo",
    "Dorje Lhamo",
    "Pemba Dolma",
    "Nima Dolkar",
    "Ang Dolma",
    "Passang Lhamo",
    "Tenzin Yangchen",
    "Karma Dolkar",
    "Phintsho Lhamo",
    "Sonam Dolma",
    "Lobzang Lhamo",
    "Tashi Dolkar",
    "Karma Lhamo",
    "Pema Yangchen",
    "Tenzin Lhamo",
    "Norbu Dolma",
    "Phurba Lhamo",
    "Sonam Dolkar",
    "Karma Dolma",
    "Pema Lhamo",
    "Tashi Dolma",
    "Dorje Dolkar",
    "Karma Yangchen",
    "Phintsho Dolma",
    "Sonam Yangchen",
    "Tenzin Dolma",
    "Pema Dolkar",
    "Karma Lhamo",
    "Tashi Yangchen",
    "Norbu Lhamo",
    "Phurba Dolkar",
    "Sonam Lhamo",
  ],
};

const departments = [
  "Department of Personnel",
  "Finance Department",
  "Education Department",
  "Health Department",
  "Agriculture Department",
  "Forest Environment & Wildlife Department",
  "Rural Development Department",
  "Information Technology Department",
  "Tourism Department",
  "Transport Department",
  "Urban Development Department",
  "Water Resources Department",
  "Energy Department",
  "Industries Department",
  "Labour Department",
  "Social Welfare Department",
  "Cooperation Department",
  "Land Revenue Department",
  "Law Department",
  "Sikkim Police",
];

const designations = [
  "Secretary",
  "Director",
  "Joint Secretary",
  "Deputy Secretary",
  "Under Secretary",
  "Assistant Secretary",
  "Superintendent",
  "Assistant Superintendent",
  "Section Officer",
  "Assistant Section Officer",
  "Senior Clerk",
  "Junior Clerk",
  "Stenographer",
  "Computer Operator",
  "Driver",
  "Peon",
  "Chowkidar",
  "Mali",
  "Sweeper",
  "Cook",
];

const sikkimeseLocations = {
  districts: ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
  constituencies: [
    "Gangtok",
    "Arithang",
    "Upper Burtuk",
    "Khamdong-Singtam",
    "Rhenock",
    "Chujachen",
    "Gnathang-Machong",
    "Soreng-Chakung",
    "Rinchenpong",
    "Daramdin",
    "Ranka",
    "Turuk-Pangthang",
    "Shyari",
    "Martam-Rumtek",
    "Upper Tadong",
    "Gangtok-Khamdong",
    "Namchi-Singhithang",
    "Melli",
    "Yuksom-Tashiding",
    "Geyzing-Bermiok",
    "Lachen-Mangan",
    "Kabi-Lungchok",
    "Dzongu",
    "Lal Bazar",
    "Barfung",
    "Poklok-Kamrang",
    "Namthang-Rateypani",
    "Temi-Namphing",
    "Rangang-Yangang",
    "Tumin-Lingi",
    "Zoom-Salghari",
    "Gnathing-Machong",
  ],
  policeStations: [
    "Gangtok PS",
    "Sadar PS",
    "Tadong PS",
    "Ranipool PS",
    "Singtam PS",
    "Rangpo PS",
    "Mangan PS",
    "Chungthang PS",
    "Lachen PS",
    "Namchi PS",
    "Jorethang PS",
    "Geyzing PS",
    "Gyalshing PS",
    "Soreng PS",
    "Dentam PS",
  ],
};

// Generate employee data
function generateEmployeeData(
  name: string,
  gender: "MALE" | "FEMALE",
  employeeIdNumber: number,
  cadreCode?: string
) {
  const district =
    sikkimeseLocations.districts[
      Math.floor(Math.random() * sikkimeseLocations.districts.length)
    ];
  const constituency =
    sikkimeseLocations.constituencies[
      Math.floor(Math.random() * sikkimeseLocations.constituencies.length)
    ];
  const policeStation =
    sikkimeseLocations.policeStations[
      Math.floor(Math.random() * sikkimeseLocations.policeStations.length)
    ];
  const department =
    departments[Math.floor(Math.random() * departments.length)];
  const designation =
    designations[Math.floor(Math.random() * designations.length)];

  const baseDate = new Date("1970-01-01");
  const maxDate = new Date("1995-12-31");
  const dateOfBirth = new Date(
    baseDate.getTime() +
      Math.random() * (maxDate.getTime() - baseDate.getTime())
  );

  const appointmentDate = new Date("2000-01-01");
  const maxAppointmentDate = new Date("2020-12-31");
  const dateOfInitialAppointment = new Date(
    appointmentDate.getTime() +
      Math.random() * (maxAppointmentDate.getTime() - appointmentDate.getTime())
  );

  const retirement = new Date(dateOfBirth);
  retirement.setFullYear(retirement.getFullYear() + 60);

  // Generate employee ID in the expected format: RANDOM_NUMBER/CADRE_CODE/SEQUENCE
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const employeeId = cadreCode
    ? `${randomPart}/${cadreCode}/${employeeIdNumber}`
    : `EMP${String(employeeIdNumber).padStart(6, "0")}`;

  return {
    employeeId,
    empname: name,
    fatherName: `${
      sikkimeseNames.male[
        Math.floor(Math.random() * sikkimeseNames.male.length)
      ]
    }`,
    dateOfBirth,
    gender,
    phoneNumber: `98${String(1000000 + employeeIdNumber).padStart(8, "0")}`,
    emailaddress: `${name
      .toLowerCase()
      .replace(/\s+/g, ".")}${employeeIdNumber}@sikkim.gov.in`,
    maritalstatus: Math.random() > 0.3 ? "Married" : "Single",
    spouseName:
      Math.random() > 0.3
        ? gender === "MALE"
          ? sikkimeseNames.female[
              Math.floor(Math.random() * sikkimeseNames.female.length)
            ]
          : sikkimeseNames.male[
              Math.floor(Math.random() * sikkimeseNames.male.length)
            ]
        : null,
    totalChildren: String(Math.floor(Math.random() * 4)),
    state: "Sikkim",
    district,
    constituency,
    gpu: `${constituency} GPU`,
    ward: `Ward ${Math.floor(Math.random() * 15) + 1}`,
    pin: `73${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    policestation: policeStation,
    postoffice: `${constituency} Post Office`,
    department,
    departmentOfPosting: department,
    presentdesignation: designation,
    dateOfInitialAppointment,
    dateOfAppointmentGazettedGrade: dateOfInitialAppointment,
    dateOfAppointmentPresentPost: new Date(
      dateOfInitialAppointment.getTime() +
        Math.random() * (Date.now() - dateOfInitialAppointment.getTime())
    ),
    TotalLengthOfSerive: `${Math.floor(
      (Date.now() - dateOfInitialAppointment.getTime()) /
        (1000 * 60 * 60 * 24 * 365)
    )} years`,
    retirement,
    dateOfLastPromotionSubstantive: new Date(
      dateOfInitialAppointment.getTime() +
        Math.random() * (Date.now() - dateOfInitialAppointment.getTime())
    ),
    dateOfLastPromotionOfficiating: new Date(
      dateOfInitialAppointment.getTime() +
        Math.random() * (Date.now() - dateOfInitialAppointment.getTime())
    ),
    natureOfEmployment: Math.random() > 0.2 ? "Permanent" : "Contractual",
  };
}

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.support.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cadre.deleteMany();

  // Get the next available employee ID number
  const existingEmployees = await prisma.employee.findMany({
    select: { employeeId: true },
    where: { employeeId: { not: null } },
    orderBy: { employeeId: "desc" },
    take: 1,
  });

  let nextEmployeeId = 1;
  if (existingEmployees.length > 0 && existingEmployees[0].employeeId) {
    const lastId = existingEmployees[0].employeeId;
    const match = lastId.match(/EMP(\d+)/);
    if (match) {
      nextEmployeeId = parseInt(match[1]) + 1;
    }
  }

  console.log(`📊 Starting employee ID numbering from: ${nextEmployeeId}`);

  // Seed Cadres
  console.log("📊 Seeding cadres...");
  const cadres = [
    {
      code: "IAS",
      name: "Indian Administrative Services (IAS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Department of Personnel",
    },
    {
      code: "IPS",
      name: "Indian Police Service (IPS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Sikkim Police",
    },
    {
      code: "IFS",
      name: "Indian Forest Services (IFS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Forest Environment & Wildlife Department",
    },
    {
      code: "SCS",
      name: "State Civil Service (SCS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Department of Personnel",
    },
    {
      code: "SSPS",
      name: "Sikkim State Police service(SSPS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Sikkim Police",
    },
    {
      code: "SSFS",
      name: "Sikkim State Forest Service (SSFS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Forest Environment & Wildlife Department",
    },
    {
      code: "SSFINS",
      name: "Sikkim State Finance Service(SSFINS)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: "Finance Department",
    },
    {
      code: "SSES",
      name: "Sikkim State Engineering Service (SSES)",
      controllingAdminAuthority: "Department of Personnel",
      controllingDepartment: null,
    },
  ];

  const createdCadres = [];
  for (const cadre of cadres) {
    const created = await prisma.cadre.create({
      data: cadre,
    });
    createdCadres.push(created);
  }

  // Create Admin Users
  console.log("👨‍💼 Creating admin users...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      email: "admin@sikkim.gov.in",
      mobileNumber: "9800000001",
      role: RoleType.ADMIN,
      isVerified: true,
      verificationStatus: "Verified",
    },
  });

  const cmUser = await prisma.user.create({
    data: {
      username: "cm.sikkim",
      password: hashedPassword,
      email: "cm@sikkim.gov.in",
      mobileNumber: "9800000002",
      role: RoleType.CM,
      isVerified: true,
      verificationStatus: "Verified",
    },
  });

  const csUser = await prisma.user.create({
    data: {
      username: "cs.sikkim",
      password: hashedPassword,
      email: "cs@sikkim.gov.in",
      mobileNumber: "9800000003",
      role: RoleType.CS,
      isVerified: true,
      verificationStatus: "Verified",
    },
  });

  const dopUser = await prisma.user.create({
    data: {
      username: "dop.sikkim",
      password: hashedPassword,
      email: "dop@sikkim.gov.in",
      mobileNumber: "9800000004",
      role: RoleType.DOP,
      isVerified: true,
      verificationStatus: "Verified",
    },
  });

  // Create Cadre Controlling Authority Users
  console.log("🏛️ Creating cadre controlling authority users...");
  const cadreAuthorities = [];
  for (let i = 0; i < 5; i++) {
    const cadreAuth = await prisma.user.create({
      data: {
        username: `cadre.auth.${i + 1}`,
        password: hashedPassword,
        email: `cadreauth${i + 1}@sikkim.gov.in`,
        mobileNumber: `98000000${10 + i}`,
        role: RoleType.CADRE_CONTROLLING_AUTHORITY,
        isVerified: true,
        verificationStatus: "Verified",
      },
    });
    cadreAuthorities.push(cadreAuth);
  }

  // Assign cadre controlling authorities to cadres
  for (
    let i = 0;
    i < Math.min(createdCadres.length, cadreAuthorities.length);
    i++
  ) {
    await prisma.cadre.update({
      where: { id: createdCadres[i].id },
      data: { controllingUserId: cadreAuthorities[i].id },
    });
  }

  // Generate and create employees with Sikkimese names
  console.log("👥 Creating employees with Sikkimese names...");
  const employeePassword = await bcrypt.hash("employee123", 10);
  let currentEmployeeId = nextEmployeeId;

  // Create 30 male employees
  for (let i = 0; i < 30; i++) {
    const name = sikkimeseNames.male[i % sikkimeseNames.male.length];
    const cadre =
      createdCadres[Math.floor(Math.random() * createdCadres.length)];
    const employeeData = generateEmployeeData(
      name,
      "MALE",
      currentEmployeeId,
      cadre.code || undefined
    );

    const user = await prisma.user.create({
      data: {
        username: `emp${String(currentEmployeeId).padStart(3, "0")}`,
        password: employeePassword,
        email: employeeData.emailaddress,
        mobileNumber: employeeData.phoneNumber,
        role: RoleType.EMPLOYEE,
        isVerified: true,
        verificationStatus: "Verified",
      },
    });

    await prisma.employee.create({
      data: {
        ...employeeData,
        userId: user.id,
        cadreId: cadre.id,
        cadreSequence: currentEmployeeId,
      },
    });

    currentEmployeeId++;
  }

  // Create 25 female employees
  for (let i = 0; i < 25; i++) {
    const name = sikkimeseNames.female[i % sikkimeseNames.female.length];
    const cadre =
      createdCadres[Math.floor(Math.random() * createdCadres.length)];
    const employeeData = generateEmployeeData(
      name,
      "FEMALE",
      currentEmployeeId,
      cadre.code || undefined
    );

    const user = await prisma.user.create({
      data: {
        username: `emp${String(currentEmployeeId).padStart(3, "0")}`,
        password: employeePassword,
        email: employeeData.emailaddress,
        mobileNumber: employeeData.phoneNumber,
        role: RoleType.EMPLOYEE,
        isVerified: true,
        verificationStatus: "Verified",
      },
    });

    await prisma.employee.create({
      data: {
        ...employeeData,
        userId: user.id,
        cadreId: cadre.id,
        cadreSequence: currentEmployeeId,
      },
    });

    currentEmployeeId++;
  }

  // Create some support requests
  console.log("🎫 Creating sample support requests...");
  const allEmployees = await prisma.employee.findMany();

  for (let i = 0; i < 15; i++) {
    const randomEmployee =
      allEmployees[Math.floor(Math.random() * allEmployees.length)];
    await prisma.support.create({
      data: {
        employeeId: randomEmployee.id,
        subject: `Support Request ${i + 1}`,
        description: `This is a sample support request from ${randomEmployee.empname}. Need assistance with HR related queries.`,
        status: i % 3 === 0 ? "RESOLVED" : i % 3 === 1 ? "IN_PROGRESS" : "OPEN",
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- ${createdCadres.length} cadres created`);
  console.log(`- 1 admin user created (username: admin, password: admin123)`);
  console.log(`- 1 CM user created (username: cm.sikkim, password: admin123)`);
  console.log(`- 1 CS user created (username: cs.sikkim, password: admin123)`);
  console.log(
    `- 1 DOP user created (username: dop.sikkim, password: admin123)`
  );
  console.log(`- ${cadreAuthorities.length} cadre authority users created`);
  console.log(
    `- 55 employees created with Sikkimese names (password: employee123)`
  );
  console.log(`- 15 sample support requests created`);
  console.log("\n🎯 You can now login with:");
  console.log("Admin: username='admin', password='admin123'");
  console.log("CM: username='cm.sikkim', password='admin123'");
  console.log("CS: username='cs.sikkim', password='admin123'");
  console.log("DOP: username='dop.sikkim', password='admin123'");
  console.log(
    "Employee: username='emp001' to 'emp055', password='employee123'"
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
