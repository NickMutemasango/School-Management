// Seeds a full local dev environment: activates curriculum levels, creates
// teachers, classes, teacher-subject assignments, timetable slots, and
// enrolls students into their class sections - enough to click through
// every admin/teacher/student screen against real, connected data instead
// of an empty database after `supabase db reset`.
//
// LOCAL SUPABASE ONLY - refuses to run against anything that isn't
// 127.0.0.1/localhost. Running a script like this against the wrong
// environment is almost certainly how production ended up with the
// duplicate mock students found in scripts/seed-mock-students.mjs's own
// name list - that script's header pointed at .env.local (production).
//
// Run with: node --env-file=.env.development.local scripts/seed-local-dev.mjs
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

const url = process.env.NEXT_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailDomain = process.env.STUDENT_AUTH_EMAIL_DOMAIN;

if (!url || !serviceRoleKey || !emailDomain) {
  console.error(
    "Missing NEXT_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or STUDENT_AUTH_EMAIL_DOMAIN.\n" +
      "Run with: node --env-file=.env.development.local scripts/seed-local-dev.mjs"
  );
  process.exit(1);
}

if (!/^https?:\/\/(127\.0\.0\.1|localhost)([:/]|$)/.test(url)) {
  console.error(
    `Refusing to run: NEXT_SUPABASE_URL is "${url}", which isn't a local Supabase instance.\n` +
      "Run with --env-file=.env.development.local, not .env.local (that one points at production)."
  );
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACADEMIC_YEAR = new Date().getFullYear();

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
function generatePassword(length = 10) {
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
  const prefix = `REG-${ACADEMIC_YEAR}-`;
  const { count } = await admin
    .from("students")
    .select("id", { count: "exact", head: true })
    .ilike("reg_number", `${prefix}%`);
  return `${prefix}${String((count ?? 0) + 1).padStart(4, "0")}`;
}

async function activateLevel(schoolId, displayLabel) {
  const { data: levelDef, error: levelErr } = await admin
    .from("level_definitions")
    .select("id")
    .eq("display_label", displayLabel)
    .single();
  if (levelErr || !levelDef) throw new Error(`Unknown level "${displayLabel}": ${levelErr?.message}`);

  const { error } = await admin.from("school_level_offerings").upsert(
    { school_id: schoolId, level_definition_id: levelDef.id, academic_year: ACADEMIC_YEAR, status: "active" },
    { onConflict: "school_id,level_definition_id,academic_year" }
  );
  if (error) throw new Error(`Activating "${displayLabel}" failed: ${error.message}`);
}

async function createTeacher({ firstName, lastName, email }) {
  const fullName = `${firstName} ${lastName}`;
  const password = generatePassword();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !created.user) throw new Error(`Creating teacher ${fullName} failed: ${error?.message}`);

  const { error: promoteError } = await admin
    .from("profiles")
    .update({ role: "teacher", status: "active" })
    .eq("id", created.user.id);
  if (promoteError) throw new Error(`Promoting teacher ${fullName} failed: ${promoteError.message}`);

  return { id: created.user.id, fullName, email, password };
}

async function upsertClass(level, section) {
  const { data, error } = await admin
    .from("classes")
    .upsert({ level, section }, { onConflict: "level,section" })
    .select("id")
    .single();
  if (error) throw new Error(`Creating class ${level} ${section} failed: ${error.message}`);
  return data.id;
}

async function assignTeacher(classId, teacherId, subject) {
  const { error } = await admin
    .from("class_teacher_subjects")
    .upsert({ class_id: classId, teacher_id: teacherId, subject }, { onConflict: "class_id,teacher_id,subject" })
    .select("id")
    .single();
  if (error) throw new Error(`Assigning teacher to ${subject} failed: ${error.message}`);
}

async function addTimetableSlot(classTeacherSubjectId, teacherId, classId, day, periodId, room) {
  const { error } = await admin.from("timetable_entries").upsert(
    { class_teacher_subject_id: classTeacherSubjectId, teacher_id: teacherId, class_id: classId, day, period_id: periodId, room },
    { onConflict: "teacher_id,day,period_id" }
  );
  if (error) throw new Error(`Adding timetable slot failed: ${error.message}`);
}

