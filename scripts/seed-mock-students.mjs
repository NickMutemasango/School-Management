// One-off seed script - creates a handful of mock students the same way
// the real enrollment flow does (auth user -> profile promoted to
// student/active -> students row), so they behave identically to real
// enrollments (can log in, show up in class assignment, etc).
//
// Run with: node --env-file=.env.local scripts/seed-mock-students.mjs
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

const url = process.env.NEXT_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailDomain = process.env.STUDENT_AUTH_EMAIL_DOMAIN;

if (!url || !serviceRoleKey || !emailDomain) {
  console.error(
    "Missing NEXT_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or STUDENT_AUTH_EMAIL_DOMAIN - check .env.local."
  );
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function generateTempPassword(length = 10) {
  let out = "";
  for (let i = 0; i < length; i++) out += PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)];
  return out;
}

function studentAuthEmail(regNumber) {
  const local = regNumber
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${local}@${emailDomain}`;
}

async function nextRegNumber() {
  const prefix = `REG-${new Date().getFullYear()}-`;
  const { count } = await admin
    .from("students")
    .select("id", { count: "exact", head: true })
    .ilike("reg_number", `${prefix}%`);
  return `${prefix}${String((count ?? 0) + 1).padStart(4, "0")}`;
}

const MOCK_STUDENTS = [
  { firstName: "Tanaka", lastName: "Moyo", classLevel: "GRADE 5", gender: "Male" },
  { firstName: "Rutendo", lastName: "Chikafu", classLevel: "GRADE 5", gender: "Female" },
  { firstName: "Tinashe", lastName: "Ndlovu", classLevel: "GRADE 5", gender: "Male" },
  { firstName: "Chiedza", lastName: "Mutasa", classLevel: "GRADE 6", gender: "Female" },
  { firstName: "Blessing", lastName: "Sibanda", classLevel: "GRADE 6", gender: "Male" },
  { firstName: "Nyasha", lastName: "Dube", classLevel: "GRADE 6", gender: "Female" },
];

async function seedOne(mock) {
  const regNumber = await nextRegNumber();
  const tempPassword = generateTempPassword();
  const fullName = `${mock.firstName} ${mock.lastName}`;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: studentAuthEmail(regNumber),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError || !created.user) {
    throw new Error(`auth.createUser failed for ${fullName}: ${createError?.message}`);
  }

  const { error: promoteError } = await admin
    .from("profiles")
    .update({ role: "student", status: "active" })
    .eq("id", created.user.id);
  if (promoteError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(`profile promote failed for ${fullName}: ${promoteError.message}`);
  }

  const { error: insertError } = await admin.from("students").insert({
    id: created.user.id,
    reg_number: regNumber,
    first_name: mock.firstName,
    last_name: mock.lastName,
    class_level: mock.classLevel,
    gender: mock.gender,
    date_of_birth: "2014-03-15",
    enrolled_on: new Date().toISOString().slice(0, 10),
    address: "123 Sample Street, Harare",
    guardian_name: `${mock.lastName} Family`,
    guardian_phone: "+263771234567",
    guardian_email: "",
  });
  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(`students insert failed for ${fullName}: ${insertError.message}`);
  }

  return { fullName, regNumber, classLevel: mock.classLevel, tempPassword };
}

const results = [];
for (const mock of MOCK_STUDENTS) {
  try {
    results.push(await seedOne(mock));
  } catch (err) {
    console.error(err.message);
  }
}

console.log(`\nCreated ${results.length}/${MOCK_STUDENTS.length} mock students:\n`);
for (const r of results) {
  console.log(`  ${r.fullName.padEnd(20)} ${r.classLevel.padEnd(10)} ${r.regNumber}  (password: ${r.tempPassword})`);
}
