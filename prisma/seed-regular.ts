/**
 * Seed script for Regular (Temporary-Permanent) employees.
 * Run with: npx tsx prisma/seed-regular.ts
 *
 * Does NOT delete existing data — only appends regular employees.
 */

import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ── Names ───────────────────────────────────────────────────────────────────
const maleNames = [
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
  "Karma Wangchuk",
  "Tenzin Wangdi",
  "Phurba Wangchuk",
  "Dorje Tamang",
  "Pemba Lama",
  "Sonam Namgyal",
  "Karma Sherpa",
  "Tashi Wangyal",
  "Norbu Sherpa",
  "Phurba Gyatso",
  "Sonam Wangyal",
];

const femaleNames = [
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
  "Pema Lhamo",
  "Tashi Dolma",
  "Dorje Dolkar",
  "Phintsho Dolma",
];

// ── Designation → Cadre label mapping ───────────────────────────────────────
const scsDesignations = [
  { designation: "Secretary", count: 12 },
  { designation: "Special Secretary", count: 25 },
  { designation: "Additional Secretary", count: 30 },
  { designation: "Joint Secretary", count: 36 },
  { designation: "Deputy Secretary", count: 45 },
  { designation: "Under Secretary", count: 55 },
];

const subOrdDesignations = [
  {
    designation: "Office Superintendent",
    department: "Department of Personnel",
    count: 15,
  },
  {
    designation: "Head Assistant (HA)",
    department: "Finance Department",
    count: 15,
  },
  { designation: "UDC", department: "Education Department", count: 20 },
  { designation: "LDC", department: "Health Department", count: 20 },
];

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
];