async function enrollStudent({ firstName, lastName, classLevel, gender }) {
  const regNumber = await nextRegNumber();
  const password = generatePassword();
  const fullName = `${firstName} ${lastName}`;

  const { data: created, error } = await admin.auth.admin.createUser({
    email: studentAuthEmail(regNumber),
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !created.user) throw new Error(`Creating student ${fullName} failed: ${error?.message}`);

  const { error: promoteError } = await admin
    .from("profiles")
    .update({ role: "student", status: "active" })
    .eq("id", created.user.id);
  if (promoteError) throw new Error(`Promoting student ${fullName} failed: ${promoteError.message}`);

  const { error: insertError } = await admin.from("students").insert({
    id: created.user.id,
    reg_number: regNumber,
    first_name: firstName,
    last_name: lastName,
    class_level: classLevel,
    gender,
    date_of_birth: "2014-06-01",
    enrolled_on: new Date().toISOString().slice(0, 10),
    address: "12 Example Close, Harare",
    guardian_name: `${lastName} Family`,
    guardian_phone: "+263771234567",
    guardian_email: "",
  });
  if (insertError) throw new Error(`Inserting student row for ${fullName} failed: ${insertError.message}`);

  return { id: created.user.id, fullName, regNumber, classLevel, password };
}

async function placeInClass(studentId, classId) {
  const { error } = await admin
    .from("student_class_memberships")
    .upsert({ student_id: studentId, class_id: classId }, { onConflict: "student_id" });
  if (error) throw new Error(`Placing student in class failed: ${error.message}`);
}

const CLASSES = [
  { level: "GRADE 5", section: "A" },
  { level: "GRADE 6", section: "A" },
  { level: "GRADE 7", section: "A" },
  { level: "FORM 1", section: "A" },
];

const TEACHERS = [
  { firstName: "Rumbidzai", lastName: "Chirwa", email: "rumbidzai.chirwa@local.test", subject: "Mathematics", classIndex: 0, day: "Monday", period: "p1", room: "Room 101" },
  { firstName: "Kudzai", lastName: "Nyathi", email: "kudzai.nyathi@local.test", subject: "English Language", classIndex: 1, day: "Monday", period: "p2", room: "Room 102" },
  { firstName: "Simba", lastName: "Muponda", email: "simba.muponda@local.test", subject: "Combined Science", classIndex: 2, day: "Tuesday", period: "p1", room: "Science Lab 1" },
  { firstName: "Panashe", lastName: "Gwaze", email: "panashe.gwaze@local.test", subject: "Geography", classIndex: 3, day: "Tuesday", period: "p2", room: "Room 103" },
];

const STUDENTS = [
  { firstName: "Farai", lastName: "Chidziva", classLevel: "GRADE 5", gender: "Male", classIndex: 0 },
  { firstName: "Vimbai", lastName: "Musonza", classLevel: "GRADE 5", gender: "Female", classIndex: 0 },
  { firstName: "Tapiwa", lastName: "Mangwiro", classLevel: "GRADE 6", gender: "Male", classIndex: 1 },
  { firstName: "Rufaro", lastName: "Gono", classLevel: "GRADE 6", gender: "Female", classIndex: 1 },
  { firstName: "Anesu", lastName: "Chikuni", classLevel: "GRADE 7", gender: "Male", classIndex: 2 },
  { firstName: "Nyaradzo", lastName: "Bhebhe", classLevel: "GRADE 7", gender: "Female", classIndex: 2 },
  { firstName: "Tatenda", lastName: "Museka", classLevel: "FORM 1", gender: "Male", classIndex: 3 },
  { firstName: "Rutendo", lastName: "Gudo", classLevel: "FORM 1", gender: "Female", classIndex: 3 },
];

async function main() {
  console.log(`Seeding local dev data for academic year ${ACADEMIC_YEAR}...\n`);

  const { data: school, error: schoolErr } = await admin.from("schools").select("id").limit(1).single();
  if (schoolErr || !school) {
    throw new Error(`No school found - run the migrations first: ${schoolErr?.message}`);
  }

  console.log("Activating levels...");
  for (const cls of CLASSES) {
    await activateLevel(school.id, cls.level);
    console.log(`  activated ${cls.level}`);
  }

  console.log("\nCreating classes...");
  const classIds = [];
  for (const cls of CLASSES) {
    const id = await upsertClass(cls.level, cls.section);
    classIds.push(id);
    console.log(`  ${cls.level} · ${cls.section}`);
  }

  console.log("\nCreating teachers and assignments...");
  const teacherResults = [];
  for (const t of TEACHERS) {
    try {
      const teacher = await createTeacher(t);
      const classId = classIds[t.classIndex];
      await assignTeacher(classId, teacher.id, t.subject);

      const { data: cts } = await admin
        .from("class_teacher_subjects")
        .select("id")
        .eq("class_id", classId)
        .eq("teacher_id", teacher.id)
        .eq("subject", t.subject)
        .single();
      if (cts) await addTimetableSlot(cts.id, teacher.id, classId, t.day, t.period, t.room);

      teacherResults.push({ ...teacher, subject: t.subject, class: `${CLASSES[t.classIndex].level} · ${CLASSES[t.classIndex].section}` });
      console.log(`  ${teacher.fullName} - ${t.subject} - ${CLASSES[t.classIndex].level} · ${CLASSES[t.classIndex].section}`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  console.log("\nEnrolling students...");
  const studentResults = [];
  for (const s of STUDENTS) {
    try {
      const student = await enrollStudent(s);
      await placeInClass(student.id, classIds[s.classIndex]);
      studentResults.push(student);
      console.log(`  ${student.fullName.padEnd(20)} ${student.classLevel.padEnd(10)} ${student.regNumber}`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  console.log("\n--- Login credentials ---\n");
  console.log("Teachers (sign in at /login/staff with email + password):");
  for (const t of teacherResults) {
    console.log(`  ${t.email.padEnd(32)} ${t.password}`);
  }
  console.log("\nStudents (sign in at /login/student with reg number + password):");
  for (const s of studentResults) {
    console.log(`  ${s.regNumber.padEnd(16)} ${s.password}`);
  }
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
