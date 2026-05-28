require('dotenv').config();
const { sequelize } = require('../viable/db');

async function fix() {
  // Find all rescheduled appointments
  const [apts] = await sequelize.query(`SELECT id, status FROM appointments WHERE status = 'rescheduled'`);
  console.log('Rescheduled appointments:', apts);

  // Find which ones have notes
  const [notes] = await sequelize.query(`SELECT "appointmentId" FROM appointment_notes`);
  console.log('Appointments with notes:', notes);

  const noteAptIds = notes.map(n => n.appointmentId);
  const toFix = apts.filter(a => noteAptIds.includes(a.id));
  console.log('To fix:', toFix);

  for (const apt of toFix) {
    await sequelize.query(`UPDATE appointments SET status = 'completed' WHERE id = ${apt.id}`);
    console.log(`Fixed appointment ${apt.id}`);
  }

  // Also fix any rescheduled+paid appointments that have medical records
  const [records] = await sequelize.query(`SELECT DISTINCT "appointmentId" FROM medical_records`);
  const recordAptIds = records.map(r => r.appointmentId).filter(Boolean);
  const toFix2 = apts.filter(a => recordAptIds.includes(a.id) && !noteAptIds.includes(a.id));
  for (const apt of toFix2) {
    await sequelize.query(`UPDATE appointments SET status = 'completed' WHERE id = ${apt.id}`);
    console.log(`Fixed via medical record: appointment ${apt.id}`);
  }

  console.log('Done');
  await sequelize.close();
}

fix().catch(e => { console.error(e); process.exit(1); });