const districts = [
  "East Sikkim",
  "West Sikkim",
  "North Sikkim",
  "South Sikkim",
];
const constituencies = [
  "Gangtok",
  "Arithang",
  "Rhenock",
  "Namchi-Singhithang",
  "Melli",
  "Geyzing-Bermiok",
];
const policeStations = [
  "Gangtok PS",
  "Sadar PS",
  "Tadong PS",
  "Namchi PS",
  "Geyzing PS",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildEmployeeData(
  name: string,
  designation: string,
  department: string,
  idx: number,
) {
  const dob = new Date(
    new Date("1965-01-01").getTime() +
      Math.random() *
        (new Date("1992-12-31").getTime() - new Date("1965-01-01").getTime()),
  );
  const apptDate = new Date(
    new Date("1995-01-01").getTime() +
      Math.random() *
        (new Date("2018-12-31").getTime() - new Date("1995-01-01").getTime()),
  );
  const retirement = new Date(dob);
  retirement.setFullYear(retirement.getFullYear() + 60);

  return {
    empname: name,
    fatherName: randomFrom(maleNames),
    dateOfBirth: dob,
    gender: idx % 3 === 0 ? "FEMALE" : "MALE",
    phoneNumber: `90${String(5000000 + idx).padStart(8, "0")}`,
    emailaddress: `${name.toLowerCase().replace(/\s+/g, ".")}${idx}@sikkim.gov.in`,
    maritalstatus: Math.random() > 0.3 ? "Married" : "Single",
    spouseName: Math.random() > 0.3 ? randomFrom(femaleNames) : null,
    totalChildren: String(Math.floor(Math.random() * 4)),
    state: "Sikkim",
    district: randomFrom(districts),
    constituency: randomFrom(constituencies),
    gpu: `${randomFrom(constituencies)} GPU`,
    ward: `Ward ${Math.floor(Math.random() * 15) + 1}`,
    pin: `73${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    policestation: randomFrom(policeStations),
    postoffice: `${randomFrom(constituencies)} Post Office`,
    department,
    departmentOfPosting: department,
    presentdesignation: designation,
    dateOfInitialAppointment: apptDate,
    dateOfAppointmentGazettedGrade: apptDate,
    dateOfAppointmentPresentPost: new Date(
      apptDate.getTime() + Math.random() * (Date.now() - apptDate.getTime()),
    ),
    TotalLengthOfSerive: `${Math.floor(
      (Date.now() - apptDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
    )} years`,
    retirement,
    dateOfLastPromotionSubstantive: new Date(
      apptDate.getTime() + Math.random() * (Date.now() - apptDate.getTime()),
    ),
    dateOfLastPromotionOfficiating: new Date(
      apptDate.getTime() + Math.random() * (Date.now() - apptDate.getTime()),
    ),
    natureOfEmployment: "Temporary-Permanent (Regular)",
  };
}

async function main() {
  console.log("🌱 Seeding Regular (Temporary-Permanent) employees...");

  const employeePassword = await bcrypt.hash("employee123", 10);

  // ── Find or create SCS cadre ───────────────────────────────────────────
  let scsCadre = await prisma.cadre.findFirst({ where: { code: "SCS" } });
  if (!scsCadre) {
    scsCadre = await prisma.cadre.create({
      data: {
        code: "SCS",
        name: "State Civil Service (SCS)",
        controllingAdminAuthority: "Department of Personnel",
        controllingDepartment: "Department of Personnel",
      },
    });
    console.log("  Created SCS cadre");
  }

  // ── Find or create Sub-Ordinate cadre ─────────────────────────────────
  let subCadre = await prisma.cadre.findFirst({ where: { code: "SUB" } });
  if (!subCadre) {
    subCadre = await prisma.cadre.create({
      data: {
        code: "SUB",
        name: "Sub-Ordinate Cadre",
        controllingAdminAuthority: "Department of Personnel",
        controllingDepartment: "Department of Personnel",
      },
    });
    console.log("  Created Sub-Ordinate cadre");
  }

  let idx = 90001; // Start from a high number to avoid collisions
  let scsCount = 0;
  let subCount = 0;

  // ── SCS employees ──────────────────────────────────────────────────────
  console.log("👔 Seeding SCS (Main Cadre) regular employees...");
  for (const { designation, count } of scsDesignations) {
    for (let i = 0; i < count; i++) {
      const allNames = [...maleNames, ...femaleNames];
      const name = allNames[idx % allNames.length];
      const empData = buildEmployeeData(
        name,
        designation,
        "Department of Personnel",
        idx,
      );

      // Ensure unique phone/email
      const phone = `90${String(5000000 + idx).padStart(8, "0")}`;
      const email = `${name.toLowerCase().replace(/\s+/g, ".")}${idx}@sikkim.gov.in`;

      // Skip if phone already exists
      const existing = await prisma.employee.findUnique({
        where: { phoneNumber: phone },
      });
      if (existing) {
        idx++;
        continue;
      }

      const user = await prisma.user.create({
        data: {
          username: `reg${idx}`,
          password: employeePassword,
          email,
          mobileNumber: phone,
          role: RoleType.EMPLOYEE,
          isVerified: true,
          verificationStatus: "Verified",
        },
      });

      await prisma.employee.create({
        data: {
          ...empData,
          phoneNumber: phone,
          emailaddress: email,
          employeeId: `REG/${scsCadre.code}/${idx}`,
          userId: user.id,
          cadreId: scsCadre.id,
          cadreSequence: idx,
        },
      });

      idx++;
      scsCount++;
    }
  }

  // ── Sub-Ordinate employees ─────────────────────────────────────────────
  console.log("📋 Seeding Sub-Ordinate Cadre regular employees...");
  for (const { designation, department, count } of subOrdDesignations) {
    for (let i = 0; i < count; i++) {
      const allNames = [...maleNames, ...femaleNames];
      const name = allNames[idx % allNames.length];

      const phone = `90${String(5000000 + idx).padStart(8, "0")}`;
      const email = `${name.toLowerCase().replace(/\s+/g, ".")}${idx}@sikkim.gov.in`;

      const existing = await prisma.employee.findUnique({
        where: { phoneNumber: phone },
      });
      if (existing) {
        idx++;
        continue;
      }

      const user = await prisma.user.create({
        data: {
          username: `reg${idx}`,
          password: employeePassword,
          email,
          mobileNumber: phone,
          role: RoleType.EMPLOYEE,
          isVerified: true,
          verificationStatus: "Verified",
        },
      });

      const empData = buildEmployeeData(name, designation, department, idx);

      await prisma.employee.create({
        data: {
          ...empData,
          phoneNumber: phone,
          emailaddress: email,
          employeeId: `REG/${subCadre.code}/${idx}`,
          userId: user.id,
          cadreId: subCadre.id,
          cadreSequence: idx,
        },
      });

      idx++;
      subCount++;
    }
  }

  console.log("\n✅ Regular employee seeding complete!");
  console.log(`  SCS (Main Cadre) employees created    : ${scsCount}`);
  console.log(`  Sub-Ordinate Cadre employees created  : ${subCount}`);
  console.log(
    `  Total regular employees added         : ${scsCount + subCount}`,
  );
  console.log("\n  natureOfEmployment = 'Temporary-Permanent (Regular)'");
}

main()
  .catch((e) => {
    console.error("❌ Error during regular seeding:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
